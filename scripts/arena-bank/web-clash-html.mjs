import { makeWebClash } from './builders.mjs';

/**
 * 180 unique Web Pixel Clash challenges:
 * - 90 HTML-Only (Easy/Medium/Hard x 3m/5m/10m x 10 each)
 * - 90 HTML + CSS (Easy/Medium/Hard x 3m/5m/10m x 10 each)
 */

const HTML_ONLY_DOMAINS = [
  ['Campus Library Pass', 'library', 'Borrow Books', 'Main Counter Desk', 'Open Mon to Sat', ['Fiction Shelf', 'Study Pods', 'Quiet Zone']],
  ['Robotics Lab Roster', 'robotics', 'Join Team', 'Autonomous Rover Bay', 'Weekly Build Hours', ['Sensor Suite', 'LiDAR Rig', 'Servo Arm']],
  ['Cloud Server Monitor', 'cloud', 'Restart Node', 'US-East Cluster Alpha', 'Healthy Status Check', ['CPU Load', 'Memory Pool', 'Disk IO']],
  ['Hackathon Check-In', 'hackathon', 'Submit Entry', 'Sprint Registration Desk', 'Round One Opening', ['Team Name', 'Track Pick', 'Repo Link']],
  ['Coffee Bar Menu', 'coffee', 'Order Now', 'Campus Espresso Lounge', 'Fresh Roast Blend', ['Dark Espresso', 'Cold Brew', 'Oat Latte']],
  ['Flight Departure Board', 'flight', 'Track Gate', 'Terminal North Schedule', 'Boarding Priority One', ['Gate B12', 'Seat Class', 'Baggage Drop']],
  ['Music Studio Session', 'music', 'Book Booth', 'Acoustic Recording Room', 'Mastering Console Ready', ['Mic Gain', 'Track Mix', 'Export Wav']],
  ['Fitness Sprint Plan', 'fitness', 'Start Drill', 'Morning Cardio Circuit', 'Track Interval Rounds', ['Warmup Lap', 'Box Jumps', 'Cool Stretch']],
  ['Bookstore Catalog Card', 'bookstore', 'Reserve Copy', 'Algorithms Handbook Edition', 'Second Campus Print', ['Chapter One', 'Practice Set', 'Answer Key']],
  ['Design Critique Notes', 'design', 'Post Note', 'Weekly UI Review Board', 'Grid Audit Checklist', ['Type Scale', 'Focus Ring', 'Contrast Pass']],
  ['Solar Station Telemetry', 'solar', 'Sync Grid', 'Rooftop Array Unit', 'Peak Watt Output', ['Panel Volt', 'Battery Cell', 'Inverter Temp']],
  ['Podcast Episode Brief', 'podcast', 'Play Show', 'Founders Deep Dive', 'Live Interview Feed', ['Host Intro', 'Guest Story', 'Q&A Outro']],
  ['Chess Club Bracket', 'chess', 'Enter Match', 'Rapid Swiss Round', 'Time Control Ten Min', ['White Move', 'Black Move', 'Draw Offer']],
  ['Cinema Premiere Info', 'cinema', 'Save Seat', 'Auditorium Screen Two', 'Director Cut Screening', ['Main Cast', 'Sound Mix', 'Runtime Info']],
  ['Bakery Daily Specials', 'bakery', 'Add Box', 'Morning Artisan Counter', 'Warm Sourdough Batch', ['Brioche Bun', 'Berry Tart', 'Rye Loaf']],
  ['Transit Shuttle Stop', 'transit', 'View Map', 'North Hostel Loop', 'Next Bus Arrival', ['Gate East', 'Library Hub', 'Sports Hall']],
  ['Startup Demo Pitch', 'startup', 'Back Idea', 'Seed Cohort Showcase', 'Three Minute Pitch', ['Problem Fit', 'Live Demo', 'Team Bio']],
  ['Botany Garden Guide', 'botany', 'Log Plant', 'Glasshouse Fern Wing', 'Daily Mist Routine', ['Soil Moisture', 'Shade Level', 'Leaf Care']],
  ['Photography Workshop', 'photo', 'RSVP Spot', 'Portrait Lighting Lab', 'Manual Exposure Class', ['Lens Focus', 'Shutter Speed', 'ISO Dial']],
  ['Esports Lobby Brief', 'esports', 'Ready Up', 'Arena Qualifier Match', 'Best Of Three Series', ['Draft Pick', 'Map Ban', 'Voice Comms']],
  ['Dental Clinic Intake', 'clinic', 'Book Visit', 'Wellness Check Center', 'Morning Patient Queue', ['Checkup Slot', 'Clean Care', 'Follow Up']],
  ['Podcast Gear Checklist', 'gear', 'Check All', 'Travel Creator Kit', 'Pre-Shoot Inventory', ['Shotgun Mic', 'XLR Cable', 'Pop Shield']],
  ['Open Source Release', 'oss', 'View Diff', 'Version Two Point Four', 'Core Engine Patch', ['Fast Parser', 'Safe Memory', 'CLI Docs']],
  ['Culinary Prep Sheet', 'chef', 'Print Card', 'Evening Tasting Course', 'Herb Sauce Station', ['Fresh Basil', 'Garlic Roast', 'Olive Glaze']],
  ['Astronomy Night Watch', 'astro', 'Log Sight', 'Observatory Dome View', 'Clear Sky Tonight', ['Moon Crater', 'Saturn Ring', 'Orion Belt']],
  ['Bike Repair Ticket', 'bike', 'Log Fix', 'Campus Cycle Shop', 'Tune Up Service', ['Brake Pad', 'Chain Oil', 'Tire Psi']],
  ['Cyber Security Alert', 'sec', 'Patch Host', 'Firewall Audit Notice', 'Zero Trust Check', ['Rotate Key', 'Scan Port', 'Lock Token']],
  ['Theater Stage Cue', 'stage', 'Cue Light', 'Winter Drama Rehearsal', 'Act Two Transition', ['Spot Beam', 'Sound Fade', 'Prop Move']],
  ['Museum Tour Stops', 'museum', 'Audio Tour', 'Modern Sculpture Hall', 'West Wing Exhibit', ['Bronze Form', 'Light Arch', 'Stone Relief']],
  ['Volunteer Drive Card', 'charity', 'Sign Shift', 'Weekend Food Pantry', 'Campus Community Help', ['Sort Crate', 'Pack Meal', 'Route Van']],
];

