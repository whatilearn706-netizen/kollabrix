export type ArenaCategory = 'web_dev' | 'algorithms' | 'bug_hunt' | 'backend_api';

export type WebDevTag = 'html' | 'css' | 'javascript';
export type AlgoTag = 'java' | 'python' | 'cpp' | 'arrays' | 'strings' | 'two_pointers' | 'dp';
export type BugHuntTag = 'react' | 'java_npe' | 'python_async';

export type ArenaTag = WebDevTag | AlgoTag | BugHuntTag;

export interface DuelQuestion {
  id: string;
  arena: ArenaCategory;
  title: string;
  description: string;
  tags: string[]; // e.g. ['html', 'css'] or ['python']
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitSeconds: number; // e.g. 300 (5 mins)
  bugDomain?: 'web' | 'logic'; // For Bug Hunt: web UI bug or code/logic bug
  codeWithBug?: string; // Buggy code snippet for bug hunt
  // For Web Dev:
  targetComponentHtml?: string;
  targetPreviewTitle?: string;
  starterHtml?: string;
  starterCss?: string;
  starterJs?: string;
  // For Algorithms / Real Compiler:
  starterJava?: string;
  starterPython?: string;
  starterCpp?: string;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
  constraints?: string[];
  testCases: {
    input: string;
    expectedOutput: string;
    description: string;
    isHidden?: boolean;
  }[];
  validationCriteria?: string[];
}

export interface DuelPlayer {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  college?: string;
  role: 'driver' | 'navigator'; // For 2v2 relay
  isReady: boolean;
  currentCode?: string;
  testsPassed: number;
  totalTests: number;
  lastAction?: string;
  hasErrors?: boolean;
  lastErrorMessage?: string;
}

export interface DuelTeam {
  teamName: string;
  player1: DuelPlayer;
  player2?: DuelPlayer;
  testsPassed: number;
  totalTests: number;
  activeKeyboardPlayerId: string;
}

export interface DuelRoom {
  code: string; // e.g. "KBX-8821"
  mode?: '1v1' | '2v2';
  arena: ArenaCategory;
  selectedTags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitSeconds: number;
  status: 'lobby' | 'transition' | 'battling' | 'finished';
  teamA: DuelTeam;
  teamB: DuelTeam;
  question: DuelQuestion;
  startedAt?: string;
  finishedAt?: string;
  winnerTeamName?: string;
}

