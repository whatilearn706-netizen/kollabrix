import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const JAVA_PRO_SPEC: TrackSpec = {
  id: 'java-learning',
  language: 'java',
  track: 'learning',
  title: 'Java Core & Pro Systems Track',
  tagline: 'Exceptions, Generics, Collections, Streams, Concurrency, Patterns & Spring Architecture',
  icon: '☕',
  color: 'text-amber-500 dark:text-amber-400',
  badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  borderColor: 'border-amber-400/30 hover:border-amber-400/70',
  description:
    'Production-grade Java mastery covering Collections & Heaps, Lambdas/Streams, Concurrency & Virtual Threads, JVM Design Patterns, and clean Spring Boot API engineering with 70 problems.',
  compilerLanguage: 'java',
  compilerDisplayName: 'Java (OpenJDK)',
  estimatedTotalHours: '26 Hours',
  prerequisites: ['Completion of Java Beginner Track or basic OOP knowledge'],
  outcomes: [
    'Use HashMap, ArrayDeque, TreeMap & PriorityQueue fluently in O(1)/O(log N)',
    'Write concise Stream pipelines, Comparators, and custom Generics',
    'Architect thread-safe services & Virtual Thread executors',
    'Apply Factory, Strategy, LRU Cache, Rate Limiter, and Spring service patterns',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Exceptions, Try-With-Resources & Guards',
      topic: 'Checked vs Unchecked & Fault Safety',
      estimatedTime: '2.5 Hours',
      summary:
        'Build fault-tolerant Java code using domain custom exceptions, `AutoCloseable` resource cleanup, and clean validation guards.',
      studyMaterial: {
        overview:
          'Production Java backends fail safely by catching specific exception classes, never swallowing stack traces, and deterministically closing streams with try-with-resources.',
        keyPoints: [
          '`try (var res = new MyResource())` auto-invokes `close()` even if an exception is thrown.',
          'Checked exceptions (`IOException`) require declaration or catch; unchecked (`RuntimeException`) signal programming or domain validation errors.',
          'Use `Objects.requireNonNull(arg, "message")` to fail fast at API boundaries.',
          'Catch specific exception subclasses before general `Exception` blocks.',
        ],
        codeExamples: [
          {
            title: 'AutoCloseable Lifecycle Trace',
            code: `class Conn implements AutoCloseable {
    public void query() { System.out.print("QUERY "); }
    public void close() { System.out.print("CLOSED"); }
}
public class Main {
    public static void main(String[] args) {
        try (var c = new Conn()) { c.query(); }
    }
}`,
            explanation: '`close()` executes automatically upon exiting the `try` scope.',
          },
        ],
        cheatsheet: [
          'try (Resource r = ...) -> guaranteed close()',
          'throw new IllegalArgumentException("...")',
          'finally runs whether exception happened or not',
        ],
        officialDocUrl: 'https://docs.oracle.com/javase/tutorial/essential/exceptions/',
      },
      video: yt(
        'Exception Handling in Java Tutorial',
        'Coding with John',
        '1XAfapkBQjk',
        '14m',
        'Crystal-clear breakdown of checked vs unchecked exceptions, finally, and best practices.',
      ),
      compilerStarterCode: `class Pool implements AutoCloseable {
    public void use() { System.out.print("USE->"); }
    public void close() { System.out.print("FREE"); }
}
public class Main {
    public static void main(String[] args) {
        try (var p = new Pool()) { p.use(); }
    }
}`,
      practiceQuestions: [
        {
          id: 'jp-1-1',
          title: 'Safe Integer List Parser',
          difficulty: 'Easy',
          description: 'Parse {"42", "abc", "18"} ignoring malformed entries and print valid sum: 60',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String[] raw = {"42", "abc", "18"};
        // TODO: Catch NumberFormatException per item and print sum
    }
}`,
          expectedOutput: '60',
          hints: ['Wrap Integer.parseInt(s) inside try/catch(NumberFormatException ignored).'],
        },
        {
          id: 'jp-1-2',
          title: 'Custom Domain Exception',
          difficulty: 'Easy',
          description: 'Throw `QuotaExceededException` when requested=15 > limit=10 and print caught message: QUOTA_LIMIT_10',
          starterCode: `class QuotaExceededException extends Exception {
    QuotaExceededException(String msg) { super(msg); }
}
public class Main {
    public static void main(String[] args) {
        // TODO: Call check(15, 10) and print caught message
    }
}`,
          expectedOutput: 'QUOTA_LIMIT_10',
          hints: ['Throw new QuotaExceededException("QUOTA_LIMIT_" + limit) and print e.getMessage().'],
        },
        {
          id: 'jp-1-3',
          title: 'AutoCloseable Order Guarantee',
          difficulty: 'Easy',
          description: 'Simulate opening DB then Cache in a single try-with-resources; close runs LIFO! Print: WORK CLOSE_CACHE CLOSE_DB',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Use two AutoCloseable objects in try(...) to emit WORK CLOSE_CACHE CLOSE_DB
    }
}`,
          expectedOutput: 'WORK CLOSE_CACHE CLOSE_DB',
          hints: ['Resources declared first close last (LIFO order).'],
        },
        {
          id: 'jp-1-4',
          title: 'Finally Override Return Check',
          difficulty: 'Medium',
          description: 'Log step order inside try/catch/finally when divide-by-zero happens: CATCH FINALLY',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Divide 10/0 inside try, catch ArithmeticException, run finally
    }
}`,
          expectedOutput: 'CATCH FINALLY',
          hints: ['Print "CATCH " in catch block and "FINALLY" in finally block.'],
        },
        {
          id: 'jp-1-5',
          title: 'Fail-Fast Null Guard',
          difficulty: 'Easy',
          description: 'Validate null username with `Objects.requireNonNull` and print error message: USER_REQUIRED',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String user = null;
        // TODO: Catch NullPointerException from Objects.requireNonNull(user, "USER_REQUIRED")
    }
}`,
          expectedOutput: 'USER_REQUIRED',
          hints: ['Objects.requireNonNull(user, "USER_REQUIRED") throws NPE with that exact message.'],
        },
        {
          id: 'jp-1-6',
          title: 'Multi-Catch Handler',
          difficulty: 'Easy',
          description: 'Handle `ArrayIndexOutOfBoundsException | NumberFormatException` cleanly and print: INVALID_INPUT',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String[] data = {"10"};
        try {
            System.out.println(Integer.parseInt(data[2]));
        } catch (ArrayIndexOutOfBoundsException | NumberFormatException e) {
            // TODO
        }
    }
}`,
          expectedOutput: 'INVALID_INPUT',
          hints: ['Just print "INVALID_INPUT" inside the multi-catch block.'],
        },
        {
          id: 'jp-1-7',
          title: 'Suppressed Exception Inspection',
          difficulty: 'Hard',
          description: 'Throw primary `"MAIN_ERR"` inside try whose AutoCloseable throws `"CLOSE_ERR"`; print `MAIN_ERR+CLOSE_ERR`.',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Use e.getMessage() and e.getSuppressed()[0].getMessage()
    }
}`,
          expectedOutput: 'MAIN_ERR+CLOSE_ERR',
          hints: ['When try throws and close() also throws, close() error is attached via getSuppressed().'],
        },
        {
          id: 'jp-1-8',
          title: 'Bounded Retry Loop With Exception Recovery',
          difficulty: 'Medium',
          description: 'Simulate an operation failing twice then succeeding on attempt 3. Print: OK_AT_3',
          starterCode: `public class Main {
    static int attempt = 0;
    static String unstableCall() {
        attempt++;
        if (attempt < 3) throw new IllegalStateException("TRANSIENT");
        return "OK_AT_" + attempt;
    }
    public static void main(String[] args) {
        // TODO: Retry up to 3 times and print result
    }
}`,
          expectedOutput: 'OK_AT_3',
          hints: ['Loop 3 times catching IllegalStateException and print result on success.'],
        },
        {
          id: 'jp-1-9',
          title: 'Exception Chaining Cause Preservation',
          difficulty: 'Medium',
          description: 'Wrap an `IllegalArgumentException("BAD_PORT")` inside `RuntimeException("BOOT_FAIL", cause)` and print `cause.getMessage()`: BAD_PORT',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Throw chained RuntimeException, catch, print e.getCause().getMessage()
    }
}`,
          expectedOutput: 'BAD_PORT',
          hints: ['Use `new RuntimeException("BOOT_FAIL", new IllegalArgumentException("BAD_PORT"))`.'],
        },
        {
          id: 'jp-1-10',
          title: 'Safe Withdrawal Validator Service',
          difficulty: 'Easy',
          description: 'Reject negative withdrawal (-50) before balance check and print: NEGATIVE_AMOUNT',
          starterCode: `public class Main {
    static void withdraw(int amt) {
        // TODO
    }
    public static void main(String[] args) {
        try { withdraw(-50); } catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}`,
          expectedOutput: 'NEGATIVE_AMOUNT',
          hints: ['If amt <= 0 throw new IllegalArgumentException("NEGATIVE_AMOUNT").'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'Generics, HashMap & HashSet',
      topic: 'O(1) Lookups & Type-Safe Containers',
      estimatedTime: '3.5 Hours',
      summary:
        'Master generic bounds, HashMap frequency & complement patterns (`computeIfAbsent`, `merge`), and HashSet sliding/deduplication tricks.',
      studyMaterial: {
        overview:
          'Over 40% of technical interview questions collapse from O(N²) to O(N) once you store seen indices or frequencies in a `HashMap` or `HashSet`.',
        keyPoints: [
          '`map.merge(key, 1, Integer::sum)` cleanly increments frequencies in one line.',
          '`map.computeIfAbsent(k, x -> new ArrayList<>()).add(v)` eliminates null-list boilerplate when grouping.',
          'Bounded generics `<T extends Comparable<T>>` enforce compile-time safety without type-casting.',
          'Never mutate a HashMap key’s `hashCode()` fields after inserting it!',
        ],
        codeExamples: [
          {
            title: 'O(N) Group Anagrams With computeIfAbsent',
            code: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String[] words = {"eat","tea","tan","ate","nat","bat"};
        Map<String, List<String>> map = new LinkedHashMap<>();
        for (String w : words) {
            char[] ch = w.toCharArray();
            Arrays.sort(ch);
            map.computeIfAbsent(new String(ch), k -> new ArrayList<>()).add(w);
        }
        System.out.println(map.size());
    }
}`,
            explanation: 'Produces 3 grouped anagram buckets cleanly in O(N * K log K).',
          },
        ],
        cheatsheet: [
          'map.getOrDefault(k, 0) + 1',
          'map.merge(k, 1, Integer::sum)',
          'map.computeIfAbsent(k, _ -> new ArrayList<>())',
          'Set.of / Map.of -> unmodifiable collections',
        ],
        officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html',
      },
      video: yt(
        'Java Collections Framework Full Course',
        'Java Guides',
        'GdAon80-0KA',
        '3h 15m',
        'Deep dive into ArrayList internals, HashSet hashing, and HashMap bucket resizing.',
      ),
      compilerStarterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                System.out.println(seen.get(need) + " " + i);
                return;
            }
            seen.put(nums[i], i);
        }
    }
}`,
      practiceQuestions: [
        {
          id: 'jp-2-1',
          title: 'Two Sum O(N) Indices',
          difficulty: 'Easy',
          description: 'Find indices adding to target=18 in {4, 7, 11, 15} using HashMap -> 1 2',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {4, 7, 11, 15}; int target = 18;
        // TODO: Print indices separated by space
    }
}`,
          expectedOutput: '1 2',
          hints: ['Check seen.containsKey(target - a[i]) before inserting a[i].'],
        },
        {
          id: 'jp-2-2',
          title: 'Subarray Sum Equals K Counter',
          difficulty: 'Medium',
          description: 'Count subarrays summing to k=3 in {1, 2, 1, 2, 1} using prefix-sum HashMap -> 4',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 1, 2, 1}; int k = 3;
        // TODO: Print subarray count summing to k
    }
}`,
          expectedOutput: '4',
          hints: ['Seed map with `prefFreq.put(0, 1)`, add `prefFreq.getOrDefault(sum - k, 0)`.'],
        },
        {
          id: 'jp-2-3',
          title: 'Longest Consecutive Sequence',
          difficulty: 'Medium',
          description: 'Find length of longest consecutive run in {100, 4, 200, 1, 3, 2} in O(N) via HashSet -> 4',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {100, 4, 200, 1, 3, 2};
        // TODO: Start sequence count only when !set.contains(x - 1)
    }
}`,
          expectedOutput: '4',
          hints: ['Put all elements in HashSet; start counting upward only at sequence starts (x-1 missing).'],
        },
        {
          id: 'jp-2-4',
          title: 'Generic Bounded Max Helper',
          difficulty: 'Easy',
          description: 'Write generic `<T extends Comparable<T>> T maxOf(T a, T b)` and print results for (12, 99) and ("go", "rust"): 99 rust',
          starterCode: `public class Main {
    // TODO: Generic static method maxOf
    public static void main(String[] args) {
        // TODO
    }
}`,
          expectedOutput: '99 rust',
          hints: ['Return a.compareTo(b) >= 0 ? a : b;'],
        },
        {
          id: 'jp-2-5',
          title: 'Word Pattern Bijection',
          difficulty: 'Medium',
          description: 'Check pattern "abba" vs "dog cat cat dog" AND "abba" vs "dog dog dog dog" -> true false',
          starterCode: `import java.util.*;
public class Main {
    static boolean matches(String pat, String s) {
        // TODO: Ensure 1-to-1 bijection between char and word
        return false;
    }
    public static void main(String[] args) {
        System.out.println(matches("abba", "dog cat cat dog") + " " + matches("abba", "dog dog dog dog"));
    }
}`,
          expectedOutput: 'true false',
          hints: ['Maintain both char->word and word->char maps (or check index positions).'],
        },
        {
          id: 'jp-2-6',
          title: 'Group Strings by Length Preserve Order',
          difficulty: 'Easy',
          description: 'Group {"a","bb","ccc","dd"} by length using LinkedHashMap; print bucket for length 2: [bb, dd]',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String[] w = {"a","bb","ccc","dd"};
        // TODO: Use computeIfAbsent and print map.get(2)
    }
}`,
          expectedOutput: '[bb, dd]',
          hints: ['map.computeIfAbsent(s.length(), _k -> new ArrayList<>()).add(s);'],
        },
        {
          id: 'jp-2-7',
          title: 'Array Intersection Unique Sorted',
          difficulty: 'Easy',
          description: 'Find unique sorted intersection of {4, 9, 5} and {9, 4, 9, 8, 4} -> 4 9',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {4,9,5}, b = {9,4,9,8,4};
        // TODO: Use Set and TreeSet / sort to print 4 9
    }
}`,
          expectedOutput: '4 9',
          hints: ['Store `a` in HashSet, filter `b` into TreeSet for sorted uniqueness.'],
        },
        {
          id: 'jp-2-8',
          title: 'Longest Substring Without Repeating Chars',
          difficulty: 'Medium',
          description: 'Find length of longest substring without duplicates in "abcabcbb" -> 3',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String s = "abcabcbb";
        // TODO: Sliding window with last-seen index HashMap or int[128]
    }
}`,
          expectedOutput: '3',
          hints: ['Move left pointer to `Math.max(left, lastSeen[c] + 1)` cleanly.'],
        },
        {
          id: 'jp-2-9',
          title: 'Generic Pair Swap Container',
          difficulty: 'Easy',
          description: 'Create `record Pair<A,B>(A first, B second)` with `.swap()` returning `Pair<B,A>` and print swapped ("KA", 21): (21, KA)',
          starterCode: `public class Main {
    // TODO: Generic Pair with swap()
    public static void main(String[] args) {
        // TODO
    }
}`,
          expectedOutput: '(21, KA)',
          hints: ['public Pair<B, A> swap() { return new Pair<>(second, first); }'],
        },
        {
          id: 'jp-2-10',
          title: 'Most Frequent Element (Tie-Break Smallest)',
          difficulty: 'Medium',
          description: 'In {5, 3, 5, 2, 3, 2, 3}, find highest-frequency number -> 3',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {5, 3, 5, 2, 3, 2, 3};
        // TODO: Build frequency map and pick winner
    }
}`,
          expectedOutput: '3',
          hints: ['Track bestFreq and bestVal, updating on higher freq or tie with smaller key.'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Heaps, ArrayDeque & Comparators',
      topic: 'PriorityQueue, Monotonic Stack & TreeMap',
      estimatedTime: '3.5 Hours',
      summary:
        'Master O(log N) priority queues, fast O(1) double-ended `ArrayDeque` queues/stacks, `TreeMap` ordered queries, and overflow-safe Comparators.',
      studyMaterial: {
        overview:
          'Modern Java replaces legacy `Stack` and `LinkedList` with `ArrayDeque` (faster cache locality, zero synchronization overhead). Combine `PriorityQueue` with custom lambdas for Top-K, Dijkstra, and interval scheduling.',
        keyPoints: [
          'ALWAYS write `(a, b) -> Integer.compare(a, b)` in Comparators—never `a - b`, which overflows on negative/extreme values!',
          'For Max-Heap, pass `Comparator.reverseOrder()`.',
          '`ArrayDeque` implements both `Deque` (`push`/`pop` stack) and `Queue` (`offer`/`poll` BFS queue).',
          '`TreeMap.ceilingKey(x)` and `floorKey(x)` answer ordered binary-search queries in O(log N).',
        ],
        codeExamples: [
          {
            title: 'Top-K Largest Using Min-Heap',
            code: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {3, 2, 1, 5, 6, 4};
        int k = 2;
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : a) {
            pq.offer(x);
            if (pq.size() > k) pq.poll();
        }
        System.out.println(pq.peek());
    }
}`,
            explanation: 'Maintains heap of size K so memory is O(K) instead of O(N log N) full sort.',
          },
        ],
        cheatsheet: [
          'Deque<Integer> dq = new ArrayDeque<>();',
          'PriorityQueue<Integer> maxH = new PriorityQueue<>(Comparator.reverseOrder());',
          'TreeMap<Integer, Integer> tm -> ceilingKey / floorKey in O(log N)',
        ],
        officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html',
      },
      video: yt(
        'Complete Java Collections Framework in 1 Video',
        'Anuj Kumar Sharma',
        'rzA7UJ-hQn4',
        '1h 25m',
        'Covers Stack, ArrayDeque, PriorityQueue heaps, and TreeMap ordering.',
      ),
      compilerStarterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        ArrayDeque<Integer> stack = new ArrayDeque<>();
        stack.push(10); stack.push(20);
        System.out.println("Top: " + stack.pop());
    }
}`,
      practiceQuestions: [
        {
          id: 'jp-3-1',
          title: 'Kth Largest Element via Min-Heap',
          difficulty: 'Medium',
          description: 'Find the 3rd largest element in {7, 10, 4, 3, 20, 15} using a size-3 min-heap -> 10',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {7, 10, 4, 3, 20, 15};
        int k = 3;
        // TODO: Min-heap of size k
    }
}`,
          expectedOutput: '10',
          hints: ['Poll whenever pq.size() > k; top after loop is the Kth largest.'],
        },
        {
          id: 'jp-3-2',
          title: 'Valid Balanced Brackets',
          difficulty: 'Easy',
          description: 'Validate "({[]})" and "([)]" using ArrayDeque stack -> true false',
          starterCode: `import java.util.*;
public class Main {
    static boolean valid(String s) {
        // TODO
        return false;
    }
    public static void main(String[] args) {
        System.out.println(valid("({[]})") + " " + valid("([)]"));
    }
}`,
          expectedOutput: 'true false',
          hints: ['Push expected closing bracket on opening char; check top equals char on closing.'],
        },
        {
          id: 'jp-3-3',
          title: 'Next Greater Element Monotonic Stack',
          difficulty: 'Medium',
          description: 'For {4, 5, 2, 10, 8}, print next greater element to the right (-1 if none): 5 10 10 -1 -1',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {4, 5, 2, 10, 8};
        // TODO: Use ArrayDeque stack storing indices
    }
}`,
          expectedOutput: '5 10 10 -1 -1',
          hints: ['While !st.isEmpty() && a[i] > a[st.peek()], ans[st.pop()] = a[i].'],
        },
        {
          id: 'jp-3-4',
          title: 'Sliding Window Maximum (ArrayDeque)',
          difficulty: 'Hard',
          description: 'Window size k=3 over {1,3,-1,-3,5,3,6,7} -> 3 3 5 5 6 7',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] a = {1,3,-1,-3,5,3,6,7}; int k = 3;
        // TODO: Decreasing monotonic deque storing indices
    }
}`,
          expectedOutput: '3 3 5 5 6 7',
          hints: ['Drop front if `dq.peekFirst() <= i - k`; pop smaller elements from `peekLast()`.'],
        },
        {
          id: 'jp-3-5',
          title: 'Multi-Key Comparator Sort',
          difficulty: 'Easy',
          description: 'Sort `[("Bob",80), ("Ada",95), ("Cal",95)]` by score DESC, then name ASC -> Ada Cal Bob',
          starterCode: `import java.util.*;
