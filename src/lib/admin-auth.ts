import { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

function parseEmails(envVar: string) {
  const raw = process.env[envVar] || ''
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isSuperAdmin(email: string): boolean {
  if (!email) return false
  return parseEmails('SUPER_ADMIN_EMAILS').includes(email.toLowerCase())
}

export function isEnvAdmin(email: string): boolean {
  if (!email) return false
  return parseEmails('ADMIN_EMAILS').includes(email.toLowerCase())
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
    
    const superAdmin = isSuperAdmin(email) || decoded.super_admin === true
    const envAdmin = isEnvAdmin(email)
    const hasAdminClaim = decoded.admin === true

    if (!hasAdminClaim && !superAdmin && !envAdmin) {
      return { ok: false as const, status: 403, error: 'Forbidden: admin access required' }
    }

    return { ok: true as const, decoded, email, isSuperAdmin: superAdmin }
  } catch (error) {
    return { ok: false as const, status: 401, error: 'Invalid or expired token' }
  }
}
