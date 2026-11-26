import { updateSeenQuestionsHistory } from '@/lib/arena/questionSelector';
import { BotProfile, COLLEGIATE_BOT_PROFILES } from './arenaTypes';

const SEEN_ARENA_QUESTIONS_KEY = 'kollabrix_arena_seen_questions';

export function getStoredSeenQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_ARENA_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((id) => String(id).toLowerCase().trim()) : [];
  } catch {
    return [];
  }
}

export function persistSeenQuestionId(newQuestionId: string, matchingQuestionIds: string[] = []) {
  if (typeof window === 'undefined' || !newQuestionId) return;
  try {
    const current = getStoredSeenQuestionIds();
    const updated = updateSeenQuestionsHistory(current, newQuestionId, matchingQuestionIds);
    localStorage.setItem(SEEN_ARENA_QUESTIONS_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Generates an isolated HTML srcDoc for Web Dev target previews and live sandbox previews.
 * Injects case-insensitive DOM element resolution so standard student typos (e.g. #incbtn vs #incBtn)
 * work seamlessly in the interactive preview sandbox without silent null reference crashes.
 */
export function buildWebPreviewDoc(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 12px; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; }
    ${css || ''}
  </style>
</head>
<body>
  ${html || ''}
  <div id="__kbx_err_banner__" style="display:none;position:fixed;bottom:6px;left:6px;right:6px;background:#7f1d1d;color:#fecaca;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;padding:5px 8px;border-radius:6px;border:1px solid #f87171;z-index:999999;box-shadow:0 4px 14px rgba(0,0,0,0.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
  <script>
    (function() {
      function showErr(msg) {
        try {
          var b = document.getElementById('__kbx_err_banner__');
          if (b) {
            b.textContent = '⚠️ JS Error: ' + msg;
            b.style.display = 'block';
          }
        } catch (_) {}
      }
      window.addEventListener('error', function(ev) {
        if (ev && ev.message) showErr(ev.message);
      });

      // 1. Case-insensitive forgiving getElementById
      var _origGetElementById = document.getElementById.bind(document);
      document.getElementById = function(id) {
        if (!id) return null;
        var el = _origGetElementById(id);
        if (el) return el;
        var target = String(id).toLowerCase().trim();
        var all = document.querySelectorAll('[id]');
        for (var i = 0; i < all.length; i++) {
          if (all[i].id && all[i].id.toLowerCase().trim() === target) {
            return all[i];
          }
        }
        return null;
      };

      // 2. Case-insensitive forgiving querySelector
      var _origQuerySelector = document.querySelector.bind(document);
      document.querySelector = function(sel) {
        if (!sel) return null;
        try {
          var direct = _origQuerySelector(sel);
          if (direct) return direct;
        } catch (e) {}
        if (typeof sel === 'string') {
          var trimmed = sel.trim();
          if (trimmed.startsWith('#')) {
            return document.getElementById(trimmed.slice(1));
          }
          var idMatch = trimmed.match(/^\\[id=['"]?([^'"\\]]+)['"]?\\]$/i);
          if (idMatch) {
            return document.getElementById(idMatch[1]);
          }
          var tagAndId = trimmed.match(/^([a-z0-9_-]+)#([a-z0-9_-]+)$/i);
          if (tagAndId) {
            var elem = document.getElementById(tagAndId[2]);
            if (elem && elem.tagName.toLowerCase() === tagAndId[1].toLowerCase()) return elem;
          }
        }
        return null;
      };

      // 3. Case-insensitive forgiving querySelectorAll
      var _origQuerySelectorAll = document.querySelectorAll.bind(document);
      document.querySelectorAll = function(sel) {
        if (!sel) return [];
        try {
          var direct = _origQuerySelectorAll(sel);
          if (direct && direct.length > 0) return direct;
        } catch (e) {}
        if (typeof sel === 'string' && sel.trim().startsWith('#')) {
          var el = document.getElementById(sel.trim().slice(1));
          return el ? [el] : [];
        }
        return [];
      };

      // 4. Safe DOMContentLoaded trigger if registered after DOM ready
      var _origAddEvt = EventTarget.prototype.addEventListener;
      document.addEventListener = function(type, listener, options) {
        if ((type === 'DOMContentLoaded' || type === 'load') && document.readyState !== 'loading') {
          try {
            if (typeof listener === 'function') setTimeout(function() { listener(new Event(type)); }, 0);
          } catch (err) { console.error(err); }
        }
        return _origAddEvt.call(this, type, listener, options);
      };

      // 5. Run student script safely
      try {
${js || ''}
      } catch (err) {
        console.error(err);
        showErr(err && err.message ? err.message : String(err));
      }
    })();
  </script>
</body>
</html>`;
}

/**
 * Abstract Fog-of-War syntax bar geometry (never leaks readable tokens).
 */
export const FOG_SYNTAX_LINES: Array<Array<{ w: string; tone: string }>> = [
  [{ w: 'w-8', tone: 'bg-sky-400/35' }, { w: 'w-24', tone: 'bg-slate-200/25' }, { w: 'w-14', tone: 'bg-amber-300/25' }],
  [{ w: 'w-6', tone: 'bg-transparent' }, { w: 'w-10', tone: 'bg-slate-300/25' }, { w: 'w-6', tone: 'bg-emerald-400/25' }],
  [{ w: 'w-6', tone: 'bg-transparent' }, { w: 'w-8', tone: 'bg-sky-400/30' }, { w: 'w-28', tone: 'bg-slate-200/20' }],
  [{ w: 'w-12', tone: 'bg-transparent' }, { w: 'w-20', tone: 'bg-amber-300/25' }, { w: 'w-12', tone: 'bg-slate-300/20' }],
  [{ w: 'w-12', tone: 'bg-transparent' }, { w: 'w-10', tone: 'bg-rose-400/30' }, { w: 'w-24', tone: 'bg-slate-200/25' }],
  [{ w: 'w-16', tone: 'bg-transparent' }, { w: 'w-12', tone: 'bg-sky-400/30' }, { w: 'w-16', tone: 'bg-emerald-400/30' }],
  [{ w: 'w-12', tone: 'bg-transparent' }, { w: 'w-24', tone: 'bg-slate-200/20' }, { w: 'w-8', tone: 'bg-amber-300/25' }],
  [{ w: 'w-6', tone: 'bg-transparent' }, { w: 'w-14', tone: 'bg-sky-400/35' }, { w: 'w-8', tone: 'bg-slate-300/25' }],
  [{ w: 'w-6', tone: 'bg-transparent' }, { w: 'w-20', tone: 'bg-emerald-400/25' }, { w: 'w-12', tone: 'bg-slate-200/20' }],
  [{ w: 'w-12', tone: 'bg-transparent' }, { w: 'w-16', tone: 'bg-amber-300/30' }, { w: 'w-14', tone: 'bg-slate-300/20' }],
  [{ w: 'w-6', tone: 'bg-transparent' }, { w: 'w-12', tone: 'bg-rose-400/25' }, { w: 'w-10', tone: 'bg-slate-200/25' }],
  [{ w: 'w-8', tone: 'bg-sky-400/30' }, { w: 'w-14', tone: 'bg-slate-200/20' }],
];

export interface FightCardPngPayload {
  playerName: string;
  playerCollege: string;
  rivalName: string;
  rivalCollege: string;
  didWin: boolean;
  isDraw: boolean;
  userTests: number;
  rivalTests: number;
  totalTests: number;
  solveTimeFormatted: string;
  peakWpm: number;
  eloBefore: number;
  eloAfter: number;
  campusPts: number;
  questionTitle: string;
}

/**
 * Renders and downloads a crisp Obsidian Titanium Fight Card PNG for social sharing.
 */
export function downloadFightCardPng(data: FightCardPngPayload) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Obsidian backdrop
  ctx.fillStyle = '#04060A';
  ctx.fillRect(0, 0, 1200, 630);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1200; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 630); ctx.stroke();
  }
  for (let y = 0; y <= 630; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke();
  }

  // Outer Glass Panel
  ctx.fillStyle = '#0A0E17';
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(64, 54, 1072, 522, 28);
  ctx.fill();
  ctx.stroke();

  // Header
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('KOLLABRIX // THE PROVING GROUNDS', 110, 112);

  ctx.fillStyle = data.didWin ? '#34d399' : data.isDraw ? '#cbd5e1' : '#f87171';
  ctx.font = '900 36px system-ui, -apple-system, sans-serif';
  const headline = data.didWin
    ? `VICTORY — ${data.playerCollege.toUpperCase()} TAKES THE ROUND`
    : data.isDraw
      ? 'TIME EXPIRED — DRAW'
      : `DEFEAT — ${data.rivalCollege.toUpperCase()} TAKES THE ROUND`;
  ctx.fillText(headline, 110, 166);

  ctx.fillStyle = '#64748b';
  ctx.font = '18px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(`CHALLENGE: ${data.questionTitle.toUpperCase()}`, 110, 200);

  // Left card (You)
  ctx.fillStyle = '#05080F';
  ctx.strokeStyle = data.didWin ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.roundRect(110, 234, 460, 240, 20); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.playerName, 142, 286);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px ui-monospace, monospace';
  ctx.fillText(data.playerCollege, 142, 314);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 40px ui-monospace, monospace';
  ctx.fillText(`${data.userTests} / ${data.totalTests} Tests`, 142, 378);

  const delta = data.eloAfter - data.eloBefore;
  ctx.fillStyle = delta >= 0 ? '#34d399' : '#f87171';
  ctx.font = 'bold 18px ui-monospace, monospace';
  ctx.fillText(
    `${delta >= 0 ? `+${delta}` : delta} ELO (${data.eloBefore} → ${data.eloAfter})  •  +${data.campusPts} War Pts`,
    142,
    438
  );

  // Right card (Rival)
  ctx.fillStyle = '#05080F';
  ctx.strokeStyle = !data.didWin && !data.isDraw ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.roundRect(630, 234, 460, 240, 20); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.rivalName, 662, 286);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px ui-monospace, monospace';
  ctx.fillText(data.rivalCollege, 662, 314);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '900 40px ui-monospace, monospace';
  ctx.fillText(`${data.rivalTests} / ${data.totalTests} Tests`, 662, 378);
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 18px ui-monospace, monospace';
  ctx.fillText(`Solve Time: ${data.solveTimeFormatted}  •  Peak: ${data.peakWpm} WPM`, 662, 438);

  ctx.fillStyle = '#64748b';
  ctx.font = '15px ui-monospace, monospace';
  ctx.fillText('kollabrix.in/arena — Where Reputations Are Proven In Seconds', 110, 534);

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `kollabrix-fight-card-${Date.now()}.png`;
  a.click();
}

export function pickRivalProfile(seed?: number): BotProfile {
  const idx = typeof seed === 'number'
    ? Math.abs(seed) % COLLEGIATE_BOT_PROFILES.length
    : Math.floor(Math.random() * COLLEGIATE_BOT_PROFILES.length);
  return COLLEGIATE_BOT_PROFILES[idx];
}
