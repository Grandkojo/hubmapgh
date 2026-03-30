import { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
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
    const allowlistedEmails = parseAdminEmails()
    const hasAdminClaim = decoded.admin === true
    const isAllowlisted = allowlistedEmails.length > 0 && allowlistedEmails.includes(email)

    if (!hasAdminClaim && !isAllowlisted) {
      return { ok: false as const, status: 403, error: 'Forbidden: admin access required' }
    }

    return { ok: true as const, decoded }
  } catch (error) {
    return { ok: false as const, status: 401, error: 'Invalid or expired token' }
  }
}
