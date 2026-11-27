import * as THREE from 'three';

export interface CharacterPalette {
  armorMain: number;
  armorDark: number;
  visorGlow: number;
  accentTrim: number;
  wingGlow: number;
  suitUnder: number;
}

export const AVATAR_3D_PALETTES: Record<string, CharacterPalette> = {
  // Cyber Architect: Matte Graphite Armor + Ice-Cyan Neon Visor & Wings
  walker: {
    armorMain: 0x1e293b,
    armorDark: 0x0b101b,
    visorGlow: 0x38bdf8,
    accentTrim: 0x67e8f9,
    wingGlow: 0x0ea5e9,
    suitUnder: 0x111827,
  },
  // Compiler Knight: Cobalt Tactical Plate + Electric Sky Visor
  ronin: {
    armorMain: 0x1d3b72,
    armorDark: 0x091326,
    visorGlow: 0x60a5fa,
    accentTrim: 0x93c5fd,
    wingGlow: 0x3b82f6,
    suitUnder: 0x0f172a,
  },
  // Kernel Phantom: Crimson Spec-Ops + Molten Gold/Red Visor
  sentinel: {
    armorMain: 0x5f1322,
    armorDark: 0x14070b,
    visorGlow: 0xf43f5e,
    accentTrim: 0xfbbf24,
    wingGlow: 0xe11d48,
    suitUnder: 0x180b10,
  },
  // Syntax Prodigy: Dark Jade Stealth + Neon Emerald Core
  coder: {
    armorMain: 0x114b3f,
    armorDark: 0x061915,
    visorGlow: 0x34d399,
    accentTrim: 0x6ee7b7,
    wingGlow: 0x10b981,
    suitUnder: 0x0a1916,
  },
  // Glitch Viper: Obsidian-Violet Apex + Hyper Gold Visor
  glitch: {
    armorMain: 0x3b1e6d,
    armorDark: 0x120822,
    visorGlow: 0xfacc15,
    accentTrim: 0xc084fc,
    wingGlow: 0xa855f7,
    suitUnder: 0x150d24,
  },
};

export interface Built3DDuelist {
  root: THREE.Group;
  update: (t: number) => void;
  dispose: () => void;
}

/**
 * Builds an elite stylized 3D Tactical Cyber-Duelist / Esports Armored Operator:
 * - Angular stealth helmet with glowing curved tactical visor & comm-fins
 * - V-tapered carbon-fiber chest armor with glowing KΛ reactor core
 * - Twin rear holographic energy wing blades (intensity scales with Rank/Streak)
 * - Floating holographic code-cube drone orbiting the right shoulder
 * - Athletic combat stance with greaves, gauntlets, and armored boots
 */
