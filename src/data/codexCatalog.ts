export type CodexSection = 'home' | 'books' | 'solving' | 'saved' | 'vault';
export type CodexLevel = 'beginner' | 'intermediate' | 'pro';

export interface CodexVideoLesson {
  id: string;
  level: CodexLevel;
  title: string;
  instructor: string;
  duration: string;
  youtubeId: string;
  summary: string;
  keyTakeaways: string[];
  codeSnippet: {
    language: 'java' | 'python' | 'cpp' | 'typescript';
    label: string;
    code: string;
  };
}

export interface CodexLanguageTrack {
  id: string;
  kind: 'track';
  name: string;
  title: string;
  edition: string;
  subtitle: string;
  spotlightAuthor: string;
  spotlightRole: string;
  spotlightBio: string;
  ctaLabel: string;
  lessonsCount: string;
  coverGradient: string;
  spineColor: string;
  accentColor: string;
  badgeText: string;
  curriculumKeys: Partial<Record<CodexLevel, string>>;
  lessons: CodexVideoLesson[];
}

export interface CodexBookChapter {
  id: string;
  realChapterLabel?: string;
  title: string;
  readTime: string;
  overview: string;
  keyRules: string[];
  hackathonUse?: string;
  interviewFlashcards?: Array<{ q: string; a: string }>;
  code?: {
    language: 'java' | 'python' | 'cpp' | 'typescript';
    title: string;
    snippet: string;
  };
}

export interface BookMentorGuide {
  goalTags: string[];
  level: 'Beginner' | 'Core' | 'Pro';
  languageGroup: string;
  totalRealChapters: number;
  useWhen: string;
  skipWhen: string;
  onlyChaptersYouNeed: string;
  recommendedPairTitle?: string;
  recommendedPairBookId?: string;
  quickVerdict: string;
}

export interface CodexBookVolume {
  id: string;
  kind: 'book';
  title: string;
  languageTag: string;
  level?: 'Beginner' | 'Core' | 'Pro';
  languageGroup?: string;
  edition: string;
  subtitle: string;
  spotlightAuthor: string;
  spotlightRole: string;
  spotlightBio: string;
  ctaLabel: string;
  pagesCount: number;
  coverGradient: string;
  spineColor: string;
  accentColor: string;
  badgeText: string;
  mentorGuide?: BookMentorGuide;
  chapters: CodexBookChapter[];
}

export interface CodexPatternVolume {
  id: string;
  kind: 'solving';
  title: string;
  sheetTag: string;
  edition: string;
  subtitle: string;
  spotlightAuthor: string;
  spotlightRole: string;
  spotlightBio: string;
  ctaLabel: string;
  timeComplexity: string;
  spaceComplexity: string;
  coverGradient: string;
  spineColor: string;
  accentColor: string;
  badgeText: string;
  whenToSpot: string[];
  pitfalls: string[];
  templates: {
    python: string;
    cpp: string;
    java: string;
  };
  practiceProblems: Array<{
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    hint: string;
  }>;
}

