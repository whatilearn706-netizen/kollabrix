import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * Calibrated KΛ ARENA Questions (30 items)
 * Designed for collegiate speed-coding with ~30 seconds margin to spare.
 */
export const HTML_JS_HARD_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "html-js-hard-3m-char-counter",
    "arena": "web_dev",
    "title": "Live Character Counter",
    "description": "Input field that updates a remaining character counter (280/280) as user types.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Live Character Counter",
    "targetComponentHtml": "<div id=\"char-counter-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Live Character Counter</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Input field that updates a remaining character counter (280/280) as user types.</p>\n  <div id=\"char-counter-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"char-counter-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('char-counter-btn');\n  var display = document.getElementById('char-counter-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Character Counter';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"char-counter-app\">\n  <!-- Build Live Character Counter interface elements: Input field that updates a remaining character counter (280/280) as user types. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Live Character Counter\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Live Character Counter"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Live Character Counter"
      }
    ],
    "validationCriteria": [
      "Live Character Counter",
      "Character Counter",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-toggle-pwd",
    "arena": "web_dev",
    "title": "Toggle Password Visibility",
    "description": "Password input with a button to toggle between password and text type.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Toggle Password Visibility",
    "targetComponentHtml": "<div id=\"toggle-pwd-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Toggle Password Visibility</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Password input with a button to toggle between password and text type.</p>\n  <div id=\"toggle-pwd-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"toggle-pwd-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('toggle-pwd-btn');\n  var display = document.getElementById('toggle-pwd-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Password Visibility';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"toggle-pwd-app\">\n  <!-- Build Toggle Password Visibility interface elements: Password input with a button to toggle between password and text type. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Toggle Password Visibility\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Toggle Password Visibility"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Toggle Password Visibility"
      }
    ],
    "validationCriteria": [
      "Toggle Password Visibility",
      "Password Visibility",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-click-counter",
    "arena": "web_dev",
    "title": "Click Counter with Reset",
    "description": "Display showing a number, Increment button, and Reset button.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Click Counter with Reset",
    "targetComponentHtml": "<div id=\"click-counter-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Click Counter with Reset</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Display showing a number, Increment button, and Reset button.</p>\n  <div id=\"click-counter-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"click-counter-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('click-counter-btn');\n  var display = document.getElementById('click-counter-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Click Counter';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"click-counter-app\">\n  <!-- Build Click Counter with Reset interface elements: Display showing a number, Increment button, and Reset button. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Click Counter with Reset\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Click Counter with Reset"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Click Counter with Reset"
      }
    ],
    "validationCriteria": [
      "Click Counter with Reset",
      "Click Counter",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-clipboard-copy",
    "arena": "web_dev",
    "title": "Copy Text to Clipboard",
    "description": "Text container with a Copy button that writes to clipboard and shows feedback.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Copy Text to Clipboard",
    "targetComponentHtml": "<div id=\"clipboard-copy-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Copy Text to Clipboard</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Text container with a Copy button that writes to clipboard and shows feedback.</p>\n  <div id=\"clipboard-copy-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"clipboard-copy-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('clipboard-copy-btn');\n  var display = document.getElementById('clipboard-copy-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Clipboard Copy';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"clipboard-copy-app\">\n  <!-- Build Copy Text to Clipboard interface elements: Text container with a Copy button that writes to clipboard and shows feedback. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Copy Text to Clipboard\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Copy Text to Clipboard"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Copy Text to Clipboard"
      }
    ],
    "validationCriteria": [
      "Copy Text to Clipboard",
      "Clipboard Copy",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-hex-changer",
    "arena": "web_dev",
    "title": "Random Hex Background Changer",
    "description": "Button that generates a random hex code and changes document background.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Random Hex Background Changer",
    "targetComponentHtml": "<div id=\"hex-changer-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Random Hex Background Changer</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Button that generates a random hex code and changes document background.</p>\n  <div id=\"hex-changer-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"hex-changer-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('hex-changer-btn');\n  var display = document.getElementById('hex-changer-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Background Changer';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"hex-changer-app\">\n  <!-- Build Random Hex Background Changer interface elements: Button that generates a random hex code and changes document background. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Random Hex Background Changer\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Random Hex Background Changer"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Random Hex Background Changer"
      }
    ],
    "validationCriteria": [
      "Random Hex Background Changer",
      "Background Changer",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-word-tally",
    "arena": "web_dev",
    "title": "Live Word & Sentence Tally",
    "description": "Textarea that calculates and prints total word count in real time.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Live Word & Sentence Tally",
    "targetComponentHtml": "<div id=\"word-tally-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Live Word & Sentence Tally</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Textarea that calculates and prints total word count in real time.</p>\n  <div id=\"word-tally-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"word-tally-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('word-tally-btn');\n  var display = document.getElementById('word-tally-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Word Tally';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"word-tally-app\">\n  <!-- Build Live Word & Sentence Tally interface elements: Textarea that calculates and prints total word count in real time. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Live Word & Sentence Tally\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Live Word & Sentence Tally"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Live Word & Sentence Tally"
      }
    ],
    "validationCriteria": [
      "Live Word & Sentence Tally",
      "Word Tally",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-alert-box",
    "arena": "web_dev",
    "title": "Custom Alert Box Displayer",
    "description": "Input and button that displays typed message inside custom alert card.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Custom Alert Box Displayer",
    "targetComponentHtml": "<div id=\"alert-box-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Custom Alert Box Displayer</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Input and button that displays typed message inside custom alert card.</p>\n  <div id=\"alert-box-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"alert-box-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('alert-box-btn');\n  var display = document.getElementById('alert-box-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Alert Displayer';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"alert-box-app\">\n  <!-- Build Custom Alert Box Displayer interface elements: Input and button that displays typed message inside custom alert card. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Custom Alert Box Displayer\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Custom Alert Box Displayer"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Custom Alert Box Displayer"
      }
    ],
    "validationCriteria": [
      "Custom Alert Box Displayer",
      "Alert Displayer",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-timestamp-gen",
    "arena": "web_dev",
    "title": "Timestamp Item Generator",
    "description": "Button that appends current local timestamp into an ordered list.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Timestamp Item Generator",
    "targetComponentHtml": "<div id=\"timestamp-gen-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Timestamp Item Generator</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Button that appends current local timestamp into an ordered list.</p>\n  <div id=\"timestamp-gen-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"timestamp-gen-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('timestamp-gen-btn');\n  var display = document.getElementById('timestamp-gen-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Timestamp Generator';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"timestamp-gen-app\">\n  <!-- Build Timestamp Item Generator interface elements: Button that appends current local timestamp into an ordered list. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Timestamp Item Generator\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Timestamp Item Generator"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Timestamp Item Generator"
      }
    ],
    "validationCriteria": [
      "Timestamp Item Generator",
      "Timestamp Generator",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-show-hide",
    "arena": "web_dev",
    "title": "Simple Show-Hide Message",
    "description": "Button toggling secret message between block and none.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Simple Show-Hide Message",
    "targetComponentHtml": "<div id=\"show-hide-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Simple Show-Hide Message</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Button toggling secret message between block and none.</p>\n  <div id=\"show-hide-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"show-hide-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('show-hide-btn');\n  var display = document.getElementById('show-hide-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Show-Hide Message';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"show-hide-app\">\n  <!-- Build Simple Show-Hide Message interface elements: Button toggling secret message between block and none. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Simple Show-Hide Message\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Simple Show-Hide Message"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Simple Show-Hide Message"
      }
    ],
    "validationCriteria": [
      "Simple Show-Hide Message",
      "Show-Hide Message",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-3m-terms-enable",
    "arena": "web_dev",
    "title": "Terms Checkbox Enables Button",
    "description": "Submit button that remains disabled until Terms checkbox is checked.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Terms Checkbox Enables Button",
    "targetComponentHtml": "<div id=\"terms-enable-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Terms Checkbox Enables Button</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Submit button that remains disabled until Terms checkbox is checked.</p>\n  <div id=\"terms-enable-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"terms-enable-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('terms-enable-btn');\n  var display = document.getElementById('terms-enable-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Terms Enabler';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"terms-enable-app\">\n  <!-- Build Terms Checkbox Enables Button interface elements: Submit button that remains disabled until Terms checkbox is checked. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Terms Checkbox Enables Button\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Terms Checkbox Enables Button"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Terms Checkbox Enables Button"
      }
    ],
    "validationCriteria": [
      "Terms Checkbox Enables Button",
      "Terms Enabler",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-todo-list",
    "arena": "web_dev",
    "title": "Basic Todo List (Add & Remove)",
    "description": "Input to add items, with a delete button on each item to remove it.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Basic Todo List (Add & Remove)",
    "targetComponentHtml": "<div id=\"todo-list-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Basic Todo List (Add & Remove)</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Input to add items, with a delete button on each item to remove it.</p>\n  <div id=\"todo-list-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"todo-list-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('todo-list-btn');\n  var display = document.getElementById('todo-list-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Todo List';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"todo-list-app\">\n  <!-- Build Basic Todo List (Add & Remove) interface elements: Input to add items, with a delete button on each item to remove it. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Basic Todo List (Add & Remove)\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Basic Todo List (Add & Remove)"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Basic Todo List (Add & Remove)"
      }
    ],
    "validationCriteria": [
      "Basic Todo List (Add & Remove)",
      "Todo List",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-temp-conv",
    "arena": "web_dev",
    "title": "Temperature Converter (\u00b0C to \u00b0F)",
    "description": "Two-way input converter computing conversions instantly on input.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Temperature Converter (\u00b0C to \u00b0F)",
    "targetComponentHtml": "<div id=\"temp-conv-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Temperature Converter (\u00b0C to \u00b0F)</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Two-way input converter computing conversions instantly on input.</p>\n  <div id=\"temp-conv-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"temp-conv-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('temp-conv-btn');\n  var display = document.getElementById('temp-conv-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Temperature Converter';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"temp-conv-app\">\n  <!-- Build Temperature Converter (\u00b0C to \u00b0F) interface elements: Two-way input converter computing conversions instantly on input. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Temperature Converter (\u00b0C to \u00b0F)\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Temperature Converter (\u00b0C to \u00b0F)"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Temperature Converter (\u00b0C to \u00b0F)"
      }
    ],
    "validationCriteria": [
      "Temperature Converter (\u00b0C to \u00b0F)",
      "Temperature Converter",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-digital-clock",
    "arena": "web_dev",
    "title": "Digital Clock (12-Hour Format)",
    "description": "Clock displaying HH:MM:SS AM/PM updating every second.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Digital Clock (12-Hour Format)",
    "targetComponentHtml": "<div id=\"digital-clock-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Digital Clock (12-Hour Format)</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Clock displaying HH:MM:SS AM/PM updating every second.</p>\n  <div id=\"digital-clock-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"digital-clock-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('digital-clock-btn');\n  var display = document.getElementById('digital-clock-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Digital Clock';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"digital-clock-app\">\n  <!-- Build Digital Clock (12-Hour Format) interface elements: Clock displaying HH:MM:SS AM/PM updating every second. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Digital Clock (12-Hour Format)\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Digital Clock (12-Hour Format)"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Digital Clock (12-Hour Format)"
      }
    ],
    "validationCriteria": [
      "Digital Clock (12-Hour Format)",
      "Digital Clock",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-mini-calc",
    "arena": "web_dev",
    "title": "Basic 4-Function Calculator",
    "description": "Two numeric inputs, 4 operation buttons (+, -, *, /), and result display.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Basic 4-Function Calculator",
    "targetComponentHtml": "<div id=\"mini-calc-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Basic 4-Function Calculator</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Two numeric inputs, 4 operation buttons (+, -, *, /), and result display.</p>\n  <div id=\"mini-calc-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"mini-calc-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('mini-calc-btn');\n  var display = document.getElementById('mini-calc-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Mini Calculator';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"mini-calc-app\">\n  <!-- Build Basic 4-Function Calculator interface elements: Two numeric inputs, 4 operation buttons (+, -, *, /), and result display. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Basic 4-Function Calculator\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Basic 4-Function Calculator"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Basic 4-Function Calculator"
      }
    ],
    "validationCriteria": [
      "Basic 4-Function Calculator",
      "Mini Calculator",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-name-filter",
    "arena": "web_dev",
    "title": "Dynamic Student Name Filter",
    "description": "Input that filters an unordered list of 10 student names as user types.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Dynamic Student Name Filter",
    "targetComponentHtml": "<div id=\"name-filter-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Dynamic Student Name Filter</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Input that filters an unordered list of 10 student names as user types.</p>\n  <div id=\"name-filter-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"name-filter-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('name-filter-btn');\n  var display = document.getElementById('name-filter-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Student Filter';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"name-filter-app\">\n  <!-- Build Dynamic Student Name Filter interface elements: Input that filters an unordered list of 10 student names as user types. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Dynamic Student Name Filter\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Dynamic Student Name Filter"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Dynamic Student Name Filter"
      }
    ],
    "validationCriteria": [
      "Dynamic Student Name Filter",
      "Student Filter",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-coin-dice",
    "arena": "web_dev",
    "title": "Coin Flip & Dice Roller",
    "description": "Button randomly picking Heads/Tails and updating win/loss tally.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Coin Flip & Dice Roller",
    "targetComponentHtml": "<div id=\"coin-dice-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Coin Flip & Dice Roller</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Button randomly picking Heads/Tails and updating win/loss tally.</p>\n  <div id=\"coin-dice-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"coin-dice-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('coin-dice-btn');\n  var display = document.getElementById('coin-dice-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Coin Flipper';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"coin-dice-app\">\n  <!-- Build Coin Flip & Dice Roller interface elements: Button randomly picking Heads/Tails and updating win/loss tally. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Coin Flip & Dice Roller\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Coin Flip & Dice Roller"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Coin Flip & Dice Roller"
      }
    ],
    "validationCriteria": [
      "Coin Flip & Dice Roller",
      "Coin Flipper",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-theme-toggle",
    "arena": "web_dev",
    "title": "Light & Dark Theme Toggler",
    "description": "Button toggling dark class on container and updating text.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Light & Dark Theme Toggler",
    "targetComponentHtml": "<div id=\"theme-toggle-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Light & Dark Theme Toggler</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Button toggling dark class on container and updating text.</p>\n  <div id=\"theme-toggle-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"theme-toggle-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('theme-toggle-btn');\n  var display = document.getElementById('theme-toggle-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Theme Toggler';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"theme-toggle-app\">\n  <!-- Build Light & Dark Theme Toggler interface elements: Button toggling dark class on container and updating text. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Light & Dark Theme Toggler\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Light & Dark Theme Toggler"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Light & Dark Theme Toggler"
      }
    ],
    "validationCriteria": [
      "Light & Dark Theme Toggler",
      "Theme Toggler",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-image-carousel",
    "arena": "web_dev",
    "title": "Simple 4-Image Carousel",
    "description": "Single image element with Prev and Next buttons cycling through array.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Simple 4-Image Carousel",
    "targetComponentHtml": "<div id=\"image-carousel-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Simple 4-Image Carousel</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Single image element with Prev and Next buttons cycling through array.</p>\n  <div id=\"image-carousel-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"image-carousel-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('image-carousel-btn');\n  var display = document.getElementById('image-carousel-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Image Carousel';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"image-carousel-app\">\n  <!-- Build Simple 4-Image Carousel interface elements: Single image element with Prev and Next buttons cycling through array. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Simple 4-Image Carousel\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Simple 4-Image Carousel"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Simple 4-Image Carousel"
      }
    ],
    "validationCriteria": [
      "Simple 4-Image Carousel",
      "Image Carousel",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-domain-val",
    "arena": "web_dev",
    "title": "Email Domain Campus Validator",
    "description": "Input checking if entered email ends with @college.edu.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Email Domain Campus Validator",
    "targetComponentHtml": "<div id=\"domain-val-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Email Domain Campus Validator</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Input checking if entered email ends with @college.edu.</p>\n  <div id=\"domain-val-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"domain-val-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('domain-val-btn');\n  var display = document.getElementById('domain-val-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Domain Validator';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"domain-val-app\">\n  <!-- Build Email Domain Campus Validator interface elements: Input checking if entered email ends with @college.edu. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Email Domain Campus Validator\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Email Domain Campus Validator"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Email Domain Campus Validator"
      }
    ],
    "validationCriteria": [
      "Email Domain Campus Validator",
      "Domain Validator",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-5m-tip-calc",
    "arena": "web_dev",
    "title": "Tip & Total Bill Calculator",
    "description": "Bill amount and tip percentage input calculating tip and final total.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Tip & Total Bill Calculator",
    "targetComponentHtml": "<div id=\"tip-calc-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Tip & Total Bill Calculator</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Bill amount and tip percentage input calculating tip and final total.</p>\n  <div id=\"tip-calc-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"tip-calc-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('tip-calc-btn');\n  var display = document.getElementById('tip-calc-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Tip Calculator';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"tip-calc-app\">\n  <!-- Build Tip & Total Bill Calculator interface elements: Bill amount and tip percentage input calculating tip and final total. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Tip & Total Bill Calculator\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Tip & Total Bill Calculator"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Tip & Total Bill Calculator"
      }
    ],
    "validationCriteria": [
      "Tip & Total Bill Calculator",
      "Tip Calculator",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-grade-tracker",
    "arena": "web_dev",
    "title": "Student Grade Tracker & Class Average",
    "description": "Form to add student name and score, calculating class average.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Student Grade Tracker & Class Average",
    "targetComponentHtml": "<div id=\"grade-tracker-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Student Grade Tracker & Class Average</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Form to add student name and score, calculating class average.</p>\n  <div id=\"grade-tracker-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"grade-tracker-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('grade-tracker-btn');\n  var display = document.getElementById('grade-tracker-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Grade Tracker';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"grade-tracker-app\">\n  <!-- Build Student Grade Tracker & Class Average interface elements: Form to add student name and score, calculating class average. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Student Grade Tracker & Class Average\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Student Grade Tracker & Class Average"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Student Grade Tracker & Class Average"
      }
    ],
    "validationCriteria": [
      "Student Grade Tracker & Class Average",
      "Grade Tracker",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-lap-stopwatch",
    "arena": "web_dev",
    "title": "Stopwatch with Lap Times",
    "description": "Stopwatch with Start, Pause, Reset, and Record Lap recording timestamps.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Stopwatch with Lap Times",
    "targetComponentHtml": "<div id=\"lap-stopwatch-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Stopwatch with Lap Times</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Stopwatch with Start, Pause, Reset, and Record Lap recording timestamps.</p>\n  <div id=\"lap-stopwatch-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"lap-stopwatch-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('lap-stopwatch-btn');\n  var display = document.getElementById('lap-stopwatch-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Lap Stopwatch';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"lap-stopwatch-app\">\n  <!-- Build Stopwatch with Lap Times interface elements: Stopwatch with Start, Pause, Reset, and Record Lap recording timestamps. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Stopwatch with Lap Times\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Stopwatch with Lap Times"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Stopwatch with Lap Times"
      }
    ],
    "validationCriteria": [
      "Stopwatch with Lap Times",
      "Lap Stopwatch",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-faq-accordion",
    "arena": "web_dev",
    "title": "Interactive FAQ Accordion",
    "description": "5 FAQ items where clicking one expands it and closes others.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Interactive FAQ Accordion",
    "targetComponentHtml": "<div id=\"faq-accordion-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Interactive FAQ Accordion</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">5 FAQ items where clicking one expands it and closes others.</p>\n  <div id=\"faq-accordion-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"faq-accordion-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('faq-accordion-btn');\n  var display = document.getElementById('faq-accordion-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'FAQ Accordion';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"faq-accordion-app\">\n  <!-- Build Interactive FAQ Accordion interface elements: 5 FAQ items where clicking one expands it and closes others. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Interactive FAQ Accordion\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Interactive FAQ Accordion"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Interactive FAQ Accordion"
      }
    ],
    "validationCriteria": [
      "Interactive FAQ Accordion",
      "FAQ Accordion",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-cart-counter",
    "arena": "web_dev",
    "title": "Shopping Cart Item Counter & Total",
    "description": "3 products with Add to Cart buttons updating itemized list and total.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Shopping Cart Item Counter & Total",
    "targetComponentHtml": "<div id=\"cart-counter-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Shopping Cart Item Counter & Total</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">3 products with Add to Cart buttons updating itemized list and total.</p>\n  <div id=\"cart-counter-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"cart-counter-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('cart-counter-btn');\n  var display = document.getElementById('cart-counter-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Cart Counter';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"cart-counter-app\">\n  <!-- Build Shopping Cart Item Counter & Total interface elements: 3 products with Add to Cart buttons updating itemized list and total. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Shopping Cart Item Counter & Total\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Shopping Cart Item Counter & Total"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Shopping Cart Item Counter & Total"
      }
    ],
    "validationCriteria": [
      "Shopping Cart Item Counter & Total",
      "Cart Counter",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-quiz-engine",
    "arena": "web_dev",
    "title": "Multiple-Choice Quiz Engine",
    "description": "3 questions displayed sequentially with instant score tally.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Multiple-Choice Quiz Engine",
    "targetComponentHtml": "<div id=\"quiz-engine-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Multiple-Choice Quiz Engine</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">3 questions displayed sequentially with instant score tally.</p>\n  <div id=\"quiz-engine-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"quiz-engine-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('quiz-engine-btn');\n  var display = document.getElementById('quiz-engine-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Quiz Engine';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"quiz-engine-app\">\n  <!-- Build Multiple-Choice Quiz Engine interface elements: 3 questions displayed sequentially with instant score tally. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Multiple-Choice Quiz Engine\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Multiple-Choice Quiz Engine"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Multiple-Choice Quiz Engine"
      }
    ],
    "validationCriteria": [
      "Multiple-Choice Quiz Engine",
      "Quiz Engine",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-cipher-tool",
    "arena": "web_dev",
    "title": "Text Caesar Cipher Encryptor",
    "description": "Tool shifting letters by +3 on click and reversing on decrypt.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Text Caesar Cipher Encryptor",
    "targetComponentHtml": "<div id=\"cipher-tool-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Text Caesar Cipher Encryptor</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Tool shifting letters by +3 on click and reversing on decrypt.</p>\n  <div id=\"cipher-tool-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"cipher-tool-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('cipher-tool-btn');\n  var display = document.getElementById('cipher-tool-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Cipher Tool';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"cipher-tool-app\">\n  <!-- Build Text Caesar Cipher Encryptor interface elements: Tool shifting letters by +3 on click and reversing on decrypt. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Text Caesar Cipher Encryptor\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Text Caesar Cipher Encryptor"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Text Caesar Cipher Encryptor"
      }
    ],
    "validationCriteria": [
      "Text Caesar Cipher Encryptor",
      "Cipher Tool",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-contact-book",
    "arena": "web_dev",
    "title": "Contact Directory with Search",
    "description": "Form to add contact name and number with live search filter.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Contact Directory with Search",
    "targetComponentHtml": "<div id=\"contact-book-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Contact Directory with Search</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Form to add contact name and number with live search filter.</p>\n  <div id=\"contact-book-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"contact-book-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('contact-book-btn');\n  var display = document.getElementById('contact-book-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Contact Directory';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"contact-book-app\">\n  <!-- Build Contact Directory with Search interface elements: Form to add contact name and number with live search filter. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Contact Directory with Search\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Contact Directory with Search"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Contact Directory with Search"
      }
    ],
    "validationCriteria": [
      "Contact Directory with Search",
      "Contact Directory",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-countdown-date",
    "arena": "web_dev",
    "title": "Countdown Timer to Date",
    "description": "Target date picker calculating remaining days, hours, and minutes.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Countdown Timer to Date",
    "targetComponentHtml": "<div id=\"countdown-date-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Countdown Timer to Date</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Target date picker calculating remaining days, hours, and minutes.</p>\n  <div id=\"countdown-date-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"countdown-date-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('countdown-date-btn');\n  var display = document.getElementById('countdown-date-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Countdown Timer';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"countdown-date-app\">\n  <!-- Build Countdown Timer to Date interface elements: Target date picker calculating remaining days, hours, and minutes. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Countdown Timer to Date\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Countdown Timer to Date"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Countdown Timer to Date"
      }
    ],
    "validationCriteria": [
      "Countdown Timer to Date",
      "Countdown Timer",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-expense-tracker",
    "arena": "web_dev",
    "title": "Expense Tracker with Categories",
    "description": "Add expenses with category select, displaying running balance.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expense Tracker with Categories",
    "targetComponentHtml": "<div id=\"expense-tracker-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Expense Tracker with Categories</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Add expenses with category select, displaying running balance.</p>\n  <div id=\"expense-tracker-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"expense-tracker-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('expense-tracker-btn');\n  var display = document.getElementById('expense-tracker-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Expense Tracker';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"expense-tracker-app\">\n  <!-- Build Expense Tracker with Categories interface elements: Add expenses with category select, displaying running balance. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Expense Tracker with Categories\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Expense Tracker with Categories"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Expense Tracker with Categories"
      }
    ],
    "validationCriteria": [
      "Expense Tracker with Categories",
      "Expense Tracker",
      "Trigger Action"
    ]
  },
  {
    "id": "html-js-hard-10m-form-validator",
    "arena": "web_dev",
    "title": "Form Validator with 4 Rules",
    "description": "Form checking username, email, matching passwords, and age.",
    "tags": [
      "html",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Form Validator with 4 Rules",
    "targetComponentHtml": "<div id=\"form-validator-app\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 8px;font-size:16px;color:#38bdf8;\">Form Validator with 4 Rules</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Form checking username, email, matching passwords, and age.</p>\n  <div id=\"form-validator-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-weight:bold;margin-bottom:10px;\">Status: Ready</div>\n  <button id=\"form-validator-btn\" style=\"padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;\">Trigger Action</button>\n</div>",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('form-validator-btn');\n  var display = document.getElementById('form-validator-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.textContent = 'Active: ' + 'Form Validator';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"form-validator-app\">\n  <!-- Build Form Validator with 4 Rules interface elements: Form checking username, email, matching passwords, and age. -->\n  \n</div>",
    "starterJs": "// Implement JavaScript logic for Form Validator with 4 Rules\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Form Validator with 4 Rules"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "JavaScript execution and event response for Form Validator with 4 Rules"
      }
    ],
    "validationCriteria": [
      "Form Validator with 4 Rules",
      "Form Validator",
      "Trigger Action"
    ]
  }
];
