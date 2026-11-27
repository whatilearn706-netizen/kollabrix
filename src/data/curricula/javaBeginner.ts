import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const JAVA_BEGINNER_SPEC: TrackSpec = {
  id: 'java-beginner',
  language: 'java',
  track: 'beginner',
  title: 'Java Complete Beginner Track',
  tagline: 'Zero to OOP: JVM, Syntax, Loops, Methods, Arrays, Strings & Classes',
  icon: '☕',
  color: 'text-amber-500 dark:text-amber-400',
  badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  borderColor: 'border-amber-400/30 hover:border-amber-400/70',
  description:
    'Complete beginner-to-confident Java curriculum covering JVM execution, variables, loops, recursion, arrays, StringBuilder, and object-oriented design with 80 hands-on coding problems.',
  compilerLanguage: 'java',
  compilerDisplayName: 'Java (OpenJDK)',
  estimatedTotalHours: '22 Hours',
  prerequisites: ['None — starts from your very first line of Java'],
  outcomes: [
    'Compile & trace Java programs on the JVM cleanly',
    'Solve algorithmic problems with arrays, 2D matrices, and Strings',
    'Write clean modular methods and recursive helpers',
    'Design encapsulated classes, interfaces, and polymorphic objects',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'JVM, Bytecode & First Program',
      topic: 'Java Basics & Standard Output',
      estimatedTime: '2 Hours',
      summary:
        'Understand how javac compiles source files into platform-independent bytecode executed by the JVM, and master exact standard output formatting.',
      studyMaterial: {
        overview:
          'Java follows a "Write Once, Run Anywhere" execution pipeline: `javac Main.java` compiles source code into `Main.class` bytecode, and the JVM executes that bytecode via interpretation and JIT compilation.',
        keyPoints: [
          'Every standalone Java file submitted to Judge0 uses `public class Main` with `public static void main(String[] args)`.',
          '`System.out.println(...)` appends a newline, whereas `System.out.print(...)` keeps the cursor on the same line.',
          '`System.out.printf("%.2f%n", val)` formats floating-point numbers cleanly without string concatenation bugs.',
          'Escape sequences: `\\n` (newline), `\\t` (tab), `\\\\` (backslash), `\\"` (double quote).',
        ],
        codeExamples: [
          {
            title: 'Structured Output & Printf Formatting',
            code: `public class Main {
    public static void main(String[] args) {
        String track = "Java";
        double score = 98.456;
        System.out.println("Track: " + track);
        System.out.printf("Score: %.2f%%%n", score);
    }
}`,
            explanation: 'Use `%%` inside `printf` to print a literal percent sign alongside rounded decimals.',
          },
        ],
        cheatsheet: [
          'javac Main.java -> Main.class (bytecode)',
          'java Main -> runs JVM main(String[] args)',
          'System.out.println(x) -> line break after output',
          'System.out.printf("%.2f\\n", d) -> 2 decimal places',
        ],
        officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/PrintStream.html',
      },
      video: yt(
        'Java Full Course for Beginners',
        'Bro Code',
        'xk4_1vDrzzo',
        '12h 00m',
        'Watch the JDK setup, Hello World, println vs print, and escape sequences section first.',
      ),
      compilerStarterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, KΛ Java Arena!");
        System.out.printf("JVM Ready | Precision: %.2f%n", 100.0 / 3);
    }
}`,
      practiceQuestions: [
        {
          id: 'jb-1-1',
          title: 'Print Student Identity Card',
          difficulty: 'Easy',
          description: 'Print two exact lines:\nLine 1: Name: Alex Mercer\nLine 2: College: Kollabrix University',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Print the two exact identity lines
    }
}`,
          expectedOutput: 'Name: Alex Mercer\nCollege: Kollabrix University',
          hints: ['Call System.out.println twice.', 'Match capitalization and colon spacing exactly.'],
        },
        {
          id: 'jb-1-2',
          title: 'Quoted Motto With Escape Sequences',
          difficulty: 'Easy',
          description: 'Print exactly: KΛ Rule -> "Write clean code, ship fast!"',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Print the quoted motto using escaped double quotes
    }
}`,
          expectedOutput: 'KΛ Rule -> "Write clean code, ship fast!"',
          hints: ['Escape inner quotes with \\" inside your Java string literal.'],
        },
        {
          id: 'jb-1-3',
          title: 'Print vs Println Inline Builder',
          difficulty: 'Easy',
          description: 'Use three separate print/println calls to output the single line: [Java]-[21]-[Ready]',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Combine print calls ending with println
    }
}`,
          expectedOutput: '[Java]-[21]-[Ready]',
          hints: ['Use System.out.print for the first two chunks and println for the final chunk.'],
        },
        {
          id: 'jb-1-4',
          title: 'Precision Percentage Formatter',
          difficulty: 'Easy',
          description: 'Given solved = 17 and total = 23, print the accuracy formatted to 2 decimal places: Accuracy: 73.91%',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int solved = 17, total = 23;
        // TODO: Compute percentage and print using printf
    }
}`,
          expectedOutput: 'Accuracy: 73.91%',
          hints: ['Cast to double: (solved * 100.0) / total.', 'Escape % in printf as %%.'],
        },
        {
          id: 'jb-1-5',
          title: 'Receipt Column Alignment',
          difficulty: 'Easy',
          description: 'Print a compact 2-line receipt:\nItem: CloudPass | Qty: 2\nTotal: 98.00 INR',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int qty = 2;
        double price = 49.0;
        // TODO: Print formatted receipt lines
    }
}`,
          expectedOutput: 'Item: CloudPass | Qty: 2\nTotal: 98.00 INR',
          hints: ['Multiply qty * price and format with %.2f.'],
        },
        {
          id: 'jb-1-6',
          title: 'Arithmetic Precedence Check',
          difficulty: 'Easy',
          description: 'Print the value of (8 + 4) * 3 - 6 / 2 labeled as: Result: 33',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Evaluate and print Result: <value>
    }
}`,
          expectedOutput: 'Result: 33',
          hints: ['Wrap the full expression in parentheses when concatenating with a String.'],
        },
        {
          id: 'jb-1-7',
          title: 'ASCII Bracket Box',
          difficulty: 'Easy',
          description: 'Print a 3-line ASCII box:\n+---+\n|KΛ |\n+---+',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Print the 3-line ASCII box
    }
}`,
          expectedOutput: '+---+\n|KΛ |\n+---+',
          hints: ['Check the single trailing space after KΛ inside the middle row.'],
        },
        {
          id: 'jb-1-8',
          title: 'Path String Backslash Escaping',
          difficulty: 'Easy',
          description: 'Print the literal Windows path: C:\\Users\\ka_dev\\Main.java',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Escape every backslash cleanly
    }
}`,
          expectedOutput: 'C:\\Users\\ka_dev\\Main.java',
          hints: ['Each literal backslash requires \\\\ in Java source code.'],
        },
        {
          id: 'jb-1-9',
          title: 'Integer vs Floating Division',
          difficulty: 'Easy',
          description: 'Print integer quotient of 7/2 on line 1 ("Int: 3") and decimal quotient on line 2 ("Dec: 3.5").',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int a = 7, b = 2;
        // TODO: Print Int and Dec lines
    }
}`,
          expectedOutput: 'Int: 3\nDec: 3.5',
          hints: ['a / b performs integer division; (double) a / b preserves decimal precision.'],
        },
        {
          id: 'jb-1-10',
          title: 'Minutes & Seconds Breakdown',
          difficulty: 'Easy',
          description: 'Convert totalSeconds = 205 into minutes and remaining seconds and print: 3m 25s',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int totalSeconds = 205;
        // TODO: Print Xm Ys
    }
}`,
          expectedOutput: '3m 25s',
          hints: ['Use / 60 for whole minutes and % 60 for leftover seconds.'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'Variables, Data Types & Casting',
      topic: 'Primitives, Overflow & Conversion',
      estimatedTime: '2.5 Hours',
      summary:
        'Master Java’s 8 primitive types, integer overflow traps, widening vs narrowing casts, and Unicode char arithmetic.',
      studyMaterial: {
        overview:
          'Java is statically typed. Choosing between `int` (~2.14×10⁹ max) and `long` (~9.22×10¹⁸ max) is critical in coding contests to prevent silent overflow during multiplications.',
        keyPoints: [
          'Always widen before multiplying large `int` values: `(long) a * b` prevents overflow.',
          'Prefix `long` literals with `L` (e.g., `1_000_000_007L`) and `float` with `f`.',
          'Narrowing cast `(int) 9.99` truncates toward zero -> `9`, it does NOT round.',
          '`char` stores UTF-16 code units: `\'a\' + 1` evaluates to integer `98`, cast back to `(char)` for `\'b\'`.',
        ],
        codeExamples: [
          {
            title: 'Preventing Integer Multiplication Overflow',
            code: `public class Main {
    public static void main(String[] args) {
        int n = 100_000;
        long sq = (long) n * n;
        System.out.println("Safe Square: " + sq);
    }
}`,
            explanation: 'Without `(long)`, `n * n` overflows `int` before assignment to `sq`.',
          },
        ],
        cheatsheet: [
          'byte (8b) -> short (16b) -> int (32b) -> long (64b)',
          'int max = 2,147,483,647 (Integer.MAX_VALUE)',
          'char to int: ch - \'a\' gives 0..25 alphabet index',
          'Math.round(double) rounds; (int) double truncates',
        ],
        officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html',
      },
      video: yt(
        'Introduction to Java Language & Variables',
        'Apna College',
        'yRpLlJmRo2w',
        '32m',
        'Covers JDK memory layout, primitive sizes, and standard input patterns.',
      ),
      compilerStarterCode: `public class Main {
    public static void main(String[] args) {
        int a = 1_000_000;
        long prod = (long) a * a;
        System.out.println("Safe product: " + prod);
    }
}`,
      practiceQuestions: [
        {
          id: 'jb-2-1',
          title: 'Overflow-Safe Sum of N Integers',
          difficulty: 'Easy',
          description: 'Compute sum of 1..100000 using formula n*(n+1)/2 safely in `long` and print it.',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 100000;
        // TODO: Compute 1 + 2 + ... + n without 32-bit overflow
    }
}`,
          expectedOutput: '5000050000',
          hints: ['Cast n to long before multiplying by (n + 1).'],
        },
        {
          id: 'jb-2-2',
          title: 'Swap Two Numbers Without Temp Variable',
          difficulty: 'Easy',
          description: 'Swap a = 15 and b = 42 without a third variable and print: a=42 b=15',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int a = 15, b = 42;
        // TODO: Swap using arithmetic or XOR
    }
}`,
          expectedOutput: 'a=42 b=15',
          hints: ['XOR swap: a ^= b; b ^= a; a ^= b;'],
        },
        {
          id: 'jb-2-3',
          title: 'Character Alphabet Offset',
          difficulty: 'Easy',
          description: 'Given ch = \'k\', print its ASCII code and 1-based alphabet position: 107 11',
          starterCode: `public class Main {
    public static void main(String[] args) {
        char ch = 'k';
        // TODO: Print ASCII int and (ch - 'a' + 1)
    }
}`,
          expectedOutput: '107 11',
          hints: ['Cast (int) ch for ASCII and compute (ch - \'a\' + 1) for alphabet position.'],
        },
        {
          id: 'jb-2-4',
          title: 'Celsius to Fahrenheit Converter',
          difficulty: 'Easy',
          description: 'Convert c = 37 Celsius to Fahrenheit (F = C * 9/5 + 32) formatted to 1 decimal: 98.6',
          starterCode: `public class Main {
    public static void main(String[] args) {
        double c = 37;
        // TODO: Convert and print with 1 decimal place
    }
}`,
          expectedOutput: '98.6',
          hints: ['Use 9.0 / 5.0 to avoid integer division truncation.'],
        },
        {
          id: 'jb-2-5',
          title: 'Extract Last & Second-Last Digits',
          difficulty: 'Easy',
          description: 'Given num = 9473, print the units digit and tens digit separated by space: 3 7',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int num = 9473;
        // TODO: Extract units and tens digit
    }
}`,
          expectedOutput: '3 7',
          hints: ['Units = num % 10, Tens = (num / 10) % 10.'],
        },
        {
          id: 'jb-2-6',
          title: 'Compound Interest Computation',
          difficulty: 'Medium',
          description: 'With principal = 10000, rate = 8%, years = 3 (compounded annually), print total amount to 2 decimals.',
          starterCode: `public class Main {
    public static void main(String[] args) {
        double p = 10000, r = 8.0, t = 3;
        // TODO: Use Math.pow(1 + r / 100.0, t)
    }
}`,
          expectedOutput: '12597.12',
          hints: ['Amount = p * Math.pow(1.0 + r / 100.0, t). Print with %.2f.'],
        },
        {
          id: 'jb-2-7',
          title: 'Truncate vs Round Comparison',
          difficulty: 'Easy',
          description: 'Given val = 7.68, print truncated int and Math.round result: 7 8',
          starterCode: `public class Main {
    public static void main(String[] args) {
        double val = 7.68;
        // TODO: Print truncated and rounded values
    }
}`,
          expectedOutput: '7 8',
          hints: ['Use (int) val and Math.round(val).'],
        },
        {
          id: 'jb-2-8',
          title: 'HH:MM:SS Clock Breakdown',
          difficulty: 'Easy',
          description: 'Convert 3665 seconds into zero-padded HH:MM:SS format -> 01:01:05',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int s = 3665;
        // TODO: Compute h, m, sec and printf("%02d:%02d:%02d%n", ...)
    }
}`,
          expectedOutput: '01:01:05',
          hints: ['h = s / 3600, m = (s % 3600) / 60, sec = s % 60. Use %02d for zero padding.'],
        },
        {
          id: 'jb-2-9',
          title: 'Circle Area & Circumference',
          difficulty: 'Easy',
          description: 'Given r = 5, using Math.PI print area and circumference rounded to 2 decimals on one line: 78.54 31.42',
          starterCode: `public class Main {
    public static void main(String[] args) {
        double r = 5.0;
        // TODO: Print Math.PI * r * r and 2 * Math.PI * r
    }
}`,
          expectedOutput: '78.54 31.42',
          hints: ['System.out.printf("%.2f %.2f%n", area, circ);'],
        },
        {
          id: 'jb-2-10',
          title: 'Caesar Shift Single Lowercase Char',
          difficulty: 'Medium',
          description: 'Shift lowercase char \'y\' forward by 4 wrapping around \'z\' -> \'a\' and print result: c',
          starterCode: `public class Main {
    public static void main(String[] args) {
        char c = 'y';
        int shift = 4;
        // TODO: Wrap around 26 letters and print shifted char
    }
}`,
          expectedOutput: 'c',
          hints: ['(char) (\'a\' + (c - \'a\' + shift) % 26).'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Operators, Bitwise & Conditionals',
      topic: 'Branching, Ternary & Switch',
      estimatedTime: '2.5 Hours',
      summary:
        'Build deterministic branching logic using if/else ladders, modern Java switch expressions, short-circuit boolean guards, and bitwise checks.',
      studyMaterial: {
        overview:
          'Clean branching guards edge cases early (`&&` and `||` short-circuit so null/zero checks must come first). Bitwise operators (`&`, `|`, `^`, `<<`, `>>`) give O(1) parity and power-of-two checks.',
        keyPoints: [
          'Put null or bounds checks on the LEFT side of `&&`: `divisor != 0 && num % divisor == 0`.',
          'Java 14+ arrow switch (`switch (day) { case 1 -> "Mon"; ... }`) never suffers from fall-through bugs.',
          '`(n & 1) == 1` tests odd integers; `n > 0 && (n & (n - 1)) == 0` tests powers of two.',
          'Always validate leap year logic: divisible by 400 OR (divisible by 4 AND NOT divisible by 100).',
        ],
        codeExamples: [
          {
            title: 'Arrow Switch & Power-of-Two Check',
            code: `public class Main {
    public static void main(String[] args) {
        int n = 64;
        boolean pow2 = n > 0 && (n & (n - 1)) == 0;
        String tier = switch (n) {
            case 64 -> "64-Bit";
            default -> "Standard";
        };
        System.out.println(pow2 + " " + tier);
    }
}`,
            explanation: 'Modern arrow syntax returns values cleanly with zero break boilerplate.',
          },
        ],
        cheatsheet: [
          'n & 1 -> parity (0 even, 1 odd)',
          '1 << k -> 2^k fast bit shift (for k < 31)',
          'cond ? valTrue : valFalse -> ternary expression',
          'Compare Strings with .equals(), NEVER ==',
        ],
        officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html',
      },
      video: yt(
        'Java Programming Full Course — Operators & Conditionals',
        'freeCodeCamp.org',
        'A74TOX803D0',
        '4h 12m',
        'Covers relational operators, if-else chains, ternary expressions, and switch statements.',
      ),
      compilerStarterCode: `public class Main {
    public static void main(String[] args) {
        int year = 2024;
        boolean leap = (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0);
        System.out.println(year + " leap? " + leap);
    }
}`,
      practiceQuestions: [
        {
          id: 'jb-3-1',
          title: 'Gregorian Leap Year Validator',
          difficulty: 'Easy',
          description: 'Test years [1900, 2000, 2024] and print LEAP or COMMON space-separated: COMMON LEAP LEAP',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] years = {1900, 2000, 2024};
        // TODO: Print LEAP or COMMON for each year
    }
}`,
          expectedOutput: 'COMMON LEAP LEAP',
          hints: ['1900 is divisible by 100 but not 400 -> COMMON; 2000 is divisible by 400 -> LEAP.'],
        },
        {
          id: 'jb-3-2',
          title: 'Bitwise Parity & Power-of-Two Classifier',
          difficulty: 'Easy',
          description: 'For x = 32, print "EVEN POW2" if even & power of 2, or evaluate appropriately.',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int x = 32;
        // TODO: Use bitwise operators only for parity and power-of-two checks
    }
}`,
          expectedOutput: 'EVEN POW2',
          hints: ['(x & 1) == 0 is even; x > 0 && (x & (x - 1)) == 0 checks power of 2.'],
        },
        {
          id: 'jb-3-3',
          title: 'Maximum of Three Without Math.max',
          difficulty: 'Easy',
          description: 'Given a = 41, b = 89, c = 73, print the largest number: 89',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int a = 41, b = 89, c = 73;
        // TODO: Find and print max using conditionals
    }
}`,
          expectedOutput: '89',
          hints: ['Initialize max = a, then compare with b and c cleanly.'],
        },
        {
          id: 'jb-3-4',
          title: 'Coordinate Quadrant Locator',
          difficulty: 'Easy',
          description: 'Determine the quadrant for point (-4, 7) -> print Q2 (Q1: +/+, Q2: -/+, Q3: -/-, Q4: +/-).',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int x = -4, y = 7;
        // TODO: Print Q1..Q4 or AXIS
    }
}`,
          expectedOutput: 'Q2',
          hints: ['x < 0 && y > 0 lies in Quadrant 2 (Q2).'],
        },
        {
          id: 'jb-3-5',
          title: 'Triangle Validity & Type Check',
          difficulty: 'Medium',
          description: 'Given sides 5, 5, 8, validate triangle inequality and print: VALID ISOSCELES',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int a = 5, b = 5, c = 8;
        // TODO: Check a+b>c && a+c>b && b+c>a then classify EQUILATERAL/ISOSCELES/SCALENE
    }
}`,
          expectedOutput: 'VALID ISOSCELES',
          hints: ['First verify sum of every pair strictly exceeds the third side.'],
        },
        {
          id: 'jb-3-6',
          title: 'Grade Letter Assigner',
          difficulty: 'Easy',
          description: 'For score = 86 (90+: A, 80+: B, 70+: C, 60+: D, else F), print: B',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int score = 86;
        // TODO: Print grade letter
    }
}`,
          expectedOutput: 'B',
          hints: ['Check descending thresholds: >=90, >=80, >=70, >=60.'],
        },
        {
          id: 'jb-3-7',
          title: 'Safe Division Guard',
          difficulty: 'Easy',
          description: 'Print quotient of 120 / 0 or "DIV_ZERO" if denominator is 0, then 120 / 8 -> DIV_ZERO 15',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 120, d1 = 0, d2 = 8;
        // TODO: Print results for d1 and d2 separated by a space
    }
}`,
          expectedOutput: 'DIV_ZERO 15',
          hints: ['Use ternary: d == 0 ? "DIV_ZERO" : String.valueOf(n / d).'],
        },
        {
          id: 'jb-3-8',
          title: 'Modern Switch Quarter Mapper',
          difficulty: 'Easy',
          description: 'Given month = 10, print quarter Q1..Q4 using switch expression -> Q4',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int month = 10;
        // TODO: Map months 1-3->Q1, 4-6->Q2, 7-9->Q3, 10-12->Q4
    }
}`,
          expectedOutput: 'Q4',
          hints: ['Group multiple cases with comma: case 10, 11, 12 -> "Q4";'],
        },
        {
          id: 'jb-3-9',
          title: 'Electricity Slab Tariff Calculator',
          difficulty: 'Medium',
          description: 'Units = 250. First 100 @ 5/unit, next 100 @ 7/unit, above 200 @ 10/unit. Print bill: 1700',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int units = 250;
        // TODO: Compute tiered bill
    }
}`,
          expectedOutput: '1700',
          hints: ['100*5 + 100*7 + 50*10 = 500 + 700 + 500 = 1700.'],
        },
        {
          id: 'jb-3-10',
          title: 'Count Set Bits (Brian Kernighan Trick)',
          difficulty: 'Medium',
          description: 'Count 1-bits in binary of n = 29 (11101) -> print: 4',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 29;
        // TODO: Count set bits and print count
    }
}`,
          expectedOutput: '4',
          hints: ['Each `n &= (n - 1)` strips the lowest set bit. Or use Integer.bitCount(n).'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Loops, Number Theory & Patterns',
      topic: 'For, While, GCD & Nested Loops',
      estimatedTime: '3 Hours',
      summary:
        'Master deterministic iterations with for/while loops, classic number theory algorithms (Euclid GCD, primality in √N), and nested grid pattern printing.',
      studyMaterial: {
        overview:
          'Every O(N) scan and O(√N) factorization relies on tight loop invariants. Avoid floating-point `Math.sqrt` precision drift in loop bounds by writing `for (int i = 2; (long) i * i <= n; i++)`.',
        keyPoints: [
          'Use `for` when bounds are known; `while` when condition-driven (like digit extraction `n > 0`).',
          'Primality check runs in O(√N) using `i * i <= n` rather than O(N).',
          'Euclidean GCD `gcd(a, b) = gcd(b, a % b)` takes O(log(min(a, b))) steps.',
          'Always use `break` to exit early and `continue` to skip invalid iterations cleanly.',
        ],
        codeExamples: [
          {
            title: 'O(√N) Primality & Euclidean GCD',
            code: `public class Main {
    public static void main(String[] args) {
        int a = 48, b = 18;
        while (b != 0) {
            int t = a % b;
            a = b;
            b = t;
        }
        System.out.println("GCD: " + a);
    }
}`,
            explanation: 'Zero extra memory and handles 64-bit numbers smoothly.',
          },
        ],
        cheatsheet: [
          'while (n > 0) { digit = n % 10; n /= 10; }',
          'LCM(a, b) = (a / gcd(a, b)) * b (divide first to avoid overflow!)',
          'i * i <= n -> O(sqrt(N)) divisor bound',
        ],
        officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/for.html',
      },
      video: yt(
        'Learn Java 8 — Loops, Control Flow & Patterns',
        'freeCodeCamp.org',
        'grEKMHGYyns',
        '9h 30m',
        'Work through the for-loop, while-loop, and nested pattern chapters.',
      ),
      compilerStarterCode: `public class Main {
    public static void main(String[] args) {
        for (int r = 1; r <= 4; r++) {
            for (int c = 1; c <= r; c++) System.out.print("*");
            System.out.println();
        }
    }
}`,
      practiceQuestions: [
        {
          id: 'jb-4-1',
          title: 'Factorial of 12 (Overflow Safe)',
          difficulty: 'Easy',
          description: 'Compute 12! using a loop in `long` and print: 479001600',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 12;
        // TODO: Multiply 1..n in long
    }
}`,
          expectedOutput: '479001600',
          hints: ['Initialize long fact = 1L; loop i from 2 to 12.'],
        },
        {
          id: 'jb-4-2',
          title: 'Reverse Integer Digits',
          difficulty: 'Easy',
          description: 'Reverse digits of n = 543210 into an integer (dropping leading zero) and print: 12345',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 543210;
        // TODO: Build rev = rev * 10 + (n % 10)
    }
}`,
          expectedOutput: '12345',
          hints: ['While n > 0: rev = rev * 10 + n % 10; n /= 10;'],
        },
        {
          id: 'jb-4-3',
          title: 'Palindrome Number Check',
          difficulty: 'Easy',
          description: 'Test [12321, 12345] and print YES NO',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] nums = {12321, 12345};
        // TODO: Check palindrome for each and print YES/NO
    }
}`,
          expectedOutput: 'YES NO',
          hints: ['Save original n before mutating inside while loop.'],
        },
        {
          id: 'jb-4-4',
          title: '3-Digit Armstrong Number Check',
          difficulty: 'Medium',
          description: 'Check n = 153 (sum of cubes of digits == 153). Print ARMSTRONG or NO: ARMSTRONG',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 153;
        // TODO: Sum d*d*d for all digits
    }
}`,
          expectedOutput: 'ARMSTRONG',
          hints: ['1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153.'],
        },
        {
          id: 'jb-4-5',
          title: 'Count Primes Up to 30',
          difficulty: 'Medium',
          description: 'Count how many prime numbers exist in [2..30] -> print: 10',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int limit = 30;
        // TODO: Count primes in 2..limit using O(sqrt(N)) check
    }
}`,
          expectedOutput: '10',
          hints: ['Primes <= 30 are 2,3,5,7,11,13,17,19,23,29 (total 10).'],
        },
        {
          id: 'jb-4-6',
          title: 'GCD & LCM Pair',
          difficulty: 'Medium',
          description: 'For a = 36 and b = 24, print "GCD LCM" -> 12 72',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int a = 36, b = 24;
        // TODO: Print gcd and lcm separated by space
    }
}`,
          expectedOutput: '12 72',
          hints: ['Compute GCD first via Euclidean loop, then LCM = (a / gcd) * b.'],
        },
        {
          id: 'jb-4-7',
          title: 'First 8 Fibonacci Numbers',
          difficulty: 'Easy',
          description: 'Print first 8 Fibonacci numbers starting at 0, 1: 0 1 1 2 3 5 8 13',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 8;
        // TODO: Print first 8 Fibonacci terms space-separated
    }
}`,
          expectedOutput: '0 1 1 2 3 5 8 13',
          hints: ['Track a = 0, b = 1; next = a + b. Avoid trailing space at the end.'],
        },
        {
          id: 'jb-4-8',
          title: 'Number Right-Triangle Pattern',
          difficulty: 'Easy',
          description: 'Print a 4-row number triangle:\n1\n12\n123\n1234',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int rows = 4;
        // TODO: Nested loop printing 1..r on each line
    }
}`,
          expectedOutput: '1\n12\n123\n1234',
          hints: ['Outer loop r = 1..4; inner loop c = 1..r printing c.'],
        },
        {
          id: 'jb-4-9',
          title: 'Centered Star Pyramid',
          difficulty: 'Medium',
          description: 'Print a 3-row centered pyramid (no trailing spaces after stars):\n  *\n ***\n*****',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int rows = 3;
        // TODO: Print (rows - r) spaces then (2 * r - 1) stars
    }
}`,
          expectedOutput: '  *\n ***\n*****',
          hints: ['Row 1: 2 spaces + 1 star; Row 2: 1 space + 3 stars; Row 3: 0 spaces + 5 stars.'],
        },
        {
          id: 'jb-4-10',
          title: 'Collatz Steps Counter',
          difficulty: 'Medium',
          description: 'Starting at n = 6, repeatedly halve if even else 3n+1 until n == 1. Print step count: 8',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 6;
        // TODO: Count steps to reach 1
    }
}`,
          expectedOutput: '8',
          hints: ['6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1 (8 steps).'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'Methods, Overloading & Recursion',
      topic: 'Modular Helpers & Call Stack',
      estimatedTime: '3 Hours',
      summary:
        'Decompose logic into reusable static helpers, understand pass-by-value semantics in Java, overload method signatures, and master base-case recursion.',
      studyMaterial: {
        overview:
          'Every Java problem becomes clean when you extract single-responsibility methods. Recursion solves self-similar problems using the JVM call stack—always write the base case first to prevent `StackOverflowError`.',
        keyPoints: [
          'Java is strictly **pass-by-value**: primitive copies are independent, while object/array arguments pass a copy of the reference.',
          'Method overloading differs by parameter count or types—never by return type alone.',
          'Fast Modular Exponentiation (`pow(a, b)`) runs in O(log b) by squaring `base` when `b` is halved.',
          'Always verify base case (`n == 0` or `n <= 1`) before recursive calls.',
        ],
        codeExamples: [
          {
            title: 'O(log N) Recursive Binary Exponentiation',
            code: `public class Main {
    static long fastPow(long base, long exp) {
        if (exp == 0) return 1;
        long half = fastPow(base, exp / 2);
        return (exp % 2 == 0) ? half * half : half * half * base;
    }
    public static void main(String[] args) {
        System.out.println(fastPow(2, 10));
    }
}`,
            explanation: 'Computes 2^10 in only 4 multiplications instead of 10.',
          },
        ],
        cheatsheet: [
          'Base case first -> prevents StackOverflowError',
          'fastPow(a, b) -> O(log b) divide & conquer',
          'nCr(n, r) -> multiply & divide step-by-step to stay small',
        ],
        officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/javaOO/methods.html',
      },
      video: yt(
        'Java Methods & Recursion Complete Guide',
        'Apna College',
        'UmnCZ7-9yDY',
        '2h 04m',
        'Focus on function stack frames, overloading, and recursion base-case tracing.',
      ),
      compilerStarterCode: `public class Main {
    static int sumDigits(int n) {
        return n == 0 ? 0 : (n % 10) + sumDigits(n / 10);
    }
    public static void main(String[] args) {
        System.out.println(sumDigits(9876));
    }
}`,
      practiceQuestions: [
        {
          id: 'jb-5-1',
          title: 'Method Overloading Area Calculator',
          difficulty: 'Easy',
          description: 'Write overloaded `area(int side)` and `area(int l, int w)` and print results for 6 and (4, 9): 36 36',
          starterCode: `public class Main {
    // TODO: Write overloaded area methods
    public static void main(String[] args) {
        // TODO: Print area(6) and area(4, 9)
    }
}`,
          expectedOutput: '36 36',
          hints: ['Declare two static methods both named area with 1 and 2 int parameters.'],
        },
        {
          id: 'jb-5-2',
          title: 'Combinatorics nCr Helper',
          difficulty: 'Medium',
          description: 'Write `nCr(int n, int r)` avoiding overflow and print `nCr(10, 3)`: 120',
          starterCode: `public class Main {
    static long nCr(int n, int r) {
        // TODO: Compute n! / (r! * (n-r)!) without intermediate overflow
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(nCr(10, 3));
    }
}`,
          expectedOutput: '120',
          hints: ['Loop i from 1 to min(r, n-r): res = res * (n - i + 1) / i;'],
        },
        {
          id: 'jb-5-3',
          title: 'Recursive Binary Exponentiation',
          difficulty: 'Medium',
          description: 'Implement `fastPow(3, 9)` in O(log N) recursion and print: 19683',
          starterCode: `public class Main {
    static long fastPow(long b, long e) {
        // TODO
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(fastPow(3, 9));
    }
}`,
          expectedOutput: '19683',
          hints: ['Base case e == 0 returns 1; split on half = fastPow(b, e / 2).'],
        },
        {
          id: 'jb-5-4',
          title: 'Recursive Sum of Digits',
          difficulty: 'Easy',
          description: 'Compute recursive sum of digits for 48295 and print: 28',
          starterCode: `public class Main {
    static int digitSum(int n) {
        // TODO
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(digitSum(48295));
    }
}`,
          expectedOutput: '28',
          hints: ['Base case n == 0 returns 0; return (n % 10) + digitSum(n / 10).'],
        },
        {
          id: 'jb-5-5',
          title: 'Digital Root (Single Digit Collapse)',
          difficulty: 'Medium',
          description: 'Repeatedly sum digits of 9875 until a single digit remains -> print: 2',
          starterCode: `public class Main {
    static int digitalRoot(int n) {
        // TODO
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(digitalRoot(9875));
    }
}`,
          expectedOutput: '2',
          hints: ['If n < 10 return n; otherwise recurse on sum-of-digits(n).'],
        },
        {
          id: 'jb-5-6',
          title: 'Count Vowels Helper',
          difficulty: 'Easy',
          description: 'Write a helper returning vowel count in "Kollabrix Arena" -> print: 6',
          starterCode: `public class Main {
    static int countVowels(String s) {
        // TODO
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(countVowels("Kollabrix Arena"));
    }
}`,
          expectedOutput: '6',
          hints: ['Convert to lowercase and check "aeiou".indexOf(ch) >= 0.'],
        },
        {
          id: 'jb-5-7',
          title: 'Decimal to Binary Recursion',
          difficulty: 'Medium',
          description: 'Convert integer 45 to binary string recursively and print: 101101',
          starterCode: `public class Main {
    static String toBinary(int n) {
        // TODO
        return "";
    }
    public static void main(String[] args) {
        System.out.println(toBinary(45));
    }
}`,
          expectedOutput: '101101',
          hints: ['If n < 2 return String.valueOf(n); return toBinary(n / 2) + (n % 2).'],
        },
        {
          id: 'jb-5-8',
          title: 'Recursive Euclid GCD',
          difficulty: 'Easy',
          description: 'Implement `gcd(int a, int b)` recursively and print `gcd(252, 105)`: 21',
          starterCode: `public class Main {
    static int gcd(int a, int b) {
        // TODO
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(gcd(252, 105));
    }
}`,
          expectedOutput: '21',
          hints: ['return b == 0 ? a : gcd(b, a % b);'],
        },
        {
          id: 'jb-5-9',
          title: 'Tower of Hanoi Move Counter',
          difficulty: 'Medium',
          description: 'Count minimum moves to transfer n = 4 disks in Tower of Hanoi -> print: 15',
          starterCode: `public class Main {
    static int hanoiMoves(int n) {
        // TODO: 2 * hanoiMoves(n - 1) + 1
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(hanoiMoves(4));
    }
}`,
          expectedOutput: '15',
          hints: ['Base case n == 0 returns 0; T(n) = 2 * T(n - 1) + 1.'],
        },
        {
          id: 'jb-5-10',
          title: 'Pass-by-Value Array Swap Check',
          difficulty: 'Easy',
          description: 'Write `swap(int[] arr, int i, int j)` to swap indices 0 and 3 in {10, 20, 30, 40} and print space-separated.',
          starterCode: `public class Main {
    static void swap(int[] arr, int i, int j) {
        // TODO
    }
    public static void main(String[] args) {
        int[] a = {10, 20, 30, 40};
        swap(a, 0, 3);
        System.out.println(a[0] + " " + a[1] + " " + a[2] + " " + a[3]);
    }
}`,
          expectedOutput: '40 20 30 10',
          hints: ['Mutating array elements inside a method updates the caller’s array object.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'Arrays, Searching & 2D Matrices',
      topic: '1D Scans, Binary Search & Matrices',
      estimatedTime: '3.5 Hours',
      summary:
        'Master contiguous 1D array patterns (two-pointer reversals, rotation, Kadane max subarray), O(log N) Binary Search, and 2D matrix transformations.',
      studyMaterial: {
        overview:
          'Arrays occupy contiguous heap memory with O(1) index access. Most placement coding round Round-1 problems are 1D/2D array traversals.',
        keyPoints: [
          'In Binary Search, always compute `mid = lo + (hi - lo) / 2` to prevent `(lo + hi)` integer overflow.',
          'Rotate array left by `k` in O(N) time and O(1) extra space via 3 reversals: `[0..k-1]`, `[k..n-1]`, `[0..n-1]`.',
          'Kadane’s Algorithm finds maximum contiguous subarray sum in a single O(N) pass.',
          'In `int[][] mat`, row count is `mat.length` and column count is `mat[0].length`.',
        ],
        codeExamples: [
          {
            title: 'Overflow-Safe Binary Search',
            code: `public class Main {
    static int search(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) return mid;
            if (a[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
    public static void main(String[] args) {
        System.out.println(search(new int[]{2, 5, 9, 14, 21}, 14));
    }
}`,
            explanation: 'Returns index 3 in O(log N) comparisons.',
          },
        ],
        cheatsheet: [
          'Arrays.sort(a) -> Dual-Pivot Quicksort O(N log N)',
          'Prefix sum: pref[i+1] = pref[i] + a[i]',
          'Transpose matrix: swap(mat[i][j], mat[j][i]) for j > i',
        ],
        officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html',
      },
      video: yt(
        'Introduction to Arrays & ArrayList in Java',
        'Kunal Kushwaha',
        'n60Dn0UsbEk',
        '58m',
        'Visualizes heap allocation of 1D/2D arrays, swapping, and reverse scans.',
      ),
      compilerStarterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        int cur = a[0], best = a[0];
        for (int i = 1; i < a.length; i++) {
            cur = Math.max(a[i], cur + a[i]);
            best = Math.max(best, cur);
        }
        System.out.println("Max Subarray: " + best);
    }
}`,
      practiceQuestions: [
        {
          id: 'jb-6-1',
          title: 'Second Largest Distinct Element',
          difficulty: 'Easy',
          description: 'Find the second largest distinct integer in {12, 35, 1, 10, 35, 34} -> print: 34',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] a = {12, 35, 1, 10, 35, 34};
        // TODO: Single pass O(N) without sorting
    }
}`,
          expectedOutput: '34',
          hints: ['Track `first` and `second` initialized to Integer.MIN_VALUE; skip duplicates equal to `first`.'],
        },
        {
          id: 'jb-6-2',
          title: 'Verify Sorted Non-Decreasing Array',
          difficulty: 'Easy',
          description: 'Check {1, 3, 3, 7} and {1, 5, 4, 8} and print: true false',
          starterCode: `public class Main {
    static boolean isSorted(int[] a) {
        // TODO
        return false;
    }
    public static void main(String[] args) {
        System.out.println(isSorted(new int[]{1,3,3,7}) + " " + isSorted(new int[]{1,5,4,8}));
    }
}`,
          expectedOutput: 'true false',
          hints: ['Return false if any a[i] > a[i + 1].'],
        },
        {
          id: 'jb-6-3',
          title: 'Move All Zeros to End In-Place',
          difficulty: 'Easy',
          description: 'Move zeros in {0, 1, 0, 3, 12} preserving relative non-zero order -> 1 3 12 0 0',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] a = {0, 1, 0, 3, 12};
        // TODO: Compact non-zeros to front, fill rest with 0, print space-separated
    }
}`,
          expectedOutput: '1 3 12 0 0',
          hints: ['Maintain a write pointer `w = 0`; whenever a[i] != 0, place at a[w++].'],
        },
        {
          id: 'jb-6-4',
          title: 'Left Rotate Array by K Steps',
          difficulty: 'Medium',
          description: 'Left rotate {1, 2, 3, 4, 5, 6, 7} by k = 2 in O(1) extra space -> 3 4 5 6 7 1 2',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3, 4, 5, 6, 7};
        int k = 2;
        // TODO: Reversal algorithm
    }
}`,
          expectedOutput: '3 4 5 6 7 1 2',
          hints: ['Reverse [0..k-1], reverse [k..n-1], then reverse [0..n-1].'],
        },
        {
          id: 'jb-6-5',
          title: 'Kadane’s Maximum Subarray Sum',
          difficulty: 'Medium',
          description: 'Find the maximum contiguous subarray sum of {-2, 1, -3, 4, -1, 2, 1, -5, 4} -> print: 6',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        // TODO: Print max contiguous sum
    }
}`,
          expectedOutput: '6',
          hints: ['cur = Math.max(x, cur + x); best = Math.max(best, cur).'],
        },
        {
          id: 'jb-6-6',
          title: 'Binary Search Lower Bound (First >= X)',
          difficulty: 'Medium',
          description: 'Find first index >= 6 in {1, 3, 6, 6, 6, 9, 12} -> print: 2',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] a = {1, 3, 6, 6, 6, 9, 12};
        int target = 6;
        // TODO: Return smallest index i where a[i] >= target
    }
}`,
          expectedOutput: '2',
          hints: ['When a[mid] >= target, save ans = mid and tighten hi = mid - 1.'],
        },
        {
          id: 'jb-6-7',
          title: 'Prefix Sum Range Query',
          difficulty: 'Easy',
          description: 'Build prefix sum on {3, 1, 4, 1, 5, 9} and print sum of subarray [1..4] (1-indexed values: 1+4+1+5) -> 11',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9};
        // TODO: Answer query [L=1, R=4] in O(1) after O(N) build
    }
}`,
          expectedOutput: '11',
          hints: ['pref[R + 1] - pref[L] where pref[0] = 0.'],
        },
        {
          id: 'jb-6-8',
          title: 'Transpose 3x3 Matrix',
          difficulty: 'Easy',
          description: 'Transpose {{1,2,3},{4,5,6},{7,8,9}} and print row 0 space-separated: 1 4 7',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[][] m = {{1,2,3},{4,5,6},{7,8,9}};
        // TODO: Transpose in-place and print row 0
    }
}`,
          expectedOutput: '1 4 7',
          hints: ['Swap m[i][j] with m[j][i] only for j > i so elements are not swapped twice.'],
        },
        {
          id: 'jb-6-9',
          title: 'Missing Number in 0..N',
          difficulty: 'Easy',
          description: 'Given distinct numbers {3, 0, 1, 5, 2} from [0..5], find the missing integer in O(N) -> 4',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] a = {3, 0, 1, 5, 2};
        // TODO: Use sum formula or XOR
    }
}`,
          expectedOutput: '4',
          hints: ['Expected sum = n*(n+1)/2 minus actual sum.'],
        },
        {
          id: 'jb-6-10',
          title: 'Boyer-Moore Majority Element',
          difficulty: 'Medium',
          description: 'Find element appearing > n/2 times in {2, 2, 1, 1, 1, 2, 2} in O(1) space -> 2',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] a = {2, 2, 1, 1, 1, 2, 2};
        // TODO: Boyer-Moore voting algorithm
    }
}`,
          expectedOutput: '2',
          hints: ['Maintain candidate & count; decrement on mismatch, reset candidate when count == 0.'],
        },
      ],
    },
    {
      stepNumber: 7,
      title: 'Strings & StringBuilder Mastery',
      topic: 'Immutability, Builders & Char Arrays',
      estimatedTime: '2.5 Hours',
      summary:
        'Avoid O(N²) string concatenation traps using `StringBuilder`, count frequencies with `int[26]`, and solve classic placement string problems cleanly.',
      studyMaterial: {
        overview:
          'Java `String` objects live in immutable memory (intern pool + heap). Concatenating inside a loop allocates N intermediate copies (O(N²)). Always build dynamic text with `StringBuilder`.',
        keyPoints: [
          'Use `StringBuilder sb = new StringBuilder()` for mutable O(1) amortized `append()` and `reverse()`.',
          'Never compare Strings with `==` (compares references); always use `a.equals(b)` or `a.equalsIgnoreCase(b)`.',
          'Use a 26-slot `int[26]` array (`freq[c - \'a\']++`) instead of a HashMap for lowercase frequency checks.',
          '`s.trim().split("\\\\s+")` cleanly splits words even with multiple spaces.',
        ],
        codeExamples: [
          {
            title: 'O(N) StringBuilder Palindrome Check',
            code: `public class Main {
    public static void main(String[] args) {
        String s = "RaceCar".toLowerCase();
        String rev = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(rev));
    }
}`,
            explanation: 'Clean readable reversal using `StringBuilder` + `.equals()`.',
          },
        ],
        cheatsheet: [
          'sb.append(x) / sb.setCharAt(i, c) / sb.reverse()',
          's.toCharArray() -> fast character iteration',
          'Character.isLetterOrDigit(c) / Character.toLowerCase(c)',
        ],
        officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuilder.html',
      },
      video: yt(
        'StringBuilder & String Manipulation — Java Placement Course',
        'Apna College',
        'ZLDwskEhIFg',
        '24m',
        'Explains why String is immutable in memory and how StringBuilder fixes loop latency.',
      ),
      compilerStarterCode: `public class Main {
    public static void main(String[] args) {
        String raw = "Kollabrix";
        StringBuilder sb = new StringBuilder(raw);
        System.out.println(sb.reverse());
    }
}`,
      practiceQuestions: [
        {
          id: 'jb-7-1',
          title: 'Alphanumeric Palindrome Ignore Case',
          difficulty: 'Easy',
          description: 'Test if "A man, a plan, a canal: Panama" is a palindrome ignoring non-alphanumerics & case -> true',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String s = "A man, a plan, a canal: Panama";
        // TODO: Two pointers skipping non-alphanumeric chars
    }
}`,
          expectedOutput: 'true',
          hints: ['Use Character.isLetterOrDigit(c) and Character.toLowerCase(c) on left and right pointers.'],
        },
        {
          id: 'jb-7-2',
          title: 'Anagram Checker Using Frequency Array',
          difficulty: 'Easy',
          description: 'Check ("listen", "silent") and ("rat", "car") -> print: true false',
          starterCode: `public class Main {
    static boolean isAnagram(String a, String b) {
        // TODO
        return false;
    }
    public static void main(String[] args) {
        System.out.println(isAnagram("listen", "silent") + " " + isAnagram("rat", "car"));
    }
}`,
          expectedOutput: 'true false',
          hints: ['Increment count for a, decrement for b, verify all 26 buckets equal 0.'],
        },
        {
          id: 'jb-7-3',
          title: 'Reverse Word Order (Clean Spaces)',
          difficulty: 'Medium',
          description: 'Reverse word order in "  the   sky is blue  " -> blue is sky the',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String s = "  the   sky is blue  ";
        // TODO: Split on whitespace and rebuild via StringBuilder
    }
}`,
          expectedOutput: 'blue is sky the',
          hints: ['s.trim().split("\\\\s+") strips extra spaces cleanly.'],
        },
        {
          id: 'jb-7-4',
          title: 'Run-Length String Compression',
          difficulty: 'Medium',
          description: 'Compress "aaabbbccdaa" to "a3b3c2d1a2" using StringBuilder.',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String s = "aaabbbccdaa";
        // TODO: Run-length encode consecutive runs
    }
}`,
          expectedOutput: 'a3b3c2d1a2',
          hints: ['Track run length count while s.charAt(i) == s.charAt(i - 1).'],
        },
        {
          id: 'jb-7-5',
          title: 'First Non-Repeating Character Index',
          difficulty: 'Easy',
          description: 'Find first unique character in "kollabrixcode" and print its char and index: k 0 -> wait check: k occurs once at 0! Test "swiss" -> w 1',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String s = "swiss";
        // TODO: Print first unique char and index (e.g. w 1)
    }
}`,
          expectedOutput: 'w 1',
          hints: ['Two passes: fill int[26] frequency, then find first char with freq == 1.'],
        },
        {
          id: 'jb-7-6',
          title: 'Longest Common Prefix',
          difficulty: 'Easy',
          description: 'Find longest common prefix of {"flower", "flow", "flight"} -> fl',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String[] strs = {"flower", "flow", "flight"};
        // TODO: Print longest common prefix
    }
}`,
          expectedOutput: 'fl',
          hints: ['Shrink prefix candidate while !word.startsWith(prefix).'],
        },
        {
          id: 'jb-7-7',
          title: 'Remove Duplicate Characters Preserving Order',
          difficulty: 'Easy',
          description: 'Deduplicate "programming" preserving first occurrence -> progamin',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String s = "programming";
        // TODO: Use boolean[26] seen array + StringBuilder
    }
}`,
          expectedOutput: 'progamin',
          hints: ['Append char only if !seen[c - \'a\'], then set seen[...] = true.'],
        },
        {
          id: 'jb-7-8',
          title: 'Toggle Case With StringBuilder',
          difficulty: 'Easy',
          description: 'Toggle upper/lower case of "KaAi21" -> kAaI21',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String s = "KaAi21";
        // TODO: Toggle letter cases keeping digits unchanged
    }
}`,
          expectedOutput: 'kAaI21',
          hints: ['Use Character.isUpperCase / toLowerCase / toUpperCase.'],
        },
        {
          id: 'jb-7-9',
          title: 'Check Rotation of Another String',
          difficulty: 'Easy',
          description: 'Test whether "cdab" is a rotation of "abcd" -> print: true',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String a = "abcd", b = "cdab";
        // TODO: Check length equality and (a + a).contains(b)
    }
}`,
          expectedOutput: 'true',
          hints: ['Every rotation of `a` is a substring of `a + a`.'],
        },
        {
          id: 'jb-7-10',
          title: 'Manual Integer Parser (atoi Core)',
          difficulty: 'Medium',
          description: 'Parse "  -4096 " into an `int` without Integer.parseInt and print doubled value: -8192',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String s = "  -4096 ";
        // TODO: Parse sign and digits, multiply by 2, print
    }
}`,
          expectedOutput: '-8192',
          hints: ['Trim whitespace, check +/- sign, loop digits with acc = acc * 10 + (c - \'0\').'],
        },
      ],
    },
    {
      stepNumber: 8,
      title: 'Object-Oriented Design & Interfaces',
      topic: 'Classes, Constructors & Polymorphism',
      estimatedTime: '3.5 Hours',
      summary:
        'Model clean domain objects using encapsulation, constructors, inheritance, interfaces, Java Records, and Comparable sorting.',
      studyMaterial: {
        overview:
          'Java’s superpower is strongly typed Object-Oriented architecture. Encapsulate invariants behind `private` fields, define behavioral contracts with `interface`, and use `record` for immutable data carriers.',
        keyPoints: [
          'Always hide mutable state behind `private` fields and validate updates inside methods.',
          'Prefer implementing an `interface` (like `Comparable<T>` or `Payable`) over rigid multi-level inheritance.',
          'Override `toString()`, `equals()`, and `hashCode()` together whenever custom classes act as map keys.',
          'Java 16+ `record User(String handle, int elo) {}` auto-generates constructor, getters, `equals`, `hashCode`, and `toString`.',
        ],
        codeExamples: [
          {
            title: 'Encapsulated Interface & Polymorphic Dispatch',
            code: `interface Scorable {
    int score();
}
class Contestant implements Scorable {
    private final String name;
    private int solved;
    Contestant(String name, int solved) {
        this.name = name;
        this.solved = solved;
    }
    public int score() { return solved * 100; }
    public String toString() { return name + ":" + score(); }
}
public class Main {
    public static void main(String[] args) {
        Scorable s = new Contestant("Aria", 4);
        System.out.println(s);
    }
}`,
            explanation: 'Clean separation between contract (`Scorable`) and implementation (`Contestant`).',
          },
        ],
        cheatsheet: [
          'private fields + validated methods = Encapsulation',
          '@Override ensures signature match at compile time',
          'class X implements Comparable<X> -> natural Arrays.sort order',
        ],
        officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/concepts/',
      },
      video: yt(
        'OOP 1: Classes, Objects, Constructors & Keywords',
        'Kunal Kushwaha',
        'BSVKUk58K6U',
        '1h 12m',
        'Explains stack references vs heap objects, constructors, `this`, and garbage collection.',
      ),
      compilerStarterCode: `interface Trackable {
    String badge();
}
class Builder implements Trackable {
    private final String handle;
    private final int elo;
    Builder(String handle, int elo) { this.handle = handle; this.elo = elo; }
    public String badge() { return handle + "[" + elo + "]"; }
}
public class Main {
    public static void main(String[] args) {
        Trackable t = new Builder("KΛ-Dev", 1550);
        System.out.println(t.badge());
    }
}`,
      practiceQuestions: [
        {
          id: 'jb-8-1',
          title: 'Encapsulated BankAccount Guard',
          difficulty: 'Easy',
          description: 'Start balance 500, deposit 250, withdraw 900 (reject overdraft keeping 750), withdraw 200 -> print final balance: 550',
          starterCode: `class BankAccount {
    private int balance;
    BankAccount(int initial) { this.balance = initial; }
    // TODO: deposit(int), boolean withdraw(int), int getBalance()
}
public class Main {
    public static void main(String[] args) {
        // TODO: Execute transactions and print balance
    }
}`,
          expectedOutput: '550',
          hints: ['Only subtract amount in withdraw() when amount > 0 && amount <= balance.'],
        },
        {
          id: 'jb-8-2',
          title: 'Polymorphic Shape Area Sum',
          difficulty: 'Easy',
          description: 'Implement `Shape` interface with `Rect(4, 5)` and `Square(6)`. Sum rounded integer areas and print: 56',
          starterCode: `interface Shape { int area(); }// TODO: Rect and Square classes
