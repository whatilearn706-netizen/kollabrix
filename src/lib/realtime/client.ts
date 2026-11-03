'use client';

/**
 * High-Speed Resilient WebSocket Client for AIC Cloud Realtime Cluster
 * Endpoint: wss://api.kollabrix.in/ws
 * Unlimited concurrent connections, sub-30ms latency, zero quota limits.
 */

export interface RealtimeMessage {
  type: 'broadcast' | 'presence_state' | 'history' | 'pong';
  room?: string;
  event?: string;
  payload?: any;
  users?: Array<{ id: string; name: string }>;
  count?: number;
  events?: Array<{ event: string; payload: any; timestamp: number }>;
  timestamp?: number;
}

export interface RealtimeSocketOptions {
  userId?: string;
  name?: string;
  onMessage?: (msg: RealtimeMessage) => void;
  onPresence?: (users: Array<{ id: string; name: string }>, count: number) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: any) => void;
}

export class KollabrixRealtimeClient {
  private ws: WebSocket | null = null;
  private room: string;
  private options: RealtimeSocketOptions;
  private isDestroyed = false;
  private reconnectAttempts = 0;
  private pingInterval: any = null;

  constructor(room: string, options: RealtimeSocketOptions = {}) {
    this.room = room;
    this.options = options;
    this.connect();
  }

  private getWsUrl(): string {
    const isBrowser = typeof window !== 'undefined';
    const host = process.env.NEXT_PUBLIC_REALTIME_WS_HOST || 'api.kollabrix.in';
    const proto = isBrowser && window.location.protocol === 'http:' ? 'ws:' : 'wss:';
    const query = new URLSearchParams({
      room: this.room,
      userId: this.options.userId || 'anon',
      name: this.options.name || 'Student',
    });
    return `${proto}//${host}/ws?${query.toString()}`;
  }

  private connect() {
    if (this.isDestroyed || typeof window === 'undefined') return;

    try {
      const url = this.getWsUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        if (this.options.onOpen) this.options.onOpen();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimeMessage = JSON.parse(event.data);
          if (data.type === 'presence_state' && this.options.onPresence) {
            this.options.onPresence(data.users || [], data.count || 0);
          }
          if (this.options.onMessage) {
            this.options.onMessage(data);
          }
        } catch (e) {
          // ignore non-json
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        if (this.options.onClose) this.options.onClose();
        if (!this.isDestroyed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        if (this.options.onError) this.options.onError(err);
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  public broadcast(event: string, payload: any, includeSender = false) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'broadcast',
          room: this.room,
          event,
          payload,
          includeSender,
        })
      );
    }
  }

  public close() {
    this.isDestroyed = true;
    this.stopHeartbeat();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }
}

export function subscribeToRealtimeRoom(
  room: string,
  options: RealtimeSocketOptions
): KollabrixRealtimeClient {
  return new KollabrixRealtimeClient(room, options);
}
