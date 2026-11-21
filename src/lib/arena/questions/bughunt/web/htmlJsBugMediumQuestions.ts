import type { DuelQuestion } from '@/types/arenaDuel';

export const HTML_JS_BUG_MEDIUM_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "bughunt-htmljs-medium-180s-getelementbyid-hash-prefix-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: GetElementById Hash Prefix Bug (Production Script)",
    "description": "Symptom:\ndocument.getElementById('#output') returns null because getElementById should not include the '#' symbol. Encountered in asynchronous DOM logic.\n\nObjective:\nRemove the '#' prefix in document.getElementById('output'). Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: GetElementById Hash Prefix Bug (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>GetElementById Hash Prefix Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const el = document.getElementById('output'); el.textContent = 'Active';",
    "starterHtml": "<div id=\"root\">\n  <h2>GetElementById Hash Prefix Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: document.getElementById('#output') returns null because getElementById should not include the '#' symbol. Encountered in asynchronous DOM logic.\n// FIX: Remove the '#' prefix in document.getElementById('output')\nconst el = document.getElementById('#output'); el.textContent = 'Active';",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Remove the '#' prefix in document.getElementById('output')"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify GetElementById Hash Prefix Bug (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-input-string-addition-bug-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: String Number Addition Bug (Production Script)",
    "description": "Symptom:\nTwo input numbers 5 and 10 concatenate to '510' instead of summing to 15. Encountered in asynchronous DOM logic.\n\nObjective:\nWrap input values in Number() or parseInt() before summing. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: String Number Addition Bug (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>String Number Addition Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const sum = Number(a.value) + Number(b.value); res.textContent = sum;",
    "starterHtml": "<div id=\"root\">\n  <h2>String Number Addition Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Two input numbers 5 and 10 concatenate to '510' instead of summing to 15. Encountered in asynchronous DOM logic.\n// FIX: Wrap input values in Number() or parseInt() before summing\nconst sum = a.value + b.value; res.textContent = sum;",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Wrap input values in Number() or parseInt() before summing"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify String Number Addition Bug (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-checkbox-value-vs-checked-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Checkbox Value vs Checked Property (Production Script)",
    "description": "Symptom:\nForm checks input.value instead of input.checked, treating unchecked box as true. Encountered in asynchronous DOM logic.\n\nObjective:\nRead the boolean property .checked instead of .value. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Checkbox Value vs Checked Property (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Checkbox Value vs Checked Property (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const isAgreed = termsCheckbox.checked; status.textContent = isAgreed ? 'Ready' : 'Declined';",
    "starterHtml": "<div id=\"root\">\n  <h2>Checkbox Value vs Checked Property (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Form checks input.value instead of input.checked, treating unchecked box as true. Encountered in asynchronous DOM logic.\n// FIX: Read the boolean property .checked instead of .value\nconst isAgreed = termsCheckbox.value; status.textContent = isAgreed ? 'Ready' : 'Declined';",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Read the boolean property .checked instead of .value"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Checkbox Value vs Checked Property (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-array-push-return-length-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Array Push Return Value Bug (Production Script)",
    "description": "Symptom:\nFunction returns arr.push(item) which returns the new length integer instead of the array. Encountered in asynchronous DOM logic.\n\nObjective:\nReturn the array itself instead of the push() method return value. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Array Push Return Value Bug (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Array Push Return Value Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "arr.push(item); return arr;",
    "starterHtml": "<div id=\"root\">\n  <h2>Array Push Return Value Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Function returns arr.push(item) which returns the new length integer instead of the array. Encountered in asynchronous DOM logic.\n// FIX: Return the array itself instead of the push() method return value\nreturn arr.push(item);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Return the array itself instead of the push() method return value"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Array Push Return Value Bug (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-nodelist-missing-map-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: QuerySelectorAll NodeList Map Error (Production Script)",
    "description": "Symptom:\nCalling .map() directly on document.querySelectorAll throws TypeError because NodeList lacks map. Encountered in asynchronous DOM logic.\n\nObjective:\nConvert NodeList to Array using Array.from() before calling .map(). Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: QuerySelectorAll NodeList Map Error (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>QuerySelectorAll NodeList Map Error (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const texts = Array.from(document.querySelectorAll('li')).map(el => el.textContent);",
    "starterHtml": "<div id=\"root\">\n  <h2>QuerySelectorAll NodeList Map Error (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Calling .map() directly on document.querySelectorAll throws TypeError because NodeList lacks map. Encountered in asynchronous DOM logic.\n// FIX: Convert NodeList to Array using Array.from() before calling .map()\nconst texts = document.querySelectorAll('li').map(el => el.textContent);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Convert NodeList to Array using Array.from() before calling .map()"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify QuerySelectorAll NodeList Map Error (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-disabled-boolean-string-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Button Disabled Attribute Boolean String (Production Script)",
    "description": "Symptom:\nSetting btn.disabled = 'false' keeps button disabled because non-empty string is truthy. Encountered in asynchronous DOM logic.\n\nObjective:\nAssign the boolean false instead of the string 'false'. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Button Disabled Attribute Boolean String (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Button Disabled Attribute Boolean String (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "btn.disabled = false;",
    "starterHtml": "<div id=\"root\">\n  <h2>Button Disabled Attribute Boolean String (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Setting btn.disabled = 'false' keeps button disabled because non-empty string is truthy. Encountered in asynchronous DOM logic.\n// FIX: Assign the boolean false instead of the string 'false'\nbtn.disabled = 'false';",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Assign the boolean false instead of the string 'false'"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Button Disabled Attribute Boolean String (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-select-selected-index-text-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Select Option Value Index Offset (Production Script)",
    "description": "Symptom:\nReading select.selectedIndex returns number index instead of the selected option text/value. Encountered in asynchronous DOM logic.\n\nObjective:\nRetrieve select.options[select.selectedIndex].value. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Select Option Value Index Offset (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Select Option Value Index Offset (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const val = select.options[select.selectedIndex].value;",
    "starterHtml": "<div id=\"root\">\n  <h2>Select Option Value Index Offset (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Reading select.selectedIndex returns number index instead of the selected option text/value. Encountered in asynchronous DOM logic.\n// FIX: Retrieve select.options[select.selectedIndex].value\nconst val = select.selectedIndex;",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Retrieve select.options[select.selectedIndex].value"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Select Option Value Index Offset (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-input-null-string-print-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Form Reset Input Value Blanking (Production Script)",
    "description": "Symptom:\nCustom clear button assigns input.value = null which prints 'null' into input field. Encountered in asynchronous DOM logic.\n\nObjective:\nAssign empty string '' instead of null. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Form Reset Input Value Blanking (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Form Reset Input Value Blanking (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "input.value = '';",
    "starterHtml": "<div id=\"root\">\n  <h2>Form Reset Input Value Blanking (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Custom clear button assigns input.value = null which prints 'null' into input field. Encountered in asynchronous DOM logic.\n// FIX: Assign empty string '' instead of null\ninput.value = null;",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Assign empty string '' instead of null"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Form Reset Input Value Blanking (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-arrow-this-scope-event-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: EventListener Callback Arrow This Scope (Production Script)",
    "description": "Symptom:\nTraditional function using this is converted to arrow function, losing reference to clicked element. Encountered in asynchronous DOM logic.\n\nObjective:\nUse e.currentTarget or a standard function to access the button context. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: EventListener Callback Arrow This Scope (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>EventListener Callback Arrow This Scope (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "btn.addEventListener('click', function() { this.textContent = 'Clicked'; });",
    "starterHtml": "<div id=\"root\">\n  <h2>EventListener Callback Arrow This Scope (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Traditional function using this is converted to arrow function, losing reference to clicked element. Encountered in asynchronous DOM logic.\n// FIX: Use e.currentTarget or a standard function to access the button context\nbtn.addEventListener('click', () => { this.textContent = 'Clicked'; });",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Use e.currentTarget or a standard function to access the button context"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify EventListener Callback Arrow This Scope (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-180s-settimeout-var-closure-bug-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: SetTimeout Variable Reference Closure Bug (Production Script)",
    "description": "Symptom:\nLoop sets 3 timeouts that all print '3' because var was used instead of let. Encountered in asynchronous DOM logic.\n\nObjective:\nUse let instead of var to preserve block scope in asynchronous loop. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: SetTimeout Variable Reference Closure Bug (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>SetTimeout Variable Reference Closure Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }",
    "starterHtml": "<div id=\"root\">\n  <h2>SetTimeout Variable Reference Closure Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Loop sets 3 timeouts that all print '3' because var was used instead of let. Encountered in asynchronous DOM logic.\n// FIX: Use let instead of var to preserve block scope in asynchronous loop\nfor (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Use let instead of var to preserve block scope in asynchronous loop"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify SetTimeout Variable Reference Closure Bug (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-splice-forward-loop-skip-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Array Splice Forward Iteration Skip (Production Script)",
    "description": "Symptom:\nDeleting items in forward loop skips adjacent elements because array shifts in-place. Encountered in asynchronous DOM logic.\n\nObjective:\nIterate in reverse or use filter() when removing items. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Array Splice Forward Iteration Skip (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Array Splice Forward Iteration Skip (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "for (let i = items.length - 1; i >= 0; i--) { if (items[i] === target) items.splice(i, 1); }",
    "starterHtml": "<div id=\"root\">\n  <h2>Array Splice Forward Iteration Skip (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Deleting items in forward loop skips adjacent elements because array shifts in-place. Encountered in asynchronous DOM logic.\n// FIX: Iterate in reverse or use filter() when removing items\nfor (let i = 0; i < items.length; i++) { if (items[i] === target) items.splice(i, 1); }",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Iterate in reverse or use filter() when removing items"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Array Splice Forward Iteration Skip (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-storage-event-same-tab-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: LocalStorage Storage Event Cross-Tab Only (Production Script)",
    "description": "Symptom:\nAdding storage listener on window expects same-page update but storage event only fires on other tabs. Encountered in asynchronous DOM logic.\n\nObjective:\nTrigger custom event or update local state directly for same-tab updates. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: LocalStorage Storage Event Cross-Tab Only (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>LocalStorage Storage Event Cross-Tab Only (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "localStorage.setItem('k', val); window.dispatchEvent(new Event('storage'));",
    "starterHtml": "<div id=\"root\">\n  <h2>LocalStorage Storage Event Cross-Tab Only (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Adding storage listener on window expects same-page update but storage event only fires on other tabs. Encountered in asynchronous DOM logic.\n// FIX: Trigger custom event or update local state directly for same-tab updates\nlocalStorage.setItem('k', val);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Trigger custom event or update local state directly for same-tab updates"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify LocalStorage Storage Event Cross-Tab Only (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-json-parse-empty-string-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: JSON Parse Empty String SyntaxError (Production Script)",
    "description": "Symptom:\nJSON.parse('') throws uncaught SyntaxError on empty cache string. Encountered in asynchronous DOM logic.\n\nObjective:\nGuard against empty string before calling JSON.parse(). Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: JSON Parse Empty String SyntaxError (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>JSON Parse Empty String SyntaxError (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const data = raw ? JSON.parse(raw) : null;",
    "starterHtml": "<div id=\"root\">\n  <h2>JSON Parse Empty String SyntaxError (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: JSON.parse('') throws uncaught SyntaxError on empty cache string. Encountered in asynchronous DOM logic.\n// FIX: Guard against empty string before calling JSON.parse()\nconst data = JSON.parse(raw);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Guard against empty string before calling JSON.parse()"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify JSON Parse Empty String SyntaxError (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-event-delegation-svg-target-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Event Delegation Button Child SVG Click (Production Script)",
    "description": "Symptom:\nClicking icon inside button reports SVG or path as e.target breaking dataset lookup. Encountered in asynchronous DOM logic.\n\nObjective:\nUse e.target.closest('button') to handle clicks on nested icons. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Event Delegation Button Child SVG Click (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Event Delegation Button Child SVG Click (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const btn = e.target.closest('button'); if (btn) handleAction(btn.dataset.action);",
    "starterHtml": "<div id=\"root\">\n  <h2>Event Delegation Button Child SVG Click (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Clicking icon inside button reports SVG or path as e.target breaking dataset lookup. Encountered in asynchronous DOM logic.\n// FIX: Use e.target.closest('button') to handle clicks on nested icons\nif (e.target.tagName === 'BUTTON') handleAction(e.target.dataset.action);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Use e.target.closest('button') to handle clicks on nested icons"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Event Delegation Button Child SVG Click (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-async-await-missing-trycatch-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Async Await Missing Error Catch (Production Script)",
    "description": "Symptom:\nUnhandled rejected promise causes uncaught runtime error in async click handler. Encountered in asynchronous DOM logic.\n\nObjective:\nWrap await call in try/catch block. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Async Await Missing Error Catch (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Async Await Missing Error Catch (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "async function load() { try { const res = await fetch('/api'); } catch (err) { status.textContent = 'Error'; } }",
    "starterHtml": "<div id=\"root\">\n  <h2>Async Await Missing Error Catch (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Unhandled rejected promise causes uncaught runtime error in async click handler. Encountered in asynchronous DOM logic.\n// FIX: Wrap await call in try/catch block\nasync function load() { const res = await fetch('/api'); }",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Wrap await call in try/catch block"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Async Await Missing Error Catch (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-shallow-spread-nested-mutation-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Deep Clone Reference Mutation Bug (Production Script)",
    "description": "Symptom:\nShallow object spread modifies nested array property in original state. Encountered in asynchronous DOM logic.\n\nObjective:\nDeeply clone or spread the nested array [...state.items, newItem]. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Deep Clone Reference Mutation Bug (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Deep Clone Reference Mutation Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const next = { ...state, items: [...state.items, newItem] };",
    "starterHtml": "<div id=\"root\">\n  <h2>Deep Clone Reference Mutation Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Shallow object spread modifies nested array property in original state. Encountered in asynchronous DOM logic.\n// FIX: Deeply clone or spread the nested array [...state.items, newItem]\nconst next = { ...state }; next.items.push(newItem);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Deeply clone or spread the nested array [...state.items, newItem]"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Deep Clone Reference Mutation Bug (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-urlsearchparams-append-vs-set-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: URLSearchParams Append vs Set (Production Script)",
    "description": "Symptom:\nUpdating page query param appends '?page=1&page=2' instead of replacing existing value. Encountered in asynchronous DOM logic.\n\nObjective:\nUse params.set() instead of params.append(). Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: URLSearchParams Append vs Set (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>URLSearchParams Append vs Set (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "params.set('page', '2');",
    "starterHtml": "<div id=\"root\">\n  <h2>URLSearchParams Append vs Set (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Updating page query param appends '?page=1&page=2' instead of replacing existing value. Encountered in asynchronous DOM logic.\n// FIX: Use params.set() instead of params.append()\nparams.append('page', '2');",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Use params.set() instead of params.append()"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify URLSearchParams Append vs Set (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-radio-query-checked-pseudo-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Radio Group Checked Selection Query (Production Script)",
    "description": "Symptom:\ndocument.querySelector('input[name=role]') always returns first option regardless of checked state. Encountered in asynchronous DOM logic.\n\nObjective:\nUse :checked pseudo-selector: input[name=role]:checked. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Radio Group Checked Selection Query (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Radio Group Checked Selection Query (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const selected = document.querySelector('input[name=role]:checked')?.value;",
    "starterHtml": "<div id=\"root\">\n  <h2>Radio Group Checked Selection Query (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: document.querySelector('input[name=role]') always returns first option regardless of checked state. Encountered in asynchronous DOM logic.\n// FIX: Use :checked pseudo-selector: input[name=role]:checked\nconst selected = document.querySelector('input[name=role]').value;",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Use :checked pseudo-selector: input[name=role]:checked"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Radio Group Checked Selection Query (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-regex-test-lastindex-state-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: RegExp Test Global Sticky State Reset (Production Script)",
    "description": "Symptom:\nGlobal regex test() alternates between true and false on consecutive identical strings. Encountered in asynchronous DOM logic.\n\nObjective:\nRemove 'g' flag or reset regex.lastIndex = 0 before test(). Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: RegExp Test Global Sticky State Reset (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>RegExp Test Global Sticky State Reset (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const regex = /^[a-z]+$/; const ok = regex.test(str);",
    "starterHtml": "<div id=\"root\">\n  <h2>RegExp Test Global Sticky State Reset (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Global regex test() alternates between true and false on consecutive identical strings. Encountered in asynchronous DOM logic.\n// FIX: Remove 'g' flag or reset regex.lastIndex = 0 before test()\nconst regex = /^[a-z]+$/g; const ok = regex.test(str);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Remove 'g' flag or reset regex.lastIndex = 0 before test()"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify RegExp Test Global Sticky State Reset (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-300s-customevent-detail-vs-data-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Custom Event Detail Property Access (Production Script)",
    "description": "Symptom:\nCustomEvent listener attempts to read e.data instead of standard e.detail. Encountered in asynchronous DOM logic.\n\nObjective:\nRead e.detail instead of e.data on CustomEvent. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Custom Event Detail Property Access (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Custom Event Detail Property Access (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "window.addEventListener('match_ready', (e) => { const user = e.detail.username; });",
    "starterHtml": "<div id=\"root\">\n  <h2>Custom Event Detail Property Access (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: CustomEvent listener attempts to read e.data instead of standard e.detail. Encountered in asynchronous DOM logic.\n// FIX: Read e.detail instead of e.data on CustomEvent\nwindow.addEventListener('match_ready', (e) => { const user = e.data.username; });",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Read e.detail instead of e.data on CustomEvent"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Custom Event Detail Property Access (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-mutation-observer-infinite-loop-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: MutationObserver Infinite DOM Loop (Production Script)",
    "description": "Symptom:\nMutationObserver records childList mutations and inside callback appends a child, causing infinite loop. Encountered in asynchronous DOM logic.\n\nObjective:\nDisconnect observer before mutating DOM or filter out internal updates. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: MutationObserver Infinite DOM Loop (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>MutationObserver Infinite DOM Loop (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "observer.disconnect(); container.appendChild(log); observer.observe(container, config);",
    "starterHtml": "<div id=\"root\">\n  <h2>MutationObserver Infinite DOM Loop (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: MutationObserver records childList mutations and inside callback appends a child, causing infinite loop. Encountered in asynchronous DOM logic.\n// FIX: Disconnect observer before mutating DOM or filter out internal updates\ncontainer.appendChild(log);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Disconnect observer before mutating DOM or filter out internal updates"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify MutationObserver Infinite DOM Loop (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-throttle-trailing-edge-loss-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Throttle Function Leading vs Trailing Edge (Production Script)",
    "description": "Symptom:\nThrottle implementation fails to execute final trailing event on mouse movement end. Encountered in asynchronous DOM logic.\n\nObjective:\nImplement trailing timeout execution in throttle function. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Throttle Function Leading vs Trailing Edge (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Throttle Function Leading vs Trailing Edge (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "function throttle(fn, delay) { let last = 0, timer; return (...args) => { const now = Date.now(); if (now - last >= delay) { last = now; fn(...args); } else { clearTimeout(timer); timer = setTimeout(() => { last = Date.now(); fn(...args); }, delay); } }; }",
    "starterHtml": "<div id=\"root\">\n  <h2>Throttle Function Leading vs Trailing Edge (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Throttle implementation fails to execute final trailing event on mouse movement end. Encountered in asynchronous DOM logic.\n// FIX: Implement trailing timeout execution in throttle function\nfunction throttle(fn, delay) { let last = 0; return (...args) => { const now = Date.now(); if (now - last >= delay) { last = now; fn(...args); } }; }",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Implement trailing timeout execution in throttle function"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Throttle Function Leading vs Trailing Edge (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-abortcontroller-reused-instance-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Fetch AbortController Reusable Instance Bug (Production Script)",
    "description": "Symptom:\nAbortController is aborted once and reused on subsequent requests, aborting all future calls. Encountered in asynchronous DOM logic.\n\nObjective:\nInstantiate new AbortController() after calling abort(). Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Fetch AbortController Reusable Instance Bug (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Fetch AbortController Reusable Instance Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "let controller = new AbortController(); function fetchNext() { controller.abort(); controller = new AbortController(); fetch('/data', { signal: controller.signal }); }",
    "starterHtml": "<div id=\"root\">\n  <h2>Fetch AbortController Reusable Instance Bug (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: AbortController is aborted once and reused on subsequent requests, aborting all future calls. Encountered in asynchronous DOM logic.\n// FIX: Instantiate new AbortController() after calling abort()\nconst controller = new AbortController(); function fetchNext() { controller.abort(); fetch('/data', { signal: controller.signal }); }",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Instantiate new AbortController() after calling abort()"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Fetch AbortController Reusable Instance Bug (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-reducer-object-mutation-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: State Reducer Object Mutation Trap (Production Script)",
    "description": "Symptom:\nArray reducer mutates previous accumulator object leading to unpredictable state history. Encountered in asynchronous DOM logic.\n\nObjective:\nReturn new object copies without mutating previous accumulator in reducer. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: State Reducer Object Mutation Trap (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>State Reducer Object Mutation Trap (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "return { ...acc, [id]: { ...acc[id], status: 'done' } };",
    "starterHtml": "<div id=\"root\">\n  <h2>State Reducer Object Mutation Trap (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Array reducer mutates previous accumulator object leading to unpredictable state history. Encountered in asynchronous DOM logic.\n// FIX: Return new object copies without mutating previous accumulator in reducer\nacc[id].status = 'done'; return acc;",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Return new object copies without mutating previous accumulator in reducer"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify State Reducer Object Mutation Trap (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-dompoint-matrix-transform-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: DOM Matrix Coordinate Point Inversion (Production Script)",
    "description": "Symptom:\nDOMPoint matrix transform inverts X and Y coordinates when applying screen-to-SVG transform. Encountered in asynchronous DOM logic.\n\nObjective:\nUse pt.matrixTransform(svg.getScreenCTM().inverse()) with correct clientX and clientY. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: DOM Matrix Coordinate Point Inversion (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>DOM Matrix Coordinate Point Inversion (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const loc = pt.matrixTransform(svg.getScreenCTM().inverse());",
    "starterHtml": "<div id=\"root\">\n  <h2>DOM Matrix Coordinate Point Inversion (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: DOMPoint matrix transform inverts X and Y coordinates when applying screen-to-SVG transform. Encountered in asynchronous DOM logic.\n// FIX: Use pt.matrixTransform(svg.getScreenCTM().inverse()) with correct clientX and clientY\nconst pt = svg.createSVGPoint(); pt.x = e.clientY; pt.y = e.clientX; const loc = pt.matrixTransform(svg.getScreenCTM());",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Use pt.matrixTransform(svg.getScreenCTM().inverse()) with correct clientX and clientY"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify DOM Matrix Coordinate Point Inversion (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-template-clone-deep-true-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Template Element Content Clone Deep (Production Script)",
    "description": "Symptom:\ndocument.importNode or cloneNode lacks deep=true parameter, copying only template root node. Encountered in asynchronous DOM logic.\n\nObjective:\nPass true to cloneNode(true) to copy all children of template content. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Template Element Content Clone Deep (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Template Element Content Clone Deep (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const clone = template.content.cloneNode(true);",
    "starterHtml": "<div id=\"root\">\n  <h2>Template Element Content Clone Deep (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: document.importNode or cloneNode lacks deep=true parameter, copying only template root node. Encountered in asynchronous DOM logic.\n// FIX: Pass true to cloneNode(true) to copy all children of template content\nconst clone = template.content.cloneNode(false);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Pass true to cloneNode(true) to copy all children of template content"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Template Element Content Clone Deep (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-permissions-query-feature-detect-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Clipboard Permissions API State Query (Production Script)",
    "description": "Symptom:\nnavigator.permissions.query fails on unsupported browser without feature detection. Encountered in asynchronous DOM logic.\n\nObjective:\nFeature-detect navigator.permissions before calling query(). Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Clipboard Permissions API State Query (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Clipboard Permissions API State Query (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "if (navigator.permissions && navigator.permissions.query) { await navigator.permissions.query({ name: 'clipboard-write' }); }",
    "starterHtml": "<div id=\"root\">\n  <h2>Clipboard Permissions API State Query (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: navigator.permissions.query fails on unsupported browser without feature detection. Encountered in asynchronous DOM logic.\n// FIX: Feature-detect navigator.permissions before calling query()\nawait navigator.permissions.query({ name: 'clipboard-write' });",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Feature-detect navigator.permissions before calling query()"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Clipboard Permissions API State Query (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-indexeddb-tx-premature-complete-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: IndexedDB Transaction Complete Event (Production Script)",
    "description": "Symptom:\nTransaction completes before onsuccess callback finishes due to unhandled microtask queue. Encountered in asynchronous DOM logic.\n\nObjective:\nHandle transaction completion lifecycle accurately. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: IndexedDB Transaction Complete Event (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>IndexedDB Transaction Complete Event (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "tx.oncomplete = () => { resolve(result); }; req.onsuccess = (e) => { result = e.target.result; };",
    "starterHtml": "<div id=\"root\">\n  <h2>IndexedDB Transaction Complete Event (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: Transaction completes before onsuccess callback finishes due to unhandled microtask queue. Encountered in asynchronous DOM logic.\n// FIX: Handle transaction completion lifecycle accurately\nreq.onsuccess = (e) => { resolve(e.target.result); };",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Handle transaction completion lifecycle accurately"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify IndexedDB Transaction Complete Event (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-formdata-multi-value-entries-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Form FormData Iterator Key Duplication (Production Script)",
    "description": "Symptom:\nFormData entries loop treats multi-value fields as duplicate keys instead of array values. Encountered in asynchronous DOM logic.\n\nObjective:\nAccumulate repeated keys into arrays in FormData serializer. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Form FormData Iterator Key Duplication (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Form FormData Iterator Key Duplication (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "const data = {}; for (const [k, v] of formData.entries()) { data[k] = data[k] ? [].concat(data[k], v) : v; }",
    "starterHtml": "<div id=\"root\">\n  <h2>Form FormData Iterator Key Duplication (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: FormData entries loop treats multi-value fields as duplicate keys instead of array values. Encountered in asynchronous DOM logic.\n// FIX: Accumulate repeated keys into arrays in FormData serializer\nconst data = Object.fromEntries(formData);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Accumulate repeated keys into arrays in FormData serializer"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Form FormData Iterator Key Duplication (Production Script) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmljs-medium-600s-canvas-save-restore-mismatch-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML/JS Bug: Canvas Context State Restore Mismatch (Production Script)",
    "description": "Symptom:\nctx.save() and ctx.restore() are unbalanced, causing rotational transform to leak onto next frame. Encountered in asynchronous DOM logic.\n\nObjective:\nPair ctx.save() with ctx.restore() around canvas transformations. Ensure JavaScript logic executes without errors.",
    "tags": [
      "bug_web",
      "html",
      "javascript"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Canvas Context State Restore Mismatch (Production Script)",
    "targetComponentHtml": "<div id=\"root\">\n  <h2>Canvas Context State Restore Mismatch (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "targetComponentJs": "ctx.save(); ctx.translate(100, 100); ctx.rotate(angle); ctx.fillRect(-20, -20, 40, 40); ctx.restore();",
    "starterHtml": "<div id=\"root\">\n  <h2>Canvas Context State Restore Mismatch (Production Script)</h2>\n  <div id=\"output\">Initial State</div>\n  <button id=\"action-btn\">Trigger</button>\n</div>",
    "starterJs": "// BUG DIAGNOSIS TICKET: ctx.save() and ctx.restore() are unbalanced, causing rotational transform to leak onto next frame. Encountered in asynchronous DOM logic.\n// FIX: Pair ctx.save() with ctx.restore() around canvas transformations\nctx.translate(100, 100); ctx.rotate(angle); ctx.fillRect(-20, -20, 40, 40);",
    "validationCriteria": [
      "JavaScript bug diagnosed and eliminated",
      "Valid DOM state updated",
      "Pair ctx.save() with ctx.restore() around canvas transformations"
    ],
    "testCases": [
      {
        "input": "js_logic_valid",
        "expectedOutput": "true",
        "description": "Verify Canvas Context State Restore Mismatch (Production Script) is fixed"
      }
    ]
  }
];
