import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const CPP_PRO_SPEC: TrackSpec = {
  id: 'cpp-learning',
  language: 'cpp',
  track: 'learning',
  title: 'C++ Core & Competitive Pro Track',
  tagline: 'STL Containers, Heaps, Binary Search, Bitmasks, Sliding Window, Graphs & DP',
  icon: '⚡',
  color: 'text-cyan-500 dark:text-cyan-400',
  badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  borderColor: 'border-cyan-400/30 hover:border-cyan-400/70',
  description:
    'Competitive Programming & High-Performance C++ mastery: STL containers, O(log N) binary search on answer, bitmask subsets, monotonic structures, shortest-path graphs, and DP with 70 problems.',
  compilerLanguage: 'cpp',
  compilerDisplayName: 'C++ (GCC G++)',
  estimatedTotalHours: '26 Hours',
  prerequisites: ['Completion of C++ Beginner Track or familiarity with vectors/references'],
  outcomes: [
    'Wield vector, map/unordered_map, set, priority_queue & deque fluently',
    'Avoid unordered_map hash-collision hacks in contests',
    'Solve Binary Search on Answer, Bitmasks & Two Pointers problems rapidly',
    'Implement BFS/DFS, Dijkstra, and 1D/2D Dynamic Programming in clean C++',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'STL Vectors, Pairs, Iterators & Sort',
      topic: 'Iterators, Lambdas & Coordinate Compression',
      estimatedTime: '3 Hours',
      summary:
        'Master C++ STL iterators (`lower_bound`, `unique`), structured bindings `auto [x, y]`, custom lambda comparators, and coordinate compression.',
      studyMaterial: {
        overview:
          'The Standard Template Library is C++’s superpower for speed in contests. Combining `sort` + `unique` + `lower_bound` solves ranking & compression in 4 lines of O(N log N) code.',
        keyPoints: [
          '`sort(v.begin(), v.end())` followed by `v.erase(unique(v.begin(), v.end()), v.end())` deduplicates sorted vectors.',
          'Always pass comparator arguments as `const auto&` without mutating or crashing on strict weak ordering (`a < b`, never `a <= b`!).',
          'C++17 structured bindings `for (auto [u, v] : pairs)` make tuple/pair code ultra-clean.',
        ],
        codeExamples: [
          {
            title: 'Coordinate Compression Idiom',
            code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {100, 500, 100, 50};
    vector<int> vals = a;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    for (int x : a) cout << (lower_bound(vals.begin(), vals.end(), x) - vals.begin()) << " ";
}`,
            explanation: 'Maps `{100, 500, 100, 50}` cleanly to compressed ranks `1 2 1 0`.',
          },
        ],
        cheatsheet: [
          'sort + erase(unique(...), end()) -> sorted unique values',
          'lower_bound - v.begin() -> first index >= val',
          'auto [first, second] = pairObj -> C++17 unpacking',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/algorithm',
      },
      video: yt(
        'C++ STL Complete Tutorial — One Shot',
        'Apna College',
        'okhdtEk1iKk',
        '1h 55m',
        'Complete visual guide to vector, pair, set, map, stack, queue, and STL algorithms.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int, string>> board = {{1400, "Zed"}, {1850, "Ada"}, {1850, "Bea"}};
    sort(board.begin(), board.end(), [](const auto& a, const auto& b) {
        if (a.first != b.first) return a.first > b.first;
        return a.second < b.second;
    });
    for (auto& [elo, name] : board) cout << name << ":" << elo << " ";
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cp-1-1',
          title: 'Sort & Deduplicate Sorted Vector',
          difficulty: 'Easy',
          description: 'Compress `{9, 2, 9, 4, 2, 7}` into unique sorted order -> 2 4 7 9',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {9, 2, 9, 4, 2, 7};
    // TODO: sort + unique + erase
    return 0;
}`,
          expectedOutput: '2 4 7 9',
          hints: ['sort -> v.erase(unique(v.begin(), v.end()), v.end()).'],
        },
        {
          id: 'cp-1-2',
          title: 'Multi-Key Lambda Pair Sort',
          difficulty: 'Easy',
          description: 'Sort `{(2,9),(1,5),(2,3)}` by first DESC, second ASC -> (2,3) (2,9) (1,5)',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> v = {{2,9},{1,5},{2,3}};
    // TODO
    return 0;
}`,
          expectedOutput: '(2,3) (2,9) (1,5)',
          hints: ['If a.first != b.first return a.first > b.first; else return a.second < b.second;'],
        },
        {
          id: 'cp-1-3',
          title: 'Coordinate Compression Ranks',
          difficulty: 'Medium',
          description: 'Compress `{40, 10, 40, 20}` into 0-based ranks -> 2 0 2 1',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {40, 10, 40, 20};
    // TODO
    return 0;
}`,
          expectedOutput: '2 0 2 1',
          hints: ['Sort & deduplicate copy, then use `lower_bound(...) - vals.begin()`.'],
        },
        {
          id: 'cp-1-4',
          title: 'Next Lexicographical Permutation',
          difficulty: 'Medium',
          description: 'Generate the next greater permutation of `{1, 3, 2}` using STL -> 2 1 3',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {1, 3, 2};
    // TODO: next_permutation
    return 0;
}`,
          expectedOutput: '2 1 3',
          hints: ['Call `next_permutation(a.begin(), a.end())` directly.'],
        },
        {
          id: 'cp-1-5',
          title: 'Partial Sum Prefix Vector',
          difficulty: 'Easy',
          description: 'Use `std::partial_sum` from `<numeric>` on `{2, 5, 3, 8}` -> 2 7 10 18',
          starterCode: `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int main() {
    vector<int> a = {2, 5, 3, 8}, p(4);
    // TODO: partial_sum
    return 0;
}`,
          expectedOutput: '2 7 10 18',
          hints: ['partial_sum(a.begin(), a.end(), p.begin());'],
        },
        {
          id: 'cp-1-6',
          title: 'Kth Element via nth_element O(N)',
          difficulty: 'Medium',
          description: 'Find 2nd smallest (0-indexed k=1) in `{12, 3, 5, 7, 19}` in O(N) expected time without full sort -> 5',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {12, 3, 5, 7, 19};
    // TODO: nth_element on index 1
    return 0;
}`,
          expectedOutput: '5',
          hints: ['nth_element(a.begin(), a.begin() + 1, a.end()); cout << a[1];'],
        },
        {
          id: 'cp-1-7',
          title: 'Count Frequency of X in Sorted Range',
          difficulty: 'Easy',
          description: 'Use `equal_range` on `{1, 2, 2, 2, 5, 8}` to count occurrences of `2` -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {1, 2, 2, 2, 5, 8};
    // TODO: auto [lo, hi] = equal_range(...)
    return 0;
}`,
          expectedOutput: '3',
          hints: ['hi - lo returns exact frequency in O(log N).'],
        },
        {
          id: 'cp-1-8',
          title: 'Erase-Remove Idiom',
          difficulty: 'Easy',
          description: 'Remove all negative numbers from `{3, -1, 7, -4, 9}` in-place -> 3 7 9',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {3, -1, 7, -4, 9};
    // TODO: std::erase_if (C++20) or v.erase(remove_if(...), v.end())
    return 0;
}`,
          expectedOutput: '3 7 9',
          hints: ['remove_if returns iterator to new logical end; pass to v.erase(...).'],
        },
        {
          id: 'cb-p1-9',
          title: 'Iota & Accumulate Range',
          difficulty: 'Easy',
          description: 'Fill size-6 vector starting at `10` with `std::iota` and sum via `std::accumulate` -> 75',
          starterCode: `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int main() {
    vector<int> v(6);
    // TODO: iota(10) + accumulate(..., 0)
    return 0;
}`,
          expectedOutput: '75',
          hints: ['10+11+12+13+14+15 = 75. Always pass `0LL` if sum can exceed 32-bit!'],
        },
        {
          id: 'cp-1-10',
          title: 'Min & Max Element Pair',
          difficulty: 'Easy',
          description: 'Use `std::minmax_element` on `{42, 7, 99, 13}` and print `*mn *mx` -> 7 99',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {42, 7, 99, 13};
    // TODO
    return 0;
}`,
          expectedOutput: '7 99',
          hints: ['auto [mn, mx] = minmax_element(v.begin(), v.end());'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'Maps, Sets, Multisets & Anti-Hash Guards',
      topic: 'Ordered Trees, O(log N) Lookups & Custom Hash',
      estimatedTime: '3 Hours',
      summary:
        'Use `map`, `set`, `multiset` (`erase(it)` vs `erase(val)`!), and protect `unordered_map` against Codeforces anti-hash collision tests.',
      studyMaterial: {
        overview:
          '`std::set` and `std::map` run on balanced Red-Black Trees in guaranteed O(log N) worst-case. When speed requires `unordered_map`, seed a `splitmix64` custom hash so crafted inputs can’t trigger O(N²) bucket collisions.',
        keyPoints: [
          'CRITICAL TRAP: `multiset.erase(x)` deletes ALL copies of `x`! Use `ms.erase(ms.find(x))` to erase ONLY ONE copy.',
          '`set::lower_bound(x)` is O(log N), whereas `std::lower_bound(s.begin(), s.end(), x)` is O(N) on sets!',
          'Custom `splitmix64` hash prevents Codeforces O(N²) `unordered_map` blowup hacks.',
        ],
        codeExamples: [
          {
            title: 'Multiset Single-Occurrence Removal',
            code: `#include <iostream>
