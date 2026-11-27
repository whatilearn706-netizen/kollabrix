import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const DSA_BEGINNER_SPEC: TrackSpec = {
  id: 'dsa-beginner',
  language: 'dsa',
  track: 'beginner',
  title: 'DSA Foundation Track',
  tagline: 'Big-O, Arrays/Prefix Sums, Hashing, Two Pointers, Binary Search, Recursion & Linear DS',
  icon: '🧠',
  color: 'text-violet-500 dark:text-violet-400',
  badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  borderColor: 'border-violet-400/30 hover:border-violet-400/70',
  description:
    'Master the core algorithmic building blocks tested in OA screening rounds and 1v1 Battle Arena duels: complexity analysis, hashing, sliding windows, binary search, recursion, and stacks/queues with 70 problems.',
  compilerLanguage: 'cpp',
  compilerDisplayName: 'C++ / DSA Engine',
  estimatedTotalHours: '24 Hours',
  prerequisites: ['Basic loops and arrays in any programming language'],
  outcomes: [
    'Predict time & space complexity limits (`10^8 ops/sec` rule) before writing code',
    'Eliminate O(N²) loops via prefix sums, hashing, two pointers & sliding windows',
    'Solve monotonic Binary Search on indices and rotated arrays reliably',
    'Implement backtracking recursion, linked list reversal & monotonic stacks',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Time Complexity, Big-O & Constraints',
      topic: 'Asymptotic Analysis & Operation Budgets',
      estimatedTime: '2 Hours',
      summary:
        'Map input constraint `N` directly to allowable time complexity (`N <= 10^5 -> O(N log N)`, `N <= 20 -> O(2^N)`), and analyze nested/harmonic loops accurately.',
      studyMaterial: {
        overview:
          'Before coding in an OA or 1v1 duel, always read `N` constraints first! Modern judges execute ~`10^8` simple integer operations per second, instantly telling you whether an O(N²) solution passes (`N <= 3000`) or TLEs (`N = 10^5`).',
        keyPoints: [
          '`N <= 20` -> O(2^N) / bitmask; `N <= 500` -> O(N³); `N <= 5000` -> O(N²); `N <= 10^6` -> O(N) / O(N log N).',
          'Harmonic loop `for (i = 1..n) for (j = i; j <= n; j += i)` takes `N * (1 + 1/2 + 1/3 + ...)` = **O(N log N)**, NOT O(N²)!',
          'Dropping constants hides real overhead: hash collisions or `vector` reallocations still matter inside tight loops.',
        ],
        codeExamples: [
          {
            title: 'O(N log N) Harmonic Sieve Divisor Count',
            code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 10;
    vector<int> divs(n + 1, 0);
    for (int i = 1; i <= n; i++)
        for (int j = i; j <= n; j += i) divs[j]++;
    cout << divs[6] << " " << divs[10] << '\\n';
}`,
            explanation: 'Counts total divisors for every `1..N` in O(N log N) cleanly.',
          },
        ],
        cheatsheet: [
          '10^8 operations / 1 second judge budget',
          'N <= 10^5 -> requires O(N) or O(N log N)',
          'Divisor / Sieve harmonic sum -> O(N log N)',
        ],
        officialDocUrl: 'https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html',
      },
      video: yt(
        'Best Data Structures & Algorithms Course — Time & Space Complexity',
        'Kunal Kushwaha',
        'rZ41y93P2Qo',
        '1h 32m',
        'Watch the Big-O derivation, log rules, and space complexity breakdown.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 12, ops = 0;
    for (int i = 1; i <= n; i++)
        for (int j = i; j <= n; j += i) ops++;
    cout << "Harmonic Ops for N=12: " << ops << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'db-1-1',
          title: 'O(1) Gauss Arithmetic Series',
          difficulty: 'Easy',
          description: 'Replace an O(N) loop summing `1..1000000` with O(1) formula `n*(n+1)/2` -> 500000500000',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    long long n = 1000000;
    // TODO: Compute sum in O(1)
    return 0;
}`,
          expectedOutput: '500000500000',
          hints: ['`(n * (n + 1)) / 2` in 64-bit `long long`.'],
        },
        {
          id: 'db-1-2',
          title: 'Harmonic Sieve Divisor Precompute',
          difficulty: 'Medium',
          description: 'Using `for(i=1..20) for(j=i..20; j+=i)` print divisor count of `12`, `16`, and `19` -> 6 5 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> d(21, 0);
    // TODO: Fill divisor counts in O(N log N)
    return 0;
}`,
          expectedOutput: '6 5 2',
          hints: ['12 has {1,2,3,4,6,12} (6); 16 has 5; 19 is prime (2).'],
        },
        {
          id: 'db-1-3',
          title: 'Logarithmic Halving Steps Counter',
          difficulty: 'Easy',
          description: 'Count how many integer divisions by 2 (`n /= 2`) bring `n = 1048576` to `0` -> 21',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    long long n = 1048576;
    // TODO
    return 0;
}`,
          expectedOutput: '21',
          hints: ['`2^20` halves 20 times to reach 1, plus 1 final divide to hit 0 -> 21 steps.'],
        },
        {
          id: 'db-1-4',
          title: 'Count Pairs Without Nested O(N²) Loop',
          difficulty: 'Easy',
          description: 'Given counts of `0` (4) and `1` (5) in a binary array, compute `(0, 1)` unordered pairs in O(1) -> 20',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {0, 1, 0, 1, 1, 0, 1, 0, 1};
    // TODO: Count zeros and ones in O(N), multiply c0 * c1
    return 0;
}`,
          expectedOutput: '20',
          hints: ['Count total 0s (4) and total 1s (5) in one pass: `4 * 5 = 20`.'],
        },
        {
          id: 'db-1-5',
          title: 'Fast Sum of Squares Formula O(1)',
          difficulty: 'Easy',
          description: 'Compute `1^2 + 2^2 + ... + 100^2` in O(1) via `n*(n+1)*(2*n+1)/6` -> 338350',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    long long n = 100;
    // TODO
    return 0;
}`,
          expectedOutput: '338350',
          hints: ['`n * (n + 1) * (2 * n + 1) / 6`.'],
        },
        {
          id: 'db-1-6',
          title: 'Sieve of Eratosthenes Up to 50',
          difficulty: 'Medium',
          description: 'Mark composites in O(N log log N) up to `50` and print total count of primes -> 15',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 50;
    vector<bool> prime(n + 1, true);
    // TODO: Classic sieve starting multiples at i * i
    return 0;
}`,
          expectedOutput: '15',
          hints: ['Mark `prime[0] = prime[1] = false`; iterate `p = 2` while `p * p <= n`.'],
        },
        {
          id: 'db-1-7',
          title: 'Amortized Dynamic Vector Doubling Count',
          difficulty: 'Medium',
          description: 'Simulate capacity doubling starting at `cap=1`: push `100` items; how many resize copies happen (1+2+4+8+16+32+64)? Print final `cap` & total copied elements -> 128 127',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int cap = 1, sz = 0, copies = 0;
    // TODO: Simulate pushing 100 elements doubling cap when sz == cap
    return 0;
}`,
          expectedOutput: '128 127',
          hints: ['When `sz == cap`, add `sz` to `copies` and set `cap *= 2`.'],
        },
        {
          id: 'db-1-8',
          title: 'Space-Optimized Fibonacci (O(1) RAM)',
          difficulty: 'Easy',
          description: 'Compute `Fib(45)` without O(N) array storage in O(N) time and O(1) space -> 1134903170',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Rolling variables a=0, b=1
    return 0;
}`,
          expectedOutput: '1134903170',
          hints: ['Loop `i = 2..45` updating `long long c = a + b; a = b; b = c;`.'],
        },
        {
          id: 'db-1-9',
          title: 'Binary Exponentiation Power Iteration',
          difficulty: 'Medium',
          description: 'Compute `5^11` iteratively via O(log E) binary exponentiation -> 48828125',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    long long b = 5, e = 11, res = 1;
    // TODO: while (e > 0)
    return 0;
}`,
          expectedOutput: '48828125',
          hints: ['If `e & 1` multiply `res *= b`; square `b *= b`; shift `e >>= 1`.'],
        },
        {
          id: 'db-1-10',
          title: 'Check Constraints Budget Classifier',
          difficulty: 'Easy',
          description: 'Print required max complexity class for `N = 100000` (`NLOGN`) and `N = 20` (`EXP2`) -> NLOGN EXP2',
          starterCode: `#include <iostream>
using namespace std;

string classify(int n) {
    // TODO: n <= 20 -> "EXP2", n <= 3000 -> "N2", else "NLOGN"
    return "";
}
int main() {
    cout << classify(100000) << " " << classify(20) << '\\n';
}`,
          expectedOutput: 'NLOGN EXP2',
          hints: ['Check ascending thresholds `n <= 20`, `n <= 3000`, else `NLOGN`.'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'Arrays, Prefix Sums & Kadane’s Algorithm',
      topic: 'Prefix/Suffix Splits & Subarray Optima',
      estimatedTime: '3 Hours',
      summary:
        'Solve linear array challenges cleanly with prefix sums (`pref[r+1] - pref[l]`), circular/Kadane subarray bounds, and Buy & Sell Stock state tracking.',
      studyMaterial: {
        overview:
          'Arrays form the foundation of 60% of screening rounds. Precomputing a single `prefix` array upgrades repeated range sum queries from O(N) per query down to O(1)!',
        keyPoints: [
          'Always pad prefix array to `n + 1` with `pref[0] = 0` so `[l..r]` needs zero special-case checks for `l == 0`.',
          'Kadane maintains `curMax = max(x, curMax + x)`—works even when all elements are negative if seeded at `a[0]`.',
          'Sliding Stock profit tracks `minPriceSoFar` to update `maxProfit` in one pass.',
        ],
        codeExamples: [
          {
            title: 'Zero-Edge-Case Prefix Sum Query',
            code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {4, -2, 7, 1, 5}, p(6, 0);
    for (int i = 0; i < 5; i++) p[i + 1] = p[i] + a[i];
    cout << p[4] - p[1] << '\\n'; // sum [1..3] = -2+7+1 = 6
}`,
            explanation: '`p[r + 1] - p[l]` works uniformly whether `l == 0` or `l > 0`.',
          },
        ],
        cheatsheet: [
          'pref[i + 1] = pref[i] + a[i]',
          'cur = max(a[i], cur + a[i]); best = max(best, cur);',
          'Suffix right-to-left scan -> Leaders / Next Permutation',
        ],
        officialDocUrl: 'https://usaco.guide/silver/prefix-sums',
      },
      video: yt(
        'Algorithms & Data Structures Tutorial — Arrays & Complexity',
        'freeCodeCamp.org',
        '8hly31xKli0',
        '5h 22m',
        'Clean algorithmic breakdown of linear scans, prefix arrays, and merge routines.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> prices = {7, 1, 5, 3, 6, 4};
    int mn = prices[0], profit = 0;
    for (int p : prices) { mn = min(mn, p); profit = max(profit, p - mn); }
    cout << profit << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'db-2-1',
          title: 'Best Time to Buy & Sell Stock I',
          difficulty: 'Easy',
          description: 'Maximize single buy/sell profit on `{7, 1, 5, 3, 6, 4}` -> 5',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> p = {7, 1, 5, 3, 6, 4};
    // TODO
    return 0;
}`,
          expectedOutput: '5',
          hints: ['Buy at 1, sell at 6 -> profit 5.'],
        },
        {
          id: 'db-2-2',
          title: 'Maximum Subarray All-Negative Safe',
          difficulty: 'Medium',
          description: 'Find max non-empty subarray sum on `{-5, -2, -8, -1, -4}` -> -1',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {-5, -2, -8, -1, -4};
    // TODO: Seed cur = best = a[0] (NOT 0!)
    return 0;
}`,
          expectedOutput: '-1',
          hints: ['Never seed `best = 0` when all array items may be negative!'],
        },
        {
          id: 'db-2-3',
          title: 'Maximum Circular Subarray Sum',
          difficulty: 'Hard',
          description: 'Find max circular subarray sum on `{5, -3, 5}` (wraps around `5 + 5 = 10`) -> 10',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {5, -3, 5};
    // TODO: max(normalMaxKadane, totalSum - minSubarrayKadane) when normalMax > 0
    return 0;
}`,
          expectedOutput: '10',
          hints: ['Wrap-around max = total sum minus minimum contiguous subarray sum (`-3`).'],
        },
        {
          id: 'db-2-4',
          title: 'Array Leaders From Right to Left',
          difficulty: 'Easy',
          description: 'Elements strictly greater than all elements to their right in `{16, 17, 4, 3, 5, 2}` -> 17 5 2',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {16, 17, 4, 3, 5, 2};
    // TODO: Walk right-to-left maintaining running max, reverse output
    return 0;
}`,
          expectedOutput: '17 5 2',
          hints: ['Rightmost element (2) is always a leader; step left tracking `rightMax`.'],
        },
        {
          id: 'db-2-5',
          title: 'Longest Balanced 0/1 Subarray',
          difficulty: 'Medium',
          description: 'Convert `0 -> -1` in `{0, 1, 0, 0, 1, 1, 0}` and print longest subarray with equal 0s & 1s -> 6',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> a = {0, 1, 0, 0, 1, 1, 0};
    // TODO: Store FIRST index of each prefix sum (firstIdx[0] = -1)
    return 0;
}`,
          expectedOutput: '6',
          hints: ['Longest `[0..5]` or `[1..6]` both have length 6 with three 0s and three 1s.'],
        },
        {
          id: 'db-2-6',
          title: 'Maximum Product Subarray',
          difficulty: 'Medium',
          description: 'Find contiguous subarray with largest product in `{2, 3, -2, 4, -2}` -> 96',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 3, -2, 4, -2};
    // TODO: Maintain BOTH curMax and curMin because negatives flip sign
    return 0;
}`,
          expectedOutput: '96',
          hints: ['Whole array product `2*3*(-2)*4*(-2) = 96`! Track `{x, curMax*x, curMin*x}`.'],
        },
        {
          id: 'db-2-7',
          title: 'Next Greater Permutation Sequence',
          difficulty: 'Medium',
          description: 'Without calling `std::next_permutation`, compute next permutation of `{1, 5, 8, 4, 7, 6, 5, 3, 1}` -> 1 5 8 5 1 3 4 6 7',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {1, 5, 8, 4, 7, 6, 5, 3, 1};
    // TODO: Find rightmost dip a[i] < a[i+1], swap with smallest > a[i] on right, reverse suffix
    return 0;
}`,
          expectedOutput: '1 5 8 5 1 3 4 6 7',
          hints: ['Dip is at value 4 (index 3), swap with 5 (index 6), reverse `[4..end]`.'],
        },
        {
          id: 'db-2-8',
          title: 'Spiral Order Perimeter Row Trace',
          difficulty: 'Medium',
          description: 'Traverse `{{1,2,3},{4,5,6},{7,8,9}}` in clockwise spiral order -> 1 2 3 6 9 8 7 4 5',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> m = {{1,2,3},{4,5,6},{7,8,9}};
    // TODO: Maintain top, bottom, left, right boundaries
    return 0;
}`,
          expectedOutput: '1 2 3 6 9 8 7 4 5',
          hints: ['Guard bottom-to-top and right-to-left passes with `if (top <= bottom)` / `if (left <= right)`.'],
        },
        {
          id: 'db-2-9',
          title: 'First Missing Positive in O(N) Time & O(1) Space',
          difficulty: 'Hard',
          description: 'Find smallest missing positive integer in `{3, 4, -1, 1}` via cyclic placement -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {3, 4, -1, 1};
    // TODO: Swap positive val in [1..n] to slot val-1 while a[val-1] != val
    return 0;
}`,
          expectedOutput: '2',
          hints: ['After cyclic sort: `[1, -1, 3, 4]` -> index 1 holds `-1 != 2`, answer `2`.'],
        },
        {
          id: 'db-2-10',
          title: 'Merge Intervals Sorted Total Merged Span',
          difficulty: 'Medium',
          description: 'Merge `{{1,4},{0,2},{3,5},{7,9}}` and print merged `[start,end]` pairs -> [0,5] [7,9]',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> iv = {{1,4},{0,2},{3,5},{7,9}};
    // TODO: Sort ascending, merge when next.first <= res.back().second
    return 0;
}`,
          expectedOutput: '[0,5] [7,9]',
          hints: ['Must sort intervals by start time FIRST before sweeping!'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Hashing, Frequency Maps & Subarray Parity',
      topic: 'Hash Tables, Prefix-XOR & Anagram Fingerprints',
      estimatedTime: '2.5 Hours',
      summary:
        'Turn O(N²) nested scans into O(N) hash table lookups: Prefix Sum + HashMap (`sum - k`), Prefix XOR counts, and isomorphic character mappings.',
      studyMaterial: {
        overview:
          'Whenever you ask "does an earlier prefix state exist such that `current - earlier == k`?", store `earlier` counts in a hash map! This pattern unlocks Subarray Sum K, Subarray Divisible by K, and Subarray XOR K.',
        keyPoints: [
          'Always initialize `prefixCount[0] = 1` so subarrays starting cleanly at index `0` get counted.',
          'Subarrays divisible by `K`: normalize negative remainders `rem = ((sum % K) + K) % K`.',
          'XOR inverse of `+` / `-` is simply `^` itself (`prefXor ^ k`)!',
        ],
        codeExamples: [
          {
            title: 'Prefix XOR Equals K Subarray Counter',
            code: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> a = {4, 2, 2, 6, 4};
    int k = 6, xr = 0, ans = 0;
    unordered_map<int, int> cnt{{0, 1}};
    for (int x : a) { xr ^= x; ans += cnt[xr ^ k]; cnt[xr]++; }
    cout << ans << '\\n';
}`,
            explanation: 'Counts all 4 subarrays with XOR `6` in strict O(N).',
          },
        ],
        cheatsheet: [
          'mp[0] = 1 before prefix loop!',
          'Target sum K -> lookup (sum - k)',
          'Target XOR K -> lookup (xr ^ k)',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/container/unordered_map',
      },
      video: yt(
        'Data Structures Easy to Advanced — Hash Tables',
        'freeCodeCamp.org',
        'RBSGKlAvoiM',
        '8h 03m',
        'Explains hashing, load factors, collision resolution, and O(1) dictionary lookups.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> a = {4, 5, 0, -2, -3, 1};
    int K = 5, sum = 0, ans = 0;
    unordered_map<int, int> mp{{0, 1}};
    for (int x : a) {
        sum = ((sum + x) % K + K) % K;
        ans += mp[sum]++;
    }
    cout << ans << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'db-3-1',
          title: 'Subarray Sums Divisible by K',
          difficulty: 'Medium',
          description: 'Count subarrays divisible by `K = 5` in `{4, 5, 0, -2, -3, 1}` -> 7',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> a = {4, 5, 0, -2, -3, 1}; int K = 5;
    // TODO: Normalize negative remainders ((sum % K) + K) % K
    return 0;
}`,
          expectedOutput: '7',
          hints: ['Two prefixes sharing the same modulo `K` remainder define a divisible middle slice.'],
        },
        {
          id: 'db-3-2',
          title: 'Count Subarrays With XOR Equals K',
          difficulty: 'Medium',
          description: 'Count subarrays in `{4, 2, 2, 6, 4}` whose XOR equals `6` -> 4',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> a = {4, 2, 2, 6, 4}; int k = 6;
    // TODO
    return 0;
}`,
          expectedOutput: '4',
          hints: ['Look up `mp[xr ^ k]` before `mp[xr]++`.'],
        },
        {
          id: 'db-3-3',
          title: 'Group Anagrams Bucket Count',
          difficulty: 'Medium',
          description: 'Group `{"eat","tea","tan","ate","nat","bat"}` into anagram classes and print number of groups -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

int main() {
    vector<string> w = {"eat","tea","tan","ate","nat","bat"};
    // TODO: Sort word copy as canonical map key
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Buckets: `{eat,tea,ate}`, `{tan,nat}`, `{bat}` -> size 3.'],
        },
        {
          id: 'db-3-4',
          title: 'Isomorphic Strings Check',
          difficulty: 'Easy',
          description: 'Check `("egg","add")` and `("foo","bar")` for structural isomorphism -> 1 0',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

bool iso(const string& a, const string& b) {
    // TODO: Track last seen position [256] arrays
    return false;
}
int main() {
    cout << iso("egg", "add") << " " << iso("foo", "bar") << '\\n';
}`,
          expectedOutput: '1 0',
          hints: ['Verify `m1[a[i]] == m2[b[i]]`, then set both to `i + 1`.'],
        },
        {
          id: 'db-3-5',
          title: 'Contains Duplicate Within Distance K',
          difficulty: 'Easy',
          description: 'Check `{1, 2, 3, 1}` with `k = 3` and `{1, 2, 3, 1, 2, 3}` with `k = 2` -> 1 0',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

bool hasDup(const vector<int>& a, int k) {
    // TODO: Sliding window HashSet of size <= k
    return false;
}
int main() {
    cout << hasDup({1,2,3,1}, 3) << " " << hasDup({1,2,3,1,2,3}, 2) << '\\n';
}`,
          expectedOutput: '1 0',
          hints: ['Erase `a[i - k - 1]` when `i > k` cleanly.'],
        },
        {
          id: 'db-3-6',
          title: 'Longest Palindrome Buildable From Letters',
          difficulty: 'Easy',
          description: 'Compute max palindrome length buildable from letters of `"abccccdd"` -> 7',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "abccccdd";
    // TODO: Count char frequencies; sum floor-even parts + 1 if any odd frequency exists
    return 0;
}`,
          expectedOutput: '7',
          hints: ['`dccaccd` uses all 4 c, 2 d, and 1 center char -> length 7.'],
        },
        {
          id: 'db-3-7',
          title: '4Sum II Four-Array Zero Tuples',
          difficulty: 'Medium',
          description: 'Given `A={1,2}`, `B={-2,-1}`, `C={-1,2}`, `D={0,2}`, count `(i,j,k,l)` summing to 0 in O(N²) -> 2',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> A={1,2}, B={-2,-1}, C={-1,2}, D={0,2};
    // TODO: Store all (a + b) pair sums in map, query -(c + d)
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Splits O(N⁴) neatly down to O(N²)!'],
        },
        {
          id: 'db-3-8',
          title: 'Two Strings Share Any Common Substring',
          difficulty: 'Easy',
          description: 'Check if `("hello","world")` and `("hi","bye")` share at least one common character -> YES NO',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

string share(const string& a, const string& b) {
    // TODO: 26-bit mask check
    return "";
}
int main() {
    cout << share("hello", "world") << " " << share("hi", "bye") << '\\n';
}`,
          expectedOutput: 'YES NO',
          hints: ['A common substring of length >= 1 exists iff the two strings share >= 1 single character (`(m1 & m2) != 0`).'],
        },
        {
          id: 'db-3-9',
          title: 'Minimum Index Sum of Two Lists',
          difficulty: 'Easy',
          description: 'Common item in `{"a","b","c"}` and `{"c","a","d"}` with smallest `i + j` -> a',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<string> l1 = {"a","b","c"}, l2 = {"c","a","d"};
    // TODO
    return 0;
}`,
          expectedOutput: 'a',
          hints: ['"a" has 0+1 = 1, "c" has 2+0 = 2 -> "a" wins.'],
        },
        {
          id: 'db-3-10',
          title: 'Count Nice Subarrays (Exact K Odds)',
          difficulty: 'Medium',
          description: 'Count subarrays in `{1, 1, 2, 1, 1}` containing exact `k = 3` odd integers -> 2',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> a = {1, 1, 2, 1, 1}; int k = 3;
    // TODO: Convert each element to x & 1, prefix sum == k via HashMap
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Map every odd element to 1 and even element to 0 -> reduces directly to Subarray Sum == K!'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Two Pointers & Sliding Window Patterns',
      topic: 'Inward Pointers, AtMost-K & Permutation Match',
      estimatedTime: '3 Hours',
      summary:
        'Convert nested pair/substring searches to clean O(N) linear passes using converging two pointers and `atMost(K) - atMost(K - 1)` windows.',
      studyMaterial: {
        overview:
          'Sliding window shines on contiguous substrings/subarrays; converging two pointers (`l = 0, r = n - 1`) shine on sorted arrays. When exact `K` distinct count is hard because shrink direction is non-monotonic, use `exact(K) = atMost(K) - atMost(K - 1)`.',
        keyPoints: [
          '`exactK(a, k) = atMost(a, k) - atMost(a, k - 1)` is clean, bug-free, and works on positive arrays.',
          'Check Permutation/Anagram in String in O(N) by comparing two fixed `int[26]` arrays (`matches == 26` or direct vector equality).',
        ],
        codeExamples: [
          {
            title: 'Anagram Window Scan in O(N)',
            code: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    string s = "cbaebabacd", p = "abc";
    vector<int> fp(26, 0), fs(26, 0);
    for (char c : p) fp[c - 'a']++;
    int cnt = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        fs[s[i] - 'a']++;
        if (i >= (int)p.size()) fs[s[i - p.size()] - 'a']--;
        if (fs == fp) cnt++;
    }
    cout << cnt << '\\n';
}`,
            explanation: 'Finds both anagram windows `"cba"` and `"bac"` in strict O(26 * N) time.',
          },
        ],
        cheatsheet: [
          'Window size fixed K: evict index (i - k) once i >= k',
          'Exact(K distinct) = AtMost(K) - AtMost(K - 1)',
        ],
        officialDocUrl: 'https://usaco.guide/silver/two-pointers',
      },
      video: yt(
        'NeetCode 150 Sliding Window & Two Pointers Core',
        'freeCodeCamp.org',
        'T0u5nwSA0w0',
        '9h 40m',
        'Watch the Two Pointers & Sliding Window modules covering Container With Most Water and Minimum Window.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 2, 3, 4, 6}; int t = 6;
    int l = 0, r = 4;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == t) { cout << l << " " << r << '\\n'; break; }
        if (s < t) l++; else r--;
    }
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'db-4-1',
          title: 'Two Sum II (Sorted Input)',
          difficulty: 'Easy',
          description: 'Find 1-based indices adding to `9` in `{2, 7, 11, 15}` in O(1) extra space -> 1 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 7, 11, 15}; int target = 9;
    // TODO
    return 0;
}`,
          expectedOutput: '1 2',
          hints: ['Two pointers `l=0, r=n-1`; add 1 when printing.'],
        },
        {
          id: 'db-4-2',
          title: 'Remove Duplicates From Sorted Array',
          difficulty: 'Easy',
          description: 'Compact `{0, 0, 1, 1, 1, 2, 2, 3, 3, 4}` in-place and print unique count -> 5',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {0, 0, 1, 1, 1, 2, 2, 3, 3, 4};
    // TODO: Maintain slow write pointer w
    return 0;
}`,
          expectedOutput: '5',
          hints: ['Compare `a[i] != a[w - 1]` and write at `a[w++]`.'],
        },
        {
          id: 'db-4-3',
          title: 'Squares of Sorted Array in O(N)',
          difficulty: 'Easy',
          description: 'Square `{-7, -3, 2, 3, 11}` and produce sorted array in single two-pointer pass -> 4 9 9 49 121',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {-7, -3, 2, 3, 11};
    // TODO: Fill answer array from tail (pos = n - 1 down to 0)
    return 0;
}`,
          expectedOutput: '4 9 9 49 121',
          hints: ['Largest squares always sit at extreme left or extreme right (`abs(a[l])` vs `abs(a[r])`).'],
        },
        {
          id: 'db-4-4',
          title: 'Count All Anagram Substrings',
          difficulty: 'Medium',
          description: 'Count substrings of `"abab"` matching anagrams of `"ab"` -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    string s = "abab", p = "ab";
    // TODO: Fixed window frequency comparison
    return 0;
}`,
          expectedOutput: '3',
          hints: ['`"ab"`, `"ba"`, `"ab"` -> 3 occurrences.'],
        },
        {
          id: 'db-4-5',
          title: 'Minimum Window Substring Length',
          difficulty: 'Hard',
          description: 'Find smallest substring of `"ADOBECODEBANC"` containing all letters of `"ABC"` -> BANC',
          starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s = "ADOBECODEBANC", t = "ABC";
    // TODO: Expand r tracking have == need, shrink l while still valid
    return 0;
}`,
          expectedOutput: 'BANC',
          hints: ['Track `bestLen` & `bestStart` while contracting `l` as tightly as possible.'],
        },
        {
          id: 'db-4-6',
          title: 'Max Average Subarray of Length K',
          difficulty: 'Easy',
          description: 'Max average across length-4 windows of `{1, 12, -5, -6, 50, 3}` formatted `.2f` -> 12.75',
          starterCode: `#include <iostream>
