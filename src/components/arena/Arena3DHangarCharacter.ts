import * as THREE from 'three';

export interface GankerPalette {
  armorMain: number;
  armorDark: number;
  jointGold: number;
  eyeColor: number;
  trimAccent: number;
}

export const AVATAR_3D_PALETTES: Record<string, GankerPalette> = {
  // Default: Exact satin gunmetal charcoal + brass gold shoulder rings from pin.it/4h4LPoMno
  walker: {
    armorMain: 0x3b4048,
    armorDark: 0x16191f,
    jointGold: 0xd4a84f,
    eyeColor: 0x050608,
    trimAccent: 0xe2e8f0,
  },
  ronin: {
    armorMain: 0x26354d,
    armorDark: 0x0e1420,
    jointGold: 0x38bdf8,
    eyeColor: 0x04070d,
    trimAccent: 0x7dd3fc,
  },
  sentinel: {
    armorMain: 0x43202a,
    armorDark: 0x140b0e,
    jointGold: 0xf59e0b,
    eyeColor: 0x090507,
    trimAccent: 0xfb7185,
  },
  coder: {
    armorMain: 0x243b35,
    armorDark: 0x0c1513,
    jointGold: 0x34d399,
    eyeColor: 0x040908,
    trimAccent: 0x6ee7b7,
  },
  glitch: {
    armorMain: 0x342847,
    armorDark: 0x110c1a,
    jointGold: 0xfbbf24,
    eyeColor: 0x07050c,
    trimAccent: 0xc084fc,
  },
};

export interface Built3DDuelist {
  root: THREE.Group;
  update: (t: number) => void;
  dispose: () => void;
}

