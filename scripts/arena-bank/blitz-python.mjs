import { makePythonBlitz } from './builders.mjs';

/**
 * 90 unique Python 1v1 Quick Blitz questions (10 per Easy/Med/Hard × 3m/5m/10m).
 * Each includes clean stdin boilerplate + focused solve() function calibrated to leave 30-45s buffer.
 */
function pySpec(id, difficulty, durationSecs, title, description, paramSetup, starterTodo, implCode, testCases) {
  const makeCode = (body) =>
    `import sys\n\ndef solve():\n    lines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\n${paramSetup}\n${body}\n\nif __name__ == '__main__':\n    solve()\n`;
  return makePythonBlitz({
    id,
    title,
    difficulty,
    durationSecs,
    description,
    starterBody: makeCode(starterTodo),
    solutionCode: makeCode(implCode),
    testCases,
  });
}

const EASY_3M = [
  pySpec(
    'bl-py-e3-01', 'easy', 180, 'Threshold Score Filter',
    'Line 1 gives integer k. Line 2 gives space-separated scores. Print the sum of scores >= k.',
    '    k = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: print sum of scores >= k\n    print(0)',
    '    print(sum(x for x in arr if x >= k))',
    [{ input: '50\n40 55 80 49 50', expectedOutput: '185', description: 'Scores >= 50' }, { input: '100\n10 20 99', expectedOutput: '0', description: 'None qualify' }]
  ),
  pySpec(
    'bl-py-e3-02', 'easy', 180, 'Strict Peak Signal Count',
    'Given integer array, print count of elements strictly greater than both left and right neighbors.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: count strict interior peaks\n    print(0)',
    '    print(sum(1 for i in range(1, len(arr) - 1) if arr[i] > arr[i-1] and arr[i] > arr[i+1]))',
    [{ input: '1 5 2 6 3 7 1', expectedOutput: '3', description: 'Three interior peaks' }, { input: '1 2 3 4', expectedOutput: '0', description: 'Strictly rising' }]
  ),
  pySpec(
    'bl-py-e3-03', 'easy', 180, 'Alternating Weighted Checksum',
    'Given integers a0..an-1, compute sum of (-1)^i * a[i] (add even indices, subtract odd indices).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: alternating sum\n    print(0)',
    '    print(sum(x if i % 2 == 0 else -x for i, x in enumerate(arr)))',
    [{ input: '10 3 5 2', expectedOutput: '10', description: '10-3+5-2' }, { input: '4 9 1', expectedOutput: '-4', description: '4-9+1' }]
  ),
  pySpec(
    'bl-py-e3-04', 'easy', 180, 'Unique Modulo Buckets',
    'Line 1 gives m. Line 2 gives integers. Print how many distinct remainders x % m occur.',
    '    m = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: count distinct x % m\n    print(0)',
    '    print(len({x % m for x in arr}))',
    [{ input: '4\n4 8 5 9 10', expectedOutput: '3', description: 'Remainders 0,1,2' }, { input: '3\n3 6 9', expectedOutput: '1', description: 'All div by 3' }]
  ),
  pySpec(
    'bl-py-e3-05', 'easy', 180, 'Alphanumeric Palindrome Gate',
    'Print YES if string reads same forward/backward ignoring case and non-alphanumeric chars, else NO.',
    '    s = lines[0]',
    '    # TODO: print YES or NO\n    print("NO")',
    '    c = [ch.lower() for ch in s if ch.isalnum()]\n    print("YES" if c == c[::-1] else "NO")',
    [{ input: 'Race a E-car', expectedOutput: 'YES', description: 'raceecar -> yes' }, { input: 'hello world', expectedOutput: 'NO', description: 'Mismatch' }]
  ),
  pySpec(
    'bl-py-e3-06', 'easy', 180, 'Prefix Record Breaker Count',
    'Print count of elements strictly larger than every earlier element in the array (first element counts).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: count running new maximums\n    print(0)',
    '    best = -10**18\n    cnt = 0\n    for x in arr:\n        if x > best:\n            cnt += 1\n            best = x\n    print(cnt)',
    [{ input: '3 1 5 4 8', expectedOutput: '3', description: '3, 5, 8 break record' }, { input: '9 7 5 2', expectedOutput: '1', description: 'Only first counts' }]
  ),
  pySpec(
    'bl-py-e3-07', 'easy', 180, 'Uppercase Consonant Tally',
    'Count characters in the string that are UPPERCASE English consonants (not A,E,I,O,U).',
    '    s = lines[0]',
    '    # TODO: count uppercase consonants\n    print(0)',
    '    print(sum(1 for ch in s if ch.isupper() and ch not in "AEIOU"))',
    [{ input: 'KoLLaBriX2026', expectedOutput: '4', description: 'K,L,L,B,X wait: K L L B X = 5', }, { input: 'AEIOUabc', expectedOutput: '0', description: 'Only uppercase vowels' }]
  ),
  pySpec(
    'bl-py-e3-08', 'easy', 180, 'Pairwise Adjacent Swap Print',
    'Swap arr[0] with arr[1], arr[2] with arr[3], leaving trailing odd element if any. Print space-joined.',
    '    arr = lines[0].split()',
    '    # TODO: swap pairs in place\n    print(" ".join(arr))',
    '    for i in range(0, len(arr) - 1, 2):\n        arr[i], arr[i + 1] = arr[i + 1], arr[i]\n    print(" ".join(arr))',
    [{ input: '1 2 3 4 5', expectedOutput: '2 1 4 3 5', description: 'Odd length trail' }, { input: '10 20 30 40', expectedOutput: '20 10 40 30', description: 'Even length' }]
  ),
  pySpec(
    'bl-py-e3-09', 'easy', 180, 'Parity Gap Calculator',
    'Print (product of all even integers) minus (sum of all odd integers). Empty even product is 1.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: compute product(evens) - sum(odds)\n    print(0)',
    '    prod = 1\n    odd_sum = 0\n    for x in arr:\n        if x % 2 == 0: prod *= x\n        else: odd_sum += x\n    print(prod - odd_sum)',
    [{ input: '2 3 4 5', expectedOutput: '0', description: '8 - 8 = 0' }, { input: '2 6 1', expectedOutput: '11', description: '12 - 1' }]
  ),
  pySpec(
    'bl-py-e3-10', 'easy', 180, 'Digital Root Reduction',
    'Repeatedly sum digits of non-negative integer n until single digit remains and print it.',
    '    n = int(lines[0])',
    '    # TODO: digital root of n\n    print(0)',
    '    while n >= 10:\n        n = sum(int(d) for d in str(n))\n    print(n)',
    [{ input: '9875', expectedOutput: '2', description: '9+8+7+5=29 -> 11 -> 2' }, { input: '0', expectedOutput: '0', description: 'Single zero' }]
  ),
];
// Fix test case typo on bl-py-e3-07 before continuing!
EASY_3M[6].question.testCases[0].expectedOutput = '5';
EASY_3M[6].question.testCases[0].description = 'K,L,L,B,X = 5';
EASY_3M[6].question.sampleOutput = '5';

