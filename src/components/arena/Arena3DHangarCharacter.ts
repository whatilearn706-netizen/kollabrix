import * as THREE from 'three';

export interface CharacterPalette {
  shirtColor: number;
  shortsColor: number;
  bagColor: number;
  shoeUpperColor: number;
  shoeSoleColor: number;
  hairColor: number;
  skinColor: number;
  blushColor: number;
  glassesColor: number;
}

export const AVATAR_3D_PALETTES: Record<string, CharacterPalette> = {
  // Default: Exact pin.it/31f49YKRp colorway (slate-teal shirt, caramel satchel, olive shorts, cream sneakers)
  walker: {
    shirtColor: 0x697c82,
    shortsColor: 0x766e5e,
    bagColor: 0xc46b2b,
    shoeUpperColor: 0xeee6d4,
    shoeSoleColor: 0xdcd0b6,
    hairColor: 0x663f24,
    skinColor: 0xf2be9e,
    blushColor: 0xe5947a,
    glassesColor: 0x1b1c20,
  },
  // Compiler Knight: Cobalt shirt, sky-cyan bag, navy shorts
  ronin: {
    shirtColor: 0x355787,
    shortsColor: 0x263244,
    bagColor: 0x38bdf8,
    shoeUpperColor: 0xe2e8f0,
    shoeSoleColor: 0x94a3b8,
    hairColor: 0x27272a,
    skinColor: 0xf2be9e,
    blushColor: 0xe5947a,
    glassesColor: 0x18181b,
  },
  // Kernel Phantom: Crimson tee, amber satchel, charcoal shorts
  sentinel: {
    shirtColor: 0x7c2d3e,
    shortsColor: 0x2d292a,
    bagColor: 0xd97706,
    shoeUpperColor: 0xf5ebe0,
    shoeSoleColor: 0xc9b9a6,
    hairColor: 0x3f2316,
    skinColor: 0xf0ba9a,
    blushColor: 0xe08d75,
    glassesColor: 0x18181b,
  },
  // Syntax Prodigy: Jade-forest tee, caramel bag, stone shorts
  coder: {
    shirtColor: 0x2e5e50,
    shortsColor: 0x52524c,
    bagColor: 0xc97b36,
    shoeUpperColor: 0xecf3ec,
    shoeSoleColor: 0xcbd5c8,
    hairColor: 0x4b2e1b,
    skinColor: 0xf3c2a4,
    blushColor: 0xe5947a,
    glassesColor: 0x18181b,
  },
  // Glitch Viper: Obsidian-violet tee, warm gold satchel, slate shorts
  glitch: {
    shirtColor: 0x4b3869,
    shortsColor: 0x242030,
    bagColor: 0xd99b26,
    shoeUpperColor: 0xf1eef7,
    shoeSoleColor: 0xc9c2d6,
    hairColor: 0x1e1b24,
    skinColor: 0xf1bfa0,
    blushColor: 0xe5947a,
    glassesColor: 0x141418,
  },
};

export interface Built3DDuelist {
  root: THREE.Group;
  update: (t: number) => void;
  dispose: () => void;
}

function createRoundedBoxGeometry(w: number, h: number, d: number, r = 0.03): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - r * 2,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: r,
    bevelThickness: r,
  });
  geo.center();
  return geo;
}

/**
 * Builds the smooth sculpted vinyl-toy 3D Boy Character inspired by https://pin.it/31f49YKRp:
 * Smooth Lathe crewneck t-shirt (no sharp cylinder ledges), flush swept chestnut hair cap + bangs,
 * clear round glasses with glossy catchlit eyes, continuous diagonal crossbody satchel,
 * left wristwatch, cuffed shorts, and chunky cream low-top sneakers.
 */
