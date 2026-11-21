import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * Calibrated Battle Arena Questions (30 items)
 * Designed for collegiate speed-coding with ~30 seconds margin to spare.
 */
export const HTML_CSS_EASY_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "html-css-easy-3m-neon-btn",
    "arena": "web_dev",
    "title": "Neon Cyber Button",
    "description": "Create a glowing call-to-action button with hover box-shadow and transition.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Neon Cyber Button",
    "targetComponentHtml": "<button class='cyber-btn'>Launch Terminal</button>",
    "targetComponentCss": ".cyber-btn { padding: 10px 20px; background: #0284c7; color: #fff; border: 1px solid #38bdf8; border-radius: 8px; box-shadow: 0 0 15px rgba(56,189,248,0.4); font-weight: bold; cursor: pointer; }",
    "starterHtml": "<div class='neon-btn-container'><!-- Build Neon Cyber Button --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Neon Cyber Button"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Neon Cyber Button"
      }
    ],
    "validationCriteria": [
      "Neon Cyber Button",
      "Launch Terminal"
    ]
  },
  {
    "id": "html-css-easy-3m-avatar-badge",
    "arena": "web_dev",
    "title": "Circular Avatar Status Badge",
    "description": "A 48px round avatar with an absolute green online status dot in the bottom right corner.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Circular Avatar Status Badge",
    "targetComponentHtml": "<div class='avatar-wrapper'><div class='avatar-img'></div><span class='status-dot'></span></div>",
    "targetComponentCss": ".avatar-wrapper { position: relative; width: 48px; height: 48px; display: inline-block; } .avatar-img { width: 100%; height: 100%; border-radius: 50%; background: #0284c7; } .status-dot { position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; border: 2px solid #0f172a; }",
    "starterHtml": "<div class='avatar-badge-container'><!-- Build Circular Avatar Status Badge --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Circular Avatar Status Badge"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Circular Avatar Status Badge"
      }
    ],
    "validationCriteria": [
      "Circular Avatar Status Badge",
      "Online Status"
    ]
  },
  {
    "id": "html-css-easy-3m-pricing-pill",
    "arena": "web_dev",
    "title": "Minimalist Pricing Pill",
    "description": "Pill-shaped card with tier name, bold price, and an action button, cleanly centered on the screen.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Minimalist Pricing Pill",
    "targetComponentHtml": "<div class='pill'><span>Starter</span><strong>$9/mo</strong><button style='padding:4px 8px;background:#38bdf8;border:none;border-radius:9999px;cursor:pointer;'>Upgrade</button></div>",
    "targetComponentCss": ".pill { display: inline-flex; align-items: center; gap: 12px; padding: 8px 18px; background: #1e293b; border-radius: 9999px; border: 1px solid #334155; color: #fff; }",
    "starterHtml": "<div class='pricing-pill-container'><!-- Build Minimalist Pricing Pill --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Minimalist Pricing Pill"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Minimalist Pricing Pill"
      }
    ],
    "validationCriteria": [
      "Minimalist Pricing Pill",
      "Starter Upgrade"
    ]
  },
  {
    "id": "html-css-easy-3m-notif-toast",
    "arena": "web_dev",
    "title": "Dark Notification Toast",
    "description": "Dark notification popup with icon on left, title and subtitle in middle, and close button on right using Flexbox.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Dark Notification Toast",
    "targetComponentHtml": "<div class='toast'><span>\ud83d\udd14</span><div style='flex:1;'><strong>Build Passed</strong><div style='font-size:11px;color:#a1a1aa;'>All 4 tests passed</div></div><button style='background:none;border:none;color:#71717a;cursor:pointer;'>\u2715</button></div>",
    "targetComponentCss": ".toast { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #18181b; border: 1px solid #27272a; border-radius: 10px; color: #fff; width: 320px; }",
    "starterHtml": "<div class='notif-toast-container'><!-- Build Dark Notification Toast --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Dark Notification Toast"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Dark Notification Toast"
      }
    ],
    "validationCriteria": [
      "Dark Notification Toast",
      "Build Passed"
    ]
  },
  {
    "id": "html-css-easy-3m-gradient-title",
    "arena": "web_dev",
    "title": "Gradient Hero Text Title",
    "description": "Centered h1 title featuring a multi-color gradient text clip.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Gradient Hero Text Title",
    "targetComponentHtml": "<h1 class='grad-title'>Next Generation Arena</h1>",
    "targetComponentCss": ".grad-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc); -webkit-background-clip: text; color: transparent; text-align: center; }",
    "starterHtml": "<div class='gradient-title-container'><!-- Build Gradient Hero Text Title --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Gradient Hero Text Title"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Gradient Hero Text Title"
      }
    ],
    "validationCriteria": [
      "Gradient Hero Text Title",
      "Next Generation"
    ]
  },
  {
    "id": "html-css-easy-3m-social-chips",
    "arena": "web_dev",
    "title": "Social Link Chip Bar",
    "description": "Horizontal row of 3 social media icon buttons with rounded borders and hover states.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Social Link Chip Bar",
    "targetComponentHtml": "<div class='chip-bar'><a href='#' class='chip'>GitHub</a><a href='#' class='chip'>Discord</a><a href='#' class='chip'>Twitter</a></div>",
    "targetComponentCss": ".chip-bar { display: flex; gap: 8px; } .chip { padding: 6px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #38bdf8; font-size: 12px; font-weight: bold; text-decoration: none; }",
    "starterHtml": "<div class='social-chips-container'><!-- Build Social Link Chip Bar --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Social Link Chip Bar"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Social Link Chip Bar"
      }
    ],
    "validationCriteria": [
      "Social Link Chip Bar",
      "Social Links"
    ]
  },
  {
    "id": "html-css-easy-3m-benefit-card",
    "arena": "web_dev",
    "title": "Feature Benefit Card",
    "description": "Card with top accent line, icon, heading, and brief text with subtle hover translateY.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Feature Benefit Card",
    "targetComponentHtml": "<div class='benefit-card'><div style='font-size:20px;margin-bottom:6px;'>\u26a1</div><h4 style='margin:0 0 4px 0;'>Ultra-Fast</h4><p style='margin:0;font-size:12px;color:#94a3b8;'>Sub-second compiler response.</p></div>",
    "targetComponentCss": ".benefit-card { padding: 16px; background: #0f172a; border-top: 3px solid #38bdf8; border-radius: 8px; color: #fff; width: 260px; }",
    "starterHtml": "<div class='benefit-card-container'><!-- Build Feature Benefit Card --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Feature Benefit Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Feature Benefit Card"
      }
    ],
    "validationCriteria": [
      "Feature Benefit Card",
      "Ultra-Fast"
    ]
  },
  {
    "id": "html-css-easy-3m-search-bar",
    "arena": "web_dev",
    "title": "Minimal Search Bar",
    "description": "Input field with rounded corners, magnifying glass placeholder, and active focus outline glow.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Minimal Search Bar",
    "targetComponentHtml": "<div class='search-box'><span>\ud83d\udd0d</span><input class='search-input' placeholder='Search collegiate topics...'></div>",
    "targetComponentCss": ".search-box { display: flex; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 9999px; padding: 6px 14px; width: 280px; } .search-input { background: transparent; border: none; outline: none; color: #fff; font-size: 13px; margin-left: 6px; width: 100%; }",
    "starterHtml": "<div class='search-bar-container'><!-- Build Minimal Search Bar --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Minimal Search Bar"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Minimal Search Bar"
      }
    ],
    "validationCriteria": [
      "Minimal Search Bar",
      "Search Topics"
    ]
  },
  {
    "id": "html-css-easy-3m-tag-group",
    "arena": "web_dev",
    "title": "Badge Tag Pill Group",
    "description": "4 tech badges (HTML, CSS, React, Node) with distinct pastel background and text colors.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Badge Tag Pill Group",
    "targetComponentHtml": "<div class='tags'><span class='tag tag-html'>HTML</span><span class='tag tag-css'>CSS</span><span class='tag tag-react'>React</span><span class='tag tag-node'>Node</span></div>",
    "targetComponentCss": ".tags { display: flex; gap: 6px; } .tag { padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; } .tag-html { background: #fee2e2; color: #991b1b; } .tag-css { background: #e0f2fe; color: #075985; } .tag-react { background: #e0e7ff; color: #3730a3; } .tag-node { background: #dcfce7; color: #166534; }",
    "starterHtml": "<div class='tag-group-container'><!-- Build Badge Tag Pill Group --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Badge Tag Pill Group"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Badge Tag Pill Group"
      }
    ],
    "validationCriteria": [
      "Badge Tag Pill Group",
      "Tag Group"
    ]
  },
  {
    "id": "html-css-easy-3m-centered-box",
    "arena": "web_dev",
    "title": "Centered Fullscreen Box",
    "description": "Perfect vertical and horizontal centering of a content card using Flexbox.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Centered Fullscreen Box",
    "targetComponentHtml": "<div class='center-canvas'><div class='center-card'>Centered Perfectly</div></div>",
    "targetComponentCss": ".center-canvas { display: flex; justify-content: center; align-items: center; min-height: 180px; background: #020617; border-radius: 8px; } .center-card { padding: 16px 24px; background: #1e293b; border-radius: 8px; color: #38bdf8; font-weight: bold; font-family: sans-serif; }",
    "starterHtml": "<div class='centered-box-container'><!-- Build Centered Fullscreen Box --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Centered Fullscreen Box"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Centered Fullscreen Box"
      }
    ],
    "validationCriteria": [
      "Centered Fullscreen Box",
      "Centered Perfectly"
    ]
  },
  {
    "id": "html-css-easy-5m-product-card",
    "arena": "web_dev",
    "title": "E-Commerce Product Card",
    "description": "Card with product thumbnail, discount badge, title, star rating, price, and Add to Cart button.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "E-Commerce Product Card",
    "targetComponentHtml": "<div class='product-card'><div class='p-img'><span class='badge'>-20%</span>\ud83c\udfa7 Audio</div><div class='p-body'><h4 style='margin:0 0 4px 0;'>Pro Headset</h4><div style='color:#facc15;font-size:11px;'>\u2605\u2605\u2605\u2605\u2605</div><div style='font-size:16px;font-weight:bold;margin-top:4px;'>$79.99</div><button class='p-btn'>Add to Cart</button></div></div>",
    "targetComponentCss": ".product-card { width: 240px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; font-family: sans-serif; color: #fff; } .p-img { height: 120px; background: #1e293b; display: flex; align-items: center; justify-content: center; position: relative; } .badge { position: absolute; top: 8px; left: 8px; background: #ef4444; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; } .p-body { padding: 12px; } .p-btn { width: 100%; padding: 8px; background: #0284c7; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 8px; }",
    "starterHtml": "<div class='product-card-container'><!-- Build E-Commerce Product Card --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for E-Commerce Product Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for E-Commerce Product Card"
      }
    ],
    "validationCriteria": [
      "E-Commerce Product Card",
      "Pro Headset"
    ]
  },
  {
    "id": "html-css-easy-5m-member-spotlight",
    "arena": "web_dev",
    "title": "Team Member Spotlight Card",
    "description": "Card with square avatar, name, title, bio, and 3 icon buttons that change color on hover.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Team Member Spotlight Card",
    "targetComponentHtml": "<div class='member-card'><div class='avatar'></div><h4 style='margin:0 0 2px 0;'>Elena Rostova</h4><span style='font-size:11px;color:#a1a1aa;'>Systems Architect</span><p style='font-size:12px;color:#d4d4d8;margin:8px 0;'>Distributed database engineer.</p></div>",
    "targetComponentCss": ".member-card { width: 260px; padding: 16px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; color: #fff; font-family: sans-serif; text-align: center; } .avatar { width: 64px; height: 64px; border-radius: 50%; background: #38bdf8; margin: 0 auto 10px; }",
    "starterHtml": "<div class='member-spotlight-container'><!-- Build Team Member Spotlight Card --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Team Member Spotlight Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Team Member Spotlight Card"
      }
    ],
    "validationCriteria": [
      "Team Member Spotlight Card",
      "Elena Rostova"
    ]
  },
  {
    "id": "html-css-easy-5m-stat-card",
    "arena": "web_dev",
    "title": "Stat Highlight Dashboard Card",
    "description": "Metric card showing total revenue ($42,850), positive green trend badge (+14%), and a progress bar.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Stat Highlight Dashboard Card",
    "targetComponentHtml": "<div class='stat-card'><div class='stat-header'><span style='color:#94a3b8;font-size:12px;'>Total Revenue</span><span class='trend'>+14%</span></div><div class='stat-val'>$42,850</div><div style='height:4px;background:#334155;border-radius:2px;'><div style='width:74%;height:100%;background:#38bdf8;border-radius:2px;'></div></div></div>",
    "targetComponentCss": ".stat-card { width: 260px; padding: 16px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #fff; font-family: sans-serif; } .stat-header { display: flex; justify-content: space-between; align-items: center; } .stat-val { font-size: 24px; font-weight: 800; margin: 8px 0 4px; color: #f8fafc; } .trend { background: rgba(34,197,94,0.15); color: #22c55e; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; }",
    "starterHtml": "<div class='stat-card-container'><!-- Build Stat Highlight Dashboard Card --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Stat Highlight Dashboard Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Stat Highlight Dashboard Card"
      }
    ],
    "validationCriteria": [
      "Stat Highlight Dashboard Card",
      "Total Revenue"
    ]
  },
  {
    "id": "html-css-easy-5m-newsletter-bar",
    "arena": "web_dev",
    "title": "Newsletter Subscribe Bar",
    "description": "Responsive bar with merged input and button (no space between them) that wraps cleanly.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Newsletter Subscribe Bar",
    "targetComponentHtml": "<div class='bar'><input placeholder='Enter college email'><button>Subscribe</button></div>",
    "targetComponentCss": ".bar { display: flex; width: 340px; } .bar input { flex: 1; padding: 10px 14px; background: #1e293b; border: 1px solid #334155; border-right: none; border-radius: 8px 0 0 8px; color: #fff; outline: none; } .bar button { padding: 10px 18px; background: #0284c7; border: 1px solid #0284c7; border-radius: 0 8px 8px 0; color: #fff; font-weight: bold; cursor: pointer; }",
    "starterHtml": "<div class='newsletter-bar-container'><!-- Build Newsletter Subscribe Bar --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Newsletter Subscribe Bar"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Newsletter Subscribe Bar"
      }
    ],
    "validationCriteria": [
      "Newsletter Subscribe Bar",
      "Subscribe"
    ]
  },
  {
    "id": "html-css-easy-5m-toggle-switch",
    "arena": "web_dev",
    "title": "Modern Toggle Switch",
    "description": "CSS-only toggle switch with checkbox and smooth sliding knob transition.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Modern Toggle Switch",
    "targetComponentHtml": "<label class='switch'><input type='checkbox' checked><span class='slider'></span></label>",
    "targetComponentCss": ".switch { position: relative; display: inline-block; width: 50px; height: 26px; } .switch input { opacity: 0; width: 0; height: 0; } .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #334155; transition: .3s; border-radius: 26px; } .slider:before { position: absolute; content: ''; height: 20px; width: 20px; left: 3px; bottom: 3px; background: #fff; transition: .3s; border-radius: 50%; } input:checked + .slider { background: #38bdf8; } input:checked + .slider:before { transform: translateX(24px); }",
    "starterHtml": "<div class='toggle-switch-container'><!-- Build Modern Toggle Switch --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Modern Toggle Switch"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Modern Toggle Switch"
      }
    ],
    "validationCriteria": [
      "Modern Toggle Switch",
      "Toggle Switch"
    ]
  },
  {
    "id": "html-css-easy-5m-blog-card",
    "arena": "web_dev",
    "title": "Blog Article Card Preview",
    "description": "Card with 16:9 thumbnail, publish date, title, excerpt, and Read More link.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Blog Article Card Preview",
    "targetComponentHtml": "<div class='blog-card'><div class='thumb'>Banner Image</div><div class='body'><span style='font-size:11px;color:#38bdf8;'>Nov 21, 2026</span><h4 style='margin:4px 0 6px;'>Building Real-Time Arenas</h4><p style='font-size:12px;color:#94a3b8;margin:0 0 10px;'>Learn how WebSocket telemetry drives combat engines.</p><a href='#' style='color:#38bdf8;font-size:12px;text-decoration:none;font-weight:bold;'>Read More \u2192</a></div></div>",
    "targetComponentCss": ".blog-card { width: 280px; background: #1e293b; border-radius: 12px; overflow: hidden; color: #fff; font-family: sans-serif; } .thumb { height: 130px; background: #334155; display:flex; align-items:center; justify-content:center; color:#94a3b8; } .body { padding: 14px; }",
    "starterHtml": "<div class='blog-card-container'><!-- Build Blog Article Card Preview --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Blog Article Card Preview"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Blog Article Card Preview"
      }
    ],
    "validationCriteria": [
      "Blog Article Card Preview",
      "Building Real-Time"
    ]
  },
  {
    "id": "html-css-easy-5m-credit-card",
    "arena": "web_dev",
    "title": "Credit Card Mini Preview",
    "description": "Dark gradient card styled like a credit card with chip icon, masked number, and expiry date.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Credit Card Mini Preview",
    "targetComponentHtml": "<div class='credit-card'><div style='display:flex;justify-content:space-between;'><span>\ud83d\udcb3 CHIP</span><span style='font-size:16px;'>VISA</span></div><div style='font-size:16px;letter-spacing:2px;'>\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4289</div><div style='display:flex;justify-content:space-between;font-size:11px;'><span>CARDHOLDER NAME</span><span>11/29</span></div></div>",
    "targetComponentCss": ".credit-card { width: 280px; height: 160px; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #475569; border-radius: 14px; padding: 16px; color: #fff; font-family: monospace; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }",
    "starterHtml": "<div class='credit-card-container'><!-- Build Credit Card Mini Preview --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Credit Card Mini Preview"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Credit Card Mini Preview"
      }
    ],
    "validationCriteria": [
      "Credit Card Mini Preview",
      "Credit Card"
    ]
  },
  {
    "id": "html-css-easy-5m-store-buttons",
    "arena": "web_dev",
    "title": "App Store Download Buttons",
    "description": "Pair of dark buttons (App Store & Google Play) with store icons and subtitles.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "App Store Download Buttons",
    "targetComponentHtml": "<div class='store-group'><a href='#' class='store-btn'><span>\ud83c\udf4f</span><div><div style='font-size:9px;color:#94a3b8;'>Download on the</div><div style='font-size:13px;font-weight:bold;'>App Store</div></div></a><a href='#' class='store-btn'><span>\ud83e\udd16</span><div><div style='font-size:9px;color:#94a3b8;'>GET IT ON</div><div style='font-size:13px;font-weight:bold;'>Google Play</div></div></a></div>",
    "targetComponentCss": ".store-group { display: flex; gap: 8px; } .store-btn { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #000; border: 1px solid #334155; border-radius: 8px; color: #fff; text-decoration: none; font-family: sans-serif; }",
    "starterHtml": "<div class='store-buttons-container'><!-- Build App Store Download Buttons --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for App Store Download Buttons"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for App Store Download Buttons"
      }
    ],
    "validationCriteria": [
      "App Store Download Buttons",
      "App Store"
    ]
  },
  {
    "id": "html-css-easy-5m-rating-breakdown",
    "arena": "web_dev",
    "title": "Rating Star Breakdown Bar",
    "description": "Visual rating summary with large score (4.8/5) and 5 stacked horizontal progress bars.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Rating Star Breakdown Bar",
    "targetComponentHtml": "<div class='rating-box'><div style='font-size:24px;font-weight:bold;color:#facc15;'>4.8 \u2605</div><div class='bar-row'><span>5\u2605</span><div class='bar-fill'><div style='width:80%;height:100%;background:#facc15;'></div></div><span>80%</span></div><div class='bar-row'><span>4\u2605</span><div class='bar-fill'><div style='width:15%;height:100%;background:#facc15;'></div></div><span>15%</span></div></div>",
    "targetComponentCss": ".rating-box { width: 260px; padding: 14px; background: #0f172a; border-radius: 10px; color: #fff; font-family: sans-serif; } .bar-row { display: flex; align-items: center; gap: 8px; font-size: 11px; margin-top: 4px; } .bar-fill { flex: 1; height: 6px; background: #334155; border-radius: 3px; overflow: hidden; }",
    "starterHtml": "<div class='rating-breakdown-container'><!-- Build Rating Star Breakdown Bar --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Rating Star Breakdown Bar"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Rating Star Breakdown Bar"
      }
    ],
    "validationCriteria": [
      "Rating Star Breakdown Bar",
      "Rating Breakdown"
    ]
  },
  {
    "id": "html-css-easy-5m-accordion-item",
    "arena": "web_dev",
    "title": "Collapsible Accordion Item",
    "description": "Accordion header with animated chevron icon that rotates when active.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Collapsible Accordion Item",
    "targetComponentHtml": "<div class='acc-item'><div class='acc-head'><span>Tournament Rules</span><span>\u25bc</span></div><div class='acc-body'>Strict 3-minute blitz rounds with anti-cheat telemetry.</div></div>",
    "targetComponentCss": ".acc-item { width: 300px; background: #1e293b; border-radius: 8px; overflow: hidden; font-family: sans-serif; color: #fff; } .acc-head { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; cursor: pointer; border-bottom: 1px solid #334155; } .acc-body { padding: 12px 16px; font-size: 12px; color: #94a3b8; }",
    "starterHtml": "<div class='accordion-item-container'><!-- Build Collapsible Accordion Item --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Collapsible Accordion Item"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Collapsible Accordion Item"
      }
    ],
    "validationCriteria": [
      "Collapsible Accordion Item",
      "Tournament Rules"
    ]
  },
  {
    "id": "html-css-easy-10m-pricing-3tier",
    "arena": "web_dev",
    "title": "3-Tier Pricing Comparison Cards",
    "description": "Side-by-side pricing cards (Free, Pro, Enterprise) where Pro is highlighted and elevated.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "3-Tier Pricing Comparison Cards",
    "targetComponentHtml": "<div class='pricing-grid'><div class='card'><h4>Free</h4><div>$0</div></div><div class='card pro'><h4>Pro</h4><div>$19</div><button style='margin-top:8px;background:#38bdf8;border:none;padding:6px;border-radius:4px;font-weight:bold;'>Select</button></div><div class='card'><h4>Team</h4><div>$49</div></div></div>",
    "targetComponentCss": ".pricing-grid { display: flex; gap: 12px; max-width: 480px; font-family: sans-serif; color: #fff; } .card { flex: 1; padding: 16px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; text-align: center; } .card.pro { background: #0f172a; border-color: #38bdf8; transform: scale(1.05); box-shadow: 0 0 20px rgba(56,189,248,0.25); }",
    "starterHtml": "<div class='pricing-3tier-container'><!-- Build 3-Tier Pricing Comparison Cards --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for 3-Tier Pricing Comparison Cards"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for 3-Tier Pricing Comparison Cards"
      }
    ],
    "validationCriteria": [
      "3-Tier Pricing Comparison Cards",
      "Pricing Cards"
    ]
  },
  {
    "id": "html-css-easy-10m-landing-navbar",
    "arena": "web_dev",
    "title": "Landing Page Navigation Bar",
    "description": "Glassmorphism header with logo, 4 centered links, and action buttons.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Landing Page Navigation Bar",
    "targetComponentHtml": "<nav class='nav'><strong>Kollabrix</strong><div><a href='#'>Arena</a><a href='#'>Tournaments</a><a href='#'>Rankings</a></div><button style='background:#0284c7;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-weight:bold;'>Join</button></nav>",
    "targetComponentCss": ".nav { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: rgba(15,23,42,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #334155; color: #fff; font-family: sans-serif; } .nav a { color: #94a3b8; text-decoration: none; margin: 0 10px; font-size: 13px; }",
    "starterHtml": "<div class='landing-navbar-container'><!-- Build Landing Page Navigation Bar --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Landing Page Navigation Bar"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Landing Page Navigation Bar"
      }
    ],
    "validationCriteria": [
      "Landing Page Navigation Bar",
      "Navigation Bar"
    ]
  },
  {
    "id": "html-css-easy-10m-profile-hero",
    "arena": "web_dev",
    "title": "User Profile Hero Header",
    "description": "Large profile banner with overlapping circular avatar, name, bio, and action buttons.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "User Profile Hero Header",
    "targetComponentHtml": "<div class='hero'><div class='banner'></div><div class='hero-content'><div class='hero-avatar'></div><h4 style='margin:0 0 2px;'>Rohan Mehta</h4><span style='font-size:11px;color:#94a3b8;'>IIT Delhi \u2022 Grandmaster</span></div></div>",
    "targetComponentCss": ".hero { width: 340px; background: #0f172a; border-radius: 12px; overflow: hidden; font-family: sans-serif; color: #fff; } .banner { height: 70px; background: linear-gradient(90deg, #0284c7, #6366f1); } .hero-content { padding: 0 16px 16px; position: relative; } .hero-avatar { width: 56px; height: 56px; border-radius: 50%; background: #38bdf8; border: 3px solid #0f172a; margin-top: -28px; margin-bottom: 8px; }",
    "starterHtml": "<div class='profile-hero-container'><!-- Build User Profile Hero Header --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for User Profile Hero Header"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for User Profile Hero Header"
      }
    ],
    "validationCriteria": [
      "User Profile Hero Header",
      "Rohan Mehta"
    ]
  },
  {
    "id": "html-css-easy-10m-hackathon-timeline",
    "arena": "web_dev",
    "title": "Hackathon Schedule Timeline",
    "description": "Vertical timeline with central dotted line, milestone nodes, and alternating cards.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Hackathon Schedule Timeline",
    "targetComponentHtml": "<div class='timeline'><div class='node'><span class='circle'></span><div><strong>09:00 AM</strong> - Check-in & Team Assembly</div></div><div class='node'><span class='circle'></span><div><strong>10:30 AM</strong> - Opening Ceremonies & Hack Kickoff</div></div></div>",
    "targetComponentCss": ".timeline { width: 320px; font-family: sans-serif; color: #fff; padding: 10px 0; } .node { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; } .circle { width: 14px; height: 14px; border-radius: 50%; background: #38bdf8; margin-top: 3px; }",
    "starterHtml": "<div class='hackathon-timeline-container'><!-- Build Hackathon Schedule Timeline --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Hackathon Schedule Timeline"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Hackathon Schedule Timeline"
      }
    ],
    "validationCriteria": [
      "Hackathon Schedule Timeline",
      "Schedule Timeline"
    ]
  },
  {
    "id": "html-css-easy-10m-portfolio-grid",
    "arena": "web_dev",
    "title": "Portfolio Project Grid (2x2)",
    "description": "2x2 grid of project cards with image overlay and hover details.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Portfolio Project Grid (2x2)",
    "targetComponentHtml": "<div class='p-grid'><div class='p-tile'>AI Sentinel</div><div class='p-tile'>Cloud IDE</div><div class='p-tile'>Radar UI</div><div class='p-tile'>Compiler Core</div></div>",
    "targetComponentCss": ".p-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 340px; font-family: sans-serif; color: #fff; } .p-tile { height: 100px; background: #1e293b; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; border: 1px solid #334155; }",
    "starterHtml": "<div class='portfolio-grid-container'><!-- Build Portfolio Project Grid (2x2) --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Portfolio Project Grid (2x2)"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Portfolio Project Grid (2x2)"
      }
    ],
    "validationCriteria": [
      "Portfolio Project Grid (2x2)",
      "Portfolio Grid"
    ]
  },
  {
    "id": "html-css-easy-10m-testimonial-card",
    "arena": "web_dev",
    "title": "Testimonial Quote Card",
    "description": "Customer quote with large quote mark, avatar, name, and star rating.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Testimonial Quote Card",
    "targetComponentHtml": "<div class='test-card'><p style='font-style:italic;margin:0 0 10px;color:#e2e8f0;font-size:13px;'>\"The 1v1 Battle Arena brought esports energy into our computer science lab.\"</p><strong>Priya Sharma</strong> <span style='font-size:11px;color:#94a3b8;'>\u2014 BITS Pilani</span></div>",
    "targetComponentCss": ".test-card { width: 320px; padding: 18px; background: #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; color: #fff; font-family: sans-serif; }",
    "starterHtml": "<div class='testimonial-card-container'><!-- Build Testimonial Quote Card --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Testimonial Quote Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Testimonial Quote Card"
      }
    ],
    "validationCriteria": [
      "Testimonial Quote Card",
      "Testimonial Card"
    ]
  },
  {
    "id": "html-css-easy-10m-tabbed-signin",
    "arena": "web_dev",
    "title": "Tabbed Sign-In Card",
    "description": "Centered card with Sign In and Register tabs with styled inputs.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Tabbed Sign-In Card",
    "targetComponentHtml": "<div class='auth-card'><div class='tabs'><div class='tab active'>Sign In</div><div class='tab'>Register</div></div><input placeholder='Email' style='width:100%;padding:8px;margin-bottom:8px;background:#1e293b;border:1px solid #475569;border-radius:6px;color:#fff;box-sizing:border-box;'><button style='width:100%;padding:8px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;'>Continue</button></div>",
    "targetComponentCss": ".auth-card { width: 300px; padding: 18px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #fff; font-family: sans-serif; } .tabs { display: flex; border-bottom: 1px solid #334155; margin-bottom: 14px; } .tab { flex: 1; text-align: center; padding: 6px; font-size: 13px; font-weight: bold; cursor: pointer; color: #94a3b8; } .tab.active { color: #38bdf8; border-bottom: 2px solid #38bdf8; }",
    "starterHtml": "<div class='tabbed-signin-container'><!-- Build Tabbed Sign-In Card --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Tabbed Sign-In Card"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Tabbed Sign-In Card"
      }
    ],
    "validationCriteria": [
      "Tabbed Sign-In Card",
      "Sign In Card"
    ]
  },
  {
    "id": "html-css-easy-10m-music-widget",
    "arena": "web_dev",
    "title": "Music Player Mini Widget",
    "description": "Player card with album art, song title, progress slider, and controls.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Music Player Mini Widget",
    "targetComponentHtml": "<div class='player'><div style='display:flex;gap:10px;align-items:center;'><div style='width:44px;height:44px;background:#38bdf8;border-radius:8px;'></div><div><strong style='font-size:13px;'>Midnight Code</strong><div style='font-size:11px;color:#a1a1aa;'>Synthwave Mix</div></div></div><div class='controls'><span>\u23ee</span><span>\u25b6</span><span>\u23ed</span></div></div>",
    "targetComponentCss": ".player { width: 280px; padding: 14px; background: #18181b; border-radius: 12px; color: #fff; font-family: sans-serif; } .controls { display: flex; justify-content: center; gap: 16px; margin-top: 10px; font-size: 18px; }",
    "starterHtml": "<div class='music-widget-container'><!-- Build Music Player Mini Widget --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Music Player Mini Widget"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Music Player Mini Widget"
      }
    ],
    "validationCriteria": [
      "Music Player Mini Widget",
      "Music Player"
    ]
  },
  {
    "id": "html-css-easy-10m-donut-chart",
    "arena": "web_dev",
    "title": "Analytics Donut Chart Widget",
    "description": "Circular CSS conic-gradient chart alongside a colored legend.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Analytics Donut Chart Widget",
    "targetComponentHtml": "<div class='chart-card'><div class='donut'></div><div style='font-size:11px;line-height:1.6;'><div><span style='color:#38bdf8;'>\u25cf</span> Web Dev (60%)</div><div><span style='color:#818cf8;'>\u25cf</span> DSA (25%)</div><div><span style='color:#facc15;'>\u25cf</span> Bugs (15%)</div></div></div>",
    "targetComponentCss": ".chart-card { width: 280px; padding: 16px; background: #0f172a; border-radius: 12px; color: #fff; font-family: sans-serif; display: flex; gap: 14px; align-items: center; } .donut { width: 70px; height: 70px; border-radius: 50%; background: conic-gradient(#38bdf8 0% 60%, #818cf8 60% 85%, #facc15 85% 100%); }",
    "starterHtml": "<div class='donut-chart-container'><!-- Build Analytics Donut Chart Widget --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Analytics Donut Chart Widget"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Analytics Donut Chart Widget"
      }
    ],
    "validationCriteria": [
      "Analytics Donut Chart Widget",
      "Analytics Donut"
    ]
  },
  {
    "id": "html-css-easy-10m-filter-sidebar",
    "arena": "web_dev",
    "title": "Product Filter Sidebar",
    "description": "Vertical sidebar with price range slider and styled category checkboxes.",
    "tags": [
      "html",
      "css"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Product Filter Sidebar",
    "targetComponentHtml": "<div class='sidebar'><h4 style='margin:0 0 8px 0;color:#38bdf8;'>Filters</h4><label style='display:block;margin-bottom:6px;'><input type='checkbox' checked> Hackathons</label><label style='display:block;margin-bottom:6px;'><input type='checkbox'> 1v1 Duels</label><label style='display:block;'><input type='checkbox'> Bounty Challenges</label></div>",
    "targetComponentCss": ".sidebar { width: 220px; padding: 14px; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; color: #fff; font-family: sans-serif; font-size: 12px; }",
    "starterHtml": "<div class='filter-sidebar-container'><!-- Build Product Filter Sidebar --></div>",
    "starterCss": "/* Style with CSS */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic markup structure for Product Filter Sidebar"
      },
      {
        "input": "layoutCoordinatesAndStyle",
        "expectedOutput": "true",
        "description": "Layout and styling fidelity for Product Filter Sidebar"
      }
    ],
    "validationCriteria": [
      "Product Filter Sidebar",
      "Product Filter"
    ]
  }
];
