import type { DuelQuestion } from '@/types/arenaDuel';

export const HTML_CSS_JS_BUG_MEDIUM_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "bughunt-htmlcssjs-medium-180s-form-prevent-default-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Form Submit Page Reload Bug (Production Web App)",
    "description": "Symptom:\nForm reloads the whole page on button click because e.preventDefault() is missing in submit event listener. Reproduced in live browser events.\n\nObjective:\nAdd e.preventDefault() to the form submit handler. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Form Submit Page Reload Bug (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Form Submit Page Reload Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "form.addEventListener('submit', (e) => { e.preventDefault(); statusEl.textContent = 'Submitted!'; });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Form Submit Page Reload Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Form reloads the whole page on button click because e.preventDefault() is missing in submit event listener. Reproduced in live browser events.\n// OBJECTIVE: Add e.preventDefault() to the form submit handler\nform.addEventListener('submit', (e) => { statusEl.textContent = 'Submitted!'; });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Add e.preventDefault() to the form submit handler"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Form Submit Page Reload Bug (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-counter-double-increment-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Counter Double Increment Bug (Production Web App)",
    "description": "Symptom:\nClicking increment button adds 2 instead of 1 because event listener is registered twice or uses pre-increment. Reproduced in live browser events.\n\nObjective:\nFix increment step to add 1 per click. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Counter Double Increment Bug (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Counter Double Increment Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "btn.addEventListener('click', () => { count += 1; counterEl.textContent = count; });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Counter Double Increment Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Clicking increment button adds 2 instead of 1 because event listener is registered twice or uses pre-increment. Reproduced in live browser events.\n// OBJECTIVE: Fix increment step to add 1 per click\nbtn.addEventListener('click', () => { count += 2; counterEl.textContent = count; });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Fix increment step to add 1 per click"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Counter Double Increment Bug (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-modal-close-toggle-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Modal Dialog Close Toggle Bug (Production Web App)",
    "description": "Symptom:\nClicking close button fails to hide modal because classList.remove('hidden') was used instead of .add('hidden'). Reproduced in live browser events.\n\nObjective:\nAdd 'hidden' class to hide modal on close click. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Modal Dialog Close Toggle Bug (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Modal Dialog Close Toggle Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "closeBtn.addEventListener('click', () => { modal.classList.add('hidden'); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Modal Dialog Close Toggle Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Clicking close button fails to hide modal because classList.remove('hidden') was used instead of .add('hidden'). Reproduced in live browser events.\n// OBJECTIVE: Add 'hidden' class to hide modal on close click\ncloseBtn.addEventListener('click', () => { modal.classList.remove('hidden'); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Add 'hidden' class to hide modal on close click"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Modal Dialog Close Toggle Bug (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-char-counter-innerhtml-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Live Character Counter InnerHTML Bug (Production Web App)",
    "description": "Symptom:\nCharacter counter shows undefined because it reads textarea.innerHTML instead of textarea.value. Reproduced in live browser events.\n\nObjective:\nRead input.value.length instead of input.innerHTML.length. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Live Character Counter InnerHTML Bug (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Live Character Counter InnerHTML Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "input.addEventListener('input', () => { counter.textContent = input.value.length; });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Live Character Counter InnerHTML Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Character counter shows undefined because it reads textarea.innerHTML instead of textarea.value. Reproduced in live browser events.\n// OBJECTIVE: Read input.value.length instead of input.innerHTML.length\ninput.addEventListener('input', () => { counter.textContent = input.innerHTML.length; });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Read input.value.length instead of input.innerHTML.length"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Live Character Counter InnerHTML Bug (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-dark-mode-target-element-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Dark Mode Class Selector Bug (Production Web App)",
    "description": "Symptom:\nTheme toggle adds 'dark' class to button element itself instead of document.documentElement or body. Reproduced in live browser events.\n\nObjective:\nToggle 'dark' class on document.body or document.documentElement. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Dark Mode Class Selector Bug (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Dark Mode Class Selector Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "toggleBtn.addEventListener('click', () => { document.body.classList.toggle('dark'); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Dark Mode Class Selector Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Theme toggle adds 'dark' class to button element itself instead of document.documentElement or body. Reproduced in live browser events.\n// OBJECTIVE: Toggle 'dark' class on document.body or document.documentElement\ntoggleBtn.addEventListener('click', () => { toggleBtn.classList.toggle('dark'); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Toggle 'dark' class on document.body or document.documentElement"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Dark Mode Class Selector Bug (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-accordion-query-all-bug-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Accordion QuerySelector All vs Single (Production Web App)",
    "description": "Symptom:\nOnly the first accordion panel toggles because querySelector was used instead of querySelectorAll. Reproduced in live browser events.\n\nObjective:\nUse querySelectorAll and iterate with forEach to bind all accordion items. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Accordion QuerySelector All vs Single (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Accordion QuerySelector All vs Single (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "document.querySelectorAll('.acc-btn').forEach(btn => btn.addEventListener('click', () => btn.nextElementSibling.classList.toggle('open')));",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Accordion QuerySelector All vs Single (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Only the first accordion panel toggles because querySelector was used instead of querySelectorAll. Reproduced in live browser events.\n// OBJECTIVE: Use querySelectorAll and iterate with forEach to bind all accordion items\ndocument.querySelector('.acc-btn').addEventListener('click', () => document.querySelector('.acc-panel').classList.toggle('open'));",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Use querySelectorAll and iterate with forEach to bind all accordion items"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Accordion QuerySelector All vs Single (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-clipboard-undefined-var-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Copy to Clipboard Promise Rejection (Production Web App)",
    "description": "Symptom:\nCopy button crashes on click because navigator.clipboard.writeText is passed an undefined variable. Reproduced in live browser events.\n\nObjective:\nPass textEl.textContent or valid string to writeText. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Copy to Clipboard Promise Rejection (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Copy to Clipboard Promise Rejection (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "copyBtn.addEventListener('click', async () => { await navigator.clipboard.writeText(textEl.textContent); alert('Copied!'); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Copy to Clipboard Promise Rejection (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Copy button crashes on click because navigator.clipboard.writeText is passed an undefined variable. Reproduced in live browser events.\n// OBJECTIVE: Pass textEl.textContent or valid string to writeText\ncopyBtn.addEventListener('click', async () => { await navigator.clipboard.writeText(textEl.value); alert('Copied!'); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Pass textEl.textContent or valid string to writeText"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Copy to Clipboard Promise Rejection (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-tab-panel-index-desync-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Tab Panel Active Index Desync (Production Web App)",
    "description": "Symptom:\nClicking tab 2 highlights tab but displays tab 1 content due to hardcoded index in loop. Reproduced in live browser events.\n\nObjective:\nPass the dynamic loop index i to setActiveTab. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Tab Panel Active Index Desync (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Tab Panel Active Index Desync (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "tabs.forEach((tab, i) => tab.addEventListener('click', () => { setActiveTab(i); }));",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Tab Panel Active Index Desync (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Clicking tab 2 highlights tab but displays tab 1 content due to hardcoded index in loop. Reproduced in live browser events.\n// OBJECTIVE: Pass the dynamic loop index i to setActiveTab\ntabs.forEach((tab, i) => tab.addEventListener('click', () => { setActiveTab(0); }));",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Pass the dynamic loop index i to setActiveTab"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Tab Panel Active Index Desync (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-password-toggle-inverted-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Password Visibility Text Inversion (Production Web App)",
    "description": "Symptom:\nShow/Hide password toggle flips type to text on hide and password on show. Reproduced in live browser events.\n\nObjective:\nToggle input type between 'password' and 'text' properly. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Password Visibility Text Inversion (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Password Visibility Text Inversion (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "toggle.addEventListener('click', () => { pwd.type = pwd.type === 'password' ? 'text' : 'password'; });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Password Visibility Text Inversion (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Show/Hide password toggle flips type to text on hide and password on show. Reproduced in live browser events.\n// OBJECTIVE: Toggle input type between 'password' and 'text' properly\ntoggle.addEventListener('click', () => { pwd.type = pwd.type === 'password' ? 'password' : 'text'; });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Toggle input type between 'password' and 'text' properly"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Password Visibility Text Inversion (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-180s-tooltip-event-typo-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Tooltip Mouseleave Event Typo (Production Web App)",
    "description": "Symptom:\nTooltip fails to hide because event listener listens for 'mouseout_leave' instead of 'mouseleave'. Reproduced in live browser events.\n\nObjective:\nCorrect event listener name to 'mouseleave'. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Tooltip Mouseleave Event Typo (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Tooltip Mouseleave Event Typo (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "target.addEventListener('mouseleave', () => { tooltip.classList.add('hidden'); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Tooltip Mouseleave Event Typo (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Tooltip fails to hide because event listener listens for 'mouseout_leave' instead of 'mouseleave'. Reproduced in live browser events.\n// OBJECTIVE: Correct event listener name to 'mouseleave'\ntarget.addEventListener('mouseoutleave', () => { tooltip.classList.add('hidden'); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Correct event listener name to 'mouseleave'"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Tooltip Mouseleave Event Typo (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-search-filter-lowercase-omitted-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Live Search Filter Strict Case Bug (Production Web App)",
    "description": "Symptom:\nSearch input fails to match capitalized words because toLowerCase() is omitted on item text. Reproduced in live browser events.\n\nObjective:\nCall .toLowerCase() on item.textContent before checking .includes(). Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Live Search Filter Strict Case Bug (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Live Search Filter Strict Case Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "const match = item.textContent.toLowerCase().includes(query.toLowerCase());",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Live Search Filter Strict Case Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Search input fails to match capitalized words because toLowerCase() is omitted on item text. Reproduced in live browser events.\n// OBJECTIVE: Call .toLowerCase() on item.textContent before checking .includes()\nconst match = item.textContent.includes(query.toLowerCase());",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Call .toLowerCase() on item.textContent before checking .includes()"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Live Search Filter Strict Case Bug (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-todo-event-delegation-target-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Todo Item Event Delegation Container Bug (Production Web App)",
    "description": "Symptom:\nDeleting a todo removes the entire list container because e.target was not checked for button class. Reproduced in live browser events.\n\nObjective:\nUse e.target.closest('.del-btn') before removing parent li. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Todo Item Event Delegation Container Bug (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Todo Item Event Delegation Container Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "list.addEventListener('click', (e) => { const btn = e.target.closest('.del-btn'); if (btn) btn.closest('li').remove(); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Todo Item Event Delegation Container Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Deleting a todo removes the entire list container because e.target was not checked for button class. Reproduced in live browser events.\n// OBJECTIVE: Use e.target.closest('.del-btn') before removing parent li\nlist.addEventListener('click', (e) => { e.target.parentElement.remove(); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Use e.target.closest('.del-btn') before removing parent li"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Todo Item Event Delegation Container Bug (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-star-rating-zero-offset-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Star Rating Hover Index Zero Offset (Production Web App)",
    "description": "Symptom:\nHovering 3rd star highlights 2 stars because data-index is 0-based and comparison uses strict less-than. Reproduced in live browser events.\n\nObjective:\nUse idx <= targetIdx so hovering star N activates all stars up to N. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Star Rating Hover Index Zero Offset (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Star Rating Hover Index Zero Offset (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "stars.forEach((s, idx) => { s.classList.toggle('active', idx <= targetIdx); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Star Rating Hover Index Zero Offset (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Hovering 3rd star highlights 2 stars because data-index is 0-based and comparison uses strict less-than. Reproduced in live browser events.\n// OBJECTIVE: Use idx <= targetIdx so hovering star N activates all stars up to N\nstars.forEach((s, idx) => { s.classList.toggle('active', idx < targetIdx); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Use idx <= targetIdx so hovering star N activates all stars up to N"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Star Rating Hover Index Zero Offset (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-progress-step-upper-bound-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Progress Step Next Button Boundary (Production Web App)",
    "description": "Symptom:\nNext step button continues incrementing step count beyond total available steps causing blank state. Reproduced in live browser events.\n\nObjective:\nAdd upper boundary check step < maxSteps before incrementing. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Progress Step Next Button Boundary (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Progress Step Next Button Boundary (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "nextBtn.addEventListener('click', () => { if (step < maxSteps) { step++; updateStepUI(); } });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Progress Step Next Button Boundary (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Next step button continues incrementing step count beyond total available steps causing blank state. Reproduced in live browser events.\n// OBJECTIVE: Add upper boundary check step < maxSteps before incrementing\nnextBtn.addEventListener('click', () => { step++; updateStepUI(); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Add upper boundary check step < maxSteps before incrementing"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Progress Step Next Button Boundary (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-toast-clear-timeout-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Toast Notification Stale Timeout (Production Web App)",
    "description": "Symptom:\nClosing a toast manually causes error because previously scheduled setTimeout tries to remove deleted element. Reproduced in live browser events.\n\nObjective:\nCall clearTimeout(timerId) when user manually closes toast. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Toast Notification Stale Timeout (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Toast Notification Stale Timeout (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "closeBtn.addEventListener('click', () => { clearTimeout(timerId); toast.remove(); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Toast Notification Stale Timeout (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Closing a toast manually causes error because previously scheduled setTimeout tries to remove deleted element. Reproduced in live browser events.\n// OBJECTIVE: Call clearTimeout(timerId) when user manually closes toast\ncloseBtn.addEventListener('click', () => { toast.remove(); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Call clearTimeout(timerId) when user manually closes toast"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Toast Notification Stale Timeout (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-debounce-clear-timeout-missing-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Debounced Input Trailing Execution (Production Web App)",
    "description": "Symptom:\nLive autocomplete executes on every keystroke because clearTimeout is not called inside debounce wrapper. Reproduced in live browser events.\n\nObjective:\nAdd clearTimeout(t) before setting the new timeout. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Debounced Input Trailing Execution (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Debounced Input Trailing Execution (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "let t; input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(fetchResults, 300); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Debounced Input Trailing Execution (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Live autocomplete executes on every keystroke because clearTimeout is not called inside debounce wrapper. Reproduced in live browser events.\n// OBJECTIVE: Add clearTimeout(t) before setting the new timeout\nlet t; input.addEventListener('input', () => { t = setTimeout(fetchResults, 300); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Add clearTimeout(t) before setting the new timeout"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Debounced Input Trailing Execution (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-drag-drop-dragover-prevent-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Drag and Drop Prevent Default Dragover (Production Web App)",
    "description": "Symptom:\nDropping element fails because e.preventDefault() is missing inside the dragover event listener. Reproduced in live browser events.\n\nObjective:\nAdd e.preventDefault() inside dragover handler to allow dropping. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Drag and Drop Prevent Default Dragover (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Drag and Drop Prevent Default Dragover (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Drag and Drop Prevent Default Dragover (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Dropping element fails because e.preventDefault() is missing inside the dragover event listener. Reproduced in live browser events.\n// OBJECTIVE: Add e.preventDefault() inside dragover handler to allow dropping\nzone.addEventListener('dragover', (e) => { zone.classList.add('drag-over'); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Add e.preventDefault() inside dragover handler to allow dropping"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Drag and Drop Prevent Default Dragover (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-quantity-string-concat-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Quantity Stepper String Concatenation (Production Web App)",
    "description": "Symptom:\nClicking plus button changes quantity from 1 to '11' because input.value is read as a string. Reproduced in live browser events.\n\nObjective:\nParse input.value as integer using parseInt() before addition. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Quantity Stepper String Concatenation (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Quantity Stepper String Concatenation (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "plusBtn.addEventListener('click', () => { input.value = parseInt(input.value || 0, 10) + 1; });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Quantity Stepper String Concatenation (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Clicking plus button changes quantity from 1 to '11' because input.value is read as a string. Reproduced in live browser events.\n// OBJECTIVE: Parse input.value as integer using parseInt() before addition\nplusBtn.addEventListener('click', () => { input.value = input.value + 1; });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Parse input.value as integer using parseInt() before addition"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Quantity Stepper String Concatenation (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-slider-css-var-sync-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Custom Range Slider CSS Variable Sync (Production Web App)",
    "description": "Symptom:\nMoving slider updates text display but fails to update CSS custom property controlling fill bar width. Reproduced in live browser events.\n\nObjective:\nUpdate CSS variable style.setProperty('--val', ...) on slider input. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Custom Range Slider CSS Variable Sync (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Custom Range Slider CSS Variable Sync (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "slider.addEventListener('input', () => { slider.style.setProperty('--val', slider.value + '%'); label.textContent = slider.value; });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Custom Range Slider CSS Variable Sync (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Moving slider updates text display but fails to update CSS custom property controlling fill bar width. Reproduced in live browser events.\n// OBJECTIVE: Update CSS variable style.setProperty('--val', ...) on slider input\nslider.addEventListener('input', () => { label.textContent = slider.value; });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Update CSS variable style.setProperty('--val', ...) on slider input"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Custom Range Slider CSS Variable Sync (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-300s-outside-click-dropdown-close-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Dropdown Menu Outside Click Dismiss (Production Web App)",
    "description": "Symptom:\nClicking outside custom select menu fails to close it because window click listener checks wrong element. Reproduced in live browser events.\n\nObjective:\nCheck !dropdown.contains(e.target) to close menu on outside click. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Dropdown Menu Outside Click Dismiss (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Dropdown Menu Outside Click Dismiss (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "window.addEventListener('click', (e) => { if (!dropdown.contains(e.target)) menu.classList.add('hidden'); });",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Dropdown Menu Outside Click Dismiss (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Clicking outside custom select menu fails to close it because window click listener checks wrong element. Reproduced in live browser events.\n// OBJECTIVE: Check !dropdown.contains(e.target) to close menu on outside click\nwindow.addEventListener('click', (e) => { if (dropdown.contains(e.target)) menu.classList.add('hidden'); });",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Check !dropdown.contains(e.target) to close menu on outside click"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Dropdown Menu Outside Click Dismiss (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-infinite-scroll-unobserve-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Infinite Scroll IntersectionObserver Disconnect (Production Web App)",
    "description": "Symptom:\nInfinite list loads 10 batches immediately because observer doesn't unobserve while request is in flight. Reproduced in live browser events.\n\nObjective:\nUnobserve or guard with !isLoading while fetch is pending. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Infinite Scroll IntersectionObserver Disconnect (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Infinite Scroll IntersectionObserver Disconnect (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "if (entry.isIntersecting && !isLoading) { observer.unobserve(target); loadMore(); }",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Infinite Scroll IntersectionObserver Disconnect (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Infinite list loads 10 batches immediately because observer doesn't unobserve while request is in flight. Reproduced in live browser events.\n// OBJECTIVE: Unobserve or guard with !isLoading while fetch is pending\nif (entry.isIntersecting) { loadMore(); }",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Unobserve or guard with !isLoading while fetch is pending"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Infinite Scroll IntersectionObserver Disconnect (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-table-sort-numeric-comparator-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Sortable Table Column Data Type Sort (Production Web App)",
    "description": "Symptom:\nNumeric table column sorts alphabetically ('100' before '20') because array.sort lacks numerical comparator. Reproduced in live browser events.\n\nObjective:\nSupply numerical comparator (a, b) => Number(a) - Number(b). Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Sortable Table Column Data Type Sort (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Sortable Table Column Data Type Sort (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "rows.sort((a, b) => Number(a.dataset.val) - Number(b.dataset.val));",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Sortable Table Column Data Type Sort (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Numeric table column sorts alphabetically ('100' before '20') because array.sort lacks numerical comparator. Reproduced in live browser events.\n// OBJECTIVE: Supply numerical comparator (a, b) => Number(a) - Number(b)\nrows.sort();",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Supply numerical comparator (a, b) => Number(a) - Number(b)"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Sortable Table Column Data Type Sort (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-multi-filter-and-vs-or-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Multi-Filter Intersection Logical AND Bug (Production Web App)",
    "description": "Symptom:\nItem with tags 'AI' and 'Cloud' fails multi-tag filter because filter uses logical OR instead of AND. Reproduced in live browser events.\n\nObjective:\nUse .every() so items must satisfy all selected filter criteria. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Multi-Filter Intersection Logical AND Bug (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Multi-Filter Intersection Logical AND Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "const match = selectedFilters.every(f => itemTags.includes(f));",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Multi-Filter Intersection Logical AND Bug (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Item with tags 'AI' and 'Cloud' fails multi-tag filter because filter uses logical OR instead of AND. Reproduced in live browser events.\n// OBJECTIVE: Use .every() so items must satisfy all selected filter criteria\nconst match = selectedFilters.some(f => itemTags.includes(f));",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Use .every() so items must satisfy all selected filter criteria"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Multi-Filter Intersection Logical AND Bug (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-localstorage-json-trycatch-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: LocalStorage JSON Parse Corrupt Fallback (Production Web App)",
    "description": "Symptom:\nApp crashes on launch if localStorage contains empty or corrupted JSON string. Reproduced in live browser events.\n\nObjective:\nWrap JSON.parse in try/catch block with fallback empty object. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: LocalStorage JSON Parse Corrupt Fallback (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>LocalStorage JSON Parse Corrupt Fallback (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "try { state = JSON.parse(localStorage.getItem('key') || '{}'); } catch { state = {}; }",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>LocalStorage JSON Parse Corrupt Fallback (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: App crashes on launch if localStorage contains empty or corrupted JSON string. Reproduced in live browser events.\n// OBJECTIVE: Wrap JSON.parse in try/catch block with fallback empty object\nstate = JSON.parse(localStorage.getItem('key'));",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Wrap JSON.parse in try/catch block with fallback empty object"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify LocalStorage JSON Parse Corrupt Fallback (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-badge-max-cap-format-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Notification Badge Max Cap Formatting (Production Web App)",
    "description": "Symptom:\nBadge counter shows raw '142' instead of formatted '99+' when count exceeds 99. Reproduced in live browser events.\n\nObjective:\nCap display count at '99+' when count > 99. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Notification Badge Max Cap Formatting (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Notification Badge Max Cap Formatting (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "badge.textContent = count > 99 ? '99+' : String(count);",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Notification Badge Max Cap Formatting (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Badge counter shows raw '142' instead of formatted '99+' when count exceeds 99. Reproduced in live browser events.\n// OBJECTIVE: Cap display count at '99+' when count > 99\nbadge.textContent = String(count);",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Cap display count at '99+' when count > 99"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Notification Badge Max Cap Formatting (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-virtual-list-padding-offset-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Virtual List Scroll Offset Calculation (Production Web App)",
    "description": "Symptom:\nVirtual list scrolls erratically because itemHeight offset does not account for container padding. Reproduced in live browser events.\n\nObjective:\nDeduct containerPadding from scrollTop before calculating startIdx. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Virtual List Scroll Offset Calculation (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Virtual List Scroll Offset Calculation (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "const startIdx = Math.floor((scrollTop - containerPadding) / itemHeight);",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Virtual List Scroll Offset Calculation (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Virtual list scrolls erratically because itemHeight offset does not account for container padding. Reproduced in live browser events.\n// OBJECTIVE: Deduct containerPadding from scrollTop before calculating startIdx\nconst startIdx = Math.floor(scrollTop / itemHeight);",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Deduct containerPadding from scrollTop before calculating startIdx"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Virtual List Scroll Offset Calculation (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-file-drop-datatransfer-files-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: File Upload Drag Zone Drop File List (Production Web App)",
    "description": "Symptom:\nFile drop zone fails to extract dropped file because it inspects e.target.files instead of e.dataTransfer.files. Reproduced in live browser events.\n\nObjective:\nRead dropped files from e.dataTransfer.files. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: File Upload Drag Zone Drop File List (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>File Upload Drag Zone Drop File List (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>File Upload Drag Zone Drop File List (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: File drop zone fails to extract dropped file because it inspects e.target.files instead of e.dataTransfer.files. Reproduced in live browser events.\n// OBJECTIVE: Read dropped files from e.dataTransfer.files\nconst files = e.target.files;",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Read dropped files from e.dataTransfer.files"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify File Upload Drag Zone Drop File List (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-countdown-negative-wrap-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Countdown Timer Negative Seconds Wrap (Production Web App)",
    "description": "Symptom:\nTimer displays negative seconds (-01:-05) when countdown reaches zero instead of clearing interval. Reproduced in live browser events.\n\nObjective:\nClear interval and clamp time to 0 when remaining <= 0. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Countdown Timer Negative Seconds Wrap (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Countdown Timer Negative Seconds Wrap (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "if (remaining <= 0) { clearInterval(timer); remaining = 0; displayTime(0); }",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Countdown Timer Negative Seconds Wrap (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Timer displays negative seconds (-01:-05) when countdown reaches zero instead of clearing interval. Reproduced in live browser events.\n// OBJECTIVE: Clear interval and clamp time to 0 when remaining <= 0\ndisplayTime(remaining--);",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Clear interval and clamp time to 0 when remaining <= 0"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Countdown Timer Negative Seconds Wrap (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-combobox-arrow-bounds-check-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Accessible Combobox Keyboard Navigation (Production Web App)",
    "description": "Symptom:\nArrow key down cycles past the end of the combobox list without wrapping or bounds checking. Reproduced in live browser events.\n\nObjective:\nClamp activeIndex to Math.min(activeIndex + 1, options.length - 1). Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Accessible Combobox Keyboard Navigation (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Accessible Combobox Keyboard Navigation (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "if (e.key === 'ArrowDown') { activeIndex = Math.min(activeIndex + 1, options.length - 1); highlightOption(activeIndex); }",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Accessible Combobox Keyboard Navigation (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Arrow key down cycles past the end of the combobox list without wrapping or bounds checking. Reproduced in live browser events.\n// OBJECTIVE: Clamp activeIndex to Math.min(activeIndex + 1, options.length - 1)\nif (e.key === 'ArrowDown') { activeIndex++; highlightOption(activeIndex); }",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Clamp activeIndex to Math.min(activeIndex + 1, options.length - 1)"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Accessible Combobox Keyboard Navigation (Production Web App) interaction passes without errors"
      }
    ]
  },
  {
    "id": "bughunt-htmlcssjs-medium-600s-audio-scrub-relative-offset-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix JS/DOM Bug: Audio Player Waveform Scrub Seek (Production Web App)",
    "description": "Symptom:\nScrubbing on audio player waveform calculates seek time relative to viewport instead of waveform element offset. Reproduced in live browser events.\n\nObjective:\nCalculate click percentage using e.clientX - rect.left. Verify interaction functions cleanly.",
    "tags": [
      "bug_web",
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Audio Player Waveform Scrub Seek (Production Web App)",
    "targetComponentHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Audio Player Waveform Scrub Seek (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "targetComponentCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "targetComponentJs": "const rect = waveform.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width;",
    "starterHtml": "<div class=\"interactive-sandbox\" id=\"app\">\n  <h3>Audio Player Waveform Scrub Seek (Production Web App)</h3>\n  <div class=\"display\" id=\"output-box\">Default State</div>\n  <button type=\"button\" class=\"action-btn\" id=\"trigger-btn\">Interact</button>\n</div>",
    "starterCss": ".interactive-sandbox { background: #0f172a; padding: 20px; border-radius: 12px; color: #fff; font-family: sans-serif; }\n.action-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }\n.display { padding: 10px; background: #1e293b; border-radius: 6px; margin-top: 8px; font-mono: monospace; }",
    "starterJs": "// BUG DIAGNOSIS TICKET: Scrubbing on audio player waveform calculates seek time relative to viewport instead of waveform element offset. Reproduced in live browser events.\n// OBJECTIVE: Calculate click percentage using e.clientX - rect.left\nconst pct = e.clientX / waveform.offsetWidth;",
    "validationCriteria": [
      "JavaScript DOM interaction bug diagnosed and resolved",
      "Zero console runtime exceptions",
      "Calculate click percentage using e.clientX - rect.left"
    ],
    "testCases": [
      {
        "input": "interaction_event_valid",
        "expectedOutput": "true",
        "description": "Verify Audio Player Waveform Scrub Seek (Production Web App) interaction passes without errors"
      }
    ]
  }
];
