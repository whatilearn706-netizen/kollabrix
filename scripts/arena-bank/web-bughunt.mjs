import { makeWebBug } from './builders.mjs';

/**
 * 120 unique Web UI Bug Hunt challenges (30 per stack: HTML, HTML+CSS, HTML+JS, HTML+CSS+JS;
 * 10 Easy, 10 Medium, 10 Hard per stack).
 * Solution is already written in starter code with realistic visual/DOM bugs matching level.
 */

const WEB_BUG_TOPICS = [
  ['Profile Badge', 'profile', 'Save Profile', 'Alex Rivera', 'Product Engineer'],
  ['Checkout Card', 'checkout', 'Pay Now', 'Pro Annual Plan', 'Instant Access'],
  ['Alert Banner', 'alert', 'Acknowledge', 'Cluster Online', 'Latency Nominal'],
  ['Ticket Row', 'ticket', 'Assign Agent', 'Login Bug #42', 'High Priority'],
  ['Workshop Pass', 'workshop', 'Claim Seat', 'UI Systems Lab', 'Room 304 North'],
  ['Course Tile', 'course', 'Resume Track', 'Graph Algorithms', '12 Modules Ready'],
  ['Deployment Log', 'deploy', 'Promote Live', 'Build Release v4', 'Zero Errors Found'],
  ['Team Invite', 'invite', 'Send Invite', 'Frontend Squad', 'Four Active Seats'],
  ['API Key Vault', 'apikey', 'Rotate Key', 'Prod Gateway Token', 'Active Encryption'],
  ['Contest Notice', 'contest', 'Enter Sprint', 'Campus Arena Finals', 'Saturday 8 PM'],
];

