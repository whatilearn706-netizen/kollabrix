/**
 * Intelligent Test Case Verifier for Competitive Programming
 * 
 * Handles:
 * 1. Exact string / JSON equality
 * 2. Whitespace-insensitive array matching
 * 3. Permutation-invariant matching for Parity sorting (any arrangement where evens precede odds)
 */

export function verifyTestOutput(
  questionId: string,
  actualOutput: string,
  expectedOutput: string,
  input: string
): boolean {
  const actual = (actualOutput || '').trim();
  const expected = (expectedOutput || '').trim();

  if (!actual) return false;

  // 1. Direct equality or whitespace-normalized equality
  if (actual === expected) return true;
  if (actual.replace(/\s+/g, '') === expected.replace(/\s+/g, '')) return true;
  if (actual.includes(expected)) return true;

  // 2. Parity Sort Validator (Sort Array by Parity)
  if (questionId === 'q-algo-dsa-1') {
    try {
      const extractNumbers = (str: string): number[] => {
        const matches = str.match(/-?\d+/g);
        return matches ? matches.map(Number) : [];
      };

      const outNums = extractNumbers(actual);
      const inNums = extractNumbers(input);

      if (outNums.length !== inNums.length) return false;

      // Verify same multiset of numbers
      const sortedIn = [...inNums].sort((a, b) => a - b);
      const sortedOut = [...outNums].sort((a, b) => a - b);
      for (let i = 0; i < sortedIn.length; i++) {
        if (sortedIn[i] !== sortedOut[i]) return false;
      }

      // Verify all even numbers precede all odd numbers
      let seenOdd = false;
      for (const n of outNums) {
        if (Math.abs(n) % 2 !== 0) {
          seenOdd = true;
        } else if (seenOdd) {
          // Even number found after an odd number -> invalid parity partition
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  return false;
}
