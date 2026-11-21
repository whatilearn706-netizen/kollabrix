import type { DuelQuestion } from '@/types/arenaDuel';

export const HTML_BUG_EASY_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "bughunt-html-easy-180s-unclosed-anchor",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Unclosed Anchor Link Spillage",
    "description": "Bug Diagnosis Ticket:\nUnclosed <a> tag spills blue underlined link formatting onto subsequent text.\n\nObjective:\nClose each <a> tag properly with </a>. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Unclosed Anchor Link Spillage",
    "targetComponentHtml": "<nav><a href=\"#home\">Home</a> | <a href=\"#about\">About</a> | <a href=\"#contact\">Contact</a></nav>",
    "starterHtml": "<!-- BUG: Unclosed <a> tag spills blue underlined link formatting onto subsequent text. -->\n<!-- Task: Close each <a> tag properly with </a> -->\n<nav><a href=\"#home\">Home | <a href=\"#about\">About | <a href=\"#contact\">Contact</nav>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Close each <a> tag properly with </a>"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Unclosed Anchor Link Spillage is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-broken-img-src",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Broken Image Source & Alt",
    "description": "Bug Diagnosis Ticket:\nImage tag uses 'scr' instead of 'src' and lacks an alt accessibility attribute.\n\nObjective:\nFix 'scr' attribute to 'src' and add alt='Company Logo'. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Broken Image Source & Alt",
    "targetComponentHtml": "<figure><img src=\"/logo.png\" alt=\"Company Logo\"><figcaption>Official Logo</figcaption></figure>",
    "starterHtml": "<!-- BUG: Image tag uses 'scr' instead of 'src' and lacks an alt accessibility attribute. -->\n<!-- Task: Fix 'scr' attribute to 'src' and add alt='Company Logo' -->\n<figure><img scr=\"/logo.png\"><figcaption>Official Logo</figcaption></figure>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Fix 'scr' attribute to 'src' and add alt='Company Logo'"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Broken Image Source & Alt is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-unlinked-label",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Unlinked Form Label",
    "description": "Bug Diagnosis Ticket:\nForm label is unclickable because 'for' attribute does not match input id.\n\nObjective:\nMatch label 'for' attribute with input 'id'. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Unlinked Form Label",
    "targetComponentHtml": "<div class=\"field\"><label for=\"user-email\">Email Address:</label><input type=\"email\" id=\"user-email\" name=\"email\"></div>",
    "starterHtml": "<!-- BUG: Form label is unclickable because 'for' attribute does not match input id. -->\n<!-- Task: Match label 'for' attribute with input 'id' -->\n<div class=\"field\"><label for=\"email-input\">Email Address:</label><input type=\"email\" id=\"user-email\" name=\"email\"></div>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Match label 'for' attribute with input 'id'"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Unlinked Form Label is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-radio-name-mismatch",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Radio Buttons Multiple Selection Bug",
    "description": "Bug Diagnosis Ticket:\nRadio options have different 'name' attributes allowing all options to be checked at once.\n\nObjective:\nSet identical name='plan' attribute on both radio inputs. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Radio Buttons Multiple Selection Bug",
    "targetComponentHtml": "<form><label><input type=\"radio\" name=\"plan\" value=\"free\" checked> Free</label><label><input type=\"radio\" name=\"plan\" value=\"pro\"> Pro</label></form>",
    "starterHtml": "<!-- BUG: Radio options have different 'name' attributes allowing all options to be checked at once. -->\n<!-- Task: Set identical name='plan' attribute on both radio inputs -->\n<form><label><input type=\"radio\" name=\"plan_free\" value=\"free\" checked> Free</label><label><input type=\"radio\" name=\"plan_pro\" value=\"pro\"> Pro</label></form>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Set identical name='plan' attribute on both radio inputs"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Radio Buttons Multiple Selection Bug is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-malformed-ol-items",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Malformed Ordered List Items",
    "description": "Bug Diagnosis Ticket:\nList items in <ol> are wrapped in <div> tags instead of <li> tags.\n\nObjective:\nReplace <div> items inside <ol> with semantic <li> tags. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Malformed Ordered List Items",
    "targetComponentHtml": "<ol><li>Initialize repository</li><li>Install dependencies</li><li>Run development server</li></ol>",
    "starterHtml": "<!-- BUG: List items in <ol> are wrapped in <div> tags instead of <li> tags. -->\n<!-- Task: Replace <div> items inside <ol> with semantic <li> tags -->\n<ol><div>Initialize repository</div><div>Install dependencies</div><div>Run development server</div></ol>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Replace <div> items inside <ol> with semantic <li> tags"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Malformed Ordered List Items is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-missing-submit-type",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Missing Submit Button Type",
    "description": "Bug Diagnosis Ticket:\nButton inside form has type='button' instead of type='submit', preventing form dispatch.\n\nObjective:\nChange button type to type='submit'. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Missing Submit Button Type",
    "targetComponentHtml": "<form action=\"/api/login\" method=\"POST\"><input type=\"text\" name=\"user\"><button type=\"submit\">Log In</button></form>",
    "starterHtml": "<!-- BUG: Button inside form has type='button' instead of type='submit', preventing form dispatch. -->\n<!-- Task: Change button type to type='submit' -->\n<form action=\"/api/login\" method=\"POST\"><input type=\"text\" name=\"user\"><button type=\"button\">Log In</button></form>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Change button type to type='submit'"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Missing Submit Button Type is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-unclosed-blockquote",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Unclosed Blockquote Tag",
    "description": "Bug Diagnosis Ticket:\nUnclosed <blockquote> swallows citation and author paragraph into quotation.\n\nObjective:\nClose <blockquote> tag before figcaption. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Unclosed Blockquote Tag",
    "targetComponentHtml": "<figure><blockquote>Simplicity is prerequisite for reliability.</blockquote><figcaption>&mdash; Edsger Dijkstra</figcaption></figure>",
    "starterHtml": "<!-- BUG: Unclosed <blockquote> swallows citation and author paragraph into quotation. -->\n<!-- Task: Close <blockquote> tag before figcaption -->\n<figure><blockquote>Simplicity is prerequisite for reliability.<figcaption>&mdash; Edsger Dijkstra</figcaption></figure>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Close <blockquote> tag before figcaption"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Unclosed Blockquote Tag is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-checkbox-missing-name",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Checkbox Value Missing Name",
    "description": "Bug Diagnosis Ticket:\nCheckbox lacks a name attribute preventing its boolean state from being submitted.\n\nObjective:\nAdd name='terms_agreed' attribute to the checkbox input. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Checkbox Value Missing Name",
    "targetComponentHtml": "<label><input type=\"checkbox\" name=\"terms_agreed\" value=\"true\" required> I agree to terms</label>",
    "starterHtml": "<!-- BUG: Checkbox lacks a name attribute preventing its boolean state from being submitted. -->\n<!-- Task: Add name='terms_agreed' attribute to the checkbox input -->\n<label><input type=\"checkbox\" value=\"true\" required> I agree to terms</label>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Add name='terms_agreed' attribute to the checkbox input"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Checkbox Value Missing Name is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-unclosed-strong-tag",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Unclosed Strong Emphasis Tag",
    "description": "Bug Diagnosis Ticket:\nUnclosed <strong> tag makes the entire card body bold instead of just the keyword.\n\nObjective:\nClose the <strong> tag immediately after 'Active'. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Unclosed Strong Emphasis Tag",
    "targetComponentHtml": "<p>Status: <strong>Active</strong>. System is currently operational across all nodes.</p>",
    "starterHtml": "<!-- BUG: Unclosed <strong> tag makes the entire card body bold instead of just the keyword. -->\n<!-- Task: Close the <strong> tag immediately after 'Active' -->\n<p>Status: <strong>Active. System is currently operational across all nodes.</p>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Close the <strong> tag immediately after 'Active'"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Unclosed Strong Emphasis Tag is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-180s-table-missing-colspan",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Table Cell Missing Colspan",
    "description": "Bug Diagnosis Ticket:\nHeader spans 2 columns but lacks colspan='2', causing table layout misalignment.\n\nObjective:\nAdd colspan='2' to the header <th> element. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Expected: Table Cell Missing Colspan",
    "targetComponentHtml": "<table><thead><tr><th colspan=\"2\">Student Roster</th></tr><tr><th>Name</th><th>Score</th></tr></thead></table>",
    "starterHtml": "<!-- BUG: Header spans 2 columns but lacks colspan='2', causing table layout misalignment. -->\n<!-- Task: Add colspan='2' to the header <th> element -->\n<table><thead><tr><th>Student Roster</th></tr><tr><th>Name</th><th>Score</th></tr></thead></table>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Add colspan='2' to the header <th> element"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Table Cell Missing Colspan is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-fieldset-legend-outside",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Broken Fieldset and Legend",
    "description": "Bug Diagnosis Ticket:\nLegend is placed outside fieldset, breaking native HTML grouping and accessibility borders.\n\nObjective:\nMove <legend> inside the <fieldset> as its very first child. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Broken Fieldset and Legend",
    "targetComponentHtml": "<fieldset><legend>Personal Information</legend><label>Full Name: <input type=\"text\" name=\"fullname\"></label></fieldset>",
    "starterHtml": "<!-- BUG: Legend is placed outside fieldset, breaking native HTML grouping and accessibility borders. -->\n<!-- Task: Move <legend> inside the <fieldset> as its very first child -->\n<legend>Personal Information</legend><fieldset><label>Full Name: <input type=\"text\" name=\"fullname\"></label></fieldset>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Move <legend> inside the <fieldset> as its very first child"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Broken Fieldset and Legend is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-datalist-id-disconnect",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Datalist Autocomplete Disconnect",
    "description": "Bug Diagnosis Ticket:\nInput 'list' attribute does not match the datalist 'id', breaking suggestions.\n\nObjective:\nMatch input list attribute to datalist id. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Datalist Autocomplete Disconnect",
    "targetComponentHtml": "<label>Select Campus: <input list=\"campus-list\" name=\"campus\"></label><datalist id=\"campus-list\"><option value=\"IIT Delhi\"><option value=\"BITS Pilani\"></datalist>",
    "starterHtml": "<!-- BUG: Input 'list' attribute does not match the datalist 'id', breaking suggestions. -->\n<!-- Task: Match input list attribute to datalist id -->\n<label>Select Campus: <input list=\"campuses\" name=\"campus\"></label><datalist id=\"campus-list\"><option value=\"IIT Delhi\"><option value=\"BITS Pilani\"></datalist>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Match input list attribute to datalist id"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Datalist Autocomplete Disconnect is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-details-summary-order",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Details Summary Semantic Inversion",
    "description": "Bug Diagnosis Ticket:\nSummary tag is placed after details content, breaking native toggle accordion.\n\nObjective:\nPlace <summary> as the first child of <details>. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Details Summary Semantic Inversion",
    "targetComponentHtml": "<details><summary>System Diagnostics</summary><p>All 4 cluster pods healthy. 0 dropped packets.</p></details>",
    "starterHtml": "<!-- BUG: Summary tag is placed after details content, breaking native toggle accordion. -->\n<!-- Task: Place <summary> as the first child of <details> -->\n<details><p>All 4 cluster pods healthy. 0 dropped packets.</p><summary>System Diagnostics</summary></details>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Place <summary> as the first child of <details>"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Details Summary Semantic Inversion is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-select-default-disabled",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Select Dropdown Default Selection",
    "description": "Bug Diagnosis Ticket:\nSelect element has disabled option without 'selected' and 'hidden' attributes.\n\nObjective:\nAdd selected and hidden attributes to the placeholder option. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Select Dropdown Default Selection",
    "targetComponentHtml": "<select name=\"role\" required><option value=\"\" disabled selected hidden>Choose your role...</option><option value=\"lead\">Lead</option><option value=\"dev\">Dev</option></select>",
    "starterHtml": "<!-- BUG: Select element has disabled option without 'selected' and 'hidden' attributes. -->\n<!-- Task: Add selected and hidden attributes to the placeholder option -->\n<select name=\"role\" required><option value=\"\" disabled>Choose your role...</option><option value=\"lead\">Lead</option><option value=\"dev\">Dev</option></select>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Add selected and hidden attributes to the placeholder option"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Select Dropdown Default Selection is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-audio-missing-controls",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Audio Tag Missing Controls",
    "description": "Bug Diagnosis Ticket:\n<audio> tag has source files but is invisible because the 'controls' attribute is omitted.\n\nObjective:\nAdd controls attribute to the <audio> tag. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Audio Tag Missing Controls",
    "targetComponentHtml": "<audio controls preload=\"metadata\"><source src=\"/ambient.mp3\" type=\"audio/mpeg\"><p>Audio not supported</p></audio>",
    "starterHtml": "<!-- BUG: <audio> tag has source files but is invisible because the 'controls' attribute is omitted. -->\n<!-- Task: Add controls attribute to the <audio> tag -->\n<audio preload=\"metadata\"><source src=\"/ambient.mp3\" type=\"audio/mpeg\"><p>Audio not supported</p></audio>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Add controls attribute to the <audio> tag"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Audio Tag Missing Controls is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-video-fallback-outside",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Video Poster & Fallback Misplacement",
    "description": "Bug Diagnosis Ticket:\nVideo fallback text is placed outside the video element, rendering on top of player.\n\nObjective:\nMove fallback message inside the <video> container. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Video Poster & Fallback Misplacement",
    "targetComponentHtml": "<video controls width=\"320\"><source src=\"/clip.mp4\" type=\"video/mp4\">Your browser does not support HTML5 video.</video>",
    "starterHtml": "<!-- BUG: Video fallback text is placed outside the video element, rendering on top of player. -->\n<!-- Task: Move fallback message inside the <video> container -->\n<video controls width=\"320\"><source src=\"/clip.mp4\" type=\"video/mp4\"></video><p>Your browser does not support HTML5 video.</p>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Move fallback message inside the <video> container"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Video Poster & Fallback Misplacement is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-table-rowspan-datashift",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Table Rowspan Data Shift",
    "description": "Bug Diagnosis Ticket:\nFirst column uses rowspan='2' but subsequent row includes an extra redundant cell shifting columns.\n\nObjective:\nRemove extraneous <td> in the second row. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Table Rowspan Data Shift",
    "targetComponentHtml": "<table><tr><td rowspan=\"2\">Sprint 1</td><td>Task Alpha</td></tr><tr><td>Task Beta</td></tr></table>",
    "starterHtml": "<!-- BUG: First column uses rowspan='2' but subsequent row includes an extra redundant cell shifting columns. -->\n<!-- Task: Remove extraneous <td> in the second row -->\n<table><tr><td rowspan=\"2\">Sprint 1</td><td>Task Alpha</td></tr><tr><td>Extra Cell</td><td>Task Beta</td></tr></table>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Remove extraneous <td> in the second row"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Table Rowspan Data Shift is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-nav-nested-list-parent",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Navigation Nested List Semantic Bug",
    "description": "Bug Diagnosis Ticket:\nNested <ul> is placed directly under parent <ul> rather than inside a parent <li>.\n\nObjective:\nNest sub-list <ul> directly inside its parent <li> element. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Navigation Nested List Semantic Bug",
    "targetComponentHtml": "<nav><ul><li>Products<ul><li>API</li><li>SDK</li></ul></li><li>Pricing</li></ul></nav>",
    "starterHtml": "<!-- BUG: Nested <ul> is placed directly under parent <ul> rather than inside a parent <li>. -->\n<!-- Task: Nest sub-list <ul> directly inside its parent <li> element -->\n<nav><ul><li>Products</li><ul><li>API</li><li>SDK</li></ul><li>Pricing</li></ul></nav>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Nest sub-list <ul> directly inside its parent <li> element"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Navigation Nested List Semantic Bug is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-form-method-get-leak",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Form Method GET Sensitive Password",
    "description": "Bug Diagnosis Ticket:\nForm transmitting password fields uses method='GET' exposing secrets in query string.\n\nObjective:\nChange form method from GET to POST. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Form Method GET Sensitive Password",
    "targetComponentHtml": "<form action=\"/auth/verify\" method=\"POST\"><input type=\"email\" name=\"email\"><input type=\"password\" name=\"pwd\"><button type=\"submit\">Sign In</button></form>",
    "starterHtml": "<!-- BUG: Form transmitting password fields uses method='GET' exposing secrets in query string. -->\n<!-- Task: Change form method from GET to POST -->\n<form action=\"/auth/verify\" method=\"GET\"><input type=\"email\" name=\"email\"><input type=\"password\" name=\"pwd\"><button type=\"submit\">Sign In</button></form>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Change form method from GET to POST"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Form Method GET Sensitive Password is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-300s-meter-progress-confusion",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Progress Meter Attribute Confusion",
    "description": "Bug Diagnosis Ticket:\n<meter> tag uses progress attributes causing visual gauge warning.\n\nObjective:\nUse proper meter attributes: min, max, low, high, optimum, value. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Expected: Progress Meter Attribute Confusion",
    "targetComponentHtml": "<p>Storage: <meter min=\"0\" max=\"100\" low=\"30\" high=\"80\" optimum=\"20\" value=\"75\">75%</meter></p>",
    "starterHtml": "<!-- BUG: <meter> tag uses progress attributes causing visual gauge warning. -->\n<!-- Task: Use proper meter attributes: min, max, low, high, optimum, value -->\n<p>Storage: <meter min=\"0\" max=\"100\" step=\"1\" value=\"75\">75%</meter></p>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Use proper meter attributes: min, max, low, high, optimum, value"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Progress Meter Attribute Confusion is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-dialog-modal-open-attr",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Accessible Dialog Modal Bug",
    "description": "Bug Diagnosis Ticket:\nNative <dialog> element uses non-standard show attribute instead of standard open attribute.\n\nObjective:\nUse standard 'open' attribute on <dialog>. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Accessible Dialog Modal Bug",
    "targetComponentHtml": "<dialog open aria-labelledby=\"dialog-title\"><h3 id=\"dialog-title\">Match Ready</h3><p>Your opponent is in lobby.</p></dialog>",
    "starterHtml": "<!-- BUG: Native <dialog> element uses non-standard show attribute instead of standard open attribute. -->\n<!-- Task: Use standard 'open' attribute on <dialog> -->\n<dialog show=\"true\" aria-labelledby=\"dialog-title\"><h3 id=\"dialog-title\">Match Ready</h3><p>Your opponent is in lobby.</p></dialog>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Use standard 'open' attribute on <dialog>"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Accessible Dialog Modal Bug is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-table-roster-colgroup-tfoot",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Complex Multi-Column Roster Table",
    "description": "Bug Diagnosis Ticket:\nTable has broken colgroup definitions and misplaced tfoot rendering after tbody incorrectly.\n\nObjective:\nOrder table children properly: colgroup, thead, tbody, tfoot. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Complex Multi-Column Roster Table",
    "targetComponentHtml": "<table><colgroup><col span=\"1\"><col span=\"2\"></colgroup><thead><tr><th>ID</th><th>Player</th><th>Score</th></tr></thead><tbody><tr><td>1</td><td>Mayank</td><td>98</td></tr></tbody><tfoot><tr><td colspan=\"3\">Total Players: 1</td></tr></tfoot></table>",
    "starterHtml": "<!-- BUG: Table has broken colgroup definitions and misplaced tfoot rendering after tbody incorrectly. -->\n<!-- Task: Order table children properly: colgroup, thead, tbody, tfoot -->\n<table><thead><tr><th>ID</th><th>Player</th><th>Score</th></tr></thead><tfoot><tr><td colspan=\"3\">Total Players: 1</td></tr></tfoot><tbody><tr><td>1</td><td>Mayank</td><td>98</td></tr></tbody></table>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Order table children properly: colgroup, thead, tbody, tfoot"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Complex Multi-Column Roster Table is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-heading-hierarchy-skip",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Semantic Article Card Hierarchy",
    "description": "Bug Diagnosis Ticket:\nBlog post violates heading hierarchy by using h4 directly under h1 skipping h2/h3.\n\nObjective:\nRestore logical heading hierarchy without skipping h2 and h3 levels. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Semantic Article Card Hierarchy",
    "targetComponentHtml": "<article><h1>Collegiate Code Derby</h1><h2>Regional Round</h2><h3>Match Analysis</h3><p>Highlights of round 1.</p></article>",
    "starterHtml": "<!-- BUG: Blog post violates heading hierarchy by using h4 directly under h1 skipping h2/h3. -->\n<!-- Task: Restore logical heading hierarchy without skipping h2 and h3 levels -->\n<article><h1>Collegiate Code Derby</h1><h4>Match Analysis</h4><p>Highlights of round 1.</p></article>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Restore logical heading hierarchy without skipping h2 and h3 levels"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Semantic Article Card Hierarchy is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-microdata-itemprop-missing",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Microdata Search Schema Attributes",
    "description": "Bug Diagnosis Ticket:\nProduct schema lacks itemprop='name' and has misplaced itemscope container.\n\nObjective:\nAdd itemscope to container and itemprop='name' to product title. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Microdata Search Schema Attributes",
    "targetComponentHtml": "<div itemscope itemtype=\"https://schema.org/Product\"><h2 itemprop=\"name\">Pro Tournament Pass</h2><span itemprop=\"price\">$25</span></div>",
    "starterHtml": "<!-- BUG: Product schema lacks itemprop='name' and has misplaced itemscope container. -->\n<!-- Task: Add itemscope to container and itemprop='name' to product title -->\n<div itemtype=\"https://schema.org/Product\"><h2>Pro Tournament Pass</h2><span itemprop=\"price\">$25</span></div>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Add itemscope to container and itemprop='name' to product title"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Microdata Search Schema Attributes is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-input-pattern-pin-bug",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: HTML5 Form Input Mode & Pattern",
    "description": "Bug Diagnosis Ticket:\nPIN input lacks inputmode='numeric' and has broken regex pattern requiring alphabets.\n\nObjective:\nSet inputmode='numeric' and pattern='[0-9]{4}'. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: HTML5 Form Input Mode & Pattern",
    "targetComponentHtml": "<input type=\"text\" name=\"pin\" inputmode=\"numeric\" pattern=\"[0-9]{4}\" maxlength=\"4\" placeholder=\"4-digit PIN\" required>",
    "starterHtml": "<!-- BUG: PIN input lacks inputmode='numeric' and has broken regex pattern requiring alphabets. -->\n<!-- Task: Set inputmode='numeric' and pattern='[0-9]{4}' -->\n<input type=\"text\" name=\"pin\" pattern=\"[a-zA-Z]{4}\" maxlength=\"4\" placeholder=\"4-digit PIN\" required>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Set inputmode='numeric' and pattern='[0-9]{4}'"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify HTML5 Form Input Mode & Pattern is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-aria-tabpanel-unwired",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Accessible Tabpanel ARIA Wiring",
    "description": "Bug Diagnosis Ticket:\nTabpanel has aria-labelledby pointing to non-existent tab button id.\n\nObjective:\nMatch aria-labelledby on tabpanel with tab id. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Accessible Tabpanel ARIA Wiring",
    "targetComponentHtml": "<div role=\"tablist\"><button role=\"tab\" id=\"tab-1\" aria-controls=\"panel-1\">Overview</button></div><div role=\"tabpanel\" id=\"panel-1\" aria-labelledby=\"tab-1\"><p>Panel content</p></div>",
    "starterHtml": "<!-- BUG: Tabpanel has aria-labelledby pointing to non-existent tab button id. -->\n<!-- Task: Match aria-labelledby on tabpanel with tab id -->\n<div role=\"tablist\"><button role=\"tab\" id=\"tab-overview\" aria-controls=\"panel-1\">Overview</button></div><div role=\"tabpanel\" id=\"panel-1\" aria-labelledby=\"tab-1\"><p>Panel content</p></div>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Match aria-labelledby on tabpanel with tab id"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Accessible Tabpanel ARIA Wiring is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-picture-source-order-bug",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Picture Element Source Order Bug",
    "description": "Bug Diagnosis Ticket:\n<picture> element has default <img> before <source> elements, ignoring modern AVIF/WebP formats.\n\nObjective:\nPlace <img> as the final fallback element inside <picture>. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Picture Element Source Order Bug",
    "targetComponentHtml": "<picture><source srcset=\"/hero.avif\" type=\"image/avif\"><source srcset=\"/hero.webp\" type=\"image/webp\"><img src=\"/hero.jpg\" alt=\"Hero Banner\"></picture>",
    "starterHtml": "<!-- BUG: <picture> element has default <img> before <source> elements, ignoring modern AVIF/WebP formats. -->\n<!-- Task: Place <img> as the final fallback element inside <picture> -->\n<picture><img src=\"/hero.jpg\" alt=\"Hero Banner\"><source srcset=\"/hero.avif\" type=\"image/avif\"><source srcset=\"/hero.webp\" type=\"image/webp\"></picture>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Place <img> as the final fallback element inside <picture>"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Picture Element Source Order Bug is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-iframe-sandbox-security",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Iframe Security Sandbox Flags",
    "description": "Bug Diagnosis Ticket:\nIframe lacks sandbox attributes and has broken allowfullscreen spelling.\n\nObjective:\nAdd sandbox attribute and standard allowfullscreen attribute. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Iframe Security Sandbox Flags",
    "targetComponentHtml": "<iframe src=\"https://example.com\" sandbox=\"allow-scripts allow-same-origin\" allowfullscreen title=\"Live Stream\"></iframe>",
    "starterHtml": "<!-- BUG: Iframe lacks sandbox attributes and has broken allowfullscreen spelling. -->\n<!-- Task: Add sandbox attribute and standard allowfullscreen attribute -->\n<iframe src=\"https://example.com\" allow_full_screen=\"yes\" title=\"Live Stream\"></iframe>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Add sandbox attribute and standard allowfullscreen attribute"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Iframe Security Sandbox Flags is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-landmarks-inside-main",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Semantic Landmark Layout Structure",
    "description": "Bug Diagnosis Ticket:\nPage layout wraps header and footer inside main landmark, violating WCAG landmarks.\n\nObjective:\nSeparate header, main, and footer as sibling landmark elements. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Semantic Landmark Layout Structure",
    "targetComponentHtml": "<header><h1>Campus Hub</h1></header><main><section><h2>Events</h2><p>Hackathon starts at 10 AM.</p></section></main><footer><p>&copy; 2026 Kollabrix</p></footer>",
    "starterHtml": "<!-- BUG: Page layout wraps header and footer inside main landmark, violating WCAG landmarks. -->\n<!-- Task: Separate header, main, and footer as sibling landmark elements -->\n<main><header><h1>Campus Hub</h1></header><section><h2>Events</h2><p>Hackathon starts at 10 AM.</p></section><footer><p>&copy; 2026 Kollabrix</p></footer></main>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Separate header, main, and footer as sibling landmark elements"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Semantic Landmark Layout Structure is fixed cleanly"
      }
    ]
  },
  {
    "id": "bughunt-html-easy-600s-form-wizard-name-clash",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix HTML Bug: Multi-Step Wizard Form Groups",
    "description": "Bug Diagnosis Ticket:\nSecond step inputs lack unique names and overwrite step 1 fields upon payload submission.\n\nObjective:\nEnsure distinct field names across multi-step form fieldsets. Ensure output matches target component blueprint.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "easy",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Expected: Multi-Step Wizard Form Groups",
    "targetComponentHtml": "<form><fieldset><legend>Step 1</legend><input type=\"text\" name=\"personal_email\"></fieldset><fieldset><legend>Step 2</legend><input type=\"text\" name=\"guardian_email\"></fieldset></form>",
    "starterHtml": "<!-- BUG: Second step inputs lack unique names and overwrite step 1 fields upon payload submission. -->\n<!-- Task: Ensure distinct field names across multi-step form fieldsets -->\n<form><fieldset><legend>Step 1</legend><input type=\"text\" name=\"email\"></fieldset><fieldset><legend>Step 2</legend><input type=\"text\" name=\"email\"></fieldset></form>",
    "validationCriteria": [
      "Bug correctly diagnosed and eliminated",
      "Semantic HTML syntax validated without unclosed tags",
      "Ensure distinct field names across multi-step form fieldsets"
    ],
    "testCases": [
      {
        "input": "html_structure_valid",
        "expectedOutput": "true",
        "description": "Verify Multi-Step Wizard Form Groups is fixed cleanly"
      }
    ]
  }
];
