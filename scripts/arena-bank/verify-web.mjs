import { WEB_CLASH_HTML_QUESTIONS } from './web-clash-html.mjs';
import { WEB_CLASH_JS_QUESTIONS } from './web-clash-js.mjs';
import { WEB_BUG_QUESTIONS } from './web-bughunt.mjs';

function stripHtmlComments(s) { return String(s || '').replace(/<!--[\s\S]*?-->/g, '').trim(); }
function stripCssComments(s) { return String(s || '').replace(/\/\*[\s\S]*?\*\//g, '').trim(); }
function stripJsComments(s) { return String(s || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '').trim(); }

function evalRules(criteria, html, css, js, starterSame) {
  const results = [];
  for (const rawRule of criteria || []) {
    let label = 'Web Check';
    let scope = 'any';
    let reqRaw = '';
    let forbidRaw = '';
    if (rawRule.startsWith('ruleJson::')) {
      const parsed = JSON.parse(rawRule.slice('ruleJson::'.length));
      label = parsed.label;
      scope = (parsed.scope || 'any').toLowerCase();
      reqRaw = parsed.req || '';
      forbidRaw = parsed.forbid || '';
    } else if (rawRule.startsWith('rule::')) {
      const parts = rawRule.split('::');
      label = parts[1]; scope = (parts[2] || 'any').toLowerCase(); reqRaw = parts[3] || ''; forbidRaw = parts[4] || '';
    } else continue;
    const targetText =
      scope === 'html' ? html : scope === 'css' ? css : scope === 'js' ? js : `${html}\n${css}\n${js}`;
    const unchanged =
      (scope === 'html' && starterSame.html) ||
      (scope === 'css' && starterSame.css) ||
      (scope === 'js' && starterSame.js);
    let ok = !unchanged && targetText.length > 0;
    if (ok) {
      for (const pat of (reqRaw || '').split('&&').map((s) => s.trim()).filter(Boolean)) {
        if (!new RegExp(pat, 'is').test(targetText)) { ok = false; break; }
      }
    }
    if (ok) {
      for (const pat of (forbidRaw || '').split('&&').map((s) => s.trim()).filter(Boolean)) {
        if (new RegExp(pat, 'is').test(targetText)) { ok = false; break; }
      }
    }
    results.push({ label, passed: ok });
  }
  return results;
}

export function verifyAllWeb() {
  const all = [...WEB_CLASH_HTML_QUESTIONS, ...WEB_CLASH_JS_QUESTIONS, ...WEB_BUG_QUESTIONS];
  const failures = [];

  for (const item of all) {
    const q = item.question;
    const isBug = q.arena === 'bug_hunt';
    const sh = stripHtmlComments(q.starterHtml);
    const sc = stripCssComments(q.starterCss);
    const sj = stripJsComments(q.starterJs);
    const th = stripHtmlComments(q.targetComponentHtml);
    const tc = stripCssComments(q.targetComponentCss);
    const tj = stripJsComments(q.targetComponentJs);

    // 1. Fixed/Target solution MUST pass 100%
    const sameTarget = {
      html: isBug && sh.replace(/\s+/g, '') === th.replace(/\s+/g, '') ? false : sh.replace(/\s+/g, '') === th.replace(/\s+/g, ''),
      css: isBug && sc.replace(/\s+/g, '') === tc.replace(/\s+/g, '') ? false : sc.replace(/\s+/g, '') === tc.replace(/\s+/g, ''),
      js: isBug && sj.replace(/\s+/g, '') === tj.replace(/\s+/g, '') ? false : sj.replace(/\s+/g, '') === tj.replace(/\s+/g, ''),
    };
    const passRes = evalRules(q.validationCriteria, th, tc, tj, sameTarget);
    const failedPass = passRes.filter((r) => !r.passed);
    if (passRes.length === 0 || failedPass.length > 0) {
      failures.push({ id: q.id, title: q.title, phase: 'target_failed', failed: failedPass });
    }

    // 2. Starter / Buggy MUST FAIL at least 1 check
    const starterRes = evalRules(q.validationCriteria, sh, sc, sj, {
      html: !(isBug && sh.replace(/\s+/g, '') === th.replace(/\s+/g, '')),
      css: !(isBug && sc.replace(/\s+/g, '') === tc.replace(/\s+/g, '')),
      js: !(isBug && sj.replace(/\s+/g, '') === tj.replace(/\s+/g, '')),
    });
    if (starterRes.every((r) => r.passed)) {
      failures.push({ id: q.id, title: q.title, phase: 'starter_passed_all' });
    }
  }

  return { total: all.length, failures };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = verifyAllWeb();
  console.log(`Web Verification: ${res.total} checked | Failures: ${res.failures.length}`);
  if (res.failures.length) console.log(JSON.stringify(res.failures.slice(0, 15), null, 2));
}
