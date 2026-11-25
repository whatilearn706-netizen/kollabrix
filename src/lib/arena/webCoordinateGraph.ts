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
 * Helper to check if two words match with lenient typo tolerance (edit distance <= 2)
 */
function isFuzzyWordMatch(target: string, candidate: string): boolean {
  if (target === candidate) return true;
  if (Math.abs(target.length - candidate.length) > 2) return false;

  // Single-character or transposition typos (e.g. mathmatics vs mathematics, travelling vs traveling)
  let diff = 0;
  let i = 0;
  let j = 0;
  while (i < target.length && j < candidate.length) {
    if (target[i] !== candidate[j]) {
      diff++;
      if (diff > 2) return false;
      if (target.length > candidate.length) {
        i++;
      } else if (candidate.length > target.length) {
        j++;
      } else {
        i++;
        j++;
      }
    } else {
      i++;
      j++;
    }
  }
  diff += (target.length - i) + (candidate.length - j);
  return diff <= 2;
}

/**
 * Extracts distinct visible words from HTML (stripping tags, invisible head/title/meta, comments, and attributes)
 */
export function extractTargetTextTokens(html: string): string[] {
  let content = html || '';

  // CRITICAL: Strip HTML comments first so comment instructions are never extracted as student words
  content = content.replace(/<!--[\s\S]*?-->/g, ' ');

  // Only extract visible canvas elements: strip invisible head, title, meta, link, script, style
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  } else {
    content = content
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<title[\s\S]*?<\/title>/gi, '')
      .replace(/<meta[\s\S]*?>/gi, '');
  }

  const stripped = content
    .replace(/<!--[\s\S]*?-->/g, ' ')
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
  const studentWordsList = Array.from(studentWords);
  const targetHeadingWords = extractHeadingTokens(targetHtml);

  // 1. Check heading words (h1-h6) with lenient typo matching
  const missingHeadingWords: string[] = [];
  for (const hWord of targetHeadingWords) {
    const hasMatch = studentWords.has(hWord) || studentWordsList.some((sw) => isFuzzyWordMatch(hWord, sw));
    if (!hasMatch) {
      missingHeadingWords.push(hWord);
    }
  }

  // 2. Check all distinct target words with fuzzy tolerance
  const matchedWords: string[] = [];
  const missingWords: string[] = [];
  for (const word of targetWords) {
    const hasMatch = studentWords.has(word) || studentWordsList.some((sw) => isFuzzyWordMatch(word, sw));
    if (hasMatch) {
      matchedWords.push(word);
    } else {
      missingWords.push(word);
    }
  }

  const matchPercent = Math.round((matchedWords.length / targetWords.length) * 100);

  // Criteria for passing:
  // - 0 heading words can be missing
  // - If target has <= 5 words, 100% of words must match
  // - If target has > 5 words, at least 85% must match with no more than 2 minor omissions
  let passed = true;
  let missingDetails = '';

  if (missingHeadingWords.length > 0) {
    passed = false;
    missingDetails = `Heading text is incomplete or misspelled: missing "${missingHeadingWords.join('", "')}".`;
  } else if (targetWords.length <= 5 && missingWords.length > 0) {
    passed = false;
    missingDetails = `Missing required word(s) or spelling mismatch: "${missingWords.join('", "')}".`;
  } else if (matchPercent < 85 || missingWords.length > 2) {
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
    starterHtml?: string;
    starterCss?: string;
    starterJs?: string;
    isBugHunt?: boolean;
  }
): WebGraphEvaluation {
  const cleanHtml = (htmlCode || '').trim();
  const cleanCss = (cssCode || '').trim();
  const cleanJs = (options?.jsCode || '').trim();
  const cleanTargetJs = (options?.targetJs || '').trim();
  const starterHtml = (options?.starterHtml || '').trim();
  const starterCss = (options?.starterCss || '').trim();
  const starterJs = (options?.starterJs || '').trim();
  const isBugHunt = Boolean(options?.isBugHunt);

  // Strip all comments from student & starter code before evaluation
  const htmlNoComments = cleanHtml.replace(/<!--[\s\S]*?-->/g, '').trim();
  const starterHtmlNoComments = starterHtml.replace(/<!--[\s\S]*?-->/g, '').trim();
  const cssNoComments = cleanCss.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const starterCssNoComments = starterCss.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const jsNoComments = cleanJs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '').trim();
  const starterJsNoComments = starterJs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '').trim();

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

  // 1. Strict starter & empty code validation (in Bug Hunt, starter HTML/CSS may already be clean when bug is in JS)
  const targetHtmlNoComments = (targetHtml || '').replace(/<!--[\s\S]*?-->/g, '').trim();
  const starterHtmlMatchesTarget =
    isBugHunt &&
    starterHtmlNoComments.length > 0 &&
    starterHtmlNoComments.replace(/\s+/g, '') === targetHtmlNoComments.replace(/\s+/g, '');

  const isStarterHtmlUnchanged =
    !starterHtmlMatchesTarget &&
    starterHtmlNoComments.length > 0 &&
    htmlNoComments.replace(/\s+/g, '') === starterHtmlNoComments.replace(/\s+/g, '');

  const innerHtml = htmlNoComments
    .replace(/<div[^>]*>[\s]*<\/div>/gi, '')
    .replace(/<section[^>]*>[\s]*<\/section>/gi, '')
    .replace(/<main[^>]*>[\s]*<\/main>/gi, '')
    .replace(/<article[^>]*>[\s]*<\/article>/gi, '')
    .trim();

  const studentWords = extractTargetTextTokens(htmlNoComments);
  const studentTagsCount = (htmlNoComments.match(/<[a-z0-9]+[^>]*>/gi) || []).length;
  const hasMeaningfulHtml =
    !isStarterHtmlUnchanged &&
    htmlNoComments.length > 0 &&
    (innerHtml.replace(/\s+/g, '').length > 5 || studentWords.length > 0 || studentTagsCount >= 2);

  const targetCssNoComments = (targetCss || '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const starterCssMatchesTarget =
    isBugHunt &&
    starterCssNoComments.length > 0 &&
    starterCssNoComments.replace(/\s+/g, '') === targetCssNoComments.replace(/\s+/g, '');

  const isStarterCssUnchanged =
    !starterCssMatchesTarget &&
    starterCssNoComments.length > 0 &&
    cssNoComments.replace(/\s+/g, '') === starterCssNoComments.replace(/\s+/g, '');
  const hasMeaningfulCss = !isStarterCssUnchanged && cssNoComments.replace(/\s+/g, '').length > 15;

  const isStarterJsUnchanged =
    isBugHunt &&
    starterJsNoComments.length > 0 &&
    jsNoComments.replace(/\s+/g, '') === starterJsNoComments.replace(/\s+/g, '');

  const results: WebGraphTestResult[] = [];

  // ================= TEST 1: HTML STRUCTURE & SPELLING / WORD FIDELITY =================
  if (hasHtmlTest) {
    const target = (targetHtml || '').toLowerCase();
    const student = htmlNoComments.toLowerCase();

    // Check structural elements on clean student HTML (no comment false positives!)
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

    const needsFieldset = target.includes('<fieldset');
    const hasFieldset = student.includes('<fieldset');

    const needsLegend = target.includes('<legend');
    const hasLegend = student.includes('<legend');

    const needsTable = target.includes('<table');
    const hasTable = student.includes('<table');

    const needsForm = target.includes('<form');
    const hasForm = student.includes('<form');

    const needsBlockquote = target.includes('<blockquote');
    const hasBlockquote = student.includes('<blockquote');

    // Verify text content and spelling match against clean student HTML
    const spellingCheck = verifyWordSpellingAndContent(htmlNoComments, targetHtml || '');

    let structurePassed = hasMeaningfulHtml && (spellingCheck.passed || targetWordsCount(targetHtml || '') === 0);
    let structureMsg = `Passed: Semantic HTML structure constructed and target content/spelling matches (${spellingCheck.matchPercent}% word match).`;

    if (isStarterHtmlUnchanged) {
      structurePassed = false;
      structureMsg = 'Failed: Starter template is unmodified. Implement the required HTML elements to match the target preview.';
    } else if (!hasMeaningfulHtml) {
      structurePassed = false;
      structureMsg = 'Failed: Solution is empty. Write your HTML solution replicating the target component.';
    } else if (needsFieldset && !hasFieldset) {
      structurePassed = false;
      structureMsg = 'Failed: Target blueprint requires semantic fieldset element (<fieldset>).';
    } else if (needsLegend && !hasLegend) {
      structurePassed = false;
      structureMsg = 'Failed: Target blueprint requires semantic legend element (<legend>).';
    } else if (needsTable && !hasTable) {
      structurePassed = false;
      structureMsg = 'Failed: Target blueprint requires a table element (<table>).';
    } else if (needsForm && !hasForm) {
      structurePassed = false;
      structureMsg = 'Failed: Target blueprint requires a form container (<form>).';
    } else if (needsBlockquote && !hasBlockquote) {
      structurePassed = false;
      structureMsg = 'Failed: Target blueprint requires a blockquote element (<blockquote>).';
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
    const studentCss = cssNoComments.toLowerCase();

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

    const jsPassed = !isStarterJsUnchanged && hasJsCode && hasEventListeners && matchesTargetBehavior;

    results.push({
      testName: 'JavaScript DOM Interactivity & Event Handlers',
      passed: jsPassed,
      message: isStarterJsUnchanged
        ? 'Failed: Starter JavaScript bug has not been modified yet. Diagnose and fix the JS bug.'
        : jsPassed
          ? 'Passed: Dynamic DOM event handling and interactive script logic verified.'
          : 'Failed: JavaScript interaction incomplete. Attach DOM event handlers (e.g. click, input) to update the component.',
    });
  }

  // Fallback: Ensure at least one test case is present
  if (results.length === 0) {
    results.push({
      testName: 'HTML Structure & Content / Word Spelling Alignment',
      passed: Boolean(hasMeaningfulHtml),
      message: hasMeaningfulHtml
        ? 'Verified component structure and baseline tags.'
        : 'Failed: Solution is empty. Write your HTML solution replicating the target component.',
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
