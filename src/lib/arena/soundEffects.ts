// High-performance synthesized 8-bit retro arcade & cinematic sound effects using Web Audio API.
// Zero external files or mp3 dependencies!

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 1. Retro Arcade Coin / Laptop Tap Sound
 * Played when clicking the miniature working laptop in the navbar.
 */
export function playArcadeCoinSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    // Ignore audio permission warnings silently
  }
}

/**
 * 2. Voxel Shatter / Corner Blocks Cascade Sound
 * Deep sci-fi frequency sweep when voxels tumble from the 4 corners.
 */
export function playVoxelShatterSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Sub-bass rumble
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.45);

    // Laser glitch
    const laserOsc = ctx.createOscillator();
    const laserGain = ctx.createGain();

    laserOsc.type = 'triangle';
    laserOsc.frequency.setValueAtTime(800, now + 0.05);
    laserOsc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

    laserGain.gain.setValueAtTime(0.12, now + 0.05);
    laserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    laserOsc.connect(laserGain);
    laserGain.connect(ctx.destination);

    laserOsc.start(now + 0.05);
    laserOsc.stop(now + 0.35);
  } catch (e) {}
}

/**
 * 3. Cinematic Battle Slam Impact
 * Deep heavy cinematic impact when "BATTLE ARENA" slams into the center.
 */
export function playBattleSlamSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {}
}

/**
 * 4. Victory Fanfare
 */
export function playVictorySound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  } catch (e) {}
}
