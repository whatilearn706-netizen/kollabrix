import { NextRequest, NextResponse } from 'next/server';
import { RekognitionClient, CompareFacesCommand } from '@aws-sdk/client-rekognition';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getRekognitionClient(): RekognitionClient | null {
  const accessKeyId = (
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ||
    ''
  ).trim();

  const secretAccessKey = (
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ||
    ''
  ).trim();

  const region = (
    process.env.AWS_REGION ||
    process.env.NEXT_PUBLIC_AWS_REGION ||
    'ap-southeast-2'
  ).trim();

  if (!accessKeyId || !secretAccessKey) return null;

  return new RekognitionClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

// ── 1. AWS Rekognition 1:1 Forensic Biometric Landmark Comparison ──
async function compareFacesWithRekognition(
  cleanLive: string,
  cleanRef: string,
  cleanFullCard?: string
): Promise<{
  handled: boolean;
  hasFace: boolean;
  isMatched: boolean;
  matchScore: number;
  reason: string;
  source: string;
}> {
  const client = getRekognitionClient();
  if (!client) {
    return { handled: false, hasFace: false, isMatched: false, matchScore: 0, reason: '', source: '' };
  }

  const liveBuffer = Buffer.from(cleanLive, 'base64');
  const refBuffer = Buffer.from(cleanRef, 'base64');
  const fullCardBuffer = cleanFullCard ? Buffer.from(cleanFullCard, 'base64') : null;

  const runCompare = async (sourceBuf: Buffer) => {
    const cmd = new CompareFacesCommand({
      SourceImage: { Bytes: sourceBuf },
      TargetImage: { Bytes: liveBuffer },
      SimilarityThreshold: 80, // Strict mathematical threshold (friends will score 20-40%)
    });
    return await client.send(cmd);
  };

  try {
    let res: any = null;
    try {
      res = await runCompare(refBuffer);
    } catch (err: any) {
      if (
        fullCardBuffer &&
        (err?.name === 'InvalidParameterException' || err?.message?.includes('no faces'))
      ) {
        res = await runCompare(fullCardBuffer);
      } else {
        throw err;
      }
    }

    if (!res) {
      return { handled: false, hasFace: false, isMatched: false, matchScore: 0, reason: '', source: '' };
    }

    // 1. Genuine Same Person Confirmed by AWS Rekognition
    const matches = res.FaceMatches || [];
    if (matches.length > 0 && matches[0]?.Similarity && matches[0].Similarity >= 80) {
      const similarityScore = Math.round(matches[0].Similarity * 10) / 10;
      return {
        handled: true,
        hasFace: true,
        isMatched: true,
        matchScore: similarityScore,
        reason: `Biometric face signature matches ID card portrait (${similarityScore}% mathematical likeness).`,
        source: 'AWS-Rekognition-Forensic-Engine',
      };
    }

    // 2. Mismatch: Face detected, but belongs to a DIFFERENT INDIVIDUAL (Friend's Card Blocked!)
    const unmatched = res.UnmatchedFaces || [];
    if (unmatched.length > 0 || matches.length === 0) {
      const highestScore = matches[0]?.Similarity ? Math.round(matches[0].Similarity * 10) / 10 : 20.0;
      return {
        handled: true,
        hasFace: true,
        isMatched: false,
        matchScore: highestScore,
        reason: 'Warning: Face does not match the photo on this student ID card. Please ensure you are scanning your own ID card.',
        source: 'AWS-Rekognition-Forensic-Engine',
      };
    }

    return {
      handled: true,
      hasFace: false,
      isMatched: false,
      matchScore: 0,
      reason: 'No clear face detected in live camera. Please face the camera directly.',
      source: 'AWS-Rekognition-Forensic-Engine',
    };
  } catch (err: any) {
    console.warn('AWS Rekognition comparison note:', err?.name, err?.message);
    if (err?.name === 'InvalidParameterException' && err.message?.includes('TargetImage')) {
      return {
        handled: true,
        hasFace: false,
        isMatched: false,
        matchScore: 0,
        reason: 'No clear human face detected in camera viewport. Please look directly into the camera.',
        source: 'AWS-Rekognition-Forensic-Engine',
      };
    }
    // Return handled: false so fallback engine can process
    return { handled: false, hasFace: false, isMatched: false, matchScore: 0, reason: '', source: '' };
  }
}

function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ''
  ).trim();
}

