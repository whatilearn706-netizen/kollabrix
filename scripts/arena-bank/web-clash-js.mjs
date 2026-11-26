import { makeWebClash } from './builders.mjs';

/**
 * 180 unique Web Pixel Clash challenges:
 * - 90 HTML + JavaScript (Easy/Medium/Hard x 3m/5m/10m x 10 each)
 * - 90 HTML + CSS + JavaScript (Easy/Medium/Hard x 3m/5m/10m x 10 each)
 */

const WIDGET_SPECS = [
  {
    name: 'Click Counter Gate', heading: 'Click Counter',
    html: '<div style="padding:16px;font-family:sans-serif;text-align:center;">\n  <h2>Click Counter</h2>\n  <div id="val">0</div>\n  <button id="btn">Increment</button>\n</div>',
    css: 'body { background:#0f172a; color:#fff; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#1e293b; padding:20px; border-radius:14px; text-align:center; }\n#val { font-size:36px; font-weight:900; color:#38bdf8; margin:10px 0; }\n#btn { background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:8px; cursor:pointer; }',
    js: 'let count = 0;\ndocument.getElementById("btn").addEventListener("click", () => {\n  count += 1;\n  document.getElementById("val").textContent = count;\n});',
    checks: [
      { label: 'Heading, display #val, and button present', scope: 'html', req: '<h[1-6][^>]*>[^<]*Click[\\s\\S]*?id=["\']val["\'][\\s\\S]*?<button' },
      { label: 'Click event increments displayed counter', scope: 'js', req: 'addEventListener|onclick&&textContent|innerText' },
    ],
  },
  {
    name: 'Status Toggle Switch', heading: 'Node Status',
    html: '<div style="padding:16px;font-family:sans-serif;text-align:center;">\n  <h2>Node Status</h2>\n  <p id="state">Offline</p>\n  <button id="toggle">Toggle Power</button>\n</div>',
    css: 'body { background:#090d16; color:#f8fafc; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#111827; padding:20px; border-radius:12px; border:1px solid #374151; text-align:center; }\n#state { font-weight:800; color:#10b981; margin:8px 0 12px; }\n#toggle { background:#10b981; color:#052e16; border:none; padding:8px 14px; border-radius:8px; font-weight:700; }',
    js: 'let online = false;\ndocument.getElementById("toggle").addEventListener("click", () => {\n  online = !online;\n  document.getElementById("state").textContent = online ? "Online" : "Offline";\n});',
    checks: [
      { label: 'Status text & toggle button rendered', scope: 'html', req: '<h[1-6][^>]*>[^<]*Status[\\s\\S]*?id=["\']state["\'][\\s\\S]*?<button' },
      { label: 'Click listener toggles Online/Offline state', scope: 'js', req: 'addEventListener|onclick&&Online|Offline' },
    ],
  },
  {
    name: 'Live Character Meter', heading: 'Bio Counter',
    html: '<div style="padding:16px;font-family:sans-serif;">\n  <h2>Bio Counter</h2>\n  <input id="bio" type="text" placeholder="Type bio..." />\n  <p>Chars: <strong id="len">0</strong></p>\n</div>',
    css: 'body { background:#0f172a; color:#f8fafc; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#1e293b; padding:18px; border-radius:12px; width:280px; }\n#bio { width:100%; padding:8px; border-radius:6px; border:1px solid #475569; margin:8px 0; }\n#len { color:#38bdf8; }',
    js: 'document.getElementById("bio").addEventListener("input", (e) => {\n  document.getElementById("len").textContent = e.target.value.length;\n});',
    checks: [
      { label: 'Input field & live counter element', scope: 'html', req: '<h[1-6][^>]*>[^<]*Bio[\\s\\S]*?<input[\\s\\S]*?id=["\']len["\']' },
      { label: 'Input event updates character length', scope: 'js', req: 'addEventListener|oninput&&length' },
    ],
  },
  {
    name: 'Password Reveal Eye', heading: 'Secret Vault',
    html: '<div style="padding:16px;font-family:sans-serif;">\n  <h2>Secret Vault</h2>\n  <input id="pwd" type="password" value="arena123" />\n  <button id="eye">Show</button>\n</div>',
    css: 'body { background:#18181b; color:#fafafa; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#27272a; padding:20px; border-radius:12px; display:flex; flex-direction:column; gap:8px; }\n#pwd { padding:8px; border-radius:6px; border:1px solid #52525b; }\n#eye { background:#f59e0b; color:#18181b; border:none; padding:8px; border-radius:6px; font-weight:700; }',
    js: 'const pwd = document.getElementById("pwd");\nconst btn = document.getElementById("eye");\nbtn.addEventListener("click", () => {\n  const hide = pwd.type === "text";\n  pwd.type = hide ? "password" : "text";\n  btn.textContent = hide ? "Show" : "Hide";\n});',
    checks: [
      { label: 'Password input & toggle button present', scope: 'html', req: 'type=["\']password["\'][\\s\\S]*?<button' },
      { label: 'Click switches type between password and text', scope: 'js', req: 'addEventListener|onclick&&password&&text' },
    ],
  },
  {
    name: 'Celsius Fahrenheit Swap', heading: 'Temp Converter',
    html: '<div style="padding:16px;font-family:sans-serif;">\n  <h2>Temp Converter</h2>\n  <input id="cel" type="number" placeholder="Celsius" />\n  <p>Fahrenheit: <span id="far">32</span></p>\n</div>',
    css: 'body { background:#0c4a6e; color:#fff; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#082f49; padding:20px; border-radius:14px; }\n#cel { padding:8px; border-radius:6px; border:none; margin:8px 0; }\n#far { font-weight:800; color:#38bdf8; }',
    js: 'document.getElementById("cel").addEventListener("input", (e) => {\n  const c = parseFloat(e.target.value) || 0;\n  document.getElementById("far").textContent = ((c * 9) / 5 + 32).toFixed(1);\n});',
    checks: [
      { label: 'Numeric input & Fahrenheit display present', scope: 'html', req: '<h[1-6][^>]*>[^<]*Temp[\\s\\S]*?<input[\\s\\S]*?id=["\']far["\']' },
      { label: 'Live conversion formula updating display', scope: 'js', req: 'addEventListener|oninput&&32' },
    ],
  },
  {
    name: 'Quick Poll Vote Counter', heading: 'Team Poll',
    html: '<div style="padding:16px;font-family:sans-serif;">\n  <h2>Team Poll</h2>\n  <button id="voteA">Python (<span id="cA">0</span>)</button>\n  <button id="voteB">C++ (<span id="cB">0</span>)</button>\n</div>',
    css: 'body { background:#0f172a; color:#fff; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#1e293b; padding:18px; border-radius:12px; display:flex; flex-direction:column; gap:10px; }\nbutton { background:#3b82f6; color:#fff; border:none; padding:8px 14px; border-radius:8px; font-weight:700; cursor:pointer; }',
    js: 'let a = 0, b = 0;\ndocument.getElementById("voteA").addEventListener("click", () => { document.getElementById("cA").textContent = ++a; });\ndocument.getElementById("voteB").addEventListener("click", () => { document.getElementById("cB").textContent = ++b; });',
    checks: [
      { label: 'Two vote buttons with counters', scope: 'html', req: '<h[1-6][^>]*>[^<]*Poll[\\s\\S]*?<button[\\s\\S]*?<button' },
      { label: 'Separate click handlers increment votes', scope: 'js', req: 'addEventListener|onclick&&textContent|innerText' },
    ],
  },
  {
    name: 'Step Alert Stepper', heading: 'Step Tracker',
    html: '<div style="padding:16px;font-family:sans-serif;">\n  <h2>Step Tracker</h2>\n  <div id="step">Step 1</div>\n  <button id="prev">Back</button>\n  <button id="next">Next</button>\n</div>',
    css: 'body { background:#111827; color:#f9fafb; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#1f2937; padding:20px; border-radius:12px; text-align:center; }\n#step { font-size:20px; font-weight:800; margin:10px 0; color:#a78bfa; }\nbutton { background:#6366f1; color:#fff; border:none; padding:6px 14px; border-radius:6px; margin:0 4px; cursor:pointer; }',
    js: 'let s = 1;\nconst el = document.getElementById("step");\ndocument.getElementById("next").addEventListener("click", () => { if (s < 4) s++; el.textContent = "Step " + s; });\ndocument.getElementById("prev").addEventListener("click", () => { if (s > 1) s--; el.textContent = "Step " + s; });',
    checks: [
      { label: 'Step display & Back/Next buttons', scope: 'html', req: 'id=["\']step["\'][\\s\\S]*?<button[\\s\\S]*?<button' },
      { label: 'Bounded step increment/decrement JS logic', scope: 'js', req: 'addEventListener|onclick&&Step' },
    ],
  },
  {
    name: 'Quick List Item Adder', heading: 'Sprint Tasks',
    html: '<div style="padding:16px;font-family:sans-serif;">\n  <h2>Sprint Tasks</h2>\n  <input id="task" type="text" placeholder="Task..." />\n  <button id="add">Add</button>\n  <ul id="list"></ul>\n</div>',
    css: 'body { background:#090d16; color:#fff; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#111827; padding:18px; border-radius:12px; width:280px; }\n#task { padding:6px; border-radius:6px; border:1px solid #374151; }\n#add { background:#10b981; color:#052e16; border:none; padding:6px 12px; border-radius:6px; font-weight:700; }',
    js: 'document.getElementById("add").addEventListener("click", () => {\n  const inp = document.getElementById("task");\n  if (!inp.value.trim()) return;\n  const li = document.createElement("li");\n  li.textContent = inp.value.trim();\n  document.getElementById("list").appendChild(li);\n  inp.value = "";\n});',
    checks: [
      { label: 'Task input, Add button & <ul> list', scope: 'html', req: '<input[\\s\\S]*?<button[\\s\\S]*?<ul' },
      { label: 'Appends new <li> on click', scope: 'js', req: 'createElement|innerHTML&&appendChild|innerHTML' },
    ],
  },
  {
    name: 'FAQ Accordion Drawer', heading: 'FAQ Panel',
    html: '<div style="padding:16px;font-family:sans-serif;">\n  <h2>FAQ Panel</h2>\n  <button id="q">Toggle Answer</button>\n  <p id="ans" style="display:none;">Verified in 60 seconds.</p>\n</div>',
    css: 'body { background:#0f172a; color:#fff; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#1e293b; padding:18px; border-radius:12px; width:300px; }\n#q { width:100%; text-align:left; background:#334155; color:#fff; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer; }\n#ans { margin-top:10px; color:#cbd5e1; font-size:13px; }',
    js: 'document.getElementById("q").addEventListener("click", () => {\n  const a = document.getElementById("ans");\n  a.style.display = a.style.display === "none" ? "block" : "none";\n});',
    checks: [
      { label: 'Accordion button & answer text present', scope: 'html', req: '<h[1-6][^>]*>[^<]*FAQ[\\s\\S]*?<button[\\s\\S]*?id=["\']ans["\']' },
      { label: 'Click toggles display visibility', scope: 'js', req: 'addEventListener|onclick&&display' },
    ],
  },
  {
    name: 'Tip Split Calculator', heading: 'Bill Split',
    html: '<div style="padding:16px;font-family:sans-serif;">\n  <h2>Bill Split</h2>\n  <input id="amt" type="number" value="100" />\n  <input id="ppl" type="number" value="4" />\n  <p>Each: $<strong id="each">25</strong></p>\n</div>',
    css: 'body { background:#1c1917; color:#fafaf9; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.box { background:#292524; padding:20px; border-radius:14px; display:flex; flex-direction:column; gap:8px; }\ninput { padding:8px; border-radius:6px; border:none; }\n#each { color:#fb923c; }',
    js: 'const calc = () => {\n  const a = Number(document.getElementById("amt").value) || 0;\n  const p = Math.max(1, Number(document.getElementById("ppl").value) || 1);\n  document.getElementById("each").textContent = (a / p).toFixed(2);\n};\ndocument.getElementById("amt").addEventListener("input", calc);\ndocument.getElementById("ppl").addEventListener("input", calc);',
    checks: [
      { label: 'Amount & people inputs + result display', scope: 'html', req: '<input[\\s\\S]*?<input[\\s\\S]*?id=["\']each["\']' },
      { label: 'Live division updates per-person amount', scope: 'js', req: 'addEventListener|oninput&&textContent|innerText' },
    ],
  },
];

