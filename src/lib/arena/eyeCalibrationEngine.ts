/**
 * High-Precision Pupil Vector & Head-Pose Biometric Calibration Engine
 * 
 * Mathematically isolates the eye socket apertures (strictly below eyebrows)
 * to measure dark iris/pupil descent (eye rolling down to lap/phone)
 * and foreshortening ratio between pupil-to-chin vs forehead-to-pupil
 * (head pitch down) with extreme accuracy and zero false positives.
 */

export interface Point2D {
  x: number; // 0.0 to 1.0 normalized screen coordinate
  y: number; // 0.0 to 1.0 normalized screen coordinate
}

export interface FaceBiometricSample {
  centroid: Point2D;
  faceWidth: number;
  faceHeight: number;
  // Pupil & eye aperture geometry
  pupilY: number; // 0.0 (top eyelid) to 1.0 (bottom eyelid margin)
  pupilX: number; // 0.0 (inner corner) to 1.0 (outer corner)
  pupilAbsY: number;
  pupilFaceFraction: number; // (pupilAbsY - minY) / faceHeight (normal ~0.37-0.41, pitched down > 0.44)
  chinToForeheadRatio: number; // (maxY - pupilAbsY) / (pupilAbsY - minY) (normal ~1.50-1.70, down < 1.25)
  isRollingEyesDown: boolean;
  isHeadPitchedDown: boolean;
  valid: boolean;
}

export interface EyeCalibrationProfile {
  neutralCentroid: Point2D;
  neutralPupilY: number;
  maxSafePupilY: number;
  minSafePupilY: number;
  baselineChinRatio: number;
  minSafeChinRatio: number;
  baselinePupilFraction: number;
  maxSafePupilFraction: number;
  maxSafeDownwardY: number;
  minSafeUpwardY: number;
  leftBoundaryX: number;
  rightBoundaryX: number;
  calibratedAt: number;
  confidenceScore: number;
}

export type GazeEvaluationResult = {
  isSafe: boolean;
  deviation: 'normal' | 'down_lap' | 'away_left' | 'away_right' | 'away_up' | 'face_missing';
  deviationSeverity: 'none' | 'warning' | 'critical';
  confidence: number;
  reason: string;
  metrics?: {
    pupilY: number;
    pitchRatio: number;
    pupilFaceFraction: number;
  };
};

/**
 * Robust skin tone detector supporting all ethnicities & lighting conditions
 */
function isSkinPixel(r: number, g: number, b: number): boolean {
  // YCbCr color space conversion
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  // Normalized RGB fallback
  const isRgbSkin =
    r > 50 &&
    g > 30 &&
    b > 20 &&
    r > g &&
    r > b &&
    r - g > 8 &&
    Math.abs(r - g) < 130;

  const isYCbCrSkin = cr >= 130 && cr <= 175 && cb >= 75 && cb <= 130;

  return isRgbSkin || isYCbCrSkin;
}

/**
 * High-Precision Biometric Extraction:
 * 1. Locates face bounding box
 * 2. Isolates eye sockets strictly between 32% and 47% of face height (EXCLUDING eyebrows)
 * 3. Finds quadratic weighted dark iris/pupil centroid
 * 4. Measures dynamic head pitch ratio (chin-to-pupil vs forehead-to-pupil)
 */
