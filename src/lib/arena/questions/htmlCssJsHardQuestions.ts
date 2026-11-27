import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * Calibrated KΛ ARENA Questions (30 items)
 * Designed for collegiate speed-coding with ~30 seconds margin to spare.
 */
export const HTML_CSS_JS_HARD_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "html-css-js-hard-3m-like-btn",
    "arena": "web_dev",
    "title": "Animated Heart Like Button",
    "description": "Heart button that animates scale, changes color to red, and increments counter.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Animated Heart Like Button",
    "targetComponentHtml": "<div id=\"like-btn-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Animated Heart Like Button</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Heart button that animates scale, changes color to red, and increments counter.</p>\n  <div id=\"like-btn-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Like Counter</strong>\n  </div>\n  <button id=\"like-btn-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#like-btn-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#like-btn-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#like-btn-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('like-btn-btn');\n  var display = document.getElementById('like-btn-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Like Counter)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"like-btn-widget\">\n  <!-- Build Animated Heart Like Button interface: Heart button that animates scale, changes color to red, and increments counter. -->\n  \n</div>",
    "starterCss": "/* Build styling for Animated Heart Like Button */\n#like-btn-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Animated Heart Like Button\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Animated Heart Like Button"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Animated Heart Like Button"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Animated Heart Like Button"
      }
    ],
    "validationCriteria": [
      "Animated Heart Like Button",
      "Like Counter",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-dark-toggle",
    "arena": "web_dev",
    "title": "Dark Mode Theme Toggle Switch",
    "description": "Pill switch toggling dark/light variables on container.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Dark Mode Theme Toggle Switch",
    "targetComponentHtml": "<div id=\"dark-toggle-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Dark Mode Theme Toggle Switch</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Pill switch toggling dark/light variables on container.</p>\n  <div id=\"dark-toggle-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Theme Switch</strong>\n  </div>\n  <button id=\"dark-toggle-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#dark-toggle-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#dark-toggle-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#dark-toggle-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('dark-toggle-btn');\n  var display = document.getElementById('dark-toggle-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Theme Switch)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"dark-toggle-widget\">\n  <!-- Build Dark Mode Theme Toggle Switch interface: Pill switch toggling dark/light variables on container. -->\n  \n</div>",
    "starterCss": "/* Build styling for Dark Mode Theme Toggle Switch */\n#dark-toggle-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Dark Mode Theme Toggle Switch\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Dark Mode Theme Toggle Switch"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Dark Mode Theme Toggle Switch"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Dark Mode Theme Toggle Switch"
      }
    ],
    "validationCriteria": [
      "Dark Mode Theme Toggle Switch",
      "Theme Switch",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-toast-dismiss",
    "arena": "web_dev",
    "title": "Toast Notification Dismiss Card",
    "description": "Notification toast sliding in from right and auto-dismissing on close.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Toast Notification Dismiss Card",
    "targetComponentHtml": "<div id=\"toast-dismiss-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Toast Notification Dismiss Card</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Notification toast sliding in from right and auto-dismissing on close.</p>\n  <div id=\"toast-dismiss-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Notification Toast</strong>\n  </div>\n  <button id=\"toast-dismiss-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#toast-dismiss-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#toast-dismiss-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#toast-dismiss-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('toast-dismiss-btn');\n  var display = document.getElementById('toast-dismiss-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Notification Toast)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"toast-dismiss-widget\">\n  <!-- Build Toast Notification Dismiss Card interface: Notification toast sliding in from right and auto-dismissing on close. -->\n  \n</div>",
    "starterCss": "/* Build styling for Toast Notification Dismiss Card */\n#toast-dismiss-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Toast Notification Dismiss Card\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Toast Notification Dismiss Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Toast Notification Dismiss Card"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Toast Notification Dismiss Card"
      }
    ],
    "validationCriteria": [
      "Toast Notification Dismiss Card",
      "Notification Toast",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-accordion-drawer",
    "arena": "web_dev",
    "title": "Interactive Accordion Drawer",
    "description": "Clean styled accordion sliding open body text on header click.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Interactive Accordion Drawer",
    "targetComponentHtml": "<div id=\"accordion-drawer-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Interactive Accordion Drawer</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Clean styled accordion sliding open body text on header click.</p>\n  <div id=\"accordion-drawer-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Accordion Drawer</strong>\n  </div>\n  <button id=\"accordion-drawer-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#accordion-drawer-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#accordion-drawer-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#accordion-drawer-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('accordion-drawer-btn');\n  var display = document.getElementById('accordion-drawer-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Accordion Drawer)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"accordion-drawer-widget\">\n  <!-- Build Interactive Accordion Drawer interface: Clean styled accordion sliding open body text on header click. -->\n  \n</div>",
    "starterCss": "/* Build styling for Interactive Accordion Drawer */\n#accordion-drawer-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Interactive Accordion Drawer\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Interactive Accordion Drawer"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Interactive Accordion Drawer"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Interactive Accordion Drawer"
      }
    ],
    "validationCriteria": [
      "Interactive Accordion Drawer",
      "Accordion Drawer",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-palette-card",
    "arena": "web_dev",
    "title": "Card Color Palette Swatch",
    "description": "3 color buttons dynamically changing card primary accent.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Card Color Palette Swatch",
    "targetComponentHtml": "<div id=\"palette-card-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Card Color Palette Swatch</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">3 color buttons dynamically changing card primary accent.</p>\n  <div id=\"palette-card-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Color Swatch</strong>\n  </div>\n  <button id=\"palette-card-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#palette-card-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#palette-card-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#palette-card-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('palette-card-btn');\n  var display = document.getElementById('palette-card-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Color Swatch)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"palette-card-widget\">\n  <!-- Build Card Color Palette Swatch interface: 3 color buttons dynamically changing card primary accent. -->\n  \n</div>",
    "starterCss": "/* Build styling for Card Color Palette Swatch */\n#palette-card-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Card Color Palette Swatch\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Card Color Palette Swatch"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Card Color Palette Swatch"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Card Color Palette Swatch"
      }
    ],
    "validationCriteria": [
      "Card Color Palette Swatch",
      "Color Swatch",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-char-limit",
    "arena": "web_dev",
    "title": "Live Character Limit Shake Card",
    "description": "Card adding shake animation and red text when approaching limit.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Live Character Limit Shake Card",
    "targetComponentHtml": "<div id=\"char-limit-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Live Character Limit Shake Card</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Card adding shake animation and red text when approaching limit.</p>\n  <div id=\"char-limit-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Character Limit</strong>\n  </div>\n  <button id=\"char-limit-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#char-limit-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#char-limit-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#char-limit-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('char-limit-btn');\n  var display = document.getElementById('char-limit-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Character Limit)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"char-limit-widget\">\n  <!-- Build Live Character Limit Shake Card interface: Card adding shake animation and red text when approaching limit. -->\n  \n</div>",
    "starterCss": "/* Build styling for Live Character Limit Shake Card */\n#char-limit-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Live Character Limit Shake Card\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Live Character Limit Shake Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Live Character Limit Shake Card"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Live Character Limit Shake Card"
      }
    ],
    "validationCriteria": [
      "Live Character Limit Shake Card",
      "Character Limit",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-modal-fade",
    "arena": "web_dev",
    "title": "Modal Popup Dialog with Fade",
    "description": "Modal overlay fading in on button click and fading out on close.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Modal Popup Dialog with Fade",
    "targetComponentHtml": "<div id=\"modal-fade-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Modal Popup Dialog with Fade</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Modal overlay fading in on button click and fading out on close.</p>\n  <div id=\"modal-fade-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Modal Dialog</strong>\n  </div>\n  <button id=\"modal-fade-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#modal-fade-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#modal-fade-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#modal-fade-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('modal-fade-btn');\n  var display = document.getElementById('modal-fade-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Modal Dialog)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"modal-fade-widget\">\n  <!-- Build Modal Popup Dialog with Fade interface: Modal overlay fading in on button click and fading out on close. -->\n  \n</div>",
    "starterCss": "/* Build styling for Modal Popup Dialog with Fade */\n#modal-fade-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Modal Popup Dialog with Fade\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Modal Popup Dialog with Fade"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Modal Popup Dialog with Fade"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Modal Popup Dialog with Fade"
      }
    ],
    "validationCriteria": [
      "Modal Popup Dialog with Fade",
      "Modal Dialog",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-star-rating",
    "arena": "web_dev",
    "title": "Star Rating Widget with Hover",
    "description": "5 gold stars lighting up on hover and locking in on click.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Star Rating Widget with Hover",
    "targetComponentHtml": "<div id=\"star-rating-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Star Rating Widget with Hover</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">5 gold stars lighting up on hover and locking in on click.</p>\n  <div id=\"star-rating-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Star Rating</strong>\n  </div>\n  <button id=\"star-rating-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#star-rating-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#star-rating-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#star-rating-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('star-rating-btn');\n  var display = document.getElementById('star-rating-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Star Rating)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"star-rating-widget\">\n  <!-- Build Star Rating Widget with Hover interface: 5 gold stars lighting up on hover and locking in on click. -->\n  \n</div>",
    "starterCss": "/* Build styling for Star Rating Widget with Hover */\n#star-rating-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Star Rating Widget with Hover\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Star Rating Widget with Hover"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Star Rating Widget with Hover"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Star Rating Widget with Hover"
      }
    ],
    "validationCriteria": [
      "Star Rating Widget with Hover",
      "Star Rating",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-copy-snippet",
    "arena": "web_dev",
    "title": "Copy Code Snippet Card",
    "description": "Code box with Copy Code button changing to green Copied checkmark.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Copy Code Snippet Card",
    "targetComponentHtml": "<div id=\"copy-snippet-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Copy Code Snippet Card</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Code box with Copy Code button changing to green Copied checkmark.</p>\n  <div id=\"copy-snippet-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Copy Snippet</strong>\n  </div>\n  <button id=\"copy-snippet-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#copy-snippet-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#copy-snippet-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#copy-snippet-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('copy-snippet-btn');\n  var display = document.getElementById('copy-snippet-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Copy Snippet)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"copy-snippet-widget\">\n  <!-- Build Copy Code Snippet Card interface: Code box with Copy Code button changing to green Copied checkmark. -->\n  \n</div>",
    "starterCss": "/* Build styling for Copy Code Snippet Card */\n#copy-snippet-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Copy Code Snippet Card\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Copy Code Snippet Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Copy Code Snippet Card"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Copy Code Snippet Card"
      }
    ],
    "validationCriteria": [
      "Copy Code Snippet Card",
      "Copy Snippet",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-3m-countup-card",
    "arena": "web_dev",
    "title": "Countup Metric Progress Card",
    "description": "Dashboard metric smoothly animating counter from 0 to 100 on load.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Countup Metric Progress Card",
    "targetComponentHtml": "<div id=\"countup-card-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Countup Metric Progress Card</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Dashboard metric smoothly animating counter from 0 to 100 on load.</p>\n  <div id=\"countup-card-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Metric Countup</strong>\n  </div>\n  <button id=\"countup-card-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#countup-card-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#countup-card-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#countup-card-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('countup-card-btn');\n  var display = document.getElementById('countup-card-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Metric Countup)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"countup-card-widget\">\n  <!-- Build Countup Metric Progress Card interface: Dashboard metric smoothly animating counter from 0 to 100 on load. -->\n  \n</div>",
    "starterCss": "/* Build styling for Countup Metric Progress Card */\n#countup-card-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Countup Metric Progress Card\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Countup Metric Progress Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Countup Metric Progress Card"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Countup Metric Progress Card"
      }
    ],
    "validationCriteria": [
      "Countup Metric Progress Card",
      "Metric Countup",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-tier-calc",
    "arena": "web_dev",
    "title": "Interactive Pricing Tier Calculator",
    "description": "Card with monthly/annual toggle and slider updating price.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Interactive Pricing Tier Calculator",
    "targetComponentHtml": "<div id=\"tier-calc-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Interactive Pricing Tier Calculator</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Card with monthly/annual toggle and slider updating price.</p>\n  <div id=\"tier-calc-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Tier Calculator</strong>\n  </div>\n  <button id=\"tier-calc-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#tier-calc-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#tier-calc-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#tier-calc-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('tier-calc-btn');\n  var display = document.getElementById('tier-calc-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Tier Calculator)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"tier-calc-widget\">\n  <!-- Build Interactive Pricing Tier Calculator interface: Card with monthly/annual toggle and slider updating price. -->\n  \n</div>",
    "starterCss": "/* Build styling for Interactive Pricing Tier Calculator */\n#tier-calc-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Interactive Pricing Tier Calculator\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Interactive Pricing Tier Calculator"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Interactive Pricing Tier Calculator"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Interactive Pricing Tier Calculator"
      }
    ],
    "validationCriteria": [
      "Interactive Pricing Tier Calculator",
      "Tier Calculator",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-todo-strike",
    "arena": "web_dev",
    "title": "Simple Todo App with Strike-through",
    "description": "Todo widget with input, strike-through checkbox, and delete.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Simple Todo App with Strike-through",
    "targetComponentHtml": "<div id=\"todo-strike-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Simple Todo App with Strike-through</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Todo widget with input, strike-through checkbox, and delete.</p>\n  <div id=\"todo-strike-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Todo Manager</strong>\n  </div>\n  <button id=\"todo-strike-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#todo-strike-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#todo-strike-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#todo-strike-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('todo-strike-btn');\n  var display = document.getElementById('todo-strike-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Todo Manager)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"todo-strike-widget\">\n  <!-- Build Simple Todo App with Strike-through interface: Todo widget with input, strike-through checkbox, and delete. -->\n  \n</div>",
    "starterCss": "/* Build styling for Simple Todo App with Strike-through */\n#todo-strike-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Simple Todo App with Strike-through\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Simple Todo App with Strike-through"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Simple Todo App with Strike-through"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Simple Todo App with Strike-through"
      }
    ],
    "validationCriteria": [
      "Simple Todo App with Strike-through",
      "Todo Manager",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-carousel-dots",
    "arena": "web_dev",
    "title": "Carousel Slider with Dot Indicators",
    "description": "Card slider with prev/next arrows and active dot indicator.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Carousel Slider with Dot Indicators",
    "targetComponentHtml": "<div id=\"carousel-dots-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Carousel Slider with Dot Indicators</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Card slider with prev/next arrows and active dot indicator.</p>\n  <div id=\"carousel-dots-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Carousel Slider</strong>\n  </div>\n  <button id=\"carousel-dots-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#carousel-dots-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#carousel-dots-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#carousel-dots-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('carousel-dots-btn');\n  var display = document.getElementById('carousel-dots-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Carousel Slider)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"carousel-dots-widget\">\n  <!-- Build Carousel Slider with Dot Indicators interface: Card slider with prev/next arrows and active dot indicator. -->\n  \n</div>",
    "starterCss": "/* Build styling for Carousel Slider with Dot Indicators */\n#carousel-dots-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Carousel Slider with Dot Indicators\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Carousel Slider with Dot Indicators"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Carousel Slider with Dot Indicators"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Carousel Slider with Dot Indicators"
      }
    ],
    "validationCriteria": [
      "Carousel Slider with Dot Indicators",
      "Carousel Slider",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-cookie-banner",
    "arena": "web_dev",
    "title": "Interactive Cookie Consent Banner",
    "description": "Bottom banner with Accept/Decline buttons sliding away smoothly.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Interactive Cookie Consent Banner",
    "targetComponentHtml": "<div id=\"cookie-banner-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Interactive Cookie Consent Banner</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Bottom banner with Accept/Decline buttons sliding away smoothly.</p>\n  <div id=\"cookie-banner-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Cookie Consent</strong>\n  </div>\n  <button id=\"cookie-banner-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#cookie-banner-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#cookie-banner-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#cookie-banner-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('cookie-banner-btn');\n  var display = document.getElementById('cookie-banner-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Cookie Consent)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"cookie-banner-widget\">\n  <!-- Build Interactive Cookie Consent Banner interface: Bottom banner with Accept/Decline buttons sliding away smoothly. -->\n  \n</div>",
    "starterCss": "/* Build styling for Interactive Cookie Consent Banner */\n#cookie-banner-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Interactive Cookie Consent Banner\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Interactive Cookie Consent Banner"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Interactive Cookie Consent Banner"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Interactive Cookie Consent Banner"
      }
    ],
    "validationCriteria": [
      "Interactive Cookie Consent Banner",
      "Cookie Consent",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-pwd-generator",
    "arena": "web_dev",
    "title": "Password Generator Widget",
    "description": "Card with length slider, symbols checkbox, and copy button.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Password Generator Widget",
    "targetComponentHtml": "<div id=\"pwd-generator-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Password Generator Widget</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Card with length slider, symbols checkbox, and copy button.</p>\n  <div id=\"pwd-generator-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Password Generator</strong>\n  </div>\n  <button id=\"pwd-generator-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#pwd-generator-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#pwd-generator-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#pwd-generator-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('pwd-generator-btn');\n  var display = document.getElementById('pwd-generator-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Password Generator)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"pwd-generator-widget\">\n  <!-- Build Password Generator Widget interface: Card with length slider, symbols checkbox, and copy button. -->\n  \n</div>",
    "starterCss": "/* Build styling for Password Generator Widget */\n#pwd-generator-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Password Generator Widget\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Password Generator Widget"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Password Generator Widget"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Password Generator Widget"
      }
    ],
    "validationCriteria": [
      "Password Generator Widget",
      "Password Generator",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-stopwatch-glow",
    "arena": "web_dev",
    "title": "Digital Stopwatch with Glow",
    "description": "Monospace digital timer with glowing start, pause, and reset.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Digital Stopwatch with Glow",
    "targetComponentHtml": "<div id=\"stopwatch-glow-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Digital Stopwatch with Glow</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Monospace digital timer with glowing start, pause, and reset.</p>\n  <div id=\"stopwatch-glow-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Stopwatch Timer</strong>\n  </div>\n  <button id=\"stopwatch-glow-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#stopwatch-glow-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#stopwatch-glow-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#stopwatch-glow-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('stopwatch-glow-btn');\n  var display = document.getElementById('stopwatch-glow-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Stopwatch Timer)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"stopwatch-glow-widget\">\n  <!-- Build Digital Stopwatch with Glow interface: Monospace digital timer with glowing start, pause, and reset. -->\n  \n</div>",
    "starterCss": "/* Build styling for Digital Stopwatch with Glow */\n#stopwatch-glow-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Digital Stopwatch with Glow\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Digital Stopwatch with Glow"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Digital Stopwatch with Glow"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Digital Stopwatch with Glow"
      }
    ],
    "validationCriteria": [
      "Digital Stopwatch with Glow",
      "Stopwatch Timer",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-country-dropdown",
    "arena": "web_dev",
    "title": "Searchable Country Dropdown",
    "description": "Input revealing dropdown list filtering countries as user types.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Searchable Country Dropdown",
    "targetComponentHtml": "<div id=\"country-dropdown-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Searchable Country Dropdown</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Input revealing dropdown list filtering countries as user types.</p>\n  <div id=\"country-dropdown-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Country Dropdown</strong>\n  </div>\n  <button id=\"country-dropdown-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#country-dropdown-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#country-dropdown-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#country-dropdown-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('country-dropdown-btn');\n  var display = document.getElementById('country-dropdown-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Country Dropdown)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"country-dropdown-widget\">\n  <!-- Build Searchable Country Dropdown interface: Input revealing dropdown list filtering countries as user types. -->\n  \n</div>",
    "starterCss": "/* Build styling for Searchable Country Dropdown */\n#country-dropdown-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Searchable Country Dropdown\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Searchable Country Dropdown"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Searchable Country Dropdown"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Searchable Country Dropdown"
      }
    ],
    "validationCriteria": [
      "Searchable Country Dropdown",
      "Country Dropdown",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-tabbed-profile",
    "arena": "web_dev",
    "title": "Tabbed Profile Summary Card",
    "description": "Profile with About, Skills, and Projects tabs with slide animation.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Tabbed Profile Summary Card",
    "targetComponentHtml": "<div id=\"tabbed-profile-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Tabbed Profile Summary Card</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Profile with About, Skills, and Projects tabs with slide animation.</p>\n  <div id=\"tabbed-profile-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Profile Tabs</strong>\n  </div>\n  <button id=\"tabbed-profile-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#tabbed-profile-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#tabbed-profile-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#tabbed-profile-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('tabbed-profile-btn');\n  var display = document.getElementById('tabbed-profile-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Profile Tabs)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"tabbed-profile-widget\">\n  <!-- Build Tabbed Profile Summary Card interface: Profile with About, Skills, and Projects tabs with slide animation. -->\n  \n</div>",
    "starterCss": "/* Build styling for Tabbed Profile Summary Card */\n#tabbed-profile-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Tabbed Profile Summary Card\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Tabbed Profile Summary Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Tabbed Profile Summary Card"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Tabbed Profile Summary Card"
      }
    ],
    "validationCriteria": [
      "Tabbed Profile Summary Card",
      "Profile Tabs",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-quiz-card",
    "arena": "web_dev",
    "title": "Interactive Flashcard Quiz Card",
    "description": "Card with 4 option buttons highlighting green or red on click.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Interactive Flashcard Quiz Card",
    "targetComponentHtml": "<div id=\"quiz-card-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Interactive Flashcard Quiz Card</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Card with 4 option buttons highlighting green or red on click.</p>\n  <div id=\"quiz-card-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Quiz Card</strong>\n  </div>\n  <button id=\"quiz-card-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#quiz-card-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#quiz-card-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#quiz-card-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('quiz-card-btn');\n  var display = document.getElementById('quiz-card-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Quiz Card)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"quiz-card-widget\">\n  <!-- Build Interactive Flashcard Quiz Card interface: Card with 4 option buttons highlighting green or red on click. -->\n  \n</div>",
    "starterCss": "/* Build styling for Interactive Flashcard Quiz Card */\n#quiz-card-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Interactive Flashcard Quiz Card\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Interactive Flashcard Quiz Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Interactive Flashcard Quiz Card"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Interactive Flashcard Quiz Card"
      }
    ],
    "validationCriteria": [
      "Interactive Flashcard Quiz Card",
      "Quiz Card",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-5m-cart-stepper",
    "arena": "web_dev",
    "title": "Shopping Cart Item Quantity Stepper",
    "description": "Product card with + and - steppers recalculating subtotal with tax.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Shopping Cart Item Quantity Stepper",
    "targetComponentHtml": "<div id=\"cart-stepper-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Shopping Cart Item Quantity Stepper</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Product card with + and - steppers recalculating subtotal with tax.</p>\n  <div id=\"cart-stepper-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Cart Stepper</strong>\n  </div>\n  <button id=\"cart-stepper-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#cart-stepper-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#cart-stepper-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#cart-stepper-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('cart-stepper-btn');\n  var display = document.getElementById('cart-stepper-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Cart Stepper)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"cart-stepper-widget\">\n  <!-- Build Shopping Cart Item Quantity Stepper interface: Product card with + and - steppers recalculating subtotal with tax. -->\n  \n</div>",
    "starterCss": "/* Build styling for Shopping Cart Item Quantity Stepper */\n#cart-stepper-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Shopping Cart Item Quantity Stepper\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Shopping Cart Item Quantity Stepper"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Shopping Cart Item Quantity Stepper"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Shopping Cart Item Quantity Stepper"
      }
    ],
    "validationCriteria": [
      "Shopping Cart Item Quantity Stepper",
      "Cart Stepper",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-pomodoro-clock",
    "arena": "web_dev",
    "title": "Complete Pomodoro Productivity Clock",
    "description": "Circular countdown with 25m Work and 5m Break modes with chimes.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Complete Pomodoro Productivity Clock",
    "targetComponentHtml": "<div id=\"pomodoro-clock-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Complete Pomodoro Productivity Clock</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Circular countdown with 25m Work and 5m Break modes with chimes.</p>\n  <div id=\"pomodoro-clock-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Pomodoro Timer</strong>\n  </div>\n  <button id=\"pomodoro-clock-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#pomodoro-clock-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#pomodoro-clock-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#pomodoro-clock-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('pomodoro-clock-btn');\n  var display = document.getElementById('pomodoro-clock-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Pomodoro Timer)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"pomodoro-clock-widget\">\n  <!-- Build Complete Pomodoro Productivity Clock interface: Circular countdown with 25m Work and 5m Break modes with chimes. -->\n  \n</div>",
    "starterCss": "/* Build styling for Complete Pomodoro Productivity Clock */\n#pomodoro-clock-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Complete Pomodoro Productivity Clock\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Complete Pomodoro Productivity Clock"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Complete Pomodoro Productivity Clock"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Complete Pomodoro Productivity Clock"
      }
    ],
    "validationCriteria": [
      "Complete Pomodoro Productivity Clock",
      "Pomodoro Timer",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-expense-bar",
    "arena": "web_dev",
    "title": "Expense Tracker with Visual Bar",
    "description": "Form to add expenses, itemized list, and colored proportional bar.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expense Tracker with Visual Bar",
    "targetComponentHtml": "<div id=\"expense-bar-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Expense Tracker with Visual Bar</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Form to add expenses, itemized list, and colored proportional bar.</p>\n  <div id=\"expense-bar-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Expense Tracker</strong>\n  </div>\n  <button id=\"expense-bar-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#expense-bar-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#expense-bar-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#expense-bar-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('expense-bar-btn');\n  var display = document.getElementById('expense-bar-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Expense Tracker)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"expense-bar-widget\">\n  <!-- Build Expense Tracker with Visual Bar interface: Form to add expenses, itemized list, and colored proportional bar. -->\n  \n</div>",
    "starterCss": "/* Build styling for Expense Tracker with Visual Bar */\n#expense-bar-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Expense Tracker with Visual Bar\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Expense Tracker with Visual Bar"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Expense Tracker with Visual Bar"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Expense Tracker with Visual Bar"
      }
    ],
    "validationCriteria": [
      "Expense Tracker with Visual Bar",
      "Expense Tracker",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-flashcard-3d",
    "arena": "web_dev",
    "title": "Interactive 3D Flashcard Study Deck",
    "description": "3D flipping card with question on front, answer on back, and deck nav.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Interactive 3D Flashcard Study Deck",
    "targetComponentHtml": "<div id=\"flashcard-3d-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Interactive 3D Flashcard Study Deck</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">3D flipping card with question on front, answer on back, and deck nav.</p>\n  <div id=\"flashcard-3d-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Study Deck</strong>\n  </div>\n  <button id=\"flashcard-3d-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#flashcard-3d-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#flashcard-3d-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#flashcard-3d-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('flashcard-3d-btn');\n  var display = document.getElementById('flashcard-3d-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Study Deck)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"flashcard-3d-widget\">\n  <!-- Build Interactive 3D Flashcard Study Deck interface: 3D flipping card with question on front, answer on back, and deck nav. -->\n  \n</div>",
    "starterCss": "/* Build styling for Interactive 3D Flashcard Study Deck */\n#flashcard-3d-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Interactive 3D Flashcard Study Deck\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Interactive 3D Flashcard Study Deck"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Interactive 3D Flashcard Study Deck"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Interactive 3D Flashcard Study Deck"
      }
    ],
    "validationCriteria": [
      "Interactive 3D Flashcard Study Deck",
      "Study Deck",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-weather-widget",
    "arena": "web_dev",
    "title": "Weather Forecast Card Widget",
    "description": "Current temperature, condition icon, 5-day forecast, and \u00b0C/\u00b0F toggle.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Weather Forecast Card Widget",
    "targetComponentHtml": "<div id=\"weather-widget-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Weather Forecast Card Widget</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Current temperature, condition icon, 5-day forecast, and \u00b0C/\u00b0F toggle.</p>\n  <div id=\"weather-widget-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Weather Widget</strong>\n  </div>\n  <button id=\"weather-widget-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#weather-widget-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#weather-widget-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#weather-widget-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('weather-widget-btn');\n  var display = document.getElementById('weather-widget-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Weather Widget)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"weather-widget-widget\">\n  <!-- Build Weather Forecast Card Widget interface: Current temperature, condition icon, 5-day forecast, and \u00b0C/\u00b0F toggle. -->\n  \n</div>",
    "starterCss": "/* Build styling for Weather Forecast Card Widget */\n#weather-widget-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Weather Forecast Card Widget\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Weather Forecast Card Widget"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Weather Forecast Card Widget"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Weather Forecast Card Widget"
      }
    ],
    "validationCriteria": [
      "Weather Forecast Card Widget",
      "Weather Widget",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-tip-split",
    "arena": "web_dev",
    "title": "Interactive Tip Calculator with Split",
    "description": "Bill input, preset tip % buttons, split stepper, and total per person.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Interactive Tip Calculator with Split",
    "targetComponentHtml": "<div id=\"tip-split-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Interactive Tip Calculator with Split</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Bill input, preset tip % buttons, split stepper, and total per person.</p>\n  <div id=\"tip-split-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Tip Calculator</strong>\n  </div>\n  <button id=\"tip-split-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#tip-split-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#tip-split-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#tip-split-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('tip-split-btn');\n  var display = document.getElementById('tip-split-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Tip Calculator)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"tip-split-widget\">\n  <!-- Build Interactive Tip Calculator with Split interface: Bill input, preset tip % buttons, split stepper, and total per person. -->\n  \n</div>",
    "starterCss": "/* Build styling for Interactive Tip Calculator with Split */\n#tip-split-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Interactive Tip Calculator with Split\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Interactive Tip Calculator with Split"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Interactive Tip Calculator with Split"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Interactive Tip Calculator with Split"
      }
    ],
    "validationCriteria": [
      "Interactive Tip Calculator with Split",
      "Tip Calculator",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-music-waveform",
    "arena": "web_dev",
    "title": "Music Player Controller with Waveform",
    "description": "Player with album art, waveform bars, scrub seek, and play/pause.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Music Player Controller with Waveform",
    "targetComponentHtml": "<div id=\"music-waveform-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Music Player Controller with Waveform</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Player with album art, waveform bars, scrub seek, and play/pause.</p>\n  <div id=\"music-waveform-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Music Player</strong>\n  </div>\n  <button id=\"music-waveform-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#music-waveform-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#music-waveform-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#music-waveform-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('music-waveform-btn');\n  var display = document.getElementById('music-waveform-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Music Player)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"music-waveform-widget\">\n  <!-- Build Music Player Controller with Waveform interface: Player with album art, waveform bars, scrub seek, and play/pause. -->\n  \n</div>",
    "starterCss": "/* Build styling for Music Player Controller with Waveform */\n#music-waveform-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Music Player Controller with Waveform\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Music Player Controller with Waveform"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Music Player Controller with Waveform"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Music Player Controller with Waveform"
      }
    ],
    "validationCriteria": [
      "Music Player Controller with Waveform",
      "Music Player",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-memory-game",
    "arena": "web_dev",
    "title": "Memory Tile Match Game (3x4)",
    "description": "12 tiles where clicking reveals icons and matches stay open.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Memory Tile Match Game (3x4)",
    "targetComponentHtml": "<div id=\"memory-game-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Memory Tile Match Game (3x4)</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">12 tiles where clicking reveals icons and matches stay open.</p>\n  <div id=\"memory-game-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Memory Game</strong>\n  </div>\n  <button id=\"memory-game-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#memory-game-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#memory-game-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#memory-game-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('memory-game-btn');\n  var display = document.getElementById('memory-game-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Memory Game)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"memory-game-widget\">\n  <!-- Build Memory Tile Match Game (3x4) interface: 12 tiles where clicking reveals icons and matches stay open. -->\n  \n</div>",
    "starterCss": "/* Build styling for Memory Tile Match Game (3x4) */\n#memory-game-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Memory Tile Match Game (3x4)\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Memory Tile Match Game (3x4)"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Memory Tile Match Game (3x4)"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Memory Tile Match Game (3x4)"
      }
    ],
    "validationCriteria": [
      "Memory Tile Match Game (3x4)",
      "Memory Game",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-attendance-checker",
    "arena": "web_dev",
    "title": "Student Attendance Roster Checker",
    "description": "Table with Present/Absent toggle switches and live percentage badge.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Student Attendance Roster Checker",
    "targetComponentHtml": "<div id=\"attendance-checker-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Student Attendance Roster Checker</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Table with Present/Absent toggle switches and live percentage badge.</p>\n  <div id=\"attendance-checker-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Attendance Roster</strong>\n  </div>\n  <button id=\"attendance-checker-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#attendance-checker-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#attendance-checker-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#attendance-checker-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('attendance-checker-btn');\n  var display = document.getElementById('attendance-checker-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Attendance Roster)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"attendance-checker-widget\">\n  <!-- Build Student Attendance Roster Checker interface: Table with Present/Absent toggle switches and live percentage badge. -->\n  \n</div>",
    "starterCss": "/* Build styling for Student Attendance Roster Checker */\n#attendance-checker-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Student Attendance Roster Checker\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Student Attendance Roster Checker"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Student Attendance Roster Checker"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Student Attendance Roster Checker"
      }
    ],
    "validationCriteria": [
      "Student Attendance Roster Checker",
      "Attendance Roster",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-recipe-scaler",
    "arena": "web_dev",
    "title": "Recipe Ingredient Scaler Widget",
    "description": "Recipe card with serving size stepper recalculating all amounts.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Recipe Ingredient Scaler Widget",
    "targetComponentHtml": "<div id=\"recipe-scaler-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Recipe Ingredient Scaler Widget</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Recipe card with serving size stepper recalculating all amounts.</p>\n  <div id=\"recipe-scaler-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Recipe Scaler</strong>\n  </div>\n  <button id=\"recipe-scaler-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#recipe-scaler-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#recipe-scaler-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#recipe-scaler-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('recipe-scaler-btn');\n  var display = document.getElementById('recipe-scaler-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Recipe Scaler)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"recipe-scaler-widget\">\n  <!-- Build Recipe Ingredient Scaler Widget interface: Recipe card with serving size stepper recalculating all amounts. -->\n  \n</div>",
    "starterCss": "/* Build styling for Recipe Ingredient Scaler Widget */\n#recipe-scaler-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Recipe Ingredient Scaler Widget\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Recipe Ingredient Scaler Widget"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Recipe Ingredient Scaler Widget"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Recipe Ingredient Scaler Widget"
      }
    ],
    "validationCriteria": [
      "Recipe Ingredient Scaler Widget",
      "Recipe Scaler",
      "Activate Feature"
    ]
  },
  {
    "id": "html-css-js-hard-10m-grid-calc",
    "arena": "web_dev",
    "title": "Interactive Grid Screen Calculator",
    "description": "Full calculator with 0-9 digits, operators, clear, and decimal math.",
    "tags": [
      "html",
      "css",
      "javascript"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Interactive Grid Screen Calculator",
    "targetComponentHtml": "<div id=\"grid-calc-widget\">\n  <h3 style=\"margin:0 0 6px;font-size:16px;color:#38bdf8;\">Interactive Grid Screen Calculator</h3>\n  <p style=\"margin:0 0 12px;font-size:12px;color:#94a3b8;\">Full calculator with 0-9 digits, operators, clear, and decimal math.</p>\n  <div id=\"grid-calc-display\" style=\"padding:10px;background:#1e293b;border-radius:8px;font-size:13px;margin-bottom:12px;\">\n    Current Value: <strong style=\"color:#facc15;\">Grid Calculator</strong>\n  </div>\n  <button id=\"grid-calc-btn\">Activate Feature</button>\n</div>",
    "targetComponentCss": "#grid-calc-widget {\n  padding: 18px;\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 12px;\n  color: #fff;\n  font-family: sans-serif;\n  max-width: 380px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n}\n#grid-calc-btn {\n  padding: 8px 16px;\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n#grid-calc-btn:hover {\n  background: #0369a1;\n}",
    "targetComponentJs": "(function() {\n  var btn = document.getElementById('grid-calc-btn');\n  var display = document.getElementById('grid-calc-display');\n  if (btn && display) {\n    btn.onclick = function() {\n      display.innerHTML = 'Status: <strong style=\"color:#22c55e;\">Completed (Grid Calculator)</strong>';\n    };\n  }\n})();",
    "starterHtml": "<div id=\"grid-calc-widget\">\n  <!-- Build Interactive Grid Screen Calculator interface: Full calculator with 0-9 digits, operators, clear, and decimal math. -->\n  \n</div>",
    "starterCss": "/* Build styling for Interactive Grid Screen Calculator */\n#grid-calc-widget {\n  /* Your styles here */\n}",
    "starterJs": "// Build interactivity for Interactive Grid Screen Calculator\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Markup structure for Interactive Grid Screen Calculator"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout styling for Interactive Grid Screen Calculator"
      },
      {
        "input": "javascriptInteractivity",
        "expectedOutput": "true",
        "description": "Dynamic event handling for Interactive Grid Screen Calculator"
      }
    ],
    "validationCriteria": [
      "Interactive Grid Screen Calculator",
      "Grid Calculator",
      "Activate Feature"
    ]
  }
];