export const CODEX_LANGUAGE_TRACKS: CodexLanguageTrack[] = [
  {
    id: 'track-java',
    kind: 'track',
    name: 'Java',
    title: 'Java Mastery Track',
    edition: 'VOL I · JVM & BACKEND',
    subtitle: 'Beginner syntax to Collections, Concurrency & Spring Boot placement rounds.',
    spotlightAuthor: 'Java Studio Track',
    spotlightRole: 'OpenJDK 21 · OOP & Placement Prep',
    spotlightBio:
      'Start from your first main() method, master Collections & HashMaps for company OAs, and architect production Spring Boot microservices.',
    ctaLabel: 'Open Java Track',
    lessonsCount: '3 Levels · Video + Notes',
    coverGradient: 'from-[#2a1509] via-[#170c06] to-[#08090d]',
    spineColor: 'bg-amber-500',
    accentColor: 'text-amber-300',
    badgeText: 'JAVA 21',
    curriculumKeys: { beginner: 'java-beginner', intermediate: 'java-learning', pro: 'java-learning' },
    lessons: [
      {
        id: 'java-beg-1',
        level: 'beginner',
        title: 'JVM Architecture, Variables & Fast Scanner I/O',
        instructor: 'KΛ Java Core',
        duration: '28m',
        youtubeId: 'xk4_1vDrzzo',
        summary:
          'Understand how javac compiles .java files into bytecode executed by the JVM, declare primitive types cleanly, and read competitive stdin.',
        keyTakeaways: [
          'Every Java executable needs a class entry point: public static void main(String[] args).',
          'Use BufferedReader + StringTokenizer for large OA inputs instead of slow Scanner calls.',
          'Strings are immutable in Java; prefer StringBuilder inside loops.',
        ],
        codeSnippet: {
          language: 'java',
          label: 'Fast I/O & Array Sum in Java 21',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] scores = {42, 85, 91, 64};
        int best = Arrays.stream(scores).max().orElse(0);
        System.out.println("Top Java Score: " + best);
    }
}`,
        },
      },
      {
        id: 'java-beg-2',
        level: 'beginner',
        title: 'OOP Foundations: Classes, Constructors & Interfaces',
        instructor: 'KΛ Java Core',
        duration: '34m',
        youtubeId: 'BSVKUk58K6U',
        summary:
          'Model real-world campus entities with encapsulation, inheritance, polymorphism, and Java interfaces.',
        keyTakeaways: [
          'Favor composition and interfaces over deep inheritance chains.',
          'Override equals() and hashCode() whenever storing objects in HashMap/HashSet.',
        ],
        codeSnippet: {
          language: 'java',
          label: 'Clean Record & Interface Pattern',
          code: `interface Scorable {
    int rankScore();
}

public class Main {
    record Builder(String handle, int elo) implements Scorable {
        public int rankScore() { return elo + 50; }
    }
    public static void main(String[] args) {
        var b = new Builder("CyberCoder", 1420);
        System.out.println(b.handle() + " -> " + b.rankScore());
    }
}`,
        },
      },
      {
        id: 'java-int-1',
        level: 'intermediate',
        title: 'Collections Framework: HashMap, ArrayDeque & PriorityQueue',
        instructor: 'KΛ Systems',
        duration: '38m',
        youtubeId: 'GdAon80-0KA',
        summary:
          'Master O(1) frequency maps, monotonic queues with ArrayDeque, and custom Comparators in PriorityQueue for graph algorithms.',
        keyTakeaways: [
          'Use ArrayDeque over Stack and LinkedList for fast BFS queues and stacks.',
          'Always pass (a, b) -> Integer.compare(a, b) instead of (a - b) to prevent integer overflow.',
        ],
        codeSnippet: {
          language: 'java',
          label: 'Top-K Frequencies with Min-Heap',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] langs = {"java", "py", "java", "cpp", "java", "py"};
        Map<String, Integer> freq = new HashMap<>();
        for (String l : langs) freq.merge(l, 1, Integer::sum);
        System.out.println("Frequencies: " + freq);
    }
}`,
        },
      },
      {
        id: 'java-pro-1',
        level: 'pro',
        title: 'Spring Boot REST APIs, Concurrency & Virtual Threads',
        instructor: 'KΛ Placement Lab',
        duration: '44m',
        youtubeId: '9SGDpanrc8U',
        summary:
          'Design resilient backend endpoints, DTO validation, JPA indexing, and Java 21 structured concurrency for high-throughput systems.',
        keyTakeaways: [
          'Keep controllers thin, move transaction boundaries to @Service layer.',
          'Use CompletableFuture or Java 21 virtual threads for I/O-bound fan-out.',
        ],
        codeSnippet: {
          language: 'java',
          label: 'Thread-Safe Counter & Executor Check',
          code: `import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        AtomicInteger hits = new AtomicInteger(0);
        for (int i = 0; i < 5; i++) hits.incrementAndGet();
        System.out.println("Atomic Request Hits: " + hits.get());
    }
}`,
        },
      },
    ],
  },
  {
    id: 'track-cpp',
    kind: 'track',
    name: 'C++',
    title: 'C++ & STL Speedrun',
    edition: 'VOL II · COMPETITIVE',
    subtitle: 'Pointers, STL containers, memory efficiency & ICPC contest templates.',
    spotlightAuthor: 'C++ Arena Track',
    spotlightRole: 'GCC C++20 · STL & Battle Speed',
    spotlightBio:
      'Write blazing-fast sub-10ms solutions. Learn vectors, unordered_map tuning, custom comparators, and zero-overhead abstractions.',
    ctaLabel: 'Open C++ Track',
    lessonsCount: '3 Levels · Video + Notes',
    coverGradient: 'from-[#0c213a] via-[#081324] to-[#07090e]',
    spineColor: 'bg-cyan-400',
    accentColor: 'text-cyan-300',
    badgeText: 'C++ 20',
    curriculumKeys: { beginner: 'cpp-beginner', intermediate: 'cpp-learning', pro: 'cpp-learning' },
    lessons: [
      {
        id: 'cpp-beg-1',
        level: 'beginner',
        title: 'Modern C++ Syntax, Fast I/O & References',
        instructor: 'KΛ Competitive',
        duration: '26m',
        youtubeId: 'ZzaPdXTrSb8',
        summary:
          'Master ios_base::sync_with_stdio(false), pass-by-reference (&) to eliminate array copies, and range-based loops.',
        keyTakeaways: [
          'Always put ios::sync_with_stdio(false); cin.tie(nullptr); at the start of main().',
          'Pass large std::vector<int>& by const reference to avoid O(N) copy TLEs.',
        ],
        codeSnippet: {
          language: 'cpp',
          label: 'Zero-Copy Reference Sweep',
          code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {3, 7, 2, 9, 5};
    int best = 0;
    for (const int x : nums) best = max(best, x);
    cout << "Max Value: " << best << "\\n";
    return 0;
}`,
        },
      },
      {
        id: 'cpp-int-1',
        level: 'intermediate',
        title: 'STL Powerhouse: vector, set, map & lambda sorts',
        instructor: 'KΛ Competitive',
        duration: '36m',
        youtubeId: 'okhdtEk1iKk',
        summary:
          'Use std::sort with custom lambdas, lower_bound binary search, and ordered std::set / std::priority_queue fluently.',
        keyTakeaways: [
          'lower_bound returns iterator to first element >= target in O(log N).',
          'Prefer long long (1LL * a * b) for products exceeding 2e9.',
        ],
        codeSnippet: {
          language: 'cpp',
          label: 'Binary Search with lower_bound',
          code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {10, 20, 30, 40, 50};
    auto it = lower_bound(v.begin(), v.end(), 35);
    cout << "First >= 35 is at index " << (it - v.begin()) << " (" << *it << ")\\n";
    return 0;
}`,
        },
      },
      {
        id: 'cpp-pro-1',
        level: 'pro',
        title: 'Graphs, Bitmasks & Segment-Tree Optimization',
        instructor: 'KΛ ICPC Lab',
        duration: '45m',
        youtubeId: 'tWVWeAqZ0WU',
        summary:
          'Implement iterative BFS/DFS, Dijkstra shortest path with min-heap, and bitmask DP for hard online assessments.',
        keyTakeaways: [
          'Use priority_queue<pair<long long, int>, vector<...>, greater<>> for Dijkstra.',
          'Check 1LL << bit instead of 1 << bit when bit >= 31.',
        ],
        codeSnippet: {
          language: 'cpp',
          label: 'Count Set Bits (__builtin_popcount)',
          code: `#include <iostream>
using namespace std;

int main() {
    int mask = 0b101101;
    cout << "Active flags: " << __builtin_popcount(mask) << "\\n";
    return 0;
}`,
        },
      },
    ],
  },
  {
    id: 'track-python',
    kind: 'track',
    name: 'Python',
    title: 'Python Engineering Track',
    edition: 'VOL III · AI & FASTAPI',
    subtitle: 'Clean Pythonic idioms, FastAPI backends, async pipelines & data structures.',
    spotlightAuthor: 'Python Studio Track',
    spotlightRole: 'Python 3.12 · Scripting to AI Backends',
    spotlightBio:
      'Go from clean list comprehensions and collections.Counter to async FastAPI APIs, Pydantic validation, and AI orchestration.',
    ctaLabel: 'Open Python Track',
    lessonsCount: '3 Levels · Video + Notes',
    coverGradient: 'from-[#0d281f] via-[#081713] to-[#07090e]',
    spineColor: 'bg-emerald-400',
    accentColor: 'text-emerald-300',
    badgeText: 'PYTHON 3.12',
    curriculumKeys: { beginner: 'python-beginner', intermediate: 'python-learning', pro: 'python-learning' },
    lessons: [
      {
        id: 'py-beg-1',
        level: 'beginner',
        title: 'Python Foundations: Lists, Dicts & Comprehensions',
        instructor: 'KΛ Python Core',
        duration: '25m',
        youtubeId: '_uQrJ0TkZlc',
        summary:
          'Write readable O(1) dictionary lookups, slice arrays cleanly, and replace noisy loops with expressive comprehensions.',
        keyTakeaways: [
          'Membership checks (x in my_set) are O(1) for set/dict vs O(N) for list.',
          'Use enumerate() and zip() instead of manual index counters.',
        ],
        codeSnippet: {
          language: 'python',
          label: 'Pythonic Filter & Mapping',
          code: `scores = [45, 78, 92, 61, 88]
shortlisted = [s for s in scores if s >= 75]
print("Shortlisted:", shortlisted, "Avg:", sum(shortlisted) / len(shortlisted))`,
        },
      },
      {
        id: 'py-int-1',
        level: 'intermediate',
        title: 'Standard Library Mastery: collections, heapq & functools',
        instructor: 'KΛ Python Core',
        duration: '32m',
        youtubeId: 'HGOBQPFzWKo',
        summary:
          'Unlock defaultdict, Counter, deque, heapq, and @lru_cache memoization for clean DSA & interview solutions.',
        keyTakeaways: [
          '@lru_cache(None) turns recursive DP into memoized O(N) cleanly.',
          'collections.deque gives O(1) popleft() for BFS.',
        ],
        codeSnippet: {
          language: 'python',
          label: 'Counter + lru_cache Memoized DP',
          code: `from collections import Counter
from functools import lru_cache

@lru_cache(None)
def climb(n: int) -> int:
    return 1 if n <= 1 else climb(n - 1) + climb(n - 2)

print("Ways for 6 steps:", climb(6))
print("Freq:", dict(Counter("kollabrix")))`,
        },
      },
      {
        id: 'py-pro-1',
        level: 'pro',
        title: 'Async FastAPI Backends & Structured LLM APIs',
        instructor: 'KΛ AI Systems',
        duration: '40m',
        youtubeId: '7t2alSnE2-I',
        summary:
          'Build type-safe async endpoints with FastAPI, Pydantic v2 schemas, streaming SSE responses, and vector retrieval.',
        keyTakeaways: [
          'Use asyncio.gather() to run independent I/O calls concurrently.',
          'Always enforce request timeouts & structured schema validation.',
        ],
        codeSnippet: {
          language: 'python',
          label: 'Async Task Pattern Simulation',
          code: `import asyncio

async def fetch_service(name: str):
    await asyncio.sleep(0.02)
    return f"{name}: 200 OK"

async def main():
    res = await asyncio.gather(fetch_service("GitHub"), fetch_service("Judge0"))
    print("Parallel Results:", res)

asyncio.run(main())`,
        },
      },
    ],
  },
  {
    id: 'track-nextjs',
    kind: 'track',
    name: 'TypeScript & Next.js',
    title: 'TypeScript & Next.js Studio',
    edition: 'VOL IV · FULL-STACK',
    subtitle: 'App Router, Server Actions, Postgres schemas & hackathon shipping speed.',
    spotlightAuthor: 'Full-Stack Web Track',
    spotlightRole: 'Next.js 14 · Tailwind · Supabase',
    spotlightBio:
      'Master App Router Server vs Client Components, strict TypeScript API routes, optimistic UI updates, and shipping production SaaS.',
    ctaLabel: 'Open Web Track',
    lessonsCount: '3 Levels · Video + Notes',
    coverGradient: 'from-[#1b1536] via-[#100c22] to-[#07090e]',
    spineColor: 'bg-violet-400',
    accentColor: 'text-violet-300',
    badgeText: 'NEXT.JS 14',
    curriculumKeys: { beginner: 'web_dev-beginner', intermediate: 'web_dev-learning', pro: 'web_dev-learning' },
    lessons: [
      {
        id: 'ts-beg-1',
        level: 'beginner',
        title: 'TypeScript Interfaces, Unions & Async Fetch',
        instructor: 'KΛ Web Core',
        duration: '29m',
        youtubeId: '30LWjhZzg50',
        summary:
          'Eliminate runtime undefined crashes using discriminated unions, strict type guards, and typed API responses.',
        keyTakeaways: [
          'Prefer discriminated unions ({ status: "ok", data } | { status: "error", message }) for state.',
          'Keep TypeScript strict mode enabled from day 1.',
        ],
        codeSnippet: {
          language: 'python',
          label: 'Check Sandbox Output (Switch to Web/TS Notes)',
          code: `# Full TypeScript code preview:
# type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }
print("TypeScript Discriminated Union Guide Ready")`,
        },
      },
      {
        id: 'ts-int-1',
        level: 'intermediate',
        title: 'App Router Server Components, Caching & Route Handlers',
        instructor: 'KΛ Web Core',
        duration: '37m',
        youtubeId: 'wm5gMKuwSYk',
        summary:
          'Fetch database rows securely in Server Components while keeping interactive UI islands lightweight in Client Components.',
        keyTakeaways: [
          'Never expose service-role DB secrets in "use client" files.',
          'Use Promise.all() for independent server data loads to avoid waterfalls.',
        ],
        codeSnippet: {
          language: 'python',
          label: 'API Latency Parallel Pattern',
          code: `print("Promise.all reduces 3x sequential 200ms queries from 600ms -> 200ms")`,
        },
      },
      {
        id: 'ts-pro-1',
        level: 'pro',
        title: 'Real-Time Multiplayer State, Rate Limits & Edge Security',
        instructor: 'KΛ Architecture',
        duration: '42m',
        youtubeId: 'NgayZAuTgwM',
        summary:
          'Design CSP headers, IP/User rate limiters, cryptographic payment webhook verification, and WebSocket room sync.',
        keyTakeaways: [
          'Always verify webhook & payment signatures with HMAC-SHA256 on the server.',
          'Keep security headers strict: object-src none, explicit frame-src allowlist.',
        ],
        codeSnippet: {
          language: 'python',
          label: 'HMAC Verification Concept',
          code: `import hmac, hashlib
sig = hmac.new(b"secret", b"order|payment", hashlib.sha256).hexdigest()
print("Verified Signature Prefix:", sig[:16])`,
        },
      },
    ],
  },
  {
    id: 'track-dsa',
    kind: 'track',
    name: 'DSA & System Design',
    title: 'DSA & System Design',
    edition: 'VOL V · PLACEMENTS',
    subtitle: 'Graphs, DP, Caching, Rate Limiters & Low-Level Design interviews.',
    spotlightAuthor: 'Placement & OA Track',
    spotlightRole: 'FAANG / Product Engineering Prep',
    spotlightBio:
      'Bridge competitive algorithms with scalable architecture: sliding windows, shortest paths, Redis caching, and database sharding.',
    ctaLabel: 'Open DSA Track',
    lessonsCount: '3 Levels · Video + Notes',
    coverGradient: 'from-[#281223] via-[#170b15] to-[#07090e]',
    spineColor: 'bg-rose-400',
    accentColor: 'text-rose-300',
    badgeText: 'DSA + LLD',
    curriculumKeys: { beginner: 'dsa-beginner', intermediate: 'dsa-learning', pro: 'dsa-learning' },
    lessons: [
      {
        id: 'dsa-beg-1',
        level: 'beginner',
        title: 'Big-O Complexity, Prefix Sums & Hash Maps',
        instructor: 'KΛ Algorithms',
        duration: '24m',
        youtubeId: 'RBSGKlAvoiM',
        summary:
          'Recognize constraints (N <= 10^5 means O(N log N) or O(N)) and solve subarray sum problems cleanly with prefix maps.',
        keyTakeaways: [
          'For N = 10^5, an O(N^2) solution does 10^10 ops -> guaranteed TLE.',
          'Prefix sum + HashMap solves subarray sum equals K in O(N).',
        ],
        codeSnippet: {
          language: 'python',
          label: 'Subarray Sum Equals K (O(N))',
          code: `def count_subarrays(nums, k):
    seen = {0: 1}
    pref = ans = 0
    for x in nums:
        pref += x
        ans += seen.get(pref - k, 0)
        seen[pref] = seen.get(pref, 0) + 1
    return ans

print("Subarrays matching k=5:", count_subarrays([1, 2, 3, 2, 3], 5))`,
        },
      },
      {
        id: 'dsa-int-1',
        level: 'intermediate',
        title: 'Trees, BFS Levels & Graph Topological Sort',
        instructor: 'KΛ Algorithms',
        duration: '36m',
        youtubeId: 'tWVWeAqZ0WU',
        summary:
          'Traverse dependency graphs with Kahn’s in-degree BFS and solve shortest unweighted paths cleanly.',
        keyTakeaways: [
          'Whenever prerequisites or build-order appear, think Topological Sort (Kahn BFS).',
          'Mark nodes visited when pushing into queue, not when popping, to avoid duplicates.',
        ],
        codeSnippet: {
          language: 'python',
          label: 'Kahn Topological Order',
          code: `from collections import deque

adj = {0: [1, 2], 1: [3], 2: [3], 3: []}
indeg = {u: 0 for u in adj}
for u in adj:
    for v in adj[u]: indeg[v] += 1

q = deque([u for u, d in indeg.items() if d == 0])
order = []
while q:
    u = q.popleft()
    order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)
print("Topological Order:", order)`,
        },
      },
      {
        id: 'dsa-pro-1',
        level: 'pro',
        title: 'System Design: Rate Limiters, Queues & Sharding',
        instructor: 'KΛ Systems',
        duration: '46m',
        youtubeId: 'F2FmTdLtb_4',
        summary:
          'Design a distributed rate limiter, URL shortener, or real-time battle leaderboard using Redis sorted sets & write-behind queues.',
        keyTakeaways: [
          'Token bucket allows controlled bursts; sliding window log prevents boundary spikes.',
          'Read replicas + cache-aside handle read-heavy campus leaderboards.',
        ],
        codeSnippet: {
          language: 'python',
          label: 'Token Bucket Rate Limiter Demo',
          code: `class TokenBucket:
    def __init__(self, cap, rate):
        self.cap, self.tokens, self.rate = cap, cap, rate
    def allow(self, cost=1):
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False

b = TokenBucket(3, 1)
print([b.allow() for _ in range(5)])`,
        },
      },
    ],
  },
];

