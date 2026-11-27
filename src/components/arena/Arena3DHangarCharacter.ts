import * as THREE from 'three';

export interface CharacterPalette {
  armorMain: number;
  armorDark: number;
  visorGlow: number;
  accentTrim: number;
  wingGlow: number;
  hexPrimary: string;
  hexAccent: string;
  skinTitle: string;
}

export const AVATAR_3D_PALETTES: Record<string, CharacterPalette> = {
  walker: {
    armorMain: 0x161f2e,
    armorDark: 0x070b14,
    visorGlow: 0x38bdf8,
    accentTrim: 0x67e8f9,
    wingGlow: 0x0ea5e9,
    hexPrimary: '#38BDF8',
    hexAccent: '#67E8F9',
    skinTitle: 'CYBER ARCHITECT',
  },
  ronin: {
    armorMain: 0x172554,
    armorDark: 0x070d1f,
    visorGlow: 0x60a5fa,
    accentTrim: 0x93c5fd,
    wingGlow: 0x3b82f6,
    hexPrimary: '#60A5FA',
    hexAccent: '#93C5FD',
    skinTitle: 'COMPILER KNIGHT',
  },
  sentinel: {
    armorMain: 0x3f0d19,
    armorDark: 0x110508,
    visorGlow: 0xf43f5e,
    accentTrim: 0xfbbf24,
    wingGlow: 0xe11d48,
    hexPrimary: '#F43F5E',
    hexAccent: '#FBBF24',
    skinTitle: 'KERNEL PHANTOM',
  },
  coder: {
    armorMain: 0x0b3b30,
    armorDark: 0x051410,
    visorGlow: 0x34d399,
    accentTrim: 0x6ee7b7,
    wingGlow: 0x10b981,
    hexPrimary: '#34D399',
    hexAccent: '#6EE7B7',
    skinTitle: 'SYNTAX PRODIGY',
  },
  glitch: {
    armorMain: 0x2e1065,
    armorDark: 0x0e061e,
    visorGlow: 0xfacc15,
    accentTrim: 0xc084fc,
    wingGlow: 0xa855f7,
    hexPrimary: '#C084FC',
    hexAccent: '#FACC15',
    skinTitle: 'GLITCH VIPER',
  },
};

export interface DuelistTabletProfile {
  avatarId: string;
  playerName: string;
  playerCollege: string;
  tier: string;
  elo: number;
  wins: number;
  losses: number;
  winStreak: number;
  algoLanguage: string;
  combatMode: string;
}

