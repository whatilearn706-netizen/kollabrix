import type { TrackSpec } from './helpers';
import { yt } from './helpers';

export const WEBDEV_PRO_SPEC: TrackSpec = {
  id: 'web_dev-learning',
  language: 'web_dev',
  track: 'learning',
  title: 'TypeScript, React & Next.js Pro Stack',
  tagline: 'Type Contracts, React State/Hooks, Performance, Next.js App Router, SQL & Production Testing',
  icon: '🌐',
  color: 'text-sky-500 dark:text-sky-400',
  badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  borderColor: 'border-sky-400/30 hover:border-sky-400/70',
  description:
    'Production full-stack engineering covering TypeScript runtime contracts, React state reducers & custom hooks, performance optimization, Next.js App Router caching/actions, PostgreSQL queries, and testing with 60 problems.',
  compilerLanguage: 'javascript',
  compilerDisplayName: 'JavaScript / Full-Stack',
  estimatedTotalHours: '22 Hours',
  prerequisites: ['Completion of Web Foundations Track or solid ES6+ JavaScript skills'],
  outcomes: [
    'Design runtime schemas & discriminated state machines matching TypeScript patterns',
    'Build pure React reducers, memoized derived selectors, and stale-closure fixes',
    'Architect Next.js dynamic routes, Cache-Control headers, and server actions',
    'Write SQL-injection-proof queries, sliding rate limiters, and unit assertions',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Type Contracts, Discriminated Unions & Schemas',
      topic: 'Runtime Type Guards & Narrowing Patterns',
      estimatedTime: '3 Hours',
      summary:
        'Because TypeScript strips types at runtime, API boundaries need discriminated unions (`status: "loading" | "success" | "error"`), runtime guards, and Zod-style schema validators.',
      studyMaterial: {
        overview:
          'TypeScript catches compile-time mismatches, while **runtime narrowing guards** protect against malformed API JSON, missing environment variables, and impossible UI states.',
        keyPoints: [
          'Replace three booleans (`isLoading`, `isError`, `isSuccess`) with ONE discriminated union (`state.status`).',
          'Handle every union variant cleanly with exhaustive `switch (state.status)` checks.',
          'Validate external API payloads at the network boundary before entering React state.',
        ],
        codeExamples: [
          {
            title: 'Discriminated Result Switch Pattern',
            code: `function renderState(s) {  
switch (s.status) {
    case "loading": return "Spin...";
    case "error": return "Err:" + s.msg;
    case "ready": return "Data:" + s.data.length;
    default: throw new Error("Unhandled status");
  }
}
console.log(renderState({ status: "ready", data: [1, 2, 3] }));`,
            explanation: 'Impossible states (e.g., loading AND error simultaneously) cannot occur.',
          },
        ],
        cheatsheet: [
          'Discriminated Union: { status: "ok" | "err", ... }',
          'isRecord(x): typeof x === "object" && x !== null && !Array.isArray(x)',
          'Exhaustive default throw catches missed states',
        ],
        officialDocUrl: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
      },
      video: yt(
        'Learn TypeScript — Full Tutorial',
        'freeCodeCamp.org',
        '30LWjhZzg50',
        '1h 34m',
        'Covers interfaces, union narrowing, generics, utility types (Pick/Omit/Partial), and React typing.',
      ),
      compilerStarterCode: `const parseUser = (x) =>  x && typeof x.name === "string" && typeof x.elo === "number"
    ? { ok: true, value: x }
    : { ok: false, error: "INVALID_SHAPE" };

console.log(parseUser({ name: "KΛ", elo: 1600 }).ok);`,
      practiceQuestions: [
        {
          id: 'wp-1-1',
          title: 'Discriminated Union State Formatter',
          difficulty: 'Easy',
          description: 'Write `fmt(state)` handling `status: "idle" | "loading" | "ready" | "error"`. Test `{ status: "ready", count: 5 }` & `{ status: "error", msg: "404" }` -> READY:5 ERR:404',
          starterCode: `function fmt(s) {    
// TODO: switch(s.status)
}
console.log(fmt({ status: "ready", count: 5 }), fmt({ status: "error", msg: "404" }));`,
          expectedOutput: 'READY:5 ERR:404',
          hints: ['Switch on the literal tag `s.status`.'],
        },
        {
          id: 'wp-1-2',
          title: 'Plain Object Runtime Type Guard',
          difficulty: 'Easy',
          description: 'Write `isPlainObject(v)` returning false for `null`, `[]`, primitives, and true for `{}`. Test `(null, [], { a: 1 })` -> false false true',
          starterCode: `function isPlainObject(v) {    
// TODO
}
console.log(isPlainObject(null), isPlainObject([]), isPlainObject({ a: 1 }));`,
          expectedOutput: 'false false true',
          hints: ['Remember `typeof null === "object"` AND `typeof [] === "object"` in JS!'],
        },
        {
          id: 'wp-1-3',
          title: 'Pick & Omit Utility Implementations',
          difficulty: 'Easy',
          description: 'Implement `pick(obj, ["id", "role"])` on `{ id: 9, name: "A", role: "pro", secret: "x" }` -> {"id":9,"role":"pro"}',
          starterCode: `function pick(obj, keys) {    
// TODO
}
console.log(JSON.stringify(pick({ id: 9, name: "A", role: "pro", secret: "x" }, ["id", "role"])));`,
          expectedOutput: '{"id":9,"role":"pro"}',
          hints: ['`Object.fromEntries(keys.filter(k => k in obj).map(k => [k, obj[k]]))`'],
        },
        {
          id: 'wp-1-4',
          title: 'Result<T, E> Safe JSON Parser',
          difficulty: 'Easy',
          description: 'Wrap `JSON.parse` returning `{ ok: true, data }` or `{ ok: false, error: "BAD_JSON" }`. Test `"{"k":1}"` & `"bad"` -> 1 BAD_JSON',
          starterCode: `function safeJson(raw) {    
// TODO
}
console.log(safeJson('{"k":1}').data.k, safeJson("bad").error);`,
          expectedOutput: '1 BAD_JSON',
          hints: ['Never throw raw parser exceptions to UI callers without wrapping.'],
        },
        {
          id: 'wp-1-5',
          title: 'Assert Never Exhaustiveness Helper',
          difficulty: 'Easy',
          description: 'Create `assertNever(x)` throwing `"UNEXPECTED:" + x` when called. Catch on `"UNKNOWN"` -> UNEXPECTED:UNKNOWN',
          starterCode: `function assertNever(x) {    
// TODO
}
try { assertNever("UNKNOWN"); } catch (e) { console.log(e.message); }`,
          expectedOutput: 'UNEXPECTED:UNKNOWN',
          hints: ['`throw new Error("UNEXPECTED:" + x);`'],
        },
        {
          id: 'wp-1-6',
          title: 'Strict Env Var Contract Loader',
          difficulty: 'Easy',
          description: 'Check `env = { DB_URL: "postgres://...", PORT: "" }`. Throw `"MISSING:PORT"` for empty/missing required keys -> MISSING:PORT',
          starterCode: `function requireEnv(env, keys) {    
// TODO
}
try { requireEnv({ DB_URL: "postgres://..." }, ["DB_URL", "PORT"]); } catch (e) { console.log(e.message); }`,
          expectedOutput: 'MISSING:PORT',
          hints: ['Validate `!env[k]` and throw `new Error("MISSING:" + k)`.'],
        },
        {
          id: 'wp-1-7',
          title: 'Deep Partial Config Merger',
          difficulty: 'Medium',
          description: 'Merge overrides `{ ui: { theme: "dark" } }` into `{ ui: { theme: "light", compact: true }, v: 2 }` keeping `compact: true` -> dark true 2',
          starterCode: `function mergeConfig(base, over) {    
// TODO: Recursively merge plain objects without dropping sibling keys
}
const out = mergeConfig({ ui: { theme: "light", compact: true }, v: 2 }, { ui: { theme: "dark" } });
console.log(out.ui.theme, out.ui.compact, out.v);`,
          expectedOutput: 'dark true 2',
          hints: ['When both base[k] and over[k] are plain objects, recurse!'],
        },
        {
          id: 'wp-1-8',
          title: 'Schema Array Filter Guard',
          difficulty: 'Easy',
          description: 'Filter `[1, "ok", true, 42, null]` with type-guard predicate `x => typeof x === "number"` and sum -> 43',
          starterCode: `const mixed = [1, "ok", true, 42, null];// TODO`,
          expectedOutput: '43',
          hints: ['Filter numeric elements and sum via `.reduce(...)`.'],
        },
        {
          id: 'wp-1-9',
          title: 'Readonly Deep Freeze Verification',
          difficulty: 'Easy',
          description: 'Recursively `Object.freeze` `{ cfg: { max: 5 } }` verifying `Object.isFrozen(obj.cfg)` is `true` -> true',
          starterCode: `function deepFreeze(o) {    
// TODO
}
const obj = deepFreeze({ cfg: { max: 5 } });
console.log(Object.isFrozen(obj.cfg));`,
          expectedOutput: 'true',
          hints: ['Freeze child objects first or after `Object.freeze(o)`.'],
        },
        {
          id: 'wp-1-10',
          title: 'Branded Currency Arithmetic Guard',
          difficulty: 'Easy',
          description: 'Work in integer paise (cents) avoiding JS float `0.1 + 0.2 !== 0.3`. Add `1990` + `4900` paise and format rupees -> 68.90',
          starterCode: `const aPaise = 1990, bPaise = 4900;// TODO: Add integers then divide by 100 formatted .toFixed(2)`,
          expectedOutput: '68.90',
          hints: ['Always store money in smallest integer unit (paise/cents), never IEEE-754 floats!'],
        },
      ],
    },
    {
      stepNumber: 2,
      title: 'React Mental Model: Reducers, Effects & Derived State',
      topic: 'Pure State Transitions & Reconciliation',
      estimatedTime: '3 Hours',
      summary:
        'Master React’s state-driven rendering: pure `useReducer` state machines, avoiding redundant derived state (`useState` vs inline calculation), and functional state updaters (`prev => prev + 1`).',
      studyMaterial: {
        overview:
          'React re-renders when state changes. Two common pitfalls cause 80% of React bugs: (1) mutating arrays/objects in-place (React bails out if reference matches!) and (2) stale closures inside `setCount(count + 1)` instead of `setCount(c => c + 1)`.',
        keyPoints: [
          'NEVER store values in `useState` that can be computed cleanly during render (e.g., `filteredItems`, `totalCount`).',
          'Use functional updates `setCount(c => c + 1)` when sequential updates depend on previous state.',
          'Reducers `(state, action) => nextState` keep complex transitions 100% pure and testable without DOM mounting.',
          'Always use stable domain IDs (`key={item.id}`), NEVER array index (`key={idx}`) on reorderable/filterable lists!',
        ],
        codeExamples: [
          {
            title: 'Pure Todo Reducer Pattern',
            code: `function reducer(state, action) {  
switch (action.type) {
    case "ADD": return [...state, { id: action.id, done: false }];
    case "TOGGLE": return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    default: return state;
  }
}
let s = reducer([], { type: "ADD", id: 1 });
s = reducer(s, { type: "TOGGLE", id: 1 });
console.log(s[0].done);`,
            explanation: 'Produces fresh references cleanly for React’s shallow bailout check.',
          },
        ],
        cheatsheet: [
          'Derived data = compute during render, NOT useEffect + setState!',
          'setState(prev => ...) prevents stale closure bugs',
          'key={item.id} preserves DOM focus & animation stability',
        ],
        officialDocUrl: 'https://react.dev/learn/you-might-not-need-an-effect',
      },
      video: yt(
        'React JS Full Course for Beginners',
        'Dave Gray',
        'RVFAyFWO4go',
        '8h 49m',
        'Covers JSX, props, state immutability, hooks, reducers, and routing architecture.',
      ),
      compilerStarterCode: `function cartReducer(state, action) {  
if (action.type === "INC") return { ...state, qty: state.qty + 1 };
  return state;
}
console.log(cartReducer({ qty: 2 }, { type: "INC" }).qty);`,
      practiceQuestions: [
        {
          id: 'wp-2-1',
          title: 'Functional Updater Batch Simulation',
          difficulty: 'Easy',
          description: 'Apply 3 sequential functional updaters `prev => prev + 1` vs naive closure `count + 1` starting from `count = 10` -> 13 11',
          starterCode: `let count = 10;// TODO: Simulate React batched updates [c => c + 1, c => c + 1, c => c + 1] reducing from count, vs naive [11, 11, 11]`,
          expectedOutput: '13 11',
          hints: ['Functional updaters chain latest committed value; non-functional snapshots close over 10 -> 11.'],
        },
        {
          id: 'wp-2-2',
          title: 'Immutable Todo Toggle Reducer',
          difficulty: 'Easy',
          description: 'Implement `TOGGLE` in `reducer(state, action)` toggling `id: 2` inside `[{id:1,done:false},{id:2,done:false}]` -> false true',
          starterCode: `function reducer(state, action) {    
// TODO: Return new array without mutating state
}
const s0 = [{ id: 1, done: false }, { id: 2, done: false }];
const s1 = reducer(s0, { type: "TOGGLE", id: 2 });
console.log(s0[1].done, s1[1].done);`,
          expectedOutput: 'false true',
          hints: ['`state.map(t => t.id === action.id ? { ...t, done: !t.done } : t)`'],
        },
        {
          id: 'wp-2-3',
          title: 'Derived State Selector Without Sync Bug',
          difficulty: 'Easy',
          description: 'Compute `{ visibleCount, doneCount }` directly from `tasks` + `query="api"` on `[{title:"API auth",done:true},{title:"UI",done:false}]` -> visible=1 done=1',
          starterCode: `const tasks = [{ title: "API auth", done: true }, { title: "UI", done: false }];
const query = "api";
// TODO: Derive visibleCount matching query (case-insensitive) and doneCount`,
          expectedOutput: 'visible=1 done=1',
          hints: ['Never duplicate filtered lists into separate state! Compute directly from source array + query.'],
        },
        {
          id: 'wp-2-4',
          title: 'Effect Cleanup Ordering Simulation',
          difficulty: 'Medium',
          description: 'Simulate running effect `"sub:1"`, cleaning up `"unsub:1"` before re-running `"sub:2"` -> sub:1 unsub:1 sub:2',
          starterCode: `const log = [];// TODO: Run effect for id=1 capturing cleanup, execute cleanup, then run effect id=2`,
          expectedOutput: 'sub:1 unsub:1 sub:2',
          hints: ['React executes the previous effect’s cleanup function right before firing the new effect (and on unmount).'],
        },
        {
          id: 'wp-2-5',
          title: 'Undo/Redo History State Machine',
          difficulty: 'Medium',
          description: 'Maintain `{ past, present, future }`. Commit `"A"` -> `"B"` -> `"C"`, run `UNDO` once, print `present` & `future[0]` -> B C',
          starterCode: `// TODO: Implement commit(state, val) and undo(state)`,
          expectedOutput: 'B C',
          hints: ['On UNDO, pop last item from `past` into `present` and prepend old `present` into `future`.'],
        },
        {
          id: 'wp-2-6',
          title: 'Pagination Reset on Filter Change',
          difficulty: 'Easy',
          description: 'When `SET_SEARCH` fires on `{ page: 4, query: "" }`, reducer must atomically reset `page: 1`. Print `next.page next.query` -> 1 nextjs',
          starterCode: `function reducer(s, a) {    
// TODO: Handle SET_SEARCH resetting page to 1
}
const next = reducer({ page: 4, query: "" }, { type: "SET_SEARCH", query: "nextjs" });
console.log(next.page, next.query);`,
          expectedOutput: '1 nextjs',
          hints: ['Updating multiple coupled fields inside one action prevents out-of-bounds page flash!'],
        },
        {
          id: 'wp-2-7',
          title: 'List Reconciliation Key Integrity Check',
          difficulty: 'Easy',
          description: 'Verify unique non-index keys on `[{id:"a"},{id:"b"}]` and return duplicate check `true` when IDs are distinct -> true',
          starterCode: `const list = [{ id: "a" }, { id: "b" }];// TODO: Verify Set of item.id size matches list.length`,
          expectedOutput: 'true',
          hints: ['`new Set(list.map(x => x.id)).size === list.length`'],
        },
        {
          id: 'wp-2-8',
          title: 'Stale Async Response Cancellation Flag',
          difficulty: 'Medium',
          description: 'Simulate Effect #1 (`cancelled = true` when Effect #2 supersedes) ignoring stale late data `"OLD"` and applying `"NEW"` -> NEW',
          starterCode: `let activeScreen = "";
let cancelled1 = false;
// Suppose request 1 started, then cancelled1 flipped to true before request 1 finishes:
cancelled1 = true;
function finish1(val) { if (!cancelled1) activeScreen = val; }
function finish2(val) { activeScreen = val; }
finish2("NEW");
finish1("OLD");
// TODO: Ensure activeScreen remains "NEW" and print it`,
          expectedOutput: 'NEW',
          hints: ['Cleanup sets `let ignore = true` (or aborts `AbortController`) so late slow responses never overwrite newer queries.'],
        },
        {
          id: 'wp-2-9',
          title: 'Controlled Form Validation Map',
          difficulty: 'Easy',
          description: 'Validate `{ title: "K", url: "bad" }` (`title.length >= 3`, `url.startsWith("https://")`). Print error count -> 2',
          starterCode: `const form = { title: "K", url: "bad" };// TODO: Build errors object and print Object.keys(errors).length`,
          expectedOutput: '2',
          hints: ['Both title length and https URL check fail -> 2 errors.'],
        },
        {
          id: 'wp-2-10',
          title: 'Optimistic Update Rollback Reducer',
          difficulty: 'Medium',
          description: 'Optimistically add `"Star"` (`[1]`), then fail & rollback to snapshot (`[]`), print final list length -> 0',
          starterCode: `let likes = [];
const snapshot = [...likes];
// TODO: Optimistic append, then rollback on error to snapshot`,
          expectedOutput: '0',
          hints: ['Always capture pre-mutation snapshot so failed mutations restore cleanly.'],
        },
      ],
    },
    {
      stepNumber: 3,
      title: 'React Performance, Memoization & Custom Hooks',
      topic: 'Shallow Props, useMemo Cache & Ref Patterns',
      estimatedTime: '2.5 Hours',
      summary:
        'Diagnose wasted React re-renders, implement shallow `arePropsEqual`, custom memo caches (`useMemo` internals), LRU render cache, and stable handler identities.',
      studyMaterial: {
        overview:
          'React re-renders components whenever their parent re-renders unless props are memoized with `React.memo` AND callback/object references remain stable across renders.',
        keyPoints: [
          'Inline lambdas (`onClick={() => del(id)}`) and inline object literals (`style={{ color }}`) break `React.memo` unless stable.',
          '`useMemo` caches an expensive result and recomputes ONLY when `[deps]` values fail `Object.is` comparison.',
          'Colocate frequently-changing state (like hover/search text) inside leaf components so heavy parent trees stay idle.',
        ],
        codeExamples: [
          {
            title: 'How useMemo Checks Dependency Arrays',
            code: `function depsChanged(prev, next) {  
return !prev || prev.length !== next.length || prev.some((v, i) => !Object.is(v, next[i]));
}
console.log(depsChanged([1, "a"], [1, "a"]), depsChanged([1, "a"], [1, "b"]));`,
            explanation: 'React uses `Object.is` slot-by-slot across hook dependency arrays.',
          },
        ],
        cheatsheet: [
          'Object.is(prevDep, nextDep) -> hook equality check',
          'Lift content / Push state down -> fastest zero-memo optimization',
          'Virtualize lists > 100 rows -> render only visible viewport window',
        ],
        officialDocUrl: 'https://react.dev/reference/react/useMemo',
      },
      video: yt(
        'React Course — Hooks, Context & Custom Patterns',
        'freeCodeCamp.org',
        'bMknfKXIFA8',
        '11h 55m',
        'Deep dive into hook lifecycle, custom hooks, performance optimization, and composition.',
      ),
      compilerStarterCode: `const depsEq = (a, b) => a.length === b.length && a.every((v, i) => Object.is(v, b[i]));console.log(depsEq([10, NaN], [10, NaN]));`,
      practiceQuestions: [
        {
          id: 'wp-3-1',
          title: 'Hook Dependency Equality Engine',
          difficulty: 'Easy',
          description: 'Implement `depsEqual(prev, next)` using `Object.is`. Compare `([1, NaN], [1, NaN])` and `([1, 2], [1, 3])` -> true false',
          starterCode: `function depsEqual(prev, next) {    
// TODO
}
console.log(depsEqual([1, NaN], [1, NaN]), depsEqual([1, 2], [1, 3]));`,
          expectedOutput: 'true false',
          hints: ['`Object.is(NaN, NaN)` is `true`, whereas `NaN === NaN` would wrongly invalidate every render!'],
        },
        {
          id: 'wp-3-2',
          title: 'Memoized Selector Cache Check',
          difficulty: 'Medium',
          description: 'Simulate `useMemo` storing `{ lastDep, lastVal }`: compute `n * n` for `n = 5, 5, 6`. Print `runs=2 val=36`',
          starterCode: `let runs = 0;
let cache = null;
function compute(n) {
    // TODO: Recompute n*n only when cache is null or n differs from cache.dep
}
compute(5); compute(5); const last = compute(6);
console.log(\`runs=\${runs} val=\${last}\`);`,
          expectedOutput: 'runs=2 val=36',
          hints: ['First `5` runs (runs=1), second `5` hits cache (runs=1), `6` runs (runs=2, val=36).'],
        },
        {
          id: 'wp-3-3',
          title: 'Shallow React.memo Props Comparator',
          difficulty: 'Easy',
          description: 'Write `memoSkipRender(prevProps, nextProps)` returning true iff all top-level keys match via `Object.is`. Test `({a:1,b:2},{a:1,b:2})` and `({a:1},{a:1,b:2})` -> true false',
          starterCode: `function memoSkipRender(prev, next) {    
// TODO
}
console.log(memoSkipRender({ a: 1, b: 2 }, { a: 1, b: 2 }), memoSkipRender({ a: 1 }, { a: 1, b: 2 }));`,
          expectedOutput: 'true false',
          hints: ['Compare `Object.keys(prev).length === Object.keys(next).length` and each key with `Object.is`.'],
        },
        {
          id: 'wp-3-4',
          title: 'Virtual List Viewport Window Slice',
          difficulty: 'Medium',
          description: '1,000 items each `rowHeight = 40px`. `scrollTop = 420px`, `viewportHeight = 200px`, `overscan = 1`. Compute `[startIdx, endIdx]` inclusive -> 9 16',
          starterCode: `const total = 1000, rowH = 40, scrollTop = 420, vp = 200, overscan = 1;// TODO: firstVisible = Math.floor(scrollTop / rowH), lastVisible = Math.ceil((scrollTop + vp) / rowH) - 1; apply overscan bounded [0..total-1]`,
          expectedOutput: '9 16',
          hints: ['`first = floor(420/40) = 10`, minus overscan 1 = `9`. `last = ceil(620/40)-1 = 16-1 = 15`, plus overscan 1 = `16`.'],
        },
        {
          id: 'wp-3-5',
          title: 'Stable Callback Event Ref Pattern',
          difficulty: 'Easy',
          description: 'Simulate `useEvent` / ref-backed handler where wrapper identity never changes (`fn === fn`) even after updating `ref.current` -> true 20',
          starterCode: `const ref = { current: () => 10 };
const stableHandler = () => ref.current();
const savedRef = stableHandler;
// TODO: Swap ref.current = () => 20, print (savedRef === stableHandler) and stableHandler()`,
          expectedOutput: 'true 20',
          hints: ['Keeping the outer arrow constant while reassigning `ref.current` prevents child re-renders.'],
        },
        {
          id: 'wp-3-6',
          title: 'Search Term Index Pre-Warm',
          difficulty: 'Easy',
          description: 'Precompute lowercase search strings once for `[{name:"NextJS"},{name:"Postgres"}]` and count matches for `"next"` -> 1',
          starterCode: `const raw = [{ name: "NextJS" }, { name: "Postgres" }];// TODO: Precompute normalized search strings and count match`,
          expectedOutput: '1',
          hints: ['Pre-normalizing fields outside the hot keystroke loop eliminates repeated allocations.'],
        },
        {
          id: 'wp-3-7',
          title: 'Context Value Split Check',
          difficulty: 'Easy',
          description: 'Explain via simulation: splitting `{ user }` and `{ theme }` contexts keeps `UserWidget` renders at `1` when only `theme` flips -> userRenders=1',
          starterCode: `let userRenders = 1;// TODO: Print userRenders=1 when theme updates without user reference changing`,
          expectedOutput: 'userRenders=1',
          hints: ['Splitting fast-changing UI context from auth/user context avoids subtree-wide re-renders.'],
        },
        {
          id: 'wp-3-8',
          title: 'Deferred Query Priority Queueing',
          difficulty: 'Easy',
          description: 'Suppose urgent state `input = "abc"` updates immediately while deferred render lags one tick at `"ab"`. Output `stale=true` while `input !== deferred` -> stale=true',
          starterCode: `const input = "abc", deferred = "ab";// TODO: console.log("stale=" + (input !== deferred))`,
          expectedOutput: 'stale=true',
          hints: ['React `useDeferredValue` exposes `isStale = query !== deferredQuery` for subtle loading feedback.'],
        },
        {
          id: 'wp-3-9',
          title: 'Bounded History Hook Ring',
          difficulty: 'Easy',
          description: 'Append `[1, 2, 3, 4]` keeping max last 3 snapshots via `.slice(-3)` -> [2,3,4]',
          starterCode: `let hist = [];
for (const x of [1, 2, 3, 4]) {
    // TODO: Append x keeping max 3 entries
}
console.log(JSON.stringify(hist));`,
          expectedOutput: '[2,3,4]',
          hints: ['`hist = [...hist, x].slice(-3)` bounds memory cleanly.'],
        },
        {
          id: 'wp-3-10',
          title: 'Measure Synchronous Render Budget',
          difficulty: 'Easy',
          description: 'Format component frame alert when `renderMs = 22.4` exceeds `16.6`ms 60fps budget -> WARN:22.4ms',
          starterCode: `const ms = 22.4;// TODO: Print WARN:<ms>ms if ms > 16.6 else OK`,
          expectedOutput: 'WARN:22.4ms',
          hints: ['60fps frame budget is `1000 / 60 ≈ 16.67ms`.'],
        },
      ],
    },
    {
      stepNumber: 4,
      title: 'Next.js App Router, SSR, Caching & Route Handlers',
      topic: 'Server vs Client Boundary, Caching & Dynamic Params',
      estimatedTime: '3 Hours',
      summary:
        'Design modern Next.js 14/15 App Router systems: Server vs Client boundaries, dynamic slug matching `[...slug]`, `Cache-Control` SWR headers, CSRF/Origin guards, and Route Handler status codes.',
      studyMaterial: {
        overview:
          'Next.js App Router flips React’s default: components are **Server Components** unless marked `"use client"`. Keep database queries and secrets strictly on the server, push `"use client"` down to small interactive leaves, and configure explicit `Cache-Control` headers cleanly.',
        keyPoints: [
          'Always place `"use client"` as low in the component tree as possible so heavy markdown/DB code stays out of the browser JS bundle.',
          'Dynamic route segments `[id]` and catch-all `[...slug]` parse URL parameters cleanly at request time.',
          'HTTP `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` serves edge cache instantly while refreshing in background.',
        ],
        codeExamples: [
          {
            title: 'Cache-Control SWR Header Generator',
            code: `const header = (sMax, swr) => \`public, s-maxage=\${sMax}, stale-while-revalidate=\${swr}\`;console.log(header(60, 300));`,
            explanation: 'CDNs return cached JSON in <10ms while asynchronously revalidating stale edges.',
          },
        ],
        cheatsheet: [
          'Server Component -> direct DB/secrets, zero client bundle size',
          '"use client" -> hooks, onClick, window/localStorage',
          '400 Bad Request | 401 Unauth | 403 Forbidden | 404 Not Found',
        ],
        officialDocUrl: 'https://nextjs.org/docs/app',
      },
      video: yt(
        'Next.js Full Course — App Router, Server Actions & Full-Stack',
        'JavaScript Mastery',
        'wm5gMKuwSYk',
        '5h 22m',
        'Complete guide to App Router routing, Server vs Client components, caching, and API endpoints.',
      ),
      compilerStarterCode: `function parseDynamic(pattern, url) {  
const p = pattern.split("/").filter(Boolean);
  const u = url.split("/").filter(Boolean);
  if (p.length !== u.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith("[") && p[i].endsWith("]")) params[p[i].slice(1, -1)] = u[i];
    else if (p[i] !== u[i]) return null;
  }
  return params;
}
console.log(parseDynamic("/arena/[matchId]", "/arena/duel-99").matchId);`,
      practiceQuestions: [
        {
          id: 'wp-4-1',
          title: 'Next.js Dynamic Segment Extractor',
          difficulty: 'Medium',
          description: 'Match `"/tracks/[lang]/[step]"` against `"/tracks/java/03"` and print `lang:step` -> java:03',
          starterCode: `function matchNextRoute(pattern, path) {    
// TODO
}
const p = matchNextRoute("/tracks/[lang]/[step]", "/tracks/java/03");
console.log(\`\${p.lang}:\${p.step}\`);`,
          expectedOutput: 'java:03',
          hints: ['Extract `[key]` segments into `params[key]`.'],
        },
        {
          id: 'wp-4-2',
          title: 'Catch-All Slug Matcher [...slug]',
          difficulty: 'Medium',
          description: 'Match `"/docs/[...slug]"` against `"/docs/api/v2/auth"` capturing `["api","v2","auth"]` joined by `/` -> api/v2/auth',
          starterCode: `function matchCatchAll(pattern, path) {    
// TODO
}
console.log(matchCatchAll("/docs/[...slug]", "/docs/api/v2/auth").slug.join("/"));`,
          expectedOutput: 'api/v2/auth',
          hints: ['Once segment `[...slug]` is reached, slice remainder of URL segments!'],
        },
        {
          id: 'wp-4-3',
          title: 'Stale-While-Revalidate Cache Builder',
          difficulty: 'Easy',
          description: 'Build Cache-Control header string for `sMax=120, swr=600` -> public, s-maxage=120, stale-while-revalidate=600',
          starterCode: `const sMax = 120, swr = 600;// TODO`,
          expectedOutput: 'public, s-maxage=120, stale-while-revalidate=600',
          hints: ['Exact casing: `public, s-maxage=120, stale-while-revalidate=600`.'],
        },
        {
          id: 'wp-4-4',
          title: 'Server Action Validation Status Code',
          difficulty: 'Easy',
          description: 'Simulate auth + body guard: missing session -> `401`, invalid payload -> `400`, valid -> `201`. Test `({user:null},{})` & `({user:"a"},{ok:true})` -> 401 201',
          starterCode: `function handlePost(session, body) {    
// TODO
}
console.log(handlePost({ user: null }, {}), handlePost({ user: "a" }, { ok: true }));`,
          expectedOutput: '401 201',
          hints: ['Authenticate first (`401`) before validating body (`400`) and creating resource (`201`).'],
        },
        {
          id: 'wp-4-5',
          title: 'CORS Origin Allowlist Check',
          difficulty: 'Easy',
          description: 'Allow `"https://kollabrix.in"` & `"https://folio.kollabrix.in"`, reject `"https://evil.com"` -> true false',
          starterCode: `const allowed = new Set(["https://kollabrix.in", "https://folio.kollabrix.in"]);// TODO`,
          expectedOutput: 'true false',
          hints: ['Check `allowed.has(origin)` strictly—never `origin.includes("kollabrix.in")`!'],
        },
        {
          id: 'wp-4-6',
          title: 'ISR Revalidation Expiry Check',
          difficulty: 'Easy',
          description: 'Cached at `t=100`, `revalidate=60`, current `now=175`. Print `"REVALIDATE"` if `now - cachedAt >= revalidate` else `"HIT"` -> REVALIDATE',
          starterCode: `const cachedAt = 100, revalidate = 60, now = 175;// TODO`,
          expectedOutput: 'REVALIDATE',
          hints: ['`175 - 100 = 75 >= 60` -> needs background revalidation.'],
        },
        {
          id: 'wp-4-7',
          title: 'OpenGraph Metadata Title Formatter',
          difficulty: 'Easy',
          description: 'Format `"KΛ ARENA"` with template `"%s | Kollabrix"` -> KΛ ARENA | Kollabrix',
          starterCode: `const title = "KΛ ARENA", tmpl = "%s | Kollabrix";// TODO`,
          expectedOutput: 'KΛ ARENA | Kollabrix',
          hints: ['`tmpl.replace("%s", title)`'],
        },
        {
          id: 'wp-4-8',
          title: 'Detect Secret Env Leak in Client Bundle',
          difficulty: 'Easy',
          description: 'Given keys `["NEXT_PUBLIC_SITE", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_API"]`, print count of server-only keys missing `NEXT_PUBLIC_` prefix -> 1',
          starterCode: `const keys = ["NEXT_PUBLIC_SITE", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_API"];// TODO`,
          expectedOutput: '1',
          hints: ['Never expose non-`NEXT_PUBLIC_` secrets in `"use client"` files!'],
        },
        {
          id: 'wp-4-9',
          title: 'Safe Redirect URL Open-Redirect Guard',
          difficulty: 'Medium',
          description: 'Ensure redirect starts with single `/` (not `//evil.com`). Test `"/arena"` & `"//evil.com"` returning `"/"` fallback -> /arena /',
          starterCode: `function safeNext(next) {    
// TODO: Allow single leading '/' and disallow '//' or protocol URLs
}
console.log(safeNext("/arena"), safeNext("//evil.com"));`,
          expectedOutput: '/arena /',
          hints: ['`typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/"`'],
        },
        {
          id: 'wp-4-10',
          title: 'Streaming NDJSON Chunk Line Parser',
          difficulty: 'Medium',
          description: 'Parse `"{\\"t\\":\\"Hi\\"}\\n{\\"t\\":\\" KΛ\\"}\\n"` ignoring trailing empty line and join `.t` -> Hi KΛ',
          starterCode: `const stream = '{"t":"Hi"}\\n{"t":" KΛ"}\\n';// TODO: Split lines, filter non-empty, JSON.parse, join .t`,
          expectedOutput: 'Hi KΛ',
          hints: ['Streaming AI responses emit newline-delimited JSON chunks safely parsed per line.'],
        },
      ],
    },
    {
      stepNumber: 5,
      title: 'PostgreSQL Patterns, Joins, Auth & Rate Limiting',
      topic: 'SQL Optimization, N+1 Elimination & Security',
      estimatedTime: '3 Hours',
      summary:
        'Master database backend engineering in JS/Node: eliminating N+1 queries via JOIN/batch maps, cursor pagination, JWT payload inspection, and sliding-window rate limits.',
      studyMaterial: {
        overview:
          'Slow backends almost always suffer from **N+1 SQL queries** (looping 50 users and firing 50 extra `SELECT` queries) or unindexed `OFFSET` scans. Always batch child fetches (`WHERE user_id = ANY($1)`) and attach parameterized bindings.',
        keyPoints: [
          'Replace N+1 loops with one batch query (`IN (...)`) joined cleanly in O(N) using a `Map`.',
          'Never skip ownership checks (`WHERE id = $1 AND owner_id = $2`) on mutations (prevents IDOR vulnerabilities!).',
          'Verify JWT expiration (`exp * 1000 > Date.now()`) cleanly.',
        ],
        codeExamples: [
          {
            title: 'Eliminating N+1 via Map Join',
            code: `const users = [{ id: 1, name: "Ada" }, { id: 2, name: "Ben" }];
const badges = [{ uid: 1, tag: "PRO" }, { uid: 1, tag: "TOP" }];
const byUid = badges.reduce((m, b) => m.set(b.uid, [...(m.get(b.uid) ?? []), b.tag]), new Map());
console.log(users[0].name, byUid.get(1).join(","));`,
            explanation: '2 constant queries joined cleanly in O(U + B) time instead of O(U) round trips.',
          },
        ],
        cheatsheet: [
          'WHERE id = $1 AND owner_id = $2 -> prevents IDOR',
          'Batch IN (...) + Map lookup -> kills N+1 loops',
          'B-Tree composite index: most selective / equality col first!',
        ],
        officialDocUrl: 'https://www.postgresql.org/docs/current/indexes.html',
      },
      video: yt(
        'SQL & Relational Databases — Complete Course',
        'freeCodeCamp.org',
        'HXV3zeQKqGY',
        '4h 20m',
        'Covers SELECT, INNER/LEFT JOIN, GROUP BY aggregations, indexes, and foreign keys.',
      ),
      compilerStarterCode: `const users = [{ id: 1, name: "Ada" }, { id: 2, name: "Cal" }];
const wins = { 1: 12, 2: 5 };
console.log(users.map(u => \`\${u.name}:\${wins[u.id] ?? 0}\`).join(" "));`,
      practiceQuestions: [
        {
          id: 'wp-5-1',
          title: 'Batch Child Hydration (Kill N+1)',
          difficulty: 'Easy',
          description: 'Join `teams=[{id:1,n:"Alpha"},{id:2,n:"Beta"}]` with `members=[{tid:1,u:"A"},{tid:1,u:"B"}]` via Map, print Alpha member count and Beta member count -> 2 0',
          starterCode: `const teams = [{ id: 1, n: "Alpha" }, { id: 2, n: "Beta" }];
const members = [{ tid: 1, u: "A" }, { tid: 1, u: "B" }];
// TODO: Group members by tid in a Map`,
          expectedOutput: '2 0',
          hints: ['Default missing keys to `[]` cleanly: `(byTid.get(t.id) ?? []).length`.'],
        },
        {
          id: 'wp-5-2',
          title: 'SQL Injection Detection Guard',
          difficulty: 'Easy',
          description: 'Parameterized query builder for `["Java", "SQL\' OR 1=1--"]`: ensure output emits `$1,$2` placeholders safely -> SELECT * FROM docs WHERE tag IN ($1,$2)',
          starterCode: `const tags = ["Java", "SQL' OR 1=1--"];// TODO: Generate $1..$n parameterized SQL`,
          expectedOutput: 'SELECT * FROM docs WHERE tag IN ($1,$2)',
          hints: ['`tags.map((_, i) => "$" + (i + 1)).join(",")` keeps untrusted values strictly out of the SQL string!'],
        },
        {
          id: 'wp-5-3',
          title: 'IDOR Resource Ownership Guard',
          difficulty: 'Easy',
          description: 'Verify `resource = { id: 9, ownerId: "u2" }` against actor `{ id: "u1", role: "USER" }` and admin `{ id: "u9", role: "ADMIN" }` -> 403 200',
          starterCode: `function canDelete(res, actor) {    
// TODO: Allow if res.ownerId === actor.id || actor.role === "ADMIN"
}
const r = { id: 9, ownerId: "u2" };
console.log(canDelete(r, { id: "u1", role: "USER" }), canDelete(r, { id: "u9", role: "ADMIN" }));`,
          expectedOutput: '403 200',
          hints: ['Return `200` if permitted, else `403` Forbidden.'],
        },
        {
          id: 'wp-5-4',
          title: 'Base64URL JWT Payload Decoder',
          difficulty: 'Medium',
          description: 'Decode middle JWT claim segment `"eyJ1aWQiOjQyfQ"` (base64url) using `Buffer.from(..., "base64url").toString()` and print `uid` -> 42',
          starterCode: `const token = "hdr.eyJ1aWQiOjQyfQ.sig";// TODO: Split on '.', decode middle segment, JSON.parse`,
          expectedOutput: '42',
          hints: ['`JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).uid`'],
        },
        {
          id: 'wp-5-5',
          title: 'Leaderboard SQL GROUP BY + AVG Simulator',
          difficulty: 'Medium',
          description: 'Aggregate `[{u:"A",s:80},{u:"B",s:90},{u:"A",s:100}]` into sorted average per user -> A:90 B:90',
          starterCode: `const rows = [{ u: "A", s: 80 }, { u: "B", s: 90 }, { u: "A", s: 100 }];// TODO`,
          expectedOutput: 'A:90 B:90',
          hints: ['Track `{ sum, count }` per user and compute `sum / count`.'],
        },
        {
          id: 'wp-5-6',
          title: 'Atomic Balance Transfer Rollback Check',
          difficulty: 'Medium',
          description: 'Transfer `300` from `{A: 500, B: 100}`, then attempt `400` from A (insufficient -> rollback!). Print `A B` -> 200 400',
          starterCode: `const db = { A: 500, B: 100 };
function transfer(from, to, amt) {
    // TODO: Commit only if db[from] >= amt
}
transfer("A", "B", 300);
transfer("A", "B", 400);
console.log(db.A, db.B);`,
          expectedOutput: '200 400',
          hints: ['Enforcing `CHECK (balance >= 0)` / pre-check prevents negative balance overdrafts.'],
        },
        {
          id: 'wp-5-7',
          title: 'Composite Index Column Ordering Logic',
          difficulty: 'Easy',
          description: 'Given query `WHERE org_id = $1 AND status = $2 AND created_at > $3`, print optimal B-Tree index columns -> org_id,status,created_at',
          starterCode: `const eqCols = ["org_id", "status"], rangeCols = ["created_at"];// TODO: Equality columns precede range column`,
          expectedOutput: 'org_id,status,created_at',
          hints: ['Equality filters narrow index scan first before range (`>`) scanning.'],
        },
        {
          id: 'wp-5-8',
          title: 'Sliding Window Rate Limiter (Node JS)',
          difficulty: 'Medium',
          description: 'Limit `2` reqs per `1000ms` window. Arrivals `[100, 500, 800, 1200]`: print allowed count -> 3',
          starterCode: `const reqs = [100, 500, 800, 1200];// TODO: Keep queue timestamps > now - 1000`,
          expectedOutput: '3',
          hints: ['100 allowed ([100]), 500 allowed ([100,500]), 800 denied, 1200 drops 100 -> allowed ([500,1200]).'],
        },
        {
          id: 'wp-5-9',
          title: 'ELO Rating Update Formula',
          difficulty: 'Medium',
          description: 'Winner & loser both start `1200`, K=32. Compute expected `1/(1+10^0)=0.5`, print `newWinner newLoser` -> 1216 1184',
          starterCode: `const ra = 1200, rb = 1200, K = 32;// TODO: Compute delta and print rounded updated ELOs`,
          expectedOutput: '1216 1184',
          hints: ['Equal ratings give `expected = 0.5`; winner gains `32 * (1 - 0.5) = 16`.'],
        },
        {
          id: 'wp-5-10',
          title: 'Upsert (ON CONFLICT DO UPDATE) Simulator',
          difficulty: 'Easy',
          description: 'Apply upserts `[{id:1,v:10},{id:2,v:20},{id:1,v:99}]` into Map; print values sorted by key -> 99 20',
          starterCode: `const ops = [{ id: 1, v: 10 }, { id: 2, v: 20 }, { id: 1, v: 99 }];// TODO`,
          expectedOutput: '99 20',
          hints: ['`Map.set(id, v)` overwrites on key conflict automatically.'],
        },
      ],
    },
    {
      stepNumber: 6,
      title: 'Testing, Caching & Production Architecture',
      topic: 'Vitest Patterns, Spies, LRU & Metrics',
      estimatedTime: '2.5 Hours',
      summary:
        'Write deterministic unit test runners, verify spy calls without side-effects, build O(1) Map-backed LRU caches, and compute p95 tail latencies cleanly.',
      studyMaterial: {
        overview:
          'In JavaScript, `new Map()` preserves insertion order in O(1), meaning `map.delete(k); map.set(k, v)` refreshes any key to most-recently-used and `map.keys().next().value` reads the oldest key in O(1)! Combine that with p95 tail metrics and Vitest-style assertions for production confidence.',
        keyPoints: [
          'Always measure **p95 / p99 tail latency**, never average latency, when evaluating web performance.',
          'JavaScript `Map` natively powers O(1) LRU Caches (`delete` + `set` moves key to tail).',
          'Isolate pure business functions from HTTP/DOM wrappers so tests run in milliseconds.',
        ],
        codeExamples: [
          {
            title: 'O(1) JS Map LRU Cache',
            code: `class LRU {
  constructor(cap) { this.cap = cap; this.m = new Map(); }
  get(k) {
    if (!this.m.has(k)) return -1;
    const v = this.m.get(k); this.m.delete(k); this.m.set(k, v); return v;
  }
  put(k, v) {
    if (this.m.has(k)) this.m.delete(k);
    this.m.set(k, v);
    if (this.m.size > this.cap) this.m.delete(this.m.keys().next().value);
  }
}
const c = new LRU(2); c.put("a",1); c.put("b",2); c.get("a"); c.put("c",3);
console.log(c.get("b"), c.get("a"));`,
            explanation: 'Evicts `"b"` while preserving touched `"a"` in strict O(1) per operation.',
          },
        ],
        cheatsheet: [
          'p95 = sorted[Math.ceil(0.95 * n) - 1]',
          'Map.keys().next().value -> oldest inserted key in JS',
          'AAA Testing Pattern: Arrange -> Act -> Assert',
        ],
        officialDocUrl: 'https://vitest.dev/guide/',
      },
      video: yt(
        'Next.js 13+ Full-Stack Architecture & Testing Flow',
        'Web Dev Simplified',
        'NgayZAuTgwM',
        '48m',
        'Walks through full-stack architecture, caching invalidation, and clean service testing.',
      ),
      compilerStarterCode: `const lat = [12, 45, 18, 220, 30, 19, 25, 40, 15, 28].sort((a, b) => a - b);console.log("p95:", lat[Math.ceil(0.95 * lat.length) - 1]);`,
      practiceQuestions: [
        {
          id: 'wp-6-1',
          title: 'p95 & p99 Tail Latency Calculator',
          difficulty: 'Easy',
          description: 'Compute p95 of `[10, 50, 20, 40, 30, 100, 15, 25, 35, 200]` (`sorted[ceil(0.95*n)-1]`) -> 200',
          starterCode: `const samples = [10, 50, 20, 40, 30, 100, 15, 25, 35, 200];// TODO: Sort numeric ascending and pick Math.ceil(0.95 * n) - 1`,
          expectedOutput: '200',
          hints: ['Sort numeric `(a, b) => a - b`! Index `ceil(9.5) - 1 = 9`.'],
        },
        {
          id: 'wp-6-2',
          title: 'O(1) JavaScript Map LRU Cache',
          difficulty: 'Medium',
          description: 'Implement `LRU(2)`: `put(1,10)`, `put(2,20)`, `get(1)`, `put(3,30)` -> print `get(2) get(1)` -> -1 10',
          starterCode: `class LRU {
    constructor(cap) { this.cap = cap; this.m = new Map(); }
    // TODO: get(k) & put(k, v)
}
const c = new LRU(2);
c.put(1, 10); c.put(2, 20); c.get(1); c.put(3, 30);
console.log(c.get(2), c.get(1));`,
          expectedOutput: '-1 10',
          hints: ['Delete and re-set on hit so key moves to newest tail of JS Map.'],
        },
        {
          id: 'wp-6-3',
          title: 'Lightweight Spy Call Tracker',
          difficulty: 'Easy',
          description: 'Write `createSpy()` recording call args into `.calls`. Call with `"login"` then `"save"`, print count & last arg -> 2 save',
          starterCode: `function createSpy() {    
// TODO: Return function with attached .calls array
}
const spy = createSpy();
spy("login"); spy("save");
console.log(spy.calls.length, spy.calls.at(-1)[0]);`,
          expectedOutput: '2 save',
          hints: ['`const fn = (...args) => fn.calls.push(args); fn.calls = []; return fn;`'],
        },
        {
          id: 'wp-6-4',
          title: 'Deep Equal Test Assertion Utility',
          difficulty: 'Medium',
          description: 'Write `deepEq(a, b)` handling nested objects & arrays cleanly. Test `({x:[1,2]}, {x:[1,2]})` and `({x:[1,2]}, {x:[1,3]})` -> true false',
          starterCode: `function deepEq(a, b) {    
// TODO
}
console.log(deepEq({ x: [1, 2] }, { x: [1, 2] }), deepEq({ x: [1, 2] }, { x: [1, 3] }));`,
          expectedOutput: 'true false',
          hints: ['Check `Object.is(a, b)` first, verify both non-null objects, compare Array flags and keys recursively.'],
        },
        {
          id: 'wp-6-5',
          title: 'Mini Describe/Test Runner',
          difficulty: 'Easy',
          description: 'Run tests `[() => 2+2 === 4, () => "hi".length === 2, () => 1 === 2]`, print `"2/3 PASSED"`',
          starterCode: `const checks = [() => 2 + 2 === 4, () => "hi".length === 2, () => 1 === 2];// TODO`,
          expectedOutput: '2/3 PASSED',
          hints: ['Count truthy return values cleanly via `.filter(fn => fn()).length`.'],
        },
        {
          id: 'wp-6-6',
          title: 'Circuit Breaker Half-Open Recovery',
          difficulty: 'Medium',
          description: 'Start OPEN; transition to `HALF_OPEN` after cooldown, then `CLOSED` on 1 success -> CLOSED',
          starterCode: `let state = "OPEN";// TODO: Simulate cooldown elapsed -> HALF_OPEN -> probe ok -> CLOSED`,
          expectedOutput: 'CLOSED',
          hints: ['Only transition `HALF_OPEN -> CLOSED` once probe succeeds without throwing.'],
        },
        {
          id: 'wp-6-7',
          title: 'Structured JSON Access Logger',
          difficulty: 'Easy',
          description: 'Format log `{ method: "POST", path: "/api/duel", status: 200 }` omitting undefined fields -> {"method":"POST","path":"/api/duel","status":200}',
          starterCode: `const entry = { method: "POST", path: "/api/duel", status: 200, err: undefined };// TODO: JSON.stringify drops undefined fields automatically!`,
          expectedOutput: '{"method":"POST","path":"/api/duel","status":200}',
          hints: ['Notice `JSON.stringify` excludes keys whose value is `undefined`.'],
        },
        {
          id: 'wp-6-8',
          title: 'Consistent Feature Flag Bucketing (0..99)',
          difficulty: 'Medium',
          description: 'Hash `"user-42"` summing char codes `% 100`; check rollout `< 50` -> true or false deterministically.',
          starterCode: `const uid = "user-42";// TODO: Sum charCodeAt(i), compute bucket = sum % 100, print bucket < 50`,
          expectedOutput: 'false',
          hints: ['Sum of `"user-42"` ASCII codes = `117+115+101+114+45+52+50 = 594` -> `% 100 = 94 >= 50` -> `false`.'],
        },
        {
          id: 'wp-6-9',
          title: 'Idempotent Webhook Signature Timestamp Guard',
          difficulty: 'Easy',
          description: 'Reject webhook timestamps older than `300s` (`now - ts > 300`). Test `now=1000, ts=650` and `ts=900` -> EXPIRED OK',
          starterCode: `const checkFresh = (now, ts) => (now - ts <= 300 ? "OK" : "EXPIRED");// TODO: Print checkFresh(1000, 650) and checkFresh(1000, 900)`,
          expectedOutput: 'EXPIRED OK',
          hints: ['Bounding timestamp age defeats replay attacks even with captured valid signatures!'],
        },
        {
          id: 'wp-6-10',
          title: 'Clean Graceful Shutdown Drain Queue',
          difficulty: 'Easy',
          description: 'Mark `draining = true` refusing new work `"REQ_2"`, while completing in-flight `"REQ_1"` -> DONE:REQ_1 REJECT:REQ_2',
          starterCode: `let draining = false;
const inflight = ["REQ_1"];
draining = true;
// TODO: Process inflight items then reject new incoming "REQ_2"`,
          expectedOutput: 'DONE:REQ_1 REJECT:REQ_2',
          hints: ['Graceful SIGTERM stops accepting new traffic immediately while finishing open requests.'],
        },
      ],
    },
  ],
};
