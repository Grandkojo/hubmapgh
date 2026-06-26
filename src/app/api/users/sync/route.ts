import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
    // This endpoint should be called by the client right after a new user signs up on the frontend.
    // It verifies their token and adds them to the d_users collection as a standard user.
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

    if (!token) {
        return NextResponse.json({ error: 'Missing Authorization bearer token' }, { status: 401 })
    }

    try {
        const decoded = await adminAuth.verifyIdToken(token)
        const email = (decoded.email || '').toLowerCase()
        
        if (!email) {
            return NextResponse.json({ error: 'User token must contain an email' }, { status: 400 })
        }

        // Check if user already exists in d_users to avoid overwriting their role (e.g. if they are already an admin)
        const userDoc = await adminDb.collection('d_users').doc(decoded.uid).get()
        if (!userDoc.exists) {
            await adminDb.collection('d_users').doc(decoded.uid).set({
                email: email,
                role: 'user', // Standard user
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: 'public_registration'
            })
        }

        return NextResponse.json({ success: true, message: 'User profile synced' })
    } catch (error: any) {
        return NextResponse.json({ error: 'Invalid or expired token: ' + error.message }, { status: 401 })
    }
}