const EASY_5M = [
  pySpec(
    'bl-py-e5-01', 'easy', 300, 'Second Smallest Unique Bid',
    'Print the second smallest DISTINCT integer in the list, or -1 if fewer than 2 unique numbers.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: second smallest unique integer\n    print(-1)',
    '    u = sorted(set(arr))\n    print(u[1] if len(u) >= 2 else -1)',
    [{ input: '4 1 1 7 2 4', expectedOutput: '2', description: 'Second unique is 2' }, { input: '5 5 5', expectedOutput: '-1', description: 'All identical' }]
  ),
  pySpec(
    'bl-py-e5-02', 'easy', 300, 'Run-Length Stream Encoder',
    'Compress consecutive identical characters into char+count (e.g. aaabb -> a3b2).',
    '    s = lines[0]',
    '    # TODO: run-length encode s\n    print(s)',
    '    out = []\n    i = 0\n    while i < len(s):\n        j = i\n        while j < len(s) and s[j] == s[i]: j += 1\n        out.append(f"{s[i]}{j - i}")\n        i = j\n    print("".join(out))',
    [{ input: 'aaabbcdddd', expectedOutput: 'a3b2c1d4', description: 'Standard runs' }, { input: 'xyz', expectedOutput: 'x1y1z1', description: 'All length 1' }]
  ),
  pySpec(
    'bl-py-e5-03', 'easy', 300, 'Matrix Diagonal Gap',
    'Line 1 gives n. Next n lines hold n ints each. Print abs(main_diag_sum - anti_diag_sum).',
    '    n = int(lines[0])\n    grid = [list(map(int, lines[i + 1].split())) for i in range(n)]',
    '    # TODO: abs difference of matrix diagonals\n    print(0)',
    '    d1 = sum(grid[i][i] for i in range(n))\n    d2 = sum(grid[i][n - 1 - i] for i in range(n))\n    print(abs(d1 - d2))',
    [{ input: '3\n11 2 4\n4 5 6\n10 8 -12', expectedOutput: '15', description: '|4 - 19| = 15' }, { input: '2\n1 2\n3 4', expectedOutput: '0', description: '|5 - 5|' }]
  ),
  pySpec(
    'bl-py-e5-04', 'easy', 300, 'Zeroes End Compact Shift',
    'Move all 0 values to the end while keeping non-zero order intact. Print space-joined.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: move zeroes to end preserving order\n    print("")',
    '    nz = [x for x in arr if x != 0]\n    print(" ".join(map(str, nz + [0] * (len(arr) - len(nz)))))',
    [{ input: '0 1 0 3 12', expectedOutput: '1 3 12 0 0', description: 'Zeroes shifted' }, { input: '0 0 5', expectedOutput: '5 0 0', description: 'Leading zeroes' }]
  ),
  pySpec(
    'bl-py-e5-05', 'easy', 300, 'Lowest-Tie Mode Finder',
    'Find the integer with highest frequency; on ties return the smaller integer.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: print most frequent (smallest on tie)\n    print(0)',
    '    from collections import Counter\n    cnt = Counter(arr)\n    print(min(cnt.keys(), key=lambda x: (-cnt[x], x)))',
    [{ input: '4 2 4 2 9', expectedOutput: '2', description: 'Tie between 2 and 4 -> 2' }, { input: '7 7 1 2 7', expectedOutput: '7', description: 'Unique mode' }]
  ),
  pySpec(
    'bl-py-e5-06', 'easy', 300, 'Missing Alphabet Letter Count',
    'Print how many lowercase English letters a-z are absent from the string (case-insensitive).',
    '    s = lines[0].lower()',
    '    # TODO: count absent letters from a-z\n    print(26)',
    '    seen = {c for c in s if "a" <= c <= "z"}\n    print(26 - len(seen))',
    [{ input: 'The quick brown fox jumps over a lazy dog', expectedOutput: '0', description: 'Full pangram' }, { input: 'Hello World 2026', expectedOutput: '19', description: '7 distinct letters present' }]
  ),
  pySpec(
    'bl-py-e5-07', 'easy', 300, 'Strictly Rising Segment Count',
    'Count how many maximal contiguous strictly increasing runs exist in the array.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: count maximal strictly increasing segments\n    print(0)',
    '    runs = 1 if arr else 0\n    for i in range(1, len(arr)):\n        if arr[i] <= arr[i - 1]: runs += 1\n    print(runs)',
    [{ input: '1 2 5 3 4 4 6', expectedOutput: '3', description: '[1,2,5], [3,4], [4,6]' }, { input: '5 4 3 2', expectedOutput: '4', description: 'All length 1 runs' }]
  ),
  pySpec(
    'bl-py-e5-08', 'easy', 300, 'Left Cyclic Roster Rotate',
    'Line 1 gives integer k. Line 2 gives space-separated items. Rotate left by k and print space-joined.',
    '    k = int(lines[0])\n    arr = lines[1].split()',
    '    # TODO: rotate left by k\n    print(" ".join(arr))',
    '    k %= len(arr)\n    print(" ".join(arr[k:] + arr[:k]))',
    [{ input: '2\nA B C D E', expectedOutput: 'C D E A B', description: 'Shift 2 left' }, { input: '7\n1 2 3', expectedOutput: '2 3 1', description: 'k > len(arr)' }]
  ),
  pySpec(
    'bl-py-e5-09', 'easy', 300, 'Missing Roll Number Sum',
    'Given distinct numbers from range 0..n with one missing (length n), print the missing integer.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: print missing number from 0..len(arr)\n    print(0)',
    '    n = len(arr)\n    print(n * (n + 1) // 2 - sum(arr))',
    [{ input: '3 0 1', expectedOutput: '2', description: 'Missing 2' }, { input: '0 1 2 4 5', expectedOutput: '3', description: 'Missing 3' }]
  ),
  pySpec(
    'bl-py-e5-10', 'easy', 300, 'Word Anagram Equator',
    'Lines 1 and 2 give words s and t. Print YES if case-insensitive anagrams else NO.',
    '    s = lines[0].lower()\n    t = lines[1].lower()',
    '    # TODO: print YES or NO\n    print("NO")',
    '    print("YES" if sorted(s) == sorted(t) else "NO")',
    [{ input: 'Listen\nSilent', expectedOutput: 'YES', description: 'Valid anagram' }, { input: 'code\nbyte', expectedOutput: 'NO', description: 'Not anagram' }]
  ),
];