export interface Built3DDuelist {
  root: THREE.Group;
  update: (t: number) => void;
  updateProfile: (next: Partial<DuelistTabletProfile>) => void;
  dispose: () => void;
}

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFrontScreen(canvas: HTMLCanvasElement, profile: DuelistTabletProfile) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const pal = AVATAR_3D_PALETTES[profile.avatarId] || AVATAR_3D_PALETTES.walker;
  const W = canvas.width;
  const H = canvas.height;

  // Deep obsidian glass gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#09101D');
  bg.addColorStop(0.55, '#050811');
  bg.addColorStop(1, '#0A0F1C');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial accent spotlight
  const rad = ctx.createRadialGradient(W * 0.5, H * 0.28, 20, W * 0.5, H * 0.28, 320);
  rad.addColorStop(0, `${pal.hexPrimary}38`);
  rad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, W, H);

  // Subtle tactical microgrid
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 32) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
    ctx.stroke();
  }
  for (let gy = 0; gy < H; gy += 32) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }

  // Outer HUD Inset Frame
  ctx.strokeStyle = `${pal.hexPrimary}55`;
  ctx.lineWidth = 2;
  roundRectPath(ctx, 20, 20, W - 40, H - 40, 24);
  ctx.stroke();

  // Top Header Bar
  ctx.fillStyle = pal.hexAccent;
  ctx.font = '700 15px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('KΛ ARENA  //  DUELIST ID', 42, 60);

  // Live Green Dot + Tier Badge
  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.arc(W - 140, 55, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 14px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'right';
  ctx.fillText(profile.tier.toUpperCase(), W - 42, 60);

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(40, 82);
  ctx.lineTo(W - 40, 82);
  ctx.stroke();

  // Central Glowing Hex Rank Crest
  const cx = W / 2;
  const cy = 200;
  ctx.save();
  ctx.strokeStyle = pal.hexPrimary;
  ctx.lineWidth = 3;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const px = cx + Math.cos(a) * 66;
    const py = cy + Math.sin(a) * 66;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Glowing KΛ Mark inside Hex Crest
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 40px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KΛ', cx, cy + 2);
  ctx.restore();

  // Skin Class Tag Pill
  ctx.fillStyle = `${pal.hexPrimary}28`;
  roundRectPath(ctx, cx - 108, 286, 216, 28, 14);
  ctx.fill();
  ctx.strokeStyle = `${pal.hexAccent}88`;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = pal.hexAccent;
  ctx.font = '700 12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pal.skinTitle, cx, 300);

  // Player Callsign & College
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 34px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const safeName = (profile.playerName || 'DUELIST').slice(0, 16);
  ctx.fillText(safeName, cx, 362);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 16px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText((profile.playerCollege || 'KOLLABRIX').slice(0, 26), cx, 392);

  // Big Glowing ELO Showcase Box
  roundRectPath(ctx, 42, 422, W - 84, 110, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('COMPETITIVE RATING', cx, 452);

  ctx.fillStyle = '#FBBF24';
  ctx.font = '900 48px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(`${profile.elo.toLocaleString()} ELO`, cx, 506);

  // 3-Column Stats Row (WINS | WIN % | STREAK)
  const totalMatches = profile.wins + profile.losses;
  const winPct = totalMatches > 0 ? Math.round((profile.wins / totalMatches) * 100) : 0;
  const stats = [
    { label: 'WINS', val: String(profile.wins), col: '#34D399' },
    { label: 'WIN %', val: `${winPct}%`, col: '#F8FAFC' },
    { label: 'STREAK', val: `${profile.winStreak}x`, col: '#FBBF24' },
  ];
  const cardW = (W - 108) / 3;
  stats.forEach((st, i) => {
    const bx = 42 + i * (cardW + 12);
    roundRectPath(ctx, bx, 552, cardW, 92, 14);
    ctx.fillStyle = 'rgba(7, 11, 20, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 12px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(st.label, bx + cardW / 2, 580);

    ctx.fillStyle = st.col;
    ctx.font = '900 28px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(st.val, bx + cardW / 2, 622);
  });

  // Footer Active Weapon & Combat Mode Pill
  roundRectPath(ctx, 42, 666, W - 84, 58, 14);
  ctx.fillStyle = `${pal.hexPrimary}1F`;
  ctx.fill();
  ctx.strokeStyle = `${pal.hexPrimary}66`;
  ctx.stroke();

  const langLabel =
    profile.algoLanguage === 'cpp'
      ? 'C++20 STL'
      : profile.algoLanguage === 'java'
      ? 'JAVA 21'
      : profile.algoLanguage === 'web'
      ? 'HTML / JS'
      : 'PYTHON 3';
  const modeLabel =
    profile.combatMode === 'bug_hunt'
      ? '60S BUG HUNT'
      : profile.combatMode === 'web_clash'
      ? 'WEB PIXEL CLASH'
      : profile.combatMode === 'custom'
      ? 'CUSTOM ARENA'
      : '1V1 QUICK BLITZ';

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 15px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(`${langLabel}   •   ${modeLabel}`, cx, 701);
}

function drawBackPlate(canvas: HTMLCanvasElement, profile: DuelistTabletProfile) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const pal = AVATAR_3D_PALETTES[profile.avatarId] || AVATAR_3D_PALETTES.walker;
  const W = canvas.width;
  const H = canvas.height;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0D131F');
  bg.addColorStop(0.5, '#070A12');
  bg.addColorStop(1, '#111827');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = `${pal.hexPrimary}44`;
  ctx.lineWidth = 2;
  roundRectPath(ctx, 24, 24, W - 48, H - 48, 22);
  ctx.stroke();

  // Circuit Spine Line down the back
  ctx.strokeStyle = pal.hexPrimary;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W / 2, 70);
  ctx.lineTo(W / 2, H - 70);
  ctx.stroke();

  // Emblem Box
  roundRectPath(ctx, W / 2 - 90, H / 2 - 90, 180, 180, 28);
  ctx.fillStyle = '#060910';
  ctx.fill();
  ctx.strokeStyle = pal.hexAccent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 72px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KΛ', W / 2, H / 2);

  ctx.fillStyle = pal.hexAccent;
  ctx.font = '700 14px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('KOLLABRIX ARENA HARDWARE', W / 2, 110);
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`SERIAL // S01-${(profile.playerName || 'USER').slice(0, 10).toUpperCase()}`, W / 2, H - 96);
}