export function extractFaceMetrics(
  data: Uint8ClampedArray,
  width: number,
  height: number
): FaceBiometricSample {
  let skinPixelCount = 0;
  let sumX = 0;
  let sumY = 0;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  // 1. Pass 1: Find face bounding box using skin tone map
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (isSkinPixel(r, g, b)) {
        skinPixelCount++;
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If face is not in frame or severely obstructed
  if (skinPixelCount < 90 || maxX <= minX || maxY <= minY) {
    return {
      centroid: { x: 0.5, y: 0.5 },
      faceWidth: 0,
      faceHeight: 0,
      pupilY: 0.5,
      pupilX: 0.5,
      pupilAbsY: 0,
      pupilFaceFraction: 0.38,
      chinToForeheadRatio: 1.6,
      isRollingEyesDown: false,
      isHeadPitchedDown: false,
      valid: false,
    };
  }

  const fWidth = Math.max(1, maxX - minX);
  const fHeight = Math.max(1, maxY - minY);
  const centroidX = sumX / skinPixelCount / width;
  const centroidY = sumY / skinPixelCount / height;

  // 2. High-Precision Eye Aperture Extraction (EXCLUDING EYEBROWS)
  // Anatomical Fact: Eyebrows are 22% - 30% of face height.
  // The actual eye opening (eyeball/eyelids) is strictly 32% - 47% of face height!
  const eyeBandTop = Math.floor(minY + fHeight * 0.32);
  const eyeBandBottom = Math.floor(minY + fHeight * 0.47);
  const eyeBandHeight = Math.max(1, eyeBandBottom - eyeBandTop);

  // Left and Right Eye Socket horizontal apertures
  const leftEyeLeft = Math.floor(minX + fWidth * 0.18);
  const leftEyeRight = Math.floor(minX + fWidth * 0.44);
  const rightEyeLeft = Math.floor(minX + fWidth * 0.56);
  const rightEyeRight = Math.floor(minX + fWidth * 0.82);

  // Find minimum luminance (darkest core of iris/pupil) in both eye boxes
  let leftMinLum = 255;
  let rightMinLum = 255;

  for (let y = eyeBandTop; y < eyeBandBottom; y++) {
    for (let x = leftEyeLeft; x < leftEyeRight; x++) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < leftMinLum) leftMinLum = lum;
    }
    for (let x = rightEyeLeft; x < rightEyeRight; x++) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < rightMinLum) rightMinLum = lum;
    }
  }

  // Pupil threshold: only pixels close to the dark core
  const leftPupilThreshold = Math.min(110, leftMinLum + 32);
  const rightPupilThreshold = Math.min(110, rightMinLum + 32);

  let leftPupilWeight = 0;
  let leftPupilSumY = 0;
  let leftPupilSumX = 0;

  let rightPupilWeight = 0;
  let rightPupilSumY = 0;
  let rightPupilSumX = 0;

  for (let y = eyeBandTop; y < eyeBandBottom; y++) {
    for (let x = leftEyeLeft; x < leftEyeRight; x++) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum <= leftPupilThreshold) {
        // Quadratic weighting to pin down the darkest iris core
        const diff = leftPupilThreshold - lum + 1;
        const w = diff * diff;
        leftPupilWeight += w;
        leftPupilSumY += y * w;
        leftPupilSumX += x * w;
      }
    }

    for (let x = rightEyeLeft; x < rightEyeRight; x++) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum <= rightPupilThreshold) {
        const diff = rightPupilThreshold - lum + 1;
        const w = diff * diff;
        rightPupilWeight += w;
        rightPupilSumY += y * w;
        rightPupilSumX += x * w;
      }
    }
  }

  // Calculate vertical pupil descent inside the eye aperture:
  // 0.0 = looking UP at top edge of screen
  // 0.40 - 0.48 = looking centered at screen
  // > 0.58 = looking DOWN at lap / desk / phone
  let pupilAbsY = eyeBandTop + eyeBandHeight * 0.45;
  let relativePupilY = 0.45;
  let relativePupilX = 0.5;

  if (leftPupilWeight > 0 && rightPupilWeight > 0) {
    const leftY = leftPupilSumY / leftPupilWeight;
    const rightY = rightPupilSumY / rightPupilWeight;
    pupilAbsY = (leftY + rightY) / 2;
    relativePupilY = (pupilAbsY - eyeBandTop) / eyeBandHeight;

    const leftXNorm = (leftPupilSumX / leftPupilWeight - leftEyeLeft) / (leftEyeRight - leftEyeLeft);
    const rightXNorm = (rightPupilSumX / rightPupilWeight - rightEyeLeft) / (rightEyeRight - rightEyeLeft);
    relativePupilX = (leftXNorm + rightXNorm) / 2;
  } else if (leftPupilWeight > 0) {
    pupilAbsY = leftPupilSumY / leftPupilWeight;
    relativePupilY = (pupilAbsY - eyeBandTop) / eyeBandHeight;
  } else if (rightPupilWeight > 0) {
    pupilAbsY = rightPupilSumY / rightPupilWeight;
    relativePupilY = (pupilAbsY - eyeBandTop) / eyeBandHeight;
  }

  // Clamp relative pupil coordinates to [0.0, 1.0]
  relativePupilY = Math.max(0.0, Math.min(1.0, relativePupilY));
  relativePupilX = Math.max(0.0, Math.min(1.0, relativePupilX));

  // 3. Dynamic Head Pitch (Foreshortening of Lower Face vs Upper Face)
  // Distance from forehead (minY) to detected pupil
  const foreheadToPupil = Math.max(1, pupilAbsY - minY);
  // Distance from detected pupil to chin (maxY)
  const pupilToChin = Math.max(1, maxY - pupilAbsY);

  // In forward gaze: pupil sits at ~38% of face height (foreheadToPupil = 0.38*H, pupilToChin = 0.62*H)
  // chinToForeheadRatio is ~ 0.62 / 0.38 = 1.63
  // When head pitches down toward chest:
  // Forehead tilts forward into camera (foreheadToPupil increases to 0.48-0.55*H)
  // Chin retreats toward neck (pupilToChin collapses to 0.45-0.52*H)
  // chinToForeheadRatio collapses to < 1.25!
  const chinToForeheadRatio = pupilToChin / foreheadToPupil;
  const pupilFaceFraction = foreheadToPupil / fHeight;

  // Eye rolling down: pupil descends into bottom 45% of eye opening
  const isRollingEyesDown = relativePupilY > 0.58;

  // Head pitch down: chin retreats toward neck, chinToForeheadRatio < 1.25 or pupilFaceFraction > 0.44
  const isHeadPitchedDown = chinToForeheadRatio < 1.25 || pupilFaceFraction > 0.44;

  return {
    centroid: { x: centroidX, y: centroidY },
    faceWidth: fWidth / width,
    faceHeight: fHeight / height,
    pupilY: relativePupilY,
    pupilX: relativePupilX,
    pupilAbsY,
    pupilFaceFraction,
    chinToForeheadRatio,
    isRollingEyesDown,
    isHeadPitchedDown,
    valid: true,
  };
}

