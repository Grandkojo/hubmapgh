import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdminRequest(req)
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const docRef = adminDb.collection('metadata').doc('filters');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return NextResponse.json(docSnap.data());
        }
        return NextResponse.json({ cities: [], focusAreas: [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdminRequest(req)
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const { cities, focusAreas, rename } = await req.json();
        const docRef = adminDb.collection('metadata').doc('filters');

        const lastUpdated = new Date().toISOString();

        // Handle bulk rename if provided
        if (rename) {
            const { type, oldName, newName } = rename;
            const hubsRef = adminDb.collection('hubs');
            const qActual = type === 'city'
                ? hubsRef.where('city', '==', oldName)
                : hubsRef.where('tags', 'array-contains', oldName);

            const snapshot = await qActual.get();
            const batch = adminDb.batch();

            snapshot.docs.forEach((hubDoc) => {
                if (type === 'city') {
                    batch.update(hubDoc.ref, { city: newName });
                } else {
                    const data = hubDoc.data();
                    const newTags = (data.tags || []).map((t: string) => t === oldName ? newName : t);
                    batch.update(hubDoc.ref, { tags: newTags });
                }
            });

            await batch.commit();
        }

        await docRef.update({
            cities,
            focusAreas,
            lastUpdated
        });

        return NextResponse.json({ message: 'Metadata and hubs updated successfully', lastUpdated });
    } catch (error: any) {
        console.error('Metadata update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
