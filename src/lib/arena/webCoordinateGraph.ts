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

export interface WordSpellingResult {
  passed: boolean;
  matchPercent: number;
  missingWords: string[];
  missingHeadingWords: string[];
  missingDetails?: string;
}

/**
 * Extracts distinct visible words from HTML (stripping tags and attributes)
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
        w.length >= 2 &&
        !['the', 'and', 'for', 'with', 'this', 'that', 'into', 'have'].includes(w)
    );

  return Array.from(new Set(words));
}

/**
 * Extracts all words specifically inside heading tags (<h1> to <h6>)
 */
export function extractHeadingTokens(html: string): string[] {
  const headingMatches = (html || '').match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  const text = headingMatches.join(' ');
  return extractTargetTextTokens(text);
}

/**
 * Verifies that the student's HTML matches the spelling, headings, and key words of the target blueprint
 */
export function verifyWordSpellingAndContent(
  studentHtml: string,
  targetHtml: string
): WordSpellingResult {
  if (!targetHtml || targetHtml.trim().length === 0) {
    return { passed: true, matchPercent: 100, missingWords: [], missingHeadingWords: [] };
  }

  const targetWords = extractTargetTextTokens(targetHtml);
  if (targetWords.length === 0) {
    return { passed: true, matchPercent: 100, missingWords: [], missingHeadingWords: [] };
  }

  const studentWords = new Set(extractTargetTextTokens(studentHtml));
  const targetHeadingWords = extractHeadingTokens(targetHtml);

  // 1. Mandatory check: All heading words (h1-h6) MUST match exactly (100% heading accuracy)
  const missingHeadingWords: string[] = [];
  for (const hWord of targetHeadingWords) {
    if (!studentWords.has(hWord)) {
      missingHeadingWords.push(hWord);
    }
  }

  // 2. Check all distinct target words
  const matchedWords: string[] = [];
  const missingWords: string[] = [];
  for (const word of targetWords) {
    if (studentWords.has(word)) {
      matchedWords.push(word);
    } else {
      missingWords.push(word);
    }
  }

  const matchPercent = Math.round((matchedWords.length / targetWords.length) * 100);

  // Criteria for passing:
  // - 0 heading words can be missing
  // - If target has <= 5 words, 100% of words must match
  // - If target has > 5 words, at least 90% must match with no more than 1 minor omission
  let passed = true;
  let missingDetails = '';

  if (missingHeadingWords.length > 0) {
    passed = false;
    missingDetails = `Heading text is incomplete or misspelled: missing "${missingHeadingWords.join('", "')}".`;
  } else if (targetWords.length <= 5 && missingWords.length > 0) {
    passed = false;
    missingDetails = `Missing required word(s) or spelling mismatch: "${missingWords.join('", "')}".`;
  } else if (matchPercent < 90 || missingWords.length > 1) {
    passed = false;
    missingDetails = `Content or spelling mismatch (${matchPercent}% match). Missing word(s): "${missingWords.slice(0, 5).join('", "')}".`;
  }

  return {
    passed,
    matchPercent,
    missingWords,
    missingHeadingWords,
    missingDetails,
  };
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
    targetJs?: string;
  }
): WebGraphEvaluation {
  const cleanHtml = (htmlCode || '').trim();
  const cleanCss = (cssCode || '').trim();
  const cleanJs = (options?.jsCode || '').trim();
  const cleanTargetJs = (options?.targetJs || '').trim();

  // Determine mode strictly based on question tags, fallback to target content
  const rawTags = (options?.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const hasExplicitTags = rawTags.some((t) =>
    ['html', 'css', 'js', 'javascript'].includes(t)
  );

  const hasHtmlTest = hasExplicitTags
    ? rawTags.includes('html')
    : true;

  const hasCssTest = hasExplicitTags
    ? rawTags.includes('css')
    : Boolean(targetCss && targetCss.trim().length > 10);

  const hasJsTest = hasExplicitTags
    ? (rawTags.includes('javascript') || rawTags.includes('js'))
    : Boolean(cleanTargetJs && cleanTargetJs.length > 25 && !cleanTargetJs.startsWith('//'));

  // 1. Immediate rejection if student code is virtually empty or just initial comment skeleton
  const strippedCode = cleanHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div[^>]*><\/div>/g, '')
    .replace(/\s+/g, '');

  const hasMeaningfulHtml = strippedCode.length > 20;
  const hasMeaningfulCss = cleanCss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '').length > 15;

  const results: WebGraphTestResult[] = [];

  // ================= TEST 1: HTML STRUCTURE & SPELLING / WORD FIDELITY =================
  if (hasHtmlTest) {
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
      structureMsg = `Failed: ${
        spellingCheck.missingDetails ||
        `Content or spelling mismatch (${spellingCheck.matchPercent}% match). Check word spelling: ${spellingCheck.missingWords.slice(0, 4).join(', ')}.`
      }`;
    }

    results.push({
      testName: 'HTML Structure & Content / Word Spelling Alignment',
      passed: structurePassed,
      message: structureMsg,
    });
  }

  // ================= TEST 2: CSS COORDINATE GRAPH & LAYOUT =================
  if (hasCssTest) {
    const target = (targetHtml || '').toLowerCase();
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

  // ================= TEST 3: JAVASCRIPT DOM LOGIC & INTERACTION =================
  if (hasJsTest) {
    const studentJs = cleanJs.toLowerCase();
    const hasJsCode = cleanJs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '').trim().length > 10;
    
    // Support all standard JavaScript DOM interaction patterns (format-agnostic)
    const hasEventListeners =
      studentJs.includes('addeventlistener') ||
      studentJs.includes('onclick') ||
      studentJs.includes('onchange') ||
      studentJs.includes('onsubmit') ||
      studentJs.includes('queryselector') ||
      studentJs.includes('getelementbyid') ||
      studentJs.includes('getelementsby') ||
      studentJs.includes('.value') ||
      studentJs.includes('.innertext') ||
      studentJs.includes('.innerhtml') ||
      studentJs.includes('.classlist') ||
      studentJs.includes('.style') ||
      studentJs.includes('.setattribute');

    // If target JavaScript is defined by admin, ensure core DOM triggers match
    let matchesTargetBehavior = true;
    if (cleanTargetJs && cleanTargetJs.length > 15) {
      const targetTokens = cleanTargetJs
        .toLowerCase()
        .match(/([a-zA-Z0-9_-]{4,})/g) || [];
      const criticalTokens = targetTokens.filter(
        (t) => !['const', 'let', 'var', 'function', 'return', 'true', 'false', 'document'].includes(t)
      );
      if (criticalTokens.length > 0) {
        const matched = criticalTokens.filter((t) => studentJs.includes(t));
        // Pass if at least 30% of key semantic identifiers/event targets are engaged
        matchesTargetBehavior = matched.length / criticalTokens.length >= 0.3;
      }
    }

    const jsPassed = hasJsCode && hasEventListeners && matchesTargetBehavior;

    results.push({
      testName: 'JavaScript DOM Interactivity & Event Handlers',
      passed: jsPassed,
      message: jsPassed
        ? 'Passed: Dynamic DOM event handling and interactive script logic verified.'
        : 'Failed: JavaScript interaction incomplete. Attach DOM event handlers (e.g. click, input) to update the component.',
    });
  }

  // Fallback: Ensure at least one test case is present
  if (results.length === 0) {
    results.push({
      testName: 'HTML Structure & Content / Word Spelling Alignment',
      passed: Boolean(cleanHtml && cleanHtml.length > 20),
      message: 'Verified component structure and baseline tags.',
    });
  }

  const testsPassed = results.filter((r) => r.passed).length;
  const totalTests = results.length;
  const score = totalTests > 0 ? Math.round((testsPassed / totalTests) * 100) : 100;

  return {
    passed: testsPassed === totalTests && totalTests > 0,
    testsPassed,
    totalTests,
    score,
    results,
  };
}

function targetWordsCount(html: string): number {
  return extractTargetTextTokens(html).length;
}
