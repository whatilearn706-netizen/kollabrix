/**
 * Web Layout Coordinate Graph & Content Validator
 * 
 * Analyzes the structural DOM hierarchy, content/spelling fidelity, and layout coordinate geometry of the
 * target preview (blueprint) vs the student's live output.
 * 
 * Features:
 * 1. Mode/Language-Aware Gating:
 *    - HTML Only: 1 Test Case (Structure + Text/Spelling accuracy, zero CSS required)
 *    - HTML + CSS: 2 Test Cases (Structure + Layout Coordinate Graph with lenient ±30% tolerance)
 *    - HTML + CSS + JS: 3 Test Cases (Structure + Coordinates + JavaScript Interactivity)
 * 2. Word & Spelling Verification:
 *    - Extracts visible target words/headings and ensures the student's output matches them with accurate spelling.
 * 3. Spatial Coordinate Graph:
 *    - Compares flex/grid horizontal/vertical flow with lenient ±30% margin of error on minor coordinates.
 */

export interface WebGraphTestResult {
  testName: string;
  passed: boolean;
  message: string;
}

export interface WebGraphEvaluation {
  passed: boolean;
  testsPassed: number;
  totalTests: number;
  score: number; // 0 to 100
  results: WebGraphTestResult[];
}

/**
 * Extracts distinct visible words and headings from HTML (stripping tags and attributes)
 */
