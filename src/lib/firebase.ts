import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported, logEvent as fbLogEvent, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Avoid re-initialising on hot reload in dev
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const db = getFirestore(app)

// Analytics is browser-only — guard with isSupported()
let analyticsInstance: Analytics | null = null

export async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null
  if (analyticsInstance) return analyticsInstance
  const supported = await isSupported()
  if (!supported) return null
  analyticsInstance = getAnalytics(app)
  return analyticsInstance
}

// ─── Typed event helpers ────────────────────────────────────────────────────

/** Log any custom event (fire-and-forget) */
export async function logEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  const analytics = await getAnalyticsInstance()
  if (!analytics) return
  fbLogEvent(analytics, eventName, params)
}

/** Track a hub card click / visit-site */
export async function trackHubView(hubId: string, hubName: string) {
  await logEvent('hub_viewed', { hub_id: hubId, hub_name: hubName })
}

/** Track an AI recommendation query */
export async function trackAIQuery(query: string, resultCount: number) {
  await logEvent('ai_recommend_query', {
    query_length: query.length,
    result_count: resultCount,
  })
}

/** Track filter usage */
export async function trackFilter(type: 'city' | 'tag' | 'search', value: string) {
  await logEvent('filter_used', { filter_type: type, filter_value: value })
}

/** Track a hub check-in */
export async function trackCheckin(hubId: string) {
  await logEvent('hub_checkin', { hub_id: hubId })
}
