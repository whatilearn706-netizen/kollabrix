import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const CPP_BEGINNER_SPEC: TrackSpec = {
  id: 'cpp-beginner',
  language: 'cpp',
  track: 'beginner',
  title: 'C++ Complete Beginner Track',
  tagline: 'Zero to Systems: Fast I/O, Types, Loops, Functions, Arrays, Pointers & OOP',
  icon: '⚡',
  color: 'text-cyan-500 dark:text-cyan-400',
  badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  borderColor: 'border-cyan-400/30 hover:border-cyan-400/70',
  description:
    'Start-to-finish Modern C++ (C++17/20) foundation covering fast I/O, 64-bit arithmetic, loops, pass-by-reference, arrays/strings, pointers/RAII, and classes with 70 practice problems.',
  compilerLanguage: 'cpp',
  compilerDisplayName: 'C++ (GCC G++)',
  estimatedTotalHours: '20 Hours',
  prerequisites: ['None — begins with your first C++ binary'],
  outcomes: [
    'Compile modern C++ cleanly with fast `ios::sync_with_stdio(false)` I/O',
    'Avoid signed overflow and undefined behavior in 32/64-bit math',
    'Use references (`&`), pointers, and RAII smart memory safely',
    'Build clean `std::vector`, `std::string`, and C++ OOP classes',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'C++ Structure, Compilation & Fast I/O',
      topic: 'G++ Pipeline, cout, iomanip & \\n vs endl',
      estimatedTime: '2 Hours',
      summary:
        'Understand preprocessing, g++ compilation to native machine code, why `\\n` beats `std::endl`, and formatting output cleanly.',
      studyMaterial: {
        overview:
          'Unlike bytecode languages, `g++` compiles C++ directly into native CPU machine code. For competitive programming and ICPC, untie `cin`/`cout` from C `stdio` and avoid `std::endl` inside loops because `endl` flushes the buffer every line.',
        keyPoints: [
          '`ios::sync_with_stdio(false); cin.tie(nullptr);` speeds up large I/O by 5–10x.',
          'Prefer `\'\\n\'` over `std::endl` unless flushing interactive output immediately.',
          '`cout << fixed << setprecision(2) << x` prints exact fixed decimals.',
          '`using namespace std;` is convenient in CP scripts, while `std::` explicit prefixes are best in production headers.',
        ],
        codeExamples: [
          {
            title: 'Fast I/O & Fixed Decimal Boilerplate',
            code: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout << "KΛ C++ Ready\\n" << fixed << setprecision(2) << 22.0 / 7 << '\\n';
    return 0;
}`,
            explanation: 'Includes `<iostream>` and `<iomanip>` for exact decimal output.',
          },
        ],
        cheatsheet: [
          'ios::sync_with_stdio(false); cin.tie(nullptr);',
          'fixed << setprecision(k) -> k decimal places',
          '\'\\n\' instead of endl prevents I/O TLE',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/io/manip/setprecision',
      },
      video: yt(
        'C++ Full Course — Setup, Output & Fast Basics',
        'Bro Code',
        '-TkoO8Z07hI',
        '6h 00m',
        'Work through C++ compilation, cout formatting, namespaces, and arithmetic expressions.',
      ),
      compilerStarterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    cout << "C++ Engine Active\\n";
    cout << fixed << setprecision(3) << (100.0 / 3.0) << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cb-1-1',
          title: 'Print Dual Status Lines',
          difficulty: 'Easy',
          description: 'Output exact lines:\nLang: C++20\nMode: FastIO',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print exact lines
    return 0;
}`,
          expectedOutput: 'Lang: C++20\nMode: FastIO',
          hints: ['Use cout with \\n between lines.'],
        },
        {
          id: 'cb-1-2',
          title: 'Precision Formatting With iomanip',
          difficulty: 'Easy',
          description: 'Print `pi = 355.0 / 113.0` to 4 decimal places as: 3.1416',
          starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double pi = 355.0 / 113.0;
    // TODO: Print with fixed << setprecision(4)
    return 0;
}`,
          expectedOutput: '3.1416',
          hints: ['cout << fixed << setprecision(4) << pi << \'\\n\';'],
        },
        {
          id: 'cb-1-3',
          title: 'Zero-Padded Time Stamp',
          difficulty: 'Easy',
          description: 'Using `setw(2)` and `setfill(\'0\')`, print hour=7, min=5, sec=9 as: 07:05:09',
          starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int h = 7, m = 5, s = 9;
    // TODO: Format with setw(2) and setfill('0')
    return 0;
}`,
          expectedOutput: '07:05:09',
          hints: ['setw applies only to the next field, so repeat setw(2) before each number.'],
        },
        {
          id: 'cb-1-4',
          title: 'Raw String Literal Path',
          difficulty: 'Easy',
          description: 'Print raw path `C:\\Users\\kollabrix\\main.cpp` using C++11 raw string `R"(...)"`.',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print raw string path
    return 0;
}`,
          expectedOutput: 'C:\\Users\\kollabrix\\main.cpp',
          hints: ['cout << R"(C:\\Users\\kollabrix\\main.cpp)" << \'\\n\'; -> inside R"(...)" write single backslashes!'],
        },
        {
          id: 'cb-1-5',
          title: 'sizeof Fundamental Types',
          difficulty: 'Easy',
          description: 'Print exact byte sizes on 64-bit Linux for `char`, `int`, `long long`: 1 4 8',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print sizeof(char), sizeof(int), sizeof(long long)
    return 0;
}`,
          expectedOutput: '1 4 8',
          hints: ['cout << sizeof(char) << " " << sizeof(int) << " " << sizeof(long long) << \'\\n\';'],
        },
        {
          id: 'cb-1-6',
          title: 'Integer vs Floating Division',
          difficulty: 'Easy',
          description: 'Given a = 11, b = 4, print integer quotient and double quotient (`.2f`): 2 2.75',
          starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int a = 11, b = 4;
    // TODO: Print int quotient then static_cast<double>(a)/b
    return 0;
}`,
          expectedOutput: '2 2.75',
          hints: ['Use static_cast<double>(a) / b with setprecision(2).'],
        },
        {
          id: 'cb-1-7',
          title: 'Boolean Alpha Formatting',
          difficulty: 'Easy',
          description: 'Print `(10 > 3)` as `true` and `(5 == 9)` as `false` using `boolalpha`: true false',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Enable boolalpha and print both booleans
    return 0;
}`,
          expectedOutput: 'true false',
          hints: ['cout << boolalpha << (10 > 3) << " " << (5 == 9) << \'\\n\';'],
        },
        {
          id: 'cb-1-8',
          title: 'ASCII Box Header',
          difficulty: 'Easy',
          description: 'Print:\n=====\n[C++]\n=====',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '=====\n[C++]\n=====',
          hints: ['Three lines separated by \\n.'],
        },
        {
          id: 'cb-1-9',
          title: 'Fahrenheit to Celsius',
          difficulty: 'Easy',
          description: 'Convert f = 212.0 to Celsius using `(f - 32.0) * 5.0 / 9.0` -> 100.0',
          starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double f = 212.0;
    // TODO: Print with fixed << setprecision(1)
    return 0;
}`,
          expectedOutput: '100.0',
          hints: ['cout << fixed << setprecision(1) << (f - 32.0) * 5.0 / 9.0 << \'\\n\';'],
        },
        {
          id: 'cb-1-10',
          title: 'Remainder & Quotient Split',
          difficulty: 'Easy',
          description: 'For 47 divided by 5, print `q=9 r=2`.',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int a = 47, b = 5;
    // TODO
    return 0;
}`,
          expectedOutput: 'q=9 r=2',
          hints: ['a / b gives quotient, a % b gives remainder.'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'Types, 64-Bit Overflow & Bitwise Ops',
      topic: 'long long, Casting & Bit Manipulation',
      estimatedTime: '2.5 Hours',
      summary:
        'Prevent silent 32-bit signed integer overflow in C++, master `1LL << k` shifts, and use `__builtin_popcount` and bitwise checks.',
      studyMaterial: {
        overview:
          'Signed `int` overflow is Undefined Behavior in C++. In ICPC and OA tests, whenever constraints reach `10^5` and numbers get multiplied (`N * N`), cast operands with `1LL * a * b` or declare `long long`.',
        keyPoints: [
          '`int` max is `2,147,483,647` (~2×10⁹). `long long` holds up to `9.22 × 10¹⁸`.',
          'Never write `1 << 40` (overflows 32-bit `1`!). Always write `1LL << 40`.',
          'Prefer `(a % M + M) % M` for modulo on negative integers because C++ `%` keeps the dividend sign.',
          '`__builtin_popcountll(x)` counts set bits in 64-bit numbers in one CPU instruction.',
        ],
        codeExamples: [
          {
            title: 'Overflow-Safe 64-Bit Shift & Modulo',
            code: `#include <iostream>