#include <iomanip>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 12, -5, -6, 50, 3}; int k = 4;
    // TODO
    return 0;
}`,
          expectedOutput: '12.75',
          hints: ['`(12 - 5 - 6 + 50) / 4.0 = 51 / 4 = 12.75`.'],
        },
        {
          id: 'db-4-7',
          title: 'Longest Subarray At Most K Distinct',
          difficulty: 'Medium',
          description: 'Max length substring of `"eceba"` with `<= 2` distinct chars -> 3',
          starterCode: `#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

int main() {
    string s = "eceba"; int k = 2;
    // TODO
    return 0;
}`,
          expectedOutput: '3',
          hints: ['`"ece"` has length 3 with 2 distinct chars (`e`, `c`).'],
        },
        {
          id: 'db-4-8',
          title: 'Subarrays With Exact K Distinct Integers',
          difficulty: 'Hard',
          description: 'Count subarrays of `{1, 2, 1, 2, 3}` having exact `2` distinct values using `atMost(2) - atMost(1)` -> 7',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> a = {1, 2, 1, 2, 3}; int k = 2;
    // TODO: Helper atMost(a, k)
    return 0;
}`,
          expectedOutput: '7',
          hints: ['`atMost(a, k)` adds `r - l + 1` per valid right step; subtract `atMost(a, k - 1)`.'],
        },
        {
          id: 'db-4-9',
          title: 'Valid Palindrome After At Most 1 Deletion',
          difficulty: 'Medium',
          description: 'Test `"abca"` and `"abc"` allowing at most 1 char skip -> 1 0',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

bool validPal2(const string& s) {
    // TODO: On first mismatch s[l] != s[r], check pal(l+1, r) || pal(l, r-1)
    return false;
}
int main() {
    cout << validPal2("abca") << " " << validPal2("abc") << '\\n';
}`,
          expectedOutput: '1 0',
          hints: ['`"abca"` becomes `"aba"` or `"aca"` when skipping 1 mismatch!'],
        },
        {
          id: 'db-4-10',
          title: 'Boats to Save People (Greedy Two Pointers)',
          difficulty: 'Medium',
          description: 'Weights `{3, 2, 2, 1}`, boat limit `3` (max 2 people per boat) -> min boats: 3',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> w = {3, 2, 2, 1}; int limit = 3;
    // TODO: Sort, pair lightest l with heaviest r if w[l]+w[r] <= limit
    return 0;
}`,
          expectedOutput: '3',
          hints: ['`(3)`, `(2, 1)`, `(2)` -> 3 boats total.'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'Binary Search Mastery & Lower/Upper Bounds',
      topic: 'Exact Search, Rotated Arrays & Matrix Search',
      estimatedTime: '2.5 Hours',
      summary:
        'Eliminate infinite-loop Binary Search bugs once and for all! Master first/last occurrence, peak mountain element, rotated arrays, and 2D staircase search.',
      studyMaterial: {
        overview:
          'Binary search works on **any** predicate that exhibits a crisp monotonic split `[True..True, False..False]` or `[False..False, True..True]`. Storing `ans = mid` before tightening `lo` or `hi` avoids subtle off-by-one boundary bugs.',
        keyPoints: [
          'First index where condition holds -> save `ans = mid; hi = mid - 1;` (push LEFT).',
          'Last index where condition holds -> save `ans = mid; lo = mid + 1;` (push RIGHT).',
          'Peak in unimodal mountain: compare `a[mid] < a[mid + 1]` to step toward upward slope cleanly.',
        ],
        codeExamples: [
          {
            title: 'Unimodal Peak Element Finder',
            code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 3, 7, 12, 9, 4};
    int lo = 0, hi = (int)a.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < a[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    cout << "Peak idx=" << lo << " val=" << a[lo] << '\\n';
}`,
            explanation: 'Converges strictly to index `3` (`12`) in O(log N).',
          },
        ],
        cheatsheet: [
          'mid = lo + (hi - lo) / 2',
          'First >= x -> lower_bound | First > x -> upper_bound',
        ],
        officialDocUrl: 'https://usaco.guide/silver/binary-search',
      },
      video: yt(
        'DSA Binary Search Full Intuition & Patterns',
        'Kunal Kushwaha',
        'rZ41y93P2Qo',
        '1h 32m',
        'Master search space halving, floor/ceiling queries, and rotated sorted arrays.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {5, 7, 7, 8, 8, 10}; int t = 8;
    int first = lower_bound(a.begin(), a.end(), t) - a.begin();
    int last = upper_bound(a.begin(), a.end(), t) - a.begin() - 1;
    cout << first << " " << last << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'db-5-1',
          title: 'First & Last Occurrence of Target',
          difficulty: 'Medium',
          description: 'Without STL `lower_bound`, find `[first, last]` indices of `8` in `{5, 7, 7, 8, 8, 10}` -> 3 4',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {5, 7, 7, 8, 8, 10}; int target = 8;
    // TODO: Write manual binary search helper findBound(a, target, isFirst)
    return 0;
}`,
          expectedOutput: '3 4',
          hints: ['On `a[mid] == target`, save `ans = mid` and set `hi = mid - 1` (first) or `lo = mid + 1` (last).'],
        },
        {
          id: 'db-5-2',
          title: 'Find Minimum in Rotated Sorted Array',
          difficulty: 'Medium',
          description: 'Find smallest value in `{4, 5, 6, 7, 0, 1, 2}` in O(log N) -> 0',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {4, 5, 6, 7, 0, 1, 2};
    // TODO: Compare a[mid] with a[hi] inside while (lo < hi)
    return 0;
}`,
          expectedOutput: '0',
          hints: ['If `a[mid] > a[hi]`, pivot lies strictly to the right (`lo = mid + 1`), else `hi = mid`.'],
        },
        {
          id: 'db-5-3',
          title: 'Search a 2D Sorted Matrix O(log(R*C))',
          difficulty: 'Medium',
          description: 'Treat flattened 3x4 row-sorted matrix `{{1,3,5,7},{10,11,16,20},{23,30,34,60}}` as 1D array to find `16` -> (1, 2)',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> m = {{1,3,5,7},{10,11,16,20},{23,30,34,60}};
    int target = 16;
    // TODO: Map mid -> m[mid / C][mid % C]
    return 0;
}`,
          expectedOutput: '(1, 2)',
          hints: ['`mid / C` is row index and `mid % C` is column index!'],
        },
        {
          id: 'db-5-4',
          title: 'Peak Index in Mountain Array',
          difficulty: 'Easy',
          description: 'Find peak index in `{0, 2, 10, 5, 2}` -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {0, 2, 10, 5, 2};
    // TODO: while (lo < hi)
    return 0;
}`,
          expectedOutput: '2',
          hints: ['If `a[mid] < a[mid + 1]`, peak lies right (`lo = mid + 1`), else `hi = mid`.'],
        },
        {
          id: 'db-5-5',
          title: 'Single Element in Sorted Pairs Array',
          difficulty: 'Medium',
          description: 'In `{1, 1, 2, 3, 3, 4, 4, 8, 8}`, every item appears twice except one. Find it in O(log N) -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 1, 2, 3, 3, 4, 4, 8, 8};
    // TODO: Force mid even (mid & ~1) or XOR mid ^ 1 parity trick!
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Before the single element, pairs start at EVEN index `(mid ^ 1)` matches `a[mid]`.'],
        },
        {
          id: 'db-5-6',
          title: 'Search Insert Position',
          difficulty: 'Easy',
          description: 'Print index where `5` and `7` would be inserted into `{1, 3, 5, 6}` -> 2 4',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 3, 5, 6};
    // TODO: Binary search first index >= target
    return 0;
}`,
          expectedOutput: '2 4',
          hints: ['Initialize `hi = a.size()` when searching insertion index at tail!'],
        },
        {
          id: 'db-5-7',
          title: 'Capacity to Ship Packages Within D Days',
          difficulty: 'Medium',
          description: 'Weights `{1,2,3,4,5,6,7,8,9,10}`, `days = 5`. Find minimum ship capacity via Binary Search on Answer -> 15',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> w = {1,2,3,4,5,6,7,8,9,10}; int days = 5;
    // TODO: Search capacity in [10..55]
    return 0;
}`,
          expectedOutput: '15',
          hints: ['Day batches of cap 15: `(1..5), (6,7), (8), (9), (10)` -> exact 5 days!'],
        },
        {
          id: 'db-5-8',
          title: 'Find Kth Missing Positive Integer',
          difficulty: 'Medium',
          description: 'Find the `5`th missing positive integer after `{2, 3, 4, 7, 11}` -> 9',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 3, 4, 7, 11}; int k = 5;
    // TODO: Missing count before index i equals a[i] - (i + 1)
    return 0;
}`,
          expectedOutput: '9',
          hints: ['Binary search first `i` where `a[i] - (i + 1) >= k`; answer is `lo + k`.'],
        },
        {
          id: 'db-5-9',
          title: 'Floor & Ceiling in Sorted Array',
          difficulty: 'Easy',
          description: 'For `{3, 6, 9, 14}` and query `10`, print floor and ceiling (`-1` if absent) -> 9 14',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {3, 6, 9, 14}; int q = 10;
    // TODO
    return 0;
}`,
          expectedOutput: '9 14',
          hints: ['Floor = largest `<= q`; Ceiling = smallest `>= q`.'],
        },
        {
          id: 'db-5-10',
          title: 'Count Pairs With Sum < Target (Sorted + Two Pointers)',
          difficulty: 'Easy',
          description: 'Count `(i < j)` pairs in sorted `{-1, 1, 2, 3, 5}` with `a[i] + a[j] < 4` -> 4',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {-1, 1, 2, 3, 5}; int t = 4;
    // TODO: Two pointers counting (r - l) whenever a[l] + a[r] < t
    return 0;
}`,
          expectedOutput: '4',
          hints: ['Pairs `< 4`: `(-1,1), (-1,2), (-1,3), (1,2)` -> total 4 pairs.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'Recursion & Backtracking Permutations',
      topic: 'Subsets, N-Queens, CombSum & Pruning',
      estimatedTime: '3.5 Hours',
      summary:
        'Design clean **Choose -> Explore -> Unchoose** backtracking trees for subsets, combinations, permutations, word search, and N-Queens.',
      studyMaterial: {
        overview:
          'Backtracking explores a decision tree recursively and undoes its choice (`pop_back()`, `used[i] = false`) right after returning from the child call—keeping memory flat across branches.',
        keyPoints: [
          'Always follow the 3-step template: **Pick candidate -> Recurse deeper -> Undo candidate**.',
          'Sort input first and skip `if (i > start && a[i] == a[i - 1]) continue;` to eliminate duplicate combinations cleanly.',
          'Prune dead branches early (`if (remain < 0) return;`) to keep exponential trees tiny.',
        ],
        codeExamples: [
          {
            title: 'Combination Sum Backtracking Core',
            code: `#include <iostream>
#include <vector>
using namespace std;

void dfs(int i, int rem, const vector<int>& c, int& ways) {
    if (rem == 0) { ways++; return; }
    for (int j = i; j < (int)c.size(); j++) {
        if (c[j] <= rem) dfs(j, rem - c[j], c, ways);
    }
}
int main() {
    int ways = 0;
    dfs(0, 7, {2, 3, 6, 7}, ways);
    cout << ways << '\\n';
}`,
            explanation: 'Counts `[2,2,3]` and `[7]` -> `2` cleanly with zero duplicate permutations.',
          },
        ],
        cheatsheet: [
          'Subsets / Combinations: pass start index `i` (or `i + 1`)',
          'Permutations: use `bool used[n]` array',
          'Duplicate pruning: sort first + skip equal adjacent at same recursion level',
        ],
        officialDocUrl: 'https://www.geeksforgeeks.org/backtracking-algorithms/',
      },
      video: yt(
        'Introduction to Recursion & Backtracking Trees',
        'Kunal Kushwaha',
        'M2uO2nMT0Bk',
        '1h 15m',
        'Visualizes recursion tree state, base cases, and Choose-Explore-Undo.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
using namespace std;

void perm(int idx, vector<int>& a, int& cnt) {
    if (idx == (int)a.size()) { cnt++; return; }
    for (int i = idx; i < (int)a.size(); i++) {
        swap(a[idx], a[i]);
        perm(idx + 1, a, cnt);
        swap(a[idx], a[i]);
    }
}
int main() {
    vector<int> a = {1, 2, 3, 4}; int cnt = 0;
    perm(0, a, cnt);
    cout << cnt << '\\n';
}`,
      practiceQuestions: [
        {
          id: 'db-6-1',
          title: 'Generate Valid Balanced Parentheses Count',
          difficulty: 'Medium',
          description: 'Using recursion (`open < n`, `close < open`), print all well-formed parentheses for `n = 3` count -> 5',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

void gen(int open, int close, int n, int& cnt) {
    // TODO
}
int main() {
    int cnt = 0; gen(0, 0, 3, cnt); cout << cnt << '\\n';
}`,
          expectedOutput: '5',
          hints: ['Catalan number C_3 = 5: add `(` while `open < n` and `)` while `close < open`.'],
        },
        {
          id: 'db-6-2',
          title: 'Combination Sum Distinct Sets',
          difficulty: 'Medium',
          description: 'Count unique combinations from `{2, 3, 5}` (unlimited reuse) summing to `8` -> 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

// TODO: Backtrack keeping candidate index j >= i
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '3',
          hints: ['`[2,2,2,2]`, `[2,3,3]`, `[3,5]` -> 3 ways.'],
        },
        {
          id: 'db-6-3',
          title: 'Subsets II (Unique Subsets With Duplicates)',
          difficulty: 'Medium',
          description: 'Count unique subsets of `{1, 2, 2}` -> 6',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// TODO: Sort first, skip if (i > start && a[i] == a[i-1]) continue;
int main() {
    vector<int> a = {1, 2, 2};
    // TODO
    return 0;
}`,
          expectedOutput: '6',
          hints: ['Unique subsets: `[], [1], [2], [1,2], [2,2], [1,2,2]` = 6.'],
        },
        {
          id: 'db-6-4',
          title: 'Permutations Count & Lex Order Check',
          difficulty: 'Medium',
          description: 'Generate permutations of `{1, 2, 3}` via swap backtracking and print count -> 6',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

// TODO
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '6',
          hints: ['Swap `a[idx]` with `a[i]`, recurse `idx + 1`, then swap back!'],
        },
        {
          id: 'db-6-5',
          title: 'N-Queens Solutions Counter (N=4 & N=5)',
          difficulty: 'Hard',
          description: 'Count valid N-Queens board placements for `N = 4` and `N = 5` using column/diagonal boolean guards -> 2 10',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int queens(int n) {
    // TODO: Track col[n], diag1[2n], diag2[2n]
    return 0;
}
int main() {
    cout << queens(4) << " " << queens(5) << '\\n';
}`,
          expectedOutput: '2 10',
          hints: ['Diagonals are uniquely identified by `(r + c)` and `(r - c + n)`.'],
        },
        {
          id: 'db-6-6',
          title: 'Letter Combinations of Phone Digits',
          difficulty: 'Medium',
          description: 'Count letter strings formed by phone digits `"23"` (`2="abc", 3="def"`) -> 9',
          starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

// TODO: Backtrack across digit string "23"
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '9',
          hints: ['3 letters * 3 letters = 9 strings.'],
        },
        {
          id: 'db-6-7',
          title: 'Word Search in 2D Char Grid',
          difficulty: 'Medium',
          description: 'Verify `"ABCCED"` exists horizontally/vertically (no cell reuse) in `{"ABCE","SFCS","ADEE"}` -> 1',
          starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<string> b = {"ABCE","SFCS","ADEE"};
    string word = "ABCCED";
    // TODO: Mark cell '#' while exploring 4 neighbors, restore char on backtrack
    return 0;
}`,
          expectedOutput: '1',
          hints: ['Try every cell matching `word[0]` as root; remember to restore `b[r][c]` on exit!'],
        },
        {
          id: 'db-6-8',
          title: 'Palindrome Partitioning Count',
          difficulty: 'Medium',
          description: 'Count ways to partition `"aab"` so every piece is a palindrome (`["a","a","b"]` and `["aa","b"]`) -> 2',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO
int main() {
    string s = "aab";
    // TODO
    return 0;
}`,
          expectedOutput: '2',
          hints: ['For index `start`, try every `end >= start` where `s[start..end]` is palindrome and recurse on `end + 1`.'],
        },
        {
          id: 'db-6-9',
          title: 'Rat in a Maze Path Count (3x3)',
          difficulty: 'Medium',
          description: 'Count simple paths `(0,0) -> (2,2)` (4-dir, no revisit) on `{{1,1,1},{1,0,1},{1,1,1}}` -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> m = {{1,1,1},{1,0,1},{1,1,1}};
    // TODO: Count all simple paths from (0,0) to (2,2) where 1 is open
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Two perimeter paths around the center obstacle `(1,1)` exist: top-right and left-bottom.'],
        },
        {
          id: 'db-6-10',
          title: 'Subset Sum K Decision Recursion',
          difficulty: 'Easy',
          description: 'Check recursively whether any subset of `{3, 34, 4, 12, 5, 2}` sums to `9` -> 1',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

bool canSum(const vector<int>& a, int i, int rem) {
    // TODO
    return false;
}
int main() {
    cout << canSum({3, 34, 4, 12, 5, 2}, 0, 9) << '\\n';
}`,
          expectedOutput: '1',
          hints: ['`4 + 5 = 9` -> true (`1`).'],
        },
      ],
    },
    {
      stepNumber: 7,
      title: 'Linked Lists, Stacks & Queues',
      topic: 'Dummy Heads, Fast-Slow Pointers & In-Place Reversal',
      estimatedTime: '3 Hours',
      summary:
        'Master in-place pointer rewiring (`prev / cur / nxt`), Floyd’s Tortoise-and-Hare midpoint/cycle detection, dummy sentinel nodes, and stack/queue simulations.',
      studyMaterial: {
        overview:
          'Linked List bugs almost always come from losing `cur->next` before rewiring pointers or forgetting special cases on `head == nullptr`. Using a **Dummy Sentinel Node** eliminates 90% of head edge cases cleanly!',
        keyPoints: [
          'Dummy head `ListNode dummy(0, head);` makes list insertion/merge/deletion uniform even at index 0.',
          'Fast (`2x`) & Slow (`1x`) pointers find the middle node or detect cycles in O(N) time and O(1) space.',
          '3-pointer iterative list reversal (`prev`, `cur`, `nxt`) is mandatory muscle memory.',
        ],
        codeExamples: [
          {
            title: '3-Pointer Iterative Linked List Reversal',
            code: `#include <iostream>
using namespace std;

struct Node { int v; Node* next; };
int main() {
    Node c{3, nullptr}, b{2, &c}, a{1, &b};
    Node *prev = nullptr, *cur = &a;
    while (cur) { Node* nxt = cur->next; cur->next = prev; prev = cur; cur = nxt; }
    for (Node* p = prev; p; p = p->next) cout << p->v << " ";
}`,
            explanation: 'Reverses `1 -> 2 -> 3` in-place into `3 2 1`.',
          },
        ],
        cheatsheet: [
          'Dummy sentinel: ListNode dummy(0); return dummy.next;',
          'Slow (+1) & Fast (+2) -> midpoint & Floyd cycle check',
          'Reversal: nxt = cur->next; cur->next = prev; prev = cur; cur = nxt;',
        ],
        officialDocUrl: 'https://www.geeksforgeeks.org/data-structures/linked-list/',
      },
      video: yt(
        'Algorithms & Data Structures — Linked Lists, Stacks & Queues',
        'freeCodeCamp.org',
        'RBSGKlAvoiM',
        '8h 03m',
        'Full walkthrough of singly/doubly linked lists, stack push/pop invariants, and circular queues.',
      ),
      compilerStarterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node* next; };
int main() {
    Node d{4, nullptr}, c{3, &d}, b{2, &c}, a{1, &b};
    Node *slow = &a, *fast = &a;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    cout << "Middle: " << slow->v << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'db-7-1',
          title: 'Reverse Singly Linked List In-Place',
          difficulty: 'Easy',
          description: 'Reverse `1 -> 2 -> 3 -> 4` iteratively and print values -> 4 3 2 1',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node* next; };
int main() {
    Node n4{4,nullptr}, n3{3,&n4}, n2{2,&n3}, n1{1,&n2};
    // TODO: Iterative prev/cur/nxt reversal starting at &n1
    return 0;
}`,
          expectedOutput: '4 3 2 1',
          hints: ['Always save `nxt = cur->next` BEFORE reassigning `cur->next = prev`.'],
        },
        {
          id: 'db-7-2',
          title: 'Find Linked List Middle (Tortoise & Hare)',
          difficulty: 'Easy',
          description: 'Find middle node value of `10 -> 20 -> 30 -> 40 -> 50` using slow/fast pointers -> 30',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node* next; };
