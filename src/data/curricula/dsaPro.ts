import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const DSA_PRO_SPEC: TrackSpec = {
  id: 'dsa-learning',
  language: 'dsa',
  track: 'learning',
  title: 'DSA & System Design Interview Pro Track',
  tagline: 'Trees/BST, Heaps/Top-K, Tries & DSU, Graphs, 2D DP, Monotonic Stack & System Design',
  icon: '🧠',
  color: 'text-violet-500 dark:text-violet-400',
  badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  borderColor: 'border-violet-400/30 hover:border-violet-400/70',
  description:
    'Complete FAANG/ICPC interview prep bridging Binary Trees & BSTs, Heaps, Tries & Union-Find, Shortest-Path Graphs, Dynamic Programming, Intervals, and System Design primitives with 70 problems.',
  compilerLanguage: 'cpp',
  compilerDisplayName: 'C++ / DSA & Systems Engine',
  estimatedTotalHours: '28 Hours',
  prerequisites: ['Completion of DSA Foundation Track or solid Arrays/Recursion skills'],
  outcomes: [
    'Solve any Tree/BST traversal, LCA, and Diameter problem cleanly',
    'Combine Tries, DSU (Union-Find), and Priority Queues in multi-stage graphs',
    'Architect Grid/Knapsack/Interval/Bitmask DP state transitions',
    'Code Consistent Hashing, Token Buckets, Bloom Filters, and Rate Limiters',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Binary Trees, BSTs & Lowest Common Ancestor',
      topic: 'DFS Traversals, Level-Order, Diameter & LCA',
      estimatedTime: '3.5 Hours',
      summary:
        'Master recursive post-order tree DP (`height`, `diameter`, `maxPathSum`), BFS level-order queues, BST validation via `(min, max)` bounds, and Lowest Common Ancestor.',
      studyMaterial: {
        overview:
          '90% of Binary Tree interview questions solve cleanly by returning structured info bottom-up (Post-Order DFS) or tracking `[low, high]` valid bounds top-down.',
        keyPoints: [
          'BST Validation Trap: Never compare ONLY direct children (`left < root < right`)! Pass strict `[minAllowed, maxAllowed]` range bounds down recursively.',
          'Tree Diameter computes `leftH + rightH` at each node while returning `1 + max(leftH, rightH)` up to parent in a single O(N) pass.',
          'Lowest Common Ancestor in any Binary Tree returns `root` whenever `root == p || root == q` OR both subtrees return non-null.',
        ],
        codeExamples: [
          {
            title: 'O(N) Tree Diameter Bottom-Up DFS',
            code: `#include <iostream>
using namespace std;

struct Tree { int v; Tree *l, *r; };
int height(Tree* n, int& dia) {
    if (!n) return 0;
    int lh = height(n->l, dia), rh = height(n->r, dia);
    dia = max(dia, lh + rh);
    return 1 + max(lh, rh);
}
int main() {
    Tree n4{4,nullptr,nullptr}, n5{5,nullptr,nullptr}, n2{2,&n4,&n5}, n3{3,nullptr,nullptr}, root{1,&n2,&n3};
    int dia = 0; height(&root, dia);
    cout << "Diameter edges: " << dia << '\\n';
}`,
            explanation: 'Computes edge diameter `3` cleanly in single O(N) traversal.',
          },
        ],
        cheatsheet: [
          'Validate BST -> dfs(node, minBound, maxBound)',
          'Level Order -> queue<Tree*>, snapshot int sz = q.size() per level',
          'Inorder of BST -> strictly sorted ascending sequence!',
        ],
        officialDocUrl: 'https://www.geeksforgeeks.org/binary-tree-data-structure/',
      },
      video: yt(
        'Binary Tree Algorithms for Technical Interviews',
        'freeCodeCamp.org',
        'fAAZixBzIAI',
        '1h 58m',
        'Step-by-step mastery of DFS/BFS trees, max path sum, height/diameter, and LCA.',
      ),
      compilerStarterCode: `#include <iostream>
#include <queue>
using namespace std;

struct Node { int v; Node *l, *r; };
int main() {
    Node b{2,nullptr,nullptr}, c{3,nullptr,nullptr}, a{1,&b,&c};
    queue<Node*> q; q.push(&a);
    while (!q.empty()) {
        int sz = q.size();
        while (sz--) {
            Node* cur = q.front(); q.pop();
            cout << cur->v << " ";
            if (cur->l) q.push(cur->l);
            if (cur->r) q.push(cur->r);
        }
        cout << "| ";
    }
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'dp-1-1',
          title: 'Binary Tree Level-Order Right Side View',
          difficulty: 'Medium',
          description: 'Print rightmost node of each level in tree `1 -> (2 -> (_,5), 3 -> (_,4))` -> 1 3 4',
          starterCode: `#include <iostream>
#include <queue>
using namespace std;

struct Node { int v; Node *l, *r; };
int main() {
    Node n5{5,nullptr,nullptr}, n4{4,nullptr,nullptr}, n2{2,nullptr,&n5}, n3{3,nullptr,&n4}, n1{1,&n2,&n3};
    // TODO: BFS printing last element popped in each level batch
    return 0;
}`,
          expectedOutput: '1 3 4',
          hints: ['At index `i == sz - 1` inside the level loop, print `cur->v`.'],
        },
        {
          id: 'dp-1-2',
          title: 'Validate Binary Search Tree Bounds',
          difficulty: 'Medium',
          description: 'Validate invalid BST `5 -> (1, 4 -> (3, 6))` (4 < 5 on right!) -> 0',
          starterCode: `#include <iostream>
#include <climits>
using namespace std;

struct Node { int v; Node *l, *r; };
bool validBST(Node* n, long long lo, long long hi) {
    // TODO
    return false;
}
int main() {
    Node n3{3,nullptr,nullptr}, n6{6,nullptr,nullptr}, n4{4,&n3,&n6}, n1{1,nullptr,nullptr}, root{5,&n1,&n4};
    cout << validBST(&root, LLONG_MIN, LLONG_MAX) << '\\n';
}`,
          expectedOutput: '0',
          hints: ['Pass `(lo, n->v)` to left subtree and `(n->v, hi)` to right subtree checking strict `<`.'],
        },
        {
          id: 'dp-1-3',
          title: 'Diameter of Binary Tree (Max Edges)',
          difficulty: 'Easy',
          description: 'Tree `1 -> (2 -> (4, 5), 3)`: print longest edge path between any two nodes -> 3',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node *l, *r; };
// TODO
int main() {
    Node n4{4,nullptr,nullptr}, n5{5,nullptr,nullptr}, n2{2,&n4,&n5}, n3{3,nullptr,nullptr}, root{1,&n2,&n3};
    // TODO
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Track `dia = max(dia, lh + rh)` inside height helper.'],
        },
        {
          id: 'dp-1-4',
          title: 'Lowest Common Ancestor (General Tree)',
          difficulty: 'Medium',
          description: 'Tree `3 -> (5 -> (6, 2), 1)`. Find LCA of nodes `6` and `2` -> 5',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node *l, *r; };
Node* lca(Node* r, Node* p, Node* q) {
    // TODO
    return nullptr;
}
int main() {
    Node n6{6,nullptr,nullptr}, n2{2,nullptr,nullptr}, n5{5,&n6,&n2}, n1{1,nullptr,nullptr}, root{3,&n5,&n1};
    cout << lca(&root, &n6, &n2)->v << '\\n';
}`,
          expectedOutput: '5',
          hints: ['If both `left` and `right` calls return non-null, `root` IS the split point (LCA)!'],
        },
        {
          id: 'dp-1-5',
          title: 'Kth Smallest Element in BST',
          difficulty: 'Medium',
          description: 'BST `5 -> (3 -> (2, 4), 6)`: find `k = 3`rd smallest via Inorder DFS -> 4',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node *l, *r; };
// TODO: Inorder counter decrementing k
int main() {
    Node n2{2,nullptr,nullptr}, n4{4,nullptr,nullptr}, n3{3,&n2,&n4}, n6{6,nullptr,nullptr}, root{5,&n3,&n6};
    // TODO
    return 0;
}`,
          expectedOutput: '4',
          hints: ['Inorder visits `2, 3, 4, 5, 6` cleanly—return when `--k == 0`.'],
        },
        {
          id: 'dp-1-6',
          title: 'Binary Tree Maximum Path Sum',
          difficulty: 'Hard',
          description: 'Tree `-10 -> (9, 20 -> (15, 7))`: print highest sum path (any node-to-node) -> 42',
          starterCode: `#include <iostream>
#include <climits>
using namespace std;

struct Node { int v; Node *l, *r; };
// TODO: Clamp negative child gains via max(0, dfs(child))
int main() {
    Node n15{15,nullptr,nullptr}, n7{7,nullptr,nullptr}, n20{20,&n15,&n7}, n9{9,nullptr,nullptr}, root{-10,&n9,&n20};
    // TODO
    return 0;
}`,
          expectedOutput: '42',
          hints: ['Path `15 -> 20 -> 7` = `42`. Clamp negative subtree gains to `0` before returning upward!'],
        },
        {
          id: 'dp-1-7',
          title: 'Invert (Mirror) Binary Tree Preorder Check',
          difficulty: 'Easy',
          description: 'Mirror `4 -> (2 -> (1, 3), 7)` swapping left/right children and print Preorder -> 4 7 2 3 1',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node *l, *r; };
// TODO: invert(Node*) + preorder print
int main() {
    Node n1{1,nullptr,nullptr}, n3{3,nullptr,nullptr}, n2{2,&n1,&n3}, n7{7,nullptr,nullptr}, root{4,&n2,&n7};
    // TODO
    return 0;
}`,
          expectedOutput: '4 7 2 3 1',
          hints: ['Swap `r->l` and `r->r`, then recurse cleanly on children.'],
        },
        {
          id: 'dp-1-8',
          title: 'Check Height-Balanced Binary Tree',
          difficulty: 'Easy',
          description: 'Return `-1` sentinel early if `abs(lh - rh) > 1` on skewed chain `1 -> (2 -> (3, _), _)` -> 0',
          starterCode: `#include <iostream>
#include <cmath>
using namespace std;

struct Node { int v; Node *l, *r; };
// TODO: O(N) bottom-up height balance check returning -1 on imbalance
int main() {
    Node n3{3,nullptr,nullptr}, n2{2,&n3,nullptr}, root{1,&n2,nullptr};
    // TODO: Print (checkHeight(&root) != -1)
    return 0;
}`,
          expectedOutput: '0',
          hints: ['Left height 2 vs right height 0 differs by 2 > 1 -> unbalanced (`0`).'],
        },
        {
          id: 'dp-1-9',
          title: 'Root-to-Leaf Path Sum Match',
          difficulty: 'Easy',
          description: 'Tree `5 -> (4 -> (11, _), 8)`: check if a root-to-leaf path sums to `20` -> 1',
          starterCode: `#include <iostream>
using namespace std;

struct Node { int v; Node *l, *r; };
bool hasSum(Node* r, int rem) {
    // TODO: Must terminate at a LEAF (!l && !r)
    return false;
}
int main() {
    Node n11{11,nullptr,nullptr}, n4{4,&n11,nullptr}, n8{8,nullptr,nullptr}, root{5,&n4,&n8};
    cout << hasSum(&root, 20) << '\\n';
}`,
          expectedOutput: '1',
          hints: ['`5 -> 4 -> 11` ends at leaf 11 summing to 20!'],
        },
        {
          id: 'dp-1-10',
          title: 'Build Balanced BST From Sorted Array',
          difficulty: 'Easy',
          description: 'Convert `{1, 2, 3, 4, 5, 6, 7}` recursively by picking `mid` as root; print root value and height -> 4 3',
          starterCode: `#include <iostream>
#include <vector>
#include <memory>
using namespace std;

struct Node { int v; unique_ptr<Node> l, r; };
// TODO: build(a, lo, hi) picking mid = (lo + hi) / 2
int main() {
    vector<int> a = {1,2,3,4,5,6,7};
    // TODO
    return 0;
}`,
          expectedOutput: '4 3',
          hints: ['`mid = 3` gives root value `4`, symmetric 3 levels high (`height = 3`).'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'Heaps, Priority Queues & Top-K Streams',
      topic: 'K-Way Merge, Scheduling & Task Cooldowns',
      estimatedTime: '3 Hours',
      summary:
        'Master multi-way K-sorted list merges, K-Closest Points without full sorting, greedy CPU Task Scheduling cooldowns, and Median-of-Stream dual heaps.',
      studyMaterial: {
        overview:
          'Priority queues maintain dynamic extrema in O(log N). For "Top K" over N elements, bounding heap size to `K` keeps runtime O(N log K) and heap RAM strictly O(K)!',
        keyPoints: [
          'K-Largest uses a **Min-Heap** of size K (kick smallest when size > K); K-Smallest uses a **Max-Heap** of size K.',
          'Task Scheduler minimum intervals = `max(totalTasks, (maxFreq - 1) * (n + 1) + countWithMaxFreq)`.',
          'K-Way Merge pushes 1st element from each of `K` lists into a Min-Heap of tuples `(val, listIdx, elemIdx)`.',
        ],
        codeExamples: [
          {
            title: 'K-Way Sorted Merge in O(N log K)',
            code: `#include <iostream>
#include <vector>
#include <queue>
#include <tuple>
using namespace std;

int main() {
    vector<vector<int>> lists = {{1, 4, 7}, {2, 5}, {3, 6, 8}};
    using T = tuple<int, int, int>;
    priority_queue<T, vector<T>, greater<T>> pq;
    for (int i = 0; i < (int)lists.size(); i++) pq.push({lists[i][0], i, 0});
    while (!pq.empty()) {
        auto [v, li, idx] = pq.top(); pq.pop();
        cout << v << " ";
        if (idx + 1 < (int)lists[li].size()) pq.push({lists[li][idx + 1], li, idx + 1});
    }
}`,
            explanation: 'Streams `1 2 3 4 5 6 7 8` cleanly in O(N log K) without concatenating arrays.',
          },
        ],
        cheatsheet: [
          'Top-K Largest -> Min-Heap size K',
          'K-Way Merge -> heap tuple (val, listIdx, elemIdx)',
          'Two Heaps Median -> MaxHeap(lowHalf) + MinHeap(highHalf)',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/container/priority_queue',
      },
      video: yt(
        'Data Structures: Heaps & Priority Queues',
        'HackerRank',
        't0Cq6tVNRBA',
        '10m',
        'Visual breakdown of heapify, sift-up/sift-down, and running median dual heaps.',
      ),
      compilerStarterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {10, 4, 2, 18, 7};
    priority_queue<int> maxH;
    for (int x : a) { maxH.push(x); if (maxH.size() > 2) maxH.pop(); }
    cout << "2nd smallest: " << maxH.top() << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'dp-2-1',
          title: 'Merge 3 Sorted Lists via Min-Heap',
          difficulty: 'Medium',
          description: 'Merge `{1,4,7}`, `{2,5}`, `{3,6,8}` in O(N log K) -> 1 2 3 4 5 6 7 8',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
#include <tuple>
using namespace std;

int main() {
    vector<vector<int>> lists = {{1,4,7},{2,5},{3,6,8}};
    // TODO
    return 0;
}`,
          expectedOutput: '1 2 3 4 5 6 7 8',
          hints: ['Guard `!lists[i].empty()` before seeding heap tuples `{val, li, 0}`.'],
        },
        {
          id: 'dp-2-2',
          title: 'K Closest Points to Origin',
          difficulty: 'Medium',
          description: 'Find `2` closest points to `(0,0)` among `{{3,3},{5,-1},{-2,4}}` using Max-Heap of `distSq`, print sum of their squared distances -> 38',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    vector<pair<int,int>> pts = {{3,3},{5,-1},{-2,4}}; int k = 2;
    // TODO: Keep size-k Max-Heap of (x*x + y*y); print sum of 2 kept distances
    return 0;
}`,
          expectedOutput: '38',
          hints: ['`(3,3)=18`, `(-2,4)=20`, `(5,-1)=26` -> 2 smallest sum `18 + 20 = 38`.'],
        },
        {
          id: 'dp-2-3',
          title: 'Last Stone Weight Simulation',
          difficulty: 'Easy',
          description: 'Repeatedly smash two heaviest stones in `{2, 7, 4, 1, 8, 1}` leaving `abs(y - x)` until <= 1 remains -> 1',
          starterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    vector<int> s = {2, 7, 4, 1, 8, 1};
    // TODO: Max-Heap popping top two
    return 0;
}`,
          expectedOutput: '1',
          hints: ['8&7->1, 4&2->2, 2&1->1, 1&1->0, last 1 remains.'],
        },
        {
          id: 'dp-2-4',
          title: 'Task Scheduler Minimum CPU Cycles',
          difficulty: 'Medium',
          description: 'Tasks `AAABBB` with cooldown `n = 2` -> min CPU intervals: 8',
          starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string tasks = "AAABBB"; int n = 2;
    // TODO: (maxFreq - 1) * (n + 1) + countMaxFreq vs total tasks
    return 0;
}`,
          expectedOutput: '8',
          hints: ['`A B _ A B _ A B` = 8 cycles.'],
        },
        {
          id: 'dp-2-5',
          title: 'Reorganize String No Adjacent Equal',
          difficulty: 'Medium',
          description: 'Check whether `"aab"` can rearrange with no two adjacent equal (`YES`) and `"aaab"` (`NO`) -> YES NO',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

string canReorg(const string& s) {
    // TODO: Feasibility rule: maxFreq <= (n + 1) / 2
    return "";
}
int main() {
    cout << canReorg("aab") << " " << canReorg("aaab") << '\\n';
}`,
          expectedOutput: 'YES NO',
          hints: ['In `"aab"`, `"aba"` works (`2 <= 2`). In `"aaab"`, `3 > 2` -> impossible.'],
        },
        {
          id: 'dp-2-6',
          title: 'Running Median Data Stream',
          difficulty: 'Hard',
          description: 'Insert `{12, 4, 5, 3, 8, 7}` one by one and print medians after ALL 6 inserted formatted `.1f` -> 6.0',
          starterCode: `#include <iostream>
#include <iomanip>
#include <queue>
#include <vector>
using namespace std;

int main() {
    vector<int> stream = {12, 4, 5, 3, 8, 7};
    // TODO: Balance Max-Heap lo and Min-Heap hi
    return 0;
}`,
          expectedOutput: '6.0',
          hints: ['Sorted: `3, 4, 5, 7, 8, 12` -> average of middle `5` and `7` = `6.0`.'],
        },
        {
          id: 'dp-2-7',
          title: 'IPO Maximized Capital Greedy Heap',
          difficulty: 'Hard',
          description: 'Start `w = 0`, pick at most `k = 2` projects from `profits={1,2,3}`, `capital={0,1,1}`. Print final capital -> 4',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

int main() {
    int k = 2, w = 0;
    vector<int> prof = {1, 2, 3}, cap = {0, 1, 1};
    // TODO: Push newly affordable project profits into Max-Heap
    return 0;
}`,
          expectedOutput: '4',
          hints: ['Pick cap=0 project (+1 -> w=1), then pick cap=1 max profit (+3 -> w=4).'],
        },
        {
          id: 'dp-2-8',
          title: 'Minimum Meeting Rooms Required',
          difficulty: 'Medium',
          description: 'Intervals `{{0,30},{5,10},{15,20}}`. Sort by start, use Min-Heap of end times -> 2',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> m = {{0,30},{5,10},{15,20}};
    // TODO: Pop heap if earliest end <= current start before pushing current end
    return 0;
}`,
          expectedOutput: '2',
          hints: ['`pq.size()` after loop gives peak concurrent rooms needed!'],
        },
        {
          id: 'dp-2-9',
          title: 'Kth Smallest Element in Sorted Matrix',
          difficulty: 'Medium',
          description: 'Find `8`th smallest in `{{1,5,9},{10,11,13},{12,13,15}}` -> 13',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
#include <tuple>
using namespace std;

int main() {
    vector<vector<int>> mat = {{1,5,9},{10,11,13},{12,13,15}}; int k = 8;
    // TODO: Min-Heap across row heads or Binary Search on value!
    return 0;
}`,
          expectedOutput: '13',
          hints: ['Wait 8th element of `{1,5,9,10,11,12,13,13,15}` is `13`.'],
        },
        {
          id: 'dp-2-10',
          title: 'Verify Valid Max-Heap Array Property',
          difficulty: 'Easy',
          description: 'Check `{90, 15, 10, 7, 12, 2}` and `{9, 15, 10}` for valid Max-Heap parent >= children -> 1 0',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

bool isHeap(const vector<int>& a) {
    // TODO: For i < a.size()/2, check a[i] >= children 2i+1 and 2i+2
    return false;
}
int main() {
    cout << isHeap({90, 15, 10, 7, 12, 2}) << " " << isHeap({9, 15, 10}) << '\\n';
}`,
          expectedOutput: '1 0',
          hints: ['Guard `2*i + 2 < a.size()` before inspecting right child.'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Tries & Disjoint Set Union (DSU)',
      topic: 'Prefix Trees, Autocomplete & Union-Find',
      estimatedTime: '3 Hours',
      summary:
        'Implement Prefix Tries for O(L) dictionary/wildcard lookup and Disjoint Set Union with Path Compression + Union by Size for near-O(1) connectivity.',
      studyMaterial: {
        overview:
          'When queries ask **"Do any words start with `pre`?"**, a Trie beats sorting or regex cleanly. When edges connect components dynamically (**Connected Components**, **Redundant Edge**, **Accounts Merge**), **DSU with Path Compression + Union by Size** runs in O(α(N)) amortized (~O(1)).',
        keyPoints: [
          'Combine BOTH Path Compression (`parent[x] = find(parent[x])`) AND Union by Size/Rank in DSU.',
          'DSU `components` starts at `N` and decrements by 1 each time `unite(u, v)` merges two previously separate roots.',
          'Tries support DFS wildcard `.` matching seamlessly in backtracked grid/word searches.',
        ],
        codeExamples: [
          {
            title: 'Compact Union-Find (DSU) Class',
            code: `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

struct DSU {
    vector<int> p, sz; int comps;
    DSU(int n) : p(n), sz(n, 1), comps(n) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b]; comps--; return true;
    }
};
int main() { DSU d(4); d.unite(0,1); d.unite(2,3); cout << d.comps << '\\n'; }`,
            explanation: 'Clean 10-line DSU maintaining live connected component count.',
          },
        ],
        cheatsheet: [
          'DSU unite(u,v) == false -> edge creates a cycle!',
          'Trie search vs startsWith -> check node->isEnd vs non-null',
        ],
        officialDocUrl: 'https://cp-algorithms.com/data_structures/disjoint_set_union.html',
      },
      video: yt(
        'NeetCode 150 Tries & Union-Find Patterns',
        'freeCodeCamp.org',
        'T0u5nwSA0w0',
        '9h 40m',
        'Covers Implement Trie, Word Dictionary Wildcard Search, and Number of Connected Components via DSU.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int main() {
    int n = 5; vector<int> p(n); iota(p.begin(), p.end(), 0);
    auto find = [&](auto& self, int x) -> int { return p[x] == x ? x : p[x] = self(self, p[x]); };
    p[1] = 0; p[2] = 1;
    cout << find(find, 2) << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'dp-3-1',
          title: 'Trie Insert, Search & Prefix Check',
          difficulty: 'Medium',
          description: 'Insert `{"arena","art","code"}`, test `search("art")`, `search("ar")`, `startsWith("ar")` -> 1 0 1',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

struct TrieNode {
    TrieNode* c[26]{};
    bool end = false;
};
// TODO: insert, search, startsWith
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '1 0 1',
          hints: ['Note `"ar"` is a valid prefix (`startsWith == 1`) even though `end == false` (`search == 0`).'],
        },
        {
          id: 'dp-3-2',
          title: 'Trie Wildcard Search (. Matches Any)',
          difficulty: 'Medium',
          description: 'Insert `{"bad","dad","mad"}`. Search `".ad"` and `"b.."` and `"b.x"` -> 1 1 0',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: DFS trie search branching over all non-null children when ch == '.'
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '1 1 0',
          hints: ['Branch across `0..25` only when `word[idx] == \'.\'`.'],
        },
        {
          id: 'dp-3-3',
          title: 'Connected Components Count via DSU',
          difficulty: 'Easy',
          description: '5 nodes `0..4`, edges `{(0,1),(1,2),(3,4)}`. Print final component count -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

// TODO: DSU tracks components initialized to n, decrementing on successful merge
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '2',
          hints: ['`5 - 3 = 2` disjoint components.'],
        },
        {
          id: 'dp-3-4',
          title: 'Find Redundant Cycle-Forming Edge',
          difficulty: 'Medium',
          description: 'Edges in order `{{1,2},{1,3},{2,3}}` over nodes `1..3`. Print the first edge creating a cycle -> 2 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<pair<int,int>> edges = {{1,2},{1,3},{2,3}};
    // TODO: First edge where !dsu.unite(u, v) is the redundant cycle edge!
    return 0;
}`,
          expectedOutput: '2 3',
          hints: ['If `find(u) == find(v)` BEFORE uniting, `(u, v)` closes a cycle!'],
        },
        {
          id: 'dp-3-5',
          title: 'Replace Words With Shortest Trie Root',
          difficulty: 'Medium',
          description: 'Roots `{"cat","bat","rat"}`, sentence `"the cattle was rattled by battery"` -> the cat was rat by bat',
          starterCode: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

// TODO: Insert roots in Trie; return shortest prefix ending at end == true
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: 'the cat was rat by bat',
          hints: ['Stop immediately at the FIRST Trie node marked `end == true` while scanning each word!'],
        },
        {
          id: 'dp-3-6',
          title: 'Accounts Merge Connected Emails',
          difficulty: 'Medium',
          description: 'Emails connected across users: `[["a@x","b@x"],["b@x","c@x"],["d@y"]]`. Count distinct merged owners -> 2',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

// TODO: Map email -> first account index and unite(owner, i) in DSU
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Accounts 0 & 1 share `"b@x"` so they merge into 1 component, leaving 2 total.'],
        },
        {
          id: 'dp-3-7',
          title: 'Satisfiability of Equality Equations',
          difficulty: 'Medium',
          description: 'Check `{"a==b","b!=c","c==a"}` for contradiction -> 0',
          starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<string> eq = {"a==b","b!=c","c==a"};
    // TODO: Pass 1 unite all == pairs; Pass 2 check no != pair has find(u) == find(v)
    return 0;
}`,
          expectedOutput: '0',
          hints: ['Process all `==` equations FIRST, then validate every `!=` inequality.'],
        },
        {
          id: 'dp-3-8',
          title: 'Trie Prefix Word Counter',
          difficulty: 'Easy',
          description: 'Store `passCount` per Trie node for `{"code","coder","coding","cat"}`. Query count starting with `"cod"` -> 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

// TODO: Increment cur->pass++ on each visited node during insert
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Walking `"cod"` reads `passCount` directly in O(len("cod")) time!'],
        },
        {
          id: 'dp-3-9',
          title: 'Largest Island Size Tracking in DSU',
          difficulty: 'Hard',
          description: 'Binary grid `{{1,1,0},{1,0,0},{0,1,1}}`. Unite adjacent 1s via DSU and print size of largest component -> 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> g = {{1,1,0},{1,0,0},{0,1,1}};
    // TODO: Index cell (r, c) as r * C + c; unite right & down neighbors; print max component size
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Top-left L-shape connects 3 cells `(0,0)-(0,1)-(1,0)`.'],
        },
        {
          id: 'dp-3-10',
          title: 'Longest Word Built One Char at a Time',
          difficulty: 'Medium',
          description: 'In `{"w","wo","wor","worl","world"}`, find longest word whose every prefix exists (`"world"`) -> world',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>
using namespace std;

int main() {
    vector<string> words = {"w","wo","wor","worl","world"};
    // TODO: Insert in Trie or check sorted words with set of buildable prefixes
    return 0;
}`,
          expectedOutput: 'world',
          hints: ['When sorted lexicographically, word `w` is valid iff `w.size() == 1` OR `w.substr(0, len-1)` is valid!'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Advanced Graphs: Multi-Source BFS, 0-1 BFS & DAG Paths',
      topic: 'Rotting Oranges, Shortest Bridges & Bellman-Ford',
      estimatedTime: '3.5 Hours',
      summary:
        'Master multi-source wave BFS (Rotting Oranges), Cycle/Course Schedule II ordering, Bellman-Ford negative edges check, and Minimum Effort Grid Dijkstra.',
      studyMaterial: {
        overview:
          'Instead of running N separate BFS searches from each starting source, push **ALL sources into the queue at t = 0** (`Multi-Source BFS`)—calculating minimum wave arrival distance across the entire graph in a single O(V + E) pass!',
        keyPoints: [
          'Multi-Source BFS starts by pushing all initial targets (`grid[r][c] == 2` or `0`) before popping level by level.',
          'Bellman-Ford relaxes all edges `V - 1` times; if a `V`-th relaxation improves any distance, a negative cycle exists.',
          'Grid problems with weights (`path effort` = max edge difference) use Dijkstra with `min` priority queue.',
        ],
        codeExamples: [
          {
            title: 'Multi-Source Wave Level Template',
            code: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    vector<vector<int>> g = {{2,1,1},{1,1,0},{0,1,1}};
    queue<pair<int,int>> q; int fresh = 0, mins = 0;
    for (int r=0; r<3; r++) for (int c=0; c<3; c++) {
        if (g[r][c]==2) q.push({r,c}); else if (g[r][c]==1) fresh++;
    }
    int dr[]={-1,1,0,0}, dc[]={0,0,-1,1};
    while (!q.empty() && fresh > 0) {
        int sz = q.size(); mins++;
        while (sz--) {
            auto [r,c] = q.front(); q.pop();
            for (int d=0; d<4; d++) {
                int nr=r+dr[d], nc=c+dc[d];
                if (nr>=0&&nr<3&&nc>=0&&nc<3&&g[nr][nc]==1) { g[nr][nc]=2; fresh--; q.push({nr,nc}); }
            }
        }
    }
    cout << (fresh == 0 ? mins : -1) << '\\n';
}`,
            explanation: 'Rots entire grid cleanly in 4 minutes without redundant per-source restarts.',
          },
        ],
        cheatsheet: [
          'Multi-Source BFS -> push all sources first, track fresh count & wave rounds',
          'Course Schedule -> indegree == 0 queue (detect cycle if visited < N)',
          'Bellman-Ford -> V-1 edge relaxations handles negative weights',
        ],
        officialDocUrl: 'https://cp-algorithms.com/graph/breadth-first-search.html',
      },
      video: yt(
        'Graph Algorithms Full Course — Multi-Source & Shortest Paths',
        'freeCodeCamp.org',
        'tWVWeAqZ0WU',
        '2h 12m',
        'Covers multi-source grid traversal, shortest path relaxation, and directed cycles.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n = 4; vector<vector<int>> adj = {{1,2},{3},{3},{}};
    vector<int> deg(n, 0);
    for (auto& vs : adj) for (int v : vs) deg[v]++;
    queue<int> q; for (int i=0; i<n; i++) if (deg[i]==0) q.push(i);
    int seen = 0;
    while (!q.empty()) { int u = q.front(); q.pop(); seen++; for (int v: adj[u]) if (--deg[v]==0) q.push(v); }
    cout << (seen == n) << '\\n';
}`,
      practiceQuestions: [
        {
          id: 'dp-4-1',
          title: 'Rotting Oranges Multi-Source BFS',
          difficulty: 'Medium',
          description: 'Grid `{{2,1,1},{1,1,0},{0,1,1}}`: print minutes until all fresh oranges rot (`-1` if impossible) -> 4',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    vector<vector<int>> g = {{2,1,1},{1,1,0},{0,1,1}};
    // TODO
    return 0;
}`,
          expectedOutput: '4',
          hints: ['Only increment `mins` while `fresh > 0` and queue isn’t empty.'],
        },
        {
          id: 'dp-4-2',
          title: 'Course Schedule Cycle Feasibility',
          difficulty: 'Medium',
          description: 'Courses `0, 1` with prerequisites `{(1,0),(0,1)}` (deadlock!). Print `1` if completable else `0` -> 0',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n = 2; vector<pair<int,int>> pre = {{1,0},{0,1}};
    // TODO: Kahn's topological check (processed == n)
    return 0;
}`,
          expectedOutput: '0',
          hints: ['Directed cycle `0 -> 1 -> 0` leaves both indegrees >= 1 -> `processed = 0 != 2`.'],
        },
        {
          id: 'dp-4-3',
          title: '0-1 Matrix Nearest Zero Distance',
          difficulty: 'Medium',
          description: 'Grid `{{0,0,0},{0,1,0},{1,1,1}}`: compute shortest distance from each cell to any `0` via Multi-Source BFS, print `dist[2][1]` -> 2',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    vector<vector<int>> g = {{0,0,0},{0,1,0},{1,1,1}};
    // TODO: Push all 0 cells at dist 0; initialize 1 cells to -1
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Cell `(2,1)` sits 2 steps away from `0` at `(0,1)` / `(1,0)` / `(1,2)`.'],
        },
        {
          id: 'dp-4-4',
          title: 'Network Delay Time (Dijkstra Max Dist)',
          difficulty: 'Medium',
          description: 'Nodes `1..4`, directed edges `{{2,1,1},{2,3,1},{3,4,1}}`, source `k = 2`. Print max arrival time -> 2',
          starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n = 4, k = 2;
    // TODO: Run Dijkstra from k; answer max(dist[1..n]) or -1 if INF
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Node 1 takes 1, Node 3 takes 1, Node 4 takes 2 -> max = 2.'],
        },
        {
          id: 'dp-4-5',
          title: '0-1 BFS Deque Shortest Path',
          difficulty: 'Hard',
          description: '4 nodes `0..3` edges `0->1 (w=1)`, `0->2 (w=0)`, `2->3 (w=0)`, `1->3 (w=1)`. Print `dist[3]` using `deque` (`push_front` on w=0, `push_back` on w=1) -> 0',
          starterCode: `#include <iostream>