public class Main {
    public static void main(String[] args) {
        // TODO: Sum areas via Shape[] array
    }
}`,
          expectedOutput: '56',
          hints: ['4*5 + 6*6 = 20 + 36 = 56.'],
        },
        {
          id: 'jb-8-3',
          title: 'Comparable Contestant Sorting',
          difficulty: 'Medium',
          description: 'Sort `[("A",1200), ("B",1650), ("C",1400)]` by descending ELO using `Comparable` and print handles: B C A',
          starterCode: `import java.util.*;
class Duelist implements Comparable<Duelist> {
    String name; int elo;
    Duelist(String n, int e) { name = n; elo = e; }
    public int compareTo(Duelist o) {
        // TODO: Sort descending by elo
        return 0;
    }
}
public class Main {
    public static void main(String[] args) {
        Duelist[] list = {new Duelist("A",1200), new Duelist("B",1650), new Duelist("C",1400)};
        Arrays.sort(list);
        System.out.println(list[0].name + " " + list[1].name + " " + list[2].name);
    }
}`,
          expectedOutput: 'B C A',
          hints: ['Use Integer.compare(o.elo, this.elo) for descending rank.'],
        },
        {
          id: 'jb-8-4',
          title: 'Immutable Vector2D Addition',
          difficulty: 'Easy',
          description: 'Create `Vec2(3, 4)` and `Vec2(-1, 6)`, return new `Vec2` from `.add()` and print `(2, 10)`.',
          starterCode: `public class Main {
    static class Vec2 {
        final int x, y;
        Vec2(int x, int y) { this.x = x; this.y = y; }
        // TODO: Vec2 add(Vec2 other) & toString()
    }
    public static void main(String[] args) {
        // TODO
    }
}`,
          expectedOutput: '(2, 10)',
          hints: ['Return new Vec2(this.x + o.x, this.y + o.y) without mutating `this`.'],
        },
        {
          id: 'jb-8-5',
          title: 'Static Counter Instance Tracker',
          difficulty: 'Easy',
          description: 'Create 3 `Session` instances incrementing a `static int count`, print total count: 3',
          starterCode: `class Session {
    static int count = 0;
    Session() { /* TODO */ }
}
public class Main {
    public static void main(String[] args) {
        new Session(); new Session(); new Session();
        System.out.println(Session.count);
    }
}`,
          expectedOutput: '3',
          hints: ['Increment `count++` inside the `Session()` constructor.'],
        },
        {
          id: 'jb-8-6',
          title: 'Method Overriding & super() Call',
          difficulty: 'Easy',
          description: 'Base `Employee(1000)` returns salary `1000`; `LeadEmployee(1000, 350)` adds bonus via `super.pay()`. Print: 1350',
          starterCode: `class Employee {
    int base;
    Employee(int b) { base = b; }
    int pay() { return base; }
}
// TODO: LeadEmployee extending Employee
public class Main {
    public static void main(String[] args) {
        // TODO: System.out.println(new LeadEmployee(1000, 350).pay());
    }
}`,
          expectedOutput: '1350',
          hints: ['Call super(b) in LeadEmployee constructor and return super.pay() + bonus.'],
        },
        {
          id: 'jb-8-7',
          title: 'Fluent Builder Chaining',
          difficulty: 'Medium',
          description: 'Build a `QueryBuilder` supporting `.table("users").limit(10).build()` -> SELECT * FROM users LIMIT 10',
          starterCode: `public class Main {
    static class QueryBuilder {
        private String tbl = ""; private int lim = 0;
        // TODO: Fluent setter methods returning this, plus build()
    }
    public static void main(String[] args) {
        // TODO: System.out.println(new QueryBuilder().table("users").limit(10).build());
    }
}`,
          expectedOutput: 'SELECT * FROM users LIMIT 10',
          hints: ['Each chainable method modifies the field and returns `this`.'],
        },
        {
          id: 'jb-8-8',
          title: 'Enum With Behavior',
          difficulty: 'Medium',
          description: 'Create `Tier` enum with `FREE(1)`, `PRO(3)`, `HACKATHON(5)` multiplier and print `Tier.PRO.points(40)`: 120',
          starterCode: `enum Tier {
    FREE(1), PRO(3), HACKATHON(5);
    private final int mult;
    Tier(int m) { this.mult = m; }
    // TODO: int points(int base)
}
public class Main {
    public static void main(String[] args) {
        // TODO: Print Tier.PRO.points(40)
    }
}`,
          expectedOutput: '120',
          hints: ['int points(int base) { return base * mult; }'],
        },
        {
          id: 'jb-8-9',
          title: 'Custom equals() Value Equality',
          difficulty: 'Easy',
          description: 'Implement `equals` on `Ticket(int id, String code)` so two distinct instances `(7, "VIP")` compare `true`.',
          starterCode: `class Ticket {
    int id; String code;
    Ticket(int id, String code) { this.id = id; this.code = code; }
    // TODO: Override equals(Object o)
}
public class Main {
    public static void main(String[] args) {
        System.out.println(new Ticket(7, "VIP").equals(new Ticket(7, "VIP")));
    }
}`,
          expectedOutput: 'true',
          hints: ['Check `(o instanceof Ticket t) && this.id == t.id && Objects.equals(this.code, t.code)`.'],
        },
        {
          id: 'jb-8-10',
          title: 'Circular Ring Buffer Class',
          difficulty: 'Hard',
          description: 'Write a fixed capacity-3 ring buffer pushing 10, 20, 30, 40 (overwrites 10) and print oldest-to-newest: 20 30 40',
          starterCode: `public class Main {
    static class RingBuffer {
        private final int[] buf;
        private int write = 0, size = 0;
        RingBuffer(int cap) { buf = new int[cap]; }
        // TODO: add(int x) & printOrder()
    }
    public static void main(String[] args) {
        RingBuffer rb = new RingBuffer(3);
        rb.add(10); rb.add(20); rb.add(30); rb.add(40);
        // TODO: Print contents oldest to newest
    }
}`,
          expectedOutput: '20 30 40',
          hints: ['Oldest element sits at `(write - size + cap) % cap`.'],
        },
      ],
    },
  ],
};
