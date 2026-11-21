import type { DuelQuestion } from '@/types/arenaDuel';

export const HTML_CSS_BUG_MEDIUM_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "bughunt-htmlcss-medium-180s-flex-wrap-blowout-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Flexbox No-Wrap Blowout (Production Layout)",
    "description": "Symptom:\nCards wrapper has flex-wrap: nowrap causing cards to clip on smaller viewports. Observed across multi-viewport browser testing.\n\nObjective:\nChange flex-wrap: nowrap to flex-wrap: wrap. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Flexbox No-Wrap Blowout (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".cards { display: flex; flex-wrap: wrap; gap: 12px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Cards wrapper has flex-wrap: nowrap causing cards to clip on smaller viewports. Observed across multi-viewport browser testing. */\n/* FIX HINT: Change flex-wrap: nowrap to flex-wrap: wrap */\n.cards { display: flex; flex-wrap: nowrap; gap: 12px; overflow: hidden; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Change flex-wrap: nowrap to flex-wrap: wrap"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Flexbox No-Wrap Blowout (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-missing-box-sizing-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Missing Border-Box Padding Overflow (Production Layout)",
    "description": "Symptom:\nContainer card lacks box-sizing: border-box causing padding to overflow 100% width. Observed across multi-viewport browser testing.\n\nObjective:\nSet box-sizing: border-box on the container. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Missing Border-Box Padding Overflow (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".box { width: 100%; box-sizing: border-box; padding: 24px; background: #0f172a; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Container card lacks box-sizing: border-box causing padding to overflow 100% width. Observed across multi-viewport browser testing. */\n/* FIX HINT: Set box-sizing: border-box on the container */\n.box { width: 100%; box-sizing: content-box; padding: 24px; background: #0f172a; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Set box-sizing: border-box on the container"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Missing Border-Box Padding Overflow (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-missing-relative-parent-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Absolute Positioning Without Relative Parent (Production Layout)",
    "description": "Symptom:\nModal badge flies to top-left of page because parent container is missing position: relative. Observed across multi-viewport browser testing.\n\nObjective:\nAdd position: relative to the parent card container. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Absolute Positioning Without Relative Parent (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".parent { position: relative; width: 300px; height: 180px; } .badge { position: absolute; top: 12px; right: 12px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Modal badge flies to top-left of page because parent container is missing position: relative. Observed across multi-viewport browser testing. */\n/* FIX HINT: Add position: relative to the parent card container */\n.parent { width: 300px; height: 180px; } .badge { position: absolute; top: 12px; right: 12px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Add position: relative to the parent card container"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Absolute Positioning Without Relative Parent (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-inline-ignoring-dimensions-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Inline Display Ignoring Width and Height (Production Layout)",
    "description": "Symptom:\nAction button has display: inline causing custom width and height styles to be ignored. Observed across multi-viewport browser testing.\n\nObjective:\nChange display: inline to display: inline-block or inline-flex. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Inline Display Ignoring Width and Height (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".btn { display: inline-block; width: 160px; height: 44px; text-align: center; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Action button has display: inline causing custom width and height styles to be ignored. Observed across multi-viewport browser testing. */\n/* FIX HINT: Change display: inline to display: inline-block or inline-flex */\n.btn { display: inline; width: 160px; height: 44px; text-align: center; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Change display: inline to display: inline-block or inline-flex"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Inline Display Ignoring Width and Height (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-flex-vertical-center-bug-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Centered Flex Item Misalignment (Production Layout)",
    "description": "Symptom:\nContainer uses justify-content: center instead of align-items: center for vertical alignment. Observed across multi-viewport browser testing.\n\nObjective:\nUse align-items: center for vertical centering and justify-content: space-between. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Centered Flex Item Misalignment (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".row { display: flex; align-items: center; justify-content: space-between; height: 60px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Container uses justify-content: center instead of align-items: center for vertical alignment. Observed across multi-viewport browser testing. */\n/* FIX HINT: Use align-items: center for vertical centering and justify-content: space-between */\n.row { display: flex; justify-content: center; height: 60px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Use align-items: center for vertical centering and justify-content: space-between"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Centered Flex Item Misalignment (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-text-ellipsis-overflow-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Text Ellipsis Missing Overflow Hidden (Production Layout)",
    "description": "Symptom:\nHeading text overflows container because white-space: nowrap is used without overflow: hidden. Observed across multi-viewport browser testing.\n\nObjective:\nAdd overflow: hidden to trigger text-overflow: ellipsis. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Text Ellipsis Missing Overflow Hidden (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Heading text overflows container because white-space: nowrap is used without overflow: hidden. Observed across multi-viewport browser testing. */\n/* FIX HINT: Add overflow: hidden to trigger text-overflow: ellipsis */\n.title { white-space: nowrap; text-overflow: ellipsis; max-width: 200px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Add overflow: hidden to trigger text-overflow: ellipsis"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Text Ellipsis Missing Overflow Hidden (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-checkbox-accent-color-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Hidden Checkbox Accent Color Mismatch (Production Layout)",
    "description": "Symptom:\nCheckbox retains default browser blue tint instead of custom amber brand accent-color. Observed across multi-viewport browser testing.\n\nObjective:\nUse accent-color: #f59e0b instead of color property. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Hidden Checkbox Accent Color Mismatch (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": "input[type='checkbox'] { accent-color: #f59e0b; width: 18px; height: 18px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Checkbox retains default browser blue tint instead of custom amber brand accent-color. Observed across multi-viewport browser testing. */\n/* FIX HINT: Use accent-color: #f59e0b instead of color property */\ninput[type='checkbox'] { color: #f59e0b; width: 18px; height: 18px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Use accent-color: #f59e0b instead of color property"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Hidden Checkbox Accent Color Mismatch (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-img-aspect-ratio-squish-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Image Aspect Ratio Distortion (Production Layout)",
    "description": "Symptom:\nAvatar thumbnail looks squished because width and height are fixed without object-fit: cover. Observed across multi-viewport browser testing.\n\nObjective:\nAdd object-fit: cover to prevent image distortion. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Image Aspect Ratio Distortion (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".avatar { width: 64px; height: 64px; object-fit: cover; border-radius: 50%; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Avatar thumbnail looks squished because width and height are fixed without object-fit: cover. Observed across multi-viewport browser testing. */\n/* FIX HINT: Add object-fit: cover to prevent image distortion */\n.avatar { width: 64px; height: 64px; border-radius: 50%; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Add object-fit: cover to prevent image distortion"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Image Aspect Ratio Distortion (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-btn-pointer-events-blocked-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Button Pointer Events None Trap (Production Layout)",
    "description": "Symptom:\nSubmit button cannot be clicked because child pseudo-element or overlay has pointer-events: auto blocking it. Observed across multi-viewport browser testing.\n\nObjective:\nChange pointer-events: none to pointer-events: auto. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Button Pointer Events None Trap (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".btn { pointer-events: auto; cursor: pointer; opacity: 1; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Submit button cannot be clicked because child pseudo-element or overlay has pointer-events: auto blocking it. Observed across multi-viewport browser testing. */\n/* FIX HINT: Change pointer-events: none to pointer-events: auto */\n.btn { pointer-events: none; cursor: pointer; opacity: 0.8; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Change pointer-events: none to pointer-events: auto"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Button Pointer Events None Trap (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-180s-margin-collapse-gap-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Margin Collapse White Gap Bug (Production Layout)",
    "description": "Symptom:\nUnexpected white space appears above header because child heading margin is collapsing through parent. Observed across multi-viewport browser testing.\n\nObjective:\nAdd padding-top: 1px or overflow: hidden to parent to prevent margin collapse. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Target: Margin Collapse White Gap Bug (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".header { padding-top: 1px; background: #0284c7; } h1 { margin-top: 24px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Unexpected white space appears above header because child heading margin is collapsing through parent. Observed across multi-viewport browser testing. */\n/* FIX HINT: Add padding-top: 1px or overflow: hidden to parent to prevent margin collapse */\n.header { background: #0284c7; } h1 { margin-top: 24px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Add padding-top: 1px or overflow: hidden to parent to prevent margin collapse"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Margin Collapse White Gap Bug (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-z-index-stacking-context-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Z-Index Stacking Context Trap (Production Layout)",
    "description": "Symptom:\nModal dialog appears behind dark backdrop because parent has transform causing new stacking context. Observed across multi-viewport browser testing.\n\nObjective:\nEliminate isolated transform stacking trap on parent. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Z-Index Stacking Context Trap (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".parent { z-index: 10; } .modal { z-index: 50; position: fixed; inset: 0; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Modal dialog appears behind dark backdrop because parent has transform causing new stacking context. Observed across multi-viewport browser testing. */\n/* FIX HINT: Eliminate isolated transform stacking trap on parent */\n.parent { transform: scale(1); z-index: 1; } .modal { z-index: 9999; position: fixed; inset: 0; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Eliminate isolated transform stacking trap on parent"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Z-Index Stacking Context Trap (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-sticky-header-overflow-hidden-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Sticky Header Overflow Hidden Breakage (Production Layout)",
    "description": "Symptom:\nSticky navigation bar fails to stick on scroll because an ancestor has overflow: hidden. Observed across multi-viewport browser testing.\n\nObjective:\nChange ancestor container overflow: hidden to overflow: visible. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Sticky Header Overflow Hidden Breakage (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".page-container { overflow: visible; } .navbar { position: sticky; top: 0; z-index: 20; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Sticky navigation bar fails to stick on scroll because an ancestor has overflow: hidden. Observed across multi-viewport browser testing. */\n/* FIX HINT: Change ancestor container overflow: hidden to overflow: visible */\n.page-container { overflow: hidden; } .navbar { position: sticky; top: 0; z-index: 20; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Change ancestor container overflow: hidden to overflow: visible"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Sticky Header Overflow Hidden Breakage (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-grid-minmax-fr-blowout-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Grid Template Column Minmax Blowout (Production Layout)",
    "description": "Symptom:\nGrid column blowout occurs with preformatted code because 1fr does not enforce min-width: 0. Observed across multi-viewport browser testing.\n\nObjective:\nUse minmax(0, 1fr) instead of 1fr to prevent grid item blowouts. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Grid Template Column Minmax Blowout (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Grid column blowout occurs with preformatted code because 1fr does not enforce min-width: 0. Observed across multi-viewport browser testing. */\n/* FIX HINT: Use minmax(0, 1fr) instead of 1fr to prevent grid item blowouts */\n.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Use minmax(0, 1fr) instead of 1fr to prevent grid item blowouts"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Grid Template Column Minmax Blowout (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-css-var-fallback-syntax-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: CSS Variable Fallback Syntax Error (Production Layout)",
    "description": "Symptom:\nCustom theme color falls back to black because var() syntax has invalid fallback placement. Observed across multi-viewport browser testing.\n\nObjective:\nSupply valid fallback parameters in var(--var-name, fallback). Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: CSS Variable Fallback Syntax Error (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".card { background: var(--bg-card, #1e293b); color: var(--text-primary, #ffffff); }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Custom theme color falls back to black because var() syntax has invalid fallback placement. Observed across multi-viewport browser testing. */\n/* FIX HINT: Supply valid fallback parameters in var(--var-name, fallback) */\n.card { background: var(--bg-card); color: var(--text-primary); }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Supply valid fallback parameters in var(--var-name, fallback)"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify CSS Variable Fallback Syntax Error (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-subgrid-alignment-shift-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Subgrid Layout Alignment Shift (Production Layout)",
    "description": "Symptom:\nChild card row does not align with parent grid because display: subgrid is missing on intermediate wrapper. Observed across multi-viewport browser testing.\n\nObjective:\nUse display: grid with grid-template-rows: subgrid. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Subgrid Layout Alignment Shift (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".item { display: grid; grid-template-rows: subgrid; grid-row: span 3; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Child card row does not align with parent grid because display: subgrid is missing on intermediate wrapper. Observed across multi-viewport browser testing. */\n/* FIX HINT: Use display: grid with grid-template-rows: subgrid */\n.item { display: flex; flex-direction: column; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Use display: grid with grid-template-rows: subgrid"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Subgrid Layout Alignment Shift (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-glass-blur-opaque-bg-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Backdrop Blur Invisible Filter (Production Layout)",
    "description": "Symptom:\nGlassmorphic overlay has no blur effect because background color is 100% opaque, hiding blur. Observed across multi-viewport browser testing.\n\nObjective:\nMake background translucent (e.g. rgba(15,23,42,0.6)) so blur is visible. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Backdrop Blur Invisible Filter (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Glassmorphic overlay has no blur effect because background color is 100% opaque, hiding blur. Observed across multi-viewport browser testing. */\n/* FIX HINT: Make background translucent (e.g. rgba(15,23,42,0.6)) so blur is visible */\n.glass { background: #0f172a; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Make background translucent (e.g. rgba(15,23,42,0.6)) so blur is visible"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Backdrop Blur Invisible Filter (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-transition-shorthand-order-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Transition Property Shorthand Order (Production Layout)",
    "description": "Symptom:\nButton hover transition does not animate smoothly because duration and delay are inverted. Observed across multi-viewport browser testing.\n\nObjective:\nProvide explicit duration: transform 0.25s ease-out. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Transition Property Shorthand Order (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".btn { transition: transform 0.25s ease-out, background-color 0.25s ease-out; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Button hover transition does not animate smoothly because duration and delay are inverted. Observed across multi-viewport browser testing. */\n/* FIX HINT: Provide explicit duration: transform 0.25s ease-out */\n.btn { transition: transform ease-out, background-color ease-out; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Provide explicit duration: transform 0.25s ease-out"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Transition Property Shorthand Order (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-aspect-ratio-zero-height-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Aspect Ratio Container Sizing (Production Layout)",
    "description": "Symptom:\nVideo aspect ratio container collapses to zero height because width is auto without block display. Observed across multi-viewport browser testing.\n\nObjective:\nSet width: 100% and display: block on aspect-ratio container. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Aspect Ratio Container Sizing (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".video-box { aspect-ratio: 16 / 9; width: 100%; max-width: 600px; display: block; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Video aspect ratio container collapses to zero height because width is auto without block display. Observed across multi-viewport browser testing. */\n/* FIX HINT: Set width: 100% and display: block on aspect-ratio container */\n.video-box { aspect-ratio: 16 / 9; width: auto; display: inline; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Set width: 100% and display: block on aspect-ratio container"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Aspect Ratio Container Sizing (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-scrollbar-styling-clipped-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Custom Scrollbar Styling Clip (Production Layout)",
    "description": "Symptom:\nCustom webkit scrollbar track is completely transparent and clipped outside the modal border. Observed across multi-viewport browser testing.\n\nObjective:\nDefine proper width and thumb background for webkit scrollbar. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Custom Scrollbar Styling Clip (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".scroll-box::-webkit-scrollbar { width: 6px; } .scroll-box::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Custom webkit scrollbar track is completely transparent and clipped outside the modal border. Observed across multi-viewport browser testing. */\n/* FIX HINT: Define proper width and thumb background for webkit scrollbar */\n.scroll-box::-webkit-scrollbar { width: 0px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Define proper width and thumb background for webkit scrollbar"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Custom Scrollbar Styling Clip (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-300s-media-query-mobile-overwrite-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Media Query Breakpoint Overwrite (Production Layout)",
    "description": "Symptom:\nDesktop styles are applied on mobile because min-width query is defined after desktop rules without ordering. Observed across multi-viewport browser testing.\n\nObjective:\nCorrect the media query order so mobile breakpoint cleanly hides sidebar. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Target: Media Query Breakpoint Overwrite (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": "@media (max-width: 640px) { .sidebar { display: none; } } .sidebar { display: block; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Desktop styles are applied on mobile because min-width query is defined after desktop rules without ordering. Observed across multi-viewport browser testing. */\n/* FIX HINT: Correct the media query order so mobile breakpoint cleanly hides sidebar */\n.sidebar { display: block; } @media (min-width: 641px) { .sidebar { display: block; } }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Correct the media query order so mobile breakpoint cleanly hides sidebar"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Media Query Breakpoint Overwrite (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-clamp-fluid-typography-calc-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Fluid Typography Clamp Calculation Error (Production Layout)",
    "description": "Symptom:\nClamp expression fails to scale font dynamically on resize due to missing viewport units. Observed across multi-viewport browser testing.\n\nObjective:\nUse responsive viewport units in clamp(min, val + vw, max). Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Fluid Typography Clamp Calculation Error (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": "h1 { font-size: clamp(1.5rem, 4vw + 1rem, 3rem); line-height: 1.2; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Clamp expression fails to scale font dynamically on resize due to missing viewport units. Observed across multi-viewport browser testing. */\n/* FIX HINT: Use responsive viewport units in clamp(min, val + vw, max) */\nh1 { font-size: clamp(1.5rem, 4rem, 3rem); line-height: 1.2; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Use responsive viewport units in clamp(min, val + vw, max)"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Fluid Typography Clamp Calculation Error (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-column-count-break-inside-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Multi-Column Card Masonry Gap Breakdown (Production Layout)",
    "description": "Symptom:\nColumn-count masonry card breaks across page column boundary awkwardly. Observed across multi-viewport browser testing.\n\nObjective:\nAdd break-inside: avoid to prevent cards from splitting across columns. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Multi-Column Card Masonry Gap Breakdown (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".card { break-inside: avoid; page-break-inside: avoid; margin-bottom: 16px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Column-count masonry card breaks across page column boundary awkwardly. Observed across multi-viewport browser testing. */\n/* FIX HINT: Add break-inside: avoid to prevent cards from splitting across columns */\n.card { break-inside: auto; margin-bottom: 16px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Add break-inside: avoid to prevent cards from splitting across columns"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Multi-Column Card Masonry Gap Breakdown (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-dark-mode-prefers-color-scheme-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Dark Mode System Prefers-Color-Scheme Override (Production Layout)",
    "description": "Symptom:\nDark mode media query fails to activate because manual class selector has higher specificity. Observed across multi-viewport browser testing.\n\nObjective:\nRemove hardcoded !important overrides to allow prefers-color-scheme to work. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Dark Mode System Prefers-Color-Scheme Override (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": "@media (prefers-color-scheme: dark) { :root { --bg: #090d16; --text: #f8fafc; } }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Dark mode media query fails to activate because manual class selector has higher specificity. Observed across multi-viewport browser testing. */\n/* FIX HINT: Remove hardcoded !important overrides to allow prefers-color-scheme to work */\n:root { --bg: #ffffff !important; --text: #000000 !important; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Remove hardcoded !important overrides to allow prefers-color-scheme to work"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Dark Mode System Prefers-Color-Scheme Override (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-focus-visible-clipped-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Accessible Focus-Visible Ring Clipping (Production Layout)",
    "description": "Symptom:\nKeyboard focus ring on input is clipped by parent container overflow: hidden. Observed across multi-viewport browser testing.\n\nObjective:\nEnsure outline: 2px solid is present and parent allows visible outline offset. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Accessible Focus-Visible Ring Clipping (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": "input:focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; } .wrapper { overflow: visible; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Keyboard focus ring on input is clipped by parent container overflow: hidden. Observed across multi-viewport browser testing. */\n/* FIX HINT: Ensure outline: 2px solid is present and parent allows visible outline offset */\ninput:focus-visible { outline: none; } .wrapper { overflow: hidden; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Ensure outline: 2px solid is present and parent allows visible outline offset"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Accessible Focus-Visible Ring Clipping (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-print-media-background-inversion-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Print Media Stylesheet Inversion (Production Layout)",
    "description": "Symptom:\nPrint media query prints dark background ink instead of clean white paper background. Observed across multi-viewport browser testing.\n\nObjective:\nSet background: white and color: black in @media print. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Print Media Stylesheet Inversion (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": "@media print { body { background: white; color: black; } .no-print { display: none; } }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Print media query prints dark background ink instead of clean white paper background. Observed across multi-viewport browser testing. */\n/* FIX HINT: Set background: white and color: black in @media print */\n@media print { body { background: #000; color: #fff; } }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Set background: white and color: black in @media print"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Print Media Stylesheet Inversion (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-grid-autofit-ghost-columns-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: CSS Grid Auto-Fit vs Auto-Fill Dynamic Columns (Production Layout)",
    "description": "Symptom:\nGrid leaves empty ghost columns because auto-fill was used instead of auto-fit. Observed across multi-viewport browser testing.\n\nObjective:\nUse auto-fit so items stretch dynamically across row without ghost columns. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: CSS Grid Auto-Fit vs Auto-Fill Dynamic Columns (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Grid leaves empty ghost columns because auto-fill was used instead of auto-fit. Observed across multi-viewport browser testing. */\n/* FIX HINT: Use auto-fit so items stretch dynamically across row without ghost columns */\n.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Use auto-fit so items stretch dynamically across row without ghost columns"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify CSS Grid Auto-Fit vs Auto-Fill Dynamic Columns (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-container-query-missing-type-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Container Queries Cqi Unit Failure (Production Layout)",
    "description": "Symptom:\nComponent container query fails to adjust font size because container-type: inline-size is omitted on ancestor. Observed across multi-viewport browser testing.\n\nObjective:\nAdd container-type: inline-size to the parent container. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Container Queries Cqi Unit Failure (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".widget-container { container-type: inline-size; } @container (min-width: 400px) { .title { font-size: 1.5rem; } }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Component container query fails to adjust font size because container-type: inline-size is omitted on ancestor. Observed across multi-viewport browser testing. */\n/* FIX HINT: Add container-type: inline-size to the parent container */\n.widget-container { width: 100%; } @container (min-width: 400px) { .title { font-size: 1.5rem; } }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Add container-type: inline-size to the parent container"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Container Queries Cqi Unit Failure (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-animation-fill-mode-reset-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: Animation Fill Mode State Reset (Production Layout)",
    "description": "Symptom:\nKeyframe animation snaps back to original position after running because animation-fill-mode: forwards is missing. Observed across multi-viewport browser testing.\n\nObjective:\nAdd animation-fill-mode: forwards to retain the final animation state. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: Animation Fill Mode State Reset (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".modal { animation: slideUp 0.4s ease-out forwards; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Keyframe animation snaps back to original position after running because animation-fill-mode: forwards is missing. Observed across multi-viewport browser testing. */\n/* FIX HINT: Add animation-fill-mode: forwards to retain the final animation state */\n.modal { animation: slideUp 0.4s ease-out; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Add animation-fill-mode: forwards to retain the final animation state"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify Animation Fill Mode State Reset (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-svg-currentcolor-inheritance-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: SVG Icon CurrentColor Color Inheritance (Production Layout)",
    "description": "Symptom:\nInline SVG icon remains black despite parent text color change because fill='currentColor' is missing. Observed across multi-viewport browser testing.\n\nObjective:\nSet fill: currentColor to inherit parent text color. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: SVG Icon CurrentColor Color Inheritance (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": "svg { fill: currentColor; width: 20px; height: 20px; }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Inline SVG icon remains black despite parent text color change because fill='currentColor' is missing. Observed across multi-viewport browser testing. */\n/* FIX HINT: Set fill: currentColor to inherit parent text color */\nsvg { fill: #000000; width: 20px; height: 20px; }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Set fill: currentColor to inherit parent text color"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify SVG Icon CurrentColor Color Inheritance (Production Layout) is fixed"
      }
    ]
  },
  {
    "id": "bughunt-htmlcss-medium-600s-mask-radial-gradient-cutoff-medium",
    "arena": "bug_hunt",
    "bugDomain": "web",
    "title": "Fix CSS Bug: CSS Mask Radial Gradient Vignette Bug (Production Layout)",
    "description": "Symptom:\nMask image gradient cuts off content sharply because color stop units are misplaced. Observed across multi-viewport browser testing.\n\nObjective:\nSpecify accurate percentage color stops (black 60%, transparent 100%) in mask-image. Ensure the live output preview matches the target blueprint.",
    "tags": [
      "bug_web",
      "html",
      "css"
    ],
    "difficulty": "medium",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Target: CSS Mask Radial Gradient Vignette Bug (Production Layout)",
    "targetComponentHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "targetComponentCss": ".vignette { -webkit-mask-image: radial-gradient(circle, black 60%, transparent 100%); mask-image: radial-gradient(circle, black 60%, transparent 100%); }",
    "starterHtml": "<div class=\"demo-card\">\n  <div class=\"cards\">\n    <div class=\"box\">Item 1</div>\n    <div class=\"box\">Item 2</div>\n    <div class=\"box\">Item 3</div>\n  </div>\n</div>",
    "starterCss": "/* BUG DIAGNOSIS TICKET: Mask image gradient cuts off content sharply because color stop units are misplaced. Observed across multi-viewport browser testing. */\n/* FIX HINT: Specify accurate percentage color stops (black 60%, transparent 100%) in mask-image */\n.vignette { -webkit-mask-image: radial-gradient(circle, black, transparent); }",
    "validationCriteria": [
      "CSS layout bug eliminated",
      "Output matches target blueprint exactly",
      "Specify accurate percentage color stops (black 60%, transparent 100%) in mask-image"
    ],
    "testCases": [
      {
        "input": "css_layout_valid",
        "expectedOutput": "true",
        "description": "Verify CSS Mask Radial Gradient Vignette Bug (Production Layout) is fixed"
      }
    ]
  }
];
