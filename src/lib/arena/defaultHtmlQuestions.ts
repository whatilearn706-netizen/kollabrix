import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * 30 Calibrated Easy HTML Battle Arena Questions
 * - 10 Blitz Challenges (3 Minutes / 180s)
 * - 10 Competitive Challenges (5 Minutes / 300s)
 * - 10 Marathon Challenges (10 Minutes / 600s)
 *
 * Designed so collegiate builders can solve with ~30 seconds to spare.
 */
export const HTML_EASY_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "html-easy-3m-profile-pill",
    "arena": "web_dev",
    "title": "Profile Identity Pill",
    "description": "Construct a user identity pill containing an avatar image, the user name Alex Mercer in an h4 heading, an online status badge, and a Connect action button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Profile Identity Pill",
    "targetComponentHtml": "<div class=\"profile-pill\" style=\"display:inline-flex;align-items:center;gap:12px;padding:8px 16px;background:#1e293b;border:1px solid #334155;border-radius:9999px;color:#fff;font-family:sans-serif;\">\n  <img src=\"/logo.svg\" alt=\"Avatar\" width=\"32\" height=\"32\" style=\"border-radius:50%;background:#38bdf8;\" />\n  <div>\n    <h4 style=\"margin:0;font-size:14px;color:#f8fafc;\">Alex Mercer</h4>\n    <span style=\"font-size:11px;color:#22c55e;\">\u25cf Online</span>\n  </div>\n  <button type=\"button\" style=\"padding:4px 10px;background:#3b82f6;border:none;border-radius:9999px;color:#fff;font-size:11px;cursor:pointer;\">Connect</button>\n</div>",
    "starterHtml": "<div class=\"profile-pill\">\n  <!-- Add <img> with alt=\"Avatar\", <h4>Alex Mercer</h4>, <span>\u25cf Online</span>, and <button>Connect</button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Alex Mercer identity heading",
      "Avatar image & online status",
      "Connect action button"
    ]
  },
  {
    "id": "html-easy-3m-newsletter-signup",
    "arena": "web_dev",
    "title": "Newsletter Signup Box",
    "description": "Build a compact newsletter subscription box with a Developer Weekly heading, descriptive paragraph, and a form containing an email input and Subscribe submit button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Newsletter Signup Box",
    "targetComponentHtml": "<div class=\"newsletter-box\" style=\"padding:16px;background:#0f172a;border:1px solid #334155;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 6px 0;font-size:16px;color:#f1f5f9;\">Developer Weekly</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#94a3b8;\">Curated frontend engineering tips delivered to your inbox.</p>\n  <form style=\"display:flex;gap:8px;\">\n    <input type=\"email\" placeholder=\"Enter your email\" required style=\"flex:1;padding:8px 12px;background:#1e293b;border:1px solid #475569;border-radius:8px;color:#fff;font-size:12px;\" />\n    <button type=\"submit\" style=\"padding:8px 16px;background:#6366f1;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:bold;cursor:pointer;\">Subscribe</button>\n  </form>\n</div>",
    "starterHtml": "<div class=\"newsletter-box\">\n  <!-- Add <h3>Developer Weekly</h3>, <p> description, and a <form> with an email <input> and Subscribe <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Developer Weekly heading",
      "Email input field",
      "Subscribe submit button"
    ]
  },
  {
    "id": "html-easy-3m-skill-badges",
    "arena": "web_dev",
    "title": "Developer Skill Badges",
    "description": "Create a competencies badge list featuring an h4 Core Competencies heading and an unordered list containing badges for HTML5, CSS3, JavaScript, and Git.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Developer Skill Badges",
    "targetComponentHtml": "<div class=\"skills-strip\" style=\"padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;color:#fff;font-family:sans-serif;max-width:360px;\">\n  <h4 style=\"margin:0 0 10px 0;font-size:14px;color:#e4e4e7;\">Core Competencies</h4>\n  <ul style=\"list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px;\">\n    <li style=\"padding:4px 10px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;font-size:12px;color:#38bdf8;\">HTML5</li>\n    <li style=\"padding:4px 10px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;font-size:12px;color:#818cf8;\">CSS3</li>\n    <li style=\"padding:4px 10px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;font-size:12px;color:#facc15;\">JavaScript</li>\n    <li style=\"padding:4px 10px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;font-size:12px;color:#34d399;\">Git</li>\n  </ul>\n</div>",
    "starterHtml": "<div class=\"skills-strip\">\n  <!-- Add <h4>Core Competencies</h4> and an <ul> with <li> items for HTML5, CSS3, JavaScript, and Git -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Core Competencies heading",
      "Unordered list (ul and li)",
      "Badges for HTML5, CSS3, JavaScript, Git"
    ]
  },
  {
    "id": "html-easy-3m-price-tag",
    "arena": "web_dev",
    "title": "Product Deal Price Tag",
    "description": "Structure a product price badge featuring an h4 product name heading, deleted strike-through old price, strong active sale price, and an Add to Cart button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Product Deal Price Tag",
    "targetComponentHtml": "<div class=\"price-card\" style=\"padding:16px;background:#09090b;border:1px solid #27272a;border-radius:12px;color:#fff;font-family:sans-serif;max-width:280px;\">\n  <h4 style=\"margin:0 0 6px 0;font-size:15px;color:#fafafa;\">Mechanical Keyboard</h4>\n  <div style=\"display:flex;align-items:baseline;gap:8px;margin-bottom:12px;\">\n    <del style=\"font-size:13px;color:#71717a;\">$129</del>\n    <strong style=\"font-size:22px;color:#10b981;\">$89</strong>\n    <span style=\"font-size:10px;background:#064e3b;color:#34d399;padding:2px 6px;border-radius:4px;\">31% OFF</span>\n  </div>\n  <button type=\"button\" style=\"width:100%;padding:8px;background:#e11d48;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:bold;cursor:pointer;\">Add to Cart</button>\n</div>",
    "starterHtml": "<div class=\"price-card\">\n  <!-- Add <h4>Mechanical Keyboard</h4>, <del>$129</del>, <strong>$89</strong>, discount <span>, and <button>Add to Cart</button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Product heading",
      "Old price <del> and active <strong> price",
      "Add to Cart button"
    ]
  },
  {
    "id": "html-easy-3m-audio-player",
    "arena": "web_dev",
    "title": "Podcast Episode Player",
    "description": "Create a podcast preview widget featuring an h4 episode title heading, host info paragraph, and a native HTML5 audio element with controls.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Podcast Episode Player",
    "targetComponentHtml": "<div class=\"podcast-player\" style=\"padding:16px;background:#1e1b4b;border:1px solid #3730a3;border-radius:12px;color:#fff;font-family:sans-serif;max-width:340px;\">\n  <h4 style=\"margin:0 0 4px 0;font-size:15px;color:#e0e7ff;\">The Future of Web Dev</h4>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#a5b4fc;\">Hosted by Sarah Connor &bull; 24 min</p>\n  <audio controls style=\"width:100%;height:36px;\">\n    <source src=\"#\" type=\"audio/mp3\">\n    Your browser does not support audio.\n  </audio>\n</div>",
    "starterHtml": "<div class=\"podcast-player\">\n  <!-- Add <h4>The Future of Web Dev</h4>, <p>Hosted by Sarah Connor</p>, and <audio controls> with <source> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Episode heading",
      "Host details paragraph",
      "Native <audio controls> element"
    ]
  },
  {
    "id": "html-easy-3m-search-datalist",
    "arena": "web_dev",
    "title": "Search Input with Datalist",
    "description": "Construct a search bar with an h4 heading, an input connected to a datalist of frontend frameworks (React, Vue, Next.js), and a Search button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Search Input with Datalist",
    "targetComponentHtml": "<div class=\"search-container\" style=\"padding:16px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;color:#fff;font-family:sans-serif;max-width:360px;\">\n  <h4 style=\"margin:0 0 8px 0;font-size:14px;color:#f8fafc;\">Search Ecosystem</h4>\n  <div style=\"display:flex;gap:8px;\">\n    <input list=\"framework-list\" type=\"search\" placeholder=\"Type a framework...\" style=\"flex:1;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#fff;font-size:12px;\" />\n    <datalist id=\"framework-list\">\n      <option value=\"React\" />\n      <option value=\"Vue\" />\n      <option value=\"Next.js\" />\n    </datalist>\n    <button type=\"button\" style=\"padding:8px 14px;background:#0284c7;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:bold;cursor:pointer;\">Search</button>\n  </div>\n</div>",
    "starterHtml": "<div class=\"search-container\">\n  <!-- Add <h4>Search Ecosystem</h4>, <input list=\"framework-list\">, <datalist id=\"framework-list\"> with options, and <button>Search</button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Heading",
      "Input linked to <datalist>",
      "Search button"
    ]
  },
  {
    "id": "html-easy-3m-faq-accordion",
    "arena": "web_dev",
    "title": "Native FAQ Accordion Item",
    "description": "Build a native collapsible FAQ card with an h4 heading and a details element containing a question summary and an answer paragraph.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Native FAQ Accordion Item",
    "targetComponentHtml": "<div class=\"faq-widget\" style=\"padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h4 style=\"margin:0 0 10px 0;font-size:15px;color:#fafafa;\">Platform FAQ</h4>\n  <details open style=\"padding:10px;background:#27272a;border-radius:8px;cursor:pointer;\">\n    <summary style=\"font-weight:bold;font-size:13px;color:#38bdf8;\">What is Kollabrix Battle Arena?</summary>\n    <p style=\"margin:8px 0 0 0;font-size:12px;color:#a1a1aa;line-height:1.5;\">A real-time multiplayer code combat platform for college hackathon builders.</p>\n  </details>\n</div>",
    "starterHtml": "<div class=\"faq-widget\">\n  <!-- Add <h4>Platform FAQ</h4>, and <details open> with a <summary> question and <p> answer -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "FAQ Heading",
      "Native <details> with <summary>",
      "Answer paragraph"
    ]
  },
  {
    "id": "html-easy-3m-alert-banner",
    "arena": "web_dev",
    "title": "System Alert Notice Banner",
    "description": "Structure an urgent system notice banner with a warning icon, an h5 title heading, a maintenance notice paragraph, and a Dismiss button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "System Alert Notice Banner",
    "targetComponentHtml": "<div class=\"alert-banner\" style=\"display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#451a03;border:1px solid #b45309;border-radius:10px;color:#fef3c7;font-family:sans-serif;max-width:440px;\">\n  <div style=\"display:flex;align-items:center;gap:10px;\">\n    <span style=\"font-size:18px;\">\u26a0\ufe0f</span>\n    <div>\n      <h5 style=\"margin:0;font-size:13px;font-weight:bold;color:#fde68a;\">Scheduled Maintenance</h5>\n      <p style=\"margin:2px 0 0 0;font-size:11px;color:#fef3c7;\">Servers will restart tonight at 02:00 UTC.</p>\n    </div>\n  </div>\n  <button type=\"button\" style=\"padding:4px 10px;background:#78350f;border:1px solid #d97706;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;\">Dismiss</button>\n</div>",
    "starterHtml": "<div class=\"alert-banner\">\n  <!-- Add warning icon, <h5>Scheduled Maintenance</h5>, <p> notice details, and <button>Dismiss</button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Heading for maintenance",
      "Notice details paragraph",
      "Dismiss button"
    ]
  },
  {
    "id": "html-easy-3m-progress-bar",
    "arena": "web_dev",
    "title": "Download Progress Display",
    "description": "Implement a file download status box using an h4 filename heading, a status paragraph, a native HTML5 progress element (value 74, max 100), and a Cancel button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Download Progress Display",
    "targetComponentHtml": "<div class=\"progress-card\" style=\"padding:16px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;color:#fff;font-family:sans-serif;max-width:320px;\">\n  <h4 style=\"margin:0 0 4px 0;font-size:14px;color:#f8fafc;\">kollabrix-bundle.tar.gz</h4>\n  <p style=\"margin:0 0 10px 0;font-size:11px;color:#94a3b8;\">Downloading &bull; 74 MB of 100 MB</p>\n  <progress value=\"74\" max=\"100\" style=\"width:100%;height:10px;accent-color:#38bdf8;\"></progress>\n  <div style=\"display:flex;justify-content:flex-end;margin-top:10px;\">\n    <button type=\"button\" style=\"padding:4px 12px;background:#dc2626;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;\">Cancel</button>\n  </div>\n</div>",
    "starterHtml": "<div class=\"progress-card\">\n  <!-- Add <h4> filename, <p> size details, <progress value=\"74\" max=\"100\">, and <button>Cancel</button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Filename heading",
      "Native <progress> element",
      "Cancel button"
    ]
  },
  {
    "id": "html-easy-3m-star-rating",
    "arena": "web_dev",
    "title": "Feedback Rating Selector",
    "description": "Construct a feedback score box with an h4 title heading, a prompt paragraph, a form with radio inputs for scores 1 to 5, and a Submit button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Feedback Rating Selector",
    "targetComponentHtml": "<div class=\"rating-box\" style=\"padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;color:#fff;font-family:sans-serif;max-width:320px;\">\n  <h4 style=\"margin:0 0 6px 0;font-size:14px;color:#fafafa;\">Rate Your Experience</h4>\n  <p style=\"margin:0 0 12px 0;font-size:11px;color:#a1a1aa;\">How fair was the match rating?</p>\n  <form style=\"display:flex;align-items:center;justify-content:space-between;\">\n    <label style=\"font-size:12px;cursor:pointer;\"><input type=\"radio\" name=\"score\" value=\"1\" /> 1\u2605</label>\n    <label style=\"font-size:12px;cursor:pointer;\"><input type=\"radio\" name=\"score\" value=\"2\" /> 2\u2605</label>\n    <label style=\"font-size:12px;cursor:pointer;\"><input type=\"radio\" name=\"score\" value=\"3\" /> 3\u2605</label>\n    <label style=\"font-size:12px;cursor:pointer;\"><input type=\"radio\" name=\"score\" value=\"4\" /> 4\u2605</label>\n    <label style=\"font-size:12px;cursor:pointer;\"><input type=\"radio\" name=\"score\" value=\"5\" checked /> 5\u2605</label>\n    <button type=\"submit\" style=\"padding:6px 12px;background:#f59e0b;border:none;border-radius:6px;color:#000;font-size:11px;font-weight:bold;cursor:pointer;\">Submit</button>\n  </form>\n</div>",
    "starterHtml": "<div class=\"rating-box\">\n  <!-- Add <h4>Rate Your Experience</h4>, <p> prompt, and a <form> with radio inputs (1\u2605 to 5\u2605) and a Submit <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Heading and prompt",
      "Radio input options",
      "Submit button"
    ]
  },
  {
    "id": "html-easy-5m-student-id",
    "arena": "web_dev",
    "title": "Student Campus ID Badge",
    "description": "Design an official campus ID card with university title h3, student photo img, student name h4 Maya Patel, major description, ID number, and an active badge button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Student Campus ID Badge",
    "targetComponentHtml": "<div class=\"student-card\" style=\"padding:20px;background:#0f172a;border:2px solid #334155;border-radius:16px;color:#fff;font-family:sans-serif;max-width:320px;text-align:center;\">\n  <h3 style=\"margin:0 0 12px 0;font-size:14px;color:#38bdf8;text-transform:uppercase;letter-spacing:1px;\">Apex Institute of Technology</h3>\n  <img src=\"/logo.svg\" alt=\"Student Photo\" width=\"80\" height=\"80\" style=\"border-radius:50%;border:3px solid #38bdf8;margin:0 auto 12px auto;display:block;\" />\n  <h4 style=\"margin:0 0 4px 0;font-size:18px;color:#f8fafc;\">Maya Patel</h4>\n  <p style=\"margin:0 0 8px 0;font-size:12px;color:#94a3b8;\">B.Tech Computer Science &bull; Class of 2026</p>\n  <p style=\"margin:0 0 16px 0;font-size:11px;font-family:monospace;color:#64748b;\">ID: AIT-2024-8842</p>\n  <button type=\"button\" style=\"padding:6px 16px;background:#10b981;border:none;border-radius:9999px;color:#fff;font-size:12px;font-weight:bold;\">Active Student</button>\n</div>",
    "starterHtml": "<div class=\"student-card\">\n  <!-- Add <h3> institution name, <img> student photo, <h4>Maya Patel</h4>, degree details, ID paragraph, and Active Student <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "University institution heading",
      "Student photo img and Maya Patel heading",
      "Active status button"
    ]
  },
  {
    "id": "html-easy-5m-event-rsvp",
    "arena": "web_dev",
    "title": "Hackathon Event RSVP Form",
    "description": "Build a hackathon RSVP form featuring an h3 Hackathon RSVP heading, text input for Full Name, email input, t-shirt size select dropdown, and an RSVP confirmation submit button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Hackathon Event RSVP Form",
    "targetComponentHtml": "<div class=\"rsvp-card\" style=\"padding:20px;background:#18181b;border:1px solid #27272a;border-radius:14px;color:#fff;font-family:sans-serif;max-width:360px;\">\n  <h3 style=\"margin:0 0 6px 0;font-size:18px;color:#fafafa;\">Hackathon 2026 RSVP</h3>\n  <p style=\"margin:0 0 16px 0;font-size:12px;color:#a1a1aa;\">Confirm your attendance for the collegiate hackathon.</p>\n  <form style=\"display:flex;flex-direction:column;gap:10px;\">\n    <label style=\"font-size:12px;color:#d4d4d8;\">Full Name:\n      <input type=\"text\" placeholder=\"e.g. Rahul Sharma\" required style=\"width:100%;padding:8px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\" />\n    </label>\n    <label style=\"font-size:12px;color:#d4d4d8;\">College Email:\n      <input type=\"email\" placeholder=\"name@college.edu\" required style=\"width:100%;padding:8px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\" />\n    </label>\n    <label style=\"font-size:12px;color:#d4d4d8;\">T-Shirt Size:\n      <select style=\"width:100%;padding:8px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\">\n        <option value=\"S\">Small (S)</option>\n        <option value=\"M\">Medium (M)</option>\n        <option value=\"L\">Large (L)</option>\n        <option value=\"XL\">Extra Large (XL)</option>\n      </select>\n    </label>\n    <button type=\"submit\" style=\"margin-top:6px;padding:10px;background:#6366f1;border:none;border-radius:8px;color:#fff;font-weight:bold;font-size:13px;cursor:pointer;\">Confirm RSVP</button>\n  </form>\n</div>",
    "starterHtml": "<div class=\"rsvp-card\">\n  <!-- Add <h3>Hackathon 2026 RSVP</h3>, <form> with Name input, Email input, T-Shirt <select>, and Confirm RSVP <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Hackathon heading",
      "Name, email inputs and select dropdown",
      "Confirm RSVP submit button"
    ]
  },
  {
    "id": "html-easy-5m-leaderboard-table",
    "arena": "web_dev",
    "title": "Tournament Leaderboard Table",
    "description": "Structure a collegiate tournament leaderboard using semantic table, thead, tbody, tr, th, and td elements for 3 ranked players with Rank, Player, Score, and Badge.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Tournament Leaderboard Table",
    "targetComponentHtml": "<div class=\"leaderboard-card\" style=\"padding:16px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 12px 0;font-size:16px;color:#f8fafc;\">Arena Leaderboard</h3>\n  <table style=\"width:100%;border-collapse:collapse;font-size:12px;text-align:left;\">\n    <thead>\n      <tr style=\"border-bottom:1px solid #334155;color:#94a3b8;\">\n        <th style=\"padding:6px;\">Rank</th>\n        <th style=\"padding:6px;\">Player</th>\n        <th style=\"padding:6px;\">Score</th>\n        <th style=\"padding:6px;\">Badge</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr style=\"border-bottom:1px solid #1e293b;\">\n        <td style=\"padding:8px 6px;color:#facc15;font-weight:bold;\">#1</td>\n        <td style=\"padding:8px 6px;\">CipherNova</td>\n        <td style=\"padding:8px 6px;font-family:monospace;\">2,450</td>\n        <td style=\"padding:8px 6px;\"><span style=\"color:#facc15;\">\ud83e\udd47 Grandmaster</span></td>\n      </tr>\n      <tr style=\"border-bottom:1px solid #1e293b;\">\n        <td style=\"padding:8px 6px;color:#94a3b8;font-weight:bold;\">#2</td>\n        <td style=\"padding:8px 6px;\">ByteForge</td>\n        <td style=\"padding:8px 6px;font-family:monospace;\">2,180</td>\n        <td style=\"padding:8px 6px;\"><span style=\"color:#94a3b8;\">\ud83e\udd48 Master</span></td>\n      </tr>\n      <tr>\n        <td style=\"padding:8px 6px;color:#d97706;font-weight:bold;\">#3</td>\n        <td style=\"padding:8px 6px;\">PixelValkyrie</td>\n        <td style=\"padding:8px 6px;font-family:monospace;\">1,920</td>\n        <td style=\"padding:8px 6px;\"><span style=\"color:#d97706;\">\ud83e\udd49 Elite</span></td>\n      </tr>\n    </tbody>\n  </table>\n</div>",
    "starterHtml": "<div class=\"leaderboard-card\">\n  <!-- Add <h3>Arena Leaderboard</h3> and a <table> with <thead> headers and <tbody> rows for 3 players -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Leaderboard heading",
      "Semantic table with thead, tbody, th, td",
      "3 player ranking entries"
    ]
  },
  {
    "id": "html-easy-5m-social-card",
    "arena": "web_dev",
    "title": "Community Social Feed Card",
    "description": "Construct a community social post card with author avatar img, author name h4 Liam Zhang, timestamp, post content paragraph, and Like and Comment action buttons.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Community Social Feed Card",
    "targetComponentHtml": "<div class=\"post-card\" style=\"padding:16px;background:#18181b;border:1px solid #27272a;border-radius:14px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <div style=\"display:flex;align-items:center;gap:10px;margin-bottom:12px;\">\n    <img src=\"/logo.svg\" alt=\"Liam Zhang\" width=\"40\" height=\"40\" style=\"border-radius:50%;background:#a855f7;\" />\n    <div>\n      <h4 style=\"margin:0;font-size:14px;color:#fafafa;\">Liam Zhang</h4>\n      <time style=\"font-size:11px;color:#71717a;\">2 hours ago</time>\n    </div>\n  </div>\n  <p style=\"margin:0 0 14px 0;font-size:13px;color:#d4d4d8;line-height:1.5;\">Just shipped our collegiate hackathon submission built with Next.js and Supabase! Excited for the live judging round tomorrow.</p>\n  <div style=\"display:flex;gap:10px;border-top:1px solid #27272a;padding-top:12px;\">\n    <button type=\"button\" style=\"padding:6px 14px;background:#27272a;border:1px solid #3f3f46;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;\">\ud83d\udc4d Like (42)</button>\n    <button type=\"button\" style=\"padding:6px 14px;background:#27272a;border:1px solid #3f3f46;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;\">\ud83d\udcac Comment (9)</button>\n  </div>\n</div>",
    "starterHtml": "<div class=\"post-card\">\n  <!-- Add author <img>, <h4>Liam Zhang</h4>, <time> timestamp, <p> post content, and Like and Comment <button> elements -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Author avatar and Liam Zhang heading",
      "Post body paragraph",
      "Like and Comment buttons"
    ]
  },
  {
    "id": "html-easy-5m-video-thumbnail",
    "arena": "web_dev",
    "title": "Video Stream Preview Card",
    "description": "Build a video stream card featuring a video preview image with duration badge, video title h4, creator channel paragraph, views metadata, and a Watch Now button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Video Stream Preview Card",
    "targetComponentHtml": "<div class=\"video-card\" style=\"padding:14px;background:#09090b;border:1px solid #27272a;border-radius:14px;color:#fff;font-family:sans-serif;max-width:340px;\">\n  <div style=\"position:relative;margin-bottom:10px;\">\n    <img src=\"/images/arena-retro-sentinel-clean.png\" alt=\"Video Thumbnail\" width=\"100%\" height=\"160\" style=\"object-fit:cover;border-radius:8px;display:block;\" />\n    <span style=\"position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.8);color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;font-family:monospace;\">14:30</span>\n  </div>\n  <h4 style=\"margin:0 0 4px 0;font-size:15px;color:#fafafa;\">Mastering CSS Grid in 15 Minutes</h4>\n  <p style=\"margin:0 0 6px 0;font-size:12px;color:#a1a1aa;\">Code With Antonio &bull; 120K views</p>\n  <button type=\"button\" style=\"width:100%;padding:8px;background:#e11d48;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:bold;cursor:pointer;\">Watch Now</button>\n</div>",
    "starterHtml": "<div class=\"video-card\">\n  <!-- Add <img> thumbnail with duration <span>, <h4> video title, <p> channel and views, and <button>Watch Now</button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Video thumbnail image",
      "Video title heading",
      "Watch Now action button"
    ]
  },
  {
    "id": "html-easy-5m-review-form",
    "arena": "web_dev",
    "title": "Product Review Submission Form",
    "description": "Create a review submission form with an h3 Write a Review heading, reviewer name input, rating select dropdown (1 to 5 Stars), textarea for comments, and a Submit Review button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Product Review Submission Form",
    "targetComponentHtml": "<div class=\"review-box\" style=\"padding:18px;background:#0f172a;border:1px solid #1e293b;border-radius:14px;color:#fff;font-family:sans-serif;max-width:360px;\">\n  <h3 style=\"margin:0 0 6px 0;font-size:17px;color:#f8fafc;\">Write a Review</h3>\n  <p style=\"margin:0 0 14px 0;font-size:12px;color:#94a3b8;\">Share your feedback with the developer community.</p>\n  <form style=\"display:flex;flex-direction:column;gap:10px;\">\n    <label style=\"font-size:12px;color:#cbd5e1;\">Your Name:\n      <input type=\"text\" placeholder=\"e.g. Elena Rostova\" required style=\"width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\" />\n    </label>\n    <label style=\"font-size:12px;color:#cbd5e1;\">Rating Score:\n      <select style=\"width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\">\n        <option value=\"5\">\u2b50\u2b50\u2b50\u2b50\u2b50 (5 - Exceptional)</option>\n        <option value=\"4\">\u2b50\u2b50\u2b50\u2b50 (4 - Very Good)</option>\n        <option value=\"3\">\u2b50\u2b50\u2b50 (3 - Average)</option>\n      </select>\n    </label>\n    <label style=\"font-size:12px;color:#cbd5e1;\">Detailed Review:\n      <textarea rows=\"3\" placeholder=\"What did you like or dislike?\" required style=\"width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\"></textarea>\n    </label>\n    <button type=\"submit\" style=\"padding:9px;background:#0284c7;border:none;border-radius:8px;color:#fff;font-weight:bold;font-size:12px;cursor:pointer;\">Submit Review</button>\n  </form>\n</div>",
    "starterHtml": "<div class=\"review-box\">\n  <!-- Add <h3>Write a Review</h3>, <form> with Name input, Rating <select>, <textarea>, and Submit Review <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Heading",
      "Form with name input, select, textarea",
      "Submit Review button"
    ]
  },
  {
    "id": "html-easy-5m-kanban-card",
    "arena": "web_dev",
    "title": "Agile Sprint Kanban Task Card",
    "description": "Construct an agile sprint task card with a high priority tag, task title h4 Fix Authentication Flow, description snippet, deadline timestamp, and Move to Review button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Agile Sprint Kanban Task Card",
    "targetComponentHtml": "<div class=\"kanban-card\" style=\"padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;color:#fff;font-family:sans-serif;max-width:320px;\">\n  <div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;\">\n    <span style=\"font-size:10px;font-weight:bold;background:#dc2626;color:#fff;padding:2px 8px;border-radius:4px;text-transform:uppercase;\">High Priority</span>\n    <span style=\"font-size:11px;font-family:monospace;color:#71717a;\">KBX-104</span>\n  </div>\n  <h4 style=\"margin:0 0 6px 0;font-size:15px;color:#fafafa;\">Fix Authentication Flow</h4>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#a1a1aa;line-height:1.4;\">Resolve token refresh expiry redirect on battle arena matchmaking lobby.</p>\n  <div style=\"display:flex;justify-content:space-between;align-items:center;border-top:1px solid #27272a;padding-top:10px;\">\n    <time style=\"font-size:11px;color:#eab308;\">Due: Today</time>\n    <button type=\"button\" style=\"padding:4px 10px;background:#3b82f6;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;\">Move to Review</button>\n  </div>\n</div>",
    "starterHtml": "<div class=\"kanban-card\">\n  <!-- Add priority badge, <h4>Fix Authentication Flow</h4>, <p> task details, <time> due date, and Move to Review <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Priority badge",
      "Fix Authentication Flow heading",
      "Move to Review button"
    ]
  },
  {
    "id": "html-easy-5m-checkout-stepper",
    "arena": "web_dev",
    "title": "Checkout Progression Stepper",
    "description": "Build an ordered list representing a checkout progress tracker with an h4 Checkout Steps heading, listing Shipping (Completed), Payment (Active), and Confirmation (Upcoming), plus a Next Step button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Checkout Progression Stepper",
    "targetComponentHtml": "<div class=\"stepper-card\" style=\"padding:18px;background:#0f172a;border:1px solid #1e293b;border-radius:14px;color:#fff;font-family:sans-serif;max-width:340px;\">\n  <h4 style=\"margin:0 0 12px 0;font-size:15px;color:#f8fafc;\">Checkout Progress</h4>\n  <ol style=\"padding-left:20px;margin:0 0 16px 0;display:flex;flex-direction:column;gap:8px;font-size:13px;\">\n    <li style=\"color:#10b981;font-weight:bold;\">Shipping Address &bull; Completed</li>\n    <li style=\"color:#38bdf8;font-weight:bold;\">Payment Method &bull; In Progress</li>\n    <li style=\"color:#64748b;\">Order Confirmation &bull; Pending</li>\n  </ol>\n  <button type=\"button\" style=\"width:100%;padding:8px;background:#2563eb;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:bold;cursor:pointer;\">Continue to Payment</button>\n</div>",
    "starterHtml": "<div class=\"stepper-card\">\n  <!-- Add <h4>Checkout Progress</h4>, <ol> with 3 <li> steps, and Continue <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Checkout heading",
      "Ordered list <ol> with 3 steps",
      "Continue button"
    ]
  },
  {
    "id": "html-easy-5m-quote-card",
    "arena": "web_dev",
    "title": "Motivational Quote Card with Citation",
    "description": "Structure an inspiring quote using semantic blockquote and cite elements, with author heading Alan Kay, biographical subtitle, and a Share Quote button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Motivational Quote Card with Citation",
    "targetComponentHtml": "<div class=\"quote-card\" style=\"padding:20px;background:#18181b;border:1px solid #27272a;border-radius:14px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <blockquote style=\"margin:0 0 12px 0;font-size:15px;font-style:italic;color:#e4e4e7;line-height:1.5;\">\"The best way to predict the future is to invent it.\"</blockquote>\n  <div style=\"margin-bottom:14px;\">\n    <h4 style=\"margin:0;font-size:14px;color:#38bdf8;\">Alan Kay</h4>\n    <cite style=\"font-size:11px;color:#71717a;font-style:normal;\">Computer Pioneer &amp; Turing Award Laureate</cite>\n  </div>\n  <button type=\"button\" style=\"padding:6px 14px;background:#6366f1;border:none;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;\">Share Quote</button>\n</div>",
    "starterHtml": "<div class=\"quote-card\">\n  <!-- Add <blockquote> quote text, <h4>Alan Kay</h4>, <cite> biography, and Share Quote <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Semantic <blockquote> and <cite>",
      "Alan Kay author heading",
      "Share Quote button"
    ]
  },
  {
    "id": "html-easy-5m-upload-dropzone",
    "arena": "web_dev",
    "title": "File Upload Drop-Zone Box",
    "description": "Create a file upload panel using semantic fieldset and legend tags, a file input element, an unordered list of accepted formats (PDF, ZIP, PNG), and an Upload button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "File Upload Drop-Zone Box",
    "targetComponentHtml": "<div class=\"upload-panel\" style=\"padding:18px;background:#09090b;border:1px solid #27272a;border-radius:14px;color:#fff;font-family:sans-serif;max-width:360px;\">\n  <fieldset style=\"border:2px dashed #3f3f46;border-radius:10px;padding:16px;text-align:center;\">\n    <legend style=\"padding:0 8px;font-size:13px;font-weight:bold;color:#38bdf8;\">Upload Project Files</legend>\n    <p style=\"margin:0 0 10px 0;font-size:12px;color:#a1a1aa;\">Select code archive or document</p>\n    <input type=\"file\" style=\"margin-bottom:12px;color:#cbd5e1;font-size:12px;\" />\n    <ul style=\"list-style:none;padding:0;margin:0 0 12px 0;font-size:11px;color:#71717a;\">\n      <li>Accepted: ZIP, PDF, PNG (Max 25MB)</li>\n    </ul>\n    <button type=\"button\" style=\"padding:8px 18px;background:#10b981;border:none;border-radius:8px;color:#fff;font-weight:bold;font-size:12px;cursor:pointer;\">Upload Files</button>\n  </fieldset>\n</div>",
    "starterHtml": "<div class=\"upload-panel\">\n  <!-- Add <fieldset> with <legend>Upload Project Files</legend>, <input type=\"file\">, formats <ul>, and Upload <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Semantic <fieldset> and <legend>",
      "File <input type='file'>",
      "Upload button"
    ]
  },
  {
    "id": "html-easy-10m-order-summary",
    "arena": "web_dev",
    "title": "E-Commerce Checkout Order Summary Box",
    "description": "Build an e-commerce order summary container with an h3 Order Summary heading, a table of 2 purchased items with quantities and prices, subtotal and tax calculation rows, discount coupon form, and a Complete Purchase button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "E-Commerce Checkout Order Summary Box",
    "targetComponentHtml": "<div class=\"summary-container\" style=\"padding:22px;background:#0f172a;border:1px solid #1e293b;border-radius:16px;color:#fff;font-family:sans-serif;max-width:420px;\">\n  <h3 style=\"margin:0 0 14px 0;font-size:18px;color:#f8fafc;\">Order Summary</h3>\n  <table style=\"width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px;\">\n    <tbody>\n      <tr style=\"border-bottom:1px solid #1e293b;\">\n        <td style=\"padding:8px 0;\">Mechanical Keyboard (x1)</td>\n        <td style=\"padding:8px 0;text-align:right;font-family:monospace;\">$89.00</td>\n      </tr>\n      <tr style=\"border-bottom:1px solid #1e293b;\">\n        <td style=\"padding:8px 0;\">Braided USB-C Cable (x2)</td>\n        <td style=\"padding:8px 0;text-align:right;font-family:monospace;\">$24.00</td>\n      </tr>\n      <tr style=\"color:#94a3b8;\">\n        <td style=\"padding:6px 0;\">Subtotal</td>\n        <td style=\"padding:6px 0;text-align:right;font-family:monospace;\">$113.00</td>\n      </tr>\n      <tr style=\"color:#94a3b8;\">\n        <td style=\"padding:6px 0;\">Estimated Tax</td>\n        <td style=\"padding:6px 0;text-align:right;font-family:monospace;\">$9.04</td>\n      </tr>\n      <tr style=\"font-weight:bold;font-size:16px;color:#10b981;\">\n        <td style=\"padding:10px 0;\">Total Amount</td>\n        <td style=\"padding:10px 0;text-align:right;font-family:monospace;\">$122.04</td>\n      </tr>\n    </tbody>\n  </table>\n  <form style=\"display:flex;gap:8px;margin-bottom:16px;\">\n    <input type=\"text\" placeholder=\"Promo code\" style=\"flex:1;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#fff;font-size:12px;\" />\n    <button type=\"button\" style=\"padding:8px 14px;background:#334155;border:none;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;\">Apply</button>\n  </form>\n  <button type=\"button\" style=\"width:100%;padding:12px;background:#10b981;border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:bold;cursor:pointer;\">Complete Purchase</button>\n</div>",
    "starterHtml": "<div class=\"summary-container\">\n  <!-- Add <h3>Order Summary</h3>, <table> of items and total, promo code <form>, and Complete Purchase <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Order Summary heading",
      "Items breakdown table",
      "Promo form and Complete Purchase button"
    ]
  },
  {
    "id": "html-easy-10m-developer-bio",
    "arena": "web_dev",
    "title": "Full Developer Biography Card",
    "description": "Construct an extended developer profile with author photo img, h3 Devika Nair, biography paragraph, education details list, featured project links, and a Contact Me button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Full Developer Biography Card",
    "targetComponentHtml": "<div class=\"bio-card\" style=\"padding:22px;background:#18181b;border:1px solid #27272a;border-radius:16px;color:#fff;font-family:sans-serif;max-width:400px;\">\n  <div style=\"display:flex;align-items:center;gap:14px;margin-bottom:14px;\">\n    <img src=\"/logo.svg\" alt=\"Devika Nair\" width=\"56\" height=\"56\" style=\"border-radius:50%;background:#0284c7;\" />\n    <div>\n      <h3 style=\"margin:0;font-size:18px;color:#fafafa;\">Devika Nair</h3>\n      <p style=\"margin:2px 0 0 0;font-size:12px;color:#38bdf8;\">Full Stack Engineer &bull; AI Enthusiast</p>\n    </div>\n  </div>\n  <p style=\"margin:0 0 14px 0;font-size:13px;color:#a1a1aa;line-height:1.5;\">Passionate about building fast, accessible web applications and distributed backend architectures. Winner of Smart India Hackathon 2025.</p>\n  <h4 style=\"margin:0 0 8px 0;font-size:14px;color:#e4e4e7;\">Featured Projects</h4>\n  <ul style=\"padding-left:18px;margin:0 0 16px 0;font-size:12px;color:#cbd5e1;display:flex;flex-direction:column;gap:4px;\">\n    <li>Kollabrix Arena (Multiplayer Code Duels)</li>\n    <li>NeuroVoxel (WebGL 3D Visualizer)</li>\n  </ul>\n  <button type=\"button\" style=\"width:100%;padding:10px;background:#6366f1;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:bold;cursor:pointer;\">Contact Me</button>\n</div>",
    "starterHtml": "<div class=\"bio-card\">\n  <!-- Add <img> photo, <h3>Devika Nair</h3>, bio <p>, <h4>Featured Projects</h4>, <ul> project list, and Contact Me <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Devika Nair author heading and photo",
      "Bio description paragraph",
      "Featured Projects list and Contact button"
    ]
  },
  {
    "id": "html-easy-10m-team-roster",
    "arena": "web_dev",
    "title": "Hackathon Squad Roster Hub",
    "description": "Design a hackathon squad roster with squad name h3 Team CyberForge, squad motto, a 3-member unordered list with avatars, member names, roles (Frontend, Backend, AI), and a Join Squad button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Hackathon Squad Roster Hub",
    "targetComponentHtml": "<div class=\"roster-card\" style=\"padding:20px;background:#09090b;border:1px solid #27272a;border-radius:16px;color:#fff;font-family:sans-serif;max-width:380px;\">\n  <h3 style=\"margin:0 0 4px 0;font-size:18px;color:#facc15;\">Team CyberForge</h3>\n  <p style=\"margin:0 0 16px 0;font-size:12px;color:#71717a;\">Building Autonomous Multi-Agent Dev Environments</p>\n  <ul style=\"list-style:none;padding:0;margin:0 0 16px 0;display:flex;flex-direction:column;gap:10px;\">\n    <li style=\"display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#18181b;border-radius:8px;\">\n      <div><strong>Aarav Sen</strong><br><small style=\"color:#38bdf8;\">Lead Frontend</small></div>\n      <span style=\"font-size:10px;background:#0284c7;color:#fff;padding:2px 8px;border-radius:9999px;\">Ready</span>\n    </li>\n    <li style=\"display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#18181b;border-radius:8px;\">\n      <div><strong>Rohan Verma</strong><br><small style=\"color:#10b981;\">Backend Architect</small></div>\n      <span style=\"font-size:10px;background:#059669;color:#fff;padding:2px 8px;border-radius:9999px;\">Ready</span>\n    </li>\n    <li style=\"display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#18181b;border-radius:8px;\">\n      <div><strong>Zara Khan</strong><br><small style=\"color:#a855f7;\">AI Research</small></div>\n      <span style=\"font-size:10px;background:#7c3aed;color:#fff;padding:2px 8px;border-radius:9999px;\">Ready</span>\n    </li>\n  </ul>\n  <button type=\"button\" style=\"width:100%;padding:10px;background:#f59e0b;border:none;border-radius:8px;color:#000;font-size:13px;font-weight:bold;cursor:pointer;\">Join Squad</button>\n</div>",
    "starterHtml": "<div class=\"roster-card\">\n  <!-- Add <h3>Team CyberForge</h3>, motto <p>, <ul> with 3 team member <li> cards, and Join Squad <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Team CyberForge heading",
      "3 squad member entries",
      "Join Squad button"
    ]
  },
  {
    "id": "html-easy-10m-job-application",
    "arena": "web_dev",
    "title": "Internship Application Portal",
    "description": "Create an internship application portal with an h3 Software Engineering Internship heading, inputs for Full Name, College Email, Graduation Year select, resume file upload, cover letter textarea, and a Submit Application button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Internship Application Portal",
    "targetComponentHtml": "<div class=\"intern-form\" style=\"padding:22px;background:#0f172a;border:1px solid #1e293b;border-radius:16px;color:#fff;font-family:sans-serif;max-width:400px;\">\n  <h3 style=\"margin:0 0 6px 0;font-size:18px;color:#f8fafc;\">Internship Application</h3>\n  <p style=\"margin:0 0 16px 0;font-size:12px;color:#94a3b8;\">Frontend Engineering Intern &bull; Summer 2026</p>\n  <form style=\"display:flex;flex-direction:column;gap:10px;\">\n    <label style=\"font-size:12px;color:#cbd5e1;\">Full Legal Name:\n      <input type=\"text\" placeholder=\"e.g. Ananya Das\" required style=\"width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\" />\n    </label>\n    <label style=\"font-size:12px;color:#cbd5e1;\">University Email:\n      <input type=\"email\" placeholder=\"ananya@campus.edu\" required style=\"width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\" />\n    </label>\n    <label style=\"font-size:12px;color:#cbd5e1;\">Graduation Year:\n      <select style=\"width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\">\n        <option value=\"2026\">2026</option>\n        <option value=\"2027\">2027</option>\n        <option value=\"2028\">2028</option>\n      </select>\n    </label>\n    <label style=\"font-size:12px;color:#cbd5e1;\">Upload Resume (PDF):\n      <input type=\"file\" required style=\"width:100%;padding:6px;color:#94a3b8;font-size:11px;margin-top:4px;\" />\n    </label>\n    <label style=\"font-size:12px;color:#cbd5e1;\">Why do you want to join?:\n      <textarea rows=\"3\" placeholder=\"Brief motivation...\" style=\"width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\"></textarea>\n    </label>\n    <button type=\"submit\" style=\"margin-top:6px;padding:10px;background:#3b82f6;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:bold;cursor:pointer;\">Submit Application</button>\n  </form>\n</div>",
    "starterHtml": "<div class=\"intern-form\">\n  <!-- Add <h3>Internship Application</h3>, <form> with Name, Email, Graduation Year <select>, Resume <input type=\"file\">, Cover letter <textarea>, and Submit <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Internship Application heading",
      "Multi-input form with file upload",
      "Submit Application button"
    ]
  },
  {
    "id": "html-easy-10m-pricing-matrix",
    "arena": "web_dev",
    "title": "Tiered SaaS Pricing Comparison Matrix",
    "description": "Build a 3-tier pricing matrix table using table, thead, tbody, th, and td elements for Starter ($0), Pro ($19), and Enterprise ($99) plans with feature checks and Choose Plan buttons.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Tiered SaaS Pricing Comparison Matrix",
    "targetComponentHtml": "<div class=\"pricing-matrix\" style=\"padding:20px;background:#18181b;border:1px solid #27272a;border-radius:16px;color:#fff;font-family:sans-serif;max-width:440px;\">\n  <h3 style=\"margin:0 0 6px 0;font-size:18px;color:#fafafa;\">Flexible Plans</h3>\n  <p style=\"margin:0 0 14px 0;font-size:12px;color:#71717a;\">Choose the right tier for your squad.</p>\n  <table style=\"width:100%;border-collapse:collapse;font-size:12px;text-align:center;\">\n    <thead>\n      <tr style=\"border-bottom:1px solid #27272a;color:#94a3b8;\">\n        <th style=\"padding:8px;text-align:left;\">Feature</th>\n        <th style=\"padding:8px;\">Starter</th>\n        <th style=\"padding:8px;color:#38bdf8;\">Pro</th>\n        <th style=\"padding:8px;color:#facc15;\">Enterprise</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr style=\"border-bottom:1px solid #27272a;\">\n        <td style=\"padding:8px;text-align:left;\">Price / mo</td>\n        <td style=\"padding:8px;\">$0</td>\n        <td style=\"padding:8px;font-weight:bold;color:#38bdf8;\">$19</td>\n        <td style=\"padding:8px;font-weight:bold;color:#facc15;\">$99</td>\n      </tr>\n      <tr style=\"border-bottom:1px solid #27272a;\">\n        <td style=\"padding:8px;text-align:left;\">Battle Duels</td>\n        <td style=\"padding:8px;\">Unlimited</td>\n        <td style=\"padding:8px;\">Unlimited</td>\n        <td style=\"padding:8px;\">Unlimited</td>\n      </tr>\n      <tr style=\"border-bottom:1px solid #27272a;\">\n        <td style=\"padding:8px;text-align:left;\">AI Code Coach</td>\n        <td style=\"padding:8px;\">\u2715</td>\n        <td style=\"padding:8px;color:#10b981;\">\u2713</td>\n        <td style=\"padding:8px;color:#10b981;\">\u2713</td>\n      </tr>\n      <tr>\n        <td style=\"padding:10px 0;text-align:left;\">Action</td>\n        <td style=\"padding:10px 4px;\"><button type=\"button\" style=\"padding:4px 8px;background:#27272a;border:none;border-radius:4px;color:#fff;font-size:10px;\">Free</button></td>\n        <td style=\"padding:10px 4px;\"><button type=\"button\" style=\"padding:4px 8px;background:#0284c7;border:none;border-radius:4px;color:#fff;font-size:10px;\">Get Pro</button></td>\n        <td style=\"padding:10px 4px;\"><button type=\"button\" style=\"padding:4px 8px;background:#d97706;border:none;border-radius:4px;color:#fff;font-size:10px;\">Contact</button></td>\n      </tr>\n    </tbody>\n  </table>\n</div>",
    "starterHtml": "<div class=\"pricing-matrix\">\n  <!-- Add <h3>Flexible Plans</h3> and a <table> with Starter, Pro, and Enterprise columns, pricing rows, and action <button> elements -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Flexible Plans heading",
      "Comparison table with Starter, Pro, Enterprise",
      "Action buttons"
    ]
  },
  {
    "id": "html-easy-10m-conference-schedule",
    "arena": "web_dev",
    "title": "Tech Conference Schedule Agenda",
    "description": "Structure a conference agenda table with an h3 DevCon 2026 Schedule heading, showing 3 sessions with Time, Session Title, Speaker, Room Location, and Add to Calendar buttons.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Tech Conference Schedule Agenda",
    "targetComponentHtml": "<div class=\"schedule-card\" style=\"padding:20px;background:#0f172a;border:1px solid #1e293b;border-radius:16px;color:#fff;font-family:sans-serif;max-width:440px;\">\n  <h3 style=\"margin:0 0 6px 0;font-size:18px;color:#f8fafc;\">DevCon 2026 Schedule</h3>\n  <p style=\"margin:0 0 14px 0;font-size:12px;color:#94a3b8;\">Main Auditorium &bull; Track A</p>\n  <table style=\"width:100%;border-collapse:collapse;font-size:12px;text-align:left;\">\n    <thead>\n      <tr style=\"border-bottom:1px solid #334155;color:#64748b;\">\n        <th style=\"padding:6px;\">Time</th>\n        <th style=\"padding:6px;\">Session</th>\n        <th style=\"padding:6px;\">Speaker</th>\n        <th style=\"padding:6px;\">Action</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr style=\"border-bottom:1px solid #1e293b;\">\n        <td style=\"padding:8px 6px;color:#38bdf8;font-family:monospace;\">09:00 AM</td>\n        <td style=\"padding:8px 6px;font-weight:bold;\">Keynote: WebAssembly Era</td>\n        <td style=\"padding:8px 6px;\">Dr. K. Rao</td>\n        <td style=\"padding:8px 6px;\"><button type=\"button\" style=\"padding:4px 8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#fff;font-size:10px;\">+ Add</button></td>\n      </tr>\n      <tr style=\"border-bottom:1px solid #1e293b;\">\n        <td style=\"padding:8px 6px;color:#38bdf8;font-family:monospace;\">11:00 AM</td>\n        <td style=\"padding:8px 6px;font-weight:bold;\">Next-Gen React Architecture</td>\n        <td style=\"padding:8px 6px;\">Danielle Lee</td>\n        <td style=\"padding:8px 6px;\"><button type=\"button\" style=\"padding:4px 8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#fff;font-size:10px;\">+ Add</button></td>\n      </tr>\n      <tr>\n        <td style=\"padding:8px 6px;color:#38bdf8;font-family:monospace;\">02:00 PM</td>\n        <td style=\"padding:8px 6px;font-weight:bold;\">AI Agents in Production</td>\n        <td style=\"padding:8px 6px;\">Marcus Vance</td>\n        <td style=\"padding:8px 6px;\"><button type=\"button\" style=\"padding:4px 8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#fff;font-size:10px;\">+ Add</button></td>\n      </tr>\n    </tbody>\n  </table>\n</div>",
    "starterHtml": "<div class=\"schedule-card\">\n  <!-- Add <h3>DevCon 2026 Schedule</h3> and a <table> with Time, Session, Speaker, and + Add <button> entries -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "DevCon schedule heading",
      "Table with session times and speakers",
      "Add action buttons"
    ]
  },
  {
    "id": "html-easy-10m-survey-questionnaire",
    "arena": "web_dev",
    "title": "Campus Course Evaluation Survey",
    "description": "Construct a course evaluation questionnaire with an h3 Course Feedback Survey heading, course name text input, rating scale radio inputs, checkboxes for preferred topics, a comments textarea, and a Submit Survey button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Campus Course Evaluation Survey",
    "targetComponentHtml": "<div class=\"survey-card\" style=\"padding:22px;background:#18181b;border:1px solid #27272a;border-radius:16px;color:#fff;font-family:sans-serif;max-width:400px;\">\n  <h3 style=\"margin:0 0 6px 0;font-size:18px;color:#fafafa;\">Course Feedback Survey</h3>\n  <p style=\"margin:0 0 16px 0;font-size:12px;color:#71717a;\">Web Engineering &bull; Semester Evaluation</p>\n  <form style=\"display:flex;flex-direction:column;gap:12px;\">\n    <label style=\"font-size:12px;color:#d4d4d8;\">Course Code:\n      <input type=\"text\" value=\"CS-402 Web Technologies\" readonly style=\"width:100%;padding:8px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;color:#a1a1aa;font-size:12px;margin-top:4px;\" />\n    </label>\n    <div>\n      <span style=\"font-size:12px;color:#d4d4d8;display:block;margin-bottom:6px;\">Course Difficulty:</span>\n      <div style=\"display:flex;gap:12px;font-size:12px;\">\n        <label><input type=\"radio\" name=\"diff\" value=\"easy\" /> Easy</label>\n        <label><input type=\"radio\" name=\"diff\" value=\"moderate\" checked /> Moderate</label>\n        <label><input type=\"radio\" name=\"diff\" value=\"challenging\" /> Challenging</label>\n      </div>\n    </div>\n    <div>\n      <span style=\"font-size:12px;color:#d4d4d8;display:block;margin-bottom:6px;\">Topics You Enjoyed:</span>\n      <div style=\"display:flex;flex-direction:column;gap:4px;font-size:12px;\">\n        <label><input type=\"checkbox\" checked /> Semantic HTML &amp; Accessibility</label>\n        <label><input type=\"checkbox\" checked /> CSS Flexbox &amp; Grid Systems</label>\n        <label><input type=\"checkbox\" /> Web Workers &amp; Performance</label>\n      </div>\n    </div>\n    <label style=\"font-size:12px;color:#d4d4d8;\">Suggestions for Instructor:\n      <textarea rows=\"3\" placeholder=\"Additional feedback...\" style=\"width:100%;padding:8px;background:#27272a;border:1px solid #3f3f46;border-radius:6px;color:#fff;font-size:12px;margin-top:4px;\"></textarea>\n    </label>\n    <button type=\"submit\" style=\"padding:10px;background:#10b981;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:bold;cursor:pointer;\">Submit Survey</button>\n  </form>\n</div>",
    "starterHtml": "<div class=\"survey-card\">\n  <!-- Add <h3>Course Feedback Survey</h3>, <form> with Course input, difficulty radio inputs, topics checkboxes, <textarea>, and Submit Survey <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Course Feedback Survey heading",
      "Radio and checkbox input groups",
      "Submit Survey button"
    ]
  },
  {
    "id": "html-easy-10m-course-syllabus",
    "arena": "web_dev",
    "title": "Bootcamp Course Syllabus Guide",
    "description": "Build a structured bootcamp curriculum guide with an h3 Full-Stack Bootcamp Syllabus heading, prerequisite description, a 4-week ordered list (<ol>) with nested unordered lists (<ul>) for module topics, and an Enroll Now button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Bootcamp Course Syllabus Guide",
    "targetComponentHtml": "<div class=\"syllabus-card\" style=\"padding:22px;background:#0f172a;border:1px solid #1e293b;border-radius:16px;color:#fff;font-family:sans-serif;max-width:400px;\">\n  <h3 style=\"margin:0 0 6px 0;font-size:18px;color:#f8fafc;\">Full-Stack Bootcamp Syllabus</h3>\n  <p style=\"margin:0 0 14px 0;font-size:12px;color:#94a3b8;\">12-Week Intensive Career Track &bull; Zero to Hero</p>\n  <ol style=\"padding-left:20px;margin:0 0 18px 0;display:flex;flex-direction:column;gap:10px;font-size:13px;\">\n    <li>\n      <strong>Week 1-3: Modern HTML &amp; Responsive CSS</strong>\n      <ul style=\"padding-left:18px;margin-top:4px;font-size:11px;color:#94a3b8;\">\n        <li>Semantic Tags, Accessibility (a11y), SEO</li>\n        <li>Flexbox, CSS Grid, Fluid Typography</li>\n      </ul>\n    </li>\n    <li>\n      <strong>Week 4-7: JavaScript &amp; Modern DOM</strong>\n      <ul style=\"padding-left:18px;margin-top:4px;font-size:11px;color:#94a3b8;\">\n        <li>ES6+, Promises, Async/Await, Fetch API</li>\n      </ul>\n    </li>\n    <li>\n      <strong>Week 8-12: Full Stack Deployment &amp; Capstone</strong>\n      <ul style=\"padding-left:18px;margin-top:4px;font-size:11px;color:#94a3b8;\">\n        <li>Next.js, Supabase, Vercel &amp; CI/CD</li>\n      </ul>\n    </li>\n  </ol>\n  <button type=\"button\" style=\"width:100%;padding:10px;background:#6366f1;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:bold;cursor:pointer;\">Enroll Now</button>\n</div>",
    "starterHtml": "<div class=\"syllabus-card\">\n  <!-- Add <h3>Full-Stack Bootcamp Syllabus</h3>, <ol> for weeks with nested <ul> topic items, and Enroll Now <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Syllabus heading",
      "Nested ordered <ol> and unordered <ul> lists",
      "Enroll Now button"
    ]
  },
  {
    "id": "html-easy-10m-sponsor-wall",
    "arena": "web_dev",
    "title": "Corporate Sponsor Tier Wall",
    "description": "Design a hackathon corporate sponsor showcase with an h3 Our Partners heading, sections for Platinum and Gold sponsors with company logos and descriptions, and a Become a Sponsor link button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Corporate Sponsor Tier Wall",
    "targetComponentHtml": "<div class=\"sponsor-wall\" style=\"padding:22px;background:#09090b;border:1px solid #27272a;border-radius:16px;color:#fff;font-family:sans-serif;max-width:400px;text-align:center;\">\n  <h3 style=\"margin:0 0 4px 0;font-size:18px;color:#fafafa;\">Our Hackathon Partners</h3>\n  <p style=\"margin:0 0 16px 0;font-size:12px;color:#71717a;\">Proudly supported by leading tech innovators</p>\n  <div style=\"margin-bottom:14px;text-align:left;\">\n    <h5 style=\"margin:0 0 8px 0;font-size:12px;color:#38bdf8;text-transform:uppercase;\">\ud83d\udc8e Platinum Sponsors</h5>\n    <div style=\"display:flex;gap:10px;\">\n      <div style=\"flex:1;padding:10px;background:#18181b;border:1px solid #27272a;border-radius:8px;text-align:center;\">\n        <strong style=\"font-size:13px;display:block;\">Google Cloud</strong>\n        <small style=\"color:#71717a;font-size:10px;\">Cloud &amp; AI Infrastructure</small>\n      </div>\n      <div style=\"flex:1;padding:10px;background:#18181b;border:1px solid #27272a;border-radius:8px;text-align:center;\">\n        <strong style=\"font-size:13px;display:block;\">GitHub</strong>\n        <small style=\"color:#71717a;font-size:10px;\">Developer Tooling</small>\n      </div>\n    </div>\n  </div>\n  <div style=\"margin-bottom:16px;text-align:left;\">\n    <h5 style=\"margin:0 0 8px 0;font-size:12px;color:#facc15;text-transform:uppercase;\">\ud83e\udd47 Gold Sponsors</h5>\n    <div style=\"padding:10px;background:#18181b;border:1px solid #27272a;border-radius:8px;text-align:center;\">\n      <strong style=\"font-size:13px;display:block;\">Supabase</strong>\n      <small style=\"color:#71717a;font-size:10px;\">Open Source Backend Engine</small>\n    </div>\n  </div>\n  <button type=\"button\" style=\"width:100%;padding:10px;background:#27272a;border:1px solid #3f3f46;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;\">Become a Sponsor</button>\n</div>",
    "starterHtml": "<div class=\"sponsor-wall\">\n  <!-- Add <h3>Our Hackathon Partners</h3>, <h5>Platinum and Gold headings, sponsor cards, and Become a Sponsor <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Sponsor heading",
      "Tiered partner entries (Platinum & Gold)",
      "Become a Sponsor button"
    ]
  },
  {
    "id": "html-easy-10m-chef-recipe",
    "arena": "web_dev",
    "title": "Interactive Chef Recipe Step Card",
    "description": "Create a culinary recipe card with food photo img, h3 Classic Margherita Pizza heading, prep time details, an unordered ingredients list with checkbox inputs, an ordered cooking instructions list (<ol>), and a Save Recipe button.",
    "tags": [
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Interactive Chef Recipe Step Card",
    "targetComponentHtml": "<div class=\"recipe-card\" style=\"padding:22px;background:#18181b;border:1px solid #27272a;border-radius:16px;color:#fff;font-family:sans-serif;max-width:400px;\">\n  <img src=\"/logo.svg\" alt=\"Margherita Pizza\" width=\"100%\" height=\"140\" style=\"object-fit:cover;border-radius:10px;margin-bottom:12px;background:#451a03;display:block;\" />\n  <h3 style=\"margin:0 0 4px 0;font-size:18px;color:#fafafa;\">Classic Margherita Pizza</h3>\n  <p style=\"margin:0 0 14px 0;font-size:12px;color:#eab308;\">Prep: 15 min &bull; Cook: 10 min &bull; 4 Servings</p>\n  <h4 style=\"margin:0 0 8px 0;font-size:14px;color:#e4e4e7;\">Ingredients Checklist</h4>\n  <ul style=\"list-style:none;padding:0;margin:0 0 14px 0;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#d4d4d8;\">\n    <li><label><input type=\"checkbox\" checked /> 250g Pizza Dough</label></li>\n    <li><label><input type=\"checkbox\" checked /> 100g Fresh Mozzarella</label></li>\n    <li><label><input type=\"checkbox\" /> Fresh Basil Leaves &amp; Olive Oil</label></li>\n  </ul>\n  <h4 style=\"margin:0 0 8px 0;font-size:14px;color:#e4e4e7;\">Instructions</h4>\n  <ol style=\"padding-left:18px;margin:0 0 16px 0;display:flex;flex-direction:column;gap:4px;font-size:12px;color:#a1a1aa;\">\n    <li>Preheat oven to 250\u00b0C (480\u00b0F).</li>\n    <li>Stretch dough onto pizza stone and spread tomato sauce.</li>\n    <li>Top with mozzarella and bake for 8-10 minutes.</li>\n  </ol>\n  <button type=\"button\" style=\"width:100%;padding:10px;background:#e11d48;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:bold;cursor:pointer;\">Save Recipe</button>\n</div>",
    "starterHtml": "<div class=\"recipe-card\">\n  <!-- Add <img> photo, <h3>Classic Margherita Pizza</h3>, prep details, ingredients <ul> with checkboxes, instructions <ol>, and Save Recipe <button> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic HTML Structure & Content Alignment"
      }
    ],
    "validationCriteria": [
      "Recipe heading and image",
      "Ingredients checklist and cooking instructions",
      "Save Recipe button"
    ]
  }
];
