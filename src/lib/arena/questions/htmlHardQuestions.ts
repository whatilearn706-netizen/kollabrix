import type { DuelQuestion } from '@/types/arenaDuel';

/**
 * Calibrated Battle Arena Questions (30 items)
 * Designed for collegiate speed-coding with ~30 seconds margin to spare.
 */
export const HTML_HARD_ARENA_QUESTIONS: DuelQuestion[] = [
  {
    "id": "html-hard-3m-microdata-product",
    "arena": "web_dev",
    "title": "Microdata Product Rich Snippet",
    "description": "Product card with itemscope, itemtype='https://schema.org/Product', itemprop='name', and itemprop='price'.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Microdata Product Rich Snippet",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Microdata Product Rich Snippet</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Product card with itemscope, itemtype='https://schema.org/Product', itemprop='name', and itemprop='price'.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">In Stock</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"microdata-product-root\">\n  <!-- Build Microdata Product Rich Snippet with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Microdata Product Rich Snippet"
      }
    ],
    "validationCriteria": [
      "Microdata Product Rich Snippet",
      "In Stock",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-aria-tablist",
    "arena": "web_dev",
    "title": "Accessible Tablist Navigation Structure",
    "description": "ARIA tab navigation with role='tablist', 3 tabs with role='tab' and aria-selected, mapped to tabpanels.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Accessible Tablist Navigation Structure",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Accessible Tablist Navigation Structure</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">ARIA tab navigation with role='tablist', 3 tabs with role='tab' and aria-selected, mapped to tabpanels.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Overview Tab</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"aria-tablist-root\">\n  <!-- Build Accessible Tablist Navigation Structure with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Accessible Tablist Navigation Structure"
      }
    ],
    "validationCriteria": [
      "Accessible Tablist Navigation Structure",
      "Overview Tab",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-aria-treeview",
    "arena": "web_dev",
    "title": "Hierarchical Category Treeview",
    "description": "Accessible treeview using role='tree', role='treeitem', aria-expanded='false', and nested groups.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Hierarchical Category Treeview",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Hierarchical Category Treeview</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Accessible treeview using role='tree', role='treeitem', aria-expanded='false', and nested groups.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Components Subtree</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"aria-treeview-root\">\n  <!-- Build Hierarchical Category Treeview with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Hierarchical Category Treeview"
      }
    ],
    "validationCriteria": [
      "Hierarchical Category Treeview",
      "Components Subtree",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-aria-live-search",
    "arena": "web_dev",
    "title": "Live Region Search Filter Announcer",
    "description": "Filter bar linked to output aria-live='polite' element announcing matching result counts.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Live Region Search Filter Announcer",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Live Region Search Filter Announcer</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Filter bar linked to output aria-live='polite' element announcing matching result counts.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">5 Results Found</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"aria-live-search-root\">\n  <!-- Build Live Region Search Filter Announcer with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Live Region Search Filter Announcer"
      }
    ],
    "validationCriteria": [
      "Live Region Search Filter Announcer",
      "5 Results Found",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-aria-error-form",
    "arena": "web_dev",
    "title": "High-Contrast Form with Error Traps",
    "description": "Form with aria-invalid='true', aria-describedby='err-1', and linked error alert container.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "High-Contrast Form with Error Traps",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">High-Contrast Form with Error Traps</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Form with aria-invalid='true', aria-describedby='err-1', and linked error alert container.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Invalid Email Format</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"aria-error-form-root\">\n  <!-- Build High-Contrast Form with Error Traps with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for High-Contrast Form with Error Traps"
      }
    ],
    "validationCriteria": [
      "High-Contrast Form with Error Traps",
      "Invalid Email Format",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-schema-breadcrumbs",
    "arena": "web_dev",
    "title": "Breadcrumb Trail with Schema Microdata",
    "description": "Breadcrumb nav with itemprop='itemListElement' and itemprop='position' attributes.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Breadcrumb Trail with Schema Microdata",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Breadcrumb Trail with Schema Microdata</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Breadcrumb nav with itemprop='itemListElement' and itemprop='position' attributes.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Navigation Breadcrumbs</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"schema-breadcrumbs-root\">\n  <!-- Build Breadcrumb Trail with Schema Microdata with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Breadcrumb Trail with Schema Microdata"
      }
    ],
    "validationCriteria": [
      "Breadcrumb Trail with Schema Microdata",
      "Navigation Breadcrumbs",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-colgroup-table",
    "arena": "web_dev",
    "title": "Multi-Currency Colgroup Table",
    "description": "Financial table using colgroup with span formatting, caption, and strict row/col scoping.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Multi-Currency Colgroup Table",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Multi-Currency Colgroup Table</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Financial table using colgroup with span formatting, caption, and strict row/col scoping.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Financial Ledger</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"colgroup-table-root\">\n  <!-- Build Multi-Currency Colgroup Table with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Multi-Currency Colgroup Table"
      }
    ],
    "validationCriteria": [
      "Multi-Currency Colgroup Table",
      "Financial Ledger",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-aria-stepper",
    "arena": "web_dev",
    "title": "Accessible Stepper Indicator",
    "description": "4-step wizard using <ol>, aria-current='step', and screen-reader accessibility labels.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Accessible Stepper Indicator",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Accessible Stepper Indicator</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">4-step wizard using <ol>, aria-current='step', and screen-reader accessibility labels.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Payment Verification</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"aria-stepper-root\">\n  <!-- Build Accessible Stepper Indicator with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Accessible Stepper Indicator"
      }
    ],
    "validationCriteria": [
      "Accessible Stepper Indicator",
      "Payment Verification",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-media-dock",
    "arena": "web_dev",
    "title": "Media Controls Dock with ARIA Labels",
    "description": "Semantic control dock for video using <menu>, buttons with aria-label, and volume range input.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Media Controls Dock with ARIA Labels",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Media Controls Dock with ARIA Labels</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Semantic control dock for video using <menu>, buttons with aria-label, and volume range input.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Playback Volume</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"media-dock-root\">\n  <!-- Build Media Controls Dock with ARIA Labels with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Media Controls Dock with ARIA Labels"
      }
    ],
    "validationCriteria": [
      "Media Controls Dock with ARIA Labels",
      "Playback Volume",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-3m-aria-accordion",
    "arena": "web_dev",
    "title": "Accessible Accordion with State Attributes",
    "description": "Two panels with aria-controls, aria-expanded='true/false', and focusable header buttons.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 180,
    "targetPreviewTitle": "Accessible Accordion with State Attributes",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Accessible Accordion with State Attributes</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Two panels with aria-controls, aria-expanded='true/false', and focusable header buttons.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Account Settings</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"aria-accordion-root\">\n  <!-- Build Accessible Accordion with State Attributes with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Accessible Accordion with State Attributes"
      }
    ],
    "validationCriteria": [
      "Accessible Accordion with State Attributes",
      "Account Settings",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-schema-recipe",
    "arena": "web_dev",
    "title": "Schema Recipe Card with Microdata",
    "description": "Culinary card with Recipe schema, cookTime time tag, nutrition meter, and ingredients list.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Schema Recipe Card with Microdata",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Schema Recipe Card with Microdata</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Culinary card with Recipe schema, cookTime time tag, nutrition meter, and ingredients list.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Ingredients Checklist</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"schema-recipe-root\">\n  <!-- Build Schema Recipe Card with Microdata with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Schema Recipe Card with Microdata"
      }
    ],
    "validationCriteria": [
      "Schema Recipe Card with Microdata",
      "Ingredients Checklist",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-multi-step-form",
    "arena": "web_dev",
    "title": "Multi-Step Accessible Registration Form",
    "description": "3 distinct fieldsets linked with ARIA progression attributes and live validation callouts.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Multi-Step Accessible Registration Form",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Multi-Step Accessible Registration Form</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">3 distinct fieldsets linked with ARIA progression attributes and live validation callouts.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Security Credentials</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"multi-step-form-root\">\n  <!-- Build Multi-Step Accessible Registration Form with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Multi-Step Accessible Registration Form"
      }
    ],
    "validationCriteria": [
      "Multi-Step Accessible Registration Form",
      "Security Credentials",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-matrix-sticky",
    "arena": "web_dev",
    "title": "Responsive Comparison Matrix with Sticky Headers",
    "description": "Comparison matrix for 4 software tiers with checkmark badges and category dividers.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Responsive Comparison Matrix with Sticky Headers",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Responsive Comparison Matrix with Sticky Headers</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Comparison matrix for 4 software tiers with checkmark badges and category dividers.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Enterprise Tier</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"matrix-sticky-root\">\n  <!-- Build Responsive Comparison Matrix with Sticky Headers with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Responsive Comparison Matrix with Sticky Headers"
      }
    ],
    "validationCriteria": [
      "Responsive Comparison Matrix with Sticky Headers",
      "Enterprise Tier",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-social-thread",
    "arena": "web_dev",
    "title": "Rich Social Post with Comment Thread",
    "description": "Post with author microdata, timestamp, engagement counters, and nested comments list.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Rich Social Post with Comment Thread",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Rich Social Post with Comment Thread</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Post with author microdata, timestamp, engagement counters, and nested comments list.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Verified Author</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"social-thread-root\">\n  <!-- Build Rich Social Post with Comment Thread with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Rich Social Post with Comment Thread"
      }
    ],
    "validationCriteria": [
      "Rich Social Post with Comment Thread",
      "Verified Author",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-cash-flows",
    "arena": "web_dev",
    "title": "Financial Statement of Cash Flows",
    "description": "Accounting table with sub-totals, indented item rows, and footnote disclosures.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Financial Statement of Cash Flows",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Financial Statement of Cash Flows</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Accounting table with sub-totals, indented item rows, and footnote disclosures.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Net Operating Cash</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"cash-flows-root\">\n  <!-- Build Financial Statement of Cash Flows with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Financial Statement of Cash Flows"
      }
    ],
    "validationCriteria": [
      "Financial Statement of Cash Flows",
      "Net Operating Cash",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-quiz-card",
    "arena": "web_dev",
    "title": "Interactive Quiz Question Card",
    "description": "Multiple-choice quiz question inside fieldset with timer indicator and hint details.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Interactive Quiz Question Card",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Interactive Quiz Question Card</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Multiple-choice quiz question inside fieldset with timer indicator and hint details.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Question 4 of 10</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"quiz-card-root\">\n  <!-- Build Interactive Quiz Question Card with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Interactive Quiz Question Card"
      }
    ],
    "validationCriteria": [
      "Interactive Quiz Question Card",
      "Question 4 of 10",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-ebook-nav",
    "arena": "web_dev",
    "title": "E-Book Reader Navigation Panel",
    "description": "Chapter navigation panel with reading progress bar, font size controls, and bookmark jumps.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "E-Book Reader Navigation Panel",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">E-Book Reader Navigation Panel</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Chapter navigation panel with reading progress bar, font size controls, and bookmark jumps.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Chapter Three</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"ebook-nav-root\">\n  <!-- Build E-Book Reader Navigation Panel with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for E-Book Reader Navigation Panel"
      }
    ],
    "validationCriteria": [
      "E-Book Reader Navigation Panel",
      "Chapter Three",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-dynamic-reg",
    "arena": "web_dev",
    "title": "Campus Hackathon Registration with Dynamic Fields",
    "description": "Form supporting individual/team toggle, roll number validation, and digital waiver agreement.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Campus Hackathon Registration with Dynamic Fields",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Campus Hackathon Registration with Dynamic Fields</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Form supporting individual/team toggle, roll number validation, and digital waiver agreement.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Team Leader Name</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"dynamic-reg-root\">\n  <!-- Build Campus Hackathon Registration with Dynamic Fields with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Campus Hackathon Registration with Dynamic Fields"
      }
    ],
    "validationCriteria": [
      "Campus Hackathon Registration with Dynamic Fields",
      "Team Leader Name",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-review-breakdown",
    "arena": "web_dev",
    "title": "Product Review Breakdown Panel",
    "description": "Rating summary with 5-star visual breakdown using meter bars and verified buyer badges.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Product Review Breakdown Panel",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Product Review Breakdown Panel</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Rating summary with 5-star visual breakdown using meter bars and verified buyer badges.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Overall Rating 4.9</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"review-breakdown-root\">\n  <!-- Build Product Review Breakdown Panel with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Product Review Breakdown Panel"
      }
    ],
    "validationCriteria": [
      "Product Review Breakdown Panel",
      "Overall Rating 4.9",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-5m-permissions-grid",
    "arena": "web_dev",
    "title": "Admin Permissions Role Matrix",
    "description": "Matrix table listing 5 user roles across 6 capabilities with accessible toggle inputs.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 300,
    "targetPreviewTitle": "Admin Permissions Role Matrix",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Admin Permissions Role Matrix</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Matrix table listing 5 user roles across 6 capabilities with accessible toggle inputs.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Administrator Access</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"permissions-grid-root\">\n  <!-- Build Admin Permissions Role Matrix with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Admin Permissions Role Matrix"
      }
    ],
    "validationCriteria": [
      "Admin Permissions Role Matrix",
      "Administrator Access",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-ecommerce-page",
    "arena": "web_dev",
    "title": "Production E-Commerce Product Page",
    "description": "Full layout with microdata, image gallery figures, variant selectors, and review list.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Production E-Commerce Product Page",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Production E-Commerce Product Page</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Full layout with microdata, image gallery figures, variant selectors, and review list.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Add to Shopping Cart</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"ecommerce-page-root\">\n  <!-- Build Production E-Commerce Product Page with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Production E-Commerce Product Page"
      }
    ],
    "validationCriteria": [
      "Production E-Commerce Product Page",
      "Add to Shopping Cart",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-medical-record",
    "arena": "web_dev",
    "title": "Healthcare Patient Medical Record",
    "description": "Patient summary with vital signs table, appointment feed, prescription list, and doctor notes.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Healthcare Patient Medical Record",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Healthcare Patient Medical Record</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Patient summary with vital signs table, appointment feed, prescription list, and doctor notes.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Blood Pressure 120/80</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"medical-record-root\">\n  <!-- Build Healthcare Patient Medical Record with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Healthcare Patient Medical Record"
      }
    ],
    "validationCriteria": [
      "Healthcare Patient Medical Record",
      "Blood Pressure 120/80",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-flight-booking",
    "arena": "web_dev",
    "title": "Flight Booking Search & Results View",
    "description": "Flight selector with departure/arrival datalists, passenger steppers, and class tier cards.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Flight Booking Search & Results View",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Flight Booking Search & Results View</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Flight selector with departure/arrival datalists, passenger steppers, and class tier cards.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Non-Stop Flight</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"flight-booking-root\">\n  <!-- Build Flight Booking Search & Results View with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Flight Booking Search & Results View"
      }
    ],
    "validationCriteria": [
      "Flight Booking Search & Results View",
      "Non-Stop Flight",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-course-catalog",
    "arena": "web_dev",
    "title": "University Course Catalog & Prerequisite Tree",
    "description": "Filterable course directory with department selects, course accordions, and prerequisite trees.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "University Course Catalog & Prerequisite Tree",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">University Course Catalog & Prerequisite Tree</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Filterable course directory with department selects, course accordions, and prerequisite trees.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Data Structures</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"course-catalog-root\">\n  <!-- Build University Course Catalog & Prerequisite Tree with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for University Course Catalog & Prerequisite Tree"
      }
    ],
    "validationCriteria": [
      "University Course Catalog & Prerequisite Tree",
      "Data Structures",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-bug-tracker",
    "arena": "web_dev",
    "title": "Software Bug Tracker Interface",
    "description": "Comprehensive issue reporter with severity radios, file upload, reproduction steps, and preview.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Software Bug Tracker Interface",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Software Bug Tracker Interface</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Comprehensive issue reporter with severity radios, file upload, reproduction steps, and preview.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Critical Severity</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"bug-tracker-root\">\n  <!-- Build Software Bug Tracker Interface with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Software Bug Tracker Interface"
      }
    ],
    "validationCriteria": [
      "Software Bug Tracker Interface",
      "Critical Severity",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-saas-billing",
    "arena": "web_dev",
    "title": "Enterprise SaaS Billing & Subscription Page",
    "description": "3-tier pricing comparison, billing period toggle, feature matrix, and cancellation dialog.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Enterprise SaaS Billing & Subscription Page",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Enterprise SaaS Billing & Subscription Page</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">3-tier pricing comparison, billing period toggle, feature matrix, and cancellation dialog.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Annual Billing Discount</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"saas-billing-root\">\n  <!-- Build Enterprise SaaS Billing & Subscription Page with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Enterprise SaaS Billing & Subscription Page"
      }
    ],
    "validationCriteria": [
      "Enterprise SaaS Billing & Subscription Page",
      "Annual Billing Discount",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-judging-rubric",
    "arena": "web_dev",
    "title": "Collegiate Hackathon Judging Rubric",
    "description": "Scoring sheet for 5 criteria with range sliders, weight percentages, and comment boxes.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Collegiate Hackathon Judging Rubric",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Collegiate Hackathon Judging Rubric</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Scoring sheet for 5 criteria with range sliders, weight percentages, and comment boxes.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Technical Execution</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"judging-rubric-root\">\n  <!-- Build Collegiate Hackathon Judging Rubric with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Collegiate Hackathon Judging Rubric"
      }
    ],
    "validationCriteria": [
      "Collegiate Hackathon Judging Rubric",
      "Technical Execution",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-audiobook-manager",
    "arena": "web_dev",
    "title": "Audiobook Player & Chapter Bookmark Manager",
    "description": "Media suite with audio tag, chapter selector list, playback speed options, and bookmarks.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Audiobook Player & Chapter Bookmark Manager",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Audiobook Player & Chapter Bookmark Manager</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Media suite with audio tag, chapter selector list, playback speed options, and bookmarks.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Bookmark Timestamp</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"audiobook-manager-root\">\n  <!-- Build Audiobook Player & Chapter Bookmark Manager with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Audiobook Player & Chapter Bookmark Manager"
      }
    ],
    "validationCriteria": [
      "Audiobook Player & Chapter Bookmark Manager",
      "Bookmark Timestamp",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-legal-contract",
    "arena": "web_dev",
    "title": "Legal Contract Agreement with Audit Trail",
    "description": "Multi-clause contract with scrollable terms frame, inline initials signature, and timestamps.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Legal Contract Agreement with Audit Trail",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Legal Contract Agreement with Audit Trail</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">Multi-clause contract with scrollable terms frame, inline initials signature, and timestamps.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">Binding Acceptance</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"legal-contract-root\">\n  <!-- Build Legal Contract Agreement with Audit Trail with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Legal Contract Agreement with Audit Trail"
      }
    ],
    "validationCriteria": [
      "Legal Contract Agreement with Audit Trail",
      "Binding Acceptance",
      "Execute Action"
    ]
  },
  {
    "id": "html-hard-10m-api-docs",
    "arena": "web_dev",
    "title": "Developer API Reference Documentation",
    "description": "API endpoint spec with HTTP method badges, path blocks, parameter tables, and response blocks.",
    "tags": [
      "html"
    ],
    "difficulty": "hard",
    "timeLimitSeconds": 600,
    "targetPreviewTitle": "Developer API Reference Documentation",
    "targetComponentHtml": "<div style=\"padding:18px;background:#030712;border:1px solid #1f2937;border-radius:12px;color:#f9fafb;font-family:sans-serif;max-width:480px;\">\n  <h3 style=\"margin:0 0 8px 0;font-size:16px;color:#f59e0b;\">Developer API Reference Documentation</h3>\n  <p style=\"margin:0 0 12px 0;font-size:12px;color:#9ca3af;\">API endpoint spec with HTTP method badges, path blocks, parameter tables, and response blocks.</p>\n  <div style=\"padding:10px;background:#111827;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:12px;\">\n    <strong style=\"color:#fbbf24;\">Verification Requirement:</strong> <span style=\"color:#e5e7eb;\">POST /api/v1/auth</span>\n  </div>\n  <button type=\"button\" style=\"padding:8px 16px;background:#d97706;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;\">Execute Action</button>\n</div>",
    "starterHtml": "<div class=\"api-docs-root\">\n  <!-- Build Developer API Reference Documentation with complete semantic and ARIA compliance -->\n  \n</div>",
    "starterCss": "/* HTML Challenge: Layout is structured via HTML semantic elements */",
    "testCases": [
      {
        "input": "htmlWordsAndStructure",
        "expectedOutput": "true",
        "description": "Strict semantic compliance for Developer API Reference Documentation"
      }
    ],
    "validationCriteria": [
      "Developer API Reference Documentation",
      "POST /api/v1/auth",
      "Execute Action"
    ]
  }
];
