import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * Calibrated Battle Arena Questions (30 items)
 * Designed for collegiate speed-coding with ~30 seconds margin to spare.
 */
export const HTML_MEDIUM_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "html-med-3m-audio-transcript",
    "arena": "web_dev",
    "title": "Audio Player with Track Transcript",
    "description": "Create an audio player component using semantic HTML. Include an <audio controls> element with a fallback message, wrapped inside a <figure> alongside a <figcaption> that displays an synchronized lyric/transcript excerpt.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Audio Player with Track Transcript",
    "targetComponentHtml": "<figure>\n  <h3>Keynote Track: Future of AI</h3>\n  <audio controls>\n    <source src=\"/demo-audio.mp3\" type=\"audio/mpeg\">\n    Your browser does not support the audio element.\n  </audio>\n  <figcaption>\n    <strong>Transcript:</strong> \"Autonomous agents collaborate in low-latency real-time streams.\"\n  </figcaption>\n</figure>",
    "starterHtml": "<div class=\"audio-container\">\n  <!-- Build <figure> with <h3>, <audio controls> with fallback, and <figcaption> with transcript text -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Audio with Semantic Figure and Figcaption"
      }
    ],
    "validationCriteria": [
      "Keynote Track title",
      "Audio controls with fallback text",
      "Transcript figcaption"
    ]
  },
  {
    "id": "html-med-3m-accessible-fieldset-form",
    "arena": "web_dev",
    "title": "Accessible Multi-Fieldset Contact Form",
    "description": "Construct an accessible contact form with two distinct <fieldset> containers. First fieldset for 'Personal Details' containing name and email. Second fieldset for 'Project Budget' with radio buttons and proper <legend> tags.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Accessible Multi-Fieldset Contact Form",
    "targetComponentHtml": "<form>\n  <fieldset>\n    <legend>Personal Details</legend>\n    <label for=\"name\">Full Name:</label>\n    <input type=\"text\" id=\"name\" name=\"name\" required>\n    <label for=\"email\">Email Address:</label>\n    <input type=\"email\" id=\"email\" name=\"email\" required>\n  </fieldset>\n  <fieldset>\n    <legend>Project Budget</legend>\n    <label><input type=\"radio\" name=\"budget\" value=\"tier1\"> Under $5,000</label>\n    <label><input type=\"radio\" name=\"budget\" value=\"tier2\"> $5,000 - $15,000</label>\n  </fieldset>\n  <button type=\"submit\">Send Inquiry</button>\n</form>",
    "starterHtml": "<div class=\"form-container\">\n  <!-- Construct <form> with 2 <fieldset> elements, <legend> titles, labels, inputs, and submit button -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Accessible Fieldsets, Legends, and Inputs"
      }
    ],
    "validationCriteria": [
      "Personal Details fieldset",
      "Project Budget fieldset with radio options",
      "Send Inquiry button"
    ]
  },
  {
    "id": "html-med-3m-product-comparison-matrix",
    "arena": "web_dev",
    "title": "Product Comparison Matrix Table",
    "description": "Create a structured semantic product comparison table featuring <caption>, <thead>, <tbody>, and <tfoot> with scope='col' and scope='row' on headers.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Product Comparison Matrix",
    "targetComponentHtml": "<table>\n  <caption>Plan Comparison Matrix</caption>\n  <thead>\n    <tr>\n      <th scope=\"col\">Feature</th>\n      <th scope=\"col\">Starter</th>\n      <th scope=\"col\">Pro</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th scope=\"row\">Bandwidth</th>\n      <td>50 GB</td>\n      <td>Unlimited</td>\n    </tr>\n    <tr>\n      <th scope=\"row\">Custom Domain</th>\n      <td>No</td>\n      <td>Yes</td>\n    </tr>\n  </tbody>\n  <tfoot>\n    <tr>\n      <td>Price / Month</td>\n      <td>$0</td>\n      <td>$29</td>\n    </tr>\n  </tfoot>\n</table>",
    "starterHtml": "<div class=\"matrix-wrapper\">\n  <!-- Build <table> with <caption>, <thead>, <tbody>, <tfoot>, and scope attributes -->\n  \n</div>",
    "starterCss": "/* HTML Challenge */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic Matrix Table with Scoped Headers"
      }
    ],
    "validationCriteria": [
      "Plan Comparison Matrix caption",
      "Starter and Pro columns",
      "Bandwidth and Custom Domain rows",
      "Price summary footer"
    ]
  },
  {
    "id": "html-med-3m-interactive-dialog-notice",
    "arena": "web_dev",
    "title": "Interactive Dialog Announcement",
    "description": "Construct an open HTML5 native <dialog open> element containing an alert header, security advisory notice text, and a <form method='dialog'> with a Dismiss button.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Interactive Dialog Announcement",
    "targetComponentHtml": "<dialog open>\n  <h4>\n    \u26a0\ufe0f Security Advisory\n  </h4>\n  <p>\n    Multi-factor authentication will be strictly enforced for all collegiate accounts starting midnight.\n  </p>\n  <form method=\"dialog\">\n    <button>Dismiss Alert</button>\n  </form>\n</dialog>",
    "starterHtml": "<div>\n  <!-- Build <dialog open> with Security Advisory heading, advisory text, and <form method='dialog'> button -->\n  \n</div>",
    "starterCss": "/* HTML Challenge */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Native Dialog Element with Form Method"
      }
    ],
    "validationCriteria": [
      "Security Advisory heading",
      "MFA enforcement text",
      "Dismiss Alert button inside dialog form"
    ]
  },
  {
    "id": "html-med-3m-technical-glossary-dl",
    "arena": "web_dev",
    "title": "Technical Glossary Term List",
    "description": "Build a technical glossary using the semantic description list elements: <dl>, <dt>, and <dd>. Include 2 defined terms with <dfn> tags and acronym attributes.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Technical Glossary Term List",
    "targetComponentHtml": "<div>\n  <h3>Web Protocols Glossary</h3>\n  <dl>\n    <dt><dfn title=\"Hypertext Transfer Protocol\">HTTP</dfn></dt>\n    <dd>The underlying protocol used by the World Wide Web to transmit hypermedia documents.</dd>\n    <dt><dfn title=\"WebSockets\">WSS</dfn></dt>\n    <dd>Persistent full-duplex communication channel over a single TCP connection.</dd>\n  </dl>\n</div>",
    "starterHtml": "<div class=\"glossary\">\n  <!-- Build <dl> containing <dt> terms with <dfn> tags and <dd> definitions -->\n  \n</div>",
    "starterCss": "/* HTML Challenge */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic Description List (<dl>, <dt>, <dd>)"
      }
    ],
    "validationCriteria": [
      "Web Protocols Glossary heading",
      "HTTP definition term",
      "WSS definition term"
    ]
  },
  {
    "id": "html-med-3m-downloadable-resource-card",
    "arena": "web_dev",
    "title": "Downloadable Resource Link Card",
    "description": "Create a downloadable resource card with an <a> tag with download attribute, file metadata badge, and a semantic <meter> tag representing local storage quota.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Downloadable Resource Link Card",
    "targetComponentHtml": "<div>\n  <h4>Hackathon Starter Kit (v2.4)</h4>\n  <p>Contains Next.js 14 template, Supabase client, and Tailwind configuration.</p>\n  <div>\n    Storage Quota: <meter value=\"72\" min=\"0\" max=\"100\">72%</meter> 72 MB / 100 MB\n  </div>\n  <a href=\"/starter-kit.zip\" download=\"starter-kit-v2.zip\">Download Zip (14.2 MB)</a>\n</div>",
    "starterHtml": "<div class=\"resource-card\">\n  <!-- Build resource card with <h4> title, <meter> storage indicator, and <a> tag with download attribute -->\n  \n</div>",
    "starterCss": "/* HTML Challenge */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Download Attribute and Semantic Meter Tag"
      }
    ],
    "validationCriteria": [
      "Hackathon Starter Kit title",
      "Storage Quota meter tag",
      "Download Zip link with download attribute"
    ]
  },
  {
    "id": "html-med-3m-article-metadata-header",
    "arena": "web_dev",
    "title": "Semantic Article Metadata Header",
    "description": "Build an accessible blog <article> header with breadcrumbs <nav aria-label='Breadcrumbs'>, <time datetime='2026-11-21'>, and author contact inside an <address> tag.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Semantic Article Metadata Header",
    "targetComponentHtml": "<article>\n  <header>\n    <nav aria-label=\"Breadcrumbs\">\n      <a href=\"#home\">Home</a> &gt;\n      <a href=\"#articles\">Articles</a> &gt;\n      <span>Architecture</span>\n    </nav>\n    <h2>Zero-Latency WebSockets</h2>\n    <div>\n      <time datetime=\"2026-11-21\">November 21, 2026</time>\n      <span>\u2022</span>\n      <address>By <a href=\"mailto:alex@kollabrix.in\">Alex Vance</a></address>\n    </div>\n  </header>\n</article>",
    "starterHtml": "<div class=\"article-wrapper\">\n  <!-- Build <article> with <header>, <nav aria-label='Breadcrumbs'>, <time>, and <address> elements -->\n  \n</div>",
    "starterCss": "/* HTML Challenge */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic Breadcrumbs, Time, and Address Tags"
      }
    ],
    "validationCriteria": [
      "Breadcrumbs navigation",
      "Zero-Latency WebSockets heading",
      "Time element with datetime",
      "Author address tag"
    ]
  },
  {
    "id": "html-med-3m-live-event-schedule",
    "arena": "web_dev",
    "title": "Live Event Schedule Timetable",
    "description": "Construct an event schedule table utilizing rowspan and colspan correctly to demonstrate overlapping keynote and track sessions across 2 days.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Live Event Schedule Timetable",
    "targetComponentHtml": "<table border=\"1\">\n  <caption>Hackathon Weekend Timetable</caption>\n  <thead>\n    <tr>\n      <th>Time</th>\n      <th>Track A</th>\n      <th>Track B</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>10:00 AM</td>\n      <td colspan=\"2\">Opening Ceremony Keynote</td>\n    </tr>\n    <tr>\n      <td>11:30 AM</td>\n      <td rowspan=\"2\">Frontend Blitz</td>\n      <td>Smart Contracts</td>\n    </tr>\n    <tr>\n      <td>12:30 PM</td>\n      <td>Backend Scaling</td>\n    </tr>\n  </tbody>\n</table>",
    "starterHtml": "<div>\n  <!-- Construct <table> with <caption>, <thead>, and <tbody> using colspan='2' and rowspan='2' correctly -->\n  \n</div>",
    "starterCss": "/* HTML Challenge */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Table with Rowspan and Colspan Matrix"
      }
    ],
    "validationCriteria": [
      "Hackathon Weekend Timetable caption",
      "Opening Ceremony Keynote spanning 2 columns",
      "Frontend Blitz spanning 2 rows"
    ]
  },
  {
    "id": "html-med-3m-collapsible-faq-drawer",
    "arena": "web_dev",
    "title": "Interactive Collapsible FAQ Drawer",
    "description": "Construct a collapsible FAQ list with two <details> elements containing <summary> titles and <mark> highlighted search terms.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Interactive Collapsible FAQ Drawer",
    "targetComponentHtml": "<div>\n  <h3>Frequently Asked Questions</h3>\n  <details open>\n    <summary>Can I compete solo in the Arena?</summary>\n    <p>Yes, you can initiate a <mark>1v1 Duel</mark> against campus peers or the automated practice bot.</p>\n  </details>\n  <details>\n    <summary>Are anti-cheat rules enforced?</summary>\n    <p>Yes, switching tabs triggers a sentinel warning and notifies your opponent in real-time.</p>\n  </details>\n</div>",
    "starterHtml": "<div class=\"faq-container\">\n  <!-- Build FAQ with 2 <details> elements, <summary> headers, and a <mark> highlighted badge -->\n  \n</div>",
    "starterCss": "/* HTML Challenge */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic Details and Summary Tags with Mark"
      }
    ],
    "validationCriteria": [
      "Frequently Asked Questions header",
      "1v1 Duel highlighted in mark",
      "Anti-cheat question details"
    ]
  },
  {
    "id": "html-med-3m-search-filter-datalist",
    "arena": "web_dev",
    "title": "Rich Search Bar with Datalist Suggestions",
    "description": "Build an accessible search form using <input type='search'> linked to a <datalist> offering 4 technology suggestions (HTML, CSS, JavaScript, WebAssembly).",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Search Bar with Datalist",
    "targetComponentHtml": "<form role=\"search\">\n  <label for=\"tech-search\">Explore Technology Topics</label>\n  <div>\n    <input type=\"search\" id=\"tech-search\" name=\"q\" list=\"tech-options\" placeholder=\"Search tech stack...\">\n    <datalist id=\"tech-options\">\n      <option value=\"HTML5 Semantic Markup\">\n      <option value=\"CSS3 Modern Flexbox & Grid\">\n      <option value=\"JavaScript ES2024\">\n      <option value=\"WebAssembly Systems\">\n    </datalist>\n    <button type=\"submit\">Search</button>\n  </div>\n</form>",
    "starterHtml": "<div>\n  <!-- Build <form role='search'> with <input type='search' list='tech-options'> and <datalist> -->\n  \n</div>",
    "starterCss": "/* HTML Challenge */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Search Input linked to Datalist Options"
      }
    ],
    "validationCriteria": [
      "Explore Technology Topics label",
      "Search input with list attribute",
      "Datalist containing 4 options",
      "Search button"
    ]
  },
  {
    "id": "html-med-5m-intake-form",
    "arena": "web_dev",
    "title": "Collegiate Application Intake Form",
    "description": "Application form with file upload, pattern validation for GPA, and date picker.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Application Form",
    "targetComponentHtml": "<div>\n  <h3>Collegiate Application Intake Form</h3>\n  <p>Application form with file upload, pattern validation for GPA, and date picker.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>John Doe</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"intake-form-container\">\n  <!-- Build Collegiate Application Intake Form: Application form with file upload, pattern validation for GPA, and date picker. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Collegiate Application Intake Form"
      }
    ],
    "validationCriteria": [
      "Collegiate Application Intake Form",
      "John Doe",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-order-receipt",
    "arena": "web_dev",
    "title": "E-Commerce Order Receipt Summary",
    "description": "Itemized table invoice with price breakdowns, discount voucher inputs, and <output> total.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Order Receipt",
    "targetComponentHtml": "<div>\n  <h3>E-Commerce Order Receipt Summary</h3>\n  <p>Itemized table invoice with price breakdowns, discount voucher inputs, and <output> total.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>Invoice Total</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"order-receipt-container\">\n  <!-- Build E-Commerce Order Receipt Summary: Itemized table invoice with price breakdowns, discount voucher inputs, and <output> total. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for E-Commerce Order Receipt Summary"
      }
    ],
    "validationCriteria": [
      "E-Commerce Order Receipt Summary",
      "Invoice Total",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-paper-abstract",
    "arena": "web_dev",
    "title": "Research Paper Abstract Layout",
    "description": "Scholarly document using <header>, <article>, <aside> for citations, and <cite>.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Research Abstract",
    "targetComponentHtml": "<div>\n  <h3>Research Paper Abstract Layout</h3>\n  <p>Scholarly document using <header>, <article>, <aside> for citations, and <cite>.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>Citation References</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"paper-abstract-container\">\n  <!-- Build Research Paper Abstract Layout: Scholarly document using <header>, <article>, <aside> for citations, and <cite>. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Research Paper Abstract Layout"
      }
    ],
    "validationCriteria": [
      "Research Paper Abstract Layout",
      "Citation References",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-podcast-hub",
    "arena": "web_dev",
    "title": "Podcast Episode Hub",
    "description": "Media card with dual audio players, track cues list, and host biography block.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Podcast Hub",
    "targetComponentHtml": "<div>\n  <h3>Podcast Episode Hub</h3>\n  <p>Media card with dual audio players, track cues list, and host biography block.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>Episode Chapters</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"podcast-hub-container\">\n  <!-- Build Podcast Episode Hub: Media card with dual audio players, track cues list, and host biography block. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Podcast Episode Hub"
      }
    ],
    "validationCriteria": [
      "Podcast Episode Hub",
      "Episode Chapters",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-survey-matrix",
    "arena": "web_dev",
    "title": "Interactive Survey Matrix",
    "description": "5-point Likert rating matrix using radio groups with accessible aria labels.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Campus Survey",
    "targetComponentHtml": "<div>\n  <h3>Interactive Survey Matrix</h3>\n  <p>5-point Likert rating matrix using radio groups with accessible aria labels.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>Strongly Agree</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"survey-matrix-container\">\n  <!-- Build Interactive Survey Matrix: 5-point Likert rating matrix using radio groups with accessible aria labels. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Interactive Survey Matrix"
      }
    ],
    "validationCriteria": [
      "Interactive Survey Matrix",
      "Strongly Agree",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-terms-service",
    "arena": "web_dev",
    "title": "Multi-Section Terms of Service",
    "description": "Document layout with jump anchors (href='#sec-1'), sections, and agreement dialog.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Terms of Service",
    "targetComponentHtml": "<div>\n  <h3>Multi-Section Terms of Service</h3>\n  <p>Document layout with jump anchors (href='#sec-1'), sections, and agreement dialog.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>Legal Agreement</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"terms-service-container\">\n  <!-- Build Multi-Section Terms of Service: Document layout with jump anchors (href='#sec-1'), sections, and agreement dialog. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Multi-Section Terms of Service"
      }
    ],
    "validationCriteria": [
      "Multi-Section Terms of Service",
      "Legal Agreement",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-team-roster",
    "arena": "web_dev",
    "title": "Hackathon Team Roster Card",
    "description": "Roster of 4 students with avatars, check-in status <time>, and progress bar.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Team Roster",
    "targetComponentHtml": "<div>\n  <h3>Hackathon Team Roster Card</h3>\n  <p>Roster of 4 students with avatars, check-in status <time>, and progress bar.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>Sprint Progress</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"team-roster-container\">\n  <!-- Build Hackathon Team Roster Card: Roster of 4 students with avatars, check-in status <time>, and progress bar. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Hackathon Team Roster Card"
      }
    ],
    "validationCriteria": [
      "Hackathon Team Roster Card",
      "Sprint Progress",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-code-docs",
    "arena": "web_dev",
    "title": "Code Documentation Snippet Showcase",
    "description": "Documentation block using <pre><code>, <samp> terminal output, and <kbd> shortcut keys.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Code Documentation",
    "targetComponentHtml": "<div>\n  <h3>Code Documentation Snippet Showcase</h3>\n  <p>Documentation block using <pre><code>, <samp> terminal output, and <kbd> shortcut keys.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>Terminal Output</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"code-docs-container\">\n  <!-- Build Code Documentation Snippet Showcase: Documentation block using <pre><code>, <samp> terminal output, and <kbd> shortcut keys. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Code Documentation Snippet Showcase"
      }
    ],
    "validationCriteria": [
      "Code Documentation Snippet Showcase",
      "Terminal Output",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-ticket-booking",
    "arena": "web_dev",
    "title": "Event Ticket Booking Form",
    "description": "Form with seat category dropdown, quantity stepper, and time schedule badge.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Ticket Booking",
    "targetComponentHtml": "<div>\n  <h3>Event Ticket Booking Form</h3>\n  <p>Form with seat category dropdown, quantity stepper, and time schedule badge.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>VIP Admission</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"ticket-booking-container\">\n  <!-- Build Event Ticket Booking Form: Form with seat category dropdown, quantity stepper, and time schedule badge. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Event Ticket Booking Form"
      }
    ],
    "validationCriteria": [
      "Event Ticket Booking Form",
      "VIP Admission",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-5m-video-reel",
    "arena": "web_dev",
    "title": "Video Reel Showcase with Fallback",
    "description": "Video container with poster, multiple <source> formats, and fallback text.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Video Showcase",
    "targetComponentHtml": "<div>\n  <h3>Video Reel Showcase with Fallback</h3>\n  <p>Video container with poster, multiple <source> formats, and fallback text.</p>\n  <div>\n    <strong>Key Specification:</strong> <span>Keynote Highlights</span>\n  </div>\n  <button type=\"button\">Confirm Action</button>\n</div>",
    "starterHtml": "<div class=\"video-reel-container\">\n  <!-- Build Video Reel Showcase with Fallback: Video container with poster, multiple <source> formats, and fallback text. -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Semantic structure and content for Video Reel Showcase with Fallback"
      }
    ],
    "validationCriteria": [
      "Video Reel Showcase with Fallback",
      "Keynote Highlights",
      "Confirm Action"
    ]
  },
  {
    "id": "html-med-10m-job-portal",
    "arena": "web_dev",
    "title": "Campus Job Portal Page",
    "description": "Full job board featuring search with datalist, 3 job articles with salary meters, and application form.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Campus Job Portal",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Campus Job Portal Page</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Full job board featuring search with datalist, 3 job articles with salary meters, and application form.</p>\n    <div>\n      <strong>Core Requirement:</strong> Software Engineer Intern\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"job-portal-container\">\n  <!-- Build complete Campus Job Portal Page meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Campus Job Portal Page"
      }
    ],
    "validationCriteria": [
      "Campus Job Portal Page",
      "Software Engineer Intern",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-gpa-transcript",
    "arena": "web_dev",
    "title": "Collegiate Gradebook & GPA Transcript",
    "description": "Academic table with course codes, credit hours, letter grades, and weighted GPA footer.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Gradebook Transcript",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Collegiate Gradebook & GPA Transcript</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Academic table with course codes, credit hours, letter grades, and weighted GPA footer.</p>\n    <div>\n      <strong>Core Requirement:</strong> Cumulative GPA 3.85\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"gpa-transcript-container\">\n  <!-- Build complete Collegiate Gradebook & GPA Transcript meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Collegiate Gradebook & GPA Transcript"
      }
    ],
    "validationCriteria": [
      "Collegiate Gradebook & GPA Transcript",
      "Cumulative GPA 3.85",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-portfolio-doc",
    "arena": "web_dev",
    "title": "Full Developer Portfolio Document",
    "description": "Complete single-page portfolio layout with nav, hero header, projects section, and contact form.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Developer Portfolio",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Full Developer Portfolio Document</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Complete single-page portfolio layout with nav, hero header, projects section, and contact form.</p>\n    <div>\n      <strong>Core Requirement:</strong> Selected Projects\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"portfolio-doc-container\">\n  <!-- Build complete Full Developer Portfolio Document meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Full Developer Portfolio Document"
      }
    ],
    "validationCriteria": [
      "Full Developer Portfolio Document",
      "Selected Projects",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-conf-timetable",
    "arena": "web_dev",
    "title": "Conference Timetable with 3 Parallel Tracks",
    "description": "Multi-column timetable with thead, tbody, colspan/rowspan tracks, and keynote breaks.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Conference Timetable",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Conference Timetable with 3 Parallel Tracks</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Multi-column timetable with thead, tbody, colspan/rowspan tracks, and keynote breaks.</p>\n    <div>\n      <strong>Core Requirement:</strong> Grand Ballroom\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"conf-timetable-container\">\n  <!-- Build complete Conference Timetable with 3 Parallel Tracks meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Conference Timetable with 3 Parallel Tracks"
      }
    ],
    "validationCriteria": [
      "Conference Timetable with 3 Parallel Tracks",
      "Grand Ballroom",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-patient-intake",
    "arena": "web_dev",
    "title": "Healthcare Patient Intake Form",
    "description": "Medical form with emergency contact fieldset, allergy checklist, and HIPAA agreement dialog.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Patient Intake",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Healthcare Patient Intake Form</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Medical form with emergency contact fieldset, allergy checklist, and HIPAA agreement dialog.</p>\n    <div>\n      <strong>Core Requirement:</strong> Medical History\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"patient-intake-container\">\n  <!-- Build complete Healthcare Patient Intake Form meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Healthcare Patient Intake Form"
      }
    ],
    "validationCriteria": [
      "Healthcare Patient Intake Form",
      "Medical History",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-docs-guide",
    "arena": "web_dev",
    "title": "Interactive Documentation Guide",
    "description": "Technical manual with sticky table of contents, code blocks, syntax notes, and revision table.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Documentation Guide",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Interactive Documentation Guide</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Technical manual with sticky table of contents, code blocks, syntax notes, and revision table.</p>\n    <div>\n      <strong>Core Requirement:</strong> API Endpoints\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"docs-guide-container\">\n  <!-- Build complete Interactive Documentation Guide meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Interactive Documentation Guide"
      }
    ],
    "validationCriteria": [
      "Interactive Documentation Guide",
      "API Endpoints",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-food-checkout",
    "arena": "web_dev",
    "title": "Food Delivery Checkout & Delivery Tracker",
    "description": "Order summary table with itemized pricing, delivery address validation, and tip selector.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Food Checkout",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Food Delivery Checkout & Delivery Tracker</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Order summary table with itemized pricing, delivery address validation, and tip selector.</p>\n    <div>\n      <strong>Core Requirement:</strong> Estimated Delivery\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"food-checkout-container\">\n  <!-- Build complete Food Delivery Checkout & Delivery Tracker meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Food Delivery Checkout & Delivery Tracker"
      }
    ],
    "validationCriteria": [
      "Food Delivery Checkout & Delivery Tracker",
      "Estimated Delivery",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-hackathon-portal",
    "arena": "web_dev",
    "title": "Student Hackathon Submission Portal",
    "description": "Project submission form with GitHub URL validation, demo video upload, and team checklist.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Hackathon Portal",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Student Hackathon Submission Portal</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Project submission form with GitHub URL validation, demo video upload, and team checklist.</p>\n    <div>\n      <strong>Core Requirement:</strong> Repository URL\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"hackathon-portal-container\">\n  <!-- Build complete Student Hackathon Submission Portal meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Student Hackathon Submission Portal"
      }
    ],
    "validationCriteria": [
      "Student Hackathon Submission Portal",
      "Repository URL",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-property-sheet",
    "arena": "web_dev",
    "title": "Real Estate Property Specification Sheet",
    "description": "Property listing with photo gallery figures, room specification table, and inquiry form.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Property Specification",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Real Estate Property Specification Sheet</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Property listing with photo gallery figures, room specification table, and inquiry form.</p>\n    <div>\n      <strong>Core Requirement:</strong> Square Footage\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"property-sheet-container\">\n  <!-- Build complete Real Estate Property Specification Sheet meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Real Estate Property Specification Sheet"
      }
    ],
    "validationCriteria": [
      "Real Estate Property Specification Sheet",
      "Square Footage",
      "Submit Entry"
    ]
  },
  {
    "id": "html-med-10m-crypto-whitepaper",
    "arena": "web_dev",
    "title": "Cryptocurrency Whitepaper Document",
    "description": "Whitepaper layout with executive summary, tokenomics allocation table, and legal disclaimer.",
    "tags": [
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Crypto Whitepaper",
    "targetComponentHtml": "<div>\n  <header>\n    <h2>Cryptocurrency Whitepaper Document</h2>\n    <span>Collegiate Championship Specification</span>\n  </header>\n  <div>\n    <p>Whitepaper layout with executive summary, tokenomics allocation table, and legal disclaimer.</p>\n    <div>\n      <strong>Core Requirement:</strong> Token Allocation\n    </div>\n  </div>\n  <footer>\n    <button type=\"submit\">Submit Entry</button>\n  </footer>\n</div>",
    "starterHtml": "<div class=\"crypto-whitepaper-container\">\n  <!-- Build complete Cryptocurrency Whitepaper Document meeting all specification criteria -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Comprehensive structure and content for Cryptocurrency Whitepaper Document"
      }
    ],
    "validationCriteria": [
      "Cryptocurrency Whitepaper Document",
      "Token Allocation",
      "Submit Entry"
    ]
  }
];