using namespace std;

int main() {
    int a = 200000, b = 200000;
    long long prod = 1LL * a * b;
    long long negMod = ((-7 % 5) + 5) % 5;
    cout << prod << " " << negMod << '\\n';
}`,
            explanation: 'Outputs `40000000000 3` cleanly with zero undefined behavior.',
          },
        ],
        cheatsheet: [
          '1LL * a * b -> forces 64-bit multiplication',
          '1LL << k -> safe 2^k up to k = 62',
          '((x % m) + m) % m -> strictly non-negative modulo',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/language/types',
      },
      video: yt(
        'C++ Tutorial for Beginners — Variables & Data Types',
        'freeCodeCamp.org',
        'vLnPwxZdW4Y',
        '4h 01m',
        'Complete walkthrough of C++ numeric types, operators, and casting.',
      ),
      compilerStarterCode: `#include <iostream>
using namespace std;

int main() {
    int a = 100000, b = 100000;
    cout << 1LL * a * b << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cb-2-1',
          title: '64-Bit Safe Multiplication',
          difficulty: 'Easy',
          description: 'Multiply `a = 500000` by `b = 400000` without 32-bit overflow and print: 200000000000',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int a = 500000, b = 400000;
    // TODO: Print 64-bit product
    return 0;
}`,
          expectedOutput: '200000000000',
          hints: ['Multiply `1LL * a * b`.'],
        },
        {
          id: 'cb-2-2',
          title: 'Euclidean True Modulo for Negative Numbers',
          difficulty: 'Easy',
          description: 'Compute mathematical `-17 mod 5` (must be in `[0..4]`) and print: 3',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int x = -17, m = 5;
    // TODO: Normalize negative modulo cleanly
    return 0;
}`,
          expectedOutput: '3',
          hints: ['((x % m) + m) % m yields 3 instead of C++’s -2.'],
        },
        {
          id: 'cb-2-3',
          title: '64-Bit Power of Two Shift',
          difficulty: 'Easy',
          description: 'Compute `2^40` using a bit shift safely in `long long` -> 1099511627776',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print (1LL << 40)
    return 0;
}`,
          expectedOutput: '1099511627776',
          hints: ['Use 1LL (not 1) before shifting by 40.'],
        },
        {
          id: 'cb-2-4',
          title: 'Toggle K-th Bit (0-Indexed)',
          difficulty: 'Easy',
          description: 'Given n = 10 (`1010`), toggle bit 0 -> `1011` (11), then toggle bit 3 -> `0011` (3). Print: 11 3',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int n = 10;
    // TODO: XOR with (1 << k)
    return 0;
}`,
          expectedOutput: '11 3',
          hints: ['`n ^ (1 << k)` flips bit k cleanly.'],
        },
        {
          id: 'cb-2-5',
          title: 'Single Non-Repeating Element via XOR',
          difficulty: 'Easy',
          description: 'All numbers appear twice except one in `{4, 1, 2, 1, 2}`. Find the unique number in O(1) space -> 4',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int a[] = {4, 1, 2, 1, 2};
    // TODO: XOR all elements together
    return 0;
}`,
          expectedOutput: '4',
          hints: ['x ^ x == 0 and x ^ 0 == x.'],
        },
        {
          id: 'cb-2-6',
          title: 'Popcount (Count Set Bits)',
          difficulty: 'Easy',
          description: 'Count set bits in `255` and `1023` -> print: 8 10',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Count set bits via Brian Kernighan loop or __builtin_popcount
    return 0;
}`,
          expectedOutput: '8 10',
          hints: ['`__builtin_popcount(255)` returns 8.'],
        },
        {
          id: 'cb-2-7',
          title: 'Lowest Set Bit Isolation',
          difficulty: 'Medium',
          description: 'Isolate lowest set bit value of `n = 40` (`101000` -> `8`) using `n & -n` -> 8',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int n = 40;
    // TODO: Print value of lowest set bit
    return 0;
}`,
          expectedOutput: '8',
          hints: ['In two’s complement, `n & -n` isolates the lowest 1-bit (Fenwick tree core trick).'],
        },
        {
          id: 'cb-2-8',
          title: 'Ceiling Integer Division Formula',
          difficulty: 'Easy',
          description: 'Compute ceil(25 / 4) using integer arithmetic only (`(a + b - 1) / b`) -> 7',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int a = 25, b = 4;
    // TODO: Print integer ceiling without floating point
    return 0;
}`,
          expectedOutput: '7',
          hints: ['For positive integers, `(a + b - 1) / b` avoids float rounding errors.'],
        },
        {
          id: 'cb-2-9',
          title: 'Check Opposite Signs Bit Trick',
          difficulty: 'Easy',
          description: 'Check if `(-5, 9)` have opposite signs and `(4, 8)` using `(a ^ b) < 0` -> 1 0',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print bool results (1 / 0) for (-5, 9) and (4, 8)
    return 0;
}`,
          expectedOutput: '1 0',
          hints: ['Sign bit is bit 31; XOR sign bit is 1 (negative) iff signs differ.'],
        },
        {
          id: 'cb-2-10',
          title: 'Modular Addition Under 10^9+7',
          difficulty: 'Medium',
          description: 'Compute `(999999999 + 50) % 1000000007` using 64-bit safety -> 42',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    const long long MOD = 1000000007;
    long long a = 999999999, b = 50;
    // TODO
    return 0;
}`,
          expectedOutput: '42',
          hints: ['((a % MOD) + (b % MOD)) % MOD'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Control Flow, Loops & Number Algorithms',
      topic: 'Conditionals, Range-For & Primality',
      estimatedTime: '2.5 Hours',
      summary:
        'Master C++ conditionals, range-based `for (int x : arr)` loops, Euclid GCD, Sieve basics, and clean loop termination.',
      studyMaterial: {
        overview:
          'Modern C++ supports clean range-based loops (`for (const auto& x : container)`). Always combine tight loop invariants with O(√N) or Sieve bounds for number theory problems.',
        keyPoints: [
          'C++17 `<numeric>` provides `std::gcd(a, b)` and `std::lcm(a, b)` built right in.',
          'Prefer `1LL * i * i <= n` in prime/divisor loops to guard against 32-bit squaring overflow.',
          'Range-based loops iterate cleanly without off-by-one index bugs.',
        ],
        codeExamples: [
          {
            title: 'Range-Based Sum & Prime Divisor Count',
            code: `#include <iostream>
#include <numeric>
using namespace std;

int main() {
    cout << "GCD: " << std::gcd(84, 36) << '\\n';
}`,
            explanation: '`std::gcd` in `<numeric>` computes GCD natively in O(log min(a,b)).',
          },
        ],
        cheatsheet: [
          'for (int x : arr) -> read-only copy',
          'for (int& x : arr) -> mutate in place',
          'std::gcd(a, b) / std::lcm(a, b) -> <numeric>',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/language/range-for',
      },
      video: yt(
        'C++ Conditionals, Loops & Flow Control',
        'CodeHelp - by Babbar',
        'WQoB2z67hvY',
        '48m',
        'Great visual intuition for conditionals, while loops, and pattern building.',
      ),
      compilerStarterCode: `#include <iostream>
using namespace std;

int main() {
    int n = 5, f = 1;
    for (int i = 2; i <= n; i++) f *= i;
    cout << f << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cb-3-1',
          title: 'Sum of Multiples of 3 or 5 Below 100',
          difficulty: 'Easy',
          description: 'Sum integers in `[1..99]` divisible by 3 or 5 -> 2318',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Loop 1..99 and print sum
    return 0;
}`,
          expectedOutput: '2318',
          hints: ['if (i % 3 == 0 || i % 5 == 0) sum += i;'],
        },
        {
          id: 'cb-3-2',
          title: 'Prime Check (O(sqrt N))',
          difficulty: 'Easy',
          description: 'Check primality of `{1, 2, 17, 49, 97}` and print 0 or 1 space-separated -> 0 1 1 0 1',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int tests[] = {1, 2, 17, 49, 97};
    // TODO: Print 0/1 for each
    return 0;
}`,
          expectedOutput: '0 1 1 0 1',
          hints: ['Remember 1 is NOT prime; test divisors 2 up to `i * i <= n`.'],
        },
        {
          id: 'cb-3-3',
          title: 'Sum of Divisors of 28 (Perfect Number)',
          difficulty: 'Easy',
          description: 'Sum proper divisors of `28` (excluding 28) in O(√N) -> 28',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int n = 28;
    // TODO: Loop d from 1 while d*d <= n summing paired divisors d and n/d (exclude n)
    return 0;
}`,
          expectedOutput: '28',
          hints: ['For n=28: 1 + 2 + 4 + 7 + 14 = 28.'],
        },
        {
          id: 'cb-3-4',
          title: 'Switch Arithmetic Evaluator',
          difficulty: 'Easy',
          description: 'Evaluate `(18, \'*\', 4)` using `switch` -> 72',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int a = 18, b = 4; char op = '*';
    // TODO: switch(op)
    return 0;
}`,
          expectedOutput: '72',
          hints: ['Don’t forget `break;` after every `case` in C++.'],
        },
        {
          id: 'cb-3-5',
          title: 'Floyd’s Triangle (4 Rows)',
          difficulty: 'Easy',
          description: 'Print Floyd’s triangle of 4 rows with single spaces between numbers in a row:\n1\n2 3\n4 5 6\n7 8 9 10',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int cur = 1;
    // TODO: Nested loop for rows 1..4 without trailing spaces
    return 0;
}`,
          expectedOutput: '1\n2 3\n4 5 6\n7 8 9 10',
          hints: ['Print space only when `col > 1`.'],
        },
        {
          id: 'cb-3-6',
          title: 'Binary Representation Loop',
          difficulty: 'Medium',
          description: 'Print binary digits of `n = 42` without leading zeros -> 101010',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int n = 42;
    // TODO: Extract bits from MSB to LSB or reverse
    return 0;
}`,
          expectedOutput: '101010',
          hints: ['Collect bits `% 2` into a string and reverse, or iterate bits 5 down to 0.'],
        },
        {
          id: 'cb-3-7',
          title: 'Trailing Zeros in 100!',
          difficulty: 'Medium',
          description: 'Count trailing zeros in `100!` (factors of 5) -> 24',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int n = 100;
    // TODO: Sum n/5 + n/25 + ...
    return 0;
}`,
          expectedOutput: '24',
          hints: ['100/5 + 100/25 = 20 + 4 = 24.'],
        },
        {
          id: 'cb-3-8',
          title: 'Fibonacci Until Bound',
          difficulty: 'Easy',
          description: 'Sum all even Fibonacci numbers `<= 100` (2 + 8 + 34) -> 44',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '44',
          hints: ['Generate Fibonacci up to 100; add to sum when `cur % 2 == 0`.'],
        },
        {
          id: 'cb-3-9',
          title: 'Digital Root Loop',
          difficulty: 'Easy',
          description: 'Repeat digit sum of `99887` until single digit -> 5',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int n = 99887;
    // TODO: Collapse digits while n >= 10
    return 0;
}`,
          expectedOutput: '5',
          hints: ['9+9+8+8+7 = 41 -> 4+1 = 5.'],
        },
        {
          id: 'cb-3-10',
          title: 'Power of Two Without Loops',
          difficulty: 'Easy',
          description: 'Check `{1, 16, 18, 64}` for power-of-two and print 1/0 -> 1 1 0 1',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {1, 16, 18, 64};
    // TODO
    return 0;
}`,
          expectedOutput: '1 1 0 1',
          hints: ['x > 0 && (x & (x - 1)) == 0'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Functions, References & Recursion',
      topic: 'Pass-by-Reference (&) & Inline Helpers',
      estimatedTime: '2.5 Hours',
      summary:
        'Write zero-copy C++ functions using `const &` and mutable `&`, overload signatures, and design clean recursive base cases.',
      studyMaterial: {
        overview:
          'Unlike Java, C++ passes objects **by value (deep copy)** by default! Passing a `vector` of 100k elements without `&` copies every element on each call—always pass heavy containers as `const auto&` unless mutating them with `auto&`.',
        keyPoints: [
          '`void f(const string& s)` avoids copying without allowing mutation.',
          '`void swapInts(int& a, int& b)` mutates caller variables directly via references.',
          'Templates (`template<typename T>`) eliminate duplicate helper code across types.',
          'Use `constexpr` when values can be computed at compile time.',
        ],
        codeExamples: [
          {
            title: 'Zero-Copy const Reference & Mutation Reference',
            code: `#include <iostream>
#include <vector>
using namespace std;

int sumVec(const vector<int>& v) {
    int s = 0;
    for (int x : v) s += x;
    return s;
}
int main() {
    vector<int> a = {10, 20, 30};
    cout << sumVec(a) << '\\n';
}`,
            explanation: '`const vector<int>&` reads caller memory with zero allocation.',
          },
        ],
        cheatsheet: [
          'const T& param -> zero-copy read-only',
          'T& param -> zero-copy mutable reference',
          'template <typename T> T myMax(T a, T b)',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/language/reference',
      },
      video: yt(
        'C++ Programming Course — Functions, References & Overloading',
        'freeCodeCamp.org',
        '8jLOx1hD3_o',
        '31h 00m',
        'Jump to the Functions, Pass-by-Reference, and Function Templates chapters.',
      ),
      compilerStarterCode: `#include <iostream>
using namespace std;

void dbl(int& x) { x *= 2; }

int main() {
    int v = 21;
    dbl(v);
    cout << v << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cb-4-1',
          title: 'Swap via C++ References',
          difficulty: 'Easy',
          description: 'Write `mySwap(int& a, int& b)` to swap x=10, y=99 and print: 99 10',
          starterCode: `#include <iostream>
using namespace std;

// TODO: void mySwap(int& a, int& b)

int main() {
    int x = 10, y = 99;
    // TODO: Call mySwap and print x, y
    return 0;
}`,
          expectedOutput: '99 10',
          hints: ['Pass parameters by `&` so changes persist outside mySwap.'],
        },
        {
          id: 'cb-4-2',
          title: 'Zero-Copy Min/Max Out-Params',
          difficulty: 'Easy',
          description: 'Write `minMax(const vector<int>& v, int& mn, int& mx)` for `{7, 2, 19, 4}` -> 2 19',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

// TODO: void minMax(const vector<int>& v, int& mn, int& mx)

int main() {
    vector<int> v = {7, 2, 19, 4};
    int mn, mx;
    // TODO
    return 0;
}`,
          expectedOutput: '2 19',
          hints: ['Initialize mn = mx = v[0], loop updating both references.'],
        },
        {
          id: 'cb-4-3',
          title: 'Generic Clamp Template',
          difficulty: 'Easy',
          description: 'Write `template<typename T> T clampVal(T x, T lo, T hi)` and print for `(120, 0, 100)` and `(-3.5, 0.0, 10.0)` -> 100 0',
          starterCode: `#include <iostream>
using namespace std;

// TODO: template<typename T> T clampVal

int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '100 0',
          hints: ['if (x < lo) return lo; if (x > hi) return hi; return x;'],
        },
        {
          id: 'cb-4-4',
          title: 'Default Argument Power Helper',
          difficulty: 'Easy',
          description: 'Write `int power(int base, int exp = 2)` and print `power(9)` and `power(2, 5)` -> 81 32',
          starterCode: `#include <iostream>
using namespace std;

// TODO: int power(int base, int exp = 2)

int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '81 32',
          hints: ['Default arguments appear only on trailing parameters.'],
        },
        {
          id: 'cb-4-5',
          title: 'Recursive Binary Search',
          difficulty: 'Medium',
          description: 'Recursively find index of `19` in `{2, 6, 11, 19, 28, 35}` -> 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int bsearch(const vector<int>& a, int lo, int hi, int target) {
    // TODO
    return -1;
}
int main() {
    vector<int> a = {2, 6, 11, 19, 28, 35};
    cout << bsearch(a, 0, (int)a.size() - 1, 19) << '\\n';
}`,
          expectedOutput: '3',
          hints: ['If lo > hi return -1; split at mid = lo + (hi - lo) / 2.'],
        },
        {
          id: 'cb-4-6',
          title: 'Recursive Palindrome Array Check',
          difficulty: 'Easy',
          description: 'Check recursively if `"level"` is palindrome -> true',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

bool isPal(const string& s, int l, int r) {
    // TODO
    return false;
}
int main() {
    string s = "level";
    cout << boolalpha << isPal(s, 0, (int)s.size() - 1) << '\\n';
}`,
          expectedOutput: 'true',
          hints: ['If l >= r return true; if s[l] != s[r] return false; return isPal(s, l+1, r-1).'],
        },
        {
          id: 'cb-4-7',
          title: 'Recursive Fast Modular Pow',
          difficulty: 'Medium',
          description: 'Compute `2^20 mod 1000` recursively -> 576',
          starterCode: `#include <iostream>
using namespace std;

long long modPow(long long b, long long e, long long m) {
    // TODO
    return 0;
}
int main() {
    cout << modPow(2, 20, 1000) << '\\n';
}`,
          expectedOutput: '576',
          hints: ['2^20 = 1048576; 1048576 % 1000 = 576.'],
        },
        {
          id: 'cb-4-8',
          title: 'Function Overloading Print',
          difficulty: 'Easy',
          description: 'Write overloaded `show(int)` returning `INT:<x>` and `show(const string&)` returning `STR:<s>`. Print `(7)` & `("KA")` -> INT:7 STR:KA',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Two show overloads

int main() {
    // TODO
    return 0;
}`,
          expectedOutput: 'INT:7 STR:KA',
          hints: ['Use distinct parameter types int and const string&.'],
        },
        {
          id: 'cb-4-9',
          title: 'Count Ways Climbing Stairs (Memoized/Rec)',
          difficulty: 'Medium',
          description: 'Steps 1 or 2 at a time: count distinct ways to reach stair `6` -> 13',
          starterCode: `#include <iostream>
using namespace std;

int ways(int n) {
    // TODO
    return 0;
}
int main() {
    cout << ways(6) << '\\n';
}`,
          expectedOutput: '13',
          hints: ['ways(0)=1, ways(1)=1, ways(n)=ways(n-1)+ways(n-2).'],
        },
        {
          id: 'cb-4-10',
          title: 'Tail-Style Array Sum Helper',
          difficulty: 'Easy',
          description: 'Sum `{5, 10, 15, 20}` recursively passing index `i` and accumulator `acc` -> 50',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int recSum(const vector<int>& a, int i, int acc) {
    // TODO
    return 0;
}
int main() {
    cout << recSum({5, 10, 15, 20}, 0, 0) << '\\n';
}`,
          expectedOutput: '50',
          hints: ['Base case i == a.size() returns acc.'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'Arrays, std::vector & std::string',
      topic: 'Mutable Strings, Slicing & Prefix Scans',
      estimatedTime: '3 Hours',
      summary:
        'Unlike Java/Python, `std::string` in C++ IS mutable! Master `std::vector`, in-place string reversals, `substr`, and `stoi`.',
      studyMaterial: {
        overview:
          'In C++, `std::string` behaves like a mutable `std::vector<char>`. Always reserve capacity (`v.reserve(n)`) when building large dynamic vectors, and compare strings safely with `==`.',
        keyPoints: [
          '`s.push_back(c)` appends in O(1) amortized instead of `s = s + c` (O(N)).',
          '`s.substr(pos, len)` takes a START index and a LENGTH (not an end index like Python/Java!).',
          'Use `(int)v.size()` when subtracting indices because `size()` returns unsigned `size_t` (underflows if empty!).',
          '`stoi(s)` and `to_string(x)` cleanly convert strings and integers.',
        ],
        codeExamples: [
          {
            title: 'Unsigned size() Guard & Mutable String',
            code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s = "kollabrix";
    reverse(s.begin(), s.end());
    cout << s << " len=" << (int)s.size() << '\\n';
}`,
            explanation: '`std::reverse` reverses `std::string` in-place in O(N) time and O(1) memory.',
          },
        ],
        cheatsheet: [
          's.substr(start, len) -> NOT end index!',
          'reverse(v.begin(), v.end()) -> <algorithm>',
          '(int)v.size() - 1 -> prevents size_t underflow!',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/string/basic_string',
      },
      video: yt(
        'C++ Tutorial for Beginners — Arrays & Strings Deep Dive',
        'Programming with Mosh',
        'ZzaPdXTrSb8',
        '1h 22m',
        'Reviews C++ stack vs heap arrays, strings, and clean modern C++ idioms.',
      ),
      compilerStarterCode: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string word = "arena";
    reverse(word.begin(), word.end());
    cout << word << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cb-5-1',
          title: 'Rotate Vector Right by K Steps',
          difficulty: 'Medium',
          description: 'Rotate `{1, 2, 3, 4, 5}` right by `k = 2` -> 4 5 1 2 3',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {1, 2, 3, 4, 5};
    int k = 2;
    // TODO: Use std::rotate or 3 reverses
    return 0;
}`,
          expectedOutput: '4 5 1 2 3',
          hints: ['`std::rotate(v.begin(), v.end() - k, v.end())` rotates cleanly in O(N)!'],
        },
        {
          id: 'cb-5-2',
          title: 'Mutable In-Place String Filter',
          difficulty: 'Easy',
          description: 'Remove all vowels from `"kollabrix"` in-place using two-pointer write index -> kllbrx',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "kollabrix";
    // TODO: Write non-vowels in-place then call s.resize(w)
    return 0;
}`,
          expectedOutput: 'kllbrx',
          hints: ['Overwriting s[w++] = s[i] and calling s.resize(w) achieves O(1) space.'],
        },
        {
          id: 'cb-5-3',
          title: 'Substring Token Extraction',
          difficulty: 'Easy',
          description: 'Given `"user:velith:1500"`, extract middle handle using `find` and `substr(start, len)` -> velith',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "user:velith:1500";
    // TODO: Find first and second ':' positions and call substr(p1+1, p2-p1-1)
    return 0;
}`,
          expectedOutput: 'velith',
          hints: ['Remember second argument to substr in C++ is LENGTH, not end index!'],
        },
        {
          id: 'cb-5-4',
          title: 'Unique Adjacent Deduplicate',
          difficulty: 'Easy',
          description: 'Remove adjacent duplicates in `"abbaca"` like stack push/pop -> ca',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "abbaca", out;
    // TODO: Use out.push_back / out.pop_back()
    return 0;
}`,
          expectedOutput: 'ca',
          hints: ['If `!out.empty() && out.back() == c` then `out.pop_back()`, else `out.push_back(c)`.'],
        },
        {
          id: 'cb-5-5',
          title: 'Merge Two Sorted Vectors',
          difficulty: 'Easy',
          description: 'Merge `{1, 4, 7}` and `{2, 4, 8}` in O(N + M) -> 1 2 4 4 7 8',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1,4,7}, b = {2,4,8};
    // TODO: Two-pointer merge and print
    return 0;
}`,
          expectedOutput: '1 2 4 4 7 8',
          hints: ['Compare a[i] <= b[j], advance smaller pointer, append remaining tail.'],
        },
        {
          id: 'cb-5-6',
          title: 'Suffix Array Sums (Product Except Self)',
          difficulty: 'Medium',
          description: 'Replace each element in `{1, 2, 3, 4}` with product of all others without division -> 24 12 8 6',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 2, 3, 4};
    // TODO: Prefix pass left-to-right, suffix pass right-to-left
    return 0;
}`,
          expectedOutput: '24 12 8 6',
          hints: ['res[i] holds prefix product, then multiply by running right-hand suffix product.'],
        },
        {
          id: 'cb-5-7',
          title: 'Check Isogram (All Unique Letters)',
          difficulty: 'Easy',
          description: 'Check if `"planet"` and `"letter"` have all unique lowercase letters -> 1 0',
          starterCode: `#include <iostream>
