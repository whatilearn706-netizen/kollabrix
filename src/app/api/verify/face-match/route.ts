import { NextRequest, NextResponse } from 'next/server';
import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand,
} from '@aws-sdk/client-rekognition';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getGeminiApiKeys(): string[] {
  const envRaw = [
    process.env.GEMINI_API_KEYS,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  ]
    .filter(Boolean)
    .join(',');

  return Array.from(
    new Set(
      envRaw
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 10)
    )
  );
}

let geminiFacePoolIndex = 0;

async function verifyBiometricWithGemini(
  cleanLiveBase64: string,
  cleanCardBase64: string
): Promise<{
  success: boolean;
  hasFace: boolean;
  isMatched: boolean;
  matchScore: number;
  reason: string;
} | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  const prompt = `You are a bank-grade biometric forensics and facial landmark identity verification AI.
Examine and compare these two facial images:
- Image 1: Live camera selfie captured in real time.
- Image 2: Identity document portrait (from the student's physical collegiate ID card).

Biometric Verification Protocol:
1. Is there a genuine human face visible in Image 1?
2. Is there a student portrait/face visible in Image 2?
3. Compare the facial geometry:
   - Eye shape, distance between pupils, and eyebrow curvature.
   - Nose bridge width and nasal tip angle.
   - Jawline, chin contour, and cheekbone structure.
   - Mouth width and lip shape.
   - Account for realistic variations: camera focal length/perspective, lighting differences, hairstyles, facial hair growth, spectacles/glasses, and minor age changes (e.g. ID photo taken 1-3 years prior).
4. Distinguish between:
   - Case A: Same individual with expected camera/print differences -> MATCH (confidence >= 80%).
   - Case B: Two completely different people (e.g. friend's ID card, impersonation attempt, sibling) -> STRICT MISMATCH (confidence < 50%).

Return ONLY a valid JSON object matching this schema:
{
  "hasLiveFace": boolean,
  "hasCardFace": boolean,
  "isMatched": boolean,
  "matchScore": number, // 0 to 100
  "reason": "Detailed biometric rationale"
}`;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(geminiFacePoolIndex + attempt) % keys.length];
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(9000),
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: cleanLiveBase64,
                      },
                    },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: cleanCardBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                response_mime_type: 'application/json',
              },
            }),
          }
        );

        if (!res.ok) continue;

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;

        const cleanJson = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        const parsed = JSON.parse(cleanJson);

        geminiFacePoolIndex = (geminiFacePoolIndex + attempt + 1) % keys.length;

        const score = typeof parsed.matchScore === 'number' ? Math.round(parsed.matchScore * 10) / 10 : (parsed.isMatched ? 94.0 : 15.0);
        return {
          success: true,
          hasFace: Boolean(parsed.hasLiveFace !== false),
          isMatched: Boolean(parsed.isMatched && score >= 75),
          matchScore: score,
          reason: parsed.reason || (parsed.isMatched ? 'Biometric face signature matches ID card portrait.' : 'Live face does not match ID card portrait.'),
        };
      } catch (err) {
        console.warn(`Gemini face match model ${model} attempt note:`, err);
      }
    }
  }

  return null;
}

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

    const client = getRekognitionClient();
    
    // If AWS client is offline or unconfigured, use Gemini Multimodal Biometric Engine
    if (!client) {
      const geminiResult = await verifyBiometricWithGemini(cleanLive, cleanRef);
      if (geminiResult) {
        return NextResponse.json({
          ...geminiResult,
          engine: 'Gemini-Multimodal-Biometric',
          verifiedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json(
        {
          success: false,
          hasFace: false,
          isMatched: false,
          error: 'Biometric verification engines offline.',
        },
        { status: 500 }
      );
    }

    const liveBuffer = Buffer.from(cleanLive, 'base64');
    const refBuffer = cleanRef ? Buffer.from(cleanRef, 'base64') : null;
    const fullCardBuffer = cleanFullCard ? Buffer.from(cleanFullCard, 'base64') : null;

    // ── 1. Live Camera Human Face Detection ──
    let liveFaceDetails: any[] = [];
    try {
      const liveDetect = await client.send(
        new DetectFacesCommand({
          Image: { Bytes: liveBuffer },
          Attributes: ['DEFAULT'],
        })
      );
      liveFaceDetails = liveDetect.FaceDetails || [];
    } catch (liveErr: any) {
      console.warn('Live face detection note:', liveErr?.name, liveErr?.message);
    }

    if (liveFaceDetails.length === 0) {
      // Double check with Gemini before giving up
      const geminiResult = await verifyBiometricWithGemini(cleanLive, cleanRef);
      if (geminiResult && geminiResult.isMatched) {
        return NextResponse.json({
          ...geminiResult,
          engine: 'Gemini-Multimodal-Biometric',
          verifiedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        hasFace: false,
        isMatched: false,
        matchScore: 0,
        engine: 'AWS-Rekognition-Biometric',
        reason: 'No clear human face detected in camera viewport. Please look directly into the circle.',
        verifiedAt: new Date().toISOString(),
      });
    }

    // ── 2. Isolate Card Photo (Zero Tolerance for Background Live Face) ──
    let sourceBufferToCompare: Buffer | null = null;

    // Check if the cropped passport portrait has a face
    if (refBuffer && refBuffer !== fullCardBuffer) {
      try {
        const cropDetect = await client.send(
          new DetectFacesCommand({
            Image: { Bytes: refBuffer },
            Attributes: ['DEFAULT'],
          })
        );
        if ((cropDetect.FaceDetails || []).length > 0) {
          sourceBufferToCompare = refBuffer;
        }
      } catch (cropErr: any) {
        console.warn('Crop face detection note:', cropErr?.name, cropErr?.message);
      }
    }

    // If no crop, inspect the card frame
    if (!sourceBufferToCompare && fullCardBuffer) {
      try {
        const cardDetect = await client.send(
          new DetectFacesCommand({
            Image: { Bytes: fullCardBuffer },
            Attributes: ['DEFAULT'],
          })
        );
        const cardFaces = cardDetect.FaceDetails || [];

        if (cardFaces.length > 0) {
          sourceBufferToCompare = fullCardBuffer;
        }
      } catch (cardErr: any) {
        console.warn('Card detect note:', cardErr?.name, cardErr?.message);
      }
    }

    // If AWS could not isolate face on card photo, try Gemini Multimodal Biometrics
    if (!sourceBufferToCompare) {
      const geminiResult = await verifyBiometricWithGemini(cleanLive, cleanRef);
      if (geminiResult) {
        return NextResponse.json({
          ...geminiResult,
          engine: 'Gemini-Multimodal-Biometric',
          verifiedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        hasFace: true,
        isMatched: false,
        matchScore: 0,
        engine: 'AWS-Rekognition-Biometric',
        reason: 'No student photo detected on the ID card. Please hold your ID card closer and steady in the frame.',
        verifiedAt: new Date().toISOString(),
      });
    }

    // ── 3. Forensic 1:1 Vector Landmark Comparison (Fail-Closed) ──
    try {
      const compareRes = await client.send(
        new CompareFacesCommand({
          SourceImage: { Bytes: sourceBufferToCompare },
          TargetImage: { Bytes: liveBuffer },
          SimilarityThreshold: 80, // Bank-grade mathematical similarity threshold
        })
      );

      const matches = compareRes.FaceMatches || [];
      const unmatched = compareRes.UnmatchedFaces || [];

      // Same cardholder confirmed by AWS Rekognition
      if (matches.length > 0 && matches[0]?.Similarity && matches[0].Similarity >= 80) {
        const score = Math.round(matches[0].Similarity * 10) / 10;
        return NextResponse.json({
          success: true,
          hasFace: true,
          isMatched: true,
          matchScore: score,
          engine: 'AWS-Rekognition-Biometric',
          reason: `Biometric face signature matches ID card portrait (${score}% similarity).`,
          verifiedAt: new Date().toISOString(),
        });
      }

      // If AWS gives 60-79% or unmatched due to print grain or lighting, give Gemini second opinion
      const geminiResult = await verifyBiometricWithGemini(cleanLive, cleanRef);
      if (geminiResult && geminiResult.isMatched) {
        return NextResponse.json({
          ...geminiResult,
          engine: 'Gemini-Multimodal-Biometric-Consensus',
          verifiedAt: new Date().toISOString(),
        });
      }

      // Confirmed Mismatch: Friend's Card or Different Individual -> STRICT REJECTION
      const highestScore = matches[0]?.Similarity
        ? Math.round(matches[0].Similarity * 10) / 10
        : (geminiResult?.matchScore || (unmatched.length > 0 ? 18.0 : 0.0));

      return NextResponse.json({
        success: true,
        hasFace: true,
        isMatched: false,
        matchScore: highestScore,
        engine: 'AWS-Rekognition-Biometric',
        reason: geminiResult?.reason || 'Warning: Face does not match the photo on this student ID card. You must verify using your own ID card.',
        verifiedAt: new Date().toISOString(),
      });
    } catch (compErr: any) {
      console.warn('CompareFaces execution note:', compErr?.name, compErr?.message);
      
      const geminiResult = await verifyBiometricWithGemini(cleanLive, cleanRef);
      if (geminiResult) {
        return NextResponse.json({
          ...geminiResult,
          engine: 'Gemini-Multimodal-Biometric-Fallback',
          verifiedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        hasFace: true,
        isMatched: false,
        matchScore: 0,
        engine: 'AWS-Rekognition-Biometric',
        reason: 'Biometric verification could not match face. Please hold your ID card flat and look directly into the camera.',
        verifiedAt: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.error('Face match API error:', err);
    return NextResponse.json(
      { success: false, hasFace: false, isMatched: false, error: err?.message || 'Face match verification failed.' },
      { status: 500 }
    );
  }
}
