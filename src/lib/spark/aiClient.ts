import { getMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { SparkModelSettings } from '@/app/api/spark/settings/route';

const FAST_GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3-flash-preview'];
const DEEP_GEMINI_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
];

export type SparkModelTier = 'fast' | 'deep';

export interface SparkAttachment {
  name: string;
  mimeType: string;
  base64: string;
}

export interface SparkChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  engine?: string;
  attachmentNames?: string[];
  actions?: Array<{ label: string; href: string; kind: 'arena' | 'icpc' | 'teammates' | 'workspace' | 'folio' | 'hackathon' }>;
}

export interface CallSparkLLMOptions {
  systemPrompt: string;
  userPrompt: string;
  history?: SparkChatMessage[];
  attachments?: SparkAttachment[];
  jsonMode?: boolean;
  temperature?: number;
  timeoutMs?: number;
  tier?: SparkModelTier;
}

// Lightweight in-memory daily quota tracker to keep AI costs predictable
const dailyUsageMap = new Map<string, { date: string; fast: number; deep: number }>();

export function checkAndConsumeSparkQuota(
  actorKey: string,
  requestedTier: SparkModelTier,
  isAuthenticated: boolean
): { allowed: boolean; effectiveTier: SparkModelTier; deepRemaining: number; fastRemaining: number; note?: string } {
  const today = new Date().toISOString().split('T')[0];
  const entry = dailyUsageMap.get(actorKey);
  const current = entry && entry.date === today ? entry : { date: today, fast: 0, deep: 0 };

  const maxFast = isAuthenticated ? 40 : 8;
  const maxDeep = isAuthenticated ? 6 : 1;

  if (requestedTier === 'deep') {
    if (current.deep < maxDeep) {
      current.deep += 1;
      dailyUsageMap.set(actorKey, current);
      return {
        allowed: true,
        effectiveTier: 'deep',
        deepRemaining: maxDeep - current.deep,
        fastRemaining: maxFast - current.fast,
      };
    }
    // Fall back to fast tier if Deep Think quota is reached
    if (current.fast < maxFast) {
      current.fast += 1;
      dailyUsageMap.set(actorKey, current);
      return {
        allowed: true,
        effectiveTier: 'fast',
        deepRemaining: 0,
        fastRemaining: maxFast - current.fast,
        note: 'Daily KΛ-Pro quota reached — routed automatically to KΛ-1.',
      };
    }
    return { allowed: false, effectiveTier: 'fast', deepRemaining: 0, fastRemaining: 0 };
  }

  if (current.fast >= maxFast) {
    return { allowed: false, effectiveTier: 'fast', deepRemaining: maxDeep - current.deep, fastRemaining: 0 };
  }

  current.fast += 1;
  dailyUsageMap.set(actorKey, current);
  return {
    allowed: true,
    effectiveTier: 'fast',
    deepRemaining: Math.max(0, maxDeep - current.deep),
    fastRemaining: Math.max(0, maxFast - current.fast),
  };
}

function isValidGeminiApiKey(key?: string): key is string {
  const k = (key || '').trim();
  return k.startsWith('AIza') || k.startsWith('AQ.');
}

function resolveValidGeminiKeys(settingsKey?: string): string[] {
  const candidates = [
    settingsKey || '',
    process.env.GEMINI_API_KEY || '',
    ...(process.env.GEMINI_API_KEYS || '').split(','),
    process.env.GOOGLE_API_KEY || '',
  ]
    .map((k) => k.trim())
    .filter((k) => isValidGeminiApiKey(k));
  return Array.from(new Set(candidates));
}

/**
 * Shared 2-Tier LLM caller for all AI Spark capabilities:
 * - Fast tier: Gemini 3.5 Flash Lite (instant, ultra-low cost)
 * - Deep tier: Gemini 3 Flash (high-quality architecture, JSON & reasoning at ~1/15th Pro cost)
 */