#include <vector>
#include <deque>
using namespace std;

int main() {
    int n = 4;
    vector<vector<pair<int,int>>> adj = {{{1,1},{2,0}}, {{3,1}}, {{3,0}}, {}};
    // TODO: 0-1 BFS deque in O(V + E)
    return 0;
}`,
          expectedOutput: '0',
          hints: ['Edges weighted 0 go to `dq.push_front(v)` and weighted 1 go to `dq.push_back(v)`.'],
        },
        {
          id: 'dp-4-6',
          title: 'Bellman-Ford Negative Weight Path',
          difficulty: 'Medium',
          description: '3 nodes `0->1:4`, `0->2:5`, `1->2:-3`. Print shortest `dist[2]` -> 1',
          starterCode: `#include <iostream>
#include <vector>
#include <tuple>
using namespace std;

int main() {
    int n = 3;
    vector<tuple<int,int,int>> edges = {{0,1,4},{0,2,5},{1,2,-3}};
    // TODO: Relax edges (n - 1) passes
    return 0;
}`,
          expectedOutput: '1',
          hints: ['`0 -> 1 (4) -> 2 (-3) = 1`.'],
        },
        {
          id: 'dp-4-7',
          title: 'Clone / Count Connected Provinces',
          difficulty: 'Easy',
          description: 'Adjacency matrix `{{1,1,0},{1,1,0},{0,0,1}}`. Count connected provinces via DFS -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> isConn = {{1,1,0},{1,1,0},{0,0,1}};
    // TODO
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Cities {0,1} form province 1; city {2} forms province 2.'],
        },
        {
          id: 'dp-4-8',
          title: 'DAG Shortest Path via Topo Order',
          difficulty: 'Medium',
          description: 'Topological order `0, 1, 2, 3`, edges `0->1:2, 0->2:6, 1->2:1, 2->3:3`. Relax along topo order and print `dist[3]` -> 6',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 4;
    vector<vector<pair<int,int>>> adj = {{{1,2},{2,6}},{{2,1}},{{3,3}},{}};
    // TODO: Relax along topological order [0,1,2,3] in O(V + E)
    return 0;
}`,
          expectedOutput: '6',
          hints: ['0->1->2->3 totals 2 + 1 + 3 = 6.'],
        },
        {
          id: 'dp-4-9',
          title: 'Cheapest Flights Within K Stops',
          difficulty: 'Medium',
          description: 'Edges `0->1:100, 1->2:100, 0->2:500`, src=`0`, dst=`2`, max `k=0` stops (direct only!). Print min cost -> 500',
          starterCode: `#include <iostream>
#include <vector>
#include <tuple>
using namespace std;

int main() {
    int n = 3, src = 0, dst = 2, k = 0;
    vector<tuple<int,int,int>> f = {{0,1,100},{1,2,100},{0,2,500}};
    // TODO: Run k + 1 Bellman-Ford rounds using cloned prevDist copy each round
    return 0;
}`,
          expectedOutput: '500',
          hints: ['Always relax from a frozen copy `tmp = dist` per round so paths don’t chain > 1 hop inside one step!'],
        },
        {
          id: 'dp-4-10',
          title: 'Euler / Celebrity Finder in O(N)',
          difficulty: 'Medium',
          description: 'Knows matrix `{{0,1,1},{0,0,1},{0,0,0}}`: person known by everyone else who knows nobody -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> knows = {{0,1,1},{0,0,1},{0,0,0}};
    // TODO: Candidate elimination pass then verification check
    return 0;
}`,
          expectedOutput: '2',
          hints: ['If `knows[cand][i] == 1`, cand cannot be celebrity (`cand = i`), then verify cand in row/col.'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: '1D & 2D Dynamic Programming Mastery',
      topic: 'Sequences, Grid Paths, Buy/Sell Cooldown & Trees',
      estimatedTime: '4 Hours',
      summary:
        'Master multi-dimensional DP state transitions: Decode Ways, Word Break, Longest Palindromic Subsequence, Buy/Sell Stock with Cooldown, and Target Sum.',
      studyMaterial: {
        overview:
          '2D DP covers strings (`dp[i][j]` over prefixes of `A` and `B`), intervals (`dp[l][r]`), and multi-state machines (`hold` vs `sold` vs `rest`).',
        keyPoints: [
          'Palindromic Subsequence on `s` equals **LCS(`s`, `reverse(s)`)** cleanly!',
          'Buy/Sell Stock with Cooldown turns tricky decision trees into 3 simple rolling states: `hold`, `sold`, `rest`.',
          'For **Word Break**, pre-load dictionary into a `unordered_set` and loop `dp[i]` looking back up to `maxWordLen`.',
        ],
        codeExamples: [
          {
            title: 'Decode Ways ("226") Clean 1D DP',
            code: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s = "226"; int n = s.size();
    vector<int> dp(n + 1, 0); dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        if (s[i-1] != '0') dp[i] += dp[i-1];
        if (i >= 2 && s.substr(i-2, 2) >= "10" && s.substr(i-2, 2) <= "26") dp[i] += dp[i-2];
    }
    cout << dp[n] << '\\n';
}`,
            explanation: 'Computes 3 valid decodings (`BZ`, `VF`, `BBF`) in O(N).',
          },
        ],
        cheatsheet: [
          'Longest Palindromic Subsequence(s) == LCS(s, reverse(s))',
          'Stock State Machine: hold, sold, rest',
          'Interval DP: loop length L = 2..N outward',
        ],
        officialDocUrl: 'https://cp-algorithms.com/dynamic_programming/intro-to-dp.html',
      },
      video: yt(
        'Dynamic Programming — Complete Interview Mastery',
        'freeCodeCamp.org',
        'oBt53YbR9Kk',
        '5h 10m',
        'Step-by-step DP table derivations across strings, grids, subsets, and sequences.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> prices = {1, 2, 3, 0, 2};
    int hold = -1e9, sold = 0, rest = 0;
    for (int p : prices) {
        int prevSold = sold;
        sold = hold + p;
        hold = max(hold, rest - p);
        rest = max(rest, prevSold);
    }
    cout << max(sold, rest) << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'dp-5-1',
          title: 'Decode Ways Counter',
          difficulty: 'Medium',
          description: 'Count ways to decode `"226"` (`A=1..Z=26`) -> 3',
          starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s = "226";
    // TODO
    return 0;
}`,
          expectedOutput: '3',
          hints: ["Guard '0' cleanly so standalone '0' adds 0 ways."],
        },
        {
          id: 'dp-5-2',
          title: 'Word Break Dictionary Split',
          difficulty: 'Medium',
          description: 'Verify `"leetcode"` can be segmented using `{"leet","code"}` and `"catsandog"` cannot with `{"cats","dog","sand","and","cat"}` -> 1 0',
          starterCode: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

bool canBreak(const string& s, const unordered_set<string>& dict) {
    // TODO: dp[i] true if any j < i has dp[j] && dict.count(s.substr(j, i - j))
    return false;
}
int main() {
    cout << canBreak("leetcode", {"leet","code"}) << " " << canBreak("catsandog", {"cats","dog","sand","and","cat"}) << '\\n';
}`,
          expectedOutput: '1 0',
          hints: ['Seed `dp[0] = true;` and return `dp[n]`.'],
        },
        {
          id: 'dp-5-3',
          title: 'Minimum Path Sum in Weighted Grid',
          difficulty: 'Medium',
          description: 'Grid `{{1,3,1},{1,5,1},{4,2,1}}` moving only Right or Down: print minimum sum `(0,0)->(2,2)` -> 7',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> g = {{1,3,1},{1,5,1},{4,2,1}};
    // TODO
    return 0;
}`,
          expectedOutput: '7',
          hints: ['Path `1->3->1->1->1` sums to `7`.'],
        },
        {
          id: 'dp-5-4',
          title: 'Longest Palindromic Subsequence Length',
          difficulty: 'Medium',
          description: 'Find length of longest palindromic subsequence in `"bbbab"` -> 4',
          starterCode: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string s = "bbbab";
    // TODO: Compute LCS(s, reversed(s)) or interval dp[l][r]
    return 0;
}`,
          expectedOutput: '4',
          hints: ['`"bbbb"` has length 4.'],
        },
        {
          id: 'dp-5-5',
          title: 'Buy & Sell Stock With 1-Day Cooldown',
          difficulty: 'Medium',
          description: 'Maximize profit on `{1, 2, 3, 0, 2}` where selling forces 1 rest day before next buy -> 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> prices = {1, 2, 3, 0, 2};
    // TODO: 3-state rolling DP (hold, sold, rest)
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Buy 1, sell 2 (+1), cooldown, buy 0, sell 2 (+2) -> total 3!'],
        },
        {
          id: 'dp-5-6',
          title: 'Distinct Subsequences Counting',
          difficulty: 'Hard',
          description: 'Count subsequences of `"rabbbit"` matching `"rabbit"` -> 3',
          starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s = "rabbbit", t = "rabbit";
    // TODO: 1D/2D DP counting matches
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Drop any one of the 3 `\'b\'`s -> 3 ways.'],
        },
        {
          id: 'dp-5-7',
          title: 'Burst Balloons Interval DP Max Coins',
          difficulty: 'Hard',
          description: 'Given `{3, 1, 5, 8}` padded with `1` on ends, maximize coins from bursting in optimal order -> 167',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 3, 1, 5, 8, 1};
    // TODO: Interval DP thinking which balloon k bursts LAST inside (l, r)
    return 0;
}`,
          expectedOutput: '167',
          hints: ['Bursting `k` LAST inside open range `(l, r)` yields `a[l]*a[k]*a[r] + dp[l][k] + dp[k][r]`.'],
        },
        {
          id: 'dp-5-8',
          title: 'Triangle Minimum Path Sum Bottom-Up',
          difficulty: 'Medium',
          description: 'Min top-to-bottom path in `{{2},{3,4},{6,5,7},{4,1,8,3}}` -> 11',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> t = {{2},{3,4},{6,5,7},{4,1,8,3}};
    // TODO: Walk rows upward updating dp[j] = t[r][j] + min(dp[j], dp[j+1])
    return 0;
}`,
          expectedOutput: '11',
          hints: ['`2 + 3 + 5 + 1 = 11`.'],
        },
        {
          id: 'dp-5-9',
          title: 'Target Sum (+/- Expressions)',
          difficulty: 'Medium',
          description: 'Count `+`/`-` sign assignments over `{1, 1, 1, 1, 1}` summing to `3` -> 5',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 1, 1, 1, 1}; int target = 3;
    // TODO: Reduces to subset count summing to (total + target) / 2!
    return 0;
}`,
          expectedOutput: '5',
          hints: ['Sum `+` minus Sum `-` = 3, Sum `+` plus Sum `-` = 5 -> subset sum = 4!'],
        },
        {
          id: 'dp-5-10',
          title: 'Interleaving String Verification',
          difficulty: 'Hard',
          description: 'Check if `"aadbbcbcac"` is an interleaving of `"aabcc"` and `"dbbca"` -> 1',
          starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac";
    // TODO: 2D/1D bool DP dp[i][j]
    return 0;
}`,
          expectedOutput: '1',
          hints: ['`dp[i][j]` holds true if `s3[0..i+j-1]` interleaves `s1[0..i-1]` and `s2[0..j-1]`.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'Monotonic Stack, Intervals & Greedy Mastery',
      topic: 'Maximal Rectangles, Non-Overlapping & Sweep Lines',
      estimatedTime: '3 Hours',
      summary:
        'Combine monotonic stack barriers (`leftSmaller`, `rightSmaller`), interval erasure minimum counts, Jump Game II BFS greedy, and Partition Labels.',
      studyMaterial: {
        overview:
          'Hard array problems combine a simple invariant across left/right passes: e.g., **Sum of Subarray Minimums** asks how far left and right each `a[i]` dominates using a Monotonic Stack!',
        keyPoints: [
          'Minimum intervals to remove to make non-overlapping = `N - maxCompatibleIntervals` (sort by **end** ascending!).',
          'Jump Game II runs O(N) greedy BFS using `[curEnd, farthest]`.',
          'Strict `<` on one side and `<=` on the other prevents double-counting equal minimums in Subarray Minimums.',
        ],
        codeExamples: [
          {
            title: 'Jump Game II O(N) Greedy Levels',
            code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 3, 1, 1, 4};
    int jumps = 0, curEnd = 0, far = 0;
    for (int i = 0; i < (int)a.size() - 1; i++) {
        far = max(far, i + a[i]);
        if (i == curEnd) { jumps++; curEnd = far; }
    }
    cout << jumps << '\\n';
}`,
            explanation: 'Computes minimum `2` jumps cleanly in O(N) time and O(1) memory.',
          },
        ],
        cheatsheet: [
          'Erase min overlaps -> total - maxNonOverlapping(sort by END)',
          'Jump Game II -> increment jump when i == curEnd',
          'Partition Labels -> cut when i == maxLastSeenInWindow',
        ],
        officialDocUrl: 'https://www.geeksforgeeks.org/monotonic-stack/',
      },
      video: yt(
        'NeetCode 150 Intervals, Greedy & Monotonic Stack',
        'freeCodeCamp.org',
        'T0u5nwSA0w0',
        '9h 40m',
        'Master Non-Overlapping Intervals, Jump Game II, Hand of Straights, and Partition Labels.',
      ),
      compilerStarterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> iv = {{1,2},{2,3},{3,4},{1,3}};
    sort(iv.begin(), iv.end(), [](auto a, auto b){ return a.second < b.second; });
    int end = -1e9, keep = 0;
    for (auto [s, e] : iv) if (s >= end) { keep++; end = e; }
    cout << "Erase count: " << (iv.size() - keep) << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'dp-6-1',
          title: 'Non-Overlapping Intervals Erase Count',
          difficulty: 'Medium',
          description: 'Minimum removals from `{{1,2},{2,3},{3,4},{1,3}}` to eliminate overlaps -> 1',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int,int>> iv = {{1,2},{2,3},{3,4},{1,3}};
    // TODO
    return 0;
}`,
          expectedOutput: '1',
          hints: ['Removing `[1, 3]` leaves `{1,2},{2,3},{3,4}` non-overlapping cleanly.'],
        },
        {
          id: 'dp-6-2',
          title: 'Jump Game II Minimum Jumps',
          difficulty: 'Medium',
          description: 'Min jumps to reach last index in `{2, 3, 1, 1, 4}` -> 2',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 3, 1, 1, 4};
    // TODO: Loop i = 0 .. n-2 tracking curEnd and farthest
    return 0;
}`,
          expectedOutput: '2',
          hints: ['Stop loop at `n - 2` because reaching `n - 1` needs no further jump.'],
        },
        {
          id: 'dp-6-3',
          title: 'Partition Labels Segment Sizes',
          difficulty: 'Medium',
          description: 'Split `"ababcbacadefegdehijhklij"` into max parts where each letter appears in at most 1 part; print lengths -> 9 7 8',
          starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s = "ababcbacadefegdehijhklij";
    // TODO: Record last index per char; expand end = max(end, last[s[i]]); cut at i == end
    return 0;
}`,
          expectedOutput: '9 7 8',
          hints: ['Every piece closes the moment `i` catches up to `end`!'],
        },
        {
          id: 'dp-6-4',
          title: 'Insert Interval & Merge',
          difficulty: 'Medium',
          description: 'Insert `{2, 5}` into sorted `{{1, 3}, {6, 9}}` and print merged pairs -> [1,5] [6,9]',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<pair<int,int>> iv = {{1,3},{6,9}};
    pair<int,int> ins = {2,5};
    // TODO: Emit strictly left, merge overlaps into ins, emit strictly right
    return 0;
}`,
          expectedOutput: '[1,5] [6,9]',
          hints: ['3 clean while loops handle before, overlapping (`<= ins.second`), and after!'],
        },
        {
          id: 'dp-6-5',
          title: 'Car Fleet Arrival Groups',
          difficulty: 'Medium',
          description: 'Target `12`, positions `{10, 8, 0, 5, 3}`, speeds `{2, 4, 1, 1, 3}`. Count fleets arriving at target -> 3',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int target = 12;
    vector<int> pos = {10,8,0,5,3}, spd = {2,4,1,1,3};
    // TODO: Sort descending by position; a car merges if its solo arrival time <= fleet lead time
    return 0;
}`,
          expectedOutput: '3',
          hints: ['Use double `time = (double)(target - pos) / spd`; only new strictly larger times create new fleets.'],
        },
        {
          id: 'dp-6-6',
          title: 'Remove K Digits Minimal Number',
          difficulty: 'Medium',
          description: 'Remove `k = 3` digits from `"1432219"` to form smallest integer string -> 1219',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "1432219"; int k = 3;
    // TODO: Increasing monotonic digit stack, trim leftover k from tail & strip leading '0'
    return 0;
}`,
          expectedOutput: '1219',
          hints: ['Pop larger previous digit while `!res.empty() && k > 0 && res.back() > ch`.'],
        },
        {
          id: 'dp-6-7',
          title: 'Candy Distribution Two-Pass Greedy',
          difficulty: 'Hard',
          description: 'Ratings `{1, 0, 2}`: each child gets >=1 candy and higher-rated neighbors get strictly more. Print min total candies -> 5',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> r = {1, 0, 2};
    // TODO: Pass L->R if r[i]>r[i-1], then pass R->L taking max(c[i], c[i+1]+1)
    return 0;
}`,
          expectedOutput: '5',
          hints: ['Allocations `[2, 1, 2]` satisfy both directions totaling 5.'],
        },
        {
          id: 'dp-6-8',
          title: 'Online Stock Span Counter',
          difficulty: 'Medium',
          description: 'For daily prices `{100, 80, 60, 70, 60, 75, 85}`, print consecutive days `<= today` -> 1 1 1 2 1 4 6',
          starterCode: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int main() {
    vector<int> p = {100,80,60,70,60,75,85};
    // TODO: Monotonic stack storing {price, span} pairs
    return 0;
}`,
          expectedOutput: '1 1 1 2 1 4 6',
          hints: ['Accumulate popped spans while `st.top().first <= price`.'],
        },
        {
          id: 'dp-6-9',
          title: 'Sum of Subarray Minimums',
          difficulty: 'Hard',
          description: 'Sum the minimum element of EVERY contiguous subarray of `{3, 1, 2, 4}` -> 17',
          starterCode: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int main() {
    vector<int> a = {3, 1, 2, 4};
    // TODO: leftDist[i] * rightDist[i] * a[i] using monotonic stacks
    return 0;
}`,
          expectedOutput: '17',
          hints: ['`(3) + (1)*6 + (2)*2 + (4) = 3 + 6 + 4 + 4 = 17` (check strict `<` left, `<=` right for duplicates).'],
        },
        {
          id: 'dp-6-10',
          title: 'Interval List Intersections',
          difficulty: 'Medium',
          description: 'Intersect `A={{0,2},{5,10}}` and `B={{1,5},{8,12}}` using two pointers -> [1,2] [5,5] [8,10]',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<pair<int,int>> A = {{0,2},{5,10}}, B = {{1,5},{8,12}};
    // TODO: lo = max(A[i].first, B[j].first), hi = min(...); advance pointer with smaller end
    return 0;
}`,
          expectedOutput: '[1,2] [5,5] [8,10]',
          hints: ['Valid intersection exists whenever `lo <= hi`. Always advance whichever interval finishes earlier!'],
        },
      ],
    },
    {
      stepNumber: 7,
      title: 'System Design: Caching, Sharding & Rate Limiters',
      topic: 'Consistent Hashing, Bloom Filters, LRU & Limiters',
      estimatedTime: '4 Hours',
      summary:
        'Implement core System Design interview engines in code: Consistent Hashing rings with virtual nodes, Bloom Filter membership bitsets, O(1) LRU Cache, and Token/Leaky Bucket limiters.',
      studyMaterial: {
        overview:
          'System Design interviews stand out when you don’t just draw boxes—you explain and code the exact data structures inside Redis, Nginx, and Dynamo: Consistent Hashing, Token Buckets, Bloom Filters, and LFU/LRU eviction.',
        keyPoints: [
          'Naive `hash(key) % N` breaks nearly every cached key when scaling from `N` to `N + 1` nodes; **Consistent Hashing** moves only `~1/N` keys!',
          'Virtual nodes (`vnodes`) prevent hot-spotting when few physical shards sit on the ring.',
          '**Bloom Filters** guarantee ZERO false negatives (maybe-present / definitely-absent) in tiny bitset RAM.',
        ],
        codeExamples: [
          {
            title: 'Consistent Hashing Ring With std::map',
            code: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<int, string> ring = {{10, "NodeA"}, {50, "NodeB"}, {90, "NodeC"}};
    int keyHash = 62;
    auto it = ring.lower_bound(keyHash);
    if (it == ring.end()) it = ring.begin();
    cout << "Routed to: " << it->second << '\\n';
}`,
            explanation: 'Wraps cleanly to `ring.begin()` when `keyHash > 90` in O(log V) time.',
          },
        ],
        cheatsheet: [
          'Consistent Hashing -> ordered map ring + wrap-around lower_bound',
          'Bloom Filter -> k independent hashes -> bitset check (0 false negatives)',
          'Leaky Bucket -> constant drain rate smoothing traffic spikes',
        ],
        officialDocUrl: 'https://systemdesign.one/consistent-hashing-explained/',
      },
      video: yt(
        'System Design Concepts Course & Interview Prep',
        'freeCodeCamp.org',
        'F2FmTdLtb_4',
        '54m',
        'Covers horizontal scaling, consistent hashing, Redis caching, rate limiters, and queues.',
      ),
      compilerStarterCode: `#include <iostream>
#include <map>
using namespace std;

int main() {
    map<int, string> ring = {{25, "S1"}, {60, "S2"}, {95, "S3"}};
    for (int h : {10, 45, 99}) {
        auto it = ring.lower_bound(h);
        if (it == ring.end()) it = ring.begin();
        cout << h << "->" << it->second << " ";
    }
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'dp-7-1',
          title: 'Consistent Hashing Ring Lookup With Wrap-Around',
          difficulty: 'Medium',
          description: 'Nodes on ring `100` at `{15: "N1", 55: "N2", 85: "N3"}`. Route hashes `{10, 40, 92}` -> N1 N2 N1',
          starterCode: `#include <iostream>