// 1) 30 HTML-ONLY BUG HUNT (10 Easy: 2-3 clear bugs, 10 Med: 3-4 trickier, 10 Hard: 4-5 subtle tricky)
function buildHtmlOnlyBugs() {
  const list = [];
  for (let i = 0; i < 10; i++) {
    const [name, slug, btn, mainTxt, subTxt] = WEB_BUG_TOPICS[i];
    // EASY (2-3 bugs: wrong heading tag <p>, unclosed/wrong disabled attr on button, typo word)
    list.push(makeWebBug({
      id: `wb-html-e-${String(i + 1).padStart(2, '0')}`,
      title: `Fix HTML Card: ${name}`,
      difficulty: 'easy',
      stackTags: ['html'],
      description: `Symptom: Card title renders as plain paragraph, subtitle word is misspelled, and action button is stuck disabled.\nGoal: Use <h2>${mainTxt}</h2>, fix "${subTxt}", and remove disabled from button.`,
      starterHtml: `<section class="${slug}">\n  <p>${mainTxt}</p>\n  <p>${subTxt.slice(0, -1)}x</p>\n  <button type="button" disabled>${btn}</button>\n</section>`,
      targetHtml: `<section class="${slug}">\n  <h2>${mainTxt}</h2>\n  <p>${subTxt}</p>\n  <button type="button">${btn}</button>\n</section>`,
      checks: [
        { label: `Use semantic <h2> for "${mainTxt}"`, scope: 'html', req: `<h2[^>]*>[^<]*${mainTxt.split(' ')[0]}`, forbid: `<p[^>]*>${mainTxt}</p>` },
        { label: `Fix subtitle spelling "${subTxt}"`, scope: 'html', req: subTxt, forbid: `${subTxt.slice(0, -1)}x` },
        { label: 'Enable action button (remove disabled)', scope: 'html', req: `<button[^>]*>[^<]*${btn}`, forbid: '<button[^>]*disabled' },
      ],
    }));

    // MEDIUM (3-4 bugs: mismatched closing tag </h3> on h2, input wrong type="text" instead email, missing required, ul missing closing/wrong button type)
    list.push(makeWebBug({
      id: `wb-html-m-${String(i + 1).padStart(2, '0')}`,
      title: `Debug HTML Form: ${name}`,
      difficulty: 'medium',
      stackTags: ['html'],
      description: `Symptom: Heading uses mismatched closing tag, form uses div instead of <form>, email input accepts non-emails, and input is optional.\nGoal: Restore valid <h2>, wrap controls in <form>, use type="email" with required, and set button type="submit".`,
      starterHtml: `<div class="${slug}-form">\n  <h2>${name}</h3>\n  <input type="text" placeholder="campus@edu.in" />\n  <button type="button">${btn}</button>\n</div>`,
      targetHtml: `<form class="${slug}-form">\n  <h2>${name}</h2>\n  <input type="email" placeholder="campus@edu.in" required />\n  <button type="submit">${btn}</button>\n</form>`,
      checks: [
        { label: 'Close heading cleanly with </h2>', scope: 'html', req: `<h2>[^<]*${name.split(' ')[0]}[^<]*</h2>`, forbid: '<h2>[^<]*</h3>' },
        { label: 'Use semantic <form> container', scope: 'html', req: '<form[^>]*>[\\s\\S]*?</form>' },
        { label: 'Set email input to type="email" required', scope: 'html', req: 'type=["\']email["\']&&required', forbid: 'type=["\']text["\']' },
        { label: 'Set submit button type="submit"', scope: 'html', req: 'type=["\']submit["\']', forbid: 'type=["\']button["\']' },
      ],
    }));

    // HARD (4-5 subtle bugs: missing fieldset/legend, ul instead ol, img missing alt, wrong table th->td & disabled button)
    list.push(makeWebBug({
      id: `wb-html-h-${String(i + 1).padStart(2, '0')}`,
      title: `Audit Accessible HTML: ${name}`,
      difficulty: 'hard',
      stackTags: ['html'],
      description: `Symptom: Audit flags missing <fieldset>/<legend>, table header cells rendered as <td> instead of <th>, list uses <ul> instead of <ol>, and button has tabindex="-1" disabled.\nGoal: Repair all 4 accessibility & structure defects to match Blueprint.`,
      starterHtml: `<div class="${slug}-audit">\n  <h3>${mainTxt}</h3>\n  <ul><li>${subTxt}</li></ul>\n  <table><thead><tr><td>Col</td><td>Val</td></tr></thead><tbody><tr><td>Key</td><td>Ok</td></tr></tbody></table>\n  <button disabled tabindex="-1">${btn}</button>\n</div>`,
      targetHtml: `<fieldset class="${slug}-audit">\n  <legend>${mainTxt}</legend>\n  <ol><li>${subTxt}</li></ol>\n  <table><thead><tr><th>Col</th><th>Val</th></tr></thead><tbody><tr><td>Key</td><td>Ok</td></tr></tbody></table>\n  <button type="submit">${btn}</button>\n</fieldset>`,
      checks: [
        { label: 'Wrap section in <fieldset> & <legend>', scope: 'html', req: '<fieldset[^>]*>[\\s\\S]*?<legend[^>]*>[^<]+</legend>' },
        { label: 'Convert list to ordered <ol>', scope: 'html', req: '<ol[^>]*>[\\s\\S]*?<li', forbid: '<ul' },
        { label: 'Use <th> inside table <thead>', scope: 'html', req: '<thead[^>]*>[\\s\\S]*?<th' },
        { label: 'Restore interactive enabled <button>', scope: 'html', req: `<button[^>]*>[^<]*${btn}`, forbid: 'disabled|tabindex=["\']-1["\']' },
      ],
    }));
  }
  return list;
}

