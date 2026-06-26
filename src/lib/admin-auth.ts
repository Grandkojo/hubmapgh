import { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isSuperAdmin(email: string): boolean {
  if (!email) return false
  return parseAdminEmails().includes(email.toLowerCase())
}

export async function verifyAdminRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token) {
    return { ok: false as const, status: 401, error: 'Missing Authorization bearer token' }
  }

    try {
    const decoded = await adminAuth.verifyIdToken(token, true)
    const email = (decoded.email || '').toLowerCase()
    const superAdmin = isSuperAdmin(email)
    const hasAdminClaim = decoded.admin === true

    if (!hasAdminClaim && !superAdmin) {
      return { ok: false as const, status: 403, error: 'Forbidden: admin access required' }
    }

    return { ok: true as const, decoded, email, isSuperAdmin: superAdmin }
  } catch (error) {
    return { ok: false as const, status: 401, error: 'Invalid or expired token' }
  }
}