public class Main {
    record Score(String name, int pts) {}
    public static void main(String[] args) {
        List<Score> list = new ArrayList<>(List.of(new Score("Bob",80), new Score("Ada",95), new Score("Cal",95)));
        // TODO: Sort using Comparator.comparingInt(...).reversed().thenComparing(...)
    }
}`,
          expectedOutput: 'Ada Cal Bob',
          hints: ['Comparator.comparingInt(Score::pts).reversed().thenComparing(Score::name)'],
        },
        {
          id: 'jp-3-6',
          title: 'Top-2 Most Frequent Words',
          difficulty: 'Medium',
          description: 'Given {"java","py","java","cpp","py","java"}, print top 2 by frequency -> java py',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String[] arr = {"java","py","java","cpp","py","java"};
        // TODO: Count frequency and pull top 2 via PriorityQueue
    }
}`,
          expectedOutput: 'java py',
          hints: ['Sort keys or use heap ordered by freq DESC then lexicographical ASC.'],
        },
        {
          id: 'jp-3-7',
          title: 'TreeMap Floor & Ceiling Timestamp Lookup',
          difficulty: 'Easy',
          description: 'In keys {10, 25, 40, 60}, query floor(30) and ceiling(30) -> 25 40',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> ts = new TreeSet<>(List.of(10, 25, 40, 60));
        // TODO: Print ts.floor(30) and ts.ceiling(30)
    }
}`,
          expectedOutput: '25 40',
          hints: ['TreeSet has .floor(val) and .ceiling(val) directly in O(log N).'],
        },
        {
          id: 'jp-3-8',
          title: 'Merge Overlapping Intervals',
          difficulty: 'Medium',
          description: 'Merge {{1,3},{2,6},{8,10},{15,18}} and print merged count and total covered length -> 3 9',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[][] iv = {{1,3},{2,6},{8,10},{15,18}};
        // TODO: Sort by start and merge overlapping pairs
    }
}`,
          expectedOutput: '3 10',
          hints: ['Wait verify sum of lengths: [1,6]=5, [8,10]=2, [15,18]=3 -> total 10! Sort with Comparator.comparingInt(x -> x[0]).'],
        },
        {
          id: 'jp-3-9',
          title: 'Connect Ropes Minimum Cost (Greedy Heap)',
          difficulty: 'Medium',
          description: 'Join rope lengths {4, 3, 2, 6} pairwise minimizing total cost -> 29',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] ropes = {4, 3, 2, 6};
        // TODO: Always merge two smallest lengths in PriorityQueue
    }
}`,
          expectedOutput: '29',
          hints: ['2+3=5, 4+5=9, 6+9=15 -> total cost 5+9+15 = 29.'],
        },
        {
          id: 'jp-3-10',
          title: 'Median Stream With Two Heaps',
          difficulty: 'Hard',
          description: 'Insert 5, 15, 1, 3 into balanced Max-Heap + Min-Heap and print final median formatted `.1f` -> 4.0',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] stream = {5, 15, 1, 3};
        // TODO: Balance lower (maxHeap) and upper (minHeap), print final median
    }
}`,
          expectedOutput: '4.0',
          hints: ['After inserting 1, 3, 5, 15, middle values are 3 and 5 -> average 4.0.'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Lambdas, Streams API & Optional',
      topic: 'Declarative Functional Pipelines',
      estimatedTime: '2.5 Hours',
      summary:
        'Transform collections expressively with `filter`, `map`, `flatMap`, `Collectors.groupingBy`, and null-safe `Optional` chains.',
      studyMaterial: {
        overview:
          'Java Streams separate **what** computation you want from **how** loops iterate, enabling clean data pipelines and safe null elimination via `Optional`.',
        keyPoints: [
          'Streams are lazy: nothing executes until a terminal operation (`toList()`, `sum()`, `collect(...)`, `findFirst()`) runs.',
          'Never call `Optional.get()` without checking—use `.orElse(...)`, `.orElseThrow()`, or `.map(...)`.',
          'Use `IntStream` (`mapToInt`) to avoid boxing overhead when computing sums/averages.',
          '`Collectors.groupingBy(Item::cat, Collectors.counting())` builds histograms in one call.',
        ],
        codeExamples: [
          {
            title: 'Stream Filter + Grouping Pipeline',
            code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        var words = List.of("go", "java", "rust", "js", "py");
        var byLen = words.stream().collect(Collectors.groupingBy(String::length, Collectors.counting()));
        System.out.println(byLen.get(2));
    }
}`,
            explanation: 'Counts how many 2-character language names appear (3: go, js, py).',
          },
        ],
        cheatsheet: [
          'stream.filter(...).map(...).toList()',
          'Collectors.joining(", ")',
          'Collectors.groupingBy(fn, Collectors.summingInt(...))',
          'Optional.ofNullable(x).map(...).orElse("default")',
        ],
        officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html',
      },
      video: yt(
        'Java 8 Streams Tutorial',
        'Programming and Math Tutorials',
        't1-YZ6bF-g0',
        '18m',
        'Practical walkthrough of filter, map, reduce, flatMap, and Collectors.',
      ),
      compilerStarterCode: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        int sumEvenSq = IntStream.rangeClosed(1, 6).filter(n -> n % 2 == 0).map(n -> n * n).sum();
        System.out.println(sumEvenSq);
    }
}`,
      practiceQuestions: [
        {
          id: 'jp-4-1',
          title: 'Sum of Squares of Even Numbers',
          difficulty: 'Easy',
          description: 'Filter even numbers in {1,2,3,4,5,6}, square them, and print sum via Streams -> 56',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1,2,3,4,5,6);
        // TODO: Use stream().filter().mapToInt().sum()
    }
}`,
          expectedOutput: '56',
          hints: ['2^2 + 4^2 + 6^2 = 4 + 16 + 36 = 56.'],
        },
        {
          id: 'jp-4-2',
          title: 'Flatten Nested Lists With flatMap',
          difficulty: 'Easy',
          description: 'Flatten `[[1,2],[3,4,5],[6]]` and join as comma string -> 1,2,3,4,5,6',
          starterCode: `import java.util.*;
import java.util.stream.*;
public class Main {
    public static void main(String[] args) {
        var nested = List.of(List.of(1,2), List.of(3,4,5), List.of(6));
        // TODO: flatMap + Collectors.joining(",")
    }
}`,
          expectedOutput: '1,2,3,4,5,6',
          hints: ['nested.stream().flatMap(List::stream).map(String::valueOf).collect(Collectors.joining(","))'],
        },
        {
          id: 'jp-4-3',
          title: 'Safe Optional Email Lookup',
          difficulty: 'Easy',
          description: 'Extract trimmed uppercase domain or `"NONE"` for missing email -> KOLLABRIX.IN NONE',
          starterCode: `import java.util.*;
public class Main {
    static String extractDomain(String email) {
        // TODO: Use Optional.ofNullable(email)
        return "";
    }
    public static void main(String[] args) {
        System.out.println(extractDomain("dev@kollabrix.in") + " " + extractDomain(null));
    }
}`,
          expectedOutput: 'KOLLABRIX.IN NONE',
          hints: ['Optional.ofNullable(email).filter(e -> e.contains("@")).map(...).orElse("NONE").'],
        },
        {
          id: 'jp-4-4',
          title: 'GroupingBy Total Revenue Per Category',
          difficulty: 'Medium',
          description: 'Sum `(FOOD,120), (TECH,500), (FOOD,80)` and print TECH total: 500 and FOOD total: 200',
          starterCode: `import java.util.*;
import java.util.stream.*;
public class Main {
    record Order(String cat, int amt) {}
    public static void main(String[] args) {
        var orders = List.of(new Order("FOOD",120), new Order("TECH",500), new Order("FOOD",80));
        // TODO: groupingBy(Order::cat, Collectors.summingInt(Order::amt))
    }
}`,
          expectedOutput: 'FOOD:200 TECH:500',
          hints: ['Collect into Map<String, Integer> (or TreeMap for sorted keys) and print FOOD & TECH.'],
        },
        {
          id: 'jp-4-5',
          title: 'Partition Even & Odd Lists',
          difficulty: 'Easy',
          description: 'Use `Collectors.partitioningBy(n -> n % 2 == 0)` on 1..6 and print even list: [2, 4, 6]',
          starterCode: `import java.util.*;
import java.util.stream.*;
public class Main {
    public static void main(String[] args) {
        var res = IntStream.rangeClosed(1, 6).boxed().collect(Collectors.partitioningBy(n -> n % 2 == 0));
        // TODO: Print even partition
    }
}`,
          expectedOutput: '[2, 4, 6]',
          hints: ['System.out.println(res.get(true));'],
        },
        {
          id: 'jp-4-6',
          title: 'Distinct Sorted Descending Top 3',
          difficulty: 'Easy',
          description: 'Take distinct values of {9, 2, 9, 5, 7, 5, 11}, sort desc, limit 3 -> [11, 9, 7]',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        var list = List.of(9, 2, 9, 5, 7, 5, 11);
        // TODO: distinct().sorted(Comparator.reverseOrder()).limit(3)
    }
}`,
          expectedOutput: '[11, 9, 7]',
          hints: ['Chain .distinct().sorted(Comparator.reverseOrder()).limit(3).toList().'],
        },
        {
          id: 'jp-4-7',
          title: 'Reduce Product Without Zero Identity Bug',
          difficulty: 'Easy',
          description: 'Compute product of {2, 3, 4, 5} using `stream().reduce(1, (a, b) -> a * b)` -> 120',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        var list = List.of(2, 3, 4, 5);
        // TODO
    }
}`,
          expectedOutput: '120',
          hints: ['Identity element for multiplication is 1, not 0.'],
        },
        {
          id: 'jp-4-8',
          title: 'Comma-Separated Top Scorers Names',
          difficulty: 'Easy',
          description: 'Filter students >= 85 from `("A",90), ("B",70), ("C",88)`, sort names ASC, join with `|` -> A|C',
          starterCode: `import java.util.*;
