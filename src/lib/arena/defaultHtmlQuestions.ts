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
    "targetComponentHtml": "<div class=\"profile-pill\">\n  <img src=\"/logo.svg\" alt=\"Avatar\" width=\"32\" height=\"32\" />\n  <div>\n    <h4>Alex Mercer</h4>\n    <span>\u25cf Online</span>\n  </div>\n  <button type=\"button\">Connect</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"newsletter-box\">\n  <h3>Developer Weekly</h3>\n  <p>Curated frontend engineering tips delivered to your inbox.</p>\n  <form>\n    <input type=\"email\" placeholder=\"Enter your email\" required />\n    <button type=\"submit\">Subscribe</button>\n  </form>\n</div>",
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
    "targetComponentHtml": "<div class=\"skills-strip\">\n  <h4>Core Competencies</h4>\n  <ul>\n    <li>HTML5</li>\n    <li>CSS3</li>\n    <li>JavaScript</li>\n    <li>Git</li>\n  </ul>\n</div>",
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
    "targetComponentHtml": "<div class=\"price-card\">\n  <h4>Mechanical Keyboard</h4>\n  <div>\n    <del>$129</del>\n    <strong>$89</strong>\n    <span>31% OFF</span>\n  </div>\n  <button type=\"button\">Add to Cart</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"podcast-player\">\n  <h4>The Future of Web Dev</h4>\n  <p>Hosted by Sarah Connor &bull; 24 min</p>\n  <audio controls>\n    <source src=\"#\" type=\"audio/mp3\">\n    Your browser does not support audio.\n  </audio>\n</div>",
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
    "targetComponentHtml": "<div class=\"search-container\">\n  <h4>Search Ecosystem</h4>\n  <div>\n    <input list=\"framework-list\" type=\"search\" placeholder=\"Type a framework...\" />\n    <datalist id=\"framework-list\">\n      <option value=\"React\" />\n      <option value=\"Vue\" />\n      <option value=\"Next.js\" />\n    </datalist>\n    <button type=\"button\">Search</button>\n  </div>\n</div>",
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
    "targetComponentHtml": "<div class=\"faq-widget\">\n  <h4>Platform FAQ</h4>\n  <details open>\n    <summary>What is Kollabrix Battle Arena?</summary>\n    <p>A real-time multiplayer code combat platform for college hackathon builders.</p>\n  </details>\n</div>",
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
    "targetComponentHtml": "<div class=\"alert-banner\">\n  <div>\n    <span>\u26a0\ufe0f</span>\n    <div>\n      <h5>Scheduled Maintenance</h5>\n      <p>Servers will restart tonight at 02:00 UTC.</p>\n    </div>\n  </div>\n  <button type=\"button\">Dismiss</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"progress-card\">\n  <h4>kollabrix-bundle.tar.gz</h4>\n  <p>Downloading &bull; 74 MB of 100 MB</p>\n  <progress value=\"74\" max=\"100\"></progress>\n  <div>\n    <button type=\"button\">Cancel</button>\n  </div>\n</div>",
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
    "targetComponentHtml": "<div class=\"rating-box\">\n  <h4>Rate Your Experience</h4>\n  <p>How fair was the match rating?</p>\n  <form>\n    <label><input type=\"radio\" name=\"score\" value=\"1\" /> 1\u2605</label>\n    <label><input type=\"radio\" name=\"score\" value=\"2\" /> 2\u2605</label>\n    <label><input type=\"radio\" name=\"score\" value=\"3\" /> 3\u2605</label>\n    <label><input type=\"radio\" name=\"score\" value=\"4\" /> 4\u2605</label>\n    <label><input type=\"radio\" name=\"score\" value=\"5\" checked /> 5\u2605</label>\n    <button type=\"submit\">Submit</button>\n  </form>\n</div>",
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
    "targetComponentHtml": "<div class=\"student-card\">\n  <h3>Apex Institute of Technology</h3>\n  <img src=\"/logo.svg\" alt=\"Student Photo\" width=\"80\" height=\"80\" />\n  <h4>Maya Patel</h4>\n  <p>B.Tech Computer Science &bull; Class of 2026</p>\n  <p>ID: AIT-2024-8842</p>\n  <button type=\"button\">Active Student</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"rsvp-card\">\n  <h3>Hackathon 2026 RSVP</h3>\n  <p>Confirm your attendance for the collegiate hackathon.</p>\n  <form>\n    <label>Full Name:\n      <input type=\"text\" placeholder=\"e.g. Rahul Sharma\" required />\n    </label>\n    <label>College Email:\n      <input type=\"email\" placeholder=\"name@college.edu\" required />\n    </label>\n    <label>T-Shirt Size:\n      <select>\n        <option value=\"S\">Small (S)</option>\n        <option value=\"M\">Medium (M)</option>\n        <option value=\"L\">Large (L)</option>\n        <option value=\"XL\">Extra Large (XL)</option>\n      </select>\n    </label>\n    <button type=\"submit\">Confirm RSVP</button>\n  </form>\n</div>",
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
    "targetComponentHtml": "<div class=\"leaderboard-card\">\n  <h3>Arena Leaderboard</h3>\n  <table>\n    <thead>\n      <tr>\n        <th>Rank</th>\n        <th>Player</th>\n        <th>Score</th>\n        <th>Badge</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td>#1</td>\n        <td>CipherNova</td>\n        <td>2,450</td>\n        <td><span>\ud83e\udd47 Grandmaster</span></td>\n      </tr>\n      <tr>\n        <td>#2</td>\n        <td>ByteForge</td>\n        <td>2,180</td>\n        <td><span>\ud83e\udd48 Master</span></td>\n      </tr>\n      <tr>\n        <td>#3</td>\n        <td>PixelValkyrie</td>\n        <td>1,920</td>\n        <td><span>\ud83e\udd49 Elite</span></td>\n      </tr>\n    </tbody>\n  </table>\n</div>",
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
    "targetComponentHtml": "<div class=\"post-card\">\n  <div>\n    <img src=\"/logo.svg\" alt=\"Liam Zhang\" width=\"40\" height=\"40\" />\n    <div>\n      <h4>Liam Zhang</h4>\n      <time>2 hours ago</time>\n    </div>\n  </div>\n  <p>Just shipped our collegiate hackathon submission built with Next.js and Supabase! Excited for the live judging round tomorrow.</p>\n  <div>\n    <button type=\"button\">\ud83d\udc4d Like (42)</button>\n    <button type=\"button\">\ud83d\udcac Comment (9)</button>\n  </div>\n</div>",
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
    "targetComponentHtml": "<div class=\"video-card\">\n  <div>\n    <img src=\"/images/arena-retro-sentinel-clean.png\" alt=\"Video Thumbnail\" width=\"100%\" height=\"160\" />\n    <span>14:30</span>\n  </div>\n  <h4>Mastering CSS Grid in 15 Minutes</h4>\n  <p>Code With Antonio &bull; 120K views</p>\n  <button type=\"button\">Watch Now</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"review-box\">\n  <h3>Write a Review</h3>\n  <p>Share your feedback with the developer community.</p>\n  <form>\n    <label>Your Name:\n      <input type=\"text\" placeholder=\"e.g. Elena Rostova\" required />\n    </label>\n    <label>Rating Score:\n      <select>\n        <option value=\"5\">\u2b50\u2b50\u2b50\u2b50\u2b50 (5 - Exceptional)</option>\n        <option value=\"4\">\u2b50\u2b50\u2b50\u2b50 (4 - Very Good)</option>\n        <option value=\"3\">\u2b50\u2b50\u2b50 (3 - Average)</option>\n      </select>\n    </label>\n    <label>Detailed Review:\n      <textarea rows=\"3\" placeholder=\"What did you like or dislike?\" required></textarea>\n    </label>\n    <button type=\"submit\">Submit Review</button>\n  </form>\n</div>",
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
    "targetComponentHtml": "<div class=\"kanban-card\">\n  <div>\n    <span>High Priority</span>\n    <span>KBX-104</span>\n  </div>\n  <h4>Fix Authentication Flow</h4>\n  <p>Resolve token refresh expiry redirect on battle arena matchmaking lobby.</p>\n  <div>\n    <time>Due: Today</time>\n    <button type=\"button\">Move to Review</button>\n  </div>\n</div>",
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
    "targetComponentHtml": "<div class=\"stepper-card\">\n  <h4>Checkout Progress</h4>\n  <ol>\n    <li>Shipping Address &bull; Completed</li>\n    <li>Payment Method &bull; In Progress</li>\n    <li>Order Confirmation &bull; Pending</li>\n  </ol>\n  <button type=\"button\">Continue to Payment</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"quote-card\">\n  <blockquote>\"The best way to predict the future is to invent it.\"</blockquote>\n  <div>\n    <h4>Alan Kay</h4>\n    <cite>Computer Pioneer &amp; Turing Award Laureate</cite>\n  </div>\n  <button type=\"button\">Share Quote</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"upload-panel\">\n  <fieldset>\n    <legend>Upload Project Files</legend>\n    <p>Select code archive or document</p>\n    <input type=\"file\" />\n    <ul>\n      <li>Accepted: ZIP, PDF, PNG (Max 25MB)</li>\n    </ul>\n    <button type=\"button\">Upload Files</button>\n  </fieldset>\n</div>",
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
    "targetComponentHtml": "<div class=\"summary-container\">\n  <h3>Order Summary</h3>\n  <table>\n    <tbody>\n      <tr>\n        <td>Mechanical Keyboard (x1)</td>\n        <td>$89.00</td>\n      </tr>\n      <tr>\n        <td>Braided USB-C Cable (x2)</td>\n        <td>$24.00</td>\n      </tr>\n      <tr>\n        <td>Subtotal</td>\n        <td>$113.00</td>\n      </tr>\n      <tr>\n        <td>Estimated Tax</td>\n        <td>$9.04</td>\n      </tr>\n      <tr>\n        <td>Total Amount</td>\n        <td>$122.04</td>\n      </tr>\n    </tbody>\n  </table>\n  <form>\n    <input type=\"text\" placeholder=\"Promo code\" />\n    <button type=\"button\">Apply</button>\n  </form>\n  <button type=\"button\">Complete Purchase</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"bio-card\">\n  <div>\n    <img src=\"/logo.svg\" alt=\"Devika Nair\" width=\"56\" height=\"56\" />\n    <div>\n      <h3>Devika Nair</h3>\n      <p>Full Stack Engineer &bull; AI Enthusiast</p>\n    </div>\n  </div>\n  <p>Passionate about building fast, accessible web applications and distributed backend architectures. Winner of Smart India Hackathon 2025.</p>\n  <h4>Featured Projects</h4>\n  <ul>\n    <li>Kollabrix Arena (Multiplayer Code Duels)</li>\n    <li>NeuroVoxel (WebGL 3D Visualizer)</li>\n  </ul>\n  <button type=\"button\">Contact Me</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"roster-card\">\n  <h3>Team CyberForge</h3>\n  <p>Building Autonomous Multi-Agent Dev Environments</p>\n  <ul>\n    <li>\n      <div><strong>Aarav Sen</strong><br><small>Lead Frontend</small></div>\n      <span>Ready</span>\n    </li>\n    <li>\n      <div><strong>Rohan Verma</strong><br><small>Backend Architect</small></div>\n      <span>Ready</span>\n    </li>\n    <li>\n      <div><strong>Zara Khan</strong><br><small>AI Research</small></div>\n      <span>Ready</span>\n    </li>\n  </ul>\n  <button type=\"button\">Join Squad</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"intern-form\">\n  <h3>Internship Application</h3>\n  <p>Frontend Engineering Intern &bull; Summer 2026</p>\n  <form>\n    <label>Full Legal Name:\n      <input type=\"text\" placeholder=\"e.g. Ananya Das\" required />\n    </label>\n    <label>University Email:\n      <input type=\"email\" placeholder=\"ananya@campus.edu\" required />\n    </label>\n    <label>Graduation Year:\n      <select>\n        <option value=\"2026\">2026</option>\n        <option value=\"2027\">2027</option>\n        <option value=\"2028\">2028</option>\n      </select>\n    </label>\n    <label>Upload Resume (PDF):\n      <input type=\"file\" required />\n    </label>\n    <label>Why do you want to join?:\n      <textarea rows=\"3\" placeholder=\"Brief motivation...\"></textarea>\n    </label>\n    <button type=\"submit\">Submit Application</button>\n  </form>\n</div>",
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
    "targetComponentHtml": "<div class=\"pricing-matrix\">\n  <h3>Flexible Plans</h3>\n  <p>Choose the right tier for your squad.</p>\n  <table>\n    <thead>\n      <tr>\n        <th>Feature</th>\n        <th>Starter</th>\n        <th>Pro</th>\n        <th>Enterprise</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td>Price / mo</td>\n        <td>$0</td>\n        <td>$19</td>\n        <td>$99</td>\n      </tr>\n      <tr>\n        <td>Battle Duels</td>\n        <td>Unlimited</td>\n        <td>Unlimited</td>\n        <td>Unlimited</td>\n      </tr>\n      <tr>\n        <td>AI Code Coach</td>\n        <td>\u2715</td>\n        <td>\u2713</td>\n        <td>\u2713</td>\n      </tr>\n      <tr>\n        <td>Action</td>\n        <td><button type=\"button\">Free</button></td>\n        <td><button type=\"button\">Get Pro</button></td>\n        <td><button type=\"button\">Contact</button></td>\n      </tr>\n    </tbody>\n  </table>\n</div>",
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
    "targetComponentHtml": "<div class=\"schedule-card\">\n  <h3>DevCon 2026 Schedule</h3>\n  <p>Main Auditorium &bull; Track A</p>\n  <table>\n    <thead>\n      <tr>\n        <th>Time</th>\n        <th>Session</th>\n        <th>Speaker</th>\n        <th>Action</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td>09:00 AM</td>\n        <td>Keynote: WebAssembly Era</td>\n        <td>Dr. K. Rao</td>\n        <td><button type=\"button\">+ Add</button></td>\n      </tr>\n      <tr>\n        <td>11:00 AM</td>\n        <td>Next-Gen React Architecture</td>\n        <td>Danielle Lee</td>\n        <td><button type=\"button\">+ Add</button></td>\n      </tr>\n      <tr>\n        <td>02:00 PM</td>\n        <td>AI Agents in Production</td>\n        <td>Marcus Vance</td>\n        <td><button type=\"button\">+ Add</button></td>\n      </tr>\n    </tbody>\n  </table>\n</div>",
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
    "targetComponentHtml": "<div class=\"survey-card\">\n  <h3>Course Feedback Survey</h3>\n  <p>Web Engineering &bull; Semester Evaluation</p>\n  <form>\n    <label>Course Code:\n      <input type=\"text\" value=\"CS-402 Web Technologies\" readonly />\n    </label>\n    <div>\n      <span>Course Difficulty:</span>\n      <div>\n        <label><input type=\"radio\" name=\"diff\" value=\"easy\" /> Easy</label>\n        <label><input type=\"radio\" name=\"diff\" value=\"moderate\" checked /> Moderate</label>\n        <label><input type=\"radio\" name=\"diff\" value=\"challenging\" /> Challenging</label>\n      </div>\n    </div>\n    <div>\n      <span>Topics You Enjoyed:</span>\n      <div>\n        <label><input type=\"checkbox\" checked /> Semantic HTML &amp; Accessibility</label>\n        <label><input type=\"checkbox\" checked /> CSS Flexbox &amp; Grid Systems</label>\n        <label><input type=\"checkbox\" /> Web Workers &amp; Performance</label>\n      </div>\n    </div>\n    <label>Suggestions for Instructor:\n      <textarea rows=\"3\" placeholder=\"Additional feedback...\"></textarea>\n    </label>\n    <button type=\"submit\">Submit Survey</button>\n  </form>\n</div>",
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
    "targetComponentHtml": "<div class=\"syllabus-card\">\n  <h3>Full-Stack Bootcamp Syllabus</h3>\n  <p>12-Week Intensive Career Track &bull; Zero to Hero</p>\n  <ol>\n    <li>\n      <strong>Week 1-3: Modern HTML &amp; Responsive CSS</strong>\n      <ul>\n        <li>Semantic Tags, Accessibility (a11y), SEO</li>\n        <li>Flexbox, CSS Grid, Fluid Typography</li>\n      </ul>\n    </li>\n    <li>\n      <strong>Week 4-7: JavaScript &amp; Modern DOM</strong>\n      <ul>\n        <li>ES6+, Promises, Async/Await, Fetch API</li>\n      </ul>\n    </li>\n    <li>\n      <strong>Week 8-12: Full Stack Deployment &amp; Capstone</strong>\n      <ul>\n        <li>Next.js, Supabase, Vercel &amp; CI/CD</li>\n      </ul>\n    </li>\n  </ol>\n  <button type=\"button\">Enroll Now</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"sponsor-wall\">\n  <h3>Our Hackathon Partners</h3>\n  <p>Proudly supported by leading tech innovators</p>\n  <div>\n    <h5>\ud83d\udc8e Platinum Sponsors</h5>\n    <div>\n      <div>\n        <strong>Google Cloud</strong>\n        <small>Cloud &amp; AI Infrastructure</small>\n      </div>\n      <div>\n        <strong>GitHub</strong>\n        <small>Developer Tooling</small>\n      </div>\n    </div>\n  </div>\n  <div>\n    <h5>\ud83e\udd47 Gold Sponsors</h5>\n    <div>\n      <strong>Supabase</strong>\n      <small>Open Source Backend Engine</small>\n    </div>\n  </div>\n  <button type=\"button\">Become a Sponsor</button>\n</div>",
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
    "targetComponentHtml": "<div class=\"recipe-card\">\n  <img src=\"/logo.svg\" alt=\"Margherita Pizza\" width=\"100%\" height=\"140\" />\n  <h3>Classic Margherita Pizza</h3>\n  <p>Prep: 15 min &bull; Cook: 10 min &bull; 4 Servings</p>\n  <h4>Ingredients Checklist</h4>\n  <ul>\n    <li><label><input type=\"checkbox\" checked /> 250g Pizza Dough</label></li>\n    <li><label><input type=\"checkbox\" checked /> 100g Fresh Mozzarella</label></li>\n    <li><label><input type=\"checkbox\" /> Fresh Basil Leaves &amp; Olive Oil</label></li>\n  </ul>\n  <h4>Instructions</h4>\n  <ol>\n    <li>Preheat oven to 250\u00b0C (480\u00b0F).</li>\n    <li>Stretch dough onto pizza stone and spread tomato sauce.</li>\n    <li>Top with mozzarella and bake for 8-10 minutes.</li>\n  </ol>\n  <button type=\"button\">Save Recipe</button>\n</div>",
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
