import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const PYTHON_PRO_SPEC: TrackSpec = {
  id: 'python-learning',
  language: 'python',
  track: 'learning',
  title: 'Python Core & AI Backend Pro Track',
  tagline: 'Collections/Heapq, Generators/Decorators, Typing, Asyncio, FastAPI & AI Pipelines',
  icon: '🐍',
  color: 'text-emerald-500 dark:text-emerald-400',
  badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  borderColor: 'border-emerald-400/30 hover:border-emerald-400/70',
  description:
    'Senior Python engineering mastery: stdlib power tools (`collections`, `heapq`, `bisect`), generators/decorators, strict typing, `asyncio`, FastAPI patterns, and AI/testing pipelines with 60 problems.',
  compilerLanguage: 'python',
  compilerDisplayName: 'Python 3',
  estimatedTotalHours: '20 Hours',
  prerequisites: ['Completion of Python Beginner Track or working Python fluency'],
  outcomes: [
    'Solve algorithmic problems fast with Counter, deque, heapq, and bisect',
    'Write zero-memory streaming generators and @wraps decorators',
    'Architect concurrent event loops with asyncio.gather and semaphores',
    'Build validated FastAPI-style routers, chunkers, and token-aware AI pipelines',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Stdlib Powerhouse: collections, heapq & bisect',
      topic: 'Counter, defaultdict, deque & Heaps',
      estimatedTime: '3 Hours',
      summary:
        'Eliminate custom boilerplate using `Counter`, `defaultdict`, O(1) `deque` queues, `bisect` binary search, and `heapq` priority queues.',
      studyMaterial: {
        overview:
          'Senior Python developers rarely re-implement counters, circular queues, or binary search manually—the standard library provides C-accelerated implementations in `collections`, `heapq`, `bisect`, and `itertools`.',
        keyPoints: [
          '`Counter(seq).most_common(k)` returns top-K frequent items cleanly in O(N log K).',
          '`heapq` implements a **Min-Heap** in-place on a Python list (`heappush`, `heappop`). Negate numbers `-x` for a Max-Heap!',
          '`deque(maxlen=k)` acts as a sliding ring buffer dropping old elements in O(1).',
          '`bisect.bisect_left(sorted_arr, x)` behaves just like C++ `lower_bound`.',
        ],
        codeExamples: [
          {
            title: 'Counter & heapq Top-K',
            code: `from collections import Counter
import heapq

nums = [4, 1, 4, 2, 4, 2, 9]
print(Counter(nums).most_common(2))
print(heapq.nlargest(2, nums))`,
            explanation: 'Both operations are optimized in C internally.',
          },
        ],
        cheatsheet: [
          'Counter(seq).most_common(k)',
          'heapq.heappush / heappop (Min-Heap; push -x for Max-Heap)',
          'deque(maxlen=N) -> ring buffer | popleft() -> O(1) BFS',
          'bisect_left(arr, x) / bisect_right(arr, x)',
        ],
        officialDocUrl: 'https://docs.python.org/3/library/collections.html',
      },
      video: yt(
        'Intermediate Python Programming Course — Collections & Itertools',
        'freeCodeCamp.org',
        'HGOBQPFzWKo',
        '5h 55m',
        'Master collections.Counter, defaultdict, deque, itertools, and memory efficiency.',
      ),
      compilerStarterCode: `from collections import Counter, deque
import heapq

print("Most common:", Counter("mississippi").most_common(2))
h = [5, 1, 9]; heapq.heapify(h)
print("Min pop:", heapq.heappop(h))`,
      practiceQuestions: [
        {
          id: 'pyp-1-1',
          title: 'Top-2 Frequent Tokens via Counter',
          difficulty: 'Easy',
          description: 'Find top 2 frequent words in `["py","js","py","go","py","js"]` and print `"py js"`',
          starterCode: `from collections import Counterword
s = ["py","js","py","go","py","js"]
# TODO`,
          expectedOutput: 'py js',
          hints: ['`" ".join(w for w, _ in Counter(words).most_common(2))`'],
        },
        {
          id: 'pyp-1-2',
          title: 'Max-Heap via Negated heapq',
          difficulty: 'Easy',
          description: 'Pop top 2 largest elements from `[3, 19, 7, 42, 11]` using negated `heapq` -> 42 19',
          starterCode: `import heapqnum
s = [3, 19, 7, 42, 11]
# TODO: heapify negated values and pop twice`,
          expectedOutput: '42 19',
          hints: ['Negate items before `heapify`, then negate back after `heappop`.'],
        },
        {
          id: 'pyp-1-3',
          title: 'Bounded Sliding Ring Queue (deque)',
          difficulty: 'Easy',
          description: 'Push `[10, 20, 30, 40, 50]` into `deque(maxlen=3)` and print `list(dq)` -> [30, 40, 50]',
          starterCode: `from collections import deque
# TODO: dq = deque(maxlen=3); extend with [10,20,30,40,50]`,
          expectedOutput: '[30, 40, 50]',
          hints: ['`deque(maxlen=k)` evicts oldest items automatically on append.'],
        },
        {
          id: 'pyp-1-4',
          title: 'O(log N) Frequency Count via bisect',
          difficulty: 'Medium',
          description: 'Count occurrences of `7` in sorted `[1, 3, 7, 7, 7, 9, 12]` using `bisect_left` and `bisect_right` -> 3',
          starterCode: `from bisect import bisect_left, bisect_right
a = [1, 3, 7, 7, 7, 9, 12]
# TODO`,
          expectedOutput: '3',
          hints: ['`bisect_right(a, 7) - bisect_left(a, 7)`'],
        },
        {
          id: 'pyp-1-5',
          title: 'Adjacency List Grouping With defaultdict',
          difficulty: 'Easy',
          description: 'Build undirected graph on edges `[(0,1),(0,2),(1,2)]` with `defaultdict(list)`, print sorted neighbors of `0` -> [1, 2]',
          starterCode: `from collections import defaultdictedge
s = [(0, 1), (0, 2), (1, 2)]
# TODO`,
          expectedOutput: '[1, 2]',
          hints: ['Add both `g[u].append(v)` and `g[v].append(u)`.'],
        },
        {
          id: 'pyp-1-6',
          title: 'ChainMap Config Override Lookup',
          difficulty: 'Easy',
          description: 'Layer `cli={"port": 9000}` over `defaults={"host":"0.0.0.0","port":8000}` via `ChainMap`. Print `host:port` -> 0.0.0.0:9000',
          starterCode: `from collections import ChainMapcl
i = {"port": 9000}
defaults = {"host": "0.0.0.0", "port": 8000}
# TODO`,
          expectedOutput: '0.0.0.0:9000',
          hints: ['`cfg = ChainMap(cli, defaults)` checks maps left-to-right.'],
        },
        {
          id: 'pyp-1-7',
          title: 'Merge K Sorted Streams With heapq.merge',
          difficulty: 'Easy',
          description: 'Stream-merge `[1, 5, 9]`, `[2, 6]`, `[3, 7]` using `heapq.merge` -> [1, 2, 3, 5, 6, 7, 9]',
          starterCode: `import heapq
a, b, 
c = [1, 5, 9], [2, 6], [3, 7]
# TODO: print(list(heapq.merge(a, b, c)))`,
          expectedOutput: '[1, 2, 3, 5, 6, 7, 9]',
          hints: ['`heapq.merge` lazily merges pre-sorted iterables in O(N log K).'],
        },
        {
          id: 'pyp-1-8',
          title: 'itertools.groupby Consecutive Run Encoder',
          difficulty: 'Medium',
          description: 'Run-length encode `"AAABBCCCC"` using `itertools.groupby` -> A3B2C4',
          starterCode: `from itertools import groupby
s = "AAABBCCCC"
# TODO`,
          expectedOutput: 'A3B2C4',
          hints: ['`"".join(f"{k}{len(list(g))}" for k, g in groupby(s))`'],
        },
        {
          id: 'pyp-1-9',
          title: 'itertools.combinations Pairwise Sum Check',
          difficulty: 'Easy',
          description: 'Count 2-element combinations from `[1, 2, 3, 4, 5]` summing to `>= 7` -> 4',
          starterCode: `from itertools import combinationsnum
s = [1, 2, 3, 4, 5]
# TODO`,
          expectedOutput: '4',
          hints: ['`sum(1 for a, b in combinations(nums, 2) if a + b >= 7)`'],
        },
        {
          id: 'pyp-1-10',
          title: 'OrderedDict O(1) LRU Cache Core',
          difficulty: 'Hard',
          description: 'Use `OrderedDict` (cap=2) to put `(1,10)`, `(2,20)`, touch `1` (`move_to_end`), put `(3,30)` evicting `2`. Print `2 in od, od[1]` -> False 10',
          starterCode: `from collections import OrderedDict
# TODO: Maintain cap=2 LRU with popitem(last=False) and move_to_end(key)`,
          expectedOutput: 'False 10',
          hints: ['`od.popitem(last=False)` evicts the least-recently-used head entry.'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'Decorators, Generators & Lazy Streaming',
      topic: 'yield, @wraps & Custom Iterators',
      estimatedTime: '2.5 Hours',
      summary:
        'Stream multi-gigabyte data in O(1) RAM using `yield` generators, preserve metadata with `@functools.wraps`, and compose reusable decorators.',
      studyMaterial: {
        overview:
          'A generator function produces items lazily one at a time via `yield` instead of materializing an entire list in memory. Decorators wrap functions cleanly—always annotate inner wrappers with `@functools.wraps(fn)` so docstrings and function names stay intact.',
        keyPoints: [
          'Generator expressions `(x*x for x in range(10**7))` allocate almost zero memory vs list `[...]` comprehensions.',
          '`yield from sub_gen` delegates smoothly to nested iterables.',
          'Always apply `@wraps(fn)` inside decorator definitions.',
        ],
        codeExamples: [
          {
            title: 'Metadata-Preserving Timing/Logging Decorator',
            code: `from functools import wraps
def trace(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        return f"[{fn.__name__}] -> {fn(*args, **kwargs)}"
    return wrapper

@trace
def greet(who): return f"Hi {who}"

print(greet("KΛ"))`,
            explanation: '`fn.__name__` remains `"greet"` instead of `"wrapper"` thanks to `@wraps`.',
          },
        ],
        cheatsheet: [
          'yield val -> pauses function frame lazily',
          'itertools.islice(gen, k) -> slice lazy streams safely',
          '@functools.wraps(fn) -> preserves __name__ & __doc__',
        ],
        officialDocUrl: 'https://docs.python.org/3/howto/functional.html',
      },
      video: yt(
        'Python Generators Deep Dive',
        'mCoding',
        'tmeKsb2Fras',
        '14m',
        'Crystal-clear explanation of generator frames, yield from, and lazy pipelines.',
      ),
      compilerStarterCode: `def fib_stream():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

from itertools import islice
print(list(islice(fib_stream(), 7)))`,
      practiceQuestions: [
        {
          id: 'pyp-2-1',
          title: 'Lazy Batch Chunk Generator',
          difficulty: 'Easy',
          description: 'Write generator `chunks(seq, n)` yielding fixed size slices (`n=2`) of `[1, 2, 3, 4, 5]` -> [[1, 2], [3, 4], [5]]',
          starterCode: `def chunks(seq, n):    # TODO: yield seq[i:i + n]
    pass

print(list(chunks([1, 2, 3, 4, 5], 2)))`,
          expectedOutput: '[[1, 2], [3, 4], [5]]',
          hints: ['`for i in range(0, len(seq), n): yield seq[i:i + n]`'],
        },
        {
          id: 'pyp-2-2',
          title: 'Uppercase Decorator Preserving __name__',
          difficulty: 'Easy',
          description: 'Write decorator `@shout` uppercasing string return value while keeping `greet.__name__ == "greet"`. Print `greet(), greet.__name__` -> HELLO greet',
          starterCode: `from functools import wraps
def shout(fn):
    # TODO
    pass

@shout
def greet(): return "hello"

print(greet(), greet.__name__)`,
          expectedOutput: 'HELLO greet',
          hints: ['Wrap inner function with `@wraps(fn)` and return `fn(*a, **kw).upper()`.'],
        },
        {
          id: 'pyp-2-3',
          title: 'Infinite Prime Stream + islice',
          difficulty: 'Medium',
          description: 'Yield primes lazily starting at 2 and pull first 6 via `itertools.islice` -> [2, 3, 5, 7, 11, 13]',
          starterCode: `from itertools import islice
def primes():
    # TODO: yield prime integers lazily
    pass

print(list(islice(primes(), 6)))`,
          expectedOutput: '[2, 3, 5, 7, 11, 13]',
          hints: ['Check divisors `2..int(n**0.5)` cleanly before `yield n`.'],
        },
        {
          id: 'pyp-2-4',
          title: 'Nested Stream Flattening With yield from',
          difficulty: 'Easy',
          description: 'Flatten `[[10, 20], (30, 40), [50]]` lazily using `yield from` -> [10, 20, 30, 40, 50]',
          starterCode: `def flatten(groups):    # TODO: for g in groups: yield from g
    pass

print(list(flatten([[10, 20], (30, 40), [50]])))`,
          expectedOutput: '[10, 20, 30, 40, 50]',
          hints: ['`yield from` delegates straight to each sub-iterable.'],
        },
        {
          id: 'pyp-2-5',
          title: 'Parameterized Retry Decorator',
          difficulty: 'Medium',
          description: 'Build `@retry(times=3)` decorator retrying ValueError failures. Succeed on 3rd attempt and print `DONE_AT_3`',
          starterCode: `from functools import wraps
def retry(times=3):
    # TODO: Return outer decorator wrapping fn
    pass

calls = 0
@retry(times=3)
def flaky():
    global calls
    calls += 1
    if calls < 3: raise ValueError("fail")
    return f"DONE_AT_{calls}"

print(flaky())`,
          expectedOutput: 'DONE_AT_3',
          hints: ['Parameterized decorators require 3 levels: `retry(times) -> decorator(fn) -> wrapper(*a, **kw)`.'],
        },
        {
          id: 'pyp-2-6',
          title: 'Sliding Window Lazy Generator',
          difficulty: 'Medium',
          description: 'Yield overlapping windows of size 3 over `[1, 2, 3, 4, 5]` -> [(1, 2, 3), (2, 3, 4), (3, 4, 5)]',
          starterCode: `def windows(seq, k):    # TODO: Yield tuples of size k
    pass

print(list(windows([1, 2, 3, 4, 5], 3)))`,
          expectedOutput: '[(1, 2, 3), (2, 3, 4), (3, 4, 5)]',
          hints: ['`for i in range(len(seq) - k + 1): yield tuple(seq[i:i+k])`'],
        },
        {
          id: 'pyp-2-7',
          title: 'Manual Generator Exhaustion Guard',
          difficulty: 'Easy',
          description: 'Consume `g = (x * 10 for x in [1, 2])` via `next(g, "END")` 3 times -> 10 20 END',
          starterCode: `g = (x * 10 for x in [1, 2])
# TODO: Print next(g, "END") three times`,
          expectedOutput: '10 20 END',
          hints: ['Two-argument `next(it, default)` avoids `StopIteration` exceptions cleanly!'],
        },
        {
          id: 'pyp-2-8',
          title: 'Lazy CSV Pipeline Filter',
          difficulty: 'Easy',
          description: 'Chain generator expressions over `["ada,95", "bob,40", "cal,88"]` keeping score >= 80 -> [\'ada\', \'cal\']',
          starterCode: `rows = ["ada,95", "bob,40", "cal,88"]
# TODO: Stream split & filter lazily`,
          expectedOutput: "['ada', 'cal']",
          hints: ['`parsed = (r.split(",") for r in rows); print([n for n, s in parsed if int(s) >= 80])`'],
        },
        {
          id: 'pyp-2-9',
          title: 'Call-Count Tracking Decorator',
          difficulty: 'Medium',
          description: 'Attach `.calls = 0` attribute on decorated `ping()` incrementing on every call. Invoke 3 times and print `ping.calls` -> 3',
          starterCode: `from functools import wraps
def count_calls(fn):
    # TODO
    pass

@count_calls
def ping(): return "pong"

ping(); ping(); ping()
print(ping.calls)`,
          expectedOutput: '3',
          hints: ['Set `wrapper.calls = 0` after defining `wrapper`, increment inside `wrapper`.'],
        },
        {
          id: 'pyp-2-10',
          title: 'itertools.accumulate Running Maximum',
          difficulty: 'Easy',
          description: 'Compute running prefix maximum over `[3, 1, 7, 4, 9, 2]` with `itertools.accumulate(..., max)` -> [3, 3, 7, 7, 9, 9]',
          starterCode: `from itertools import accumulatenum
s = [3, 1, 7, 4, 9, 2]
# TODO`,
          expectedOutput: '[3, 3, 7, 7, 9, 9]',
          hints: ['`list(accumulate(nums, max))`'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Type Hints, Protocols & Data Validation',
      topic: 'typing, TypedDict, Literal & Structural Typing',
      estimatedTime: '2.5 Hours',
      summary:
        'Catch bugs before runtime using modern Python 3.10+ union types (`int | None`), `Protocol` structural typing, `TypedDict`, and Pydantic-style validators.',
      studyMaterial: {
        overview:
          'Large Python backends fail when dictionaries pass undocumented shapes. Type hints + `Protocol` duck-typing give FastAPI & mypy static contracts without sacrificing Python expressiveness.',
        keyPoints: [
          '`Protocol` lets any class matching method signatures satisfy an interface without inheritance.',
          'Use `TypedDict` when modeling strict JSON payloads.',
          'Validate untrusted dict payloads cleanly in factory constructors (similar to Pydantic models).',
        ],
        codeExamples: [
          {
            title: 'Structural Protocol & Strict Validator',
            code: `from typing import Protocol
class Runnable(Protocol):
    def run(self) -> str: ...

class Job:
    def run(self) -> str: return "EXECUTED"

def dispatch(r: Runnable) -> str:
    return r.run()

print(dispatch(Job()))`,
            explanation: '`Job` never inherits `Runnable`, yet satisfies the `Protocol` structurally.',
          },
        ],
        cheatsheet: [
          'val: int | None -> union type',
          'class X(Protocol): ... -> duck-type contract',
          'Literal["FREE", "PRO"] -> constrained enum string',
        ],
        officialDocUrl: 'https://docs.python.org/3/library/typing.html',
      },
      video: yt(
        'Intermediate Python — Type Safety & Clean Contracts',
        'freeCodeCamp.org',
        'HGOBQPFzWKo',
        '5h 55m',
        'Apply static annotations cleanly across data models and service helpers.',
      ),
      compilerStarterCode: `from typing import TypedDict
class User(TypedDict):
    handle: str
    elo: int

u: User = {
"handle": "Velith", "elo": 1620}
print(u["handle"], u["elo"])`,
      practiceQuestions: [
        {
          id: 'pyp-3-1',
          title: 'Strict Payload Validator Schema',
          difficulty: 'Medium',
          description: 'Validate dict `{"email": "a@b.in", "age": 19}` ensuring `"@" in email` and `age >= 18`; raise `ValueError` otherwise -> VALID 19',
          starterCode: `def parse_signup(raw: dict) -> str:    # TODO: Validate email & age >= 18
    pass

print(parse_signup({"email": "a@b.in", "age": 19}))`,
          expectedOutput: 'VALID 19',
          hints: ['Raise `ValueError` on invalid input, return `f"VALID {raw[\'age\']}"`.'],
        },
        {
          id: 'pyp-3-2',
          title: 'Structural Protocol Duck Dispatch',
          difficulty: 'Easy',
          description: 'Define `Serializable(Protocol)` with `to_dict(self) -> dict`. Create non-inheriting `Token` returning `{"tier": "PRO"}` -> PRO',
          starterCode: `from typing import Protocol
# TODO: Serializable Protocol + Token class`,
          expectedOutput: 'PRO',
          hints: ['Pass `Token()` into `def dump(obj: Serializable): return obj.to_dict()["tier"]`.'],
        },
        {
          id: 'pyp-3-3',
          title: 'TypeVar Generic First Element',
          difficulty: 'Easy',
          description: 'Write generic `def first(items: list[T], fallback: T) -> T:` returning `fallback` when empty. Test `[10, 20]` and `[]` (`"N/A"`) -> 10 N/A',
          starterCode: `from typing import TypeVar
T = TypeVar("T")

def first(items: list[T], fallback: T) -> T:
    # TODO
    pass

print(first([10, 20], 0), first([], "N/A"))`,
          expectedOutput: '10 N/A',
          hints: ['`return items[0] if items else fallback`'],
        },
        {
          id: 'pyp-3-4',
          title: 'TypedDict Field Coercion',
          difficulty: 'Easy',
          description: 'Create `Metric(TypedDict)` with `name: str` and `ms: float`. Print formatted `"db:12.5ms"`',
          starterCode: `from typing import TypedDict
# TODO: Define Metric TypedDict & print formatted entry`,
          expectedOutput: 'db:12.5ms',
          hints: ['`m: Metric = {"name": "db", "ms": 12.5}`'],
        },
        {
          id: 'pyp-3-5',
          title: 'Enum Choice Enforcement',
          difficulty: 'Easy',
          description: 'Create `Plan(str, Enum)` with `FREE = "free"`, `PASS = "pass"`. Parse `"pass"` into `Plan("pass")` and verify equality `== Plan.PASS` -> True',
          starterCode: `from enum import Enum
# TODO`,
          expectedOutput: 'True',
          hints: ['Inherit `(str, Enum)` so Enum values compare equal to strings smoothly.'],
        },
        {
          id: 'pyp-3-6',
          title: 'Optional / None Union Narrowing',
          difficulty: 'Easy',
          description: 'Implement `safe_upper(val: str | None) -> str` returning `"EMPTY"` if None/blank -> KA EMPTY',
          starterCode: `def safe_upper(val: str | None) -> str:    # TODO
    pass

print(safe_upper("ka"), safe_upper(None))`,
          expectedOutput: 'KA EMPTY',
          hints: ['Check `if not val:` before calling `.upper()`.'],
        },
        {
          id: 'pyp-3-7',
          title: 'Single-Dispatch Polymorphic Serializer',
          difficulty: 'Medium',
          description: 'Use `@functools.singledispatch` formatting `int -> #42` and `list -> [2 items]` -> #42 [2 items]',
          starterCode: `from functools import singledispatch
@singledispatch
def serialize(x):
    return str(x)

# TODO: Register int and list handlers
print(serialize(42), serialize(["a", "b"]))`,
          expectedOutput: '#42 [2 items]',
          hints: ['`@serialize.register` with typed parameter registers overload by runtime type!'],
        },
        {
          id: 'pyp-3-8',
          title: 'Clamp Dataclass __post_init__ Normalization',
          difficulty: 'Medium',
          description: 'Use `__post_init__` in `@dataclass Score(val: int)` to clamp `val` inside `[0..100]`. Print `Score(140).val` and `Score(-5).val` -> 100 0',
          starterCode: `from dataclasses import dataclass
@dataclass
class Score:
    val: int
    # TODO: __post_init__ clamping val into [0..100]

print(Score(140).val, Score(-5).val)`,
          expectedOutput: '100 0',
          hints: ['`self.val = max(0, min(100, self.val))` inside `__post_init__`.'],
        },
        {
          id: 'pyp-3-9',
          title: 'Strict Key Allowlist Sanitizer',
          difficulty: 'Easy',
          description: 'Drop keys outside `{"name", "role"}` from `{"name": "Ada", "admin": True, "role": "dev"}` -> dev',
          starterCode: `raw = {"name": "Ada", "admin": True, "role": "dev"}
allowed = {"name", "role"}
# TODO: Filter clean dict ensuring "admin" is dropped and print clean["role"]`,
          expectedOutput: 'dev',
          hints: ['`clean = {k: v for k, v in raw.items() if k in allowed}`'],
        },
        {
          id: 'pyp-3-10',
          title: 'Immutable Config Namespace MappingProxyType',
          difficulty: 'Medium',
          description: 'Wrap `{"rate": 60}` in `types.MappingProxyType`, verify mutation raises `TypeError` and print `"READONLY 60"`',
          starterCode: `from types import MappingProxyTypecf
g = MappingProxyType({"rate": 60})
# TODO: Try cfg["rate"] = 90 inside try/except TypeError`,
          expectedOutput: 'READONLY 60',
          hints: ['`MappingProxyType` wraps dicts in a zero-copy read-only view.'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Asyncio Event Loop & Concurrency',
      topic: 'async/await, gather, Semaphore & Timeouts',
      estimatedTime: '2.5 Hours',
      summary:
        'Scale I/O-bound workloads concurrently on a single thread using `async def`, `asyncio.gather`, `asyncio.Semaphore`, and `asyncio.wait_for`.',
      studyMaterial: {
        overview:
          'Unlike multithreading, `asyncio` runs cooperative multitasking on one thread: `await` yields control back to the event loop while waiting on sockets, databases, or LLM API calls.',
        keyPoints: [
          'NEVER call blocking `time.sleep(...)` inside `async def`—use `await asyncio.sleep(...)` so other tasks advance.',
          '`await asyncio.gather(*coros)` executes independent coroutines concurrently and collects ordered results.',
          'Bound API fan-out concurrency cleanly with `async with asyncio.Semaphore(limit):`.',
        ],
        codeExamples: [
          {
            title: 'Concurrent gather & Semaphore Bound',
            code: `import asyncio
async def fetch(n):
    await asyncio.sleep(0.01)
    return n * 2

async def main():
    res = await asyncio.gather(fetch(1), fetch(2), fetch(3))
    print(res)

asyncio.run(main())`,
            explanation: 'All three tasks execute concurrently in ~0.01s total.',
          },
        ],
        cheatsheet: [
          'asyncio.run(main()) -> boots event loop',
          'asyncio.gather(c1, c2) -> concurrent fan-out',
          'asyncio.wait_for(coro, timeout=...) -> protects hanging I/O',
        ],
        officialDocUrl: 'https://docs.python.org/3/library/asyncio.html',
      },
      video: yt(
        'Python Asynchronous Programming — AsyncIO & Async/Await',
        'Tech With Tim',
        't5Bo1Je9EmE',
        '27m',
        'Visual timeline comparing sequential waits vs concurrent event loop tasks.',
      ),
      compilerStarterCode: `import asyncio
async def ping(i):
    await asyncio.sleep(0.005)
    return i * 10

async def main():
    print(await asyncio.gather(ping(1), ping(2), ping(3)))

asyncio.run(main())`,
      practiceQuestions: [
        {
          id: 'pyp-4-1',
          title: 'Concurrent Sum via asyncio.gather',
          difficulty: 'Easy',
          description: 'Run 3 `async def work(x)` coroutines returning `x*x` for `[2, 3, 4]` via `asyncio.gather` and print sum -> 29',
          starterCode: `import asyncio
async def work(x):
    await asyncio.sleep(0.001)
    return x * x

async def main():
    # TODO: Use asyncio.gather and print sum
    pass

asyncio.run(main())`,
          expectedOutput: '29',
          hints: ['`vals = await asyncio.gather(*(work(i) for i in [2, 3, 4]))`'],
        },
        {
          id: 'pyp-4-2',
          title: 'Timeout Protection With asyncio.wait_for',
          difficulty: 'Medium',
          description: 'Run slow task sleeping 0.5s under `wait_for(..., timeout=0.01)`, catch `asyncio.TimeoutError` and print `TIMED_OUT`',
          starterCode: `import asyncio
async def slow():
    await asyncio.sleep(0.5)
    return "OK"

async def main():
    # TODO: Wrap with asyncio.wait_for and catch TimeoutError
    pass

asyncio.run(main())`,
          expectedOutput: 'TIMED_OUT',
          hints: ['Always handle `asyncio.TimeoutError` (or `TimeoutError`) around slow external requests.'],
        },
        {
          id: 'pyp-4-3',
          title: 'Bounded Fan-Out Using Semaphore',
          difficulty: 'Medium',
          description: 'Run 5 tasks behind `asyncio.Semaphore(2)`, track max concurrent active count, verify peak never exceeds 2 -> 2',
          starterCode: `import asyncio
async def main():
    sem = asyncio.Semaphore(2)
    active, peak = 0, 0
    # TODO: Launch 5 tasks acquiring sem, increment active, update peak, sleep 0.01, decrement
    pass

asyncio.run(main())`,
          expectedOutput: '2',
          hints: ['Track `active += 1; peak = max(peak, active)` inside `async with sem:`.'],
        },
        {
          id: 'pyp-4-4',
          title: 'Async Queue Producer & Consumer',
          difficulty: 'Medium',
          description: 'Push `[10, 20, 30]` plus sentinel `None` into `asyncio.Queue()`, sum consumed values -> 60',
          starterCode: `import asyncio
async def main():
    q = asyncio.Queue()
    # TODO: Producer puts items + None, consumer loops until None
    pass

asyncio.run(main())`,
          expectedOutput: '60',
          hints: ['Use `await q.put(...)` and `val = await q.get()`.'],
        },
        {
          id: 'pyp-4-5',
          title: 'Return Exceptions in gather',
          difficulty: 'Medium',
          description: 'Gather `[ok(), fail()]` with `return_exceptions=True`, count non-exception strings -> 1',
          starterCode: `import asyncio
async def ok(): return "PASS"
async def fail(): raise RuntimeError("boom")

async def main():
    # TODO: await asyncio.gather(ok(), fail(), return_exceptions=True)
    pass

asyncio.run(main())`,
          expectedOutput: '1',
          hints: ['Filter with `isinstance(r, str)` instead of letting one failure cancel the batch.'],
        },
        {
          id: 'pyp-4-6',
          title: 'Async Generator Stream',
          difficulty: 'Easy',
          description: 'Build `async def stream(n):` yielding `1..3` with `await asyncio.sleep(0.001)`, collect via `async for` -> [1, 2, 3]',
          starterCode: `import asyncio
# TODO: async def stream(n)
async def main():
    # TODO: Collect with async for and print
    pass

asyncio.run(main())`,
          expectedOutput: '[1, 2, 3]',
          hints: ['`out = [x async for x in stream(3)]` works cleanly inside async functions!'],
        },
        {
          id: 'pyp-4-7',
          title: 'Background Task Cancellation',
          difficulty: 'Medium',
          description: 'Start infinite async task via `create_task`, sleep 0.005s, call `task.cancel()`, catch `CancelledError` -> CANCELLED',
          starterCode: `import asyncio
async def heartbeat():
    try:
        while True: await asyncio.sleep(0.01)
    except asyncio.CancelledError:
        return "CANCELLED"

async def main():
    # TODO: Create task, sleep briefly, cancel(), and await result
    pass

asyncio.run(main())`,
          expectedOutput: 'CANCELLED',
          hints: ['`t = asyncio.create_task(heartbeat()); await asyncio.sleep(0.005); t.cancel(); print(await t)`'],
        },
        {
          id: 'pyp-4-8',
          title: 'First Completed Race With asyncio.wait',
          difficulty: 'Medium',
          description: 'Start two tasks sleeping `0.002s` (`"FAST"`) and `0.05s` (`"SLOW"`), use `FIRST_COMPLETED` to print winner & cancel remaining -> FAST',
          starterCode: `import asyncio
async def job(name, delay):
    await asyncio.sleep(delay)
    return name

async def main():
    # TODO: asyncio.wait(..., return_when=asyncio.FIRST_COMPLETED)
    pass

asyncio.run(main())`,
          expectedOutput: 'FAST',
          hints: ['Wrap coroutines in `asyncio.create_task(...)` before passing to `asyncio.wait`. Cancel pending tasks cleanly!'],
        },
        {
          id: 'pyp-4-9',
          title: 'Async Event Gate Signal',
          difficulty: 'Easy',
          description: 'Wait on `ev = asyncio.Event()` in worker; trigger `ev.set()` from coordinator -> RELEASED',
          starterCode: `import asyncio
async def main():
    ev = asyncio.Event()
    async def worker():
        await ev.wait()
        return "RELEASED"
    # TODO: Launch worker, sleep 0.005, call ev.set(), print await task
    pass

asyncio.run(main())`,
          expectedOutput: 'RELEASED',
          hints: ['`t = asyncio.create_task(worker()); await asyncio.sleep(0.002); ev.set(); print(await t)`'],
        },
        {
          id: 'pyp-4-10',
          title: 'CPU-Bound Offload via asyncio.to_thread',
          difficulty: 'Easy',
          description: 'Run synchronous `sum(range(101))` off the event loop via `await asyncio.to_thread(...)` -> 5050',
          starterCode: `import asyncio
def heavy_sum(n): return sum(range(n + 1))

async def main():
    # TODO
    pass

asyncio.run(main())`,
          expectedOutput: '5050',
          hints: ['`print(await asyncio.to_thread(heavy_sum, 100))`'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'FastAPI Patterns, Routing & Persistence Logic',
      topic: 'REST Validation, Middleware, Pooling & Auth',
      estimatedTime: '3 Hours',
      summary:
        'Implement the core engine mechanics behind FastAPI & Starlette backends in pure Python: path param routing, dependency injection, JWT-style HMAC signatures, and query builders.',
      studyMaterial: {
        overview:
          'FastAPI feels magical because it combines Pydantic validation, dependency injection (`Depends`), and ASGI async routing. Understanding how route dispatch, HMAC token signing, and SQL parameterization work under the hood makes you bulletproof in backend interviews.',
        keyPoints: [
          'NEVER interpolate user strings directly into SQL (`f"WHERE id={uid}"`)—always pass separate `(sql, params)` tuple placeholders (`%s` or `$1`).',
          'Compute HMAC-SHA256 signatures and verify with `hmac.compare_digest` to defeat timing attacks.',
          'Middleware wraps downstream handlers (`before -> next() -> after`).',
        ],
        codeExamples: [
          {
            title: 'Timing-Safe HMAC Signature Verification',
            code: `import hmac, hashlib
secret = b"kollabrix-secret"
msg = b"user:101"
sig = hmac.new(secret, msg, hashlib.sha256).hexdigest()
print(hmac.compare_digest(sig, hmac.new(secret, msg, hashlib.sha256).hexdigest()))`,
            explanation: 'Prevents side-channel timing leaks during API token validation.',
          },
        ],
        cheatsheet: [
          'hmac.compare_digest(a, b) -> constant-time check',
          '(sql, params) -> parameterized SQL prevents injection',
          'HTTP 401 Unauthenticated vs 403 Forbidden vs 422 Validation Error',
        ],
        officialDocUrl: 'https://fastapi.tiangolo.com/',
      },
      video: yt(
        'FastAPI Full Course — Python Backend Engineering',
        'Sarthaksavvy',
        '7t2alSnE2-I',
        '3h 10m',
        'Covers routing, Pydantic request models, dependency injection, status codes, and SQL integration.',
      ),
      compilerStarterCode: `import hmac, hashlibtoke
n = hmac.new(b"key", b"payload", hashlib.sha256).hexdigest()
print(len(token))`,
      practiceQuestions: [
        {
          id: 'pyp-5-1',
          title: 'Route Template Parameter Matcher',
          difficulty: 'Medium',
          description: 'Match path `"/users/42/posts/9"` against route `"/users/{uid}/posts/{pid}"` and extract sorted dict -> uid=42 pid=9',
          starterCode: `def match_route(pattern: str, path: str) -> dict | None:    # TODO: Split on '/' and capture {param} segments
    pass

res = match_route("/users/{uid}/posts/{pid}", "/users/42/posts/9")
print(f"pid={res['pid']} uid={res['uid']}" if False else f"uid={res['uid']} pid={res['pid']}")`,
          expectedOutput: 'uid=42 pid=9',
          hints: ['Zip segments of `pattern.strip("/").split("/")` and `path.strip("/").split("/")`.'],
        },
        {
          id: 'pyp-5-2',
          title: 'Timing-Safe API Key HMAC Verifier',
          difficulty: 'Easy',
          description: 'Sign `"uid=7"` with `b"secret"` using SHA-256 HMAC and verify via `hmac.compare_digest` -> True',
          starterCode: `import hmac, hashlib
# TODO: Sign and verify`,
          expectedOutput: 'True',
          hints: ['`sig = hmac.new(b"secret", b"uid=7", hashlib.sha256).hexdigest()`'],
        },
        {
          id: 'pyp-5-3',
          title: 'Parameterized SQL Filter Builder (Injection Safe)',
          difficulty: 'Medium',
          description: 'Given filters `{"role": "pro", "active": True}` (sorted keys), build parameterized SQL `"SELECT * FROM users WHERE active = %s AND role = %s"` and params `[True, \'pro\']`. Print both.',
          starterCode: `def build_query(table: str, filters: dict):    # TODO: Build parameterized WHERE clauses without formatting values inline
    pass

sql, params = build_query("users", {"role": "pro", "active": True})
print(sql)
print(params)`,
          expectedOutput: "SELECT * FROM users WHERE active = %s AND role = %s\n[True, 'pro']",
          hints: ['Iterate `sorted(filters.keys())`, emit `f"{k} = %s"`, collect values into `params`.'],
        },
        {
          id: 'pyp-5-4',
          title: 'Request Middleware Timing Chain',
          difficulty: 'Easy',
          description: 'Compose auth middleware + logging around handler returning `200:OK` -> AUTH->OK<-LOG',
          starterCode: `def handler(req): return "OK"
# TODO: Wrap handler with logging and auth checks returning "AUTH->OK<-LOG"`,
          expectedOutput: 'AUTH->OK<-LOG',
          hints: ['Auth verifies `req.get("auth")` and returns `"AUTH->" + next_fn(req)`.'],
        },
        {
          id: 'pyp-5-5',
          title: 'Offset & Limit Pagination Envelope',
          difficulty: 'Easy',
          description: 'Slice `items = [1, 2, 3, 4, 5, 6, 7]` for `page=2, size=3`. Print `[4, 5, 6] hasNext=True`',
          starterCode: `items = [1, 2, 3, 4, 5, 6, 7]
page, size = 2, 3
# TODO`,
          expectedOutput: '[4, 5, 6] hasNext=True',
          hints: ['`start = (page - 1) * size; hasNext = start + size < len(items)`'],
        },
        {
          id: 'pyp-5-6',
          title: 'Dependency Override Container',
          difficulty: 'Easy',
          description: 'Store `deps = {"db": lambda: "PG_PROD"}`, override `"db"` with `lambda: "PG_TEST"`, resolve -> PG_TEST',
          starterCode: `deps = {"db": lambda: "PG_PROD"}
# TODO: Override and call deps["db"]()`,
          expectedOutput: 'PG_TEST',
          hints: ['Same pattern as FastAPI `app.dependency_overrides[get_db] = fake_db`!'],
        },
        {
          id: 'pyp-5-7',
          title: 'Query String Parser Multi-Param',
          difficulty: 'Easy',
          description: 'Parse `"track=python&level=pro&tag=ai&tag=api"` using `urllib.parse.parse_qs` and print sorted `tag` list -> [\'ai\', \'api\']',
          starterCode: `from urllib.parse import parse_qsq
s = "track=python&level=pro&tag=ai&tag=api"
# TODO`,
          expectedOutput: "['ai', 'api']",
          hints: ['`parse_qs(qs)["tag"]` automatically collects repeated keys into lists.'],
        },
        {
          id: 'pyp-5-8',
          title: 'ETag Content Hash Cache Validator',
          difficulty: 'Easy',
          description: 'Generate 8-char SHA-256 ETag for `b"hello-world"`, check match against client `If-None-Match` -> 304',
          starterCode: `import hashlibbod
y = b"hello-world"
# TODO: Compute sha256(body).hexdigest()[:8]; compare against matching etag and print 304`,
          expectedOutput: '304',
          hints: ['If client ETag matches current hash, return HTTP `304 Not Modified`!'],
        },
        {
          id: 'pyp-5-9',
          title: 'Strict JSON Error Envelope Builder',
          difficulty: 'Easy',
          description: 'Format RFC-style error `{"code":422,"error":"INVALID_EMAIL"}` sorted -> {"code":422,"error":"INVALID_EMAIL"}',
          starterCode: `import json
# TODO`,
          expectedOutput: '{"code":422,"error":"INVALID_EMAIL"}',
          hints: ['`json.dumps({"code": 422, "error": "INVALID_EMAIL"}, sort_keys=True, separators=(",", ":"))`'],
        },
        {
          id: 'pyp-5-10',
          title: 'Circuit Breaker Fallback Wrapper',
          difficulty: 'Medium',
          description: 'After 2 downstream errors, trip breaker to open and short-circuit 3rd call without invoking downstream (total invocations must equal 2) -> calls=2 out=FALLBACK',
          starterCode: `invocations = 0
def downstream():
    global invocations
    invocations += 1
    raise ConnectionError("down")

# TODO: Call wrapper 3 times tripping at 2 failures, returning "FALLBACK" when open`,
          expectedOutput: 'calls=2 out=FALLBACK',
          hints: ['Once `failures >= 2`, skip `downstream()` and return `"FALLBACK"` immediately.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'Pytest Patterns, Vector Cosine & AI Pipelines',
      topic: 'Unit Testing, RAG Chunking & Cosine Similarity',
      estimatedTime: '2.5 Hours',
      summary:
        'Write deterministic test assertions, compute vector cosine similarity for embeddings without external packages, overlap-chunk text for RAG, and count streaming LLM tokens.',
      studyMaterial: {
        overview:
          'Modern Python AI engineering runs on text chunking with overlap, vector similarity scoring, structured JSON extraction from LLM output, and `unittest` / `pytest`-style parameterized assertions.',
        keyPoints: [
          'Always slice RAG documents with **overlapping windows** so facts straddling chunk boundaries aren’t severed.',
          'Cosine similarity `(A · B) / (||A|| * ||B||)` measures directional alignment between embedding vectors cleanly.',
          'Parse LLM JSON replies defensively by stripping optional ```json markdown fences before `json.loads`.',
        ],
        codeExamples: [
          {
            title: 'Cosine Similarity & Defensive LLM JSON Parse',
            code: `import math
def cos_sim(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

print(f"{cos_sim([1, 2, 0], [2, 4, 0]):.2f}")`,
            explanation: 'Parallel vectors return `1.00` identically even with different magnitudes.',
          },
        ],
        cheatsheet: [
          'Cosine Similarity = dot(a,b) / (norm(a)*norm(b))',
          'Overlap chunks: step = size - overlap',
          'Strip ```json fences safely before json.loads',
        ],
        officialDocUrl: 'https://docs.python.org/3/library/unittest.html',
      },
      video: yt(
        'Python Engineering & Structured Testing Course',
        'Programming with Mosh',
        '_uQrJ0TkZlc',
        '6h 14m',
        'Apply modular assertions, math normalization, and clean text pipelines.',
      ),
      compilerStarterCode: `import math
a, b = [3, 4], [6, 8]
dot = sum(x * y for x, y in zip(a, b))
sim = dot / (math.hypot(*a) * math.hypot(*b))
print(f"Cosine: {sim:.2f}")`,
      practiceQuestions: [
        {
          id: 'pyp-6-1',
          title: 'Vector Cosine Similarity Scorer',
          difficulty: 'Easy',
          description: 'Compute cosine similarity between `[1, 0, 1]` and `[0, 1, 1]` to 2 decimal places -> 0.50',
          starterCode: `import math
a, b = [1, 0, 1], [0, 1, 1]
# TODO`,
          expectedOutput: '0.50',
          hints: ['Dot = 1, ||a|| = sqrt(2), ||b|| = sqrt(2) -> 1 / 2 = 0.50.'],
        },
        {
          id: 'pyp-6-2',
          title: 'RAG Overlapping Text Chunker',
          difficulty: 'Medium',
          description: 'Split `"ABCDEFGH"` into size-4 chunks with overlap-2 (`step=2`) stopping cleanly -> [\'ABCD\', \'CDEF\', \'EFGH\']',
          starterCode: `text = "ABCDEFGH"
size, overlap = 4, 2
# TODO: Chunk cleanly with step = size - overlap`,
          expectedOutput: "['ABCD', 'CDEF', 'EFGH']",
          hints: ['Stop advancing once `i + size >= len(text)`.'],
        },
        {
          id: 'pyp-6-3',
          title: 'Strip Markdown Fences From LLM JSON',
          difficulty: 'Easy',
          description: 'Extract JSON from `"```json\\n{\\"score\\": 98}\\n```"` cleanly and print `score` -> 98',
          starterCode: `import json, re
raw = "\`\`\`json\\n{\\"score\\": 98}\\n\`\`\`"
# TODO: Remove fences or match {...} and json.loads`,
          expectedOutput: '98',
          hints: ['`re.search(r"\\{.*\\}", raw, re.S).group(0)` extracts the JSON object directly!'],
        },
        {
          id: 'pyp-6-4',
          title: 'Softmax Probability Normalization',
          difficulty: 'Medium',
          description: 'Compute numerically stable softmax (`x - max(x)`) on logits `[2.0, 1.0, 0.1]` and print top probability `.2f` -> 0.59',
          starterCode: `import math
logits = [2.0, 1.0, 0.1]
# TODO: Subtract max(logits), exponentiate, divide by sum`,
          expectedOutput: '0.59',
          hints: ['Subtracting `max(logits)` prevents `math.exp()` overflow on huge logits.'],
        },
        {
          id: 'pyp-6-5',
          title: 'Jaccard Similarity Keyword Matcher',
          difficulty: 'Easy',
          description: 'Compute Jaccard index `|A ∩ B| / |A ∪ B|` for `{"ai","python","rag"}` and `{"rag","java","python"}` formatted `.2f` -> 0.50',
          starterCode: `a = {"ai", "python", "rag"}
b = {"rag", "java", "python"}
# TODO`,
          expectedOutput: '0.50',
          hints: ['2 shared / 4 total union = 0.50.'],
        },
        {
          id: 'pyp-6-6',
          title: 'Parameterized Unittest Suite',
          difficulty: 'Easy',
          description: 'Assert `is_even` across `[(2, True), (3, False), (0, True)]`; print `3/3 PASS`',
          starterCode: `def is_even(n): return n % 2 == 0
cases = [(2, True), (3, False), (0, True)]
# TODO: Verify every pair with assert and print f"{len(cases)}/{len(cases)} PASS"`,
          expectedOutput: '3/3 PASS',
          hints: ['Loop `(inp, exp)` checking `assert is_even(inp) == exp`.'],
        },
        {
          id: 'pyp-6-7',
          title: 'Simple Mock Monkeypatch Test',
          difficulty: 'Easy',
          description: 'Create class `Client` with `fetch()` returning `"LIVE"`. Swap method with stub returning `"MOCK"` during call and print result -> MOCK',
          starterCode: `class Client:
    def fetch(self): return "LIVE"

c = Client()
# TODO: Override fetch on instance or subclass and call c.fetch()`,
          expectedOutput: 'MOCK',
          hints: ['`c.fetch = lambda: "MOCK"` works cleanly on Python instances!'],
        },
        {
          id: 'pyp-6-8',
          title: 'Top-P Nucleus Token Selector',
          difficulty: 'Medium',
          description: 'Given sorted probs `[("yes", 0.6), ("maybe", 0.25), ("no", 0.15)]` and `p = 0.8`, pick smallest prefix with cumulative sum `>= 0.8` -> yes maybe',
          starterCode: `probs = [("yes", 0.6), ("maybe", 0.25), ("no", 0.15)]
p = 0.8
# TODO`,
          expectedOutput: 'yes maybe',
          hints: ['Stop right after cumulative probability reaches or exceeds `p`.'],
        },
        {
          id: 'pyp-6-9',
          title: 'Token Budget Prompt Trimmer',
          difficulty: 'Easy',
          description: 'Keep most recent messages fitting within `budget=7` tokens where each word counts as 1 token: `["hi there", "how are you", "fix bug now"]` -> how are you | fix bug now',
          starterCode: `msgs = ["hi there", "how are you", "fix bug now"]
budget = 7
# TODO: Walk backwards keeping messages while used + wordCount <= budget, preserve chronological order`,
          expectedOutput: 'how are you | fix bug now',
          hints: ['Reverse scan takes `"fix bug now"` (3) + `"how are you"` (3) = 6; `"hi there"` (+2 = 8 > 7) is trimmed cleanly.'],
        },
        {
          id: 'pyp-6-10',
          title: 'Exponential Moving Average Tracker',
          difficulty: 'Easy',
          description: 'Compute EMA on `[10, 20, 30]` starting `ema = 10` with `alpha = 0.5` (`ema = alpha*x + (1-alpha)*ema`), print final `.1f` -> 22.5',
          starterCode: `vals = [10, 20, 30]
alpha = 0.5
# TODO`,
          expectedOutput: '22.5',
          hints: ['Start ema=10 -> after 20: 15 -> after 30: 0.5*30 + 0.5*15 = 22.5.'],
        },
      ],
    },
  ],
};