export async function callSparkLLM(opts: CallSparkLLMOptions): Promise<{ text: string; engine: string } | null> {
  const {
    systemPrompt,
    userPrompt,
    history = [],
    jsonMode = false,
    temperature,
    timeoutMs = 25000,
    tier = 'fast',
  } = opts;

  const sparkSettings = await getMasterControlSubkey<SparkModelSettings>('sparkSettings', {
    engine: 'auto',
    geminiApiKey: '',
    openaiApiKey: '',
    temperature: 0.7,
    customSystemPrompt: '',
  });

  const geminiKeys = resolveValidGeminiKeys(sparkSettings.geminiApiKey);
  const openaiKey = sparkSettings.openaiApiKey || process.env.OPENAI_API_KEY;
  const preferredEngine = sparkSettings.engine || 'auto';
  const temp = typeof temperature === 'number' ? temperature : sparkSettings.temperature || 0.7;

  const modelChain = tier === 'deep' ? DEEP_GEMINI_MODELS : FAST_GEMINI_MODELS;

  if (geminiKeys.length > 0 && (preferredEngine === 'auto' || preferredEngine === 'gemini')) {
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    const overallStart = Date.now();
    // Try primary billed keys first without letting multi-key retries exceed reverse-proxy timeout
    const activeKeys = geminiKeys.slice(0, 2);

    for (const model of modelChain) {
      if (Date.now() - overallStart > 70000) break;
      for (const apiKey of activeKeys) {
        if (Date.now() - overallStart > 70000) break;
        try {
          const controller = new AbortController();
          const isHydrogen = model.includes('4-');
          const isPro = model.includes('pro');
          const attemptTimeout = isHydrogen ? 35000 : isPro ? 28000 : Math.min(timeoutMs, 18000);
          const timer = setTimeout(() => controller.abort(), attemptTimeout);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const generationConfig: Record<string, any> = {
            temperature: temp,
            maxOutputTokens: jsonMode ? 4096 : 2048,
          };
          if (jsonMode) generationConfig.responseMimeType = 'application/json';
          if ((model.includes('2.5') || model.includes('3-')) && model.includes('flash') && (tier === 'fast' || jsonMode)) {
            generationConfig.thinkingConfig = { thinkingBudget: 0 };
          }

          const res = await fetch(url, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig,
            }),
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              const label = tier === 'deep' ? 'KΛ-Pro' : 'KΛ-1';
              return { text: text.trim(), engine: label };
            }
          } else if (res.status === 400) {
            // Schema/request issue on this model variant; skip trying more keys for same model
            break;
          }
        } catch {
          // If Hydrogen/Pro timed out on the primary billed key, jump straight to next model in chain
          break;
        }
      }
    }
  }

  if (openaiKey && (preferredEngine === 'auto' || preferredEngine === 'openai')) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userPrompt },
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: temp,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim()) {
          return { text: text.trim(), engine: 'OpenAI (GPT-4o-mini)' };
        }
      }
    } catch {
      // Fall through to null
    }
  }

  return null;
}

/**
 * Real-time SSE streaming generator for AI Spark chat responses.
 * Supports multimodal attachments (images/PDFs) via Gemini inlineData.
 */
export async function streamSparkLLM(opts: CallSparkLLMOptions): Promise<{
  stream: ReadableStream<string>;
  engine: string;
} | null> {
  const {
    systemPrompt,
    userPrompt,
    history = [],
    attachments = [],
    temperature,
    tier = 'fast',
  } = opts;

  const sparkSettings = await getMasterControlSubkey<SparkModelSettings>('sparkSettings', {
    engine: 'auto',
    geminiApiKey: '',
    openaiApiKey: '',
    temperature: 0.7,
    customSystemPrompt: '',
  });

  const geminiKeys = resolveValidGeminiKeys(sparkSettings.geminiApiKey);
  if (geminiKeys.length === 0) return null;

  const temp = typeof temperature === 'number' ? temperature : sparkSettings.temperature || 0.7;
  const modelChain = tier === 'deep' ? DEEP_GEMINI_MODELS : FAST_GEMINI_MODELS;

  const contents: Array<{ role: 'user' | 'model'; parts: Array<any> }> = [];
  for (const msg of history.slice(-6)) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const userParts: Array<any> = [{ text: userPrompt }];
  for (const att of attachments.slice(0, 3)) {
    if (att.base64 && att.mimeType) {
      userParts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.base64,
        },
      });
    }
  }
  contents.push({ role: 'user', parts: userParts });

  const overallStart = Date.now();
  const activeKeys = geminiKeys.slice(0, 2);

  for (const model of modelChain) {
    if (Date.now() - overallStart > 70000) break;
    for (const apiKey of activeKeys) {
      if (Date.now() - overallStart > 70000) break;
      try {
        const controller = new AbortController();
        const isHydrogen = model.includes('4-');
        const isPro = model.includes('pro');
        const timer = setTimeout(() => controller.abort(), isHydrogen ? 35000 : isPro ? 28000 : 18000);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

        const generationConfig: Record<string, any> = {
          temperature: temp,
          maxOutputTokens: 2048,
        };
        if ((model.includes('2.5') || model.includes('3-')) && model.includes('flash') && tier === 'fast') {
          generationConfig.thinkingConfig = { thinkingBudget: 0 };
        }

        const res = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig,
          }),
        });
        clearTimeout(timer);

        if (!res.ok || !res.body) {
          if (res.status === 400 || res.status === 404) break;
          continue;
        }

        const engineLabel = tier === 'deep' ? 'KΛ-Pro' : 'KΛ-1';

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        const textStream = new ReadableStream<string>({
          async start(ctrl) {
            let buf = '';
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() || '';
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith('data:')) continue;
                  const payload = trimmed.slice(5).trim();
                  if (!payload || payload === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(payload);
                    const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (chunkText) ctrl.enqueue(chunkText);
                  } catch {}
                }
              }
            } catch (err) {
              ctrl.error(err);
            } finally {
              ctrl.close();
            }
          },
        });

        return { stream: textStream, engine: engineLabel };
      } catch {
        break;
      }
    }
  }

  return null;
}