// Built-in Default Questions for every tag combination!
export const DEFAULT_ARENA_QUESTIONS: DuelQuestion[] = [
  // 1. Web Dev: HTML + CSS 3-Card Responsive Grid (Image 4 Flagship Challenge)
  {
    id: 'q-html-css-cards-grid',
    arena: 'web_dev',
    title: 'The Responsive Modern Cards Grid',
    description: 'Replicate the 3-column responsive cards layout shown in the Preview: Card 1 with [Active] badge, Card 2 with light cyan-blue background (#b9dced) and [Featured] badge, and Card 3 with [New] badge. Each card has a 2px black border, clean typography, and a dark [Learn More] button.',
    tags: ['html', 'css'],
    difficulty: 'medium',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Responsive Cards Grid Blueprint',
    targetComponentHtml: `
      <div style="background:#ffffff;padding:24px;border-radius:12px;font-family:sans-serif;color:#111;width:100%;max-width:680px;box-sizing:border-box;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:16px;">
          <!-- Card 1 -->
          <div style="border:2px solid #222;background:#fff;padding:20px;display:flex;flex-direction:column;justify-content:space-between;min-height:220px;box-sizing:border-box;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                <h3 style="font-size:22px;font-weight:900;margin:0;line-height:1.1;">Card<br/>1</h3>
                <span style="background:#e2e8f0;color:#0f172a;font-size:12px;font-weight:bold;padding:4px 10px;border-radius:6px;">Active</span>
              </div>
              <p style="font-size:13px;color:#334155;line-height:1.5;margin:0 0 16px 0;">Learn the fundamentals of modern web development.</p>
            </div>
            <button style="background:#333;color:#fff;border:none;padding:8px 14px;font-size:12px;font-weight:bold;cursor:pointer;width:fit-content;">Learn More</button>
          </div>

          <!-- Card 2 (Featured - Pastel Cyan) -->
          <div style="border:2px solid #222;background:#b9dced;padding:20px;display:flex;flex-direction:column;justify-content:space-between;min-height:220px;box-sizing:border-box;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                <h3 style="font-size:22px;font-weight:900;margin:0;line-height:1.1;">Card<br/>2</h3>
                <span style="background:#e2e8f0;color:#0f172a;font-size:12px;font-weight:bold;padding:4px 10px;border-radius:6px;">Featured</span>
              </div>
              <p style="font-size:13px;color:#1e293b;line-height:1.5;margin:0 0 16px 0;">Build responsive and accessible websites using HTML and CSS.</p>
            </div>
            <button style="background:#333;color:#fff;border:none;padding:8px 14px;font-size:12px;font-weight:bold;cursor:pointer;width:fit-content;">Learn More</button>
          </div>

          <!-- Card 3 -->
          <div style="border:2px solid #222;background:#fff;padding:20px;display:flex;flex-direction:column;justify-content:space-between;min-height:220px;box-sizing:border-box;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                <h3 style="font-size:22px;font-weight:900;margin:0;line-height:1.1;">Card<br/>3</h3>
                <span style="background:#e2e8f0;color:#0f172a;font-size:12px;font-weight:bold;padding:4px 10px;border-radius:6px;">New</span>
              </div>
              <p style="font-size:13px;color:#334155;line-height:1.5;margin:0 0 16px 0;">Practice layouts, styling, and responsive design techniques.</p>
            </div>
            <button style="background:#333;color:#fff;border:none;padding:8px 14px;font-size:12px;font-weight:bold;cursor:pointer;width:fit-content;">Learn More</button>
          </div>
        </div>
      </div>
    `,
    starterHtml: `<div class="cards-grid">
  <!-- Replicate the 3 cards matching the Preview blueprint above -->
  <!-- Card 1: [Active], Card 2: [Featured] (#b9dced), Card 3: [New] -->

</div>`,
    starterCss: `/* Write your CSS styles here to replicate the Preview */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  background: #ffffff;
  padding: 16px;
  box-sizing: border-box;
}

.card {
  /* Build card borders, padding, badges, and layout */
  border: 2px solid #222;
  box-sizing: border-box;
}`,
    starterJs: ``,
    validationCriteria: [
      '3 cards rendered with titles and badges',
      'Card 2 has distinct pastel cyan background (#b9dced)',
      'Buttons and text match layout',
    ],
    testCases: [
      { input: 'has3Cards', expectedOutput: 'true', description: '3 Card items present in container' },
      { input: 'hasFeaturedColor', expectedOutput: 'true', description: 'Card 2 featured background matches' },
      { input: 'hasBadges', expectedOutput: 'true', description: 'Active, Featured, New badges styled' },
    ],
  },
  // 1. Web Dev: HTML ONLY
  {
    id: 'q-html-only-1',
    arena: 'web_dev',
    title: 'The Semantic Accessible Article Card',
    description: 'Construct the semantic HTML structure for an accessible tech article card. Must include an article container, header with badge, h2 title, time tag, paragraph excerpt, and a functional link button.',
    tags: ['html'],
    difficulty: 'easy',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Accessible Article Blueprint',
    targetComponentHtml: `
      <article style="background:#1e293b;padding:24px;border-radius:16px;color:#f8fafc;font-family:sans-serif;max-width:340px;border:1px solid #334155;">
        <span style="background:rgba(244,63,94,0.2);color:#fb7185;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:bold;text-transform:uppercase;">Campus News</span>
        <h2 style="font-size:18px;font-weight:800;margin:12px 0 6px 0;line-height:1.3;">Kollabrix 2v2 Hackathon Launches Tonight</h2>
        <time style="font-size:12px;color:#94a3b8;display:block;margin-bottom:12px;">October 29, 2026</time>
        <p style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:16px;">Collegiate developers across 40 universities assemble squads for the live split-screen coding clash.</p>
        <a href="#join" style="display:inline-block;background:#e11d48;color:#fff;padding:8px 16px;border-radius:10px;font-size:12px;font-weight:bold;text-decoration:none;">Enter Arena &rarr;</a>
      </article>
    `,
    starterHtml: `<!-- Build semantic HTML article card below -->\n<article>\n  \n</article>`,
    starterCss: `/* Optional inline styles */\narticle { font-family: sans-serif; }`,
    starterJs: ``,
    validationCriteria: [
      'Contains <article> root container',
      'Contains <h2> heading tag',
      'Contains semantic <time> timestamp',
      'Contains action link or button',
    ],
    testCases: [
      { input: 'hasArticle', expectedOutput: 'true', description: 'Semantic <article> element present' },
      { input: 'hasHeading', expectedOutput: 'true', description: 'Headline <h2> with text present' },
      { input: 'hasTime', expectedOutput: 'true', description: 'Valid <time> tag present' },
    ],
  },

  // 2. Web Dev: CSS ONLY
  {
    id: 'q-css-only-1',
    arena: 'web_dev',
    title: 'The Glassmorphic Glow Card',
    description: 'Style the provided plain HTML box into an ultra-modern dark glass card with a glowing radial gradient border and smooth hover scale effect.',
    tags: ['css'],
    difficulty: 'easy',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Neon Glassmorphic Card',
    targetComponentHtml: `
      <div style="background:radial-gradient(circle at 50% 0%, rgba(244,63,94,0.25), rgba(15,23,42,0.95));padding:28px;border-radius:20px;border:1px solid rgba(244,63,94,0.4);box-shadow:0 10px 25px -5px rgba(244,63,94,0.3);color:white;font-family:sans-serif;text-align:center;max-width:320px;">
        <div style="width:48px;height:48px;background:#e11d48;border-radius:12px;margin:0 auto 12px auto;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;">⚡</div>
        <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:800;">Turbo Mode</h3>
        <p style="font-size:12px;color:#cbd5e1;margin:0 0 16px 0;">Ultra-low latency compiler sandbox enabled.</p>
        <button style="background:linear-gradient(90deg,#f43f5e,#fb7185);border:none;color:white;padding:10px 20px;border-radius:12px;font-weight:bold;cursor:pointer;width:100%;">Activate</button>
      </div>
    `,
    starterHtml: `<div class="glass-card">\n  <div class="icon">⚡</div>\n  <h3>Turbo Mode</h3>\n  <p>Ultra-low latency compiler sandbox enabled.</p>\n  <button>Activate</button>\n</div>`,
    starterCss: `/* Add your CSS styles below */\n.glass-card {\n  /* Your styles here */\n}`,
    starterJs: ``,
    validationCriteria: [
      'Uses flex or grid for alignment',
      'Border-radius between 16px and 24px',
      'Custom dark background with border',
    ],
    testCases: [
      { input: 'hasBorderRadius', expectedOutput: 'true', description: 'Smooth rounded border applied' },
      { input: 'hasCenterAlign', expectedOutput: 'true', description: 'Content centered properly' },
    ],
  },

  // 3. Web Dev: JAVASCRIPT ONLY
  {
    id: 'q-js-only-1',
    arena: 'web_dev',
    title: 'The Live Instant Debounce Search Filter',
    description: 'Implement the JavaScript logic so that when the user types into the input box #search-input, only list items inside #student-list whose text contains the query remain visible. Non-matching items must have display="none".',
    tags: ['javascript'],
    difficulty: 'easy',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Live Filtering Search List',
    targetComponentHtml: `
      <div style="background:#0f172a;padding:20px;border-radius:16px;color:#f8fafc;font-family:sans-serif;max-width:320px;border:1px solid #1e293b;">
        <input type="text" placeholder="Filter teammates..." value="Viraj" style="width:100%;padding:8px 12px;border-radius:8px;background:#1e293b;border:1px solid #334155;color:white;font-size:12px;box-sizing:border-box;margin-bottom:12px;" />
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;">
          <li style="padding:6px 8px;background:#1e293b;border-radius:6px;color:#38bdf8;font-weight:bold;">Viraj Bashishtha</li>
        </ul>
      </div>
    `,
    starterHtml: `<div class="filter-box">\n  <input id="search-input" type="text" placeholder="Search teammate..." />\n  <ul id="student-list">\n    <li>Mayank Goyal</li>\n    <li>Viraj Bashishtha</li>\n    <li>Ayushman Sharma</li>\n    <li>Kabir Sen</li>\n  </ul>\n</div>`,
    starterCss: `body { font-family: sans-serif; background: #0f172a; color: white; }\ninput { width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 6px; }`,
    starterJs: `// Write filter logic below\nconst searchInput = document.getElementById('search-input');\nconst items = document.querySelectorAll('#student-list li');\n\nsearchInput.addEventListener('input', (e) => {\n  const q = e.target.value.toLowerCase();\n  // Filter items here\n});`,
    validationCriteria: [
      'Input event listener attached to #search-input',
      'Filters list items in real-time',
      'Case-insensitive search matching',
    ],
    testCases: [
      { input: 'search("viraj")', expectedOutput: '1 visible', description: 'Matches Viraj only' },
      { input: 'search("")', expectedOutput: '4 visible', description: 'Empty query shows all 4' },
      { input: 'search("xyz")', expectedOutput: '0 visible', description: 'No matches hides all' },
    ],
  },

  // 4. Web Dev: HTML + CSS (The Classic Duo)
  {
    id: 'q-html-css-1',
    arena: 'web_dev',
    title: 'The Hacker Tier Pricing Card',
    description: 'Replicate the target component: A dark cyberpunk subscription card featuring a glowing title, price tag with /month subtext, feature checklist with icons, and a full-width gradient call-to-action button.',
    tags: ['html', 'css'],
    difficulty: 'medium',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Cyberpunk Tier Card',
    targetComponentHtml: `
      <div style="background:#090b10;border:1px solid #f43f5e;border-radius:22px;padding:26px;color:white;font-family:sans-serif;max-width:320px;box-shadow:0 0 30px rgba(244,63,94,0.25);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-size:12px;font-weight:bold;color:#f43f5e;letter-spacing:1px;text-transform:uppercase;">PRO SQUAD</span>
          <span style="background:rgba(244,63,94,0.15);color:#f43f5e;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:bold;">POPULAR</span>
        </div>
        <div style="font-size:32px;font-weight:900;margin-bottom:14px;">$0 <span style="font-size:14px;color:#94a3b8;font-weight:normal;">/ student</span></div>
        <div style="border-top:1px solid #1e293b;padding-top:12px;margin-bottom:20px;font-size:12px;color:#cbd5e1;line-height:2;">
          <div>✓ Unlimited 2v2 Duels</div>
          <div>✓ Full-Screen Proctor Guard</div>
          <div>✓ Instant Code Review</div>
        </div>
        <button style="width:100%;background:linear-gradient(90deg,#f43f5e,#fb7185);border:none;color:white;padding:12px;border-radius:12px;font-weight:bold;font-size:13px;cursor:pointer;">Claim Student Pass &rarr;</button>
      </div>
    `,
    starterHtml: `<div class="pricing-card">\n  <!-- Teammate 1: Write HTML here -->\n  \n</div>`,
    starterCss: `/* Teammate 2: Write CSS styles here */\n.pricing-card {\n  \n}`,
    starterJs: ``,
    validationCriteria: [
      'Card has border and rounded corners',
      'Header flex layout with badge',
      'Price text with subtext',
      'Styled CTA button',
    ],
    testCases: [
      { input: 'hasPriceElement', expectedOutput: 'true', description: 'Price and /student present' },
      { input: 'hasChecklist', expectedOutput: 'true', description: 'Feature points displayed' },
      { input: 'hasCtaButton', expectedOutput: 'true', description: 'Full-width action button styled' },
    ],
  },

  // 5. Web Dev: HTML + CSS + JAVASCRIPT (The Full Trifecta)
  {
    id: 'q-html-css-js-1',
    arena: 'web_dev',
    title: 'The 5-Star Interactive Rating Widget',
    description: 'Construct the HTML stars, style them with glowing gold hover effects, and write JavaScript so clicking star N highlights stars 1..N and displays "Rated N of 5".',
    tags: ['html', 'css', 'javascript'],
    difficulty: 'hard',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Interactive Rating Component',
    targetComponentHtml: `
      <div style="background:#0f172a;padding:24px;border-radius:18px;border:1px solid #334155;color:white;font-family:sans-serif;text-align:center;max-width:300px;">
        <h4 style="margin:0 0 10px 0;font-size:15px;font-weight:800;">Rate Teammate Clutch</h4>
        <div style="font-size:26px;color:#fbbf24;cursor:pointer;letter-spacing:6px;margin-bottom:10px;">★ ★ ★ ★ ☆</div>
        <div style="font-size:12px;color:#38bdf8;font-weight:bold;font-family:monospace;">Rated 4 of 5 Stars</div>
      </div>
    `,
    starterHtml: `<div class="rating-widget">\n  <h4>Rate Teammate Clutch</h4>\n  <div id="stars-container">\n    <span data-val="1">★</span>\n    <span data-val="2">★</span>\n    <span data-val="3">★</span>\n    <span data-val="4">★</span>\n    <span data-val="5">★</span>\n  </div>\n  <div id="rating-feedback">Click a star to rate</div>\n</div>`,
    starterCss: `#stars-container span {\n  font-size: 26px;\n  cursor: pointer;\n  color: #475569;\n  transition: color 0.15s;\n}\n.rating-widget { background: #0f172a; padding: 20px; border-radius: 16px; text-align: center; color: white; font-family: sans-serif; }`,
    starterJs: `const stars = document.querySelectorAll('#stars-container span');\nconst feedback = document.getElementById('rating-feedback');\n\nstars.forEach(star => {\n  star.addEventListener('click', () => {\n    const val = Number(star.getAttribute('data-val'));\n    // Highlight stars and update feedback text\n  });\n});`,
    validationCriteria: [
      'HTML star elements present with data-val attributes',
      'CSS highlights active stars with golden color',
      'JavaScript click listener updates rating feedback',
    ],
    testCases: [
      { input: 'clickStar(3)', expectedOutput: 'Rated 3 of 5', description: 'Highlights 3 stars on click' },
      { input: 'clickStar(5)', expectedOutput: 'Rated 5 of 5', description: 'Highlights 5 stars on click' },
    ],
  },

  // 6. Algorithms: Java & Python Speedrun
  {
    id: 'q-algo-dsa-1',
    arena: 'algorithms',
    title: 'Sort Array by Parity (Evens First)',
    description: 'Given an integer array nums, move all the even integers at the beginning of the array followed by all the odd integers in O(N) time and O(1) extra space.',
    tags: ['java', 'python', 'cpp', 'arrays', 'two_pointers'],
    difficulty: 'easy',
    timeLimitSeconds: 300,
    sampleInput: 'nums = [3, 1, 2, 4]',
    sampleOutput: '[2, 4, 3, 1]',
    explanation: 'The numbers 2 and 4 are even, and 3 and 1 are odd. Any permutation with evens first is accepted.',
    constraints: [
      '1 <= nums.length <= 5000',
      '0 <= nums[i] <= 5000',
      'Time: O(N) linear scan',
      'Space: O(1) in-place modification',
    ],
    starterJava: `class Solution {\n    public int[] sortArrayByParity(int[] nums) {\n        // Your two-pointer in-place solution\n        return nums;\n    }\n}`,
    starterPython: `class Solution:\n    def sortArrayByParity(self, nums: list[int]) -> list[int]:\n        # Your two-pointer in-place solution\n        return nums`,
    starterCpp: `class Solution {\npublic:\n    vector<int> sortArrayByParity(vector<int>& nums) {\n        // Your solution\n        return nums;\n    }\n};`,
    testCases: [
      { input: '[3, 1, 2, 4]', expectedOutput: '[2, 4, 3, 1]', description: 'Basic parity split' },
      { input: '[0]', expectedOutput: '[0]', description: 'Single element zero' },
      { input: '[1, 3, 5, 7]', expectedOutput: '[1, 3, 5, 7]', description: 'All odd elements' },
      { input: '[2, 4, 6, 8]', expectedOutput: '[2, 4, 6, 8]', description: 'All even elements' },
      { input: '[1000, 3, 2, 9, 8, 7]', expectedOutput: '[1000, 2, 8, 3, 9, 7]', description: 'Mixed elements', isHidden: true },
    ],
  },

  // 7. Algorithms: Two Sum
  {
    id: 'q-algo-two-sum',
    arena: 'algorithms',
    title: 'Two Sum Target Index Pair',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution and you may not use the same element twice.',
    tags: ['java', 'python', 'cpp', 'arrays', 'hashmap'],
    difficulty: 'easy',
    timeLimitSeconds: 300,
    sampleInput: 'nums = [2, 7, 11, 15], target = 9',
    sampleOutput: '[0, 1]',
    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      'Only one valid answer exists',
      'Optimal Time: O(N) with Hash Map',
    ],
    starterJava: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Return indices of the two numbers that sum to target\n        return new int[]{};\n    }\n}`,
    starterPython: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Return indices of the two numbers that sum to target\n        return []`,
    starterCpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Return indices of the two numbers that sum to target\n        return {};\n    }\n};`,
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]', description: 'Basic consecutive pair' },
      { input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]', description: 'Non-consecutive indices' },
      { input: 'nums = [3, 3], target = 6', expectedOutput: '[0, 1]', description: 'Duplicate numbers pair' },
      { input: 'nums = [1, 5, 8, 12, 19], target = 20', expectedOutput: '[0, 4]', description: 'First and last index pair', isHidden: true },
    ],
  },

  // 8. Bug Hunt (Web UI): Broken Flexbox Responsive Grid
  {
    id: 'q-bughunt-web-flex',
    arena: 'bug_hunt',
    bugDomain: 'web',
    title: 'Web Bug: Broken Responsive Grid Blowout',
    description: 'The cards container is blowing out horizontally on smaller viewports because flex-wrap is disabled and overflow is hidden. Competitor must fix the CSS so cards wrap neatly into a responsive grid without horizontal cutoff.',
    tags: ['bug_web', 'css', 'html'],
    difficulty: 'medium',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Expected Responsive Wrapping Layout',
    targetComponentHtml: `
      <div style="background:#ffffff;padding:20px;border-radius:12px;font-family:sans-serif;max-width:540px;box-sizing:border-box;">
        <h4 style="margin:0 0 12px 0;color:#0f172a;font-size:16px;font-weight:800;">Target: Responsive Wrapped Cards</h4>
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          <div style="flex:1 1 140px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:14px;color:#0f172a;font-weight:bold;text-align:center;">Card Alpha</div>
          <div style="flex:1 1 140px;background:#e0f2fe;border:1px solid #7dd3fc;border-radius:8px;padding:14px;color:#0369a1;font-weight:bold;text-align:center;">Card Beta</div>
          <div style="flex:1 1 140px;background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:14px;color:#b45309;font-weight:bold;text-align:center;">Card Gamma</div>
        </div>
      </div>
    `,
    starterHtml: `<div class="container">\n  <h3>Collegiate Hackathon Squads</h3>\n  <div class="cards-wrapper">\n    <div class="card">Card Alpha</div>\n    <div class="card">Card Beta</div>\n    <div class="card">Card Gamma</div>\n  </div>\n</div>`,
    starterCss: `/* BUGGY CSS: Diagnose and fix the wrapping & overflow bugs below */\n.cards-wrapper {\n  display: flex;\n  flex-wrap: nowrap; /* BUG: Prevents wrapping on smaller viewports! */\n  overflow: hidden;\n  gap: 12px;\n}\n.card {\n  min-width: 160px;\n  padding: 16px;\n  background: #f1f5f9;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n  font-family: sans-serif;\n  color: #0f172a;\n  font-weight: bold;\n  text-align: center;\n}`,
    starterJs: ``,
    validationCriteria: [
      'flex-wrap is set to wrap',
      'cards wrap gracefully without horizontal scrollbar',
    ],
    testCases: [
      { input: 'hasFlexWrap', expectedOutput: 'wrap', description: 'Container wraps cards responsively' },
      { input: 'noOverflowClipping', expectedOutput: 'true', description: 'Cards not clipped horizontally' },
    ],
  },

  // 9. Bug Hunt (Logic): Binary Search Infinite Loop
  {
    id: 'q-bughunt-logic-binary',
    arena: 'bug_hunt',
    bugDomain: 'logic',
    title: 'Logic Bug: Binary Search Infinite Loop on Boundary',
    description: 'The binary search algorithm hangs indefinitely on boundary cases because the left pointer is assigned `l = mid` instead of `l = mid + 1`. Fix the pointer calculation so it finishes in O(log N) time and returns the correct target index or -1.',
    tags: ['bug_logic', 'python', 'java', 'cpp'],
    difficulty: 'medium',
    timeLimitSeconds: 300,
    sampleInput: 'arr = [1, 3, 5, 7, 9], target = 5',
    sampleOutput: '2',
    explanation: '5 is at index 2. Target 4 would return -1.',
    constraints: [
      '1 <= arr.length <= 10^5',
      'arr is sorted in ascending order',
      'Must run in O(log N) time without infinite loop',
    ],
    starterPython: `def binary_search(arr: list[int], target: int) -> int:\n    l = 0\n    r = len(arr) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            l = mid # BUG: Causes infinite loop when l == mid!\n        else:\n            r = mid - 1\n    return -1`,
    starterJava: `class Solution {\n    public int binarySearch(int[] arr, int target) {\n        int l = 0, r = arr.length - 1;\n        while (l <= r) {\n            int mid = (l + r) / 2;\n            if (arr[mid] == target) return mid;\n            else if (arr[mid] < target) {\n                l = mid; // BUG!\n            } else {\n                r = mid - 1;\n            }\n        }\n        return -1;\n    }\n}`,
    starterCpp: `class Solution {\npublic:\n    int binarySearch(vector<int>& arr, int target) {\n        int l = 0, r = arr.size() - 1;\n        while (l <= r) {\n            int mid = (l + r) / 2;\n            if (arr[mid] == target) return mid;\n            else if (arr[mid] < target) {\n                l = mid; // BUG!\n            } else {\n                r = mid - 1;\n            }\n        }\n        return -1;\n    }\n};`,
    testCases: [
      { input: 'arr = [1, 3, 5, 7, 9], target = 5', expectedOutput: '2', description: 'Target present at center' },
      { input: 'arr = [1, 3, 5, 7, 9], target = 9', expectedOutput: '4', description: 'Target at right boundary' },
      { input: 'arr = [1, 3, 5, 7, 9], target = 1', expectedOutput: '0', description: 'Target at left boundary' },
      { input: 'arr = [1, 3, 5, 7, 9], target = 6', expectedOutput: '-1', description: 'Target missing returns -1' },
    ],
  },
];
