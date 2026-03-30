import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function parsePrivateKey(value?: string) {
  if (!value) return undefined
  return value.replace(/\\n/g, '\n')
}

type ServiceAccountEnv = {
  projectId?: string
  clientEmail?: string
  privateKey?: string
}

function getServiceAccountFromEnv(): ServiceAccountEnv {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (rawJson) {
    const parsed = JSON.parse(rawJson) as {
      project_id?: string
      client_email?: string
      private_key?: string
    }
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsePrivateKey(parsed.private_key),
    }
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  }
}

const { projectId, clientEmail, privateKey } = getServiceAccountFromEnv()

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    'Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
  )
}

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp, 'hubmapgh')