#include <string>
using namespace std;

bool isogram(const string& s) {
    // TODO: 26-bit mask or bool[26]
    return false;
}
int main() {
    cout << isogram("planet") << " " << isogram("letter") << '\\n';
}`,
          expectedOutput: '1 0',
          hints: ['Use an `int mask = 0`; if `(mask & (1 << (c - \'a\')))` return false!'],
        },
        {
          id: 'cb-5-8',
          title: '2D Diagonal Primary & Secondary Sum',
          difficulty: 'Easy',
          description: 'Sum main and anti diagonals of `{{1,2,3},{4,5,6},{7,8,9}}` counting center once -> 25',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> m = {{1,2,3},{4,5,6},{7,8,9}};
    // TODO: Avoid double-counting m[1][1]
    return 0;
}`,
          expectedOutput: '25',
          hints: ['Sum m[i][i] + m[i][n-1-i]; subtract m[n/2][n/2] when n is odd.'],
        },
        {
          id: 'cb-5-9',
          title: 'String Split & Sum Comma Integers',
          difficulty: 'Medium',
          description: 'Parse `"10,25,-5,30"` using `stringstream` + `getline(..., \',\')` and print sum -> 60',
          starterCode: `#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string s = "10,25,-5,30";
    // TODO: Split with getline(ss, tok, ',') and stoi(tok)
    return 0;
}`,
          expectedOutput: '60',
          hints: ['Include `<sstream>`: `stringstream ss(s); while (getline(ss, tok, \',\')) sum += stoi(tok);`'],
        },
        {
          id: 'cb-5-10',
          title: 'Equilibrium Pivot Index',
          difficulty: 'Medium',
          description: 'Find first index in `{1, 7, 3, 6, 5, 6}` where left sum equals right sum -> 3',
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 7, 3, 6, 5, 6};
    // TODO: Total sum - left - a[i] == left
    return 0;
}`,
          expectedOutput: '3',
          hints: ['At index 3 (val 6): left = 1+7+3 = 11, right = 5+6 = 11.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'Pointers, Memory & RAII Smart Pointers',
      topic: 'Addresses, Dereference & unique_ptr',
      estimatedTime: '2.5 Hours',
      summary:
        'Understand stack vs heap memory, raw pointer arithmetic, nullptr guards, and why modern C++ uses `std::unique_ptr` and `std::make_unique` over raw `new`/`delete`.',
      studyMaterial: {
        overview:
          'Mastering pointers unlocks linked lists, trees, and zero-leak C++ systems. Remember: pointers store addresses (`&x`) and read/modify target memory (`*p`), while `unique_ptr` guarantees automatic cleanup (RAII) when leaving scope.',
        keyPoints: [
          'Always initialize pointers (`int* p = nullptr;`) and guard dereferences with `if (p != nullptr)`.',
          'Never return a pointer or reference to a local stack variable (dangling pointer)!',
          'Modern C++ rule: **Zero raw `new`/`delete` in application code**—use `std::make_unique<T>(...)` or `std::vector`.',
          'Pointer arithmetic `*(arr + i)` advances by `i * sizeof(T)` bytes automatically.',
        ],
        codeExamples: [
          {
            title: 'RAII unique_ptr Scope Safety',
            code: `#include <iostream>