#include <map>
using namespace std;

int main() {
    map<int, string> ring = {{15,"N1"},{55,"N2"},{85,"N3"}};
    // TODO: Use ring.lower_bound(h) wrapping ring.end() -> ring.begin()
    return 0;
}`,
          expectedOutput: 'N1 N2 N1',
          hints: ['Hash 92 exceeds 85 so it walks clockwise past 0 to N1 (15).'],
        },
        {
          id: 'dp-7-2',
          title: 'O(1) Doubly Linked List + Map LRU Cache',
          difficulty: 'Hard',
          description: 'Implement `LRUCache(2)` using `std::list` + `unordered_map`: put(1,10), put(2,20), get(1), put(3,30). Print `get(2) get(1)` -> -1 10',
          starterCode: `#include <iostream>
#include <list>
#include <unordered_map>
using namespace std;

// TODO: list<pair<int,int>> order + unordered_map<int, list<pair<int,int>>::iterator> mp
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '-1 10',
          hints: ['Use `order.splice(order.begin(), order, it)` to move hit nodes to front in O(1) without allocation!'],
        },
        {
          id: 'dp-7-3',
          title: 'Bloom Filter Bitset Membership Check',
          difficulty: 'Medium',
          description: 'Bitset size 16, hashes `h1(x)=x%16`, `h2(x)=(x*7+3)%16`. Insert `12`, test `12` and `25` -> 1 0',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<bool> bits(16, false);
    auto h1 = [](int x) { return x % 16; };
    auto h2 = [](int x) { return (x * 7 + 3) % 16; };
    // TODO: Set bits for 12; verify (bits[h1(q)] && bits[h2(q)]) for 12 and 25
    return 0;
}`,
          expectedOutput: '1 0',
          hints: ['If ANY hash slot is 0, item is 100% definitely absent!'],
        },
        {
          id: 'dp-7-4',
          title: 'Leaky Bucket Queue Traffic Shaper',
          difficulty: 'Medium',
          description: 'Bucket cap=3, constant leak=1/sec. T=0 bursts 4 items (`drop 4th!`), T=1 leaks 1 (`rem=2`) and accepts 1 (`rem=3`). Print `[accepted, dropped]` -> 4 1',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int cap = 3, q = 0, acc = 0, drop = 0;
    // TODO: T=0 push 4 items; T=1 leak 1 then push 1 item
    return 0;
}`,
          expectedOutput: '4 1',
          hints: ['First 3 at T=0 accepted, 4th at T=0 overflows/drops; T=1 drains 1 leaving room for 1 more.'],
        },
        {
          id: 'dp-7-5',
          title: 'Base62 URL Shortener Encoder',
          difficulty: 'Easy',
          description: 'Encode numeric DB ID `125` into Base62 (`0-9a-zA-Z`) -> 21',
          starterCode: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    const string alpha = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    long long id = 125;
    // TODO: Repeated % 62 and / 62, then reverse
    return 0;
}`,
          expectedOutput: '21',
          hints: ['`125 = 2 * 62 + 1` -> Base62 `"21"`!'],
        },
        {
          id: 'dp-7-6',
          title: 'Snowflake-Style 64-Bit Distributed ID Pack',
          difficulty: 'Medium',
          description: 'Pack `timestamp=100` (left shift 22), `workerId=5` (left shift 12), `seq=42` (`|`) into 64-bit integer and unpack `workerId` back -> 5',
          starterCode: `#include <iostream>
