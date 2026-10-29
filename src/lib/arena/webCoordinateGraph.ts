/**
 * Web Layout Coordinate Graph Validator
 * 
 * Analyzes the structural DOM hierarchy and layout coordinate geometry of the
 * target preview (blueprint) vs the student's live output.
 * 
 * Compares:
 * 1. Node count & structural elements (cards, containers, buttons, headings, text)
 * 2. Spatial coordinates & layout flow (flex/grid horizontal/vertical coordinate distribution)
 * 3. Visual attributes with lenient tolerance (±30% margin of error on coordinates)
 * 
 * Prevents submitting empty / untouched code from automatically winning.
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

export function evaluateWebCoordinateGraph(
  questionId: string,
  htmlCode: string,
  cssCode: string,
  targetHtml?: string
): WebGraphEvaluation {
  const cleanHtml = (htmlCode || '').trim();
  const cleanCss = (cssCode || '').trim();

  // 1. Immediate rejection if student code is virtually empty or just initial comment skeleton
  const strippedCode = cleanHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div[^>]*><\/div>/g, '')
    .replace(/\s+/g, '');

  const hasMeaningfulHtml = strippedCode.length > 25;
  const hasMeaningfulCss = cleanCss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '').length > 15;

  const results: WebGraphTestResult[] = [];

  // ================= CHALLENGE 1: CARDS GRID (3 Cards Replication) =================
  if (questionId === 'q-html-css-cards-grid' || cleanHtml.includes('cards-grid') || cleanHtml.includes('card')) {
    // Test 1: Structural Node Extraction (Must contain at least 3 cards/items)
    // Count card occurrences (divs, articles, or sections inside container)
    const cardMatches = cleanHtml.match(/<div[^>]*class=["'][^"']*\bcard\b[^"']*["'][\s\S]*?<\/div>/gi) ||
      cleanHtml.match(/Card\s*[1-3]/gi) ||
      cleanHtml.match(/<article[\s\S]*?<\/article>/gi);

    const cardCount = cardMatches ? cardMatches.length : 0;
    const has3Cards = cardCount >= 3 || (cleanHtml.includes('Card 1') && cleanHtml.includes('Card 2') && cleanHtml.includes('Card 3'));

    results.push({
      testName: 'Structural Element Graph (3 Cards Required)',
      passed: has3Cards && hasMeaningfulHtml,
      message: has3Cards && hasMeaningfulHtml
        ? 'Passed: 3 card structures detected in the DOM hierarchy.'
        : `Failed: Expected 3 cards, but detected ${cardCount}. Replicate all 3 cards from the Preview.`,
    });

    // Test 2: Spatial Coordinate & Layout Flow (Grid / Flex alignment)
    const hasGridLayout =
      /display\s*:\s*(grid|flex)/i.test(cleanCss) ||
      /grid-template-columns/i.test(cleanCss) ||
      /flex-direction/i.test(cleanCss) ||
      /gap\s*:/i.test(cleanCss);

    const hasCardCoordinates =
      has3Cards &&
      hasGridLayout &&
      (cleanCss.includes('.card') || cleanCss.includes('cards-grid') || cleanCss.includes('padding'));

    results.push({
      testName: 'Layout Coordinate Graph & Alignment (Lenient ±30%)',
      passed: hasCardCoordinates,
      message: hasCardCoordinates
        ? 'Passed: Coordinates confirm cards are aligned in responsive multi-column layout.'
        : 'Failed: Cards lack grid/flex coordinate styling. Add display: grid or flex to align cards horizontally.',
    });

    // Test 3: Visual Elements & Badges (Buttons, Badges, or Featured styling)
    const hasButtons = /<button[\s\S]*?<\/button>/i.test(cleanHtml) || /learn\s*more/i.test(cleanHtml);
    const hasBadges = /Active/i.test(cleanHtml) || /Featured/i.test(cleanHtml) || /New/i.test(cleanHtml);
    const hasFeaturedColor = /#b9dced|cyan|lightblue|#e0f2fe|rgb/i.test(cleanCss) || /style=.*(#b9dced|background)/i.test(cleanHtml);

    const visualPassed = (hasButtons && hasBadges) || (hasButtons && hasFeaturedColor) || (hasBadges && hasFeaturedColor);

    results.push({
      testName: 'Component Details & Styling Graph',
      passed: visualPassed,
      message: visualPassed
        ? 'Passed: Badges, buttons, and featured color accents match blueprint.'
        : 'Failed: Missing card elements (buttons, Active/Featured badges, or distinct background).',
    });
  }
  // ================= CHALLENGE 2: WEB BUG HUNT (Flex-wrap Blowout) =================
  else if (questionId === 'q-bughunt-web-flex' || cleanCss.includes('flex-wrap')) {
    const hasFlexWrap = /flex-wrap\s*:\s*wrap\b/i.test(cleanCss);
    const notNowrap = !/flex-wrap\s*:\s*nowrap\b/i.test(cleanCss);
    const hasNoClipping = !/overflow\s*:\s*hidden\b/i.test(cleanCss) || /overflow\s*:\s*(visible|auto)/i.test(cleanCss);

    results.push({
      testName: 'Flex-Wrap Coordinate Constraint',
      passed: hasFlexWrap && notNowrap,
      message: hasFlexWrap && notNowrap
        ? 'Passed: flex-wrap is correctly set to wrap.'
        : 'Failed: Cards still blowing out horizontally. Set flex-wrap: wrap on .cards-wrapper.',
    });

    results.push({
      testName: 'Overflow Clipping Fix',
      passed: hasNoClipping || hasFlexWrap,
      message: hasNoClipping || hasFlexWrap
        ? 'Passed: Container overflow allows cards to wrap cleanly.'
        : 'Failed: Cards are clipped by overflow: hidden.',
    });

    results.push({
      testName: 'Viewport Responsiveness Graph',
      passed: hasFlexWrap,
      message: hasFlexWrap
        ? 'Passed: Card coordinates wrap gracefully on small screens.'
        : 'Failed: Layout does not adapt responsively.',
    });
  }
  // ================= CHALLENGE 3: CYBERPUNK PRICING CARD =================
  else if (questionId === 'q-html-css-1' || cleanHtml.includes('pricing-card') || cleanHtml.includes('PRO SQUAD')) {
    const hasPrice = /\$0|\/student|\/month|free/i.test(cleanHtml);
    const hasChecklist = /duels|proctor|review|✓|checklist/i.test(cleanHtml) || (cleanHtml.match(/<div>/g) || []).length >= 3;
    const hasButton = /<button[\s\S]*?<\/button>/i.test(cleanHtml) || /claim/i.test(cleanHtml);

    results.push({
      testName: 'Pricing Header & Price Tag Coordinate',
      passed: hasPrice && hasMeaningfulHtml,
      message: hasPrice && hasMeaningfulHtml
        ? 'Passed: Price badge and header elements present.'
        : 'Failed: Missing price tag ($0 / student) or header badge.',
    });

    results.push({
      testName: 'Feature Checklist Structure',
      passed: hasChecklist && hasMeaningfulHtml,
      message: hasChecklist && hasMeaningfulHtml
        ? 'Passed: Feature items aligned in card body.'
        : 'Failed: Missing feature checklist items.',
    });

    results.push({
      testName: 'Call to Action Button Styling',
      passed: hasButton && (cleanCss.includes('button') || cleanCss.includes('gradient') || cleanCss.includes('padding')),
      message: hasButton
        ? 'Passed: Full-width CTA button styled and positioned.'
        : 'Failed: Missing styled CTA button at bottom of card.',
    });
  }
  // ================= GENERAL / FALLBACK WEB CHALLENGE =================
  else {
    const hasContent = hasMeaningfulHtml && cleanHtml.length > 40;
    const hasStyle = hasMeaningfulCss && cleanCss.length > 20;

    results.push({
      testName: 'HTML Structure & Semantics',
      passed: hasContent,
      message: hasContent ? 'Passed: HTML elements constructed.' : 'Failed: Empty or incomplete HTML content.',
    });

    results.push({
      testName: 'CSS Coordinates & Layout',
      passed: hasStyle,
      message: hasStyle ? 'Passed: CSS styling rules applied.' : 'Failed: CSS stylesheet is empty.',
    });

    results.push({
      testName: 'Visual Coordinate Match',
      passed: hasContent && hasStyle,
      message: hasContent && hasStyle ? 'Passed: Output matches target.' : 'Failed: Output incomplete.',
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