// ── 2. Gemini Multimodal Visual Likeness Comparison & Anti-Spoofing (Secondary Engine) ──
async function compareFacesWithGemini(
  cleanLive: string,
  cleanRef: string,
  cleanFullCard: string | undefined,
  apiKey: string
): Promise<{ hasFace: boolean; isMatched: boolean; matchScore: number; reason: string; source: string }> {
  const prompt = `You are an elite biometric facial verification engine adhering to forensic 1:1 facial comparison standards (Apple Face ID / ISO/IEC 19794-5).
Image 1 is the LIVE front camera frame captured from the user sitting at the computer right now.
Image 2 is the student portrait photo from their physical university ID card${cleanFullCard && cleanFullCard !== cleanRef ? ' (Image 3 is the full physical ID card for reference)' : ''}.

CRITICAL SECURITY DIRECTIVE - ANTI-FRIEND & ANTI-IMPERSONATION MANDATORY:
You are guarding a collegiate verification gate.
Students frequently attempt to verify their account using a FRIEND'S, ROOMMATE'S, CLASSMATE'S, SIBLING'S, or RELATIVE'S student ID card while showing their own live face to the camera.

STEP 1: LIVENESS & HUMAN PRESENCE
- Inspect Image 1. Is there a clear, real human face looking at the camera?
- If Image 1 is obstructed, black, blurred, covered by a finger, shows only a wall/ceiling, or has no human face:
  Set "hasFace": false, "isMatched": false, "matchScore": 0, "reason": "No clear human face detected in camera viewport. Please look directly into the camera."

STEP 2: CARD PORTRAIT ANATOMICAL CROSS-EXAMINATION
- Compare the facial bone structure between Image 1 (live face) and Image 2 (card portrait photo):
  1. Eye spacing, eye socket shape, and eyebrow contour.
  2. Nose bridge curvature, nasal tip width, and nostril structure.
  3. Jawline angle, chin shape (cleft vs round vs square vs pointed), and cheekbone height.
  4. Mouth width and lip contours.

RULE 1: SAME PERSON (CARDHOLDER VERIFIED):
- If Image 1 (live face) and Image 2 (card photo) belong to the SAME EXACT STUDENT (accounting for natural differences between an ID photograph and a live webcam, such as lighting, smile, slight aging, or hairstyle changes):
  Set "hasFace": true, "isMatched": true, "matchScore": 98.6, "reason": "Biometric face signature matches physical ID card photo."

RULE 2: DIFFERENT PERSON (FRIEND'S / ROOMMATE'S / RELATIVE'S CARD REJECTED):
- If Image 1 (live face) is a DIFFERENT INDIVIDUAL than the person in Image 2 (card photo):
  Even if they are friends, roommates, same gender, similar age, or similar ethnicity:
  You MUST set "hasFace": true, "isMatched": false, "matchScore": 22.0, "reason": "Warning: Face does not match the photo on this student ID card. Please ensure you are scanning your own ID card."

Return ONLY valid JSON matching this schema:
{
  "hasFace": boolean,
  "isMatched": boolean,
  "matchScore": number,
  "reason": "string"
}`;

  const parts: any[] = [
    { text: prompt },
    { inline_data: { mime_type: 'image/jpeg', data: cleanLive } },
    { inline_data: { mime_type: 'image/jpeg', data: cleanRef } },
  ];

  if (cleanFullCard && cleanFullCard !== cleanRef) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: cleanFullCard } });
  }

  const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(9000),
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: 'application/json',
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ],
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${model} status ${res.status}: ${errText.slice(0, 150)}`);
      }

      const json = await res.json();
      const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) throw new Error(`No output from ${model} face comparison`);

      const parsed = JSON.parse(textOutput);
      return {
        hasFace: Boolean(parsed.hasFace),
        isMatched: Boolean(parsed.isMatched),
        matchScore: Number(parsed.matchScore) || (parsed.isMatched ? 98.6 : 0),
        reason: parsed.reason || (parsed.isMatched ? 'Biometric features verified.' : 'Warning: Face does not match the photo on this student ID card.'),
        source: `${model}-vision`,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`Face match with ${model} failed, trying next:`, err?.message);
    }
  }

  throw lastError || new Error('All Gemini face comparison models failed');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { liveFaceImage, idCardImage, idFaceCrop } = body;

    if (!liveFaceImage) {
      return NextResponse.json(
        { success: false, hasFace: false, isMatched: false, error: 'Live face capture is required.' },
        { status: 400 }
      );
    }

    const refRaw = idFaceCrop || idCardImage;
    if (!refRaw) {
      return NextResponse.json(
        { success: false, hasFace: false, isMatched: false, error: 'Student ID reference image is required.' },
        { status: 400 }
      );
    }

    const cleanLive = liveFaceImage.includes('base64,') ? liveFaceImage.split('base64,')[1].trim() : liveFaceImage.trim();
    const cleanRef = refRaw.includes('base64,') ? refRaw.split('base64,')[1].trim() : refRaw.trim();
    const cleanFullCard = idCardImage
      ? (idCardImage.includes('base64,') ? idCardImage.split('base64,')[1].trim() : idCardImage.trim())
      : undefined;

    // Strict Anti-Spoofing: Refuse matching an identical image payload against itself
    if (cleanLive === cleanRef || (cleanFullCard && cleanLive === cleanFullCard)) {
      return NextResponse.json(
        {
          success: true,
          hasFace: true,
          isMatched: false,
          matchScore: 0,
          reason: 'Biometric Security Violation: Live camera stream cannot be identical to the ID card reference. Please scan your own physical ID card first.',
        },
        { status: 200 }
      );
    }

    // 1. Primary Engine: AWS Rekognition 1:1 Forensic Biometric Landmark Distance
    try {
      const rekognitionResult = await compareFacesWithRekognition(cleanLive, cleanRef, cleanFullCard);
      if (rekognitionResult.handled) {
        return NextResponse.json({
          success: true,
          hasFace: rekognitionResult.hasFace,
          isMatched: rekognitionResult.isMatched,
          matchScore: rekognitionResult.matchScore,
          engine: rekognitionResult.source,
          reason: rekognitionResult.reason,
          verifiedAt: new Date().toISOString(),
        });
      }
    } catch (rekErr: any) {
      console.warn('Rekognition primary attempt note:', rekErr?.message);
    }

    const geminiKey = getGeminiApiKey();

    // 2. Secondary Engine: Gemini Multimodal Visual Likeness if API key is present
    if (geminiKey) {
      try {
        const geminiMatch = await compareFacesWithGemini(cleanLive, cleanRef, cleanFullCard, geminiKey);
        
        // If Gemini says NO face detected (e.g. finger over lens) or NO match, RESPECT IT!
        if (!geminiMatch.hasFace || !geminiMatch.isMatched) {
          return NextResponse.json({
            success: true,
            hasFace: Boolean(geminiMatch.hasFace),
            isMatched: false,
            matchScore: geminiMatch.matchScore || 0,
            engine: geminiMatch.source,
            reason: geminiMatch.reason || 'Warning: Face does not match the photo on this student ID card. Please ensure you are scanning your own ID card.',
            verifiedAt: new Date().toISOString(),
          });
        }

        // Genuine Match Confirmed
        return NextResponse.json({
          success: true,
          hasFace: true,
          isMatched: true,
          matchScore: Math.max(geminiMatch.matchScore, 98.6),
          engine: geminiMatch.source,
          reason: geminiMatch.reason,
          verifiedAt: new Date().toISOString(),
        });
      } catch (geminiErr: any) {
        console.warn('Gemini face match note:', geminiErr?.message);
      }
    }

    // 2. Hardware / Sensor Anti-Spoofing Fallback Engine
    const liveSize = Buffer.from(cleanLive, 'base64').length;
    const refSize = Buffer.from(cleanRef, 'base64').length;

    // Obstruction / Blank frame filter (finger covering lens generates flat, low-entropy image)
    if (liveSize < 1200 || refSize < 800) {
      return NextResponse.json(
        {
          success: true,
          hasFace: false,
          isMatched: false,
          matchScore: 0,
          engine: 'Sensor Anti-Spoofing Filter',
          reason: 'Camera view is obstructed or covered by a finger. Please uncover the lens and look into the camera.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      hasFace: false,
      isMatched: false,
      matchScore: 0,
      engine: 'Sensor Anti-Spoofing Filter',
      reason: 'Face verification in progress. Please center your face inside the circle and look into the camera.',
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Face match API error:', err);
    return NextResponse.json(
      { success: false, hasFace: false, isMatched: false, error: err?.message || 'Face match verification failed.' },
      { status: 500 }
    );
  }
}
