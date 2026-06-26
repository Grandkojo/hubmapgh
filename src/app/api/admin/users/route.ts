import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
    const authResult = await verifyAdminRequest(req)
    if (!authResult.ok) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    try {
        const usersSnapshot = await adminDb.collection('d_users').orderBy('createdAt', 'desc').get()
        let users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        // Auto-seed admins & super admins from .env if they don't exist in d_users yet
        const rawAdmins = process.env.ADMIN_EMAILS || ''
        const envAdmins = rawAdmins.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
        
        const rawSuperAdmins = process.env.SUPER_ADMIN_EMAILS || ''
        const envSuperAdmins = rawSuperAdmins.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
        
        const allEnvUsers = [
            ...envSuperAdmins.map(e => ({ email: e, role: 'super_admin', claims: { admin: true, super_admin: true } })),
            ...envAdmins.map(e => ({ email: e, role: 'admin', claims: { admin: true } }))
        ]
        
        for (const envUser of allEnvUsers) {
            if (!users.some((u: any) => u.email === envUser.email)) {
                try {
                    const userRecord = await adminAuth.getUserByEmail(envUser.email)
                    await adminAuth.setCustomUserClaims(userRecord.uid, envUser.claims)
                    
                    const newAdminData = {
                        email: envUser.email,
                        role: envUser.role,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: 'system_auto_seed'
                    }
                    
                    await adminDb.collection('d_users').doc(userRecord.uid).set(newAdminData)
                    users.push({ id: userRecord.uid, ...newAdminData })
                } catch (e) {
                    console.warn(`Could not auto-seed admin ${envUser.email}:`, e)
                }
            }
        }
        
        
        return NextResponse.json({ 
            users, 
            isSuperAdmin: authResult.isSuperAdmin 
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const authResult = await verifyAdminRequest(req)
    if (!authResult.ok) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Standard admins can add standard admins. Only Super Admins can add Super Admins.
    try {
        const { email, role = 'admin' } = await req.json()
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

        if (role === 'super_admin' && !authResult.isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden: Only Super Admins can create new Super Admins' }, { status: 403 })
        }

        const normalizedEmail = email.toLowerCase().trim()
        let userRecord
        let generatedPassword = null
        let isNewUser = false

        try {
            userRecord = await adminAuth.getUserByEmail(normalizedEmail)
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                isNewUser = true
                // Generate a random secure password
                generatedPassword = Array(12).fill(0).map(() => Math.random().toString(36).charAt(2)).join('') + 'A1!'
                userRecord = await adminAuth.createUser({
                    email: normalizedEmail,
                    password: generatedPassword,
                    emailVerified: true
                })
            } else {
                throw error
            }
        }

        // Assign custom claim
        const claims = role === 'super_admin' ? { admin: true, super_admin: true } : { admin: true }
        await adminAuth.setCustomUserClaims(userRecord.uid, claims)

        // Save to d_users collection
        await adminDb.collection('d_users').doc(userRecord.uid).set({
            email: normalizedEmail,
            role: role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: authResult.email
        }, { merge: true })

        return NextResponse.json({ 
            success: true, 
            message: 'Admin added successfully',
            isNewUser,
            generatedPassword,
            uid: userRecord.uid
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const authResult = await verifyAdminRequest(req)
    if (!authResult.ok) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    if (!authResult.isSuperAdmin) {
        return NextResponse.json({ error: 'Forbidden: Only Super Admins can revoke admin access' }, { status: 403 })
    }

    try {
        const { uid } = await req.json()
        if (!uid) return NextResponse.json({ error: 'UID is required' }, { status: 400 })

        // Remove custom claim
        await adminAuth.setCustomUserClaims(uid, { admin: null, super_admin: null })

        // Update role in d_users instead of deleting
        await adminDb.collection('d_users').doc(uid).update({
            role: 'user',
            updatedAt: new Date().toISOString()
        })

        return NextResponse.json({ success: true, message: 'Admin access revoked' })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