#include <set>
using namespace std;

int main() {
    multiset<int> ms = {10, 10, 20};
    ms.erase(ms.find(10));
    cout << ms.count(10) << " " << *ms.rbegin() << '\\n';
}`,
            explanation: 'Erases just one `10` leaving `{10, 20}` cleanly.',
          },
        ],
        cheatsheet: [
          'ms.erase(ms.find(x)) -> deletes ONE copy',
          'st.lower_bound(x) -> O(log N) member method',
          '*prev(st.end()) / *st.rbegin() -> max element',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/container/multiset',
      },
      video: yt(
        'C++ STL Maps, Sets & Multisets',
        'Apna College',
        'okhdtEk1iKk',
        '1h 55m',
        'Focus on ordered vs unordered container trade-offs and multiset iterator safety.',
      ),
      compilerStarterCode: `#include <iostream>
#include <set>
using namespace std;

int main() {
    multiset<int> ms = {5, 5, 8, 12};
    ms.erase(ms.find(5));
    cout << "Count of 5: " << ms.count(5) << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cp-2-1',
          title: 'Multiset Delete Single Occurrence',
          difficulty: 'Easy',
          description: 'Insert `{4, 4, 4, 9}`, erase ONE `4`, then print size and min -> 3 4',
          starterCode: `#include <iostream>
#include <set>
using namespace std;

int main() {
    multiset<int> ms = {4, 4, 4, 9};
    // TODO: Erase single occurrence of 4
    return 0;
}`,
          expectedOutput: '3 4',
          hints: ['Pass iterator `ms.find(4)` to `ms.erase(...)` rather than value `4`.'],
        },
        {
          id: 'cp-2-2',
          title: 'Largest Element Strictly Less Than X',
          difficulty: 'Medium',
          description: 'In set `{10, 20, 35, 50}`, find largest element `< 35` using `lower_bound` -> 20',
          starterCode: `#include <iostream>
#include <set>
using namespace std;

int main() {
    set<int> st = {10, 20, 35, 50};
    // TODO: Use auto it = st.lower_bound(35); step back prev(it) if not begin()
    return 0;
}`,
          expectedOutput: '20',
          hints: ['lower_bound(35) points at 35; `*prev(it)` points at 20.'],
        },
        {
          id: 'cp-2-3',
          title: 'Frequency Counter Ordered Output',
          difficulty: 'Easy',
          description: 'Count `{"cpp","go","cpp","py","go","cpp"}` in `map<string,int>` -> cpp:3 go:2 py:1',
          starterCode: `#include <iostream>
#include <map>
#include <vector>
using namespace std;

int main() {
    vector<string> v = {"cpp","go","cpp","py","go","cpp"};
    // TODO
    return 0;
}`,
          expectedOutput: 'cpp:3 go:2 py:1',
          hints: ['`map` automatically keeps keys lexicographically sorted.'],
        },
        {
          id: 'cp-2-4',
          title: 'Custom SplitMix64 Unordered Map',
          difficulty: 'Medium',
          description: 'Implement `CustomHash` struct with `size_t operator()(uint64_t x) const` and sum values mapped for keys {1, 2, 3} -> 60',
          starterCode: `#include <iostream>
#include <unordered_map>
#include <cstdint>
using namespace std;

struct CustomHash {
    size_t operator()(uint64_t x) const {
        // TODO: mix bits and return static_cast<size_t>(x)
        return x;
    }
};
int main() {
    unordered_map<int, int, CustomHash> mp;
    mp[1] = 10; mp[2] = 20; mp[3] = 30;
    cout << mp[1] + mp[2] + mp[3] << '\\n';
}`,
          expectedOutput: '60',
          hints: ['Apply `x += 0x9e3779b97f4a7c15; x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9;`'],
        },
        {
          id: 'cp-2-5',
          title: 'Count Pairs With Sum = Target',
          difficulty: 'Easy',
          description: 'Count ordered pairs `i < j` summing to `6` in `{1, 5, 7, -1, 5}` -> 3',
          starterCode: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 5, 7, -1, 5}; int target = 6;
    // TODO: Single pass counting seen complements
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Before `freq[x]++`, add `freq[target - x]` to answer.'],
        },
        {
          id: 'cp-2-6',
          title: 'Subarray With Zero Sum Check',
          difficulty: 'Medium',
          description: 'Check if `{4, 2, -3, 1, 6}` contains a non-empty zero-sum subarray -> YES',
          starterCode: `#include <iostream>
#include <unordered_set>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {4, 2, -3, 1, 6};
    // TODO: Track prefix sums in set seeded with 0
    return 0;
}`,
          expectedOutput: 'YES',
          hints: ['2 + (-3) + 1 = 0 -> prefix sum repeats (6 == 6).'],
        },
        {
          id: 'cp-2-7',
          title: 'Sliding Window Distinct Count',
          difficulty: 'Medium',
          description: 'For `{1, 2, 1, 3, 4, 2, 3}` and `k = 4`, print distinct elements per window -> 3 4 4 3',
          starterCode: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 2, 1, 3, 4, 2, 3}; int k = 4;
    // TODO: Increment incoming, decrement outgoing, erase key when count drops to 0
    return 0;
}`,
          expectedOutput: '3 4 4 3',
          hints: ['Always `if (--mp[out] == 0) mp.erase(out);` so `mp.size()` stays exact.'],
        },
        {
          id: 'cp-2-8',
          title: 'Concert Tickets Greedy Match (Multiset)',
          difficulty: 'Medium',
          description: 'Tickets `{5, 3, 7, 8, 5}`, buyer max bids `{4, 8, 3}`. Print matched prices (`-1` if none) removing used ticket -> 3 8 -1',
          starterCode: `#include <iostream>
