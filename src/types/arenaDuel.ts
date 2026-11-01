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
  targetComponentCss?: string;
  targetComponentJs?: string;
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
  // 0. Web Dev (HTML + CSS + JS Easy): Digital Counter App (Flagship Interactive Challenge)
  {
    id: 'q-web-digital-counter',
    arena: 'web_dev',
    title: 'Digital Counter App',
    description: 'Your application must include: - A heading titled "Digital Counter". - A number display starting at 0. - An Increase button. - A Decrease button. - A Reset button. Expected behaviour: - Increase adds 1 to the displayed number. - Decrease subtracts 1 from the displayed number (do not allow negative values). - Reset resets the displayed number back to 0.',
    tags: ['html', 'css', 'javascript'],
    difficulty: 'easy',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Digital Counter App Blueprint',
    targetComponentHtml: `
      <div style="background:#ffffff;padding:20px;border-radius:16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;color:#0f172a;width:100%;max-width:320px;margin:4px auto;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid #e2e8f0;text-align:center;box-sizing:border-box;">
        <h2 style="margin:0 0 6px 0;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Digital Counter</h2>
        <div id="counter-val" style="font-size:52px;font-weight:900;color:#2563eb;margin:10px 0 16px 0;line-height:1;">0</div>
        <div style="display:flex;gap:8px;justify-content:center;align-items:center;">
          <button id="btn-increase" style="background:#2563eb;color:#ffffff;font-weight:700;font-size:12px;padding:8px 14px;border:none;border-radius:8px;cursor:pointer;box-shadow:0 3px 10px rgba(37,99,235,0.25);">Increase</button>
          <button id="btn-decrease" style="background:#3b82f6;color:#ffffff;font-weight:700;font-size:12px;padding:8px 14px;border:none;border-radius:8px;cursor:pointer;box-shadow:0 3px 10px rgba(59,130,246,0.2);">Decrease</button>
          <button id="btn-reset" style="background:#ef4444;color:#ffffff;font-weight:700;font-size:12px;padding:8px 14px;border:none;border-radius:8px;cursor:pointer;box-shadow:0 3px 10px rgba(239,68,68,0.2);">Reset</button>
        </div>
      </div>
    `,
    targetComponentCss: `
      body {
        margin: 0;
        padding: 8px;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        box-sizing: border-box;
        overflow-y: auto;
      }
    `,
    targetComponentJs: `
      (function() {
        function setupCounter() {
          var count = 0;
          var display = document.getElementById('counter-val');
          var inc = document.getElementById('btn-increase');
          var dec = document.getElementById('btn-decrease');
          var rst = document.getElementById('btn-reset');
          if (inc && display) {
            inc.onclick = function() {
              count += 1;
              display.textContent = String(count);
            };
          }
          if (dec && display) {
            dec.onclick = function() {
              if (count > 0) count -= 1;
              display.textContent = String(count);
            };
          }
          if (rst && display) {
            rst.onclick = function() {
              count = 0;
              display.textContent = '0';
            };
          }
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupCounter);
        } else {
          setupCounter();
        }
      })();
    `,
    starterHtml: `<div class="counter-card">\n  <h2>Digital Counter</h2>\n  <div id="counter" class="count-number">0</div>\n  <div class="actions">\n    <button id="increase">Increase</button>\n    <button id="decrease">Decrease</button>\n    <button id="reset">Reset</button>\n  </div>\n</div>`,
    starterCss: `.counter-card {\n  background: #ffffff;\n  padding: 20px;\n  border-radius: 16px;\n  text-align: center;\n  max-width: 320px;\n  margin: 4px auto;\n  border: 1px solid #e2e8f0;\n  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);\n}\n\n.count-number {\n  font-size: 52px;\n  font-weight: 900;\n  color: #2563eb;\n  margin: 10px 0 16px 0;\n}\n\n.actions {\n  display: flex;\n  gap: 8px;\n  justify-content: center;\n}\n\nbutton {\n  background: #2563eb;\n  color: #ffffff;\n  font-weight: 700;\n  font-size: 12px;\n  padding: 8px 14px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n}\n\n#decrease {\n  background: #3b82f6;\n}\n\n#reset {\n  background: #ef4444;\n}`,
    starterJs: `// Write your counter functionality here\n\n// Maintain the counter value.\n// Increase, decrease and reset it.\n// Update the displayed number after every action.\n// Do not allow negative values.\n\nlet count = 0;\nconst display = document.getElementById('counter');\nconst increaseBtn = document.getElementById('increase');\nconst decreaseBtn = document.getElementById('decrease');\nconst resetBtn = document.getElementById('reset');\n\nif (increaseBtn) {\n  increaseBtn.addEventListener('click', () => {\n    count++;\n    if (display) display.textContent = count;\n  });\n}\n\nif (decreaseBtn) {\n  decreaseBtn.addEventListener('click', () => {\n    if (count > 0) count--;\n    if (display) display.textContent = count;\n  });\n}\n\nif (resetBtn) {\n  resetBtn.addEventListener('click', () => {\n    count = 0;\n    if (display) display.textContent = 0;\n  });\n}`,
    testCases: [
      { input: 'hasCounterTitle', expectedOutput: 'pass', description: 'Heading contains text "Digital Counter"' },
      { input: 'initialDisplay', expectedOutput: 'pass', description: 'Counter display starts at number 0' },
      { input: 'increaseWorks', expectedOutput: 'pass', description: 'Increase button increments counter' },
    ],
  },
  // 0b. Web Dev (HTML + CSS + JS Hard): Interactive Typing Speed Tester (Flagship Typing Challenge)
  {
    id: 'q-web-typing-speed',
    arena: 'web_dev',
    title: 'Interactive Typing Speed Tester',
    description: 'Build a typing speed test application that measures how quickly and accurately a user can type a displayed paragraph. Users should be able to: - Display a paragraph for typing. - Start the timer when typing begins. - Calculate typing speed in WPM (words per minute) and accuracy in real time. - Restart the test with a button.',
    tags: ['html', 'css', 'javascript'],
    difficulty: 'hard',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Interactive Typing Speed Tester Blueprint',
    targetComponentHtml: `
      <div style="background:#1e293b;padding:16px 18px;border-radius:14px;font-family:system-ui,-apple-system,sans-serif;color:#ffffff;max-width:380px;margin:2px auto;box-shadow:0 8px 30px rgba(0,0,0,0.3);text-align:center;box-sizing:border-box;">
        <h2 style="margin:0 0 8px 0;font-size:18px;font-weight:800;letter-spacing:-0.5px;">Typing Speed Test</h2>
        <div id="target-quote" style="background:#334155;color:#e2e8f0;padding:10px 12px;border-radius:8px;font-size:13px;line-height:1.4;margin-bottom:10px;text-align:left;min-height:36px;">Learning new skills requires patience practice and consistency.</div>
        <textarea id="target-input" placeholder="Start typing here..." style="width:100%;height:52px;background:#ffffff;color:#0f172a;padding:8px 10px;border-radius:8px;border:none;font-size:13px;box-sizing:border-box;margin-bottom:10px;resize:none;font-family:inherit;"></textarea>
        <div style="display:flex;justify-content:space-around;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:10px;">
          <span>Time: <strong id="target-time" style="color:#ffffff;">60s</strong></span>
          <span>WPM: <strong id="target-wpm" style="color:#38bdf8;">0</strong></span>
          <span>Accuracy: <strong id="target-acc" style="color:#4ade80;">100%</strong></span>
        </div>
        <button id="target-restart" style="background:#ffffff;color:#0f172a;font-weight:800;font-size:12px;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;width:100%;box-shadow:0 3px 10px rgba(255,255,255,0.15);">Restart Test</button>
      </div>
    `,
    targetComponentCss: `
      body {
        margin: 0;
        padding: 8px;
        background: #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        box-sizing: border-box;
        overflow-y: auto;
      }
    `,
    targetComponentJs: `
      (function() {
        function setupTyping() {
          var quoteEl = document.getElementById('target-quote');
          var inputEl = document.getElementById('target-input');
          var timeEl = document.getElementById('target-time');
          var wpmEl = document.getElementById('target-wpm');
          var accEl = document.getElementById('target-acc');
          var restartBtn = document.getElementById('target-restart');
          if (!inputEl) return;

          var startTime = null;
          var timerInterval = null;
          var duration = 60;

          function resetTest() {
            clearInterval(timerInterval);
            timerInterval = null;
            startTime = null;
            inputEl.value = '';
            inputEl.disabled = false;
            if (timeEl) timeEl.textContent = '60s';
            if (wpmEl) wpmEl.textContent = '0';
            if (accEl) accEl.textContent = '100%';
          }

          if (restartBtn) restartBtn.onclick = resetTest;

          inputEl.oninput = function() {
            if (!startTime) {
              startTime = Date.now();
              timerInterval = setInterval(function() {
                var elapsed = Math.floor((Date.now() - startTime) / 1000);
                var rem = Math.max(0, duration - elapsed);
                if (timeEl) timeEl.textContent = rem + 's';
                if (rem <= 0) {
                  clearInterval(timerInterval);
                  inputEl.disabled = true;
                }
              }, 1000);
            }
            var quote = quoteEl ? quoteEl.textContent || '' : '';
            var val = inputEl.value;
            var words = val.trim().split(/\\s+/).filter(Boolean).length;
            var elapsedMin = (Date.now() - startTime) / 60000;
            var wpm = elapsedMin > 0 ? Math.round(words / elapsedMin) : 0;
            if (wpmEl) wpmEl.textContent = String(wpm);

            var correctChars = 0;
            for (var i = 0; i < val.length; i++) {
              if (i < quote.length && val[i] === quote[i]) correctChars++;
            }
            var acc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
            if (accEl) accEl.textContent = acc + '%';
          };
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupTyping);
        } else {
          setupTyping();
        }
      })();
    `,
    starterHtml: `<div class="test-container">\n  <h2>Typing Speed Test</h2>\n  <div id="quote-display" class="quote-box">Learning new skills requires patience practice and consistency.</div>\n  <textarea id="quote-input" placeholder="Start typing here..."></textarea>\n  <div class="stats">\n    <span>Time: <strong id="time">60s</strong></span>\n    <span>WPM: <strong id="wpm">0</strong></span>\n    <span>Accuracy: <strong id="accuracy">100%</strong></span>\n  </div>\n  <button id="restart-btn">Restart Test</button>\n</div>`,
    starterCss: `.test-container {\n  background: #1e293b;\n  padding: 16px 18px;\n  border-radius: 14px;\n  max-width: 380px;\n  width: 100%;\n  text-align: center;\n  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);\n  box-sizing: border-box;\n}\n\n.quote-box {\n  background: #334155;\n  color: #e2e8f0;\n  padding: 10px 12px;\n  border-radius: 8px;\n  font-size: 13px;\n  line-height: 1.4;\n  margin-bottom: 10px;\n  text-align: left;\n}\n\ntextarea {\n  width: 100%;\n  height: 52px;\n  background: #ffffff;\n  color: #0f172a;\n  padding: 8px 10px;\n  border-radius: 8px;\n  border: none;\n  font-size: 13px;\n  box-sizing: border-box;\n  margin-bottom: 10px;\n  resize: none;\n}\n\n.stats {\n  display: flex;\n  justify-content: space-around;\n  font-size: 12px;\n  font-weight: 700;\n  color: #94a3b8;\n  margin-bottom: 10px;\n}\n\nbutton {\n  background: #ffffff;\n  color: #0f172a;\n  font-weight: 800;\n  font-size: 12px;\n  padding: 8px 16px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  width: 100%;\n}`,
    starterJs: `// Write your typing speed test logic here\n// 1. Listen for input event on the textarea\n// 2. Start the timer when the user begins typing\n// 3. Compute WPM = (words / minutes)\n// 4. Reset stats and input when Restart Test button is clicked\n\nconst quoteDisplay = document.getElementById('quote-display');\nconst quoteInput = document.getElementById('quote-input');\nconst timeDisplay = document.getElementById('time');\nconst wpmDisplay = document.getElementById('wpm');\nconst restartBtn = document.getElementById('restart-btn');\n\nlet timer = null;\nlet timeLeft = 60;\nlet isStarted = false;\n\nif (quoteInput) {\n  quoteInput.addEventListener('input', () => {\n    if (!isStarted) {\n      isStarted = true;\n      timer = setInterval(() => {\n        if (timeLeft > 0) {\n          timeLeft--;\n          if (timeDisplay) timeDisplay.textContent = timeLeft + 's';\n        } else {\n          clearInterval(timer);\n        }\n      }, 1000);\n    }\n    const words = quoteInput.value.trim().split(/\\s+/).filter(Boolean).length;\n    const elapsed = 60 - timeLeft;\n    const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;\n    if (wpmDisplay) wpmDisplay.textContent = wpm;\n  });\n}\n\nif (restartBtn) {\n  restartBtn.addEventListener('click', () => {\n    if (timer) clearInterval(timer);\n    timeLeft = 60;\n    isStarted = false;\n    if (quoteInput) quoteInput.value = '';\n    if (timeDisplay) timeDisplay.textContent = '60s';\n    if (wpmDisplay) wpmDisplay.textContent = '0';\n  });\n}`,
    testCases: [
      { input: 'hasTypingHeading', expectedOutput: 'pass', description: 'Heading displays "Typing Speed Test"' },
      { input: 'hasQuoteAndTextarea', expectedOutput: 'pass', description: 'Quote display box and typing textarea present' },
      { input: 'hasStatsAndRestart', expectedOutput: 'pass', description: 'Time, WPM stats and Restart button present' },
    ],
  },
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
    starterJava: `// LeetCode-style: Implement the method below.\n// The judge passes each test case automatically!\nclass Solution {\n    public int[] sortArrayByParity(int[] nums) {\n        // Your two-pointer or parity sorting logic:\n        return nums;\n    }\n}`,
    starterPython: `# LeetCode-style: Implement the method below.\n# The judge passes each test case automatically!\nclass Solution:\n    def sortArrayByParity(self, nums: list[int]) -> list[int]:\n        # Your two-pointer or parity sorting logic:\n        return nums`,
    starterCpp: `// LeetCode-style: Implement the method below.\nclass Solution {\npublic:\n    vector<int> sortArrayByParity(vector<int>& nums) {\n        return nums;\n    }\n};`,
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

  // 10. Web Dev (HTML + CSS Easy): Profile Identity Badge
  {
    id: 'q-html-css-profile-badge',
    arena: 'web_dev',
    title: 'The Minimalist Developer Profile Card',
    description: 'Build an elegant modern developer card with avatar placeholder, name heading, status badge "Available for Work", and a contact button.',
    tags: ['html', 'css'],
    difficulty: 'easy',
    timeLimitSeconds: 300,
    targetPreviewTitle: 'Developer Profile Badge',
    targetComponentHtml: `
      <div style="background:#0f172a;padding:24px;border-radius:16px;font-family:sans-serif;color:#f8fafc;width:100%;max-width:380px;border:1px solid #334155;box-sizing:border-box;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
          <div style="width:48px;height:48px;border-radius:50%;background:#38bdf8;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0f172a;font-size:20px;">AV</div>
          <div>
            <h3 style="margin:0;font-size:18px;font-weight:700;">Alex Vance</h3>
            <span style="font-size:12px;color:#94a3b8;">Frontend Architect</span>
          </div>
        </div>
        <p style="margin:0 0 16px 0;font-size:13px;color:#cbd5e1;line-height:1.5;">Building high-frequency collaborative engines and modern browser runtimes.</p>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3);">
            <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;"></span>Available for Work
          </span>
          <button style="background:#38bdf8;color:#0f172a;font-weight:700;font-size:12px;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;">Connect</button>
        </div>
      </div>
    `,
    starterHtml: `<div class="profile-card">\n  <div class="header">\n    <div class="avatar">AV</div>\n    <div class="info">\n      <h3>Alex Vance</h3>\n      <span>Frontend Architect</span>\n    </div>\n  </div>\n  <p>Building high-frequency collaborative engines and modern browser runtimes.</p>\n  <div class="footer">\n    <span class="badge">Available for Work</span>\n    <button>Connect</button>\n  </div>\n</div>`,
    starterCss: `.profile-card {\n  /* Style your profile card here */\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 24px;\n  border-radius: 16px;\n}\n\n.badge {\n  /* Style the status badge */\n}`,
    starterJs: ``,
    testCases: [
      { input: 'renderTest', expectedOutput: 'pass', description: 'Contains profile-card container with Alex Vance heading' },
      { input: 'cssAccuracy', expectedOutput: 'pass', description: 'Card has dark background with rounded corners and button' },
    ],
  },

  // 11. Web Dev (HTML + CSS Hard): Cyberpunk Neon Pricing HUD
  {
    id: 'q-html-css-cyber-hud',
    arena: 'web_dev',
    title: 'The Cyberpunk Neon HUD Pricing Tier',
    description: 'Construct a futuristic cyber matrix card with glowing neon borders, monospace telemetry headers, metric stats, and an illuminated action button.',
    tags: ['html', 'css'],
    difficulty: 'hard',
    timeLimitSeconds: 600,
    targetPreviewTitle: 'Cyberpunk Neon HUD',
    targetComponentHtml: `
      <div style="background:#050811;padding:28px;border-radius:12px;font-family:monospace;color:#00f2fe;width:100%;max-width:440px;border:2px solid #00f2fe;box-shadow:0 0 25px rgba(0,242,254,0.35);box-sizing:border-box;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e293b;padding-bottom:12px;margin-bottom:16px;">
          <span style="font-size:11px;letter-spacing:2px;color:#ff007f;font-weight:900;">NODE_ACCESS // V2.8</span>
          <span style="font-size:11px;background:#ff007f;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;">CLASSIFIED</span>
        </div>
        <h2 style="font-size:24px;margin:0 0 6px 0;color:#ffffff;letter-spacing:1px;">CYBER OVERLORD</h2>
        <div style="font-size:32px;font-weight:900;color:#00f2fe;margin-bottom:14px;">$99<span style="font-size:14px;color:#64748b;"> / CYCLE</span></div>
        <ul style="list-style:none;padding:0;margin:0 0 20px 0;font-size:12px;line-height:2.2;color:#94a3b8;">
          <li>⚡ 100 Gbit Neural Pipeline Link</li>
          <li>🛡️ Zero-Day Anti-Cheat Deflector</li>
          <li>🔥 Unlimited High-Performance Sandboxes</li>
        </ul>
        <button style="width:100%;background:linear-gradient(90deg,#00f2fe,#ff007f);color:#ffffff;border:none;padding:12px;font-weight:900;font-size:13px;letter-spacing:1.5px;border-radius:6px;cursor:pointer;text-transform:uppercase;">INITIALIZE PROTOCOL</button>
      </div>
    `,
    starterHtml: `<div class="cyber-hud">\n  <div class="hud-top">\n    <span>NODE_ACCESS // V2.8</span>\n    <span class="tag">CLASSIFIED</span>\n  </div>\n  <h2>CYBER OVERLORD</h2>\n  <div class="price">$99 <span>/ CYCLE</span></div>\n  <ul class="perks">\n    <li>⚡ 100 Gbit Neural Pipeline Link</li>\n    <li>🛡️ Zero-Day Anti-Cheat Deflector</li>\n    <li>🔥 Unlimited High-Performance Sandboxes</li>\n  </ul>\n  <button class="action-btn">INITIALIZE PROTOCOL</button>\n</div>`,
    starterCss: `.cyber-hud {\n  background: #050811;\n  color: #00f2fe;\n  border: 2px solid #00f2fe;\n  padding: 28px;\n  border-radius: 12px;\n  font-family: monospace;\n}\n\n.action-btn {\n  /* Create the neon gradient button */\n}`,
    testCases: [
      { input: 'renderTest', expectedOutput: 'pass', description: 'Contains cyber-hud with CYBER OVERLORD heading' },
      { input: 'neonStyles', expectedOutput: 'pass', description: 'Monospace font with neon accent border and gradient button' },
    ],
  },

  // 12. Algorithms (Logic Medium): Maximum Subarray Sum (Kadane's Algorithm)
  {
    id: 'q-algo-max-subarray',
    arena: 'algorithms',
    title: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
    description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum in O(n) time.',
    tags: ['java', 'python', 'cpp', 'arrays', 'dp'],
    difficulty: 'medium',
    timeLimitSeconds: 300,
    sampleInput: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    sampleOutput: '6',
    explanation: 'The contiguous subarray [4, -1, 2, 1] has the largest sum = 6.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      'Must achieve O(N) time and O(1) space complexity',
    ],
    starterPython: `def max_subarray(nums: list[int]) -> int:\n    # Implement Kadane's Algorithm in O(N)\n    max_sum = nums[0]\n    current_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)\n        max_sum = max(max_sum, current_sum)\n    return max_sum`,
    starterJava: `class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSum = nums[0];\n        int currentSum = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currentSum = Math.max(nums[i], currentSum + nums[i]);\n            maxSum = Math.max(maxSum, currentSum);\n        }\n        return maxSum;\n    }\n}`,
    starterCpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        int maxSum = nums[0];\n        int currentSum = nums[0];\n        for (size_t i = 1; i < nums.size(); ++i) {\n            currentSum = max(nums[i], currentSum + nums[i]);\n            maxSum = max(maxSum, currentSum);\n        }\n        return maxSum;\n    }\n};`,
    testCases: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6', description: 'Mixed positive and negative values' },
      { input: 'nums = [1]', expectedOutput: '1', description: 'Single element array' },
      { input: 'nums = [5, 4, -1, 7, 8]', expectedOutput: '23', description: 'All mostly positive subarray' },
      { input: 'nums = [-5, -2, -8, -1]', expectedOutput: '-1', description: 'All negative numbers returns closest to zero' },
    ],
  },

  // 13. Algorithms (Logic Hard): Trapping Rain Water
  {
    id: 'q-algo-trapping-rain',
    arena: 'algorithms',
    title: 'Trapping Rain Water Elevation Map',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    tags: ['java', 'python', 'cpp', 'arrays', 'two_pointers'],
    difficulty: 'hard',
    timeLimitSeconds: 600,
    sampleInput: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
    sampleOutput: '6',
    explanation: 'The elevation map traps 6 units of rain water between the peaks.',
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5',
      'O(N) time with Two Pointers or Prefix/Suffix max arrays',
    ],
    starterPython: `def trap(height: list[int]) -> int:\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    left_max, right_max = height[l], height[r]\n    water = 0\n    while l < r:\n        if left_max < right_max:\n            l += 1\n            left_max = max(left_max, height[l])\n            water += left_max - height[l]\n        else:\n            r -= 1\n            right_max = max(right_max, height[r])\n            water += right_max - height[r]\n    return water`,
    starterJava: `class Solution {\n    public int trap(int[] height) {\n        int l = 0, r = height.length - 1;\n        int leftMax = 0, rightMax = 0;\n        int water = 0;\n        while (l < r) {\n            if (height[l] < height[r]) {\n                if (height[l] >= leftMax) leftMax = height[l];\n                else water += leftMax - height[l];\n                l++;\n            } else {\n                if (height[r] >= rightMax) rightMax = height[r];\n                else water += rightMax - height[r];\n                r--;\n            }\n        }\n        return water;\n    }\n}`,
    starterCpp: `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int l = 0, r = height.size() - 1;\n        int leftMax = 0, rightMax = 0;\n        int water = 0;\n        while (l < r) {\n            if (height[l] < height[r]) {\n                if (height[l] >= leftMax) leftMax = height[l];\n                else water += leftMax - height[l];\n                l++;\n            } else {\n                if (height[r] >= rightMax) rightMax = height[r];\n                else water += rightMax - height[r];\n                r--;\n            }\n        }\n        return water;\n    }\n};`,
    testCases: [
      { input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', expectedOutput: '6', description: 'Standard jagged elevation profile' },
      { input: 'height = [4, 2, 0, 3, 2, 5]', expectedOutput: '9', description: 'Deep valley profile' },
      { input: 'height = [1, 2, 3, 4, 5]', expectedOutput: '0', description: 'Monotonic ascending slope traps 0' },
    ],
  },

  // 14. Bug Hunt (Web Easy): Unclickable Button Behind Invisible Overlay
  {
    id: 'q-bughunt-web-overlay',
    arena: 'bug_hunt',
    bugDomain: 'web',
    title: 'Web Bug: Unclickable Checkout Button Blocked by Ghost Overlay',
    description: 'Users cannot click the "Confirm Order" button because an invisible banner overlay sits on top with a higher z-index. Fix the stacking context or pointer-events so clicks reach the button.',
    tags: ['bug_web', 'html', 'css'],
    difficulty: 'easy',
    timeLimitSeconds: 180,
    targetPreviewTitle: 'Interactive Checkout Button',
    targetComponentHtml: `
      <div style="background:#1e293b;padding:24px;border-radius:12px;font-family:sans-serif;color:#fff;width:100%;max-width:360px;">
        <h4 style="margin:0 0 12px 0;">Order Summary</h4>
        <p style="color:#94a3b8;font-size:13px;margin-bottom:16px;">Total due: $49.00 USD</p>
        <button id="checkout-btn" style="background:#10b981;color:#fff;font-weight:bold;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;width:100%;">Confirm Order</button>
      </div>
    `,
    starterHtml: `<div class="checkout-card">\n  <h4>Order Summary</h4>\n  <p>Total due: $49.00 USD</p>\n  <button id="checkout-btn">Confirm Order</button>\n  <div class="ghost-overlay"></div>\n</div>`,
    starterCss: `.checkout-card {\n  position: relative;\n  background: #1e293b;\n  padding: 24px;\n  border-radius: 12px;\n  color: #fff;\n}\n\n#checkout-btn {\n  position: relative;\n  z-index: 1;\n  background: #10b981;\n  color: #fff;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  width: 100%;\n}\n\n/* BUG: Ghost overlay intercepts all clicks with z-index 10 */\n.ghost-overlay {\n  position: absolute;\n  inset: 0;\n  z-index: 10;\n  /* Fix: add pointer-events: none or adjust z-index */\n}`,
    testCases: [
      { input: 'buttonClickable', expectedOutput: 'true', description: 'Clicks successfully hit checkout button' },
      { input: 'pointerEventsValid', expectedOutput: 'pass', description: 'Ghost overlay does not block user interaction' },
    ],
  },

  // 15. Bug Hunt (Logic Easy): Off-by-One Array In-Place Reversal
  {
    id: 'q-bughunt-logic-reverse',
    arena: 'bug_hunt',
    bugDomain: 'logic',
    title: 'Logic Bug: Off-by-One Index Out of Bounds in Array Reverse',
    description: 'The in-place array reverse function throws an index error on execution because the right index starts at `len(arr)` instead of `len(arr) - 1`. Correct the boundary initialization.',
    tags: ['bug_logic', 'python', 'java', 'cpp'],
    difficulty: 'easy',
    timeLimitSeconds: 180,
    sampleInput: 'arr = [1, 2, 3, 4, 5]',
    sampleOutput: '[5, 4, 3, 2, 1]',
    starterPython: `def reverse_array(arr: list[int]) -> list[int]:\n    l = 0\n    r = len(arr) # BUG: len(arr) causes IndexError out of bounds!\n    while l < r:\n        arr[l], arr[r - 1] = arr[r - 1], arr[l]\n        l += 1\n        r -= 1\n    return arr`,
    starterJava: `class Solution {\n    public int[] reverseArray(int[] arr) {\n        int l = 0;\n        int r = arr.length; // BUG!\n        while (l < r - 1) {\n            int temp = arr[l];\n            arr[l] = arr[r - 1];\n            arr[r - 1] = temp;\n            l++;\n            r--;\n        }\n        return arr;\n    }\n}`,
    starterCpp: `class Solution {\npublic:\n    vector<int> reverseArray(vector<int> arr) {\n        int l = 0;\n        int r = arr.size(); // BUG!\n        while (l < r - 1) {\n            swap(arr[l], arr[r - 1]);\n            l++;\n            r--;\n        }\n        return arr;\n    }\n};`,
    testCases: [
      { input: 'arr = [1, 2, 3, 4, 5]', expectedOutput: '[5, 4, 3, 2, 1]', description: 'Odd length array' },
      { input: 'arr = [10, 20]', expectedOutput: '[20, 10]', description: 'Two element array' },
      { input: 'arr = [7]', expectedOutput: '[7]', description: 'Single element array' },
    ],
  },
];
