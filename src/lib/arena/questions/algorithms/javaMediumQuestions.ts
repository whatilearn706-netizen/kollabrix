import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * Calibrated Battle Arena Algorithmic Questions (30 items)
 * Designed for competitive collegiate duels with ~30 seconds margin to spare.
 */
export const JAVA_MEDIUM_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "algo-java-medium-3m-string-compress",
    "arena": "algorithms",
    "title": "String Compression (Run Length)",
    "description": "Compress repeated characters in-place.",
    "tags": [
      "java",
      "algorithms",
      "strings"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "\"aabcccccaaa\"",
    "sampleOutput": "\"a2b1c5a3\"",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int compress(char[] chars) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def compress(self, chars: list[str]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int compress(vector<char>& chars) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"aabcccccaaa\"",
        "expectedOutput": "\"a2b1c5a3\"",
        "description": "Example 1: String Compression (Run Length)"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "\"a2b1c5a3\"",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-3m-find-peak",
    "arena": "algorithms",
    "title": "Find Peak Element in Array",
    "description": "Find a peak element index in O(log N).",
    "tags": [
      "java",
      "algorithms",
      "binary_search"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "[1, 2, 3, 1]",
    "sampleOutput": "2",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int findPeakElement(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def findPeakElement(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findPeakElement(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[1, 2, 3, 1]",
        "expectedOutput": "2",
        "description": "Example 1: Find Peak Element in Array"
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
    "id": "algo-java-medium-3m-next-greater",
    "arena": "algorithms",
    "title": "Next Greater Element I",
    "description": "Find next greater element for each number using monotonic stack.",
    "tags": [
      "java",
      "algorithms",
      "stack"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "nums1 = [4,1,2], nums2 = [1,3,4,2]",
    "sampleOutput": "[-1, 3, -1]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] nextGreaterElement(int[] nums1, int[] nums2) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def nextGreaterElement(self, nums1: list[int], nums2: list[int]) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums1 = [4,1,2], nums2 = [1,3,4,2]",
        "expectedOutput": "[-1, 3, -1]",
        "description": "Example 1: Next Greater Element I"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[-1, 3, -1]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-3m-bitwise-sum",
    "arena": "algorithms",
    "title": "Sum of Two Integers (Bitwise)",
    "description": "Add two integers without using + or -.",
    "tags": [
      "java",
      "algorithms",
      "bitwise"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "a = 1, b = 2",
    "sampleOutput": "3",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int getSum(int a, int b) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def getSum(self, a: int, b: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int getSum(int a, int b) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "a = 1, b = 2",
        "expectedOutput": "3",
        "description": "Example 1: Sum of Two Integers (Bitwise)"
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
    "id": "algo-java-medium-3m-reverse-int",
    "arena": "algorithms",
    "title": "Reverse 32-Bit Signed Integer",
    "description": "Reverse digits of 32-bit integer with overflow check.",
    "tags": [
      "java",
      "algorithms",
      "math"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "123",
    "sampleOutput": "321",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int reverse(int x) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def reverse(self, x: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int reverse(int x) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "123",
        "expectedOutput": "321",
        "description": "Example 1: Reverse 32-Bit Signed Integer"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "321",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-3m-sort-colors",
    "arena": "algorithms",
    "title": "Sort Colors (Dutch National Flag)",
    "description": "Sort array with 0s, 1s, and 2s in single pass.",
    "tags": [
      "java",
      "algorithms",
      "two_pointers"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "[2, 0, 2, 1, 1, 0]",
    "sampleOutput": "[0, 0, 1, 1, 2, 2]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public void sortColors(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def sortColors(self, nums: list[int]) -> void:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[2, 0, 2, 1, 1, 0]",
        "expectedOutput": "[0, 0, 1, 1, 2, 2]",
        "description": "Example 1: Sort Colors (Dutch National Flag)"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[0, 0, 1, 1, 2, 2]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-3m-find-min-rotated",
    "arena": "algorithms",
    "title": "Find Minimum in Rotated Sorted Array",
    "description": "Find minimum element in rotated array in O(log N).",
    "tags": [
      "java",
      "algorithms",
      "binary_search"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "[3, 4, 5, 1, 2]",
    "sampleOutput": "1",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int findMin(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def findMin(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[3, 4, 5, 1, 2]",
        "expectedOutput": "1",
        "description": "Example 1: Find Minimum in Rotated Sorted Array"
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
    "id": "algo-java-medium-3m-max-product-subarray",
    "arena": "algorithms",
    "title": "Maximum Product Subarray",
    "description": "Find contiguous subarray with largest product.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "[2, 3, -2, 4]",
    "sampleOutput": "6",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int maxProduct(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def maxProduct(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[2, 3, -2, 4]",
        "expectedOutput": "6",
        "description": "Example 1: Maximum Product Subarray"
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
    "id": "algo-java-medium-3m-kth-largest",
    "arena": "algorithms",
    "title": "Kth Largest Element in Array",
    "description": "Find the kth largest element in array.",
    "tags": [
      "java",
      "algorithms",
      "heap"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "nums = [3,2,1,5,6,4], k = 2",
    "sampleOutput": "5",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def findKthLargest(self, nums: list[int], k: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [3,2,1,5,6,4], k = 2",
        "expectedOutput": "5",
        "description": "Example 1: Kth Largest Element in Array"
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
    "id": "algo-java-medium-3m-rotate-arr-k",
    "arena": "algorithms",
    "title": "Rotate Array Right by K Steps",
    "description": "Rotate array in-place by k steps.",
    "tags": [
      "java",
      "algorithms",
      "arrays"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "sampleInput": "nums = [1,2,3,4,5,6,7], k = 3",
    "sampleOutput": "[5,6,7,1,2,3,4]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public void rotate(int[] nums, int k) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def rotate(self, nums: list[int], k: int) -> void:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [1,2,3,4,5,6,7], k = 3",
        "expectedOutput": "[5,6,7,1,2,3,4]",
        "description": "Example 1: Rotate Array Right by K Steps"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[5,6,7,1,2,3,4]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-5m-container-water",
    "arena": "algorithms",
    "title": "Container With Most Water",
    "description": "Find two lines forming container with max water volume.",
    "tags": [
      "java",
      "algorithms",
      "two_pointers"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "[1,8,6,2,5,4,8,3,7]",
    "sampleOutput": "49",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[1,8,6,2,5,4,8,3,7]",
        "expectedOutput": "49",
        "description": "Example 1: Container With Most Water"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "49",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-5m-eval-rpn",
    "arena": "algorithms",
    "title": "Evaluate Reverse Polish Notation",
    "description": "Evaluate postfix arithmetic expression tokens.",
    "tags": [
      "java",
      "algorithms",
      "stack"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "[\"2\",\"1\",\"+\",\"3\",\"*\"]",
    "sampleOutput": "9",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int evalRPN(String[] tokens) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def evalRPN(self, tokens: list[str]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int evalRPN(vector<string>& tokens) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[\"2\",\"1\",\"+\",\"3\",\"*\"]",
        "expectedOutput": "9",
        "description": "Example 1: Evaluate Reverse Polish Notation"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "9",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-5m-daily-temp",
    "arena": "algorithms",
    "title": "Daily Temperatures Waiting Days",
    "description": "Days to wait for warmer temperature using monotonic stack.",
    "tags": [
      "java",
      "algorithms",
      "stack"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "[73,74,75,71,69,72,76,73]",
    "sampleOutput": "[1,1,4,2,1,1,0,0]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def dailyTemperatures(self, temperatures: list[int]) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] dailyTemperatures(vector<int>& temperatures) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[73,74,75,71,69,72,76,73]",
        "expectedOutput": "[1,1,4,2,1,1,0,0]",
        "description": "Example 1: Daily Temperatures Waiting Days"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[1,1,4,2,1,1,0,0]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-5m-longest-consec",
    "arena": "algorithms",
    "title": "Longest Consecutive Sequence",
    "description": "Length of longest consecutive integers in O(N).",
    "tags": [
      "java",
      "algorithms",
      "hashmap"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "[100, 4, 200, 1, 3, 2]",
    "sampleOutput": "4",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int longestConsecutive(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def longestConsecutive(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[100, 4, 200, 1, 3, 2]",
        "expectedOutput": "4",
        "description": "Example 1: Longest Consecutive Sequence"
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
    "id": "algo-java-medium-5m-generate-parens",
    "arena": "algorithms",
    "title": "Generate All Valid Parentheses",
    "description": "Generate all n-pair balanced parentheses combinations.",
    "tags": [
      "java",
      "algorithms",
      "backtracking"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "n = 3",
    "sampleOutput": "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<String> generateParenthesis(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def generateParenthesis(self, n: int) -> List<String>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<String> generateParenthesis(int n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "n = 3",
        "expectedOutput": "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
        "description": "Example 1: Generate All Valid Parentheses"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-5m-search-2d-matrix",
    "arena": "algorithms",
    "title": "Search 2D Matrix (Sorted)",
    "description": "Search target in sorted matrix in O(log(M*N)).",
    "tags": [
      "java",
      "algorithms",
      "binary_search"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean searchMatrix(int[][] matrix, int target) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def searchMatrix(self, matrix: list[list[int]], target: int) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean searchMatrix(vector<vector<int>>& matrix, int target) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3",
        "expectedOutput": "true",
        "description": "Example 1: Search 2D Matrix (Sorted)"
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
    "id": "algo-java-medium-5m-coin-change",
    "arena": "algorithms",
    "title": "Coin Change (Fewest Coins DP)",
    "description": "Find fewest coins needed to make amount.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "coins = [1, 2, 5], amount = 11",
    "sampleOutput": "3",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "coins = [1, 2, 5], amount = 11",
        "expectedOutput": "3",
        "description": "Example 1: Coin Change (Fewest Coins DP)"
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
    "id": "algo-java-medium-5m-house-robber",
    "arena": "algorithms",
    "title": "House Robber Maximum Loot",
    "description": "Maximize loot without alerting adjacent alarms.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "[1, 2, 3, 1]",
    "sampleOutput": "4",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int rob(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[1, 2, 3, 1]",
        "expectedOutput": "4",
        "description": "Example 1: House Robber Maximum Loot"
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
    "id": "algo-java-medium-5m-word-break",
    "arena": "algorithms",
    "title": "Word Break in Dictionary",
    "description": "Determine if string can be segmented into words.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def wordBreak(self, s: str, wordDict: list[str]) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean wordBreak(string s, vector<string>& wordDict) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
        "expectedOutput": "true",
        "description": "Example 1: Word Break in Dictionary"
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
    "id": "algo-java-medium-5m-permutations",
    "arena": "algorithms",
    "title": "Permutations of Distinct Array",
    "description": "Generate all permutations of distinct integers.",
    "tags": [
      "java",
      "algorithms",
      "backtracking"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "sampleInput": "[1, 2, 3]",
    "sampleOutput": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def permute(self, nums: list[int]) -> List<List<Integer>>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<List<Integer>> permute(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        "description": "Example 1: Permutations of Distinct Array"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-10m-course-schedule",
    "arena": "algorithms",
    "title": "Course Schedule Cycle Check",
    "description": "Detect cycles in prerequisites graph using topological sort.",
    "tags": [
      "java",
      "algorithms",
      "graphs"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "numCourses = 2, prerequisites = [[1,0]]",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "numCourses = 2, prerequisites = [[1,0]]",
        "expectedOutput": "true",
        "description": "Example 1: Course Schedule Cycle Check"
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
    "id": "algo-java-medium-10m-lru-cache",
    "arena": "algorithms",
    "title": "LRU Cache Implementation",
    "description": "Build O(1) Least Recently Used cache.",
    "tags": [
      "java",
      "algorithms",
      "design"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "[\"LRUCache\",\"put\",\"put\",\"get\"]",
    "sampleOutput": "[null,null,null,1]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public void LRUCache(int capacity) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def LRUCache(self, capacity: int) -> void:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void LRUCache(int capacity) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[\"LRUCache\",\"put\",\"put\",\"get\"]",
        "expectedOutput": "[null,null,null,1]",
        "description": "Example 1: LRU Cache Implementation"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[null,null,null,1]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-10m-decode-ways",
    "arena": "algorithms",
    "title": "Decode Ways Numerical String",
    "description": "Decode digits string into letter combinations.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "\"12\"",
    "sampleOutput": "2",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int numDecodings(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def numDecodings(self, s: str) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numDecodings(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"12\"",
        "expectedOutput": "2",
        "description": "Example 1: Decode Ways Numerical String"
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
    "id": "algo-java-medium-10m-longest-palindrome-sub",
    "arena": "algorithms",
    "title": "Longest Palindromic Substring",
    "description": "Find longest palindrome substring expanding around centers.",
    "tags": [
      "java",
      "algorithms",
      "strings"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "\"babad\"",
    "sampleOutput": "\"bab\"",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public String longestPalindrome(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def longestPalindrome(self, s: str) -> String:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    String longestPalindrome(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"babad\"",
        "expectedOutput": "\"bab\"",
        "description": "Example 1: Longest Palindromic Substring"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "\"bab\"",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-10m-spiral-matrix",
    "arena": "algorithms",
    "title": "Spiral Matrix Clockwise Order",
    "description": "Return all elements of matrix in spiral order.",
    "tags": [
      "java",
      "algorithms",
      "matrix"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "[[1,2,3],[4,5,6],[7,8,9]]",
    "sampleOutput": "[1,2,3,6,9,8,7,4,5]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def spiralOrder(self, matrix: list[list[int]]) -> List<Integer>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<Integer> spiralOrder(vector<vector<int>>& matrix) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[[1,2,3],[4,5,6],[7,8,9]]",
        "expectedOutput": "[1,2,3,6,9,8,7,4,5]",
        "description": "Example 1: Spiral Matrix Clockwise Order"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[1,2,3,6,9,8,7,4,5]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-10m-letter-comb-phone",
    "arena": "algorithms",
    "title": "Phone Keypad Letter Combinations",
    "description": "Return all letter combinations for digits string.",
    "tags": [
      "java",
      "algorithms",
      "backtracking"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "\"23\"",
    "sampleOutput": "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<String> letterCombinations(String digits) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def letterCombinations(self, digits: str) -> List<String>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<String> letterCombinations(string digits) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"23\"",
        "expectedOutput": "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]",
        "description": "Example 1: Phone Keypad Letter Combinations"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-10m-min-stack",
    "arena": "algorithms",
    "title": "Min Stack with O(1) Retrieval",
    "description": "Stack supporting O(1) push, pop, top, and getMin.",
    "tags": [
      "java",
      "algorithms",
      "design"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "[\"MinStack\",\"push\",\"push\",\"getMin\"]",
    "sampleOutput": "[null,null,null,-3]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public void MinStack() {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def MinStack(self, ) -> void:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void MinStack() {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[\"MinStack\",\"push\",\"push\",\"getMin\"]",
        "expectedOutput": "[null,null,null,-3]",
        "description": "Example 1: Min Stack with O(1) Retrieval"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[null,null,null,-3]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-10m-target-sum",
    "arena": "algorithms",
    "title": "Target Sum (+/-) Expressions",
    "description": "Ways to assign +/- to nums to achieve target.",
    "tags": [
      "java",
      "algorithms",
      "dp"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "nums = [1,1,1,1,1], target = 3",
    "sampleOutput": "5",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int findTargetSumWays(int[] nums, int target) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def findTargetSumWays(self, nums: list[int], target: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findTargetSumWays(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [1,1,1,1,1], target = 3",
        "expectedOutput": "5",
        "description": "Example 1: Target Sum (+/-) Expressions"
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
    "id": "algo-java-medium-10m-build-tree",
    "arena": "algorithms",
    "title": "Reconstruct Tree from Preorder and Inorder",
    "description": "Build binary tree given preorder and inorder arrays.",
    "tags": [
      "java",
      "algorithms",
      "trees"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]",
    "sampleOutput": "[3,9,20,null,null,15,7]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public TreeNode buildTree(int[] preorder, int[] inorder) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def buildTree(self, preorder: list[int], inorder: list[int]) -> TreeNode:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    TreeNode buildTree(vector<int>& preorder, vector<int>& inorder) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]",
        "expectedOutput": "[3,9,20,null,null,15,7]",
        "description": "Example 1: Reconstruct Tree from Preorder and Inorder"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[3,9,20,null,null,15,7]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-java-medium-10m-number-of-islands",
    "arena": "algorithms",
    "title": "Number of Islands in 2D Grid",
    "description": "Count connected land clusters in binary grid.",
    "tags": [
      "java",
      "algorithms",
      "graphs"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "sampleInput": "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]",
    "sampleOutput": "2",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]",
        "expectedOutput": "2",
        "description": "Example 1: Number of Islands in 2D Grid"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "2",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  }
];
