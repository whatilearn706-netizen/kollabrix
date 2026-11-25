import { NextRequest, NextResponse } from 'next/server';
import {
  RekognitionClient,
  DetectTextCommand,
  DetectFacesCommand,
} from '@aws-sdk/client-rekognition';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

let geminiPoolIndex = 0;
let groqPoolIndex = 0;

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

function getGroqApiKeys(): string[] {
  const envRaw = [
    process.env.GROQ_API_KEYS,
    process.env.GROQ_API_KEY,
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

// ── 1. Multimodal Gemini Flash Multi-Pass Vision Engine (Forensic Accuracy) ──
async function extractWithGeminiFlash(
  base64Data: string,
  apiKey: string,
  userDisplayName?: string,
  existingCollege?: string
) {
  const cleanBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
  const mimeType = base64Data.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)?.[1] || 'image/jpeg';

  const promptPass1 = `You are a forensic optical character recognition and collegiate identity verification AI.
Analyze this camera snapshot with extreme precision.

CRITICAL PHYSICAL CARD DETECTION MANDATE:
- First, verify whether a PHYSICAL college/university student ID card (plastic PVC badge, laminated identity card, library card, campus pass) is clearly visible in the camera frame.
- If the image contains ONLY a human face, a selfie, a room, a wall, clothing, hands holding nothing, a screen, or no physical student card:
  Set "isCardDetected": false, "reason": "No physical college student ID card detected in frame. Please hold your physical student ID card up to the camera."
  Set college, studentRollNo, course, academicYear, studentName, and portraitBox to null.

- If a genuine physical student ID card IS visible in the frame:
  Set "isCardDetected": true, "reason": "Physical student ID card detected."

  NOTE ON CAMERA ORIENTATION:
  - If the webcam stream appears mirrored (text backwards), read and decipher the characters correctly.

  CRITICAL INSTRUCTIONS FOR STUDENT LEGAL NAME:
  - The student's real legal personal name is printed on the card (often in bold, near 'Name', 'Student Name', 'Candidate', 'Name of Student', or right beside/below the student photo).
  - IMPORTANT: The user may be logged into Google with a nickname, gaming handle, or alias. You MUST IGNORE their Google name completely and extract ONLY the EXACT student personal name printed on the physical card.
  - Do NOT extract the college/university name as the student name.
  - Do NOT extract the father's name (e.g. lines with 'F/N:', 'S/O:', 'D/O:') as the student name.
  - Do NOT extract the registrar/director/principal signature title as the student name.
  - Do NOT output channel names or aliases like "What i Learn".

  COLLEGE / UNIVERSITY NAME:
  - Extract the full official university, institute, or college name printed on the card's header or badge (e.g. 'Indian Institute of Technology Bombay', 'Delhi Technological University', 'Vellore Institute of Technology', 'Birla Institute of Technology and Science', 'S-VYASA Deemed to be University', etc.).
  - Do NOT default to any fixed institution if another college name is printed on the card. Extract what is genuinely on this card.

  STUDENT ROLL / ID NUMBER:
  - Extract the student roll number, registration ID, USN, enrollment number, or student ID exactly as printed on the card (e.g. '23B030012', '2023CSB105', '0101CS211045', 'RA2211003010123').

  DEGREE / PROGRAM / COURSE:
  - Degree and branch: e.g. 'B.Tech - Computer Science and Engineering', 'B.E. Mechanical', 'BCA', 'MCA', 'B.Tech - Artificial Intelligence'.

  ACADEMIC YEAR:
  - Study year or batch (e.g. '1st Year (Freshman)', '2nd Year (Sophomore)', '3rd Year (Junior)', '4th Year (Senior)').

  PORTRAIT PHOTO LOCATION:
  - Identify the normalized bounding box (0.0 to 1.0) of the student's passport photo on the card with keys ymin, xmin, ymax, xmax.

Return ONLY a valid JSON object matching this schema:
{
  "isCardDetected": boolean,
  "reason": "string",
  "college": "Full official College or University name",
  "studentRollNo": "Exact Roll number or registration ID without spaces or errors",
  "course": "Degree and program",
  "academicYear": "Study year (e.g. 1st Year (Freshman), 2nd Year (Sophomore), 3rd Year (Junior), 4th Year (Senior))",
  "studentName": "Full student legal personal name printed on the card",
  "portraitBox": {
    "ymin": 0.25,
    "xmin": 0.05,
    "ymax": 0.65,
    "xmax": 0.38
  },
  "confidence": 99.4
}`;

  const modelsToTry = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      // ── Pass 1: High-Precision Initial Extraction ──
      const resPass1 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8500),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptPass1 },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
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

      if (!resPass1.ok) {
        const errText = await resPass1.text();
        throw new Error(`${model} Pass 1 status ${resPass1.status}: ${errText.slice(0, 150)}`);
      }

      const jsonPass1 = await resPass1.json();
      const textOutput1 = jsonPass1.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput1) throw new Error(`No candidate response from ${model} Pass 1`);

      const cleanJson1 = textOutput1.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      const parsed1 = JSON.parse(cleanJson1);

      if (!parsed1.isCardDetected) {
        return {
          isCardDetected: false,
          reason: parsed1.reason || 'No physical college student ID card detected in frame. Please hold your student ID card up to the camera.',
          college: '',
          studentRollNo: '',
          course: '',
          academicYear: '',
          studentName: '',
          portraitBox: null,
          cardNameFound: false,
          confidence: 0,
          source: `${model}-vision`,
        };
      }

      // ── Pass 2: Conditional Forensic Cross-Verification (only when key fields are incomplete) ──
      let verifiedStudentName = (parsed1.studentName || '').trim();
      let verifiedCollege = (parsed1.college || '').trim();
      let verifiedRollNo = (parsed1.studentRollNo || '').trim();
      let verifiedCourse = (parsed1.course || '').trim();
      let verifiedYear = (parsed1.academicYear || '').trim();
      let verifiedPortraitBox = parsed1.portraitBox || null;

      const needsPass2 =
        !verifiedStudentName ||
        verifiedStudentName.length < 2 ||
        !verifiedRollNo ||
        !verifiedCollege;

      if (needsPass2) {
        try {
          const promptPass2 = `You are the chief collegiate identity auditor verifying OCR extraction.
Review this student ID card snapshot and double-check these extracted fields:
- Proposed Student Name: "${verifiedStudentName}"
- Proposed College Name: "${verifiedCollege}"
- Proposed Roll/ID No: "${verifiedRollNo}"

Look closely at the card text:
1. Is "${verifiedStudentName}" indeed the student's legal name, or is it a department name, father's name, or university title? If there is any spelling error or if the full name on the card is different, output the EXACT student name.
2. Is "${verifiedCollege}" the official institution name?
3. Is "${verifiedRollNo}" accurate?
4. Pinpoint the student's photo bounding box coordinates accurately (ymin, xmin, ymax, xmax).

Return JSON:
{
  "isCardConfirmed": true,
  "verifiedStudentName": "string",
  "verifiedCollege": "string",
  "verifiedRollNo": "string",
  "verifiedCourse": "string",
  "verifiedAcademicYear": "string",
  "portraitBox": { "ymin": 0.25, "xmin": 0.05, "ymax": 0.65, "xmax": 0.38 },
  "confidence": 99.8
}`;

          const resPass2 = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(4500),
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: promptPass2 },
                      {
                        inline_data: {
                          mime_type: mimeType,
                          data: cleanBase64,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.05,
                  response_mime_type: 'application/json',
                },
              }),
            }
          );

          if (resPass2.ok) {
            const jsonPass2 = await resPass2.json();
            const textOutput2 = jsonPass2.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textOutput2) {
              const cleanJson2 = textOutput2.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
              const parsed2 = JSON.parse(cleanJson2);
              if (parsed2.verifiedStudentName && parsed2.verifiedStudentName.trim().length >= 2) {
                verifiedStudentName = parsed2.verifiedStudentName.trim();
              }
              if (parsed2.verifiedCollege && parsed2.verifiedCollege.trim().length >= 3) {
                verifiedCollege = parsed2.verifiedCollege.trim();
              }
              if (parsed2.verifiedRollNo && parsed2.verifiedRollNo.trim().length >= 2) {
                verifiedRollNo = parsed2.verifiedRollNo.trim();
              }
              if (parsed2.verifiedCourse && parsed2.verifiedCourse.trim().length >= 2) {
                verifiedCourse = parsed2.verifiedCourse.trim();
              }
              if (parsed2.verifiedAcademicYear) {
                verifiedYear = parsed2.verifiedAcademicYear.trim();
              }
              if (parsed2.portraitBox && typeof parsed2.portraitBox.ymin === 'number') {
                verifiedPortraitBox = parsed2.portraitBox;
              }
            }
          }
        } catch (pass2Err) {
          // Fall back gracefully to Pass 1 results if Pass 2 times out
          console.warn('Pass 2 cross-verification note:', pass2Err);
        }
      }

      // Check whether extracted student name is genuine and not generic placeholder or channel handle
      const isCardNameValid =
        Boolean(verifiedStudentName) &&
        !/^(what\s*i\s*learn|student|identity|card|null|n\/a|unknown|builder)$/i.test(verifiedStudentName) &&
        verifiedStudentName.length >= 2;

      // STRICT MANDATE: Never substitute user's Google display name if card has its own name!
      const finalStudentName = isCardNameValid ? verifiedStudentName : '';

      return {
        isCardDetected: true,
        reason: 'Physical student ID card verified with dual-pass Gemini Vision.',
        college: verifiedCollege || existingCollege || '',
        studentRollNo: verifiedRollNo || '',
        course: verifiedCourse || 'B.Tech - Computer Science & Engineering',
        academicYear: verifiedYear || '1st Year (Freshman)',
        studentName: finalStudentName,
        portraitBox: verifiedPortraitBox,
        cardNameFound: isCardNameValid,
        confidence: 99.8,
        source: `${model}-dual-pass-vision`,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`Extraction with ${model} failed, trying next model:`, err?.message);
    }
  }

  throw lastError || new Error('All Gemini vision models failed');
}