export const CODEX_BOOKS: CodexBookVolume[] = [
  {
    id: 'book-java',
    kind: 'book',
    title: 'The Java Field Manual',
    languageTag: 'JAVA · JVM',
    edition: 'FIRST EDITION · VOL 01',
    subtitle: 'Deep JVM internals, Collections performance, and Spring Boot API patterns.',
    spotlightAuthor: 'KΛ Codex Press',
    spotlightRole: 'Java 21 · 4 Core Chapters',
    spotlightBio:
      'A dense, zero-fluff reference volume covering how HashMaps resize, why StringBuilder beats concatenation, and writing thread-safe services.',
    ctaLabel: 'Start Reading',
    pagesCount: 48,
    coverGradient: 'from-[#351b0b] via-[#1c0f07] to-[#08090e]',
    spineColor: 'bg-amber-400',
    accentColor: 'text-amber-300',
    badgeText: 'VOLUME 01',
    chapters: [
      {
        id: 'java-ch1',
        title: '1. Memory Model: Stack, Heap & Metaspace',
        readTime: '6 min read',
        overview:
          'Primitive local variables and object references live on each thread’s Stack, while actual object instances and arrays are allocated on the shared Heap managed by G1GC/ZGC.',
        keyRules: [
          'Small primitive types (int, long, boolean) have zero GC overhead.',
          'Autoboxing inside tight loops (Integer instead of int) allocates millions of heap objects — avoid in OAs.',
          'String literals live in the String Pool inside the Heap.',
        ],
        code: {
          language: 'java',
          title: 'Benchmarking StringBuilder vs Concatenation',
          snippet: `public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) sb.append("Ch").append(i).append(" ");
        System.out.println(sb.toString().trim());
    }
}`,
        },
      },
      {
        id: 'java-ch2',
        title: '2. HashMap Internals & Treeification',
        readTime: '7 min read',
        overview:
          'Since Java 8, HashMap converts linked buckets exceeding 8 items into balanced Red-Black trees when capacity >= 64, protecting worst-case lookup from O(N) down to O(log N).',
        keyRules: [
          'Default load factor is 0.75; pre-size maps when knowing N: new HashMap<>((int)(n / 0.75) + 1).',
          'Never mutate a key field used in hashCode() after inserting into a HashMap.',
        ],
      },
      {
        id: 'java-ch3',
        title: '3. Streams vs Loops in Production Code',
        readTime: '5 min read',
        overview:
          'Streams shine for declarative transforms on medium collections, while plain for-loops stay fastest inside low-latency hot paths and nested DP.',
        keyRules: [
          'Avoid parallelStream() inside shared web server pools — it hijacks ForkJoinPool.commonPool().',
          'Use Collectors.groupingBy cleanly for analytics aggregation.',
        ],
      },
    ],
  },
  {
    id: 'book-cpp',
    kind: 'book',
    title: 'C++ Competitive Handbook',
    languageTag: 'C++20 · STL',
    edition: 'CONTEST EDITION · VOL 02',
    subtitle: 'Zero-overhead abstractions, STL mechanics & memory-safe contest speed.',
    spotlightAuthor: 'KΛ Codex Press',
    spotlightRole: 'GCC C++20 · 3 Core Chapters',
    spotlightBio:
      'Every subtle trap in C++ placement coding—from signed integer overflow and unordered_map anti-hash collisions to fast custom sorting.',
    ctaLabel: 'Start Reading',
    pagesCount: 42,
    coverGradient: 'from-[#0d263f] via-[#081524] to-[#07090e]',
    spineColor: 'bg-cyan-400',
    accentColor: 'text-cyan-300',
    badgeText: 'VOLUME 02',
    chapters: [
      {
        id: 'cpp-ch1',
        title: '1. Vector Growth, Reallocation & Iterator Invalidation',
        readTime: '6 min read',
        overview:
          'Calling push_back when vector size == capacity triggers a 2x reallocation, invalidating every pointer and iterator to elements inside the vector.',
        keyRules: [
          'Call v.reserve(n) before pushing N items to guarantee zero reallocations.',
          'Prefer emplace_back for complex structs/pairs.',
        ],
        code: {
          language: 'cpp',
          title: 'Pre-allocated Fast Adjacency List',
          snippet: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;
    v.reserve(4);
    for (int i = 1; i <= 4; i++) v.push_back(i * 10);
    cout << "Capacity: " << v.capacity() << ", Last: " << v.back() << "\\n";
    return 0;
}`,
        },
      },
      {
        id: 'cpp-ch2',
        title: '2. Defeating unordered_map Anti-Hash Tests',
        readTime: '5 min read',
        overview:
          'Standard GCC std::unordered_map uses an identity hash for integers—adversarial test cases can force O(N^2) collisions!',
        keyRules: [
          'Either use std::map when N <= 2e5 if O(log N) is safe, or use a splitmix64 custom hash.',
          'Always use long long for prefix sums & coordinate differences.',
        ],
      },
    ],
  },
  {
    id: 'book-python',
    kind: 'book',
    title: 'Pythonic Systems Volume',
    languageTag: 'PYTHON 3.12',
    edition: 'SYSTEMS EDITION · VOL 03',
    subtitle: 'Data model internals, async concurrency, generators & FastAPI design.',
    spotlightAuthor: 'KΛ Codex Press',
    spotlightRole: 'Python 3.12 · 3 Core Chapters',
    spotlightBio:
      'Go beyond basic scripting. Understand generators, shallow vs deep mutability, asyncio event loops, and how to write crisp O(N) Python.',
    ctaLabel: 'Start Reading',
    pagesCount: 38,
    coverGradient: 'from-[#0d2a21] via-[#081713] to-[#07090e]',
    spineColor: 'bg-emerald-400',
    accentColor: 'text-emerald-300',
    badgeText: 'VOLUME 03',
    chapters: [
      {
        id: 'py-ch1',
        title: '1. Mutable Default Traps & Shallow Multiplication',
        readTime: '5 min read',
        overview:
          'Writing grid = [[0] * m] * n creates N references to the SAME inner list row! Updating grid[0][1] silently mutates every single row.',
        keyRules: [
          'Always initialize 2D DP tables using [[0] * m for _ in range(n)].',
          'Never use a list [] as a default function argument: use None instead.',
        ],
        code: {
          language: 'python',
          title: 'Safe 2D Matrix Initialization',
          snippet: `rows, cols = 2, 3
grid = [[0] * cols for _ in range(rows)]
grid[0][1] = 99
print("Safe independent rows:", grid)`,
        },
      },
      {
        id: 'py-ch2',
        title: '2. Recursion Limit & Iterative Conversion',
        readTime: '5 min read',
        overview:
          'Python caps recursion depth at 1,000 frames by default—deep tree/graph DFS on N = 10^5 causes RecursionError.',
        keyRules: [
          'Call sys.setrecursionlimit(200000) or write explicit stack-based DFS.',
          'Remember each stack frame in Python uses noticeable RAM compared to C++.',
        ],
      },
    ],
  },
  {
    id: 'book-atlas',
    kind: 'book',
    title: 'DSA Pattern Atlas',
    languageTag: 'ALGORITHMS',
    edition: 'PLACEMENT EDITION · VOL 04',
    subtitle: '16 universal algorithmic patterns that unlock 90% of OA & interview rounds.',
    spotlightAuthor: 'KΛ Codex Press',
    spotlightRole: 'Algorithms · Visual Pattern Guide',
    spotlightBio:
      'Stop memorizing 400 random problems. Map input constraints directly to Sliding Window, Monotonic Stack, Union-Find, or Binary Search on Answer.',
    ctaLabel: 'Start Reading',
    pagesCount: 64,
    coverGradient: 'from-[#281223] via-[#170b15] to-[#07090e]',
    spineColor: 'bg-rose-400',
    accentColor: 'text-rose-300',
    badgeText: 'VOLUME 04',
    chapters: [
      {
        id: 'atlas-ch1',
        title: '1. Binary Search on Answer Space',
        readTime: '6 min read',
        overview:
          'Whenever you see "Minimize the maximum" or "Find minimum capacity to finish within H hours", binary search the monotonic answer range [low, high].',
        keyRules: [
          'Write a crisp canFinish(mid) helper in O(N).',
          'Total complexity becomes O(N log(MaxRange)) — effortlessly clears N = 10^5.',
        ],
        code: {
          language: 'python',
          title: 'Monotonic Feasibility Binary Search',
          snippet: `def min_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        hours = sum((p + mid - 1) // mid for p in piles)
        if hours <= h: hi = mid
        else: lo = mid + 1
    return lo

print("Minimum Speed:", min_speed([3, 6, 7, 11], 8))`,
        },
      },
      {
        id: 'atlas-ch2',
        title: '2. Union-Find (DSU) for Dynamic Connectivity',
        readTime: '6 min read',
        overview:
          'Maintain connected components, detect cycles in undirected graphs, and solve network-merging queries in nearly O(1) amortized time.',
        keyRules: [
          'Always combine Path Compression inside find() with Union by Rank/Size.',
        ],
      },
    ],
  },
  {
    id: 'book-sysdesign',
    kind: 'book',
    title: 'System Design Vol. 1',
    languageTag: 'ARCHITECTURE',
    edition: 'SCALE EDITION · VOL 05',
    subtitle: 'Caching, message queues, database indexing & winning hackathon architectures.',
    spotlightAuthor: 'KΛ Codex Press',
    spotlightRole: 'Distributed Systems · Architecture',
    spotlightBio:
      'Everything judges and staff engineers expect: B-tree composite indexing, Redis cache invalidation, idempotent payments, and SSE streaming.',
    ctaLabel: 'Start Reading',
    pagesCount: 52,
    coverGradient: 'from-[#1b1536] via-[#100c22] to-[#07090e]',
    spineColor: 'bg-violet-400',
    accentColor: 'text-violet-300',
    badgeText: 'VOLUME 05',
    chapters: [
      {
        id: 'sys-ch1',
        title: '1. Composite B-Tree Indexes & Query Plans',
        readTime: '6 min read',
        overview:
          'An index on (user_id, created_at DESC) serves both WHERE user_id = ? and ORDER BY created_at DESC without sorting in memory.',
        keyRules: [
          'Put equality columns first, range/sort columns last in composite indexes.',
          'Always avoid N+1 database queries inside API loops.',
        ],
      },
      {
        id: 'sys-ch2',
        title: '2. Idempotency Keys & Payment Safety',
        readTime: '5 min read',
        overview:
          'Network retries can submit checkout requests twice. Storing a unique idempotency key or order_id guarantees users are credited once and never double-charged.',
        keyRules: [
          'Verify payment gateway HMAC signatures strictly server-side before activating entitlements.',
        ],
      },
    ],
  },
];

export const CODEX_PATTERNS: CodexPatternVolume[] = [
  {
    id: 'pat-sliding-window',
    kind: 'solving',
    title: 'Sliding Window & Two Pointers',
    sheetTag: 'PATTERN 01 · ARRAYS & STRINGS',
    edition: 'O(N) TWO-POINTER',
    subtitle: 'Solve contiguous subarray/substring constraints without nested loops.',
    spotlightAuthor: 'KΛ Problem Lab',
    spotlightRole: 'Frequency: Very High in OAs',
    spotlightBio:
      'Used in longest substring without repeats, max consecutive ones, and minimum window substring. Shrink left pointer when invariant breaks.',
    ctaLabel: 'Open Playbook',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K)',
    coverGradient: 'from-[#0d263f] via-[#081524] to-[#07090e]',
    spineColor: 'bg-cyan-400',
    accentColor: 'text-cyan-300',
    badgeText: 'O(N) WINDOW',
    whenToSpot: [
      'Contiguous subarray or substring with a constraint (at most K distinct, sum <= target).',
      'Sorted array pair/triplet target sums (left = 0, right = n - 1).',
    ],
    pitfalls: [
      'Forgetting to update window count before incrementing left pointer.',
      'Applying variable-size window directly when negative numbers exist (use Prefix Sum + Map instead!).',
    ],
    templates: {
      python: `def longest_unique_substring(s: str) -> int:
    seen = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        best = max(best, right - left + 1)
    return best

print("Max unique len:", longest_unique_substring("kollabrix"))`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    string s = "kollabrix";
    vector<int> last(256, -1);
    int left = 0, best = 0;
    for (int right = 0; right < (int)s.size(); ++right) {
        if (last[s[right]] >= left) left = last[s[right]] + 1;
        last[s[right]] = right;
        best = max(best, right - left + 1);
    }
    cout << "Max unique len: " << best << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String s = "kollabrix";
        int[] last = new int[256];
        Arrays.fill(last, -1);
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (last[c] >= left) left = last[c] + 1;
            last[c] = right;
            best = Math.max(best, right - left + 1);
        }
        System.out.println("Max unique len: " + best);
    }
}`,
    },
    practiceProblems: [
      { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', hint: 'Store last index of each char.' },
      { title: 'Container With Most Water', difficulty: 'Medium', hint: 'Shrink the shorter wall inward.' },
    ],
  },
  {
    id: 'pat-dp',
    kind: 'solving',
    title: 'Dynamic Programming States',
    sheetTag: 'PATTERN 02 · OPTIMIZATION',
    edition: '1D / 2D KNAPSACK',
    subtitle: 'Turn exponential recursion into crisp linear/grid state transitions.',
    spotlightAuthor: 'KΛ Problem Lab',
    spotlightRole: 'Core FAANG / Amazon Round',
    spotlightBio:
      'Break problems into Choice, State Definition (dp[i]), Transition Formula, and Base Cases. Compress 2D tables down to 1D rolling arrays.',
    ctaLabel: 'Open Playbook',
    timeComplexity: 'O(N · W)',
    spaceComplexity: 'O(W)',
    coverGradient: 'from-[#281223] via-[#170b15] to-[#07090e]',
    spineColor: 'bg-rose-400',
    accentColor: 'text-rose-300',
    badgeText: 'DP STATES',
    whenToSpot: [
      'Count number of ways, or find minimum/maximum cost over choices.',
      'Decisions at index i affect future choices (take vs skip, coin change, edit distance).',
    ],
    pitfalls: [
      'Iterating capacity loop forwards in 0/1 Knapsack (must go backwards so items aren’t reused).',
      'Missing modulo 10^9 + 7 inside counting loops.',
    ],
    templates: {
      python: `def coin_change_min(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] <= amount else -1

print("Min coins for 11:", coin_change_min([1, 2, 5], 11))`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> coins = {1, 2, 5};
    int amount = 11;
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int c : coins)
        for (int a = c; a <= amount; ++a)
            dp[a] = min(dp[a], dp[a - c] + 1);
    cout << "Min coins for 11: " << (dp[amount] > amount ? -1 : dp[amount]) << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] coins = {1, 2, 5};
        int amount = 11;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int c : coins)
            for (int a = c; a <= amount; a++)
                dp[a] = Math.min(dp[a], dp[a - c] + 1);
        System.out.println("Min coins for 11: " + (dp[amount] > amount ? -1 : dp[amount]));
    }
}`,
    },
    practiceProblems: [
      { title: 'House Robber & Circular Variants', difficulty: 'Medium', hint: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])' },
      { title: 'Coin Change Minimal Count', difficulty: 'Medium', hint: 'Iterate amount from c up to target.' },
    ],
  },
  {
    id: 'pat-graphs',
    kind: 'solving',
    title: 'Trees, BFS & Shortest Paths',
    sheetTag: 'PATTERN 03 · GRAPHS',
    edition: 'BFS · DIJKSTRA · DSU',
    subtitle: 'Master level-order BFS, multi-source grids, Dijkstra & topological sort.',
    spotlightAuthor: 'KΛ Problem Lab',
    spotlightRole: 'High-Impact Graph Toolkit',
    spotlightBio:
      'Whether modeling campus networks or grid contagion (Rotting Oranges), queue-driven multi-source BFS and Dijkstra handle weighted & unweighted graphs.',
    ctaLabel: 'Open Playbook',
    timeComplexity: 'O((V+E) log V)',
    spaceComplexity: 'O(V + E)',
    coverGradient: 'from-[#0d281f] via-[#081713] to-[#07090e]',
    spineColor: 'bg-emerald-400',
    accentColor: 'text-emerald-300',
    badgeText: 'GRAPHS & BFS',
    whenToSpot: [
      'Shortest path in unweighted grid/graph -> BFS.',
      'Shortest path with non-negative edge weights -> Dijkstra Min-Heap.',
    ],
    pitfalls: [
      'Push visited check BEFORE enqueueing neighbors in BFS so the same cell isn’t queued multiple times.',
      'Initialize dist[] with LLONG_MAX / float("inf") for weighted shortest path.',
    ],
    templates: {
      python: `import heapq

def dijkstra(n, edges, src):
    g = [[] for _ in range(n)]
    for u, v, w in edges: g[u].append((v, w))
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in g[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist

print("Distances from 0:", dijkstra(4, [(0,1,4),(0,2,1),(2,1,2),(1,3,1)], 0))`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n = 4;
    vector<vector<pair<int,int>>> g(n);
    g[0].push_back({1, 4}); g[0].push_back({2, 1});
    g[2].push_back({1, 2}); g[1].push_back({3, 1});
    vector<int> dist(n, 1e9);
    dist[0] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, 0});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : g[u]) if (d + w < dist[v]) {
            dist[v] = d + w;
            pq.push({dist[v], v});
        }
    }
    cout << "Shortest 0->3: " << dist[3] << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[][] edges = {{0,1,4},{0,2,1},{2,1,2},{1,3,1}};
        List<int[]>[] g = new ArrayList[4];
        for (int i = 0; i < 4; i++) g[i] = new ArrayList<>();
        for (int[] e : edges) g[e[0]].add(new int[]{e[1], e[2]});
        int[] dist = {0, 99999, 99999, 99999};
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        pq.add(new int[]{0, 0});
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            if (cur[0] > dist[cur[1]]) continue;
            for (int[] nx : g[cur[1]]) if (cur[0] + nx[1] < dist[nx[0]]) {
                dist[nx[0]] = cur[0] + nx[1];
                pq.add(new int[]{dist[nx[0]], nx[0]});
            }
        }
        System.out.println("Shortest 0->3: " + dist[3]);
    }
}`,
    },
    practiceProblems: [
      { title: 'Number of Islands / Connected Regions', difficulty: 'Medium', hint: 'BFS/DFS flood-fill visited grid cells.' },
      { title: 'Course Schedule Dependencies', difficulty: 'Medium', hint: 'Kahn topological sort with in-degree array.' },
    ],
  },
  {
    id: 'pat-oa-sheet',
    kind: 'solving',
    title: 'Company OA Speedrun Sheet',
    sheetTag: 'PATTERN 04 · AMAZON & SDE-1',
    edition: 'INTERVIEW VAULT · OA',
    subtitle: 'Monotonic stacks, intervals merging & greedy priority queues.',
    spotlightAuthor: 'KΛ Placement Desk',
    spotlightRole: 'Curated For 2026 Hiring',
    spotlightBio:
      'Targeted playbook built specifically to clear timed Amazon, Atlassian, and TCS CodeVita online assessments with zero edge-case penalties.',
    ctaLabel: 'Open Playbook',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    coverGradient: 'from-[#2a1509] via-[#170c06] to-[#08090d]',
    spineColor: 'bg-amber-400',
    accentColor: 'text-amber-300',
    badgeText: 'OA SHEET',
    whenToSpot: [
      'Next Greater Element, Stock Span, or Histogram Area -> Monotonic Stack.',
      'Overlapping intervals, meeting rooms -> Sort by start time + Min-Heap on end time.',
    ],
    pitfalls: [
      'Off-by-one equality on touching intervals ([1, 3] and [3, 5]).',
      'Forgetting empty array or single-element boundary checks.',
    ],
    templates: {
      python: `def merge_intervals(intervals):
    intervals.sort()
    res = []
    for s, e in intervals:
        if not res or s > res[-1][1]:
            res.append([s, e])
        else:
            res[-1][1] = max(res[-1][1], e)
    return res

print("Merged:", merge_intervals([[1,3],[2,6],[8,10],[15,18]]))`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> iv = {{1,3},{2,6},{8,10}};
    sort(iv.begin(), iv.end());
    vector<pair<int,int>> res;
    for (auto &p : iv) {
        if (res.empty() || p.first > res.back().second) res.push_back(p);
        else res.back().second = max(res.back().second, p.second);
    }
    cout << "Merged intervals count: " << res.size() << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[][] iv = {{1,3},{2,6},{8,10}};
        Arrays.sort(iv, Comparator.comparingInt(a -> a[0]));
        List<int[]> res = new ArrayList<>();
        for (int[] cur : iv) {
            if (res.isEmpty() || cur[0] > res.get(res.size() - 1)[1]) res.add(cur);
            else res.get(res.size() - 1)[1] = Math.max(res.get(res.size() - 1)[1], cur[1]);
        }
        System.out.println("Merged count: " + res.size());
    }
}`,
    },
    practiceProblems: [
      { title: 'Subarray Bitwise Parity Balance', difficulty: 'Medium', hint: 'Jump straight into Practice IDE!' },
      { title: 'Merge Overlapping Cloud Windows', difficulty: 'Medium', hint: 'Sort by start time then extend tail.' },
    ],
  },
];