import java.util.stream.*;
public class Main {
    record Stu(String name, int mark) {}
    public static void main(String[] args) {
        var list = List.of(new Stu("C",88), new Stu("B",70), new Stu("A",90));
        // TODO
    }
}`,
          expectedOutput: 'A|C',
          hints: ['filter -> map(Stu::name) -> sorted() -> collect(Collectors.joining("|")).'],
        },
        {
          id: 'jp-4-9',
          title: 'Frequency Map via Collectors.toMap',
          difficulty: 'Medium',
          description: 'Count occurrences of {"a","b","a","c"} via `Collectors.toMap(..., Integer::sum)` -> a:2 b:1 c:1',
          starterCode: `import java.util.*;
import java.util.stream.*;
public class Main {
    public static void main(String[] args) {
        var items = List.of("a","b","a","c");
        // TODO: Build TreeMap frequency and print entries space-separated
    }
}`,
          expectedOutput: 'a:2 b:1 c:1',
          hints: ['Collectors.toMap(k -> k, _k -> 1, Integer::sum, TreeMap::new)'],
        },
        {
          id: 'jp-4-10',
          title: 'SummaryStatistics Batch Metrics',
          difficulty: 'Easy',
          description: 'Use `IntSummaryStatistics` on {10, 20, 30, 40} to print `max=40 min=10 avg=25.0`',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        var stats = Arrays.stream(new int[]{10, 20, 30, 40}).summaryStatistics();
        // TODO: Print formatted metrics
    }
}`,
          expectedOutput: 'max=40 min=10 avg=25.0',
          hints: ['System.out.printf("max=%d min=%d avg=%.1f%n", stats.getMax(), stats.getMin(), stats.getAverage());'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'Concurrency, Executors & Virtual Threads',
      topic: 'Thread Safety, Atomics & Async Futures',
      estimatedTime: '3 Hours',
      summary:
        'Prevent race conditions with `AtomicInteger` and `ConcurrentHashMap`, orchestrate async tasks via `CompletableFuture`, and scale I/O with Executor pools.',
      studyMaterial: {
        overview:
          'Shared mutable state across threads introduces silent race conditions because `count++` is 3 non-atomic steps (read-modify-write). Use `AtomicInteger` lock-free CAS operations or `synchronized` critical sections.',
        keyPoints: [
          '`AtomicInteger` uses hardware Compare-And-Swap (`incrementAndGet()`) without blocking threads.',
          '`CompletableFuture.supplyAsync(...)` composes non-blocking workflows with `.thenApply()` and `.join()`.',
          '`ConcurrentHashMap` locks individual buckets rather than the entire table; prefer `.compute()` for atomic updates.',
          'Always call `executor.shutdown()` or `executor.awaitTermination(...)` so worker threads exit cleanly.',
        ],
        codeExamples: [
          {
            title: 'CompletableFuture Async Pipeline',
            code: `import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) {
        String out = CompletableFuture.supplyAsync(() -> 21)
            .thenApply(v -> "Score=" + (v * 2))
            .join();
        System.out.println(out);
    }
}`,
            explanation: 'Non-blocking composition with `.join()` awaiting final value cleanly.',
          },
        ],
        cheatsheet: [
          'AtomicInteger -> lock-free counter',
          'CountDownLatch -> synchronize N worker completions',
          'ExecutorService pool = Executors.newFixedThreadPool(4)',
        ],
        officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html',
      },
      video: yt(
        'Multithreading in Java Explained in 10 Minutes',
        'Coding with John',
        'r_MbozD32eo',
        '11m',
        'Clear explanation of Threads vs Runnable, join semantics, and parallel execution.',
      ),
      compilerStarterCode: `import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) throws Exception {
        AtomicInteger total = new AtomicInteger(0);
        try (var pool = Executors.newFixedThreadPool(2)) {
            pool.submit(() -> total.addAndGet(25)).get();
            pool.submit(() -> total.addAndGet(25)).get();
        }
        System.out.println("Safe Sum: " + total.get());
    }
}`,
      practiceQuestions: [
        {
          id: 'jp-5-1',
          title: 'Lock-Free AtomicInteger Accumulation',
          difficulty: 'Easy',
          description: 'Run 4 tasks each incrementing an AtomicInteger 100 times via ExecutorService, print final count: 400',
          starterCode: `import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) throws Exception {
        AtomicInteger counter = new AtomicInteger(0);
        // TODO: Submit 4 tasks incrementing 100 times each and await completion
    }
}`,
          expectedOutput: '400',
          hints: ['In Java 19+, try-with-resources on ExecutorService awaits shutdown automatically; or call pool.shutdown(); pool.awaitTermination(...).'],
        },
        {
          id: 'jp-5-2',
          title: 'CompletableFuture Parallel Combine',
          difficulty: 'Medium',
          description: 'Compute `20` and `22` in two `CompletableFuture`s and merge with `.thenCombine(Integer::sum)` -> 42',
          starterCode: `import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) {
        // TODO: Combine two supplyAsync futures and join()
    }
}`,
          expectedOutput: '42',
          hints: ['f1.thenCombine(f2, Integer::sum).join()'],
        },
        {
          id: 'jp-5-3',
          title: 'CountDownLatch Barrier Rendezvous',
          difficulty: 'Medium',
          description: 'Start 3 worker threads counting down a `CountDownLatch(3)` and after `latch.await()` print: ALL_READY',
          starterCode: `import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) throws Exception {
        CountDownLatch latch = new CountDownLatch(3);
        // TODO: Launch 3 threads each calling latch.countDown()
    }
}`,
          expectedOutput: 'ALL_READY',
          hints: ['Start 3 threads calling latch.countDown(), then latch.await() in main.'],
        },
        {
          id: 'jp-5-4',
          title: 'BlockingQueue Producer Consumer',
          difficulty: 'Medium',
          description: 'Use `ArrayBlockingQueue<String>(2)` where producer puts "A", "B" and consumer sums lengths -> 2',
          starterCode: `import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) throws Exception {
        BlockingQueue<String> q = new ArrayBlockingQueue<>(2);
        // TODO: Put two items and take them cleanly
    }
}`,
          expectedOutput: '2',
          hints: ['q.put("A"); q.put("B"); int len = q.take().length() + q.take().length();'],
        },
        {
          id: 'jp-5-5',
          title: 'ConcurrentHashMap Atomic Merge',
          difficulty: 'Easy',
          description: 'Use `ConcurrentHashMap.merge` across parallel threads for key `"hits"` (5 updates of +1) -> 5',
          starterCode: `import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        // TODO: Perform 5 atomic merges and print map.get("hits")
    }
}`,
          expectedOutput: '5',
          hints: ['map.merge("hits", 1, Integer::sum); inside loop or CompletableFuture.'],
        },
        {
          id: 'jp-5-6',
          title: 'CompletableFuture Exception Recovery',
          difficulty: 'Easy',
          description: 'Throw inside `supplyAsync`, recover cleanly via `.exceptionally(_ex -> "FALLBACK")` -> FALLBACK',
          starterCode: `import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) {
        // TODO: Simulate exception and recover via .exceptionally(...)
    }
}`,
          expectedOutput: 'FALLBACK',
          hints: ['CompletableFuture.supplyAsync(() -> { throw new RuntimeException(); }).exceptionally(e -> "FALLBACK").join()'],
        },
        {
          id: 'jp-5-7',
          title: 'Callable Return Value Sum',
          difficulty: 'Easy',
          description: 'Submit two `Callable<Integer>` jobs returning 15 and 35 to an ExecutorService and print sum: 50',
          starterCode: `import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) throws Exception {
        // TODO
    }
}`,
          expectedOutput: '50',
          hints: ['pool.submit(() -> 15).get() + pool.submit(() -> 35).get()'],
        },
        {
          id: 'jp-5-8',
          title: 'Semaphore Permit Limiter',
          difficulty: 'Medium',
          description: 'Create `Semaphore(2)`, acquire 2 permits, print `availablePermits()`, release 1, print `availablePermits()` -> 0 1',
          starterCode: `import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) throws Exception {
        Semaphore sem = new Semaphore(2);
        // TODO
    }
}`,
          expectedOutput: '0 1',
          hints: ['acquire(2) -> print availablePermits() -> release(1) -> print availablePermits().'],
        },
        {
          id: 'jp-5-9',
          title: 'ReadWriteLock Concurrent Read Guard',
          difficulty: 'Medium',
          description: 'Update value to 99 under writeLock and read it under readLock using `ReentrantReadWriteLock` -> 99',
          starterCode: `import java.util.concurrent.locks.*;
public class Main {
    static int val = 0;
    public static void main(String[] args) {
        ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
        // TODO: Write 99 then read under locks cleanly with try/finally
    }
}`,
          expectedOutput: '99',
          hints: ['Always unlock in a finally block so locks never leak on error.'],
        },
        {
          id: 'jp-5-10',
          title: 'ThreadLocal Context Isolation',
          difficulty: 'Medium',
          description: 'Store `"REQ-1"` in main ThreadLocal and `"REQ-2"` in child Thread; ensure main still reads `"REQ-1"` -> REQ-1',
          starterCode: `public class Main {
    static final ThreadLocal<String> ctx = new ThreadLocal<>();
    public static void main(String[] args) throws Exception {
        ctx.set("REQ-1");
        Thread t = new Thread(() -> ctx.set("REQ-2"));
        t.start(); t.join();
        // TODO: Print ctx.get() and clean up with ctx.remove()
    }
}`,
          expectedOutput: 'REQ-1',
          hints: ['Each thread maintains its own independent ThreadLocal value.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'JVM Internals & Classic Design Patterns',
      topic: 'LRU Cache, Strategy, Observer & Builders',
      estimatedTime: '3 Hours',
      summary:
        'Implement battle-tested software design patterns and understand JVM heap/stack allocation, `String` interning, and O(1) LRU Cache design.',
      studyMaterial: {
        overview:
          'Design Patterns eliminate rigid `if/else` monoliths. In senior Java interviews, implementing O(1) **LRU Cache** (`LinkedHashMap` or Doubly Linked List + Map), **Strategy**, **Observer**, and **Singleton** is standard.',
        keyPoints: [
          '`LinkedHashMap(cap, 0.75f, true)` maintains access order and exposes `removeEldestEntry` for an instant O(1) LRU Cache.',
          '**Enum Singleton** (`enum Config { INSTANCE; }`) is serialization-safe and thread-safe by JVM spec.',
          '**Strategy Pattern** encapsulates interchangeable algorithms behind a `@FunctionalInterface`.',
          'JVM Stack holds local primitives and references per thread; Heap holds all `new` Objects shared across threads.',
        ],
        codeExamples: [
          {
            title: 'O(1) LRU Cache via LinkedHashMap',
            code: `import java.util.*;
class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int cap;
    LRUCache(int cap) { super(cap, 0.75f, true); this.cap = cap; }
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) { return size() > cap; }
}
public class Main {
    public static void main(String[] args) {
        var lru = new LRUCache<Integer, String>(2);
        lru.put(1, "A"); lru.put(2, "B"); lru.get(1); lru.put(3, "C");
        System.out.println(lru.keySet());
    }
}`,
            explanation: 'Accessing key 1 moves it to MRU so key 2 gets evicted when 3 is inserted.',
          },
        ],
        cheatsheet: [
          'LinkedHashMap(cap, 0.75f, true) -> O(1) access-ordered LRU',
          'enum Singleton { INSTANCE; }',
          '@FunctionalInterface -> Strategy lambda hook',
        ],
        officialDocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedHashMap.html',
      },
      video: yt(
        'Modern Java Architecture & Core Idioms',
        'Amigoscode',
        'Qgl81fPcLc8',
        '2h 20m',
        'Reviews records, functional interfaces, clean object design, and JVM runtime behavior.',
      ),
      compilerStarterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        var cache = new LinkedHashMap<Integer, Integer>(2, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) { return size() > 2; }
        };
        cache.put(1, 10); cache.put(2, 20); cache.get(1); cache.put(3, 30);
        System.out.println(cache.containsKey(2) + " " + cache.get(1));
    }
}`,
      practiceQuestions: [
        {
          id: 'jp-6-1',
          title: 'Capacity-2 LRU Cache Eviction Trace',
          difficulty: 'Medium',
          description: 'Put (1,10), (2,20), get(1), put(3,30). Verify key 2 evicted (`-1`) and key 1 returns `10` -> -1 10',
          starterCode: `import java.util.*;
public class Main {
    // TODO: Implement LRUCache
    public static void main(String[] args) {
        // TODO
    }
}`,
          expectedOutput: '-1 10',
          hints: ['Pass accessOrder = true to LinkedHashMap constructor and override removeEldestEntry.'],
        },
        {
          id: 'jp-6-2',
          title: 'Functional Strategy Pricing Engine',
          difficulty: 'Easy',
          description: 'Pass a 20% discount `UnaryOperator<Integer>` strategy on price=500 -> 400',
          starterCode: `import java.util.function.*;
public class Main {
    static int checkout(int price, UnaryOperator<Integer> strategy) {
        // TODO
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(checkout(500, p -> p * 80 / 100));
    }
}`,
          expectedOutput: '400',
          hints: ['return strategy.apply(price);'],
        },
        {
          id: 'jp-6-3',
          title: 'Observer Event Dispatcher',
          difficulty: 'Medium',
          description: 'Register 2 `Consumer<String>` listeners on EventBus and emit `"DEPLOY"` -> [LOG:DEPLOY, AUDIT:DEPLOY]',
          starterCode: `import java.util.*;
import java.util.function.*;
public class Main {
    public static void main(String[] args) {
        // TODO: Dispatch event to subscribed listeners and print collected output
    }
}`,
          expectedOutput: '[LOG:DEPLOY, AUDIT:DEPLOY]',
          hints: ['Store listeners in List<Consumer<String>>; iterate on publish(event).'],
        },
        {
          id: 'jp-6-4',
          title: 'Text Pipeline Decorator Chain',
          difficulty: 'Medium',
          description: 'Compose `trim` -> `lowercase` -> `replace(" ", "-")` on `"  KA Java  "` using `.andThen()` -> ka-java',
          starterCode: `import java.util.function.*;
public class Main {
    public static void main(String[] args) {
        Function<String, String> trim = String::trim;
        // TODO: Chain lowercase and hyphen replacement
    }
}`,
          expectedOutput: 'ka-java',
          hints: ['Function pipeline = trim.andThen(String::toLowerCase).andThen(s -> s.replace(" ", "-"));'],
        },
        {
          id: 'jp-6-5',
          title: 'Command Pattern With Undo Stack',
          difficulty: 'Medium',
          description: 'Append `"Hi"`, append `"!"`, then `undo()` last command on StringBuilder -> Hi',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        StringBuilder doc = new StringBuilder();
        Deque<Runnable> undoStack = new ArrayDeque<>();
        // TODO: Execute 2 append commands pushing undo lambdas, then pop & run 1 undo
    }
}`,
          expectedOutput: 'Hi',
          hints: ['Each command records length added so undo calls `doc.setLength(...)`.'],
        },
        {
          id: 'jp-6-6',
          title: 'Enum Safe Singleton Identity',
          difficulty: 'Easy',
          description: 'Verify two references to `Registry.INSTANCE` share the same instance and increment version 1 -> true 2',
          starterCode: `enum Registry {
    INSTANCE;
    int version = 1;
}
public class Main {
    public static void main(String[] args) {
        // TODO: Compare r1 == r2, increment version, print r1 == r2 and r2.version
    }
}`,
          expectedOutput: 'true 2',
          hints: ['Registry r1 = Registry.INSTANCE, r2 = Registry.INSTANCE;'],
        },
        {
          id: 'jp-6-7',
          title: 'Factory Pattern Notification Router',
          difficulty: 'Easy',
          description: 'Route `"EMAIL"` and `"SMS"` via Factory helper returning Notifier lambda -> EMAIL:OK SMS:OK',
          starterCode: `public class Main {
    interface Notifier { String send(String msg); }
    static Notifier create(String kind) {
        // TODO
        return null;
    }
    public static void main(String[] args) {
        System.out.println(create("EMAIL").send("OK") + " " + create("SMS").send("OK"));
    }
}`,
          expectedOutput: 'EMAIL:OK SMS:OK',
          hints: ['Switch on kind to return `msg -> kind + ":" + msg`.'],
        },
        {
          id: 'jp-6-8',
          title: 'Immutable Defensive Copy Check',
          difficulty: 'Medium',
          description: 'Pass `[1, 2]` into immutable `TagSet`, mutate original list adding `3`, ensure `TagSet` size stays 2 -> 2',
          starterCode: `import java.util.*;
public class Main {
    static class TagSet {
        private final List<Integer> items;
        TagSet(List<Integer> src) { /* TODO: List.copyOf(src) */ this.items = src; }
        int size() { return items.size(); }
    }
    public static void main(String[] args) {
        var raw = new ArrayList<>(List.of(1, 2));
        var ts = new TagSet(raw);
        raw.add(3);
        System.out.println(ts.size());
    }
}`,
          expectedOutput: '2',
          hints: ['Replace `this.items = src;` with `this.items = List.copyOf(src);`.'],
        },
        {
          id: 'jp-6-9',
          title: 'Weak/String Intern Reference Check',
          difficulty: 'Easy',
          description: 'Demonstrate `new String("KA")` fails `==` against `"KA"`, while `.intern() == "KA"` is `true` -> false true',
          starterCode: `public class Main {
    public static void main(String[] args) {
        String lit = "KA";
        String heap = new String("KA");
        // TODO: Print (lit == heap) and (lit == heap.intern())
    }
}`,
          expectedOutput: 'false true',
          hints: ['Heap `new String()` creates a distinct reference outside the literal pool until `.intern()`.'],
        },
        {
          id: 'jp-6-10',
          title: 'Trie Prefix Matcher Pattern',
          difficulty: 'Medium',
          description: 'Insert {"app", "apple", "api"} into a lightweight Trie and verify `startsWith("ap")` & `search("app")` -> true true',
          starterCode: `public class Main {
    static class Node { Node[] c = new Node[26]; boolean end; }
    // TODO: insert, search, startsWith
    public static void main(String[] args) {
        // TODO
    }
}`,
          expectedOutput: 'true true',
          hints: ['Walk `cur = cur.c[ch - \'a\']`, allocating `new Node()` during insert.'],
        },
      ],
    },
    {
      stepNumber: 7,
      title: 'Backend Engineering & Spring Patterns',
      topic: 'Rate Limiters, Pagination, Auth & Resilience',
      estimatedTime: '3.5 Hours',
      summary:
        'Implement core Spring Boot & microservice backend building blocks directly in pure Java: Token Bucket rate limiters, Circuit Breakers, Idempotency keys, and cursor pagination.',
      studyMaterial: {
        overview:
          'Even outside the Spring container, senior Java backend interviews ask you to code the core resilience & API primitives powering Spring Boot REST systems.',
        keyPoints: [
          'Keep REST Controllers thin: handle HTTP validation & DTO mapping there, and encapsulate transaction rules in `@Service`.',
          'Use **Idempotency Keys** on payment/create mutations so retries never double-charge.',
          'Protect downstream APIs with **Token Bucket Rate Limiters** and **Circuit Breakers** (CLOSED -> OPEN -> HALF_OPEN).',
          'Cursor pagination (`WHERE id > lastId LIMIT k`) avoids slow `OFFSET` scans at scale.',
        ],
        codeExamples: [
          {
            title: 'Token Bucket Rate Limiter Core',
            code: `public class Main {
    static class Bucket {
        int tokens;
        Bucket(int cap) { tokens = cap; }
        boolean allow() {
            if (tokens <= 0) return false;
            tokens--;
            return true;
        }
    }
    public static void main(String[] args) {
        Bucket b = new Bucket(2);
        System.out.println(b.allow() + " " + b.allow() + " " + b.allow());
    }
}`,
            explanation: 'Rejects 3rd burst request once capacity is exhausted.',
          },
        ],
        cheatsheet: [
          'CircuitBreaker: CLOSED -> OPEN (>= threshold fails) -> HALF_OPEN',
          'Idempotency Cache: store requestKey -> cachedResponse',
          'Cursor slice: filter id > cursor, limit pageSize',
        ],
        officialDocUrl: 'https://spring.io/guides/gs/rest-service',
      },
      video: yt(
        'Spring Boot Full Course — REST APIs & Architecture',
        'Amigoscode',
        '9SGDpanrc8U',
        '2h 15m',
        'Covers Spring IoC, Dependency Injection, @RestController, Service layers, and PostgreSQL integration.',
      ),
      compilerStarterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        List<Integer> ids = List.of(101, 102, 105, 109, 112);
        var page = ids.stream().filter(id -> id > 102).limit(2).toList();
        System.out.println("Cursor Page: " + page);
    }
}`,
      practiceQuestions: [
        {
          id: 'jp-7-1',
          title: 'Token Bucket Rate Limiter Simulation',
          difficulty: 'Medium',
          description: 'Capacity=3, initial=3 tokens, refill=1 token per 2 full seconds (`(t - lastRefill) / 2`). Process request timestamps `{0, 0, 0, 0, 3}` and print count of allowed requests -> 4',
          starterCode: `public class Main {
    public static void main(String[] args) {
        int[] ts = {0, 0, 0, 0, 3};
        // TODO: Simulate token bucket capacity=3, refill=1 per 2s and print allowed count
    }
}`,
          expectedOutput: '4',
          hints: ['First 3 requests at t=0 consume all 3 tokens, the 4th at t=0 is rejected, and 1 token refills by t=3.'],
        },
        {
          id: 'jp-7-2',
          title: 'Circuit Breaker State Machine',
          difficulty: 'Medium',
          description: 'Start CLOSED, trip to OPEN after 2 consecutive failures. Record calls [FAIL, FAIL, CALL] and print final state: OPEN',
          starterCode: `public class Main {
    enum State { CLOSED, OPEN, HALF_OPEN }
    public static void main(String[] args) {
        // TODO: Trip breaker at failureThreshold = 2 and print final State
    }
}`,
          expectedOutput: 'OPEN',
          hints: ['Reset failCount on success; set state = State.OPEN when failCount >= 2.'],
        },
        {
          id: 'jp-7-3',
          title: 'Idempotency Key Deduplicator',
          difficulty: 'Easy',
          description: 'Execute `pay("k1", 100)`, `pay("k1", 100)`, `pay("k2", 50)` so duplicate `"k1"` is skipped; print ledger sum: 150',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        // TODO: Track processed keys in HashSet/HashMap so "k1" charges only once
    }
}`,
          expectedOutput: '150',
          hints: ['Add to sum only if `seenKeys.add(key)` returns true.'],
        },
        {
          id: 'jp-7-4',
          title: 'Cursor-Based API Paginator',
          difficulty: 'Easy',
          description: 'Given sorted IDs {10, 20, 35, 42, 50}, cursor=20, limit=2, print `[35, 42]` and nextCursor=`42` -> [35, 42] next=42',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        var ids = List.of(10, 20, 35, 42, 50);
        int cursor = 20, limit = 2;
        // TODO
    }
}`,
          expectedOutput: '[35, 42] next=42',
          hints: ['Filter id > cursor, take `limit`, nextCursor is last item in slice.'],
        },
        {
          id: 'jp-7-5',
          title: 'DTO Input Validation Collector',
          difficulty: 'Easy',
          description: 'Validate `name="   "`, `age=15` (min 18); collect errors sorted -> [AGE_MIN_18, NAME_BLANK]',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String name = "   "; int age = 15;
        // TODO: Collect violations cleanly
    }
}`,
          expectedOutput: '[AGE_MIN_18, NAME_BLANK]',
          hints: ['Check name.isBlank() and age < 18, add codes into TreeSet or sort List.'],
        },
        {
          id: 'jp-7-6',
          title: 'Sliding-Window Request Counter',
          difficulty: 'Medium',
          description: 'Allow max 3 requests in any 10ms window. Timestamps {1, 2, 3, 4, 12}: print allowed count -> 4',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] ts = {1, 2, 3, 4, 12};
        // TODO: Evict timestamps <= t - 10 from ArrayDeque before checking size < 3
    }
}`,
          expectedOutput: '4',
          hints: ['At t=4 queue has [1,2,3] -> size 3, denied! At t=12, 1 and 2 expire -> [3], allowed!'],
        },
        {
          id: 'jp-7-7',
          title: 'Exponential Backoff Schedule',
          difficulty: 'Easy',
          description: 'Starting delay=100ms, multiplier=2, cap=600ms across 4 retries -> print delays: 100 200 400 600',
          starterCode: `public class Main {
    public static void main(String[] args) {
        // TODO: Compute 4 capped exponential backoff intervals
    }
}`,
          expectedOutput: '100 200 400 600',
          hints: ['delay = Math.min(cap, delay * 2) after each step.'],
        },
        {
          id: 'jp-7-8',
          title: 'Role-Based Endpoint Auth Guard',
          difficulty: 'Easy',
          description: 'Map roles -> permissions `{ADMIN:[READ,WRITE], USER:[READ]}`. Check USER calling WRITE and ADMIN calling WRITE -> false true',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Map<String, Set<String>> rbac = Map.of(
            "ADMIN", Set.of("READ", "WRITE"),
            "USER", Set.of("READ")
        );
        // TODO: Check USER->WRITE and ADMIN->WRITE
    }
}`,
          expectedOutput: 'false true',
          hints: ['rbac.getOrDefault(role, Set.of()).contains(perm)'],
        },
        {
          id: 'jp-7-9',
          title: 'Health Dependency Aggregator',
          difficulty: 'Easy',
          description: 'Services `{DB:UP, REDIS:DOWN, JUDGE0:UP}` -> if any essential is DOWN print `DEGRADED` else `UP`: DEGRADED',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        var deps = Map.of("DB", true, "REDIS", false, "JUDGE0", true);
        // TODO: Check deps.values().stream().allMatch(Boolean::booleanValue)
    }
}`,
          expectedOutput: 'DEGRADED',
          hints: ['allMatch returns false because REDIS is false -> print DEGRADED.'],
        },
        {
          id: 'jp-7-10',
          title: 'Transactional Outbox Retry Queue',
          difficulty: 'Medium',
          description: 'Process events `[E1, E2, E3]` where `E2` fails once then succeeds cleanly; print final published log: E1 E3 E2',
          starterCode: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        // TODO: Dequeue from ArrayDeque; re-enqueue E2 on first attempt, publish others
    }
}`,
          expectedOutput: 'E1 E3 E2',
          hints: ['Track attempts map: first dequeue of E2 re-offers to back of queue.'],
        },
      ],
    },
  ],
};