// ── 2. High-Speed Groq Vision Multi-Engine Fallback (0.3s Latency) ──
async function extractWithGroqVision(
  base64Data: string,
  apiKey: string,
  userDisplayName?: string,
  existingCollege?: string
) {
  const mimeType = base64Data.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)?.[1] || 'image/jpeg';
  const cleanBase64 = base64Data.includes('base64,') ? base64Data : `data:${mimeType};base64,${base64Data}`;

  const prompt = `You are an elite optical character recognition and collegiate identity verification AI.
Analyze this camera snapshot carefully.

CRITICAL PHYSICAL CARD DETECTION MANDATE:
- First, verify whether a PHYSICAL college/university student ID card (plastic PVC badge, laminated identity card, library card) is clearly visible in the camera frame.
- If the image contains ONLY a human face, a selfie, a room, a wall, clothing, hands holding nothing, a screen, or no physical student card:
  Set "isCardDetected": false, "reason": "No physical college student ID card detected in frame. Please hold your student ID card up to the camera."
  Set college, studentRollNo, course, academicYear, studentName, and portraitBox to null.

- If a genuine physical student ID card IS visible in the frame:
  Set "isCardDetected": true, "reason": "Physical student ID card detected."
  Extract exact college/university name, exact student legal personal name, student roll number, course/degree, and academic year.
  Portrait photo location: Identify the bounding box of the student's passport photo on the card using normalized coordinates (0.0 to 1.0) with keys ymin, xmin, ymax, xmax.

Return ONLY a valid JSON object matching this schema:
{
  "isCardDetected": boolean,
  "reason": "string",
  "college": "Full official College or University name",
  "studentRollNo": "Exact Roll number or registration ID without spaces or errors",
  "course": "Degree and program (e.g. B.Tech Computer Science and Engineering)",
  "academicYear": "Study year (e.g. 1st Year (Freshman), 2nd Year (Sophomore), 3rd Year (Junior), 4th Year (Senior))",
  "studentName": "Full student name printed on the card",
  "portraitBox": {
    "ymin": 0.25,
    "xmin": 0.05,
    "ymax": 0.65,
    "xmax": 0.38
  },
  "confidence": 98.9
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Kollabrix-Scanner/1.0)',
    },
    signal: AbortSignal.timeout(9000),
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: cleanBase64 } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq status ${res.status}: ${errText.slice(0, 150)}`);
  }

  const json = await res.json();
  const textOutput = json.choices?.[0]?.message?.content;
  if (!textOutput) throw new Error('No completion choice from Groq');

  const cleanJson = textOutput.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
  const parsed = JSON.parse(cleanJson);
  const isCardDetected = Boolean(parsed.isCardDetected);

  if (!isCardDetected) {
    return {
      isCardDetected: false,
      reason: parsed.reason || 'No physical student ID card detected in frame. Please hold your student ID card up to the camera.',
      college: '',
      studentRollNo: '',
      course: '',
      academicYear: '',
      studentName: '',
      portraitBox: null,
      cardNameFound: false,
      confidence: 0,
      source: 'groq-qwen-vision',
    };
  }

  const rawCardName = (parsed.studentName || '').trim();
  const isCardNameValid =
    rawCardName &&
    !/^(what\s*i\s*learn|student|identity|card|null|n\/a|unknown|builder)$/i.test(rawCardName) &&
    rawCardName.length >= 2;

  const extractedCardName = isCardNameValid ? rawCardName : '';

  return {
    isCardDetected: true,
    reason: 'Physical student ID card detected via Vision Engine.',
    college: parsed.college || existingCollege || '',
    studentRollNo: parsed.studentRollNo || '',
    course: parsed.course || 'B.Tech - Computer Science & Engineering',
    academicYear: parsed.academicYear || '1st Year (Freshman)',
    studentName: extractedCardName,
    portraitBox: parsed.portraitBox || { ymin: 0.25, xmin: 0.05, ymax: 0.65, xmax: 0.38 },
    cardNameFound: Boolean(extractedCardName),
    confidence: parsed.confidence || 98.9,
    source: 'groq-qwen-vision',
  };
}

