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

  const models = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ];
  const prompt = `You are a bank-grade biometric forensics and facial landmark identity verification AI.
Examine and compare these two facial images STRICTLY:
- Image 1: Live camera selfie captured in real time.
- Image 2: Isolated student portrait from the physical ID card.

Biometric Verification Protocol:
1. Confirm there is a genuine human face visible in Image 1 AND a clear student portrait in Image 2.
2. Strictly compare bone structure, eye shape, inter-pupillary ratio, nose bridge width, cheekbone geometry, jawline contour, and ear/mouth proportions.
3. If these images appear to be two different people (for example a friend's ID card, cousin/sibling, or someone else), OR if the card portrait is wearing prescription glasses while the live user clearly has a different facial structure -> REJECT STRICTLY: set "isMatched": false and "matchScore": < 30.
4. ONLY return "isMatched": true (score >= 82) when facial geometry clearly matches the SAME person. Never guess "match" on ambiguity or poor lighting.

Return ONLY a valid JSON object matching this schema:
{
  "hasLiveFace": boolean,
  "hasCardFace": boolean,
  "isMatched": boolean,
  "matchScore": number, // 0 to 100
  "reason": "Detailed biometric rationale"
}`;

  const maxAttempts = Math.min(2, keys.length);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = keys[(geminiFacePoolIndex + attempt) % keys.length];
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(8500),
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

    // ── 2. Strictly Isolate Card Portrait (Zero Tolerance for Background Live Face Contamination) ──
    let sourceBufferToCompare: Buffer | null = null;
    let isolatedCropUsed = false;

    if (refBuffer && refBuffer !== fullCardBuffer) {
      try {
        const cropDetect = await client.send(
          new DetectFacesCommand({
            Image: { Bytes: refBuffer },
            Attributes: ['DEFAULT'],
          })
        );
        const cropFaces = cropDetect.FaceDetails || [];
        // Card portrait crop MUST isolate 1 portrait face cleanly (never multiple faces)
        if (cropFaces.length === 1) {
          sourceBufferToCompare = refBuffer;
          isolatedCropUsed = true;
        }
      } catch (cropErr: any) {
        console.warn('Crop face detection note:', cropErr?.name, cropErr?.message);
      }
    }

    // Only inspect fullCardBuffer if it contains strictly ONE small card portrait (Width < 0.25) and NO background user head
    if (!sourceBufferToCompare && fullCardBuffer) {
      try {
        const cardDetect = await client.send(
          new DetectFacesCommand({
            Image: { Bytes: fullCardBuffer },
            Attributes: ['DEFAULT'],
          })
        );
        const cardFaces = cardDetect.FaceDetails || [];
        if (cardFaces.length === 1 && (cardFaces[0]?.BoundingBox?.Width || 1) < 0.25) {
          sourceBufferToCompare = fullCardBuffer;
        }
      } catch (cardErr: any) {
        console.warn('Card detect note:', cardErr?.name, cardErr?.message);
      }
    }

    if (!sourceBufferToCompare) {
      return NextResponse.json({
        success: true,
        hasFace: true,
        isMatched: false,
        matchScore: 0,
        engine: 'AWS-Rekognition-Biometric',
        reason: 'Could not cleanly isolate the student photo from the ID card without background interference. Please rescan your ID card closer inside the box.',
        verifiedAt: new Date().toISOString(),
      });
    }

    // ── 3. Forensic 1:1 Vector Landmark Comparison (Fail-Closed Against Friend/Proxy IDs) ──
    try {
      const [compareRes, geminiConsensus] = await Promise.all([
        client.send(
          new CompareFacesCommand({
            SourceImage: { Bytes: sourceBufferToCompare },
            TargetImage: { Bytes: liveBuffer },
            SimilarityThreshold: 50,
          })
        ),
        // Run fast Gemini check in parallel ONLY on the isolated reference portrait
        isolatedCropUsed ? verifyBiometricWithGemini(cleanLive, cleanRef).catch(() => null) : Promise.resolve(null),
      ]);

      const matches = compareRes.FaceMatches || [];
      const topSimilarity = matches[0]?.Similarity || 0;
      const awsScore = Math.round(topSimilarity * 10) / 10;

      // Hard Fail-Closed Rejection: Anything below 82% in AWS Rekognition is NEVER approved (friend/impersonator protection)
      if (matches.length === 0 || topSimilarity < 82) {
        return NextResponse.json({
          success: true,
          hasFace: true,
          isMatched: false,
          matchScore: awsScore,
          engine: 'AWS-Rekognition-Biometric',
          reason: `Biometric Mismatch (${awsScore}% similarity): Live face does not match the student photo on this ID card. You cannot verify using a friend's or another student's ID card.`,
          verifiedAt: new Date().toISOString(),
        });
      }

      // High-Confidence Match (>= 92%) on isolated portrait
      if (topSimilarity >= 92) {
        return NextResponse.json({
          success: true,
          hasFace: true,
          isMatched: true,
          matchScore: awsScore,
          engine: 'AWS-Rekognition-Biometric',
          reason: `Biometric face signature verified against ID card portrait (${awsScore}% similarity).`,
          verifiedAt: new Date().toISOString(),
        });
      }

      // Gray Zone (82% - 91.9%): Require explicit Gemini Vision consensus (never approve borderline alone)
      if (geminiConsensus && geminiConsensus.isMatched && geminiConsensus.matchScore >= 80) {
        return NextResponse.json({
          success: true,
          hasFace: true,
          isMatched: true,
          matchScore: awsScore,
          engine: 'AWS-Gemini-Dual-Biometric-Consensus',
          reason: `Dual biometric consensus verified (${awsScore}% similarity).`,
          verifiedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        hasFace: true,
        isMatched: false,
        matchScore: awsScore,
        engine: 'AWS-Rekognition-Biometric',
        reason: geminiConsensus?.reason || `Biometric confidence too low (${awsScore}%) or inconsistent with ID card portrait. Hold your own ID card clearly and look straight into the camera.`,
        verifiedAt: new Date().toISOString(),
      });
    } catch (compErr: any) {
      console.warn('CompareFaces execution note:', compErr?.name, compErr?.message);
      return NextResponse.json({
        success: true,
        hasFace: true,
        isMatched: false,
        matchScore: 0,
        engine: 'AWS-Rekognition-Biometric',
        reason: 'Biometric comparison failed to verify identity. Please ensure good lighting and hold your own physical ID card flat.',
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
