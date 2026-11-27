export interface CodexBookChapter {
  number: string;
  title: string;
  summary: string;
  takeaways: string[];
  codeTitle?: string;
  codeSnippet?: string;
}

export interface CodingBook {
  id: string;
  index: number;
  title: string;
  shortTitle: string;
  author: string;
  year: string;
  isbn: string;
  coverUrl: string;
  spineColor: string;
  accentHex: string;
  category: 'Systems' | 'Algorithms' | 'Architecture' | 'Craft' | 'Interviews';
  pages: number;
  tagline: string;
  chapters: CodexBookChapter[];
}

const olCover = (isbn: string) => `/api/codex/cover?isbn=${isbn}`;

export const KA_CODEX_BOOKS: CodingBook[] = [
  {
    id: 'ddia',
    index: 1,
    title: 'Designing Data-Intensive Applications',
    shortTitle: 'DDIA',
    author: 'Martin Kleppmann',
    year: '2017',
    isbn: '9781449373320',
    coverUrl: olCover('9781449373320'),
    spineColor: '#991B1B',
    accentHex: '#EF4444',
    category: 'Systems',
    pages: 616,
    tagline: 'The big ideas behind reliable, scalable, and maintainable distributed systems.',
    chapters: [
      {
        number: '01',
        title: 'Reliable, Scalable & Maintainable Systems',
        summary:
          'Modern applications are data-intensive rather than compute-intensive. Measure latency with tail percentiles (p95, p99) instead of averages, and treat operability and evolvability as first-class design goals.',
        takeaways: [
          'Always track p99 latency rather than mean response time.',
          'Separate fault tolerance (surviving node failures) from total outage.',
          'Design abstractions that minimize cognitive load as teams scale.',
        ],
        codeTitle: 'p99 Latency Window Check (TypeScript)',
        codeSnippet: `function percentile(samples: number[], p: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}`,
      },
      {
        number: '02',
        title: 'Storage Engines: LSM-Trees vs B-Trees',
        summary:
          'Log-Structured Merge-trees optimize write throughput via append-only SSTables and memtables, whereas B-Trees update fixed-size 4KB pages in place for predictable read latency.',
        takeaways: [
          'Append-only WAL guarantees crash recovery before memtable flush.',
          'Bloom filters skip missing SSTable disk seeks in O(1) memory lookups.',
          'Compaction trades background I/O for faster range scans.',
        ],
      },
      {
        number: '03',
        title: 'Consensus, Partitioning & Replication',
        summary:
          'Replication choices (single-leader, multi-leader, leaderless) trade write availability against stale reads. Raft and Paxos solve total order broadcast so replicas agree even across partitions.',
        takeaways: [
          'Use consistent hashing or key-range sharding to limit rebalancing.',
          'Detect concurrent writes cleanly using vector clocks or version vectors.',
        ],
      },
    ],
  },
  {
    id: 'clean-code',
    index: 2,
    title: 'Clean Code',
    shortTitle: 'Clean Code',
    author: 'Robert C. Martin',
    year: '2008',
    isbn: '9780132350884',
    coverUrl: olCover('9780132350884'),
    spineColor: '#1E3A8A',
    accentHex: '#60A5FA',
    category: 'Craft',
    pages: 464,
    tagline: 'A handbook of agile software craftsmanship, naming discipline, and readable code.',
    chapters: [
      {
        number: '01',
        title: 'Meaningful Names & Intention',
        summary:
          'Code is read 10x more than it is written. Reveal intent directly through variable and function names so readers never need mental translation tables.',
        takeaways: [
          'Avoid cryptic abbreviations like d, list1, or tmpManager.',
          'Pick one consistent verb per concept across the codebase (fetch vs get).',
        ],
        codeTitle: 'Intention-Revealing Refactor',
        codeSnippet: `// Unclear -> Clean
const flaggedCells = gameBoard.filter((cell) => cell.isFlagged());`,
      },
      {
        number: '02',
        title: 'Small Functions, One Abstraction Level',
        summary:
          'Functions should do one thing, do it well, and operate at a single level of abstraction with shallow nesting and early returns.',
        takeaways: [
          'Replace boolean flag arguments by splitting into two explicit functions.',
          'Keep command vs query responsibilities strictly separated.',
        ],
      },
      {
        number: '03',
        title: 'Error Handling Without Clutter',
        summary:
          'Prefer exceptions and typed results over scattered null checks or magic error codes so business logic stays clear.',
        takeaways: [
          'Never return null from collection queries — return empty arrays.',
          'Wrap third-party SDK exceptions behind domain boundaries.',
        ],
      },
    ],
  },
  {
    id: 'pragmatic-programmer',
    index: 3,
    title: 'The Pragmatic Programmer',
    shortTitle: 'Pragmatic',
    author: 'David Thomas & Andrew Hunt',
    year: '2019',
    isbn: '9780135957059',
    coverUrl: olCover('9780135957059'),
    spineColor: '#B45309',
    accentHex: '#F59E0B',
    category: 'Craft',
    pages: 352,
    tagline: 'From journeyman to master: orthogonality, tracer bullets, and engineering mastery.',
    chapters: [
      {
        number: '01',
        title: 'Orthogonality & DRY Knowledge',
        summary:
          'Every piece of knowledge must have a single, unambiguous representation. Orthogonal modules eliminate ripple-effect bugs when requirements shift.',
        takeaways: [
          'DRY applies to knowledge and rules, not just accidental line duplication.',
          'Design decoupled modules that can be tested independently.',
        ],
      },
      {
        number: '02',
        title: 'Tracer Bullets & Reversibility',
        summary:
          'Ship a thin, end-to-end connected skeleton first ("tracer bullets") instead of building isolated layers in the dark. Keep third-party choices reversible.',
        takeaways: [
          'Real feedback from a working end-to-end slice beats speculative planning.',
          'Use prototypes to explore risk, then throw the prototype code away.',
        ],
        codeTitle: 'Design by Contract Guard',
        codeSnippet: `export function withdraw(balance: number, amount: number): number {
  if (amount <= 0) throw new RangeError('Amount must be positive');
  if (amount > balance) throw new Error('Insufficient funds');
  return balance - amount;
}`,
      },
    ],
  },
  {
    id: 'clrs',
    index: 4,
    title: 'Introduction to Algorithms (CLRS)',
    shortTitle: 'CLRS',
    author: 'Cormen, Leiserson, Rivest & Stein',
    year: '2022',
    isbn: '9780262046305',
    coverUrl: olCover('9780262046305'),
    spineColor: '#374151',
    accentHex: '#D1D5DB',
    category: 'Algorithms',
    pages: 1312,
    tagline: 'The comprehensive reference on asymptotic proofs, graphs, and dynamic programming.',
    chapters: [
      {
        number: '01',
        title: 'Asymptotics & Divide-and-Conquer',
        summary:
          'Master Theorem recurrences T(n) = aT(n/b) + f(n) unify sorting, binary search, and Fast Fourier Transform complexity bounds.',
        takeaways: [
          'MergeSort guarantees O(n log n) worst-case without pivot variance.',
          'Randomized QuickSort achieves O(n log n) expected runtime in-place.',
        ],
        codeTitle: 'Binary Search Loop Invariant',
        codeSnippet: `function lowerBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`,
      },
      {
        number: '02',
        title: 'Dynamic Programming & Greedy Choice',
        summary:
          'Optimal substructure plus overlapping subproblems allows bottom-up tabulation. Greedy applies when locally optimal choices never foreclose global optimums.',
        takeaways: [
          'Define state clearly before writing recurrence transitions.',
          'Verify matroid or exchange-argument proof before trusting greedy.',
        ],
      },
    ],
  },
  {
    id: 'grokking-algorithms',
    index: 5,
    title: 'Grokking Algorithms',
    shortTitle: 'Grokking',
    author: 'Aditya Y. Bhargava',
    year: '2016',
    isbn: '9781617292231',
    coverUrl: olCover('9781617292231'),
    spineColor: '#0F766E',
    accentHex: '#2DD4BF',
    category: 'Algorithms',
    pages: 256,
    tagline: 'An illustrated, intuitive guide to BFS, Dijkstra, recursion, and dynamic programming.',
    chapters: [
      {
        number: '01',
        title: 'Breadth-First Search & Shortest Paths',
        summary:
          'Model state transitions as unweighted graphs and use a FIFO queue to guarantee the shortest path in minimum hops.',
        takeaways: [
          'Track visited nodes before pushing to the queue to avoid cycles.',
          'Upgrade to Dijkstra priority queues once edges carry positive weights.',
        ],
        codeTitle: 'BFS Shortest Hops',
        codeSnippet: `function shortestPath(adj: Map<string, string[]>, start: string, goal: string): number {
  const queue: [string, number][] = [[start, 0]];
  const seen = new Set([start]);
  for (let i = 0; i < queue.length; i++) {
    const [node, dist] = queue[i];
    if (node === goal) return dist;
    for (const next of adj.get(node) || []) {
      if (!seen.has(next)) { seen.add(next); queue.push([next, dist + 1]); }
    }
  }
  return -1;
}`,
      },
      {
        number: '02',
        title: 'Hash Tables & Caching',
        summary:
          'Load factor below 0.7 keeps average lookups near O(1). Combine hash maps with doubly linked lists for LRU caching.',
        takeaways: [
          'Pick hash functions that distribute keys uniformly across buckets.',
          'Resize before collisions degrade lookups toward O(n).',
        ],
      },
    ],
  },
  {
    id: 'refactoring',
    index: 6,
    title: 'Refactoring',
    shortTitle: 'Refactoring',
    author: 'Martin Fowler',
    year: '2018',
    isbn: '9780134757599',
    coverUrl: olCover('9780134757599'),
    spineColor: '#7C2D12',
    accentHex: '#FB923C',
    category: 'Craft',
    pages: 448,
    tagline: 'Improving the design of existing code through safe, incremental transformations.',
    chapters: [
      {
        number: '01',
        title: 'The Two Hats & Red-Green Steps',
        summary:
          'Never add new features and restructure code simultaneously. Keep automated tests green across every micro-step.',
        takeaways: [
          'Build a solid test harness before refactoring legacy paths.',
          'Make each refactoring step small enough to commit without fear.',
        ],
      },
      {
        number: '02',
        title: 'Catalog of Code Smells',
        summary:
          'Long Functions, Data Clumps, Primitive Obsession, and Shotgun Surgery signal missing domain abstractions.',
        takeaways: [
          'Extract Function turns comments into self-documenting helpers.',
          'Replace Conditional with Polymorphism decouples variant rules.',
        ],
      },
    ],
  },
  {
    id: 'effective-java',
    index: 7,
    title: 'Effective Java',
    shortTitle: 'Effective Java',
    author: 'Joshua Bloch',
    year: '2018',
    isbn: '9780134685991',
    coverUrl: olCover('9780134685991'),
    spineColor: '#4C1D95',
    accentHex: '#A78BFA',
    category: 'Craft',
    pages: 416,
    tagline: '90 battle-tested design idioms on API ergonomics, immutability, generics, and concurrency.',
    chapters: [
      {
        number: '01',
        title: 'Static Factories, Builders & Immutability',
        summary:
          'Minimize mutability wherever possible. Use named static factory methods and Builders when constructors exceed three optional parameters.',
        takeaways: [
          'Immutable objects are inherently thread-safe and cache-friendly.',
          'Defensively copy mutable inputs at API boundaries.',
        ],
      },
      {
        number: '02',
        title: 'Composition Over Inheritance & PECS',
        summary:
          'Prefer composition over subclassing fragile implementations. Remember Producer Extends, Consumer Super (PECS) for bounded wildcards.',
        takeaways: [
          'Design interfaces carefully—every public member is a permanent promise.',
        ],
      },
    ],
  },
  {
    id: 'design-patterns',
    index: 8,
    title: 'Design Patterns (Gang of Four)',
    shortTitle: 'Design Patterns',
    author: 'Gamma, Helm, Johnson & Vlissides',
    year: '1994',
    isbn: '9780201633610',
    coverUrl: olCover('9780201633610'),
    spineColor: '#1F2937',
    accentHex: '#94A3B8',
    category: 'Architecture',
    pages: 395,
    tagline: 'The seminal catalog of creational, structural, and behavioral object-oriented patterns.',
    chapters: [
      {
        number: '01',
        title: 'Program to an Interface, Not Implementation',
        summary:
          'Polymorphic interfaces decouple callers from concrete implementations so components compose like interchangeable plugins.',
        takeaways: [
          'Strategy swaps algorithms cleanly at runtime without conditionals.',
          'Observer decouples event producers from reactive consumers.',
        ],
        codeTitle: 'Strategy Pattern (TypeScript)',
        codeSnippet: `type PricingStrategy = (cents: number) => number;
const strategies: Record<'std' | 'vip', PricingStrategy> = {
  std: (c) => c,
  vip: (c) => Math.round(c * 0.8),
};`,
      },
      {
        number: '02',
        title: 'Adapter, Decorator & Facade',
        summary:
          'Structural patterns wrap incompatible APIs, layer runtime behaviors dynamically, and simplify complex subsystems behind a clean facade.',
        takeaways: [
          'Use Decorators instead of exponential subclass explosions.',
        ],
      },
    ],
  },
  {
    id: 'clean-architecture',
    index: 9,
    title: 'Clean Architecture',
    shortTitle: 'Clean Arch',
    author: 'Robert C. Martin',
    year: '2017',
    isbn: '9780134494166',
    coverUrl: olCover('9780134494166'),
    spineColor: '#0369A1',
    accentHex: '#38BDF8',
    category: 'Architecture',
    pages: 432,
    tagline: 'Draw clean structural boundaries so business rules stay independent of frameworks and DBs.',
    chapters: [
      {
        number: '01',
        title: 'The Dependency Rule',
        summary:
          'Source code dependencies must point strictly inward toward higher-level policies. Core domain entities know nothing about SQL, HTTP, or UI.',
        takeaways: [
          'Defer database and framework commitments as long as possible.',
          'Treat the web layer and storage layer as swappable plugins.',
        ],
      },
      {
        number: '02',
        title: 'SOLID Component Principles',
        summary:
          'High-cohesion components release together, close around common reasons for change, and depend in the direction of stability.',
        takeaways: [
          'Avoid cyclic dependencies across package graphs.',
        ],
      },
    ],
  },
  {
    id: 'ctci',
    index: 10,
    title: 'Cracking the Coding Interview',
    shortTitle: 'Cracking Interview',
    author: 'Gayle Laakmann McDowell',
    year: '2015',
    isbn: '9780984782857',
    coverUrl: olCover('9780984782857'),
    spineColor: '#15803D',
    accentHex: '#4ADE80',
    category: 'Interviews',
    pages: 687,
    tagline: '189 programming questions, Big-O mastery, and structured problem-solving playbooks.',
    chapters: [
      {
        number: '01',
        title: 'BUD Optimization & Seven-Step Flow',
        summary:
          'Find Bottlenecks, Unnecessary Work, and Duplicated Work (BUD) to turn O(n²) brute forces into O(n) hash or two-pointer algorithms.',
        takeaways: [
          'Always verify constraints, duplicates, and negative numbers before coding.',
          'Walk through an edge-case dry run line by line before declaring done.',
        ],
        codeTitle: 'Two-Sum O(n) Hash Map',
        codeSnippet: `function twoSum(nums: number[], target: number): [number, number] | [] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}`,
      },
      {
        number: '02',
        title: 'Trees, Graphs & Bit Manipulation',
        summary:
          'Choose DFS for path/backtracking exploration and BFS for minimum-distance guarantees across grids and cyclic graphs.',
        takeaways: [
          'Bitmasks compactly represent visited subsets up to N = 20.',
        ],
      },
    ],
  },
  {
    id: 'code-complete',
    index: 11,
    title: 'Code Complete (2nd Edition)',
    shortTitle: 'Code Complete',
    author: 'Steve McConnell',
    year: '2004',
    isbn: '9780735619678',
    coverUrl: olCover('9780735619678'),
    spineColor: '#1D4ED8',
    accentHex: '#818CF8',
    category: 'Craft',
    pages: 960,
    tagline: 'The comprehensive encyclopedia of software construction, defensive coding, and debugging.',
    chapters: [
      {
        number: '01',
        title: 'Managing Complexity & Defensive Barriers',
        summary:
          'Managing complexity is the primary technical imperative of software. Validate external data at system barricades using explicit assertions.',
        takeaways: [
          'Keep boolean expressions simple using well-named predicate helpers.',
          'Never suppress errors silently—fail fast in dev, recover gracefully in prod.',
        ],
      },
      {
        number: '02',
        title: 'Table-Driven Design',
        summary:
          'Replace sprawling if/else cascades with lookup tables that encode rules cleanly in data rather than branching logic.',
        takeaways: [
          'Data-driven tables are shorter, clearer, and trivial to extend.',
        ],
      },
    ],
  },
  {
    id: 'sicp',
    index: 12,
    title: 'Structure & Interpretation of Computer Programs',
    shortTitle: 'SICP',
    author: 'Harold Abelson & Gerald Jay Sussman',
    year: '1996',
    isbn: '9780262510875',
    coverUrl: olCover('9780262510875'),
    spineColor: '#6D28D9',
    accentHex: '#C084FC',
    category: 'Systems',
    pages: 657,
    tagline: 'MIT’s legendary Wizard Book on functional abstraction, closures, streams, and compilers.',
    chapters: [
      {
        number: '01',
        title: 'Procedures as Abstractions & Closures',
        summary:
          'Programs must be written for people to read, and only incidentally for machines to execute. First-class functions turn operations into composable building blocks.',
        takeaways: [
          'Recursive processes vs iterative tail-call space complexity.',
          'Higher-order map, filter, and fold capture universal patterns.',
        ],
        codeTitle: 'Composable Reducer Pipeline',
        codeSnippet: `const compose = <T>(...fns: Array<(x: T) => T>) =>
  (init: T): T => fns.reduceRight((acc, fn) => fn(acc), init);`,
      },
      {
        number: '02',
        title: 'Metalinguistic Abstraction',
        summary:
          'Understanding eval/apply demystifies how every programming language interpreter, closure environment, and compiler works under the hood.',
        takeaways: [
          'Laziness & streams decouple infinite generators from finite consumers.',
        ],
      },
    ],
  },
];