int main() {
    Node e{50,nullptr}, d{40,&e}, c{30,&d}, b{20,&c}, a{10,&b};
    // TODO: Move slow 1 step, fast 2 steps while fast && fast->next
    return 0;
}`,
          expectedOutput: '30',
          hints: ['When `fast` reaches the end, `slow` sits cleanly at the center!'],
        },
        {
          id: 'db-7-3',
          title: 'Detect Cycle & Entry Value (Floyd Cycle)',
          difficulty: 'Medium',
          description: 'Link `1 -> 2 -> 3 -> 4 -> back to 2`. Detect cycle and find entry node value (`2`) in O(1) space -> 2',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node* next; };
int main() {
    Node n4{4,nullptr}, n3{3,&n4}, n2{2,&n3}, n1{1,&n2};
    n4.next = &n2; // Cycle entry at n2
    // TODO: Phase 1 meet slow==fast; Phase 2 reset slow=&n1 and advance both +1 until equal
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Phase 2 meeting point is mathematically guaranteed to be the cycle entrance!'],
        },
        {
          id: 'db-7-4',
          title: 'Merge Two Sorted Linked Lists',
          difficulty: 'Easy',
          description: 'Merge `1 -> 3 -> 5` and `2 -> 4 -> 6` using a dummy sentinel node -> 1 2 3 4 5 6',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node* next; };
int main() {
    Node a3{5,nullptr}, a2{3,&a3}, a1{1,&a2};
    Node b3{6,nullptr}, b2{4,&b3}, b1{2,&b2};
    // TODO: Dummy node tail splicing
    return 0;
}`,
          expectedOutput: '1 2 3 4 5 6',
          hints: ['`Node dummy{0, nullptr}; Node* tail = &dummy;`'],
        },
        {
          id: 'db-7-5',
          title: 'Remove Nth Node From End in One Pass',
          difficulty: 'Medium',
          description: 'Given `1 -> 2 -> 3 -> 4 -> 5`, delete `n = 2`nd from end (`4`) using gap-pointer -> 1 2 3 5',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node* next; };
