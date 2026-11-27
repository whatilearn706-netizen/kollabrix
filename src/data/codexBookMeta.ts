import type { BookMentorGuide } from '@/data/codexCatalog';

export interface BookChapterMeta {
  hackathon: string;
  flashcards: Array<{ q: string; a: string }>;
  code?: {
    language: 'java' | 'python' | 'cpp';
    title: string;
    snippet: string;
  };
}

export const FOLIO_BOOK_GOALS = [
  'All',
  'Java',
  'CSS & Frontend',
  'JS & TypeScript',
  'Python & AI/ML',
  'C & C++',
  '4th Year Core CS',
  'Placement & OAs',
  'Hackathon Backend',
  'Clean Code & PRs',
] as const;

export const CLASSIC_REAL_CHAPTER_LABELS: Record<string, string[]> = {
  ddia: ['Real Book Ch. 1 (of 12)', 'Real Book Ch. 3 (of 12)', 'Real Book Ch. 5 & 9 (of 12)'],
  'clean-code': ['Real Book Ch. 2 (of 17)', 'Real Book Ch. 3 (of 17)', 'Real Book Ch. 7 (of 17)'],
  'pragmatic-programmer': ['Real Book Ch. 2 (of 9)', 'Real Book Ch. 2 & 4 (of 9)'],
  clrs: ['Real Book Ch. 2–4 (of 35)', 'Real Book Ch. 14–15 (of 35)'],
  'grokking-algorithms': ['Real Book Ch. 6 (of 11)', 'Real Book Ch. 5 (of 11)'],
  refactoring: ['Real Book Ch. 2 (of 12)', 'Real Book Ch. 3 (of 12)'],
  'effective-java': ['Real Book Ch. 2 & 4 (of 12)', 'Real Book Ch. 4 & 5 (of 12)'],
  'design-patterns': ['Real Book Ch. 1 & 5 (of 6)', 'Real Book Ch. 4 (of 6)'],
  'clean-architecture': ['Real Book Part V: Ch. 22 (of 34)', 'Real Book Part IV: Ch. 12–14 (of 34)'],
  ctci: ['Real Book Ch. VII (of XVII)', 'Real Book Ch. IV & V (of XVII)'],
  'code-complete': ['Real Book Ch. 5 & 8 (of 35)', 'Real Book Ch. 18 (of 35)'],
  sicp: ['Real Book Ch. 1 & 2 (of 5)', 'Real Book Ch. 3 & 4 (of 5)'],
};

