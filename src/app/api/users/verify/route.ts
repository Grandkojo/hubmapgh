import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

    if (!token) {
        return NextResponse.json({ error: 'Missing Authorization bearer token' }, { status: 401 })
    }

    try {
        const decoded = await adminAuth.verifyIdToken(token)
        
        // Check if the user exists in the HubMap d_users collection
        const userDoc = await adminDb.collection('d_users').doc(decoded.uid).get()
        
        if (!userDoc.exists) {
            return NextResponse.json({ exists: false })
        }

        return NextResponse.json({ exists: true, role: userDoc.data()?.role })
    } catch (error: any) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
}