const EASY_10M = [
  pySpec(
    'bl-py-e10-01', 'easy', 600, 'Classroom Bench Swap Replay',
    'Line 1 gives array items. Next lines give "i j" swaps until EOF. Print final array space-joined.',
    '    arr = lines[0].split()\n    ops = [tuple(map(int, l.split())) for l in lines[1:]]',
    '    # TODO: execute all swaps and print array\n    print(" ".join(arr))',
    '    for i, j in ops:\n        arr[i], arr[j] = arr[j], arr[i]\n    print(" ".join(arr))',
    [{ input: 'A B C D\n0 3\n1 2\n0 1', expectedOutput: 'C D B A', description: 'Three swaps' }, { input: '1 2 3\n0 2', expectedOutput: '3 2 1', description: 'Single swap' }]
  ),
  pySpec(
    'bl-py-e10-02', 'easy', 600, 'Expense Ledger Top Category',
    'Lines contain "category amount". Sum amounts per category and print highest total category (lex tiebreak).',
    '    entries = lines',
    '    # TODO: find top spending category\n    print("")',
    '    from collections import defaultdict\n    tot = defaultdict(int)\n    for e in entries:\n        c, v = e.split()\n        tot[c] += int(v)\n    print(min(tot.keys(), key=lambda k: (-tot[k], k)))',
    [{ input: 'food 120\ntravel 200\nfood 130\ntech 250', expectedOutput: 'food', description: 'Tie 250 food vs tech -> food' }, { input: 'cafe 50\nbooks 90', expectedOutput: 'books', description: 'Books higher' }]
  ),
  pySpec(
    'bl-py-e10-03', 'easy', 600, 'Balanced Nesting Depth Metric',
    'Check if string of ()[]{} is valid. If valid print max nesting depth, otherwise print -1.',
    '    s = lines[0]',
    '    # TODO: validate brackets and compute max depth\n    print(-1)',
    '    pairs = {")": "(", "]": "[", "}": "{"}\n    st, best = [], 0\n    for c in s:\n        if c in "([{":\n            st.append(c)\n            best = max(best, len(st))\n        elif not st or st[-1] != pairs.get(c):\n            print(-1)\n            return\n        else:\n            st.pop()\n    print(-1 if st else best)',
    [{ input: '{[()()]}', expectedOutput: '3', description: 'Depth 3' }, { input: '([)]', expectedOutput: '-1', description: 'Crossed nesting' }]
  ),
  pySpec(
    'bl-py-e10-04', 'easy', 600, 'Prime Range Adder',
    'Line 1 gives L and R (1 <= L <= R <= 5000). Print sum of all prime integers in [L, R].',
    '    l, r = map(int, lines[0].split())',
    '    # TODO: sum primes in [l, r]\n    print(0)',
    '    is_p = [True] * (r + 1)\n    is_p[0] = False\n    if r >= 1: is_p[1] = False\n    for p in range(2, int(r**0.5) + 1):\n        if is_p[p]:\n            for m in range(p * p, r + 1, p): is_p[m] = False\n    print(sum(x for x in range(l, r + 1) if is_p[x]))',
    [{ input: '1 10', expectedOutput: '17', description: '2+3+5+7' }, { input: '14 16', expectedOutput: '0', description: 'No primes' }]
  ),
  pySpec(
    'bl-py-e10-05', 'easy', 600, 'Leaderboard Tiebreak Champion',
    'Lines give "username points". Print winner username with max points (earlier alphabetical if tied).',
    '    rows = lines',
    '    # TODO: select winner\n    print("")',
    '    best = min((r.split() for r in rows), key=lambda p: (-int(p[1]), p[0]))\n    print(best[0])',
    [{ input: 'alice 90\nbob 90\ncara 85', expectedOutput: 'alice', description: 'Tie winner' }, { input: 'zoe 100\nliam 99', expectedOutput: 'zoe', description: 'Highest score' }]
  ),
  pySpec(
    'bl-py-e10-06', 'easy', 600, 'Matrix Clockwise Rotate Flattened',
    'Line 1 gives n. Next n lines hold grid. Rotate 90 degrees clockwise and print flattened ints space-joined.',
    '    n = int(lines[0])\n    g = [list(map(int, lines[i + 1].split())) for i in range(n)]',
    '    # TODO: rotate matrix 90 clockwise\n    print("")',
    '    out = [g[n - 1 - r][c] for c in range(n) for r in range(n)]\n    print(" ".join(map(str, out)))',
    [{ input: '2\n1 2\n3 4', expectedOutput: '3 1 4 2', description: '2x2 clockwise' }, { input: '3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '7 4 1 8 5 2 9 6 3', description: '3x3 clockwise' }]
  ),
  pySpec(
    'bl-py-e10-07', 'easy', 600, 'Word Frequency Winner Lowercase',
    'Given lines of space-separated words, lowercase all words and print most frequent word (lex tiebreak).',
    '    words = " ".join(lines).lower().split()',
    '    # TODO: most frequent lowercase word\n    print("")',
    '    from collections import Counter\n    c = Counter(words)\n    print(min(c.keys(), key=lambda w: (-c[w], w)))',
    [{ input: 'Code build\ncode ship test build code', expectedOutput: 'code', description: 'code x3' }, { input: 'beta alpha\nalpha beta', expectedOutput: 'alpha', description: 'Tie alpha vs beta' }]
  ),
  pySpec(
    'bl-py-e10-08', 'easy', 600, 'Josephus Circle Survivor',
    'Line 1 gives n and step k. Numbered 1..n in circle, remove every k-th until 1 remains. Print survivor.',
    '    n, k = map(int, lines[0].split())',
    '    # TODO: Josephus last survivor 1..n\n    print(1)',
    '    res = 0\n    for i in range(2, n + 1): res = (res + k) % i\n    print(res + 1)',
    [{ input: '5 2', expectedOutput: '3', description: 'n=5, k=2 -> 3' }, { input: '7 3', expectedOutput: '4', description: 'n=7, k=3 -> 4' }]
  ),
  pySpec(
    'bl-py-e10-09', 'easy', 600, 'Adjacent Pairwise Duplicate Eraser',
    'Repeatedly delete adjacent equal letters (e.g. abbaca -> ca) until stable. Print result or EMPTY.',
    '    s = lines[0]',
    '    # TODO: stack remove adjacent duplicates\n    print("")',
    '    st = []\n    for ch in s:\n        if st and st[-1] == ch: st.pop()\n        else: st.append(ch)\n    print("".join(st) if st else "EMPTY")',
    [{ input: 'abbaca', expectedOutput: 'ca', description: 'Reduced to ca' }, { input: 'abba', expectedOutput: 'EMPTY', description: 'Empty final' }]
  ),
  pySpec(
    'bl-py-e10-10', 'easy', 600, 'Vending Coin Minimum Count',
    'Given integer amount A, print minimum number of coins from [10, 5, 2, 1] summing to A.',
    '    amt = int(lines[0])',
    '    # TODO: minimum coins from 10,5,2,1\n    print(0)',
    '    cnt = 0\n    for c in (10, 5, 2, 1):\n        cnt += amt // c\n        amt %= c\n    print(cnt)',
    [{ input: '28', expectedOutput: '5', description: '10+10+5+2+1' }, { input: '13', expectedOutput: '3', description: '10+2+1' }]
  ),
];

const MEDIUM_3M = [
  pySpec(
    'bl-py-m3-01', 'medium', 180, 'Sliding Window Max K',
    'Line 1 gives k. Line 2 gives integers. Print max sum of any contiguous subarray of length k.',
    '    k = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: max sum window of size k\n    print(0)',
    '    cur = best = sum(arr[:k])\n    for i in range(k, len(arr)):\n        cur += arr[i] - arr[i - k]\n        if cur > best: best = cur\n    print(best)',
    [{ input: '3\n2 1 5 1 3 2', expectedOutput: '9', description: '5+1+3=9' }, { input: '2\n-5 -2 -1 -8', expectedOutput: '-3', description: '-2+-1=-3' }]
  ),
  pySpec(
    'bl-py-m3-02', 'medium', 180, 'Hash Pair Target Counter',
    'Line 1 gives target. Line 2 gives integers. Print number of index pairs (i < j) with a[i] + a[j] == target.',
    '    t = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: O(n) pair count\n    print(0)',
    '    from collections import Counter\n    seen, ans = Counter(), 0\n    for x in arr:\n        ans += seen[t - x]\n        seen[x] += 1\n    print(ans)',
    [{ input: '6\n1 5 7 -1 5', expectedOutput: '3', description: '3 pairs sum to 6' }, { input: '4\n2 2 2', expectedOutput: '3', description: '3C2 = 3' }]
  ),
  pySpec(
    'bl-py-m3-03', 'medium', 180, 'First Unique Char Slot',
    'Print 0-based index of first non-repeating character in string s, or -1 if every character repeats.',
    '    s = lines[0]',
    '    # TODO: first unique character index\n    print(-1)',
    '    from collections import Counter\n    c = Counter(s)\n    print(next((i for i, ch in enumerate(s) if c[ch] == 1), -1))',
    [{ input: 'kollabrix', expectedOutput: '0', description: 'k appears once at 0' }, { input: 'aabbcc', expectedOutput: '-1', description: 'None unique' }]
  ),
  pySpec(
    'bl-py-m3-04', 'medium', 180, 'Backspace Text Compare',
    'Lines 1 and 2 hold typed strings where # means backspace. Print YES if final strings match else NO.',
    '    s1, s2 = lines[0], lines[1]',
    '    # TODO: simulate backspace and compare\n    print("NO")',
    '    def norm(s):\n        st = []\n        for ch in s:\n            if ch == "#":\n                if st: st.pop()\n            else: st.append(ch)\n        return st\n    print("YES" if norm(s1) == norm(s2) else "NO")',
    [{ input: 'ab#c\nad#c', expectedOutput: 'YES', description: 'Both become ac' }, { input: 'a#c\nb', expectedOutput: 'NO', description: 'c vs b' }]
  ),
  pySpec(
    'bl-py-m3-05', 'medium', 180, 'Equilibrium Pivot Slot',
    'Print smallest index i where sum of elements left of i equals sum strictly right of i, else -1.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: smallest equilibrium index\n    print(-1)',
    '    tot, left = sum(arr), 0\n    for i, x in enumerate(arr):\n        if left == tot - left - x:\n            print(i)\n            return\n        left += x\n    print(-1)',
    [{ input: '1 7 3 6 5 6', expectedOutput: '3', description: 'Index 3: 11 == 11' }, { input: '1 2 3', expectedOutput: '-1', description: 'No pivot' }]
  ),
  pySpec(
    'bl-py-m3-06', 'medium', 180, 'Near Duplicate Window K',
    'Line 1 gives k. Line 2 gives integers. Print YES if equal values exist with |i - j| <= k, else NO.',
    '    k = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: detect duplicate within k indices\n    print("NO")',
    '    last = {}\n    for i, x in enumerate(arr):\n        if x in last and i - last[x] <= k:\n            print("YES")\n            return\n        last[x] = i\n    print("NO")',
    [{ input: '2\n1 2 3 1 4', expectedOutput: 'NO', description: 'Dist 3 > 2' }, { input: '3\n1 2 3 1 4', expectedOutput: 'YES', description: 'Dist 3 <= 3' }]
  ),
  pySpec(
    'bl-py-m3-07', 'medium', 180, 'Bitonic Peak Locator',
    'Given strictly increasing then strictly decreasing mountain array (len>=3), print peak index via O(log n).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: find peak index\n    print(0)',
    '    lo, hi = 0, len(arr) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if arr[mid] < arr[mid + 1]: lo = mid + 1\n        else: hi = mid\n    print(lo)',
    [{ input: '0 3 8 10 5 2', expectedOutput: '3', description: 'Peak 10 at 3' }, { input: '2 9 4', expectedOutput: '1', description: 'Peak 9 at 1' }]
  ),
  pySpec(
    'bl-py-m3-08', 'medium', 180, 'Merge Sorted Channels',
    'Two sorted integer lines. Merge into one ascending sequence and print space-joined.',
    '    a = list(map(int, lines[0].split()))\n    b = list(map(int, lines[1].split()))',
    '    # TODO: two-pointer merge\n    print("")',
    '    i = j = 0\n    out = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]: out.append(a[i]); i += 1\n        else: out.append(b[j]); j += 1\n    out.extend(a[i:]); out.extend(b[j:])\n    print(" ".join(map(str, out)))',
    [{ input: '1 3 5\n2 3 6', expectedOutput: '1 2 3 3 5 6', description: 'Merged sorted' }, { input: '10\n1 2', expectedOutput: '1 2 10', description: 'Uneven lens' }]
  ),
  pySpec(
    'bl-py-m3-09', 'medium', 180, 'One-Zero Flip Longest Streak',
    'Given binary 0/1 array, print longest consecutive 1s length after flipping at most ONE 0 to 1.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: sliding window max 1 zero\n    print(0)',
    '    l = z = best = 0\n    for r, x in enumerate(arr):\n        if x == 0: z += 1\n        while z > 1:\n            if arr[l] == 0: z -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    print(best)',
    [{ input: '1 0 1 1 0 1', expectedOutput: '4', description: 'Flip index 1 -> 1 1 1 1' }, { input: '0 0 0', expectedOutput: '1', description: 'Flip any single 0' }]
  ),
  pySpec(
    'bl-py-m3-10', 'medium', 180, 'Sorted Array Squared Output',
    'Given ascending sorted integers (may include negatives), print their squares in non-decreasing order.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: two-pointer sorted squares\n    print("")',
    '    n = len(arr)\n    out = [0] * n\n    l, r, k = 0, n - 1, n - 1\n    while l <= r:\n        if abs(arr[l]) > abs(arr[r]):\n            out[k] = arr[l] ** 2; l += 1\n        else:\n            out[k] = arr[r] ** 2; r -= 1\n        k -= 1\n    print(" ".join(map(str, out)))',
    [{ input: '-4 -1 0 3 10', expectedOutput: '0 1 9 16 100', description: 'Negative and positive' }, { input: '-7 -3 2 3 11', expectedOutput: '4 9 9 49 121', description: 'Sorted squares' }]
  ),
];

const MEDIUM_5M = [
  pySpec(
    'bl-py-m5-01', 'medium', 300, 'Subarray Target Sum Count',
    'Line 1 gives k. Line 2 gives integers (can be negative). Count contiguous subarrays summing to k.',
    '    k = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: prefix sum hashmap count\n    print(0)',
    '    from collections import Counter\n    pref, seen, ans = 0, Counter({0: 1}), 0\n    for x in arr:\n        pref += x\n        ans += seen[pref - k]\n        seen[pref] += 1\n    print(ans)',
    [{ input: '2\n1 1 1', expectedOutput: '2', description: '[1,1] twice' }, { input: '0\n1 -1 1 -1', expectedOutput: '4', description: 'Four zero subarrays' }]
  ),
  pySpec(
    'bl-py-m5-02', 'medium', 300, 'Longest Distinct Char Window',
    'Print length of the longest substring of s without repeating characters.',
    '    s = lines[0]',
    '    # TODO: sliding window unique substring len\n    print(0)',
    '    seen, l, best = {}, 0, 0\n    for r, ch in enumerate(s):\n        if ch in seen and seen[ch] >= l: l = seen[ch] + 1\n        seen[ch] = r\n        best = max(best, r - l + 1)\n    print(best)',
    [{ input: 'abcabcbb', expectedOutput: '3', description: 'abc' }, { input: 'pwwkew', expectedOutput: '3', description: 'wke' }]
  ),
  pySpec(
    'bl-py-m5-03', 'medium', 300, 'Container Max Water Area',
    'Given pillar heights, choose two lines forming max water container area and print it.',
    '    h = list(map(int, lines[0].split()))',
    '    # TODO: two-pointer max area\n    print(0)',
    '    l, r, best = 0, len(h) - 1, 0\n    while l < r:\n        best = max(best, min(h[l], h[r]) * (r - l))\n        if h[l] < h[r]: l += 1\n        else: r -= 1\n    print(best)',
    [{ input: '1 8 6 2 5 4 8 3 7', expectedOutput: '49', description: 'min(8,7)*7' }, { input: '1 1', expectedOutput: '1', description: 'Min pair' }]
  ),
  pySpec(
    'bl-py-m5-04', 'medium', 300, 'Next Greater Element Vector',
    'For each element print the first strictly greater value to its right (-1 if none), space-joined.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: monotonic decreasing stack\n    print("")',
    '    res = [-1] * len(arr)\n    st = []\n    for i, x in enumerate(arr):\n        while st and arr[st[-1]] < x:\n            res[st.pop()] = x\n        st.append(i)\n    print(" ".join(map(str, res)))',
    [{ input: '2 1 2 4 3', expectedOutput: '4 2 4 -1 -1', description: 'Next greater right' }, { input: '5 4 3 2', expectedOutput: '-1 -1 -1 -1', description: 'Descending' }]
  ),
  pySpec(
    'bl-py-m5-05', 'medium', 300, 'Minimum Bracket Flips',
    'Given string of ( and ), print min single bracket flips to make balanced, or -1 if impossible.',
    '    s = lines[0]',
    '    # TODO: count unmatched opens and closes\n    print(-1)',
    '    if len(s) % 2:\n        print(-1); return\n    open_c = close_c = 0\n    for c in s:\n        if c == "(": open_c += 1\n        elif open_c > 0: open_c -= 1\n        else: close_c += 1\n    print((open_c + 1) // 2 + (close_c + 1) // 2)',
    [{ input: '}}{{'.replace('}','(').replace('{',')'), expectedOutput: '2', description: '))((' }, { input: '())()', expectedOutput: '-1', description: 'Odd length' }]
  ),
  pySpec(
    'bl-py-m5-06', 'medium', 300, 'Rotated Sorted Target Lookup',
    'Line 1 gives target. Line 2 gives distinct rotated sorted array. Print index or -1 in O(log n).',
    '    t = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: binary search in rotated array\n    print(-1)',
    '    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == t: print(mid); return\n        if arr[lo] <= arr[mid]:\n            if arr[lo] <= t < arr[mid]: hi = mid - 1\n            else: lo = mid + 1\n        else:\n            if arr[mid] < t <= arr[hi]: lo = mid + 1\n            else: hi = mid - 1\n    print(-1)',
    [{ input: '0\n4 5 6 7 0 1 2', expectedOutput: '4', description: 'Found 0 at 4' }, { input: '3\n4 5 6 7 0 1 2', expectedOutput: '-1', description: 'Missing 3' }]
  ),
  pySpec(
    'bl-py-m5-07', 'medium', 300, 'Merged Interval Count',
    'Lines contain "start end" intervals. Merge all overlapping intervals and print count remaining.',
    '    iv = sorted(tuple(map(int, l.split())) for l in lines)',
    '    # TODO: merge intervals and print count\n    print(0)',
    '    merged = []\n    for s, e in iv:\n        if not merged or s > merged[-1][1]: merged.append([s, e])\n        else: merged[-1][1] = max(merged[-1][1], e)\n    print(len(merged))',
    [{ input: '1 3\n2 6\n8 10\n15 18', expectedOutput: '3', description: '[1,6], [8,10], [15,18]' }, { input: '1 4\n4 5', expectedOutput: '1', description: 'Touching merges' }]
  ),
  pySpec(
    'bl-py-m5-08', 'medium', 300, 'Jump Finish Line Reachability',
    'Each arr[i] is max jump length forward. Starting at 0, print YES if index n-1 reachable else NO.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: greedy max reach\n    print("NO")',
    '    reach = 0\n    for i, x in enumerate(arr):\n        if i > reach: print("NO"); return\n        reach = max(reach, i + x)\n    print("YES")',
    [{ input: '2 3 1 1 4', expectedOutput: 'YES', description: 'Reaches end' }, { input: '3 2 1 0 4', expectedOutput: 'NO', description: 'Stuck at 0' }]
  ),
  pySpec(
    'bl-py-m5-09', 'medium', 300, 'Top K Frequent Elements',
    'Line 1 gives k. Line 2 gives integers. Print k most frequent integers (tie -> smaller first) space-joined.',
    '    k = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: top k frequent space-joined\n    print("")',
    '    from collections import Counter\n    cnt = Counter(arr)\n    top = sorted(cnt.keys(), key=lambda x: (-cnt[x], x))[:k]\n    print(" ".join(map(str, top)))',
    [{ input: '2\n1 1 1 2 2 3', expectedOutput: '1 2', description: '1(x3), 2(x2)' }, { input: '2\n5 5 3 3 9', expectedOutput: '3 5', description: 'Tie sorted asc' }]
  ),
  pySpec(
    'bl-py-m5-10', 'medium', 300, 'Product Except Self Array',
    'Given integers, print space-joined array where out[i] equals product of all elements except arr[i] (no division).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: prefix * suffix product\n    print("")',
    '    n = len(arr)\n    out = [1] * n\n    p = 1\n    for i in range(n): out[i] = p; p *= arr[i]\n    p = 1\n    for i in range(n - 1, -1, -1): out[i] *= p; p *= arr[i]\n    print(" ".join(map(str, out)))',
    [{ input: '1 2 3 4', expectedOutput: '24 12 8 6', description: 'All non-zero' }, { input: '-1 1 0 -3 3', expectedOutput: '0 0 9 0 0', description: 'Single zero safe' }]
  ),
];
// Make bl-py-m5-05 test input clean & unambiguous:
MEDIUM_5M[4].question.testCases[0].input = '))((';
MEDIUM_5M[4].question.sampleInput = '))((';

const MEDIUM_10M = [
  pySpec(
    'bl-py-m10-01', 'medium', 600, 'Grid Island Cluster Counter',
    'Line 1 gives r c. Next r lines give grid of 0 and 1 separated by spaces. Count 4-directional 1-islands.',
    '    r, c = map(int, lines[0].split())\n    g = [list(map(int, lines[i + 1].split())) for i in range(r)]',
    '    # TODO: flood fill count islands\n    print(0)',
    '    cnt = 0\n    for i in range(r):\n        for j in range(c):\n            if g[i][j] == 1:\n                cnt += 1\n                st = [(i, j)]\n                g[i][j] = 0\n                while st:\n                    x, y = st.pop()\n                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        nx, ny = x + dx, y + dy\n                        if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == 1:\n                            g[nx][ny] = 0; st.append((nx, ny))\n    print(cnt)',
    [{ input: '3 4\n1 1 0 0\n1 0 0 1\n0 0 1 1', expectedOutput: '2', description: '2 islands' }, { input: '2 2\n0 0\n0 0', expectedOutput: '0', description: 'Water only' }]
  ),
  pySpec(
    'bl-py-m10-02', 'medium', 600, 'Minimum Coin Sum DP',
    'Line 1 gives target amount T. Line 2 gives coin denominations. Print minimum coins for T, or -1.',
    '    t = int(lines[0])\n    coins = list(map(int, lines[1].split()))',
    '    # TODO: 1D DP min coins\n    print(-1)',
    '    INF = 10**9\n    dp = [0] + [INF] * t\n    for x in range(1, t + 1):\n        for c in coins:\n            if x >= c and dp[x - c] + 1 < dp[x]: dp[x] = dp[x - c] + 1\n    print(-1 if dp[t] >= INF else dp[t])',
    [{ input: '11\n1 2 5', expectedOutput: '3', description: '5+5+1' }, { input: '3\n2', expectedOutput: '-1', description: 'Impossible' }]
  ),
  pySpec(
    'bl-py-m10-03', 'medium', 600, 'Shortest Maze Grid Steps',
    'Line 1 gives r c. Grid of 0 (open) and 1 (wall). Print fewest 4-dir steps from (0,0) to (r-1,c-1) or -1.',
    '    r, c = map(int, lines[0].split())\n    g = [list(map(int, lines[i + 1].split())) for i in range(r)]',
    '    # TODO: BFS shortest path\n    print(-1)',
    '    from collections import deque\n    if g[0][0] or g[r-1][c-1]: print(-1); return\n    q = deque([(0, 0, 0)])\n    vis = {(0, 0)}\n    while q:\n        x, y, d = q.popleft()\n        if x == r - 1 and y == c - 1: print(d); return\n        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n            nx, ny = x + dx, y + dy\n            if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == 0 and (nx, ny) not in vis:\n                vis.add((nx, ny)); q.append((nx, ny, d + 1))\n    print(-1)',
    [{ input: '3 3\n0 1 0\n0 0 0\n1 1 0', expectedOutput: '4', description: '4 moves' }, { input: '2 2\n0 1\n1 0', expectedOutput: '-1', description: 'Blocked' }]
  ),
  pySpec(
    'bl-py-m10-04', 'medium', 600, 'Longest Consecutive Number Run',
    'Given unsorted integers, print length of longest consecutive elements sequence (x, x+1, x+2...).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: O(n) set streak check\n    print(0)',
    '    s = set(arr)\n    best = 0\n    for x in s:\n        if x - 1 not in s:\n            y = x\n            while y in s: y += 1\n            best = max(best, y - x)\n    print(best)',
    [{ input: '100 4 200 1 3 2', expectedOutput: '4', description: '1,2,3,4' }, { input: '9 1 4 7 3 -1 0 5 8 -1 6', expectedOutput: '7', description: '3..9' }]
  ),
  pySpec(
    'bl-py-m10-05', 'medium', 600, 'Equal Two-Subset Partition',
    'Print YES if integers can be partitioned into two subsets with equal sum, else NO.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: subset sum DP\n    print("NO")',
    '    tot = sum(arr)\n    if tot % 2: print("NO"); return\n    half = tot // 2\n    dp = {0}\n    for x in arr:\n        dp |= {s + x for s in dp if s + x <= half}\n    print("YES" if half in dp else "NO")',
    [{ input: '1 5 11 5', expectedOutput: 'YES', description: '{1,5,5} == {11}' }, { input: '1 2 3 5', expectedOutput: 'NO', description: 'Odd sum' }]
  ),
  pySpec(
    'bl-py-m10-06', 'medium', 600, 'Minimum Path Cost Matrix',
    'Line 1 gives r c. Next r lines hold non-negative costs. Moving right/down only, print min cost (0,0)->(r-1,c-1).',
    '    r, c = map(int, lines[0].split())\n    g = [list(map(int, lines[i + 1].split())) for i in range(r)]',
    '    # TODO: 2D grid DP min path\n    print(0)',
    '    for j in range(1, c): g[0][j] += g[0][j - 1]\n    for i in range(1, r):\n        g[i][0] += g[i - 1][0]\n        for j in range(1, c): g[i][j] += min(g[i - 1][j], g[i][j - 1])\n    print(g[r - 1][c - 1])',
    [{ input: '3 3\n1 3 1\n1 5 1\n4 2 1', expectedOutput: '7', description: '1+3+1+1+1=7' }, { input: '2 2\n1 2\n4 1', expectedOutput: '4', description: '1+2+1=4' }]
  ),
  pySpec(
    'bl-py-m10-07', 'medium', 600, 'Course Schedule Cycle Detector',
    'Line 1 gives n. Next lines give prerequisite edge "u v" (u before v). Print YES if all courses completable else NO.',
    '    n = int(lines[0])\n    edges = [tuple(map(int, l.split())) for l in lines[1:]]',
    '    # TODO: Kahn topological sort check\n    print("NO")',
    '    from collections import deque\n    adj = [[] for _ in range(n)]\n    ind = [0] * n\n    for u, v in edges:\n        adj[u].append(v); ind[v] += 1\n    q = deque(i for i in range(n) if ind[i] == 0)\n    done = 0\n    while q:\n        u = q.popleft(); done += 1\n        for v in adj[u]:\n            ind[v] -= 1\n            if ind[v] == 0: q.append(v)\n    print("YES" if done == n else "NO")',
    [{ input: '3\n0 1\n1 2', expectedOutput: 'YES', description: 'Linear chain' }, { input: '2\n0 1\n1 0', expectedOutput: 'NO', description: 'Cycle 0<->1' }]
  ),
  pySpec(
    'bl-py-m10-08', 'medium', 600, 'LRU Cache Hit Scorer',
    'Line 1 gives capacity cap. Remaining lines: "PUT k v" or "GET k". Print sum of successful GET values.',
    '    cap = int(lines[0])\n    ops = [l.split() for l in lines[1:]]',
    '    # TODO: OrderedDict LRU simulation\n    print(0)',
    '    from collections import OrderedDict\n    cache, ans = OrderedDict(), 0\n    for op in ops:\n        if op[0] == "PUT":\n            k, v = int(op[1]), int(op[2])\n            if k in cache: cache.move_to_end(k)\n            cache[k] = v\n            if len(cache) > cap: cache.popitem(last=False)\n        else:\n            k = int(op[1])\n            if k in cache:\n                cache.move_to_end(k)\n                ans += cache[k]\n    print(ans)',
    [{ input: '2\nPUT 1 10\nPUT 2 20\nGET 1\nPUT 3 30\nGET 2\nGET 3', expectedOutput: '40', description: '10 + 0 + 30' }, { input: '1\nPUT 1 5\nPUT 2 8\nGET 1\nGET 2', expectedOutput: '8', description: 'Cap 1 evicts 1' }]
  ),
  pySpec(
    'bl-py-m10-09', 'medium', 600, 'Peak Concurrent Meeting Rooms',
    'Lines give "start end" meetings. Print minimum rooms needed simultaneously (end == next start is OK).',
    '    iv = [tuple(map(int, l.split())) for l in lines]',
    '    # TODO: sweep line max concurrent meetings\n    print(0)',
    '    ev = []\n    for s, e in iv:\n        ev.append((s, 1)); ev.append((e, -1))\n    ev.sort(key=lambda x: (x[0], x[1]))\n    cur = best = 0\n    for _, d in ev:\n        cur += d\n        if cur > best: best = cur\n    print(best)',
    [{ input: '0 30\n5 10\n15 20', expectedOutput: '2', description: 'Needs 2 rooms' }, { input: '1 5\n5 9\n9 12', expectedOutput: '1', description: 'Touching back to back' }]
  ),
  pySpec(
    'bl-py-m10-10', 'medium', 600, 'Distinct Anagram Clusters Count',
    'Given space-separated words, group words that are anagrams and print total number of distinct groups.',
    '    words = lines[0].split()',
    '    # TODO: count unique anagram signatures\n    print(0)',
    '    print(len({"".join(sorted(w)) for w in words}))',
    [{ input: 'eat tea tan ate nat bat', expectedOutput: '3', description: '3 anagram groups' }, { input: 'abc cba bac cab', expectedOutput: '1', description: 'All 1 group' }]
  ),
];

const HARD_3M = [
  pySpec(
    'bl-py-h3-01', 'hard', 180, 'Maximum Subarray Surge Kadane',
    'Print largest possible sum of a non-empty contiguous subarray (handles all-negative inputs).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: Kadane algorithm\n    print(0)',
    '    cur = best = arr[0]\n    for x in arr[1:]:\n        cur = max(x, cur + x)\n        best = max(best, cur)\n    print(best)',
    [{ input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', description: '[4,-1,2,1]' }, { input: '-8 -3 -5', expectedOutput: '-3', description: 'All negative' }]
  ),
  pySpec(
    'bl-py-h3-02', 'hard', 180, 'Rainwater Elevation Trap',
    'Given non-negative bar heights, compute total trapped rainwater units using O(n) two-pointer scan.',
    '    h = list(map(int, lines[0].split()))',
    '    # TODO: two-pointer rainwater trap\n    print(0)',
    '    l, r = 0, len(h) - 1\n    lm = rm = ans = 0\n    while l < r:\n        if h[l] < h[r]:\n            lm = max(lm, h[l]); ans += lm - h[l]; l += 1\n        else:\n            rm = max(rm, h[r]); ans += rm - h[r]; r -= 1\n    print(ans)',
    [{ input: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', description: 'Traps 6 units' }, { input: '4 2 0 3 2 5', expectedOutput: '9', description: 'Traps 9 units' }]
  ),
  pySpec(
    'bl-py-h3-03', 'hard', 180, 'Optimal Single Stock Flip',
    'Given daily stock prices, print max profit from at most 1 buy followed by 1 sell (0 if none).',
    '    p = list(map(int, lines[0].split()))',
    '    # TODO: min-price tracker\n    print(0)',
    '    low, best = p[0], 0\n    for x in p:\n        low = min(low, x)\n        best = max(best, x - low)\n    print(best)',
    [{ input: '7 1 5 3 6 4', expectedOutput: '5', description: 'Buy 1 sell 6' }, { input: '7 6 4 3 1', expectedOutput: '0', description: 'No profit' }]
  ),
  pySpec(
    'bl-py-h3-04', 'hard', 180, 'Maximum Product Subarray Signs',
    'Given integers (may include negatives and zeros), print largest contiguous subarray product.',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: track cur_max and cur_min\n    print(0)',
    '    hi = lo = ans = arr[0]\n    for x in arr[1:]:\n        cands = (x, hi * x, lo * x)\n        hi, lo = max(cands), min(cands)\n        ans = max(ans, hi)\n    print(ans)',
    [{ input: '2 3 -2 4', expectedOutput: '6', description: '2*3=6' }, { input: '-2 3 -4', expectedOutput: '24', description: '-2*3*-4=24' }]
  ),
  pySpec(
    'bl-py-h3-05', 'hard', 180, 'Minimum Speed Banana Finish',
    'Line 1 gives hours h. Line 2 gives pile sizes. Find min integer rate k per hour so sum(ceil(p/k)) <= h.',
    '    h = int(lines[0])\n    piles = list(map(int, lines[1].split()))',
    '    # TODO: binary search min k\n    print(1)',
    '    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if sum((p + mid - 1) // mid for p in piles) <= h: hi = mid\n        else: lo = mid + 1\n    print(lo)',
    [{ input: '8\n3 6 7 11', expectedOutput: '4', description: 'Rate 4 fits 8h' }, { input: '5\n30 11 23 4 20', expectedOutput: '30', description: 'Exact len' }]
  ),
  pySpec(
    'bl-py-h3-06', 'hard', 180, 'Solo Non-Duplicate Sorted Scan',
    'Sorted array has every element twice except one unique element. Print that single element in O(log n).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: even/odd binary search\n    print(0)',
    '    lo, hi = 0, len(arr) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if mid % 2 == 1: mid -= 1\n        if arr[mid] == arr[mid + 1]: lo = mid + 2\n        else: hi = mid\n    print(arr[lo])',
    [{ input: '1 1 2 3 3 4 4 8 8', expectedOutput: '2', description: 'Unique 2' }, { input: '3 3 7 7 10 11 11', expectedOutput: '10', description: 'Unique 10' }]
  ),
  pySpec(
    'bl-py-h3-07', 'hard', 180, 'Minimal Length Target Subarray',
    'Line 1 gives target T. Line 2 gives positive ints. Print min subarray length with sum >= T (0 if none).',
    '    t = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: two-pointer min len >= t\n    print(0)',
    '    l = s = 0\n    best = 10**9\n    for r, x in enumerate(arr):\n        s += x\n        while s >= t:\n            best = min(best, r - l + 1)\n            s -= arr[l]; l += 1\n    print(0 if best >= 10**9 else best)',
    [{ input: '7\n2 3 1 2 4 3', expectedOutput: '2', description: '[4,3]' }, { input: '50\n1 2 3', expectedOutput: '0', description: 'Impossible' }]
  ),
  pySpec(
    'bl-py-h3-08', 'hard', 180, 'Circular Gas Route Index',
    'Line 1: gas[i]. Line 2: cost[i]. Print starting station index allowing clockwise tour, else -1.',
    '    gas = list(map(int, lines[0].split()))\n    cost = list(map(int, lines[1].split()))',
    '    # TODO: greedy reset on negative tank\n    print(-1)',
    '    if sum(gas) < sum(cost): print(-1); return\n    tank = start = 0\n    for i in range(len(gas)):\n        tank += gas[i] - cost[i]\n        if tank < 0:\n            tank = 0; start = i + 1\n    print(start)',
    [{ input: '1 2 3 4 5\n3 4 5 1 2', expectedOutput: '3', description: 'Start at 3' }, { input: '2 3 4\n3 4 3', expectedOutput: '-1', description: 'Short gas' }]
  ),
  pySpec(
    'bl-py-h3-09', 'hard', 180, 'Smallest Parenthesis Deletion Count',
    'Print minimum number of parentheses deletions required to make string of ( and ) valid.',
    '    s = lines[0]',
    '    # TODO: count unmatched parens\n    print(0)',
    '    open_c = rem = 0\n    for c in s:\n        if c == "(": open_c += 1\n        elif open_c > 0: open_c -= 1\n        else: rem += 1\n    print(open_c + rem)',
    [{ input: '())(()', expectedOutput: '2', description: 'Remove 2' }, { input: '((())', expectedOutput: '1', description: 'Remove 1' }]
  ),
  pySpec(
    'bl-py-h3-10', 'hard', 180, 'Alternating Parity Longest Span',
    'Print length of longest contiguous subarray where adjacent elements have different parity (odd vs even).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: alternating parity run\n    print(0)',
    '    cur = best = 1\n    for i in range(1, len(arr)):\n        cur = cur + 1 if (arr[i] & 1) != (arr[i - 1] & 1) else 1\n        best = max(best, cur)\n    print(best)',
    [{ input: '10 12 14 7 8 11', expectedOutput: '4', description: '14,7,8,11' }, { input: '2 4 6', expectedOutput: '1', description: 'All even' }]
  ),
];

const HARD_5M = [
  pySpec(
    'bl-py-h5-01', 'hard', 300, 'Circular Street House Loot',
    'Houses in a circle have values arr[i]. Print max sum without robbing two adjacent houses (n >= 2).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: two linear DP passes\n    print(0)',
    '    def rob(a):\n        p2 = p1 = 0\n        for x in a: p2, p1 = p1, max(p1, p2 + x)\n        return p1\n    print(arr[0] if len(arr) == 1 else max(rob(arr[:-1]), rob(arr[1:])))',
    [{ input: '2 3 2', expectedOutput: '3', description: 'Middle only' }, { input: '1 2 3 1', expectedOutput: '4', description: '1+3=4' }]
  ),
  pySpec(
    'bl-py-h5-02', 'hard', 300, 'Longest Strictly Increasing Subseq',
    'Print length of the longest strictly increasing subsequence (LIS).',
    '    arr = list(map(int, lines[0].split()))',
    '    # TODO: patience binary search LIS\n    print(0)',
    '    import bisect\n    tails = []\n    for x in arr:\n        i = bisect.bisect_left(tails, x)\n        if i == len(tails): tails.append(x)\n        else: tails[i] = x\n    print(len(tails))',
    [{ input: '10 9 2 5 3 7 101 18', expectedOutput: '4', description: '2,3,7,101' }, { input: '7 7 7 7', expectedOutput: '1', description: 'Strictly increasing -> 1' }]
  ),
  pySpec(
    'bl-py-h5-03', 'hard', 300, 'Matrix Spiral Traversal Stream',
    'Line 1 gives r c. Next r lines give matrix ints. Print clockwise spiral traversal space-joined.',
    '    r, c = map(int, lines[0].split())\n    g = [list(map(int, lines[i + 1].split())) for i in range(r)]',
    '    # TODO: print spiral elements\n    print("")',
    '    top, bot, left, right, out = 0, r - 1, 0, c - 1, []\n    while top <= bot and left <= right:\n        for j in range(left, right + 1): out.append(g[top][j])\n        top += 1\n        for i in range(top, bot + 1): out.append(g[i][right])\n        right -= 1\n        if top <= bot:\n            for j in range(right, left - 1, -1): out.append(g[bot][j])\n            bot -= 1\n        if left <= right:\n            for i in range(bot, top - 1, -1): out.append(g[i][left])\n            left += 1\n    print(" ".join(map(str, out)))',
    [{ input: '3 3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '1 2 3 6 9 8 7 4 5', description: '3x3 spiral' }, { input: '2 3\n1 2 3\n4 5 6', expectedOutput: '1 2 3 6 5 4', description: '2x3 spiral' }]
  ),
  pySpec(
    'bl-py-h5-04', 'hard', 300, 'Dictionary Word Segmentation',
    'Line 1 gives string s. Line 2 gives space-separated dictionary words. Print YES if s breaks into words else NO.',
    '    s = lines[0]\n    words = set(lines[1].split())',
    '    # TODO: word break DP\n    print("NO")',
    '    n = len(s)\n    dp = [True] + [False] * n\n    for i in range(1, n + 1):\n        dp[i] = any(dp[j] and s[j:i] in words for j in range(i))\n    print("YES" if dp[n] else "NO")',
    [{ input: 'kollabrixarena\nkollabrix arena', expectedOutput: 'YES', description: 'Splits cleanly' }, { input: 'catsandog\ncats dog sand and cat', expectedOutput: 'NO', description: 'Overlap trapped' }]
  ),
  pySpec(
    'bl-py-h5-05', 'hard', 300, 'Longest Common Subsequence Span',
    'Lines 1 and 2 hold strings s and t. Print length of their longest common subsequence.',
    '    s, t = lines[0], lines[1]',
    '    # TODO: LCS DP\n    print(0)',
    '    m, n = len(s), len(t)\n    dp = [0] * (n + 1)\n    for i in range(m):\n        prev = 0\n        for j in range(n):\n            tmp = dp[j + 1]\n            dp[j + 1] = prev + 1 if s[i] == t[j] else max(dp[j + 1], dp[j])\n            prev = tmp\n    print(dp[n])',
    [{ input: 'abcde\nace', expectedOutput: '3', description: 'ace len 3' }, { input: 'abc\ndef', expectedOutput: '0', description: 'Disjoint' }]
  ),
  pySpec(
    'bl-py-h5-06', 'hard', 300, 'Minimum Levenshtein Edit Cost',
    'Lines 1 and 2 hold strings a and b. Print minimum insert/delete/replace operations to convert a into b.',
    '    a, b = lines[0], lines[1]',
    '    # TODO: edit distance DP\n    print(0)',
    '    m, n = len(a), len(b)\n    dp = list(range(n + 1))\n    for i in range(1, m + 1):\n        ndp = [i] + [0] * n\n        for j in range(1, n + 1):\n            ndp[j] = dp[j - 1] if a[i - 1] == b[j - 1] else 1 + min(dp[j], ndp[j - 1], dp[j - 1])\n        dp = ndp\n    print(dp[n])',
    [{ input: 'horse\nros', expectedOutput: '3', description: '3 edits' }, { input: 'intention\nexecution', expectedOutput: '5', description: '5 edits' }]
  ),
  pySpec(
    'bl-py-h5-07', 'hard', 300, 'Obstacle Grid Distinct Routes',
    'Line 1 gives r c. Grid of 0 (free) and 1 (obstacle). Count paths from (0,0) to (r-1,c-1) moving right/down.',
    '    r, c = map(int, lines[0].split())\n    g = [list(map(int, lines[i + 1].split())) for i in range(r)]',
    '    # TODO: obstacle DP paths\n    print(0)',
    '    dp = [0] * c\n    dp[0] = 0 if g[0][0] else 1\n    for i in range(r):\n        for j in range(c):\n            if g[i][j]: dp[j] = 0\n            elif j > 0: dp[j] += dp[j - 1]\n    print(dp[-1])',
    [{ input: '3 3\n0 0 0\n0 1 0\n0 0 0', expectedOutput: '2', description: 'Two bypass routes' }, { input: '2 2\n0 1\n0 0', expectedOutput: '1', description: 'Down then right' }]
  ),
  pySpec(
    'bl-py-h5-08', 'hard', 300, 'Maximal Solid Square Area',
    'Line 1 gives r c. Binary 0/1 grid. Print area (side^2) of largest square filled entirely with 1s.',
    '    r, c = map(int, lines[0].split())\n    g = [list(map(int, lines[i + 1].split())) for i in range(r)]',
    '    # TODO: square DP side^2\n    print(0)',
    '    dp = [[0] * (c + 1) for _ in range(r + 1)]\n    best = 0\n    for i in range(1, r + 1):\n        for j in range(1, c + 1):\n            if g[i - 1][j - 1]:\n                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])\n                best = max(best, dp[i][j])\n    print(best * best)',
    [{ input: '4 5\n1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0', expectedOutput: '4', description: '2x2 = area 4' }, { input: '2 2\n1 1\n1 1', expectedOutput: '4', description: 'Full 2x2' }]
  ),
  pySpec(
    'bl-py-h5-09', 'hard', 300, 'Sliding Window Deque Peaks',
    'Line 1 gives k. Line 2 gives integers. Print the maximum in every window of size k space-joined.',
    '    k = int(lines[0])\n    arr = list(map(int, lines[1].split()))',
    '    # TODO: monotonic deque window max\n    print("")',
    '    from collections import deque\n    dq, out = deque(), []\n    for i, x in enumerate(arr):\n        while dq and dq[0] <= i - k: dq.popleft()\n        while dq and arr[dq[-1]] <= x: dq.pop()\n        dq.append(i)\n        if i >= k - 1: out.append(arr[dq[0]])\n    print(" ".join(map(str, out)))',
    [{ input: '3\n1 3 -1 -3 5 3 6 7', expectedOutput: '3 3 5 5 6 7', description: 'Window maxes' }, { input: '1\n9 4 7', expectedOutput: '9 4 7', description: 'k=1' }]
  ),
  pySpec(
    'bl-py-h5-10', 'hard', 300, 'Numeric Cipher Decode Count',
    'Digits string (1->A..26->Z). Print total ways to decode the digit string (0 on invalid like 06).',
    '    s = lines[0]',
    '    # TODO: 1D DP decode count\n    print(0)',
    '    if not s or s[0] == "0": print(0); return\n    p2, p1 = 1, 1\n    for i in range(1, len(s)):\n        cur = p1 if s[i] != "0" else 0\n        if 10 <= int(s[i - 1:i + 1]) <= 26: cur += p2\n        p2, p1 = p1, cur\n    print(p1)',
    [{ input: '226', expectedOutput: '3', description: 'BZ, VF, BBF' }, { input: '06', expectedOutput: '0', description: 'Leading zero invalid' }]
  ),
];

const HARD_10M = [
  pySpec(
    'bl-py-h10-01', 'hard', 600, 'Zero-One Knapsack Optimal Load',
    'Line 1: capacity W. Line 2: weights. Line 3: values. Print maximum total value fitting within capacity W.',
    '    W = int(lines[0])\n    wt = list(map(int, lines[1].split()))\n    val = list(map(int, lines[2].split()))',
    '    # TODO: 0/1 knapsack 1D DP\n    print(0)',
    '    dp = [0] * (W + 1)\n    for w, v in zip(wt, val):\n        for c in range(W, w - 1, -1):\n            dp[c] = max(dp[c], dp[c - w] + v)\n    print(dp[W])',
    [{ input: '5\n1 2 3\n10 15 40', expectedOutput: '55', description: 'w=2+3 -> 15+40' }, { input: '4\n4 5\n10 20', expectedOutput: '10', description: 'Only item 0 fits' }]
  ),
  pySpec(
    'bl-py-h10-02', 'hard', 600, 'Dijkstra Weighted Hub Route',
    'Line 1 gives n. Directed weighted edges "u v w". Print shortest path distance from 0 to n-1, or -1.',
    '    n = int(lines[0])\n    edges = [tuple(map(int, l.split())) for l in lines[1:]]',
    '    # TODO: Dijkstra min-heap shortest path\n    print(-1)',
    '    import heapq\n    adj = [[] for _ in range(n)]\n    for u, v, w in edges: adj[u].append((v, w))\n    dist = [10**18] * n; dist[0] = 0; pq = [(0, 0)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in adj[u]:\n            if d + w < dist[v]:\n                dist[v] = d + w; heapq.heappush(pq, (dist[v], v))\n    print(-1 if dist[n - 1] >= 10**18 else dist[n - 1])',
    [{ input: '4\n0 1 4\n0 2 1\n2 1 2\n1 3 1\n2 3 5', expectedOutput: '4', description: '0->2->1->3 = 4' }, { input: '3\n0 1 2', expectedOutput: '-1', description: 'Unreachable node 2' }]
  ),
  pySpec(
    'bl-py-h10-03', 'hard', 600, 'K-Stops Bounded Flight Fare',
    'Line 1: n K. Remaining lines: "u v cost". Print min cost from 0 to n-1 with at most K intermediate stops, or -1.',
    '    n, k = map(int, lines[0].split())\n    edges = [tuple(map(int, l.split())) for l in lines[1:]]',
    '    # TODO: Bellman-Ford K+1 steps\n    print(-1)',
    '    INF = 10**18\n    dist = [INF] * n; dist[0] = 0\n    for _ in range(k + 1):\n        nd = dist[:]\n        for u, v, w in edges:\n            if dist[u] < INF and dist[u] + w < nd[v]: nd[v] = dist[u] + w\n        dist = nd\n    print(-1 if dist[n - 1] >= INF else dist[n - 1])',
    [{ input: '4 1\n0 1 100\n1 2 100\n2 3 100\n0 2 500', expectedOutput: '600', description: 'Max 1 stop via node 2' }, { input: '4 2\n0 1 100\n1 2 100\n2 3 100\n0 2 500', expectedOutput: '300', description: '2 stops allowed' }]
  ),
  pySpec(
    'bl-py-h10-04', 'hard', 600, 'Lexicographical Dependency Order',
    'Line 1 gives n. Edges "u v" mean u before v. Print lexicographically smallest topo order space-joined, or IMPOSSIBLE.',
    '    n = int(lines[0])\n    edges = [tuple(map(int, l.split())) for l in lines[1:]]',
    '    # TODO: min-heap topological order\n    print("IMPOSSIBLE")',
    '    import heapq\n    adj = [[] for _ in range(n)]\n    ind = [0] * n\n    for u, v in edges: adj[u].append(v); ind[v] += 1\n    pq = [i for i in range(n) if ind[i] == 0]; heapq.heapify(pq)\n    out = []\n    while pq:\n        u = heapq.heappop(pq); out.append(u)\n        for v in adj[u]:\n            ind[v] -= 1\n            if ind[v] == 0: heapq.heappush(pq, v)\n    print(" ".join(map(str, out)) if len(out) == n else "IMPOSSIBLE")',
    [{ input: '4\n1 0\n2 0\n3 1\n3 2', expectedOutput: '3 1 2 0', description: 'Lex topo order' }, { input: '2\n0 1\n1 0', expectedOutput: 'IMPOSSIBLE', description: 'Cycle' }]
  ),
  pySpec(
    'bl-py-h10-05', 'hard', 600, 'N-Queens Distinct Solutions',
    'Given integer n (1 <= n <= 9), print number of distinct non-attacking N-Queens board placements.',
    '    n = int(lines[0])',
    '    # TODO: backtracking queen columns + diags\n    print(0)',
    '    cols, d1, d2 = set(), set(), set()\n    def bt(r):\n        if r == n: return 1\n        ans = 0\n        for c in range(n):\n            if c in cols or (r - c) in d1 or (r + c) in d2: continue\n            cols.add(c); d1.add(r - c); d2.add(r + c)\n            ans += bt(r + 1)\n            cols.remove(c); d1.remove(r - c); d2.remove(r + c)\n        return ans\n    print(bt(0))',
    [{ input: '4', expectedOutput: '2', description: 'N=4 has 2' }, { input: '8', expectedOutput: '92', description: 'Classic 8-queens' }]
  ),
  pySpec(
    'bl-py-h10-06', 'hard', 600, 'Skyline Histogram Max Area',
    'Given bar heights width=1 each, print area of largest rectangle inside histogram.',
    '    h = list(map(int, lines[0].split()))',
    '    # TODO: monotonic stack histogram area\n    print(0)',
    '    st, best = [], 0\n    for i, x in enumerate(h + [0]):\n        while st and h[st[-1]] > x:\n            ht = h[st.pop()]\n            w = i if not st else i - st[-1] - 1\n            best = max(best, ht * w)\n        st.append(i)\n    print(best)',
    [{ input: '2 1 5 6 2 3', expectedOutput: '10', description: '5*2=10' }, { input: '2 4', expectedOutput: '4', description: 'Height 4 bar' }]
  ),
  pySpec(
    'bl-py-h10-07', 'hard', 600, 'Palindromic Substrings Total',
    'Count how many total contiguous substrings of s are palindromes (duplicates at different positions count).',
    '    s = lines[0]',
    '    # TODO: expand around all centers\n    print(0)',
    '    n, ans = len(s), 0\n    for c in range(2 * n - 1):\n        l, r = c // 2, (c + 1) // 2\n        while l >= 0 and r < n and s[l] == s[r]:\n            ans += 1; l -= 1; r += 1\n    print(ans)',
    [{ input: 'aaa', expectedOutput: '6', description: '3+2+1=6' }, { input: 'abc', expectedOutput: '3', description: 'Single chars only' }]
  ),
  pySpec(
    'bl-py-h10-08', 'hard', 600, 'Longest Well-Formed Paren Slice',
    'Given string of ( and ), print length of longest contiguous valid well-formed substring.',
    '    s = lines[0]',
    '    # TODO: stack of unmatched indices\n    print(0)',
    '    st, best = [-1], 0\n    for i, ch in enumerate(s):\n        if ch == "(": st.append(i)\n        else:\n            st.pop()\n            if not st: st.append(i)\n            else: best = max(best, i - st[-1])\n    print(best)',
    [{ input: ')()())', expectedOutput: '4', description: '()()' }, { input: '((()', expectedOutput: '2', description: '()' }]
  ),
  pySpec(
    'bl-py-h10-09', 'hard', 600, 'Minimum Sliding Cover Length',
    'Line 1 gives s. Line 2 gives t. Print length of shortest substring of s containing all chars of t with multiplicity, or 0.',
    '    s, t = lines[0], lines[1]',
    '    # TODO: minimal window substring len\n    print(0)',
    '    from collections import Counter\n    need = Counter(t); missing = len(t); l = 0; best = 10**9\n    for r, ch in enumerate(s):\n        if need[ch] > 0: missing -= 1\n        need[ch] -= 1\n        while missing == 0:\n            best = min(best, r - l + 1)\n            need[s[l]] += 1\n            if need[s[l]] > 0: missing += 1\n            l += 1\n    print(0 if best >= 10**9 else best)',
    [{ input: 'ADOBECODEBANC\nABC', expectedOutput: '4', description: 'BANC' }, { input: 'a\naa', expectedOutput: '0', description: 'Not enough chars' }]
  ),
  pySpec(
    'bl-py-h10-10', 'hard', 600, 'Coin Combinations Way Count',
    'Line 1: target amount T. Line 2: distinct coins. Print number of unordered combinations summing to T.',
    '    t = int(lines[0])\n    coins = list(map(int, lines[1].split()))',
    '    # TODO: unbounded coin ways DP\n    print(0)',
    '    dp = [1] + [0] * t\n    for c in coins:\n        for x in range(c, t + 1): dp[x] += dp[x - c]\n    print(dp[t])',
    [{ input: '5\n1 2 5', expectedOutput: '4', description: '4 combinations' }, { input: '3\n2', expectedOutput: '0', description: 'No way' }]
  ),
];

export const PYTHON_BLITZ_QUESTIONS = [
  ...EASY_3M,
  ...EASY_5M,
  ...EASY_10M,
  ...MEDIUM_3M,
  ...MEDIUM_5M,
  ...MEDIUM_10M,
  ...HARD_3M,
  ...HARD_5M,
  ...HARD_10M,
];