// 2) 30 HTML + CSS BUG HUNT (10 Easy, 10 Medium, 10 Hard)
function buildHtmlCssBugs() {
  const list = [];
  for (let i = 0; i < 10; i++) {
    const [name, slug, btn, mainTxt, subTxt] = WEB_BUG_TOPICS[i];
    // EASY (2-3 CSS/HTML bugs: button hidden or white-on-white, missing border-radius)
    list.push(makeWebBug({
      id: `wb-hc-e-${String(i + 1).padStart(2, '0')}`,
      title: `Fix Hidden CSS Button: ${name}`,
      difficulty: 'easy',
      stackTags: ['html', 'css'],
      description: `Symptom: Title blends into dark background, action button is hidden (display: none), and card corners are sharp.\nGoal: Make text #ffffff, set .btn display: inline-block, and add border-radius: 12px on card.`,
      starterHtml: `<div class="${slug}-card">\n  <h2>${mainTxt}</h2>\n  <p>${subTxt}</p>\n  <button class="btn">${btn}</button>\n</div>`,
      starterCss: `.${slug}-card { background: #0f172a; color: #0f172a; padding: 20px; }\n.btn { display: none; background: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; }`,
      targetHtml: `<div class="${slug}-card">\n  <h2>${mainTxt}</h2>\n  <p>${subTxt}</p>\n  <button class="btn">${btn}</button>\n</div>`,
      targetCss: `.${slug}-card { background: #0f172a; color: #ffffff; padding: 20px; border-radius: 12px; }\n.btn { display: inline-block; background: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; }`,
      checks: [
        { label: 'Reveal readable light text color', scope: 'css', req: 'color\\s*:\\s*(#fff|#ffffff|white|#f8fafc)', forbid: 'color\\s*:\\s*#0f172a' },
        { label: 'Restore visible .btn display (remove none)', scope: 'css', req: '\\.btn[\\s\\S]*?display\\s*:\\s*(inline-block|block|flex|inline-flex)', forbid: 'display\\s*:\\s*none' },
        { label: 'Apply rounded corners border-radius', scope: 'css', req: 'border-radius\\s*:\\s*(8|10|12|14|16)px' },
      ],
    }));

    // MEDIUM (3-4 bugs: flex-direction reversed/column instead row, missing gap, unaligned items, class typo)
    list.push(makeWebBug({
      id: `wb-hc-m-${String(i + 1).padStart(2, '0')}`,
      title: `Repair Flex Bar Layout: ${name}`,
      difficulty: 'medium',
      stackTags: ['html', 'css'],
      description: `Symptom: Header bar stacks vertically instead of row, items have zero spacing, aren't centered vertically, and badge is misaligned.\nGoal: Use display: flex with flex-direction: row (or remove column), justify-content: space-between, align-items: center, and gap: 12px.`,
      starterHtml: `<header class="${slug}-bar">\n  <strong>${mainTxt}</strong>\n  <span class="pill">${subTxt}</span>\n  <button class="act">${btn}</button>\n</header>`,
      starterCss: `.${slug}-bar { background: #1e293b; color: #fff; padding: 14px 18px; border-radius: 12px; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; gap: 0px; }\n.pill { background: #334155; padding: 4px 10px; border-radius: 999px; font-size: 11px; }\n.act { background: #10b981; color: #052e16; border: none; padding: 6px 12px; border-radius: 8px; font-weight: 700; }`,
      targetHtml: `<header class="${slug}-bar">\n  <strong>${mainTxt}</strong>\n  <span class="pill">${subTxt}</span>\n  <button class="act">${btn}</button>\n</header>`,
      targetCss: `.${slug}-bar { background: #1e293b; color: #fff; padding: 14px 18px; border-radius: 12px; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 12px; }\n.pill { background: #334155; padding: 4px 10px; border-radius: 999px; font-size: 11px; }\n.act { background: #10b981; color: #052e16; border: none; padding: 6px 12px; border-radius: 8px; font-weight: 700; }`,
      checks: [
        { label: 'Restore horizontal flex-direction: row', scope: 'css', forbid: 'flex-direction\\s*:\\s*column' },
        { label: 'Space header items using justify-content: space-between', scope: 'css', req: 'justify-content\\s*:\\s*space-between' },
        { label: 'Vertically center items with align-items: center', scope: 'css', req: 'align-items\\s*:\\s*center' },
        { label: 'Restore non-zero flex gap spacing', scope: 'css', req: 'gap\\s*:\\s*(8|10|12|14|16)px', forbid: 'gap\\s*:\\s*0px' },
      ],
    }));

    // HARD (4-5 subtle CSS/HTML bugs: pointer-events: none trap, opacity: 0 on badge, wrong grid-template-columns: 1fr, z-index behind backdrop, overflow hidden clipping)
    list.push(makeWebBug({
      id: `wb-hc-h-${String(i + 1).padStart(2, '0')}`,
      title: `Debug Broken Grid Card: ${name}`,
      difficulty: 'hard',
      stackTags: ['html', 'css'],
      description: `Symptom: 3-column metrics grid collapses to 1 column, metric values are invisible (opacity: 0), button ignores clicks (pointer-events: none), and card width overflows.\nGoal: Fix grid-template-columns to 3 equal columns, set opacity: 1, set pointer-events: auto on button, and add box-sizing: border-box.`,
      starterHtml: `<section class="${slug}-gridbox">\n  <h3>${name}</h3>\n  <div class="cols">\n    <div class="cell"><span>A</span><strong>98%</strong></div>\n    <div class="cell"><span>B</span><strong>4ms</strong></div>\n    <div class="cell"><span>C</span><strong>OK</strong></div>\n  </div>\n  <button class="go">${btn}</button>\n</section>`,
      starterCss: `.${slug}-gridbox { background: #0f172a; color: #f8fafc; padding: 18px; border-radius: 14px; max-width: 360px; }\n.cols { display: grid; grid-template-columns: 1fr; gap: 10px; margin: 12px 0; }\n.cell { background: #1e293b; padding: 10px; border-radius: 8px; text-align: center; }\n.cell strong { opacity: 0; color: #38bdf8; }\n.go { pointer-events: none; background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; }`,
      targetHtml: `<section class="${slug}-gridbox">\n  <h3>${name}</h3>\n  <div class="cols">\n    <div class="cell"><span>A</span><strong>98%</strong></div>\n    <div class="cell"><span>B</span><strong>4ms</strong></div>\n    <div class="cell"><span>C</span><strong>OK</strong></div>\n  </div>\n  <button class="go">${btn}</button>\n</section>`,
      targetCss: `.${slug}-gridbox { box-sizing: border-box; background: #0f172a; color: #f8fafc; padding: 18px; border-radius: 14px; max-width: 360px; }\n.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0; }\n.cell { background: #1e293b; padding: 10px; border-radius: 8px; text-align: center; }\n.cell strong { opacity: 1; color: #38bdf8; }\n.go { pointer-events: auto; background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; }`,
      checks: [
        { label: 'Make 3-column grid (repeat(3, 1fr) or 1fr 1fr 1fr)', scope: 'css', req: 'grid-template-columns\\s*:\\s*(repeat\\(\\s*3|1fr\\s+1fr\\s+1fr)' },
        { label: 'Restore metric value visibility (opacity: 1)', scope: 'css', req: 'opacity\\s*:\\s*1', forbid: 'opacity\\s*:\\s*0\\s*;' },
        { label: 'Restore clickable button (remove pointer-events: none)', scope: 'css', forbid: 'pointer-events\\s*:\\s*none' },
        { label: 'Include box-sizing: border-box containment', scope: 'css', req: 'box-sizing\\s*:\\s*border-box' },
      ],
    }));
  }
  return list;
}