#include <set>
#include <vector>
using namespace std;

int main() {
    multiset<int> tickets = {5, 3, 7, 8, 5};
    vector<int> bids = {4, 8, 3};
    // TODO: For each bid use upper_bound(bid); if it != begin() print *prev(it) and erase
    return 0;
}`,
          expectedOutput: '3 8 -1',
          hints: ['Wait: second bid 8 uses 8, third bid 3 sees smallest leftover 5 > 3 so `-1`!'],
        },
        {
          id: 'cp-2-9',
          title: 'Missing Coin Difference Queries',
          difficulty: 'Easy',
          description: 'Using `map<int, int>`, merge frequency counts of `{1:2, 2:3}` and `{2:4, 5:1}` and print key 2 sum -> 7',
          starterCode: `#include <iostream>
#include <map>
using namespace std;

int main() {
    map<int, int> a = {{1,2},{2,3}}, b = {{2,4},{5,1}};
    // TODO
    return 0;
}`,
          expectedOutput: '7',
          hints: ['`for (auto [k, v] : b) a[k] += v;`'],
        },
        {
          id: 'cp-2-10',
          title: 'Range Span In Ordered Set',
          difficulty: 'Easy',
          description: 'In `{100, 12, 45, 78}`, insert `5`, erase `100`, print `max - min` -> 73',
          starterCode: `#include <iostream>
#include <set>
using namespace std;

int main() {
    set<int> s = {100, 12, 45, 78};
    // TODO
    return 0;
}`,
          expectedOutput: '73',
          hints: ['After insert(5) and erase(100), range is [5..78] -> 78 - 5 = 73.'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Heaps, Stacks & Binary Search on Answer',
      topic: 'Priority Queue, Monotonic Stack & Parametric Search',
      estimatedTime: '3.5 Hours',
      summary:
        'Master C++ `priority_queue` (Min-Heap syntax!), monotonic stacks/deques, and the ultra-versatile Binary Search on Answer paradigm.',
      studyMaterial: {
        overview:
          'Whenever a problem asks for **"Minimize the Maximum X"** or **"Maximize the Minimum X"** over a monotonic feasibility condition `canAchieve(mid)`, Binary Search on Answer solves it in O(N log Range)!',
        keyPoints: [
          'C++ `priority_queue<int>` is a MAX-heap by default! Min-heap syntax: `priority_queue<int, vector<int>, greater<int>>`.',
          'For Binary Search on Answer, verify monotonic predicate: `[F, F, T, T, T]` -> find first `T`.',
          'Always compute `mid = lo + (hi - lo) / 2` in 64-bit `long long` when bounds reach `10^14`.',
        ],
        codeExamples: [
          {
            title: 'Min-Heap & Binary Search on Answer Template',
            code: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    priority_queue<int, vector<int>, greater<int>> minH;
    minH.push(30); minH.push(5); minH.push(12);
    cout << minH.top() << '\\n';
}`,
            explanation: 'Notice `greater<int>` template parameter reverses default Max-Heap ordering.',
          },
        ],
        cheatsheet: [
          'priority_queue<int, vector<int>, greater<>> minH',
          'while (lo <= hi) { mid = lo + (hi - lo)/2; if (ok(mid)) ans=mid, hi=mid-1; else lo=mid+1; }',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/container/priority_queue',
      },
      video: yt(
        'Binary Search & STL Heaps Mastery',
        'take U forward',
        'FfXoiwwnxFw',
        '42m',
        'Focus on monotonic predicate framing, Min-Heap declarations, and boundary checks.',
      ),
      compilerStarterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int x : {14, 3, 9, 1}) pq.push(x);
    cout << pq.top() << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cp-3-1',
          title: 'Koko Eating Bananas (Binary Search Answer)',
          difficulty: 'Medium',
          description: 'Piles `{3, 6, 7, 11}`, hours `h = 8`. Find minimum integer speed `k` so total hours `<= 8` -> 4',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> piles = {3, 6, 7, 11}; int h = 8;
    // TODO: Binary search k in [1..11] using ceil division (p + k - 1) / k
    return 0;
}`,
          expectedOutput: '4',
          hints: ['At k=4: 1 + 2 + 2 + 3 = 8 hours. At k=3: 1 + 2 + 3 + 4 = 10 > 8.'],
        },
        {
          id: 'cp-3-2',
          title: 'Allocate Minimum Book Pages',
          difficulty: 'Hard',
          description: 'Books `{12, 34, 67, 90}`, `students = 2` (contiguous partitions). Minimize max pages assigned to a student -> 113',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> books = {12, 34, 67, 90}; int students = 2;
    // TODO: Binary search limit in [90..203]
    return 0;
}`,
          expectedOutput: '113',
          hints: ['12+34+67 = 113 and 90 -> max is 113.'],
        },
        {
          id: 'cp-3-3',
          title: 'Aggressive Cows (Maximize Min Distance)',
          difficulty: 'Hard',
          description: 'Stalls `{1, 2, 4, 8, 9}`, place `3` cows maximizing minimum pairwise gap -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> pos = {1, 2, 4, 8, 9}; int cows = 3;
    // TODO: Binary search gap d; greedily place cow whenever x - last >= d
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Stalls 1, 4, 8 give gaps 3 and 4 >= 3.'],
        },
        {
          id: 'cp-3-4',
          title: 'Daily Temperatures (Monotonic Stack)',
          difficulty: 'Medium',
          description: 'For `{73, 74, 75, 71, 69, 72, 76, 73}`, print days until warmer temp -> 1 1 4 2 1 1 0 0',
          starterCode: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int main() {
    vector<int> t = {73, 74, 75, 71, 69, 72, 76, 73};
    // TODO: Monotonic decreasing stack storing indices
    return 0;
}`,
          expectedOutput: '1 1 4 2 1 1 0 0',
          hints: ['Pop index `idx` when `t[i] > t[idx]`, set `ans[idx] = i - idx`.'],
        },
        {
          id: 'cp-3-5',
          title: 'Largest Rectangle in Histogram',
          difficulty: 'Hard',
          description: 'Find max rectangular area in bar heights `{2, 1, 5, 6, 2, 3}` -> 10',
          starterCode: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int main() {
    vector<int> h = {2, 1, 5, 6, 2, 3};
    // TODO: Monotonic increasing stack with sentinel 0 at end
    return 0;
}`,
          expectedOutput: '10',
          hints: ['Push 0 at tail to flush remaining stack bars cleanly at the end!'],
        },
        {
          id: 'cp-3-6',
          title: 'Kth Smallest via Max-Heap',
          difficulty: 'Easy',
          description: 'Find 2nd smallest element in `{7, 10, 4, 3, 20, 15}` using size-2 Max-Heap -> 4',
          starterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {7, 10, 4, 3, 20, 15}; int k = 2;
    // TODO
    return 0;
}`,
          expectedOutput: '4',
          hints: ['Keep `priority_queue<int>` bounded to size `k`; answer is `pq.top()`.'],
        },
        {
          id: 'cp-3-7',
          title: 'Evaluate Reverse Polish Notation',
          difficulty: 'Medium',
          description: 'Evaluate `{"2","1","+","3","*"}` using `stack<int>` -> 9',
          starterCode: `#include <iostream>