int main() {
    Node n5{5,nullptr}, n4{4,&n5}, n3{3,&n4}, n2{2,&n3}, n1{1,&n2};
    // TODO: Use dummy node before n1; advance fast n+1 steps ahead of slow
    return 0;
}`,
          expectedOutput: '1 2 3 5',
          hints: ['Advancing `fast` by `n + 1` leaves `slow` sitting directly BEFORE the node to delete.'],
        },
        {
          id: 'db-7-6',
          title: 'Min Stack With O(1) getMin()',
          difficulty: 'Medium',
          description: 'Implement `MinStack` supporting push(5), push(3), push(7), getMin(), pop(), push(2), getMin() -> 3 2',
          starterCode: `#include <iostream>
#include <stack>
using namespace std;

// TODO: Store pairs {val, currentMin} in stack
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '3 2',
          hints: ['Each stack entry remembers `min(val, prevMin)` so popping restores the prior minimum in O(1)!'],
        },
        {
          id: 'db-7-7',
          title: 'Implement Queue Using Two Stacks',
          difficulty: 'Easy',
          description: 'Enqueue `10, 20, 30`, dequeue `10`, enqueue `40`, print remaining pops -> 20 30 40',
          starterCode: `#include <iostream>
#include <stack>
using namespace std;

// TODO: Lazy transfer from in stack to out stack when out is empty
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '20 30 40',
          hints: ['Transfer all items `in -> out` ONLY when `out.empty()` for amortized O(1) per op.'],
        },
        {
          id: 'db-7-8',
          title: 'Simplify Unix File Path With Stack',
          difficulty: 'Medium',
          description: 'Simplify `"/home//foo/../bar/./"` cleanly -> /home/bar',
          starterCode: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string path = "/home//foo/../bar/./";
    // TODO: Split on '/', ignore "" & ".", pop on ".."
    return 0;
}`,
          expectedOutput: '/home/bar',
          hints: ['Use `vector<string>` as stack; rebuild with leading `"/"`.'],
        },
        {
          id: 'db-7-9',
          title: 'Linked List Palindrome Verification',
          difficulty: 'Medium',
          description: 'Check `1 -> 2 -> 2 -> 1` in O(N) time and O(1) space (split middle + reverse second half) -> 1',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node* next; };
int main() {
    Node d{1,nullptr}, c{2,&d}, b{2,&c}, a{1,&b};
    // TODO: Find mid, reverse second half, compare halves
    return 0;
}`,
          expectedOutput: '1',
          hints: ['Reverse starting from `slow` onward, then compare two heads while `rev != nullptr`.'],
        },
        {
          id: 'db-7-10',
          title: 'Asteroid Collision Stack Simulation',
          difficulty: 'Medium',
          description: 'Simulate `{5, 10, -5, -12, 8}` (+ goes right, - goes left, larger abs survives) -> -12 8',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> ast = {5, 10, -5, -12, 8}, st;
    // TODO: Collision occurs ONLY when st.back() > 0 && x < 0
    return 0;
}`,
          expectedOutput: '-12 8',
          hints: ['Remember `x` moving left only collides with positive asteroids moving right on stack top!'],
        },
      ],
    },
  ],
};