#include <memory>
using namespace std;

struct Node {
    int val;
    explicit Node(int v) : val(v) {}
};
int main() {
    auto ptr = make_unique<Node>(42);
    cout << ptr->val << '\\n';
}`,
            explanation: '`make_unique` allocates safely on the heap and frees automatically at end of `main`.',
          },
        ],
        cheatsheet: [
          'int* p = &x; *p = 10; -> address-of & dereference',
          'unique_ptr<T> p = make_unique<T>(args...)',
          'std::move(p) transfers unique ownership',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/memory/unique_ptr',
      },
      video: yt(
        '31 Modern C++ Habits & Memory Best Practices',
        'mCoding',
        'i_wDa2AS_8w',
        '21m',
        'Covers RAII, make_unique, const correctness, and avoiding raw new/delete leaks.',
      ),
      compilerStarterCode: `#include <iostream>
#include <memory>
using namespace std;

int main() {
    int x = 10;
    int* p = &x;
    *p += 15;
    auto u = make_unique<int>(*p * 2);
    cout << x << " " << *u << '\\n';
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cb-6-1',
          title: 'Modify Variable Through Pointer',
          difficulty: 'Easy',
          description: 'Declare `int val = 12;`, assign `int* p = &val;`, triple `*p` via pointer and print `val`: 36',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int val = 12;
    // TODO: Take pointer to val and triple it via *p
    return 0;
}`,
          expectedOutput: '36',
          hints: ['int* p = &val; *p *= 3;'],
        },
        {
          id: 'cb-6-2',
          title: 'Nullptr Safe Read Helper',
          difficulty: 'Easy',
          description: 'Write `int safeDeref(const int* p, int fallback)` returning `fallback` if `p == nullptr`. Test `(nullptr, -1)` and `(&x, -1)` where x=99 -> -1 99',
          starterCode: `#include <iostream>
