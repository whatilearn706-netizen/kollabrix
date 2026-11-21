import type { DuelQuestion } from '@/types/arenaDuel';

export const HTML_BUG_MEDIUM_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "bughunt-html-medium-180s-unclosed-anchor",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Unclosed Anchor Link Spillage (Production DOM)",
    "description": "Symptom:\nUnclosed <a> tag spills blue underlined link formatting onto subsequent text. Nested deep layout structure defect.\n\nObjective:\nClose each <a> tag properly with </a>. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Unclosed Anchor Link Spillage (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <nav><a href=\"#home\">Home</a> | <a href=\"#about\">About</a> | <a href=\"#contact\">Contact</a></nav>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Unclosed <a> tag spills blue underlined link formatting onto subsequent text. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <nav><a href=\"#home\">Home | <a href=\"#about\">About | <a href=\"#contact\">Contact</nav>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Close each <a> tag properly with </a>"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Unclosed Anchor Link Spillage (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-broken-img-src",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Broken Image Source & Alt (Production DOM)",
    "description": "Symptom:\nImage tag uses 'scr' instead of 'src' and lacks an alt accessibility attribute. Nested deep layout structure defect.\n\nObjective:\nFix 'scr' attribute to 'src' and add alt='Company Logo'. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Broken Image Source & Alt (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <figure><img src=\"/logo.png\" alt=\"Company Logo\"><figcaption>Official Logo</figcaption></figure>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Image tag uses 'scr' instead of 'src' and lacks an alt accessibility attribute. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <figure><img scr=\"/logo.png\"><figcaption>Official Logo</figcaption></figure>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Fix 'scr' attribute to 'src' and add alt='Company Logo'"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Broken Image Source & Alt (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-unlinked-label",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Unlinked Form Label (Production DOM)",
    "description": "Symptom:\nForm label is unclickable because 'for' attribute does not match input id. Nested deep layout structure defect.\n\nObjective:\nMatch label 'for' attribute with input 'id'. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Unlinked Form Label (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <div class=\"field\"><label for=\"user-email\">Email Address:</label><input type=\"email\" id=\"user-email\" name=\"email\"></div>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Form label is unclickable because 'for' attribute does not match input id. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <div class=\"field\"><label for=\"email-input\">Email Address:</label><input type=\"email\" id=\"user-email\" name=\"email\"></div>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Match label 'for' attribute with input 'id'"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Unlinked Form Label (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-radio-name-mismatch",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Radio Buttons Multiple Selection Bug (Production DOM)",
    "description": "Symptom:\nRadio options have different 'name' attributes allowing all options to be checked at once. Nested deep layout structure defect.\n\nObjective:\nSet identical name='plan' attribute on both radio inputs. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Radio Buttons Multiple Selection Bug (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <form><label><input type=\"radio\" name=\"plan\" value=\"free\" checked> Free</label><label><input type=\"radio\" name=\"plan\" value=\"pro\"> Pro</label></form>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Radio options have different 'name' attributes allowing all options to be checked at once. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <form><label><input type=\"radio\" name=\"plan_free\" value=\"free\" checked> Free</label><label><input type=\"radio\" name=\"plan_pro\" value=\"pro\"> Pro</label></form>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Set identical name='plan' attribute on both radio inputs"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Radio Buttons Multiple Selection Bug (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-malformed-ol-items",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Malformed Ordered List Items (Production DOM)",
    "description": "Symptom:\nList items in <ol> are wrapped in <div> tags instead of <li> tags. Nested deep layout structure defect.\n\nObjective:\nReplace <div> items inside <ol> with semantic <li> tags. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Malformed Ordered List Items (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <ol><li>Initialize repository</li><li>Install dependencies</li><li>Run development server</li></ol>\n</div>",
    "starterHtml": "<!-- BUG HUNT: List items in <ol> are wrapped in <div> tags instead of <li> tags. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <ol><div>Initialize repository</div><div>Install dependencies</div><div>Run development server</div></ol>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Replace <div> items inside <ol> with semantic <li> tags"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Malformed Ordered List Items (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-missing-submit-type",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Missing Submit Button Type (Production DOM)",
    "description": "Symptom:\nButton inside form has type='button' instead of type='submit', preventing form dispatch. Nested deep layout structure defect.\n\nObjective:\nChange button type to type='submit'. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Missing Submit Button Type (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <form action=\"/api/login\" method=\"POST\"><input type=\"text\" name=\"user\"><button type=\"submit\">Log In</button></form>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Button inside form has type='button' instead of type='submit', preventing form dispatch. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <form action=\"/api/login\" method=\"POST\"><input type=\"text\" name=\"user\"><button type=\"button\">Log In</button></form>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Change button type to type='submit'"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Missing Submit Button Type (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-unclosed-blockquote",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Unclosed Blockquote Tag (Production DOM)",
    "description": "Symptom:\nUnclosed <blockquote> swallows citation and author paragraph into quotation. Nested deep layout structure defect.\n\nObjective:\nClose <blockquote> tag before figcaption. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Unclosed Blockquote Tag (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <figure><blockquote>Simplicity is prerequisite for reliability.</blockquote><figcaption>&mdash; Edsger Dijkstra</figcaption></figure>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Unclosed <blockquote> swallows citation and author paragraph into quotation. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <figure><blockquote>Simplicity is prerequisite for reliability.<figcaption>&mdash; Edsger Dijkstra</figcaption></figure>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Close <blockquote> tag before figcaption"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Unclosed Blockquote Tag (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-checkbox-missing-name",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Checkbox Value Missing Name (Production DOM)",
    "description": "Symptom:\nCheckbox lacks a name attribute preventing its boolean state from being submitted. Nested deep layout structure defect.\n\nObjective:\nAdd name='terms_agreed' attribute to the checkbox input. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Checkbox Value Missing Name (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <label><input type=\"checkbox\" name=\"terms_agreed\" value=\"true\" required> I agree to terms</label>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Checkbox lacks a name attribute preventing its boolean state from being submitted. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <label><input type=\"checkbox\" value=\"true\" required> I agree to terms</label>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Add name='terms_agreed' attribute to the checkbox input"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Checkbox Value Missing Name (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-unclosed-strong-tag",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Unclosed Strong Emphasis Tag (Production DOM)",
    "description": "Symptom:\nUnclosed <strong> tag makes the entire card body bold instead of just the keyword. Nested deep layout structure defect.\n\nObjective:\nClose the <strong> tag immediately after 'Active'. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Unclosed Strong Emphasis Tag (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <p>Status: <strong>Active</strong>. System is currently operational across all nodes.</p>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Unclosed <strong> tag makes the entire card body bold instead of just the keyword. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <p>Status: <strong>Active. System is currently operational across all nodes.</p>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Close the <strong> tag immediately after 'Active'"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Unclosed Strong Emphasis Tag (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-180s-table-missing-colspan",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Table Cell Missing Colspan (Production DOM)",
    "description": "Symptom:\nHeader spans 2 columns but lacks colspan='2', causing table layout misalignment. Nested deep layout structure defect.\n\nObjective:\nAdd colspan='2' to the header <th> element. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Table Cell Missing Colspan (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <table><thead><tr><th colspan=\"2\">Student Roster</th></tr><tr><th>Name</th><th>Score</th></tr></thead></table>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Header spans 2 columns but lacks colspan='2', causing table layout misalignment. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <table><thead><tr><th>Student Roster</th></tr><tr><th>Name</th><th>Score</th></tr></thead></table>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Add colspan='2' to the header <th> element"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Table Cell Missing Colspan (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-fieldset-legend-outside",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Broken Fieldset and Legend (Production DOM)",
    "description": "Symptom:\nLegend is placed outside fieldset, breaking native HTML grouping and accessibility borders. Nested deep layout structure defect.\n\nObjective:\nMove <legend> inside the <fieldset> as its very first child. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Broken Fieldset and Legend (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <fieldset><legend>Personal Information</legend><label>Full Name: <input type=\"text\" name=\"fullname\"></label></fieldset>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Legend is placed outside fieldset, breaking native HTML grouping and accessibility borders. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <legend>Personal Information</legend><fieldset><label>Full Name: <input type=\"text\" name=\"fullname\"></label></fieldset>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Move <legend> inside the <fieldset> as its very first child"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Broken Fieldset and Legend (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-datalist-id-disconnect",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Datalist Autocomplete Disconnect (Production DOM)",
    "description": "Symptom:\nInput 'list' attribute does not match the datalist 'id', breaking suggestions. Nested deep layout structure defect.\n\nObjective:\nMatch input list attribute to datalist id. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Datalist Autocomplete Disconnect (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <label>Select Campus: <input list=\"campus-list\" name=\"campus\"></label><datalist id=\"campus-list\"><option value=\"IIT Delhi\"><option value=\"BITS Pilani\"></datalist>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Input 'list' attribute does not match the datalist 'id', breaking suggestions. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <label>Select Campus: <input list=\"campuses\" name=\"campus\"></label><datalist id=\"campus-list\"><option value=\"IIT Delhi\"><option value=\"BITS Pilani\"></datalist>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Match input list attribute to datalist id"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Datalist Autocomplete Disconnect (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-details-summary-order",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Details Summary Semantic Inversion (Production DOM)",
    "description": "Symptom:\nSummary tag is placed after details content, breaking native toggle accordion. Nested deep layout structure defect.\n\nObjective:\nPlace <summary> as the first child of <details>. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Details Summary Semantic Inversion (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <details><summary>System Diagnostics</summary><p>All 4 cluster pods healthy. 0 dropped packets.</p></details>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Summary tag is placed after details content, breaking native toggle accordion. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <details><p>All 4 cluster pods healthy. 0 dropped packets.</p><summary>System Diagnostics</summary></details>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Place <summary> as the first child of <details>"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Details Summary Semantic Inversion (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-select-default-disabled",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Select Dropdown Default Selection (Production DOM)",
    "description": "Symptom:\nSelect element has disabled option without 'selected' and 'hidden' attributes. Nested deep layout structure defect.\n\nObjective:\nAdd selected and hidden attributes to the placeholder option. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Select Dropdown Default Selection (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <select name=\"role\" required><option value=\"\" disabled selected hidden>Choose your role...</option><option value=\"lead\">Lead</option><option value=\"dev\">Dev</option></select>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Select element has disabled option without 'selected' and 'hidden' attributes. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <select name=\"role\" required><option value=\"\" disabled>Choose your role...</option><option value=\"lead\">Lead</option><option value=\"dev\">Dev</option></select>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Add selected and hidden attributes to the placeholder option"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Select Dropdown Default Selection (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-audio-missing-controls",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Audio Tag Missing Controls (Production DOM)",
    "description": "Symptom:\n<audio> tag has source files but is invisible because the 'controls' attribute is omitted. Nested deep layout structure defect.\n\nObjective:\nAdd controls attribute to the <audio> tag. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Audio Tag Missing Controls (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <audio controls preload=\"metadata\"><source src=\"/ambient.mp3\" type=\"audio/mpeg\"><p>Audio not supported</p></audio>\n</div>",
    "starterHtml": "<!-- BUG HUNT: <audio> tag has source files but is invisible because the 'controls' attribute is omitted. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <audio preload=\"metadata\"><source src=\"/ambient.mp3\" type=\"audio/mpeg\"><p>Audio not supported</p></audio>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Add controls attribute to the <audio> tag"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Audio Tag Missing Controls (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-video-fallback-outside",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Video Poster & Fallback Misplacement (Production DOM)",
    "description": "Symptom:\nVideo fallback text is placed outside the video element, rendering on top of player. Nested deep layout structure defect.\n\nObjective:\nMove fallback message inside the <video> container. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Video Poster & Fallback Misplacement (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <video controls width=\"320\"><source src=\"/clip.mp4\" type=\"video/mp4\">Your browser does not support HTML5 video.</video>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Video fallback text is placed outside the video element, rendering on top of player. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <video controls width=\"320\"><source src=\"/clip.mp4\" type=\"video/mp4\"></video><p>Your browser does not support HTML5 video.</p>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Move fallback message inside the <video> container"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Video Poster & Fallback Misplacement (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-table-rowspan-datashift",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Table Rowspan Data Shift (Production DOM)",
    "description": "Symptom:\nFirst column uses rowspan='2' but subsequent row includes an extra redundant cell shifting columns. Nested deep layout structure defect.\n\nObjective:\nRemove extraneous <td> in the second row. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Table Rowspan Data Shift (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <table><tr><td rowspan=\"2\">Sprint 1</td><td>Task Alpha</td></tr><tr><td>Task Beta</td></tr></table>\n</div>",
    "starterHtml": "<!-- BUG HUNT: First column uses rowspan='2' but subsequent row includes an extra redundant cell shifting columns. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <table><tr><td rowspan=\"2\">Sprint 1</td><td>Task Alpha</td></tr><tr><td>Extra Cell</td><td>Task Beta</td></tr></table>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Remove extraneous <td> in the second row"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Table Rowspan Data Shift (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-nav-nested-list-parent",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Navigation Nested List Semantic Bug (Production DOM)",
    "description": "Symptom:\nNested <ul> is placed directly under parent <ul> rather than inside a parent <li>. Nested deep layout structure defect.\n\nObjective:\nNest sub-list <ul> directly inside its parent <li> element. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Navigation Nested List Semantic Bug (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <nav><ul><li>Products<ul><li>API</li><li>SDK</li></ul></li><li>Pricing</li></ul></nav>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Nested <ul> is placed directly under parent <ul> rather than inside a parent <li>. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <nav><ul><li>Products</li><ul><li>API</li><li>SDK</li></ul><li>Pricing</li></ul></nav>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Nest sub-list <ul> directly inside its parent <li> element"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Navigation Nested List Semantic Bug (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-form-method-get-leak",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Form Method GET Sensitive Password (Production DOM)",
    "description": "Symptom:\nForm transmitting password fields uses method='GET' exposing secrets in query string. Nested deep layout structure defect.\n\nObjective:\nChange form method from GET to POST. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Form Method GET Sensitive Password (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <form action=\"/auth/verify\" method=\"POST\"><input type=\"email\" name=\"email\"><input type=\"password\" name=\"pwd\"><button type=\"submit\">Sign In</button></form>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Form transmitting password fields uses method='GET' exposing secrets in query string. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <form action=\"/auth/verify\" method=\"GET\"><input type=\"email\" name=\"email\"><input type=\"password\" name=\"pwd\"><button type=\"submit\">Sign In</button></form>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Change form method from GET to POST"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Form Method GET Sensitive Password (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-300s-meter-progress-confusion",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Progress Meter Attribute Confusion (Production DOM)",
    "description": "Symptom:\n<meter> tag uses progress attributes causing visual gauge warning. Nested deep layout structure defect.\n\nObjective:\nUse proper meter attributes: min, max, low, high, optimum, value. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Progress Meter Attribute Confusion (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <p>Storage: <meter min=\"0\" max=\"100\" low=\"30\" high=\"80\" optimum=\"20\" value=\"75\">75%</meter></p>\n</div>",
    "starterHtml": "<!-- BUG HUNT: <meter> tag uses progress attributes causing visual gauge warning. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <p>Storage: <meter min=\"0\" max=\"100\" step=\"1\" value=\"75\">75%</meter></p>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Use proper meter attributes: min, max, low, high, optimum, value"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Progress Meter Attribute Confusion (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-dialog-modal-open-attr",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Accessible Dialog Modal Bug (Production DOM)",
    "description": "Symptom:\nNative <dialog> element uses non-standard show attribute instead of standard open attribute. Nested deep layout structure defect.\n\nObjective:\nUse standard 'open' attribute on <dialog>. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Accessible Dialog Modal Bug (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <dialog open aria-labelledby=\"dialog-title\"><h3 id=\"dialog-title\">Match Ready</h3><p>Your opponent is in lobby.</p></dialog>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Native <dialog> element uses non-standard show attribute instead of standard open attribute. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <dialog show=\"true\" aria-labelledby=\"dialog-title\"><h3 id=\"dialog-title\">Match Ready</h3><p>Your opponent is in lobby.</p></dialog>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Use standard 'open' attribute on <dialog>"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Accessible Dialog Modal Bug (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-table-roster-colgroup-tfoot",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Complex Multi-Column Roster Table (Production DOM)",
    "description": "Symptom:\nTable has broken colgroup definitions and misplaced tfoot rendering after tbody incorrectly. Nested deep layout structure defect.\n\nObjective:\nOrder table children properly: colgroup, thead, tbody, tfoot. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Complex Multi-Column Roster Table (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <table><colgroup><col span=\"1\"><col span=\"2\"></colgroup><thead><tr><th>ID</th><th>Player</th><th>Score</th></tr></thead><tbody><tr><td>1</td><td>Mayank</td><td>98</td></tr></tbody><tfoot><tr><td colspan=\"3\">Total Players: 1</td></tr></tfoot></table>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Table has broken colgroup definitions and misplaced tfoot rendering after tbody incorrectly. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <table><thead><tr><th>ID</th><th>Player</th><th>Score</th></tr></thead><tfoot><tr><td colspan=\"3\">Total Players: 1</td></tr></tfoot><tbody><tr><td>1</td><td>Mayank</td><td>98</td></tr></tbody></table>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Order table children properly: colgroup, thead, tbody, tfoot"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Complex Multi-Column Roster Table (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-heading-hierarchy-skip",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Semantic Article Card Hierarchy (Production DOM)",
    "description": "Symptom:\nBlog post violates heading hierarchy by using h4 directly under h1 skipping h2/h3. Nested deep layout structure defect.\n\nObjective:\nRestore logical heading hierarchy without skipping h2 and h3 levels. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Semantic Article Card Hierarchy (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <article><h1>Collegiate Code Derby</h1><h2>Regional Round</h2><h3>Match Analysis</h3><p>Highlights of round 1.</p></article>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Blog post violates heading hierarchy by using h4 directly under h1 skipping h2/h3. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <article><h1>Collegiate Code Derby</h1><h4>Match Analysis</h4><p>Highlights of round 1.</p></article>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Restore logical heading hierarchy without skipping h2 and h3 levels"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Semantic Article Card Hierarchy (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-microdata-itemprop-missing",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Microdata Search Schema Attributes (Production DOM)",
    "description": "Symptom:\nProduct schema lacks itemprop='name' and has misplaced itemscope container. Nested deep layout structure defect.\n\nObjective:\nAdd itemscope to container and itemprop='name' to product title. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Microdata Search Schema Attributes (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <div itemscope itemtype=\"https://schema.org/Product\"><h2 itemprop=\"name\">Pro Tournament Pass</h2><span itemprop=\"price\">$25</span></div>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Product schema lacks itemprop='name' and has misplaced itemscope container. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <div itemtype=\"https://schema.org/Product\"><h2>Pro Tournament Pass</h2><span itemprop=\"price\">$25</span></div>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Add itemscope to container and itemprop='name' to product title"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Microdata Search Schema Attributes (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-input-pattern-pin-bug",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: HTML5 Form Input Mode & Pattern (Production DOM)",
    "description": "Symptom:\nPIN input lacks inputmode='numeric' and has broken regex pattern requiring alphabets. Nested deep layout structure defect.\n\nObjective:\nSet inputmode='numeric' and pattern='[0-9]{4}'. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: HTML5 Form Input Mode & Pattern (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <input type=\"text\" name=\"pin\" inputmode=\"numeric\" pattern=\"[0-9]{4}\" maxlength=\"4\" placeholder=\"4-digit PIN\" required>\n</div>",
    "starterHtml": "<!-- BUG HUNT: PIN input lacks inputmode='numeric' and has broken regex pattern requiring alphabets. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <input type=\"text\" name=\"pin\" pattern=\"[a-zA-Z]{4}\" maxlength=\"4\" placeholder=\"4-digit PIN\" required>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Set inputmode='numeric' and pattern='[0-9]{4}'"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify HTML5 Form Input Mode & Pattern (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-aria-tabpanel-unwired",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Accessible Tabpanel ARIA Wiring (Production DOM)",
    "description": "Symptom:\nTabpanel has aria-labelledby pointing to non-existent tab button id. Nested deep layout structure defect.\n\nObjective:\nMatch aria-labelledby on tabpanel with tab id. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Accessible Tabpanel ARIA Wiring (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <div role=\"tablist\"><button role=\"tab\" id=\"tab-1\" aria-controls=\"panel-1\">Overview</button></div><div role=\"tabpanel\" id=\"panel-1\" aria-labelledby=\"tab-1\"><p>Panel content</p></div>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Tabpanel has aria-labelledby pointing to non-existent tab button id. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <div role=\"tablist\"><button role=\"tab\" id=\"tab-overview\" aria-controls=\"panel-1\">Overview</button></div><div role=\"tabpanel\" id=\"panel-1\" aria-labelledby=\"tab-1\"><p>Panel content</p></div>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Match aria-labelledby on tabpanel with tab id"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Accessible Tabpanel ARIA Wiring (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-picture-source-order-bug",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Picture Element Source Order Bug (Production DOM)",
    "description": "Symptom:\n<picture> element has default <img> before <source> elements, ignoring modern AVIF/WebP formats. Nested deep layout structure defect.\n\nObjective:\nPlace <img> as the final fallback element inside <picture>. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Picture Element Source Order Bug (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <picture><source srcset=\"/hero.avif\" type=\"image/avif\"><source srcset=\"/hero.webp\" type=\"image/webp\"><img src=\"/hero.jpg\" alt=\"Hero Banner\"></picture>\n</div>",
    "starterHtml": "<!-- BUG HUNT: <picture> element has default <img> before <source> elements, ignoring modern AVIF/WebP formats. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <picture><img src=\"/hero.jpg\" alt=\"Hero Banner\"><source srcset=\"/hero.avif\" type=\"image/avif\"><source srcset=\"/hero.webp\" type=\"image/webp\"></picture>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Place <img> as the final fallback element inside <picture>"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Picture Element Source Order Bug (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-iframe-sandbox-security",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Iframe Security Sandbox Flags (Production DOM)",
    "description": "Symptom:\nIframe lacks sandbox attributes and has broken allowfullscreen spelling. Nested deep layout structure defect.\n\nObjective:\nAdd sandbox attribute and standard allowfullscreen attribute. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Iframe Security Sandbox Flags (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <iframe src=\"https://example.com\" sandbox=\"allow-scripts allow-same-origin\" allowfullscreen title=\"Live Stream\"></iframe>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Iframe lacks sandbox attributes and has broken allowfullscreen spelling. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <iframe src=\"https://example.com\" allow_full_screen=\"yes\" title=\"Live Stream\"></iframe>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Add sandbox attribute and standard allowfullscreen attribute"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Iframe Security Sandbox Flags (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-landmarks-inside-main",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Semantic Landmark Layout Structure (Production DOM)",
    "description": "Symptom:\nPage layout wraps header and footer inside main landmark, violating WCAG landmarks. Nested deep layout structure defect.\n\nObjective:\nSeparate header, main, and footer as sibling landmark elements. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Semantic Landmark Layout Structure (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <header><h1>Campus Hub</h1></header><main><section><h2>Events</h2><p>Hackathon starts at 10 AM.</p></section></main><footer><p>&copy; 2026 Kollabrix</p></footer>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Page layout wraps header and footer inside main landmark, violating WCAG landmarks. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <main><header><h1>Campus Hub</h1></header><section><h2>Events</h2><p>Hackathon starts at 10 AM.</p></section><footer><p>&copy; 2026 Kollabrix</p></footer></main>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Separate header, main, and footer as sibling landmark elements"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Semantic Landmark Layout Structure (Production DOM) fixed"
      }
    ]
  },
  {
    "id": "bughunt-html-medium-600s-form-wizard-name-clash",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Hunt HTML Bug: Multi-Step Wizard Form Groups (Production DOM)",
    "description": "Symptom:\nSecond step inputs lack unique names and overwrite step 1 fields upon payload submission. Nested deep layout structure defect.\n\nObjective:\nEnsure distinct field names across multi-step form fieldsets. Correct the syntax defect with ~30s margin.",
    "tags": [
      "bug_web",
      "html"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Multi-Step Wizard Form Groups (Production DOM)",
    "targetComponentHtml": "<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <form><fieldset><legend>Step 1</legend><input type=\"text\" name=\"personal_email\"></fieldset><fieldset><legend>Step 2</legend><input type=\"text\" name=\"guardian_email\"></fieldset></form>\n</div>",
    "starterHtml": "<!-- BUG HUNT: Second step inputs lack unique names and overwrite step 1 fields upon payload submission. Nested deep layout structure defect. -->\n<div class=\"bug-sandbox-wrapper\">\n  <!-- Production DOM -->\n  <form><fieldset><legend>Step 1</legend><input type=\"text\" name=\"email\"></fieldset><fieldset><legend>Step 2</legend><input type=\"text\" name=\"email\"></fieldset></form>\n</div>",
    "validationCriteria": [
      "Bug resolved",
      "Ensure distinct field names across multi-step form fieldsets"
    ],
    "testCases": [
      {
        "input": "bug_eliminated",
        "expectedOutput": "true",
        "description": "Verify Multi-Step Wizard Form Groups (Production DOM) fixed"
      }
    ]
  }
];
