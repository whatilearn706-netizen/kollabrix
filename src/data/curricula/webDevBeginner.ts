import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const WEBDEV_BEGINNER_SPEC: TrackSpec = {
  id: 'web_dev-beginner',
  language: 'web_dev',
  track: 'beginner',
  title: 'TypeScript, Next.js & Web Foundations',
  tagline: 'Zero to Interactive Web: HTML5 Semantics, CSS Grid/Flexbox, JS ES6+, Arrays, DOM & Async',
  icon: '🌐',
  color: 'text-sky-500 dark:text-sky-400',
  badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  borderColor: 'border-sky-400/30 hover:border-sky-400/70',
  description:
    'Complete frontend foundations starting from semantic HTML5, responsive CSS Flexbox/Grid, modern ES6+ JavaScript, array transforms, DOM state models, and async fetch workflows with 60 problems.',
  compilerLanguage: 'javascript',
  compilerDisplayName: 'JavaScript (Node.js)',
  estimatedTotalHours: '18 Hours',
  prerequisites: ['None — builds web engineering fundamentals from scratch'],
  outcomes: [
    'Structure accessible semantic HTML5 pages and escape unsafe markup',
    'Compute Flexbox, CSS Grid, and responsive clamp/breakpoint rules accurately',
    'Write clean ES6+ destructuring, closures, and immutable array pipelines',
    'Model DOM event delegation, debouncing, Promises, and async/await flows',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Semantic HTML5 & Safe Markup Encoding',
      topic: 'DOM Hierarchy, Accessibility & XSS Escaping',
      estimatedTime: '2 Hours',
      summary:
        'Build accessible semantic HTML5 landmarks (`<header>`, `<main>`, `<article>`, `<nav>`), SEO metadata, and safe HTML escaping templates.',
      studyMaterial: {
        overview:
          'Modern HTML5 replaces `<div>` soup with landmarks screen readers and search engines understand. Always escape dynamic user text (`<`, `>`, `&`, `"`) before rendering HTML strings to prevent XSS.',
        keyPoints: [
          'Use `<main>`, `<nav>`, `<article>`, `<section>`, `<aside>`, and `<footer>` for document semantics.',
          'Every form `<input>` needs a linked `<label for="...">` and button actions need `type="button"` or `type="submit"`.',
          'Never inject raw untrusted user input into HTML templates—encode `&`, `<`, `>`, `"`, `\'`.',
        ],
        codeExamples: [
          {
            title: 'XSS-Safe Template Tag Helper',
            code: `const escapeHtml = (s) =>  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

console.log(\`<p>\${escapeHtml("<script>alert(1)</script>")}</p>\`);`,
            explanation: 'Neutralizes dangerous `<script>` tags cleanly in vanilla JavaScript.',
          },
        ],
        cheatsheet: [
          '<header>, <nav>, <main>, <article>, <footer>',
          'aria-label / alt attributes for accessibility',
          'rel="noopener noreferrer" on target="_blank" links',
        ],
        officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      },
      video: yt(
        'Learn HTML — Full Tutorial for Beginners',
        'freeCodeCamp.org',
        'kUMe1FH4CHE',
        '4h 07m',
        'Complete visual guide to semantic tags, forms, tables, accessibility, and SEO head markup.',
      ),
      compilerStarterCode: `const card = (title, tag) => \`<article data-tag="\${tag}"><h2>\${title}</h2></article>\`;console.log(card("KΛ Folio", "systems"));`,
      practiceQuestions: [
        {
          id: 'wb-1-1',
          title: 'Build Semantic Card Markup',
          difficulty: 'Easy',
          description: 'Print exact semantic HTML: `<article><h1>KΛ Builder</h1><p>Active</p></article>`',
          starterCode: `const title = "KΛ Builder", status = "Active";// TODO: Print semantic HTML string`,
          expectedOutput: '<article><h1>KΛ Builder</h1><p>Active</p></article>',
          hints: ['Use template literal `` `<article><h1>${title}</h1><p>${status}</p></article>` ``.'],
        },
        {
          id: 'wb-1-2',
          title: 'HTML Entity XSS Escaper',
          difficulty: 'Easy',
          description: 'Escape `<img src=x onerror="bad">` replacing `<`, `>`, `"` -> &lt;img src=x onerror=&quot;bad&quot;&gt;',
          starterCode: `const raw = '<img src=x onerror="bad">';// TODO: Escape &, <, >, "`,
          expectedOutput: '&lt;img src=x onerror=&quot;bad&quot;&gt;',
          hints: ['Chain `.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll(\'"\', "&quot;")`.'],
        },
        {
          id: 'wb-1-3',
          title: 'Accessible Navigation List Renderer',
          difficulty: 'Easy',
          description: 'Render `["Home", "Arena"]` inside `<nav><ul><li>...</li></ul></nav>` on one line -> <nav><ul><li>Home</li><li>Arena</li></ul></nav>',
          starterCode: `const links = ["Home", "Arena"];// TODO`,
          expectedOutput: '<nav><ul><li>Home</li><li>Arena</li></ul></nav>',
          hints: ['`links.map(l => \`<li>\${l}</li>\`).join("")`'],
        },
        {
          id: 'wb-1-4',
          title: 'Safe External Link Generator',
          difficulty: 'Easy',
          description: 'Output anchor with `target="_blank"` and `rel="noopener noreferrer"` for `https://kollabrix.in` labeled `Visit` -> <a href="https://kollabrix.in" target="_blank" rel="noopener noreferrer">Visit</a>',
          starterCode: `const url = "https://kollabrix.in", label = "Visit";// TODO`,
          expectedOutput: '<a href="https://kollabrix.in" target="_blank" rel="noopener noreferrer">Visit</a>',
          hints: ['Always pair `target="_blank"` with `rel="noopener noreferrer"` against tab-nabbing.'],
        },
        {
          id: 'wb-1-5',
          title: 'Slugify Heading for Anchor IDs',
          difficulty: 'Easy',
          description: 'Convert `"01. System Design & Caching!"` to URL slug (`a-z0-9-`) -> 01-system-design-caching',
          starterCode: `const heading = "01. System Design & Caching!";// TODO: Lowercase, replace non-alphanumeric runs with '-', trim leading/trailing '-'`,
          expectedOutput: '01-system-design-caching',
          hints: ['`heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")`'],
        },
        {
          id: 'wb-1-6',
          title: 'Meta Description Length Clamper',
          difficulty: 'Easy',
          description: 'Truncate `"Build fast teams and master DSA on Kollabrix"` to max `20` chars appending `"..."` at 17 chars -> Build fast teams ...',
          starterCode: `const text = "Build fast teams and master DSA on Kollabrix";// TODO: Keep text.slice(0, 17) + "..."`,
          expectedOutput: 'Build fast teams ...',
          hints: ['Check `text.length > 20 ? text.slice(0, 17) + "..." : text`.'],
        },
        {
          id: 'wb-1-7',
          title: 'ARIA Expanded Attribute Toggle',
          difficulty: 'Easy',
          description: 'Format button markup for `open = true` -> <button type="button" aria-expanded="true">Menu</button>',
          starterCode: `const open = true;// TODO`,
          expectedOutput: '<button type="button" aria-expanded="true">Menu</button>',
          hints: ['Explicit `type="button"` prevents accidental form submission!'],
        },
        {
          id: 'wb-1-8',
          title: 'Extract Plain Text From HTML Tags',
          difficulty: 'Easy',
          description: 'Strip tags from `<div>Hello <strong>KΛ</strong> Dev</div>` -> Hello KΛ Dev',
          starterCode: `const html = "<div>Hello <strong>KΛ</strong> Dev</div>";// TODO: Replace /<[^>]*>/g with ""`,
          expectedOutput: 'Hello KΛ Dev',
          hints: ['`html.replace(/<[^>]*>/g, "")`'],
        },
        {
          id: 'wb-1-9',
          title: 'Form Input + Linked Label Pair',
          difficulty: 'Easy',
          description: 'Render linked pair for `id="email"`, `label="Email"` -> <label for="email">Email</label><input id="email" name="email" type="email" />',
          starterCode: `const id = "email", label = "Email";// TODO`,
          expectedOutput: '<label for="email">Email</label><input id="email" name="email" type="email" />',
          hints: ['Match `for="${id}"` on `<label>` with `id="${id}"` on `<input>`.'],
        },
        {
          id: 'wb-1-10',
          title: 'JSON-LD Structured Schema String',
          difficulty: 'Easy',
          description: 'Serialize `{"@type":"Course","name":"KΛ Web"}` cleanly -> <script type="application/ld+json">{"@type":"Course","name":"KΛ Web"}</script>',
          starterCode: `const schema = { "@type": "Course", name: "KΛ Web" };// TODO`,
          expectedOutput: '<script type="application/ld+json">{"@type":"Course","name":"KΛ Web"}</script>',
          hints: ['Wrap `JSON.stringify(schema)` inside the ld+json script tag.'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'CSS Layout Engine: Box Model, Flexbox & Grid',
      topic: 'Specificity, Flex Sizing & Responsive Clamp',
      estimatedTime: '2.5 Hours',
      summary:
        'Reason accurately about `box-sizing: border-box`, Flexbox `flex-grow` math, CSS Grid `fr` track distribution, specificity tuples `(ID, Class, Tag)`, and `clamp()`.',
      studyMaterial: {
        overview:
          'CSS stops feeling random once you learn the exact math behind `border-box`, Flexbox free-space distribution, Grid `fr` tracks, and CSS specificity `(ids, classes/attrs/pseudo-classes, elements)`.',
        keyPoints: [
          '`box-sizing: border-box` includes padding and border inside `width`, avoiding horizontal overflow bugs.',
          'Specificity `(A, B, C)`: `#id` (+A), `.class / :hover / [attr]` (+B), `div / ::before` (+C). Higher A wins regardless of B or C.',
          'Flexbox distributes remaining `freeSpace` proportionally to `flex-grow` ratios.',
          'Modern responsive typography: `clamp(min, preferred, max)`.',
        ],
        codeExamples: [
          {
            title: 'Grid Track Calculator With Gap',
            code: `const container = 1000, gap = 20, cols = 3;
const colWidth = (container - gap * (cols - 1)) / cols;
console.log(colWidth.toFixed(2));`,
            explanation: 'Subtract `(cols - 1) * gap` before dividing by `1fr` column count.',
          },
        ],
        cheatsheet: [
          'border-box: total width == declared width',
          'Grid fr = (available - gaps) / totalFr',
          'Specificity tuple: [IDs, Classes, Tags]',
        ],
        officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
      },
      video: yt(
        'CSS Tutorial — Zero to Hero (Complete Course)',
        'freeCodeCamp.org',
        '1Rs2ND1ryYc',
        '6h 18m',
        'Covers box model, selectors, specificity, Flexbox, CSS Grid, and responsive media queries.',
      ),
      compilerStarterCode: `const clamp = (min, val, max) => Math.min(max, Math.max(min, val));console.log("Font px:", clamp(16, 0.04 * 1280, 36));`,
      practiceQuestions: [
        {
          id: 'wb-2-1',
          title: 'Content-Box vs Border-Box Total Width',
          difficulty: 'Easy',
          description: 'Box width=300, padding=20 each side, border=2 each side. Print total rendered width for `content-box` and `border-box` -> 344 300',
          starterCode: `const w = 300, pad = 20, b = 2;// TODO: content-box adds 2*(pad+b); border-box keeps w`,
          expectedOutput: '344 300',
          hints: ['300 + 2*20 + 2*2 = 344 vs 300.'],
        },
        {
          id: 'wb-2-2',
          title: 'CSS Grid 1fr Column Track Widths',
          difficulty: 'Easy',
          description: 'Container 1000px, `gap: 20px`, `grid-template-columns: 1fr 2fr 1fr`. Print column widths -> 240 480 240',
          starterCode: `const W = 1000, gap = 20, fr = [1, 2, 1];// TODO: Subtract 2 gaps -> 960px divided across 4fr`,
          expectedOutput: '240 480 240',
          hints: ['Available = `1000 - 20 * (3 - 1) = 960`; 1fr = 960 / 4 = 240.'],
        },
        {
          id: 'wb-2-3',
          title: 'Flexbox flex-grow Space Distribution',
          difficulty: 'Medium',
          description: 'Container 900px; 2 items each `flex-basis: 150px` with `flex-grow: 1` and `flex-grow: 2`, gap 0. Print final widths -> 350 550',
          starterCode: `const container = 900, basis = 150, grows = [1, 2];// TODO: free = 900 - 300 = 600; distribute by grows ratio`,
          expectedOutput: '350 550',
          hints: ['150 + 600*(1/3) = 350 and 150 + 600*(2/3) = 550.'],
        },
        {
          id: 'wb-2-4',
          title: 'CSS Selector Specificity Scorer',
          difficulty: 'Medium',
          description: 'Compute `(id, class, tag)` specificity for `"#nav .item a:hover"` (`1, 2, 1`) -> 1-2-1',
          starterCode: `const sel = "#nav .item a:hover";// TODO: Count #id, (.class or :pseudo), and element tags`,
          expectedOutput: '1-2-1',
          hints: ['#nav -> 1 ID; .item and :hover -> 2 class/pseudo; a -> 1 tag.'],
        },
        {
          id: 'wb-2-5',
          title: 'CSS clamp() Responsive Typography',
          difficulty: 'Easy',
          description: 'Evaluate `clamp(16, vwVal, 48)` for `vwVal` in `[12, 32, 60]` -> 16 32 48',
          starterCode: `const clamp = (mn, v, mx) => Math.min(mx, Math.max(mn, v));// TODO: Map [12, 32, 60] and print space-separated`,
          expectedOutput: '16 32 48',
          hints: ['Clamp locks values below min to 16 and above max to 48.'],
        },
        {
          id: 'wb-2-6',
          title: 'Tailwind Breakpoint Classifier',
          difficulty: 'Easy',
          description: 'Classify widths `[375, 768, 1280]` (`<640`: base, `>=640`: sm, `>=768`: md, `>=1024`: lg, `>=1280`: xl) -> base md xl',
          starterCode: `const widths = [375, 768, 1280];// TODO`,
          expectedOutput: 'base md xl',
          hints: ['Test descending breakpoints `>= 1280`, `>= 1024`, `>= 768`, `>= 640`.'],
        },
        {
          id: 'wb-2-7',
          title: 'Conditional ClassName Utility (cn)',
          difficulty: 'Easy',
          description: 'Join truthy classes from `["btn", true && "btn-primary", false && "disabled", "px-4"]` -> btn btn-primary px-4',
          starterCode: `const parts = ["btn", true && "btn-primary", false && "disabled", "px-4"];// TODO: Filter Boolean and join with spaces`,
          expectedOutput: 'btn btn-primary px-4',
          hints: ['`parts.filter(Boolean).join(" ")`'],
        },
        {
          id: 'wb-2-8',
          title: 'Aspect-Ratio 16:9 Height Calculator',
          difficulty: 'Easy',
          description: 'Given width `1280` and aspect ratio `16/9`, compute exact pixel height -> 720',
          starterCode: `const width = 1280;// TODO`,
          expectedOutput: '720',
          hints: ['`width * 9 / 16`'],
        },
        {
          id: 'wb-2-9',
          title: 'CSS Custom Properties Token Emitter',
          difficulty: 'Easy',
          description: 'Convert `{ bg: "#07090E", ink: "#FAF8F5" }` into `:root{--bg:#07090E;--ink:#FAF8F5;}`',
          starterCode: `const tokens = { bg: "#07090E", ink: "#FAF8F5" };// TODO`,
          expectedOutput: ':root{--bg:#07090E;--ink:#FAF8F5;}',
          hints: ['Map `Object.entries(tokens)` to `--${k}:${v};`.'],
        },
        {
          id: 'wb-2-10',
          title: 'Z-Index Stacking Order Topmost Element',
          difficulty: 'Easy',
          description: 'Pick element with highest `z` in `[{id:"nav",z:20},{id:"modal",z:50},{id:"card",z:10}]` -> modal',
          starterCode: `const layers = [{ id: "nav", z: 20 }, { id: "modal", z: 50 }, { id: "card", z: 10 }];// TODO`,
          expectedOutput: 'modal',
          hints: ['Reduce comparing `b.z - a.z` to pick top layer.'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'Modern JavaScript ES6+ Core',
      topic: 'Closures, Destructuring, Spread & Optional Chaining',
      estimatedTime: '2.5 Hours',
      summary:
        'Master block scoping (`const`/`let`), destructuring with defaults, nullish coalescing (`??` vs `||`), spread immutability, and lexical closures.',
      studyMaterial: {
        overview:
          'React and Next.js depend heavily on ES6+ functional patterns. Always prefer `const` by default, use `??` (nullish coalescing) instead of `||` when `0` or `""` are valid values, and return new copied objects (`{ ...obj, updated: true }`) rather than mutating state.',
        keyPoints: [
          '`0 || 10` evaluates to `10` (often a bug!), whereas `0 ?? 10` preserves `0` cleanly.',
          '`const` prevents variable rebinding (`=`), NOT inner object property mutation—use `Object.freeze` or spread copies for immutability.',
          'Optional chaining `user?.profile?.elo ?? 1000` avoids TypeErrors cleanly.',
        ],
        codeExamples: [
          {
            title: 'Nullish Coalescing vs Logical OR',
            code: `const cfg = { retries: 0, host: "localhost" };console.log(cfg.retries || 3, cfg.retries ?? 3);`,
            explanation: 'Outputs `3 0`—crucial difference whenever `0` or `false` is meaningful!',
          },
        ],
        cheatsheet: [
          'x ?? fallback -> only triggers on null / undefined',
          '{ ...prev, count: prev.count + 1 } -> immutable update',
          'const { a = 1, b: renamed } = obj',
        ],
        officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      },
      video: yt(
        'JavaScript Crash Course For Beginners',
        'Traversy Media',
        'hdI2bqOjy3c',
        '1h 40m',
        'Fast, practical tour of JS variables, arrays, objects, arrow functions, and ES6 features.',
      ),
      compilerStarterCode: `const user = { handle: "Velith", stats: { elo: 0 } };console.log(user?.stats?.elo ?? 1200);`,
      practiceQuestions: [
        {
          id: 'wb-3-1',
          title: 'Nullish Coalescing Zero Preservation',
          difficulty: 'Easy',
          description: 'Read `score = 0` with fallback `100` using `??` and `fallbackName = undefined` with `"Guest"` using `??` -> 0 Guest',
          starterCode: `const score = 0, name = undefined;// TODO: Print using ??`,
          expectedOutput: '0 Guest',
          hints: ['`console.log(score ?? 100, name ?? "Guest");`'],
        },
        {
          id: 'wb-3-2',
          title: 'Immutable Nested State Update',
          difficulty: 'Easy',
          description: 'Produce `next` from `state = { user: { name: "Ada", elo: 1200 }, active: true }` bumping `elo` to `1350` without mutating `state` -> 1200 1350',
          starterCode: `const state = { user: { name: "Ada", elo: 1200 }, active: true };// TODO: Create next via object spread without changing state.user.elo`,
          expectedOutput: '1200 1350',
          hints: ['`const next = { ...state, user: { ...state.user, elo: 1350 } };`'],
        },
        {
          id: 'wb-3-3',
          title: 'Destructuring Renaming & Defaults',
          difficulty: 'Easy',
          description: 'Destructure `{ id: 7, role: "builder" }` extracting `id as userId`, default `tier = "FREE"`, and `role` -> 7 builder FREE',
          starterCode: `const rec = { id: 7, role: "builder" };// TODO: const { id: userId, role, tier = "FREE" } = rec;`,
          expectedOutput: '7 builder FREE',
          hints: ['Use colon to rename (`id: userId`) and equals for default (`tier = "FREE"`).'],
        },
        {
          id: 'wb-3-4',
          title: 'Closure Private Balance Account',
          difficulty: 'Medium',
          description: 'Create `makeWallet(100)` returning `{ add, get }` closing over balance. Add 50, add 25, print `get()` -> 175',
          starterCode: `function makeWallet(init) {    
// TODO: Close over balance variable
}
const w = makeWallet(100);
w.add(50); w.add(25);
console.log(w.get());`,
          expectedOutput: '175',
          hints: ['Store `let bal = init;` inside `makeWallet` and return `{ add(n){ bal += n; }, get(){ return bal; } }`.'],
        },
        {
          id: 'wb-3-5',
          title: 'Shallow Object Equality Helper',
          difficulty: 'Easy',
          description: 'Compare `{ a: 1, b: 2 }` with `{ a: 1, b: 2 }` and `{ a: 1, b: 3 }` by keys/values -> true false',
          starterCode: `function shallowEq(a, b) {    
// TODO
}
console.log(shallowEq({ a: 1, b: 2 }, { a: 1, b: 2 }), shallowEq({ a: 1, b: 2 }, { a: 1, b: 3 }));`,
          expectedOutput: 'true false',
          hints: ['Check `Object.keys(a).length === Object.keys(b).length` and every key matches `===`.'],
        },
        {
          id: 'wb-3-6',
          title: 'Memoize Pure Function Closure',
          difficulty: 'Medium',
          description: 'Wrap `compute(x)` counting real invocations; call `memo(5)` twice and `memo(6)` once -> calls=2 res=25,36',
          starterCode: `let realCalls = 0;
function sq(x) { realCalls++; return x * x; }
function memoize(fn) {
    // TODO: Use Map cache inside closure
}
const m = memoize(sq);
const a = m(5), b = m(5), c = m(6);
console.log(\`calls=\${realCalls} res=\${a},\${c}\`);`,
          expectedOutput: 'calls=2 res=25,36',
          hints: ['`if (cache.has(x)) return cache.get(x);` before calling `fn(x)`.'],
        },
        {
          id: 'wb-3-7',
          title: 'Rest Parameters Omit Keys Helper',
          difficulty: 'Easy',
          description: 'Remove `password` cleanly from `{ id: 1, user: "ka", password: "secret" }` using destructuring rest -> {"id":1,"user":"ka"}',
          starterCode: `const acct = { id: 1, user: "ka", password: "secret" };// TODO: const { password, ...safe } = acct;`,
          expectedOutput: '{"id":1,"user":"ka"}',
          hints: ['Rest syntax `{ password: _, ...safe } = acct` excludes `password` non-destructively.'],
        },
        {
          id: 'wb-3-8',
          title: 'Function Pipe Composition (Left-to-Right)',
          difficulty: 'Medium',
          description: 'Compose `[x => x + 1, x => x * 3, x => x - 2]` on initial value `4` using `reduce` -> 13',
          starterCode: `const pipe = (...fns) => (init) => fns.reduce((v, fn) => fn(v), init);// TODO: Run on 4`,
          expectedOutput: '13',
          hints: ['`(4 + 1) * 3 - 2 = 13`.'],
        },
        {
          id: 'wb-3-9',
          title: 'Strict Equality vs Coercion Quiz',
          difficulty: 'Easy',
          description: 'Print `Object.is(NaN, NaN)` and `(0 === false)` -> true false',
          starterCode: `// TODO`,
          expectedOutput: 'true false',
          hints: ['`===` returns false for `NaN === NaN`, whereas `Object.is(NaN, NaN)` (used by React state!) returns `true`.'],
        },
        {
          id: 'wb-3-10',
          title: 'Optional Method Invocation Safety',
          difficulty: 'Easy',
          description: 'Invoke `plugin.onReady?.()` safely when `plugin = {}` and `active = { onReady: () => "BOOT" }` -> undefined BOOT',
          starterCode: `const plugin = {}, active = { onReady: () => "BOOT" };// TODO`,
          expectedOutput: 'undefined BOOT',
          hints: ['`plugin.onReady?.()` evaluates to `undefined` without throwing TypeError.'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Functional Arrays: map, filter, reduce & Set/Map',
      topic: 'Declarative Data Pipelines in JS',
      estimatedTime: '2.5 Hours',
      summary:
        'Transform API payloads without mutation using `map`, `filter`, `reduce`, `flatMap`, `some`/`every`, `Map`, and `Set`.',
      studyMaterial: {
        overview:
          'Watch out for JavaScript’s famous trap: **`[10, 2, 1].sort()` converts elements to STRINGS (`[1, 10, 2]`) unless you supply `(a, b) => a - b`!** Also copy arrays (`[...arr].sort(...)`) because `.sort()` mutates in place.',
        keyPoints: [
          'Always pass `(a, b) => a - b` to `.sort()` for numeric ordering, and copy with `[...arr]` first so original state isn’t mutated.',
          'Use `new Set(arr)` for O(N) deduplication.',
          '`Object.groupBy` (Node 21+) or `.reduce()` builds clean category buckets.',
        ],
        codeExamples: [
          {
            title: 'Immutable Numeric Sort + Top-N Sum',
            code: `const nums = [10, 2, 35, 4];
const sorted = [...nums].sort((
a, b) => b - a);
console.log(sorted[0], nums[0]);`,
            explanation: '`sorted` is descending (`35`) while `nums` remains unchanged (`10`).',
          },
        ],
        cheatsheet: [
          '[...arr].sort((a, b) => a - b) -> safe non-mutating numeric sort',
          '[...new Set(arr)] -> deduplicate in insertion order',
          'arr.reduce((acc, cur) => ..., init)',
        ],
        officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
      },
      video: yt(
        'Learn JavaScript — Full Course for Beginners',
        'freeCodeCamp.org',
        'PkZNo7MFNFg',
        '3h 26m',
        'Covers arrays, objects, higher-order array methods, and ES6 syntax.',
      ),
      compilerStarterCode: `const nums = [10, 2, 35, 5];console.log([...nums].sort((a, b) => a - b).join(","));`,
      practiceQuestions: [
        {
          id: 'wb-4-1',
          title: 'Safe Non-Mutating Numeric Sort',
          difficulty: 'Easy',
          description: 'Sort `[100, 20, 3, 45]` numerically ascending without mutating `orig` -> 3,20,45,100 | 100',
          starterCode: `const orig = [100, 20, 3, 45];// TODO: Copy via spread, sort ascending with (a, b) => a - b, print joined + orig[0]`,
          expectedOutput: '3,20,45,100 | 100',
          hints: ['Without comparator, `.sort()` sorts `"100"` before `"20"` alphabetically!'],
        },
        {
          id: 'wb-4-2',
          title: 'Group Records by Category With reduce',
          difficulty: 'Medium',
          description: 'Group `[{cat:"fe",v:10},{cat:"be",v:20},{cat:"fe",v:5}]` summing `v` per `cat` -> fe:15 be:20',
          starterCode: `const rows = [{ cat: "fe", v: 10 }, { cat: "be", v: 20 }, { cat: "fe", v: 5 }];// TODO: reduce into sums object`,
          expectedOutput: 'fe:15 be:20',
          hints: ['`acc[r.cat] = (acc[r.cat] ?? 0) + r.v; return acc;`'],
        },
        {
          id: 'wb-4-3',
          title: 'Deduplicate Objects by ID via Map',
          difficulty: 'Medium',
          description: 'Deduplicate `[{id:1,n:"A"},{id:2,n:"B"},{id:1,n:"A2"}]` keeping latest per `id` -> A2 B',
          starterCode: `const items = [{ id: 1, n: "A" }, { id: 2, n: "B" }, { id: 1, n: "A2" }];// TODO: Populate Map(item.id -> item) and print .n values`,
          expectedOutput: 'A2 B',
          hints: ['`new Map(items.map(i => [i.id, i])).values()` keeps last entry per ID while preserving key order.'],
        },
        {
          id: 'wb-4-4',
          title: 'flatMap Token Extraction Pipeline',
          difficulty: 'Easy',
          description: 'Extract unique sorted tags from `[{tags:["js","ts"]},{tags:["ts","react"]}]` -> js,react,ts',
          starterCode: `const posts = [{ tags: ["js", "ts"] }, { tags: ["ts", "react"] }];// TODO: flatMap + Set + sort`,
          expectedOutput: 'js,react,ts',
          hints: ['`[...new Set(posts.flatMap(p => p.tags))].sort().join(",")`'],
        },
        {
          id: 'wb-4-5',
          title: 'Filter & Sum Active Cart Items',
          difficulty: 'Easy',
          description: 'Sum `qty * price` for `inStock: true` items in `[{qty:2,price:50,inStock:true},{qty:1,price:99,inStock:false},{qty:3,price:20,inStock:true}]` -> 160',
          starterCode: `const cart = [  { qty: 2, price: 50, inStock: true },
  { qty: 1, price: 99, inStock: false },
  { qty: 3, price: 20, inStock: true }
];
// TODO`,
          expectedOutput: '160',
          hints: ['2*50 + 3*20 = 160.'],
        },
        {
          id: 'wb-4-6',
          title: 'some() & every() Access Checks',
          difficulty: 'Easy',
          description: 'Check if EVERY score >= 50 and SOME score >= 90 in `[55, 72, 94, 60]` -> true true',
          starterCode: `const scores = [55, 72, 94, 60];// TODO`,
          expectedOutput: 'true true',
          hints: ['`scores.every(s => s >= 50)` and `scores.some(s => s >= 90)`.'],
        },
        {
          id: 'wb-4-7',
          title: 'Index Lookup Table (Normalize State)',
          difficulty: 'Easy',
          description: 'Convert `[{id:"u1",name:"Ada"},{id:"u2",name:"Max"}]` into dictionary keyed by `id` with `Object.fromEntries` -> Max',
          starterCode: `const users = [{ id: "u1", name: "Ada" }, { id: "u2", name: "Max" }];// TODO: Build byId dictionary and print byId["u2"].name`,
          expectedOutput: 'Max',
          hints: ['`const byId = Object.fromEntries(users.map(u => [u.id, u]));`'],
        },
        {
          id: 'wb-4-8',
          title: 'Chunk Array into Fixed Batches',
          difficulty: 'Medium',
          description: 'Split `[1, 2, 3, 4, 5]` into chunks of size 2 and print JSON -> [[1,2],[3,4],[5]]',
          starterCode: `const arr = [1, 2, 3, 4, 5], size = 2;// TODO`,
          expectedOutput: '[[1,2],[3,4],[5]]',
          hints: ['Loop `i = 0; i < arr.length; i += size` pushing `arr.slice(i, i + size)`.'],
        },
        {
          id: 'wb-4-9',
          title: 'Partition Array in Single Pass',
          difficulty: 'Easy',
          description: 'Partition `[1, 2, 3, 4, 5, 6]` into `[evens, odds]` via reduce and print count string `even=3 odd=3`',
          starterCode: `const nums = [1, 2, 3, 4, 5, 6];// TODO`,
          expectedOutput: 'even=3 odd=3',
          hints: ['Initial accumulator `[[], []]` pushes into index 0 or 1 per item.'],
        },
        {
          id: 'wb-4-10',
          title: 'Deep Flatten Without Depth Guess (flat(Infinity))',
          difficulty: 'Easy',
          description: 'Flatten `[1, [2, [3, [4, 5]]]]` and print sum -> 15',
          starterCode: `const nested = [1, [2, [3, [4, 5]]]];// TODO: Use nested.flat(Infinity).reduce(...)`,
          expectedOutput: '15',
          hints: ['`nested.flat(Infinity)` flattens arbitrary nesting depth natively!'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'DOM Architecture, Events, Debounce & Storage',
      topic: 'Event Delegation, Bubbling & UI Throttling',
      estimatedTime: '2.5 Hours',
      summary:
        'Understand DOM event bubbling vs capturing, O(1) parent event delegation, debouncing/throttling noisy inputs, and safe `localStorage` JSON state helpers.',
      studyMaterial: {
        overview:
          'Attaching 1,000 individual click handlers wastes memory and breaks on dynamically added rows. Instead, attach **one** listener on the parent (`event.target.closest("[data-action]")`) via Event Delegation, and wrap keystroke searches in `debounce`.',
        keyPoints: [
          'Event phases: Capture (top->down) -> Target -> Bubble (bottom->up). Call `e.stopPropagation()` only when intentional.',
          '**Debounce** waits until calls pause for `delay` ms (ideal for search inputs); **Throttle** fires at most once per `interval` ms (scroll/resize).',
          'Wrap `JSON.parse(localStorage.getItem(k))` inside `try/catch` so corrupted user storage never crashes boot!',
        ],
        codeExamples: [
          {
            title: 'Production Debounce Helper',
            code: `function debounce(fn, ms) {  
let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
const log = debounce((x) => console.log("Sent:", x), 20);
log("a"); log("ab"); log("abc");`,
            explanation: 'Only `"abc"` executes after rapid bursts settle.',
          },
        ],
        cheatsheet: [
          'target.closest("[data-id]") -> clean delegation lookup',
          'clearTimeout(id) -> debounce reset',
          'try { JSON.parse(...) } catch { return fallback; }',
        ],
        officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model',
      },
      video: yt(
        'JavaScript DOM Manipulation — Full Course',
        'freeCodeCamp.org',
        '5fb2aPlgoys',
        '2h 41m',
        'Covers querySelector, traversal, event delegation, bubbling, and dynamic rendering.',
      ),
      compilerStarterCode: `function simulateDelegation(targetAttrs) {  
return targetAttrs["data-id"] ?? "IGNORED";
}
console.log(simulateDelegation({ "data-id": "btn-42" }));`,
      practiceQuestions: [
        {
          id: 'wb-5-1',
          title: 'Debounce Rapid Search Keystrokes',
          difficulty: 'Medium',
          description: 'Implement `debounce(fn, 15)`. Call `fn("k")`, `fn("ka")`, `fn("kollabrix")` synchronously so only `"kollabrix"` prints.',
          starterCode: `function debounce(fn, delay) {    
// TODO
}
const search = debounce((q) => console.log(q), 15);
search("k"); search("ka"); search("kollabrix");`,
          expectedOutput: 'kollabrix',
          hints: ['Store timer `let t;` in closure, call `clearTimeout(t)` before scheduling `setTimeout`.'],
        },
        {
          id: 'wb-5-2',
          title: 'Event Listener Once-Only Wrapper',
          difficulty: 'Easy',
          description: 'Write `once(fn)` executing `fn` strictly on first invocation and returning cached result afterwards. Call 3 times counting real runs -> runs=1 val=OK',
          starterCode: `let runs = 0;
function once(fn) {
    // TODO
}
const init = once(() => { runs++; return "OK"; });
init(); init(); const res = init();
console.log(\`runs=\${runs} val=\${res}\`);`,
          expectedOutput: 'runs=1 val=OK',
          hints: ['Track `let called = false, cached;` in closure.'],
        },
        {
          id: 'wb-5-3',
          title: 'Simulated Event Delegation Dispatcher',
          difficulty: 'Easy',
          description: 'Walk up simulated DOM node chain `{ tag: "span", parent: { tag: "button", action: "save" } }` finding closest `action` -> save',
          starterCode: `const node = { tag: "span", parent: { tag: "button", action: "save", parent: null } };// TODO: Simulate el.closest("[data-action]") walk upward`,
          expectedOutput: 'save',
          hints: ['`let cur = node; while (cur && !cur.action) cur = cur.parent;`'],
        },
        {
          id: 'wb-5-4',
          title: 'Safe JSON State Deserializer',
          difficulty: 'Easy',
          description: 'Parse valid JSON `\'{"theme":"dark"}\'` and malformed `"{corrupt"` falling back to `{ theme: "light" }` -> dark light',
          starterCode: `function loadPref(raw) {    
// TODO: try/catch JSON.parse with fallback { theme: "light" }
}
console.log(loadPref('{"theme":"dark"}').theme, loadPref("{corrupt").theme);`,
          expectedOutput: 'dark light',
          hints: ['Protect startup state hydration against manual/stale storage corruption.'],
        },
        {
          id: 'wb-5-5',
          title: 'Simple Pub-Sub EventEmitter',
          difficulty: 'Medium',
          description: 'Implement `on(ev, fn)` and `emit(ev, data)`. Subscribe two listeners to `"save"` emitting `"v2"` -> save:v2|audit:v2',
          starterCode: `function createBus() {    
// TODO: Map event -> Set/Array of callbacks
}
const bus = createBus();
const out = [];
bus.on("save", d => out.push("save:" + d));
bus.on("save", d => out.push("audit:" + d));
bus.emit("save", "v2");
console.log(out.join("|"));`,
          expectedOutput: 'save:v2|audit:v2',
          hints: ['Iterate `(listeners.get(ev) ?? [])` and invoke each handler with `data`.'],
        },
        {
          id: 'wb-5-6',
          title: 'DOM Bubbling Path Simulator',
          difficulty: 'Easy',
          description: 'Given node tree `{ id: "btn", parent: { id: "card", parent: { id: "body" } } }`, print bubble trace from target to root -> btn->card->body',
          starterCode: `const target = { id: "btn", parent: { id: "card", parent: { id: "body", parent: null } } };// TODO: Walk parent links collecting ids`,
          expectedOutput: 'btn->card->body',
          hints: ['Collect ids in array while `cur != null` then `.join("->")`.'],
        },
        {
          id: 'wb-5-7',
          title: 'URL SearchParams Builder & Reader',
          difficulty: 'Easy',
          description: 'Use `URLSearchParams` to parse `"?section=books&book=ddia"`, set `book` to `"clean_code"`, print `.toString()` -> section=books&book=clean_code',
          starterCode: `const sp = new URLSearchParams("?section=books&book=ddia");// TODO: sp.set("book", "clean_code");`,
          expectedOutput: 'section=books&book=clean_code',
          hints: ['`sp.set(k, v)` replaces existing values cleanly without duplicate query params.'],
        },
        {
          id: 'wb-5-8',
          title: 'Keyboard Shortcut Matcher',
          difficulty: 'Easy',
          description: 'Verify `(metaKey || ctrlKey) && key.toLowerCase() === "k"` matches Cmd+K `{ metaKey: true, ctrlKey: false, key: "K" }` -> COMMAND_PALETTE',
          starterCode: `const ev = { metaKey: true, ctrlKey: false, key: "K" };// TODO`,
          expectedOutput: 'COMMAND_PALETTE',
          hints: ['Check `(ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k"`.'],
        },
        {
          id: 'wb-5-9',
          title: 'Throttle Call Rate Gate',
          difficulty: 'Medium',
          description: 'Simulate timestamp throttle (`cooldown = 100ms`) across calls at `[0, 30, 80, 100, 150, 210]`. Print accepted timestamps -> 0 100 210',
          starterCode: `const ts = [0, 30, 80, 100, 150, 210];// TODO: Accept t iff t - lastRun >= 100 (seed lastRun = -Infinity)`,
          expectedOutput: '0 100 210',
          hints: ['0 runs (next >= 100); 30 & 80 skipped; 100 runs (next >= 200); 150 skipped; 210 runs.'],
        },
        {
          id: 'wb-5-10',
          title: 'Deterministic ID Generator Counter',
          difficulty: 'Easy',
          description: 'Build `nextId(prefix)` returning `"toast-1"`, `"toast-2"` on sequential calls -> toast-1 toast-2',
          starterCode: `let seq = 0;
const nextId = (p) => \`\${p}-\${++seq}\`;
// TODO: Call twice for "toast"`,
          expectedOutput: 'toast-1 toast-2',
          hints: ['Prefix increment `++seq` starts numbering cleanly at 1.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'Async JS: Event Loop, Promises & Concurrent Fetch',
      topic: 'Microtasks, Promise.allSettled & Retry Logic',
      estimatedTime: '2.5 Hours',
      summary:
        'Master the JS Event Loop (microtask queue vs macrotask queue), `Promise.all` vs `Promise.allSettled`, `Promise.race` timeouts, and clean `async/await` error handling.',
      studyMaterial: {
        overview:
          'JavaScript runs synchronous code first, drains the **Microtask Queue** (`Promise.then`, `await` continuations) completely, and ONLY then pulls the next **Macrotask** (`setTimeout`). Knowing this prevents race conditions in UI state!',
        keyPoints: [
          '`Promise.all` rejects immediately if ANY promise fails; `Promise.allSettled` waits for ALL and reports `{ status: "fulfilled" | "rejected" }`.',
          'Avoid sequential `await` inside loops when requests are independent—fire in parallel with `Promise.all(urls.map(fetch))`.',
          'Race any slow async task against a `setTimeout` reject promise (`Promise.race`) for clean client timeouts.',
        ],
        codeExamples: [
          {
            title: 'Event Loop Execution Order Proof',
            code: `console.log("1:sync");
setTimeout(() => console.log("4:macro"), 0);
Promise.resolve().then(() => console.log("3:micro"));
console.log("2:sync");`,
            explanation: 'Sync logs run first, then Promise microtask, finally `setTimeout` macrotask.',
          },
        ],
        cheatsheet: [
          'Promise.all(arr) -> fail-fast parallel',
          'Promise.allSettled(arr) -> inspect every outcome safely',
          'Promise.race([task, timeout]) -> client timeout pattern',
        ],
        officialDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
      },
      video: yt(
        'Async JS Crash Course — Callbacks, Promises, Async Await',
        'Traversy Media',
        'PoRJizFvM7s',
        '24m',
        'Crisp visual walkthrough of asynchronous Promises, fetch chains, and async/await.',
      ),
      compilerStarterCode: `async function run() {  
const vals = await Promise.all([Promise.resolve(10), Promise.resolve(32)]);
  console.log(vals[0] + vals[1]);
}
run();`,
      practiceQuestions: [
        {
          id: 'wb-6-1',
          title: 'Microtask vs Macrotask Order',
          difficulty: 'Medium',
          description: 'Combine sync log `"S1"`, `setTimeout(..., 0)` `"TO"`, `Promise.resolve().then(...)` `"PR"`, sync `"S2"` so output prints in true JS Event Loop order -> S1 S2 PR TO',
          starterCode: `const log = [];log.push("S1");
setTimeout(() => { log.push("TO"); console.log(log.join(" ")); }, 0);
// TODO: Push Promise microtask "PR" and sync "S2"`,
          expectedOutput: 'S1 S2 PR TO',
          hints: ['Microtasks (`Promise.then`) always flush BEFORE `setTimeout` macrotasks.'],
        },
        {
          id: 'wb-6-2',
          title: 'Promise.all Parallel Speedup',
          difficulty: 'Easy',
          description: 'Resolve three simulated fetches `[100, 200, 300]` in parallel with `Promise.all` and print total -> 600',
          starterCode: `const fetchVal = (v) => Promise.resolve(v);// TODO: async IIFE using Promise.all([fetchVal(100), fetchVal(200), fetchVal(300)])`,
          expectedOutput: '600',
          hints: ['`const res = await Promise.all(...); console.log(res.reduce((a, b) => a + b, 0));`'],
        },
        {
          id: 'wb-6-3',
          title: 'Resilient Partial Results via Promise.allSettled',
          difficulty: 'Medium',
          description: 'Run `[Promise.resolve(10), Promise.reject("err"), Promise.resolve(25)]` via `Promise.allSettled`, sum fulfilled values -> 35',
          starterCode: `const jobs = [Promise.resolve(10), Promise.reject("err"), Promise.resolve(25)];// TODO: Use Promise.allSettled and filter status === "fulfilled"`,
          expectedOutput: '35',
          hints: ['Keep entries where `r.status === "fulfilled"` and sum `r.value`.'],
        },
        {
          id: 'wb-6-4',
          title: 'Promise.race Timeout Wrapper',
          difficulty: 'Medium',
          description: 'Implement `withTimeout(promise, ms)` racing against rejection `"TIMEOUT"`. Test 50ms slow promise against 10ms timeout -> TIMEOUT',
          starterCode: `function withTimeout(p, ms) {    
// TODO: Return Promise.race([p, timerPromise])
}
const slow = new Promise(r => setTimeout(() => r("OK"), 50));
withTimeout(slow, 10).catch(err => console.log(err));`,
          expectedOutput: 'TIMEOUT',
          hints: ['Use `.unref?.()` on timeout timer OR let slow timer finish cleanly; actually better wait—even without `.unref()` 50ms finishes cleanly inside Judge0! Clear timeout on resolution if needed.'],
        },
        {
          id: 'wb-6-5',
          title: 'Async Retry Helper With Attempt Counter',
          difficulty: 'Medium',
          description: 'Write `async retry(fn, attempts)` recovering after 2 failures and returning `"CONNECTED_3"` on 3rd try.',
          starterCode: `let tries = 0;
async function connect() {
    tries++;
    if (tries < 3) throw new Error("net");
    return "CONNECTED_" + tries;
}
// TODO: Retry loop up to 3 times`,
          expectedOutput: 'CONNECTED_3',
          hints: ['Loop `for (let i = 0; i < max; i++) { try { return await fn(); } catch (e) { if (i === max-1) throw e; } }`.'],
        },
        {
          id: 'wb-6-6',
          title: 'Promisify Sleep Utility',
          difficulty: 'Easy',
          description: 'Implement `const sleep = (ms) => new Promise(r => setTimeout(r, ms));`, await `sleep(10)` then log `"AWAKE"`.',
          starterCode: `// TODO: sleep helper + async main`,
          expectedOutput: 'AWAKE',
          hints: ['`await sleep(10); console.log("AWAKE");`'],
        },
        {
          id: 'wb-6-7',
          title: 'Concurrency Pool (Batch 2 At a Time)',
          difficulty: 'Hard',
          description: 'Run `[1, 2, 3, 4]` transforming `x => x * 2` in batches of 2 sequentially via async loop, print final sum -> 20',
          starterCode: `const nums = [1, 2, 3, 4];
const work = async (x) => x * 2;
// TODO: Process slices of size 2 with Promise.all and sum results`,
          expectedOutput: '20',
          hints: ['Chunk array by 2 and `await Promise.all(chunk.map(work))`.'],
        },
        {
          id: 'wb-6-8',
          title: 'Async Try / Catch Fallback Data',
          difficulty: 'Easy',
          description: 'Call failing `async loadProfile()` and return fallback `{ handle: "Guest" }` cleanly -> Guest',
          starterCode: `async function loadProfile() { throw new Error("503"); }(async () => {
    // TODO: Catch error and print fallback.handle
})();`,
          expectedOutput: 'Guest',
          hints: ['Wrap `await loadProfile()` in `try { ... } catch { return { handle: "Guest" }; }`.'],
        },
        {
          id: 'wb-6-9',
          title: 'Promise.any First Success Wins',
          difficulty: 'Easy',
          description: 'Use `Promise.any([Promise.reject("a"), Promise.resolve("MIRROR_1"), Promise.resolve("MIRROR_2")])` -> MIRROR_1',
          starterCode: `// TODO: Resolve fastest fulfilled promise`,
          expectedOutput: 'MIRROR_1',
          hints: ['`Promise.any` ignores rejections as long as at least one promise fulfills!'],
        },
        {
          id: 'wb-6-10',
          title: 'Sequential Reduce Async Chain',
          difficulty: 'Medium',
          description: 'Execute `[x => x + 2, x => x * 5]` sequentially as async steps starting at `3` -> 25',
          starterCode: `const steps = [async x => x + 2, async x => x * 5];// TODO: Sequential await loop starting at val = 3`,
          expectedOutput: '25',
          hints: ['`(3 + 2) * 5 = 25`.'],
        },
      ],
    },
  ],
};