using namespace std;

int safeDeref(const int* p, int fallback) {
    // TODO
    return 0;
}
int main() {
    int x = 99;
    cout << safeDeref(nullptr, -1) << " " << safeDeref(&x, -1) << '\\n';
}`,
          expectedOutput: '-1 99',
          hints: ['return p ? *p : fallback;'],
        },
        {
          id: 'cb-6-3',
          title: 'Reverse Array via Two Pointers',
          difficulty: 'Easy',
          description: 'Reverse `int arr[] = {10, 20, 30, 40}` using pointer arithmetic (`int* l`, `int* r`) -> 40 30 20 10',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {10, 20, 30, 40};
    int* l = arr;
    int* r = arr + 3;
    // TODO: Swap while l < r moving l++ and r--
    return 0;
}`,
          expectedOutput: '40 30 20 10',
          hints: ['Use `swap(*l, *r); l++; r--;` inside `while (l < r)`.'],
        },
        {
          id: 'cb-6-4',
          title: 'unique_ptr Ownership Transfer',
          difficulty: 'Medium',
          description: 'Allocate `make_unique<int>(77)`, `std::move` into `p2`, verify `p1 == nullptr` and `*p2 == 77` -> null 77',
          starterCode: `#include <iostream>
#include <memory>
using namespace std;

int main() {
    auto p1 = make_unique<int>(77);
    // TODO: Move ownership to p2 cleanly and check p1
    return 0;
}`,
          expectedOutput: 'null 77',
          hints: ['auto p2 = std::move(p1); cout << (!p1 ? "null" : "set") << " " << *p2;'],
        },
        {
          id: 'cb-6-5',
          title: 'Pointer Array Traversal Sum',
          difficulty: 'Easy',
          description: 'Sum `{3, 6, 9, 12}` using `for (int* p = a; p < a + 4; p++)` -> 30',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int a[] = {3, 6, 9, 12};
    // TODO: Accumulate using pointer increment
    return 0;
}`,
          expectedOutput: '30',
          hints: ['Dereference `*p` on each iteration.'],
        },
        {
          id: 'cb-6-6',
          title: 'shared_ptr Reference Counter',
          difficulty: 'Easy',
          description: 'Create `shared_ptr<int> a = make_shared<int>(5)`, copy to `b` in inner block, print `a.use_count()` inside and after inner block -> 2 1',
          starterCode: `#include <iostream>
