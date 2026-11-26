import { makeCodeBug } from './builders.mjs';

/**
 * 90 unique Python Bug Hunt challenges (10 per Easy/Med/Hard × 3m/5m/10m).
 * Easy: 2-3 clear bugs; Medium: 3-4 trickier bugs; Hard: 4-5 subtle tricky bugs.
 * Complete solution is present in starter code (no spoiler comments).
 */
function pyBug(id, difficulty, durationSecs, title, description, buggyCode, fixedCode, testCases) {
  return makeCodeBug({
    id,
    lang: 'python',
    title,
    difficulty,
    durationSecs,
    description,
    buggyCode,
    fixedCode,
    testCases,
  });
}

// ---------- EASY (2-3 straightforward bugs, 3m/5m/10m x 10 each = 30) ----------
const PY_BUG_EASY = [
  // Easy 3m (10)
  pyBug('bh-py-e3-01', 'easy', 180, 'Fix Factorial Loop & Seed',
    'Goal: Print N! for integer N >= 0. Symptom: Always outputs 0 or skips N.',
    `n = int(input().strip())\nans = 0\nfor i in range(0, n):\n    ans *= i\nprint(ans)`,
    `n = int(input().strip())\nans = 1\nfor i in range(1, n + 1):\n    ans *= i\nprint(ans)`,
    [{ input: '5', expectedOutput: '120', description: '5! = 120' }, { input: '0', expectedOutput: '1', description: '0! = 1' }]),

  pyBug('bh-py-e3-02', 'easy', 180, 'Fix Negative Max Tracker',
    'Goal: Print maximum integer in array (including all-negative inputs) multiplied by its sign check count? No: print max value and total negative elements sum? Even clearer: print largest element in array.',
    `arr = list(map(int, input().split()))\nbest = 0\nfor x in arr[1:]:\n    if x < best:\n        best = x\nprint(best)`,
    `arr = list(map(int, input().split()))\nbest = arr[0]\nfor x in arr[1:]:\n    if x > best:\n        best = x\nprint(best)`,
    [{ input: '-12 -4 -9', expectedOutput: '-4', description: 'Largest negative' }, { input: '3 9 2', expectedOutput: '9', description: 'Positive max' }]),

  pyBug('bh-py-e3-03', 'easy', 180, 'Fix Vowel Scanner Count',
    'Goal: Count vowels (a,e,i,o,u case-insensitive) in word. Symptom: Under-counts uppercase vowels and resets count.',
    `s = input().strip()\ncnt = 0\nfor ch in s:\n    if ch in "aeio":\n        cnt = 1\nprint(cnt)`,
    `s = input().strip().lower()\ncnt = 0\nfor ch in s:\n    if ch in "aeiou":\n        cnt += 1\nprint(cnt)`,
    [{ input: 'KOLLABRIX', expectedOutput: '3', description: 'O,A,I -> 3' }, { input: 'queue', expectedOutput: '4', description: 'u,e,u,e -> 4' }]),

  pyBug('bh-py-e3-04', 'easy', 180, 'Fix Even Sum Filter',
    'Goal: Print sum of all EVEN numbers in input list. Symptom: Adds indices instead of values and checks odd remainder.',
    `nums = list(map(int, input().split()))\ntot = 1\nfor i in range(len(nums)):\n    if nums[i] % 2 == 1:\n        tot += i\nprint(tot)`,
    `nums = list(map(int, input().split()))\ntot = 0\nfor i in range(len(nums)):\n    if nums[i] % 2 == 0:\n        tot += nums[i]\nprint(tot)`,
    [{ input: '2 5 4 7 6', expectedOutput: '12', description: '2+4+6=12' }, { input: '1 3 5', expectedOutput: '0', description: 'No evens' }]),

  pyBug('bh-py-e3-05', 'easy', 180, 'Fix Reverse Integer Sign',
    'Goal: Reverse decimal digits of integer n preserving sign (e.g. -120 -> -21). Symptom: Drops minus sign and fails zero.',
    `n = int(input().strip())\ns = str(n)\nres = int(s[::-1])\nprint(res)`,
    `n = int(input().strip())\nsign = -1 if n < 0 else 1\ns = str(abs(n))\nres = sign * int(s[::-1])\nprint(res)`,
    [{ input: '-120', expectedOutput: '-21', description: 'Negative reverse' }, { input: '405', expectedOutput: '504', description: 'Positive reverse' }]),

  pyBug('bh-py-e3-06', 'easy', 180, 'Fix Palindrome Case Output',
    'Goal: Print YES if string is case-insensitive palindrome else NO. Symptom: Case mismatch and prints lowercase.',
    `s = input().strip()\nif s == s[:-1]:\n    print("yes")\nelse:\n    print("no")`,
    `s = input().strip().lower()\nif s == s[::-1]:\n    print("YES")\nelse:\n    print("NO")`,
    [{ input: 'Level', expectedOutput: 'YES', description: 'Case-insensitive' }, { input: 'Arena', expectedOutput: 'NO', description: 'Not palindrome' }]),

  pyBug('bh-py-e3-07', 'easy', 180, 'Fix Power Base Exponent',
    'Goal: Read a and b, print a^b. Symptom: Multiplies a*b and flips base/exponent loop count.',
    `a, b = map(int, input().split())\nres = 0\nfor _ in range(a):\n    res += b\nprint(res)`,
    `a, b = map(int, input().split())\nres = 1\nfor _ in range(b):\n    res *= a\nprint(res)`,
    [{ input: '2 5', expectedOutput: '32', description: '2^5 = 32' }, { input: '7 0', expectedOutput: '1', description: 'a^0 = 1' }]),

  pyBug('bh-py-e3-08', 'easy', 180, 'Fix Leap Year Divisor',
    'Goal: Print YES if year is leap year (div 400 or div 4 not 100), else NO. Symptom: Accepts 1900 and prints False.',
    `y = int(input().strip())\nif y % 4 == 0 and y % 100 == 0:\n    print("YES")\nelse:\n    print("NO")`,
    `y = int(input().strip())\nif y % 400 == 0 or (y % 4 == 0 and y % 100 != 0):\n    print("YES")\nelse:\n    print("NO")`,
    [{ input: '2000', expectedOutput: 'YES', description: '400 leap' }, { input: '1900', expectedOutput: 'NO', description: 'Century not 400' }]),

  pyBug('bh-py-e3-09', 'easy', 180, 'Fix Target Occurrence Index',
    'Goal: Line 1 target t, Line 2 array. Print LAST 0-based index of t or -1. Symptom: Returns FIRST index and uses 1-based offset.',
    `t = int(input().strip())\narr = list(map(int, input().split()))\npos = -1\nfor i, x in enumerate(arr):\n    if x == t:\n        pos = i + 1\n        break\nprint(pos)`,
    `t = int(input().strip())\narr = list(map(int, input().split()))\npos = -1\nfor i, x in enumerate(arr):\n    if x == t:\n        pos = i\nprint(pos)`,
    [{ input: '4\n1 4 2 4 9', expectedOutput: '3', description: 'Last 4 at index 3' }, { input: '7\n1 2 3', expectedOutput: '-1', description: 'Missing target' }]),

  pyBug('bh-py-e3-10', 'easy', 180, 'Fix Space Counter Sentence',
    'Goal: Count actual words separated by whitespace in a line. Symptom: Counts characters instead of splitting words and adds 1.',
    `line = input()\nwords = len(line)\nprint(words + 1)`,
    `line = input().strip()\nwords = len(line.split()) if line else 0\nprint(words)`,
    [{ input: '  code   build   ship  ', expectedOutput: '3', description: '3 words extra spaces' }, { input: 'kollabrix', expectedOutput: '1', description: 'Single word' }]),

  // Easy 5m (10)
  pyBug('bh-py-e5-01', 'easy', 300, 'Fix FizzBuzz Priority Check',
    'Goal: For 1..n print FizzBuzz if div by 15, Fizz by 3, Buzz by 5, else i, space-joined. Symptom: Checks 3 before 15 so 15 prints Fizz.',
    `n = int(input().strip())\nout = []\nfor i in range(0, n):\n    if i % 3 == 0: out.append("Fizz")\n    elif i % 5 == 0: out.append("Buzz")\n    elif i % 15 == 0: out.append("FizzBuzz")\n    else: out.append(str(i))\nprint(" ".join(out))`,
    `n = int(input().strip())\nout = []\nfor i in range(1, n + 1):\n    if i % 15 == 0: out.append("FizzBuzz")\n    elif i % 3 == 0: out.append("Fizz")\n    elif i % 5 == 0: out.append("Buzz")\n    else: out.append(str(i))\nprint(" ".join(out))`,
    [{ input: '5', expectedOutput: '1 2 Fizz 4 Buzz', description: '1..5' }, { input: '15', expectedOutput: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz', description: 'Ends with FizzBuzz' }]),

  pyBug('bh-py-e5-02', 'easy', 300, 'Fix GCD Euclidean Modulo',
    'Goal: Print GCD of positive integers a and b. Symptom: Infinite/wrong subtraction and prints b.',
    `a, b = map(int, input().split())\nwhile b != 0:\n    a = a - b\n    a, b = b, a\nprint(b)`,
    `a, b = map(int, input().split())\nwhile b != 0:\n    a, b = b, a % b\nprint(a)`,
    [{ input: '48 18', expectedOutput: '6', description: 'GCD(48,18)=6' }, { input: '17 13', expectedOutput: '1', description: 'Coprime' }]),

  pyBug('bh-py-e5-03', 'easy', 300, 'Fix Armstrong Cubic Validator',
    'Goal: Print YES if 3-digit integer equals sum of cubes of digits else NO. Symptom: Mutates original n before comparing.',
    `n = int(input().strip())\ns = 0\nwhile n > 0:\n    d = n % 10\n    s += d * 3\n    n //= 10\nprint("YES" if s == n else "NO")`,
    `n = int(input().strip())\norig = n\ns = 0\nwhile n > 0:\n    d = n % 10\n    s += d ** 3\n    n //= 10\nprint("YES" if s == orig else "NO")`,
    [{ input: '371', expectedOutput: 'YES', description: '371 is Armstrong' }, { input: '125', expectedOutput: 'NO', description: 'Not Armstrong' }]),

  pyBug('bh-py-e5-04', 'easy', 300, 'Fix Second Max Distinct Guard',
    'Goal: Print second largest unique int, or -1 if none. Symptom: Returns largest duplicate on [9,9,4].',
    `arr = list(map(int, input().split()))\narr.sort()\nif len(arr) < 2:\n    print(-1)\nelse:\n    print(arr[1])`,
    `arr = sorted(set(map(int, input().split())), reverse=True)\nif len(arr) < 2:\n    print(-1)\nelse:\n    print(arr[1])`,
    [{ input: '9 9 4 2', expectedOutput: '4', description: 'Second unique is 4' }, { input: '8 8 8', expectedOutput: '-1', description: 'No second unique' }]),

  pyBug('bh-py-e5-05', 'easy', 300, 'Fix Prime Primality Loop Bound',
    'Goal: Print PRIME if integer n >= 2 is prime else NOT_PRIME. Symptom: Marks 4 as prime and 1 as prime.',
    `n = int(input().strip())\nok = True\nfor d in range(2, n // 2):\n    if n % d == 0:\n        ok = False\nprint("PRIME" if ok else "NOT_PRIME")`,
    `n = int(input().strip())\nok = n >= 2\nfor d in range(2, int(n ** 0.5) + 1):\n    if n % d == 0:\n        ok = False\n        break\nprint("PRIME" if ok else "NOT_PRIME")`,
    [{ input: '4', expectedOutput: 'NOT_PRIME', description: '4 composite' }, { input: '17', expectedOutput: 'PRIME', description: '17 prime' }]),

  pyBug('bh-py-e5-06', 'easy', 300, 'Fix Frequency Winner Key',
    'Goal: Print integer appearing most frequently (tie -> smallest value). Symptom: Picks largest value on tie or returns count instead of value.',
    `arr = list(map(int, input().split()))\nfrom collections import Counter\nc = Counter(arr)\nbest_val, best_cnt = 0, -1\nfor k, v in c.items():\n    if v >= best_cnt:\n        best_cnt = v\n        best_val = k\nprint(best_cnt)`,
    `arr = list(map(int, input().split()))\nfrom collections import Counter\nc = Counter(arr)\nbest_val, best_cnt = None, -1\nfor k, v in sorted(c.items()):\n    if v > best_cnt:\n        best_cnt = v\n        best_val = k\nprint(best_val)`,
    [{ input: '5 2 5 2 9', expectedOutput: '2', description: 'Tie 2 vs 5 -> 2' }, { input: '7 7 1 3 7', expectedOutput: '7', description: 'Mode 7' }]),

  pyBug('bh-py-e5-07', 'easy', 300, 'Fix List Rotate Modulo Sign',
    'Goal: Line 1 k, Line 2 array. Rotate array RIGHT by k positions. Symptom: Rotates left and fails if k >= len(arr).',
    `k = int(input().strip())\narr = input().split()\nres = arr[k:] + arr[:k]\nprint(" ".join(res))`,
    `k = int(input().strip()) % len(arr if False else (arr := input().split()))\nres = arr[-k:] + arr[:-k] if k else arr\nprint(" ".join(res))`,
    [{ input: '2\n1 2 3 4 5', expectedOutput: '4 5 1 2 3', description: 'Right shift 2' }, { input: '7\n1 2 3', expectedOutput: '3 1 2', description: 'k wrap' }]),

  pyBug('bh-py-e5-08', 'easy', 300, 'Fix Sorted Insertion Check',
    'Goal: Print YES if array is non-decreasing (arr[i] >= arr[i-1]) else NO. Symptom: Off-by-one loop crashes or breaks early on first check.',
    `arr = list(map(int, input().split()))\nfor i in range(len(arr)):\n    if arr[i] <= arr[i + 1]:\n        print("YES")\n    else:\n        print("NO")\n    break`,
    `arr = list(map(int, input().split()))\nok = True\nfor i in range(len(arr) - 1):\n    if arr[i] > arr[i + 1]:\n        ok = False\n        break\nprint("YES" if ok else "NO")`,
    [{ input: '1 2 2 5 3', expectedOutput: 'NO', description: 'Drops at end' }, { input: '1 3 3 9', expectedOutput: 'YES', description: 'Non-decreasing' }]),

  pyBug('bh-py-e5-09', 'easy', 300, 'Fix Prefix Running Total',
    'Goal: Replace each arr[i] with sum of arr[0..i] and print space-joined. Symptom: Mutates wrong variable and joins ints directly.',
    `arr = list(map(int, input().split()))\nfor i in range(len(arr)):\n    arr[i] = arr[i] + arr[i - 1]\nprint(arr)`,
    `arr = list(map(int, input().split()))\nfor i in range(1, len(arr)):\n    arr[i] = arr[i] + arr[i - 1]\nprint(" ".join(map(str, arr)))`,
    [{ input: '1 2 3 4', expectedOutput: '1 3 6 10', description: 'Running totals' }, { input: '5 -2 7', expectedOutput: '5 3 10', description: 'Negative step' }]),

  pyBug('bh-py-e5-10', 'easy', 300, 'Fix Matrix Row Sum Peak',
    'Goal: Line 1 rows cols. Print max row sum across matrix. Symptom: Resets total inside column loop or forgets row max comparison.',
    `r, c = map(int, input().split())\nbest = 0\nfor _ in range(r):\n    row = list(map(int, input().split()))\n    cur = 0\n    for x in row:\n        cur = x\nprint(cur)`,
    `r, c = map(int, input().split())\nbest = -10**18\nfor _ in range(r):\n    cur = sum(map(int, input().split()))\n    if cur > best:\n        best = cur\nprint(best)`,
    [{ input: '2 3\n1 5 2\n9 1 4', expectedOutput: '14', description: 'Row 2 sums 14' }, { input: '2 2\n-5 -2\n-9 -1', expectedOutput: '-7', description: 'All negative rows' }]),

  // Easy 10m (10)
  pyBug('bh-py-e10-01', 'easy', 600, 'Fix Roman Integer Accumulator',
    'Goal: Convert uppercase Roman numeral to integer. Symptom: Adds subtractive prefixes like IV instead of subtracting.',
    `s = input().strip()\nval = {"I":1,"V":5,"X":10,"L":50,"C":100,"D":500,"M":1000}\ntot = 0\nfor ch in s:\n    tot += val[ch]\nprint(tot)`,
    `s = input().strip()\nval = {"I":1,"V":5,"X":10,"L":50,"C":100,"D":500,"M":1000}\ntot = 0\nfor i, ch in enumerate(s):\n    if i + 1 < len(s) and val[ch] < val[s[i + 1]]: tot -= val[ch]\n    else: tot += val[ch]\nprint(tot)`,
    [{ input: 'MCMXCIV', expectedOutput: '1994', description: '1994 subtractive' }, { input: 'IX', expectedOutput: '9', description: '9' }]),

  pyBug('bh-py-e10-02', 'easy', 600, 'Fix Majority Element Sort Bug',
    'Goal: Print element occurring strictly more than n/2 times (guaranteed exists). Symptom: Uses wrong midpoint and fails single-element list.',
    `arr = list(map(int, input().split()))\narr.sort\nprint(arr[0])`,
    `arr = list(map(int, input().split()))\narr.sort()\nprint(arr[len(arr) // 2])`,
    [{ input: '1 2 2', expectedOutput: '2', description: '2 is majority' }, { input: '3 4 4 4 3', expectedOutput: '4', description: '4 is majority' }]),

  pyBug('bh-py-e10-03', 'easy', 600, 'Fix Move Zeroes In-Place Order',
    'Goal: Move all zeroes to the right keeping relative non-zero order, print space-joined. Symptom: Popping while iterating skips adjacent zeroes.',
    `arr = list(map(int, input().split()))\nfor i in range(len(arr)):\n    if arr[i] == 0:\n        arr.pop(i)\n        arr.append(0)\nprint(" ".join(map(str, arr)))`,
    `arr = list(map(int, input().split()))\nnz = [x for x in arr if x != 0]\narr = nz + [0] * (len(arr) - len(nz))\nprint(" ".join(map(str, arr)))`,
    [{ input: '0 0 1 3 0', expectedOutput: '1 3 0 0 0', description: 'Adjacent leading zeroes' }, { input: '4 0 5', expectedOutput: '4 5 0', description: 'Middle zero' }]),

  pyBug('bh-py-e10-04', 'easy', 600, 'Fix Binary Bits Add Overflow',
    'Goal: Line 1 and Line 2 give two binary strings. Print sum in binary. Symptom: Adds base-10 ints instead of base-2 strings.',
    `a = input().strip()\nb = input().strip()\nprint(bin(int(a) + int(b)))`,
    `a = input().strip()\nb = input().strip()\nprint(bin(int(a, 2) + int(b, 2))[2:])`,
    [{ input: '1010\n1011', expectedOutput: '10101', description: '10+11=21' }, { input: '11\n1', expectedOutput: '100', description: '3+1=4' }]),

  pyBug('bh-py-e10-05', 'easy', 600, 'Fix Happy Number Cycle Detector',
    'Goal: Repeat sum of squared digits. Print YES if reaches 1 else NO. Symptom: Infinite loop when cycle occurs.',
    `n = int(input().strip())\nwhile n != 1:\n    n = sum(int(d) for d in str(n))\nprint("YES")`,
    `n = int(input().strip())\nseen = set()\nwhile n != 1 and n not in seen:\n    seen.add(n)\n    n = sum(int(d) ** 2 for d in str(n))\nprint("YES" if n == 1 else "NO")`,
    [{ input: '19', expectedOutput: 'YES', description: 'Reaches 1' }, { input: '4', expectedOutput: 'NO', description: 'Enters 4-loop' }]),

  pyBug('bh-py-e10-06', 'easy', 600, 'Fix Excel Column Number Converter',
    'Goal: Convert Excel title (e.g. A->1, AB->28) to 1-based column number. Symptom: Uses 0-offset without +1 and base 10 instead of 26.',
    `s = input().strip()\nans = 0\nfor ch in s:\n    ans = ans * 10 + (ord(ch) - ord("A"))\nprint(ans)`,
    `s = input().strip()\nans = 0\nfor ch in s:\n    ans = ans * 26 + (ord(ch) - ord("A") + 1)\nprint(ans)`,
    [{ input: 'AB', expectedOutput: '28', description: 'AB -> 28' }, { input: 'ZY', expectedOutput: '701', description: 'ZY -> 701' }]),

  pyBug('bh-py-e10-07', 'easy', 600, 'Fix Sorted Duplicate Array Count',
    'Goal: Print count of unique elements in sorted ascending array, followed by deduplicated space-joined? No: just count of unique integers.',
    `arr = list(map(int, input().split()))\ncnt = 0\nfor i in range(1, len(arr)):\n    if arr[i] == arr[i - 1]:\n        cnt += 1\nprint(cnt)`,
    `arr = list(map(int, input().split()))\ncnt = 1 if arr else 0\nfor i in range(1, len(arr)):\n    if arr[i] != arr[i - 1]:\n        cnt += 1\nprint(cnt)`,
    [{ input: '1 2 3 4 5', expectedOutput: '5', description: '5 distinct' }, { input: '5 5 5', expectedOutput: '1', description: 'Single unique' }]),

  pyBug('bh-py-e10-08', 'easy', 600, 'Fix Intersection Unique Set Output',
    'Goal: Line 1 array A, Line 2 array B. Print sorted space-joined unique intersection or NONE. Symptom: Uses union | and forgets sort.',
    `a = set(map(int, input().split()))\nb = set(map(int, input().split()))\nres = list(a | b)\nprint(" ".join(map(str, res)))`,
    `a = set(map(int, input().split()))\nb = set(map(int, input().split()))\nres = sorted(a & b)\nprint(" ".join(map(str, res)) if res else "NONE")`,
    [{ input: '4 9 5\n9 4 9 8', expectedOutput: '4 9', description: 'Sorted common' }, { input: '1 2\n3 4', expectedOutput: 'NONE', description: 'Empty intersection' }]),

  pyBug('bh-py-e10-09', 'easy', 600, 'Fix Single Non-Pair XOR Bug',
    'Goal: Every integer appears twice except one. Find single element. Symptom: Initializes accumulator to 1 and uses OR instead of XOR.',
    `arr = list(map(int, input().split()))\nans = 1\nfor x in arr:\n    ans |= x\nprint(ans)`,
    `arr = list(map(int, input().split()))\nans = 0\nfor x in arr:\n    ans ^= x\nprint(ans)`,
    [{ input: '4 1 2 1 2', expectedOutput: '4', description: 'Unique 4' }, { input: '7 9 7', expectedOutput: '9', description: 'Unique 9' }]),

  pyBug('bh-py-e10-10', 'easy', 600, 'Fix Climb Stairs DP Base Case',
    'Goal: Count ways to climb N stairs taking 1 or 2 steps at a time. Symptom: Initializes ways[0]=0 so whole DP stays zero.',
    `n = int(input().strip())\na, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nprint(a)`,
    `n = int(input().strip())\na, b = 1, 1\nfor _ in range(n):\n    a, b = b, a + b\nprint(a)`,
    [{ input: '3', expectedOutput: '3', description: '3 steps -> 3 ways' }, { input: '5', expectedOutput: '8', description: '5 steps -> 8 ways' }]),
];
// Clean up pyBug e5-07 without walrus operator for Python <=3.8 readability & clarity:
PY_BUG_EASY[16].buggyCode = `k = int(input().strip())\narr = input().split()\nres = arr[k:] + arr[:k]\nprint(" ".join(res))`;
PY_BUG_EASY[16].question.codeWithBug = PY_BUG_EASY[16].buggyCode;
PY_BUG_EASY[16].question.starterPython = PY_BUG_EASY[16].buggyCode;
PY_BUG_EASY[16].solutionCode = `k = int(input().strip())\narr = input().split()\nk %= len(arr)\nres = arr[-k:] + arr[:-k] if k else arr\nprint(" ".join(res))`;

// ---------- MEDIUM (3-4 trickier bugs, 3m/5m/10m x 10 each = 30) ----------
const PY_BUG_MED = [
  // Medium 3m (10)
  pyBug('bh-py-m3-01', 'medium', 180, 'Fix Binary Search Mid & Bounds',
    'Goal: Line 1 target t, Line 2 sorted array. Print index of t or -1. Symptom: Loops infinitely or misses single-element target.',
    `t = int(input().strip())\narr = list(map(int, input().split()))\nlo, hi = 0, len(arr) - 1\nwhile lo < hi:\n    mid = (lo + hi) / 2\n    if arr[mid] == t:\n        print(mid); break\n    elif arr[mid] < t: lo = mid\n    else: hi = mid - 1\nelse:\n    print(-1)`,
    `t = int(input().strip())\narr = list(map(int, input().split()))\nlo, hi = 0, len(arr) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if arr[mid] == t:\n        print(mid); break\n    elif arr[mid] < t: lo = mid + 1\n    else: hi = mid - 1\nelse:\n    print(-1)`,
    [{ input: '9\n-1 0 3 5 9 12', expectedOutput: '4', description: 'Found at 4' }, { input: '5\n5', expectedOutput: '0', description: 'Single element hit' }]),

  pyBug('bh-py-m3-02', 'medium', 180, 'Fix Bracket Validator Remainder',
    'Goal: Check if ()[]{} string is balanced -> YES or NO. Symptom: Ignores unclosed opens at end and reverses dict lookup.',
    `s = input().strip()\np = {"(": ")", "[": "]", "{": "}"}\nst = []\nfor c in s:\n    if c in "([{": st.append(c)\n    elif st and st[-1] == p.get(c): st.pop()\n    else: print("NO"); break\nelse:\n    print("YES")`,
    `s = input().strip()\np = {")": "(", "]": "[", "}": "{"}\nst = []\nfor c in s:\n    if c in "([{": st.append(c)\n    elif st and st[-1] == p.get(c): st.pop()\n    else: print("NO"); break\nelse:\n    print("YES" if not st else "NO")`,
    [{ input: '{[()]}', expectedOutput: 'YES', description: 'Valid nested' }, { input: '((()', expectedOutput: 'NO', description: 'Leftover opens' }]),

  pyBug('bh-py-m3-03', 'medium', 180, 'Fix Two-Sum Index Clash Bug',
    'Goal: Line 1 target T, Line 2 array. Print two distinct sorted indices summing to T space-joined. Symptom: Reuses the same element twice (half of target).',
    `t = int(input().strip())\narr = list(map(int, input().split()))\nmp = {x: i for i, x in enumerate(arr)}\nfor i, x in enumerate(arr):\n    if t - x in mp:\n        print(i, mp[t - x])\n        break`,
    `t = int(input().strip())\narr = list(map(int, input().split()))\nmp = {}\nfor i, x in enumerate(arr):\n    if t - x in mp:\n        print(mp[t - x], i)\n        break\n    mp[x] = i`,
    [{ input: '6\n3 2 4', expectedOutput: '1 2', description: 'Must not print 0 0' }, { input: '9\n2 7 11 15', expectedOutput: '0 1', description: '2+7=9' }]),

  pyBug('bh-py-m3-04', 'medium', 180, 'Fix Max Subarray Negative Seed',
    'Goal: Print max contiguous subarray sum. Symptom: Clamps cur to 0 even when all values are negative.',
    `arr = list(map(int, input().split()))\ncur = best = 0\nfor x in arr:\n    cur = max(0, cur + x)\n    best = min(best, cur)\nprint(best)`,
    `arr = list(map(int, input().split()))\ncur = best = arr[0]\nfor x in arr[1:]:\n    cur = max(x, cur + x)\n    best = max(best, cur)\nprint(best)`,
    [{ input: '-5 -2 -9', expectedOutput: '-2', description: 'All negative -> -2' }, { input: '-2 1 -3 4 -1 2 1', expectedOutput: '6', description: '[4,-1,2,1]=6' }]),

  pyBug('bh-py-m3-05', 'medium', 180, 'Fix Window Average Float Precision',
    'Goal: Line 1 k, Line 2 array. Print max sum of contiguous subarray length k. Symptom: Wrong starting sum and off-by-one slide.',
    `k = int(input().strip())\narr = list(map(int, input().split()))\ns = sum(arr[:k - 1])\nbest = 0\nfor i in range(k, len(arr)):\n    s += arr[i] - arr[i - k + 1]\n    best = max(best, s)\nprint(best)`,
    `k = int(input().strip())\narr = list(map(int, input().split()))\ns = sum(arr[:k])\nbest = s\nfor i in range(k, len(arr)):\n    s += arr[i] - arr[i - k]\n    best = max(best, s)\nprint(best)`,
    [{ input: '3\n-8 -2 -1 -4', expectedOutput: '-7', description: '-2+-1+-4 = -7' }, { input: '2\n5 9 1 8', expectedOutput: '14', description: '5+9=14' }]),

  pyBug('bh-py-m3-06', 'medium', 180, 'Fix Remove Adjacent All Same',
    'Goal: Reduce string removing adjacent matching pairs repeatedly. Symptom: Skips nested collapse and prints list repr.',
    `s = input().strip()\nst = []\nfor c in s:\n    if st or st[-1] == c:\n        st.pop()\n    else:\n        st.append(c)\nprint(st if st else "EMPTY")`,
    `s = input().strip()\nst = []\nfor c in s:\n    if st and st[-1] == c:\n        st.pop()\n    else:\n        st.append(c)\nprint("".join(st) if st else "EMPTY")`,
    [{ input: 'azxxzy', expectedOutput: 'ay', description: 'Nested collapse' }, { input: 'abba', expectedOutput: 'EMPTY', description: 'Fully collapsed' }]),

  pyBug('bh-py-m3-07', 'medium', 180, 'Fix Merge Overlap Interval Sort',
    'Goal: Read "start end" lines, merge overlaps and print count. Symptom: Sorts by end time wrongly and fails touch check.',
    `import sys\niv = [list(map(int, l.split())) for l in sys.stdin.read().splitlines() if l.strip()]\niv.sort(key=lambda x: x[1])\nout = []\nfor s, e in iv:\n    if not out or s >= out[-1][1]: out.append([s, e])\n    else: out[-1][1] = e\nprint(len(out))`,
    `import sys\niv = [list(map(int, l.split())) for l in sys.stdin.read().splitlines() if l.strip()]\niv.sort(key=lambda x: x[0])\nout = []\nfor s, e in iv:\n    if not out or s > out[-1][1]: out.append([s, e])\n    else: out[-1][1] = max(out[-1][1], e)\nprint(len(out))`,
    [{ input: '1 4\n0 2\n3 5', expectedOutput: '1', description: 'All merge to [0,5]' }, { input: '1 4\n4 5', expectedOutput: '1', description: 'Touching merges' }]),

  pyBug('bh-py-m3-08', 'medium', 180, 'Fix Monotonic Next Greater Stack',
    'Goal: For each element print next strictly greater to right (-1 if none). Symptom: Compares value instead of index and uses wrong condition.',
    `arr = list(map(int, input().split()))\nans = [-1] * len(arr)\nst = []\nfor i, x in enumerate(arr):\n    while st and st[-1] > x:\n        ans[st.pop()] = x\n    st.append(i)\nprint(" ".join(map(str, ans)))`,
    `arr = list(map(int, input().split()))\nans = [-1] * len(arr)\nst = []\nfor i, x in enumerate(arr):\n    while st and arr[st[-1]] < x:\n        ans[st.pop()] = x\n    st.append(i)\nprint(" ".join(map(str, ans)))`,
    [{ input: '4 1 2 5', expectedOutput: '5 2 5 -1', description: 'Next greater values' }, { input: '3 2 1', expectedOutput: '-1 -1 -1', description: 'Decreasing' }]),

  pyBug('bh-py-m3-09', 'medium', 180, 'Fix Unique Char Sliding Window',
    'Goal: Print longest substring length with zero repeated chars. Symptom: Fails to guard stale seen[ch] < left pointer.',
    `s = input().strip()\nseen = {}\nl = best = 0\nfor r, ch in enumerate(s):\n    if ch in seen:\n        l = seen[ch] + 1\n    seen[ch] = r\n    best = min(best, r - l + 1)\nprint(best)`,
    `s = input().strip()\nseen = {}\nl = best = 0\nfor r, ch in enumerate(s):\n    if ch in seen and seen[ch] >= l:\n        l = seen[ch] + 1\n    seen[ch] = r\n    best = max(best, r - l + 1)\nprint(best)`,
    [{ input: 'abba', expectedOutput: '2', description: 'l must not move backwards on second a' }, { input: 'tmmzuxt', expectedOutput: '5', description: 'mzuxt -> 5' }]),

  pyBug('bh-py-m3-10', 'medium', 180, 'Fix Product Except Self Zero Trap',
    'Goal: Print product except self for every index space-joined. Symptom: Overwrites suffix accumulator with prefix variable and off-by-one.',
    `arr = list(map(int, input().split()))\nn = len(arr)\nout = [1] * n\np = 1\nfor i in range(n):\n    p *= arr[i]\n    out[i] = p\nfor i in range(n - 1, -1, -1):\n    out[i] *= p\n    p *= arr[i]\nprint(" ".join(map(str, out)))`,
    `arr = list(map(int, input().split()))\nn = len(arr)\nout = [1] * n\np = 1\nfor i in range(n):\n    out[i] = p\n    p *= arr[i]\np = 1\nfor i in range(n - 1, -1, -1):\n    out[i] *= p\n    p *= arr[i]\nprint(" ".join(map(str, out)))`,
    [{ input: '1 2 3 4', expectedOutput: '24 12 8 6', description: 'Standard array' }, { input: '-1 1 0 -3 3', expectedOutput: '0 0 9 0 0', description: 'Single zero' }]),

  // Medium 5m (10)
  pyBug('bh-py-m5-01', 'medium', 300, 'Fix Rotated Array Binary Search',
    'Goal: Line 1 target, Line 2 rotated distinct array. Print target index or -1. Symptom: Wrong sorted-half condition & strict equality omission.',
    `t = int(input().strip())\narr = list(map(int, input().split()))\nlo, hi = 0, len(arr) - 1\nans = -1\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if arr[mid] == t: ans = mid; break\n    if arr[lo] < arr[mid]:\n        if arr[lo] < t < arr[mid]: hi = mid - 1\n        else: lo = mid + 1\n    else:\n        if arr[mid] < t < arr[hi]: lo = mid + 1\n        else: hi = mid - 1\nprint(ans)`,
    `t = int(input().strip())\narr = list(map(int, input().split()))\nlo, hi = 0, len(arr) - 1\nans = -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if arr[mid] == t: ans = mid; break\n    if arr[lo] <= arr[mid]:\n        if arr[lo] <= t < arr[mid]: hi = mid - 1\n        else: lo = mid + 1\n    else:\n        if arr[mid] < t <= arr[hi]: lo = mid + 1\n        else: hi = mid - 1\nprint(ans)`,
    [{ input: '4\n4 5 6 7 0 1 2', expectedOutput: '0', description: 'Boundary target at lo' }, { input: '2\n4 5 6 7 0 1 2', expectedOutput: '6', description: 'Boundary target at hi' }]),

  pyBug('bh-py-m5-02', 'medium', 300, 'Fix Subarray Sum Equals K Map',
    'Goal: Line 1 k, Line 2 ints. Count subarrays summing to k. Symptom: Missing empty prefix {0:1} and updates map before lookup.',
    `k = int(input().strip())\narr = list(map(int, input().split()))\nfrom collections import defaultdict\nmp = defaultdict(int)\npref = ans = 0\nfor x in arr:\n    pref += x\n    mp[pref] += 1\n    ans += mp[pref - k]\nprint(ans)`,
    `k = int(input().strip())\narr = list(map(int, input().split()))\nfrom collections import defaultdict\nmp = defaultdict(int)\nmp[0] = 1\npref = ans = 0\nfor x in arr:\n    pref += x\n    ans += mp[pref - k]\n    mp[pref] += 1\nprint(ans)`,
    [{ input: '0\n1 -1 0', expectedOutput: '3', description: 'Must not match zero-length self when k=0' }, { input: '3\n1 2 3', expectedOutput: '2', description: '[1,2] and [3]' }]),

  pyBug('bh-py-m5-03', 'medium', 300, 'Fix Jump Game Reachability Guard',
    'Goal: Array of jump lengths. Print YES if end reachable from 0 else NO. Symptom: Never checks i > reach and stops before looping.',
    `arr = list(map(int, input().split()))\nreach = 0\nfor i in range(len(arr)):\n    reach = max(reach, arr[i])\nprint("YES" if reach >= len(arr) else "NO")`,
    `arr = list(map(int, input().split()))\nreach = 0\nfor i, x in enumerate(arr):\n    if i > reach:\n        print("NO"); break\n    reach = max(reach, i + x)\nelse:\n    print("YES")`,
    [{ input: '3 2 1 0 4', expectedOutput: 'NO', description: 'Cannot cross index 3' }, { input: '2 3 1 1 4', expectedOutput: 'YES', description: 'Reaches index 4' }]),

  pyBug('bh-py-m5-04', 'medium', 300, 'Fix Daily Stock Multi-Flip Bug',
    'Goal: Print max profit with unlimited sequential buys & sells. Symptom: Subtracts wrong order and adds negative drops.',
    `p = list(map(int, input().split()))\nans = 0\nfor i in range(len(p) - 1):\n    if p[i] > p[i + 1]:\n        ans += p[i] - p[i + 1]\nprint(ans)`,
    `p = list(map(int, input().split()))\nans = 0\nfor i in range(1, len(p)):\n    if p[i] > p[i - 1]:\n        ans += p[i] - p[i - 1]\nprint(ans)`,
    [{ input: '7 1 5 3 6 4', expectedOutput: '7', description: '4+3=7' }, { input: '7 6 4 3 1', expectedOutput: '0', description: 'Downtrend -> 0' }]),

  pyBug('bh-py-m5-05', 'medium', 300, 'Fix Container Area Two-Pointer Step',
    'Goal: Print max area trapped by two vertical bars. Symptom: Moves taller wall inward and ignores width.',
    `h = list(map(int, input().split()))\nl, r = 0, len(h) - 1\nbest = 0\nwhile l < r:\n    best = max(best, max(h[l], h[r]) * (r - l + 1))\n    if h[l] > h[r]: l += 1\n    else: r -= 1\nprint(best)`,
    `h = list(map(int, input().split()))\nl, r = 0, len(h) - 1\nbest = 0\nwhile l < r:\n    best = max(best, min(h[l], h[r]) * (r - l))\n    if h[l] < h[r]: l += 1\n    else: r -= 1\nprint(best)`,
    [{ input: '1 8 6 2 5 4 8 3 7', expectedOutput: '49', description: '7*7=49' }, { input: '4 3 2 1 4', expectedOutput: '16', description: '4*4=16' }]),

  pyBug('bh-py-m5-06', 'medium', 300, 'Fix Rotting Step BFS Boundary',
    'Goal: Line 1 r c, then grid (1=fresh, 2=rotten, 0=empty). Print mins for all to rot else -1. Symptom: Wrong queue pop & missing fresh check.',
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\nfrom collections import deque\nq = deque()\nfresh = 0\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == 2: q.append((i, j))\n        elif g[i][j] == 1: fresh += 1\nmins = 0\nwhile q:\n    mins += 1\n    for _ in range(len(q)):\n        x, y = q.pop()\n        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n            nx, ny = x + dx, y + dy\n            if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == 1:\n                g[nx][ny] = 2; fresh -= 1; q.append((nx, ny))\nprint(mins if fresh == 0 else -1)`,
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\nfrom collections import deque\nq = deque()\nfresh = 0\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == 2: q.append((i, j))\n        elif g[i][j] == 1: fresh += 1\nmins = 0\nwhile q and fresh > 0:\n    mins += 1\n    for _ in range(len(q)):\n        x, y = q.popleft()\n        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n            nx, ny = x + dx, y + dy\n            if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == 1:\n                g[nx][ny] = 2; fresh -= 1; q.append((nx, ny))\nprint(mins if fresh == 0 else -1)`,
    [{ input: '3 3\n2 1 1\n1 1 0\n0 1 1', expectedOutput: '4', description: 'Level BFS takes 4' }, { input: '1 2\n0 2', expectedOutput: '0', description: '0 fresh needs 0 mins' }]),

  pyBug('bh-py-m5-07', 'medium', 300, 'Fix Coin Change Infinite Sentinel',
    'Goal: Line 1 target T, Line 2 coins. Print min coins for T or -1. Symptom: Bad loop direction & missing impossiblility guard.',
    `t = int(input().strip())\ncoins = list(map(int, input().split()))\ndp = [1] + [0] * t\nfor x in range(1, t + 1):\n    for c in coins:\n        if x >= c:\n            dp[x] = min(dp[x], dp[x - c] + 1)\nprint(dp[t])`,
    `t = int(input().strip())\ncoins = list(map(int, input().split()))\nINF = 10**9\ndp = [0] + [INF] * t\nfor x in range(1, t + 1):\n    for c in coins:\n        if x >= c:\n            dp[x] = min(dp[x], dp[x - c] + 1)\nprint(-1 if dp[t] >= INF else dp[t])`,
    [{ input: '11\n1 2 5', expectedOutput: '3', description: '5+5+1' }, { input: '3\n2', expectedOutput: '-1', description: 'Impossible -> -1' }]),

  pyBug('bh-py-m5-08', 'medium', 300, 'Fix Spiral Traversal Bounds Bug',
    'Goal: Line 1 r c, next r lines matrix. Print clockwise spiral space-joined. Symptom: Duplicates center row/col on non-square grid.',
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\ntop, bot, l, ri = 0, r - 1, 0, c - 1\nout = []\nwhile top <= bot and l <= ri:\n    for j in range(l, ri + 1): out.append(g[top][j])\n    top += 1\n    for i in range(top, bot + 1): out.append(g[i][ri])\n    ri -= 1\n    for j in range(ri, l - 1, -1): out.append(g[bot][j])\n    bot -= 1\n    for i in range(bot, top - 1, -1): out.append(g[i][l])\n    l += 1\nprint(" ".join(map(str, out)))`,
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\ntop, bot, l, ri = 0, r - 1, 0, c - 1\nout = []\nwhile top <= bot and l <= ri:\n    for j in range(l, ri + 1): out.append(g[top][j])\n    top += 1\n    for i in range(top, bot + 1): out.append(g[i][ri])\n    ri -= 1\n    if top <= bot:\n        for j in range(ri, l - 1, -1): out.append(g[bot][j])\n        bot -= 1\n    if l <= ri:\n        for i in range(bot, top - 1, -1): out.append(g[i][l])\n        l += 1\nprint(" ".join(map(str, out)))`,
    [{ input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', expectedOutput: '1 2 3 4 8 12 11 10 9 5 6 7', description: 'No double center read' }, { input: '1 3\n1 2 3', expectedOutput: '1 2 3', description: 'Single row' }]),

  pyBug('bh-py-m5-09', 'medium', 300, 'Fix Flood Fill Land Counter',
    'Goal: Line 1 r c, grid of 0/1. Count islands. Symptom: Never marks visited cells and forgets bounds check >= 0.',
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\ncnt = 0\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == 1:\n            cnt += 1\n            st = [(i, j)]\n            while st:\n                x, y = st.pop()\n                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                    nx, ny = x + dx, y + dy\n                    if nx < r and ny < c and g[nx][ny] == 1:\n                        st.append((nx, ny))\nprint(cnt)`,
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\ncnt = 0\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == 1:\n            cnt += 1\n            g[i][j] = 0\n            st = [(i, j)]\n            while st:\n                x, y = st.pop()\n                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                    nx, ny = x + dx, y + dy\n                    if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == 1:\n                        g[nx][ny] = 0\n                        st.append((nx, ny))\nprint(cnt)`,
    [{ input: '3 3\n1 1 0\n0 1 0\n1 0 1', expectedOutput: '3', description: '3 islands' }, { input: '2 2\n1 1\n1 1', expectedOutput: '1', description: 'Whole block 1' }]),

  pyBug('bh-py-m5-10', 'medium', 300, 'Fix Top K Elements Ties & Order',
    'Goal: Line 1 k, Line 2 ints. Print k most frequent (tie -> smaller first). Symptom: Sorts ascending frequency and takes wrong slice.',
    `k = int(input().strip())\narr = list(map(int, input().split()))\nfrom collections import Counter\nc = Counter(arr)\nsorted_keys = sorted(c.keys(), key=lambda x: (c[x], -x))\nprint(" ".join(map(str, sorted_keys[:k])))`,
    `k = int(input().strip())\narr = list(map(int, input().split()))\nfrom collections import Counter\nc = Counter(arr)\nsorted_keys = sorted(c.keys(), key=lambda x: (-c[x], x))\nprint(" ".join(map(str, sorted_keys[:k])))`,
    [{ input: '2\n4 4 2 2 9', expectedOutput: '2 4', description: 'Tie 2 vs 4 asc' }, { input: '1\n1 3 3 3 2 2', expectedOutput: '3', description: 'Highest freq 3' }]),

  // Medium 10m (10)
  pyBug('bh-py-m10-01', 'medium', 600, 'Fix Partition Subset Direction Bug',
    'Goal: Print YES if array splits into two equal-sum subsets else NO. Symptom: Forward loop reuses same element infinitely.',
    `arr = list(map(int, input().split()))\ntot = sum(arr)\nif tot % 2 == 1: print("NO")\nelse:\n    half = tot // 2\n    dp = [True] + [False] * half\n    for x in arr:\n        for s in range(x, half):\n            if dp[s - x]: dp[s] = True\n    print("YES" if dp[half] else "NO")`,
    `arr = list(map(int, input().split()))\ntot = sum(arr)\nif tot % 2 == 1: print("NO")\nelse:\n    half = tot // 2\n    dp = [True] + [False] * half\n    for x in arr:\n        for s in range(half, x - 1, -1):\n            if dp[s - x]: dp[s] = True\n    print("YES" if dp[half] else "NO")`,
    [{ input: '2 4', expectedOutput: 'NO', description: 'Cannot reuse 2 twice for sum 3' }, { input: '1 5 11 5', expectedOutput: 'YES', description: '{1,5,5} == 11' }]),

  pyBug('bh-py-m10-02', 'medium', 600, 'Fix Course Schedule Cycle Count',
    'Goal: Line 1 n, remaining lines "u v" (u before v). Print YES if acyclic/completable else NO. Symptom: Appends 0-indegree wrong and compares edge count.',
    `import sys\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn = int(lines[0])\nadj = [[] for _ in range(n)]\nind = [0] * n\nfor l in lines[1:]:\n    u, v = map(int, l.split())\n    adj[u].append(v); ind[u] += 1\nfrom collections import deque\nq = deque([i for i in range(n) if ind[i] == 0])\ndone = 0\nwhile q:\n    u = q.popleft(); done += 1\n    for v in adj[u]:\n        ind[v] -= 1\n        if ind[v] == 0: q.append(v)\nprint("YES" if done < n else "NO")`,
    `import sys\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn = int(lines[0])\nadj = [[] for _ in range(n)]\nind = [0] * n\nfor l in lines[1:]:\n    u, v = map(int, l.split())\n    adj[u].append(v); ind[v] += 1\nfrom collections import deque\nq = deque([i for i in range(n) if ind[i] == 0])\ndone = 0\nwhile q:\n    u = q.popleft(); done += 1\n    for v in adj[u]:\n        ind[v] -= 1\n        if ind[v] == 0: q.append(v)\nprint("YES" if done == n else "NO")`,
    [{ input: '3\n0 1\n1 2', expectedOutput: 'YES', description: 'Acyclic DAG' }, { input: '2\n0 1\n1 0', expectedOutput: 'NO', description: 'Cycle' }]),

  pyBug('bh-py-m10-03', 'medium', 600, 'Fix Grid Minimum Path Row Init',
    'Goal: Line 1 r c, grid positive costs. Print min right/down cost (0,0)->(r-1,c-1). Symptom: Misses first row/col accumulation & mixes max/min.',
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\nfor i in range(1, r):\n    for j in range(1, c):\n        g[i][j] += max(g[i - 1][j], g[i][j - 1])\nprint(g[r - 1][c - 1])`,
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\nfor j in range(1, c): g[0][j] += g[0][j - 1]\nfor i in range(1, r):\n    g[i][0] += g[i - 1][0]\n    for j in range(1, c):\n        g[i][j] += min(g[i - 1][j], g[i][j - 1])\nprint(g[r - 1][c - 1])`,
    [{ input: '3 3\n1 3 1\n1 5 1\n4 2 1', expectedOutput: '7', description: '1+3+1+1+1=7' }, { input: '2 2\n1 2\n5 1', expectedOutput: '4', description: '1+2+1=4' }]),

  pyBug('bh-py-m10-04', 'medium', 600, 'Fix Circular House Robber Edge',
    'Goal: Circular array of house loot. Print max non-adjacent loot. Symptom: Robs both index 0 and n-1 or fails single house.',
    `arr = list(map(int, input().split()))\ndef rob(a):\n    p2 = p1 = 0\n    for x in a: p2, p1 = p1, max(p1, p2 + x)\n    return p2\nprint(rob(arr))`,
    `arr = list(map(int, input().split()))\ndef rob(a):\n    p2 = p1 = 0\n    for x in a: p2, p1 = p1, max(p1, p2 + x)\n    return p1\nprint(arr[0] if len(arr) == 1 else max(rob(arr[:-1]), rob(arr[1:])))`,
    [{ input: '1 2 3 10', expectedOutput: '12', description: 'Must include last house 10+2=12' }, { input: '2 7 9 3 1', expectedOutput: '11', description: '2+9=11' }]),

  pyBug('bh-py-m10-05', 'medium', 600, 'Fix Shortest Zero-One Maze Visited',
    'Goal: Line 1 r c, 0 open 1 wall grid. Shortest steps (0,0)->(r-1,c-1) or -1. Symptom: Skips start==wall check and doesn\'t mark visited early.',
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\nfrom collections import deque\nq = deque([(0, 0, 1)])\nvis = set()\nwhile q:\n    x, y, d = q.popleft()\n    if x == r - 1 and y == c - 1: print(d); break\n    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n        nx, ny = x + dx, y + dy\n        if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == 0:\n            q.append((nx, ny, d + 1))\nelse:\n    print(-1)`,
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\nfrom collections import deque\nif g[0][0] == 1 or g[r - 1][c - 1] == 1:\n    print(-1)\nelse:\n    q = deque([(0, 0, 0)])\n    vis = {(0, 0)}\n    while q:\n        x, y, d = q.popleft()\n        if x == r - 1 and y == c - 1: print(d); break\n        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n            nx, ny = x + dx, y + dy\n            if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == 0 and (nx, ny) not in vis:\n                vis.add((nx, ny)); q.append((nx, ny, d + 1))\n    else:\n        print(-1)`,
    [{ input: '3 3\n0 1 0\n0 0 0\n1 1 0', expectedOutput: '4', description: '4 steps from (0,0)' }, { input: '2 2\n1 0\n0 0', expectedOutput: '-1', description: 'Start blocked' }]),

  pyBug('bh-py-m10-06', 'medium', 600, 'Fix Meeting Rooms Sweep Order',
    'Goal: Lines "start end". Print min concurrent rooms (end == next start uses 1 room). Symptom: Processes starts before ends at tie time.',
    `import sys\niv = [tuple(map(int, l.split())) for l in sys.stdin.read().splitlines() if l.strip()]\nev = []\nfor s, e in iv:\n    ev.append((s, -1)); ev.append((e, 1))\nev.sort()\ncur = best = 0\nfor _, d in ev:\n    cur += d; best = max(best, cur)\nprint(best)`,
    `import sys\niv = [tuple(map(int, l.split())) for l in sys.stdin.read().splitlines() if l.strip()]\nev = []\nfor s, e in iv:\n    ev.append((s, 1)); ev.append((e, -1))\nev.sort(key=lambda x: (x[0], x[1]))\ncur = best = 0\nfor _, d in ev:\n    cur += d; best = max(best, cur)\nprint(best)`,
    [{ input: '1 5\n5 9', expectedOutput: '1', description: 'End before start at 5' }, { input: '0 30\n5 10\n15 20', expectedOutput: '2', description: '2 rooms max' }]),

  pyBug('bh-py-m10-07', 'medium', 600, 'Fix Longest Consecutive Sequence O(n)',
    'Goal: Print length of longest consecutive int run. Symptom: Starts counting from non-minimal items or breaks on zero length.',
    `arr = list(map(int, input().split()))\ns = set(arr)\nbest = 0\nfor x in s:\n    if x + 1 not in s:\n        y = x\n        while y in s: y += 1\n        best = max(best, y - x)\nprint(best)`,
    `arr = list(map(int, input().split()))\ns = set(arr)\nbest = 0\nfor x in s:\n    if x - 1 not in s:\n        y = x\n        while y in s: y += 1\n        best = max(best, y - x)\nprint(best)`,
    [{ input: '100 4 200 1 3 2', expectedOutput: '4', description: '1,2,3,4' }, { input: '9 8 7', expectedOutput: '3', description: '7,8,9' }]),

  pyBug('bh-py-m10-08', 'medium', 600, 'Fix Edit Distance Diagonal Step',
    'Goal: Line 1 word A, Line 2 word B. Print Levenshtein edit distance. Symptom: Uses ndp[0]=0 breaking empty-prefix insert cost and forgets match case.',
    `a = input().strip()\nb = input().strip()\nm, n = len(a), len(b)\ndp = list(range(n + 1))\nfor i in range(1, m + 1):\n    ndp = [0] * (n + 1)\n    for j in range(1, n + 1):\n        if a[i - 1] == b[j - 1]: ndp[j] = dp[j]\n        else: ndp[j] = 1 + min(dp[j], ndp[j - 1])\n    dp = ndp\nprint(dp[n])`,
    `a = input().strip()\nb = input().strip()\nm, n = len(a), len(b)\ndp = list(range(n + 1))\nfor i in range(1, m + 1):\n    ndp = [i] + [0] * n\n    for j in range(1, n + 1):\n        if a[i - 1] == b[j - 1]: ndp[j] = dp[j - 1]\n        else: ndp[j] = 1 + min(dp[j], ndp[j - 1], dp[j - 1])\n    dp = ndp\nprint(dp[n])`,
    [{ input: 'horse\nros', expectedOutput: '3', description: '3 edits' }, { input: 'cat\ncut', expectedOutput: '1', description: '1 replace' }]),

  pyBug('bh-py-m10-09', 'medium', 600, 'Fix Word Break Split Slicing Bug',
    'Goal: Line 1 s, Line 2 dict words. Print YES if s breaks into words else NO. Symptom: Inverted range and forgets dp[0]=True.',
    `s = input().strip()\nwords = set(input().split())\nn = len(s)\ndp = [False] * (n + 1)\nfor i in range(1, n):\n    for j in range(i):\n        if dp[j] and s[j:i] in words: dp[i] = True\nprint("YES" if dp[n] else "NO")`,
    `s = input().strip()\nwords = set(input().split())\nn = len(s)\ndp = [True] + [False] * n\nfor i in range(1, n + 1):\n    for j in range(i):\n        if dp[j] and s[j:i] in words:\n            dp[i] = True; break\nprint("YES" if dp[n] else "NO")`,
    [{ input: 'applepenapple\napple pen', expectedOutput: 'YES', description: 'Reuse words allowed' }, { input: 'catsandog\ncats dog sand and cat', expectedOutput: 'NO', description: 'Blocked end' }]),

  pyBug('bh-py-m10-10', 'medium', 600, 'Fix K-Closest Origin Heap Distance',
    'Goal: Line 1 k, remaining lines "x y". Print k-th smallest squared Euclidean distance from origin (1-based). Symptom: Misses negation for min-distance or squaring.',
    `import sys, heapq\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nk = int(lines[0])\nh = []\nfor l in lines[1:]:\n    x, y = map(int, l.split())\n    d = x + y\n    heapq.heappush(h, -d)\n    if len(h) >= k: heapq.heappop(h)\nprint(h[0])`,
    `import sys, heapq\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nk = int(lines[0])\nh = []\nfor l in lines[1:]:\n    x, y = map(int, l.split())\n    d = x * x + y * y\n    heapq.heappush(h, -d)\n    if len(h) > k: heapq.heappop(h)\nprint(-h[0])`,
    [{ input: '1\n1 3\n-2 2', expectedOutput: '8', description: '(-2)^2+2^2=8 < 10' }, { input: '2\n3 3\n5 -1\n-2 4', expectedOutput: '20', description: '2nd smallest squared dist is 20' }]),
];
// Fix pyBug m3-05 test 1 description clarity: -5 + -2 + -1 = -8, -2 + -1 + -4 = -7! Looks right!

// ---------- HARD (4-5 subtle tricky bugs, 3m/5m/10m x 10 each = 30) ----------
const PY_BUG_HARD = [
  // Hard 3m (10)
  pyBug('bh-py-h3-01', 'hard', 180, 'Fix Binary Search Banana Speed Edge',
    'Goal: Line 1 hours h, Line 2 pile sizes. Print min eating speed k to eat all within h hours (ceil division). Symptom: Division truncates, hi starts at min, returns lo-1.',
    `h = int(input().strip())\npiles = list(map(int, input().split()))\nlo, hi = 0, min(piles)\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    hrs = sum(p // mid for p in piles)\n    if hrs < h: hi = mid\n    else: lo = mid + 1\nprint(lo - 1)`,
    `h = int(input().strip())\npiles = list(map(int, input().split()))\nlo, hi = 1, max(piles)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    hrs = sum((p + mid - 1) // mid for p in piles)\n    if hrs <= h: hi = mid\n    else: lo = mid + 1\nprint(lo)`,
    [{ input: '8\n3 6 7 11', expectedOutput: '4', description: 'Rate 4 finishes in 8h' }, { input: '6\n30 11 23 4 20', expectedOutput: '23', description: 'Rate 23 in 6h' }]),

  pyBug('bh-py-h3-02', 'hard', 180, 'Fix Rainwater Trap Pointer Advance',
    'Goal: Heights array. Print total water trapped. Symptom: Advances higher pointer, uses initial 0 wrong on flat edges, accumulates negative.',
    `h = list(map(int, input().split()))\nl, r = 0, len(h) - 1\nlm = rm = ans = 0\nwhile l <= r:\n    if h[l] >= h[r]:\n        ans += lm - h[l]; lm = max(lm, h[l]); l += 1\n    else:\n        rm = max(rm, h[r]); ans += rm + h[r]; r -= 1\nprint(ans)`,
    `h = list(map(int, input().split()))\nl, r = 0, len(h) - 1\nlm = rm = ans = 0\nwhile l < r:\n    if h[l] < h[r]:\n        lm = max(lm, h[l]); ans += lm - h[l]; l += 1\n    else:\n        rm = max(rm, h[r]); ans += rm - h[r]; r -= 1\nprint(ans)`,
    [{ input: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', description: 'Traps 6 units' }, { input: '4 2 0 3 2 5', expectedOutput: '9', description: 'Traps 9 units' }]),

  pyBug('bh-py-h3-03', 'hard', 180, 'Fix Max Product Sign Flip Swap',
    'Goal: Print largest contiguous subarray product (handles negatives & zeros). Symptom: Updates lo using already-mutated hi and omits single element start.',
    `arr = list(map(int, input().split()))\nhi = lo = ans = 0\nfor x in arr:\n    hi = max(x, hi * x, lo * x)\n    lo = min(x, hi * x, lo * x)\n    ans = max(ans, hi)\nprint(ans)`,
    `arr = list(map(int, input().split()))\nhi = lo = ans = arr[0]\nfor x in arr[1:]:\n    nhi = max(x, hi * x, lo * x)\n    nlo = min(x, hi * x, lo * x)\n    hi, lo = nhi, nlo\n    ans = max(ans, hi)\nprint(ans)`,
    [{ input: '-2 3 -4', expectedOutput: '24', description: 'Negative*negative = 24' }, { input: '-4 -3 -2', expectedOutput: '12', description: '-4*-3 = 12' }]),

  pyBug('bh-py-h3-04', 'hard', 180, 'Fix Gas Tour Reset Accumulator',
    'Goal: Line 1 gas[], Line 2 cost[]. Print start station completing clockwise loop else -1. Symptom: Resets totalSum inside negative tank check and forgets +1.',
    `gas = list(map(int, input().split()))\ncost = list(map(int, input().split()))\ntank = tot = start = 0\nfor i in range(len(gas)):\n    d = gas[i] - cost[i]\n    tank += d; tot += d\n    if tank <= 0:\n        tank = tot = 0; start = i\nprint(start if tot > 0 else -1)`,
    `gas = list(map(int, input().split()))\ncost = list(map(int, input().split()))\ntank = tot = start = 0\nfor i in range(len(gas)):\n    d = gas[i] - cost[i]\n    tank += d; tot += d\n    if tank < 0:\n        tank = 0; start = i + 1\nprint(start if tot >= 0 else -1)`,
    [{ input: '1 2 3 4 5\n3 4 5 1 2', expectedOutput: '3', description: 'Start station 3' }, { input: '3 1 1\n1 2 2', expectedOutput: '0', description: 'Tot == 0 must succeed' }]),

  pyBug('bh-py-h3-05', 'hard', 180, 'Fix Single Non-Duplicate Parity',
    'Goal: Sorted array has every item twice except one. Find single element in O(log n). Symptom: Doesn\'t force mid even before pair compare, shrinks wrong bound, and skips 1 instead of 2.',
    `arr = list(map(int, input().split()))\nlo, hi = 0, len(arr) - 1\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if arr[mid] == arr[mid + 1]: lo = mid + 1\n    else: hi = mid - 1\nprint(arr[lo])`,
    `arr = list(map(int, input().split()))\nlo, hi = 0, len(arr) - 1\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if mid % 2 == 1: mid -= 1\n    if arr[mid] == arr[mid + 1]: lo = mid + 2\n    else: hi = mid\nprint(arr[lo])`,
    [{ input: '1 1 2 2 3 4 4', expectedOutput: '3', description: 'Unique 3 at even index' }, { input: '1 2 2 3 3', expectedOutput: '1', description: 'Unique at index 0' }]),

  pyBug('bh-py-h3-06', 'hard', 180, 'Fix Circular Subarray Kadane',
    'Goal: Circular array. Print max contiguous subarray sum (wrap allowed). Symptom: Wrong all-negative fallback when tot == bestMin.',
    `arr = list(map(int, input().split()))\ncmx = cmn = tot = 0\nbmx = bmn = arr[0]\nfor x in arr:\n    cmx = max(x, cmx + x); bmx = max(bmx, cmx)\n    cmn = max(x, cmn + x); bmn = min(bmn, cmn)\n    tot += x\nprint(max(bmx, tot - bmn))`,
    `arr = list(map(int, input().split()))\ncmx = cmn = tot = 0\nbmx = bmn = arr[0]\nfor x in arr:\n    cmx = max(x, cmx + x); bmx = max(bmx, cmx)\n    cmn = min(x, cmn + x); bmn = min(bmn, cmn)\n    tot += x\nprint(max(bmx, tot - bmn) if bmx > 0 else bmx)`,
    [{ input: '-3 -2 -3', expectedOutput: '-2', description: 'All neg returns -2 not 0' }, { input: '5 -3 5', expectedOutput: '10', description: 'Wraps 5+5=10' }]),

  pyBug('bh-py-h3-07', 'hard', 180, 'Fix Minimum Subarray At Least T',
    'Goal: Line 1 T, Line 2 positive ints. Print min subarray len with sum >= T (0 if none). Symptom: Shrinks strictly > T, checks wrong Sentinel.',
    `t = int(input().strip())\narr = list(map(int, input().split()))\nl = s = 0; best = 10**9\nfor r in range(len(arr)):\n    s += arr[r]\n    while s > t:\n        s -= arr[l]; l += 1\n        best = min(best, r - l)\nprint(0 if best == 0 else best)`,
    `t = int(input().strip())\narr = list(map(int, input().split()))\nl = s = 0; best = 10**9\nfor r in range(len(arr)):\n    s += arr[r]\n    while s >= t:\n        best = min(best, r - l + 1)\n        s -= arr[l]; l += 1\nprint(0 if best >= 10**9 else best)`,
    [{ input: '7\n2 3 1 2 4 3', expectedOutput: '2', description: '[4,3]' }, { input: '11\n1 1 1 1', expectedOutput: '0', description: 'Impossible -> 0' }]),

  pyBug('bh-py-h3-08', 'hard', 180, 'Fix Candy Steep Slope Greedy',
    'Goal: Ratings array. Print min candies (at least 1 each, higher neighbor gets strictly more). Symptom: Overwrites left-pass without max() and skips index 0.',
    `arr = list(map(int, input().split()))\nn = len(arr); c = [1] * n\nfor i in range(1, n):\n    if arr[i] >= arr[i - 1]: c[i] = c[i - 1] + 1\nfor i in range(n - 2, 0, -1):\n    if arr[i] > arr[i + 1]: c[i] = c[i + 1] + 1\nprint(sum(c))`,
    `arr = list(map(int, input().split()))\nn = len(arr); c = [1] * n\nfor i in range(1, n):\n    if arr[i] > arr[i - 1]: c[i] = c[i - 1] + 1\nfor i in range(n - 2, -1, -1):\n    if arr[i] > arr[i + 1]: c[i] = max(c[i], c[i + 1] + 1)\nprint(sum(c))`,
    [{ input: '1 3 4 5 2', expectedOutput: '11', description: '1+2+3+4+1=11' }, { input: '1 2 2', expectedOutput: '4', description: 'Equal rating does not need +1' }]),

  pyBug('bh-py-h3-09', 'hard', 180, 'Fix Median Stream Two Heaps',
    'Goal: Print floor median after each insertion summed across stream. Symptom: Reversed heap signs and wrong rebalance check.',
    `import heapq\narr = list(map(int, input().split()))\nlo, hi, ans = [], [], 0\nfor x in arr:\n    heapq.heappush(lo, x)\n    heapq.heappush(hi, -heapq.heappop(lo))\n    if len(hi) >= len(lo): heapq.heappush(lo, heapq.heappop(hi))\n    med = lo[0] if len(lo) > len(hi) else (lo[0] + hi[0]) // 2\n    ans += med\nprint(ans)`,
    `import heapq\narr = list(map(int, input().split()))\nlo, hi, ans = [], [], 0\nfor x in arr:\n    heapq.heappush(lo, -x)\n    heapq.heappush(hi, -heapq.heappop(lo))\n    if len(hi) > len(lo): heapq.heappush(lo, -heapq.heappop(hi))\n    med = -lo[0] if len(lo) > len(hi) else (-lo[0] + hi[0]) // 2\n    ans += med\nprint(ans)`,
    [{ input: '5 15 1 3', expectedOutput: '24', description: '5+10+5+4=24' }, { input: '2 4 6', expectedOutput: '9', description: '2+3+4=9' }]),

  pyBug('bh-py-h3-10', 'hard', 180, 'Fix First Missing Positive Swap',
    'Goal: Print smallest positive integer (>= 1) missing from array. Symptom: Uses if instead of while on cyclic swap & crashes on out-of-range swap.',
    `arr = list(map(int, input().split()))\nn = len(arr)\nfor i in range(n):\n    if 1 <= arr[i] < n and arr[arr[i]] != arr[i]:\n        t = arr[i]; arr[i] = arr[t - 1]; arr[t - 1] = t\nfor i in range(n):\n    if arr[i] != i: print(i); break\nelse:\n    print(n)`,
    `arr = list(map(int, input().split()))\nn = len(arr)\nfor i in range(n):\n    while 1 <= arr[i] <= n and arr[arr[i] - 1] != arr[i]:\n        t = arr[i]; arr[i] = arr[t - 1]; arr[t - 1] = t\nfor i in range(n):\n    if arr[i] != i + 1: print(i + 1); break\nelse:\n    print(n + 1)`,
    [{ input: '3 4 -1 1', expectedOutput: '2', description: 'Missing 2' }, { input: '1 2 3', expectedOutput: '4', description: 'Missing n+1 = 4' }]),

  // Hard 5m (10)
  pyBug('bh-py-h5-01', 'hard', 300, 'Fix 0-1 Knapsack Reverse & Guard',
    'Goal: Line 1 cap W, Line 2 weights, Line 3 values. Print max value <= W. Symptom: Forward capacity loop reuses items & skips cap=W.',
    `W = int(input().strip())\nwt = list(map(int, input().split()))\nval = list(map(int, input().split()))\ndp = [0] * W\nfor i in range(len(wt)):\n    for c in range(wt[i], W):\n        dp[c] = max(dp[c], dp[c - wt[i]] + val[i - 1])\nprint(dp[-1])`,
    `W = int(input().strip())\nwt = list(map(int, input().split()))\nval = list(map(int, input().split()))\ndp = [0] * (W + 1)\nfor i in range(len(wt)):\n    for c in range(W, wt[i] - 1, -1):\n        dp[c] = max(dp[c], dp[c - wt[i]] + val[i])\nprint(dp[W])`,
    [{ input: '5\n2 3 4\n30 40 50', expectedOutput: '70', description: '2+3 -> 70 (not 2+2)' }, { input: '3\n4 5\n10 20', expectedOutput: '0', description: 'Nothing fits' }]),

  pyBug('bh-py-h5-02', 'hard', 300, 'Fix Dijkstra Relax & Visited Skip',
    'Goal: Line 1 n, edges "u v w". Print shortest dist 0->n-1 else -1. Symptom: Pushes (v, dist) tuple swapped, forgets stale heap check and unreachable check.',
    `import sys, heapq\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn = int(lines[0])\nadj = [[] for _ in range(n)]\nfor l in lines[1:]:\n    u, v, w = map(int, l.split())\n    adj[u].append((v, w))\nd = [10**9] * n; d[0] = 0; pq = [(0, 0)]\nwhile pq:\n    u, cur = heapq.heappop(pq)\n    for v, w in adj[u]:\n        if cur + w <= d[v]:\n            d[v] = w; heapq.heappush(pq, (v, d[v]))\nprint(d[n - 1])`,
    `import sys, heapq\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn = int(lines[0])\nadj = [[] for _ in range(n)]\nfor l in lines[1:]:\n    u, v, w = map(int, l.split())\n    adj[u].append((v, w))\nd = [10**18] * n; d[0] = 0; pq = [(0, 0)]\nwhile pq:\n    cur, u = heapq.heappop(pq)\n    if cur > d[u]: continue\n    for v, w in adj[u]:\n        if cur + w < d[v]:\n            d[v] = cur + w; heapq.heappush(pq, (d[v], v))\nprint(-1 if d[n - 1] >= 10**18 else d[n - 1])`,
    [{ input: '4\n0 1 4\n0 2 1\n2 1 2\n1 3 1', expectedOutput: '4', description: '0->2->1->3 = 4' }, { input: '3\n0 1 5', expectedOutput: '-1', description: 'Node 2 unreachable' }]),

  pyBug('bh-py-h5-03', 'hard', 300, 'Fix Decode Ways Leading Zero Trap',
    'Goal: Digits 1..26 decode ways count. Symptom: Counts "0" as valid 1-char & treats "30" or "06" wrong.',
    `s = input().strip()\ndp = [1] * (len(s) + 1)\nfor i in range(1, len(s) + 1):\n    cur = dp[i - 1]\n    if i >= 2 and int(s[i - 2:i]) <= 26: cur += dp[i - 2]\n    dp[i] = cur\nprint(dp[-1])`,
    `s = input().strip()\nif not s or s[0] == "0":\n    print(0)\nelse:\n    dp = [1] + [0] * len(s)\n    dp[1] = 1\n    for i in range(2, len(s) + 1):\n        if s[i - 1] != "0": dp[i] += dp[i - 1]\n        if 10 <= int(s[i - 2:i]) <= 26: dp[i] += dp[i - 2]\n    print(dp[-1])`,
    [{ input: '12', expectedOutput: '2', description: 'AB, L' }, { input: '100', expectedOutput: '0', description: 'Trailing 00 invalid' }]),

  pyBug('bh-py-h5-04', 'hard', 300, 'Fix Histogram Stack Width Sentinel',
    'Goal: Print largest rectangle area in bar heights histogram. Symptom: Omits trailing 0 flush and uses wrong left-index width formula.',
    `h = list(map(int, input().split()))\nst = []; best = 0\nfor i in range(len(h)):\n    while st and h[st[-1]] >= h[i]:\n        ht = h[st.pop()]\n        w = i - st[-1] if st else i + 1\n        best = max(best, ht * w)\n    st.append(i)\nprint(best)`,
    `h = list(map(int, input().split())) + [0]\nst = []; best = 0\nfor i in range(len(h)):\n    while st and h[st[-1]] > h[i]:\n        ht = h[st.pop()]\n        w = i - st[-1] - 1 if st else i\n        best = max(best, ht * w)\n    st.append(i)\nprint(best)`,
    [{ input: '2 1 5 6 2 3', expectedOutput: '10', description: '5*2=10' }, { input: '1 2 3 4', expectedOutput: '6', description: 'Monotone increasing flush' }]),

  pyBug('bh-py-h5-05', 'hard', 300, 'Fix Word Ladder One-Level Step',
    'Goal: Line 1 beg, Line 2 end, Line 3 dict words. Print shortest word count path or 0. Symptom: Increments level per word popped & retains visited word.',
    `beg = input().strip()\nend = input().strip()\ndict_set = set(input().split())\nfrom collections import deque\nq = deque([beg]); lvl = 0\nwhile q:\n    w = q.popleft(); lvl += 1\n    if w == end: print(lvl); break\n    for i in range(len(w)):\n        for c in "abcdefghijklmnopqrstuvwxyz":\n            nx = w[:i] + c + w[i + 1:]\n            if nx in dict_set: q.append(nx)\nelse:\n    print(0)`,
    `beg = input().strip()\nend = input().strip()\ndict_set = set(input().split())\nfrom collections import deque\nif end not in dict_set:\n    print(0)\nelse:\n    q = deque([beg]); lvl = 1; found = 0\n    while q and not found:\n        for _ in range(len(q)):\n            w = q.popleft()\n            if w == end: found = lvl; break\n            for i in range(len(w)):\n                for c in "abcdefghijklmnopqrstuvwxyz":\n                    nx = w[:i] + c + w[i + 1:]\n                    if nx in dict_set: dict_set.remove(nx); q.append(nx)\n        lvl += 1\n    print(found)`,
    [{ input: 'hit\ncog\nhot dot dog lot log cog', expectedOutput: '5', description: '5 words in chain' }, { input: 'hit\ncog\nhot dot', expectedOutput: '0', description: 'Unreachable end' }]),

  pyBug('bh-py-h5-06', 'hard', 300, 'Fix Longest Valid Parens Base Index',
    'Goal: Print longest contiguous valid parenthesis substring length. Symptom: Base sentinel 0 miscomputes prefix starting at 0, pops empty.',
    `s = input().strip()\nst = [0]; best = 0\nfor i, c in enumerate(s):\n    if c == "(": st.append(i)\n    else:\n        st.pop()\n        if not st: st.append(i)\n        best = max(best, i - st[-1] + 1)\nprint(best)`,
    `s = input().strip()\nst = [-1]; best = 0\nfor i, c in enumerate(s):\n    if c == "(": st.append(i)\n    else:\n        st.pop()\n        if not st: st.append(i)\n        else: best = max(best, i - st[-1])\nprint(best)`,
    [{ input: '()()', expectedOutput: '4', description: 'Starts at index 0 -> 4' }, { input: ')()())', expectedOutput: '4', description: '()()' }]),

  pyBug('bh-py-h5-07', 'hard', 300, 'Fix Sliding Deque Window Monotonic',
    'Goal: Line 1 k, Line 2 ints. Print window maxima space-joined. Symptom: Checks index condition wrong & pops strictly greater wrongly.',
    `k = int(input().strip())\narr = list(map(int, input().split()))\nfrom collections import deque\ndq, out = deque(), []\nfor i, x in enumerate(arr):\n    if dq and dq[0] < i - k: dq.popleft()\n    while dq and arr[dq[-1]] >= x: dq.pop()\n    dq.append(i)\n    if i > k - 1: out.append(arr[dq[-1]])\nprint(" ".join(map(str, out)))`,
    `k = int(input().strip())\narr = list(map(int, input().split()))\nfrom collections import deque\ndq, out = deque(), []\nfor i, x in enumerate(arr):\n    if dq and dq[0] <= i - k: dq.popleft()\n    while dq and arr[dq[-1]] <= x: dq.pop()\n    dq.append(i)\n    if i >= k - 1: out.append(arr[dq[0]])\nprint(" ".join(map(str, out)))`,
    [{ input: '3\n1 3 -1 -3 5 3 6 7', expectedOutput: '3 3 5 5 6 7', description: 'Window maxima' }, { input: '2\n9 4 2', expectedOutput: '9 4', description: 'Descending window' }]),

  pyBug('bh-py-h5-08', 'hard', 300, 'Fix Minimum Window Substring Cover',
    'Goal: Line 1 s, Line 2 t. Print shortest substring length containing all chars of t (else 0). Symptom: Tracks wrong missing decrement on excess duplicates.',
    `s = input().strip()\nt = input().strip()\nfrom collections import Counter\nneed = Counter(t); miss = len(t); l = 0; best = 10**9\nfor r, c in enumerate(s):\n    need[c] -= 1\n    miss -= 1\n    while miss == 0:\n        best = min(best, r - l)\n        need[s[l]] += 1\n        if need[s[l]] >= 0: miss += 1\n        l += 1\nprint(0 if best == 10**9 else best)`,
    `s = input().strip()\nt = input().strip()\nfrom collections import Counter\nneed = Counter(t); miss = len(t); l = 0; best = 10**9\nfor r, c in enumerate(s):\n    if need[c] > 0: miss -= 1\n    need[c] -= 1\n    while miss == 0:\n        best = min(best, r - l + 1)\n        need[s[l]] += 1\n        if need[s[l]] > 0: miss += 1\n        l += 1\nprint(0 if best == 10**9 else best)`,
    [{ input: 'ADOBECODEBANC\nABC', expectedOutput: '4', description: 'BANC' }, { input: 'aa\naaa', expectedOutput: '0', description: 'Impossible' }]),

  pyBug('bh-py-h5-09', 'hard', 300, 'Fix Obstacle Paths Grid First Cell',
    'Goal: Line 1 r c, 0/1 obstacle grid. Count paths (0,0)->(r-1,c-1). Symptom: Continues past top-left obstacle and breaks j==0 carry.',
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\ndp = [1] * c\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == 1: dp[j] = 0\n        else: dp[j] += dp[j - 1]\nprint(dp[-1])`,
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\ndp = [0] * c\ndp[0] = 0 if g[0][0] else 1\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == 1: dp[j] = 0\n        elif j > 0: dp[j] += dp[j - 1]\nprint(dp[-1])`,
    [{ input: '2 2\n1 0\n0 0', expectedOutput: '0', description: 'Start blocked -> 0' }, { input: '3 3\n0 0 0\n0 1 0\n0 0 0', expectedOutput: '2', description: '2 paths' }]),

  pyBug('bh-py-h5-10', 'hard', 300, 'Fix K-Stops Flight Stale Read',
    'Goal: Line 1 n k, edges "u v w". Min cost 0->n-1 with <= k stops. Symptom: Mutates dist in place allowing > k+1 hops in 1 pass & skips INF guard.',
    `import sys\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn, k = map(int, lines[0].split())\nedges = [tuple(map(int, l.split())) for l in lines[1:]]\ndist = [10**9] * n; dist[0] = 0\nfor _ in range(k):\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]: dist[v] = dist[u] + w\nprint(dist[-1])`,
    `import sys\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn, k = map(int, lines[0].split())\nedges = [tuple(map(int, l.split())) for l in lines[1:]]\nINF = 10**18\ndist = [INF] * n; dist[0] = 0\nfor _ in range(k + 1):\n    nd = dist[:]\n    for u, v, w in edges:\n        if dist[u] < INF and dist[u] + w < nd[v]: nd[v] = dist[u] + w\n    dist = nd\nprint(-1 if dist[-1] >= INF else dist[-1])`,
    [{ input: '4 1\n0 1 100\n1 2 100\n2 3 100\n0 2 500', expectedOutput: '600', description: 'Must not chain in-place across 1 pass' }, { input: '3 0\n0 1 50\n1 2 50', expectedOutput: '-1', description: '0 stops cannot use 1 stop' }]),

  // Hard 10m (10)
  pyBug('bh-py-h10-01', 'hard', 600, 'Fix LIS Binary Search Replace Index',
    'Goal: Longest strictly increasing subsequence length. Symptom: Uses bisect_right allowing duplicates and overwrites wrong tail.',
    `import bisect\narr = list(map(int, input().split()))\ntails = []\nfor x in arr:\n    idx = bisect.bisect_right(tails, x)\n    if idx == len(tails): tails.append(x)\n    else: tails[idx - 1] = x\nprint(len(tails) - 1)`,
    `import bisect\narr = list(map(int, input().split()))\ntails = []\nfor x in arr:\n    idx = bisect.bisect_left(tails, x)\n    if idx == len(tails): tails.append(x)\n    else: tails[idx] = x\nprint(len(tails))`,
    [{ input: '7 7 7 7', expectedOutput: '1', description: 'Strict -> 1' }, { input: '10 9 2 5 3 7 101 18', expectedOutput: '4', description: 'LIS length 4' }]),

  pyBug('bh-py-h10-02', 'hard', 600, 'Fix Palindrome Centers Even Offset',
    'Goal: Count all palindromic substrings in string s. Symptom: Skips even-length palindromes & stops loop early.',
    `s = input().strip()\nn = len(s); ans = 0\nfor c in range(n):\n    l = r = c\n    while l > 0 and r < n and s[l] == s[r]:\n        ans += 1; l -= 1; r += 1\nprint(ans)`,
    `s = input().strip()\nn = len(s); ans = 0\nfor c in range(2 * n - 1):\n    l, r = c // 2, (c + 1) // 2\n    while l >= 0 and r < n and s[l] == s[r]:\n        ans += 1; l -= 1; r += 1\nprint(ans)`,
    [{ input: 'aaa', expectedOutput: '6', description: '3 odd + 2+1 = 6' }, { input: 'abba', expectedOutput: '6', description: 'a,b,b,a,bb,abba' }]),

  pyBug('bh-py-h10-03', 'hard', 600, 'Fix Regular Expression Star Match',
    'Goal: Line 1 s, Line 2 pattern p (.=1 char, *=0+ of preceding char). Print YES if full match else NO. Symptom: Mishandles zero-repeat * match and base row.',
    `s = input().strip()\np = input().strip()\nm, n = len(s), len(p)\ndp = [[False] * (n + 1) for _ in range(m + 1)]\ndp[0][0] = True\nfor i in range(1, m + 1):\n    for j in range(1, n + 1):\n        if p[j - 1] == "*": dp[i][j] = dp[i][j - 1]\n        elif p[j - 1] == "." or s[i - 1] == p[j - 1]: dp[i][j] = dp[i - 1][j - 1]\nprint("YES" if dp[m][n] else "NO")`,
    `s = input().strip()\np = input().strip()\nm, n = len(s), len(p)\ndp = [[False] * (n + 1) for _ in range(m + 1)]\ndp[0][0] = True\nfor j in range(2, n + 1):\n    if p[j - 1] == "*": dp[0][j] = dp[0][j - 2]\nfor i in range(1, m + 1):\n    for j in range(1, n + 1):\n        if p[j - 1] == "*":\n            dp[i][j] = dp[i][j - 2] or (dp[i - 1][j] and (p[j - 2] == "." or p[j - 2] == s[i - 1]))\n        elif p[j - 1] == "." or s[i - 1] == p[j - 1]: dp[i][j] = dp[i - 1][j - 1]\nprint("YES" if dp[m][n] else "NO")`,
    [{ input: 'aab\nc*a*b', expectedOutput: 'YES', description: 'Zero c* then aa then b' }, { input: 'mississippi\nmis*is*p*.', expectedOutput: 'NO', description: 'Missing second p match' }]),

  pyBug('bh-py-h10-04', 'hard', 600, 'Fix N-Queens Diagonal Bit Collision',
    'Goal: Count distinct N-Queens solutions (1 <= n <= 8). Symptom: Wrong negative diagonal key r+c repeated, forgets backtrack cleanup.',
    `n = int(input().strip())\ncols, d1, d2 = set(), set(), set()\ndef dfs(r):\n    if r == n: return 1\n    tot = 0\n    for c in range(n):\n        if c in cols or (r + c) in d1 or (r + c) in d2: continue\n        cols.add(c); d1.add(r + c); d2.add(r - c)\n        tot += dfs(r)\n        cols.remove(c)\n    return tot\nprint(dfs(0))`,
    `n = int(input().strip())\ncols, d1, d2 = set(), set(), set()\ndef dfs(r):\n    if r == n: return 1\n    tot = 0\n    for c in range(n):\n        if c in cols or (r + c) in d1 or (r - c) in d2: continue\n        cols.add(c); d1.add(r + c); d2.add(r - c)\n        tot += dfs(r + 1)\n        cols.remove(c); d1.remove(r + c); d2.remove(r - c)\n    return tot\nprint(dfs(0))`,
    [{ input: '4', expectedOutput: '2', description: '4 queens = 2' }, { input: '8', expectedOutput: '92', description: '8 queens = 92' }]),

  pyBug('bh-py-h10-05', 'hard', 600, 'Fix Lex Topological Heap Drain',
    'Goal: Line 1 n, edges "u v". Print lex smallest topo sort space-joined or IMPOSSIBLE. Symptom: Uses LIFO pop and wrong cycle condition.',
    `import sys, heapq\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn = int(lines[0])\nadj = [[] for _ in range(n)]; ind = [0] * n\nfor l in lines[1:]:\n    u, v = map(int, l.split())\n    adj[u].append(v); ind[v] += 1\npq = [i for i in range(n) if ind[i] == 0]\nout = []\nwhile pq:\n    u = pq.pop(); out.append(u)\n    for v in adj[u]:\n        ind[v] -= 1\n        if ind[v] == 0: pq.append(v)\nprint(" ".join(map(str, out)) if out else "IMPOSSIBLE")`,
    `import sys, heapq\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn = int(lines[0])\nadj = [[] for _ in range(n)]; ind = [0] * n\nfor l in lines[1:]:\n    u, v = map(int, l.split())\n    adj[u].append(v); ind[v] += 1\npq = [i for i in range(n) if ind[i] == 0]; heapq.heapify(pq)\nout = []\nwhile pq:\n    u = heapq.heappop(pq); out.append(u)\n    for v in adj[u]:\n        ind[v] -= 1\n        if ind[v] == 0: heapq.heappush(pq, v)\nprint(" ".join(map(str, out)) if len(out) == n else "IMPOSSIBLE")`,
    [{ input: '4\n1 0\n2 0\n3 1\n3 2', expectedOutput: '3 1 2 0', description: 'Lex order 3 1 2 0' }, { input: '3\n0 1\n1 0', expectedOutput: 'IMPOSSIBLE', description: 'Node 2 OK, 0-1 cycle -> IMPOSSIBLE' }]),

  pyBug('bh-py-h10-06', 'hard', 600, 'Fix Coin Combinations Loop Swap',
    'Goal: Line 1 T, Line 2 coins. Count unordered combinations (2+1 same as 1+2) summing to T. Symptom: Amount outer loop counts permutations instead of combinations.',
    `t = int(input().strip())\ncoins = list(map(int, input().split()))\ndp = [1] + [0] * (t - 1)\nfor x in range(1, t + 1):\n    for c in coins:\n        if x >= c: dp[x] += dp[x - c]\nprint(dp[t])`,
    `t = int(input().strip())\ncoins = list(map(int, input().split()))\ndp = [1] + [0] * t\nfor c in coins:\n    for x in range(c, t + 1):\n        dp[x] += dp[x - c]\nprint(dp[t])`,
    [{ input: '5\n1 2 5', expectedOutput: '4', description: '4 unique combinations' }, { input: '4\n1 2', expectedOutput: '3', description: '1111, 112, 22 -> 3' }]),

  pyBug('bh-py-h10-07', 'hard', 600, 'Fix LRU Cache Eviction Order Bug',
    'Goal: Line 1 cap, lines "PUT k v" or "GET k". Print sum of GET hits. Symptom: Pops most recent instead of LRU and ignores updating recency on GET.',
    `import sys\nfrom collections import OrderedDict\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\ncap = int(lines[0])\nc, ans = OrderedDict(), 0\nfor l in lines[1:]:\n    p = l.split()\n    if p[0] == "PUT":\n        c[int(p[1])] = int(p[2])\n        if len(c) > cap: c.popitem(last=True)\n    else:\n        k = int(p[1])\n        if k in c: ans += c[k]\nprint(ans)`,
    `import sys\nfrom collections import OrderedDict\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\ncap = int(lines[0])\nc, ans = OrderedDict(), 0\nfor l in lines[1:]:\n    p = l.split()\n    if p[0] == "PUT":\n        k, v = int(p[1]), int(p[2])\n        if k in c: c.move_to_end(k)\n        c[k] = v\n        if len(c) > cap: c.popitem(last=False)\n    else:\n        k = int(p[1])\n        if k in c:\n            c.move_to_end(k)\n            ans += c[k]\nprint(ans)`,
    [{ input: '2\nPUT 1 10\nPUT 2 20\nGET 1\nPUT 3 30\nGET 2\nGET 1', expectedOutput: '20', description: 'GET 1 hits twice (10+10=20), key 2 evicted' }, { input: '2\nPUT 1 5\nPUT 2 4\nPUT 1 9\nPUT 3 7\nGET 1', expectedOutput: '9', description: 'PUT update refreshes recency over key 2' }]),

  pyBug('bh-py-h10-08', 'hard', 600, 'Fix Maximal All-One Square Area',
    'Goal: Line 1 r c, 0/1 matrix. Print largest all-1 square area (side^2). Symptom: Takes max instead of min of neighbors and prints side instead of area.',
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\ndp = [[0] * c for _ in range(r)]; best = 0\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == 1:\n            dp[i][j] = 1 + max(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])\n            best = max(best, dp[i][j])\nprint(best)`,
    `r, c = map(int, input().split())\ng = [list(map(int, input().split())) for _ in range(r)]\ndp = [[0] * (c + 1) for _ in range(r + 1)]; best = 0\nfor i in range(1, r + 1):\n    for j in range(1, c + 1):\n        if g[i - 1][j - 1] == 1:\n            dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])\n            best = max(best, dp[i][j])\nprint(best * best)`,
    [{ input: '4 5\n1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0', expectedOutput: '4', description: 'Side 2 -> area 4' }, { input: '2 2\n1 1\n1 0', expectedOutput: '1', description: 'Only 1x1 fits' }]),

  pyBug('bh-py-h10-09', 'hard', 600, 'Fix Alien Graph DAG Cycle Check',
    'Goal: Line 1 n, edges "u v". Print longest path length in DAG, or -1 if cyclic! Symptom: Crashes infinite recursion on cycle without 3-state color.',
    `import sys\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn = int(lines[0])\nadj = [[] for _ in range(n)]\nfor l in lines[1:]:\n    u, v = map(int, l.split()); adj[u].append(v)\nmemo = [0] * n\ndef dfs(u):\n    if memo[u]: return memo[u]\n    best = 0\n    for v in adj[u]: best = max(best, 1 + dfs(v))\n    memo[u] = best; return best\nprint(max(dfs(i) for i in range(n)))`,
    `import sys\nlines = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]\nn = int(lines[0])\nadj = [[] for _ in range(n)]\nfor l in lines[1:]:\n    u, v = map(int, l.split()); adj[u].append(v)\nstate = [0] * n; memo = [0] * n; cyc = False\ndef dfs(u):\n    global cyc\n    if state[u] == 1: cyc = True; return 0\n    if state[u] == 2: return memo[u]\n    state[u] = 1; best = 0\n    for v in adj[u]: best = max(best, 1 + dfs(v))\n    state[u] = 2; memo[u] = best; return best\nans = max((dfs(i) for i in range(n)), default=0)\nprint(-1 if cyc else ans)`,
    [{ input: '4\n0 1\n1 2\n2 3', expectedOutput: '3', description: 'Path length 3' }, { input: '3\n0 1\n1 2\n2 0', expectedOutput: '-1', description: 'Cycle returns -1' }]),

  pyBug('bh-py-h10-10', 'hard', 600, 'Fix LCS Subsequence Reconstruction',
    'Goal: Line 1 s, Line 2 t. Print LCS length. Symptom: Overwrites prev diagonally in 1D DP and off-by-one range.',
    `s, t = input().strip(), input().strip()\nm, n = len(s), len(t)\ndp = [0] * (n + 1)\nfor i in range(m):\n    for j in range(n):\n        if s[i] == t[j]: dp[j + 1] = dp[j] + 1\n        else: dp[j + 1] = max(dp[j], dp[j + 1])\nprint(dp[n - 1])`,
    `s, t = input().strip(), input().strip()\nm, n = len(s), len(t)\ndp = [0] * (n + 1)\nfor i in range(m):\n    prev = 0\n    for j in range(n):\n        tmp = dp[j + 1]\n        if s[i] == t[j]: dp[j + 1] = prev + 1\n        else: dp[j + 1] = max(dp[j], dp[j + 1])\n        prev = tmp\nprint(dp[n])`,
    [{ input: 'abcba\nabcbcba', expectedOutput: '5', description: 'Same-row reuse trap in 1D DP' }, { input: 'abcde\nace', expectedOutput: '3', description: 'ace len 3' }]),
];

export const PYTHON_BUG_QUESTIONS = [
  ...PY_BUG_EASY,
  ...PY_BUG_MED,
  ...PY_BUG_HARD,
];