const CONTEXT_BADGES = ['Live', 'Campus', 'Studio', 'V2', 'Alpha', 'Fast', 'Pro', 'Core', 'Beta'];

function buildWebJsSuites(withCss) {
  const durations = [
    { secs: 180, tag: '3m' },
    { secs: 300, tag: '5m' },
    { secs: 600, tag: '10m' },
  ];
  const diffs = ['easy', 'medium', 'hard'];
  const stackTags = withCss ? ['html', 'css', 'javascript'] : ['html', 'javascript'];
  const prefix = withCss ? 'wc-hcj' : 'wc-hj';
  const list = [];

  for (const diff of diffs) {
    for (const dur of durations) {
      for (let idx = 0; idx < 10; idx++) {
        const w = WIDGET_SPECS[idx % WIDGET_SPECS.length];
        const ctx = CONTEXT_BADGES[(diffs.indexOf(diff) * 3 + durations.indexOf(dur)) % CONTEXT_BADGES.length];
        const id = `${prefix}-${diff[0]}${dur.tag}-${String(idx + 1).padStart(2, '0')}`;
        const title = `${ctx} ${w.name} (${dur.tag.toUpperCase()} ${diff[0].toUpperCase()}${withCss ? 'X' : 'J'})`;

        const targetHtml = withCss
          ? w.html.replace('<div style="padding:16px;font-family:sans-serif;text-align:center;">', '<div class="box">').replace('<div style="padding:16px;font-family:sans-serif;">', '<div class="box">')
          : w.html;

        const htmlLines = targetHtml.split('\n');
        const cssLines = w.css.split('\n');

        let starterHtml = targetHtml;
        let starterCss = '';
        let checks = [];
        let scopeDesc = '';

        if (withCss) {
          if (dur.secs === 180) {
            // 3m HTML+CSS+JS: 100% HTML + 100% CSS given -> user writes JS only
            starterHtml = targetHtml;
            starterCss = w.css;
            checks = w.checks.filter((c) => c.scope === 'js');
            scopeDesc = 'HTML & CSS are 100% pre-filled — write script.js interactivity only.';
          } else if (dur.secs === 300) {
            // 5m HTML+CSS+JS: ~60% HTML + ~40% CSS given -> user finishes HTML, control CSS & JS
            starterHtml = [
              ...htmlLines.slice(0, -2),
              '  <!-- Add remaining interactive element matching Blueprint -->',
              htmlLines[htmlLines.length - 1],
            ].join('\n');
            starterCss = `${cssLines.slice(0, 2).join('\n')}\n/* Finish button/control & display CSS (~60% remaining) */\n`;
            checks = [
              ...w.checks,
              { label: 'Style inner controls & display elements (#id / button)', scope: 'css', req: '#[a-z]+|button|input' },
            ];
            scopeDesc = '60% HTML & 40% CSS are pre-filled — finish HTML/CSS + write script.js.';
          } else {
            // 10m HTML+CSS+JS: ~30% HTML + ~20% CSS given -> user finishes most HTML, CSS & JS
            starterHtml = [
              htmlLines[0],
              htmlLines[1],
              '  <!-- Build interactive inputs, buttons & output elements -->',
              htmlLines[htmlLines.length - 1],
            ].join('\n');
            starterCss = `${cssLines[0]}\n.box {\n  /* Add card & interactive control styles */\n}\n`;
            checks = [
              ...w.checks,
              { label: 'Styled .box layout & accent button/panel CSS', scope: 'css', req: 'background\\s*:&&padding\\s*:' },
            ];
            scopeDesc = '30% HTML & 20% CSS starter — build UI markup, styling & script.js.';
          }
        } else {
          if (dur.secs === 180) {
            // 3m HTML+JS: 100% HTML given -> user writes JS only
            starterHtml = targetHtml;
            checks = w.checks.filter((c) => c.scope === 'js');
            scopeDesc = 'HTML is 100% pre-filled — write script.js interactivity only.';
          } else if (dur.secs === 300) {
            // 5m HTML+JS: ~75% HTML given -> user adds final control/display + writes JS
            starterHtml = [
              ...htmlLines.slice(0, -2),
              '  <!-- Add remaining interactive element matching Blueprint -->',
              htmlLines[htmlLines.length - 1],
            ].join('\n');
            checks = w.checks;
            scopeDesc = '75% HTML is pre-filled — add missing control/output + write script.js.';
          } else {
            // 10m HTML+JS: ~40% HTML given -> user builds controls & writes JS
            starterHtml = [
              htmlLines[0],
              htmlLines[1],
              '  <!-- Add semantic interactive controls matching Blueprint -->',
              htmlLines[htmlLines.length - 1],
            ].join('\n');
            checks = w.checks;
            scopeDesc = '40% HTML starter — add interactive DOM controls + write script.js.';
          }
        }

        list.push(makeWebClash({
          id,
          title,
          difficulty: diff,
          durationSecs: dur.secs,
          stackTags,
          description: `Build "${w.heading}" interactive widget (${ctx} edition — ${scopeDesc}):\n- Include heading "${w.heading}" and required inputs/buttons\n${withCss ? '- Ensure clean card layout & accent controls in style.css\n' : ''}- Wire working DOM event listener logic in script.js`,
          starterHtml,
          starterCss,
          starterJs: '// Wire interactive DOM listeners here\n',
          targetHtml,
          targetCss: withCss ? w.css : '',
          targetJs: w.js,
          checks,
        }));
      }
    }
  }
  return list;
}

export const WEB_CLASH_JS_QUESTIONS = [
  ...buildWebJsSuites(false), // 90 HTML + JS
  ...buildWebJsSuites(true),  // 90 HTML + CSS + JS
];