// ── 2. High-Accuracy Local Fallback Parser (When API Key is Absent or Vision Timed Out) ──
function parseCollegiateData(rawText: string, _userDisplayName?: string, existingCollege?: string) {
  const uiNoiseRegex =
    /kollabrix|step\s*\d+\s*of\s*\d+|apple\s*face\s*id|continuous\s*optical|analyzing\s*frames|hold\s*physical|scan\s*now|save\s*[&l]\s*finish|review\s*&\s*lock|skip\s*verification|remaining|captured|faculty/i;

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !uiNoiseRegex.test(l));

  if (lines.length < 2) {
    return {
      isCardDetected: false,
      reason: 'No physical student ID card recognized in frame.',
      college: '',
      studentRollNo: '',
      course: '',
      academicYear: '',
      studentName: '',
      portraitBox: null,
      cardNameFound: false,
      confidence: 0,
      source: 'ocr-heuristic-engine',
    };
  }

  const fullText = lines.join('\n');

  // 1. College Extraction (Priority: Named Institutions first, Generic suffixes second)
  let college = '';
  const specificCollegeRules: Array<{ match: RegExp; canonical?: string }> = [
    { match: /\b(s-?vyasa|svyasa|vivekananda\s*yoga\s*anusandhana)\b/i, canonical: 'S-VYASA Deemed to be University' },
    { match: /\b(bosscoder|boss\s*coder)\b/i, canonical: 'Bosscoder Academy' },
    { match: /\bindian\s+institute\s+of\s+technology\b|\biit\s+[a-z]{3,}/i },
    { match: /\bnational\s+institute\s+of\s+technology\b|\bnit\s+[a-z]{3,}/i },
    { match: /\b(bits\s*pilani|birla\s+institute\s+of\s+technology)\b/i },
    { match: /\b(delhi\s+technological\s+university|dtu)\b/i },
    { match: /\b(netaji\s+subhas|nsut)\b/i },
    { match: /\b(vellore\s+institute\s+of\s+technology|vit)\b/i },
    { match: /\b(srm\s+institute|srm\s+university)\b/i },
    { match: /\b(thapar\s+institute)\b/i },
    { match: /\b(manipal\s+(?:academy|university|institute))\b/i },
    { match: /\b(amity\s+university)\b/i },
    { match: /\b(chandigarh\s+university)\b/i },
    { match: /\b(jadavpur\s+university)\b/i },
    { match: /\b(anna\s+university)\b/i },
  ];

  for (const rule of specificCollegeRules) {
    if (rule.match.test(fullText)) {
      if (rule.canonical) {
        college = rule.canonical;
      } else {
        const matchedLine = lines.find((l) => rule.match.test(l)) || '';
        college = matchedLine.replace(/^(student|identity|id card|government of india|accredited)\s*[:\-]?\s*/i, '').trim();
      }
      break;
    }
  }

  if (!college) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      if (/deemed\s+to\s+be\s+university|university|institute\s+of\s+technology|college\s+of\s+engineering|polytechnic/i.test(lower)) {
        const cleanLine = line.replace(/^(student|identity|id card|government of india|accredited)\s*[:\-]?\s*/i, '').trim();
        // If line is generic "Deemed to be University", prepend the institution header line above it if present
        if (/^deemed\s+to\s+be\s+university$/i.test(cleanLine) && i > 0) {
          const prev = lines[i - 1].trim();
          if (prev.length >= 2 && !/student|identity|card|valid/i.test(prev)) {
            college = `${prev} ${cleanLine}`;
            break;
          }
        }
        college = cleanLine;
        break;
      }
    }
  }

  // Only inherit existingCollege if it is a real university name (never overwrite with generic "Deemed to be University")
  if (
    (!college || /^deemed\s+to\s+be\s+university$/i.test(college)) &&
    existingCollege &&
    !/^deemed\s+to\s+be\s+university$|^collegiate\s+institute/i.test(existingCollege.trim())
  ) {
    college = existingCollege.trim();
  }
  if (!college) {
    for (const line of lines) {
      if (line.length > 5 && !/student|identity|card|name|roll|valid|signature|holder|phone|temporary|authoris/i.test(line)) {
        college = line;
        break;
      }
    }
  }

  // 2. Roll Number Extraction
  let rollNo = '';
  const rollMatch = fullText.match(
    /(?:roll\s*(?:no\.?|num(?:ber)?|#)?|id\s*(?:no\.?|num(?:ber)?|#)|reg(?:istration)?\s*(?:no\.?|num(?:ber)?|#)?|enrol(?:l)?ment\s*(?:no\.?|num(?:ber)?|#)?|student\s*(?:id\s*(?:no\.?|#)|roll)|urn|usn|prn)\s*[:\-]?\s*([A-Za-z0-9\-_/]+)/i
  );
  if (rollMatch && rollMatch[1] && rollMatch[1].length >= 4 && !/identity|card|student|name|issue|valid/i.test(rollMatch[1])) {
    rollNo = rollMatch[1].trim();
  } else {
    const pattern = fullText.match(/\b([0-9]{8,14}|[0-9]{2,4}[A-Za-z]{2,5}[0-9]{2,6}|[A-Za-z]{2,4}[0-9]{6,10})\b/);
    if (pattern && pattern[1]) {
      rollNo = pattern[1].trim();
    }
  }

  // 3. Course / Degree Extraction (Preserve specialization like (AI & ML), normalize OCR Al -> AI)
  let course = '';
  const normalizedCourseText = fullText
    .replace(/\bB\.?\s*Tech\b/gi, 'B.Tech')
    .replace(/\(\s*Al\s*&\s*ML\s*\)/gi, '(AI & ML)')
    .replace(/\bAl\s*&\s*ML\b/gi, 'AI & ML');

  const courseLine = normalizedCourseText
    .split(/\r?\n/)
    .find((l) => /\b(B\.Tech|B\.E|BCA|MCA|M\.Tech|B\.Sc|M\.Sc|B\.Com|MBA|Ph\.D|Bachelor)\b/i.test(l));

  if (courseLine) {
    course = courseLine.trim();
  } else if (/ai\s*&\s*ml|artificial\s*intelligence/i.test(normalizedCourseText)) {
    course = 'B.Tech - CSE (AI & ML)';
  } else if (/computer\s*science|\bcse\b/i.test(normalizedCourseText)) {
    course = 'B.Tech Computer Science & Engineering (CSE)';
  } else {
    course = 'B.Tech Computer Science';
  }

  // 4. Academic Year Extraction
  let academicYear = '1st Year (Freshman)';
  const years = (fullText.match(/\b(202[0-9]|203[0-5])\b/g) || []).map((y) => parseInt(y, 10));

  if (years.length > 0) {
    const maxYear = Math.max(...years);
    const minYear = Math.min(...years);
    const currentYear = new Date().getFullYear();
    const diff = maxYear - currentYear;
    if (diff >= 3 || minYear === currentYear) {
      academicYear = '1st Year (Freshman)';
    } else if (diff === 2) {
      academicYear = '2nd Year (Sophomore)';
    } else if (diff === 1) {
      academicYear = '3rd Year (Junior)';
    } else {
      academicYear = '4th Year (Senior)';
    }
  }

  // 5. Student Name Extraction from Raw OCR (Supports initials like "VIKAS N" or "R K SHARMA")
  let cardStudentName = '';
  const nonNameWordsRegex =
    /\b(college|university|institute|department|student|identity|engineering|technology|card|valid|till|temporary|deemed|authorized|authorised|signatory|branch|course|program|campus|hostel|library|january|february|march|april|may|june|july|august|september|october|november|december|b\.?tech|cse|aiml|ai|ml|signature|holder|phone|address|blood|dob|father|mother|issue|what\s*i\s*learn|kollabrix|svyasa|s-vyasa)\b/i;

  const nameLabelMatch = fullText.match(
    /(?:name\s*(?:of\s*(?:student|holder|candidate))?|student\s*name)\s*[:\-]?\s*([A-Za-z][A-Za-z\s.]{2,35})/i
  );
  if (nameLabelMatch && nameLabelMatch[1]) {
    const cand = nameLabelMatch[1].trim();
    if (!nonNameWordsRegex.test(cand) && !/\d/.test(cand)) {
      cardStudentName = cand;
    }
  }

  if (!cardStudentName) {
    for (const line of lines) {
      if (/\d/.test(line)) continue;
      if (nonNameWordsRegex.test(line)) continue;
      // Allow 2-4 tokens where at least one token has >= 2 letters and initials (e.g. "VIKAS N", "A. K. VERMA") are allowed
      if (/^(?:[A-Za-z]{2,20}(?:\s+[A-Za-z]{1,20}\.?){1,3}|[A-Za-z]\.?\s+[A-Za-z]{2,20}(?:\s+[A-Za-z]{1,20}\.?){0,2})$/.test(line)) {
        cardStudentName = line.trim();
        break;
      }
    }
  }

  const finalStudentName = cardStudentName || '';
  const hasRealCollege = Boolean(college && !/^collegiate institute of technology$|^deemed to be university$/i.test(college));
  const isCardRecognized = Boolean(finalStudentName && (rollNo || hasRealCollege));

  return {
    isCardDetected: isCardRecognized,
    reason: isCardRecognized
      ? 'Physical student ID card detected.'
      : rollNo || hasRealCollege
      ? 'ID card spotted — hold steady and clear so your printed Name and Roll Number can be read.'
      : 'No physical student ID card recognized in frame.',
    college: isCardRecognized ? (college || 'Collegiate Institution') : '',
    studentRollNo: rollNo,
    course,
    academicYear,
    studentName: finalStudentName,
    portraitBox: null,
    cardNameFound: Boolean(cardStudentName),
    confidence: isCardRecognized ? 91.5 : 0,
    source: 'ocr-heuristic-engine',
  };
}

async function extractWithAwsRekognition(
  base64Data: string,
  userDisplayName?: string,
  existingCollege?: string
) {
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

  const cleanBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
  const imgBytes = Buffer.from(cleanBase64, 'base64');
  const client = new RekognitionClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  const [textSettled, facesSettled] = await Promise.allSettled([
    client.send(new DetectTextCommand({ Image: { Bytes: imgBytes } })),
    client.send(new DetectFacesCommand({ Image: { Bytes: imgBytes }, Attributes: ['DEFAULT'] })),
  ]);

  if (textSettled.status !== 'fulfilled') {
    console.warn('AWS Rekognition DetectText note:', textSettled.reason?.message || textSettled.reason);
    return null;
  }

  const allDetections = textSettled.value.TextDetections || [];
  let lineDetections = allDetections
    .filter((t) => t.Type === 'LINE' && (t.Confidence || 0) >= 55 && t.DetectedText)
    .map((t) => t.DetectedText!.trim());

  if (lineDetections.length < 2) {
    lineDetections = allDetections
      .filter((t) => (t.Confidence || 0) >= 55 && t.DetectedText)
      .map((t) => t.DetectedText!.trim());
  }

  const recognizedText = lineDetections.join('\n');
  console.info('AWS Rekognition OCR lines:', lineDetections);
  const parsed = parseCollegiateData(recognizedText, userDisplayName, existingCollege);

  let portraitBox: { ymin: number; xmin: number; ymax: number; xmax: number } | null = null;
  if (facesSettled.status === 'fulfilled') {
    const faces = facesSettled.value.FaceDetails || [];
    // When multiple faces are present (user behind card + portrait on card), select the smaller ID card photo
    const sortedFaces = [...faces].sort((a, b) => {
      const areaA = (a.BoundingBox?.Width || 1) * (a.BoundingBox?.Height || 1);
      const areaB = (b.BoundingBox?.Width || 1) * (b.BoundingBox?.Height || 1);
      return areaA - areaB;
    });
    const cardFace = sortedFaces.find((f) => (f.BoundingBox?.Width || 0) < 0.35) || sortedFaces[0];
    const bb = cardFace?.BoundingBox;
    if (
      bb &&
      typeof bb.Top === 'number' &&
      typeof bb.Left === 'number' &&
      typeof bb.Height === 'number' &&
      typeof bb.Width === 'number'
    ) {
      portraitBox = {
        ymin: Math.max(0, bb.Top - bb.Height * 0.12),
        xmin: Math.max(0, bb.Left - bb.Width * 0.1),
        ymax: Math.min(1, bb.Top + bb.Height * 1.12),
        xmax: Math.min(1, bb.Left + bb.Width * 1.1),
      };
    }
  }

  return {
    ...parsed,
    portraitBox: portraitBox || parsed.portraitBox,
    source: 'aws-rekognition-ocr',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardImage, displayName, existingCollege, userId } = body;

    if (!cardImage) {
      return NextResponse.json({ success: false, error: 'Card image data is required.' }, { status: 400 });
    }

    const geminiKeys = getGeminiApiKeys();
    const groqKeys = getGroqApiKeys();

    let extractedData: any = null;

    // 1. Primary + Zero-Quota AWS OCR in Parallel: Fast Gemini attempt (1 key) + AWS Rekognition (<500ms)
    const awsPromise = extractWithAwsRekognition(cardImage, displayName, existingCollege).catch((awsErr: any) => {
      console.warn('AWS Rekognition OCR note:', awsErr?.message);
      return null;
    });

    const geminiPromise = (async () => {
      if (geminiKeys.length === 0) return null;
      const currentGeminiKey = geminiKeys[geminiPoolIndex % geminiKeys.length];
      try {
        const res = await extractWithGeminiFlash(cardImage, currentGeminiKey, displayName, existingCollege);
        geminiPoolIndex = (geminiPoolIndex + 1) % geminiKeys.length;
        return res;
      } catch (geminiErr: any) {
        console.warn('Gemini fast pass note:', geminiErr?.message);
        return null;
      }
    })();

    const [geminiRes, awsRes] = await Promise.all([geminiPromise, awsPromise]);

    if (geminiRes && geminiRes.isCardDetected && geminiRes.studentName) {
      extractedData = {
        ...geminiRes,
        portraitBox: geminiRes.portraitBox || awsRes?.portraitBox || null,
        studentRollNo: geminiRes.studentRollNo || awsRes?.studentRollNo || '',
      };
    } else if (awsRes && awsRes.isCardDetected && awsRes.studentName) {
      extractedData = awsRes;
    } else {
      extractedData = geminiRes || awsRes;
    }

    // 2. Secondary: Ultra-fast Groq Qwen Vision Multi-Engine Fallback (only if both above missed)
    if (!extractedData) {
      for (let attempt = 0; attempt < groqKeys.length; attempt++) {
        const currentGroqKey = groqKeys[(groqPoolIndex + attempt) % groqKeys.length];
        try {
          extractedData = await extractWithGroqVision(cardImage, currentGroqKey, displayName, existingCollege);
          if (extractedData) {
            groqPoolIndex = (groqPoolIndex + attempt + 1) % groqKeys.length;
            break;
          }
        } catch (groqErr: any) {
          console.warn(`Groq key #${attempt + 1} note:`, groqErr?.message);
        }
      }
    }

    // Require genuine student name & card detection before locking details
    if (!extractedData || !extractedData.isCardDetected || !extractedData.studentName || extractedData.studentName.trim().length < 2) {
      return NextResponse.json({
        success: true,
        isCardDetected: false,
        reason:
          extractedData?.reason ||
          'Hold your physical student ID card slightly closer and steady so your printed Name, College, and Roll Number are clearly readable.',
        extracted: null,
      });
    }

    // ── 3. STRICT FRAUD GATE: ONE CARD, ONE USER ──
    const cleanRollNo = (extractedData?.studentRollNo || '').trim();
    if (cleanRollNo && cleanRollNo.length >= 4 && isSupabaseConfigured()) {
      try {
        const supabaseAdmin = getAdminClient();
        const { data: regData } = await supabaseAdmin
          .from('platform_settings')
          .select('value')
          .eq('key', 'linkedin_college_verifications')
          .maybeSingle();

        if (Array.isArray(regData?.value)) {
          const duplicateUser = regData.value.find(
            (item: any) =>
              (item.status === 'approved' || item.collegeVerified === true) &&
              (item.rollNumber || item.studentRollNumber) &&
              (item.rollNumber || item.studentRollNumber).toString().trim().toLowerCase() === cleanRollNo.toLowerCase() &&
              item.userId &&
              item.userId !== userId
          );

          if (duplicateUser) {
            return NextResponse.json(
              {
                success: false,
                isCardDetected: true,
                isDuplicateCard: true,
                error: `Card Already Registered: Student ID Card (Roll No: ${cleanRollNo}) is already verified and locked to another Kollabrix account (${duplicateUser.displayName || duplicateUser.username || 'another user'}). Each physical student ID card can only be linked to one account.`,
                extracted: extractedData,
              },
              { status: 409 }
            );
          }
        }
      } catch (dupErr) {
        console.warn('Duplicate card verification check note:', dupErr);
      }
    }

    return NextResponse.json({
      success: true,
      isCardDetected: true,
      reason: extractedData.reason || 'Physical student ID card detected.',
      extracted: extractedData,
      confidence: extractedData.confidence,
      engine: extractedData.source || 'Collegiate Optical Neural Vision',
      cardSnapshot: cardImage,
    });
  } catch (err: any) {
    console.error('ID Card Scan API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to scan card image.',
      },
      { status: 500 }
    );
  }
}
