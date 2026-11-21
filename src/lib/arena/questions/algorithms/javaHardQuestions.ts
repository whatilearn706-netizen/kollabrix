import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * Calibrated Battle Arena Algorithmic Questions (30 items)
 * Designed for competitive collegiate duels with ~30 seconds margin to spare.
 */
export const JAVA_HARD_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "algo-java-hard-3m-bitwise-and-range",
    "arena": "algorithms",
    "title": "Bitwise AND of Numbers Range",
    "description": "Find bitwise AND of all numbers between m and n.",
    "tags": [
      "java",
      "algorithms",
      "bitwise"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "m = 5, n = 7",
    "sampleOutput": "4",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int rangeBitwiseAnd(int left, int right) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def rangeBitwiseAnd(self, left: int, right: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int rangeBitwiseAnd(int left, int right) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "m = 5, n = 7",
        "expectedOutput": "4",
        "description": "Example 1: Bitwise AND of Numbers Range"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "4",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-first-missing-pos",
    "arena": "algorithms",
    "title": "First Missing Positive Integer",
    "description": "Smallest missing positive integer in O(N) time and O(1) space.",
    "tags": [
      "java",
      "algorithms",
      "arrays"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "[3, 4, -1, 1]",
    "sampleOutput": "2",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int firstMissingPositive(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def firstMissingPositive(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int firstMissingPositive(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[3, 4, -1, 1]",
        "expectedOutput": "2",
        "description": "Example 1: First Missing Positive Integer"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "2",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-max-xor-pair",
    "arena": "algorithms",
    "title": "Maximum XOR of Two Numbers",
    "description": "Maximum XOR pair value using prefix trie.",
    "tags": [
      "java",
      "algorithms",
      "trie"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "[3, 10, 5, 25, 2, 8]",
    "sampleOutput": "28",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int findMaximumXOR(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def findMaximumXOR(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findMaximumXOR(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[3, 10, 5, 25, 2, 8]",
        "expectedOutput": "28",
        "description": "Example 1: Maximum XOR of Two Numbers"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "28",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-valid-number",
    "arena": "algorithms",
    "title": "Valid Number State Machine",
    "description": "Determine if string represents valid decimal number.",
    "tags": [
      "java",
      "algorithms",
      "design"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "\"0.1\"",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean isNumber(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def isNumber(self, s: str) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean isNumber(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"0.1\"",
        "expectedOutput": "true",
        "description": "Example 1: Valid Number State Machine"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "true",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-counting-bits",
    "arena": "algorithms",
    "title": "Count Set Bits Array 0 to N",
    "description": "Return array of 1-bit counts for numbers 0 to n in O(N).",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "n = 5",
    "sampleOutput": "[0, 1, 1, 2, 1, 2]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] countBits(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def countBits(self, n: int) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] countBits(int n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "n = 5",
        "expectedOutput": "[0, 1, 1, 2, 1, 2]",
        "description": "Example 1: Count Set Bits Array 0 to N"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[0, 1, 1, 2, 1, 2]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-single-number-ii",
    "arena": "algorithms",
    "title": "Single Number II (Triplicate Elements)",
    "description": "Find unique element where all others appear three times.",
    "tags": [
      "java",
      "algorithms",
      "bitwise"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "[2, 2, 3, 2]",
    "sampleOutput": "3",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int singleNumber(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[2, 2, 3, 2]",
        "expectedOutput": "3",
        "description": "Example 1: Single Number II (Triplicate Elements)"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "3",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-find-duplicate",
    "arena": "algorithms",
    "title": "Find Duplicate in O(1) Space",
    "description": "Find duplicate integer in array using Floyd's cycle detection.",
    "tags": [
      "java",
      "algorithms",
      "two_pointers"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "[1, 3, 4, 2, 2]",
    "sampleOutput": "2",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int findDuplicate(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def findDuplicate(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findDuplicate(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[1, 3, 4, 2, 2]",
        "expectedOutput": "2",
        "description": "Example 1: Find Duplicate in O(1) Space"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "2",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-reverse-bits",
    "arena": "algorithms",
    "title": "Reverse Bits of 32-bit Integer",
    "description": "Reverse 32 bits of an unsigned integer.",
    "tags": [
      "java",
      "algorithms",
      "bitwise"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "43261596",
    "sampleOutput": "964176192",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int reverseBits(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def reverseBits(self, n: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int reverseBits(uint32_t n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "43261596",
        "expectedOutput": "964176192",
        "description": "Example 1: Reverse Bits of 32-bit Integer"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "964176192",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-sliding-window-median",
    "arena": "algorithms",
    "title": "Sliding Window Median",
    "description": "Running median across sliding window of size k.",
    "tags": [
      "java",
      "algorithms",
      "heap"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
    "sampleOutput": "[1.0, -1.0, -1.0, 3.0, 5.0, 6.0]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public double[] medianSlidingWindow(int[] nums, int k) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def medianSlidingWindow(self, nums: list[int], k: int) -> double[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    double[] medianSlidingWindow(vector<int>& nums, int k) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        "expectedOutput": "[1.0, -1.0, -1.0, 3.0, 5.0, 6.0]",
        "description": "Example 1: Sliding Window Median"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[1.0, -1.0, -1.0, 3.0, 5.0, 6.0]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-3m-longest-valid-parens",
    "arena": "algorithms",
    "title": "Longest Valid Parentheses Substring",
    "description": "Length of longest valid parentheses substring.",
    "tags": [
      "java",
      "algorithms",
      "stack"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "sampleInput": "\")()())\"",
    "sampleOutput": "4",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int longestValidParentheses(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestValidParentheses(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\")()())\"",
        "expectedOutput": "4",
        "description": "Example 1: Longest Valid Parentheses Substring"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "4",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-trap-water",
    "arena": "algorithms",
    "title": "Trapping Rain Water",
    "description": "Calculate trapped rainwater over elevations in O(N) time.",
    "tags": [
      "java",
      "algorithms",
      "two_pointers"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "[0,1,0,2,1,0,1,3,2,1,2,1]",
    "sampleOutput": "6",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def trap(self, height: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[0,1,0,2,1,0,1,3,2,1,2,1]",
        "expectedOutput": "6",
        "description": "Example 1: Trapping Rain Water"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "6",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-largest-rect-hist",
    "arena": "algorithms",
    "title": "Largest Rectangle in Histogram",
    "description": "Maximum rectangular area in histogram bars.",
    "tags": [
      "java",
      "algorithms",
      "stack"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "[2,1,5,6,2,3]",
    "sampleOutput": "10",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int largestRectangleArea(int[] heights) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def largestRectangleArea(self, heights: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[2,1,5,6,2,3]",
        "expectedOutput": "10",
        "description": "Example 1: Largest Rectangle in Histogram"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "10",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-word-ladder",
    "arena": "algorithms",
    "title": "Word Ladder Shortest Mutation",
    "description": "Shortest transformation sequence from beginWord to endWord.",
    "tags": [
      "java",
      "algorithms",
      "bfs"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
    "sampleOutput": "5",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
        "expectedOutput": "5",
        "description": "Example 1: Word Ladder Shortest Mutation"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "5",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-merge-k-lists",
    "arena": "algorithms",
    "title": "Merge K Sorted Lists",
    "description": "Merge k sorted lists into one sorted list.",
    "tags": [
      "java",
      "algorithms",
      "heap"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "lists = [[1,4,5],[1,3,4],[2,6]]",
    "sampleOutput": "[1,1,2,3,4,4,5,6]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def mergeKLists(self, lists: list[ListNode]) -> ListNode:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    ListNode mergeKLists(vector<ListNode*>& lists) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "lists = [[1,4,5],[1,3,4],[2,6]]",
        "expectedOutput": "[1,1,2,3,4,4,5,6]",
        "description": "Example 1: Merge K Sorted Lists"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[1,1,2,3,4,4,5,6]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-sliding-max",
    "arena": "algorithms",
    "title": "Sliding Window Maximum",
    "description": "Max value in each sliding window in O(N).",
    "tags": [
      "java",
      "algorithms",
      "queue"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
    "sampleOutput": "[3,3,5,5,6,7]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def maxSlidingWindow(self, nums: list[int], k: int) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] maxSlidingWindow(vector<int>& nums, int k) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        "expectedOutput": "[3,3,5,5,6,7]",
        "description": "Example 1: Sliding Window Maximum"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[3,3,5,5,6,7]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-edit-distance",
    "arena": "algorithms",
    "title": "Edit Distance (Levenshtein DP)",
    "description": "Minimum operations to convert word1 to word2.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "word1 = \"horse\", word2 = \"ros\"",
    "sampleOutput": "3",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int minDistance(String word1, String word2) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "word1 = \"horse\", word2 = \"ros\"",
        "expectedOutput": "3",
        "description": "Example 1: Edit Distance (Levenshtein DP)"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "3",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-median-two-sorted",
    "arena": "algorithms",
    "title": "Median of Two Sorted Arrays",
    "description": "Find median of two sorted arrays in O(log(min(M, N))).",
    "tags": [
      "java",
      "algorithms",
      "binary_search"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "nums1 = [1, 3], nums2 = [2]",
    "sampleOutput": "2.0",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> double:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums1 = [1, 3], nums2 = [2]",
        "expectedOutput": "2.0",
        "description": "Example 1: Median of Two Sorted Arrays"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "2.0",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-russian-dolls",
    "arena": "algorithms",
    "title": "Russian Doll Envelopes LIS",
    "description": "Maximum envelopes nested inside one another.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "[[5,4],[6,4],[6,7],[2,3]]",
    "sampleOutput": "3",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int maxEnvelopes(int[][] envelopes) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def maxEnvelopes(self, envelopes: list[list[int]]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxEnvelopes(vector<vector<int>>& envelopes) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[[5,4],[6,4],[6,7],[2,3]]",
        "expectedOutput": "3",
        "description": "Example 1: Russian Doll Envelopes LIS"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "3",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-min-window-sub",
    "arena": "algorithms",
    "title": "Minimum Window Substring",
    "description": "Smallest window in s containing all characters of t.",
    "tags": [
      "java",
      "algorithms",
      "sliding_window"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "s = \"ADOBECODEBANC\", t = \"ABC\"",
    "sampleOutput": "\"BANC\"",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public String minWindow(String s, String t) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def minWindow(self, s: str, t: str) -> String:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    String minWindow(string s, string t) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
        "expectedOutput": "\"BANC\"",
        "description": "Example 1: Minimum Window Substring"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "\"BANC\"",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-5m-alien-dictionary",
    "arena": "algorithms",
    "title": "Alien Dictionary Lexical Order",
    "description": "Verify alphabetical ordering of words in alien language.",
    "tags": [
      "java",
      "algorithms",
      "graphs"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "sampleInput": "words = [\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]",
    "sampleOutput": "\"wertf\"",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public String alienOrder(String[] words) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def alienOrder(self, words: list[str]) -> String:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    String alienOrder(vector<string>& words) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "words = [\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]",
        "expectedOutput": "\"wertf\"",
        "description": "Example 1: Alien Dictionary Lexical Order"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "\"wertf\"",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-regex-matching",
    "arena": "algorithms",
    "title": "Regular Expression Matching (. and *)",
    "description": "Build full regex engine supporting . and * using 2D DP.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "s = \"aa\", p = \"a*\"",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean isMatch(String s, String p) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def isMatch(self, s: str, p: str) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean isMatch(string s, string p) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "s = \"aa\", p = \"a*\"",
        "expectedOutput": "true",
        "description": "Example 1: Regular Expression Matching (. and *)"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "true",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-wildcard-matching",
    "arena": "algorithms",
    "title": "Wildcard Matching (? and *)",
    "description": "Pattern matching supporting ? and * in O(M*N).",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "s = \"aa\", p = \"*\"",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean isMatch(String s, String p) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def isMatch(self, s: str, p: str) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean isMatch(string s, string p) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "s = \"aa\", p = \"*\"",
        "expectedOutput": "true",
        "description": "Example 1: Wildcard Matching (? and *)"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "true",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-burst-balloons",
    "arena": "algorithms",
    "title": "Burst Balloons Interval DP",
    "description": "Maximize coins by bursting balloons in optimal order.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "[3, 1, 5, 8]",
    "sampleOutput": "167",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int maxCoins(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def maxCoins(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxCoins(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[3, 1, 5, 8]",
        "expectedOutput": "167",
        "description": "Example 1: Burst Balloons Interval DP"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "167",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-max-path-sum-tree",
    "arena": "algorithms",
    "title": "Binary Tree Maximum Path Sum",
    "description": "Maximum path sum between any two nodes in tree.",
    "tags": [
      "java",
      "algorithms",
      "trees"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "root = [1,2,3]",
    "sampleOutput": "6",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int maxPathSum(TreeNode root) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def maxPathSum(self, root: TreeNode) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxPathSum(TreeNode* root) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "root = [1,2,3]",
        "expectedOutput": "6",
        "description": "Example 1: Binary Tree Maximum Path Sum"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "6",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-n-queens",
    "arena": "algorithms",
    "title": "N-Queens Chessboard Solver",
    "description": "Place n non-attacking queens on n x n board.",
    "tags": [
      "java",
      "algorithms",
      "backtracking"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "n = 4",
    "sampleOutput": "[\"[.Q..,...Q,Q...,..Q.]\",\"[..Q.,Q...,...Q,.Q..]\"]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<List<String>> solveNQueens(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def solveNQueens(self, n: int) -> List<List<String>>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<List<String>> solveNQueens(int n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "n = 4",
        "expectedOutput": "[\"[.Q..,...Q,Q...,..Q.]\",\"[..Q.,Q...,...Q,.Q..]\"]",
        "description": "Example 1: N-Queens Chessboard Solver"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[\"[.Q..,...Q,Q...,..Q.]\",\"[..Q.,Q...,...Q,.Q..]\"]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-serialize-tree",
    "arena": "algorithms",
    "title": "Serialize and Deserialize Binary Tree",
    "description": "Codec serializing and reconstructing binary tree.",
    "tags": [
      "java",
      "algorithms",
      "design"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "[1,2,3,null,null,4,5]",
    "sampleOutput": "[1,2,3,null,null,4,5]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public String serialize(TreeNode root) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def serialize(self, root: TreeNode) -> String:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    String serialize(TreeNode* root) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[1,2,3,null,null,4,5]",
        "expectedOutput": "[1,2,3,null,null,4,5]",
        "description": "Example 1: Serialize and Deserialize Binary Tree"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[1,2,3,null,null,4,5]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-shortest-path-obstacles",
    "arena": "algorithms",
    "title": "Shortest Path with Obstacles Elimination",
    "description": "Shortest path in grid eliminating up to k walls.",
    "tags": [
      "java",
      "algorithms",
      "bfs"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "grid = [[0,0,0],[1,1,0],[0,0,0],[0,1,1],[0,0,0]], k = 1",
    "sampleOutput": "6",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int shortestPath(int[][] grid, int k) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def shortestPath(self, grid: list[list[int]], k: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int shortestPath(vector<vector<int>>& grid, int k) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "grid = [[0,0,0],[1,1,0],[0,0,0],[0,1,1],[0,0,0]], k = 1",
        "expectedOutput": "6",
        "description": "Example 1: Shortest Path with Obstacles Elimination"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "6",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-palindrome-partitioning-ii",
    "arena": "algorithms",
    "title": "Palindrome Partitioning II (Min Cuts)",
    "description": "Minimum cuts to partition string into palindromes.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "\"aab\"",
    "sampleOutput": "1",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int minCut(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def minCut(self, s: str) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minCut(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"aab\"",
        "expectedOutput": "1",
        "description": "Example 1: Palindrome Partitioning II (Min Cuts)"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "1",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-sudoku-solver",
    "arena": "algorithms",
    "title": "Sudoku Solver Backtracking",
    "description": "Fill empty cells of valid 9x9 Sudoku board.",
    "tags": [
      "java",
      "algorithms",
      "backtracking"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "board = [[\"5\",\"3\",\".\"...]]",
    "sampleOutput": "Filled board",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public void solveSudoku(char[][] board) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def solveSudoku(self, board: list[list[str]]) -> void:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solveSudoku(vector<vector<char>>& board) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "board = [[\"5\",\"3\",\".\"...]]",
        "expectedOutput": "Filled board",
        "description": "Example 1: Sudoku Solver Backtracking"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "Filled board",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-hard-10m-concatenated-words",
    "arena": "algorithms",
    "title": "Concatenated Words in Dictionary",
    "description": "Find all words formed by two or more other words in list.",
    "tags": [
      "java",
      "algorithms",
      "trie"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "sampleInput": "[\"cat\",\"cats\",\"catsdogcats\",\"dog\",\"dogcatsdog\"]",
    "sampleOutput": "[\"catsdogcats\",\"dogcatsdog\"]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<String> findAllConcatenatedWordsInADict(String[] words) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def findAllConcatenatedWordsInADict(self, words: list[str]) -> List<String>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<String> findAllConcatenatedWordsInADict(vector<string>& words) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[\"cat\",\"cats\",\"catsdogcats\",\"dog\",\"dogcatsdog\"]",
        "expectedOutput": "[\"catsdogcats\",\"dogcatsdog\"]",
        "description": "Example 1: Concatenated Words in Dictionary"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[\"catsdogcats\",\"dogcatsdog\"]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  }
];
