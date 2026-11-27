import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * Calibrated KΛ ARENA Algorithmic Questions (30 items)
 * Designed for competitive collegiate duels with ~30 seconds margin to spare.
 */
export const PYTHON_EASY_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "algo-python-easy-3m-rev-words",
    "arena": "algorithms",
    "title": "Reverse Words in Sentence",
    "description": "Reverse the order of words in a sentence.",
    "tags": [
      "python",
      "algorithms",
      "strings"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "the sky is blue",
    "sampleOutput": "blue is sky the",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public String reverseWords(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def reverseWords(self, s: str) -> String:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    String reverseWords(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "the sky is blue",
        "expectedOutput": "blue is sky the",
        "description": "Example 1: Reverse Words in Sentence"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "blue is sky the",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-3m-power-of-two",
    "arena": "algorithms",
    "title": "Power of Two Check",
    "description": "Return true if integer n is a power of two.",
    "tags": [
      "python",
      "algorithms",
      "bitwise"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "16",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean isPowerOfTwo(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def isPowerOfTwo(self, n: int) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean isPowerOfTwo(int n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "16",
        "expectedOutput": "true",
        "description": "Example 1: Power of Two Check"
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
    "id": "algo-python-easy-3m-parity-sort",
    "arena": "algorithms",
    "title": "Array Parity Partition",
    "description": "Move even integers to front followed by odd integers.",
    "tags": [
      "python",
      "algorithms",
      "arrays"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "[3, 1, 2, 4]",
    "sampleOutput": "[2, 4, 3, 1]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] sortArrayByParity(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def sortArrayByParity(self, nums: list[int]) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] sortArrayByParity(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[3, 1, 2, 4]",
        "expectedOutput": "[2, 4, 3, 1]",
        "description": "Example 1: Array Parity Partition"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[2, 4, 3, 1]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-3m-vowel-consonant",
    "arena": "algorithms",
    "title": "Vowel and Consonant Counter",
    "description": "Count vowels and consonants in a string ignoring symbols.",
    "tags": [
      "python",
      "algorithms",
      "strings"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "\"hello world\"",
    "sampleOutput": "[3, 7]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] countVowelsConsonants(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def countVowelsConsonants(self, s: str) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] countVowelsConsonants(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"hello world\"",
        "expectedOutput": "[3, 7]",
        "description": "Example 1: Vowel and Consonant Counter"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[3, 7]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-3m-missing-number",
    "arena": "algorithms",
    "title": "Missing Number in Range",
    "description": "Find the missing number in range [0, n].",
    "tags": [
      "python",
      "algorithms",
      "arrays"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "[3, 0, 1]",
    "sampleOutput": "2",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int missingNumber(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def missingNumber(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[3, 0, 1]",
        "expectedOutput": "2",
        "description": "Example 1: Missing Number in Range"
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
    "id": "algo-python-easy-3m-valid-palindrome",
    "arena": "algorithms",
    "title": "Valid Palindrome Alphanumeric",
    "description": "Check if string is palindrome ignoring non-alphanumeric.",
    "tags": [
      "python",
      "algorithms",
      "strings"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "\"A man, a plan, a canal: Panama\"",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def isPalindrome(self, s: str) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean isPalindrome(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"A man, a plan, a canal: Panama\"",
        "expectedOutput": "true",
        "description": "Example 1: Valid Palindrome Alphanumeric"
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
    "id": "algo-python-easy-3m-fizz-buzz",
    "arena": "algorithms",
    "title": "FizzBuzz Array Generator",
    "description": "Generate FizzBuzz list from 1 to n.",
    "tags": [
      "python",
      "algorithms",
      "math"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "5",
    "sampleOutput": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<String> fizzBuzz(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def fizzBuzz(self, n: int) -> List<String>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<String> fizzBuzz(int n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "5",
        "expectedOutput": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]",
        "description": "Example 1: FizzBuzz Array Generator"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-3m-single-number",
    "arena": "algorithms",
    "title": "Single Non-Duplicate Number",
    "description": "Find element appearing once where all others appear twice.",
    "tags": [
      "python",
      "algorithms",
      "bitwise"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "[4, 1, 2, 1, 2]",
    "sampleOutput": "4",
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
        "input": "[4, 1, 2, 1, 2]",
        "expectedOutput": "4",
        "description": "Example 1: Single Non-Duplicate Number"
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
    "id": "algo-python-easy-3m-second-largest",
    "arena": "algorithms",
    "title": "Find Second Largest Element",
    "description": "Find the second largest unique integer in array.",
    "tags": [
      "python",
      "algorithms",
      "arrays"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "[12, 35, 1, 10, 34, 1]",
    "sampleOutput": "34",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int getSecondLargest(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def getSecondLargest(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int getSecondLargest(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[12, 35, 1, 10, 34, 1]",
        "expectedOutput": "34",
        "description": "Example 1: Find Second Largest Element"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "34",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-3m-capitalize-words",
    "arena": "algorithms",
    "title": "Capitalize Sentence Words",
    "description": "Capitalize first character of each word in string.",
    "tags": [
      "python",
      "algorithms",
      "strings"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "sampleInput": "\"collegiate code battle\"",
    "sampleOutput": "\"Collegiate Code Battle\"",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public String capitalizeTitle(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def capitalizeTitle(self, s: str) -> String:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    String capitalizeTitle(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"collegiate code battle\"",
        "expectedOutput": "\"Collegiate Code Battle\"",
        "description": "Example 1: Capitalize Sentence Words"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "\"Collegiate Code Battle\"",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-5m-two-sum",
    "arena": "algorithms",
    "title": "Two Sum Target Pair",
    "description": "Return indices of two numbers that add up to target.",
    "tags": [
      "python",
      "algorithms",
      "hashmap"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "nums = [2, 7, 11, 15], target = 9",
    "sampleOutput": "[0, 1]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [2, 7, 11, 15], target = 9",
        "expectedOutput": "[0, 1]",
        "description": "Example 1: Two Sum Target Pair"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[0, 1]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-5m-valid-parens",
    "arena": "algorithms",
    "title": "Valid Parentheses Balance",
    "description": "Validate bracket strings containing (), {}, and [].",
    "tags": [
      "python",
      "algorithms",
      "stack"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "\"()[]{}\"",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def isValid(self, s: str) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean isValid(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"()[]{}\"",
        "expectedOutput": "true",
        "description": "Example 1: Valid Parentheses Balance"
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
    "id": "algo-python-easy-5m-merge-sorted-arr",
    "arena": "algorithms",
    "title": "Merge Two Sorted Arrays In-Place",
    "description": "Merge nums2 into nums1 in-place in sorted order.",
    "tags": [
      "python",
      "algorithms",
      "two_pointers"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
    "sampleOutput": "[1,2,2,3,5,6]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def merge(self, nums1: list[int], m: int, nums2: list[int], n: int) -> void:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        "expectedOutput": "[1,2,2,3,5,6]",
        "description": "Example 1: Merge Two Sorted Arrays In-Place"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[1,2,2,3,5,6]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-5m-longest-prefix",
    "arena": "algorithms",
    "title": "Longest Common Prefix",
    "description": "Find longest common prefix among an array of strings.",
    "tags": [
      "python",
      "algorithms",
      "strings"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "[\"flower\",\"flow\",\"flight\"]",
    "sampleOutput": "\"fl\"",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public String longestCommonPrefix(String[] strs) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def longestCommonPrefix(self, strs: list[str]) -> String:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    String longestCommonPrefix(vector<string>& strs) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[\"flower\",\"flow\",\"flight\"]",
        "expectedOutput": "\"fl\"",
        "description": "Example 1: Longest Common Prefix"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "\"fl\"",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-5m-majority-element",
    "arena": "algorithms",
    "title": "Majority Element Over N/2",
    "description": "Find majority element using Boyer-Moore algorithm.",
    "tags": [
      "python",
      "algorithms",
      "arrays"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "[2, 2, 1, 1, 1, 2, 2]",
    "sampleOutput": "2",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int majorityElement(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def majorityElement(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int majorityElement(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[2, 2, 1, 1, 1, 2, 2]",
        "expectedOutput": "2",
        "description": "Example 1: Majority Element Over N/2"
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
    "id": "algo-python-easy-5m-move-zeroes",
    "arena": "algorithms",
    "title": "Move Zeroes to End of Array",
    "description": "Move all 0s to end while preserving non-zero order.",
    "tags": [
      "python",
      "algorithms",
      "two_pointers"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "[0, 1, 0, 3, 12]",
    "sampleOutput": "[1, 3, 12, 0, 0]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public void moveZeroes(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def moveZeroes(self, nums: list[int]) -> void:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[0, 1, 0, 3, 12]",
        "expectedOutput": "[1, 3, 12, 0, 0]",
        "description": "Example 1: Move Zeroes to End of Array"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[1, 3, 12, 0, 0]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-5m-buy-sell-stock",
    "arena": "algorithms",
    "title": "Best Time to Buy and Sell Stock",
    "description": "Find maximum single transaction profit.",
    "tags": [
      "python",
      "algorithms",
      "arrays"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "[7, 1, 5, 3, 6, 4]",
    "sampleOutput": "5",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[7, 1, 5, 3, 6, 4]",
        "expectedOutput": "5",
        "description": "Example 1: Best Time to Buy and Sell Stock"
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
    "id": "algo-python-easy-5m-contains-dup-k",
    "arena": "algorithms",
    "title": "Contains Duplicate within K Window",
    "description": "Return true if duplicate exists within index distance k.",
    "tags": [
      "python",
      "algorithms",
      "sliding_window"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "nums = [1, 2, 3, 1], k = 3",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean containsNearbyDuplicate(int[] nums, int k) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def containsNearbyDuplicate(self, nums: list[int], k: int) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean containsNearbyDuplicate(vector<int>& nums, int k) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [1, 2, 3, 1], k = 3",
        "expectedOutput": "true",
        "description": "Example 1: Contains Duplicate within K Window"
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
    "id": "algo-python-easy-5m-intersect-arrays",
    "arena": "algorithms",
    "title": "Intersection of Two Arrays II",
    "description": "Return intersecting elements including multiplicity.",
    "tags": [
      "python",
      "algorithms",
      "hashmap"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "nums1 = [1,2,2,1], nums2 = [2,2]",
    "sampleOutput": "[2,2]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] intersect(int[] nums1, int[] nums2) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def intersect(self, nums1: list[int], nums2: list[int]) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] intersect(vector<int>& nums1, vector<int>& nums2) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums1 = [1,2,2,1], nums2 = [2,2]",
        "expectedOutput": "[2,2]",
        "description": "Example 1: Intersection of Two Arrays II"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[2,2]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-5m-first-bad-ver",
    "arena": "algorithms",
    "title": "First Bad Version Binary Search",
    "description": "Find first defective build using binary search.",
    "tags": [
      "python",
      "algorithms",
      "binary_search"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "sampleInput": "n = 5, bad = 4",
    "sampleOutput": "4",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int firstBadVersion(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def firstBadVersion(self, n: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int firstBadVersion(int n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "n = 5, bad = 4",
        "expectedOutput": "4",
        "description": "Example 1: First Bad Version Binary Search"
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
    "id": "algo-python-easy-10m-climb-stairs",
    "arena": "algorithms",
    "title": "Climbing Stairs Ways",
    "description": "Count distinct ways to climb n stairs taking 1 or 2 steps.",
    "tags": [
      "python",
      "algorithms",
      "dp"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "n = 3",
    "sampleOutput": "3",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "n = 3",
        "expectedOutput": "3",
        "description": "Example 1: Climbing Stairs Ways"
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
    "id": "algo-python-easy-10m-subarray-sum-k",
    "arena": "algorithms",
    "title": "Subarray Sum Equals K",
    "description": "Count continuous subarrays whose sum equals k.",
    "tags": [
      "python",
      "algorithms",
      "hashmap"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "nums = [1, 1, 1], k = 2",
    "sampleOutput": "2",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int subarraySum(int[] nums, int k) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def subarraySum(self, nums: list[int], k: int) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [1, 1, 1], k = 2",
        "expectedOutput": "2",
        "description": "Example 1: Subarray Sum Equals K"
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
    "id": "algo-python-easy-10m-merge-intervals",
    "arena": "algorithms",
    "title": "Merge Overlapping Intervals",
    "description": "Merge all overlapping intervals in list.",
    "tags": [
      "python",
      "algorithms",
      "intervals"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "[[1,3],[2,6],[8,10],[15,18]]",
    "sampleOutput": "[[1,6],[8,10],[15,18]]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def merge(self, intervals: list[list[int]]) -> int[][]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[][] merge(vector<vector<int>>& intervals) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[[1,3],[2,6],[8,10],[15,18]]",
        "expectedOutput": "[[1,6],[8,10],[15,18]]",
        "description": "Example 1: Merge Overlapping Intervals"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[[1,6],[8,10],[15,18]]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-10m-group-anagrams",
    "arena": "algorithms",
    "title": "Group Anagrams by Pattern",
    "description": "Group array of words into lists of anagrams.",
    "tags": [
      "python",
      "algorithms",
      "hashmap"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
    "sampleOutput": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def groupAnagrams(self, strs: list[str]) -> List<List<String>>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<List<String>> groupAnagrams(vector<string>& strs) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "expectedOutput": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]",
        "description": "Example 1: Group Anagrams by Pattern"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-10m-product-except-self",
    "arena": "algorithms",
    "title": "Product of Array Except Self",
    "description": "Calculate product array without division in O(N).",
    "tags": [
      "python",
      "algorithms",
      "arrays"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "[1, 2, 3, 4]",
    "sampleOutput": "[24, 12, 8, 6]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def productExceptSelf(self, nums: list[int]) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] productExceptSelf(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[1, 2, 3, 4]",
        "expectedOutput": "[24, 12, 8, 6]",
        "description": "Example 1: Product of Array Except Self"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[24, 12, 8, 6]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-10m-rotate-matrix",
    "arena": "algorithms",
    "title": "Rotate 2D Matrix 90 Degrees",
    "description": "Rotate N x N matrix clockwise in-place.",
    "tags": [
      "python",
      "algorithms",
      "matrix"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "[[1,2,3],[4,5,6],[7,8,9]]",
    "sampleOutput": "[[7,4,1],[8,5,2],[9,6,3]]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public void rotate(int[][] matrix) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def rotate(self, matrix: list[list[int]]) -> void:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void rotate(vector<vector<int>>& matrix) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[[1,2,3],[4,5,6],[7,8,9]]",
        "expectedOutput": "[[7,4,1],[8,5,2],[9,6,3]]",
        "description": "Example 1: Rotate 2D Matrix 90 Degrees"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[[7,4,1],[8,5,2],[9,6,3]]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-10m-longest-unique-sub",
    "arena": "algorithms",
    "title": "Longest Substring Without Repeats",
    "description": "Length of longest substring without repeating characters.",
    "tags": [
      "python",
      "algorithms",
      "sliding_window"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "\"abcabcbb\"",
    "sampleOutput": "3",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "\"abcabcbb\"",
        "expectedOutput": "3",
        "description": "Example 1: Longest Substring Without Repeats"
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
    "id": "algo-python-easy-10m-top-k-frequent",
    "arena": "algorithms",
    "title": "Top K Frequent Elements",
    "description": "Return the k most frequent numbers.",
    "tags": [
      "python",
      "algorithms",
      "heap"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "nums = [1,1,1,2,2,3], k = 2",
    "sampleOutput": "[1, 2]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def topKFrequent(self, nums: list[int], k: int) -> int[]:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int[] topKFrequent(vector<int>& nums, int k) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "nums = [1,1,1,2,2,3], k = 2",
        "expectedOutput": "[1, 2]",
        "description": "Example 1: Top K Frequent Elements"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[1, 2]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-10m-three-sum",
    "arena": "algorithms",
    "title": "Three Sum to Zero",
    "description": "Find unique triplets that add up to 0.",
    "tags": [
      "python",
      "algorithms",
      "two_pointers"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "[-1, 0, 1, 2, -1, -4]",
    "sampleOutput": "[[-1, -1, 2], [-1, 0, 1]]",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def threeSum(self, nums: list[int]) -> List<List<Integer>>:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    List<List<Integer>> threeSum(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "[-1, 0, 1, 2, -1, -4]",
        "expectedOutput": "[[-1, -1, 2], [-1, 0, 1]]",
        "description": "Example 1: Three Sum to Zero"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "[[-1, -1, 2], [-1, 0, 1]]",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  },
  {
    "id": "algo-python-easy-10m-valid-sudoku",
    "arena": "algorithms",
    "title": "Valid Sudoku Board 9x9",
    "description": "Determine if a 9x9 Sudoku board is valid.",
    "tags": [
      "python",
      "algorithms",
      "matrix"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "sampleInput": "board = [[\"5\",\"3\",\".\"...]]",
    "sampleOutput": "true",
    "explanation": "Optimal solution executes in O(N) or O(log N) under time limit.",
    "constraints": [
      "Time Complexity: Optimal for collegiate speed duels",
      "Memory: Clean allocation"
    ],
    "starterJava": "import java.util.*;\n\nclass Solution {\n    public boolean isValidSudoku(char[][] board) {\n        // Write your solution here\n        return null;\n    }\n}",
    "starterPython": "class Solution:\n    def isValidSudoku(self, board: list[list[str]]) -> boolean:\n        # Write your solution here\n        pass",
    "starterCpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    boolean isValidSudoku(vector<vector<char>>& board) {\n        // Write your solution here\n        return {};\n    }\n};",
    "testCases": [
      {
        "input": "board = [[\"5\",\"3\",\".\"...]]",
        "expectedOutput": "true",
        "description": "Example 1: Valid Sudoku Board 9x9"
      },
      {
        "input": "Hidden Test 1",
        "expectedOutput": "true",
        "description": "Verification Boundary Test",
        "isHidden": true
      }
    ]
  }
];
