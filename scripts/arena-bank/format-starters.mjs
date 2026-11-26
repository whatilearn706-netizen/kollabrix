/**
 * Formats HTML, CSS, JS, and Logic (Python/C++/Java) starter & target code
 * with clean indentation and visual breathing room across all 1,020 Arena questions.
 */

const CONTAINER_OPEN_RE = /^<(div|section|article|main|header|footer|form|fieldset|ul|ol|table|thead|tbody|tr|details)(\s|>|$)/i;
const CONTAINER_CLOSE_RE = /^<\/(div|section|article|main|header|footer|form|fieldset|ul|ol|table|thead|tbody|tr|details)>/i;

export function formatHtmlCleanly(raw) {
  const src = String(raw || '').trim();
  if (!src) return '';

  // Tokenize tags/comments vs text
  const tokens = src.match(/(<!--[\s\S]*?-->|<[^>]+>|[^<]+)/g) || [];
  const lines = [];
  let depth = 0;

  const pushLine = (text, indentDeltaBefore = 0, indentDeltaAfter = 0) => {
    depth = Math.max(0, depth + indentDeltaBefore);
    const pad = '  '.repeat(depth);
    lines.push({ depth, text: `${pad}${text}` });
    depth = Math.max(0, depth + indentDeltaAfter);
  };

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i].trim();
    if (!tok) {
      i++;
      continue;
    }

    // Comment
    if (tok.startsWith('<!--')) {
      pushLine(tok);
      i++;
      continue;
    }

    // Opening container tag
    if (CONTAINER_OPEN_RE.test(tok) && !tok.endsWith('/>')) {
      // Check if empty container like <ul id="list"></ul>
      const nextNonEmpty = (tokens[i + 1] || '').trim();
      const tagMatch = tok.match(/^<([a-z0-9]+)/i);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
      if (nextNonEmpty.toLowerCase() === `</${tagName}>`) {
        pushLine(`${tok}${nextNonEmpty}`);
        i += 2;
        continue;
      }
      pushLine(tok, 0, 1);
      i++;
      continue;
    }

    // Closing container tag
    if (CONTAINER_CLOSE_RE.test(tok)) {
      pushLine(tok, -1, 0);
      i++;
      continue;
    }

    // Inline / leaf element like <h2>Title</h2>, <button ...>Click</button>, <p>...</p>, <li>...</li>
    if (tok.startsWith('<') && !tok.startsWith('</') && !tok.endsWith('/>')) {
      const tagMatch = tok.match(/^<([a-z0-9]+)/i);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
      // Void tags (<input>, <img>, <br>, <hr>)
      if (['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) {
        pushLine(tok);
        i++;
        continue;
      }
      // Collect inline children until matching </tagName> if simple
      let j = i + 1;
      let buf = tok;
      let nested = 0;
      let closed = false;
      while (j < tokens.length && j - i <= 14) {
        const t = tokens[j];
        const trimmed = t.trim();
        if (new RegExp(`^<${tagName}(\\s|>|$)`, 'i').test(trimmed) && !trimmed.endsWith('/>')) {
          nested++;
        } else if (trimmed.toLowerCase() === `</${tagName}>`) {
          if (nested === 0) {
            buf += trimmed;
            closed = true;
            break;
          }
          nested--;
        }
        buf += t.replace(/\s+/g, ' ');
        j++;
      }
      if (closed && buf.length < 130) {
        pushLine(buf.replace(/>\s+</g, '><').trim());
        i = j + 1;
        continue;
      }
    }

    pushLine(tok);
    i++;
  }

  // Add subtle breathing blank lines between sibling container blocks / comments at depth >= 1
  const spaced = [];
  for (let k = 0; k < lines.length; k++) {
    const cur = lines[k];
    const prev = lines[k - 1];
    if (
      prev &&
      cur.depth === prev.depth &&
      cur.depth >= 1 &&
      (CONTAINER_CLOSE_RE.test(prev.text.trim()) ||
        prev.text.trim().startsWith('<!--') ||
        cur.text.trim().startsWith('<!--'))
    ) {
      spaced.push('');
    }
    spaced.push(cur.text);
  }
  return spaced.join('\n');
}