/**
 * Builds the interactive 3D Floating Holographic Duelist Profile Tablet ("KΛ Cyber-Slate"):
 * - Chamfered Carbon-Titanium Chassis with glowing neon armor trim
 * - Crisp live high-DPI Front Screen displaying live ELO, Callsign, Tier, Wins, Streak & Weapon Loadout
 * - Engraved Titanium Backplate with glowing KΛ hardware spine (looks sleek from all 360° drag angles)
 * - Orbiting tilted wireframe halo ring & twin floating holo-crystals
 */
export function buildCyberDuelist3D(
  avatarId: string,
  opts?: Partial<DuelistTabletProfile>
): Built3DDuelist {
  let currentProfile: DuelistTabletProfile = {
    avatarId,
    playerName: opts?.playerName || 'Builder',
    playerCollege: opts?.playerCollege || 'KOLLABRIX',
    tier: opts?.tier || 'SILVER I',
    elo: opts?.elo ?? 1200,
    wins: opts?.wins ?? 0,
    losses: opts?.losses ?? 0,
    winStreak: opts?.winStreak ?? 0,
    algoLanguage: opts?.algoLanguage || 'python',
    combatMode: opts?.combatMode || 'blitz',
  };

  let pal = AVATAR_3D_PALETTES[currentProfile.avatarId] || AVATAR_3D_PALETTES.walker;

  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const tg = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const tm = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const tablet = new THREE.Group();
  tablet.position.set(0, 1.18, 0);
  root.add(tablet);

  // 1. Beveled Titanium-Obsidian Tablet Chassis (1.22 x 1.72)
  const chassisShape = createRoundedRectShape(1.22, 1.72, 0.085);
  const chassisGeo = tg(
    new THREE.ExtrudeGeometry(chassisShape, {
      depth: 0.048,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.016,
      bevelSegments: 4,
    })
  );
  chassisGeo.center();

  const chassisMat = tm(
    new THREE.MeshStandardMaterial({
      color: pal.armorMain,
      metalness: 0.85,
      roughness: 0.24,
    })
  );
  const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
  tablet.add(chassisMesh);

  // Side Glowing Neon Trim Rails
  const railMat = tm(new THREE.MeshBasicMaterial({ color: pal.visorGlow }));
  [-0.63, 0.63].forEach((rx) => {
    const rail = new THREE.Mesh(tg(new THREE.BoxGeometry(0.018, 1.32, 0.024)), railMat);
    rail.position.set(rx, 0, 0);
    tablet.add(rail);
  });

  // 4 Corner Armor Anchor Brackets
  const bracketMat = tm(
    new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      metalness: 0.9,
      roughness: 0.2,
    })
  );
  [
    [-0.58, 0.82],
    [0.58, 0.82],
    [-0.58, -0.82],
    [0.58, -0.82],
  ].forEach(([bx, by]) => {
    const bracket = new THREE.Mesh(tg(new THREE.BoxGeometry(0.14, 0.14, 0.092)), bracketMat);
    bracket.position.set(bx, by, 0);
    tablet.add(bracket);
  });

  // 2. Live High-DPI Front Profile Screen CanvasTexture
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 512;
  frontCanvas.height = 768;
  drawFrontScreen(frontCanvas, currentProfile);
  const frontTex = new THREE.CanvasTexture(frontCanvas);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  frontTex.anisotropy = 4;
  textures.push(frontTex);

  const frontScreenMat = tm(
    new THREE.MeshBasicMaterial({
      map: frontTex,
    })
  );
  const frontScreen = new THREE.Mesh(tg(new THREE.PlaneGeometry(1.12, 1.62)), frontScreenMat);
  frontScreen.position.z = 0.044;
  tablet.add(frontScreen);

  // Subtle Glossy Glass Reflection Overlay on Front Screen
  const glassSheenMat = tm(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
    })
  );
  const glassSheen = new THREE.Mesh(tg(new THREE.PlaneGeometry(1.12, 1.62)), glassSheenMat);
  glassSheen.position.z = 0.046;
  tablet.add(glassSheen);

  // 3. Engraved Titanium Backplate (360° Drag View)
  const backCanvas = document.createElement('canvas');
  backCanvas.width = 512;
  backCanvas.height = 768;
  drawBackPlate(backCanvas, currentProfile);
  const backTex = new THREE.CanvasTexture(backCanvas);
  backTex.colorSpace = THREE.SRGBColorSpace;
  textures.push(backTex);

  const backPlateMat = tm(new THREE.MeshBasicMaterial({ map: backTex }));
  const backPlate = new THREE.Mesh(tg(new THREE.PlaneGeometry(1.12, 1.62)), backPlateMat);
  backPlate.position.z = -0.044;
  backPlate.rotation.y = Math.PI;
  tablet.add(backPlate);

  // 4. Orbiting Holographic Halo & Twin Wireframe Code Crystals
  const orbitHaloMat = tm(
    new THREE.MeshBasicMaterial({
      color: pal.accentTrim,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
  );
  const orbitHalo = new THREE.Mesh(tg(new THREE.TorusGeometry(1.12, 0.01, 6, 64)), orbitHaloMat);
  orbitHalo.rotation.set(1.18, 0.28, 0);
  tablet.add(orbitHalo);

  const crystalMat = tm(
    new THREE.MeshBasicMaterial({
      color: pal.visorGlow,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    })
  );
  const crystalGeo = tg(new THREE.OctahedronGeometry(0.11, 0));
  const crystalTopRight = new THREE.Mesh(crystalGeo, crystalMat);
  crystalTopRight.position.set(0.84, 0.62, 0.14);
  tablet.add(crystalTopRight);

  const crystalBottomLeft = new THREE.Mesh(crystalGeo, crystalMat);
  crystalBottomLeft.position.set(-0.84, -0.58, 0.12);
  tablet.add(crystalBottomLeft);

  return {
    root,
    updateProfile: (next) => {
      currentProfile = { ...currentProfile, ...next };
      pal = AVATAR_3D_PALETTES[currentProfile.avatarId] || AVATAR_3D_PALETTES.walker;
      chassisMat.color.setHex(pal.armorMain);
      railMat.color.setHex(pal.visorGlow);
      orbitHaloMat.color.setHex(pal.accentTrim);
      crystalMat.color.setHex(pal.visorGlow);
      drawFrontScreen(frontCanvas, currentProfile);
      frontTex.needsUpdate = true;
      drawBackPlate(backCanvas, currentProfile);
      backTex.needsUpdate = true;
    },
    update: (t: number) => {
      // Smooth zero-gravity levitation & subtle combat pitch
      tablet.position.y = 1.18 + Math.sin(t * 1.9) * 0.055;
      tablet.rotation.x = -0.05 + Math.sin(t * 1.3) * 0.025;
      tablet.rotation.z = Math.cos(t * 1.1) * 0.02;

      orbitHalo.rotation.z = t * 0.45;
      crystalTopRight.rotation.y = t * 1.4;
      crystalTopRight.position.y = 0.62 + Math.sin(t * 2.4) * 0.05;
      crystalBottomLeft.rotation.y = -t * 1.4;
      crystalBottomLeft.position.y = -0.58 + Math.cos(t * 2.4) * 0.05;
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((tx) => tx.dispose());
    },
  };
}