#include <memory>
using namespace std;

int main() {
    auto a = make_shared<int>(5);
    // TODO: Print use_count inside { auto b = a; ... } and after block exits
    return 0;
}`,
          expectedOutput: '2 1',
          hints: ['When `b` goes out of scope at `}`, `use_count()` drops back to 1.'],
        },
        {
          id: 'cb-6-7',
          title: 'Custom RAII Destructor Guard',
          difficulty: 'Medium',
          description: 'Create `struct TimerGuard` printing `START` in constructor and `END` in `~TimerGuard()`. Inside inner scope print `WORK` -> START WORK END',
          starterCode: `#include <iostream>
using namespace std;

struct Guard {
    // TODO: Constructor & Destructor
};
int main() {
    { Guard g; cout << "WORK "; }
    return 0;
}`,
          expectedOutput: 'START WORK END',
          hints: ['C++ runs destructor `~Guard()` deterministically at closing brace `}`.'],
        },
        {
          id: 'cb-6-8',
          title: 'Linked List Node Traversal',
          difficulty: 'Medium',
          description: 'Link 3 `unique_ptr<Node>` items `1 -> 2 -> 3` and print values space-separated -> 1 2 3',
          starterCode: `#include <iostream>
#include <memory>
using namespace std;

struct Node {
    int v;
    unique_ptr<Node> next;
    explicit Node(int x) : v(x) {}
};
int main() {
    // TODO: Build 1 -> 2 -> 3 and traverse with raw non-owning Node* cur = head.get()
    return 0;
}`,
          expectedOutput: '1 2 3',
          hints: ['Traverse non-owning with `for (Node* p = head.get(); p; p = p->next.get())`.'],
        },
        {
          id: 'cb-6-9',
          title: 'Pointer to Pointer Re-seating',
          difficulty: 'Medium',
          description: 'Write `void rebind(int** pp, int* target)` pointing `*pp = target`. Start pointing at a=1, rebind to b=9 -> 9',
          starterCode: `#include <iostream>