#include <stack>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<string> tok = {"2","1","+","3","*"};
    // TODO
    return 0;
}`,
          expectedOutput: '9',
          hints: ['Notice operand order: `b = st.top(); st.pop(); a = st.top(); st.pop(); push(a op b)`.'],
        },
        {
          id: 'cp-3-8',
          title: 'Min Heap Dijkstra Pair Simulation',
          difficulty: 'Easy',
          description: 'Push pairs `(dist, node)`: `(15, 2), (4, 3), (9, 1)` into min-heap and print smallest pair -> 4 3',
          starterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    using P = pair<int, int>;
    priority_queue<P, vector<P>, greater<P>> pq;
    // TODO: Push three pairs and print pq.top()
    return 0;
}`,
          expectedOutput: '4 3',
          hints: ['`greater<P>` compares `.first` then `.second`.'],
        },
        {
          id: 'cp-3-9',
          title: 'Square Root Floor in O(log N)',
          difficulty: 'Easy',
          description: 'Find integer `floor(sqrt(2147395599))` without floating point or overflow -> 46339',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    long long x = 2147395599LL;
    // TODO: Binary search in [0..50000]
    return 0;
}`,
          expectedOutput: '46339',
          hints: ['Compare `mid <= x / mid` or use 64-bit `mid * mid <= x`.'],
        },
        {
          id: 'cp-3-10',
          title: 'Search in Rotated Sorted Array',
          difficulty: 'Medium',
          description: 'Find target `0` in `{4, 5, 6, 7, 0, 1, 2}` in O(log N) -> 4',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {4, 5, 6, 7, 0, 1, 2}; int target = 0;
    // TODO: Identify sorted half on each iteration
    return 0;
}`,
          expectedOutput: '4',
          hints: ['At least one of `[lo..mid]` or `[mid..hi]` is guaranteed sorted.'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Greedy Scheduling & Bitmask Subsets',
      topic: 'Activity Selection & 2^N Subset Enumeration',
      estimatedTime: '3 Hours',
      summary:
        'Prove exchange-argument Greedy strategies (Activity Selection, Jump Game, Gas Station) and enumerate all subsets for `N <= 20` using integer bitmasks.',
      studyMaterial: {
        overview:
          'Greedy picks locally optimal choices that stay globally safe—most interval scheduling sorts by **earliest finish time**. When `N <= 20`, looping `mask` from `0` to `(1 << N) - 1` inspects every subset without recursion.',
        keyPoints: [
          'Maximum non-overlapping intervals ALWAYS sorts by **end time ascending**, never start time!',
          'Iterative bitmask loop `for (int mask = 0; mask < (1 << n); mask++)` generates all `2^n` subsets cleanly.',
          'Submask enumeration trick: `for (int sub = mask; sub; sub = (sub - 1) & mask)`.',
        ],
        codeExamples: [
          {
            title: 'Bitmask Subset Sum Counter',
            code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {3, 5, 7};
    int target = 10, ways = 0;
    for (int m = 0; m < (1 << 3); m++) {
        int s = 0;
        for (int i = 0; i < 3; i++) if (m & (1 << i)) s += a[i];
        if (s == target) ways++;
    }
    cout << ways << '\\n';
}`,
            explanation: 'Counts `{3, 7}` in O(N * 2^N) without recursion stack overhead.',
          },
        ],
        cheatsheet: [
          'Interval scheduling: sort by END ascending',
          '(mask >> i) & 1 -> tests if item i is in subset',
          '__builtin_ctz(mask) -> index of lowest set bit',
        ],
        officialDocUrl: 'https://cp-algorithms.com/algebra/bit-manipulation.html',
      },
      video: yt(
        'Greedy Algorithms & Bit Manipulation — C++ Course',
        'freeCodeCamp.org',
        '8jLOx1hD3_o',
        '31h 00m',
        'Practice bitmask encoding and exchange-argument interval selection.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> act = {{1,4},{3,5},{0,6},{5,7},{8,9}};
    sort(act.begin(), act.end(), [](auto a, auto b){ return a.second < b.second; });
    int end = -1, cnt = 0;
    for (auto [s, e] : act) if (s >= end) { cnt++; end = e; }
    cout << cnt << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cp-4-1',
          title: 'Activity Selection Max Intervals',
          difficulty: 'Easy',
          description: 'Maximize non-overlapping `[start, end)` events in `{{1,3},{2,4},{3,5},{0,6},{5,7}}` -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> iv = {{1,3},{2,4},{3,5},{0,6},{5,7}};
    // TODO: Sort by end time and count compatible intervals (s >= lastEnd)
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Select [1,3], [3,5], [5,7].'],
        },
        {
          id: 'cp-4-2',
          title: 'Jump Game Reachability Greedy',
          difficulty: 'Medium',
          description: 'Check `{2,3,1,1,4}` and `{3,2,1,0,4}` for reaching last index -> 1 0',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

bool canJump(const vector<int>& a) {
    // TODO: Track maxReach; if i > maxReach return false
    return false;
}
int main() {
    cout << canJump({2,3,1,1,4}) << " " << canJump({3,2,1,0,4}) << '\\n';
}`,
          expectedOutput: '1 0',
          hints: ['One pass updating `far = max(far, i + a[i])`.'],
        },
        {
          id: 'cp-4-3',
          title: 'Gas Station Circular Tour',
          difficulty: 'Medium',
          description: 'Find unique starting station in `gas={1,2,3,4,5}`, `cost={3,4,5,1,2}` -> 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> gas = {1,2,3,4,5}, cost = {3,4,5,1,2};
    // TODO: Reset start = i + 1 whenever tank drops < 0
    return 0;
}`,
          expectedOutput: '3',
          hints: ['If totalGas >= totalCost, the first index that survives to N-1 finishes the circle.'],
        },
        {
          id: 'cp-4-4',
          title: 'Bitmask Subset Sum Count',
          difficulty: 'Easy',
          description: 'Count subsets of `{2, 4, 6, 8}` summing to `10` using bitmasks -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 4, 6, 8}; int target = 10;
    // TODO: Loop m from 0 to (1<<4)-1
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Subsets `{2, 8}` and `{4, 6}` equal 10.'],
        },
        {
          id: 'cp-4-5',
          title: 'Minimum Platforms Required (Sweep Line)',
          difficulty: 'Medium',
          description: 'Trains arrive `{900, 940, 950, 1100}`, depart `{910, 1200, 1120, 1130}`. Find max concurrent platforms -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> arr = {900, 940, 950, 1100}, dep = {910, 1200, 1120, 1130};
    // TODO: Sort arr & dep separately and sweep two pointers
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Advance arrival pointer if `arr[i] <= dep[j]`, increment count else decrement.'],
        },
        {
          id: 'cp-4-6',
          title: 'XOR Subset Maximum (Greedy / Brute Bitmask)',
          difficulty: 'Medium',
          description: 'Find maximum XOR achievable by choosing any subset of `{3, 10, 5}` -> 15',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {3, 10, 5};
    // TODO
    return 0;
}`,
          expectedOutput: '15',
          hints: ['Try all 2^3 masks: 10 ^ 5 = 15 (`1010 ^ 0101 = 1111`).'],
        },
        {
          id: 'cp-4-7',
          title: 'Assign Cookies Maximum Satisfied',
          difficulty: 'Easy',
          description: 'Greeds `{1, 2, 3}`, cookies `{1, 1}` -> max satisfied children: 1',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> g = {1,2,3}, s = {1,1};
    // TODO: Sort both and two-pointer match
    return 0;
}`,
          expectedOutput: '1',
          hints: ['Always satisfy least greedy child with smallest sufficient cookie.'],
        },
        {
          id: 'cp-4-8',
          title: 'Fractional Knapsack Greedy Value',
          difficulty: 'Easy',
          description: 'Items `(val, wt): (60,10), (100,20), (120,30)`, cap `50`. Print max value as integer -> 240',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> items = {{60,10},{100,20},{120,30}}; int W = 50;
    // TODO: Sort descending by value/weight ratio (a.v * b.w > b.v * a.w)
    return 0;
}`,
          expectedOutput: '240',
          hints: ['Take full 10 (60) + full 20 (100) + 20/30 of 120 (80) = 240.'],
        },
        {
          id: 'cp-4-9',
          title: 'Two Single Numbers (Bitmask Partition)',
          difficulty: 'Hard',
          description: 'In `{1, 2, 1, 3, 2, 5}`, every number appears twice except two. Print both sorted -> 3 5',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 2, 1, 3, 2, 5};
    // TODO: XOR all -> isolate diffBit = x & -x -> split elements into 2 buckets
    return 0;
}`,
          expectedOutput: '3 5',
          hints: ['Use any set bit of `totalXor` to separate `3` and `5` into distinct XOR accumulators.'],
        },
        {
          id: 'cp-4-10',
          title: 'Submask Enumeration Sum',
          difficulty: 'Medium',
          description: 'Count non-empty submasks of bitmask `mask = 0b1011` (3 set bits) -> 7',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int mask = 0b1011, cnt = 0;
    // TODO: Iterate sub = mask; while (sub) { ... sub = (sub - 1) & mask; }
    return 0;
}`,
          expectedOutput: '7',
          hints: ['`for (int s = mask; s > 0; s = (s - 1) & mask) cnt++;`'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'Two Pointers, Sliding Window & Difference Arrays',
      topic: 'O(N) Window Invariants & Range Updates',
      estimatedTime: '3 Hours',
      summary:
        'Eliminate O(N²) nested loops with Two Pointers, variable-length Sliding Windows, 2D prefix sums, and O(1) Difference Arrays.',
      studyMaterial: {
        overview:
          'When array elements are positive or sorted, two pointers (`l`, `r`) only move rightward—guaranteeing each element enters and leaves at most once for strict O(N) runtime.',
        keyPoints: [
          'Two-pointer template: expand `r`, then `while (invalid)` shrink `l` until invariant restores.',
          '**Difference Array**: add `+x` to range `[l, r]` in O(1) via `diff[l] += x; diff[r + 1] -= x;`, then take one final prefix sum.',
          'Always verify window constraint before recording `ans = max(ans, r - l + 1)`.',
        ],
        codeExamples: [
          {
            title: 'O(1) Range Update Difference Array',
            code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 5;
    vector<int> d(n + 1, 0);
    d[1] += 10; d[4] -= 10; // add 10 to indices [1..3]
    for (int i = 0, run = 0; i < n; i++) {
        run += d[i];
        cout << run << " ";
    }
}`,
            explanation: 'Outputs `0 10 10 10 0` in O(1) per update.',
          },
        ],
        cheatsheet: [
          'while (sum > target) sum -= a[l++];',
          'Difference array: d[L] += val; d[R+1] -= val;',
        ],
        officialDocUrl: 'https://usaco.guide/silver/two-pointers',
      },
      video: yt(
        'Two Pointers & Sliding Window Patterns',
        'freeCodeCamp.org',
        'RBSGKlAvoiM',
        '8h 03m',
        'Covers fixed/variable windows, prefix sums, and pointer convergence proofs.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    int l = 0, r = (int)a.size() - 1, best = 0;
    while (l < r) {
        best = max(best, min(a[l], a[r]) * (r - l));
        if (a[l] < a[r]) l++; else r--;
    }
    cout << best << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cp-5-1',
          title: 'Container With Most Water',
          difficulty: 'Medium',
          description: 'Maximize `min(h[l], h[r]) * (r - l)` on `{1, 8, 6, 2, 5, 4, 8, 3, 7}` -> 49',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> h = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    // TODO: Move shorter wall inward
    return 0;
}`,
          expectedOutput: '49',
          hints: ['Indices 1 (height 8) and 8 (height 7) -> 7 * 7 = 49.'],
        },
        {
          id: 'cp-5-2',
          title: 'Minimum Size Subarray Sum >= Target',
          difficulty: 'Medium',
          description: 'Find min subarray length with sum `>= 7` in `{2, 3, 1, 2, 4, 3}` -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 3, 1, 2, 4, 3}; int target = 7;
    // TODO: Shrink window while sum >= target
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Subarray `{4, 3}` has length 2.'],
        },
        {
          id: 'cp-5-3',
          title: 'Three Sum Unique Triplets Count',
          difficulty: 'Medium',
          description: 'Count unique triplets summing to 0 in `{-1, 0, 1, 2, -1, -4}` -> 2',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {-1, 0, 1, 2, -1, -4};
    // TODO: Sort, fix i, skip duplicate i/l/r
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Unique triplets are `[-1,-1,2]` and `[-1,0,1]`.'],
        },
        {
          id: 'cp-5-4',
          title: 'Trapping Rain Water Two Pointers',
          difficulty: 'Hard',
          description: 'Compute trapped rainwater over `{0,1,0,2,1,0,1,3,2,1,2,1}` in O(1) space -> 6',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> h = {0,1,0,2,1,0,1,3,2,1,2,1};
    // TODO: Track lMax and rMax inward
    return 0;
}`,
          expectedOutput: '6',
          hints: ['When `h[l] < h[r]`, water at `l` depends only on `lMax - h[l]`.'],
        },
        {
          id: 'cp-5-5',
          title: 'Difference Array Range Queries',
          difficulty: 'Medium',
          description: 'Size 5 zeros. Add `[0..2]+5`, `[1..4]+3`, `[2..2]+2`. Print final array -> 5 8 10 3 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // TODO: O(1) per update + single prefix sum reconstruction
    return 0;
}`,
          expectedOutput: '5 8 10 3 3',
          hints: ['Allocate size n+1 so `d[R + 1] -= val` never goes out of bounds.'],
        },
        {
          id: 'cp-5-6',
          title: 'Longest Window With <= K Zero Flips',
          difficulty: 'Medium',
          description: 'Max consecutive 1s in `{1,1,1,0,0,0,1,1,1,1,0}` flipping at most `k = 2` zeros -> 6',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1,1,1,0,0,0,1,1,1,1,0}; int k = 2;
    // TODO: Expand r, shrink l while zeros > k
    return 0;
}`,
          expectedOutput: '6',
          hints: ['Best window covers indices 5..10 (`0,1,1,1,1` + one 0 -> wait indices 4..9 or 5..10: length 6).'],
        },
        {
          id: 'cp-5-7',
          title: 'Dutch National Flag (Sort 0, 1, 2)',
          difficulty: 'Medium',
          description: 'Sort `{2, 0, 2, 1, 1, 0}` in a single O(N) 3-pointer pass -> 0 0 1 1 2 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 0, 2, 1, 1, 0};
    // TODO: lo, mid, hi pointers
    return 0;
}`,
          expectedOutput: '0 0 1 1 2 2',
          hints: ['When `a[mid] == 2`, swap with `hi--` and DO NOT increment `mid` yet!'],
        },
        {
          id: 'cp-5-8',
          title: 'Longest Repeating Char Replacement',
          difficulty: 'Hard',
          description: 'Max substring of `"AABABBA"` with at most `k = 1` replacement -> 4',
          starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s = "AABABBA"; int k = 1;
    // TODO: Maintain window size - maxFreq <= k
    return 0;
}`,
          expectedOutput: '4',
          hints: ['`AABA` -> replace B to get `AAAA` length 4.'],
        },
        {
          id: 'cp-5-9',
          title: 'Subarrays With Product Strictly < K',
          difficulty: 'Medium',
          description: 'Count contiguous subarrays in `{10, 5, 2, 6}` with product `< 100` -> 8',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {10, 5, 2, 6}; int k = 100;
    // TODO: Each valid right endpoint r contributes (r - l + 1) subarrays
    return 0;
}`,
          expectedOutput: '8',
          hints: ['While `prod >= k`, divide out `a[l++]`, then add `(r - l + 1)`.'],
        },
        {
          id: 'cp-5-10',
          title: '2D Matrix Prefix Sum Subgrid',
          difficulty: 'Medium',
          description: 'On 3x3 matrix `{{1,2,3},{4,5,6},{7,8,9}}`, compute sum of bottom-right 2x2 submatrix `(1,1)..(2,2)` via 2D prefix sums -> 28',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> g = {{1,2,3},{4,5,6},{7,8,9}};
    // TODO: Build (N+1)x(M+1) 2D prefix array and query (1,1)..(2,2)
    return 0;
}`,
          expectedOutput: '28',
          hints: ['5+6+8+9 = 28. `p[r2+1][c2+1] - p[r1][c2+1] - p[r2+1][c1] + p[r1][c1]`.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'Graphs: BFS, DFS, Topo Sort & Dijkstra',
      topic: 'Adjacency Lists, Grids & Shortest Paths',
      estimatedTime: '4 Hours',
      summary:
        'Model networks with `vector<vector<int>>` adjacency lists, traverse shortest paths via BFS, detect cycles & topological order, and run O(E log V) Dijkstra.',
      studyMaterial: {
        overview:
          'Most ICPC graph problems collapse into 4 core engines: BFS (unweighted shortest path), DFS (connected components / cycle detection), Kahn’s Topological Sort (DAG dependencies), and Dijkstra (non-negative weighted shortest path).',
        keyPoints: [
          'Mark nodes `visited` at the moment you **push** into the BFS queue—not on pop, or duplicates flood memory!',
          'Dijkstra’s stale-entry guard: `if (d > dist[u]) continue;` skips outdated heap pairs cleanly.',
          'Kahn’s algorithm starts with all nodes having `indegree == 0`—if processed count < N, a cycle exists.',
        ],
        codeExamples: [
          {
            title: 'Clean Dijkstra With Stale-Pair Guard',
            code: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n = 4;
    vector<vector<pair<int,int>>> adj(n);
    adj[0].push_back({1, 4}); adj[0].push_back({2, 1});
    adj[2].push_back({1, 2}); adj[1].push_back({3, 1});
    vector<int> dist(n, 1e9); dist[0] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, 0});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u])
            if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
    }
    cout << dist[3] << '\\n';
}`,
            explanation: 'Computes shortest path `0 -> 2 -> 1 -> 3` = `4` cleanly.',
          },
        ],
        cheatsheet: [
          'Grid 4-dir offsets: int dx[]={-1,1,0,0}, dy[]={0,0,-1,1};',
          'Dijkstra: if (d > dist[u]) continue;',
          'Kahn Topo Sort: queue of indegree == 0 nodes',
        ],
        officialDocUrl: 'https://cp-algorithms.com/graph/dijkstra_sparse.html',
      },
      video: yt(
        'Graph Algorithms for Technical Interviews — Full Course',
        'freeCodeCamp.org',
        'tWVWeAqZ0WU',
        '2h 12m',
        'Covers BFS, DFS, connected components, shortest path, and grid island counting.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    vector<vector<int>> adj = {{1,2},{0,3},{0,3},{1,2}};
    vector<int> dist(4, -1); dist[0] = 0;
    queue<int> q; q.push(0);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
    }
    cout << "Dist to 3: " << dist[3] << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cp-6-1',
          title: 'BFS Shortest Unweighted Path',
          difficulty: 'Easy',
          description: 'Graph 0..4 edges `{(0,1),(0,2),(1,3),(2,4),(3,4)}`. Print shortest distance from 0 to 4 -> 2',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    vector<vector<int>> adj = {{1,2},{0,3},{0,4},{1,4},{2,3}};
    // TODO: BFS from node 0
    return 0;
}`,
          expectedOutput: '2',
          hints: ['0 -> 2 -> 4 has length 2.'],
        },
        {
          id: 'cp-6-2',
          title: 'Number of Islands in Grid (DFS)',
          difficulty: 'Medium',
          description: 'Count 4-connected `1` islands in `{{"11000"},{"11000"},{"00100"},{"00011"}}` -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<string> g = {"11000","11000","00100","00011"};
    // TODO: Flood-fill turning visited '1' to '0'
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Trigger DFS for every unvisited \'1\' cell cleanly.'],
        },
        {
          id: 'cp-6-3',
          title: 'Bipartite Graph 2-Coloring',
          difficulty: 'Medium',
          description: 'Check if 4-cycle `(0-1-2-3-0)` and 3-cycle `(0-1-2-0)` are bipartite -> 1 0',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

bool isBipartite(int n, const vector<vector<int>>& adj) {
    // TODO: Color with 0/1 via BFS
    return false;
}
int main() {
    vector<vector<int>> g4 = {{1,3},{0,2},{1,3},{0,2}};
    vector<vector<int>> g3 = {{1,2},{0,2},{0,1}};
    cout << isBipartite(4, g4) << " " << isBipartite(3, g3) << '\\n';
}`,
          expectedOutput: '1 0',
          hints: ['Odd cycles can never be 2-colored (`color[v] == color[u]` -> false).'],
        },
        {
          id: 'cp-6-4',
          title: 'Kahn’s Topological Sort Order',
          difficulty: 'Medium',
          description: 'DAG edges `0->1, 0->2, 1->3, 2->3`. Print valid topological order using min-heap for deterministic tie-break -> 0 1 2 3',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n = 4;
    vector<vector<int>> adj = {{1,2},{3},{3},{}};
    // TODO: Compute indegrees and drain zero-indegree nodes
    return 0;
}`,
          expectedOutput: '0 1 2 3',
          hints: ['Use `priority_queue<int, vector<int>, greater<>>` so smallest zero-indegree runs first.'],
        },
        {
          id: 'cp-6-5',
          title: 'Cycle Detection in Directed Graph',
          difficulty: 'Medium',
          description: 'Check edges `0->1, 1->2, 2->0` for directed cycle -> CYCLE',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> adj = {{1},{2},{0}};
    // TODO: 3-color DFS (0=unvisited, 1=visiting, 2=done)
    return 0;
}`,
          expectedOutput: 'CYCLE',
          hints: ['Hitting a state-1 node currently on the recursion stack confirms a cycle.'],
        },
        {
          id: 'cp-6-6',
          title: 'Dijkstra Weighted Shortest Paths',
          difficulty: 'Medium',
          description: '4 nodes edges `(0->1:4), (0->2:1), (2->1:2), (1->3:5), (2->3:8)`. Print dist from 0 to `[0..3]` -> 0 3 1 8',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    // TODO: Dijkstra with pair<int,int> min-heap
    return 0;
}`,
          expectedOutput: '0 3 1 8',
          hints: ['0->2 (1) -> 1 (+2=3) -> 3 (+5=8) is cheaper than 0->2->3 (9).'],
        },
        {
          id: 'cp-6-7',
          title: 'Disjoint Set Union (Union-Find)',
          difficulty: 'Medium',
          description: '5 nodes `0..4`. Union `(0,1)`, `(1,2)`, `(3,4)`. Check `find(0)==find(2)` and `find(0)==find(4)` -> 1 0',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

// TODO: find with path compression & unite by rank/size
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '1 0',
          hints: ['`return p[x] == x ? x : p[x] = find(p[x]);`'],
        },
        {
          id: 'cp-6-8',
          title: 'Kruskal Minimum Spanning Tree Weight',
          difficulty: 'Hard',
          description: 'Edges `(u,v,w)`: `(0,1,10), (0,2,6), (0,3,5), (1,3,15), (2,3,4)` over 4 nodes -> print MST weight: 19',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // TODO: Sort edges by weight and unite via DSU
    return 0;
}`,
          expectedOutput: '19',
          hints: ['Picked edges weights: 4 (2-3), 5 (0-3), 10 (0-1) = 19.'],
        },
        {
          id: 'cp-6-9',
          title: 'Shortest Path in Binary Grid (BFS)',
          difficulty: 'Medium',
          description: 'In 3x3 grid `{{0,0,0},{1,1,0},{1,1,0}}`, min steps `(0,0)` to `(2,2)` (4-dir) -> 4',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    vector<vector<int>> g = {{0,0,0},{1,1,0},{1,1,0}};
    // TODO: BFS distances starting at (0,0) = 0
    return 0;
}`,
          expectedOutput: '4',
          hints: ['(0,0)->(0,1)->(0,2)->(1,2)->(2,2) takes 4 edges.'],
        },
        {
          id: 'cp-6-10',
          title: 'Floyd-Warshall All-Pairs Distance Check',
          difficulty: 'Medium',
          description: '3 nodes `0->1:3`, `1->2:4`, `0->2:10`. Run Floyd-Warshall and print shortest `dist[0][2]` -> 7',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    const int INF = 1e9;
    vector<vector<int>> d = {{0, 3, 10}, {INF, 0, 4}, {INF, INF, 0}};
    // TODO: Triple k-i-j loop
    return 0;
}`,
          expectedOutput: '7',
          hints: ['Always place intermediate vertex `k` as the OUTERMOST loop!'],
        },
      ],
    },
    {
      stepNumber: 7,
      title: 'Dynamic Programming & Fenwick/Segment Trees',
      topic: '0/1 Knapsack, LIS O(N log N), LCS & BIT',
      estimatedTime: '4 Hours',
      summary:
        'Transition from memoization to space-optimized 1D/2D DP tables across Knapsack, Coin Change, Edit Distance, O(N log N) LIS, and Fenwick Tree range queries.',
      studyMaterial: {
        overview:
          'Dynamic Programming turns exponential overlapping recursion into polynomial state transitions. Always ask: (1) What defines a state? (2) What is the recurrence? (3) Can we roll the 2D array into 1D?',
        keyPoints: [
          'In 0/1 Knapsack 1D optimization, iterate weight capacity **BACKWARDS (`w = W` down to `wt`)** so items aren’t picked multiple times; iterate **FORWARDS** for Unbounded Knapsack / Coin Change.',
          'Longest Increasing Subsequence runs in O(N log N) using `lower_bound` on a patience-tails vector.',
          'A Fenwick Tree (Binary Indexed Tree) does point-update + prefix-sum query in 8 lines of O(log N) code.',
        ],
        codeExamples: [
          {
            title: 'O(N log N) Patience LIS Length',
            code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {10, 9, 2, 5, 3, 7, 101, 18}, tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    cout << tails.size() << '\\n';
}`,
            explanation: 'Computes LIS length `4` (`2, 3, 7, 101`) cleanly in O(N log N).',
          },
        ],
        cheatsheet: [
          '0/1 Knapsack 1D: for (int w = W; w >= wt[i]; w--)',
          'Coin Change Combinations: loop coins outer, sum inner',
          'BIT query/update: idx += idx & -idx / idx -= idx & -idx',
        ],
        officialDocUrl: 'https://cp-algorithms.com/data_structures/fenwick.html',
      },
      video: yt(
        'Dynamic Programming Complete Foundations',
        'freeCodeCamp.org',
        'oBt53YbR9Kk',
        '5h 10m',
        'Master memoization and tabulation across grid, subset, and string DP problems.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> coins = {1, 2, 5}; int amt = 11;
    vector<int> dp(amt + 1, 1e9); dp[0] = 0;
    for (int i = 1; i <= amt; i++)
        for (int c : coins) if (c <= i) dp[i] = min(dp[i], dp[i - c] + 1);
    cout << dp[amt] << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cp-7-1',
          title: '0/1 Knapsack Max Value (1D Space)',
          difficulty: 'Medium',
          description: 'Weights `{1, 3, 4, 5}`, Values `{1, 4, 5, 7}`, capacity `7` -> max value: 9',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> wt = {1,3,4,5}, val = {1,4,5,7}; int W = 7;
    // TODO: 1D DP iterating w backwards from W down to wt[i]
    return 0;
}`,
          expectedOutput: '9',
          hints: ['Items weights 3+4 give values 4+5 = 9.'],
        },
        {
          id: 'cp-7-2',
          title: 'Coin Change Minimum Coins',
          difficulty: 'Medium',
          description: 'Minimum coins from `{1, 3, 4}` to make `6` -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> coins = {1, 3, 4}; int amt = 6;
    // TODO: Bottom-up dp array
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Greedy fails (`4+1+1 = 3`), DP picks `3+3 = 2`!'],
        },
        {
          id: 'cp-7-3',
          title: 'Coin Change II (Unique Combinations)',
          difficulty: 'Medium',
          description: 'Count distinct combinations using coins `{1, 2, 5}` summing to `5` -> 4',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> coins = {1, 2, 5}; int amt = 5;
    // TODO: Outer loop over coins, inner loop s = c..amt
    return 0;
}`,
          expectedOutput: '4',
          hints: ['Looping `coins` outside guarantees combinations `{1,2}` != `{2,1}` isn’t double counted.'],
        },
        {
          id: 'cp-7-4',
          title: 'House Robber Linear DP',
          difficulty: 'Easy',
          description: 'Max non-adjacent sum in `{2, 7, 9, 3, 1}` -> 12',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 7, 9, 3, 1};
    // TODO: prev2, prev1 rolling variables
    return 0;
}`,
          expectedOutput: '12',
          hints: ['2 + 9 + 1 = 12.'],
        },
        {
          id: 'cp-7-5',
          title: 'Longest Common Subsequence Length',
          difficulty: 'Medium',
          description: 'Find LCS length between `"abcde"` and `"ace"` -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    string a = "abcde", b = "ace";
    // TODO: 2D dp[i][j] table
    return 0;
}`,
          expectedOutput: '3',
          hints: ['If `a[i-1] == b[j-1]` -> `1 + dp[i-1][j-1]`, else `max(dp[i-1][j], dp[i][j-1])`.'],
        },
        {
          id: 'cp-7-6',
          title: 'Edit Distance (Levenshtein)',
          difficulty: 'Hard',
          description: 'Min insert/delete/replace ops transforming `"horse"` -> `"ros"` -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    string a = "horse", b = "ros";
    // TODO
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Initialize `dp[i][0] = i` and `dp[0][j] = j`.'],
        },
        {
          id: 'cp-7-7',
          title: 'Unique Grid Paths (3x7)',
          difficulty: 'Easy',
          description: 'Count paths top-left to bottom-right on 3x7 grid moving only Right or Down -> 28',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int r = 3, c = 7;
    // TODO: 1D DP row update dp[j] += dp[j - 1]
    return 0;
}`,
          expectedOutput: '28',
          hints: ['Initialize row of size 7 with all 1s, run `r - 1` outer passes.'],
        },
        {
          id: 'cp-7-8',
          title: 'LIS O(N log N) Patience Sorting',
          difficulty: 'Medium',
          description: 'Length of Longest Strictly Increasing Subsequence in `{0, 1, 0, 3, 2, 3}` -> 4',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {0, 1, 0, 3, 2, 3};
    // TODO: Maintain tails vector with lower_bound
    return 0;
}`,
          expectedOutput: '4',
          hints: ['`0, 1, 2, 3` has length 4. Use `lower_bound` (strict) vs `upper_bound` (non-decreasing).'],
        },
        {
          id: 'cp-7-9',
          title: 'Partition Equal Subset Sum',
          difficulty: 'Medium',
          description: 'Can `{1, 5, 11, 5}` be split into two equal-sum subsets? Print `1` or `0` -> 1',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 5, 11, 5};
    // TODO: Subset sum for total/2 using bool vector
    return 0;
}`,
          expectedOutput: '1',
          hints: ['Total=22, target=11; `{1,5,5}` vs `{11}`.'],
        },
        {
          id: 'cp-7-10',
          title: 'Fenwick Tree (BIT) Point Update & Range Query',
          difficulty: 'Hard',
          description: 'Build 1-indexed BIT on `{2, 1, 1, 3, 2, 3}`, add `+5` at idx 4 (val 3->8), query sum `[1..5]` -> 14',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 1, 1, 3, 2, 3};
    // TODO: Implement add(idx, val) & prefix(idx), update 1-indexed pos 4 by +5, query prefix(5)
    return 0;
}`,
          expectedOutput: '14',
          hints: ['Sum first 5 elements initially 2+1+1+3+2 = 9; +5 at pos 4 gives 14.'],
        },
      ],
    },
  ],
};