export const BOOK_MENTOR_GUIDES: Record<string, BookMentorGuide> = {
  ddia: {
    goalTags: ['Hackathon Backend', '4th Year Core CS', 'CS Deep Dive'],
    level: 'Pro',
    languageGroup: '4th Year Core CS',
    totalRealChapters: 12,
    quickVerdict: 'The #1 Backend & System Design Bible',
    useWhen:
      'You are building a real-time hackathon backend, preparing for System Design interviews, or deciding between Postgres, Redis, and Kafka.',
    skipWhen:
      'You have a pure DSA coding round / Online Assessment in the next 2 weeks—open Cracking the Coding Interview (CTCI) first instead.',
    onlyChaptersYouNeed:
      'Out of 12 huge chapters (~616 pages), read ONLY Ch. 1 (p99 Tail Latency), Ch. 3 (Storage: B-Trees vs LSM-Trees), Ch. 5 (Replication), Ch. 7 (Transactions), and Ch. 9 (Consensus). Skip Ch. 10–11 legacy Hadoop MapReduce completely!',
    recommendedPairTitle: 'System Design Interview (Alex Xu) for 45-min Interviews',
    recommendedPairBookId: 'system-design-alex-xu',
  },
  'clean-code': {
    goalTags: ['Clean Code & PRs'],
    level: 'Core',
    languageGroup: 'Architecture & Craft',
    totalRealChapters: 17,
    quickVerdict: 'Make Your GitHub Look Senior-Level',
    useWhen:
      'Your codebase feels messy, PR reviewers complain about giant functions, or hackathon judges only spend 60 seconds reading your GitHub repo.',
    skipWhen:
      'You are rushing a 2-hour coding contest—competitive programming speed matters more than long descriptive names in OAs.',
    onlyChaptersYouNeed:
      'Out of 17 chapters, master ONLY Ch. 2 (Meaningful Names), Ch. 3 (Small Functions), Ch. 7 (Error Handling), and Ch. 10 (Classes). Skip legacy Java XML config case studies in Ch. 14–16!',
    recommendedPairTitle: 'Refactoring by Martin Fowler (How to Clean Old Code Safely)',
    recommendedPairBookId: 'refactoring',
  },
  'pragmatic-programmer': {
    goalTags: ['Hackathon Backend', 'Clean Code & PRs'],
    level: 'Core',
    languageGroup: 'Architecture & Craft',
    totalRealChapters: 9,
    quickVerdict: 'Ship End-to-End Without Getting Stuck',
    useWhen:
      'Your hackathon team builds frontend and backend separately and everything breaks at the 11th hour during integration.',
    skipWhen:
      'You already ship full-stack slices daily and need deep DSA or JVM specifics.',
    onlyChaptersYouNeed:
      'Out of 9 chapters, focus ONLY on Ch. 2 Topic 8–12 (Orthogonality, DRY Knowledge & Tracer Bullets) and Ch. 4 Topic 23 (Design by Contract Guards).',
    recommendedPairTitle: 'Clean Code (Pair for Naming & Function Polish)',
    recommendedPairBookId: 'clean-code',
  },
  clrs: {
    goalTags: ['Placement & OAs', 'CS Deep Dive'],
    level: 'Pro',
    languageGroup: 'C & C++',
    totalRealChapters: 35,
    quickVerdict: 'Rigorous Algorithm Proofs & Complexity Bounds',
    useWhen:
      'You want rock-solid asymptotic intuition for Google/ICPC/Quant OAs, Master Theorem recurrences, or proving why a greedy/DP solution actually holds.',
    skipWhen:
      'You are just starting DSA from zero—read Grokking Algorithms first so the visuals click before diving into 1,312 pages of CLRS math.',
    onlyChaptersYouNeed:
      'Out of 35 chapters (1,312 pages!), read ONLY Ch. 2–4 (Loop Invariants & Master Theorem), Ch. 14 (Dynamic Programming), Ch. 15 (Greedy), and Ch. 20–22 (BFS, DFS, Dijkstra).',
    recommendedPairTitle: "Grokking Algorithms (Beginner Visuals) or CP Handbook (C++ Speed)",
    recommendedPairBookId: 'grokking-algorithms',
  },
  'grokking-algorithms': {
    goalTags: ['Placement & OAs'],
    level: 'Beginner',
    languageGroup: 'Python & AI/ML',
    totalRealChapters: 11,
    quickVerdict: 'Fastest Visual Way to Understand Graphs & BFS',
    useWhen:
      'You get confused by recursion, BFS/DFS, Dijkstra, or Hash Tables and want visual intuition that sticks before practicing LeetCode/Arena.',
    skipWhen:
      'You already solve 1600+ rated problems effortlessly and want advanced Segment Trees or Bitmask DP.',
    onlyChaptersYouNeed:
      'Out of 11 chapters, read Ch. 1–2 (Binary Search & Arrays/Lists), Ch. 5 (Hash Tables), Ch. 6 (Breadth-First Search), and Ch. 9 (Dijkstra). Saves 80% of beginner DSA confusion!',
    recommendedPairTitle: 'Cracking the Coding Interview (Next Step for Placements)',
    recommendedPairBookId: 'ctci',
  },
  refactoring: {
    goalTags: ['Clean Code & PRs'],
    level: 'Core',
    languageGroup: 'JS & TypeScript',
    totalRealChapters: 12,
    quickVerdict: 'Turn Spaghetti MVP Code Into Maintainable Software',
    useWhen:
      'Your project works, but adding one new feature breaks three existing pages ("Shotgun Surgery") and you are scared to touch old files.',
    skipWhen:
      'You haven’t built your initial working MVP yet—make it work first, then refactor safely.',
    onlyChaptersYouNeed:
      'Out of 12 chapters, read ONLY Ch. 2 (The Two Hats Principle), Ch. 3 (Catalog of Code Smells), Ch. 6 (Extract Function), and Ch. 10 (Replace Conditional with Polymorphism).',
    recommendedPairTitle: 'Clean Architecture (Structural App Boundaries)',
    recommendedPairBookId: 'clean-architecture',
  },
  'effective-java': {
    goalTags: ['Placement & OAs', 'Java & Architecture', 'Java'],
    level: 'Pro',
    languageGroup: 'Java',
    totalRealChapters: 12,
    quickVerdict: 'Mandatory for Java / Spring Boot Placements',
    useWhen:
      'Your primary stack is Java / Spring Boot, or you want to ace Java backend interviews (Amazon, Goldman Sachs, Flipkart, Uber).',
    skipWhen:
      'You write exclusively Python or TypeScript/Node.js for projects and OAs.',
    onlyChaptersYouNeed:
      'Out of 90 items across 12 chapters, master ONLY Ch. 2 (Items 1, 2, 6: Factories & Builders), Ch. 4 (Items 15–18: Immutability & Composition), Ch. 5 (Generics PECS), and Ch. 11 (Concurrency).',
    recommendedPairTitle: 'Java Concurrency in Practice (4th Year / Backend Pro)',
    recommendedPairBookId: 'java-concurrency',
  },
  'design-patterns': {
    goalTags: ['Hackathon Backend', 'Java & Architecture', 'Java'],
    level: 'Core',
    languageGroup: 'Java',
    totalRealChapters: 6,
    quickVerdict: 'Ace Low-Level Design (LLD) Interviews',
    useWhen:
      'You are facing Low-Level Design rounds ("Design a Parking Lot / Splitwise / Notification Engine") or want plug-and-play AI/Payment adapters in your hackathon app.',
    skipWhen:
      'You are forcing patterns into a 50-line script—simplicity beats over-engineering.',
    onlyChaptersYouNeed:
      'Out of 23 classic Gang of Four patterns, 5 patterns solve 90% of LLD interviews: Strategy, Factory Method, Observer, Adapter, and Decorator. Skip Flyweight, Interpreter, and Visitor!',
    recommendedPairTitle: 'Clean Architecture (Scale Beyond Individual Classes)',
    recommendedPairBookId: 'clean-architecture',
  },
  'clean-architecture': {
    goalTags: ['Hackathon Backend', 'Java & Architecture', '4th Year Core CS'],
    level: 'Pro',
    languageGroup: 'Architecture & Craft',
    totalRealChapters: 34,
    quickVerdict: 'Never Get Locked Into One DB or AI Provider',
    useWhen:
      'You want to swap Gemini/OpenAI or local SQLite/Postgres without rewriting your entire frontend and business logic.',
    skipWhen:
      'You are building a single-file CLI script or quick 2-hour prototype.',
    onlyChaptersYouNeed:
      'Out of 34 short chapters, read ONLY Part III (Ch. 7–11 SOLID Principles), Part IV (Ch. 14 Component Coupling), and Part V (Ch. 22 The Clean Architecture Dependency Rule).',
    recommendedPairTitle: 'System Design Interview (Alex Xu)',
    recommendedPairBookId: 'system-design-alex-xu',
  },
  ctci: {
    goalTags: ['Placement & OAs'],
    level: 'Core',
    languageGroup: 'Placement & OAs',
    totalRealChapters: 17,
    quickVerdict: 'Your #1 Weapon for Campus Placements & Internships',
    useWhen:
      'You have coding interviews or OAs coming up in 1–8 weeks and need a repeatable framework to optimize brute-force solutions live in front of an interviewer.',
    skipWhen:
      'You are purely focused on shipping a production startup/hackathon UI.',
    onlyChaptersYouNeed:
      'Out of 17 chapters (687 pages), master ONLY Ch. VII (Technical Walkthrough & BUD Optimization), Ch. 1–4 (Arrays/Strings, Linked Lists, Stacks, Trees/Graphs), and Ch. 8 (Recursion & DP).',
    recommendedPairTitle: "Competitive Programmer's Handbook (Hard OAs)",
    recommendedPairBookId: 'cp-handbook',
  },
  'code-complete': {
    goalTags: ['Clean Code & PRs'],
    level: 'Pro',
    languageGroup: 'Architecture & Craft',
    totalRealChapters: 35,
    quickVerdict: 'Bulletproof Production & Defensive Coding',
    useWhen:
      'Users keep crashing your live hackathon demo with unexpected inputs, empty strings, or edge cases.',
    skipWhen:
      'You are preparing for 45-minute algorithmic interviews—use CTCI instead.',
    onlyChaptersYouNeed:
      'Out of 35 chapters (960 pages!), read ONLY Ch. 5 (Design in Construction), Ch. 8 (Defensive Programming & Barricades), and Ch. 18 (Table-Driven Methods).',
    recommendedPairTitle: 'Clean Code (Everyday Naming & Functions)',
    recommendedPairBookId: 'clean-code',
  },
  sicp: {
    goalTags: ['CS Deep Dive'],
    level: 'Pro',
    languageGroup: 'Python & AI/ML',
    totalRealChapters: 5,
    quickVerdict: 'Unlock Elite Functional Thinking & Compilers',
    useWhen:
      'You want to deeply understand closures, recursion vs iteration, functional pipelines, and how interpreters/compilers actually work.',
    skipWhen:
      'You just want quick placement prep or to ship a React/Next.js CRUD app this weekend.',
    onlyChaptersYouNeed:
      'Out of 5 dense MIT chapters, read Ch. 1 (Building Abstractions with Procedures & Closures) and Ch. 3.5 / Ch. 4.1 (Streams & the Metacircular Evaluator).',
    recommendedPairTitle: 'Fluent Python (Apply Functional Streams in Modern Python)',
    recommendedPairBookId: 'fluent-python',
  },
};