using namespace std;

void rebind(int** pp, int* target) { /* TODO */ }
int main() {
    int a = 1, b = 9;
    int* p = &a;
    rebind(&p, &b);
    cout << *p << '\\n';
}`,
          expectedOutput: '9',
          hints: ['`*pp = target;` updates caller pointer `p`.'],
        },
        {
          id: 'cb-6-10',
          title: 'Const Pointer vs Pointer to Const',
          difficulty: 'Easy',
          description: 'Verify `int x=10; int* const cp = &x;` allows `*cp = 25;` -> print x: 25',
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int x = 10;
    int* const cp = &x;
    // TODO: Update *cp to 25 and print x
    return 0;
}`,
          expectedOutput: '25',
          hints: ['`int* const cp` fixes the address `cp` holds, while allowing mutation of `*cp`.'],
        },
      ],
    },
    {
      stepNumber: 7,
      title: 'C++ OOP: Classes, Virtual Dispatch & Operator Overloading',
      topic: 'Initializer Lists, Inheritance & Operators',
      estimatedTime: '3 Hours',
      summary:
        'Design idiomatic C++ classes with member initializer lists, virtual destructors for polymorphism, `override`, and operator overloading.',
      studyMaterial: {
        overview:
          'Modern C++ OOP prioritizes **Rule of Zero** (let RAII members manage resources), `virtual` dispatch with `override`, and clean value semantics.',
        keyPoints: [
          'Always initialize members via constructor initializer lists `: x(x), y(y)` rather than assignment inside `{}`.',
          'Any base class meant for inheritance MUST declare a `virtual ~Base() = default;` destructor.',
          'Always suffix overridden methods with `override` so the compiler catches signature typos.',
          'Overload `operator+` and `operator<` as clean `const` methods for math/sorting.',
        ],
        codeExamples: [
          {
            title: 'Virtual Polymorphism & Operator+',
            code: `#include <iostream>
using namespace std;

struct Vec2 {
    int x, y;
    Vec2 operator+(const Vec2& o) const { return {x + o.x, y + o.y}; }
};
int main() {
    Vec2 c = Vec2{2, 3} + Vec2{5, -1};
    cout << c.x << "," << c.y << '\\n';
}`,
            explanation: 'Clean value-type addition with zero heap allocations.',
          },
        ],
        cheatsheet: [
          'virtual ~Base() = default; -> mandatory for polymorphic base classes',
          'void draw() const override -> compiler checks base signature',
          'operator<(const T& o) const -> enables std::sort',
        ],
        officialDocUrl: 'https://en.cppreference.com/w/cpp/language/classes',
      },
      video: yt(
        'Object Oriented Programming (OOP) in C++ Course',
        'freeCodeCamp.org',
        'wN0x9eZLix4',
        '1h 30m',
        'Covers C++ classes, constructors, encapsulation, inheritance, and virtual polymorphism.',
      ),
      compilerStarterCode: `#include <iostream>
using namespace std;

class Point {
public:
    int x, y;
    Point(int x, int y) : x(x), y(y) {}
    Point operator+(const Point& o) const { return Point(x + o.x, y + o.y); }
};
int main() {
    Point p = Point(3, 4) + Point(2, 6);
    cout << "(" << p.x << "," << p.y << ")\\n";
    return 0;
}`,
      practiceQuestions: [
        {
          id: 'cb-7-1',
          title: 'Initializer List & Const Getter',
          difficulty: 'Easy',
          description: 'Build class `Rect(int w, int h)` with `area() const` and print `Rect(7, 8).area()` -> 56',
          starterCode: `#include <iostream>
using namespace std;

class Rect {
    int w, h;
public:
    // TODO: Initializer list constructor and area() const
};
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '56',
          hints: ['Rect(int w, int h) : w(w), h(h) {}'],
        },
        {
          id: 'cb-7-2',
          title: 'Virtual Runtime Polymorphism',
          difficulty: 'Easy',
          description: 'Create base `Engine` with `virtual int hp() const`, derive `TurboEngine` returning `450`, call via `Engine*` -> 450',
          starterCode: `#include <iostream>
using namespace std;

// TODO: Engine & TurboEngine
int main() {
    // TODO: Print via Base pointer
    return 0;
}`,
          expectedOutput: '450',
          hints: ['Include `virtual ~Engine() = default;` and `int hp() const override { return 450; }`.'],
        },
        {
          id: 'cb-7-3',
          title: 'Operator+ for Complex Numbers',
          difficulty: 'Medium',
          description: 'Add `Complex(3, 4)` + `Complex(1, -2)` and print `(4,2)`',
          starterCode: `#include <iostream>
using namespace std;

struct Complex {
    int re, im;
    // TODO: operator+
};
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '(4,2)',
          hints: ['Complex operator+(const Complex& o) const { return {re + o.re, im + o.im}; }'],
        },
        {
          id: 'cb-7-4',
          title: 'Operator< for Custom Sort Order',
          difficulty: 'Easy',
          description: 'Sort `{Task("A",3), Task("B",1), Task("C",2)}` ascending by priority via `operator<` -> B C A',
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Task {
    string name; int prio;
    // TODO: bool operator<(const Task& o) const
};
int main() {
    vector<Task> t = {{"A",3}, {"B",1}, {"C",2}};
    sort(t.begin(), t.end());
    cout << t[0].name << " " << t[1].name << " " << t[2].name << '\\n';
}`,
          expectedOutput: 'B C A',
          hints: ['return prio < o.prio;'],
        },
        {
          id: 'cb-7-5',
          title: 'Pure Virtual Abstract Interface',
          difficulty: 'Medium',
          description: 'Define pure virtual `Validator` (`virtual bool ok(int) const = 0;`) with `EvenValidator` checking 14 & 9 -> 1 0',
          starterCode: `#include <iostream>
using namespace std;

// TODO: Validator interface and EvenValidator class
int main() {
    // TODO
    return 0;
}`,
          expectedOutput: '1 0',
          hints: ['`virtual bool ok(int x) const = 0;` prevents instantiation of Validator directly.'],
        },
        {
          id: 'cb-7-6',
          title: 'Copy Constructor Deep Counter Check',
          difficulty: 'Medium',
          description: 'Create class `Box(int v)` with copy constructor multiplying copied value by 2. Print original `Box a(5)` and copy `b=a` -> 5 10',
          starterCode: `#include <iostream>
using namespace std;

class Box {
public:
    int v;
    explicit Box(int x) : v(x) {}
    // TODO: Box(const Box& o)
};
int main() {
    Box a(5);
    Box b = a;
    cout << a.v << " " << b.v << '\\n';
}`,
          expectedOutput: '5 10',
          hints: ['Box(const Box& o) : v(o.v * 2) {}'],
        },
        {
          id: 'cb-7-7',
          title: 'Static Class Member Registry',
          difficulty: 'Easy',
          description: 'Use `inline static int alive = 0;` incremented in constructor, decremented in destructor; check count inside & after scope -> 2 1',
          starterCode: `#include <iostream>
using namespace std;

struct Bot {
    inline static int alive = 0;
    // TODO: Constructor & Destructor
};
int main() {
    Bot b1;
    { Bot b2; cout << Bot::alive << " "; }
    cout << Bot::alive << '\\n';
}`,
          expectedOutput: '2 1',
          hints: ['C++17 `inline static` lets you initialize static members right inside the class!'],
        },
        {
          id: 'cb-7-8',
          title: 'Friend Function Access to Private State',
          difficulty: 'Easy',
          description: 'Give `friend int secretSum(const Vault&)` access to private `a=19, b=23` -> 42',
          starterCode: `#include <iostream>
using namespace std;

class Vault {
    int a = 19, b = 23;
    // TODO: declare friend int secretSum(const Vault&);
};
// TODO: implement secretSum
int main() {
    Vault v;
    // cout << secretSum(v) << '\\n';
}`,
          expectedOutput: '42',
          hints: ['A `friend` declaration inside class permits reading private fields.'],
        },
        {
          id: 'cb-7-9',
          title: 'Stream Insertion operator<< Overload',
          difficulty: 'Medium',
          description: 'Overload `ostream& operator<<(ostream& os, const Hero& h)` to print `KΛ-99` cleanly.',
          starterCode: `#include <iostream>
using namespace std;

struct Hero { string tag; int lvl; };
// TODO: operator<<
int main() {
    Hero h{"KΛ", 99};
    // TODO: cout << h << '\\n';
}`,
          expectedOutput: 'KΛ-99',
          hints: ['return os << h.tag << "-" << h.lvl;'],
        },
        {
          id: 'cb-7-10',
          title: 'Matrix2x2 Class Multiplication',
          difficulty: 'Hard',
          description: 'Implement `Mat2` multiplying `{{1,2},{3,4}}` by `{{2,0},{1,2}}` and print top row -> 4 4',
          starterCode: `#include <iostream>
using namespace std;

struct Mat2 {
    int m[2][2];
    // TODO: operator*
};
int main() {
    Mat2 A{{{1,2},{3,4}}}, B{{{2,0},{1,2}}};
    // TODO: Compute C = A * B and print C.m[0][0], C.m[0][1]
}`,
          expectedOutput: '4 4',
          hints: ['[0][0] = 1*2 + 2*1 = 4; [0][1] = 1*0 + 2*2 = 4.'],
        },
      ],
    },
  ],
};