export function buildCyberDuelist3D(avatarId: string): Built3DDuelist {
  const pal = AVATAR_3D_PALETTES[avatarId] || AVATAR_3D_PALETTES.walker;
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

  const skinMat = tm(new THREE.MeshStandardMaterial({ color: pal.skinColor, roughness: 0.72, metalness: 0.02 }));
  const blushMat = tm(new THREE.MeshStandardMaterial({ color: pal.blushColor, roughness: 0.78 }));
  const hairMat = tm(new THREE.MeshStandardMaterial({ color: pal.hairColor, roughness: 0.84, metalness: 0.03 }));
  const shirtMat = tm(new THREE.MeshStandardMaterial({ color: pal.shirtColor, roughness: 0.84, metalness: 0.02 }));
  const shortsMat = tm(new THREE.MeshStandardMaterial({ color: pal.shortsColor, roughness: 0.86, metalness: 0.02 }));
  const bagMat = tm(new THREE.MeshStandardMaterial({ color: pal.bagColor, roughness: 0.45, metalness: 0.06 }));
  const shoeUpperMat = tm(new THREE.MeshStandardMaterial({ color: pal.shoeUpperColor, roughness: 0.78, metalness: 0.02 }));
  const shoeSoleMat = tm(new THREE.MeshStandardMaterial({ color: pal.shoeSoleColor, roughness: 0.88, metalness: 0.02 }));
  const darkAccessoryMat = tm(
    new THREE.MeshPhysicalMaterial({ color: pal.glassesColor, roughness: 0.28, metalness: 0.2, clearcoat: 0.3 })
  );
  const eyeGlossMat = tm(
    new THREE.MeshPhysicalMaterial({ color: 0x100f12, roughness: 0.05, metalness: 0.05, clearcoat: 1.0 })
  );
  const catchlightMat = tm(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const lensGlassMat = tm(
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.05, clearcoat: 1.0 })
  );

  const boy = new THREE.Group();
  root.add(boy);

  // =========================================================================
  // 1. LEGS, CHUNKY SNEAKERS & CUFFED SHORTS (y = 0.00 -> 0.62)
  // =========================================================================
  const pelvis = new THREE.Mesh(tg(new THREE.SphereGeometry(0.325, 28, 20)), shortsMat);
  pelvis.position.set(0, 0.54, 0);
  pelvis.scale.set(1.06, 0.62, 0.86);
  boy.add(pelvis);

  [-1, 1].forEach((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.165, 0, 0);
    leg.rotation.y = side * 0.07;
    boy.add(leg);

    const shortLeg = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.145, 0.162, 0.24, 26)), shortsMat);
    shortLeg.position.set(0, 0.44, 0);
    leg.add(shortLeg);

    const shortsCuff = new THREE.Mesh(tg(new THREE.TorusGeometry(0.156, 0.026, 12, 28)), shortsMat);
    shortsCuff.rotation.x = Math.PI / 2;
    shortsCuff.position.set(0, 0.32, 0);
    leg.add(shortsCuff);

    const calf = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.082, 0.078, 0.22, 22)), skinMat);
    calf.position.set(0, 0.22, 0);
    leg.add(calf);

    const shoe = new THREE.Group();
    shoe.position.set(0, 0, 0.05);
    leg.add(shoe);

    const soleRear = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.118, 0.124, 0.055, 24)), shoeSoleMat);
    soleRear.position.set(0, 0.028, -0.02);
    soleRear.scale.set(0.95, 1, 1.35);
    shoe.add(soleRear);

    const soleFront = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.124, 0.128, 0.055, 24)), shoeSoleMat);
    soleFront.position.set(0, 0.028, 0.1);
    soleFront.scale.set(1.02, 1, 1.05);
    shoe.add(soleFront);

    const upperRear = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.102, 0.115, 0.11, 24)), shoeUpperMat);
    upperRear.position.set(0, 0.095, -0.025);
    upperRear.scale.set(0.95, 1, 1.3);
    shoe.add(upperRear);

    const toeBox = new THREE.Mesh(tg(new THREE.SphereGeometry(0.12, 24, 18)), shoeUpperMat);
    toeBox.position.set(0, 0.082, 0.1);
    toeBox.scale.set(1.0, 0.68, 1.12);
    shoe.add(toeBox);

    const tongue = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.052, 0.05, 6, 12)), shoeUpperMat);
    tongue.position.set(0, 0.142, 0.02);
    tongue.rotation.x = -0.35;
    shoe.add(tongue);

    [0.045, 0.085, 0.125].forEach((lz, lIdx) => {
      const lace = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.01, 0.072, 4, 8)), shoeSoleMat);
      lace.rotation.z = Math.PI / 2;
      lace.position.set(0, 0.13 - lIdx * 0.012, lz);
      shoe.add(lace);
    });
  });

  // =========================================================================
  // 2. SMOOTH LATHE CREWNECK T-SHIRT, ARMS, WATCH & CROSSBODY SATCHEL
  // =========================================================================
  const upperGroup = new THREE.Group();
  upperGroup.position.set(0, 0.85, 0);
  boy.add(upperGroup);

  // Smooth rounded shoulder-to-hem torso profile (zero cylinder ledge seam)
  const shirtProfile = [
    new THREE.Vector2(0.0, -0.29),
    new THREE.Vector2(0.32, -0.29),
    new THREE.Vector2(0.34, -0.24),
    new THREE.Vector2(0.325, -0.02),
    new THREE.Vector2(0.315, 0.15),
    new THREE.Vector2(0.275, 0.255),
    new THREE.Vector2(0.19, 0.305),
    new THREE.Vector2(0.13, 0.315),
    new THREE.Vector2(0.0, 0.315),
  ];
  const torsoShirt = new THREE.Mesh(tg(new THREE.LatheGeometry(shirtProfile, 36)), shirtMat);
  torsoShirt.scale.set(1.06, 1.0, 0.88);
  upperGroup.add(torsoShirt);

  const collar = new THREE.Mesh(tg(new THREE.TorusGeometry(0.142, 0.026, 12, 28)), shirtMat);
  collar.rotation.x = Math.PI / 2 + 0.08;
  collar.position.set(0, 0.31, 0.015);
  upperGroup.add(collar);

  const neck = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.104, 0.12, 0.16, 22)), skinMat);
  neck.position.set(0, 0.36, 0.01);
  upperGroup.add(neck);

  // Continuous crossbody leather strap riding cleanly outside the shirt chest & over left shoulder (-x)
  const strapCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-0.185, 0.318, -0.02),
      new THREE.Vector3(-0.14, 0.285, 0.21),
      new THREE.Vector3(0.02, 0.12, 0.315),
      new THREE.Vector3(0.22, -0.08, 0.295),
      new THREE.Vector3(0.345, -0.23, 0.11),
      new THREE.Vector3(0.34, -0.23, -0.14),
      new THREE.Vector3(0.12, -0.02, -0.305),
      new THREE.Vector3(-0.13, 0.24, -0.22),
      new THREE.Vector3(-0.185, 0.318, -0.02),
    ],
    true
  );
  const strapMesh = new THREE.Mesh(tg(new THREE.TubeGeometry(strapCurve, 72, 0.022, 10, true)), bagMat);
  upperGroup.add(strapMesh);

  // Plump rounded-corner crossbody leather satchel resting cleanly at viewer's right hip
  const bagPouch = new THREE.Group();
  bagPouch.position.set(0.345, -0.255, 0.05);
  bagPouch.rotation.set(0.06, 0.28, -0.1);
  upperGroup.add(bagPouch);

  const pouchBody = new THREE.Mesh(tg(createRoundedBoxGeometry(0.22, 0.21, 0.115, 0.032)), bagMat);
  bagPouch.add(pouchBody);

  const pouchFlap = new THREE.Mesh(tg(createRoundedBoxGeometry(0.226, 0.13, 0.126, 0.028)), bagMat);
  pouchFlap.position.set(0, 0.044, 0.005);
  bagPouch.add(pouchFlap);

  const pouchClasp = new THREE.Mesh(
    tg(new THREE.CylinderGeometry(0.018, 0.018, 0.024, 14)),
    darkAccessoryMat
  );
  pouchClasp.rotation.x = Math.PI / 2;
  pouchClasp.position.set(0, -0.018, 0.066);
  bagPouch.add(pouchClasp);

  // Short Chubby Arms + Smooth Dropped Sleeve Shoulders + Left Wristwatch
  const armPivots: THREE.Group[] = [];
  [-1, 1].forEach((side) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.295, 0.22, 0);
    armPivot.rotation.z = side * 0.17;
    upperGroup.add(armPivot);
    armPivots.push(armPivot);

    // Smooth dome sleeve cap blending seamlessly into shoulder + sleeve body
    const sleeveShoulder = new THREE.Mesh(tg(new THREE.SphereGeometry(0.114, 22, 16)), shirtMat);
    sleeveShoulder.position.set(side * 0.015, -0.01, 0);
    armPivot.add(sleeveShoulder);

    const sleeve = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.11, 0.132, 0.19, 24)), shirtMat);
    sleeve.position.set(side * 0.024, -0.095, 0);
    armPivot.add(sleeve);

    const forearm = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.072, 0.066, 0.26, 20)), skinMat);
    forearm.position.set(side * 0.03, -0.27, 0.02);
    armPivot.add(forearm);

    const hand = new THREE.Mesh(tg(new THREE.SphereGeometry(0.072, 18, 16)), skinMat);
    hand.position.set(side * 0.026, -0.42, 0.03);
    hand.scale.set(0.9, 1.15, 0.95);
    armPivot.add(hand);

    const thumb = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.022, 0.042, 4, 8)), skinMat);
    thumb.position.set(side * -0.032, -0.39, 0.07);
    thumb.rotation.z = side * 0.35;
    armPivot.add(thumb);

    if (side === 1) {
      const band = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.075, 0.075, 0.038, 22)), darkAccessoryMat);
      band.position.set(side * 0.028, -0.34, 0.025);
      armPivot.add(band);

      const watchFace = new THREE.Mesh(tg(createRoundedBoxGeometry(0.045, 0.052, 0.062, 0.01)), darkAccessoryMat);
      watchFace.position.set(side * 0.098, -0.34, 0.035);
      armPivot.add(watchFace);
    }
  });

  // =========================================================================
  // 3. LARGE VINYL-TOY HEAD, ROUND GLASSES & FLUSH SWEPT HAIR (y = 1.24 -> 2.02)
  // =========================================================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.56, 0.02);
  boy.add(headGroup);

  const head = new THREE.Mesh(tg(new THREE.SphereGeometry(0.41, 36, 30)), skinMat);
  head.scale.set(1.07, 0.96, 1.0);
  headGroup.add(head);

  [-1, 1].forEach((side) => {
    const blush = new THREE.Mesh(tg(new THREE.SphereGeometry(0.074, 16, 12)), blushMat);
    blush.position.set(side * 0.215, -0.105, 0.335);
    blush.scale.set(1.2, 0.72, 0.35);
    headGroup.add(blush);

    const ear = new THREE.Mesh(tg(new THREE.SphereGeometry(0.086, 18, 16)), skinMat);
    ear.position.set(side * 0.42, -0.015, -0.02);
    ear.scale.set(0.62, 1.05, 0.85);
    headGroup.add(ear);
  });

  // Eyes, Round Wire Glasses & Clean Eyebrows below hairline
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(tg(new THREE.SphereGeometry(0.035, 18, 16)), eyeGlossMat);
    eye.position.set(side * 0.138, 0.005, 0.394);
    eye.scale.set(0.95, 1.1, 0.65);
    headGroup.add(eye);

    const glint = new THREE.Mesh(tg(new THREE.SphereGeometry(0.011, 10, 10)), catchlightMat);
    glint.position.set(side * 0.138 + 0.013, 0.018, 0.415);
    headGroup.add(glint);

    const ring = new THREE.Mesh(tg(new THREE.TorusGeometry(0.118, 0.011, 12, 36)), darkAccessoryMat);
    ring.position.set(side * 0.14, 0.005, 0.415);
    headGroup.add(ring);

    const lens = new THREE.Mesh(tg(new THREE.CircleGeometry(0.114, 28)), lensGlassMat);
    lens.position.set(side * 0.14, 0.005, 0.413);
    headGroup.add(lens);

    const templeArm = new THREE.Mesh(tg(new THREE.BoxGeometry(0.012, 0.012, 0.38)), darkAccessoryMat);
    templeArm.position.set(side * 0.275, 0.01, 0.23);
    templeArm.rotation.y = side * -0.38;
    headGroup.add(templeArm);

    const brow = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.02, 0.072, 6, 10)), hairMat);
    brow.rotation.z = Math.PI / 2 + side * -0.06;
    brow.position.set(side * 0.135, 0.155, 0.372);
    headGroup.add(brow);
  });

  const bridge = new THREE.Mesh(tg(new THREE.BoxGeometry(0.05, 0.014, 0.014)), darkAccessoryMat);
  bridge.position.set(0, 0.015, 0.418);
  headGroup.add(bridge);

  const nose = new THREE.Mesh(tg(new THREE.SphereGeometry(0.043, 16, 14)), blushMat);
  nose.position.set(0, -0.068, 0.416);
  nose.scale.set(1.05, 0.9, 0.9);
  headGroup.add(nose);

  const mouth = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.008, 0.048, 4, 8)), hairMat);
  mouth.rotation.z = Math.PI / 2;
  mouth.position.set(0, -0.172, 0.394);
  headGroup.add(mouth);

  // Flush Sculpted Chestnut Hair Cap + Smooth Side-Swept Bangs (no spikes!)
  const hairGroup = new THREE.Group();
  headGroup.add(hairGroup);

  const hairCrown = new THREE.Mesh(
    tg(new THREE.SphereGeometry(0.428, 36, 26, 0, Math.PI * 2, 0, Math.PI * 0.54)),
    hairMat
  );
  hairCrown.position.set(0, 0.052, -0.03);
  hairCrown.rotation.x = -0.34;
  hairCrown.scale.set(1.06, 0.96, 1.03);
  hairGroup.add(hairCrown);

  const hairBack = new THREE.Mesh(tg(new THREE.SphereGeometry(0.418, 28, 20)), hairMat);
  hairBack.position.set(0, 0.02, -0.065);
  hairBack.scale.set(1.04, 0.91, 0.95);
  hairGroup.add(hairBack);

  [-1, 1].forEach((side) => {
    const sideburn = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.048, 0.11, 6, 10)), hairMat);
    sideburn.position.set(side * 0.388, 0.08, 0.06);
    sideburn.scale.set(0.75, 1, 0.9);
    hairGroup.add(sideburn);
  });

  // Smoothly hugged forehead fringe swept gently across upper brow without protruding upward
  const frontFringeBar = new THREE.Mesh(
    tg(new THREE.SphereGeometry(0.395, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.34)),
    hairMat
  );
  frontFringeBar.position.set(0.02, 0.075, 0.045);
  frontFringeBar.rotation.set(0.28, 0, -0.08);
  frontFringeBar.scale.set(1.04, 0.88, 1.0);
  hairGroup.add(frontFringeBar);

  // Subtle tapered swept locks flattened smoothly onto forehead browline
  [
    { x: -0.14, y: 0.255, z: 0.305, rz: 1.05, rx: 0.55 },
    { x: 0.0, y: 0.262, z: 0.32, rz: 1.25, rx: 0.58 },
    { x: 0.14, y: 0.25, z: 0.3, rz: 1.4, rx: 0.52 },
  ].forEach((b) => {
    const lock = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.042, 0.11, 6, 10)), hairMat);
    lock.position.set(b.x, b.y, b.z);
    lock.rotation.set(b.rx, 0, b.rz);
    lock.scale.set(0.9, 1.0, 0.55);
    hairGroup.add(lock);
  });

  const update = (t: number) => {
    upperGroup.position.y = 0.85 + Math.sin(t * 2.0) * 0.012;
    headGroup.position.y = 1.56 + Math.sin(t * 2.0 - 0.3) * 0.014;
    headGroup.rotation.z = Math.sin(t * 1.1) * 0.025;
    headGroup.rotation.y = Math.sin(t * 0.7) * 0.045;
    bagPouch.rotation.z = -0.1 + Math.sin(t * 2.0 + 0.5) * 0.025;
    if (armPivots[0]) armPivots[0].rotation.z = -0.17 + Math.sin(t * 1.6) * 0.02;
    if (armPivots[1]) armPivots[1].rotation.z = 0.17 - Math.sin(t * 1.6) * 0.02;
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  };

  return { root, update, dispose };
}
