import { EditorTab } from './arenaTypes';

export interface EditorHintItem {
  label: string;
  preview: string;
  insertText: string;
  cursorOffset: number; // relative to end of insertText (negative moves inside tags/parens)
  badge: string;
}

const COMMON_HTML_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'button',
  'a', 'ul', 'ol', 'li', 'form', 'label', 'section', 'header', 'footer',
  'nav', 'main', 'article', 'aside', 'table', 'thead', 'tbody', 'tr',
  'th', 'td', 'strong', 'em', 'code', 'pre', 'select', 'option', 'textarea',
]);

const STATIC_HTML_HINTS: EditorHintItem[] = [
  { label: '!', preview: 'HTML5 Boilerplate', insertText: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Arena</title>\n</head>\n<body>\n  \n</body>\n</html>', cursorOffset: -16, badge: 'EMMET' },
  { label: 'btn', preview: '<button type="button"></button>', insertText: '<button type="button"></button>', cursorOffset: -9, badge: 'EMMET' },
  { label: 'button', preview: '<button type="button" id=""></button>', insertText: '<button type="button"></button>', cursorOffset: -9, badge: 'TAG' },
  { label: 'input', preview: '<input type="text" placeholder="" />', insertText: '<input type="text" placeholder="" />', cursorOffset: -4, badge: 'TAG' },
  { label: 'img', preview: '<img src="" alt="" />', insertText: '<img src="" alt="" />', cursorOffset: -11, badge: 'TAG' },
  { label: 'a', preview: '<a href=""></a>', insertText: '<a href=""></a>', cursorOffset: -6, badge: 'TAG' },
  { label: 'ul', preview: '<ul>\n  <li></li>\n</ul>', insertText: '<ul>\n  <li></li>\n</ul>', cursorOffset: -11, badge: 'EMMET' },
  { label: 'ol', preview: '<ol>\n  <li></li>\n</ol>', insertText: '<ol>\n  <li></li>\n</ol>', cursorOffset: -11, badge: 'EMMET' },
  { label: 'hr', preview: '<hr />', insertText: '<hr />\n', cursorOffset: 0, badge: 'TAG' },
  { label: 'br', preview: '<br />', insertText: '<br />\n', cursorOffset: 0, badge: 'TAG' },
];

const CSS_HINTS: EditorHintItem[] = [
  { label: 'df', preview: 'display: flex;', insertText: 'display: flex;\n', cursorOffset: 0, badge: 'EMMET' },
  { label: 'dg', preview: 'display: grid;', insertText: 'display: grid;\n', cursorOffset: 0, badge: 'EMMET' },
  { label: 'jc', preview: 'justify-content: center;', insertText: 'justify-content: center;\n', cursorOffset: 0, badge: 'EMMET' },
  { label: 'ai', preview: 'align-items: center;', insertText: 'align-items: center;\n', cursorOffset: 0, badge: 'EMMET' },
  { label: 'bg', preview: 'background: #1e293b;', insertText: 'background: #;', cursorOffset: -2, badge: 'CSS' },
  { label: 'col', preview: 'color: #f8fafc;', insertText: 'color: #;', cursorOffset: -2, badge: 'CSS' },
  { label: 'pad', preview: 'padding: 16px;', insertText: 'padding: 16px;\n', cursorOffset: 0, badge: 'CSS' },
  { label: 'mar', preview: 'margin: 12px;', insertText: 'margin: 12px;\n', cursorOffset: 0, badge: 'CSS' },
  { label: 'rad', preview: 'border-radius: 12px;', insertText: 'border-radius: 12px;\n', cursorOffset: 0, badge: 'CSS' },
  { label: 'gap', preview: 'gap: 12px;', insertText: 'gap: 12px;\n', cursorOffset: 0, badge: 'CSS' },
  { label: 'fs', preview: 'font-size: 18px;', insertText: 'font-size: 18px;\n', cursorOffset: 0, badge: 'CSS' },
  { label: 'fw', preview: 'font-weight: 700;', insertText: 'font-weight: 700;\n', cursorOffset: 0, badge: 'CSS' },
  { label: 'tac', preview: 'text-align: center;', insertText: 'text-align: center;\n', cursorOffset: 0, badge: 'EMMET' },
  { label: 'cur', preview: 'cursor: pointer;', insertText: 'cursor: pointer;\n', cursorOffset: 0, badge: 'CSS' },
  { label: 'border', preview: 'border: 1px solid #334155;', insertText: 'border: 1px solid #334155;\n', cursorOffset: 0, badge: 'CSS' },
  { label: 'shadow', preview: 'box-shadow: 0 8px 24px rgba(0,0,0,0.2);', insertText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.2);\n', cursorOffset: 0, badge: 'CSS' },
];

const LANG_HINTS: Record<'js' | 'python' | 'cpp' | 'java', EditorHintItem[]> = {
  js: [
    { label: 'qs', preview: "document.querySelector('')", insertText: "document.querySelector('')", cursorOffset: -2, badge: 'DOM' },
    { label: 'gebi', preview: "document.getElementById('')", insertText: "document.getElementById('')", cursorOffset: -2, badge: 'DOM' },
    { label: 'ael', preview: "addEventListener('click', (e) => {})", insertText: "addEventListener('click', (e) => {\n  \n})", cursorOffset: -2, badge: 'DOM' },
    { label: 'epd', preview: 'e.preventDefault();', insertText: 'e.preventDefault();\n', cursorOffset: 0, badge: 'JS' },
    { label: 'tc', preview: ".textContent = ''", insertText: ".textContent = '';", cursorOffset: -2, badge: 'DOM' },
    { label: 'clg', preview: 'console.log();', insertText: 'console.log();', cursorOffset: -2, badge: 'JS' },
    { label: 'fn', preview: 'function name() {}', insertText: 'function () {\n  \n}', cursorOffset: -2, badge: 'JS' },
  ],
  python: [
    { label: 'def', preview: 'def fn(args):', insertText: 'def ():', cursorOffset: -3, badge: 'PY' },
    { label: 'for', preview: 'for i in range(n):', insertText: 'for i in range():', cursorOffset: -2, badge: 'PY' },
    { label: 'pr', preview: 'print()', insertText: 'print()', cursorOffset: -1, badge: 'PY' },
    { label: 'inp', preview: 'int(input().strip())', insertText: 'int(input().strip())', cursorOffset: 0, badge: 'PY' },
    { label: 'arr', preview: 'list(map(int, input().split()))', insertText: 'list(map(int, input().split()))', cursorOffset: 0, badge: 'PY' },
    { label: 'enum', preview: 'for i, x in enumerate(arr):', insertText: 'for i, x in enumerate():', cursorOffset: -2, badge: 'PY' },
  ],
  cpp: [
    { label: 'for', preview: 'for (int i = 0; i < n; i++) {}', insertText: 'for (int i = 0; i < n; i++) {\n    \n}', cursorOffset: -2, badge: 'C++' },
    { label: 'cout', preview: 'cout << ans << "\\n";', insertText: 'cout <<  << "\\n";', cursorOffset: -8, badge: 'C++' },
    { label: 'cin', preview: 'cin >> ;', insertText: 'cin >> ;', cursorOffset: -1, badge: 'C++' },
    { label: 'vec', preview: 'vector<int> ', insertText: 'vector<int> ', cursorOffset: 0, badge: 'STL' },
    { label: 'll', preview: 'long long ', insertText: 'long long ', cursorOffset: 0, badge: 'C++' },
    { label: 'sort', preview: 'sort(a.begin(), a.end());', insertText: 'sort(.begin(), .end());', cursorOffset: -17, badge: 'STL' },
  ],
  java: [
    { label: 'sout', preview: 'System.out.println();', insertText: 'System.out.println();', cursorOffset: -2, badge: 'JAVA' },
    { label: 'for', preview: 'for (int i = 0; i < n; i++) {}', insertText: 'for (int i = 0; i < n; i++) {\n    \n}', cursorOffset: -2, badge: 'JAVA' },
    { label: 'sc', preview: 'sc.nextInt()', insertText: 'sc.nextInt()', cursorOffset: 0, badge: 'JAVA' },
    { label: 'hm', preview: 'HashMap<Integer, Integer>', insertText: 'HashMap<Integer, Integer> map = new HashMap<>();', cursorOffset: 0, badge: 'JAVA' },
  ],
};

/**
 * Returns VS Code / IntelliJ style abbreviation hints and their replaceStart index
 * for the active token right before the caret.
 */
export function getEditorHints(
  tab: EditorTab,
  textBeforeCursor: string
): { replaceStart: number; items: EditorHintItem[] } {
  const tokenMatch = textBeforeCursor.match(/(?:^|[\s(>])(<?[a-zA-Z!][a-zA-Z0-9.-]*)$/);
  if (!tokenMatch) return { replaceStart: textBeforeCursor.length, items: [] };

  const rawToken = tokenMatch[1];
  const replaceStart = textBeforeCursor.length - rawToken.length;
  const lower = rawToken.toLowerCase();

  if (tab === 'html') {
    const hints: EditorHintItem[] = [];
    const clean = lower.startsWith('<') ? lower.slice(1) : lower;
    if (!clean) return { replaceStart, items: [] };

    // Dynamic Emmet class expansion e.g. div.card or p.subtitle
    const dotMatch = clean.match(/^([a-z][a-z0-9]*)\.([a-zA-Z0-9_-]+)$/);
    if (dotMatch) {
      const [, tag, cls] = dotMatch;
      const open = `<${tag} class="${cls}">`;
      const close = `</${tag}>`;
      hints.push({
        label: clean,
        preview: `${open}${close}`,
        insertText: `${open}${close}`,
        cursorOffset: -close.length,
        badge: 'EMMET',
      });
    }

    // Dynamic standard tag Emmet e.g. h1 -> <h1></h1>
    if (COMMON_HTML_TAGS.has(clean)) {
      const staticAlt = STATIC_HTML_HINTS.find((h) => h.label === clean);
      if (staticAlt) {
        hints.push(staticAlt);
      } else {
        const close = `</${clean}>`;
        hints.push({
          label: clean,
          preview: `<${clean}></${clean}>`,
          insertText: `<${clean}>${close}`,
          cursorOffset: -close.length,
          badge: 'EMMET',
        });
      }
    }

    for (const item of STATIC_HTML_HINTS) {
      if (item.label.startsWith(clean) && !hints.some((h) => h.label === item.label)) {
        hints.push(item);
      }
    }
    for (const tag of Array.from(COMMON_HTML_TAGS)) {
      if (tag.startsWith(clean) && !hints.some((h) => h.label === tag)) {
        const close = `</${tag}>`;
        hints.push({
          label: tag,
          preview: `<${tag}></${tag}>`,
          insertText: `<${tag}>${close}`,
          cursorOffset: -close.length,
          badge: 'TAG',
        });
      }
    }

    return { replaceStart, items: hints.slice(0, 6) };
  }

  const pool = tab === 'css' ? CSS_HINTS : LANG_HINTS[tab];
  if (!pool) return { replaceStart, items: [] };

  const items = pool
    .filter((item) => item.label.startsWith(lower))
    .slice(0, 6);

  return { replaceStart, items };
}