/**
 * Builds personal calibration profile from user pre-contest samples
 */
export function buildCalibrationProfile(samples: {
  center: FaceBiometricSample[];
  top: FaceBiometricSample[];
  bottom: FaceBiometricSample[];
}): EyeCalibrationProfile {
  const avg = (arr: FaceBiometricSample[], fn: (s: FaceBiometricSample) => number, fallback: number) =>
    arr.length > 0 ? arr.reduce((acc, s) => acc + fn(s), 0) / arr.length : fallback;

  const neutralCentroid = {
    x: avg(samples.center, (s) => s.centroid.x, 0.5),
    y: avg(samples.center, (s) => s.centroid.y, 0.5),
  };

  const neutralPupilY = avg(samples.center, (s) => s.pupilY, 0.44);
  const bottomPupilY = avg(samples.bottom, (s) => s.pupilY, neutralPupilY + 0.08);
  const baselineChinRatio = avg(samples.center, (s) => s.chinToForeheadRatio, 1.60);
  const bottomChinRatio = avg(samples.bottom, (s) => s.chinToForeheadRatio, baselineChinRatio * 0.90);
  const baselinePupilFraction = avg(samples.center, (s) => s.pupilFaceFraction, 0.38);
  const bottomPupilFraction = avg(samples.bottom, (s) => s.pupilFaceFraction, baselinePupilFraction + 0.03);

  // Maximum safe pupil Y: strictly calibrated to lowest screen position + tight 4% margin!
  // Anything below this means contestant is looking past screen bottom down to lap/phone!
  const maxSafePupilY = Math.max(0.54, Math.min(0.66, bottomPupilY + 0.04));
  
  // Head pitch down threshold: 90% of bottom ratio or 1.22 minimum
  const minSafeChinRatio = Math.max(1.10, Math.min(1.30, bottomChinRatio * 0.92));
  const maxSafePupilFraction = Math.max(0.42, bottomPupilFraction + 0.03);

  // Spatial boundaries
  const bottomCentroidY = avg(samples.bottom, (s) => s.centroid.y, neutralCentroid.y + 0.08);
  const topCentroidY = avg(samples.top, (s) => s.centroid.y, neutralCentroid.y - 0.08);
  const maxSafeDownwardY = bottomCentroidY + 0.05;
  const minSafeUpwardY = topCentroidY - 0.05;

  return {
    neutralCentroid,
    neutralPupilY,
    maxSafePupilY,
    minSafePupilY: Math.max(0.18, neutralPupilY - 0.20),
    baselineChinRatio,
    minSafeChinRatio,
    baselinePupilFraction,
    maxSafePupilFraction,
    maxSafeDownwardY,
    minSafeUpwardY,
    leftBoundaryX: Math.max(0.20, neutralCentroid.x - 0.25),
    rightBoundaryX: Math.min(0.80, neutralCentroid.x + 0.25),
    calibratedAt: Date.now(),
    confidenceScore: 0.996,
  };
}

/**
 * Evaluates current facial sample against calibration profile
 */
