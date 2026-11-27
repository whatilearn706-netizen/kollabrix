export interface BookChapterMeta {
  hackathon: string;
  flashcards: Array<{ q: string; a: string }>;
  code?: {
    language: 'java' | 'python' | 'cpp';
    title: string;
    snippet: string;
  };
}

export const BOOK_CHAPTER_METAS: Record<string, BookChapterMeta[]> = {
  ddia: [
    {
      hackathon:
        'When hackathon judges ask "How will your system handle 10,000 live concurrent users?", cite tail latency (p99). Tell them you use async queues (Redis BullMQ / Kafka) to ensure p99 stays under 95ms during submission rushes.',
      flashcards: [
        {
          q: 'Why is p99 tail latency more critical than mean response time in web backends?',
          a: 'In modern microservices, a single client request fans out to dozens of downstream services. If p99 is slow, the chance that at least one call lags compounds exponentially, degrading user experience for over 60% of sessions.',
        },
        {
          q: 'What is the primary difference between a transient fault and a total outage?',
          a: 'A fault is one component deviating from its spec (e.g., one disk or network socket failing). Fault-tolerant systems use retry backoffs, circuit breakers, and idempotency keys to prevent faults from escalating into full outages.',
        },
      ],
      code: {
        language: 'python',
        title: 'p99 Latency Percentile Calculator',
        snippet: `import math

def calculate_p99(samples):
    if not samples:
        return 0
    s = sorted(samples)
    idx = math.ceil(0.99 * len(s)) - 1
    return s[max(0, idx)]

latencies_ms = [12, 15, 18, 14, 22, 19, 850, 24, 18, 20]
print("p99 Latency:", calculate_p99(latencies_ms), "ms")
print("Mean Latency:", sum(latencies_ms) / len(latencies_ms), "ms")`,
      },
    },
    {
      hackathon:
        'For high-speed real-time event feeds (e.g. duel actions or telemetry), use append-only writes (WAL pattern) rather than executing updating SQL transactions. It is 50x faster and never deadlocks.',
      flashcards: [
        {
          q: 'Why do LSM-Trees achieve significantly higher write throughput than B-Trees?',
          a: 'LSM-Trees append sequential writes directly to an in-memory MemTable and Write-Ahead Log without in-place page rewrites. B-Trees must rewrite whole random 4KB disk pages even for small changes.',
        },
        {
          q: 'What role does a Bloom filter play in an SSTable storage engine?',
          a: 'Bloom filters are probabilistic O(1) in-memory data structures that tell the engine if a key is definitely NOT in an SSTable, skipping unnecessary disk reads.',
        },
      ],
      code: {
        language: 'python',
        title: 'LSM-Tree MemTable & Append-Only WAL Simulation',
        snippet: `class SimpleMemTable:
    def __init__(self):
        self.mem = {}
        self.wal = []

    def put(self, key, value):
        self.wal.append(f"PUT {key}={value}")
        self.mem[key] = value

    def get(self, key):
        return self.mem.get(key, None)

db = SimpleMemTable()
db.put("user:42:elo", 1420)
db.put("user:42:status", "in_duel")
print("Stored ELO:", db.get("user:42:elo"))
print("WAL Entries:", db.wal)`,
      },
    },
    {
      hackathon:
        'When implementing multiplayer collaboration (like real-time code editor or Figma canvas), avoid complex two-phase commit databases. Use Raft state machines or optimistic CRDTs (Yjs) for instant conflict-free sync.',
      flashcards: [
        {
          q: 'What is Total Order Broadcast and why is it equivalent to Consensus?',
          a: 'Total order broadcast guarantees every node delivers the exact same sequence of messages in the exact same order. If you can order all state changes identically across replicas, you have solved consensus (Raft/Paxos).',
        },
        {
          q: 'What is Split-Brain and how is it prevented in Raft?',
          a: 'Split-brain happens when a network partition creates two independent leaders accepting conflicting writes. Raft prevents it by requiring a strict majority quorum ((N/2) + 1) for election and commits.',
        },
      ],
      code: {
        language: 'python',
        title: 'Raft Quorum Calculator',
        snippet: `def has_quorum(cluster_size, votes):
    majority = (cluster_size // 2) + 1
    return votes >= majority, majority

cluster = 5
votes = 3
ok, needed = has_quorum(cluster, votes)
print(f"Cluster: {cluster} nodes | Votes: {votes} | Needed: {needed} -> Quorum Granted: {ok}")`,
      },
    },
  ],
  'clean-code': [
    {
      hackathon:
        'Judges review GitHub repositories in under 90 seconds. Clean function names and short modular files (<150 lines) immediately communicate senior craftsmanship, doubling your chances of placing in the top 3.',
      flashcards: [
        {
          q: 'What is the Single Responsibility Principle (SRP) in clean architecture?',
          a: 'A class or function should have only one reason to change, meaning it serves exactly one business actor or domain concern.',
        },
        {
          q: 'Why should functions ideally take 0, 1, or 2 arguments at most?',
          a: 'Functions with 3+ arguments are hard to test, create combinatorial test explosion, and signal that several parameters should be encapsulated into an entity object.',
        },
      ],
      code: {
        language: 'python',
        title: 'Intention-Revealing Predicate Refactoring',
        snippet: `class Cell:
    def __init__(self, flagged=False):
        self.flagged = flagged

def get_flagged_cells(board):
    # Intent-revealing clean style
    return [cell for cell in board if cell.flagged]

board = [Cell(False), Cell(True), Cell(True)]
print("Flagged Cells Count:", len(get_flagged_cells(board)))`,
      },
    },
  ],
  'pragmatic-programmer': [
    {
      hackathon:
        'Build "Tracer Bullets" on Day 1: Connect your UI button -> Next.js API route -> Supabase database with dummy data within the first 3 hours. Do not spend 12 hours writing isolated UI that crashes when wired up.',
      flashcards: [
        {
          q: 'What is the difference between Tracer Bullets and Prototyping?',
          a: 'Prototypes are throwaway mockups to explore UI or feasibility. Tracer bullets are lean, production-grade code that cuts through every layer of the real architecture from day one and stays in the final app.',
        },
        {
          q: 'What is the DRY principle really about?',
          a: 'DRY is about duplicate business knowledge, not syntax. Two identical-looking lines of code that represent distinct domain concepts should not be merged.',
        },
      ],
      code: {
        language: 'python',
        title: 'Design by Contract (Preconditions & Postconditions)',
        snippet: `def withdraw(balance, amount):
    # Preconditions
    assert amount > 0, "Withdrawal amount must be positive"
    assert balance >= amount, "Insufficient funds"
    
    new_balance = balance - amount
    
    # Postcondition
    assert new_balance == balance - amount
    return new_balance

print("Balance after $40 withdrawal from $100:", withdraw(100, 40))`,
      },
    },
  ],
  clrs: [
    {
      hackathon:
        'When building search, autocomplete, or location matching in hackathons, using the right algorithmic data structure (Trie or KD-Tree) takes execution time from 5,000ms down to 4ms, impressing technical judges instantly.',
      flashcards: [
        {
          q: 'When should you use Dijkstra algorithm instead of BFS?',
          a: 'BFS only works on unweighted graphs to find shortest hop counts in O(V+E). Dijkstra is required when edges have non-negative weights (costs or latencies), running in O((V+E)log V) with a priority queue.',
        },
        {
          q: 'Why does MergeSort guarantee O(N log N) worst-case while QuickSort can degrade to O(N^2)?',
          a: 'MergeSort always splits arrays exactly in half. QuickSort degrades to O(N^2) if the pivot is repeatedly the minimum or maximum element without random pivot selection.',
        },
      ],
      code: {
        language: 'python',
        title: 'Binary Search Lower Bound (O(log N))',
        snippet: `def lower_bound(arr, target):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

scores = [1000, 1200, 1450, 1600, 1800]
target = 1400
idx = lower_bound(scores, target)
print(f"First score >= {target} is at index {idx}: {scores[idx]}")`,
      },
    },
  ],
  'grokking-algorithms': [
    {
      hackathon:
        'Whenever building product recommendations, teammate matching, or semantic similarity in hackathons, use Cosine Similarity or K-Nearest Neighbors (KNN). It gives working AI-like intelligence in 20 lines of code.',
      flashcards: [
        {
          q: 'How does Breadth-First Search (BFS) guarantee finding the shortest path in unweighted graphs?',
          a: 'BFS explores nodes layer by layer using a First-In-First-Out (FIFO) queue, ensuring all paths of length K are evaluated before any path of length K+1.',
        },
      ],
      code: {
        language: 'python',
        title: 'BFS Shortest Path on Social Network Graph',
        snippet: `from collections import deque

def shortest_hops(graph, start, goal):
    queue = deque([(start, 0)])
    seen = {start}
    while queue:
        node, dist = queue.popleft()
        if node == goal:
            return dist
        for nxt in graph.get(node, []):
            if nxt not in seen:
                seen.add(nxt)
                queue.append((nxt, dist + 1))
    return -1

network = {
    'Alice': ['Bob', 'Charlie'],
    'Bob': ['Alice', 'David'],
    'Charlie': ['Alice', 'Eve'],
    'David': ['Bob', 'Eve', 'Frank'],
    'Eve': ['Charlie', 'David'],
    'Frank': ['David']
}
print("Shortest hops Alice -> Frank:", shortest_hops(network, 'Alice', 'Frank'))`,
      },
    },
  ],
};