export function buildCyberDuelist3D(
  avatarId: string,
  opts?: { elo?: number; wins?: number; streak?: number }
): Built3DDuelist {
  const pal = AVATAR_3D_PALETTES[avatarId] || AVATAR_3D_PALETTES.walker;
  const elo = opts?.elo ?? 1200;
  const wins = opts?.wins ?? 0;
  const streak = opts?.streak ?? 0;

  const rankColor =
    elo >= 1800 ? 0xc026d3 : elo >= 1300 ? 0xf59e0b : pal.wingGlow;
  const wingScale = 1 + Math.min(0.45, wins * 0.04 + streak * 0.06);

  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const tg = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const tm = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const armorMat = tm(
    new THREE.MeshStandardMaterial({
      color: pal.armorMain,
      roughness: 0.34,
      metalness: 0.72,
    })
  );
  const darkPlateMat = tm(
    new THREE.MeshStandardMaterial({
      color: pal.armorDark,
      roughness: 0.48,
      metalness: 0.62,
    })
  );
  const underSuitMat = tm(
    new THREE.MeshStandardMaterial({
      color: pal.suitUnder,
      roughness: 0.78,
      metalness: 0.18,
    })
  );
  const visorMat = tm(
    new THREE.MeshBasicMaterial({
      color: pal.visorGlow,
    })
  );
  const trimMat = tm(
    new THREE.MeshBasicMaterial({
      color: pal.accentTrim,
    })
  );
  const wingMat = tm(
    new THREE.MeshBasicMaterial({
      color: rankColor,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  const wingWireMat = tm(
    new THREE.MeshBasicMaterial({
      color: pal.accentTrim,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    })
  );

  const duelist = new THREE.Group();
  root.add(duelist);

  // =========================================================================
  // 1. ATHLETIC COMBAT BOOTS, GREAVES & KNEE PLATES (y = 0.0 -> 0.88)
  // =========================================================================
  [-1, 1].forEach((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.17, 0, 0);
    leg.rotation.y = side * 0.1;
    leg.rotation.z = side * -0.04;
    duelist.add(leg);

    const bootSole = new THREE.Mesh(tg(new THREE.BoxGeometry(0.145, 0.05, 0.3)), darkPlateMat);
    bootSole.position.set(0, 0.025, 0.04);
    leg.add(bootSole);

    const bootUpper = new THREE.Mesh(tg(new THREE.BoxGeometry(0.13, 0.14, 0.25)), armorMat);
    bootUpper.position.set(0, 0.11, 0.03);
    leg.add(bootUpper);

    const bootTrim = new THREE.Mesh(tg(new THREE.BoxGeometry(0.136, 0.018, 0.255)), trimMat);
    bootTrim.position.set(0, 0.06, 0.03);
    leg.add(bootTrim);

    const shin = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.075, 0.064, 0.36, 8)), armorMat);
    shin.position.set(0, 0.34, 0);
    leg.add(shin);

    const knee = new THREE.Mesh(tg(new THREE.OctahedronGeometry(0.078, 0)), darkPlateMat);
    knee.position.set(0, 0.52, 0.045);
    knee.scale.set(0.9, 1.15, 0.65);
    leg.add(knee);

    const thigh = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.095, 0.078, 0.36, 8)), underSuitMat);
    thigh.position.set(0, 0.71, 0);
    leg.add(thigh);

    const thighPlate = new THREE.Mesh(tg(new THREE.BoxGeometry(0.11, 0.24, 0.14)), armorMat);
    thighPlate.position.set(side * 0.025, 0.72, 0.01);
    leg.add(thighPlate);
  });

  // =========================================================================
  // 2. TACTICAL BELT & V-TAPERED TORSO ARMOR (y = 0.88 -> 1.48)
  // =========================================================================
  const upperBody = new THREE.Group();
  upperBody.position.set(0, 0.9, 0);
  duelist.add(upperBody);

  const belt = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.19, 0.18, 0.11, 10)), darkPlateMat);
  belt.position.set(0, 0.02, 0);
  belt.scale.set(1.15, 1, 0.75);
  upperBody.add(belt);

  const beltBuckle = new THREE.Mesh(tg(new THREE.BoxGeometry(0.1, 0.06, 0.04)), visorMat);
  beltBuckle.position.set(0, 0.02, 0.14);
  upperBody.add(beltBuckle);

  const abdomen = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.21, 0.165, 0.24, 10)), underSuitMat);
  abdomen.position.set(0, 0.18, 0);
  abdomen.scale.set(1.15, 1, 0.75);
  upperBody.add(abdomen);

  const chest = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.275, 0.205, 0.32, 10)), armorMat);
  chest.position.set(0, 0.42, 0);
  chest.scale.set(1.16, 1, 0.78);
  upperBody.add(chest);

  const frontRig = new THREE.Mesh(tg(new THREE.BoxGeometry(0.32, 0.22, 0.08)), darkPlateMat);
  frontRig.position.set(0, 0.43, 0.155);
  upperBody.add(frontRig);

  const reactorCore = new THREE.Mesh(tg(new THREE.OctahedronGeometry(0.058, 0)), visorMat);
  reactorCore.position.set(0, 0.44, 0.2);
  reactorCore.scale.set(1.0, 1.3, 0.4);
  upperBody.add(reactorCore);

  [-1, 1].forEach((side) => {
    const chevron = new THREE.Mesh(tg(new THREE.BoxGeometry(0.16, 0.02, 0.02)), trimMat);
    chevron.position.set(side * 0.095, 0.47, 0.2);
    chevron.rotation.z = side * 0.42;
    upperBody.add(chevron);
  });

  const collar = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.13, 0.16, 0.12, 12)), darkPlateMat);
  collar.position.set(0, 0.59, -0.01);
  upperBody.add(collar);

  // =========================================================================
  // 3. TWIN REAR HOLOGRAPHIC ENERGY WINGS (Esports Aura)
  // =========================================================================
  const wingsGroup = new THREE.Group();
  wingsGroup.position.set(0, 0.46, -0.18);
  wingsGroup.scale.setScalar(wingScale);
  upperBody.add(wingsGroup);

  [-1, 1].forEach((side) => {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(side * 0.62, 0.34);
    wingShape.lineTo(side * 0.78, 0.16);
    wingShape.lineTo(side * 0.34, -0.26);
    wingShape.lineTo(0, -0.14);
    wingShape.closePath();

    const wingGeo = tg(new THREE.ShapeGeometry(wingShape));
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(side * 0.1, 0.06, -0.02);
    wingMesh.rotation.y = side * -0.22;
    wingsGroup.add(wingMesh);

    const wingFrame = new THREE.Mesh(wingGeo, wingWireMat);
    wingFrame.position.set(side * 0.1, 0.06, -0.025);
    wingFrame.rotation.y = side * -0.22;
    wingsGroup.add(wingFrame);
  });

  // =========================================================================
  // 4. PAULDRONS, ARTICULATED ARMS & HOLO-GAUNTLETS
  // =========================================================================
  const leftArm = new THREE.Group();
  const rightArm = new THREE.Group();
  [
    { arm: leftArm, side: -1 },
    { arm: rightArm, side: 1 },
  ].forEach(({ arm, side }) => {
    arm.position.set(side * 0.34, 0.51, 0);
    arm.rotation.z = side * 0.14;
    upperBody.add(arm);

    const pauldron = new THREE.Mesh(tg(new THREE.BoxGeometry(0.17, 0.14, 0.2)), armorMat);
    pauldron.position.set(side * 0.02, 0.03, 0);
    pauldron.rotation.z = side * -0.22;
    arm.add(pauldron);

    const pauldronTrim = new THREE.Mesh(tg(new THREE.BoxGeometry(0.175, 0.02, 0.205)), trimMat);
    pauldronTrim.position.set(side * 0.02, 0.075, 0);
    pauldronTrim.rotation.z = side * -0.22;
    arm.add(pauldronTrim);

    const upperArm = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.064, 0.056, 0.24, 8)), underSuitMat);
    upperArm.position.set(0, -0.12, 0);
    arm.add(upperArm);

    const gauntlet = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.066, 0.054, 0.24, 8)), darkPlateMat);
    gauntlet.position.set(0, -0.35, 0.02);
    gauntlet.rotation.x = -0.16;
    arm.add(gauntlet);

    const wristGlow = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.069, 0.069, 0.026, 8)), visorMat);
    wristGlow.position.set(0, -0.36, 0.02);
    wristGlow.rotation.x = -0.16;
    arm.add(wristGlow);

    const fist = new THREE.Mesh(tg(new THREE.BoxGeometry(0.085, 0.09, 0.095)), armorMat);
    fist.position.set(0, -0.49, 0.045);
    arm.add(fist);
  });

  // =========================================================================
  // 5. STEALTH CYBER-HELMET & GLOWING TACTICAL VISOR (y = 0.68 -> 1.02)
  // =========================================================================
  const head = new THREE.Group();
  head.position.set(0, 0.77, 0.01);
  upperBody.add(head);

  const cranium = new THREE.Mesh(tg(new THREE.SphereGeometry(0.175, 16, 14)), armorMat);
  cranium.scale.set(0.92, 1.08, 1.04);
  head.add(cranium);

  const jawMask = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.12, 0.095, 0.12, 8)), darkPlateMat);
  jawMask.position.set(0, -0.09, 0.045);
  jawMask.scale.set(1.0, 1, 1.15);
  head.add(jawMask);

  const visor = new THREE.Mesh(
    tg(new THREE.CylinderGeometry(0.168, 0.168, 0.072, 16, 1, false, -Math.PI * 0.34, Math.PI * 0.68)),
    visorMat
  );
  visor.position.set(0, 0.018, 0.028);
  head.add(visor);

  const crestFin = new THREE.Mesh(tg(new THREE.BoxGeometry(0.028, 0.085, 0.22)), trimMat);
  crestFin.position.set(0, 0.155, -0.01);
  crestFin.rotation.x = -0.18;
  head.add(crestFin);

  [-1, 1].forEach((side) => {
    const earFin = new THREE.Mesh(tg(new THREE.BoxGeometry(0.032, 0.14, 0.1)), darkPlateMat);
    earFin.position.set(side * 0.165, 0.02, -0.02);
    earFin.rotation.x = -0.25;
    head.add(earFin);

    const earGlow = new THREE.Mesh(tg(new THREE.BoxGeometry(0.036, 0.06, 0.025)), visorMat);
    earGlow.position.set(side * 0.167, 0.03, -0.02);
    head.add(earGlow);
  });

  // =========================================================================
  // 6. FLOATING HOLOGRAPHIC COMPANION DRONE (Right Shoulder Orbit)
  // =========================================================================
  const drone = new THREE.Group();
  drone.position.set(0.56, 0.78, 0.08);
  upperBody.add(drone);

  const droneCore = new THREE.Mesh(tg(new THREE.OctahedronGeometry(0.075, 0)), visorMat);
  drone.add(droneCore);

  const droneRing = new THREE.Mesh(tg(new THREE.TorusGeometry(0.11, 0.008, 8, 28)), trimMat);
  droneRing.rotation.x = Math.PI / 3;
  drone.add(droneRing);

  return {
    root,
    update: (t: number) => {
      const breath = Math.sin(t * 2.2) * 0.018;
      upperBody.position.y = 0.9 + breath;
      upperBody.rotation.y = Math.sin(t * 1.1) * 0.045;
      head.rotation.y = Math.sin(t * 0.9) * 0.06;
      head.rotation.x = Math.sin(t * 1.6) * 0.025;

      leftArm.rotation.x = Math.sin(t * 2.0) * 0.04;
      rightArm.rotation.x = -Math.sin(t * 2.0) * 0.04;

      wingMat.opacity = 0.36 + Math.sin(t * 3.0) * 0.12;

      drone.position.y = 0.78 + Math.sin(t * 2.6) * 0.06;
      drone.rotation.y = t * 1.8;
      droneRing.rotation.z = t * 2.4;
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