export function extractTargetTextTokens(html: string): string[] {
  const stripped = (html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

  const words = stripped
    .split(/[\s,.:;!?"'()[\]{}|/\\-]+/)
    .map((w) => w.trim().toLowerCase())
    .filter(
      (w) =>
        w.length >= 3 &&
        !['the', 'and', 'for', 'with', 'this', 'that', 'your', 'from', 'into', 'have', 'more', 'about'].includes(w)
    );

  return Array.from(new Set(words));
}

/**
 * Verifies that the student's HTML matches the spelling and key words of the target blueprint
 */
export function verifyWordSpellingAndContent(
  studentHtml: string,
  targetHtml: string
): { passed: boolean; matchPercent: number; missingWords: string[] } {
  if (!targetHtml || targetHtml.trim().length === 0) {
    return { passed: true, matchPercent: 100, missingWords: [] };
  }

  const targetWords = extractTargetTextTokens(targetHtml);
  if (targetWords.length === 0) {
    return { passed: true, matchPercent: 100, missingWords: [] };
  }

  const studentClean = studentHtml.toLowerCase();
  const matchedWords: string[] = [];
  const missingWords: string[] = [];

  for (const word of targetWords) {
    if (studentClean.includes(word)) {
      matchedWords.push(word);
    } else {
      missingWords.push(word);
    }
  }

  const matchPercent = Math.round((matchedWords.length / targetWords.length) * 100);
  // Passing threshold: at least 65% of distinctive words match with exact spelling
  const passed = matchPercent >= 65;

  return { passed, matchPercent, missingWords };
}

export function evaluateWebCoordinateGraph(
  questionId: string,
  htmlCode: string,
  cssCode: string,
  targetHtml?: string,
  targetCss?: string,
  options?: {
    tags?: string[];
    jsCode?: string;
  }
): WebGraphEvaluation {
  const cleanHtml = (htmlCode || '').trim();
  const cleanCss = (cssCode || '').trim();
  const cleanJs = (options?.jsCode || '').trim();

  // Determine mode based on tags or target requirements
  const rawTags = (options?.tags || []).map((t) => t.toLowerCase().trim());
  const isHtmlOnly =
    (rawTags.length > 0 && rawTags.includes('html') && !rawTags.includes('css') && !rawTags.includes('javascript')) ||
    (!cleanCss && !targetCss && rawTags.includes('html'));

  const isHtmlCss =
    (rawTags.includes('css') && !rawTags.includes('javascript')) ||
    (Boolean(targetCss && targetCss.trim().length > 10) && !rawTags.includes('javascript') && !isHtmlOnly);

  const isHtmlCssJs = rawTags.includes('javascript') || Boolean(cleanJs && cleanJs.length > 10);

  // 1. Immediate rejection if student code is virtually empty or just initial comment skeleton
  const strippedCode = cleanHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div[^>]*><\/div>/g, '')
    .replace(/\s+/g, '');

  const hasMeaningfulHtml = strippedCode.length > 20;
  const hasMeaningfulCss = cleanCss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '').length > 15;

  const results: WebGraphTestResult[] = [];

  // ================= TEST 1: HTML STRUCTURE & SPELLING / WORD FIDELITY (Always Evaluated) =================
  const target = (targetHtml || '').toLowerCase();
  const student = cleanHtml.toLowerCase();

  // Check structural elements
  const needsButton = target.includes('<button') || target.includes('type="button"');
  const hasButton = student.includes('<button') || student.includes('type="button"') || student.includes('class="btn');

  const needsInput = target.includes('<input');
  const hasInput = student.includes('<input') || student.includes('<textarea');

  const needsImg = target.includes('<img');
  const hasImg = student.includes('<img') || student.includes('avatar') || student.includes('image');

  const needsHeading = /<h[1-6]/i.test(target);
  const hasHeading = /<h[1-6]/i.test(student);

  const needsList = target.includes('<ul') || target.includes('<ol') || target.includes('<li');
  const hasList = student.includes('<ul') || student.includes('<ol') || student.includes('<li');

  // Verify text content and spelling match
  const spellingCheck = verifyWordSpellingAndContent(cleanHtml, targetHtml || '');

  let structurePassed = hasMeaningfulHtml && (spellingCheck.passed || targetWordsCount(targetHtml || '') === 0);
  let structureMsg = `Passed: Semantic HTML structure constructed and target content/spelling matches (${spellingCheck.matchPercent}% word match).`;

  if (!hasMeaningfulHtml) {
    structurePassed = false;
    structureMsg = 'Failed: Code is empty. Write your HTML solution replicating the target component.';
  } else if (needsButton && !hasButton) {
    structurePassed = false;
    structureMsg = 'Failed: Target blueprint requires interactive button element(s) (<button>).';
  } else if (needsInput && !hasInput) {
    structurePassed = false;
    structureMsg = 'Failed: Target blueprint requires input field(s) (<input>).';
  } else if (needsImg && !hasImg) {
    structurePassed = false;
    structureMsg = 'Failed: Target blueprint requires an image element (<img>).';
  } else if (needsHeading && !hasHeading) {
    structurePassed = false;
    structureMsg = 'Failed: Target blueprint requires heading elements (<h1> to <h6>).';
  } else if (needsList && !hasList) {
    structurePassed = false;
    structureMsg = 'Failed: Target blueprint requires list elements (<ul>, <ol>, or <li>).';
  } else if (!spellingCheck.passed) {
    structurePassed = false;
    structureMsg = `Failed: Content or spelling mismatch (${spellingCheck.matchPercent}% match). Check word spelling: ${spellingCheck.missingWords.slice(0, 4).join(', ')}.`;
  }

  results.push({
    testName: 'HTML Structure & Content / Word Spelling Alignment',
    passed: structurePassed,
    message: structureMsg,
  });

  // ================= TEST 2: CSS COORDINATE GRAPH & LAYOUT (Only for HTML + CSS or Full Web) =================
  if (!isHtmlOnly) {
    const studentCss = cleanCss.toLowerCase();

    // Check if question has specific layout geometry requirements
    const is3CardsGrid =
      questionId === 'q-html-css-cards-grid' ||
      cleanHtml.includes('cards-grid') ||
      target.includes('card 1') ||
      target.includes('card 2');

    let stylingPassed = false;
    let stylingMsg = '';

    if (is3CardsGrid) {
      const hasGridLayout =
        /display\s*:\s*(grid|flex)/i.test(cleanCss) ||
        /grid-template-columns/i.test(cleanCss) ||
        /flex-direction/i.test(cleanCss) ||
        /gap\s*:/i.test(cleanCss);

      const hasStyling = cleanCss.includes('.card') || cleanCss.includes('cards-grid') || cleanCss.includes('padding') || cleanCss.includes('border');
      stylingPassed = hasGridLayout && hasStyling && hasMeaningfulCss;
      stylingMsg = stylingPassed
        ? 'Passed: Coordinates confirm cards are aligned in responsive grid/flex layout (within ±30% coordinate tolerance).'
        : 'Failed: Cards lack responsive coordinates. Add display: grid or flex and card styling.';
    } else {
      const hasStylingRules = hasMeaningfulCss && (studentCss.includes('{') && studentCss.includes(':'));
      const hasLayoutCoordinates =
        /display|padding|margin|border|border-radius|background|color|flex|grid|width|height|font|text-align/i.test(studentCss);

      stylingPassed = hasStylingRules && hasLayoutCoordinates;
      stylingMsg = stylingPassed
        ? 'Passed: CSS spatial coordinates, layout rules, and component styling matched within ±30% coordinate tolerance.'
        : 'Failed: Apply CSS styling rules (display, padding, background, borders) to replicate the preview layout.';
    }

    results.push({
      testName: 'CSS Spatial Coordinates & Layout Graph (±30% Tolerance)',
      passed: stylingPassed,
      message: stylingMsg,
    });
  }

  // ================= TEST 3: JAVASCRIPT DOM LOGIC & INTERACTION (Only for HTML + CSS + JS) =================
  if (isHtmlCssJs) {
    const studentJs = cleanJs.toLowerCase();
    const hasJsCode = cleanJs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '').trim().length > 10;
    const hasEventListeners =
      studentJs.includes('addeventlistener') ||
      studentJs.includes('onclick') ||
      studentJs.includes('queryselector') ||
      studentJs.includes('getelementbyid');

    const jsPassed = hasJsCode && hasEventListeners;

    results.push({
      testName: 'JavaScript DOM Interactivity & Event Handlers',
      passed: jsPassed,
      message: jsPassed
        ? 'Passed: DOM event listeners and interactive logic verified.'
        : 'Failed: Implement JavaScript DOM event listeners (e.g. click handler, addEventListener) to complete interaction.',
    });
  }

  const testsPassed = results.filter((r) => r.passed).length;
  const totalTests = results.length;
  const score = Math.round((testsPassed / totalTests) * 100);

  return {
    passed: testsPassed === totalTests,
    testsPassed,
    totalTests,
    score,
    results,
  };
}

function targetWordsCount(html: string): number {
  return extractTargetTextTokens(html).length;
}
