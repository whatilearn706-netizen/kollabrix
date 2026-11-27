import type { CodingBook } from '@/data/kaCodexBooks';
import type { BookMentorGuide } from '@/data/codexCatalog';
import type { BookChapterMeta } from '@/data/codexBookMeta';

export interface ExtendedBookEntry {
  book: CodingBook;
  mentor: BookMentorGuide;
  chapterMetas: BookChapterMeta[];
  realChapterLabels: string[];
}

const cover = (isbn: string) => `/api/codex/cover?isbn=${isbn}`;

export const KA_EXTENDED_BOOKS: ExtendedBookEntry[] = [
  // ================= JAVA TRACK (BEGINNER -> CORE -> PRO) =================
  {
    book: {
      id: 'head-first-java',
      index: 13,
      title: 'Head First Java (3rd Edition)',
      shortTitle: 'Head First Java',
      author: 'Kathy Sierra & Bert Bates',
      year: '2022',
      isbn: '9781491910771',
      coverUrl: cover('9781491910771'),
      spineColor: '#9A3412',
      accentHex: '#FB923C',
      category: 'Craft',
      pages: 720,
      tagline: 'Visual, brain-friendly mastery of OOP, JVM memory, collections, and modern Java.',
      chapters: [
        {
          number: '01',
          title: 'Objects, Heap vs Stack & Polymorphism',
          summary:
            'Every object lives on the Garbage-Collected Heap while object references live on the thread Stack. Polymorphic references decouple method calls from concrete subtypes.',
          takeaways: [
            'Use reference-type interfaces (`List<String>`) instead of concrete classes (`ArrayList<String>`).',
            'Override both `equals()` and `hashCode()` together whenever objects enter a `HashSet` or `HashMap`.',
          ],
        },
        {
          number: '02',
          title: 'Generics, Collections & Exception Boundaries',
          summary:
            'ArrayList, HashMap, and TreeMap handle 95% of Java placement coding rounds cleanly without manual pointer boilerplate.',
          takeaways: [
            'Always specify generic types (`Map<String, Integer>`) so bugs get caught at compile time.',
            'Handle checked exceptions at service boundaries rather than swallowing stack traces.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 3, 7 & 9 (of 18)', 'Real Book Ch. 11 & 13 (of 18)'],
    mentor: {
      goalTags: ['Java & Architecture', 'Placement & OAs'],
      level: 'Beginner',
      languageGroup: 'Java',
      totalRealChapters: 18,
      quickVerdict: 'Best Beginner Java Book on Earth (Visual & Zero Dryness)',
      useWhen:
        'You are in 1st–3rd year starting Java from zero or preparing for core OOP interviews (TCS, Infosys, Accenture, campus rounds).',
      skipWhen:
        'You already write Spring Boot APIs and comfortable OOP—skip straight to Core Java Vol. I or Effective Java.',
      onlyChaptersYouNeed:
        'Out of 18 chapters (~720 pages), read ONLY Ch. 3 (Primitives vs References), Ch. 7–8 (Inheritance & Interfaces), Ch. 9 (Stack vs Heap GC), and Ch. 11 (Collections & Generics). Skip Swing GUI chapters (Ch. 14–16) completely!',
      recommendedPairTitle: 'Core Java Vol. I (Next Level) or Effective Java (Pro)',
      recommendedPairBookId: 'effective-java',
    },
    chapterMetas: [
      {
        hackathon:
          'Always code to interfaces (`PaymentGateway`) in Java hackathons so you can swap mock payments for Razorpay in 1 line before demo time.',
        flashcards: [
          {
            q: 'Where do Java local variables vs object instances live in JVM memory?',
            a: 'Local primitives and object references live on each thread’s Stack; all actual object instances and arrays live on the shared Heap.',
          },
        ],
        code: {
          language: 'java',
          title: 'Polymorphic Interface & Heap Object Demo (Java)',
          snippet: `import java.util.*;

public class Main {
    interface Notifier { void send(String msg); }
    static class EmailNotifier implements Notifier {
        public void send(String msg) { System.out.println("[EMAIL] " + msg); }
    }
    public static void main(String[] args) {
        Notifier n = new EmailNotifier();
        n.send("OOP Polymorphism works cleanly!");
    }
}`,
        },
      },
      {
        hackathon:
          'Use `HashMap.getOrDefault()` and `computeIfAbsent()` to write clean frequency counters and adjacency graphs in 2 lines during OAs.',
        flashcards: [
          {
            q: 'Why must you override `hashCode()` whenever you override `equals()`?',
            a: 'HashMap and HashSet look up buckets using `hashCode()` first; if two equal objects return different hash codes, HashMap treats them as missing.',
          },
        ],
        code: {
          language: 'java',
          title: 'Frequency Counter with HashMap (Java)',
          snippet: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] skills = {"java", "sql", "java", "react", "java"};
        Map<String, Integer> freq = new HashMap<>();
        for (String s : skills) freq.put(s, freq.getOrDefault(s, 0) + 1);
        System.out.println("Skill counts: " + freq);
    }
}`,
        },
      },
    ],
  },
  {
    book: {
      id: 'core-java',
      index: 14,
      title: 'Core Java, Volume I: Fundamentals',
      shortTitle: 'Core Java Vol. I',
      author: 'Cay S. Horstmann',
      year: '2024',
      isbn: '9780137673629',
      coverUrl: cover('9780137673629'),
      spineColor: '#B91C1C',
      accentHex: '#F87171',
      category: 'Craft',
      pages: 928,
      tagline: 'Rock-solid Core Java: Lambdas, Streams, Records, Interfaces & Concurrency foundations.',
      chapters: [
        {
          number: '01',
          title: 'Lambdas, Functional Interfaces & Streams API',
          summary:
            'Java Streams turn verbose multi-loop data filtering, grouping, and sorting pipelines into crisp declarative chains.',
          takeaways: [
            'Prefer `Collectors.groupingBy` and `sorted(Comparator.comparing(...))` for backend DTO sorting.',
            'Remember streams are lazy—nothing executes until a terminal operation like `.toList()` runs.',
          ],
        },
        {
          number: '02',
          title: 'Interfaces, Inner Classes & Sealed Types',
          summary:
            'Default methods, functional interfaces (`Predicate`, `Function`), and sealed classes let Java model strict domain rules safely.',
          takeaways: [
            'Use `record` for immutable data carriers instead of writing 80 lines of getters/setters.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 6 & 10 (of 12)', 'Real Book Ch. 6 & 8 (of 12)'],
    mentor: {
      goalTags: ['Java & Architecture', 'Placement & OAs'],
      level: 'Core',
      languageGroup: 'Java',
      totalRealChapters: 12,
      quickVerdict: 'Best Core Java Reference Before Spring Boot Interviews',
      useWhen:
        'You know basic Java syntax and need solid command over Lambdas, Streams API, Interfaces, Generics, and JVM fundamentals for Java Backend OAs.',
      skipWhen:
        'You are a complete beginner (start with Head First Java) or already know Core Java well (move to Effective Java).',
      onlyChaptersYouNeed:
        'Out of 12 thick chapters (928 pages), study ONLY Ch. 5 (Inheritance & Reflection), Ch. 6 (Interfaces, Lambdas & Inner Classes), Ch. 8 (Generics), and Ch. 9 (Collections). Skip Swing/UI chapters completely.',
      recommendedPairTitle: 'Effective Java (Upgrade to Pro)',
      recommendedPairBookId: 'effective-java',
    },
    chapterMetas: [
      {
        hackathon:
          'Use Java Streams `filter().sorted().limit()` to rank top hackathon submissions cleanly inside Spring Boot services.',
        flashcards: [
          {
            q: 'What is the difference between intermediate and terminal operations in Java Streams?',
            a: 'Intermediate operations (`filter`, `map`) are lazy and return a new Stream; terminal operations (`toList`, `collect`, `count`) trigger execution.',
          },
        ],
        code: {
          language: 'java',
          title: 'Java Streams Filter & Sort Pipeline (Java)',
          snippet: `import java.util.*;

public class Main {
    record Builder(String name, int elo) {}
    public static void main(String[] args) {
        var list = List.of(new Builder("A", 1200), new Builder("B", 1750), new Builder("C", 1520));
        var top = list.stream().filter(b -> b.elo() >= 1500)
            .sorted(Comparator.comparingInt(Builder::elo).reversed())
            .map(Builder::name).toList();
        System.out.println("Top Arena Builders: " + top);
    }
}`,
        },
      },
      {
        hackathon:
          'Combine Java `Predicate<T>` filters to build dynamic teammate search endpoints in Spring Boot.',
        flashcards: [
          {
            q: 'What makes an interface a `@FunctionalInterface` in Java?',
            a: 'Having exactly one abstract method (SAM), allowing lambda expressions to implement it concisely.',
          },
        ],
        code: {
          language: 'java',
          title: 'Composable Functional Predicate Filter (Java)',
          snippet: `import java.util.function.Predicate;

public class Main {
    public static void main(String[] args) {
        Predicate<String> hasJava = s -> s.contains("java");
        Predicate<String> hasSql = s -> s.contains("sql");
        System.out.println("Match both:", hasJava.and(hasSql).test("java+sql+react"));
    }
}`,
        },
      },
    ],
  },
  {
    book: {
      id: 'java-concurrency',
      index: 15,
      title: 'Java Concurrency in Practice',
      shortTitle: 'Java Concurrency',
      author: 'Brian Goetz',
      year: '2006',
      isbn: '9780321349606',
      coverUrl: cover('9780321349606'),
      spineColor: '#581C87',
      accentHex: '#C084FC',
      category: 'Systems',
      pages: 432,
      tagline: 'Pro-level JVM multithreading: Thread Pools, Locks, Atomic CAS, and ConcurrentHashMap.',
      chapters: [
        {
          number: '01',
          title: 'Thread Safety, Atomicity & Visibility (volatile)',
          summary:
            'Race conditions happen when check-then-act isn’t atomic. Use `AtomicInteger` CAS operations, `ConcurrentHashMap`, and `ExecutorService` thread pools.',
          takeaways: [
            'Never spawn unbounded raw `new Thread()` per request—always use bounded `ExecutorService` pools.',
            '`ConcurrentHashMap` uses bucket-level locking/CAS instead of locking the whole map.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 2, 5 & 6 (of 16)'],
    mentor: {
      goalTags: ['Java & Architecture', 'CS Deep Dive'],
      level: 'Pro',
      languageGroup: 'Java',
      totalRealChapters: 16,
      quickVerdict: 'Senior-Level Multithreading Weapon (4th Year / Top Backend)',
      useWhen:
        'You are interviewing for SDE-1/backend roles at Amazon, Goldman Sachs, Atlassian, or Flipkart where they grill you on Deadlocks, `ConcurrentHashMap`, Thread Pools, and `volatile`.',
      skipWhen:
        'You are still learning Java basics or doing pure web frontend—finish Core Java & Effective Java first.',
      onlyChaptersYouNeed:
        'Read ONLY Ch. 2 (Thread Safety & Check-Then-Act), Ch. 5 (ConcurrentHashMap & BlockingQueues), Ch. 6 (Executor Thread Pools), and Ch. 10 (Deadlock Prevention).',
      recommendedPairTitle: 'Effective Java (Pair for Clean API Design)',
      recommendedPairBookId: 'effective-java',
    },
    chapterMetas: [
      {
        hackathon:
          'Never store shared hackathon leaderboard state in a normal `HashMap` across concurrent requests—use `ConcurrentHashMap` + `AtomicInteger` so votes never get lost.',
        flashcards: [
          {
            q: 'What is the difference between `volatile` and `AtomicInteger` in Java?',
            a: '`volatile` only guarantees memory visibility across threads, NOT compound atomicity (`count++`). `AtomicInteger` uses CPU Compare-And-Swap (CAS) for lock-free atomic updates.',
          },
        ],
        code: {
          language: 'java',
          title: 'Thread-Safe Atomic Counter & ConcurrentMap (Java)',
          snippet: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        ConcurrentHashMap<String, AtomicInteger> votes = new ConcurrentHashMap<>();
        votes.computeIfAbsent("TeamAlpha", k -> new AtomicInteger()).incrementAndGet();
        votes.computeIfAbsent("TeamAlpha", k -> new AtomicInteger()).incrementAndGet();
        System.out.println("Safe concurrent votes: " + votes.get("TeamAlpha").get());
    }
}`,
        },
      },
    ],
  },

  // ================= CSS & FRONTEND TRACK (BEGINNER -> CORE -> PRO) =================
  {
    book: {
      id: 'html-css-duckett',
      index: 16,
      title: 'HTML & CSS: Design and Build Websites',
      shortTitle: 'HTML & CSS (Duckett)',
      author: 'Jon Duckett',
      year: '2011',
      isbn: '9781118008188',
      coverUrl: cover('9781118008188'),
      spineColor: '#0E7490',
      accentHex: '#22D3EE',
      category: 'Craft',
      pages: 490,
      tagline: 'The clearest visual foundation for semantic HTML5, Box Model, typography, and layout.',
      chapters: [
        {
          number: '01',
          title: 'Semantic HTML5 & The CSS Box Model',
          summary:
            'Every HTML element is a rectangular box (`content + padding + border + margin`). Using `box-sizing: border-box` and semantic tags (`<main>`, `<section>`, `<article>`) prevents layout bugs and boosts Google SEO.',
          takeaways: [
            'Always wrap layouts in `* { box-sizing: border-box; }` so padding never breaks widths.',
            'Semantic HTML improves accessibility and Google Search ranking automatically.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 8, 13 & 15 (of 19)'],
    mentor: {
      goalTags: ['Clean Code & PRs'],
      level: 'Beginner',
      languageGroup: 'CSS & Frontend',
      totalRealChapters: 19,
      quickVerdict: 'Best Visual Beginner Book for HTML & CSS',
      useWhen:
        'You are building your first websites/UI or keep struggling with `margin` vs `padding`, semantic HTML, and spacing.',
      skipWhen:
        'You already build Tailwind / React responsive layouts comfortably—jump to CSS: The Definitive Guide (Flexbox/Grid) or CSS Secrets.',
      onlyChaptersYouNeed:
        'Out of 19 chapters, focus ONLY on Ch. 8 (Semantic Markup), Ch. 13 (Boxes: Margin, Padding, Border), Ch. 15 (Layout Positioning), and Ch. 16 (Images).',
      recommendedPairTitle: 'CSS: The Definitive Guide (Core Flexbox & Grid)',
      recommendedPairBookId: 'css-definitive-guide',
    },
    chapterMetas: [
      {
        hackathon:
          'Google SEO and accessibility judges immediately dock points for `<div>` soup. Use `<header>`, `<nav>`, `<main>`, `<button>` properly in every Next.js page.',
        flashcards: [
          {
            q: 'What is the difference between `content-box` and `border-box` in CSS?',
            a: 'With `content-box`, adding padding increases the total rendered width. With `border-box`, padding and border stay inside the declared width.',
          },
        ],
        code: {
          language: 'python',
          title: 'CSS Box Model Width Calculator (Python)',
          snippet: `def total_width(width, padding, border, box_sizing="border-box"):
    if box_sizing == "border-box":
        return width
    return width + 2 * padding + 2 * border

print("content-box total width:", total_width(300, 20, 2, "content-box"), "px")
print("border-box total width:", total_width(300, 20, 2, "border-box"), "px")`,
        },
      },
    ],
  },
  {
    book: {
      id: 'css-definitive-guide',
      index: 17,
      title: 'CSS: The Definitive Guide (5th Edition)',
      shortTitle: 'CSS Definitive Guide',
      author: 'Eric A. Meyer & Estelle Weyl',
      year: '2023',
      isbn: '9781098117610',
      coverUrl: cover('9781098117610'),
      spineColor: '#0284C7',
      accentHex: '#38BDF8',
      category: 'Architecture',
      pages: 1100,
      tagline: 'Deep mastery of Specificity, Cascade Layers, Flexbox, CSS Grid & Responsive Systems.',
      chapters: [
        {
          number: '01',
          title: 'Specificity, Cascade & Flexbox / Grid Layouts',
          summary:
            'Master Flexbox for 1D alignment (`justify-content`, `align-items`) and CSS Grid for 2D responsive dashboards without fighting `!important`.',
          takeaways: [
            'Never use `!important` to fight selectors—understand specificity `(ID, Class, Element)`.',
            'Use `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` for automatic responsive grids with zero media queries.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 3, 12 & 13 (of 20)'],
    mentor: {
      goalTags: ['Hackathon Backend', 'Clean Code & PRs'],
      level: 'Core',
      languageGroup: 'CSS & Frontend',
      totalRealChapters: 20,
      quickVerdict: 'End Every CSS Layout Struggle Forever',
      useWhen:
        'You use CSS / Tailwind daily in React/Next.js and want to understand Flexbox, CSS Grid, Positioning, and Specificity completely so layouts stop breaking.',
      skipWhen:
        'Do NOT read all 1,100 pages cover-to-cover! Treat it as a surgical 80/20 reference.',
      onlyChaptersYouNeed:
        'Read ONLY Ch. 3 (Specificity & Cascade), Ch. 12 (Flexible Box Layout / Flexbox), Ch. 13 (Grid Layout), and Ch. 17 (Transitions & Transforms for 60fps animations).',
      recommendedPairTitle: 'CSS Secrets by Lea Verou (Pro Visual Effects)',
      recommendedPairBookId: 'css-secrets',
    },
    chapterMetas: [
      {
        hackathon:
          'Use CSS Grid `minmax(280px, 1fr)` for responsive cards and `transform`/`opacity` only for animations so your hackathon UI renders at buttery 60/120fps.',
        flashcards: [
          {
            q: 'When should you choose Flexbox vs CSS Grid?',
            a: 'Use Flexbox for 1-dimensional tracks (navbars, button rows, centering); use CSS Grid for 2-dimensional page layouts with synchronized rows and columns.',
          },
        ],
        code: {
          language: 'python',
          title: 'CSS Specificity Weight Evaluator (Python)',
          snippet: `def specificity(ids, classes, tags):
    return (ids, classes, tags)

a = specificity(0, 2, 1)  # .card.active span
b = specificity(1, 0, 0)  # #header
print("Selector A:", a, "| Selector B:", b, "| Winner:", "B" if b > a else "A")`,
        },
      },
    ],
  },
  {
    book: {
      id: 'css-secrets',
      index: 18,
      title: 'CSS Secrets',
      shortTitle: 'CSS Secrets',
      author: 'Lea Verou',
      year: '2015',
      isbn: '9781449372637',
      coverUrl: cover('9781449372637'),
      spineColor: '#BE185D',
      accentHex: '#F472B6',
      category: 'Craft',
      pages: 392,
      tagline: '47 Pro techniques for frosted glassmorphism, gradients, custom shapes, and silky UI polish.',
      chapters: [
        {
          number: '01',
          title: 'DRY Visual Systems, Glassmorphism & Gradients',
          summary:
            'Use CSS custom properties (`--accent`), `currentColor`, multi-stop translucent borders, and `backdrop-filter` to craft studio-grade dark luxury interfaces.',
          takeaways: [
            'Tie border/glow accents to CSS variables so changing one theme token re-skins the entire component.',
            'Combine subtle 1px hairline translucent borders (`rgba(255,255,255,0.12)`) with inner radial glows for premium dark UI.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 1, 2 & 5 (of 8)'],
    mentor: {
      goalTags: ['Clean Code & PRs'],
      level: 'Pro',
      languageGroup: 'CSS & Frontend',
      totalRealChapters: 8,
      quickVerdict: 'Make Judges Think a Senior Designer Built Your UI',
      useWhen:
        'You already know Flexbox/Grid and want Stripe/Linear/Vercel-grade dark UI craft, subtle borders, frosted glass, and clever animation tricks.',
      skipWhen:
        'You are still learning basic HTML/CSS positioning—master CSS Definitive Guide Ch. 12–13 first.',
      onlyChaptersYouNeed:
        'Read Ch. 1 (DRY CSS & Custom Properties), Ch. 2 (Backgrounds & Hairline Borders), Ch. 5 (Typography & Readability), and Ch. 8 (Smooth Transitions).',
      recommendedPairTitle: 'Eloquent JavaScript / Effective TypeScript',
      recommendedPairBookId: 'effective-ts',
    },
    chapterMetas: [
      {
        hackathon:
          'First impressions decide 40% of hackathon scores. Dark surfaces (`#0B101B`), crisp `1px solid rgba(255,255,255,0.12)` borders, and readable typography instantly outclass generic Bootstrap/MUI templates.',
        flashcards: [
          {
            q: 'Why animate `transform` and `opacity` instead of `width`, `top`, or `margin`?',
            a: 'Animating `width`/`top` forces browser layout reflow and paint on every frame (laggy); `transform` and `opacity` run purely on the GPU compositor at 60–120fps.',
          },
        ],
        code: {
          language: 'python',
          title: 'WCAG Contrast Ratio Checker for Dark UI (Python)',
          snippet: `def luminance(rgb):
    vals = []
    for c in rgb:
        s = c / 255.0
        vals.append(s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4)
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2]

def contrast(c1, c2):
    l1, l2 = luminance(c1), luminance(c2)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

ratio = contrast((244, 243, 239), (16, 15, 13))
print(f"Dark Folio Text Contrast: {ratio:.2f}:1 (WCAG AAA >= 7:1 -> {ratio >= 7})")`,
        },
      },
    ],
  },

  // ================= JS & TYPESCRIPT TRACK =================
  {
    book: {
      id: 'eloquent-js',
      index: 19,
      title: 'Eloquent JavaScript (4th Edition)',
      shortTitle: 'Eloquent JS',
      author: 'Marijn Haverbeke',
      year: '2024',
      isbn: '9781718504103',
      coverUrl: cover('9781718504103'),
      spineColor: '#A16207',
      accentHex: '#FACC15',
      category: 'Craft',
      pages: 456,
      tagline: 'Master JS closures, higher-order functions, async/await, and DOM fundamentals.',
      chapters: [
        {
          number: '01',
          title: 'Closures, Higher-Order Functions & Async/Await',
          summary:
            'Functions capture lexical scope (closures), and Promises / `async-await` coordinate non-blocking network calls without callback hell.',
          takeaways: [
            'Use `Promise.all([...])` to fetch independent APIs concurrently instead of sequential `await` loops.',
            'Understand how closures power React hooks and event handlers.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 3, 5 & 11 (of 21)'],
    mentor: {
      goalTags: ['Hackathon Backend', 'Clean Code & PRs'],
      level: 'Beginner',
      languageGroup: 'JS & TypeScript',
      totalRealChapters: 21,
      quickVerdict: 'Best Foundation Before Touching React or Node.js',
      useWhen:
        'You use React/Next.js by copying tutorials but still get tripped up by `async/await`, `.map/.reduce`, closures, or `this`.',
      skipWhen:
        'You already know closures, Event Loop, and Promises deeply—move to YDKJS or Effective TypeScript.',
      onlyChaptersYouNeed:
        'Read ONLY Ch. 3 (Functions & Closures), Ch. 5 (Higher-Order Functions), Ch. 6 (Objects), and Ch. 11 (Asynchronous Programming). Skip the tiny-language project chapters at the end.',
      recommendedPairTitle: 'You Don’t Know JS Yet (Core) or Effective TypeScript (Pro)',
      recommendedPairBookId: 'effective-ts',
    },
    chapterMetas: [
      {
        hackathon:
          'Using `Promise.all` instead of 4 sequential `await` calls cuts Next.js API response latency by 3–4x immediately.',
        flashcards: [
          {
            q: 'What is a JavaScript Closure?',
            a: 'A function bundled together with references to its surrounding lexical environment, allowing an inner function to remember outer variables even after the outer function has returned.',
          },
        ],
        code: {
          language: 'python',
          title: 'Closure & Counter Encapsulation Demo (Python)',
          snippet: `def make_rate_limiter(max_calls):
    calls = 0
    def allow():
        nonlocal calls
        if calls >= max_calls:
            return False
        calls += 1
        return True
    return allow

limiter = make_rate_limiter(2)
print("Req 1:", limiter(), "| Req 2:", limiter(), "| Req 3:", limiter())`,
        },
      },
    ],
  },
  {
    book: {
      id: 'ydkjs',
      index: 20,
      title: "You Don't Know JS Yet: Scope, Closures & Async",
      shortTitle: "You Don't Know JS",
      author: 'Kyle Simpson',
      year: '2020',
      isbn: '9798602477429',
      coverUrl: cover('9798602477429'),
      spineColor: '#CA8A04',
      accentHex: '#FDE047',
      category: 'Systems',
      pages: 280,
      tagline: 'Understand the JS Event Loop, Microtask Queue, Lexical Scope & Prototypes deeply.',
      chapters: [
        {
          number: '01',
          title: 'Event Loop, Microtasks vs Macrotasks & Scope',
          summary:
            'Promises execute on the high-priority Microtask queue right after the synchronous call stack clears—always before `setTimeout` macrotasks.',
          takeaways: [
            'Heavy synchronous loops block the single JS Event Loop and freeze React UI rendering.',
            'Use `let`/`const` block scoping to avoid classic loop closure bugs.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 2, 5 & 7 (Scope & Closures)'],
    mentor: {
      goalTags: ['Placement & OAs', 'Hackathon Backend'],
      level: 'Core',
      languageGroup: 'JS & TypeScript',
      totalRealChapters: 8,
      quickVerdict: 'Ace Every Frontend / Node.js Interview Question',
      useWhen:
        'Frontend/Full-stack interviewers ask output-prediction questions on Event Loop (`Promise` vs `setTimeout`), hoisting, closures, and `this` binding.',
      skipWhen:
        'You don’t know basic JavaScript arrays/functions yet—read Eloquent JS first.',
      onlyChaptersYouNeed:
        'Focus on Lexical Scope & Hoisting (Ch. 2–5), Closure Lifecycle (Ch. 7), and Event Loop + Microtask Queue ordering.',
      recommendedPairTitle: 'Effective TypeScript (Upgrade to Pro)',
      recommendedPairBookId: 'effective-ts',
    },
    chapterMetas: [
      {
        hackathon:
          'Never run heavy CPU loops inside Next.js API routes synchronously—stream responses or offload to background workers so the Node.js Event Loop stays responsive.',
        flashcards: [
          {
            q: 'In JavaScript, which runs first after synchronous code finishes: `Promise.then()` or `setTimeout(..., 0)`?',
            a: '`Promise.then()` runs first because it sits in the Microtask queue, which drains completely before the next Macrotask (`setTimeout`) executes.',
          },
        ],
        code: {
          language: 'python',
          title: 'Event Loop Microtask vs Macrotask Order Simulator (Python)',
          snippet: `sync_stack = ["1. Start Sync", "4. End Sync"]
microtasks = ["2. Promise.then()"]
macrotasks = ["3. setTimeout(0)"]

order = sync_stack + microtasks + macrotasks
print("JS Execution Order:")
for step in order:
    print(" ->", step)`,
        },
      },
    ],
  },
  {
    book: {
      id: 'effective-ts',
      index: 21,
      title: 'Effective TypeScript (2nd Edition)',
      shortTitle: 'Effective TypeScript',
      author: 'Dan Vanderkam',
      year: '2024',
      isbn: '9781098155063',
      coverUrl: cover('9781098155063'),
      spineColor: '#1E40AF',
      accentHex: '#60A5FA',
      category: 'Architecture',
      pages: 340,
      tagline: '83 pro TypeScript items: Discriminated Unions, Type Narrowing & Zero `any` bugs.',
      chapters: [
        {
          number: '01',
          title: 'Discriminated Unions & Type Narrowing',
          summary:
            'Model states cleanly with tagged unions (`{ status: "ok", data } | { status: "error", message }`) so impossible UI/API states become unrepresentable at compile time.',
          takeaways: [
            'Eliminate `isLoading + error + data` boolean soup with a single discriminated union state.',
            'Prefer `unknown` over `any` for untrusted API JSON responses and validate with type guards.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 2, 3 & 4 (Items 18–36)'],
    mentor: {
      goalTags: ['Hackathon Backend', 'Clean Code & PRs'],
      level: 'Pro',
      languageGroup: 'JS & TypeScript',
      totalRealChapters: 8,
      quickVerdict: 'Eliminate Runtime Undefined Crashes in Next.js & Node',
      useWhen:
        'You build TypeScript/Next.js apps and want zero `Cannot read properties of undefined` errors, clean generics, and pro-level API types.',
      skipWhen:
        'You are still learning basic JS—read Eloquent JS & YDKJS first.',
      onlyChaptersYouNeed:
        'Read Items 1–5 (Type vs Runtime), Ch. 3 (Type Narrowing & Control Flow), and Ch. 4 (Discriminated Unions & Making Invalid States Unrepresentable).',
      recommendedPairTitle: 'Clean Architecture (Scale Full-Stack Apps)',
      recommendedPairBookId: 'clean-architecture',
    },
    chapterMetas: [
      {
        hackathon:
          'Model AI/API responses as Discriminated Unions so your React UI handles loading, error, and success exhaustively without crashing during demos.',
        flashcards: [
          {
            q: 'Why is `unknown` safer than `any` in TypeScript?',
            a: '`any` disables type checking completely; `unknown` forces you to narrow or validate the runtime type before accessing properties.',
          },
        ],
        code: {
          language: 'python',
          title: 'Tagged Discriminated Result Pattern (Python)',
          snippet: `def handle_api(res):
    if res["status"] == "ok":
        return f"Rendered data: {res['data']}"
    return f"Handled error cleanly: {res['error']}"

print(handle_api({"status": "ok", "data": "Build Passed"}))
print(handle_api({"status": "error", "error": "Timeout"}))`,
        },
      },
    ],
  },

  // ================= PYTHON & 4TH YEAR AI/ML TRACK =================
  {
    book: {
      id: 'python-crash-course',
      index: 22,
      title: 'Python Crash Course (3rd Edition)',
      shortTitle: 'Python Crash Course',
      author: 'Eric Matthes',
      year: '2023',
      isbn: '9781718502703',
      coverUrl: cover('9781718502703'),
      spineColor: '#047857',
      accentHex: '#34D399',
      category: 'Craft',
      pages: 552,
      tagline: 'Fastest hands-on Python foundation: Lists, Dicts, OOP, Testing & API Projects.',
      chapters: [
        {
          number: '01',
          title: 'Pythonic Data Structures, Comprehensions & APIs',
          summary:
            'Master Python lists, slices, dictionaries, functions, and automated pytest testing so you can prototype backends and DSA scripts rapidly.',
          takeaways: [
            'List and dictionary comprehensions make data transforms 3x shorter and faster.',
            'Keep virtual environments (`venv`) clean for every Python project.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 3–11 (Part I Core Python)'],
    mentor: {
      goalTags: ['Placement & OAs'],
      level: 'Beginner',
      languageGroup: 'Python & AI/ML',
      totalRealChapters: 20,
      quickVerdict: 'Fastest Way to Become Productive in Python',
      useWhen:
        'You are new to Python or switching from C/Java for hackathons, scripting, FastAPI, or AI/ML courses.',
      skipWhen:
        'You already write Python cleanly—jump straight to Fluent Python (Core) or Hands-On ML (4th Year AI).',
      onlyChaptersYouNeed:
        'Read Part I ONLY (Ch. 3–11: Lists, Dicts, Functions, Classes, Files/Exceptions, Testing) — skip Part II Pygame alien shooter if your goal is AI or Backend.',
      recommendedPairTitle: 'Fluent Python (Core) or Hands-On ML (4th Year AI)',
      recommendedPairBookId: 'fluent-python',
    },
    chapterMetas: [
      {
        hackathon:
          'Python lets you solve DSA OAs in half the lines of C++/Java and wire FastAPI + Gemini APIs in under 30 minutes at hackathons.',
        flashcards: [
          {
            q: 'What is the time complexity of `x in my_list` vs `x in my_set` in Python?',
            a: '`x in my_list` is O(N) linear scan, whereas `x in my_set` or `my_dict` is O(1) average hash lookup.',
          },
        ],
        code: {
          language: 'python',
          title: 'Pythonic Comprehensions & O(1) Set Filtering (Python)',
          snippet: `candidates = [("Aarav", 1620), ("Diya", 1410), ("Rohan", 1780)]
pro_names = [name for name, elo in candidates if elo >= 1500]
print("Pro Arena Builders:", pro_names)`,
        },
      },
    ],
  },
  {
    book: {
      id: 'fluent-python',
      index: 23,
      title: 'Fluent Python (2nd Edition)',
      shortTitle: 'Fluent Python',
      author: 'Luciano Ramalho',
      year: '2022',
      isbn: '9781492056355',
      coverUrl: cover('9781492056355'),
      spineColor: '#0F766E',
      accentHex: '#2DD4BF',
      category: 'Systems',
      pages: 1014,
      tagline: 'Master idiomatic Python: Data Model, Generators, Decorators, Type Hints & Asyncio.',
      chapters: [
        {
          number: '01',
          title: 'Python Data Model, Generators & Asyncio',
          summary:
            'Understand dunder methods (`__iter__`, `__getitem__`), memory-saving generators (`yield`), and non-blocking `asyncio.gather` concurrency.',
          takeaways: [
            'Use generator expressions `(x*x for x in seq)` instead of lists for large data streams.',
            'Run concurrent LLM/HTTP requests with `asyncio.gather()` to parallelize I/O cleanly.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 1, 9, 17 & 21 (of 24)'],
    mentor: {
      goalTags: ['Hackathon Backend', 'CS Deep Dive'],
      level: 'Core',
      languageGroup: 'Python & AI/ML',
      totalRealChapters: 24,
      quickVerdict: 'Write Python Like a Senior AI/Backend Engineer',
      useWhen:
        'You write FastAPI, data pipelines, or LLM backends and want true mastery of Decorators, Generators, Type Hints, and `asyncio`.',
      skipWhen:
        'You are still learning Python loops and dictionaries—finish Python Crash Course first.',
      onlyChaptersYouNeed:
        'Out of 1,000 pages, read ONLY Ch. 1 (Data Model), Ch. 5 (Data Classes), Ch. 9 (Decorators & Closures), Ch. 17 (Iterators & Generators), and Ch. 21 (Asyncio).',
      recommendedPairTitle: 'Designing Machine Learning Systems (4th Year Pro AI)',
      recommendedPairBookId: 'designing-ml-systems',
    },
    chapterMetas: [
      {
        hackathon:
          'When calling multiple AI tools or database queries in FastAPI, `asyncio.gather` runs them concurrently in the same wall-clock latency as the single slowest call.',
        flashcards: [
          {
            q: 'What is Python’s GIL (Global Interpreter Lock) and when does `asyncio` still make apps faster?',
            a: 'The GIL prevents two threads executing Python bytecode on multiple CPU cores at once, but `asyncio` shines on I/O-bound workloads (HTTP, LLM APIs, DB queries) because tasks yield while waiting on network sockets.',
          },
        ],
        code: {
          language: 'python',
          title: 'Memory-Efficient Generator & Dataclass (Python)',
          snippet: `from dataclasses import dataclass

@dataclass(frozen=True)
class ModelRun:
    name: str
    tokens: int

runs = [ModelRun("KA-1", 450), ModelRun("KA-Pro", 1200)]
total = sum(r.tokens for r in runs)
print("Total tokens via O(1) generator:", total)`,
        },
      },
    ],
  },
  {
    book: {
      id: 'hands-on-ml',
      index: 24,
      title: 'Hands-On Machine Learning (3rd Edition)',
      shortTitle: 'Hands-On ML',
      author: 'Aurélien Géron',
      year: '2022',
      isbn: '9781098125974',
      coverUrl: cover('9781098125974'),
      spineColor: '#065F46',
      accentHex: '#10B981',
      category: 'Algorithms',
      pages: 860,
      tagline: '4th-Year AI/ML Bible: End-to-End Scikit-Learn, Gradient Descent, CNNs & Transformers.',
      chapters: [
        {
          number: '01',
          title: 'End-to-End ML Pipeline, Validation & Transformers',
          summary:
            'Always split train/val/test BEFORE touching preprocessing to avoid data leakage. Master Cross-Validation, Precision/Recall tradeoffs, and Attention architectures.',
          takeaways: [
            'Check Precision vs Recall—accuracy is misleading on imbalanced fraud/medical datasets.',
            'Understand Self-Attention (`Q, K, V`) behind all modern LLMs.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 2, 3, 4 & 16 (of 19)'],
    mentor: {
      goalTags: ['CS Deep Dive', 'Hackathon Backend'],
      level: 'Pro',
      languageGroup: 'Python & AI/ML',
      totalRealChapters: 19,
      quickVerdict: 'The #1 4th-Year AI/ML Capstone & Interview Book',
      useWhen:
        'You are in 3rd/4th year doing AI/ML specialization, capstone projects, Kaggle, or Data Science / ML Engineer placements.',
      skipWhen:
        'You only want to call existing LLM APIs (Gemini/OpenAI) in web apps—read Designing ML Systems instead.',
      onlyChaptersYouNeed:
        'Read ONLY Ch. 2 (End-to-End ML & Preventing Data Leakage), Ch. 3 (Precision/Recall/ROC), Ch. 4 (Gradient Descent & Regularization), Ch. 7 (Random Forests/XGBoost), and Ch. 16 (Transformers & Attention).',
      recommendedPairTitle: 'Designing Machine Learning Systems (Production AI)',
      recommendedPairBookId: 'designing-ml-systems',
    },
    chapterMetas: [
      {
        hackathon:
          'In 4th-year AI hackathons, judges ask about evaluation metrics! Show F1-score / Confusion Matrix and explain why you prevented train-test data leakage.',
        flashcards: [
          {
            q: 'What is Data Leakage in Machine Learning and how do you prevent it?',
            a: 'Data leakage occurs when test-set statistics (like scaling mean/variance) leak into training. Prevent it by splitting data FIRST and fitting scalers inside a `Pipeline` strictly on the training fold.',
          },
        ],
        code: {
          language: 'python',
          title: 'Precision, Recall & F1-Score Evaluator (Python)',
          snippet: `def eval_metrics(tp, fp, fn):
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    f1 = 2 * (precision * recall) / (precision + recall)
    return round(precision, 3), round(recall, 3), round(f1, 3)

p, r, f1 = eval_metrics(tp=85, fp=10, fn=15)
print(f"Precision: {p} | Recall: {r} | F1-Score: {f1}")`,
        },
      },
    ],
  },
  {
    book: {
      id: 'designing-ml-systems',
      index: 25,
      title: 'Designing Machine Learning Systems',
      shortTitle: 'Designing ML Systems',
      author: 'Chip Huyen',
      year: '2022',
      isbn: '9781098107963',
      coverUrl: cover('9781098107963'),
      spineColor: '#115E59',
      accentHex: '#5EEAD4',
      category: 'Architecture',
      pages: 386,
      tagline: '4th-Year Pro AI Engineering: Production RAG, Latency, Data Drift & MLOps.',
      chapters: [
        {
          number: '01',
          title: 'Production AI Architecture, Drift & Evaluation',
          summary:
            'Models are only 10% of production AI; 90% is evaluation harnesses, data pipelines, latency budgets, and detecting distribution drift.',
          takeaways: [
            'Always pair automated unit evals with latency & cost monitoring per user query.',
            'Start with simple baselines (or pre-trained APIs) before training custom models.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 1, 6, 7 & 8 (of 11)'],
    mentor: {
      goalTags: ['Hackathon Backend', 'CS Deep Dive'],
      level: 'Pro',
      languageGroup: 'Python & AI/ML',
      totalRealChapters: 11,
      quickVerdict: 'Secret Weapon for AI Startup & Applied AI Interviews',
      useWhen:
        'You are building AI products/agents (RAG, LLMs, voice/vision apps) in 4th year or interviewing at AI startups.',
      skipWhen:
        'You haven’t trained or evaluated basic ML models yet—start with Hands-On ML Ch. 2–3.',
      onlyChaptersYouNeed:
        'Read Ch. 1 (ML Systems Overview), Ch. 6 (Model Eval & Baselines), Ch. 7 (Deployment & Latency Optimization), and Ch. 8 (Data Drift & Monitoring).',
      recommendedPairTitle: 'Designing Data-Intensive Applications (DDIA)',
      recommendedPairBookId: 'ddia',
    },
    chapterMetas: [
      {
        hackathon:
          'When judges ask "What happens if your AI hallucinates?", explain Chip Huyen’s guardrail pattern: automated verifier checks + confidence fallback before returning output to users.',
        flashcards: [
          {
            q: 'What is Covariate Shift (Data Drift) in production AI?',
            a: 'When real-world user inputs in production drift away from the training distribution (e.g., seasonal traffic or new slang), causing accuracy to drop silently without code changes.',
          },
        ],
        code: {
          language: 'python',
          title: 'LLM Cost & Token Latency Budget Check (Python)',
          snippet: `def estimate_run(prompt_tokens, out_tokens, price_per_1m_in=0.10, price_per_1m_out=0.40):
    cost_usd = (prompt_tokens * price_per_1m_in + out_tokens * price_per_1m_out) / 1_000_000
    return round(cost_usd * 85, 4)  # INR estimate

print("Estimated cost for 10K runs (INR):", round(estimate_run(1500, 600) * 10000, 2))`,
        },
      },
    ],
  },

  // ================= C & C++ TRACK =================
  {
    book: {
      id: 'kr-c',
      index: 26,
      title: 'The C Programming Language (K&R, 2nd Ed.)',
      shortTitle: 'K&R C Book',
      author: 'Brian Kernighan & Dennis Ritchie',
      year: '1988',
      isbn: '9780131103627',
      coverUrl: cover('9780131103627'),
      spineColor: '#334155',
      accentHex: '#94A3B8',
      category: 'Systems',
      pages: 272,
      tagline: 'Thin, crystal-clear classic on C pointers, memory layout, structs, and systems thinking.',
      chapters: [
        {
          number: '01',
          title: 'Pointers, Arrays & Stack/Heap Memory Layout',
          summary:
            'In C, arrays decay to pointers (`*(a + i) == a[i]`). Mastering pointer arithmetic unlocks OS kernels, embedded firmware, and zero-bug C++ foundations.',
          takeaways: [
            'Never return pointers to stack-allocated local arrays—their frame is popped on return.',
            'Pair every `malloc`/`calloc` cleanly with `free` and `NULL` checks.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 1, 5 & 6 (of 8)'],
    mentor: {
      goalTags: ['Placement & OAs', 'CS Deep Dive'],
      level: 'Beginner',
      languageGroup: 'C & C++',
      totalRealChapters: 8,
      quickVerdict: 'Short (272 Pages) Masterpiece for C & Pointers',
      useWhen:
        'You need rock-solid C pointer/memory fundamentals for Gate, Embedded systems, OS labs, or hardware/systems placements (Qualcomm, Nvidia, Cisco).',
      skipWhen:
        'You only use C++ STL for DSA contests—read Competitive Programmer’s Handbook instead.',
      onlyChaptersYouNeed:
        'Read Ch. 1 (Tutorial Intro), Ch. 5 (Pointers & Arrays — the single best explanation of pointers ever written), and Ch. 6 (Structures & Linked Lists).',
      recommendedPairTitle: 'Operating Systems: Three Easy Pieces (OSTEP)',
      recommendedPairBookId: 'ostep',
    },
    chapterMetas: [
      {
        hackathon:
          'Knowing raw memory alignment and pointers explains why Python/JS arrays allocate differently and helps win hardware/IoT hackathon tracks.',
        flashcards: [
          {
            q: 'What is a Dangling Pointer vs a Memory Leak in C?',
            a: 'A dangling pointer still references memory that was already `free()`d (undefined behavior); a memory leak happens when `malloc`d memory loses all pointers without `free()`.',
          },
        ],
        code: {
          language: 'cpp',
          title: 'Pointer Arithmetic vs Array Indexing (C++)',
          snippet: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {10, 20, 30, 40};
    int* p = arr;
    cout << "*(p + 2) == arr[2]: " << *(p + 2) << "\\n";
    return 0;
}`,
        },
      },
    ],
  },
  {
    book: {
      id: 'cpp-ppp',
      index: 27,
      title: 'Programming: Principles and Practice Using C++',
      shortTitle: 'C++ Principles (Bjarne)',
      author: 'Bjarne Stroustrup',
      year: '2024',
      isbn: '9780138308681',
      coverUrl: cover('9780138308681'),
      spineColor: '#1E3A8A',
      accentHex: '#60A5FA',
      category: 'Craft',
      pages: 720,
      tagline: 'Learn modern C++ directly from its creator: `vector`, RAII, references & clean design.',
      chapters: [
        {
          number: '01',
          title: 'Vectors, References & RAII Resource Safety',
          summary:
            'Use `std::vector`, `std::string`, and const references (`const T&`) from day one rather than old C-style raw arrays and `new`/`delete`.',
          takeaways: [
            'Pass large vectors/strings by `const&` to avoid expensive O(N) deep copies.',
            'RAII ties resource cleanup to object lifetime destructors automatically.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 4, 8 & 17 (of 21)'],
    mentor: {
      goalTags: ['Placement & OAs'],
      level: 'Beginner',
      languageGroup: 'C & C++',
      totalRealChapters: 21,
      quickVerdict: 'Learn Modern C++ Cleanly Without Legacy C Habits',
      useWhen:
        'You are starting C++ cleanly for college engineering and want modern habits (`std::vector`, `const&`, RAII) instead of outdated Turbo-C patterns.',
      skipWhen:
        'You already know C++ syntax and just want DSA speed—jump directly to Competitive Programmer’s Handbook or Effective Modern C++.',
      onlyChaptersYouNeed:
        'Focus on Ch. 4 (Vectors & Computation), Ch. 8 (Functions & Pass-by-Const-Ref), and Ch. 17–19 (Vector, Templates & RAII).',
      recommendedPairTitle: 'Competitive Programmer’s Handbook (Pro Contest C++)',
      recommendedPairBookId: 'cp-handbook',
    },
    chapterMetas: [
      {
        hackathon:
          'Passing large STL containers by value instead of `const&` is the #1 hidden cause of TLE (Time Limit Exceeded) in C++ coding tests.',
        flashcards: [
          {
            q: 'What is the difference between pass-by-value and pass-by-const-reference (`const vector<int>&`) in C++?',
            a: 'Pass-by-value copies every element in O(N) time and memory; `const&` passes a zero-copy read-only alias in O(1) time.',
          },
        ],
        code: {
          language: 'cpp',
          title: 'Zero-Copy Const Reference Traversal (C++)',
          snippet: `#include <iostream>
#include <vector>
using namespace std;

long long sumFast(const vector<int>& nums) {
    long long total = 0;
    for (int x : nums) total += x;
    return total;
}

int main() {
    vector<int> v = {10, 25, 40, 25};
    cout << "Zero-copy sum: " << sumFast(v) << "\\n";
    return 0;
}`,
        },
      },
    ],
  },
  {
    book: {
      id: 'effective-modern-cpp',
      index: 28,
      title: 'Effective Modern C++',
      shortTitle: 'Effective Modern C++',
      author: 'Scott Meyers',
      year: '2014',
      isbn: '9781491903995',
      coverUrl: cover('9781491903995'),
      spineColor: '#1E293B',
      accentHex: '#38BDF8',
      category: 'Systems',
      pages: 334,
      tagline: 'Core/Pro C++14–20 mastery: Smart Pointers (`unique_ptr`), Move Semantics (`std::move`), `auto`.',
      chapters: [
        {
          number: '01',
          title: 'Smart Pointers, Move Semantics & Perfect Forwarding',
          summary:
            'Replace raw `new`/`delete` with `std::unique_ptr` and `std::make_shared`. Move semantics transfer large buffers in O(1) instead of deep-copying.',
          takeaways: [
            'Default to `std::unique_ptr` for sole ownership—zero runtime overhead over raw pointers.',
            'Understand rvalue references (`&&`) and `std::move` before systems/quant interviews.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 4 & 5 (Items 18–30 of 42)'],
    mentor: {
      goalTags: ['CS Deep Dive', 'Placement & OAs'],
      level: 'Core',
      languageGroup: 'C & C++',
      totalRealChapters: 8,
      quickVerdict: 'Mandatory for HFT, Quant, Game Dev & Core C++ Interviews',
      useWhen:
        'You already solve DSA in C++ and are interviewing at systems/quant/gaming companies (Tower Research, NVIDIA, Adobe, Microsoft C++) that ask about Smart Pointers & Move Semantics.',
      skipWhen:
        'You only use C++ STL for standard DSA OAs—Competitive Programmer’s Handbook gives higher OA ROI.',
      onlyChaptersYouNeed:
        'Read ONLY Ch. 4 (Smart Pointers: `unique_ptr` vs `shared_ptr` vs `weak_ptr`) and Ch. 5 (Rvalue References, Move Semantics & `std::move`).',
      recommendedPairTitle: "Competitive Programmer's Handbook",
      recommendedPairBookId: 'cp-handbook',
    },
    chapterMetas: [
      {
        hackathon:
          'Smart pointers eliminate memory leaks completely in C++ systems/robotics hackathons while keeping zero garbage-collector pauses.',
        flashcards: [
          {
            q: 'When do you use `std::weak_ptr` alongside `std::shared_ptr`?',
            a: 'To break circular reference cycles (e.g., parent↔child or observer lists) so reference counts drop to zero cleanly without leaking memory.',
          },
        ],
        code: {
          language: 'cpp',
          title: 'Move Semantics & unique_ptr Ownership (C++)',
          snippet: `#include <iostream>
#include <memory>
#include <vector>
using namespace std;

int main() {
    auto ptr = make_unique<vector<int>>(initializer_list<int>{10, 20, 30});
    auto movedPtr = std::move(ptr);
    cout << "Moved size: " << movedPtr->size() << " | Old null: " << (ptr == nullptr) << "\\n";
    return 0;
}`,
        },
      },
    ],
  },
  {
    book: {
      id: 'cp-handbook',
      index: 29,
      title: "Competitive Programmer's Handbook",
      shortTitle: 'CP Handbook',
      author: 'Antti Laaksonen',
      year: '2018',
      isbn: '9783319725468',
      coverUrl: cover('9783319725468'),
      spineColor: '#047857',
      accentHex: '#4ADE80',
      category: 'Algorithms',
      pages: 300,
      tagline: 'Pro C++ STL Contest Playbook: Fast I/O, Graphs, Segment Trees, DP & Bitmasks.',
      chapters: [
        {
          number: '01',
          title: 'STL Power Tricks, Prefix Sums & Segment Trees',
          summary:
            'Combine `ios::sync_with_stdio(false)`, binary indexed Fenwick/Segment Trees, and bitmask DP to pass strict 1.0s contest time limits.',
          takeaways: [
            'Always add `ios::sync_with_stdio(false); cin.tie(nullptr);` on large C++ inputs.',
            'Use `1LL << k` for 64-bit bitmasks so shifting >= 31 never overflows.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 4, 9, 12 & 13 (of 30)'],
    mentor: {
      goalTags: ['Placement & OAs', 'CS Deep Dive'],
      level: 'Pro',
      languageGroup: 'C & C++',
      totalRealChapters: 30,
      quickVerdict: 'Top-Tier C++ Weapon for ICPC, Codeforces & Hard OAs',
      useWhen:
        'You already know basic C++ and want to climb Battle Arena ELO, win ICPC regionals, or crack tough FAANG/Uber Online Assessments.',
      skipWhen:
        'You haven’t learned `vector`, `map`, and recursion yet—read C++ Principles first.',
      onlyChaptersYouNeed:
        'Focus on Ch. 4 (C++ STL Data Structures), Ch. 7 (Dynamic Programming), Ch. 9 (Range Queries / Fenwick & Segment Trees), and Ch. 12–13 (Graph Traversal & Shortest Paths).',
      recommendedPairTitle: 'CLRS (Formal Proofs) or CTCI (Interview Strategy)',
      recommendedPairBookId: 'ctci',
    },
    chapterMetas: [
      {
        hackathon:
          'Battle Arena & ICPC speed depends on template discipline: pre-write fast I/O, Fenwick Tree, and Dijkstra templates in muscle memory.',
        flashcards: [
          {
            q: 'When should you use a Fenwick Tree (BIT) instead of a Segment Tree?',
            a: 'Use a Fenwick Tree whenever you only need point updates + associative prefix queries (like prefix sums)—it uses 1 array of N+1 ints, half the memory, and is 3x shorter to type in contests.',
          },
        ],
        code: {
          language: 'cpp',
          title: 'Prefix Sum Range Query O(1) (C++)',
          snippet: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {3, 1, 4, 1, 5, 9};
    vector<int> pref(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) pref[i + 1] = pref[i] + a[i];
    cout << "Sum [1..4]: " << (pref[5] - pref[1]) << "\\n";
    return 0;
}`,
        },
      },
    ],
  },

  // ================= 4TH YEAR CORE CS TRACK (OS, DBMS, CN, SYSTEM DESIGN) =================
  {
    book: {
      id: 'ostep',
      index: 30,
      title: 'Operating Systems: Three Easy Pieces (OSTEP)',
      shortTitle: 'OSTEP (OS)',
      author: 'Remzi & Andrea Arpaci-Dusseau',
      year: '2018',
      isbn: '9781985086593',
      coverUrl: cover('9781985086593'),
      spineColor: '#7F1D1D',
      accentHex: '#F87171',
      category: 'Systems',
      pages: 710,
      tagline: '4th-Year Operating Systems: Virtualization, CPU Scheduling, Locks, Semaphores & Paging.',
      chapters: [
        {
          number: '01',
          title: 'Virtualization, Processes vs Threads & Deadlocks',
          summary:
            'Understand how the OS virtualizes CPU (context switching, MLFQ scheduling) and Memory (Virtual Pages & TLB), plus Condition Variables and Deadlock prevention.',
          takeaways: [
            'Threads share Heap & Globals but own separate Stacks and Program Counters.',
            'Always acquire multiple locks in a strict global order to prevent circular-wait deadlocks.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Part I (Ch. 4–20) & Part II (Ch. 26–32)'],
    mentor: {
      goalTags: ['Placement & OAs', 'CS Deep Dive'],
      level: 'Core',
      languageGroup: '4th Year Core CS',
      totalRealChapters: 50,
      quickVerdict: 'Best OS Book for 4th-Year Exams, GATE & Tech Interviews',
      useWhen:
        'You are in 3rd/4th year preparing for Operating Systems interviews (Processes vs Threads, Deadlocks, Paging, Thrashing, Mutex vs Semaphore) or GATE.',
      skipWhen:
        'Don’t read legacy floppy-disk device driver chapters at the end unless writing kernel modules.',
      onlyChaptersYouNeed:
        'Read ONLY Virtualization (Ch. 4 Processes, Ch. 7 Scheduling, Ch. 13–20 Virtual Memory & Paging) + Concurrency (Ch. 26–32 Locks, Condition Vars & Deadlocks).',
      recommendedPairTitle: 'Designing Data-Intensive Applications (DDIA)',
      recommendedPairBookId: 'ddia',
    },
    chapterMetas: [
      {
        hackathon:
          'When Docker containers OOM-crash during hackathon demos, understanding OS Virtual Memory & Linux cgroups lets you size Node/JVM `--max-old-space-size` cleanly.',
        flashcards: [
          {
            q: 'What is the core difference between a Process and a Thread?',
            a: 'Processes have isolated virtual memory address spaces (safe but heavy context switch); Threads inside one process share the same Heap/Code memory while keeping separate Stacks and registers (fast switching).',
          },
          {
            q: 'What are the 4 Coffman conditions required for a Deadlock?',
            a: '1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, 4) Circular Wait. Break any one condition (like ordering locks) to guarantee deadlock freedom.',
          },
        ],
        code: {
          language: 'python',
          title: 'LRU Page Replacement & Page Fault Simulator (Python)',
          snippet: `def simulate_lru(pages, capacity):
    frames = []
    faults = 0
    for p in pages:
        if p in frames:
            frames.remove(p)
            frames.append(p)
        else:
            faults += 1
            if len(frames) == capacity:
                frames.pop(0)
            frames.append(p)
    return faults

trace = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3]
print("Total Page Faults (cap=3):", simulate_lru(trace, 3))`,
        },
      },
    ],
  },
  {
    book: {
      id: 'database-internals',
      index: 31,
      title: 'Database Internals',
      shortTitle: 'DB Internals',
      author: 'Alex Petrov',
      year: '2019',
      isbn: '9781492040347',
      coverUrl: cover('9781492040347'),
      spineColor: '#0F172A',
      accentHex: '#38BDF8',
      category: 'Systems',
      pages: 372,
      tagline: '4th-Year Pro DBMS: B-Tree Indexes, Slotted Pages, MVCC Transactions & Distributed Raft.',
      chapters: [
        {
          number: '01',
          title: 'B-Tree Page Layout, Indexing & MVCC Isolation',
          summary:
            'Explore how Postgres/MySQL InnoDB organize 4KB/16KB pages on disk, why composite index column order matters, and how MVCC lets readers never block writers.',
          takeaways: [
            'Follow the Leftmost Prefix Rule when designing composite SQL indexes `(user_id, created_at)`.',
            'MVCC gives snapshot isolation using row version timestamps without read locks.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 2, 4, 5 & 11 (of 14)'],
    mentor: {
      goalTags: ['CS Deep Dive', 'Hackathon Backend'],
      level: 'Pro',
      languageGroup: '4th Year Core CS',
      totalRealChapters: 14,
      quickVerdict: 'Go Beyond Basic SQL Queries Into Engine Internals',
      useWhen:
        'You are in 4th year wanting to understand how Postgres/MySQL B-Tree indexes, Buffer Pools, Write-Ahead Logs, and ACID isolation actually execute under the hood.',
      skipWhen:
        'You still struggle with basic `JOIN`, `GROUP BY`, and normalization—learn SQL basics first or read DDIA Ch. 2.',
      onlyChaptersYouNeed:
        'Read Part I Core Storage (Ch. 2 B-Tree Basics, Ch. 4 Implementing B-Trees, Ch. 5 Transaction Processing & WAL) and Ch. 11 (Distributed Consensus).',
      recommendedPairTitle: 'Designing Data-Intensive Applications (DDIA)',
      recommendedPairBookId: 'ddia',
    },
    chapterMetas: [
      {
        hackathon:
          'Adding a composite index `CREATE INDEX idx ON applications(hackathon_id, created_at DESC)` drops Postgres query latency from 900ms sequential scan down to 2ms.',
        flashcards: [
          {
            q: 'What is the Leftmost Prefix Rule for a composite SQL index on `(A, B, C)`?',
            a: 'A single B-Tree index on `(A, B, C)` accelerates queries filtering by `(A)`, `(A, B)`, or `(A, B, C)`, but CANNOT efficiently index queries filtering only by `(B)` or `(C)` alone.',
          },
        ],
        code: {
          language: 'python',
          title: 'B-Tree vs Sequential Scan Cost Estimator (Python)',
          snippet: `import math

n_rows = 1_000_000
seq_scan_ops = n_rows
btree_depth = math.ceil(math.log(n_rows, 100))  # fanout ~100 keys/page
print(f"1M Rows | Sequential Scan: {seq_scan_ops:,} ops | B-Tree Seek: ~{btree_depth} page reads")`,
        },
      },
    ],
  },
  {
    book: {
      id: 'kurose-ross',
      index: 32,
      title: 'Computer Networking: A Top-Down Approach',
      shortTitle: 'Computer Networks',
      author: 'James Kurose & Keith Ross',
      year: '2020',
      isbn: '9780136681557',
      coverUrl: cover('9780136681557'),
      spineColor: '#0369A1',
      accentHex: '#7DD3FC',
      category: 'Systems',
      pages: 800,
      tagline: '4th-Year Networking Bible: HTTP/3, DNS, TCP 3-Way Handshake, TLS & WebSockets.',
      chapters: [
        {
          number: '01',
          title: 'HTTP/HTTPS, DNS, TCP Handshake & Congestion Control',
          summary:
            'Trace every browser request top-down: DNS UDP lookup → TCP 3-way handshake (`SYN`, `SYN-ACK`, `ACK`) → TLS encryption → HTTP/2 multiplexed streams.',
          takeaways: [
            'TCP guarantees reliable ordered delivery; UDP trades guarantees for ultra-low latency (WebRTC/gaming).',
            'Keep connections alive (HTTP Keep-Alive) and use WebSockets for bidirectional real-time apps.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 2, 3 & 8 (of 8)'],
    mentor: {
      goalTags: ['Placement & OAs', 'CS Deep Dive'],
      level: 'Core',
      languageGroup: '4th Year Core CS',
      totalRealChapters: 8,
      quickVerdict: 'Ace "What Happens When You Type URL in Browser?"',
      useWhen:
        'You are in 3rd/4th year preparing for Computer Networks exams, GATE, or SDE interviews asking about TCP vs UDP, DNS, HTTP/2, CORS, TLS/HTTPS, and Load Balancing.',
      skipWhen:
        'Skip hardware modulation/link-layer physical formulas in Ch. 5–6 unless preparing for GATE ECE/CS.',
      onlyChaptersYouNeed:
        'Out of 8 chapters, focus ONLY on Ch. 2 (Application Layer: DNS & HTTP), Ch. 3 (Transport Layer: TCP Handshake, Congestion Control & UDP), and Ch. 8 (Network Security: TLS/HTTPS).',
      recommendedPairTitle: 'System Design Interview Vol. 1 & 2 (Alex Xu)',
      recommendedPairBookId: 'system-design-alex-xu',
    },
    chapterMetas: [
      {
        hackathon:
          'When streaming KΛ AI tokens over SSE or building 1v1 Arena real-time duels over Socket.IO, understanding TCP Keep-Alive and reverse-proxy buffering (`X-Accel-Buffering: no`) prevents frozen streams.',
        flashcards: [
          {
            q: 'Walk through the TCP 3-Way Handshake and why it exists.',
            a: 'Client sends `SYN(x)` → Server replies `SYN-ACK(y, ack=x+1)` → Client sends `ACK(y+1)`. It synchronizes initial sequence numbers bidirectionally before data flows.',
          },
        ],
        code: {
          language: 'python',
          title: 'DNS Cache TTL & TCP RTT Estimator (Python)',
          snippet: `dns_ms = 25
tcp_handshake_rtt = 1 * 40
tls_rtt = 1 * 40
http_first_byte = 40
print("Cold HTTPS total TTFB:", dns_ms + tcp_handshake_rtt + tls_rtt + http_first_byte, "ms")
print("Warm Keep-Alive request:", http_first_byte, "ms")`,
        },
      },
    ],
  },
  {
    book: {
      id: 'system-design-alex-xu',
      index: 33,
      title: 'System Design Interview — An Insider’s Guide',
      shortTitle: 'System Design (Alex Xu)',
      author: 'Alex Xu',
      year: '2020',
      isbn: '9798664653403',
      coverUrl: cover('9798664653403'),
      spineColor: '#4338CA',
      accentHex: '#818CF8',
      category: 'Architecture',
      pages: 322,
      tagline: '4th-Year Placement Must-Read: Rate Limiter, URL Shortener, Chat System & News Feed.',
      chapters: [
        {
          number: '01',
          title: '4-Step System Design Framework, Rate Limiter & Sharding',
          summary:
            'Structure any 45-minute System Design interview cleanly: 1) Clarify Scale (QPS), 2) High-Level Architecture, 3) Deep Dive (DB + Caching + Rate Limiting), 4) Bottlenecks.',
          takeaways: [
            'Know Token Bucket vs Sliding Window Log for API Rate Limiting (Redis + Lua).',
            'Always calculate QPS and storage math back-of-the-envelope before picking DB sharding.',
          ],
        },
      ],
    },
    realChapterLabels: ['Real Book Ch. 1, 4, 8 & 12 (of 16)'],
    mentor: {
      goalTags: ['Placement & OAs', 'Hackathon Backend'],
      level: 'Pro',
      languageGroup: '4th Year Core CS',
      totalRealChapters: 16,
      quickVerdict: 'Top 4th-Year Placement & Architecture Interview Playbook',
      useWhen:
        'You are a 3rd/4th year student preparing for final placement System Design rounds (Swiggy, Zomato, Flipkart, Uber, Atlassian, Microsoft) or pitching scalable architecture in hackathons.',
      skipWhen:
        'You haven’t built a basic REST API + SQL database yet—build one project first so caching/load-balancers feel concrete.',
      onlyChaptersYouNeed:
        'Read Ch. 1 (Scale from 0 to Millions), Ch. 4 (Design a Rate Limiter), Ch. 5 (Consistent Hashing), Ch. 8 (URL Shortener), and Ch. 12 (Chat System).',
      recommendedPairTitle: 'Designing Data-Intensive Applications (Deep Theory)',
      recommendedPairBookId: 'ddia',
    },
    chapterMetas: [
      {
        hackathon:
          'Every Kollabrix API uses a Token/Sliding Window rate limiter. Cite Token Bucket + Redis atomic counters in both System Design interviews and hackathon architecture slides.',
        flashcards: [
          {
            q: 'Why is Consistent Hashing critical when scaling distributed caches like Redis?',
            a: 'Simple `hash(key) % N` remaps almost 100% of keys when adding/removing 1 cache server (causing a cache stampede). Consistent hashing only remaps `1/N` of keys.',
          },
        ],
        code: {
          language: 'python',
          title: 'Token Bucket Rate Limiter (Python)',
          snippet: `import time

class TokenBucket:
    def __init__(self, capacity, refill_per_sec):
        self.cap = capacity
        self.tokens = capacity
        self.rate = refill_per_sec
        self.last = time.time()

    def allow(self):
        now = time.time()
        self.tokens = min(self.cap, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

tb = TokenBucket(capacity=3, refill_per_sec=1)
print("Burst calls:", [tb.allow() for _ in range(4)])`,
        },
      },
    ],
  },
];