#include <cstdint>
using namespace std;

int main() {
    uint64_t ts = 100, worker = 5, seq = 42;
    // TODO: Pack with (ts << 22) | (worker << 12) | seq, then extract (id >> 12) & 0x3FF
    return 0;
}`,
          expectedOutput: '5',
          hints: ['Bitwise shifts & masks generate globally unique sortable IDs without DB coordination!'],
        },
        {
          id: 'dp-7-7',
          title: 'Read-Through Write-Through Cache Trace',
          difficulty: 'Easy',
          description: 'Simulate `read("k1")` miss->load DB (`hits=0 misses=1`), `read("k1")` hit (`hits=1 misses=1`), `write("k1","v2")` invalidating/updating -> hits=1 val=v2',
          starterCode: `#include <iostream>
#include <unordered_map>
using namespace std;

int main() {
    unordered_map<string,string> db{{"k1","v1"}}, cache;
    // TODO: Run read("k1"), read("k1"), write("k1", "v2")
    return 0;
}`,
          expectedOutput: 'hits=1 val=v2',
          hints: ['Write-through updates BOTH `cache[k] = v` and `db[k] = v` atomically.'],
        },
        {
          id: 'dp-7-8',
          title: 'TTL Cache Expiration Sweeper',
          difficulty: 'Easy',
          description: 'Entries `{k:"A", exp:50}`, `{k:"B", exp:120}`, `{k:"C", exp:90}`. Sweep expired (`exp <= now`) at `now=100` -> B',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<pair<string,int>> entries = {{"A",50},{"B",120},{"C",90}}; int now = 100;
    // TODO: Print surviving keys
    return 0;
}`,
          expectedOutput: 'B',
          hints: ['Only `"B"` (`120 > 100`) survives TTL sweep.'],
        },
        {
          id: 'dp-7-9',
          title: 'Dead-Letter Queue (DLQ) Partitioning',
          difficulty: 'Easy',
          description: 'Route jobs `[(id=1,fails=1),(id=2,fails=3),(id=3,fails=4)]` hitting `maxRetries=3` (`fails >= 3`) to DLQ -> DLQ:2,3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<pair<int,int>> jobs = {{1,1},{2,3},{3,4}};
    // TODO
    return 0;
}`,
          expectedOutput: 'DLQ:2,3',
          hints: ['Poison messages hitting max retries move to DLQ instead of blocking healthy partitions forever.'],
        },
        {
          id: 'dp-7-10',
          title: 'Merkle Anti-Entropy Root Diff Check',
          difficulty: 'Medium',
          description: 'Compare 2 replica leaf blocks `{"a","b","c","d"}` vs `{"a","x","c","d"}` via simple pair hashing (`combine(h1,h2) = h1*31 + h2`): verify whether root differs and pinpoint differing half (`LEFT` vs `RIGHT`) -> DIFF LEFT',
          starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // TODO: Compute pair hashes for left (0,1) and right (2,3) halves on both replicas
    return 0;
}`,
          expectedOutput: 'DIFF LEFT',
          hints: ['Right pair `(c, d)` matches identically across both replicas -> only `LEFT` subtree differs!'],
        },
      ],
    },
  ],
};