export const BOOK_CHAPTER_METAS: Record<string, BookChapterMeta[]> = {
  ddia: [
    {
      hackathon:
        'When hackathon judges ask "How will your system handle 10,000 live concurrent users?", cite tail latency (p99). Tell them you offload heavy jobs to async queues (Redis/BullMQ) so p99 stays under 95ms during spikes.',
      flashcards: [
        {
          q: 'Why is p99 tail latency more critical than mean response time in web backends?',
          a: 'In microservices, a single user page load fans out to dozens of backend calls. If p99 is slow on even one service, tail amplification degrades the majority of user sessions.',
        },
        {
          q: 'What is the difference between a transient fault and a total outage?',
          a: 'A fault is one component failing (a slow disk or dropped packet). Fault-tolerant backends use timeouts, exponential backoff retries, and idempotency keys so faults never cascade into outages.',
        },
      ],
      code: {
        language: 'python',
        title: 'p99 Latency Percentile Calculator (Python)',
        snippet: `import math

def calculate_p99(samples):
    s = sorted(samples)
    idx = math.ceil(0.99 * len(s)) - 1
    return s[max(0, idx)]

latencies_ms = [12, 15, 18, 14, 22, 19, 850, 24, 18, 20]
print("p99 Latency:", calculate_p99(latencies_ms), "ms")
print("Mean Latency:", round(sum(latencies_ms) / len(latencies_ms), 2), "ms")`,
      },
    },
    {
      hackathon:
        'For high-speed event streams (live duel telemetry, audit logs, chat), use append-only writes (WAL pattern) rather than locking SQL rows with UPDATE queries.',
      flashcards: [
        {
          q: 'Why do LSM-Trees achieve higher write throughput than B-Trees?',
          a: 'LSM-Trees append sequential writes to an in-memory MemTable + Write-Ahead Log in O(1), whereas B-Trees perform random in-place 4KB disk page rewrites.',
        },
        {
          q: 'What role does a Bloom filter play in an SSTable storage engine?',
          a: 'Bloom filters answer in O(1) RAM whether a key is definitely NOT in an SSTable, skipping wasted disk seeks.',
        },
      ],
      code: {
        language: 'python',
        title: 'LSM-Tree MemTable & Append-Only WAL (Python)',
        snippet: `class SimpleMemTable:
    def __init__(self):
        self.mem = {}
        self.wal = []

    def put(self, key, value):
        self.wal.append(f"PUT {key}={value}")
        self.mem[key] = value

    def get(self, key):
        return self.mem.get(key)

db = SimpleMemTable()
db.put("user:42:elo", 1420)
db.put("user:42:status", "in_duel")
print("Stored ELO:", db.get("user:42:elo"))
print("WAL Entries:", db.wal)`,
      },
    },
    {
      hackathon:
        'For real-time multiplayer features (collaborative whiteboard or live quiz), avoid heavy two-phase commits. Use optimistic Redis pub/sub or CRDTs for sub-50ms sync.',
      flashcards: [
        {
          q: 'What is Total Order Broadcast and how does it relate to Consensus?',
          a: 'Total order broadcast guarantees every replica delivers the exact same messages in the exact same sequence—solving consensus (Raft/Paxos).',
        },
        {
          q: 'What is Split-Brain and how does Raft prevent it?',
          a: 'Split-brain occurs when a network partition splits a cluster into two leaders accepting conflicting writes. Raft prevents it by requiring a strict majority quorum ((N/2) + 1).',
        },
      ],
      code: {
        language: 'python',
        title: 'Raft Majority Quorum Verifier (Python)',
        snippet: `def has_quorum(cluster_size, votes):
    majority = (cluster_size // 2) + 1
    return votes >= majority, majority

for votes in [2, 3]:
    ok, needed = has_quorum(5, votes)
    print(f"5-node cluster | Votes: {votes} | Quorum needed: {needed} -> Elected: {ok}")`,
      },
    },
  ],
  'clean-code': [
    {
      hackathon:
        'Hackathon judges inspect your GitHub repo in under 60 seconds. Clean intention-revealing names immediately signal senior engineering quality.',
      flashcards: [
        {
          q: 'Why does Uncle Bob say code is read 10x more than it is written?',
          a: 'Every time you debug or add a feature, teammates spend most of their time reading existing symbols. Clear names eliminate mental translation.',
        },
      ],
      code: {
        language: 'python',
        title: 'Intention-Revealing Naming Refactor (Python)',
        snippet: `class Cell:
    def __init__(self, flagged=False):
        self.flagged = flagged

def get_flagged_cells(board):
    return [cell for cell in board if cell.flagged]

board = [Cell(False), Cell(True), Cell(True)]
print("Flagged Cells Count:", len(get_flagged_cells(board)))`,
      },
    },
    {
      hackathon:
        'Keep React components and API handlers under 40 lines per function with early returns—no 5-level nested if/else pyramids during 3 AM hackathon debugging.',
      flashcards: [
        {
          q: 'What is the Single Responsibility Principle (SRP)?',
          a: 'A module or function should have only one reason to change, serving one clear domain responsibility.',
        },
        {
          q: 'Why avoid boolean flag arguments in functions?',
          a: 'Passing render(true) forces callers to guess what true means and proves the function does two things. Split into two explicit functions.',
        },
      ],
      code: {
        language: 'python',
        title: 'Shallow Nesting & Early Return Guard (Python)',
        snippet: `def process_submission(user, code):
    if not user:
        return "ERROR: Unauthorized"
    if not code.strip():
        return "ERROR: Empty submission"
    return f"ACCEPTED for {user}"

print(process_submission(None, "print(1)"))
print(process_submission("Arjun", "print(1)"))`,
      },
    },
    {
      hackathon:
        'Wrap external APIs (Razorpay, Gemini, Judge0) in clean adapter helpers that return structured errors rather than crashing your UI with raw undefined reads.',
      flashcards: [
        {
          q: 'Why return empty collections ([]) instead of null from query functions?',
          a: 'Returning [] eliminates defensive null checks at every caller and prevents unexpected NullPointerExceptions / TypeErrors.',
        },
      ],
      code: {
        language: 'python',
        title: 'Clean Domain Error Wrapper (Python)',
        snippet: `def fetch_teammates(skills_db, query):
    return skills_db.get(query, [])

db = {"react": ["Aanya", "Rohan"], "python": ["Kabir"]}
for team in [fetch_teammates(db, "react"), fetch_teammates(db, "rust")]:
    print("Found:", len(team), "->", team)`,
      },
    },
  ],
  'pragmatic-programmer': [
    {
      hackathon:
        'Never duplicate business rules across frontend and backend—share validation constants or Zod schemas so changing a rule updates both automatically.',
      flashcards: [
        {
          q: 'What is the biggest misconception about DRY (Don’t Repeat Yourself)?',
          a: 'DRY is about duplicate business knowledge, not accidental code similarity. Two functions that look alike today but evolve for different business reasons should remain separate.',
        },
      ],
      code: {
        language: 'python',
        title: 'Orthogonal Rules Engine (Python)',
        snippet: `PLAN_QUOTAS = {"free": 10, "pro": 100, "hackathon": 250}

def check_quota(plan, used):
    limit = PLAN_QUOTAS.get(plan, 10)
    return used < limit, limit - used

for p, u in [("free", 4), ("pro", 100)]:
    allowed, left = check_quota(p, u)
    print(f"Plan={p} | Allowed={allowed} | Remaining={left}")`,
      },
    },
    {
      hackathon:
        'Build "Tracer Bullets" in Hour 2: wire UI button → API route → Supabase DB end-to-end immediately instead of building isolated mockups that fail before submission.',
      flashcards: [
        {
          q: 'What is the difference between Tracer Bullets and Prototyping?',
          a: 'Prototypes are throwaway experiments. Tracer bullets are lean, production-grade code slicing through every layer of your real stack from day one.',
        },
      ],
      code: {
        language: 'python',
        title: 'Design by Contract Precondition Guard (Python)',
        snippet: `def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if amount > balance:
        raise ValueError("Insufficient funds")
    return balance - amount

print("New balance:", withdraw(500, 120))`,
      },
    },
  ],
  clrs: [
    {
      hackathon:
        'Using Binary Search or a Trie instead of linear scans drops latency from 3,000ms to 3ms during live product demos.',
      flashcards: [
        {
          q: 'Why does MergeSort guarantee O(N log N) worst-case while QuickSort can hit O(N^2)?',
          a: 'MergeSort always splits arrays evenly in half; deterministic QuickSort degrades to O(N^2) on already-sorted inputs if the pivot is chosen poorly.',
        },
      ],
      code: {
        language: 'python',
        title: 'Binary Search Lower Bound (Python)',
        snippet: `def lower_bound(arr, target):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

ratings = [1000, 1250, 1420, 1680, 1950]
idx = lower_bound(ratings, 1400)
print("First ELO >= 1400:", ratings[idx], "at index", idx)`,
      },
    },
    {
      hackathon:
        'Before writing Dynamic Programming, prove whether a Greedy sort + single pass solves it cleanly in O(N log N) time and O(1) space.',
      flashcards: [
        {
          q: 'What two properties must hold for Dynamic Programming to apply?',
          a: '1) Optimal Substructure (optimal answer builds from optimal sub-answers) and 2) Overlapping Subproblems (subproblems repeat and benefit from memoization).',
        },
      ],
      code: {
        language: 'python',
        title: 'Bottom-Up DP Coin Change (Python)',
        snippet: `def min_coins(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if a - c >= 0:
                dp[a] = min(dp[a], 1 + dp[a - c])
    return dp[amount] if dp[amount] <= amount else -1

print("Min coins for 11 with [1, 5, 6]:", min_coins([1, 5, 6], 11))`,
      },
    },
  ],
  'grokking-algorithms': [
    {
      hackathon:
        'BFS solves teammate-network degrees of separation, dependency resolution, and shortest paths in unweighted hackathon graphs in 15 lines of Python.',
      flashcards: [
        {
          q: 'When should you use BFS instead of Dijkstra?',
          a: 'Use BFS when all edge weights are equal (unweighted hops) for O(V+E) time. Upgrade to Dijkstra when edges carry positive varying costs/latencies.',
        },
      ],
      code: {
        language: 'python',
        title: 'BFS Shortest Hops in Builder Graph (Python)',
        snippet: `from collections import deque

def shortest_hops(adj, start, goal):
    q = deque([(start, 0)])
    seen = {start}
    while q:
        node, dist = q.popleft()
        if node == goal:
            return dist
        for nxt in adj.get(node, []):
            if nxt not in seen:
                seen.add(nxt)
                q.append((nxt, dist + 1))
    return -1

graph = {"Ananya": ["Rohan", "Dev"], "Rohan": ["Meera"], "Dev": ["Kabir"], "Meera": ["Zoya"]}
print("Hops Ananya -> Zoya:", shortest_hops(graph, "Ananya", "Zoya"))`,
      },
    },
    {
      hackathon:
        'Combine a Hash Map + Doubly Linked List (or Python OrderedDict) to add an instant in-memory LRU cache in front of slow AI/DB responses.',
      flashcards: [
        {
          q: 'Why does keeping hash table load factor below 0.7 matter?',
          a: 'Above 0.7, hash collisions spike rapidly, degrading O(1) average lookups toward O(N) linked scans.',
        },
      ],
      code: {
        language: 'python',
        title: 'O(1) LRU Cache Using OrderedDict (Python)',
        snippet: `from collections import OrderedDict

class LRUCache:
    def __init__(self, cap):
        self.cap = cap
        self.cache = OrderedDict()

    def get(self, k):
        if k not in self.cache:
            return -1
        self.cache.move_to_end(k)
        return self.cache[k]

    def put(self, k, v):
        if k in self.cache:
            self.cache.move_to_end(k)
        self.cache[k] = v
        if len(self.cache) > self.cap:
            evicted = self.cache.popitem(last=False)
            print("Evicted LRU:", evicted)

lru = LRUCache(2)
lru.put("ddia", "loaded"); lru.put("clrs", "loaded"); lru.get("ddia"); lru.put("ctci", "loaded")
print("Active keys:", list(lru.cache.keys()))`,
      },
    },
  ],
  refactoring: [
    {
      hackathon:
        'Follow the Two Hats rule: get your feature passing end-to-end first, commit it, and ONLY then wear the Refactoring Hat to clean up without breaking working code.',
      flashcards: [
        {
          q: 'Why should you never mix adding features and refactoring in the same step?',
          a: 'Mixing both makes it impossible to tell whether a bug came from the new feature logic or a broken refactor, slowing down debugging.',
        },
      ],
      code: {
        language: 'python',
        title: 'Red-Green Safe Refactor Check (Python)',
        snippet: `def calculate_total(items):
    return sum(p * q for p, q in items)

assert calculate_total([(100, 2), (50, 1)]) == 250
print("All invariant checks green -> Safe to refactor!")`,
      },
    },
    {
      hackathon:
        'Replace sprawling 80-line switch/if-elif blocks (like pricing tiers or badge colors) with clean dictionary dispatch tables.',
      flashcards: [
        {
          q: 'What is the "Shotgun Surgery" code smell?',
          a: 'When adding one simple requirement forces you to edit 6 different files in tiny places—a sign that related logic needs to be consolidated into one module.',
        },
      ],
      code: {
        language: 'python',
        title: 'Replace Conditional with Lookup Dispatch (Python)',
        snippet: `TIER_FEES = {
    "student": lambda amt: round(amt * 0.5),
    "pro": lambda amt: round(amt * 0.8),
    "enterprise": lambda amt: amt,
}

for tier in ["student", "pro", "enterprise"]:
    print(tier, "fee:", TIER_FEES[tier](1000))`,
      },
    },
  ],
  'effective-java': [
    {
      hackathon:
        'In Java Spring Boot hackathon backends, use Java record DTOs and Builder patterns so request payloads stay immutable, null-safe, and thread-safe.',
      flashcards: [
        {
          q: 'Why prefer Static Factory Methods (List.of()) over public constructors?',
          a: 'Static factories have descriptive names, can return cached instances or subtypes, and don’t force callers to create a new object every time.',
        },
        {
          q: 'Why are immutable objects automatically thread-safe?',
          a: 'Because their internal state cannot change after construction, multiple threads can read them concurrently without locks or race conditions.',
        },
      ],
      code: {
        language: 'java',
        title: 'Immutable Record Pattern (Java)',
        snippet: `public class Main {
    record SquadTicket(String team, String track, int members) {}

    public static void main(String[] args) {
        SquadTicket t = new SquadTicket("AlphaByte", "Agentic AI", 4);
        System.out.println("Registered: " + t.team() + " | Track: " + t.track());
    }
}`,
      },
    },
    {
      hackathon:
        'In Java interviews, always explain why Composition (has-a) beats Inheritance (is-a) when extending third-party classes whose internals might change.',
      flashcards: [
        {
          q: 'What does PECS stand for in Java Generics?',
          a: 'Producer Extends, Consumer Super: use <? extends T> when reading items from a collection, and <? super T> when writing items into it.',
        },
      ],
      code: {
        language: 'java',
        title: 'Composition Over Inheritance (Java)',
        snippet: `import java.util.*;

public class Main {
    static class CountingList<T> {
        private final List<T> inner = new ArrayList<>();
        private int addCount = 0;
        public void add(T item) { addCount++; inner.add(item); }
        public int getAddCount() { return addCount; }
    }

    public static void main(String[] args) {
        CountingList<String> list = new CountingList<>();
        list.add("Java"); list.add("Spring");
        System.out.println("Total added safely: " + list.getAddCount());
    }
}`,
      },
    },
  ],
  'design-patterns': [
    {
      hackathon:
        'Use the Strategy Pattern when integrating multiple AI providers (Gemini + fallback) or payment gateways (Razorpay + Stripe) so swapping providers takes 1 line.',
      flashcards: [
        {
          q: 'How does the Strategy Pattern eliminate rigid if/else chains in LLD rounds?',
          a: 'It extracts each algorithm behind a common interface so callers dynamically swap strategies at runtime without modifying core classes (Open/Closed Principle).',
        },
      ],
      code: {
        language: 'python',
        title: 'Strategy Pattern for Hackathon Scoring (Python)',
        snippet: `def blitz_score(seconds): return max(50, 300 - seconds)
def accuracy_score(passed): return passed * 100

def grade_duel(strategy, metric):
    return strategy(metric)

print("Blitz mode score (45s):", grade_duel(blitz_score, 45))
print("Accuracy mode score (4/4):", grade_duel(accuracy_score, 4))`,
      },
    },
    {
      hackathon:
        'Use the Adapter + Facade pattern to wrap messy external SDKs behind one clean aiClient.ts helper for your whole team.',
      flashcards: [
        {
          q: 'What is the difference between Decorator and Adapter patterns?',
          a: 'Adapter changes an incompatible interface into what a client expects; Decorator preserves the same interface while dynamically adding extra responsibilities.',
        },
      ],
      code: {
        language: 'python',
        title: 'Decorator Pattern for Rate-Limited API Calls (Python)',
        snippet: `def with_logging(fn):
    def wrapper(endpoint):
        print(f"[AUDIT] Calling {endpoint}...")
        return fn(endpoint)
    return wrapper

@with_logging
def call_sandbox(endpoint):
    return f"200 OK from {endpoint}"

print(call_sandbox("/api/icpc/execute"))`,
      },
    },
  ],
  'clean-architecture': [
    {
      hackathon:
        'Keep your core scoring/business rules in plain pure functions (src/lib/...) separate from Next.js API routes and React components—so both Web and AI agents can reuse them.',
      flashcards: [
        {
          q: 'What is the Dependency Rule in Clean Architecture?',
          a: 'Source code dependencies must only point inward toward domain policies. Inner domain entities never import database drivers, UI frameworks, or HTTP controllers.',
        },
      ],
      code: {
        language: 'python',
        title: 'Dependency Inversion with Storage Port (Python)',
        snippet: `class InMemoryRepo:
    def save(self, item): return f"Saved to RAM: {item}"

class PostgresRepo:
    def save(self, item): return f"Saved to Postgres: {item}"

def register_team(repo, team_name):
    return repo.save(team_name)

print(register_team(InMemoryRepo(), "TeamForge"))
print(register_team(PostgresRepo(), "TeamForge"))`,
      },
    },
    {
      hackathon:
        'Avoid circular imports across components/ and lib/ by placing shared TypeScript interfaces in src/types/ so dependencies form a clean directed acyclic graph.',
      flashcards: [
        {
          q: 'Why does Clean Architecture forbid cyclic component dependencies?',
          a: 'Cycles force every module in the cycle to rebuild, retest, and deploy together, turning small fixes into giant merge conflicts.',
        },
      ],
      code: {
        language: 'python',
        title: 'Acyclic Use-Case Pipeline (Python)',
        snippet: `def validate_input(data):
    return data.get("title", "").strip()

def create_project_usecase(raw, save_fn):
    title = validate_input(raw)
    if not title:
        return {"ok": False, "error": "Title required"}
    return {"ok": True, "id": save_fn(title)}

print(create_project_usecase({"title": "Kollabrix AI"}, lambda t: f"proj_{len(t)}"))`,
      },
    },
  ],
  ctci: [
    {
      hackathon:
        'Use Hash Maps (Map / dict) as your default instinct whenever an API endpoint loops inside a loop checking membership—turns O(N^2) timeouts into instant O(N).',
      flashcards: [
        {
          q: 'What does BUD optimization stand for in Cracking the Coding Interview?',
          a: 'Bottlenecks (slowest step), Unnecessary Work (skipping branches/early exits), and Duplicated Work (caching/precomputing with hash maps).',
        },
      ],
      code: {
        language: 'python',
        title: 'Two-Sum O(N) Hash Map Solution (Python)',
        snippet: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i
    return []

print("Two-Sum Indices:", two_sum([2, 7, 11, 15], 9))`,
      },
    },
    {
      hackathon:
        'In graph/permission checks, represent up to 20 boolean flags or team skill masks as a single integer bitmask for O(1) compatibility scoring.',
      flashcards: [
        {
          q: 'How do you check if the k-th bit is set in an integer bitmask?',
          a: 'Use (mask & (1 << k)) != 0 in O(1) bitwise time.',
        },
      ],
      code: {
        language: 'python',
        title: 'Skill Match Bitmask Compatibility (Python)',
        snippet: `REACT, PYTHON, SQL = 1 << 0, 1 << 1, 1 << 2
required = REACT | SQL
candidate = REACT | PYTHON | SQL

match = (candidate & required) == required
print("Matches required React+SQL skills:", match)`,
      },
    },
  ],
  'code-complete': [
    {
      hackathon:
        'Add strict input "barricades" (Zod / guard clauses) at every API route boundary so malformed user inputs return crisp 400 errors instead of 500 server crashes during live judging.',
      flashcards: [
        {
          q: 'What is a "Defensive Barricade" in software construction?',
          a: 'A boundary layer where untrusted external inputs are sanitized and validated once, allowing inner business modules to operate cleanly assuming valid types.',
        },
      ],
      code: {
        language: 'python',
        title: 'API Boundary Barricade Guard (Python)',
        snippet: `def sanitize_payload(payload):
    age = payload.get("team_size")
    if not isinstance(age, int) or not (1 <= age <= 6):
        raise ValueError("Team size must be integer between 1 and 6")
    return payload

for test in [{"team_size": 4}, {"team_size": 99}]:
    try:
        print("Valid:", sanitize_payload(test))
    except ValueError as e:
        print("Blocked by barricade:", e)`,
      },
    },
    {
      hackathon:
        'Use Table-Driven Design to define rubric weights, badge tiers, or hackathon status colors in a clean JSON config table rather than repetitive if/else chains.',
      flashcards: [
        {
          q: 'Why is Table-Driven Design superior to deep conditional trees?',
          a: 'Rules live in compact data tables rather than duplicated control flow, making them easier to read, test, and update without touching code logic.',
        },
      ],
      code: {
        language: 'python',
        title: 'Table-Driven Grade Calculator (Python)',
        snippet: `GRADE_TABLE = [(90, "S"), (80, "A"), (70, "B"), (60, "C"), (0, "Review")]

def letter_grade(score):
    return next(grade for threshold, grade in GRADE_TABLE if score >= threshold)

for s in [95, 82, 64, 48]:
    print(f"Score {s} -> Grade {letter_grade(s)}")`,
      },
    },
  ],
  sicp: [
    {
      hackathon:
        'Higher-order reducer pipelines (map, filter, compose) let you chain AI preprocessing, sanitization, and scoring steps cleanly without temporary mutable state.',
      flashcards: [
        {
          q: 'What is the difference between a recursive process and an iterative process in SICP?',
          a: 'A recursive process builds up deferred stack frames (O(N) space), whereas an iterative process passes all state in accumulators (O(1) tail-call space).',
        },
      ],
      code: {
        language: 'python',
        title: 'Composable Higher-Order Pipeline (Python)',
        snippet: `from functools import reduce

def compose(*fns):
    return lambda x: reduce(lambda v, f: f(v), reversed(fns), x)

clean_slug = compose(lambda s: s.replace(" ", "-"), str.lower, str.strip)
print("Normalized slug:", clean_slug("  KA FOLIO Edition  "))`,
      },
    },
    {
      hackathon:
        'Use Python generators (yield) when streaming large LLM outputs or millions of log lines—memory stays O(1) instead of loading gigabytes into RAM.',
      flashcards: [
        {
          q: 'How do lazy streams work according to SICP?',
          a: 'A stream pairs an evaluated head element with a delayed promise ("thunk") for the rest, evaluating elements strictly on demand.',
        },
      ],
      code: {
        language: 'python',
        title: 'Lazy Infinite Stream Generator (Python)',
        snippet: `def fibonacci_stream():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

stream = fibonacci_stream()
first_8 = [next(stream) for _ in range(8)]
print("First 8 streamed values:", first_8)`,
      },
    },
  ],
};
