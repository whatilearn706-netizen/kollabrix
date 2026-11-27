import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const PYTHON_BEGINNER_SPEC: TrackSpec = {
  id: 'python-beginner',
  language: 'python',
  track: 'beginner',
  title: 'Python Complete Beginner Track',
  tagline: 'Zero to OOP: Syntax, Comprehensions, Dicts, Functions, Strings, JSON/Files & Classes',
  icon: '🐍',
  color: 'text-emerald-500 dark:text-emerald-400',
  badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  borderColor: 'border-emerald-400/30 hover:border-emerald-400/70',
  description:
    'Complete beginner-to-confident Python 3 track from f-strings and comprehensions to recursion, regex/files, and Pythonic OOP with 70 hands-on coding exercises.',
  compilerLanguage: 'python',
  compilerDisplayName: 'Python 3',
  estimatedTotalHours: '18 Hours',
  prerequisites: ['None — designed for first-time Python programmers'],
  outcomes: [
    'Write clean PEP-8 Python with f-strings, slicing, and unpacking',
    'Master lists, tuples, sets, dictionaries, and comprehensions',
    'Build reusable functions (*args, **kwargs), recursion, and JSON parsers',
    'Design maintainable classes with dunder methods and @dataclass',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Interpreter, Variables, f-Strings & Math',
      topic: 'Dynamic Typing, Operators & Formatting',
      estimatedTime: '2 Hours',
      summary:
        'Master Python 3’s dynamic object model, arbitrary-precision integers, floor division `//`, and expressive `f"{var:.2f}"` formatting.',
      studyMaterial: {
        overview:
          'Python integers have **arbitrary precision** (they never overflow 32 or 64 bits!). Focus early on the difference between true division (`/` returns float) and floor division (`//` rounds toward negative infinity).',
        keyPoints: [
          '`7 / 2` evaluates to `3.5`, while `7 // 2` evaluates to `3` and `-7 // 2` evaluates to `-4`.',
          'Power operator `**` computes huge powers natively: `pow(base, exp, mod)` runs modular exponentiation in O(log exp).',
          'Swap variables cleanly with tuple unpacking: `a, b = b, a`.',
          'f-strings (`f"{x:.2f}"`, `f"{n:04d}"`) are both the fastest and clearest formatter.',
        ],
        codeExamples: [
          {
            title: 'Tuple Unpacking & f-String Formatting',
            code: `name = "KΛ Python"
acc = 91 / 120 * 100
a, b = 10, 25
a, b = b, a
print(f"{name} | {acc:.2f}% | swapped={a},{b}")`,
            explanation: 'Clean decimal rounding and single-line tuple swap without temporary variables.',
          },
        ],
        cheatsheet: [
          '/ -> float division | // -> floor division | ** -> power',
          'a, b = b, a -> Pythonic swap',
          'f"{val:.2f}" -> 2 decimal places',
        ],
        officialDocUrl: 'https://docs.python.org/3/tutorial/introduction.html',
      },
      video: yt(
        'Python Full Course for Beginners — Basics & Formatting',
        'Programming with Mosh',
        '_uQrJ0TkZlc',
        '6h 14m',
        'Watch Python setup, variables, strings, formatted output, and math operators.',
      ),
      compilerStarterCode: `lang = "Python"
version = 3.12
print(f"{lang} {version:.1f} Ready -> {2 ** 10}")`,
      practiceQuestions: [
        {
          id: 'pyb-1-1',
          title: 'Formatted Student Metric Banner',
          difficulty: 'Easy',
          description: 'Print two exact lines:\nTrack: Python 3\nRatio: 87.50%',
          starterCode: `solved, total = 7, 8
# TODO: Print Track line and Ratio line formatted to 2 decimals`,
          expectedOutput: 'Track: Python 3\nRatio: 87.50%',
          hints: ['Use `f"Ratio: {solved / total * 100:.2f}%"`.'],
        },
        {
          id: 'pyb-1-2',
          title: 'Pythonic Three-Way Circular Rotate',
          difficulty: 'Easy',
          description: 'Rotate `a=1, b=2, c=3` so `a->b, b->c, c->a` using one tuple assignment, print `a b c` -> 3 1 2',
          starterCode: `a, b, c = 1, 2, 3
# TODO: Single line swap
print(a, b, c)`,
          expectedOutput: '3 1 2',
          hints: ['`a, b, c = c, a, b` evaluates the RHS tuple before unpacking.'],
        },
        {
          id: 'pyb-1-3',
          title: 'True Division vs Floor Division',
          difficulty: 'Easy',
          description: 'For `a=19, b=4`, print integer quotient, remainder, and exact quotient `.2f`: 4 3 4.75',
          starterCode: `a, b = 19, 4
# TODO`,
          expectedOutput: '4 3 4.75',
          hints: ['Use `a // b`, `a % b`, and `f"{a / b:.2f}"`.'],
        },
        {
          id: 'pyb-1-4',
          title: 'Arbitrary Precision Big Power',
          difficulty: 'Easy',
          description: 'Compute `2 ** 70` cleanly in Python and print -> 1180591620717411303424',
          starterCode: `
# TODO: Print 2 ** 70`,
          expectedOutput: '1180591620717411303424',
          hints: ['Python `int` auto-expands beyond 64 bits with zero overflow.'],
        },
        {
          id: 'pyb-1-5',
          title: 'Zero-Padded Clock Formatter',
          difficulty: 'Easy',
          description: 'Convert `sec = 5025` into `HH:MM:SS` -> 01:23:45',
          starterCode: `sec = 5025
# TODO: Use divmod(sec, 3600) and zero padding :02d`,
          expectedOutput: '01:23:45',
          hints: ['`h, rem = divmod(sec, 3600); m, s = divmod(rem, 60)`'],
        },
        {
          id: 'pyb-1-6',
          title: 'Boolean Truthiness Check',
          difficulty: 'Easy',
          description: 'Print `bool([])`, `bool("0")`, and `bool(0)` separated by space -> False True False',
          starterCode: `
# TODO: Print bool values`,
          expectedOutput: 'False True False',
          hints: ['Non-empty string `"0"` is truthy (`True`), empty containers and `0` are falsy.'],
        },
        {
          id: 'pyb-1-7',
          title: 'Floating Rounding vs Banker’s Round',
          difficulty: 'Easy',
          description: 'Sum integers in `[12, 15, 19]` and compute arithmetic mean to 3 decimal places -> 15.333',
          starterCode: `nums = [12, 15, 19]
# TODO: Print mean to 3 decimals`,
          expectedOutput: '15.333',
          hints: ['`f"{sum(nums)/len(nums):.3f}"`'],
        },
        {
          id: 'pyb-1-8',
          title: 'ASCII Character & Code Conversion',
          difficulty: 'Easy',
          description: 'Print ASCII code of `\'A\'` and character at code `90` -> 65 Z',
          starterCode: `
# TODO: Use ord() and chr()`,
          expectedOutput: '65 Z',
          hints: ['`ord(\'A\')` returns 65, `chr(90)` returns `\'Z\'`.'],
        },
        {
          id: 'pyb-1-9',
          title: 'Modular Exponentiation pow(a, b, mod)',
          difficulty: 'Medium',
          description: 'Compute `(3 ** 123456) % 1000000007` instantaneously using 3-arg `pow` -> 463119692',
          starterCode: `
# TODO: print(pow(3, 123456, 10**9 + 7))`,
          expectedOutput: '463119692',
          hints: ['Wait verify output inside Python? Yes: built-in 3-argument `pow(3, 123456, 1000000007)` runs in O(log 123456)!'],
        },
        {
          id: 'pyb-1-10',
          title: 'String Repetition Box Line',
          difficulty: 'Easy',
          description: 'Use string multiplication `"-" * 10` to print exact header: ----KΛ----',
          starterCode: `
# TODO: Build symmetric dash line around KΛ`,
          expectedOutput: '----KΛ----',
          hints: ['`print("-" * 4 + "KΛ" + "-" * 4)`'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'Conditionals, Loops & Comprehensions',
      topic: 'if/elif, range(), enumerate() & List Comprehensions',
      estimatedTime: '2.5 Hours',
      summary:
        'Write Pythonic iteration using `enumerate`, `zip`, conditional expressions (`a if cond else b`), and crisp list comprehensions.',
      studyMaterial: {
        overview:
          'Write loops Python-style: never iterate `for i in range(len(arr))` when `for idx, val in enumerate(arr)` or a list comprehension does the job cleanly without index typos.',
        keyPoints: [
          'Chained comparisons work directly in Python: `10 <= x <= 20`.',
          '`for i, v in enumerate(arr, start=1)` yields index and item together.',
          '`zip(a, b)` walks two lists in lockstep safely.',
          'List comprehension `[x * x for x in nums if x % 2 == 0]` replaces verbose append loops.',
        ],
        codeExamples: [
          {
            title: 'List Comprehension & Chained Comparisons',
            code: `scores = [45, 72, 88, 95, 61]
passing = [s for s in scores if 70 <= s <= 100]
print(passing)`,
            explanation: 'Clean chained comparison `70 <= s <= 100` inside comprehension.',
          },
        ],
        cheatsheet: [
          'x if cond else y -> Python ternary',
          'enumerate(seq) -> (idx, item)',
          '[expr for x in seq if filter] -> list comprehension',
        ],
        officialDocUrl: 'https://docs.python.org/3/tutorial/controlflow.html',
      },
      video: yt(
        'Python Full Course — Loops, Logic & Control Flow',
        'Programming with Mosh',
        'K5KVEU3aaeQ',
        '2h 02m',
        'Follows clean control flow, range iteration, and logical operators.',
      ),
      compilerStarterCode: `squares = [n * n for n in range(1, 6) if n % 2 == 1]
print(squares)`,
      practiceQuestions: [
        {
          id: 'pyb-2-1',
          title: 'Chained Range Validator',
          difficulty: 'Easy',
          description: 'Filter `{5, 12, 20, 25, 10}` to items in `[10..20]` inclusive using chained comparison -> [12, 20, 10]',
          starterCode: `vals = [5, 12, 20, 25, 10]
# TODO: Filter 10 <= v <= 20`,
          expectedOutput: '[12, 20, 10]',
          hints: ['`[v for v in vals if 10 <= v <= 20]`'],
        },
        {
          id: 'pyb-2-2',
          title: 'Squares of Odd Numbers',
          difficulty: 'Easy',
          description: 'Build list of squares of odd ints in `1..9` via comprehension -> [1, 9, 25, 49, 81]',
          starterCode: `
# TODO: List comprehension over range(1, 10)`,
          expectedOutput: '[1, 9, 25, 49, 81]',
          hints: ['Step by 2: `range(1, 10, 2)`.'],
        },
        {
          id: 'pyb-2-3',
          title: 'FizzBuzz Compact Slice',
          difficulty: 'Easy',
          description: 'Print FizzBuzz sequence for `1..7` space-separated -> 1 2 Fizz 4 Buzz Fizz 7',
          starterCode: `
# TODO: Build tokens 1..7 and join with spaces`,
          expectedOutput: '1 2 Fizz 4 Buzz Fizz 7',
          hints: ['Check `% 15 == 0` first before `% 3` and `% 5`.'],
        },
        {
          id: 'pyb-2-4',
          title: 'Dot Product via zip()',
          difficulty: 'Easy',
          description: 'Compute dot product of `[2, 3, 4]` and `[5, 6, 7]` using `zip` -> 56',
          starterCode: `a, b = [2, 3, 4], [5, 6, 7]
# TODO: sum(x * y for x, y in zip(a, b))`,
          expectedOutput: '56',
          hints: ['2*5 + 3*6 + 4*7 = 10 + 18 + 28 = 56.'],
        },
        {
          id: 'pyb-2-5',
          title: 'Enumerate Even-Index Filter',
          difficulty: 'Easy',
          description: 'Print elements at even indices of `["a","b","c","d","e"]` -> a c e',
          starterCode: `arr = ["a","b","c","d","e"]
# TODO`,
          expectedOutput: 'a c e',
          hints: ['Use `enumerate` or slice `arr[::2]` joined with spaces.'],
        },
        {
          id: 'pyb-2-6',
          title: 'All / Any Predicate Checks',
          difficulty: 'Easy',
          description: 'Check if ALL items > 0 and ANY item > 50 in `[12, 44, 55, 8]` -> True True',
          starterCode: `nums = [12, 44, 55, 8]
# TODO: print(all(...), any(...))`,
          expectedOutput: 'True True',
          hints: ['`all(x > 0 for x in nums)`'],
        },
        {
          id: 'pyb-2-7',
          title: 'Flatten 2D Matrix via Comprehension',
          difficulty: 'Medium',
          description: 'Flatten `[[1, 2], [3, 4], [5]]` with nested list comprehension -> [1, 2, 3, 4, 5]',
          starterCode: `mat = [[1, 2], [3, 4], [5]]
# TODO`,
          expectedOutput: '[1, 2, 3, 4, 5]',
          hints: ['`[x for row in mat for x in row]`'],
        },
        {
          id: 'pyb-2-8',
          title: 'First Prime Above 50 (For-Else)',
          difficulty: 'Medium',
          description: 'Find smallest prime strictly `> 50` using Python loop -> 53',
          starterCode: `
# TODO: Test n from 51 upward`,
          expectedOutput: '53',
          hints: ['Loop `n = 51..`; check `all(n % d != 0 for d in range(2, int(n**0.5) + 1))`.'],
        },
        {
          id: 'pyb-2-9',
          title: 'Triangular Star Steps',
          difficulty: 'Easy',
          description: 'Print 4 lines with 1..4 `#` characters:\n#\n##\n###\n####',
          starterCode: `
# TODO`,
          expectedOutput: '#\n##\n###\n####',
          hints: ['`for i in range(1, 5): print("#" * i)`'],
        },
        {
          id: 'pyb-2-10',
          title: 'Sum of Digits Without String Cast',
          difficulty: 'Easy',
          description: 'Compute digit sum of `98765` using `divmod(n, 10)` loop -> 35',
          starterCode: `n = 98765
# TODO`,
          expectedOutput: '35',
          hints: ['`while n: n, d = divmod(n, 10); total += d`'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Lists, Tuples, Sets & Dictionaries',
      topic: 'Core Built-In Data Structures & Slicing',
      estimatedTime: '2.5 Hours',
      summary:
        'Choose the right container: O(1) lookup `set`/`dict`, immutable `tuple`, list slicing `arr[::-1]`, and dict comprehensions.',
      studyMaterial: {
        overview:
          'Python’s `dict` and `set` are hash-backed O(1) average lookup containers—and since Python 3.7, `dict` preserves insertion order! Always avoid `x in my_list` inside loops (`O(N²)`); convert to `set` first (`O(N)`).',
        keyPoints: [
          '`d.get(key, default)` avoids `KeyError` on missing dictionary keys.',
          'List slicing `a[start:stop:step]`: `a[::-1]` creates a reversed copy cleanly.',
          'Dict comprehension `{k: v for k, v in pairs}` builds inverted/filtered maps in one line.',
          'Use `frozenset` or `tuple` when a composite object must be hashable (dictionary key).',
        ],
        codeExamples: [
          {
            title: 'Dictionary Frequency Count & Inversion',
            code: `words = ["py", "go", "py", "js"]
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
print(freq)`,
            explanation: '`dict.get(w, 0)` cleanly initializes unseen keys.',
          },
        ],
        cheatsheet: [
          'a[::-1] -> reverse list/string | a[-k:] -> last k items',
          'set(a) & set(b) -> intersection | set(a) - set(b) -> difference',
          'dict.get(k, 0) | dict.setdefault(k, []).append(v)',
        ],
        officialDocUrl: 'https://docs.python.org/3/tutorial/datastructures.html',
      },
      video: yt(
        'Learn Python — Lists, Tuples, Dictionaries & Sets',
        'freeCodeCamp.org',
        'rfscVS0vtbw',
        '4h 26m',
        'Covers slicing, list methods, tuple immutability, and dictionary key-value lookups.',
      ),
      compilerStarterCode: `d = {"java": 21, "python": 3}
inv = {v: k for k, v in d.items()}
print(inv[3])`,
      practiceQuestions: [
        {
          id: 'pyb-3-1',
          title: 'Two Sum in O(N) Dictionary',
          difficulty: 'Easy',
          description: 'Find indices summing to `9` in `[2, 11, 7, 15]` -> 0 2',
          starterCode: `nums, target = [2, 11, 7, 15], 9
# TODO: Use dict mapping value -> index`,
          expectedOutput: '0 2',
          hints: ['Check `if target - x in seen` as you iterate `enumerate(nums)`.'],
        },
        {
          id: 'pyb-3-2',
          title: 'Invert Unique Value Dictionary',
          difficulty: 'Easy',
          description: 'Invert `{"a": 1, "b": 2, "c": 3}` using dict comprehension and print `inv[2]` -> b',
          starterCode: `d = {"a": 1, "b": 2, "c": 3}
# TODO`,
          expectedOutput: 'b',
          hints: ['`inv = {v: k for k, v in d.items()}`'],
        },
        {
          id: 'pyb-3-3',
          title: 'Set Difference Missing Tags',
          difficulty: 'Easy',
          description: 'Given required `{"git","sql","docker"}` and active `{"git","docker"}`, print sorted missing tags list -> [\'sql\']',
          starterCode: `req = {"git", "sql", "docker"}
active = {"git", "docker"}
# TODO`,
          expectedOutput: "['sql']",
          hints: ['`sorted(req - active)`'],
        },
        {
          id: 'pyb-3-4',
          title: 'Merge Dicts Summing Shared Keys',
          difficulty: 'Medium',
          description: 'Merge `{"x": 10, "y": 5}` and `{"y": 7, "z": 3}` summing matching keys, print sorted pairs `k:v` -> x:10 y:12 z:3',
          starterCode: `d1 = {"x": 10, "y": 5}
d2 = {"y": 7, "z": 3}
# TODO`,
          expectedOutput: 'x:10 y:12 z:3',
          hints: ['Loop `d1.keys() | d2.keys()` sorted and sum `d1.get(k,0) + d2.get(k,0)`.'],
        },
        {
          id: 'pyb-3-5',
          title: 'Rotate List Slicing Right by K',
          difficulty: 'Easy',
          description: 'Rotate `[10, 20, 30, 40, 50]` right by `k = 2` via slicing -> [40, 50, 10, 20, 30]',
          starterCode: `a = [10, 20, 30, 40, 50]
k = 2
# TODO: Print a[-k:] + a[:-k]`,
          expectedOutput: '[40, 50, 10, 20, 30]',
          hints: ['Normalize `k %= len(a)` first in general problems!'],
        },
        {
          id: 'pyb-3-6',
          title: 'Remove Duplicates Preserving Order',
          difficulty: 'Easy',
          description: 'Deduplicate `[3, 1, 2, 1, 3, 5]` preserving first-seen order using `dict.fromkeys` -> [3, 1, 2, 5]',
          starterCode: `nums = [3, 1, 2, 1, 3, 5]
# TODO: list(dict.fromkeys(nums))`,
          expectedOutput: '[3, 1, 2, 5]',
          hints: ['`dict.fromkeys` preserves insertion order in Python 3.7+.'],
        },
        {
          id: 'pyb-3-7',
          title: 'Sort Tuples by Multiple Keys',
          difficulty: 'Easy',
          description: 'Sort `[("bob",80),("ada",95),("cal",95)]` by score DESC then name ASC -> ada cal bob',
          starterCode: `rows = [("bob",80), ("ada",95), ("cal",95)]
# TODO: sorted(rows, key=lambda r: (-r[1], r[0]))`,
          expectedOutput: 'ada cal bob',
          hints: ['Negate numeric scores `-r[1]` inside the tuple key to sort scores descending cleanly.'],
        },
        {
          id: 'pyb-3-8',
          title: 'Group Strings by First Letter',
          difficulty: 'Medium',
          description: 'Group `["ant","bat","apple","box"]` into dict by first char; print `groups[\'a\']` -> [\'ant\', \'apple\']',
          starterCode: `words = ["ant", "bat", "apple", "box"]
# TODO: Use setdefault`,
          expectedOutput: "['ant', 'apple']",
          hints: ['`groups.setdefault(w[0], []).append(w)`'],
        },
        {
          id: 'pyb-3-9',
          title: 'Tuple Unpacking Starred Rest',
          difficulty: 'Easy',
          description: 'Unpack `[100, 200, 300, 400]` into `first, *mid, last` and print `first sum(mid) last` -> 100 500 400',
          starterCode: `seq = [100, 200, 300, 400]
# TODO: first, *mid, last = seq`,
          expectedOutput: '100 500 400',
          hints: ['Starred unpacking collects middle elements into a list automatically.'],
        },
        {
          id: 'pyb-3-10',
          title: 'Matrix Transpose via zip(*m)',
          difficulty: 'Medium',
          description: 'Transpose `[[1, 2, 3], [4, 5, 6]]` with `zip(*m)` and print row 1 as tuple -> (2, 5)',
          starterCode: `m = [[1, 2, 3], [4, 5, 6]]
# TODO: list(zip(*m))[1]`,
          expectedOutput: '(2, 5)',
          hints: ['Unpacking `m` into `zip(*m)` pairs column elements across rows!'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Functions, *args/**kwargs & Recursion',
      topic: 'Clean Signatures, Closures & Memoization',
      estimatedTime: '2.5 Hours',
      summary:
        'Master Python’s mutable default argument trap (`def f(a=None)`), `*args`/`**kwargs`, `lambda` closures, and `@functools.lru_cache` recursion.',
      studyMaterial: {
        overview:
          'Number-one Python interview bug: **never write `def add(item, lst=[])`** because default argument expressions evaluate ONCE at function definition time, sharing the same list across calls! Always use `None` and initialize inside the body.',
        keyPoints: [
          'Safe mutable default: `def append_tag(tag, tags=None): tags = [] if tags is None else tags`.',
          '`*args` collects positional extras as tuple; `**kwargs` collects keyword extras as dict.',
          '`@functools.cache` (or `@lru_cache(maxsize=None)`) memoizes pure recursive functions in one decorator line.',
        ],
        codeExamples: [
          {
            title: 'Safe Default Argument + @cache Fibonacci',
            code: `from functools import cache
@cache
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))`,
            explanation: 'Computes 30th Fibonacci instant O(N) without blowing stack or repeating calls.',
          },
        ],
        cheatsheet: [
          'def f(x=None): x = [] if x is None else x',
          'from functools import cache -> 1-line memoization',
          'def log(*args, **kwargs): ...',
        ],
        officialDocUrl: 'https://docs.python.org/3/library/functools.html',
      },
      video: yt(
        'Python Functions — Parameters, Scope & *args/**kwargs',
        'Corey Schafer',
        '9Os0o3wzS_I',
        '22m',
        'Clean demonstration of function arguments, unpacking `*` / `**`, and LEGB scope.',
      ),
      compilerStarterCode: `from functools import cache
@cache
def stairs(n):
    return 1 if n <= 1 else stairs(n - 1) + stairs(n - 2)

print(stairs(10))`,
      practiceQuestions: [
        {
          id: 'pyb-4-1',
          title: 'Fix Mutable Default Argument Trap',
          difficulty: 'Easy',
          description: 'Write `add_item(x, items=None)` returning a fresh list when `items` is omitted. Call `add_item(1)` then `add_item(2)` and print second result -> [2]',
          starterCode: `def add_item(x, items=None):    # TODO
    pass

a = add_item(1)
b = add_item(2)
print(b)`,
          expectedOutput: '[2]',
          hints: ['`if items is None: items = []` before appending `x`.'],
        },
        {
          id: 'pyb-4-2',
          title: 'Variadic *args Multiplier',
          difficulty: 'Easy',
          description: 'Write `prod(*nums)` multiplying arbitrary positional args. Print `prod(2, 3, 4)` -> 24',
          starterCode: `def prod(*nums):    # TODO
    pass

print(prod(2, 3, 4))`,
          expectedOutput: '24',
          hints: ['Loop over `nums` starting with `res = 1`.'],
        },
        {
          id: 'pyb-4-3',
          title: 'Keyword Formatting **kwargs',
          difficulty: 'Easy',
          description: 'Write `fmt(**kv)` returning sorted `"k=v"` joined by comma. Call `fmt(env="prod", port=8080)` -> env=prod,port=8080',
          starterCode: `def fmt(**kv):    # TODO
    pass

print(fmt(env="prod", port=8080))`,
          expectedOutput: 'env=prod,port=8080',
          hints: ['`",".join(f"{k}={kv[k]}" for k in sorted(kv))`'],
        },
        {
          id: 'pyb-4-4',
          title: 'Memoized Fibonacci With @cache',
          difficulty: 'Easy',
          description: 'Compute `fib(35)` in milliseconds using `@functools.cache` -> 9227465',
          starterCode: `from functools import cache
# TODO: @cache fib(n)
print(fib(35))`,
          expectedOutput: '9227465',
          hints: ['Return `n` for `n < 2`, else `fib(n-1) + fib(n-2)`.'],
        },
        {
          id: 'pyb-4-5',
          title: 'Closure Counter Factory',
          difficulty: 'Medium',
          description: 'Write `make_counter(start=0)` returning an increment function using `nonlocal`. Call twice from `start=10` -> 11 12',
          starterCode: `def make_counter(start=0):    # TODO: Use nonlocal count inside inner inc()
    pass

c = make_counter(10)
print(c(), c())`,
          expectedOutput: '11 12',
          hints: ['Declare `nonlocal start` inside inner `def inc():` to mutate enclosing binding.'],
        },
        {
          id: 'pyb-4-6',
          title: 'Recursive Sum Nested Lists',
          difficulty: 'Medium',
          description: 'Recursively sum arbitrarily nested integers in `[1, [2, [3, 4]], 5]` -> 15',
          starterCode: `def deep_sum(seq):    # TODO: Check isinstance(x, list)
    pass

print(deep_sum([1, [2, [3, 4]], 5]))`,
          expectedOutput: '15',
          hints: ['Add `deep_sum(x)` if `isinstance(x, list)` else `x`.'],
        },
        {
          id: 'pyb-4-7',
          title: 'Generate All Parent Subsets Recursively',
          difficulty: 'Medium',
          description: 'Print count of all subsets generated recursively for `[1, 2, 3, 4]` -> 16',
          starterCode: `def count_subsets(nums):    # TODO: Build subsets list recursively and return len(res)
    pass

print(count_subsets([1, 2, 3, 4]))`,
          expectedOutput: '16',
          hints: ['At index `i`, branch include vs exclude `nums[i]`.'],
        },
        {
          id: 'pyb-4-8',
          title: 'Higher-Order Map & Reduce Pipeline',
          difficulty: 'Easy',
          description: 'Using `functools.reduce`, multiply `[3, 5, 2]` with initial 1 -> 30',
          starterCode: `from functools import reduce
# TODO: Print product using reduce`,
          expectedOutput: '30',
          hints: ['`reduce(lambda a, b: a * b, [3, 5, 2], 1)`'],
        },
        {
          id: 'pyb-4-9',
          title: 'Recursive Binary Search Return Index',
          difficulty: 'Easy',
          description: 'Find `23` in `[4, 8, 15, 16, 23, 42]` recursively -> 4',
          starterCode: `def bs(arr, lo, hi, t):    # TODO
    pass

print(bs([4, 8, 15, 16, 23, 42], 0, 5, 23))`,
          expectedOutput: '4',
          hints: ['Return -1 if `lo > hi`; split at `(lo + hi) // 2`.'],
        },
        {
          id: 'pyb-4-10',
          title: 'Partial Function Application',
          difficulty: 'Easy',
          description: 'Use `functools.partial(int, base=2)` to parse `"101101"` -> 45',
          starterCode: `from functools import partial
# TODO: b2 = partial(int, base=2); print(b2("101101"))`,
          expectedOutput: '45',
          hints: ['`partial` pre-binds `base=2` cleanly.'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'Strings, Slicing & Regular Expressions',
      topic: 'Immutable Strings, join() & re Module',
      estimatedTime: '2.5 Hours',
      summary:
        'Master Python string methods (`split`, `strip`, `join`), palindrome/anagram tricks, and pattern extraction with `re.findall`.',
      studyMaterial: {
        overview:
          'Like Java, Python `str` is immutable—never write `s += ch` repeatedly in huge loops; append parts to a list and finish with `"".join(parts)`.',
        keyPoints: [
          '`" ".join(words)` merges strings in O(N) total time.',
          '`s.split()` with no argument collapses arbitrary runs of whitespace automatically.',
          '`re.findall(r"\\d+", text)` extracts all integer substrings in one line.',
          '`str.maketrans` / `isalnum()` sanitizes inputs cleanly before palindrome comparison.',
        ],
        codeExamples: [
          {
            title: 'Regex Digit Extraction & Join',
            code: `import renum
s = [int(x) 
for x in re.findall(r"\\d+", "id=42, port=8080")]
print(sum(nums))`,
            explanation: 'Extracts `42` and `8080` directly from text without manual character scanning.',
          },
        ],
        cheatsheet: [
          's.split() -> collapses multiple spaces | s.split(",") -> strict delimiter',
          '"".join(list_of_strs) -> O(N) concat',
          're.findall(r"\\d+", s) -> extract numbers',
        ],
        officialDocUrl: 'https://docs.python.org/3/library/re.html',
      },
      video: yt(
        'Python Strings & Standard Methods Deep Dive',
        'Corey Schafer',
        'YYXdXT2l-Gg',
        '20m',
        'Focus on slicing, string formatting, split/join, and clean immutability rules.',
      ),
      compilerStarterCode: `import relin
e = "Orders: 15, 25, and 60"
print(sum(map(int, re.findall(r"\\d+", line))))`,
      practiceQuestions: [
        {
          id: 'pyb-5-1',
          title: 'Normalize & Reverse Words Order',
          difficulty: 'Easy',
          description: 'Normalize whitespace and reverse word order of `"  code   fast  in python  "` -> python in fast code',
          starterCode: `s = "  code   fast  in python  "
# TODO`,
          expectedOutput: 'python in fast code',
          hints: ['`" ".join(s.split()[::-1])`'],
        },
        {
          id: 'pyb-5-2',
          title: 'Regex Sum All Integers (With Negatives)',
          difficulty: 'Medium',
          description: 'Extract signed integers from `"bal=-12, bonus=50, fee=-8"` using `re.findall(r"-?\\d+", s)` and sum -> 30',
          starterCode: `import re
s = "bal=-12, bonus=50, fee=-8"
# TODO`,
          expectedOutput: '30',
          hints: ['`r"-?\\d+"` matches optional minus sign followed by digits.'],
        },
        {
          id: 'pyb-5-3',
          title: 'Alphanumeric Palindrome Cleaner',
          difficulty: 'Easy',
          description: 'Filter `"Was it a car or a cat I saw?"` to alphanumeric lowercase and test palindrome -> True',
          starterCode: `s = "Was it a car or a cat I saw?"
# TODO`,
          expectedOutput: 'True',
          hints: ['`clean = "".join(c.lower() for c in s if c.isalnum())` then compare `clean == clean[::-1]`.'],
        },
        {
          id: 'pyb-5-4',
          title: 'Snake Case to Camel Case',
          difficulty: 'Easy',
          description: 'Convert `"kollabrix_battle_arena"` to camelCase -> kollabrixBattleArena',
          starterCode: `s = "kollabrix_battle_arena"
# TODO: Split on '_' and capitalize subsequent chunks`,
          expectedOutput: 'kollabrixBattleArena',
          hints: ['`parts = s.split("_"); print(parts[0] + "".join(p.capitalize() for p in parts[1:]))`'],
        },
        {
          id: 'pyb-5-5',
          title: 'Validate Simple Email Regex',
          difficulty: 'Medium',
          description: 'Match `r"^[A-Za-z0-9_.+-]+@[A-Za-z0-9-]+\\.[A-Za-z]{2,}$"` against `"dev@kollabrix.in"` & `"bad@site"` -> True False',
          starterCode: `import re
# TODO: Print bool(re.match(...)) for both`,
          expectedOutput: 'True False',
          hints: ['Use `bool(re.match(pattern, email))`.'],
        },
        {
          id: 'pyb-5-6',
          title: 'Count Words Ignoring Punctuation',
          difficulty: 'Easy',
          description: 'Extract word tokens with `r"[A-Za-z]+"` from `"Hello, world! Hello KΛ."` and print count -> 4',
          starterCode: `import re
s = "Hello, world! Hello KΛ."
# TODO: Count ASCII alphabetical tokens`,
          expectedOutput: '4',
          hints: ['`len(re.findall(r"[A-Za-z]+", s))`'],
        },
        {
          id: 'pyb-5-7',
          title: 'Center-Aligned Title Banner',
          difficulty: 'Easy',
          description: 'Use `"KA".center(8, "*")` -> ***KA***',
          starterCode: `
# TODO`,
          expectedOutput: '***KA***',
          hints: ['`"KA".center(8, "*")` pads both sides evenly.'],
        },
        {
          id: 'pyb-5-8',
          title: 'Check Subsequence Order',
          difficulty: 'Medium',
          description: 'Check whether `"ace"` is a subsequence of `"abcde"` -> True',
          starterCode: `s, t = "ace", "abcde"
# TODO: Advance iterator it = iter(t); all(ch in it for ch in s)`,
          expectedOutput: 'True',
          hints: ['In Python, `it = iter(t); print(all(c in it for c in s))` runs in a single O(N) pass!'],
        },
        {
          id: 'pyb-5-9',
          title: 'Mask Credit Card Last 4 Digits',
          difficulty: 'Easy',
          description: 'Mask `"4111222233339876"` showing only last 4 chars -> ************9876',
          starterCode: `card = "4111222233339876"
# TODO`,
          expectedOutput: '************9876',
          hints: ['`"*" * (len(card) - 4) + card[-4:]`'],
        },
        {
          id: 'pyb-5-10',
          title: 'Expand Compressed Token String',
          difficulty: 'Medium',
          description: 'Expand `"a3b2c4"` using `re.findall(r"([a-z])(\\d+)", s)` -> aaabbcccc',
          starterCode: `import re
s = "a3b2c4"
# TODO`,
          expectedOutput: 'aaabbcccc',
          hints: ['`"".join(ch * int(n) for ch, n in re.findall(r"([a-z])(\\d+)", s))`'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'JSON, Exceptions & In-Memory Streams',
      topic: 'json.loads/dumps, try/except & io.StringIO',
      estimatedTime: '2 Hours',
      summary:
        'Serialize/parse structured payloads cleanly with `json`, guard faults with specific `try/except/else/finally`, and practice file-like interfaces with `io.StringIO`.',
      studyMaterial: {
        overview:
          'Modern Python APIs exchange JSON everywhere. Handle parsing failures explicitly with `except (json.JSONDecodeError, ValueError):` instead of bare `except:` clauses.',
        keyPoints: [
          '`json.loads(text)` parses JSON strings into Python dicts/lists; `json.dumps(obj, sort_keys=True)` produces deterministic canonical JSON.',
          '`with open(...) as f:` (or `io.StringIO` in sandboxes) uses context managers to close handles automatically.',
          '`try ... except ... else:` runs `else` ONLY when zero exceptions occurred.',
        ],
        codeExamples: [
          {
            title: 'JSON Serialization & Safe Parse',
            code: `import jsonpayloa
d = json.loads('{"team":"KΛ","score":99}')
print(payload["team"], json.dumps({"ok": True}, separators=(",", ":")))`,
            explanation: 'Compact JSON serialization using `separators=(",", ":")` saves bandwidth.',
          },
        ],
        cheatsheet: [
          'json.loads(s) / json.dumps(obj, sort_keys=True)',
          'with io.StringIO(text) as f: -> file API in memory',
          'except ValueError as err:',
        ],
        officialDocUrl: 'https://docs.python.org/3/library/json.html',
      },
      video: yt(
        'Python for Beginners — Try/Except & Structured Data',
        'freeCodeCamp.org',
        'eWRfhZUzrAc',
        '4h 40m',
        'Covers error handling, JSON parsing, modules, and clean context managers.',
      ),
      compilerStarterCode: `import jsondat
a = json.loads('[{"name":"A","pts":80},{"name":"B","pts":95}]')
print(max(data, key=lambda x: x["pts"])["name"])`,
      practiceQuestions: [
        {
          id: 'pyb-6-1',
          title: 'Canonical Sorted JSON Dump',
          difficulty: 'Easy',
          description: 'Serialize `{"b": 2, "a": 1}` with `sort_keys=True` and compact separators `(",",":")` -> {"a":1,"b":2}',
          starterCode: `import json
d = {"b": 2, "a": 1}
# TODO`,
          expectedOutput: '{"a":1,"b":2}',
          hints: ['`json.dumps(d, sort_keys=True, separators=(",", ":"))`'],
        },
        {
          id: 'pyb-6-2',
          title: 'Aggregate JSON Records Revenue',
          difficulty: 'Easy',
          description: 'Parse JSON array `[{"id":1,"amt":49},{"id":2,"amt":199}]` and print total `amt` -> 248',
          starterCode: `import jsonra
w = '[{"id":1,"amt":49},{"id":2,"amt":199}]'
# TODO`,
          expectedOutput: '248',
          hints: ['`sum(item["amt"] for item in json.loads(raw))`'],
        },
        {
          id: 'pyb-6-3',
          title: 'csv DictReader Over StringIO',
          difficulty: 'Medium',
          description: 'Read `"name,elo\\nAda,1850\\nBob,1400\\n"` via `csv.DictReader(io.StringIO(...))` and print top handle -> Ada',
          starterCode: `import csv, iora
w = "name,elo\\nAda,1850\\nBob,1400\\n"
# TODO`,
          expectedOutput: 'Ada',
          hints: ['Cast `int(row["elo"])` when taking `max(...)`.'],
        },
        {
          id: 'pyb-6-4',
          title: 'Safe JSON Batch Parser',
          difficulty: 'Easy',
          description: 'Parse `[\'{"x":10}\', \'{bad\', \'{"x":25}\']` skipping `json.JSONDecodeError` -> sum: 35',
          starterCode: `import jsonbatc
h = ['{"x":10}', '{bad', '{"x":25}']
# TODO`,
          expectedOutput: '35',
          hints: ['Catch `json.JSONDecodeError` inside loop cleanly.'],
        },
        {
          id: 'pyb-6-5',
          title: 'Try / Except / Else Flow Trace',
          difficulty: 'Easy',
          description: 'Convert `"42"` cleanly with `try/except/else/finally`, emitting `OK:42 FIN`',
          starterCode: `s = "42"
# TODO: Try int(s), else print f"OK:{val}", finally print "FIN"`,
          expectedOutput: 'OK:42 FIN',
          hints: ['Remember `else` executes only when `try` completes without exception.'],
        },
        {
          id: 'pyb-6-6',
          title: 'Custom Validation Exception',
          difficulty: 'Easy',
          description: 'Define `class PortError(ValueError): pass`, raise on `port = 70000` (> 65535) and print `INVALID_PORT`',
          starterCode: `class PortError(ValueError):    pass

# TODO: Validate port=70000 and catch PortError`,
          expectedOutput: 'INVALID_PORT',
          hints: ['Pass `"INVALID_PORT"` to `raise PortError("INVALID_PORT")`.'],
        },
        {
          id: 'pyb-6-7',
          title: 'Line-by-Line Log Filter With StringIO',
          difficulty: 'Easy',
          description: 'Count `"ERROR"` lines in `"INFO ok\\nERROR db\\nINFO done\\nERROR net\\n"` -> 2',
          starterCode: `import iolog
s = "INFO ok\\nERROR db\\nINFO done\\nERROR net\\n"
# TODO`,
          expectedOutput: '2',
          hints: ['Wrap in `io.StringIO(logs)` and count lines starting with `"ERROR"`.'],
        },
        {
          id: 'pyb-6-8',
          title: 'Nested Dict Safe Path Lookup',
          difficulty: 'Medium',
          description: 'Safely traverse `cfg = {"db": {"pool": {"max": 20}}}` for path `["db", "pool", "max"]` returning `None` if any missing -> 20 None',
          starterCode: `def dig(d, keys):    # TODO
    pass

cfg = {"db": {"pool": {"max": 20}}}
print(dig(cfg, ["db", "pool", "max"]), dig(cfg, ["db", "auth", "mode"]))`,
          expectedOutput: '20 None',
          hints: ['Check `isinstance(cur, dict) and k in cur` at each step.'],
        },
        {
          id: 'pyb-6-9',
          title: 'Default Hook JSON Object Sum',
          difficulty: 'Easy',
          description: 'Use `json.dumps({"nums": [1, 2, 3]}, separators=(",", ":"))` and parse back length -> 3',
          starterCode: `import json
# TODO: Roundtrip encode/decode and print len(obj["nums"])`,
          expectedOutput: '3',
          hints: ['`len(json.loads(json.dumps({"nums": [1, 2, 3]}))["nums"])`'],
        },
        {
          id: 'pyb-6-10',
          title: 'Suppress Non-Fatal ValueError Context',
          difficulty: 'Easy',
          description: 'Use `contextlib.suppress(ValueError)` while removing `99` from `[1, 2, 3]` cleanly -> [1, 2, 3]',
          starterCode: `from contextlib import suppress
a = [1, 2, 3]
# TODO: with suppress(ValueError): a.remove(99)`,
          expectedOutput: '[1, 2, 3]',
          hints: ['`contextlib.suppress` swallows specified exceptions cleanly without try/except pass clutter.'],
        },
      ],
    },
    {
      stepNumber: 7,
      title: 'Python OOP, Dunder Methods & Dataclasses',
      topic: '__repr__, @property, @dataclass & Inheritance',
      estimatedTime: '2.5 Hours',
      summary:
        'Write idiomatic Python objects with `__init__`, `__str__`, operator dunders (`__add__`), `@property` validation, and clean `@dataclass` models.',
      studyMaterial: {
        overview:
          'In Python OOP, data-heavy classes use `@dataclass(frozen=True, order=True)` to auto-generate `__init__`, `__repr__`, `__eq__`, hashing, and comparison cleanly in 4 lines.',
        keyPoints: [
          '`__repr__` should produce an unambiguous debug representation; `__str__` formats for humans.',
          '`@property` exposes computed getters cleanly (`circle.area`) and enforces setter guards.',
          '`@dataclass(frozen=True)` creates immutable hashable value objects usable inside `set` and `dict` keys.',
          '`super().__init__(...)` delegates cleanly to base class constructors.',
        ],
        codeExamples: [
          {
            title: 'Immutable Ordered @dataclass',
            code: `from dataclasses import dataclass
@dataclass(frozen=True, order=True)
class Player:
    elo: int
    handle: str

print(sorted([Player(1200, "Z"), Player(1600, "A")], reverse=True)[0].handle)`,
            explanation: 'Sorts naturally on the first field `elo` with zero manual boilerplate.',
          },
        ],
        cheatsheet: [
          '@dataclass(frozen=True) -> immutable value object',
          '__add__, __len__, __eq__, __repr__ -> Python data model hooks',
          '@property + @x.setter -> validated attributes',
        ],
        officialDocUrl: 'https://docs.python.org/3/library/dataclasses.html',
      },
      video: yt(
        'Object Oriented Programming with Python — Full Course',
        'freeCodeCamp.org',
        'Ej_02ICOIgs',
        '2h 12m',
        'Master Python classes, __init__, class methods, properties, and inheritance.',
      ),
      compilerStarterCode: `from dataclasses import dataclass
@dataclass(frozen=True)
class Vec:
    x: int
    y: int
    def __add__(self, o): return Vec(self.x + o.x, self.y + o.y)

print(Vec(2, 3) + Vec(4, 5))`,
      practiceQuestions: [
        {
          id: 'pyb-7-1',
          title: 'Validated @property Setter',
          difficulty: 'Easy',
          description: 'Create `Account` with `@property balance` rejecting `< 0` (`raise ValueError("NEG")`). Set 200 then attempt -10 -> 200 NEG',
          starterCode: `class Account:
    def __init__(self, bal=0):
        self._bal = bal
    # TODO: @property balance & @balance.setter

acc = Account(200)
# TODO: Try acc.balance = -10 cleanly`,
          expectedOutput: '200 NEG',
          hints: ['Decorate getter with `@property` and setter with `@balance.setter`.'],
        },
        {
          id: 'pyb-7-2',
          title: 'Dunder __add__ & __eq__ Vector2D',
          difficulty: 'Easy',
          description: 'Implement `Vector(3, 4) + Vector(1, -2) == Vector(4, 2)` -> True',
          starterCode: `class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    # TODO: __add__ and __eq__

print(Vector(3, 4) + Vector(1, -2) == Vector(4, 2))`,
          expectedOutput: 'True',
          hints: ['Return `NotImplemented` if comparing different type, else `self.x == o.x and self.y == o.y`.'],
        },
        {
          id: 'pyb-7-3',
          title: 'Frozen Hashable @dataclass In Set',
          difficulty: 'Easy',
          description: 'Create `@dataclass(frozen=True) class Tag: name: str; group: str`. Deduplicate 3 items (2 identical) in `set` -> 2',
          starterCode: `from dataclasses import dataclass
# TODO: Define frozen dataclass Tag
# Deduplicate [Tag("py","lang"), Tag("py","lang"), Tag("sql","db")] and print len(set)`,
          expectedOutput: '2',
          hints: ['`frozen=True` generates `__hash__` automatically so instances work inside sets.'],
        },
        {
          id: 'pyb-7-4',
          title: 'Custom Container __len__ & __contains__',
          difficulty: 'Medium',
          description: 'Create `Bag` wrapping private `_items`, implementing `__len__` and `__contains__`. Check `len(b)` & `"k" in b` for `["k","a"]` -> 2 True',
          starterCode: `class Bag:
    def __init__(self, items):
        self._items = set(items)
    # TODO: __len__ and __contains__

b = Bag(["k", "a"])
print(len(b), "k" in b)`,
          expectedOutput: '2 True',
          hints: ['`def __contains__(self, item): return item in self._items`'],
        },
        {
          id: 'pyb-7-5',
          title: 'Inheritance & super() Override',
          difficulty: 'Easy',
          description: 'Base `Worker(1000)` `pay() -> 1000`; `Lead(1000, 400)` overrides adding bonus via `super().pay()` -> 1400',
          starterCode: `class Worker:
    def __init__(self, base): self.base = base
    def pay(self): return self.base

# TODO: Lead subclass
print(Lead(1000, 400).pay())`,
          expectedOutput: '1400',
          hints: ['Call `super().__init__(base)` in `Lead.__init__`.'],
        },
        {
          id: 'pyb-7-6',
          title: 'Context Manager __enter__ & __exit__',
          difficulty: 'Medium',
          description: 'Create `Session` class emitting `OPEN`, body prints `RUN`, `__exit__` emits `CLOSE` -> OPEN RUN CLOSE',
          starterCode: `class Session:    # TODO: __enter__ and __exit__
    pass

# with Session(): print("RUN", end=" ")`,
          expectedOutput: 'OPEN RUN CLOSE',
          hints: ['`def __exit__(self, exc_type, exc, tb): print("CLOSE")`'],
        },
        {
          id: 'pyb-7-7',
          title: '@classmethod Alternate Constructor',
          difficulty: 'Easy',
          description: 'Add `@classmethod def from_csv(cls, s)` to `User(name, role)` parsing `"ada,admin"` -> ada:admin',
          starterCode: `class User:
    def __init__(self, name, role):
        self.name, self.role = name, role
    # TODO: @classmethod from_csv
    def __str__(self): return f"{self.name}:{self.role}"

# print(User.from_csv("ada,admin"))`,
          expectedOutput: 'ada:admin',
          hints: ['`return cls(*s.split(","))`'],
        },
        {
          id: 'pyb-7-8',
          title: '__slots__ Memory Optimization Class',
          difficulty: 'Easy',
          description: 'Define `Node` using `__slots__ = ("val", "nxt")` linking 10 -> 20 and print sum -> 30',
          starterCode: `class Node:
    __slots__ = ("val", "nxt")
    def __init__(self, val, nxt=None):
        self.val, self.nxt = val, nxt

# TODO: Link 10 -> 20 and print val sum`,
          expectedOutput: '30',
          hints: ['`n = Node(10, Node(20)); print(n.val + n.nxt.val)`'],
        },
        {
          id: 'pyb-7-9',
          title: 'Callable Counter Object (__call__)',
          difficulty: 'Easy',
          description: 'Implement `class Multiplier` with `def __init__(self, k)` and `def __call__(self, x)` returning `k * x`. Print `Multiplier(6)(7)` -> 42',
          starterCode: `class Multiplier:    # TODO
    pass

print(Multiplier(6)(7))`,
          expectedOutput: '42',
          hints: ['Implementing `__call__` lets instances be invoked like functions.'],
        },
        {
          id: 'pyb-7-10',
          title: 'Abstract Base Class Enforcement (abc)',
          difficulty: 'Medium',
          description: 'Define `class Scorer(ABC)` with `@abstractmethod def points(self) -> int:`. Subclass `DuelScorer` returning `150` -> 150',
          starterCode: `from abc import ABC, abstractmethod
# TODO: Scorer ABC and DuelScorer concrete class`,
          expectedOutput: '150',
          hints: ['Subclasses must implement all `@abstractmethod` hooks before instantiation.'],
        },
      ],
    },
  ],
};
