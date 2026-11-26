import crypto from 'crypto';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { KA_PLANS, KaPlanId } from '@/lib/spark/plans';

export interface RazorpaySettings {
  enabled: boolean;
  keyId: string;
  keySecret: string;
  isTestMode?: boolean;
  webhookSecret?: string;
  lastUpdated?: string;
}

export async function getRazorpaySettings(): Promise<RazorpaySettings> {
  const settings = await getMasterControlSubkey<RazorpaySettings>('razorpaySettings', {
    enabled: false,
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    isTestMode: (process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_test_'),
  });

  const effectiveKeyId = (settings.keyId || process.env.RAZORPAY_KEY_ID || '').trim();
  const effectiveKeySecret = (settings.keySecret || process.env.RAZORPAY_KEY_SECRET || '').trim();
  const isEnabled = Boolean(settings.enabled && effectiveKeyId && effectiveKeySecret);

  return {
    enabled: isEnabled,
    keyId: effectiveKeyId,
    keySecret: effectiveKeySecret,
    isTestMode: effectiveKeyId.startsWith('rzp_test_'),
    webhookSecret: settings.webhookSecret || '',
    lastUpdated: settings.lastUpdated,
  };
}

export async function saveRazorpaySettings(newSettings: Partial<RazorpaySettings>): Promise<RazorpaySettings> {
  const current = await getRazorpaySettings();
  const updated: RazorpaySettings = {
    ...current,
    ...newSettings,
    keyId: (newSettings.keyId !== undefined ? newSettings.keyId : current.keyId).trim(),
    keySecret: (newSettings.keySecret !== undefined ? newSettings.keySecret : current.keySecret).trim(),
    enabled: newSettings.enabled !== undefined ? newSettings.enabled : current.enabled,
    isTestMode: (newSettings.keyId || current.keyId || '').startsWith('rzp_test_'),
    lastUpdated: new Date().toISOString(),
  };

  await updateMasterControlSubkey('razorpaySettings', updated);
  return updated;
}

/**
 * Creates an order directly with Razorpay REST API
 */
export async function createRazorpayOrder(opts: {
  planId: KaPlanId;
  userId: string;
  userEmail?: string;
  userName?: string;
}): Promise<{ orderId: string; amountPaise: number; currency: string; keyId: string }> {
  const settings = await getRazorpaySettings();
  if (!settings.enabled || !settings.keyId || !settings.keySecret) {
    throw new Error('Razorpay payment gateway is not configured or disabled by administrator.');
  }

  const planDef = KA_PLANS[opts.planId];
  if (!planDef || planDef.priceInr <= 0) {
    throw new Error('Invalid plan selected for payment.');
  }

  const amountPaise = planDef.priceInr * 100;
  const authHeader = 'Basic ' + Buffer.from(`${settings.keyId}:${settings.keySecret}`).toString('base64');

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt: `ka_${opts.planId}_${opts.userId.slice(0, 6)}_${Date.now()}`,
      notes: {
        userId: opts.userId,
        planId: opts.planId,
        userEmail: opts.userEmail || '',
        userName: opts.userName || '',
        platform: 'Kollabrix KA AI',
      },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data?.id) {
    throw new Error(data?.error?.description || 'Razorpay order creation failed.');
  }

  return {
    orderId: data.id,
    amountPaise,
    currency: 'INR',
    keyId: settings.keyId,
  };
}

/**
 * Validates HMAC SHA-256 signature returned by Razorpay Checkout
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  try {
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  } catch {
    return false;
  }
}