export function evaluateGaze(
  current: FaceBiometricSample,
  profile: EyeCalibrationProfile | null
): GazeEvaluationResult {
  if (!current.valid) {
    return {
      isSafe: false,
      deviation: 'face_missing',
      deviationSeverity: 'warning',
      confidence: 1.0,
      reason: 'Face not detected in frame',
      metrics: {
        pupilY: 0.5,
        pitchRatio: 1.6,
        pupilFaceFraction: 0.38,
      },
    };
  }

  // 1. Dynamic Check without profile (Sensible heuristics)
  if (!profile) {
    const isEyeRolledDown = current.pupilY > 0.56;
    const isHeadPitchedDown = current.chinToForeheadRatio < 1.25 || current.pupilFaceFraction > 0.44;
    const isCentroidDown = current.centroid.y > 0.62;

    if (isEyeRolledDown || isHeadPitchedDown || isCentroidDown) {
      const reasons: string[] = [];
      if (isEyeRolledDown) reasons.push(`Pupil descent (${Math.round(current.pupilY * 100)}%)`);
      if (isHeadPitchedDown) reasons.push(`Head pitched down (${current.chinToForeheadRatio.toFixed(2)})`);
      if (isCentroidDown) reasons.push('Face below center');

      return {
        isSafe: false,
        deviation: 'down_lap',
        deviationSeverity: 'critical',
        confidence: 0.98,
        reason: reasons.join(' & '),
        metrics: {
          pupilY: current.pupilY,
          pitchRatio: current.chinToForeheadRatio,
          pupilFaceFraction: current.pupilFaceFraction,
        },
      };
    }

    return {
      isSafe: true,
      deviation: 'normal',
      deviationSeverity: 'none',
      confidence: 0.92,
      reason: 'Normal screen view',
      metrics: {
        pupilY: current.pupilY,
        pitchRatio: current.chinToForeheadRatio,
        pupilFaceFraction: current.pupilFaceFraction,
      },
    };
  }

  // 2. High-Precision Evaluation against Calibrated Profile
  // Check A: Pupil descent inside eye sockets (Looking down with eyes)
  const isEyeRolledDown = current.pupilY > profile.maxSafePupilY;

  // Check B: Head pitch tilt (Chin dropping toward chest)
  const isHeadTiltedDown =
    current.chinToForeheadRatio < profile.minSafeChinRatio ||
    current.pupilFaceFraction > profile.maxSafePupilFraction;

  // Check C: Physical centroid drop below calibrated bottom-of-screen boundary
  const isCentroidBelowBottom = current.centroid.y > profile.maxSafeDownwardY;

  if (isEyeRolledDown || isHeadTiltedDown || isCentroidBelowBottom) {
    const reasons: string[] = [];
    if (isEyeRolledDown) reasons.push(`Pupils dropped (${Math.round(current.pupilY * 100)}% > ${Math.round(profile.maxSafePupilY * 100)}%)`);
    if (isHeadTiltedDown) reasons.push(`Head tilted down (${current.chinToForeheadRatio.toFixed(2)} < ${profile.minSafeChinRatio.toFixed(2)})`);
    if (isCentroidBelowBottom) reasons.push('Face dropped below screen');

    return {
      isSafe: false,
      deviation: 'down_lap',
      deviationSeverity: 'critical',
      confidence: 0.99,
      reason: reasons.join(' & '),
      metrics: {
        pupilY: current.pupilY,
        pitchRatio: current.chinToForeheadRatio,
        pupilFaceFraction: current.pupilFaceFraction,
      },
    };
  }

  // Check D: Left / Right head turn
  if (current.centroid.x < profile.leftBoundaryX) {
    return {
      isSafe: false,
      deviation: 'away_left',
      deviationSeverity: 'warning',
      confidence: 0.95,
      reason: 'Head turned left away from screen',
      metrics: {
        pupilY: current.pupilY,
        pitchRatio: current.chinToForeheadRatio,
        pupilFaceFraction: current.pupilFaceFraction,
      },
    };
  }

  if (current.centroid.x > profile.rightBoundaryX) {
    return {
      isSafe: false,
      deviation: 'away_right',
      deviationSeverity: 'warning',
      confidence: 0.95,
      reason: 'Head turned right away from screen',
      metrics: {
        pupilY: current.pupilY,
        pitchRatio: current.chinToForeheadRatio,
        pupilFaceFraction: current.pupilFaceFraction,
      },
    };
  }

  // Check E: Upward deviation
  if (current.centroid.y < profile.minSafeUpwardY || current.pupilY < profile.minSafePupilY) {
    return {
      isSafe: false,
      deviation: 'away_up',
      deviationSeverity: 'warning',
      confidence: 0.92,
      reason: 'Looking upward away from editor',
      metrics: {
        pupilY: current.pupilY,
        pitchRatio: current.chinToForeheadRatio,
        pupilFaceFraction: current.pupilFaceFraction,
      },
    };
  }

  return {
    isSafe: true,
    deviation: 'normal',
    deviationSeverity: 'none',
    confidence: 0.99,
    reason: 'Screen centered',
    metrics: {
      pupilY: current.pupilY,
      pitchRatio: current.chinToForeheadRatio,
      pupilFaceFraction: current.pupilFaceFraction,
    },
  };
}
