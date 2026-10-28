import { IcpcContest } from '@/types/icpc';

export const CURATED_ICPC_CONTESTS: IcpcContest[] = [
  {
    id: 'icpc-spring-2026',
    title: 'ICPC Regional Collegiate Sprint 2026',
    subtitle: 'Collegiate Speedrun • Algorithmic Championship',
    organizer: 'Prof. Vikram Sharma',
    organizerRole: 'Head of CSE & ACM Faculty Advisor',
    college: 'IIT Delhi & Collegiate Network',
    startTime: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago (Live)
    endTime: new Date(Date.now() + 3600000 * 3).toISOString(), // 3 hours left
    contestType: 'contest',
    durationMinutes: 300,
    status: 'live',
    visibility: 'public',
    bannerGradient: 'from-cyan-600 via-indigo-600 to-violet-600',
    participantCount: 348,
    scoringType: 'icpc',
    rules: [
      'Contestants may submit in C++, Java, Python 3, or Rust.',
      'ICPC Scoring: Each accepted problem awards points with a penalty for wrong submissions.',
      'Plagiarism checks run in real-time across student AST code trees.',
    ],
    problems: [
      {
        id: 'p-1',
        title: 'Minimum Energy Path on Triangular Grid',
        difficulty: 'Easy',
        points: 100,
        timeLimit: '1.0s',
        memoryLimit: '256MB',
        tags: ['Dynamic Programming', 'Math', 'Arrays'],
        description:
          'Given a triangular array of integers representing energy consumption, find the minimum total energy required to traverse from top to bottom. Each step you may only move to adjacent numbers on the row below.',
        inputFormat: 'First line contains integer N (number of rows). Following N lines contain row integers.',
        outputFormat: 'Print a single integer: the minimum total path sum.',
        constraints: '1 <= N <= 200, -10^4 <= grid[i][j] <= 10^4',
        sampleInput: '4\n2\n3 4\n6 5 7\n4 1 8 3',
        sampleOutput: '11',
        explanation: 'Path: 2 -> 3 -> 5 -> 1 = 11.',
        solutionLanguage: 'cpp',
        solutionCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Bottom-Up Dynamic Programming O(N^2) time, O(N) auxiliary space
int minimumTotal(vector<vector<int>>& triangle) {
    int n = triangle.size();
    vector<int> dp = triangle.back();
    for (int i = n - 2; i >= 0; --i) {
        for (int j = 0; j <= i; ++j) {
            dp[j] = triangle[i][j] + min(dp[j], dp[j + 1]);
        }
    }
    return dp[0];
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> triangle(n);
    for (int i = 0; i < n; ++i) {
        triangle[i].resize(i + 1);
        for (int j = 0; j <= i; ++j) {
            cin >> triangle[i][j];
        }
    }
    cout << minimumTotal(triangle) << "\n";
    return 0;
}`,
        solutionExplanation: 'Optimal DP approach works bottom-up: Starting from row N-2 down to 0, each cell dp[j] takes triangle[i][j] + min(dp[j], dp[j+1]). This reduces space complexity from O(N^2) to O(N). Time Complexity: O(N^2).',
      },
      {
        id: 'p-2',
        title: 'Bitwise XOR Subarray Maximizer',
        difficulty: 'Medium',
        points: 250,
        timeLimit: '1.5s',
        memoryLimit: '256MB',
        tags: ['Trie', 'Bit Manipulation', 'Two Pointers'],
        description:
          'Given an array of integers, compute the maximum possible XOR sum of any contiguous non-empty subarray in O(N log(MAX_VAL)) time.',
        inputFormat: 'First line contains integer T (test cases). Each test case has N followed by N space-separated integers.',
        outputFormat: 'Print the maximum XOR value attainable from any subarray.',
        constraints: '1 <= N <= 10^5, 0 <= A[i] <= 10^9',
        sampleInput: '1\n4\n3 10 5 25',
        sampleOutput: '28',
        explanation: 'Subarray [5, 25] has XOR = 5 ^ 25 = 28.',
        solutionLanguage: 'cpp',
        solutionCode: `// Prefix XOR + Binary Trie search for opposite bit
#include <iostream>
#include <vector>
using namespace std;

struct TrieNode {
    TrieNode* child[2] = {nullptr, nullptr};
};

void insertTrie(TrieNode* root, int val) {
    TrieNode* curr = root;
    for (int i = 31; i >= 0; --i) {
        int bit = (val >> i) & 1;
        if (!curr->child[bit]) curr->child[bit] = new TrieNode();
        curr = curr->child[bit];
    }
}

int queryMaxXor(TrieNode* root, int val) {
    TrieNode* curr = root;
    int maxVal = 0;
    for (int i = 31; i >= 0; --i) {
        int bit = (val >> i) & 1;
        int opp = 1 - bit;
        if (curr->child[opp]) {
            maxVal |= (1 << i);
            curr = curr->child[opp];
        } else {
            curr = curr->child[bit];
        }
    }
    return maxVal;
}`,
        solutionExplanation: 'Calculate running prefix XOR array P. Any subarray XOR(L..R) = P[R] ^ P[L-1]. By storing each prefix XOR into a 32-bit Binary Trie, we can find the maximum XOR mate in O(32) per element. Overall Time Complexity: O(N * 32).',
      },
      {
        id: 'p-3',
        title: 'Collegiate Server Flow Optimization',
        difficulty: 'Hard',
        points: 500,
        timeLimit: '2.0s',
        memoryLimit: '512MB',
        tags: ['Network Flow', 'Graphs', 'Edmonds-Karp', 'Dinic'],
        description:
          'A collegiate network has N server nodes and M bidirectional optic fiber cables. Calculate the maximum data bandwidth that can flow from source node 1 to sink node N without exceeding any individual cable capacity.',
        inputFormat: 'First line: N (nodes) and M (edges). Next M lines contain u, v, capacity.',
        outputFormat: 'Single integer: Maximum network flow.',
        constraints: '2 <= N <= 1000, 1 <= M <= 10^4, 1 <= capacity <= 10^7',
        sampleInput: '4 5\n1 2 40\n1 3 20\n2 3 10\n2 4 30\n3 4 20',
        sampleOutput: '50',
        explanation: 'Max flow from node 1 to node 4 is 50 GB/s.',
        solutionLanguage: 'cpp',
        solutionCode: `// Dinic's Algorithm for Max Flow
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

// Dinic's algorithm runs in O(V^2 * E)
// Level graph constructed via BFS, blocking flows found via DFS.`,
        solutionExplanation: 'Modeled as standard Maximum s-t Network Flow. Using Dinic\'s algorithm with level graphs and push-relabel achieves optimal performance well within the 2.0s time limit.',
      },
    ],
  },
  {
    id: 'icpc-campus-qualifier-3',
    title: 'ACM-ICPC Campus Qualifier Round #3',
    subtitle: 'University Team Selection • Fast I/O Algorithmic Duel',
    organizer: 'Dr. Ananya Sen',
    organizerRole: 'Faculty Mentor & ICPC Coach',
    college: 'BITS Pilani & Regional Hub',
    contestType: 'contest',
    startTime: new Date(Date.now() + 3600000 * 24).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 3600000 * 28).toISOString(),
    durationMinutes: 240,
    status: 'upcoming',
    visibility: 'public',
    bannerGradient: 'from-violet-600 via-purple-600 to-pink-600',
    participantCount: 512,
    scoringType: 'icpc',
    rules: [
      'Teams of 3 students sharing 1 single terminal or independent individual division.',
      'Blind scoreboard in the final 60 minutes of the contest.',
      'Verified faculty certification awarded to top 10 college squads.',
    ],
    problems: [
      {
        id: 'q-1',
        title: 'Cyclic Lexicographic Shift',
        difficulty: 'Easy',
        points: 100,
        timeLimit: '0.8s',
        memoryLimit: '128MB',
        tags: ['Strings', 'Sorting'],
        description: 'Find the lexicographically smallest rotation of string S in linear time.',
        inputFormat: 'A single string S of lowercase English letters.',
        outputFormat: 'Smallest cyclic string.',
        constraints: '1 <= |S| <= 10^5',
        sampleInput: 'bbaaccaadd',
        sampleOutput: 'aaccaaddbb',
        solutionLanguage: 'python',
        solutionCode: `def smallest_cyclic_shift(s: str) -> str:
    # Booth's Algorithm for minimal string rotation in O(N)
    s2 = s + s
    n = len(s)
    f = [-1] * (2 * n)
    k = 0
    for j in range(1, 2 * n):
        i = f[j - k - 1]
        while i != -1 and s2[j] != s2[k + i + 1]:
            if s2[j] < s2[k + i + 1]:
                k = j - i - 1
            i = f[i]
        if i == -1 and s2[j] != s2[k + i + 1]:
            if s2[j] < s2[k + i + 1]:
                k = j
            f[j - k] = -1
        else:
            f[j - k] = i + 1
    return s2[k:k+n]`,
        solutionExplanation: 'Booth\'s algorithm determines the lexicographically minimal rotation of a string in O(N) time and O(N) space, avoiding the O(N^2) comparison of all substrings.',
      },
      {
        id: 'q-2',
        title: 'Bipartite Roommate Allocation',
        difficulty: 'Medium',
        points: 300,
        timeLimit: '1.2s',
        memoryLimit: '256MB',
        tags: ['Bipartite Graphs', 'Hopcroft-Karp'],
        description: 'Maximize the total matching between dorm room applicants and available rooms with compatibility preferences.',
        inputFormat: 'N students, M rooms, followed by preference list.',
        outputFormat: 'Max students matched.',
        constraints: '1 <= N, M <= 500',
        sampleInput: '3 3\n1 1 2\n2 2\n3 2 3',
        sampleOutput: '3',
        solutionLanguage: 'cpp',
        solutionCode: `// Maximum Bipartite Matching using Hopcroft-Karp in O(E * sqrt(V))
#include <iostream>
#include <vector>
#include <queue>
using namespace std;
// Implementation of Hopcroft-Karp algorithm for maximum cardinality matching`,
        solutionExplanation: 'Classic Maximum Bipartite Matching solved using Hopcroft-Karp algorithm in O(E * sqrt(V)) time.',
      },
    ],
  },
  {
    id: 'icpc-speedrun-1',
    title: 'LeetCode-Style Collegiate Speedrun #1',
    subtitle: 'Practice Sprint • Data Structures & Algorithmic Puzzles',
    organizer: 'Kollabrix Academic Council',
    organizerRole: 'Collegiate Competitive Programming Guild',
    college: 'All Partner Universities',
    contestType: 'practice',
    startTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 44).toISOString(),
    durationMinutes: 120,
    status: 'ended',
    visibility: 'public',
    bannerGradient: 'from-amber-600 via-orange-600 to-rose-600',
    participantCount: 689,
    scoringType: 'leetcode',
    rules: [
      'Instant testcase evaluation with runtime & memory percentiles.',
      'Open practice mode: view community editorial code and testbench.',
    ],
    problems: [
      {
        id: 'sr-1',
        title: 'LRU Cache Eviction Simulator',
        difficulty: 'Medium',
        points: 200,
        timeLimit: '1.0s',
        memoryLimit: '256MB',
        tags: ['Hash Map', 'Doubly Linked List', 'Design'],
        description: 'Implement a Least Recently Used (LRU) cache supporting get(key) and put(key, value) in O(1) time complexity.',
        inputFormat: 'List of operations and values.',
        outputFormat: 'Array of return values.',
        constraints: '1 <= capacity <= 3000, 0 <= key, value <= 10^4',
        sampleInput: '["LRUCache", "put", "put", "get", "put", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2]]',
        sampleOutput: '[null, null, null, 1, null, -1]',
        solutionLanguage: 'cpp',
        solutionCode: `#include <unordered_map>
#include <list>
using namespace std;

class LRUCache {
private:
    int cap;
    list<pair<int, int>> dll; // {key, value}
    unordered_map<int, list<pair<int, int>>::iterator> map;

public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        if (map.find(key) == map.end()) return -1;
        dll.splice(dll.begin(), dll, map[key]);
        return map[key]->second;
    }

    void put(int key, int value) {
        if (map.find(key) != map.end()) {
            dll.splice(dll.begin(), dll, map[key]);
            map[key]->second = value;
            return;
        }
        if (dll.size() == cap) {
            int dKey = dll.back().first;
            dll.pop_back();
            map.erase(dKey);
        }
        dll.push_front({key, value});
        map[key] = dll.begin();
    }
};`,
        solutionExplanation: 'The optimal structure is a combination of a Doubly Linked List and an Unordered Hash Map. List maintains recency in O(1) splice/pop, and hash map provides O(1) lookup. Both get and put run in strict O(1) time complexity.',
      },
    ],
  },
];
