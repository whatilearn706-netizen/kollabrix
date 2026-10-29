/**
 * Kollabrix Product Analytics & Funnel Tracking
 * 
 * Supports:
 * 1. PostHog (Session Replay & Product Analytics) via NEXT_PUBLIC_POSTHOG_KEY
 * 2. Google Analytics 4 via NEXT_PUBLIC_GA_ID
 * 3. First-Party Anonymous Event Logging (Stored locally & viewable in Admin Control Center)
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'user_signup_started'
  | 'user_signup_completed'
  | 'arena_launched'
  | 'arena_room_created'
  | 'arena_room_joined'
  | 'arena_match_started'
  | 'arena_code_compiled'
  | 'arena_match_completed'
  | 'project_created'
  | 'project_applied'
  | 'teammate_invited'
  | 'invite_link_copied';

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  properties?: Record<string, any>;
  timestamp: string;
  url: string;
}

// In-Memory & LocalStorage Buffer for Offline / Privacy-Safe First-Party Telemetry
const LOCAL_ANALYTICS_KEY = 'kollabrix_local_analytics_v1';
const MAX_LOCAL_EVENTS = 200;

export function trackEvent(event: AnalyticsEventType, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const payload: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    },
    timestamp: new Date().toISOString(),
    url: window.location.pathname + window.location.search,
  };

  // 1. PostHog Dispatch (if loaded)
  if ((window as any).posthog && typeof (window as any).posthog.capture === 'function') {
    try {
      (window as any).posthog.capture(event, properties);
    } catch {}
  }

  // 2. Google Analytics 4 Dispatch (if loaded)
  if ((window as any).gtag && typeof (window as any).gtag === 'function') {
    try {
      (window as any).gtag('event', event, properties);
    } catch {}
  }

  // 3. First-Party Local Telemetry Buffer
  try {
    const existing: AnalyticsEvent[] = JSON.parse(
      localStorage.getItem(LOCAL_ANALYTICS_KEY) || '[]'
    );
    existing.unshift(payload);
    const trimmed = existing.slice(0, MAX_LOCAL_EVENTS);
    localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {}

  // 4. Debug logger in dev or when ?debug_telemetry=1
  if (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.search.includes('debug_telemetry'))
  ) {
    console.log(`[📊 ANALYTICS] ${event}:`, properties);
  }
}

/**
 * Get recorded local funnel metrics for Admin inspection
 */
export function getLocalAnalyticsHistory(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ANALYTICS_KEY) || '[]');
  } catch {
    return [];
  }
}