function buildHtmlOnlyQuestions() {
  const durations = [
    { secs: 180, tag: '3m' },
    { secs: 300, tag: '5m' },
    { secs: 600, tag: '10m' },
  ];
  const diffs = ['easy', 'medium', 'hard'];
  const list = [];
  let domainCursor = 0;

  for (const diff of diffs) {
    for (const dur of durations) {
      for (let idx = 0; idx < 10; idx++) {
        const [baseTitle, slug, btnText, subtitle, sectionTitle, items] =
          HTML_ONLY_DOMAINS[(domainCursor + idx * 3) % HTML_ONLY_DOMAINS.length];
        domainCursor++;

        const variantTag = dur.tag.toUpperCase();
        const title = `${baseTitle} (${variantTag} ${diff[0].toUpperCase()}${idx + 1})`;
        const id = `wc-html-${diff[0]}${dur.tag}-${String(idx + 1).padStart(2, '0')}`;
        const hWord = baseTitle.split(' ')[0].toLowerCase();

        if (diff === 'easy') {
          const includeList = dur.secs >= 300;
          const includeForm = dur.secs >= 600;
          const targetHtml = [
            `<section class="${slug}-panel">`,
            `  <h2>${baseTitle}</h2>`,
            `  <p>${subtitle}</p>`,
            includeList ? `  <ul>\n    <li>${items[0]}</li>\n    <li>${items[1]}</li>\n  </ul>` : '',
            includeForm ? `  <form>\n    <input type="text" placeholder="Enter ${items[2]}" />\n    <button type="submit">${btnText}</button>\n  </form>` : `  <button type="button">${btnText}</button>`,
            `</section>`,
          ].filter(Boolean).join('\n');

          const checks = [
            { label: `Include <h2> heading "${baseTitle}"`, scope: 'html', req: `<h[1-6][^>]*>[^<]*${hWord}[^<]*</h[1-6]>` },
            ...(includeList ? [{ label: 'Include unordered list (<ul> / <li>)', scope: 'html', req: '<ul[^>]*>[\\s\\S]*?<li[^>]*>' }] : []),
            ...(includeForm ? [{ label: 'Include form & input field', scope: 'html', req: '<form[^>]*>[\\s\\S]*?<input' }] : []),
            { label: `Include action button "${btnText}"`, scope: 'html', req: `<button[^>]*>[^<]*${btnText.split(' ')[0]}[^<]*</button>` },
          ];

          list.push(makeWebClash({
            id, title, difficulty: diff, durationSecs: dur.secs, stackTags: ['html'],
            description: `Build clean semantic HTML matching Blueprint:\n- Heading: ${baseTitle}\n- Paragraph: ${subtitle}\n${includeList ? `- List items: ${items[0]}, ${items[1]}\n` : ''}${includeForm ? '- Include a <form> with text <input>\n' : ''}- Button: ${btnText}`,
            starterHtml: `<section class="${slug}-panel">\n  <!-- Write semantic HTML to match Blueprint -->\n</section>`,
            targetHtml, checks,
          }));
        } else if (diff === 'medium') {
          const includeQuote = dur.secs >= 300;
          const includeTable = dur.secs >= 600;
          const targetHtml = [
            `<article class="${slug}-sheet">`,
            `  <h2>${baseTitle}</h2>`,
            `  <p>${sectionTitle}</p>`,
            `  <ol>`,
            `    <li>${items[0]}</li>`,
            `    <li>${items[1]}</li>`,
            `    <li>${items[2]}</li>`,
            `  </ol>`,
            includeQuote ? `  <blockquote>${subtitle}</blockquote>` : '',
            includeTable ? `  <table><thead><tr><th>Item</th><th>Status</th></tr></thead><tbody><tr><td>${items[0]}</td><td>Ready</td></tr></tbody></table>` : '',
            `  <button type="button">${btnText}</button>`,
            `</article>`,
          ].filter(Boolean).join('\n');

          const checks = [
            { label: `Semantic heading for "${baseTitle}"`, scope: 'html', req: `<h[1-6][^>]*>[^<]*${hWord}` },
            { label: 'Ordered list (<ol>) with all 3 items', scope: 'html', req: '<ol[^>]*>[\\s\\S]*?<li[^>]*>[\\s\\S]*?<li[^>]*>[\\s\\S]*?<li' },
            ...(includeQuote ? [{ label: 'Semantic <blockquote> section', scope: 'html', req: '<blockquote[^>]*>[^<]+' }] : []),
            ...(includeTable ? [{ label: 'Structured data <table> rows', scope: 'html', req: '<table[^>]*>[\\s\\S]*?<tr[^>]*>[\\s\\S]*?<td' }] : []),
            { label: `Action button "${btnText}"`, scope: 'html', req: `<button[^>]*>[^<]*${btnText.split(' ')[0]}` },
          ];

          list.push(makeWebClash({
            id, title, difficulty: diff, durationSecs: dur.secs, stackTags: ['html'],
            description: `Replicate semantic HTML Blueprint:\n- Heading: ${baseTitle}\n- Subtitle: ${sectionTitle}\n- Ordered list (<ol>) containing ${items.join(', ')}\n${includeQuote ? `- Blockquote: ${subtitle}\n` : ''}${includeTable ? `- 2-column <table> showing ${items[0]} Ready\n` : ''}- Button: ${btnText}`,
            starterHtml: `<article class="${slug}-sheet">\n  <!-- Add heading, ordered list, semantic blocks & button -->\n</article>`,
            targetHtml, checks,
          }));
        } else {
          // hard: clean structured fieldset + table + details/summary semantic layout scaled to duration
          const targetHtml = [
            `<main class="${slug}-hub">`,
            `  <h2>${baseTitle}</h2>`,
            `  <p>${subtitle}</p>`,
            `  <fieldset>`,
            `    <legend>${sectionTitle}</legend>`,
            `    <label>Name <input type="text" placeholder="Full Name" required /></label>`,
            `    <label>Email <input type="email" placeholder="user@campus.edu" required /></label>`,
            `  </fieldset>`,
            dur.secs >= 300 ? `  <table><thead><tr><th>Track</th><th>Unit</th></tr></thead><tbody><tr><td>${items[0]}</td><td>Active</td></tr><tr><td>${items[1]}</td><td>Queued</td></tr></tbody></table>` : '',
            dur.secs >= 600 ? `  <details open><summary>Notes</summary><p>${items[2]}</p></details>` : '',
            `  <button type="submit">${btnText}</button>`,
            `</main>`,
          ].filter(Boolean).join('\n');

          const checks = [
            { label: `Heading "${baseTitle}"`, scope: 'html', req: `<h[1-6][^>]*>[^<]*${hWord}` },
            { label: '<fieldset> & <legend> group', scope: 'html', req: '<fieldset[^>]*>[\\s\\S]*?<legend[^>]*>[^<]+</legend>' },
            { label: 'Required text + email inputs', scope: 'html', req: 'type=["\']email["\'][\\s\\S]*?required|required[\\s\\S]*?type=["\']email["\']' },
            ...(dur.secs >= 300 ? [{ label: 'Summary <table> with 2 rows', scope: 'html', req: '<table[^>]*>[\\s\\S]*?<tbody[^>]*>[\\s\\S]*?<tr[\\s\\S]*?<tr' }] : []),
            ...(dur.secs >= 600 ? [{ label: '<details> & <summary> block', scope: 'html', req: '<details[^>]*>[\\s\\S]*?<summary[^>]*>' }] : []),
            { label: `Submit button "${btnText}"`, scope: 'html', req: `<button[^>]*>[^<]*${btnText.split(' ')[0]}` },
          ];

          list.push(makeWebClash({
            id, title, difficulty: diff, durationSecs: dur.secs, stackTags: ['html'],
            description: `Construct full accessible HTML Blueprint:\n- Heading: ${baseTitle}\n- Paragraph: ${subtitle}\n- <fieldset> with <legend>${sectionTitle}</legend> + required text & email inputs\n${dur.secs >= 300 ? `- Status <table> listing ${items[0]} (Active) and ${items[1]} (Queued)\n` : ''}${dur.secs >= 600 ? `- <details open><summary>Notes</summary><p>${items[2]}</p></details>\n` : ''}- Button: ${btnText}`,
            starterHtml: `<main class="${slug}-hub">\n  <!-- Build accessible HTML structure matching Blueprint -->\n</main>`,
            targetHtml, checks,
          }));
        }
      }
    }
  }
  return list;
}

