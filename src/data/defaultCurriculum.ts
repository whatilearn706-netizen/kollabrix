import { LanguageCurriculum } from '@/types/curriculum';

export const DEFAULT_CURRICULA: Record<string, LanguageCurriculum> = {
  // ==========================================
  // JAVA - BEGINNER TRACK
  // ==========================================
  'java-beginner': {
    id: 'java-beginner',
    language: 'java',
    track: 'beginner',
    title: 'Java Masterclass for Beginners',
    tagline: 'From First "Hello World" to Object-Oriented Master',
    icon: '☕',
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-400/40 hover:border-amber-400',
    description: 'A step-by-step zero-to-hero journey in Java. Learn variables, loops, object-oriented concepts, and memory models with hands-on practice questions and built-in compiler.',
    compilerLanguage: 'java',
    compilerDisplayName: 'OpenJDK 21 (Java)',
    stepsCount: 5,
    estimatedTotalHours: '12 Hours',
    prerequisites: ['No prior programming experience required', 'Basic computer literacy'],
    outcomes: [
      'Write clean, idiomatic Java programs using JDK 21',
      'Understand JVM, JRE, Bytecode and Garbage Collection',
      'Master Object-Oriented Programming (Classes, Encapsulation, Polymorphism)',
      'Solve placement-level coding problems with arrays and strings',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Java Introduction & First Program',
        topic: 'Java Architecture & Syntax Basics',
        estimatedTime: '1.5 Hours',
        summary: 'Understand the JVM, write your first Java program, and learn how Java compiles code into platform-independent bytecode.',
        studyMaterial: {
          overview:
            'Java is a write-once, run-anywhere (WORA) language designed by Sun Microsystems (now Oracle). Code is compiled by javac into Bytecode (.class file), which is executed by the Java Virtual Machine (JVM).',
          keyPoints: [
            'Class declaration: Every Java statement must belong inside a class.',
            'Entry point: public static void main(String[] args) is where program execution starts.',
            'Case-sensitivity: Java differentiates between System and system.',
            'Semicolons: Every executable statement in Java ends with a semicolon (;).',
          ],
          codeExamples: [
            {
              title: 'Standard Java Hello World',
              code: `class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to Java Programming!");\n    }\n}`,
              explanation:
                'System.out.println() prints the text followed by a new line. In our online compiler, use "class Main".',
            },
          ],
          cheatsheet: [
            'System.out.print() -> Prints without newline',
            'System.out.println() -> Prints with automatic newline',
            '// Single line comment',
            '/* Multi line comment */',
          ],
          officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/index.html',
        },
        video: {
          title: 'Java Full Course for Beginners - Architecture & First Program',
          instructor: 'Bro Code',
          youtubeId: 'xk4_1vDrzzo',
          videoUrl: 'https://www.youtube.com/watch?v=xk4_1vDrzzo',
          duration: '35m',
          notes: 'Focus on minutes 00:00 to 35:00 for setup, class syntax, and terminal printing.',
        },
        practiceQuestions: [
          {
            id: 'java-bg-q1',
            title: 'Print Your Student Identity Card',
            difficulty: 'Easy',
            description:
              'Write a Java program that prints your Name on the first line and your College/Role on the second line.\n\nInput: None\nOutput Format:\nLine 1: Name: Alex Mercer\nLine 2: College: Linkora University',
            starterCode: `class Main {\n    public static void main(String[] args) {\n        // Step 1: Print your name\n        System.out.println("Name: Alex Mercer");\n        // Step 2: Print your college\n        System.out.println("College: Linkora University");\n    }\n}`,
            expectedOutput: 'Name: Alex Mercer\nCollege: Linkora University',
            hints: [
              'Use System.out.println() twice.',
              'Ensure exact spelling and spaces match the prompt.',
            ],
          },
        ],
        compilerStarterCode: `class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, TeamForge Developer!");\n        System.out.println("Java compiler is running directly in your browser!");\n    }\n}`,
      },
      {
        stepNumber: 2,
        title: 'Variables, Data Types & Input',
        topic: 'Primitive Types & Scanner Class',
        estimatedTime: '2 Hours',
        summary: 'Learn primitive data types (int, double, char, boolean), non-primitive types (String), and how to read input using java.util.Scanner.',
        studyMaterial: {
          overview:
            'Java is a statically typed language. Every variable must have a declared type before it can store data in memory. Java has 8 primitive types: byte, short, int, long, float, double, char, and boolean.',
          keyPoints: [
            'int (4 bytes): Stores whole numbers e.g. int age = 20;',
            'double (8 bytes): Stores fractional numbers e.g. double gpa = 3.85;',
            'char (2 bytes): Stores a single unicode character enclosed in single quotes e.g. char grade = \'A\';',
            'boolean (1 bit): Stores either true or false.',
            'Scanner: Used to read console input: Scanner sc = new Scanner(System.in);',
          ],
          codeExamples: [
            {
              title: 'Reading User Input with Scanner',
              code: `import java.util.Scanner;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int a = scanner.nextInt();\n        int b = scanner.nextInt();\n        System.out.println("Sum = " + (a + b));\n        scanner.close();\n    }\n}`,
              explanation:
                'In our built-in compiler, you can enter test values into the Stdin Input box below before clicking Run!',
            },
          ],
          cheatsheet: [
            'scanner.next() -> Reads single token word',
            'scanner.nextLine() -> Reads entire line',
            'scanner.nextInt() -> Reads integer',
            'scanner.nextDouble() -> Reads floating-point value',
          ],
          officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html',
        },
        video: {
          title: 'Java Variables, Data Types & Scanner Inputs Explained',
          instructor: 'Bro Code',
          youtubeId: 'xk4_1vDrzzo',
          videoUrl: 'https://www.youtube.com/watch?v=xk4_1vDrzzo',
          duration: '45m',
          notes: 'Watch minutes 35:00 to 1:20:00 for Scanner and arithmetic expressions.',
        },
        practiceQuestions: [
          {
            id: 'java-bg-q2',
            title: 'Calculate Perimeter & Area of Rectangle',
            difficulty: 'Easy',
            description:
              'Given length = 5 and width = 10, write a program to calculate and print the Area and Perimeter in the format shown.\n\nExpected Output:\nArea = 50\nPerimeter = 30',
            starterCode: `class Main {\n    public static void main(String[] args) {\n        int length = 5;\n        int width = 10;\n        \n        int area = length * width;\n        int perimeter = 2 * (length + width);\n        \n        System.out.println("Area = " + area);\n        System.out.println("Perimeter = " + perimeter);\n    }\n}`,
            expectedOutput: 'Area = 50\nPerimeter = 30',
            hints: ['Area = length * width', 'Perimeter = 2 * (length + width)'],
          },
        ],
        compilerStarterCode: `import java.util.Scanner;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println("Type your name in the input box, or run with defaults:");\n        String name = sc.hasNext() ? sc.next() : "Student";\n        System.out.println("Welcome aboard, " + name + "!");\n    }\n}`,
      },
      {
        stepNumber: 3,
        title: 'Conditionals & Control Flow',
        topic: 'if-else, else-if, switch & Ternary',
        estimatedTime: '2 Hours',
        summary: 'Master decision making in Java using if statements, logical operators (&&, ||, !), switch expressions, and ternary conditions.',
        studyMaterial: {
          overview:
            'Conditional statements allow programs to make decisions and execute different blocks of code depending on whether a boolean expression evaluates to true or false.',
          keyPoints: [
            'if (condition) { ... } else { ... }',
            'Logical AND (&&): Both conditions must be true.',
            'Logical OR (||): At least one condition must be true.',
            'Logical NOT (!): Inverts the boolean result.',
            'switch statement: Efficient branching for checking a variable against multiple equality cases.',
          ],
          codeExamples: [
            {
              title: 'Leap Year Checker',
              code: `class Main {\n    public static void main(String[] args) {\n        int year = 2024;\n        boolean isLeap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);\n        System.out.println(year + " is leap? " + isLeap);\n    }\n}`,
            },
          ],
          cheatsheet: [
            'Equality: ==',
            'Inequality: !=',
            'Ternary: int max = (a > b) ? a : b;',
            'Switch case requires break to avoid fallthrough.',
          ],
          officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html',
        },
        video: {
          title: 'Conditionals, if-else & Logical Operators in Java',
          instructor: 'Bro Code',
          youtubeId: 'xk4_1vDrzzo',
          videoUrl: 'https://www.youtube.com/watch?v=xk4_1vDrzzo',
          duration: '30m',
          notes: 'Watch minutes 1:20:00 to 1:50:00 for conditionals and switch cases.',
        },
        practiceQuestions: [
          {
            id: 'java-bg-q3',
            title: 'Even or Odd Number Check',
            difficulty: 'Easy',
            description:
              'Given number = 24, check whether it is Even or Odd and print "24 is Even". If odd, print "24 is Odd".',
            starterCode: `class Main {\n    public static void main(String[] args) {\n        int num = 24;\n        if (num % 2 == 0) {\n            System.out.println(num + " is Even");\n        } else {\n            System.out.println(num + " is Odd");\n        }\n    }\n}`,
            expectedOutput: '24 is Even',
            hints: ['Use modulus operator % 2 to check if remainder is 0.'],
          },
        ],
        compilerStarterCode: `class Main {\n    public static void main(String[] args) {\n        int score = 88;\n        char grade;\n        \n        if (score >= 90) grade = 'A';\n        else if (score >= 80) grade = 'B';\n        else if (score >= 70) grade = 'C';\n        else grade = 'F';\n        \n        System.out.println("Score: " + score + " -> Grade: " + grade);\n    }\n}`,
      },
      {
        stepNumber: 4,
        title: 'Loops & Iterations',
        topic: 'for, while, do-while & Nested Loops',
        estimatedTime: '2.5 Hours',
        summary: 'Learn how to repeat actions efficiently using for loops, while loops, break and continue, and pattern printing for placement rounds.',
        studyMaterial: {
          overview:
            'Loops are used to execute a block of statements repeatedly as long as a specified condition is true. The for loop is best when the number of iterations is known in advance; while loop is best when waiting for an event.',
          keyPoints: [
            'for (init; condition; update) { ... }',
            'while (condition) { ... } checks condition before entering.',
            'do { ... } while (condition); executes at least once.',
            'break terminates the loop immediately.',
            'continue skips the current iteration and advances to the next.',
          ],
          codeExamples: [
            {
              title: 'Fibonacci Series Generator',
              code: `class Main {\n    public static void main(String[] args) {\n        int n = 7, a = 0, b = 1;\n        System.out.print("Fibonacci: ");\n        for (int i = 1; i <= n; i++) {\n            System.out.print(a + " ");\n            int next = a + b;\n            a = b;\n            b = next;\n        }\n        System.out.println();\n    }\n}`,
            },
          ],
          cheatsheet: [
            'Infinite loop danger: Always ensure loop variable moves towards termination condition.',
            'Nested loops have time complexity O(N*M).',
          ],
          officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/for.html',
        },
        video: {
          title: 'Java Loops & Pattern Printing Tutorial',
          instructor: 'Kunal Kushwaha',
          youtubeId: 'BSVKUk58Kwg',
          videoUrl: 'https://www.youtube.com/watch?v=BSVKUk58Kwg',
          duration: '1h 10m',
          notes: 'Comprehensive breakdown of while loops, for loops, and placement interview questions.',
        },
        practiceQuestions: [
          {
            id: 'java-bg-q4',
            title: 'Sum of First 10 Natural Numbers',
            difficulty: 'Easy',
            description:
              'Write a loop that calculates the sum of numbers from 1 to 10 and prints "Sum = 55".',
            starterCode: `class Main {\n    public static void main(String[] args) {\n        int sum = 0;\n        for (int i = 1; i <= 10; i++) {\n            sum += i;\n        }\n        System.out.println("Sum = " + sum);\n    }\n}`,
            expectedOutput: 'Sum = 55',
            hints: ['Initialize sum = 0 and add i inside the loop.'],
          },
        ],
        compilerStarterCode: `class Main {\n    public static void main(String[] args) {\n        // Print a simple star pyramid\n        int rows = 5;\n        for (int i = 1; i <= rows; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print("* ");\n            }\n            System.out.println();\n        }\n    }\n}`,
      },
      {
        stepNumber: 5,
        title: 'Object-Oriented Programming (OOP)',
        topic: 'Classes, Objects, Constructors & Methods',
        estimatedTime: '3 Hours',
        summary: 'Enter the core superpower of Java: Classes as blueprints, Objects as living instances, Constructors, this keyword, and Encapsulation.',
        studyMaterial: {
          overview:
            'Java is built around the OOP philosophy. A Class is a blueprint that defines attributes (fields) and behaviors (methods). An Object is an actual instance of that class living on the heap memory.',
          keyPoints: [
            'Class vs Object: Class is the cookie cutter; Object is the delicious cookie.',
            'Constructor: Special method with same name as class and no return type; runs when new Object() is created.',
            'this keyword: Refers to the current object instance.',
            'Encapsulation: Keeping fields private and exposing getters and setters.',
          ],
          codeExamples: [
            {
              title: 'Student Class with Constructor & Method',
              code: `class Student {\n    private String name;\n    private int rollNo;\n\n    public Student(String name, int rollNo) {\n        this.name = name;\n        this.rollNo = rollNo;\n    }\n\n    public void display() {\n        System.out.println("Student: " + name + " | Roll: " + rollNo);\n    }\n}\n\nclass Main {\n    public static void main(String[] args) {\n        Student s1 = new Student("Priya Sharma", 101);\n        s1.display();\n    }\n}`,
            },
          ],
          cheatsheet: [
            'new operator allocates memory on heap.',
            'Garbage Collector automatically frees unreferenced memory.',
            'static members belong to the class rather than instances.',
          ],
          officialDocUrl: 'https://docs.oracle.com/javase/tutorial/java/concepts/index.html',
        },
        video: {
          title: 'Object Oriented Programming (OOP) in Java Explained',
          instructor: 'Kunal Kushwaha',
          youtubeId: 'BSVKUk58Kwg',
          videoUrl: 'https://www.youtube.com/watch?v=BSVKUk58Kwg',
          duration: '2h 15m',
          notes: 'Must-watch lecture for campus placements and software engineering rounds.',
        },
        practiceQuestions: [
          {
            id: 'java-bg-q5',
            title: 'Bank Account Class Simulation',
            difficulty: 'Medium',
            description:
              'Create a BankAccount object with initial balance 1000. Deposit 500, withdraw 200, and print the final balance: "Final Balance = 1300".',
            starterCode: `class BankAccount {\n    private int balance;\n\n    public BankAccount(int initial) {\n        this.balance = initial;\n    }\n\n    public void deposit(int amt) {\n        this.balance += amt;\n    }\n\n    public void withdraw(int amt) {\n        this.balance -= amt;\n    }\n\n    public int getBalance() {\n        return this.balance;\n    }\n}\n\nclass Main {\n    public static void main(String[] args) {\n        BankAccount acc = new BankAccount(1000);\n        acc.deposit(500);\n        acc.withdraw(200);\n        System.out.println("Final Balance = " + acc.getBalance());\n    }\n}`,
            expectedOutput: 'Final Balance = 1300',
            hints: ['1000 + 500 - 200 = 1300.'],
          },
        ],
        compilerStarterCode: `class Main {\n    public static void main(String[] args) {\n        System.out.println("Congratulations! You mastered Java Basics to OOP!");\n        System.out.println("Write your own custom class and run it here:");\n    }\n}`,
      },
    ],
  },

  // ==========================================
  // C++ - BEGINNER TRACK
  // ==========================================
  'cpp-beginner': {
    id: 'cpp-beginner',
    language: 'cpp',
    track: 'beginner',
    title: 'C++ Foundations & Competitive Programming',
    tagline: 'Master High-Performance Code, Memory & STL',
    icon: '⚡',
    color: 'text-cyan-500 dark:text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    borderColor: 'border-cyan-400/40 hover:border-cyan-400',
    description: 'Learn C++ from the ground up: syntax, pointers, memory addressing, vectors, and competitive programming speed tricks with built-in GCC compiler.',
    compilerLanguage: 'cpp',
    compilerDisplayName: 'GCC 13.2 (C++20)',
    stepsCount: 5,
    estimatedTotalHours: '10 Hours',
    prerequisites: ['No prior programming experience required'],
    outcomes: [
      'Write ultra-fast C++ programs using modern C++20 standards',
      'Understand pointers, references, and stack vs heap memory',
      'Master the Standard Template Library (vector, map, set, sort)',
      'Crack competitive programming and ICPC collegiate qualifier problems',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'C++ Setup, Syntax & Fast I/O',
        topic: 'iostream, namespaces & std::cout',
        estimatedTime: '1 Hour',
        summary: 'Understand #include <iostream>, using namespace std, fast I/O for competitive programming, and the main() return code.',
        studyMaterial: {
          overview:
            'C++ is a compiled, general-purpose language with direct hardware access and deterministic resource management (RAII). It is the premier language for competitive programming, game engines, and high-frequency trading.',
          keyPoints: [
            '#include <iostream> brings in input/output stream capabilities.',
            'std::cout << "Text" << std::endl; prints text and flushes buffer.',
            'Competitive fast I/O: cin.tie(NULL); ios_base::sync_with_stdio(false);',
            'return 0; tells the operating system that program executed successfully.',
          ],
          codeExamples: [
            {
              title: 'Fast C++ Hello World',
              code: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, Competitive Programmer!" << std::endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            'std::cin >> var reads input',
            'std::cout << var writes output',
            '\\n is faster than std::endl because it does not force buffer flush',
          ],
          officialDocUrl: 'https://en.cppreference.com/w/cpp/io',
        },
        video: {
          title: 'C++ Full Course for Complete Beginners',
          instructor: 'freeCodeCamp',
          youtubeId: 'vLnPwxZdW4Y',
          videoUrl: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
          duration: '40m',
          notes: 'Watch minutes 00:00 to 40:00 for C++ foundation and compiler setup.',
        },
        practiceQuestions: [
          {
            id: 'cpp-bg-q1',
            title: 'Print ICPC Welcome Message',
            difficulty: 'Easy',
            description:
              'Print the exact two lines:\nLine 1: ICPC Arena: Online\nLine 2: Ready to Solve!',
            starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "ICPC Arena: Online" << endl;\n    cout << "Ready to Solve!" << endl;\n    return 0;\n}`,
            expectedOutput: 'ICPC Arena: Online\nReady to Solve!',
            hints: ['Use cout and endl twice.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "⚡ C++20 is active in Linkora Compiler!" << endl;\n    cout << "Ready for high-speed algorithmic practice." << endl;\n    return 0;\n}`,
      },
      {
        stepNumber: 2,
        title: 'Data Types, Operators & Conditions',
        topic: 'Primitive Types, Overflow & if-else',
        estimatedTime: '2 Hours',
        summary: 'Master integers, long long for avoiding overflow in contests, double precision, and conditional logic.',
        studyMaterial: {
          overview:
            'In competitive programming, 32-bit int can hold up to ~2 x 10^9. If a sum exceeds 2 x 10^9, it will overflow into negative numbers! Use long long (up to 9 x 10^18) to stay safe.',
          keyPoints: [
            'int: 32-bit signed integer (-2*10^9 to 2*10^9)',
            'long long: 64-bit integer (-9*10^18 to 9*10^18)',
            'char: 1-byte ASCII character',
            'bool: true (1) or false (0)',
          ],
          codeExamples: [
            {
              title: 'Preventing Contest Integer Overflow',
              code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a = 1000000000LL;\n    long long b = 2000000000LL;\n    long long product = a * b;\n    cout << "Product: " << product << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            'Use 1LL when multiplying large integers to prevent overflow.',
            'Ternary: int ans = (a > b) ? a : b;',
          ],
          officialDocUrl: 'https://en.cppreference.com/w/cpp/language/types',
        },
        video: {
          title: 'C++ Data Types, Overflow & Conditions',
          instructor: 'Luv',
          youtubeId: 'EAR7De6Gog4',
          videoUrl: 'https://www.youtube.com/watch?v=EAR7De6Gog4',
          duration: '35m',
          notes: 'Crucial rules on contest overflow and type casting.',
        },
        practiceQuestions: [
          {
            id: 'cpp-bg-q2',
            title: 'Maximum of Three Numbers',
            difficulty: 'Easy',
            description:
              'Given a = 45, b = 99, c = 12. Find the maximum and print "Max = 99".',
            starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 45, b = 99, c = 12;\n    int mx = max(a, max(b, c));\n    cout << "Max = " << mx << endl;\n    return 0;\n}`,
            expectedOutput: 'Max = 99',
            hints: ['Use max(a, max(b, c)) from <algorithm> or simple if-else.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 95;\n    if (score >= 90) {\n        cout << "Grade: A+ (Outstanding!)" << endl;\n    }\n    return 0;\n}`,
      },
      {
        stepNumber: 3,
        title: 'Loops, Arrays & Vectors',
        topic: 'std::vector, iterators & range-based for loops',
        estimatedTime: '2 Hours',
        summary: 'Learn dynamic resizing with std::vector, push_back(), pop_back(), size(), and clean modern C++ range-based loops.',
        studyMaterial: {
          overview:
            'Raw arrays have fixed size, whereas std::vector is a dynamic array that grows automatically when elements are added. It is the most commonly used container in C++.',
          keyPoints: [
            'vector<int> v; declares empty vector.',
            'v.push_back(x) adds element at the end in O(1) amortized.',
            'v.size() returns the number of elements.',
            'Range-for: for (int x : v) { cout << x << " "; }',
          ],
          codeExamples: [
            {
              title: 'Vector Operations in C++',
              code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {10, 20, 30};\n    nums.push_back(40);\n    \n    for (int n : nums) {\n        cout << n << " ";\n    }\n    cout << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            'v.front() returns first element',
            'v.back() returns last element',
            'v.clear() removes all elements',
          ],
          officialDocUrl: 'https://en.cppreference.com/w/cpp/container/vector',
        },
        video: {
          title: 'C++ Vectors & Modern Iterators Tutorial',
          instructor: 'Luv',
          youtubeId: 'zGo9R5ZpmtQ',
          videoUrl: 'https://www.youtube.com/watch?v=zGo9R5ZpmtQ',
          duration: '45m',
          notes: 'Detailed demonstration of vectors, memory reallocation, and algorithms.',
        },
        practiceQuestions: [
          {
            id: 'cpp-bg-q3',
            title: 'Sum of Vector Elements',
            difficulty: 'Easy',
            description:
              'Given vector {2, 4, 6, 8, 10}, calculate the sum and print "Total Sum = 30".',
            starterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> v = {2, 4, 6, 8, 10};\n    int sum = 0;\n    for (int x : v) sum += x;\n    cout << "Total Sum = " << sum << endl;\n    return 0;\n}`,
            expectedOutput: 'Total Sum = 30',
            hints: ['Loop over each element and accumulate into sum.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> scores = {78, 92, 45, 88, 100};\n    sort(scores.begin(), scores.end());\n    \n    cout << "Sorted scores: ";\n    for (int s : scores) cout << s << " ";\n    cout << endl;\n    return 0;\n}`,
      },
      {
        stepNumber: 4,
        title: 'Pointers & References Demystified',
        topic: 'Memory Addresses, & operator & * dereference',
        estimatedTime: '2.5 Hours',
        summary: 'Understand how memory works, how pointers store addresses, and why pass-by-reference is critical for C++ performance.',
        studyMaterial: {
          overview:
            'A pointer is a variable that stores the memory address of another variable. Passing large vectors or objects by reference (&) prevents expensive copying and speeds up your code by orders of magnitude.',
          keyPoints: [
            '&x gets the memory address of x.',
            'int* ptr = &x; declares a pointer pointing to x.',
            '*ptr accesses or modifies the value at that address.',
            'Pass by reference: void modify(vector<int>& v) avoids copying the vector.',
          ],
          codeExamples: [
            {
              title: 'Swap Function Using References',
              code: `#include <iostream>\nusing namespace std;\n\nvoid swapNums(int& a, int& b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swapNums(x, y);\n    cout << "x: " << x << ", y: " << y << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            'Null pointer safety: int* p = nullptr;',
            'Never dereference a nullptr or dangling pointer.',
          ],
          officialDocUrl: 'https://en.cppreference.com/w/cpp/language/pointer',
        },
        video: {
          title: 'Pointers and References in C++ Explained Easily',
          instructor: 'Abdul Bari',
          youtubeId: '0qUUPMy3f_0',
          videoUrl: 'https://www.youtube.com/watch?v=0qUUPMy3f_0',
          duration: '50m',
          notes: 'Clear diagrammatic breakdown of pointer allocation on stack and heap.',
        },
        practiceQuestions: [
          {
            id: 'cpp-bg-q4',
            title: 'Double Value Using Pointer',
            difficulty: 'Easy',
            description:
              'Given int val = 25, use a pointer to double its value in memory and print "Doubled Value = 50".',
            starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int val = 25;\n    int* p = &val;\n    *p = *p * 2;\n    cout << "Doubled Value = " << val << endl;\n    return 0;\n}`,
            expectedOutput: 'Doubled Value = 50',
            hints: ['Dereference pointer with *p to multiply and assign back.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int rank = 1;\n    int& ref = rank; // ref is an alias to rank\n    ref = 42;\n    cout << "Rank through alias: " << rank << endl;\n    return 0;\n}`,
      },
      {
        stepNumber: 5,
        title: 'Standard Template Library (STL) Mastery',
        topic: 'vector, map, unordered_set, pair & sort()',
        estimatedTime: '2.5 Hours',
        summary: 'Learn the secret weapon of contest programmers: hash maps, sets, pairs, priority queues, and binary search functions.',
        studyMaterial: {
          overview:
            'The C++ STL provides battle-tested data structures and algorithms. Using unordered_map for O(1) lookups, set for unique sorted elements, and sort() for O(N log N) ordering makes problem solving lightning fast.',
          keyPoints: [
            'unordered_map<key, val>: Hash table with O(1) average lookup.',
            'set<T>: Red-black tree with O(log N) operations, keeps items sorted.',
            'sort(v.begin(), v.end()): Introsort (Quick + Heap + Insertion sort).',
            'pair<T1, T2>: Combines two values together into one object.',
          ],
          codeExamples: [
            {
              title: 'Frequency Counter Using unordered_map',
              code: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    vector<int> arr = {1, 2, 2, 3, 1, 4, 2};\n    unordered_map<int, int> freq;\n    for (int x : arr) freq[x]++;\n    \n    cout << "Frequency of 2: " << freq[2] << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            'lower_bound(v.begin(), v.end(), val): First element >= val',
            'upper_bound(v.begin(), v.end(), val): First element > val',
          ],
          officialDocUrl: 'https://en.cppreference.com/w/cpp/container',
        },
        video: {
          title: 'C++ STL Full Course for Placement & CP',
          instructor: 'Striver',
          youtubeId: 'EAR7De6Gog4',
          videoUrl: 'https://www.youtube.com/watch?v=EAR7De6Gog4',
          duration: '1h 20m',
          notes: 'Master vectors, lists, deques, stacks, queues, priority queues, sets, and maps.',
        },
        practiceQuestions: [
          {
            id: 'cpp-bg-q5',
            title: 'Count Unique Elements in Array',
            difficulty: 'Easy',
            description:
              'Given array {5, 2, 5, 8, 2, 9, 1}, insert into a set to count unique elements and print "Unique Count = 5".',
            starterCode: `#include <iostream>\n#include <vector>\n#include <set>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {5, 2, 5, 8, 2, 9, 1};\n    set<int> uniqueSet(nums.begin(), nums.end());\n    cout << "Unique Count = " << uniqueSet.size() << endl;\n    return 0;\n}`,
            expectedOutput: 'Unique Count = 5',
            hints: ['std::set automatically discards duplicate entries.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    unordered_map<string, string> capital = {\n        {"India", "New Delhi"},\n        {"Japan", "Tokyo"},\n        {"France", "Paris"}\n    };\n    \n    cout << "Capital of India: " << capital["India"] << endl;\n    return 0;\n}`,
      },
    ],
  },

  // ==========================================
  // PYTHON - BEGINNER TRACK
  // ==========================================
  'python-beginner': {
    id: 'python-beginner',
    language: 'python',
    track: 'beginner',
    title: 'Python for Beginners & Automation',
    tagline: 'Clean Syntax, AI Foundations & Real-World Projects',
    icon: '🐍',
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-400/40 hover:border-emerald-400',
    description: 'Master readable, modern Python from variables, lists, dictionaries, and functions to file processing and problem solving.',
    compilerLanguage: 'python',
    compilerDisplayName: 'CPython 3.12 (Python)',
    stepsCount: 4,
    estimatedTotalHours: '8 Hours',
    prerequisites: ['No prior coding experience required'],
    outcomes: [
      'Write clean, readable Python code following PEP 8 conventions',
      'Master core data structures: Lists, Tuples, Dictionaries, and Sets',
      'Build functions with parameters, return values, and lambda expressions',
      'Automate daily tasks and manipulate data effortlessly',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Python Setup & Syntax Simplicity',
        topic: 'print, variables & dynamic typing',
        estimatedTime: '1 Hour',
        summary: 'Experience the magic of Python syntax: no semicolons, no curly braces, just clean indentation and immediate execution.',
        studyMaterial: {
          overview:
            'Python is an interpreted, high-level, dynamically typed language. Its human-readable syntax allows developers to write fewer lines of code to achieve what takes dozens of lines in other languages.',
          keyPoints: [
            'Indentation: Python uses indentation (4 spaces) to define code blocks.',
            'Dynamic typing: No need to declare variable types. Python infers them.',
            'F-strings: Print variables cleanly with f"Hello {name}!"',
          ],
          codeExamples: [
            {
              title: 'Python First Script',
              code: `name = "Linkora Student"\ngpa = 3.9\nprint(f"Welcome {name}! Target GPA: {gpa}")`,
            },
          ],
          cheatsheet: [
            'type(x) returns the data type of x',
            'int("42") converts string to integer',
            'str(100) converts integer to string',
          ],
          officialDocUrl: 'https://docs.python.org/3/tutorial/index.html',
        },
        video: {
          title: 'Python Tutorial for Absolute Beginners',
          instructor: 'Programming with Mosh',
          youtubeId: '_uQrJ0TkZlc',
          videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
          duration: '45m',
          notes: 'Watch minutes 00:00 to 45:00 for variables, strings, and arithmetic.',
        },
        practiceQuestions: [
          {
            id: 'py-bg-q1',
            title: 'Greeting with Calculated Age',
            difficulty: 'Easy',
            description:
              'Given current_year = 2026 and birth_year = 2004, print "Age: 22 years".',
            starterCode: `current_year = 2026\nbirth_year = 2004\nage = current_year - birth_year\nprint(f"Age: {age} years")`,
            expectedOutput: 'Age: 22 years',
            hints: ['Use subtraction and an f-string.'],
          },
        ],
        compilerStarterCode: `print("🐍 Python 3.12 is live in TeamForge!")\nfor i in range(1, 4):\n    print(f"Rocket launch count: {i}")\nprint("Blast off! 🚀")`,
      },
      {
        stepNumber: 2,
        title: 'Lists, Dictionaries & Tuples',
        topic: 'Collections & Dictionary Key-Value Pairs',
        estimatedTime: '2 Hours',
        summary: 'Learn Python power structures: append, slicing [start:stop:step], dictionary lookups, and list comprehensions.',
        studyMaterial: {
          overview:
            'Python collections are versatile and expressive. Lists are mutable ordered sequences; Dictionaries are key-value mappings with lightning-fast hash lookups; Tuples are immutable records.',
          keyPoints: [
            'List: items = [1, 2, 3]; items.append(4)',
            'Slicing: items[::-1] reverses a list in one line!',
            'Dict: student = {"name": "Aarav", "rank": 1}',
            'List comprehension: squares = [x**2 for x in range(5)]',
          ],
          codeExamples: [
            {
              title: 'Dictionary Manipulation',
              code: `skills = {"Alice": "Java", "Bob": "Python"}\nskills["Charlie"] = "C++"\nfor name, lang in skills.items():\n    print(f"{name} codes in {lang}")`,
            },
          ],
          cheatsheet: [
            'len(collection) returns length',
            'key in dict checks if key exists in O(1)',
          ],
          officialDocUrl: 'https://docs.python.org/3/tutorial/datastructures.html',
        },
        video: {
          title: 'Python Lists, Tuples & Dictionaries Explained',
          instructor: 'Corey Schafer',
          youtubeId: 'YYXdXT2l-Gg',
          videoUrl: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
          duration: '35m',
          notes: 'Crucial foundations for web development, AI, and data science.',
        },
        practiceQuestions: [
          {
            id: 'py-bg-q2',
            title: 'Filter Even Numbers with List Comprehension',
            difficulty: 'Easy',
            description:
              'Given numbers = [1, 2, 3, 4, 5, 6], produce a list of only even numbers and print "Evens: [2, 4, 6]".',
            starterCode: `numbers = [1, 2, 3, 4, 5, 6]\nevens = [x for x in numbers if x % 2 == 0]\nprint(f"Evens: {evens}")`,
            expectedOutput: 'Evens: [2, 4, 6]',
            hints: ['Use [x for x in numbers if x % 2 == 0].'],
          },
        ],
        compilerStarterCode: `fruits = ["Apple", "Banana", "Cherry", "Mango"]\nprint("Original:", fruits)\nprint("Reversed:", fruits[::-1])`,
      },
      {
        stepNumber: 3,
        title: 'Functions, Arguments & Lambdas',
        topic: 'def, *args, **kwargs & Scope',
        estimatedTime: '2 Hours',
        summary: 'Organize your code with reusable functions, default arguments, return statements, and anonymous lambda expressions.',
        studyMaterial: {
          overview:
            'Functions allow you to break complex programs into small, modular, and testable units. In Python, functions are first-class citizens, meaning they can be passed as arguments and returned from other functions.',
          keyPoints: [
            'def function_name(param1, param2=default):',
            'return value passes result back to caller.',
            'Lambda: add = lambda a, b: a + b',
            'Docstrings: """Description of function"""',
          ],
          codeExamples: [
            {
              title: 'Reusable Factorial Function',
              code: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint("5! =", factorial(5))`,
            },
          ],
          cheatsheet: [
            'Default arguments must follow non-default arguments.',
            'Local variables shadow global variables with the same name.',
          ],
          officialDocUrl: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions',
        },
        video: {
          title: 'Python Functions & Scope Deep Dive',
          instructor: 'Corey Schafer',
          youtubeId: 'YYXdXT2l-Gg',
          videoUrl: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
          duration: '30m',
          notes: 'How parameters, returns, and variable scopes work in Python.',
        },
        practiceQuestions: [
          {
            id: 'py-bg-q3',
            title: 'Is Palindrome String Function',
            difficulty: 'Easy',
            description:
              'Write a function that checks if "racecar" is a palindrome and prints "racecar is palindrome: True".',
            starterCode: `def is_palindrome(s):\n    return s == s[::-1]\n\nword = "racecar"\nprint(f"{word} is palindrome: {is_palindrome(word)}")`,
            expectedOutput: 'racecar is palindrome: True',
            hints: ['A palindrome reads the same backwards: s == s[::-1].'],
          },
        ],
        compilerStarterCode: `def greet(name, role="Student"):\n    return f"Hello {name}, your role is {role}!"\n\nprint(greet("Kavya", "Team Lead"))`,
      },
      {
        stepNumber: 4,
        title: 'Object-Oriented Python (Classes & Objects)',
        topic: 'class, __init__, self & Inheritance',
        estimatedTime: '2.5 Hours',
        summary: 'Learn object-oriented design in Python: self reference, dunder methods like __str__, encapsulation, and subclassing.',
        studyMaterial: {
          overview:
            'Classes encapsulate state (data) and behavior (methods). In Python, every instance method takes self as its first parameter to refer to the object instance.',
          keyPoints: [
            'class ClassName: defines a class.',
            '__init__(self, ...) initializes object attributes.',
            'self corresponds to this in Java and C++.',
            'Inheritance: class SubClass(ParentClass):',
          ],
          codeExamples: [
            {
              title: 'Car Class with Methods',
              code: `class Car:\n    def __init__(self, brand, model):\n        self.brand = brand\n        self.model = model\n    \n    def info(self):\n        return f"{self.brand} {self.model}"\n\nc = Car("Tesla", "Model S")\nprint("Vehicle:", c.info())`,
            },
          ],
          cheatsheet: [
            '__str__(self) provides readable string representation for print().',
            'isinstance(obj, ClassName) checks type membership.',
          ],
          officialDocUrl: 'https://docs.python.org/3/tutorial/classes.html',
        },
        video: {
          title: 'Python OOP Tutorial: Classes and Objects',
          instructor: 'Corey Schafer',
          youtubeId: 'YYXdXT2l-Gg',
          videoUrl: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
          duration: '40m',
          notes: 'Complete walk-through of Python class syntax, init, and methods.',
        },
        practiceQuestions: [
          {
            id: 'py-bg-q4',
            title: 'Rectangle Area Class',
            difficulty: 'Easy',
            description:
              'Create a Rectangle class with width=4 and height=7. Call area() method and print "Rectangle Area = 28".',
            starterCode: `class Rectangle:\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    \n    def area(self):\n        return self.w * self.h\n\nr = Rectangle(4, 7)\nprint(f"Rectangle Area = {r.area()}")`,
            expectedOutput: 'Rectangle Area = 28',
            hints: ['Return self.w * self.h from the area method.'],
          },
        ],
        compilerStarterCode: `class Developer:\n    def __init__(self, name, language):\n        self.name = name\n        self.language = language\n    \n    def code(self):\n        return f"{self.name} is building amazing features in {self.language}!"\n\ndev = Developer("Rohan", "Python")\nprint(dev.code())`,
      },
    ],
  },

  // ==========================================
  // WEB DEVELOPMENT - BEGINNER TRACK
  // ==========================================
  'web_dev-beginner': {
    id: 'web_dev-beginner',
    language: 'web_dev',
    track: 'beginner',
    title: 'Modern Web Development: HTML, CSS & JavaScript',
    tagline: 'Build Responsive Sites & Interactive Web Apps',
    icon: '🌐',
    color: 'text-violet-500 dark:text-violet-400',
    badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    borderColor: 'border-violet-400/40 hover:border-violet-400',
    description: 'Learn the foundational trio of the web: HTML5 structure, modern CSS3 styling, and JavaScript logic with instant Node.js / browser code execution.',
    compilerLanguage: 'javascript',
    compilerDisplayName: 'Node.js 20 (JavaScript)',
    stepsCount: 4,
    estimatedTotalHours: '9 Hours',
    prerequisites: ['No prior web development experience required'],
    outcomes: [
      'Build semantic HTML5 websites accessible across devices',
      'Design modern layouts using CSS Flexbox and Grid',
      'Master JavaScript ES6+ (let/const, arrow functions, promises, async/await)',
      'Interact with REST APIs and DOM elements dynamically',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'JavaScript ES6+ Fundamentals',
        topic: 'const/let, Arrow Functions & Template Literals',
        estimatedTime: '2 Hours',
        summary: 'Understand modern JavaScript syntax: block scoping, arrow functions, destructuring, and string template literals.',
        studyMaterial: {
          overview:
            'JavaScript is the scripting language of the web. Modern ES6+ introduced const/let for block scoping, template literals, and arrow functions that make JavaScript clean and expressive.',
          keyPoints: [
            'const for values that will not be reassigned; let for values that change.',
            'Arrow functions: const add = (a, b) => a + b;',
            'Template literals: `Hello ${name}` with backticks.',
            'Array helpers: map, filter, reduce.',
          ],
          codeExamples: [
            {
              title: 'Array Transformation in JS',
              code: `const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log("Doubled array:", doubled);`,
            },
          ],
          cheatsheet: [
            '=== checks both value and type (strict equality).',
            'JSON.stringify(obj) converts object to string.',
          ],
          officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        },
        video: {
          title: 'JavaScript Crash Course for Beginners',
          instructor: 'Traversy Media',
          youtubeId: 'hdI2bqOjy3c',
          videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
          duration: '1h 30m',
          notes: 'Everything from variables to functions and objects.',
        },
        practiceQuestions: [
          {
            id: 'js-bg-q1',
            title: 'Calculate Total Cart Price',
            difficulty: 'Easy',
            description:
              'Given prices [100, 250, 450], calculate the sum using reduce or a loop and print "Total Price = 800".',
            starterCode: `const prices = [100, 250, 450];\nconst total = prices.reduce((acc, curr) => acc + curr, 0);\nconsole.log(\`Total Price = \${total}\`);`,
            expectedOutput: 'Total Price = 800',
            hints: ['Use prices.reduce((acc, curr) => acc + curr, 0).'],
          },
        ],
        compilerStarterCode: `const developer = {\n  name: "Sneha",\n  stack: ["Next.js", "TypeScript", "Tailwind"],\n  isReady: true\n};\n\nconsole.log(\`Developer \${developer.name} works with: \${developer.stack.join(", ")}\`);`,
      },
      {
        stepNumber: 2,
        title: 'DOM Manipulation & Browser Events',
        topic: 'querySelector, Event Listeners & State',
        estimatedTime: '2 Hours',
        summary: 'Learn how JavaScript brings web pages to life by selecting HTML elements, attaching click listeners, and updating page content.',
        studyMaterial: {
          overview:
            'The Document Object Model (DOM) is an object-oriented representation of the web page. JavaScript can read and change DOM nodes dynamically.',
          keyPoints: [
            'document.querySelector(".btn") selects element by CSS selector.',
            'element.addEventListener("click", () => { ... }) responds to clicks.',
            'element.classList.toggle("active") toggles CSS classes.',
          ],
          codeExamples: [
            {
              title: 'Simulating Event Handler Logic in JS',
              code: `function handleButtonClick(count) {\n  return count + 1;\n}\nlet clicks = 0;\nclicks = handleButtonClick(clicks);\nconsole.log("Button clicked count:", clicks);`,
            },
          ],
          cheatsheet: [
            'textContent updates text safely without XSS vulnerability.',
            'innerHTML parses string as HTML.',
          ],
          officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model',
        },
        video: {
          title: 'JavaScript DOM Manipulation Full Tutorial',
          instructor: 'Traversy Media',
          youtubeId: 'hdI2bqOjy3c',
          videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
          duration: '45m',
          notes: 'Selecting elements, bubbling, and event delegation.',
        },
        practiceQuestions: [
          {
            id: 'js-bg-q2',
            title: 'Format User Status Badge',
            difficulty: 'Easy',
            description:
              'Given isOnline = true and username = "Aman", output "Aman: Online [Active]".',
            starterCode: `const isOnline = true;\nconst username = "Aman";\nconst status = isOnline ? "Online [Active]" : "Offline";\nconsole.log(\`\${username}: \${status}\`);`,
            expectedOutput: 'Aman: Online [Active]',
            hints: ['Use ternary operator ? :.'],
          },
        ],
        compilerStarterCode: `// Simulating DOM state changes\nconst state = { count: 0 };\nfunction increment() {\n  state.count += 1;\n  console.log("Current state count:", state.count);\n}\n\nincrement();\nincrement();`,
      },
      {
        stepNumber: 3,
        title: 'Asynchronous JavaScript & Fetch API',
        topic: 'Promises, async/await & REST APIs',
        estimatedTime: '2.5 Hours',
        summary: 'Master asynchronous code execution, callbacks, Promises, and the modern async/await syntax to talk to web servers and databases.',
        studyMaterial: {
          overview:
            'JavaScript runs in a single-threaded event loop. Non-blocking asynchronous operations (like network requests) are handled via Promises and async/await.',
          keyPoints: [
            'Promise states: pending, fulfilled, rejected.',
            'async function returns a Promise automatically.',
            'await pauses execution inside async function until Promise resolves.',
            'try/catch blocks handle API errors cleanly.',
          ],
          codeExamples: [
            {
              title: 'Async/Await Data Fetch Simulation',
              code: `async function fetchUserData() {\n  return new Promise(resolve => {\n    setTimeout(() => resolve({ id: 101, username: "dev_pro" }), 100);\n  });\n}\n\nasync function main() {\n  const user = await fetchUserData();\n  console.log("Loaded user:", user.username);\n}\nmain();`,
            },
          ],
          cheatsheet: [
            'Promise.all([...]) waits for multiple promises concurrently.',
            'Always wrap await in a try/catch block.',
          ],
          officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
        },
        video: {
          title: 'Async Await & Promises Explained',
          instructor: 'Traversy Media',
          youtubeId: 'hdI2bqOjy3c',
          videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
          duration: '40m',
          notes: 'Master the event loop and asynchronous control flow.',
        },
        practiceQuestions: [
          {
            id: 'js-bg-q3',
            title: 'Simulated API Status Checker',
            difficulty: 'Easy',
            description:
              'Simulate an async response object with statusCode = 200 and message = "Server Healthy". Print "Status: 200 - Server Healthy".',
            starterCode: `async function checkServer() {\n  const res = { statusCode: 200, message: "Server Healthy" };\n  console.log(\`Status: \${res.statusCode} - \${res.message}\`);\n}\ncheckServer();`,
            expectedOutput: 'Status: 200 - Server Healthy',
            hints: ['Call async function and format string.'],
          },
        ],
        compilerStarterCode: `async function demo() {\n  console.log("1. Starting async task...");\n  await new Promise(r => setTimeout(r, 100));\n  console.log("2. Data resolved successfully!");\n}\ndemo();`,
      },
      {
        stepNumber: 4,
        title: 'React & Component Architecture',
        topic: 'JSX, Props, useState & useEffect',
        estimatedTime: '2.5 Hours',
        summary: 'Bridge from vanilla JavaScript to modern React. Learn component trees, props for data passing, and useState for reactive interfaces.',
        studyMaterial: {
          overview:
            'React is the industry standard UI library. Components are JavaScript functions that return JSX (HTML-like syntax inside JS). When state changes, React re-renders only the changed UI parts.',
          keyPoints: [
            'Component: function Profile(props) { return <div>{props.name}</div>; }',
            'useState hook: const [count, setCount] = useState(0);',
            'useEffect hook: Handles side effects like fetching data or setting timers.',
          ],
          codeExamples: [
            {
              title: 'Pure Functional Component Logic',
              code: `function createBadge(user) {\n  return \`<span class="badge">\${user.name} (\${user.role})</span>\`;\n}\nconsole.log(createBadge({ name: "Riya", role: "Contributor" }));`,
            },
          ],
          cheatsheet: [
            'Never mutate state directly; always use the setter function.',
            'Keys in lists help React identify which items have changed.',
          ],
          officialDocUrl: 'https://react.dev/learn',
        },
        video: {
          title: 'React 18 Full Beginner Course',
          instructor: 'Dave Gray',
          youtubeId: 'RVFAyFWO4go',
          videoUrl: 'https://www.youtube.com/watch?v=RVFAyFWO4go',
          duration: '1h 15m',
          notes: 'Component mindset, state hooks, and project structure.',
        },
        practiceQuestions: [
          {
            id: 'js-bg-q4',
            title: 'Filter Active Tech Stack',
            difficulty: 'Easy',
            description:
              'Given array of skills ["HTML", "CSS", "React", "Next.js"], filter those with length >= 4 and print "Selected: [ \'HTML\', \'React\', \'Next.js\' ]".',
            starterCode: `const skills = ["HTML", "CSS", "React", "Next.js"];\nconst selected = skills.filter(s => s.length >= 4);\nconsole.log("Selected:", selected);`,
            expectedOutput: "Selected: [ 'HTML', 'React', 'Next.js' ]",
            hints: ['Use skills.filter(s => s.length >= 4).'],
          },
        ],
        compilerStarterCode: `// Pure JS simulation of React State reducer\nfunction stateReducer(state, action) {\n  switch (action.type) {\n    case 'INCREMENT': return { count: state.count + 1 };\n    case 'DECREMENT': return { count: state.count - 1 };\n    default: return state;\n  }\n}\n\nlet state = { count: 10 };\nstate = stateReducer(state, { type: 'INCREMENT' });\nconsole.log("Updated State:", state);`,
      },
    ],
  },

  // ==========================================
  // DSA - BEGINNER TRACK
  // ==========================================
  'dsa-beginner': {
    id: 'dsa-beginner',
    language: 'dsa',
    track: 'beginner',
    title: 'Data Structures & Algorithms Foundations',
    tagline: 'Crack Collegiate Coding Rounds & LeetCode',
    icon: '🧠',
    color: 'text-rose-500 dark:text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    borderColor: 'border-rose-400/40 hover:border-rose-400',
    description: 'Master time & space complexity, Two Pointers, Sliding Window, Recursion, Binary Search, and interview patterns with real code execution.',
    compilerLanguage: 'cpp',
    compilerDisplayName: 'GCC 13.2 (C++20)',
    stepsCount: 4,
    estimatedTotalHours: '10 Hours',
    prerequisites: ['Basic knowledge of loops and arrays in any language'],
    outcomes: [
      'Analyze Time and Space Complexity with Big-O notation',
      'Master Two-Pointers and Sliding Window patterns',
      'Implement Binary Search with correct boundary handling',
      'Solve Easy and Medium LeetCode problems with confidence',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Big-O Notation & Complexity Analysis',
        topic: 'Time & Space Complexity (O(1), O(N), O(N log N))',
        estimatedTime: '2 Hours',
        summary: 'Learn how software engineers evaluate algorithm efficiency before writing code: worst-case, best-case, and space complexity.',
        studyMaterial: {
          overview:
            'Big-O notation describes the limiting behavior of an algorithm as the input size N grows towards infinity. Knowing complexity helps you avoid TLE (Time Limit Exceeded) in online assessments.',
          keyPoints: [
            'O(1): Constant time (e.g. array index access).',
            'O(log N): Binary Search (halving search space each step).',
            'O(N): Linear scan through array.',
            'O(N log N): Merge sort, Quick sort, std::sort.',
            'O(N^2): Nested loops (avoid for N > 10^4!).',
          ],
          codeExamples: [
            {
              title: 'Linear vs Constant Time',
              code: `#include <iostream>\nusing namespace std;\n\n// O(1) time\nint getFirst(int arr[]) {\n    return arr[0];\n}\n\nint main() {\n    int data[] = {10, 20, 30};\n    cout << "First: " << getFirst(data) << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            '10^8 operations per second is standard rule of thumb for online judges.',
            'If N <= 10^5, aim for O(N) or O(N log N).',
          ],
          officialDocUrl: 'https://en.wikipedia.org/wiki/Big_O_notation',
        },
        video: {
          title: 'Complete Time and Space Complexity in 1 Shot',
          instructor: 'Striver',
          youtubeId: '0A87v7Z45p8',
          videoUrl: 'https://www.youtube.com/watch?v=0A87v7Z45p8',
          duration: '55m',
          notes: 'Every interviewer checks Big-O; master this lecture thoroughly.',
        },
        practiceQuestions: [
          {
            id: 'dsa-bg-q1',
            title: 'Identify Fastest Operation',
            difficulty: 'Easy',
            description:
              'Print the Big-O complexity of accessing an element in an array by index: "Array Index Access Complexity: O(1)".',
            starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Array Index Access Complexity: O(1)" << endl;\n    return 0;\n}`,
            expectedOutput: 'Array Index Access Complexity: O(1)',
            hints: ['Array indexing takes constant time O(1).'],
          },
        ],
        compilerStarterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Big-O Scale:" << endl;\n    cout << "O(1) < O(log N) < O(N) < O(N log N) < O(N^2)" << endl;\n    return 0;\n}`,
      },
      {
        stepNumber: 2,
        title: 'Two Pointers Pattern',
        topic: 'Opposite Ends & Same Direction Pointers',
        estimatedTime: '2.5 Hours',
        summary: 'Learn the two pointers technique to reduce O(N^2) brute force problems down to optimal O(N) linear time.',
        studyMaterial: {
          overview:
            'Two pointers is an algorithmic pattern where two indices traverse a data structure (typically a sorted array or string) simultaneously to find pairs or subarray solutions without nested loops.',
          keyPoints: [
            'Opposite ends: left = 0, right = n - 1 (e.g. Two Sum on sorted array).',
            'Same direction: fast and slow pointers (e.g. remove duplicates, detect cycle).',
            'Eliminates nested loops, dropping time from O(N^2) to O(N).',
          ],
          codeExamples: [
            {
              title: 'Two Sum on Sorted Array',
              code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nbool hasPairWithSum(vector<int>& arr, int target) {\n    int l = 0, r = arr.size() - 1;\n    while (l < r) {\n        int sum = arr[l] + arr[r];\n        if (sum == target) return true;\n        if (sum < target) l++;\n        else r--;\n    }\n    return false;\n}\n\nint main() {\n    vector<int> nums = {1, 3, 4, 8, 11};\n    cout << "Has pair sum 12? " << (hasPairWithSum(nums, 12) ? "Yes" : "No") << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            'Always verify if array is sorted before using opposite-ends two pointers.',
          ],
          officialDocUrl: 'https://leetcode.com/tag/two-pointers/',
        },
        video: {
          title: 'Two Pointers Technique with Practice Problems',
          instructor: 'Kunal Kushwaha',
          youtubeId: 'rZ41y93P2Qo',
          videoUrl: 'https://www.youtube.com/watch?v=rZ41y93P2Qo',
          duration: '1h 10m',
          notes: 'Detailed visualization of left and right pointer movement.',
        },
        practiceQuestions: [
          {
            id: 'dsa-bg-q2',
            title: 'Reverse Array In-Place with Two Pointers',
            difficulty: 'Easy',
            description:
              'Given array {10, 20, 30, 40}, reverse in-place using two pointers and print "Reversed: 40 30 20 10".',
            starterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> arr = {10, 20, 30, 40};\n    int l = 0, r = arr.size() - 1;\n    while (l < r) {\n        swap(arr[l], arr[r]);\n        l++;\n        r--;\n    }\n    cout << "Reversed: ";\n    for (int x : arr) cout << x << " ";\n    cout << endl;\n    return 0;\n}`,
            expectedOutput: 'Reversed: 40 30 20 10 \n',
            hints: ['Swap elements at left and right, then move pointers inward.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> a = {1, 2, 3, 4, 5};\n    cout << "Testing Two Pointers on array of size: " << a.size() << endl;\n    return 0;\n}`,
      },
      {
        stepNumber: 3,
        title: 'Binary Search Algorithm',
        topic: 'Divide & Conquer on Monotonic Functions',
        estimatedTime: '2.5 Hours',
        summary: 'Master the O(log N) search algorithm: calculating middle without overflow, finding lower/upper bounds, and binary search on answers.',
        studyMaterial: {
          overview:
            'Binary search works on any sorted array or monotonic search space. In each step, we check the middle element and cut the search space in half, achieving O(log N) efficiency.',
          keyPoints: [
            'Avoid overflow: mid = low + (high - low) / 2 instead of (low + high) / 2.',
            'While condition: while (low <= high)',
            'If target > arr[mid], low = mid + 1',
            'If target < arr[mid], high = mid - 1',
          ],
          codeExamples: [
            {
              title: 'Standard Binary Search in C++',
              code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& arr, int target) {\n    int low = 0, high = arr.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    vector<int> nums = {2, 5, 8, 12, 16, 23, 38, 56};\n    cout << "Found 23 at index: " << binarySearch(nums, 23) << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            'std::binary_search(v.begin(), v.end(), key) returns true/false in C++ STL.',
            'std::lower_bound returns iterator to first element >= key.',
          ],
          officialDocUrl: 'https://en.wikipedia.org/wiki/Binary_search_algorithm',
        },
        video: {
          title: 'Binary Search Interview Questions & Edge Cases',
          instructor: 'Kunal Kushwaha',
          youtubeId: 'rZ41y93P2Qo',
          videoUrl: 'https://www.youtube.com/watch?v=rZ41y93P2Qo',
          duration: '1h 25m',
          notes: 'Master binary search boundaries and search space deduction.',
        },
        practiceQuestions: [
          {
            id: 'dsa-bg-q3',
            title: 'Search in Sorted Array',
            difficulty: 'Easy',
            description:
              'Given sorted array {3, 7, 11, 15, 19, 23, 27}, use Binary Search to find index of 19 and print "Target 19 found at index: 4".',
            starterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> a = {3, 7, 11, 15, 19, 23, 27};\n    int target = 19;\n    int l = 0, h = a.size() - 1, idx = -1;\n    while (l <= h) {\n        int mid = l + (h - l) / 2;\n        if (a[mid] == target) { idx = mid; break; }\n        if (a[mid] < target) l = mid + 1;\n        else h = mid - 1;\n    }\n    cout << "Target 19 found at index: " << idx << endl;\n    return 0;\n}`,
            expectedOutput: 'Target 19 found at index: 4',
            hints: ['Binary search splits search space by half at each step.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> data = {1, 4, 9, 16, 25, 36, 49};\n    cout << "Ready to write custom Binary Search code!" << endl;\n    return 0;\n}`,
      },
      {
        stepNumber: 4,
        title: 'Recursion & Backtracking Starter',
        topic: 'Base Case, Recursive Tree & Call Stack',
        estimatedTime: '3 Hours',
        summary: 'Conquer the fear of recursion! Understand the call stack, how base cases prevent infinite loops, and visualize recurrence trees.',
        studyMaterial: {
          overview:
            'A recursive function calls itself to solve smaller subproblems of the same problem. Every recursive function requires a base case to stop execution and return values back up the call stack.',
          keyPoints: [
            'Base Case: Condition under which the function returns without calling itself.',
            'Recursive Step: Breaking down the problem and calling itself with smaller parameters.',
            'Call Stack: Each function call consumes stack memory. Deep recursion causes StackOverflow.',
          ],
          codeExamples: [
            {
              title: 'Recursive Power Function (x^n in O(log n))',
              code: `#include <iostream>\nusing namespace std;\n\nlong long power(long long x, int n) {\n    if (n == 0) return 1;\n    long long half = power(x, n / 2);\n    if (n % 2 == 0) return half * half;\n    return half * half * x;\n}\n\nint main() {\n    cout << "2^10 = " << power(2, 10) << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: [
            'Always write the base case FIRST before the recursive call.',
            'Visualize the tree of calls on paper before typing.',
          ],
          officialDocUrl: 'https://en.wikipedia.org/wiki/Recursion_(computer_science)',
        },
        video: {
          title: 'Recursion for Beginners Full Course',
          instructor: 'Striver',
          youtubeId: '0A87v7Z45p8',
          videoUrl: 'https://www.youtube.com/watch?v=0A87v7Z45p8',
          duration: '1h 15m',
          notes: 'Master base cases, recursion trees, and backtracking principles.',
        },
        practiceQuestions: [
          {
            id: 'dsa-bg-q4',
            title: 'Recursive Factorial',
            difficulty: 'Easy',
            description:
              'Write a recursive function to compute 6! and print "Factorial of 6 = 720".',
            starterCode: `#include <iostream>\nusing namespace std;\n\nint fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n - 1);\n}\n\nint main() {\n    cout << "Factorial of 6 = " << fact(6) << endl;\n    return 0;\n}`,
            expectedOutput: 'Factorial of 6 = 720',
            hints: ['Base case: if (n <= 1) return 1; Recursive: return n * fact(n - 1);'],
          },
        ],
        compilerStarterCode: `#include <iostream>\nusing namespace std;\n\nvoid print1ToN(int n) {\n    if (n == 0) return;\n    print1ToN(n - 1);\n    cout << n << " ";\n}\n\nint main() {\n    cout << "Counting 1 to 5 recursively: ";\n    print1ToN(5);\n    cout << endl;\n    return 0;\n}`,
      },
    ],
  },

  // ==========================================
  // JAVA - LEARNING TRACK (ADVANCED / UPSKILLING)
  // ==========================================
  'java-learning': {
    id: 'java-learning',
    language: 'java',
    track: 'learning',
    title: 'Java Enterprise & Spring Boot Masterclass',
    tagline: 'Collections, Concurrency & Microservices Architecture',
    icon: '☕',
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-400/40 hover:border-amber-400',
    description: 'For students who know basic syntax. Master Java Collections Framework, Streams API, multithreading, and Spring Boot 3 microservices with hands-on exercises.',
    compilerLanguage: 'java',
    compilerDisplayName: 'OpenJDK 21 (Java)',
    stepsCount: 3,
    estimatedTotalHours: '14 Hours',
    prerequisites: ['Basic Java syntax and loops', 'Foundational understanding of OOP'],
    outcomes: [
      'Master Collections: HashMap internal hashing, TreeMap, and PriorityQueue',
      'Write functional Java using Lambdas and the Streams API',
      'Build scalable backend REST APIs using Spring Boot 3 and JPA',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Collections Framework Deep Dive',
        topic: 'HashMap internals, HashSet, and Comparable/Comparator',
        estimatedTime: '3 Hours',
        summary: 'Understand how HashMap works under the hood: bucket arrays, hashcode collisions, equals contract, and custom sorting.',
        studyMaterial: {
          overview:
            'The Java Collections Framework (JCF) provides reusable data architecture. HashMap stores key-value pairs in buckets indexed by hashCode() % capacity, chaining collisions via linked lists and red-black trees.',
          keyPoints: [
            'HashMap: O(1) average lookup, not thread-safe.',
            'HashSet: Backed internally by a HashMap with dummy values.',
            'Comparable: Implements compareTo() for natural ordering.',
            'Comparator: Custom lambda comparator for multi-field sorting.',
          ],
          codeExamples: [
            {
              title: 'Custom Object Sorting with Comparator',
              code: `import java.util.*;\n\nclass Student {\n    String name;\n    int score;\n    Student(String n, int s) { this.name = n; this.score = s; }\n}\n\nclass Main {\n    public static void main(String[] args) {\n        List<Student> list = new ArrayList<>();\n        list.add(new Student("Alice", 92));\n        list.add(new Student("Bob", 85));\n        list.add(new Student("Charlie", 99));\n        \n        list.sort((a, b) -> b.score - a.score); // descending\n        for (Student s : list) System.out.println(s.name + ": " + s.score);\n    }\n}`,
            },
          ],
          cheatsheet: ['Always override hashCode() whenever you override equals().'],
          officialDocUrl: 'https://docs.oracle.com/javase/8/docs/technotes/guides/collections/overview.html',
        },
        video: {
          title: 'Java Collections Framework Complete Tutorial',
          instructor: 'Kunal Kushwaha',
          youtubeId: '9ogflbf_Uzg',
          videoUrl: 'https://www.youtube.com/watch?v=9ogflbf_Uzg',
          duration: '3h 10m',
          notes: 'Master interview questions on HashMap internals and ArrayList resizing.',
        },
        practiceQuestions: [
          {
            id: 'java-lr-q1',
            title: 'Top K Frequent Elements Simulation',
            difficulty: 'Medium',
            description:
              'Use HashMap to count frequencies of {1, 1, 1, 2, 2, 3} and print "Most frequent: 1 (count 3)".',
            starterCode: `import java.util.*;\n\nclass Main {\n    public static void main(String[] args) {\n        int[] nums = {1, 1, 1, 2, 2, 3};\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int n : nums) map.put(n, map.getOrDefault(n, 0) + 1);\n        System.out.println("Most frequent: 1 (count " + map.get(1) + ")");\n    }\n}`,
            expectedOutput: 'Most frequent: 1 (count 3)',
            hints: ['Use map.getOrDefault(n, 0) + 1.'],
          },
        ],
        compilerStarterCode: `import java.util.*;\n\nclass Main {\n    public static void main(String[] args) {\n        Map<String, Integer> map = new HashMap<>();\n        map.put("Java", 21);\n        map.put("Spring", 3);\n        System.out.println("Tech stack: " + map);\n    }\n}`,
      },
      {
        stepNumber: 2,
        title: 'Java Streams API & Functional Programming',
        topic: 'filter, map, reduce & Collectors',
        estimatedTime: '3 Hours',
        summary: 'Transition from imperative loops to declarative functional streams for parallel data processing and clean production code.',
        studyMaterial: {
          overview:
            'Introduced in Java 8, Streams allow developers to perform operations like filtering, mapping, and aggregating on collections in a declarative manner.',
          keyPoints: [
            'Intermediate operations (lazy): filter(), map(), sorted().',
            'Terminal operations (eager): collect(), forEach(), reduce().',
            'Parallel streams: .parallelStream() leverages multi-core CPUs.',
          ],
          codeExamples: [
            {
              title: 'Streams Filter & Collect',
              code: `import java.util.*;\nimport java.util.stream.Collectors;\n\nclass Main {\n    public static void main(String[] args) {\n        List<String> names = Arrays.asList("Spring", "Java", "Docker", "Kubernetes");\n        List<String> filtered = names.stream()\n            .filter(s -> s.length() > 4)\n            .map(String::toUpperCase)\n            .collect(Collectors.toList());\n        System.out.println("Filtered: " + filtered);\n    }\n}`,
            },
          ],
          cheatsheet: ['Streams cannot be reused once a terminal operation has been executed.'],
          officialDocUrl: 'https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html',
        },
        video: {
          title: 'Java Streams Full Course',
          instructor: 'Amigoscode',
          youtubeId: '9SGDpanrc8U',
          videoUrl: 'https://www.youtube.com/watch?v=9SGDpanrc8U',
          duration: '1h 45m',
          notes: 'Master collectors, groupingBy, and parallel streams.',
        },
        practiceQuestions: [
          {
            id: 'java-lr-q2',
            title: 'Sum of Even Squares with Streams',
            difficulty: 'Medium',
            description:
              'Given numbers 1 to 5, calculate sum of squares of only even numbers (2^2 + 4^2 = 4 + 16 = 20) and print "Sum = 20".',
            starterCode: `import java.util.*;\n\nclass Main {\n    public static void main(String[] args) {\n        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);\n        int sum = list.stream()\n            .filter(n -> n % 2 == 0)\n            .mapToInt(n -> n * n)\n            .sum();\n        System.out.println("Sum = " + sum);\n    }\n}`,
            expectedOutput: 'Sum = 20',
            hints: ['Filter for even numbers, map to n * n, and call .sum().'],
          },
        ],
        compilerStarterCode: `import java.util.*;\nimport java.util.stream.*;\n\nclass Main {\n    public static void main(String[] args) {\n        IntStream.rangeClosed(1, 5).forEach(i -> System.out.println("Stream step: " + i));\n    }\n}`,
      },
      {
        stepNumber: 3,
        title: 'Spring Boot 3 RESTful Microservices',
        topic: 'Controllers, Services, Repositories & DTOs',
        estimatedTime: '4 Hours',
        summary: 'Architect production-ready microservices with Spring Boot 3, Spring Data JPA, PostgreSQL, and token-based security.',
        studyMaterial: {
          overview:
            'Spring Boot eliminates boilerplate configuration and provides an enterprise-ready foundation for Java backend systems.',
          keyPoints: [
            '@RestController: Combines @Controller and @ResponseBody.',
            '@GetMapping, @PostMapping: Route incoming HTTP requests.',
            '@Service: Encapsulates business logic.',
            '@Repository: Interfaces with database via Spring Data JPA.',
          ],
          codeExamples: [
            {
              title: 'Spring Boot Controller Architecture (Pattern)',
              code: `// Enterprise Controller Structure Pattern\nclass UserDto {\n    String email;\n    String role;\n    UserDto(String e, String r) { this.email = e; this.role = r; }\n}\n\nclass Main {\n    public static void main(String[] args) {\n        UserDto user = new UserDto("admin@linkora.edu", "STUDENT_ADMIN");\n        System.out.println("Simulated Endpoint 200 OK: " + user.email + " [" + user.role + "]");\n    }\n}`,
            },
          ],
          cheatsheet: ['Follow Clean Architecture: Controller -> Service -> Repository.'],
          officialDocUrl: 'https://spring.io/projects/spring-boot',
        },
        video: {
          title: 'Spring Boot 3 Full Course',
          instructor: 'Amigoscode',
          youtubeId: '9SGDpanrc8U',
          videoUrl: 'https://www.youtube.com/watch?v=9SGDpanrc8U',
          duration: '5h 45m',
          notes: 'Build a complete production-ready REST API from scratch.',
        },
        practiceQuestions: [
          {
            id: 'java-lr-q3',
            title: 'Simulate Microservice Response JSON',
            difficulty: 'Medium',
            description:
              'Simulate a microservice HTTP 200 payload: "status: 200, service: linkora-auth, health: UP".',
            starterCode: `class Main {\n    public static void main(String[] args) {\n        System.out.println("status: 200, service: linkora-auth, health: UP");\n    }\n}`,
            expectedOutput: 'status: 200, service: linkora-auth, health: UP',
            hints: ['Format exact output string.'],
          },
        ],
        compilerStarterCode: `class Main {\n    public static void main(String[] args) {\n        System.out.println("☕ Spring Boot 3 microservice environment initialized!");\n    }\n}`,
      },
    ],
  },

  // ==========================================
  // C++ - LEARNING TRACK (ADVANCED / CP)
  // ==========================================
  'cpp-learning': {
    id: 'cpp-learning',
    language: 'cpp',
    track: 'learning',
    title: 'Advanced C++ & Competitive Programming',
    tagline: 'Dynamic Programming, Graph Theory & Segment Trees',
    icon: '⚡',
    color: 'text-cyan-500 dark:text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    borderColor: 'border-cyan-400/40 hover:border-cyan-400',
    description: 'Elevate your contest ratings in Codeforces, LeetCode Hard, and ICPC. Master graph traversals, Dijkstra, bitmasking, and dynamic programming.',
    compilerLanguage: 'cpp',
    compilerDisplayName: 'GCC 13.2 (C++20)',
    stepsCount: 3,
    estimatedTotalHours: '12 Hours',
    prerequisites: ['Basic C++ syntax and STL vectors/sets'],
    outcomes: [
      'Implement BFS, DFS, and Dijkstra on weighted graphs',
      'Solve 1D and 2D Dynamic Programming with memoization and tabulation',
      'Optimize contest execution with bitwise operations and fast math',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Graph Traversals: BFS & DFS',
        topic: 'Adjacency Lists, Queue & Recursion',
        estimatedTime: '3.5 Hours',
        summary: 'Represent graphs with adjacency lists and traverse them using Breadth-First Search (shortest path) and Depth-First Search (connected components).',
        studyMaterial: {
          overview:
            'Graphs model networks, road systems, and state machines. An adjacency list vector<int> adj[N] stores neighbor nodes with O(V + E) memory.',
          keyPoints: [
            'BFS uses a std::queue to explore neighbors layer-by-layer (unweighted shortest path).',
            'DFS uses recursion or a stack to explore as deep as possible.',
            'Visited array: bool vis[N] prevents infinite cycles.',
          ],
          codeExamples: [
            {
              title: 'BFS Traversal in C++',
              code: `#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nvoid bfs(int start, const vector<vector<int>>& adj) {\n    vector<bool> vis(adj.size(), false);\n    queue<int> q;\n    q.push(start);\n    vis[start] = true;\n    \n    cout << "BFS order: ";\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        cout << u << " ";\n        for (int v : adj[u]) {\n            if (!vis[v]) {\n                vis[v] = true;\n                q.push(v);\n            }\n        }\n    }\n    cout << endl;\n}\n\nint main() {\n    vector<vector<int>> adj = {{1, 2}, {0, 3}, {0}, {1}};\n    bfs(0, adj);\n    return 0;\n}`,
            },
          ],
          cheatsheet: ['Time complexity of BFS/DFS is O(V + E).'],
          officialDocUrl: 'https://en.wikipedia.org/wiki/Breadth-first_search',
        },
        video: {
          title: 'Graph Series: BFS & DFS Complete Tutorial',
          instructor: 'Striver',
          youtubeId: '0A87v7Z45p8',
          videoUrl: 'https://www.youtube.com/watch?v=0A87v7Z45p8',
          duration: '1h 30m',
          notes: 'Master adjacency representations and cycle detection in directed/undirected graphs.',
        },
        practiceQuestions: [
          {
            id: 'cpp-lr-q1',
            title: 'Count Connected Components',
            difficulty: 'Medium',
            description:
              'Given a graph with 4 vertices and 1 edge between (0, 1), compute the number of connected components and print "Components: 3".',
            starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Components: 3" << endl;\n    return 0;\n}`,
            expectedOutput: 'Components: 3',
            hints: ['Vertices 0-1 form 1 component; vertex 2 and 3 are isolated.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    cout << "Graph traversal sandbox active!" << endl;\n    return 0;\n}`,
      },
      {
        stepNumber: 2,
        title: 'Dynamic Programming: 1D & 2D Grid DP',
        topic: 'Memoization, Tabulation & Space Optimization',
        estimatedTime: '4 Hours',
        summary: 'Demystify Dynamic Programming: identifying overlapping subproblems, optimal substructure, and converting recursion into fast iterative tabulation.',
        studyMaterial: {
          overview:
            'Dynamic Programming is an optimization technique that solves each subproblem once and stores its result in a lookup table to avoid redundant exponential recalculation.',
          keyPoints: [
            'Top-Down: Recursion + Memoization table.',
            'Bottom-Up: Iterative array tabulation.',
            'Space optimization: Keeping only previous state rows.',
          ],
          codeExamples: [
            {
              title: 'Climbing Stairs DP (Tabulation)',
              code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint climbStairs(int n) {\n    if (n <= 2) return n;\n    int prev2 = 1, prev = 2;\n    for (int i = 3; i <= n; i++) {\n        int curr = prev + prev2;\n        prev2 = prev;\n        prev = curr;\n    }\n    return prev;\n}\n\nint main() {\n    cout << "Ways to climb 5 stairs: " << climbStairs(5) << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: ['Always define dp[i] state clearly before writing recurrence.'],
          officialDocUrl: 'https://en.wikipedia.org/wiki/Dynamic_programming',
        },
        video: {
          title: 'Dynamic Programming Complete Course',
          instructor: 'Striver',
          youtubeId: '0A87v7Z45p8',
          videoUrl: 'https://www.youtube.com/watch?v=0A87v7Z45p8',
          duration: '2h 00m',
          notes: 'From 1D DP to Knapsack and Longest Common Subsequence.',
        },
        practiceQuestions: [
          {
            id: 'cpp-lr-q2',
            title: '0/1 Knapsack Value Calculation',
            difficulty: 'Medium',
            description:
              'Given capacity = 4, weights {1, 2, 3}, and values {10, 15, 40}, compute max value and print "Max Knapsack Value = 55".',
            starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Max Knapsack Value = 55" << endl;\n    return 0;\n}`,
            expectedOutput: 'Max Knapsack Value = 55',
            hints: ['Take items with weights 1 (val 10) and 3 (val 40) or 1+2.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "⚡ Ready to test Dynamic Programming algorithms!" << endl;\n    return 0;\n}`,
      },
      {
        stepNumber: 3,
        title: 'Dijkstra & Shortest Path Algorithms',
        topic: 'Priority Queue (Min-Heap) & Edge Relaxation',
        estimatedTime: '3 Hours',
        summary: 'Find the shortest path in non-negative weighted graphs using Dijkstra with std::priority_queue.',
        studyMaterial: {
          overview:
            'Dijkstra algorithm finds the shortest path from a starting vertex to all other vertices in O((V + E) log V) using a min-heap.',
          keyPoints: [
            'priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> minHeap;',
            'Relaxation: if (dist[u] + weight < dist[v]) { dist[v] = dist[u] + weight; }',
          ],
          codeExamples: [
            {
              title: 'Min-Heap Priority Queue Syntax',
              code: `#include <iostream>\n#include <queue>\nusing namespace std;\n\nint main() {\n    priority_queue<int, vector<int>, greater<int>> minH;\n    minH.push(30); minH.push(10); minH.push(20);\n    cout << "Top element in min-heap: " << minH.top() << endl;\n    return 0;\n}`,
            },
          ],
          cheatsheet: ['Dijkstra does not work with negative edge weights; use Bellman-Ford instead.'],
          officialDocUrl: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm',
        },
        video: {
          title: 'Dijkstra Algorithm in C++ with Min-Heap',
          instructor: 'Striver',
          youtubeId: '0A87v7Z45p8',
          videoUrl: 'https://www.youtube.com/watch?v=0A87v7Z45p8',
          duration: '1h 15m',
          notes: 'Master edge relaxation and priority queue implementation.',
        },
        practiceQuestions: [
          {
            id: 'cpp-lr-q3',
            title: 'Verify Dijkstra Pre-requisites',
            difficulty: 'Easy',
            description:
              'Print the requirement for edge weights in Dijkstra: "Dijkstra Requirement: Non-negative edge weights".',
            starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Dijkstra Requirement: Non-negative edge weights" << endl;\n    return 0;\n}`,
            expectedOutput: 'Dijkstra Requirement: Non-negative edge weights',
            hints: ['Print the exact requirement string.'],
          },
        ],
        compilerStarterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Dijkstra shortest path algorithm simulator ready." << endl;\n    return 0;\n}`,
      },
    ],
  },
};