function createDecalTexture(labelNum: string, subText: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = 'rgba(12, 14, 18, 0.85)';
    ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
    ctx.fillText(labelNum, 16, 62);
    ctx.font = 'bold 20px monospace';
    ctx.fillText(subText, 18, 92);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds a high-craft designer mech figurine inspired directly by https://pin.it/4h4LPoMno:
 * Smooth oversized domed head-and-torso shell, recessed glossy oval black eyes,
 * tapered rear aero-cowl with markings, brass-gold shoulder hubs,
 * chunky curved armored forearms ending in articulated 3-claw mech hands,
 * narrow segmented waist, and stocky armored legs with pointed toe caps.
 */
export function buildCyberDuelist3D(avatarId: string): Built3DDuelist {
  const pal = AVATAR_3D_PALETTES[avatarId] || AVATAR_3D_PALETTES.walker;
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

  // Satin Gunmetal Metallic Armor Shell
  const armorMat = tm(
    new THREE.MeshPhysicalMaterial({
      color: pal.armorMain,
      metalness: 0.78,
      roughness: 0.32,
      clearcoat: 0.25,
      clearcoatRoughness: 0.38,
    })
  );

  // Matte Dark Charcoal Joints, Fingers, Waist & Toe Caps
  const darkJointMat = tm(
    new THREE.MeshStandardMaterial({
      color: pal.armorDark,
      metalness: 0.55,
      roughness: 0.48,
    })
  );

  // Brushed Brass-Gold Shoulder Hub Rings
  const brassMat = tm(
    new THREE.MeshPhysicalMaterial({
      color: pal.jointGold,
      metalness: 0.92,
      roughness: 0.22,
      clearcoat: 0.4,
    })
  );

  // Glossy Black Recessed Oval Eyes
  const eyeMat = tm(
    new THREE.MeshPhysicalMaterial({
      color: pal.eyeColor,
      metalness: 0.2,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    })
  );

  // Subtle Markings Texture ("05 KBX")
  const decalTex = createDecalTexture('05', 'KBX');
  textures.push(decalTex);
  const decalMat = tm(
    new THREE.MeshBasicMaterial({
      map: decalTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    })
  );

  // Root mech scale positioned cleanly so feet rest at y = 0
  const mech = new THREE.Group();
  root.add(mech);

  // Upper Shell + Head Dome Group (animates gently on idle)
  const upperGroup = new THREE.Group();
  upperGroup.position.set(0, 1.15, 0);
  mech.add(upperGroup);

  // 1. Main Domed Head-and-Torso Shell
  const mainDome = new THREE.Mesh(tg(new THREE.SphereGeometry(0.54, 40, 32)), armorMat);
  mainDome.scale.set(1.04, 0.94, 1.08);
  upperGroup.add(mainDome);

  // Tapered Aero Rear Cowl (classic Ganker side silhouette)
  const rearCowl = new THREE.Mesh(tg(new THREE.SphereGeometry(0.42, 32, 24)), armorMat);
  rearCowl.position.set(0, 0.06, -0.34);
  rearCowl.scale.set(0.86, 0.72, 1.16);
  upperGroup.add(rearCowl);

  // Cheek / Jaw Seam Bevel Ring
  const jawBand = new THREE.Mesh(
    tg(new THREE.CylinderGeometry(0.51, 0.44, 0.16, 36)),
    armorMat
  );
  jawBand.position.set(0, -0.24, 0.02);
  jawBand.scale.set(1.02, 1, 1.04);
  upperGroup.add(jawBand);

  // Recessed Mouth Seam Bar
  const mouthSeam = new THREE.Mesh(tg(new THREE.BoxGeometry(0.26, 0.022, 0.08)), darkJointMat);
  mouthSeam.position.set(0, -0.18, 0.51);
  upperGroup.add(mouthSeam);

  // Left & Right Cheek Seam Grooves (tucked flush into dome contour)
  [-1, 1].forEach((side) => {
    const cheekGroove = new THREE.Mesh(tg(new THREE.BoxGeometry(0.014, 0.24, 0.06)), darkJointMat);
    cheekGroove.position.set(side * 0.34, 0.02, 0.37);
    cheekGroove.rotation.z = side * -0.18;
    cheekGroove.rotation.y = side * 0.42;
    upperGroup.add(cheekGroove);
  });

  // 2. Glossy Black Recessed Oval Eyes (signature toy-mech face!)
  [-1, 1].forEach((side) => {
    const eyeSocket = new THREE.Mesh(tg(new THREE.SphereGeometry(0.122, 24, 20)), darkJointMat);
    eyeSocket.position.set(side * 0.23, -0.06, 0.48);
    eyeSocket.scale.set(0.82, 1.15, 0.38);
    eyeSocket.rotation.y = side * 0.32;
    upperGroup.add(eyeSocket);

    const eyeLens = new THREE.Mesh(tg(new THREE.SphereGeometry(0.105, 24, 20)), eyeMat);
    eyeLens.position.set(side * 0.235, -0.06, 0.495);
    eyeLens.scale.set(0.76, 1.08, 0.36);
    eyeLens.rotation.y = side * 0.32;
    upperGroup.add(eyeLens);
  });

  // Rear Cowl "05 KBX" Badge tucked tightly along the back dome contour
  const sideDecal = new THREE.Mesh(tg(new THREE.PlaneGeometry(0.26, 0.13)), decalMat);
  sideDecal.position.set(0, 0.16, -0.68);
  sideDecal.rotation.y = Math.PI;
  sideDecal.rotation.x = -0.35;
  upperGroup.add(sideDecal);

  // 3. Brass-Gold Shoulder Hubs + Heavy Curved Armored Forearms + 3-Claw Mech Hands
  const armGroups: THREE.Group[] = [];
  [-1, 1].forEach((side) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.56, -0.1, 0.02);
    upperGroup.add(armPivot);
    armGroups.push(armPivot);

    // Protruding Brass-Gold Shoulder Hub Ring + Dark Pivot Core
    const brassRing = new THREE.Mesh(tg(new THREE.TorusGeometry(0.135, 0.044, 16, 32)), brassMat);
    brassRing.rotation.y = Math.PI / 2;
    armPivot.add(brassRing);

    const jointCore = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 20)), darkJointMat);
    jointCore.rotation.z = Math.PI / 2;
    armPivot.add(jointCore);

    // Upper Arm Armor Sleeve
    const upperArm = new THREE.Mesh(
      tg(new THREE.CylinderGeometry(0.135, 0.165, 0.28, 24)),
      armorMat
    );
    upperArm.position.set(side * 0.09, -0.17, 0.01);
    upperArm.rotation.z = side * 0.22;
    armPivot.add(upperArm);

    // Elbow Seam Band
    const elbowRing = new THREE.Mesh(
      tg(new THREE.CylinderGeometry(0.145, 0.145, 0.055, 22)),
      darkJointMat
    );
    elbowRing.position.set(side * 0.12, -0.3, 0.03);
    elbowRing.rotation.z = side * 0.14;
    armPivot.add(elbowRing);

    // Heavy Bulky Curved Forearm Gauntlet
    const forearm = new THREE.Mesh(
      tg(new THREE.CylinderGeometry(0.165, 0.195, 0.36, 26)),
      armorMat
    );
    forearm.position.set(side * 0.11, -0.49, 0.08);
    forearm.rotation.z = side * -0.08;
    forearm.rotation.x = -0.22;
    armPivot.add(forearm);

    const wristCuff = new THREE.Mesh(
      tg(new THREE.CylinderGeometry(0.15, 0.13, 0.06, 22)),
      darkJointMat
    );
    wristCuff.position.set(side * 0.095, -0.66, 0.12);
    wristCuff.rotation.x = -0.22;
    armPivot.add(wristCuff);

    // Chunky 3-Claw Mech Hand
    const clawGroup = new THREE.Group();
    clawGroup.position.set(side * 0.085, -0.73, 0.14);
    armPivot.add(clawGroup);

    const palm = new THREE.Mesh(tg(new THREE.SphereGeometry(0.11, 16, 14)), darkJointMat);
    palm.scale.set(0.95, 0.78, 1.05);
    clawGroup.add(palm);

    // 2 outer curved claw fingers + 1 inner thumb
    [-0.065, 0.055].forEach((fz) => {
      const fingerBase = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.036, 0.11, 6, 10)), darkJointMat);
      fingerBase.position.set(side * -0.02, -0.09, fz);
      fingerBase.rotation.z = side * -0.45;
      clawGroup.add(fingerBase);
    });
    const thumb = new THREE.Mesh(tg(new THREE.CapsuleGeometry(0.034, 0.09, 6, 10)), darkJointMat);
    thumb.position.set(side * -0.08, -0.07, 0.09);
    thumb.rotation.z = side * 0.4;
    clawGroup.add(thumb);
  });

  // 4. Narrow Segmented Mechanical Waist + Pelvis Core
  const waistGroup = new THREE.Group();
  waistGroup.position.set(0, 0.63, 0);
  mech.add(waistGroup);

  const neckRing = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.28, 0.25, 0.11, 28)), darkJointMat);
  neckRing.position.y = 0.08;
  waistGroup.add(neckRing);

  const waistBelt = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.24, 0.26, 0.09, 28)), armorMat);
  waistBelt.position.y = -0.01;
  waistGroup.add(waistBelt);

  const pelvis = new THREE.Mesh(tg(new THREE.SphereGeometry(0.22, 24, 18)), armorMat);
  pelvis.position.set(0, -0.14, 0);
  pelvis.scale.set(1.05, 0.85, 0.92);
  waistGroup.add(pelvis);

  // 5. Stocky Armored Legs & Glossy Pointed Toe Caps
  [-1, 1].forEach((side) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.24, 0.45, 0);
    mech.add(legGroup);

    // Hip Ball Seam
    const hipBall = new THREE.Mesh(tg(new THREE.SphereGeometry(0.13, 18, 14)), darkJointMat);
    hipBall.position.set(side * -0.02, -0.02, 0);
    legGroup.add(hipBall);

    // Thick Rounded Thigh Armor
    const thigh = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.165, 0.155, 0.22, 24)), armorMat);
    thigh.position.set(side * 0.03, -0.1, 0.02);
    thigh.rotation.z = side * -0.14;
    legGroup.add(thigh);

    // Knee Seam
    const knee = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.135, 0.14, 0.055, 22)), darkJointMat);
    knee.position.set(side * 0.05, -0.21, 0.01);
    legGroup.add(knee);

    // Chunky Flared Shin Armor
    const shin = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.145, 0.185, 0.24, 24)), armorMat);
    shin.position.set(side * 0.06, -0.33, 0);
    legGroup.add(shin);

    // Heel Base + Pointed Glossy Black Toe Cap (planted cleanly at y = 0!)
    const heel = new THREE.Mesh(tg(new THREE.CylinderGeometry(0.15, 0.16, 0.06, 20)), darkJointMat);
    heel.position.set(side * 0.06, -0.42, -0.02);
    legGroup.add(heel);

    const toeCap = new THREE.Mesh(tg(new THREE.ConeGeometry(0.115, 0.24, 16)), darkJointMat);
    toeCap.position.set(side * 0.065, -0.405, 0.13);
    toeCap.rotation.x = Math.PI / 2;
    toeCap.scale.set(1.05, 1.0, 0.58);
    legGroup.add(toeCap);
  });

  const update = (t: number) => {
    // Subtle heavy toy-mech idle stance breathing & slight arm micro-sway
    upperGroup.position.y = 1.15 + Math.sin(t * 2.0) * 0.016;
    upperGroup.rotation.x = Math.sin(t * 1.4) * 0.02;
    if (armGroups[0]) armGroups[0].rotation.z = Math.sin(t * 1.6) * 0.025;
    if (armGroups[1]) armGroups[1].rotation.z = -Math.sin(t * 1.6) * 0.025;
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((tx) => tx.dispose());
  };

  return { root, update, dispose };
}