const CSS_THEMES = [
  ['#0f172a', '#2563eb', '#f8fafc', 'Cobalt Slate'],
  ['#18181b', '#059669', '#ecfdf5', 'Emerald Ink'],
  ['#1e1b4b', '#4f46e5', '#eef2ff', 'Indigo Night'],
  ['#1c1917', '#ea580c', '#fff7ed', 'Ember Stone'],
  ['#082f49', '#0284c7', '#f0f9ff', 'Glacier Steel'],
  ['#27272a', '#dc2626', '#fef2f2', 'Crimson Titanium'],
];

function buildHtmlCssQuestions() {
  const durations = [
    { secs: 180, tag: '3m' },
    { secs: 300, tag: '5m' },
    { secs: 600, tag: '10m' },
  ];
  const diffs = ['easy', 'medium', 'hard'];
  const list = [];
  let cur = 0;

  for (const diff of diffs) {
    for (const dur of durations) {
      for (let idx = 0; idx < 10; idx++) {
        const [baseTitle, slug, btnText, subtitle, sectionTitle, items] =
          HTML_ONLY_DOMAINS[(cur + 7 + idx * 2) % HTML_ONLY_DOMAINS.length];
        const [darkBg, accent, lightTint, themeName] = CSS_THEMES[(cur + idx) % CSS_THEMES.length];
        cur++;

        const title = `${baseTitle} UI (${themeName} ${dur.tag.toUpperCase()} ${diff[0].toUpperCase()}${idx + 1})`;
        const id = `wc-hc-${diff[0]}${dur.tag}-${String(idx + 1).padStart(2, '0')}`;
        const hWord = baseTitle.split(' ')[0].toLowerCase();

        if (diff === 'easy') {
          const targetHtml = `<div class="${slug}-card">\n  <span class="badge">${sectionTitle.split(' ')[0]}</span>\n  <h2>${baseTitle}</h2>\n  <p>${subtitle}</p>\n  <button class="cta">${btnText}</button>\n</div>`;
          const targetCss = `body { background: ${lightTint}; display: flex; justify-content: center; align-items: center; min-height: 100vh; }\n.${slug}-card { background: ${darkBg}; color: #ffffff; padding: 20px; border-radius: 14px; max-width: 320px; text-align: center; }\n.badge { display: inline-block; background: ${accent}; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }\nh2 { margin: 4px 0 6px; font-size: 18px; }\np { color: #cbd5e1; font-size: 13px; margin: 0 0 14px; }\n.cta { background: ${accent}; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }`;
          const starterHtml = targetHtml;
          const checks = [
            { label: 'Card padding, radius & dark background styling', scope: 'css', req: 'padding\\s*:&&border-radius\\s*:&&background' },
            { label: 'Button background & text styling', scope: 'css', req: 'color\\s*:&&(\\.cta|button)' },
          ];
          const scopeHint =
            dur.secs === 180
              ? 'HTML is 100% pre-filled — write style.css only.'
              : dur.secs === 300
                ? 'HTML is 100% pre-filled — style card padding, radius, badge & button.'
                : 'HTML is 100% pre-filled — complete full responsive style.css design.';
          list.push(makeWebClash({
            id, title, difficulty: diff, durationSecs: dur.secs, stackTags: ['html', 'css'],
            description: `Style the ${themeName} card (${scopeHint}):\n- Container background ${darkBg}, 20px padding, 14px radius\n- Pill badge + Heading "${baseTitle}" + subtitle "${subtitle}"\n- Accent button (${accent}) labeled "${btnText}"`,
            starterHtml,
            starterCss: `body { background: ${lightTint}; display: flex; justify-content: center; align-items: center; min-height: 100vh; }\n.${slug}-card {\n  background: ${darkBg};\n  color: #ffffff;\n  /* Add card padding, border-radius and .cta button styling */\n}\n`,
            targetHtml, targetCss, checks,
          }));
        } else if (diff === 'medium') {
          const targetHtml = `<div class="${slug}-row">\n  <div class="tile"><h3>${items[0]}</h3><p>${subtitle}</p></div>\n  <div class="tile highlight"><h3>${items[1]}</h3><p>${sectionTitle}</p></div>\n  <div class="tile"><h3>${items[2]}</h3><button class="btn">${btnText}</button></div>\n</div>`;
          const targetCss = `body { background: #f8fafc; padding: 16px; }\n.${slug}-row { display: flex; gap: 12px; align-items: stretch; justify-content: center; }\n.tile { flex: 1; background: ${darkBg}; color: #fff; padding: 16px; border-radius: 12px; border: 1px solid #334155; }\n.tile.highlight { border-color: ${accent}; background: #1e293b; }\n.tile h3 { margin: 0 0 6px; font-size: 14px; }\n.tile p { margin: 0; font-size: 12px; color: #94a3b8; }\n.btn { margin-top: 8px; background: ${accent}; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; }`;
          const starterHtml = targetHtml;
          const checks = [
            { label: 'Flexbox or Grid horizontal alignment with gap', scope: 'css', req: 'display\\s*:\\s*(flex|grid)&&gap\\s*:' },
            { label: 'Tile card borders, padding & radius', scope: 'css', req: 'border-radius\\s*:&&padding\\s*:&&background' },
          ];
          const scopeHint =
            dur.secs === 180
              ? 'HTML is 100% pre-filled — write style.css only.'
              : dur.secs === 300
                ? 'HTML is 100% pre-filled — style tile cards, highlight state & button.'
                : 'HTML is 100% pre-filled — complete responsive flex/grid multi-tile layout.';
          list.push(makeWebClash({
            id, title, difficulty: diff, durationSecs: dur.secs, stackTags: ['html', 'css'],
            description: `Build responsive multi-tile ${themeName} Flex/Grid bar (${scopeHint}):\n- Use display: flex or grid with 12px gap\n- Render tiles: ${items.join(', ')}\n- Dark background ${darkBg}, highlighted border ${accent}, 12px rounded cards`,
            starterHtml,
            starterCss: `body { background: #f8fafc; padding: 16px; }\n.${slug}-row {\n  /* Use display: flex or grid with gap: 12px */\n}\n.tile {\n  background: ${darkBg};\n  color: #fff;\n  /* Add padding, border-radius, and border */\n}\n`,
            targetHtml, targetCss, checks,
          }));
        } else {
          const targetHtml = `<section class="${slug}-dash">\n  <header class="dash-top"><h2>${baseTitle}</h2><button class="pill-btn">${btnText}</button></header>\n  <div class="metrics-grid">\n    <div class="stat"><span>${items[0]}</span><strong>94%</strong></div>\n    <div class="stat"><span>${items[1]}</span><strong>12ms</strong></div>\n    <div class="stat"><span>${items[2]}</span><strong>Live</strong></div>\n  </div>\n</section>`;
          const targetCss = `body { background: #090d16; padding: 14px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }\n.${slug}-dash { width: 100%; max-width: 400px; background: ${darkBg}; border: 1px solid #334155; border-radius: 16px; padding: 16px; color: #f8fafc; }\n.dash-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }\n.dash-top h2 { margin: 0; font-size: 16px; }\n.pill-btn { background: ${accent}; color: #fff; border: none; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }\n.metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n.stat { background: rgba(255,255,255,0.06); padding: 10px; border-radius: 10px; text-align: center; }\n.stat span { display: block; font-size: 10px; color: #94a3b8; }\n.stat strong { font-size: 16px; color: #ffffff; }`;
          const starterHtml = targetHtml;
          const checks = [
            { label: 'Flex header alignment (space-between)', scope: 'css', req: 'display\\s*:\\s*flex&&justify-content\\s*:\\s*space-between' },
            { label: 'CSS Grid 3-column metrics strip', scope: 'css', req: 'display\\s*:\\s*grid&&grid-template-columns' },
          ];
          const scopeHint =
            dur.secs === 180
              ? 'HTML is 100% pre-filled — write style.css only.'
              : dur.secs === 300
                ? 'HTML is 100% pre-filled — style dashboard header & 3-column metrics grid.'
                : 'HTML is 100% pre-filled — complete dashboard header, 3-column metrics grid & styling.';
          list.push(makeWebClash({
            id, title, difficulty: diff, durationSecs: dur.secs, stackTags: ['html', 'css'],
            description: `Craft a crisp ${themeName} Dashboard panel (${scopeHint}):\n- Top flex bar: justify-content: space-between with "${baseTitle}" + "${btnText}" pill button\n- 3-column CSS Grid (.metrics-grid) showing ${items.join(', ')}\n- Obsidian card (${darkBg}), 16px radius & rounded stat tiles`,
            starterHtml,
            starterCss: `body { background: #090d16; padding: 14px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }\n.${slug}-dash {\n  background: ${darkBg};\n  color: #f8fafc;\n  /* Add padding, border-radius, and header/grid layout */\n}\n`,
            targetHtml, targetCss, checks,
          }));
        }
      }
    }
  }
  return list;
}

export const WEB_CLASH_HTML_QUESTIONS = [
  ...buildHtmlOnlyQuestions(),
  ...buildHtmlCssQuestions(),
];