// 3 & 4) 30 HTML + JS BUG HUNT & 30 HTML + CSS + JS BUG HUNT (10 Easy, 10 Medium, 10 Hard each)
function buildWebJsBugSuites(withCss) {
  const list = [];
  const stackTags = withCss ? ['html', 'css', 'javascript'] : ['html', 'javascript'];
  const prefix = withCss ? 'wb-hcj' : 'wb-hj';

  for (let i = 0; i < 10; i++) {
    const [name, slug, btn, mainTxt] = WEB_BUG_TOPICS[i];
    const cardCls = `${slug}-app`;
    const baseCssTarget = withCss
      ? `body { background:#090d16; color:#f8fafc; display:flex; justify-content:center; align-items:center; min-height:100vh; }\n.${cardCls} { background:#111827; padding:20px; border-radius:14px; border:1px solid #334155; text-align:center; width:300px; }\n#num { font-size:32px; font-weight:900; color:#38bdf8; margin:10px 0; }\n.btn-go { background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-weight:700; cursor:pointer; }`
      : '';
    const brokenCssEasy = withCss
      ? baseCssTarget.replace('color:#f8fafc', 'color:#111827')
      : '';

    const styleTag = withCss ? 'Styled' : 'DOM';
    // EASY (2-3 clear bugs: clicks decrement instead increment, wrong element ID)
    list.push(makeWebBug({
      id: `${prefix}-e-${String(i + 1).padStart(2, '0')}`,
      title: `Fix ${styleTag} Counter Increment: ${name}`,
      difficulty: 'easy',
      stackTags,
      description: `Symptom: Clicking "${btn}" subtracts instead of adding 1, and button queries wrong DOM ID #goBtn instead of #incBtn.\nGoal: Wire #incBtn click event to increment count += 1 and display in #num.`,
      starterHtml: `<div class="${cardCls}">\n  <h2>${mainTxt}</h2>\n  <div id="num">0</div>\n  <button id="incBtn" class="btn-go">${btn}</button>\n</div>`,
      starterCss: brokenCssEasy,
      starterJs: `let n = 0;\ndocument.getElementById("goBtn").addEventListener("click", () => {\n  n -= 1;\n  document.getElementById("num").textContent = n;\n});`,
      targetHtml: `<div class="${cardCls}">\n  <h2>${mainTxt}</h2>\n  <div id="num">0</div>\n  <button id="incBtn" class="btn-go">${btn}</button>\n</div>`,
      targetCss: baseCssTarget,
      targetJs: `let n = 0;\ndocument.getElementById("incBtn").addEventListener("click", () => {\n  n += 1;\n  document.getElementById("num").textContent = n;\n});`,
      checks: [
        { label: 'Target correct button ID #incBtn', scope: 'js', req: 'incBtn', forbid: 'goBtn' },
        { label: 'Increment counter (n += 1 / n++) instead of subtracting', scope: 'js', req: '\\+=\\s*1|\\+\\+|\\+\\s*1', forbid: 'n\\s*-=\\s*1|n--' },
        ...(withCss ? [{ label: 'Restore light readable card text color', scope: 'css', req: 'color\\s*:\\s*#f8fafc', forbid: 'color\\s*:\\s*#111827' }] : []),
      ],
    }));

    // MEDIUM (3-4 trickier bugs: string concatenation '10'+5='105' without Number(), onchange instead oninput, CSS/HTML selector or zero clamp missing)
    const medBrokenCss = withCss
      ? baseCssTarget.replace('display:flex;', 'display:block;').replace('padding:20px;', 'padding:0px;')
      : '';
    list.push(makeWebBug({
      id: `${prefix}-m-${String(i + 1).padStart(2, '0')}`,
      title: `Debug ${styleTag} Numeric Adder: ${name}`,
      difficulty: 'medium',
      stackTags,
      description: `Symptom: Adding quantity concatenates strings ("10" + "5" = "105"), total only updates after blur ("change" instead of "input"), and CSS lost card padding.\nGoal: Cast inputs with Number(...), listen to "input" event, and restore padding >= 16px.`,
      starterHtml: `<div class="${cardCls}">\n  <h2>${mainTxt}</h2>\n  <input id="qty" type="number" value="2" />\n  <p>Total: <strong id="num">10</strong></p>\n</div>`,
      starterCss: medBrokenCss,
      starterJs: `document.getElementById("qty").addEventListener("change", (e) => {\n  const val = e.target.value;\n  document.getElementById("num").textContent = val + 5;\n});`,
      targetHtml: `<div class="${cardCls}">\n  <h2>${mainTxt}</h2>\n  <input id="qty" type="number" value="2" />\n  <p>Total: <strong id="num">10</strong></p>\n</div>`,
      targetCss: baseCssTarget,
      targetJs: `document.getElementById("qty").addEventListener("input", (e) => {\n  const val = Number(e.target.value) || 0;\n  document.getElementById("num").textContent = val * 5;\n});`,
      checks: [
        { label: 'Use live "input" event instead of "change"', scope: 'js', req: '["\']input["\']', forbid: '["\']change["\']' },
        { label: 'Convert input to Number/parseFloat before arithmetic', scope: 'js', req: 'Number\\(|parseFloat\\(|parseInt\\(' },
        { label: 'Multiply or compute numeric sum cleanly without + 5 string bug', scope: 'js', req: '\\*\\s*5|Number\\([^)]+\\)\\s*\\+\\s*5', forbid: '=\\s*val\\s*\\+\\s*5' },
        ...(withCss ? [{ label: 'Restore container padding on card', scope: 'css', req: 'padding\\s*:\\s*(16|18|20|24)px', forbid: 'padding\\s*:\\s*0px' }] : []),
      ],
    }));

    // HARD (4-5 subtle tricky bugs: form reload missing e.preventDefault(), const reassignment TypeError, missing empty trim guard, wrong classList toggle + hidden CSS visibility)
    const hardBrokenCss = withCss
      ? baseCssTarget + '\n.done { text-decoration: line-through; opacity: 0.6; }\n#num { visibility: hidden; }'
      : '';
    const hardTargetCss = withCss
      ? baseCssTarget + '\n.done { text-decoration: line-through; opacity: 0.6; }\n#num { visibility: visible; }'
      : '';

    list.push(makeWebBug({
      id: `${prefix}-h-${String(i + 1).padStart(2, '0')}`,
      title: `Audit ${styleTag} Interactive Form: ${name}`,
      difficulty: 'hard',
      stackTags,
      description: `Symptom: Submitting refreshes the frame (missing e.preventDefault()), reassigns a const variable (TypeError), accepts blank whitespace submissions, and hides output.\nGoal: Add e.preventDefault(), change const count to let, guard with .trim(), and update #num cleanly.`,
      starterHtml: `<form id="frm" class="${cardCls}">\n  <h2>${mainTxt}</h2>\n  <input id="note" type="text" placeholder="Note..." />\n  <p id="num">Ready</p>\n  <button type="submit" class="btn-go">${btn}</button>\n</form>`,
      starterCss: hardBrokenCss,
      starterJs: `const count = 0;\ndocument.getElementById("frm").addEventListener("submit", (e) => {\n  const text = document.getElementById("note").value;\n  if (text.length === 0) return;\n  count += 1;\n  document.getElementById("num").innerHTML = count + ": " + text;\n});`,
      targetHtml: `<form id="frm" class="${cardCls}">\n  <h2>${mainTxt}</h2>\n  <input id="note" type="text" placeholder="Note..." />\n  <p id="num">Ready</p>\n  <button type="submit" class="btn-go">${btn}</button>\n</form>`,
      targetCss: hardTargetCss,
      targetJs: `let count = 0;\ndocument.getElementById("frm").addEventListener("submit", (e) => {\n  e.preventDefault();\n  const text = document.getElementById("note").value.trim();\n  if (!text) return;\n  count += 1;\n  document.getElementById("num").textContent = count + ": " + text;\n});`,
      checks: [
        { label: 'Use let (not const) for mutable count variable', scope: 'js', req: 'let\\s+count', forbid: 'const\\s+count' },
        { label: 'Call e.preventDefault() inside submit handler', scope: 'js', req: 'preventDefault\\(\\)' },
        { label: 'Trim whitespace & guard empty input safely', scope: 'js', req: '\\.trim\\(\\)&&textContent' },
        ...(withCss ? [{ label: 'Make #num visible (remove visibility: hidden)', scope: 'css', forbid: 'visibility\\s*:\\s*hidden' }] : []),
      ],
    }));
  }
  return list;
}

export const WEB_BUG_QUESTIONS = [
  ...buildHtmlOnlyBugs(),      // 30 HTML-only bugs (10 Easy, 10 Med, 10 Hard)
  ...buildHtmlCssBugs(),       // 30 HTML+CSS bugs (10 Easy, 10 Med, 10 Hard)
  ...buildWebJsBugSuites(false), // 30 HTML+JS bugs (10 Easy, 10 Med, 10 Hard)
  ...buildWebJsBugSuites(true),  // 30 HTML+CSS+JS bugs (10 Easy, 10 Med, 10 Hard)
];
