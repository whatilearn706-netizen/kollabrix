const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const url = require('url');

const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.CLUSTER_SECRET || 'kollabrix_secret_cluster_2026';

// Room management
// rooms: Map<string, Set<WebSocket>>
const rooms = new Map();
// roomHistory: Map<string, Array<{ event: string, payload: any, timestamp: number }>>
const roomHistory = new Map();
// socketMeta: Map<WebSocket, { id: string, name: string, joinedRooms: Set<string>, isAlive: boolean }>
const socketMeta = new Map();

function broadcastToRoom(roomName, eventName, payload, senderWs = null, includeSender = false) {
  const clients = rooms.get(roomName);
  if (!clients || clients.size === 0) return 0;

  const message = JSON.stringify({
    type: 'broadcast',
    room: roomName,
    event: eventName,
    payload,
    timestamp: Date.now()
  });

  // Store in history buffer (max 30 events per room)
  if (!roomHistory.has(roomName)) roomHistory.set(roomName, []);
  const hist = roomHistory.get(roomName);
  hist.push({ event: eventName, payload, timestamp: Date.now() });
  if (hist.length > 30) hist.shift();

  let sentCount = 0;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      if (includeSender || client !== senderWs) {
        client.send(message);
        sentCount++;
      }
    }
  }
  return sentCount;
}

function broadcastPresence(roomName) {
  const clients = rooms.get(roomName);
  if (!clients) return;
  const userList = [];
  for (const client of clients) {
    const meta = socketMeta.get(client);
    if (meta && meta.id) {
      userList.push({ id: meta.id, name: meta.name || 'Anonymous' });
    }
  }
  const presenceMsg = JSON.stringify({
    type: 'presence_state',
    room: roomName,
    count: clients.size,
    users: userList,
    timestamp: Date.now()
  });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(presenceMsg);
    }
  }
}

function joinRoom(ws, roomName) {
  if (!roomName) return;
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(ws);
  const meta = socketMeta.get(ws);
  if (meta) meta.joinedRooms.add(roomName);

  // Send history to joining client
  const hist = roomHistory.get(roomName) || [];
  if (hist.length > 0 && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'history',
      room: roomName,
      events: hist
    }));
  }

  broadcastPresence(roomName);
}

function leaveRoom(ws, roomName) {
  if (!roomName) return;
  const clients = rooms.get(roomName);
  if (clients) {
    clients.delete(ws);
    if (clients.size === 0) {
      rooms.delete(roomName);
    } else {
      broadcastPresence(roomName);
    }
  }
  const meta = socketMeta.get(ws);
  if (meta) meta.joinedRooms.delete(roomName);
}

// HTTP Server (Handles /health, /broadcast, and WebSocket upgrade)
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '/';

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health endpoint
  if (pathname === '/health' || pathname === '/ws/health') {
    let totalConnections = 0;
    const roomSummaries = [];
    for (const [rName, rSet] of rooms.entries()) {
      totalConnections += rSet.size;
      roomSummaries.push({ room: rName, clients: rSet.size });
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      totalConnectedSockets: socketMeta.size,
      totalActiveRooms: rooms.size,
      memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      rooms: roomSummaries.slice(0, 50)
    }));
    return;
  }

  // REST Broadcast endpoint (Allows Next.js backend to push announcements directly)
  if ((pathname === '/broadcast' || pathname === '/ws/broadcast') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.secretKey !== SECRET_KEY) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized secret key' }));
          return;
        }
        const { room, event, payload } = data;
        if (!room || !event) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'room and event are required' }));
          return;
        }
        const sent = broadcastToRoom(room, event, payload, null, true);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, clientsReached: sent }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found. Connect via WebSocket at /ws' }));
});

// WebSocket Server attached to HTTP
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const parsed = url.parse(req.url, true);
  const initialRoom = parsed.query.room;
  const userId = parsed.query.userId || `user-${Date.now()}`;
  const name = parsed.query.name || 'Anonymous';

  socketMeta.set(ws, {
    id: String(userId),
    name: String(name),
    joinedRooms: new Set(),
    isAlive: true
  });

  if (initialRoom) {
    joinRoom(ws, String(initialRoom));
  }

  // Handle incoming messages
  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const meta = socketMeta.get(ws);
      if (meta) meta.isAlive = true;

      switch (data.type) {
        case 'join':
          if (data.userId && meta) meta.id = String(data.userId);
          if (data.name && meta) meta.name = String(data.name);
          joinRoom(ws, data.room);
          break;

        case 'leave':
          leaveRoom(ws, data.room);
          break;

        case 'broadcast':
          if (data.room && data.event) {
            broadcastToRoom(data.room, data.event, data.payload, ws, Boolean(data.includeSender));
          }
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;

        default:
          break;
      }
    } catch (e) {
      console.warn('Failed parsing WS message:', e.message);
    }
  });

  ws.on('pong', () => {
    const meta = socketMeta.get(ws);
    if (meta) meta.isAlive = true;
  });

  ws.on('close', () => {
    const meta = socketMeta.get(ws);
    if (meta) {
      for (const rName of meta.joinedRooms) {
        leaveRoom(ws, rName);
      }
    }
    socketMeta.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WS Error:', err.message);
  });
});

// Dead connection pruning every 30 seconds
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const meta = socketMeta.get(ws);
    if (!meta || meta.isAlive === false) {
      ws.terminate();
      return;
    }
    meta.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Kollabrix Realtime Cluster online on port ${PORT}`);
});
