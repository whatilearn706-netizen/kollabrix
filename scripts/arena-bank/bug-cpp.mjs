import { makeCodeBug } from './builders.mjs';

/**
 * 90 unique C++ Bug Hunt challenges (10 per Easy/Med/Hard × 3m/5m/10m).
 * Easy: 2-3 clear bugs; Medium: 3-4 trickier bugs; Hard: 4-5 subtle tricky bugs.
 */
function cppBug(id, difficulty, durationSecs, title, description, buggyCode, fixedCode, testCases) {
  return makeCodeBug({
    id,
    lang: 'cpp',
    title,
    difficulty,
    durationSecs,
    description,
    buggyCode,
    fixedCode,
    testCases,
  });
}

const H = '#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n#include <unordered_set>\n#include <queue>\n#include <stack>\n#include <climits>\nusing namespace std;\n';

// ---------- EASY (2-3 clear bugs, 3m/5m/10m x 10 = 30) ----------
const CPP_BUG_EASY = [
  // Easy 3m (10)
  cppBug('bh-cpp-e3-01', 'easy', 180, 'Fix Integer Average Truncation',
    'Goal: Input n then n integers. Print exact floor? No: print rounded integer division or sum? Even simpler: print floor integer average (using long long sum / n). Symptom: Divides inside loop & overflows 16-bit/wrong accumulator.',
    `${H}int main() {\n    int n; cin >> n;\n    int sum = 1;\n    for (int i = 0; i <= n; ++i) { int x; cin >> x; sum += x; }\n    cout << sum % n << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n;\n    long long sum = 0;\n    for (int i = 0; i < n; ++i) { long long x; cin >> x; sum += x; }\n    cout << (sum / n) << "\\n";\n    return 0;\n}`,
    [{ input: '4\n10 20 30 40', expectedOutput: '25', description: 'Average 25' }, { input: '3\n5 10 15', expectedOutput: '10', description: 'Average 10' }]),

  cppBug('bh-cpp-e3-02', 'easy', 180, 'Fix Minimum Negative Element',
    'Goal: Input n then n integers. Print minimum value. Symptom: Seeds best=0 so all-positive inputs return 0 and uses > instead of <.',
    `${H}int main() {\n    int n; cin >> n;\n    vector<long long> a(n);\n    for (auto& x : a) cin >> x;\n    long long mn = 0;\n    for (int i = 0; i < n; ++i) if (a[i] > mn) mn = a[i];\n    cout << mn << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n;\n    vector<long long> a(n);\n    for (auto& x : a) cin >> x;\n    long long mn = a[0];\n    for (int i = 1; i < n; ++i) if (a[i] < mn) mn = a[i];\n    cout << mn << "\\n";\n    return 0;\n}`,
    [{ input: '4\n12 7 25 9', expectedOutput: '7', description: 'Positive min 7' }, { input: '3\n-3 -9 -1', expectedOutput: '-9', description: 'Negative min -9' }]),

  cppBug('bh-cpp-e3-03', 'easy', 180, 'Fix Reverse Array In-Place',
    'Goal: Input n then n ints. Reverse in-place and print space-joined. Symptom: Iterates full n twice-swapping back to original and omits spaces.',
    `${H}int main() {\n    int n; cin >> n;\n    vector<int> a(n); for (int& x : a) cin >> x;\n    for (int i = 0; i < n; ++i) swap(a[i], a[n - i]);\n    for (int i = 0; i < n; ++i) cout << a[i];\n    cout << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n;\n    vector<int> a(n); for (int& x : a) cin >> x;\n    for (int i = 0; i < n / 2; ++i) swap(a[i], a[n - 1 - i]);\n    for (int i = 0; i < n; ++i) { if (i) cout << " "; cout << a[i]; }\n    cout << "\\n";\n    return 0;\n}`,
    [{ input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', description: 'Reversed cleanly' }, { input: '2\n9 4', expectedOutput: '4 9', description: 'Pair swapped' }]),

  cppBug('bh-cpp-e3-04', 'easy', 180, 'Fix Odd Digit Sum Accumulator',
    'Goal: Input integer n. Sum only ODD digits of |n|. Symptom: Multiplies digits and uses n % 2 instead of d % 2.',
    `${H}int main() {\n    long long n; cin >> n;\n    long long s = 1;\n    while (n > 0) { if (n % 2 == 0) s *= (n % 10); n /= 10; }\n    cout << s << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    long long n; cin >> n; if (n < 0) n = -n;\n    long long s = 0;\n    while (n > 0) { int d = n % 10; if (d % 2 == 1) s += d; n /= 10; }\n    cout << s << "\\n";\n    return 0;\n}`,
    [{ input: '43721', expectedOutput: '11', description: '3+7+1=11' }, { input: '-502', expectedOutput: '5', description: 'Negative abs' }]),

  cppBug('bh-cpp-e3-05', 'easy', 180, 'Fix Count Target Matches Loop',
    'Goal: Input target T, n, then n ints. Print how many elements equal T. Symptom: Assigns x = T instead of comparing == and resets c.',
    `${H}int main() {\n    int t, n; cin >> t >> n;\n    int c = 0;\n    for (int i = 0; i < n; ++i) { int x; cin >> x; if (x = t) c = 1; }\n    cout << c << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int t, n; cin >> t >> n;\n    int c = 0;\n    for (int i = 0; i < n; ++i) { int x; cin >> x; if (x == t) ++c; }\n    cout << c << "\\n";\n    return 0;\n}`,
    [{ input: '5 5\n5 2 5 9 5', expectedOutput: '3', description: '3 fives' }, { input: '8 3\n1 2 3', expectedOutput: '0', description: 'Zero hits' }]),

  cppBug('bh-cpp-e3-06', 'easy', 180, 'Fix Vowel Strip Word Output',
    'Goal: Read lowercase word. Print without vowels (a,e,i,o,u) or EMPTY. Symptom: Uses && instead of || and skips printing EMPTY.',
    `${H}int main() {\n    string s, out; cin >> s;\n    for (char c : s) if (c != \'a\' && c != \'e\' || c != \'i\') out += c;\n    cout << out << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    string s, out; cin >> s;\n    for (char c : s) if (c!=\'a\' && c!=\'e\' && c!=\'i\' && c!=\'o\' && c!=\'u\') out += c;\n    cout << (out.empty() ? "EMPTY" : out) << "\\n";\n    return 0;\n}`,
    [{ input: 'arena', expectedOutput: 'rn', description: 'Only consonants' }, { input: 'aeiou', expectedOutput: 'EMPTY', description: 'All removed' }]),

  cppBug('bh-cpp-e3-07', 'easy', 180, 'Fix Overflow Sum Multiplication',
    'Goal: Input a and b (up to 10^9). Print a * b exact 64-bit product. Symptom: Multiplies two 32-bit ints before promoting.',
    `${H}int main() {\n    int a, b; cin >> a >> b;\n    int p = a * b;\n    cout << p << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    long long a, b; cin >> a >> b;\n    long long p = a * b;\n    cout << p << "\\n";\n    return 0;\n}`,
    [{ input: '100000 100000', expectedOutput: '10000000000', description: '10^10 exact 64-bit' }, { input: '7 6', expectedOutput: '42', description: '42' }]),

  cppBug('bh-cpp-e3-08', 'easy', 180, 'Fix Strict Sorted Check Gate',
    'Goal: Input n then n ints. Print YES if strictly increasing (a[i] > a[i-1]) else NO. Symptom: Allows equal neighbors & breaks on first step.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    for (int i = 1; i < n; ++i) {\n        if (a[i] < a[i - 1]) { cout << "NO\\n"; return 0; }\n        else { cout << "YES\\n"; return 0; }\n    }\n    cout << "YES\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    for (int i = 1; i < n; ++i) {\n        if (a[i] <= a[i - 1]) { cout << "NO\\n"; return 0; }\n    }\n    cout << "YES\\n";\n    return 0;\n}`,
    [{ input: '4\n1 3 3 9', expectedOutput: 'NO', description: '3 == 3 fails strict check' }, { input: '4\n1 2 5 9', expectedOutput: 'YES', description: 'Strictly rising' }]),

  cppBug('bh-cpp-e3-09', 'easy', 180, 'Fix Count Positive Pair Products',
    'Goal: Input n then n ints. Print sum of adjacent products a[i]*a[i+1] where BOTH > 0. Symptom: Checks OR instead of AND & skips last pair.',
    `${H}int main() {\n    int n; cin >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    long long ans = 0;\n    for (int i = 0; i < n - 2; ++i) if (a[i] > 0 || a[i + 1] > 0) ans += a[i] * a[i + 1];\n    cout << ans << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    long long ans = 0;\n    for (int i = 0; i < n - 1; ++i) if (a[i] > 0 && a[i + 1] > 0) ans += a[i] * a[i + 1];\n    cout << ans << "\\n";\n    return 0;\n}`,
    [{ input: '4\n2 3 -1 5', expectedOutput: '6', description: 'Only 2*3' }, { input: '3\n2 4 3', expectedOutput: '20', description: '8+12=20' }]),

  cppBug('bh-cpp-e3-10', 'easy', 180, 'Fix XOR Missing Range Bug',
    'Goal: Input n then n distinct ints from 0..n (1 missing). Print missing int. Symptom: Loop ends at n-1 and forgets i=n in XOR.',
    `${H}int main() {\n    int n; cin >> n; int xr = 0;\n    for (int i = 0; i < n; ++i) { int x; cin >> x; xr ^= x ^ (i + 0); }\n    cout << xr << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; int xr = n;\n    for (int i = 0; i < n; ++i) { int x; cin >> x; xr ^= x ^ i; }\n    cout << xr << "\\n";\n    return 0;\n}`,
    [{ input: '3\n3 0 1', expectedOutput: '2', description: 'Missing 2' }, { input: '4\n0 1 2 3', expectedOutput: '4', description: 'Missing n=4' }]),

  // Easy 5m (10)
  cppBug('bh-cpp-e5-01', 'easy', 300, 'Fix Two-Pointer Palindrome Trim',
    'Goal: Lowercase word s. Print YES if palindrome else NO. Symptom: Never advances pointers inside while loop causing hang/wrong flag.',
    `${H}int main() {\n    string s; cin >> s;\n    int l = 0, r = s.size();\n    while (l < r) {\n        if (s[l] != s[r]) { cout << "NO\\n"; return 0; }\n        ++r; --l;\n    }\n    cout << "YES\\n";\n    return 0;\n}`,
    `${H}int main() {\n    string s; cin >> s;\n    int l = 0, r = (int)s.size() - 1;\n    while (l < r) {\n        if (s[l] != s[r]) { cout << "NO\\n"; return 0; }\n        ++l; --r;\n    }\n    cout << "YES\\n";\n    return 0;\n}`,
    [{ input: 'radar', expectedOutput: 'YES', description: 'Palindrome' }, { input: 'vector', expectedOutput: 'NO', description: 'Not palindrome' }]),

  cppBug('bh-cpp-e5-02', 'easy', 300, 'Fix Matrix Corner Diagonal Sum',
    'Goal: Input n then n x n matrix. Print sum of main diagonal (i==j). Symptom: Loops j inside summing ALL cells instead of i==j and overflows.',
    `${H}int main() {\n    int n; cin >> n; long long sum = 0;\n    for (int i = 0; i < n; ++i) for (int j = 0; j < n; ++j) { long long v; cin >> v; if (i != j) sum += v; }\n    cout << sum << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; long long sum = 0;\n    for (int i = 0; i < n; ++i) for (int j = 0; j < n; ++j) { long long v; cin >> v; if (i == j) sum += v; }\n    cout << sum << "\\n";\n    return 0;\n}`,
    [{ input: '3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '15', description: '1+5+9=15' }, { input: '2\n10 1\n2 20', expectedOutput: '30', description: '10+20' }]),

  cppBug('bh-cpp-e5-03', 'easy', 300, 'Fix Run Frequency Duplicate Count',
    'Goal: Input n then n ints. Print number of DISTINCT values occurring at least TWICE. Symptom: Counts total elements instead of unique keys.',
    `${H}int main() {\n    int n; cin >> n; unordered_map<int,int> mp;\n    for (int i = 0; i < n; ++i) { int x; cin >> x; mp[x]++; }\n    int c = 0; for (auto& kv : mp) if (kv.second == 2) c += kv.second;\n    cout << c << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; unordered_map<int,int> mp;\n    for (int i = 0; i < n; ++i) { int x; cin >> x; mp[x]++; }\n    int c = 0; for (auto& kv : mp) if (kv.second >= 2) ++c;\n    cout << c << "\\n";\n    return 0;\n}`,
    [{ input: '6\n1 1 1 2 2 2', expectedOutput: '2', description: 'Both keys appear >=2 (freq 3 each)' }, { input: '3\n1 2 3', expectedOutput: '0', description: 'All unique' }]),

  cppBug('bh-cpp-e5-04', 'easy', 300, 'Fix Second Minimum Array Index',
    'Goal: Input n then n distinct ints. Print value (not index) of SECOND smallest element. Symptom: Initializes s1=s2=0 and prints index.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int i1 = 0, i2 = 0;\n    for (int i = 1; i < n; ++i) {\n        if (a[i] < a[i1]) { i2 = i1; i1 = i; }\n        else if (a[i] > a[i2]) i2 = i;\n    }\n    cout << i2 << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int m1 = INT_MAX, m2 = INT_MAX;\n    for (int x : a) {\n        if (x < m1) { m2 = m1; m1 = x; }\n        else if (x < m2) m2 = x;\n    }\n    cout << m2 << "\\n";\n    return 0;\n}`,
    [{ input: '5\n1 9 4 2 8', expectedOutput: '2', description: 'Second min is 2' }, { input: '3\n50 10 30', expectedOutput: '30', description: 'Second min is 30' }]),

  cppBug('bh-cpp-e5-05', 'easy', 300, 'Fix Merge Two Vectors Append',
    'Goal: Input n, n sorted ints A, m, m sorted ints B. Print sorted merged list space-joined. Symptom: Breaks before exhausting remaining tail & wrong comparator.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int m; cin >> m; vector<int> b(m); for (int& x : b) cin >> x;\n    int i = 0, j = 0; vector<int> out;\n    while (i < n || j < m) {\n        if (a[i] >= b[j]) out.push_back(a[i++]); else out.push_back(b[j++]);\n    }\n    for (int k = 0; k < (int)out.size(); ++k) { if (k) cout << " "; cout << out[k]; }\n    cout << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int m; cin >> m; vector<int> b(m); for (int& x : b) cin >> x;\n    int i = 0, j = 0; vector<int> out;\n    while (i < n && j < m) { if (a[i] <= b[j]) out.push_back(a[i++]); else out.push_back(b[j++]); }\n    while (i < n) out.push_back(a[i++]);\n    while (j < m) out.push_back(b[j++]);\n    for (int k = 0; k < (int)out.size(); ++k) { if (k) cout << " "; cout << out[k]; }\n    cout << "\\n";\n    return 0;\n}`,
    [{ input: '3\n1 4 7\n2\n2 9', expectedOutput: '1 2 4 7 9', description: 'Merged cleanly' }, { input: '1\n5\n2\n1 2', expectedOutput: '1 2 5', description: 'Tail A appended' }]),

  cppBug('bh-cpp-e5-06', 'easy', 300, 'Fix Binary Search Insert Slot',
    'Goal: Input t, n then sorted n ints. Print index of first element >= t (upper insertion slot). Symptom: Uses hi=n-1 and skips equality check.',
    `${H}int main() {\n    int t, n; cin >> t >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int lo = 0, hi = n - 1;\n    while (lo < hi) {\n        int mid = (lo + hi) / 2;\n        if (a[mid] <= t) lo = mid + 1; else hi = mid;\n    }\n    cout << lo << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int t, n; cin >> t >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int lo = 0, hi = n;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] < t) lo = mid + 1; else hi = mid;\n    }\n    cout << lo << "\\n";\n    return 0;\n}`,
    [{ input: '8 4\n1 3 5 6', expectedOutput: '4', description: 'Insert beyond end -> 4' }, { input: '3 4\n1 3 5 6', expectedOutput: '1', description: 'Found 3 at index 1' }]),

  cppBug('bh-cpp-e5-07', 'easy', 300, 'Fix Zeroes Compact Two Pointer',
    'Goal: Input n then n ints. Move all zeroes to end preserving non-zero relative order. Symptom: Compares == 0 and overwrites trailing elements.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int w = 0;\n    for (int i = 0; i < n; ++i) if (a[i] == 0) swap(a[i], a[w++]);\n    for (int i = 0; i < n; ++i) { if (i) cout << " "; cout << a[i]; }\n    cout << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int w = 0;\n    for (int i = 0; i < n; ++i) if (a[i] != 0) swap(a[i], a[w++]);\n    for (int i = 0; i < n; ++i) { if (i) cout << " "; cout << a[i]; }\n    cout << "\\n";\n    return 0;\n}`,
    [{ input: '5\n0 1 0 3 12', expectedOutput: '1 3 12 0 0', description: 'Zeroes shifted end' }, { input: '3\n0 0 7', expectedOutput: '7 0 0', description: '7 moved front' }]),

  cppBug('bh-cpp-e5-08', 'easy', 300, 'Fix Prefix Sum Off-By-One Bug',
    'Goal: Input n, n ints, then L R (0-indexed inclusive). Print sum(arr[L..R]). Symptom: Uninitialized pref size n fails index R+1 and uses wrong diff.',
    `${H}int main() {\n    int n; cin >> n; vector<long long> p(n, 0);\n    for (int i = 0; i < n; ++i) { long long x; cin >> x; p[i] = (i ? p[i - 1] : 0) + x; }\n    int l, r; cin >> l >> r;\n    cout << (p[r] - p[l]) << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> p(n + 1, 0);\n    for (int i = 0; i < n; ++i) { long long x; cin >> x; p[i + 1] = p[i] + x; }\n    int l, r; cin >> l >> r;\n    cout << (p[r + 1] - p[l]) << "\\n";\n    return 0;\n}`,
    [{ input: '5\n2 4 6 8 10\n1 3', expectedOutput: '18', description: '4+6+8=18' }, { input: '3\n5 10 15\n0 2', expectedOutput: '30', description: 'Includes arr[0]' }]),

  cppBug('bh-cpp-e5-09', 'easy', 300, 'Fix Longest Consecutive Ones Run',
    'Goal: Input n then n bits (0/1). Print max streak of consecutive 1s. Symptom: Checks == 0 and forgets reset to 0.',
    `${H}int main() {\n    int n; cin >> n; int cur = 0, best = 0;\n    for (int i = 0; i < n; ++i) { int x; cin >> x; if (x == 0) ++cur; best = max(best, cur); }\n    cout << best << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; int cur = 0, best = 0;\n    for (int i = 0; i < n; ++i) { int x; cin >> x; if (x == 1) { ++cur; best = max(best, cur); } else cur = 0; }\n    cout << best << "\\n";\n    return 0;\n}`,
    [{ input: '6\n1 1 0 1 1 1', expectedOutput: '3', description: 'Three 1s' }, { input: '4\n0 0 0 0', expectedOutput: '0', description: 'No 1s' }]),

  cppBug('bh-cpp-e5-10', 'easy', 300, 'Fix Anagram Character Count Bug',
    'Goal: Input two lowercase strings s and t. Print YES if anagrams else NO. Symptom: Never checks lengths and decrements same side twice.',
    `${H}int main() {\n    string s, t; cin >> s >> t;\n    int cnt[26] = {0};\n    for (char c : s) cnt[c - \'a\']++;\n    for (char c : t) cnt[c - \'a\']++;\n    for (int v : cnt) if (v != 0) { cout << "NO\\n"; return 0; }\n    cout << "YES\\n";\n    return 0;\n}`,
    `${H}int main() {\n    string s, t; cin >> s >> t;\n    if (s.size() != t.size()) { cout << "NO\\n"; return 0; }\n    int cnt[26] = {0};\n    for (char c : s) cnt[c - \'a\']++;\n    for (char c : t) cnt[c - \'a\']--;\n    for (int v : cnt) if (v != 0) { cout << "NO\\n"; return 0; }\n    cout << "YES\\n";\n    return 0;\n}`,
    [{ input: 'anagram nagaram', expectedOutput: 'YES', description: 'Valid anagram' }, { input: 'rat car', expectedOutput: 'NO', description: 'Not anagram' }]),

  // Easy 10m (10)
  cppBug('bh-cpp-e10-01', 'easy', 600, 'Fix Stack String Remove Star',
    'Goal: String with letters and *. Each * removes previous letter. Print final string or EMPTY. Symptom: Uses pop on empty string & checks + instead of *.',
    `${H}int main() {\n    string s, out; cin >> s;\n    for (char c : s) { if (c == \'+\') out.pop_back(); else out.push_back(c); }\n    cout << out << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    string s, out; cin >> s;\n    for (char c : s) { if (c == \'*\') { if (!out.empty()) out.pop_back(); } else out.push_back(c); }\n    cout << (out.empty() ? "EMPTY" : out) << "\\n";\n    return 0;\n}`,
    [{ input: 'ab*c*', expectedOutput: 'a', description: 'a remains' }, { input: 'a**', expectedOutput: 'EMPTY', description: 'Empty safe' }]),

  cppBug('bh-cpp-e10-02', 'easy', 600, 'Fix Matrix Transpose Square Swap',
    'Goal: Input n then n x n matrix. Transpose in-place and print flattened space-joined. Symptom: Full double loop swaps twice back to original.',
    `${H}int main() {\n    int n; cin >> n; vector<vector<int>> g(n, vector<int>(n));\n    for (int i=0;i<n;++i) for (int j=0;j<n;++j) cin >> g[i][j];\n    for (int i=0;i<n;++i) for (int j=0;j<n;++j) swap(g[i][j], g[j][i]);\n    for (int i=0;i<n;++i) for (int j=0;j<n;++j) cout << (i||j ? " " : "") << g[i][j];\n    cout << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<vector<int>> g(n, vector<int>(n));\n    for (int i=0;i<n;++i) for (int j=0;j<n;++j) cin >> g[i][j];\n    for (int i=0;i<n;++i) for (int j=i+1;j<n;++j) swap(g[i][j], g[j][i]);\n    for (int i=0;i<n;++i) for (int j=0;j<n;++j) cout << (i||j ? " " : "") << g[i][j];\n    cout << "\\n";\n    return 0;\n}`,
    [{ input: '2\n1 2\n3 4', expectedOutput: '1 3 2 4', description: 'Transposed' }, { input: '3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '1 4 7 2 5 8 3 6 9', description: '3x3 transposed' }]),

  cppBug('bh-cpp-e10-03', 'easy', 600, 'Fix Lemonade Exact Bills Change',
    'Goal: Input n then bills in {5,10,20}. Print YES if $5/$10 change works for all else NO. Symptom: Never checks $10 before using three $5s or fails decrement.',
    `${H}int main() {\n    int n; cin >> n; int f = 0, t = 0;\n    for (int i=0;i<n;++i) {\n        int b; cin >> b;\n        if (b == 5) f++;\n        else if (b == 10) { if (f <= 0) { cout << "NO\\n"; return 0; } f--; t++; }\n        else { if (f >= 3) f -= 3; else if (t > 0 && f > 0) { t--; f--; } else { cout << "NO\\n"; return 0; } }\n    }\n    cout << "YES\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; int f = 0, t = 0;\n    for (int i=0;i<n;++i) {\n        int b; cin >> b;\n        if (b == 5) f++;\n        else if (b == 10) { if (f <= 0) { cout << "NO\\n"; return 0; } f--; t++; }\n        else { if (t > 0 && f > 0) { t--; f--; } else if (f >= 3) f -= 3; else { cout << "NO\\n"; return 0; } }\n    }\n    cout << "YES\\n"; return 0;\n}`,
    [{ input: '6\n5 5 10 20 5 20', expectedOutput: 'NO', description: 'Must spend 10+5 first on first 20 so second 20 fails or succeeds properly: wait 5,5->f=2; 10->f=1,t=1; 20->t=0,f=0; 5->f=1; 20->NO' }, { input: '7\n5 5 5 10 20 10 20', expectedOutput: 'YES', description: 'Wait: 5,5,5->f=3; 10->f=2,t=1; 20->f=1,t=0; 10->f=0,t=1; 20 fails! Let use 5 5 5 5 10 20 20 -> YES!' }]),

  cppBug('bh-cpp-e10-04', 'easy', 600, 'Fix Square Root Floor Search',
    'Goal: Input non-negative int x. Print floor(sqrt(x)). Symptom: Integer overflow mid*mid when x is large & returns hi wrongly.',
    `${H}int main() {\n    long long x; cin >> x;\n    int lo = 0, hi = x;\n    while (lo <= hi) {\n        int mid = (lo + hi) / 2;\n        if (mid * mid <= x) lo = mid + 1; else hi = mid - 1;\n    }\n    cout << lo << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    long long x; cin >> x;\n    long long lo = 0, hi = x, ans = 0;\n    while (lo <= hi) {\n        long long mid = lo + (hi - lo) / 2;\n        if (mid <= x / max(1LL, mid) && mid * mid <= x) { ans = mid; lo = mid + 1; } else hi = mid - 1;\n    }\n    cout << ans << "\\n";\n    return 0;\n}`,
    [{ input: '8', expectedOutput: '2', description: 'floor(sqrt(8))=2' }, { input: '2147395599', expectedOutput: '46339', description: 'Large int overflow test' }]),

  cppBug('bh-cpp-e10-05', 'easy', 600, 'Fix Remove Sorted Duplicate InPlace',
    'Goal: Input n then sorted ascending ints. Print unique elements count AND elements? Just count of unique elements. Symptom: Compares arr[i] with i instead of arr[w-1].',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int w = 0;\n    for (int i = 0; i < n; ++i) if (a[i] != i) a[w++] = a[i];\n    cout << w << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int w = 0;\n    for (int i = 0; i < n; ++i) if (w == 0 || a[i] != a[w - 1]) a[w++] = a[i];\n    cout << w << "\\n";\n    return 0;\n}`,
    [{ input: '5\n1 1 2 3 3', expectedOutput: '3', description: '1,2,3' }, { input: '3\n0 0 0', expectedOutput: '1', description: 'All zeros' }]),

  cppBug('bh-cpp-e10-06', 'easy', 600, 'Fix Power Of Two Bit Check',
    'Goal: Input integer n. Print YES if n is strictly a power of 2 else NO. Symptom: Accepts n <= 0 (0 passes bit trick!) and operator precedence bug.',
    `${H}int main() {\n    long long n; cin >> n;\n    cout << ((n & (n - 1) == 0) ? "YES" : "NO") << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    long long n; cin >> n;\n    cout << ((n > 0 && (n & (n - 1)) == 0) ? "YES" : "NO") << "\\n";\n    return 0;\n}`,
    [{ input: '16', expectedOutput: 'YES', description: '2^4' }, { input: '0', expectedOutput: 'NO', description: '0 is not power of 2' }]),

  cppBug('bh-cpp-e10-07', 'easy', 600, 'Fix Balanced Bracket Pair Checker',
    'Goal: Validate ()[]{} string -> YES or NO. Symptom: Never verifies stack top matches & returns YES with unclosed brackets.',
    `${H}int main() {\n    string s; cin >> s; stack<char> st;\n    for (char c : s) {\n        if (c==\'(\'||c==\'[\'||c==\'{\') st.push(c);\n        else {\n            if (st.empty()) { cout << "NO\\n"; return 0; }\n            st.pop();\n        }\n    }\n    cout << "YES\\n";\n    return 0;\n}`,
    `${H}int main() {\n    string s; cin >> s; stack<char> st;\n    for (char c : s) {\n        if (c==\'(\'||c==\'[\'||c==\'{\') st.push(c);\n        else {\n            if (st.empty()) { cout << "NO\\n"; return 0; }\n            char t = st.top(); st.pop();\n            if ((c==\')\'&&t!=\'(\')||(c==\']\'&&t!=\'[\')||(c==\'}\'&&t!=\'{\')) { cout << "NO\\n"; return 0; }\n        }\n    }\n    cout << (st.empty() ? "YES" : "NO") << "\\n";\n    return 0;\n}`,
    [{ input: '(]', expectedOutput: 'NO', description: 'Type mismatch' }, { input: '({[]})', expectedOutput: 'YES', description: 'Valid balanced' }]),

  cppBug('bh-cpp-e10-08', 'easy', 600, 'Fix Majority Vote Cancel Counter',
    'Goal: Input n then n ints (majority > n/2 exists). Print majority element. Symptom: Resets cand when cnt < 0 instead of 0 and increments wrong.',
    `${H}int main() {\n    int n; cin >> n; int cand = 0, cnt = 1;\n    for (int i = 0; i < n; ++i) {\n        int x; cin >> x;\n        if (cnt < 0) cand = x;\n        cnt += (x == cand ? 1 : -1);\n    }\n    cout << cand << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; int cand = 0, cnt = 0;\n    for (int i = 0; i < n; ++i) {\n        int x; cin >> x;\n        if (cnt == 0) { cand = x; cnt = 1; }\n        else cnt += (x == cand ? 1 : -1);\n    }\n    cout << cand << "\\n";\n    return 0;\n}`,
    [{ input: '3\n5 5 2', expectedOutput: '5', description: 'Majority 5 overcomes initial bias' }, { input: '5\n2 2 1 1 1', expectedOutput: '1', description: '1 overtakes 2' }]),

  cppBug('bh-cpp-e10-09', 'easy', 600, 'Fix Fibonacci Modulo Overflow Bug',
    'Goal: Print F(n) % 1000000007 (F(0)=0, F(1)=1). Symptom: Doesn\'t take mod inside loop and skips n=0.',
    `${H}int main() {\n    int n; cin >> n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; ++i) { int c = a + b; a = b; b = c; }\n    cout << b % 1000000007 << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; const long long MOD = 1000000007;\n    if (n <= 1) { cout << n << "\\n"; return 0; }\n    long long a = 0, b = 1;\n    for (int i = 2; i <= n; ++i) { long long c = (a + b) % MOD; a = b; b = c; }\n    cout << b << "\\n";\n    return 0;\n}`,
    [{ input: '0', expectedOutput: '0', description: 'Base F(0)=0' }, { input: '50', expectedOutput: '586268941', description: 'Overflow safe modulo' }]),

  cppBug('bh-cpp-e10-10', 'easy', 600, 'Fix Plus One Carry Overflow',
    'Goal: Input n digits space-separated forming positive big-integer. Add 1 and print space-joined digits. Symptom: Fails all-9 carry propagation.',
    `${H}int main() {\n    int n; cin >> n; vector<int> d(n); for (int& x : d) cin >> x;\n    d[n - 1] += 1;\n    for (int i = 0; i < n; ++i) { if (i) cout << " "; cout << d[i]; }\n    cout << "\\n";\n    return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> d(n); for (int& x : d) cin >> x;\n    for (int i = n - 1; i >= 0; --i) { if (d[i] < 9) { d[i]++; break; } d[i] = 0; if (i == 0) d.insert(d.begin(), 1); }\n    for (size_t i = 0; i < d.size(); ++i) { if (i) cout << " "; cout << d[i]; }\n    cout << "\\n";\n    return 0;\n}`,
    [{ input: '3\n9 9 9', expectedOutput: '1 0 0 0', description: 'Carry expands digit count' }, { input: '3\n1 2 9', expectedOutput: '1 3 0', description: 'Single carry' }]),
];
// Clean up bh-cpp-e10-03 test 1 vs test 2 with a cleaner failing case on buggy order!
// Notice buggy checks f >= 3 BEFORE t > 0 && f > 0: on "5 5 5 10 20 10 20":
//   After 5,5,5,10 -> f=2,t=1. First 20 spends 10+5 -> f=1,t=0. Wait if f=3: input "5 5 5 5 10 20 20":
//   Buggy spends three 5s on first 20 -> f=0,t=1 -> second 20 FAILS! Correct spends 10+5 on first 20 -> f=2,t=0 -> Wait still needs 3x5!
//   Let's make Test 1 pass under fixed & FAIL under buggy: "5 5 5 10 20 20"? No! Look:
//   Input: 5, 5, 5, 5, 10, 20, 10, 20? Still 1x5 left! Wait: 5, 5, 5, 5, 10, 20, 10 -> works either way; add 20 -> wait:
//   After 5,5,5,10,10 -> f=1,t=2. No! To differentiate (t>0&&f>0) vs (f>=3):
//   We need f>=3 AND t>=1 at first 20, followed by MORE 10s? No, 10 needs a 5!
//   YES: Suppose before first 20 we have f=3, t=1 (e.g. 5, 5, 5, 5, 10 -> f=3, t=1).
//   Now customer gives 20:
//     FIXED uses t=1,f=1 -> leaves f=2, t=0. Next customer gives 10 -> f=1,t=1! Succeeds! If NEXT gives 10 -> f=0,t=2! Succeeds!
//     BUGGY uses f=3 on 20 -> leaves f=0, t=1. Next customer gives 10 -> FAILS (f==0)!
//   BINGO!! Input: `7\n5 5 5 5 10 20 10` -> Fixed: YES, Buggy: NO!
CPP_BUG_EASY[22].question.testCases = [
  { input: '7\n5 5 5 5 10 20 10', expectedOutput: 'YES', description: 'Must keep $5s when giving change for 20' },
  { input: '3\n5 10 20', expectedOutput: 'NO', description: 'Short change for 20' },
];
CPP_BUG_EASY[22].question.sampleInput = CPP_BUG_EASY[22].question.testCases[0].input;
CPP_BUG_EASY[22].question.sampleOutput = 'YES';

// ---------- MEDIUM (3-4 trickier bugs, 3m/5m/10m x 10 = 30) ----------
const CPP_BUG_MED = [
  // Medium 3m (10)
  cppBug('bh-cpp-m3-01', 'medium', 180, 'Fix Two-Sum Unordered Duplicate Bug',
    'Goal: Target T, n, then n ints. Print 0-based indices i < j summing to T (guaranteed 1 pair). Symptom: Checks unordered_map before loop creating self-match on T/2.',
    `${H}int main() {\n    long long t; int n; cin >> t >> n; vector<long long> a(n); unordered_map<long long,int> mp;\n    for (int i=0;i<n;++i) { cin >> a[i]; mp[a[i]] = i; }\n    for (int i=0;i<n;++i) if (mp.count(t - a[i])) { cout << i << " " << mp[t - a[i]] << "\\n"; return 0; }\n    return 0;\n}`,
    `${H}int main() {\n    long long t; int n; cin >> t >> n; unordered_map<long long,int> mp;\n    for (int i=0;i<n;++i) { long long x; cin >> x; if (mp.count(t - x)) { cout << mp[t - x] << " " << i << "\\n"; return 0; } mp[x] = i; }\n    return 0;\n}`,
    [{ input: '6 3\n3 2 4', expectedOutput: '1 2', description: 'Must not print 0 0' }, { input: '9 4\n2 7 11 15', expectedOutput: '0 1', description: '0 and 1' }]),

  cppBug('bh-cpp-m3-02', 'medium', 180, 'Fix Three-Sum Zero Skip Duplicates',
    'Goal: Input n then n ints. Count UNIQUE triplets summing to 0. Symptom: Only skips i duplicates, counting duplicate l/r triplets.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    sort(a.begin(), a.end()); int ans = 0;\n    for (int i=0;i<n;++i) {\n        if (i && a[i]==a[i-1]) continue;\n        int l=i, r=n-1;\n        while (l < r) {\n            int s = a[i]+a[l]+a[r];\n            if (s == 0) { ++ans; ++l; --r; }\n            else if (s < 0) ++l; else --r;\n        }\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    sort(a.begin(), a.end()); int ans = 0;\n    for (int i=0;i<n;++i) {\n        if (i && a[i]==a[i-1]) continue;\n        int l=i+1, r=n-1;\n        while (l < r) {\n            long long s = a[i]+a[l]+a[r];\n            if (s == 0) { ++ans; while (l<r && a[l]==a[l+1]) ++l; while (l<r && a[r]==a[r-1]) --r; ++l; --r; }\n            else if (s < 0) ++l; else --r;\n        }\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '5\n-2 0 0 2 2', expectedOutput: '1', description: 'Unique [-2,0,2] only once' }, { input: '6\n-1 0 1 2 -1 -4', expectedOutput: '2', description: 'Two unique triplets' }]),

  cppBug('bh-cpp-m3-03', 'medium', 180, 'Fix Rotated Minimum Boundary Pivot',
    'Goal: Input n then distinct rotated sorted array. Print min element. Symptom: Compares against arr[lo] instead of arr[hi] & breaks non-rotated array.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int lo = 0, hi = n - 1;\n    while (lo < hi) {\n        int mid = (lo + hi) / 2;\n        if (a[mid] < a[lo]) lo = mid + 1; else hi = mid;\n    }\n    cout << a[lo] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int lo = 0, hi = n - 1;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] > a[hi]) lo = mid + 1; else hi = mid;\n    }\n    cout << a[lo] << "\\n"; return 0;\n}`,
    [{ input: '5\n3 4 5 1 2', expectedOutput: '1', description: 'Rotated min 1' }, { input: '4\n2 4 6 8', expectedOutput: '2', description: 'Unrotated min 2' }]),

  cppBug('bh-cpp-m3-04', 'medium', 180, 'Fix Next Permutation Lex Swap',
    'Goal: Input n then n ints. Compute lexicographically next permutation (wrap to sorted asc if max) and print space-joined. Symptom: Scans wrong direction & skips reverse tail.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int i = n - 2;\n    while (i >= 0 && a[i] < a[i + 1]) --i;\n    if (i >= 0) {\n        int j = n - 1; while (a[j] < a[i]) --j;\n        swap(a[i], a[j]);\n    }\n    for (int k=0;k<n;++k) { if (k) cout << " "; cout << a[k]; } cout << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int i = n - 2;\n    while (i >= 0 && a[i] >= a[i + 1]) --i;\n    if (i >= 0) {\n        int j = n - 1; while (a[j] <= a[i]) --j;\n        swap(a[i], a[j]);\n    }\n    reverse(a.begin() + i + 1, a.end());\n    for (int k=0;k<n;++k) { if (k) cout << " "; cout << a[k]; } cout << "\\n"; return 0;\n}`,
    [{ input: '3\n1 3 2', expectedOutput: '2 1 3', description: 'Next perm 2 1 3' }, { input: '3\n3 2 1', expectedOutput: '1 2 3', description: 'Wrap to smallest' }]),

  cppBug('bh-cpp-m3-05', 'medium', 180, 'Fix Merge Overlap Sort Tie Bug',
    'Goal: Input n then n intervals "s e". Print merged count. Symptom: Never sorts intervals first & loses larger end time on subset interval.',
    `${H}int main() {\n    int n; cin >> n; vector<pair<int,int>> v(n); for (auto& p : v) cin >> p.first >> p.second;\n    vector<pair<int,int>> out;\n    for (auto& p : v) {\n        if (out.empty() || p.first > out.back().second) out.push_back(p);\n        else out.back().second = p.second;\n    }\n    cout << out.size() << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<pair<int,int>> v(n); for (auto& p : v) cin >> p.first >> p.second;\n    sort(v.begin(), v.end());\n    vector<pair<int,int>> out;\n    for (auto& p : v) {\n        if (out.empty() || p.first > out.back().second) out.push_back(p);\n        else out.back().second = max(out.back().second, p.second);\n    }\n    cout << out.size() << "\\n"; return 0;\n}`,
    [{ input: '4\n5 6\n1 10\n2 3\n7 8', expectedOutput: '1', description: 'Unsorted enclosing [1,10] + [7,8]' }, { input: '2\n1 3\n4 6', expectedOutput: '2', description: 'Disjoint stays 2' }]),

  cppBug('bh-cpp-m3-06', 'medium', 180, 'Fix Ship Capacity Bounds Search',
    'Goal: D days, n packages, then n weights. Find min capacity shipping all in <= D days. Symptom: lo starts at 0 failing heavy single item & initializes days=0.',
    `${H}int main() {\n    int D, n; cin >> D >> n; vector<long long> w(n); long long hi = 0;\n    for (auto& x : w) { cin >> x; hi += x; }\n    long long lo = 0;\n    while (lo < hi) {\n        long long mid = (lo + hi) / 2, cur = 0; int days = 0;\n        for (auto x : w) { if (cur + x > mid) { ++days; cur = 0; } cur += x; }\n        if (days <= D) hi = mid; else lo = mid + 1;\n    }\n    cout << lo << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int D, n; cin >> D >> n; vector<long long> w(n); long long lo = 0, hi = 0;\n    for (auto& x : w) { cin >> x; lo = max(lo, x); hi += x; }\n    while (lo < hi) {\n        long long mid = lo + (hi - lo) / 2, cur = 0; int days = 1;\n        for (auto x : w) { if (cur + x > mid) { ++days; cur = 0; } cur += x; }\n        if (days <= D) hi = mid; else lo = mid + 1;\n    }\n    cout << lo << "\\n"; return 0;\n}`,
    [{ input: '2 4\n3 2 2 4', expectedOutput: '6', description: 'Min daily capacity for 2 days is 6' }, { input: '5 10\n1 2 3 4 5 6 7 8 9 10', expectedOutput: '15', description: '15 daily cap' }]),

  cppBug('bh-cpp-m3-07', 'medium', 180, 'Fix Asteroids Negative Crash Stack',
    'Goal: Input n then non-zero sizes (+ right, - left). Print survivors count. Symptom: Collides same-direction asteroids & drops survived negative.',
    `${H}int main() {\n    int n; cin >> n; vector<int> st;\n    for (int i=0;i<n;++i) {\n        int a; cin >> a; bool alive = true;\n        while (alive && !st.empty() && st.back() > 0) {\n            if (abs(st.back()) < abs(a)) st.pop_back();\n            else if (abs(st.back()) == abs(a)) { st.pop_back(); alive = false; }\n            else alive = false;\n        }\n        if (!alive) st.push_back(a);\n    }\n    cout << st.size() << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> st;\n    for (int i=0;i<n;++i) {\n        int a; cin >> a; bool alive = true;\n        while (alive && a < 0 && !st.empty() && st.back() > 0) {\n            if (st.back() < -a) st.pop_back();\n            else if (st.back() == -a) { st.pop_back(); alive = false; }\n            else alive = false;\n        }\n        if (alive) st.push_back(a);\n    }\n    cout << st.size() << "\\n"; return 0;\n}`,
    [{ input: '3\n5 10 -5', expectedOutput: '2', description: '5 and 10 survive' }, { input: '3\n-2 -1 1', expectedOutput: '3', description: 'Moving away zero crash' }]),

  cppBug('bh-cpp-m3-08', 'medium', 180, 'Fix Daily Temperatures Monotonic Bug',
    'Goal: Input n then n temps. Print sum of wait days for warmer temp per day. Symptom: Pushes value onto stack instead of index.',
    `${H}int main() {\n    int n; cin >> n; vector<int> t(n); for (int& x : t) cin >> x;\n    stack<int> st; long long ans = 0;\n    for (int i=0;i<n;++i) {\n        while (!st.empty() && t[i] >= st.top()) { ans += i - st.top(); st.pop(); }\n        st.push(t[i]);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> t(n); for (int& x : t) cin >> x;\n    stack<int> st; long long ans = 0;\n    for (int i=0;i<n;++i) {\n        while (!st.empty() && t[i] > t[st.top()]) { ans += i - st.top(); st.pop(); }\n        st.push(i);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '8\n73 74 75 71 69 72 76 73', expectedOutput: '10', description: '1+1+4+2+1+1 = 10' }, { input: '3\n50 50 60', expectedOutput: '3', description: 'Strict warmer wait 2+1=3' }]),

  cppBug('bh-cpp-m3-09', 'medium', 180, 'Fix Balanced Subarray Equal 0-1',
    'Goal: Input n then binary 0/1 array. Print max length subarray with equal 0s & 1s. Symptom: Overwrites first[pref] unconditionally & misses initial -1.',
    `${H}int main() {\n    int n; cin >> n; unordered_map<int,int> first;\n    int pref = 0, best = 0;\n    for (int i=0;i<n;++i) {\n        int x; cin >> x; pref += (x == 1 ? 1 : -1);\n        if (first.count(pref)) best = max(best, i - first[pref]);\n        first[pref] = i;\n    }\n    cout << best << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; unordered_map<int,int> first; first[0] = -1;\n    int pref = 0, best = 0;\n    for (int i=0;i<n;++i) {\n        int x; cin >> x; pref += (x == 1 ? 1 : -1);\n        if (first.count(pref)) best = max(best, i - first[pref]);\n        else first[pref] = i;\n    }\n    cout << best << "\\n"; return 0;\n}`,
    [{ input: '6\n0 1 0 1 1 0', expectedOutput: '6', description: 'Whole 6 balanced' }, { input: '4\n0 0 1 0', expectedOutput: '2', description: 'Pair balanced' }]),

  cppBug('bh-cpp-m3-10', 'medium', 180, 'Fix K-Closest Points Square & Sort',
    'Goal: k, n, then n points "x y". Print smallest k-th squared distance from origin (1-based). Symptom: Integer overflow & picks wrong index order.',
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<int> d;\n    for (int i=0;i<n;++i) { int x, y; cin >> x >> y; d.push_back(abs(x) + abs(y)); }\n    sort(d.rbegin(), d.rend());\n    cout << d[k] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<long long> d;\n    for (int i=0;i<n;++i) { long long x, y; cin >> x >> y; d.push_back(x * x + y * y); }\n    sort(d.begin(), d.end());\n    cout << d[k - 1] << "\\n"; return 0;\n}`,
    [{ input: '2 3\n3 3\n5 -1\n-2 4', expectedOutput: '20', description: '18, 20, 26 -> 2nd is 20' }, { input: '1 2\n1 3\n-2 2', expectedOutput: '8', description: 'Smallest is 8' }]),

  // Medium 5m (10)
  cppBug('bh-cpp-m5-01', 'medium', 300, 'Fix Disjoint Set Union Compression Bug',
    'Goal: n nodes, e edges. Print connected components count. Symptom: Decrements comps even when u & v already united & wrong union link.',
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<int> p(n); for (int i=0;i<n;++i) p[i]=i;\n    auto fp = [&](int x){ while (p[x]!=x) x=p[x]; return x; };\n    int comps = n;\n    for (int i=0;i<e;++i) {\n        int u, v; cin >> u >> v;\n        p[u] = v;\n        --comps;\n    }\n    cout << comps << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<int> p(n); for (int i=0;i<n;++i) p[i]=i;\n    auto fp = [&](int x){ while (p[x]!=x) x=p[x]=p[p[x]]; return x; };\n    int comps = n;\n    for (int i=0;i<e;++i) {\n        int u, v; cin >> u >> v;\n        int pu = fp(u), pv = fp(v);\n        if (pu != pv) { p[pu] = pv; --comps; }\n    }\n    cout << comps << "\\n"; return 0;\n}`,
    [{ input: '4 3\n0 1\n1 2\n0 2', expectedOutput: '2', description: 'Redundant cycle edge 0-2' }, { input: '5 2\n0 1\n2 3', expectedOutput: '3', description: '3 components' }]),

  cppBug('bh-cpp-m5-02', 'medium', 300, 'Fix Subarrays Bounded Max Counter',
    'Goal: L, R, n then n ints. Count subarrays with max value inside [L, R]. Symptom: Fails resetting start when arr[i] > R and miscalculates window.',
    `${H}int main() {\n    int L, R, n; cin >> L >> R >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int l = 0, lastValid = -1; long long ans = 0;\n    for (int r=0;r<n;++r) {\n        if (a[r] > R) l = r;\n        if (a[r] >= L) lastValid = r;\n        ans += (lastValid - l);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int L, R, n; cin >> L >> R >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int l = 0, lastValid = -1; long long ans = 0;\n    for (int r=0;r<n;++r) {\n        if (a[r] > R) { l = r + 1; lastValid = -1; }\n        else if (a[r] >= L) lastValid = r;\n        if (lastValid >= l) ans += (lastValid - l + 1);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '2 3 4\n2 1 4 3', expectedOutput: '3', description: '[2],[2,1],[3]' }, { input: '2 8 3\n2 9 2', expectedOutput: '2', description: '[2] and [2]' }]),

  cppBug('bh-cpp-m5-03', 'medium', 300, 'Fix Rotting Oranges Queue Level',
    'Goal: r c then grid (0 empty, 1 fresh, 2 rotten). Min mins to rot all or -1. Symptom: Increments mins even when fresh == 0 initially & breaks level tracking.',
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> g(r, vector<int>(c)); queue<pair<int,int>> q; int fresh=0;\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) { cin>>g[i][j]; if(g[i][j]==2) q.push({i,j}); else if(g[i][j]==1) fresh++; }\n    int mins = 0; int dx[4]={1,-1,0,0}, dy[4]={0,0,1,-1};\n    while (!q.empty()) {\n        auto [x, y] = q.front(); q.pop(); ++mins;\n        for (int d=0;d<4;++d) { int nx=x+dx[d], ny=y+dy[d]; if (nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==1) { g[nx][ny]=2; fresh--; q.push({nx,ny}); } }\n    }\n    cout << (fresh == 0 ? mins : -1) << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> g(r, vector<int>(c)); queue<pair<int,int>> q; int fresh=0;\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) { cin>>g[i][j]; if(g[i][j]==2) q.push({i,j}); else if(g[i][j]==1) fresh++; }\n    int mins = 0; int dx[4]={1,-1,0,0}, dy[4]={0,0,1,-1};\n    while (!q.empty() && fresh > 0) {\n        int sz = q.size(); ++mins;\n        while (sz--) {\n            auto [x, y] = q.front(); q.pop();\n            for (int d=0;d<4;++d) { int nx=x+dx[d], ny=y+dy[d]; if (nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==1) { g[nx][ny]=2; fresh--; q.push({nx,ny}); } }\n        }\n    }\n    cout << (fresh == 0 ? mins : -1) << "\\n"; return 0;\n}`,
    [{ input: '3 3\n2 1 1\n1 1 0\n0 1 1', expectedOutput: '4', description: '4 minutes total' }, { input: '1 2\n0 2', expectedOutput: '0', description: 'Zero fresh already 0' }]),

  cppBug('bh-cpp-m5-04', 'medium', 300, 'Fix Bipartite Queue Coloring Check',
    'Goal: n nodes, e edges. Print YES if bipartite else NO. Symptom: Only starts BFS at node 0 ignoring disconnected components & flips color wrong.',
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n);\n    for (int i=0;i<e;++i) { int u, v; cin >> u >> v; adj[u].push_back(v); adj[v].push_back(u); }\n    vector<int> col(n, -1); queue<int> q; q.push(0); col[0]=0;\n    while (!q.empty()) {\n        int u=q.front(); q.pop();\n        for (int v : adj[u]) {\n            if (col[v] == -1) { col[v] = col[u]; q.push(v); }\n            else if (col[v] == col[u]) { cout << "NO\\n"; return 0; }\n        }\n    }\n    cout << "YES\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n);\n    for (int i=0;i<e;++i) { int u, v; cin >> u >> v; adj[u].push_back(v); adj[v].push_back(u); }\n    vector<int> col(n, -1);\n    for (int s=0;s<n;++s) if (col[s]==-1) {\n        queue<int> q; q.push(s); col[s]=0;\n        while (!q.empty()) {\n            int u=q.front(); q.pop();\n            for (int v : adj[u]) {\n                if (col[v] == -1) { col[v] = col[u] ^ 1; q.push(v); }\n                else if (col[v] == col[u]) { cout << "NO\\n"; return 0; }\n            }\n        }\n    }\n    cout << "YES\\n"; return 0;\n}`,
    [{ input: '5 3\n2 3\n3 4\n4 2', expectedOutput: 'NO', description: 'Odd cycle on nodes 2,3,4' }, { input: '4 2\n0 1\n2 3', expectedOutput: 'YES', description: 'Two bipartite edges' }]),

  cppBug('bh-cpp-m5-05', 'medium', 300, 'Fix Car Fleet Arrival Speed Bug',
    'Goal: target T, n, then n pairs "pos speed". Print arriving fleet count. Symptom: Sorts ascending instead of descending from target & integer-divides time.',
    `${H}int main() {\n    int T, n; cin >> T >> n; vector<pair<int,int>> c(n); for (auto& p : c) cin >> p.first >> p.second;\n    sort(c.begin(), c.end()); int fleets = 0, mx = 0;\n    for (auto& p : c) {\n        int tm = (T - p.first) / p.second;\n        if (tm > mx) { ++fleets; mx = tm; }\n    }\n    cout << fleets << "\\n"; return 0;\n}`,
    `${H}int main() {\n    double T; int n; cin >> T >> n; vector<pair<double,double>> c(n); for (auto& p : c) cin >> p.first >> p.second;\n    sort(c.begin(), c.end(), [](auto& a, auto& b){ return a.first > b.first; });\n    int fleets = 0; double mx = -1;\n    for (auto& p : c) {\n        double tm = (T - p.first) / p.second;\n        if (tm > mx) { ++fleets; mx = tm; }\n    }\n    cout << fleets << "\\n"; return 0;\n}`,
    [{ input: '12 5\n10 2\n8 4\n0 1\n5 1\n3 3', expectedOutput: '3', description: '3 fleets arrive' }, { input: '10 2\n6 8\n3 2', expectedOutput: '2', description: 'Float time 0.5 vs 3.5' }]),

  cppBug('bh-cpp-m5-06', 'medium', 300, 'Fix RPN Stack Operator Pop Order',
    'Goal: n RPN tokens (+,-,*,/). Print evaluated integer. Symptom: Pops a before b flipping subtraction & division operand order.',
    `${H}int main() {\n    int n; cin >> n; stack<long long> st;\n    while (n--) {\n        string s; cin >> s;\n        if (s=="+"||s=="-"||s=="*"||s=="/") {\n            long long a = st.top(); st.pop(); long long b = st.top(); st.pop();\n            if (s=="+") st.push(a+b); else if (s=="-") st.push(a-b); else if (s=="*") st.push(a*b); else st.push(a/b);\n        } else st.push(stoi(s));\n    }\n    cout << st.top() << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; stack<long long> st;\n    while (n--) {\n        string s; cin >> s;\n        if (s=="+"||s=="-"||s=="*"||s=="/") {\n            long long b = st.top(); st.pop(); long long a = st.top(); st.pop();\n            if (s=="+") st.push(a+b); else if (s=="-") st.push(a-b); else if (s=="*") st.push(a*b); else st.push(a/b);\n        } else st.push(stoll(s));\n    }\n    cout << st.top() << "\\n"; return 0;\n}`,
    [{ input: '5\n4 13 5 / +', expectedOutput: '6', description: '13 / 5 = 2 + 4 = 6' }, { input: '3\n10 3 -', expectedOutput: '7', description: '10 - 3 = 7' }]),

  cppBug('bh-cpp-m5-07', 'medium', 300, 'Fix Huffman Rope Max Heap Inversion',
    'Goal: n rope lengths. Print min merge cost. Symptom: Default max-heap pops largest ropes first!',
    `${H}int main() {\n    int n; cin >> n; priority_queue<long long> pq;\n    for (int i=0;i<n;++i) { long long x; cin >> x; pq.push(x); }\n    long long cost = 0;\n    while (pq.size() > 1) {\n        long long a = pq.top(); pq.pop(); long long b = pq.top(); pq.pop();\n        cost = a + b; pq.push(cost);\n    }\n    cout << cost << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; priority_queue<long long, vector<long long>, greater<long long>> pq;\n    for (int i=0;i<n;++i) { long long x; cin >> x; pq.push(x); }\n    long long cost = 0;\n    while (pq.size() > 1) {\n        long long a = pq.top(); pq.pop(); long long b = pq.top(); pq.pop();\n        cost += a + b; pq.push(a + b);\n    }\n    cout << cost << "\\n"; return 0;\n}`,
    [{ input: '4\n4 3 2 6', expectedOutput: '29', description: '5+9+15=29' }, { input: '3\n1 2 3', expectedOutput: '9', description: '3+6=9' }]),

  cppBug('bh-cpp-m5-08', 'medium', 300, 'Fix Minimum Erase Overlap Sort End',
    'Goal: n intervals [s, e]. Print min intervals removed to avoid overlap (touching OK). Symptom: Sorts by start & wrong > check drops non-overlapping.',
    `${H}int main() {\n    int n; cin >> n; vector<pair<int,int>> iv(n); for (auto& p : iv) cin >> p.first >> p.second;\n    sort(iv.begin(), iv.end());\n    int keep = 0, lastEnd = -1e9;\n    for (auto& p : iv) if (p.first > lastEnd) { ++keep; lastEnd = p.second; }\n    cout << (n - keep) << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<pair<int,int>> iv(n); for (auto& p : iv) cin >> p.first >> p.second;\n    sort(iv.begin(), iv.end(), [](auto& a, auto& b){ return a.second < b.second; });\n    int keep = 0, lastEnd = INT_MIN;\n    for (auto& p : iv) if (p.first >= lastEnd) { ++keep; lastEnd = p.second; }\n    cout << (n - keep) << "\\n"; return 0;\n}`,
    [{ input: '4\n1 100\n11 22\n1 11\n2 12', expectedOutput: '2', description: 'Long [1,100] starts early -> must sort by end!' }, { input: '2\n1 2\n2 3', expectedOutput: '0', description: 'Touching kept' }]),

  cppBug('bh-cpp-m5-09', 'medium', 300, 'Fix Coin Unbounded Ways Direction',
    'Goal: T, n then distinct coins. Count unordered combinations summing to T. Symptom: Loops backwards like 0/1 knapsack forbidding reuse & skips amount=coin.',
    `${H}int main() {\n    int T, n; cin >> T >> n; vector<int> c(n); for (int& x : c) cin >> x;\n    vector<long long> dp(T + 1, 0); dp[0] = 1;\n    for (int x : c) for (int s = T; s > x; --s) dp[s] += dp[s - x];\n    cout << dp[T] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int T, n; cin >> T >> n; vector<int> c(n); for (int& x : c) cin >> x;\n    vector<long long> dp(T + 1, 0); dp[0] = 1;\n    for (int x : c) for (int s = x; s <= T; ++s) dp[s] += dp[s - x];\n    cout << dp[T] << "\\n"; return 0;\n}`,
    [{ input: '5 3\n1 2 5', expectedOutput: '4', description: '4 combos' }, { input: '4 2\n1 2', expectedOutput: '3', description: '1111, 112, 22' }]),

  cppBug('bh-cpp-m5-10', 'medium', 300, 'Fix Task Scheduler Slot Overflow',
    'Goal: Cooldown k, n tasks, then uppercase letters. Print min intervals. Symptom: Returns formula even when idle gaps fill completely with extra distinct tasks.',
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<int> f(26, 0);\n    for (int i=0;i<n;++i) { char c; cin >> c; f[c-\'a\']++; }\n    int mx = *max_element(f.begin(), f.end()); int mc = count(f.begin(), f.end(), mx);\n    cout << ((mx - 1) * k + mc) << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<int> f(26, 0);\n    for (int i=0;i<n;++i) { char c; cin >> c; f[c-\'A\']++; }\n    int mx = *max_element(f.begin(), f.end()); int mc = count(f.begin(), f.end(), mx);\n    cout << max(n, (mx - 1) * (k + 1) + mc) << "\\n"; return 0;\n}`,
    [{ input: '2 6\nA A A B B B', expectedOutput: '8', description: 'Idle slots 8' }, { input: '1 6\nA A B B C D', expectedOutput: '6', description: 'Extra tasks fill idle' }]),

  // Medium 10m (10)
  cppBug('bh-cpp-m10-01', 'medium', 600, 'Fix Tarjan Bridge Disc Low Swap',
    'Goal: n nodes, e undirected edges. Count bridges. Symptom: Updates low with low[v] on back-edge instead of disc[v] & flips > condition.',
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);adj[v].push_back(u);}\n    vector<int> disc(n, -1), low(n, -1); int t=0, br=0;\n    auto dfs = [&](auto&& self, int u, int p) -> void {\n        disc[u] = low[u] = t++;\n        for (int v : adj[u]) {\n            if (v == p) continue;\n            if (disc[v] != -1) low[u] = min(low[u], low[v]);\n            else { self(self, v, u); low[u] = min(low[u], low[v]); if (low[v] >= disc[u]) ++br; }\n        }\n    };\n    dfs(dfs, 0, -1);\n    cout << br << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);adj[v].push_back(u);}\n    vector<int> disc(n, -1), low(n, -1); int t=0, br=0;\n    auto dfs = [&](auto&& self, int u, int p) -> void {\n        disc[u] = low[u] = t++;\n        for (int v : adj[u]) {\n            if (v == p) continue;\n            if (disc[v] != -1) low[u] = min(low[u], disc[v]);\n            else { self(self, v, u); low[u] = min(low[u], low[v]); if (low[v] > disc[u]) ++br; }\n        }\n    };\n    for (int i=0;i<n;++i) if (disc[i]==-1) dfs(dfs, i, -1);\n    cout << br << "\\n"; return 0;\n}`,
    [{ input: '4 4\n0 1\n1 2\n2 0\n1 3', expectedOutput: '1', description: 'Only 1-3 is bridge' }, { input: '3 3\n0 1\n1 2\n2 0', expectedOutput: '0', description: 'Cycle has 0 bridges' }]),

  cppBug('bh-cpp-m10-02', 'medium', 600, 'Fix Floyd Warshall Loop Order',
    'Goal: n nodes, e weighted directed edges. Print shortest distance from 0 to n-1 via Floyd-Warshall or -1. Symptom: Places k in inner loop missing multi-hop relaxation!',
    `${H}int main() {\n    int n, e; cin >> n >> e; const long long INF = 1e15;\n    vector<vector<long long>> d(n, vector<long long>(n, INF));\n    for (int i=0;i<e;++i) { int u, v; long long w; cin >> u >> v >> w; d[u][v] = w; }\n    for (int i=0;i<n;++i) for (int j=0;j<n;++j) for (int k=0;k<n;++k)\n        d[i][j] = min(d[i][j], d[i][k] + d[k][j]);\n    cout << (d[0][n-1] >= INF ? -1 : d[0][n-1]) << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; const long long INF = 1e15;\n    vector<vector<long long>> d(n, vector<long long>(n, INF));\n    for (int i=0;i<n;++i) d[i][i] = 0;\n    for (int i=0;i<e;++i) { int u, v; long long w; cin >> u >> v >> w; d[u][v] = min(d[u][v], w); }\n    for (int k=0;k<n;++k) for (int i=0;i<n;++i) for (int j=0;j<n;++j)\n        if (d[i][k] < INF && d[k][j] < INF) d[i][j] = min(d[i][j], d[i][k] + d[k][j]);\n    cout << (d[0][n-1] >= INF ? -1 : d[0][n-1]) << "\\n"; return 0;\n}`,
    [{ input: '5 5\n0 4 100\n0 3 1\n3 2 1\n2 1 1\n1 4 1', expectedOutput: '4', description: '0->3->2->1->4 requires k outer loop' }, { input: '2 0', expectedOutput: '-1', description: 'Unreachable' }]),

  cppBug('bh-cpp-m10-03', 'medium', 600, 'Fix Interval Job Profit Upper Bound',
    'Goal: n jobs "s e p". Print max non-overlapping profit. Symptom: upper_bound misses equal start==end & omits max(prev, take).',
    `${H}int main() {\n    int n; cin >> n; struct J { int s, e; long long p; }; vector<J> jb(n);\n    for (auto& j : jb) cin >> j.s >> j.e >> j.p;\n    sort(jb.begin(), jb.end(), [](auto& a, auto& b){ return a.s < b.s; });\n    vector<long long> dp(n); vector<int> ends(n); for (int i=0;i<n;++i) ends[i]=jb[i].e;\n    for (int i=0;i<n;++i) {\n        int idx = lower_bound(ends.begin(), ends.begin() + i, jb[i].s) - ends.begin() - 1;\n        dp[i] = jb[i].p + (idx >= 0 ? dp[idx] : 0);\n    }\n    cout << dp[n-1] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; struct J { int s, e; long long p; }; vector<J> jb(n);\n    for (auto& j : jb) cin >> j.s >> j.e >> j.p;\n    sort(jb.begin(), jb.end(), [](auto& a, auto& b){ return a.e < b.e; });\n    vector<long long> dp(n); vector<int> ends(n); for (int i=0;i<n;++i) ends[i]=jb[i].e;\n    for (int i=0;i<n;++i) {\n        int idx = upper_bound(ends.begin(), ends.begin() + i, jb[i].s) - ends.begin() - 1;\n        long long take = jb[i].p + (idx >= 0 ? dp[idx] : 0);\n        dp[i] = i > 0 ? max(dp[i - 1], take) : take;\n    }\n    cout << dp[n-1] << "\\n"; return 0;\n}`,
    [{ input: '3\n1 3 50\n3 5 40\n2 4 10', expectedOutput: '90', description: 'Touching [1,3]+[3,5]=90' }, { input: '3\n1 10 100\n2 3 10\n4 5 10', expectedOutput: '100', description: 'Take 100 even if ends last' }]),

  cppBug('bh-cpp-m10-04', 'medium', 600, 'Fix Matrix Zeroes Self Pollution',
    'Goal: r c then grid. If cell is 0 zero out row & col; print final sum. Symptom: Mutates matrix inline causing chain-reaction zeroes!',
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> g(r, vector<int>(c));\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) cin >> g[i][j];\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) if (g[i][j]==0) {\n        for (int k=0;k<c;++k) g[i][k]=0;\n        for (int k=0;k<r;++k) g[k][j]=0;\n    }\n    long long s = 0; for (auto& row : g) for (int v : row) s += v;\n    cout << s << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> g(r, vector<int>(c));\n    vector<bool> rz(r, false), cz(c, false);\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) { cin >> g[i][j]; if (g[i][j]==0) { rz[i]=true; cz[j]=true; } }\n    long long s = 0; for (int i=0;i<r;++i) for (int j=0;j<c;++j) if (!rz[i] && !cz[j]) s += g[i][j];\n    cout << s << "\\n"; return 0;\n}`,
    [{ input: '3 3\n1 1 1\n1 0 1\n1 1 1', expectedOutput: '4', description: 'Corners stay 1' }, { input: '2 2\n0 5\n5 5', expectedOutput: '5', description: 'Bottom-right stays 5' }]),

  cppBug('bh-cpp-m10-05', 'medium', 600, 'Fix Triangle Path Top Down Mistake',
    'Goal: n rows triangle. Print min path top-to-bottom. Symptom: Wrong edge index when moving left/right and ignores inner min.',
    `${H}int main() {\n    int n; cin >> n; vector<vector<int>> t(n);\n    for (int i=0;i<n;++i){ t[i].resize(i+1); for (int j=0;j<=i;++j) cin>>t[i][j]; }\n    for (int i = n - 2; i >= 0; --i) for (int j = 0; j < i; ++j)\n        t[i][j] += max(t[i + 1][j], t[i + 1][j + 1]);\n    cout << t[0][0] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<vector<int>> t(n);\n    for (int i=0;i<n;++i){ t[i].resize(i+1); for (int j=0;j<=i;++j) cin>>t[i][j]; }\n    for (int i = n - 2; i >= 0; --i) for (int j = 0; j <= i; ++j)\n        t[i][j] += min(t[i + 1][j], t[i + 1][j + 1]);\n    cout << t[0][0] << "\\n"; return 0;\n}`,
    [{ input: '4\n2\n3 4\n6 5 7\n4 1 8 3', expectedOutput: '11', description: '2+3+5+1=11' }, { input: '2\n1\n2 9', expectedOutput: '3', description: '1+2=3' }]),

  cppBug('bh-cpp-m10-06', 'medium', 600, 'Fix Zero-One Matrix Multi-BFS Init',
    'Goal: r c then 0/1 grid. Print sum of Manhattan distances to nearest 0. Symptom: Initializes 0s as -1 and mixes visited distance.',
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> d(r, vector<int>(c, 0)); queue<pair<int,int>> q;\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j){ int v; cin>>v; if(v==1) q.push({i,j}); else d[i][j]=-1; }\n    int dx[4]={1,-1,0,0}, dy[4]={0,0,1,-1};\n    while(!q.empty()){ auto [x,y]=q.front(); q.pop(); for(int k=0;k<4;++k){ int nx=x+dx[k], ny=y+dy[k]; if(nx>=0&&nx<r&&ny>=0&&ny<c&&d[nx][ny]==-1){ d[nx][ny]=d[x][y]+1; q.push({nx,ny}); } } }\n    long long s=0; for(auto& row:d) for(int v:row) s+=v; cout << s << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> d(r, vector<int>(c, -1)); queue<pair<int,int>> q;\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j){ int v; cin>>v; if(v==0){ d[i][j]=0; q.push({i,j}); } }\n    int dx[4]={1,-1,0,0}, dy[4]={0,0,1,-1};\n    while(!q.empty()){ auto [x,y]=q.front(); q.pop(); for(int k=0;k<4;++k){ int nx=x+dx[k], ny=y+dy[k]; if(nx>=0&&nx<r&&ny>=0&&ny<c&&d[nx][ny]==-1){ d[nx][ny]=d[x][y]+1; q.push({nx,ny}); } } }\n    long long s=0; for(auto& row:d) for(int v:row) s+=v; cout << s << "\\n"; return 0;\n}`,
    [{ input: '3 3\n0 0 0\n0 1 0\n1 1 1', expectedOutput: '5', description: 'Sum distances = 5' }, { input: '2 2\n0 1\n1 1', expectedOutput: '4', description: 'Sum distances = 4' }]),

  cppBug('bh-cpp-m10-07', 'medium', 600, 'Fix Perfect Squares Min DP Guard',
    'Goal: Input n. Min count of perfect squares summing to n. Symptom: Unreachable large init wrong, loop misses s*s == i.',
    `${H}int main() {\n    int n; cin >> n; vector<int> dp(n + 1, 0);\n    for (int i=1;i<=n;++i) {\n        dp[i] = i;\n        for (int s=1;s*s<i;++s) dp[i] = min(dp[i], dp[i - s*s]);\n    }\n    cout << dp[n] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> dp(n + 1, 0);\n    for (int i=1;i<=n;++i) {\n        dp[i] = i;\n        for (int s=1;s*s<=i;++s) dp[i] = min(dp[i], dp[i - s*s] + 1);\n    }\n    cout << dp[n] << "\\n"; return 0;\n}`,
    [{ input: '12', expectedOutput: '3', description: '4+4+4 -> 3' }, { input: '9', expectedOutput: '1', description: '3^2 = 9 -> 1' }]),

  cppBug('bh-cpp-m10-08', 'medium', 600, 'Fix Envelopes Russian Doll Comparator',
    'Goal: n pairs "w h". Max strictly nested envelopes. Symptom: Sorts h ascending on equal w causing fake invalid nesting.',
    `${H}int main() {\n    int n; cin >> n; vector<pair<int,int>> e(n); for (auto& p:e) cin>>p.first>>p.second;\n    sort(e.begin(), e.end());\n    vector<int> tails;\n    for (auto& p : e) {\n        auto it = upper_bound(tails.begin(), tails.end(), p.second);\n        if (it==tails.end()) tails.push_back(p.second); else *it=p.second;\n    }\n    cout << tails.size() << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<pair<int,int>> e(n); for (auto& p:e) cin>>p.first>>p.second;\n    sort(e.begin(), e.end(), [](auto& a, auto& b){ return a.first!=b.first ? a.first<b.first : a.second>b.second; });\n    vector<int> tails;\n    for (auto& p : e) {\n        auto it = lower_bound(tails.begin(), tails.end(), p.second);\n        if (it==tails.end()) tails.push_back(p.second); else *it=p.second;\n    }\n    cout << tails.size() << "\\n"; return 0;\n}`,
    [{ input: '3\n5 4\n5 5\n5 6', expectedOutput: '1', description: 'Same width cannot nest' }, { input: '4\n5 4\n6 4\n6 7\n2 3', expectedOutput: '3', description: '3 nested' }]),

  cppBug('bh-cpp-m10-09', 'medium', 600, 'Fix Balanced Jump Minimum Hops',
    'Goal: n then n jump sizes. Min hops 0 -> n-1. Symptom: Includes i == n-1 in loop forcing unnecessary extra jump.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int jumps=0, end=0, far=0;\n    for (int i=0;i<n;++i) {\n        far = max(far, i + a[i]);\n        if (i == end) { ++jumps; end = i; }\n    }\n    cout << jumps << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int jumps=0, end=0, far=0;\n    for (int i=0;i<n-1;++i) {\n        far = max(far, i + a[i]);\n        if (i == end) { ++jumps; end = far; }\n    }\n    cout << jumps << "\\n"; return 0;\n}`,
    [{ input: '5\n2 3 1 1 4', expectedOutput: '2', description: '2 jumps' }, { input: '1\n0', expectedOutput: '0', description: 'Already at end -> 0' }]),

  cppBug('bh-cpp-m10-10', 'medium', 600, 'Fix Distinct Subsequences Overflow',
    'Goal: Input strings s and t. Count subsequences of s == t. Symptom: Loops j forward causing multiple reuse in 1 char.',
    `${H}int main() {\n    string s, t; cin >> s >> t; int m=s.size(), n=t.size();\n    vector<unsigned long long> dp(n+1, 0); dp[0]=1;\n    for (int i=0;i<m;++i) for (int j=1;j<=n;++j) if (s[i]==t[j-1]) dp[j] += dp[j-1];\n    cout << dp[n] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    string s, t; cin >> s >> t; int m=s.size(), n=t.size();\n    vector<unsigned long long> dp(n+1, 0); dp[0]=1;\n    for (int i=0;i<m;++i) for (int j=n;j>=1;--j) if (s[i]==t[j-1]) dp[j] += dp[j-1];\n    cout << dp[n] << "\\n"; return 0;\n}`,
    [{ input: 'rabbbit\nrabbit', expectedOutput: '3', description: '3 ways not more' }, { input: 'aabb\nab', expectedOutput: '4', description: '2*2=4 ways' }]),
];

// ---------- HARD (4-5 subtle tricky bugs, 3m/5m/10m x 10 = 30) ----------
const CPP_BUG_HARD = [
  // Hard 3m (10)
  cppBug('bh-cpp-h3-01', 'hard', 180, 'Fix Kruskal Union By Rank Cycle',
    'Goal: n nodes, e weighted edges. Print MST weight or -1. Symptom: Never sorts edges, swaps edge vertices, returns cost even if disconnected.',
    `${H}int main() {\n    int n, e; cin >> n >> e; struct E { int u, v; long long w; }; vector<E> ed(e);\n    for (auto& x : ed) cin >> x.u >> x.v >> x.w;\n    vector<int> p(n); for (int i=0;i<n;++i) p[i]=i;\n    auto fp=[&](int x){ while (p[x]!=x) x=p[x]; return x; };\n    long long c=0; int u=0;\n    for (auto& x : ed) { int a=fp(x.u), b=fp(x.v); if (a==b) { p[a]=b; c+=x.w; u++; } }\n    cout << c << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; struct E { int u, v; long long w; }; vector<E> ed(e);\n    for (auto& x : ed) cin >> x.u >> x.v >> x.w;\n    sort(ed.begin(), ed.end(), [](auto& a, auto& b){ return a.w < b.w; });\n    vector<int> p(n); for (int i=0;i<n;++i) p[i]=i;\n    auto fp=[&](int x){ while (p[x]!=x) x=p[x]=p[p[x]]; return x; };\n    long long c=0; int u=0;\n    for (auto& x : ed) { int a=fp(x.u), b=fp(x.v); if (a!=b) { p[a]=b; c+=x.w; u++; } }\n    cout << (u == n - 1 ? c : -1) << "\\n"; return 0;\n}`,
    [{ input: '4 5\n0 1 10\n0 2 6\n0 3 5\n1 3 15\n2 3 4', expectedOutput: '19', description: 'MST cost 19' }, { input: '3 1\n0 1 5', expectedOutput: '-1', description: 'Disconnected -1' }]),

  cppBug('bh-cpp-h3-02', 'hard', 180, 'Fix Aggressive Cows Placement Gap',
    'Goal: k cows, n unsorted stall coordinates. Maximize minimum spacing. Symptom: Uses unsorted stalls, checks >= k-1 wrong & binary search infinite loop.',
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    long long lo=0, hi=a.back();\n    while (lo < hi) {\n        long long mid=(lo+hi)/2, last=a[0]; int cnt=1;\n        for (int i=1;i<n;++i) if (a[i]-last>mid) { ++cnt; last=a[i]; }\n        if (cnt >= k) lo=mid; else hi=mid-1;\n    }\n    cout << lo << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    sort(a.begin(), a.end()); long long lo=1, hi=a.back()-a.front(), ans=0;\n    while (lo <= hi) {\n        long long mid=lo+(hi-lo)/2, last=a[0]; int cnt=1;\n        for (int i=1;i<n;++i) if (a[i]-last>=mid) { ++cnt; last=a[i]; }\n        if (cnt >= k) { ans=mid; lo=mid+1; } else hi=mid-1;\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '3 5\n9 1 8 2 4', expectedOutput: '3', description: 'Unsorted cows gap 3' }, { input: '2 2\n5 15', expectedOutput: '10', description: '10 gap' }]),

  cppBug('bh-cpp-h3-03', 'hard', 180, 'Fix Stock Cooldown Overflow Transition',
    'Goal: n then n prices. Max profit with 1-day cooldown after selling. Symptom: Updates hold using NEW sold instead of pre-sell sold.',
    `${H}int main() {\n    int n; cin >> n; vector<long long> p(n); for (auto& x : p) cin >> x;\n    long long hold = 0, sold = 0, rest = 0;\n    for (int i=0;i<n;++i) {\n        sold = hold + p[i];\n        rest = max(rest, sold);\n        hold = max(hold, rest - p[i]);\n    }\n    cout << sold << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> p(n); for (auto& x : p) cin >> x;\n    long long hold = -p[0], sold = 0, rest = 0;\n    for (int i=1;i<n;++i) {\n        long long prevSold = sold;\n        sold = hold + p[i];\n        hold = max(hold, rest - p[i]);\n        rest = max(rest, prevSold);\n    }\n    cout << max(sold, rest) << "\\n"; return 0;\n}`,
    [{ input: '5\n1 2 3 0 2', expectedOutput: '3', description: 'Rest enforced -> 3' }, { input: '2\n5 1', expectedOutput: '0', description: 'No profit -> 0' }]),

  cppBug('bh-cpp-h3-04', 'hard', 180, 'Fix Partition Painter Capacity Bias',
    'Goal: k painters, n board lengths. Print min max load. Symptom: lo omits max element, initializes p=0, swaps lo/hi return.',
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<long long> a(n); long long hi=0;\n    for (auto& x : a) { cin >> x; hi += x; }\n    long long lo = a[0];\n    while (lo < hi) {\n        long long mid=(lo+hi)/2, cur=0; int p=0;\n        for (auto x : a) { if (cur+x>=mid) { ++p; cur=0; } cur+=x; }\n        if (p < k) hi=mid; else lo=mid+1;\n    }\n    cout << lo << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<long long> a(n); long long lo=0, hi=0;\n    for (auto& x : a) { cin >> x; lo=max(lo, x); hi+=x; }\n    while (lo < hi) {\n        long long mid=lo+(hi-lo)/2, cur=0; int p=1;\n        for (auto x : a) { if (cur+x>mid) { ++p; cur=0; } cur+=x; }\n        if (p <= k) hi=mid; else lo=mid+1;\n    }\n    cout << lo << "\\n"; return 0;\n}`,
    [{ input: '2 4\n10 20 30 40', expectedOutput: '60', description: 'Max 60' }, { input: '3 3\n2 10 2', expectedOutput: '10', description: 'Heavy middle board' }]),

  cppBug('bh-cpp-h3-05', 'hard', 180, 'Fix Circular First Positive Cyclic Check',
    'Goal: n then n ints. Print smallest positive integer >= 1 missing. Symptom: Infinite swap loop when arr[i] duplicates target index value.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    for (int i=0;i<n;++i) while (a[i]>=1 && a[i]<=n && a[i]!=i+1) swap(a[i], a[a[i]-1]);\n    for (int i=0;i<n;++i) if (a[i]!=i+1) { cout << i << "\\n"; return 0; }\n    cout << n << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    for (int i=0;i<n;++i) while (a[i]>=1 && a[i]<=n && a[a[i]-1]!=a[i]) swap(a[i], a[a[i]-1]);\n    for (int i=0;i<n;++i) if (a[i]!=i+1) { cout << (i+1) << "\\n"; return 0; }\n    cout << (n+1) << "\\n"; return 0;\n}`,
    [{ input: '3\n1 1 2', expectedOutput: '3', description: 'Duplicate 1 terminates cleanly -> 3' }, { input: '2\n1 2', expectedOutput: '3', description: 'Missing n+1' }]),

  cppBug('bh-cpp-h3-06', 'hard', 180, 'Fix Unique Subarray Distinct Erase',
    'Goal: n then positive ints. Print max sum of contiguous distinct-element subarray. Symptom: Advances l without removing a[l] properly & drops sum.',
    `${H}int main() {\n    int n; cin >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    unordered_set<long long> s; long long sum=0, best=0; int l=0;\n    for (int r=0;r<n;++r) {\n        if (s.count(a[r])) { s.erase(a[l]); sum -= a[l]; ++l; }\n        s.insert(a[r]); best = max(best, sum += a[r]);\n    }\n    cout << best << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    unordered_set<long long> s; long long sum=0, best=0; int l=0;\n    for (int r=0;r<n;++r) {\n        while (s.count(a[r])) { s.erase(a[l]); sum -= a[l++]; }\n        s.insert(a[r]); sum += a[r]; best = max(best, sum);\n    }\n    cout << best << "\\n"; return 0;\n}`,
    [{ input: '5\n4 2 4 5 6', expectedOutput: '17', description: '2+4+5+6=17' }, { input: '6\n5 2 1 3 2 5', expectedOutput: '11', description: 'While skips past 5 and 2' }]),

  cppBug('bh-cpp-h3-07', 'hard', 180, 'Fix Sliding Product K Zero Divide Bug',
    'Goal: k, n then positive ints. Count contiguous subarrays with product < k. Symptom: Crashes / loops l>r when k<=1 or divides prod wrong.',
    `${H}int main() {\n    long long k; int n; cin >> k >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    long long prod=1, ans=0; int l=0;\n    for (int r=0;r<n;++r) {\n        prod *= a[r];\n        while (prod > k) prod /= a[l++];\n        ans += (r - l);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    long long k; int n; cin >> k >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    if (k <= 1) { cout << 0 << "\\n"; return 0; }\n    long long prod=1, ans=0; int l=0;\n    for (int r=0;r<n;++r) {\n        prod *= a[r];\n        while (l <= r && prod >= k) prod /= a[l++];\n        ans += (r - l + 1);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '1 3\n1 1 1', expectedOutput: '0', description: 'k <= 1 safe' }, { input: '100 4\n10 5 2 6', expectedOutput: '8', description: '8 subarrays < 100' }]),

  cppBug('bh-cpp-h3-08', 'hard', 180, 'Fix Bitwise Parity Count Sign Trap',
    'Goal: n then ints. Count elements with even set bits count. Symptom: Infinite shift on negative signed numbers & drops bit 0.',
    `${H}int main() {\n    int n; cin >> n; int ans=0;\n    for (int i=0;i<n;++i) {\n        int x; cin >> x; int c=0;\n        while (x != 0) { if (x & 1) c++; x >>= 1; }\n        if (c % 2) ans++;\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; int ans=0;\n    for (int i=0;i<n;++i) {\n        unsigned int x; cin >> x; int c=0;\n        while (x != 0) { c += (x & 1); x >>= 1; }\n        if (c % 2 == 0) ans++;\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '4\n3 5 6 7', expectedOutput: '3', description: '3,5,6 have 2 set bits' }, { input: '2\n1 2', expectedOutput: '0', description: '1 bit each' }]),

  cppBug('bh-cpp-h3-09', 'hard', 180, 'Fix Koko Speed Integer Ceil Ceil',
    'Goal: h hours, n piles. Min speed k finishing in <= h hours. Symptom: Integer division truncates hours & hi set too low.',
    `${H}int main() {\n    long long h; int n; cin >> h >> n; vector<long long> p(n);\n    for (auto& x : p) cin >> x;\n    long long lo = 1, hi = p[0];\n    while (lo <= hi) {\n        long long mid = (lo + hi) / 2, hrs = 0;\n        for (auto x : p) hrs += x / mid;\n        if (hrs < h) hi = mid; else lo = mid + 1;\n    }\n    cout << lo << "\\n"; return 0;\n}`,
    `${H}int main() {\n    long long h; int n; cin >> h >> n; vector<long long> p(n); long long hi = 1;\n    for (auto& x : p) { cin >> x; hi = max(hi, x); }\n    long long lo = 1;\n    while (lo < hi) {\n        long long mid = lo + (hi - lo) / 2, hrs = 0;\n        for (auto x : p) hrs += (x + mid - 1) / mid;\n        if (hrs <= h) hi = mid; else lo = mid + 1;\n    }\n    cout << lo << "\\n"; return 0;\n}`,
    [{ input: '8 4\n3 6 7 11', expectedOutput: '4', description: 'Min speed 4' }, { input: '5 4\n30 11 23 4', expectedOutput: '23', description: 'Speed 23 -> 5 hours' }]),

  cppBug('bh-cpp-h3-10', 'hard', 180, 'Fix Max Subarray Product Neg Overflow',
    'Goal: n then ints. Print max contiguous subarray product. Symptom: Uses int overflow and overwrites hi before lo computation.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    int hi = 1, lo = 1, ans = 0;\n    for (int x : a) {\n        hi = max({x, hi * x, lo * x});\n        lo = min({x, hi * x, lo * x});\n        ans = max(ans, hi);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> a(n); for (auto& x : a) cin >> x;\n    long long hi = a[0], lo = a[0], ans = a[0];\n    for (int i=1;i<n;++i) {\n        long long x = a[i], nhi = max({x, hi * x, lo * x}), nlo = min({x, hi * x, lo * x});\n        hi = nhi; lo = nlo; ans = max(ans, hi);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '3\n-2 0 -1', expectedOutput: '0', description: 'Max product is 0' }, { input: '3\n-3 -2 -4', expectedOutput: '8', description: '-2 * -4 = 8' }]),

  // Hard 5m (10)
  cppBug('bh-cpp-h5-01', 'hard', 300, 'Fix Burst Balloons Interval Order',
    'Goal: n then balloon nums. Max coins bursting all balloons. Symptom: Runs l outer instead of interval len & multiplies unpadded indices.',
    `${H}int main() {\n    int n; cin >> n; vector<long long> b(n + 2, 1); for (int i=1;i<=n;++i) cin>>b[i];\n    vector<vector<long long>> dp(n+2, vector<long long>(n+2, 0));\n    for (int l=1;l<=n;++l) for (int r=l;r<=n;++r) for (int k=l;k<=r;++k)\n        dp[l][r] = max(dp[l][r], dp[l][k] + b[l]*b[k]*b[r] + dp[k][r]);\n    cout << dp[1][n] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> b(n + 2, 1); for (int i=1;i<=n;++i) cin>>b[i];\n    vector<vector<long long>> dp(n+2, vector<long long>(n+2, 0));\n    for (int len=1;len<=n;++len) for (int l=1;l+len-1<=n;++l) {\n        int r = l + len - 1;\n        for (int k=l;k<=r;++k)\n            dp[l][r] = max(dp[l][r], dp[l][k-1] + b[l-1]*b[k]*b[r+1] + dp[k+1][r]);\n    }\n    cout << dp[1][n] << "\\n"; return 0;\n}`,
    [{ input: '4\n3 1 5 8', expectedOutput: '167', description: 'Optimal 167' }, { input: '2\n1 5', expectedOutput: '10', description: '1*1*5 + 1*5*1' }]),

  cppBug('bh-cpp-h5-02', 'hard', 300, 'Fix K-Stock Transactions Cap Bug',
    'Goal: k, n then n prices. Max profit with <= k trades. Symptom: Wrong buy init 0 allows short selling from free start.',
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<int> p(n); for (int& x : p) cin >> x;\n    vector<long long> buy(k + 1, 0), sell(k + 1, 0);\n    for (int x : p) for (int t=1;t<=k;++t) {\n        buy[t] = max(buy[t], sell[t] - x);\n        sell[t] = max(sell[t], buy[t] + x);\n    }\n    cout << sell[0] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<long long> p(n); for (auto& x : p) cin >> x;\n    if (n <= 1 || k <= 0) { cout << 0 << "\\n"; return 0; }\n    int kk = min(k, n / 2);\n    vector<long long> buy(kk + 1, -1e15), sell(kk + 1, 0);\n    for (auto x : p) for (int t=1;t<=kk;++t) {\n        buy[t] = max(buy[t], sell[t - 1] - x);\n        sell[t] = max(sell[t], buy[t] + x);\n    }\n    cout << sell[kk] << "\\n"; return 0;\n}`,
    [{ input: '2 6\n3 2 6 5 0 3', expectedOutput: '7', description: '7 profit' }, { input: '1 3\n1 5 9', expectedOutput: '8', description: '1 trade -> 8' }]),

  cppBug('bh-cpp-h5-03', 'hard', 300, 'Fix Matrix Chain Bounds Split Bug',
    'Goal: k matrices (k+1 dims). Print min multiplications. Symptom: Initializes dp[i][j] = 0 so min keeps 0 & misses p[j+1].',
    `${H}int main() {\n    int k; cin >> k; vector<long long> p(k + 1); for (auto& x : p) cin >> x;\n    vector<vector<long long>> dp(k, vector<long long>(k, 0));\n    for (int len=2;len<=k;++len) for (int i=0;i+len<=k;++i) {\n        int j=i+len-1;\n        for (int m=i;m<j;++m) dp[i][j] = min(dp[i][j], dp[i][m]+dp[m+1][j]+p[i]*p[m]*p[j]);\n    }\n    cout << dp[0][k-1] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int k; cin >> k; vector<long long> p(k + 1); for (auto& x : p) cin >> x;\n    vector<vector<long long>> dp(k, vector<long long>(k, 0));\n    for (int len=2;len<=k;++len) for (int i=0;i+len<=k;++i) {\n        int j=i+len-1; dp[i][j]=1e18;\n        for (int m=i;m<j;++m) dp[i][j] = min(dp[i][j], dp[i][m]+dp[m+1][j]+p[i]*p[m+1]*p[j+1]);\n    }\n    cout << dp[0][k-1] << "\\n"; return 0;\n}`,
    [{ input: '3\n10 30 5 60', expectedOutput: '4500', description: '4500 scalar ops' }, { input: '2\n10 20 30', expectedOutput: '6000', description: '10*20*30' }]),

  cppBug('bh-cpp-h5-04', 'hard', 300, 'Fix Palindrome Min Cuts Init Guard',
    'Goal: Word s. Min cuts so all pieces palindromic. Symptom: Unchecked l-1 out-of-bounds & wrong palindrome span check.',
    `${H}int main() {\n    string s; cin >> s; int n=s.size();\n    vector<vector<bool>> pal(n, vector<bool>(n, false)); vector<int> dp(n, 0);\n    for (int r=0;r<n;++r) {\n        dp[r] = n;\n        for (int l=0;l<=r;++l) if (s[l]==s[r] && pal[l+1][r-1]) {\n            pal[l][r]=true; dp[r]=min(dp[r], dp[l-1]+1);\n        }\n    }\n    cout << dp[n-1] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    string s; cin >> s; int n=s.size();\n    vector<vector<bool>> pal(n, vector<bool>(n, false)); vector<int> dp(n, 0);\n    for (int r=0;r<n;++r) {\n        dp[r] = r;\n        for (int l=0;l<=r;++l) if (s[l]==s[r] && (r-l<=2 || pal[l+1][r-1])) {\n            pal[l][r]=true; dp[r]=(l==0 ? 0 : min(dp[r], dp[l-1]+1));\n        }\n    }\n    cout << dp[n-1] << "\\n"; return 0;\n}`,
    [{ input: 'aab', expectedOutput: '1', description: 'aa | b' }, { input: 'racecar', expectedOutput: '0', description: '0 cuts' }]),

  cppBug('bh-cpp-h5-05', 'hard', 300, 'Fix Grid Longest Increasing Memo Order',
    'Goal: r c matrix. Longest strictly increasing 4-dir path len. Symptom: Compares >= allowing flat cycle infinite recursion!',
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> g(r, vector<int>(c)), m(r, vector<int>(c, 0));\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) cin>>g[i][j];\n    int dx[4]={1,-1,0,0}, dy[4]={0,0,1,-1};\n    auto dfs=[&](auto&& self, int x, int y) -> int {\n        if (m[x][y]) return m[x][y]; int b=0;\n        for (int d=0;d<4;++d){ int nx=x+dx[d], ny=y+dy[d]; if (nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]>=g[x][y]) b=max(b, self(self,nx,ny)); }\n        return m[x][y]=b;\n    };\n    int ans=0; for (int i=0;i<r;++i) for (int j=0;j<c;++j) ans=max(ans, dfs(dfs,i,j));\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> g(r, vector<int>(c)), m(r, vector<int>(c, 0));\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) cin>>g[i][j];\n    int dx[4]={1,-1,0,0}, dy[4]={0,0,1,-1};\n    auto dfs=[&](auto&& self, int x, int y) -> int {\n        if (m[x][y]) return m[x][y]; int b=1;\n        for (int d=0;d<4;++d){ int nx=x+dx[d], ny=y+dy[d]; if (nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]>g[x][y]) b=max(b, 1+self(self,nx,ny)); }\n        return m[x][y]=b;\n    };\n    int ans=0; for (int i=0;i<r;++i) for (int j=0;j<c;++j) ans=max(ans, dfs(dfs,i,j));\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '2 2\n3 3\n3 3', expectedOutput: '1', description: 'Equal neighbors must not loop' }, { input: '3 3\n9 9 4\n6 6 8\n2 1 1', expectedOutput: '4', description: '1->2->6->9' }]),

  cppBug('bh-cpp-h5-06', 'hard', 300, 'Fix Held-Karp TSP Bitmask Init Trap',
    'Goal: n (<=10) weighted adj matrix. Min Hamiltonian cycle from 0. Symptom: Uses bitwise & precedence trap & forgets return edge w[u][0].',
    `${H}int main() {\n    int n; cin >> n; vector<vector<long long>> w(n, vector<long long>(n));\n    for (int i=0;i<n;++i) for (int j=0;j<n;++j) cin>>w[i][j];\n    int ALL = 1 << n; const long long INF = 1e15;\n    vector<vector<long long>> dp(ALL, vector<long long>(n, INF)); dp[0][0]=0;\n    for (int m=0;m<ALL;++m) for (int u=0;u<n;++u) if (dp[m][u]<INF)\n        for (int v=0;v<n;++v) if (m & (1<<v) == 0) dp[m|(1<<v)][v]=min(dp[m|(1<<v)][v], dp[m][u]+w[u][v]);\n    long long ans = *min_element(dp[ALL-1].begin(), dp[ALL-1].end());\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<vector<long long>> w(n, vector<long long>(n));\n    for (int i=0;i<n;++i) for (int j=0;j<n;++j) cin>>w[i][j];\n    int ALL = 1 << n; const long long INF = 1e15;\n    vector<vector<long long>> dp(ALL, vector<long long>(n, INF)); dp[1][0]=0;\n    for (int m=1;m<ALL;++m) for (int u=0;u<n;++u) if (dp[m][u]<INF)\n        for (int v=0;v<n;++v) if ((m & (1<<v)) == 0) dp[m|(1<<v)][v]=min(dp[m|(1<<v)][v], dp[m][u]+w[u][v]);\n    long long ans = INF; for (int u=1;u<n;++u) ans = min(ans, dp[ALL-1][u] + w[u][0]);\n    cout << (n==1 ? 0 : ans) << "\\n"; return 0;\n}`,
    [{ input: '4\n0 10 15 20\n10 0 35 25\n15 35 0 30\n20 25 30 0', expectedOutput: '80', description: 'Tour cost 80' }, { input: '3\n0 1 9\n1 0 2\n9 2 0', expectedOutput: '12', description: '1+2+9=12' }]),

  cppBug('bh-cpp-h5-07', 'hard', 300, 'Fix Two-Heap Running Median Rebalance',
    'Goal: n then stream ints. Sum floor medians after each insertion. Symptom: Allows hi larger than lo+1 and truncates unsigned/signed shift.',
    `${H}int main() {\n    int n; cin >> n; priority_queue<long long> lo; priority_queue<long long, vector<long long>, greater<long long>> hi;\n    long long ans = 0;\n    for (int i=0;i<n;++i) {\n        long long x; cin >> x; lo.push(x);\n        if (lo.size() > hi.size() + 1) { hi.push(lo.top()); lo.pop(); }\n        long long med = lo.size()==hi.size() ? (lo.top()+hi.top())/2 : lo.top();\n        ans += med;\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; priority_queue<long long> lo; priority_queue<long long, vector<long long>, greater<long long>> hi;\n    long long ans = 0;\n    for (int i=0;i<n;++i) {\n        long long x; cin >> x; lo.push(x); hi.push(lo.top()); lo.pop();\n        if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }\n        long long med = lo.size() > hi.size() ? lo.top() : (lo.top()+hi.top())/2;\n        ans += med;\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '4\n10 2 8 4', expectedOutput: '22', description: '10+6+8+6 -> wait: 10+6+8+6=30! Wait fix expected!' }, { input: '3\n2 4 6', expectedOutput: '9', description: '2+3+4=9' }]),

  cppBug('bh-cpp-h5-08', 'hard', 300, 'Fix Subarray K Distinct Sliding Erase',
    'Goal: k, n then ints. Count subarrays with AT MOST k distinct values. Symptom: Leaves zero-count keys inside freq.size() and skips exact-k window.',
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    unordered_map<int,int> f; int l=0; long long ans=0;\n    for (int r=0;r<n;++r) {\n        f[a[r]]++;\n        while ((int)f.size() >= k) { f[a[l]]--; ++l; }\n        ans += (r - l);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int k, n; cin >> k >> n; vector<int> a(n); for (int& x : a) cin >> x;\n    unordered_map<int,int> f; int l=0; long long ans=0;\n    for (int r=0;r<n;++r) {\n        f[a[r]]++;\n        while ((int)f.size() > k) { if (--f[a[l]] == 0) f.erase(a[l]); ++l; }\n        ans += (r - l + 1);\n    }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '2 5\n1 2 1 2 3', expectedOutput: '12', description: '12 subarrays <= 2' }, { input: '1 3\n1 1 2', expectedOutput: '4', description: '4 subarrays <= 1' }]),

  cppBug('bh-cpp-h5-09', 'hard', 300, 'Fix DAG Longest Path Out-Of-Order',
    'Goal: n nodes, e DAG edges. Print longest path edge count. Symptom: Uses memo 0 as unvisited sentinel causing O(2^N) on sinks and counts nodes instead of edges.',
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n); vector<int> m(n, 0);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);}\n    auto dfs=[&](auto&& self, int u)->int{\n        if (m[u]) return m[u]; int b=1;\n        for (int v:adj[u]) b=max(b, self(self,v)+1);\n        return m[u]=b;\n    };\n    int ans=0; for (int i=0;i<n;++i) ans=max(ans, dfs(dfs,i)); cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n); vector<int> m(n, -1);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);}\n    auto dfs=[&](auto&& self, int u)->int{\n        if (m[u]!=-1) return m[u]; int b=0;\n        for (int v:adj[u]) b=max(b, self(self,v)+1);\n        return m[u]=b;\n    };\n    int ans=0; for (int i=0;i<n;++i) ans=max(ans, dfs(dfs,i)); cout << ans << "\\n"; return 0;\n}`,
    [{ input: '4 4\n0 1\n1 2\n2 3\n0 3', expectedOutput: '3', description: 'Longest edges = 3' }, { input: '3 0', expectedOutput: '0', description: 'No edges -> 0' }]),

  cppBug('bh-cpp-h5-10', 'hard', 300, 'Fix Zero Sum Subarrays Count Type',
    'Goal: n then ints. Count contiguous subarrays summing to 0. Symptom: Forgets mp[0]=1, uses 32-bit pref overflow, updates map wrong order.',
    `${H}int main() {\n    int n; cin >> n; unordered_map<int,int> mp; int pref=0, ans=0;\n    for (int i=0;i<n;++i) { int x; cin>>x; pref+=x; mp[pref]++; ans+=mp[pref]; }\n    cout << ans << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; unordered_map<long long,long long> mp; mp[0]=1; long long pref=0, ans=0;\n    for (int i=0;i<n;++i) { long long x; cin>>x; pref+=x; ans+=mp[pref]; mp[pref]++; }\n    cout << ans << "\\n"; return 0;\n}`,
    [{ input: '3\n0 0 0', expectedOutput: '6', description: '6 subarrays' }, { input: '4\n1 -1 2 -2', expectedOutput: '3', description: '3 zero subarrays' }]),

  // Hard 10m (10)
  cppBug('bh-cpp-h10-01', 'hard', 600, 'Fix Topological Cycle & Multi-Edge Degree',
    'Goal: n nodes, e directed edges. Print YES if all nodes topological-sortable else NO. Symptom: Never clears duplicate edges or miscounts done == e.',
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n); vector<int> ind(n, 0);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);ind[u]++;}\n    queue<int> q; for (int i=0;i<n;++i) if (ind[i]==0) q.push(i);\n    int done=0; while (!q.empty()){ int u=q.front(); q.pop(); done++; for(int v:adj[u]) if(--ind[v]==0) q.push(v); }\n    cout << (done == e ? "YES" : "NO") << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n); vector<int> ind(n, 0);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);ind[v]++;}\n    queue<int> q; for (int i=0;i<n;++i) if (ind[i]==0) q.push(i);\n    int done=0; while (!q.empty()){ int u=q.front(); q.pop(); done++; for(int v:adj[u]) if(--ind[v]==0) q.push(v); }\n    cout << (done == n ? "YES" : "NO") << "\\n"; return 0;\n}`,
    [{ input: '4 3\n0 1\n1 2\n2 3', expectedOutput: 'YES', description: 'Valid chain' }, { input: '3 3\n0 1\n1 2\n2 1', expectedOutput: 'NO', description: 'Cycle 1-2' }]),

  cppBug('bh-cpp-h10-02', 'hard', 600, 'Fix Edit Distance Space Reuse Bug',
    'Goal: Strings a and b. Min Levenshtein ops. Symptom: Fails dp[0][j] init and mutates upper-left diagonal early inside 1D pass.',
    `${H}int main() {\n    string a, b; cin >> a >> b; int m=a.size(), n=b.size();\n    vector<int> dp(n+1, 0);\n    for (int i=1;i<=m;++i) for (int j=1;j<=n;++j) {\n        if (a[i-1]==b[j-1]) dp[j]=dp[j-1]; else dp[j]=1+min(dp[j], dp[j-1]);\n    }\n    cout << dp[n] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    string a, b; cin >> a >> b; int m=a.size(), n=b.size();\n    vector<int> dp(n+1); for (int j=0;j<=n;++j) dp[j]=j;\n    for (int i=1;i<=m;++i) {\n        int prev=dp[0]; dp[0]=i;\n        for (int j=1;j<=n;++j) {\n            int tmp=dp[j];\n            if (a[i-1]==b[j-1]) dp[j]=prev; else dp[j]=1+min({dp[j], dp[j-1], prev});\n            prev=tmp;\n        }\n    }\n    cout << dp[n] << "\\n"; return 0;\n}`,
    [{ input: 'horse ros', expectedOutput: '3', description: '3 edits' }, { input: 'intention execution', expectedOutput: '5', description: '5 edits' }]),

  cppBug('bh-cpp-h10-03', 'hard', 600, 'Fix Largest Histogram Right Index Trap',
    'Goal: n then bar heights. Print largest rectangle area. Symptom: Uses right index wrong & overflows int*int area.',
    `${H}int main() {\n    int n; cin >> n; vector<int> h(n); for (int& x : h) cin >> x;\n    stack<int> st; int best = 0;\n    for (int i=0;i<=n;++i) {\n        int cur = (i==n) ? -1 : h[i];\n        while (!st.empty() && h[st.top()] >= cur) {\n            int ht = h[st.top()]; st.pop();\n            int w = st.empty() ? i : i - st.top();\n            best = max(best, ht * w);\n        }\n        st.push(i);\n    }\n    cout << best << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> h(n); for (auto& x : h) cin >> x;\n    stack<int> st; long long best = 0;\n    for (int i=0;i<=n;++i) {\n        long long cur = (i==n) ? 0 : h[i];\n        while (!st.empty() && h[st.top()] > cur) {\n            long long ht = h[st.top()]; st.pop();\n            long long w = st.empty() ? i : i - st.top() - 1;\n            best = max(best, ht * w);\n        }\n        st.push(i);\n    }\n    cout << best << "\\n"; return 0;\n}`,
    [{ input: '6\n2 1 5 6 2 3', expectedOutput: '10', description: '5*2=10' }, { input: '2\n100000 100000', expectedOutput: '200000', description: 'Tall twin bars' }]),

  cppBug('bh-cpp-h10-04', 'hard', 600, 'Fix Word Break Dictionary Slicing',
    'Goal: string s, k dict words, then k words. Print YES if breakable else NO. Symptom: Never skips unmatched lengths & uses j+1 offset wrong.',
    `${H}int main() {\n    string s; int k; cin >> s >> k; unordered_set<string> dict;\n    for (int i=0;i<k;++i){string w; cin>>w; dict.insert(w);}\n    int n = s.size(); vector<bool> dp(n+1, false);\n    for (int i=1;i<=n;++i) for (int j=0;j<i;++j)\n        if (dp[j] && dict.count(s.substr(j, i))) dp[i]=true;\n    cout << (dp[n] ? "YES" : "NO") << "\\n"; return 0;\n}`,
    `${H}int main() {\n    string s; int k; cin >> s >> k; unordered_set<string> dict;\n    for (int i=0;i<k;++i){string w; cin>>w; dict.insert(w);}\n    int n = s.size(); vector<bool> dp(n+1, false); dp[0]=true;\n    for (int i=1;i<=n;++i) for (int j=0;j<i;++j)\n        if (dp[j] && dict.count(s.substr(j, i - j))) { dp[i]=true; break; }\n    cout << (dp[n] ? "YES" : "NO") << "\\n"; return 0;\n}`,
    [{ input: 'leetcode 2\nleet code', expectedOutput: 'YES', description: 'substr len is i-j' }, { input: 'catsandog 5\ncats dog sand and cat', expectedOutput: 'NO', description: 'Impossible break' }]),

  cppBug('bh-cpp-h10-05', 'hard', 600, 'Fix Dijkstra Stale Negative Skip',
    'Goal: n nodes, e weighted directed edges. Min distance 0->n-1 or -1. Symptom: Wrong pair type pushes (v, dist) ordering & misses stale ignore.',
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<pair<int,long long>>> adj(n);\n    for (int i=0;i<e;++i){int u,v;long long w;cin>>u>>v>>w;adj[u].push_back({v,w});}\n    vector<long long> d(n, 1e15); d[0]=0;\n    priority_queue<pair<long long,int>> pq; pq.push({0,0});\n    while (!pq.empty()) {\n        auto [c, u] = pq.top(); pq.pop();\n        for (auto [v, w] : adj[u]) if (c+w < d[v]) { d[v]=c+w; pq.push({d[v], v}); }\n    }\n    cout << d[n-1] << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<pair<int,long long>>> adj(n);\n    for (int i=0;i<e;++i){int u,v;long long w;cin>>u>>v>>w;adj[u].push_back({v,w});}\n    const long long INF = 1e15; vector<long long> d(n, INF); d[0]=0;\n    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq; pq.push({0,0});\n    while (!pq.empty()) {\n        auto [c, u] = pq.top(); pq.pop(); if (c > d[u]) continue;\n        for (auto [v, w] : adj[u]) if (c+w < d[v]) { d[v]=c+w; pq.push({d[v], v}); }\n    }\n    cout << (d[n-1]>=INF ? -1 : d[n-1]) << "\\n"; return 0;\n}`,
    [{ input: '4 4\n0 1 1\n0 2 5\n1 3 10\n2 3 2', expectedOutput: '7', description: '0->2->3 = 7 beats max-heap trap' }, { input: '2 0', expectedOutput: '-1', description: 'Unreachable -1' }]),

  cppBug('bh-cpp-h10-06', 'hard', 600, 'Fix Circular Robber Two-Pass Bounds',
    'Goal: n then house cash in circle. Print max loot. Symptom: Both ranges share index n-1 and wrong single-element check.',
    `${H}int main() {\n    int n; cin >> n; vector<long long> a(n); for (auto& x:a) cin>>x;\n    auto rob=[&](int l, int r){\n        long long p2=0, p1=0;\n        for (int i=l;i<r;++i){ long long c=max(p1, p2+a[i]); p2=p1; p1=c; }\n        return p1;\n    };\n    cout << max(rob(0, n), rob(1, n)) << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<long long> a(n); for (auto& x:a) cin>>x;\n    if (n == 1) { cout << a[0] << "\\n"; return 0; }\n    auto rob=[&](int l, int r){\n        long long p2=0, p1=0;\n        for (int i=l;i<=r;++i){ long long c=max(p1, p2+a[i]); p2=p1; p1=c; }\n        return p1;\n    };\n    cout << max(rob(0, n - 2), rob(1, n - 1)) << "\\n"; return 0;\n}`,
    [{ input: '3\n2 3 2', expectedOutput: '3', description: 'Exclude both ends -> 3' }, { input: '1\n9', expectedOutput: '9', description: 'Single house 9' }]),

  cppBug('bh-cpp-h10-07', 'hard', 600, 'Fix Shortest Zero-One BFS Steps Bug',
    'Goal: r c then 0/1 grid. Shortest steps (0,0)->(r-1,c-1) else -1. Symptom: Increments dist wrongly & leaves start unvisited.',
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> g(r, vector<int>(c));\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) cin>>g[i][j];\n    queue<tuple<int,int,int>> q; q.push({0,0,1});\n    int dx[4]={1,-1,0,0}, dy[4]={0,0,1,-1};\n    while (!q.empty()) {\n        auto [x, y, d] = q.front(); q.pop();\n        if (x==r-1 && y==c-1) { cout << d << "\\n"; return 0; }\n        for (int k=0;k<4;++k){ int nx=x+dx[k], ny=y+dy[k]; if(nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==0){ q.push({nx,ny,d+1}); } }\n    }\n    cout << -1 << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int r, c; cin >> r >> c; vector<vector<int>> g(r, vector<int>(c));\n    for (int i=0;i<r;++i) for (int j=0;j<c;++j) cin>>g[i][j];\n    if (g[0][0] || g[r-1][c-1]) { cout << -1 << "\\n"; return 0; }\n    queue<tuple<int,int,int>> q; q.push({0,0,0}); g[0][0]=1;\n    int dx[4]={1,-1,0,0}, dy[4]={0,0,1,-1};\n    while (!q.empty()) {\n        auto [x, y, d] = q.front(); q.pop();\n        if (x==r-1 && y==c-1) { cout << d << "\\n"; return 0; }\n        for (int k=0;k<4;++k){ int nx=x+dx[k], ny=y+dy[k]; if(nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==0){ g[nx][ny]=1; q.push({nx,ny,d+1}); } }\n    }\n    cout << -1 << "\\n"; return 0;\n}`,
    [{ input: '3 3\n0 1 0\n0 0 0\n1 1 0', expectedOutput: '4', description: '4 moves' }, { input: '2 2\n1 0\n0 0', expectedOutput: '-1', description: 'Start blocked' }]),

  cppBug('bh-cpp-h10-08', 'hard', 600, 'Fix Partition Subset Zero Guard',
    'Goal: n then non-neg ints. YES if equal subset sum split possible else NO. Symptom: Forward capacity reuse & ignores odd total.',
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); int sum=0;\n    for (int& x : a) { cin>>x; sum+=x; }\n    int h = sum / 2; vector<bool> dp(h+1, false); dp[0]=true;\n    for (int x : a) for (int s=x; s<=h; ++s) if (dp[s-x]) dp[s]=true;\n    cout << (dp[h] ? "YES" : "NO") << "\\n"; return 0;\n}`,
    `${H}int main() {\n    int n; cin >> n; vector<int> a(n); int sum=0;\n    for (int& x : a) { cin>>x; sum+=x; }\n    if (sum % 2) { cout << "NO\\n"; return 0; }\n    int h = sum / 2; vector<bool> dp(h+1, false); dp[0]=true;\n    for (int x : a) for (int s=h; s>=x; --s) if (dp[s-x]) dp[s]=true;\n    cout << (dp[h] ? "YES" : "NO") << "\\n"; return 0;\n}`,
    [{ input: '2\n2 4', expectedOutput: 'NO', description: 'Cannot split 2+4' }, { input: '2\n1 2', expectedOutput: 'NO', description: 'Odd total 3' }]),

  cppBug('bh-cpp-h10-09', 'hard', 600, 'Fix Course Schedule Cycle & SelfLoop',
    'Goal: n, e then edges "u v" (u before v). Print lex smallest valid order space-joined, or IMPOSSIBLE. Symptom: Uses LIFO queue and never reverses ind direction.',
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n); vector<int> ind(n, 0);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);ind[u]++;}\n    stack<int> pq; for (int i=0;i<n;++i) if (ind[i]==0) pq.push(i);\n    vector<int> out; while(!pq.empty()){ int u=pq.top(); pq.pop(); out.push_back(u); for(int v:adj[u]) if(--ind[v]==0) pq.push(v); }\n    if (out.empty()) cout << "IMPOSSIBLE\\n"; else { for(size_t i=0;i<out.size();++i) cout<<(i?" ":"")<<out[i]; cout<<"\\n"; }\n    return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n); vector<int> ind(n, 0);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);ind[v]++;}\n    priority_queue<int, vector<int>, greater<int>> pq; for (int i=0;i<n;++i) if (ind[i]==0) pq.push(i);\n    vector<int> out; while(!pq.empty()){ int u=pq.top(); pq.pop(); out.push_back(u); for(int v:adj[u]) if(--ind[v]==0) pq.push(v); }\n    if ((int)out.size()!=n) cout << "IMPOSSIBLE\\n"; else { for(size_t i=0;i<out.size();++i) cout<<(i?" ":"")<<out[i]; cout<<"\\n"; }\n    return 0;\n}`,
    [{ input: '4 4\n1 0\n2 0\n3 1\n3 2', expectedOutput: '3 1 2 0', description: 'Lex smallest order' }, { input: '3 2\n0 1\n1 0', expectedOutput: 'IMPOSSIBLE', description: 'Partial cycle IMPOSSIBLE' }]),

  cppBug('bh-cpp-h10-10', 'hard', 600, 'Fix Articulation Points Tarjan Root Bug',
    'Goal: n nodes, e undirected edges. Count articulation vertices. Symptom: Marks root unconditionally if ch>=1 & mixes low/disc comparison.',
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);adj[v].push_back(u);}\n    vector<int> disc(n,-1), low(n,-1); vector<bool> cut(n,false); int t=0;\n    auto dfs=[&](auto&& self, int u, int p)->void{\n        disc[u]=low[u]=t++; int ch=0;\n        for (int v:adj[u]) {\n            if (v==p) continue;\n            if (disc[v]!=-1) low[u]=min(low[u], low[v]);\n            else { ch++; self(self,v,u); low[u]=min(low[u], low[v]); if (low[v] > disc[u]) cut[u]=true; }\n        }\n        if (p==-1 && ch>=1) cut[u]=true;\n    };\n    dfs(dfs,0,-1); int ans=0; for(bool b:cut) if(b) ans++; cout<<ans<<"\\n"; return 0;\n}`,
    `${H}int main() {\n    int n, e; cin >> n >> e; vector<vector<int>> adj(n);\n    for (int i=0;i<e;++i){int u,v;cin>>u>>v;adj[u].push_back(v);adj[v].push_back(u);}\n    vector<int> disc(n,-1), low(n,-1); vector<bool> cut(n,false); int t=0;\n    auto dfs=[&](auto&& self, int u, int p)->void{\n        disc[u]=low[u]=t++; int ch=0;\n        for (int v:adj[u]) {\n            if (v==p) continue;\n            if (disc[v]!=-1) low[u]=min(low[u], disc[v]);\n            else { ch++; self(self,v,u); low[u]=min(low[u], low[v]); if (p!=-1 && low[v]>=disc[u]) cut[u]=true; }\n        }\n        if (p==-1 && ch>1) cut[u]=true;\n    };\n    for (int i=0;i<n;++i) if (disc[i]==-1) dfs(dfs,i,-1);\n    int ans=0; for(bool b:cut) if(b) ans++; cout<<ans<<"\\n"; return 0;\n}`,
    [{ input: '5 5\n1 0\n0 2\n2 1\n0 3\n3 4', expectedOutput: '2', description: 'Nodes 0 and 3' }, { input: '3 3\n0 1\n1 2\n2 0', expectedOutput: '0', description: 'Cycle root has 1 child -> 0 cuts' }]),
];
// Fix bh-cpp-h5-07 test 1 expected output: 10 -> 10; (10,2)->6; (10,2,8)->8; (10,2,8,4)->(4+8)/2=6 -> 10+6+8+6 = 30!
CPP_BUG_HARD[16].question.testCases[0].expectedOutput = '30';
CPP_BUG_HARD[16].question.testCases[0].description = '10+6+8+6 = 30';
CPP_BUG_HARD[16].question.sampleOutput = '30';

export const CPP_BUG_QUESTIONS = [
  ...CPP_BUG_EASY,
  ...CPP_BUG_MED,
  ...CPP_BUG_HARD,
];