export function formatCssCleanly(raw) {
  const src = String(raw || '').trim();
  if (!src) return '';

  // Preserve comment-only stubs or already-clean multi-line comments
  const blocks = [];
  let i = 0;
  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) break;

    if (src.slice(i, i + 2) === '/*') {
      const end = src.indexOf('*/', i + 2);
      const comment = end === -1 ? src.slice(i) : src.slice(i, end + 2);
      blocks.push(comment.trim());
      i = end === -1 ? src.length : end + 2;
      continue;
    }

    const braceOpen = src.indexOf('{', i);
    if (braceOpen === -1) {
      blocks.push(src.slice(i).trim());
      break;
    }

    const braceClose = src.indexOf('}', braceOpen + 1);
    if (braceClose === -1) {
      blocks.push(src.slice(i).trim());
      break;
    }

    const selector = src.slice(i, braceOpen).trim();
    const body = src.slice(braceOpen + 1, braceClose).trim();

    if (!body || body.startsWith('/*')) {
      blocks.push(`${selector} {\n  ${body}\n}`);
    } else {
      const decls = body
        .split(';')
        .map((d) => d.trim())
        .filter(Boolean)
        .map((d) => {
          const colon = d.indexOf(':');
          if (colon === -1) return `  ${d};`;
          const prop = d.slice(0, colon).trim();
          const val = d.slice(colon + 1).trim();
          return `  ${prop}: ${val};`;
        });
      blocks.push(`${selector} {\n${decls.join('\n')}\n}`);
    }
    i = braceClose + 1;
  }

  return blocks.join('\n\n');
}

export function formatLogicCodeCleanly(raw, lang) {
  const src = String(raw || '').trim();
  if (!src) return '';
  const lines = src.split('\n');
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const prev = out[out.length - 1];
    const tCur = cur.trim();
    const tPrev = prev !== undefined ? prev.trim() : '';

    if (prev !== undefined && tPrev !== '' && tCur !== '') {
      // Blank line after import / #include / using namespace header block
      const prevIsHeader =
        tPrev.startsWith('#include') ||
        tPrev.startsWith('using namespace') ||
        tPrev.startsWith('import ');
      const curIsHeader =
        tCur.startsWith('#include') ||
        tCur.startsWith('using namespace') ||
        tCur.startsWith('import ');
      if (prevIsHeader && !curIsHeader) {
        out.push('');
      }

      // Blank line before top-level/main print or return output if preceded by loop/computation
      const indentCur = (cur.match(/^[ \t]*/) || [''])[0].length;
      const indentPrev = (prev.match(/^[ \t]*/) || [''])[0].length;
      if (
        lang === 'python' &&
        indentCur === indentPrev &&
        (tCur.startsWith('for ') || tCur.startsWith('while ')) &&
        (tPrev.includes('input(') || tPrev.includes('= 0') || tPrev.includes('=[]'))
      ) {
        out.push('');
      }
      if (
        (tCur.startsWith('print(') || tCur.startsWith('cout') || tCur.startsWith('System.out')) &&
        indentCur <= indentPrev &&
        !tPrev.startsWith('if') &&
        !tPrev.startsWith('else') &&
        !tPrev.startsWith('for') &&
        !tPrev.startsWith('while')
      ) {
        out.push('');
      }
    }

    out.push(cur);
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

export function formatQuestionCode(q) {
  const copy = { ...q };
  if (copy.starterHtml) copy.starterHtml = formatHtmlCleanly(copy.starterHtml);
  if (copy.targetComponentHtml) copy.targetComponentHtml = formatHtmlCleanly(copy.targetComponentHtml);
  if (copy.starterCss) copy.starterCss = formatCssCleanly(copy.starterCss);
  if (copy.targetComponentCss) copy.targetComponentCss = formatCssCleanly(copy.targetComponentCss);
  if (copy.starterPython) copy.starterPython = formatLogicCodeCleanly(copy.starterPython, 'python');
  if (copy.starterCpp) copy.starterCpp = formatLogicCodeCleanly(copy.starterCpp, 'cpp');
  if (copy.starterJava) copy.starterJava = formatLogicCodeCleanly(copy.starterJava, 'java');
  if (copy.codeWithBug) {
    const l = (copy.tags || []).includes('cpp') ? 'cpp' : (copy.tags || []).includes('java') ? 'java' : 'python';
    copy.codeWithBug = formatLogicCodeCleanly(copy.codeWithBug, l);
  }
  return copy;
}
