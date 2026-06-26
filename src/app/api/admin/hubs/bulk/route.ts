import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdminRequest(req);
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { hubs } = await req.json();

        if (!Array.isArray(hubs) || hubs.length === 0) {
            return NextResponse.json({ error: 'No hubs provided' }, { status: 400 });
        }

        const batch = adminDb.batch();
        const hubsCollection = adminDb.collection('d_hubs');

        let validCount = 0;
        let invalidCount = 0;

        for (const hub of hubs) {
            // Validation
            if (!hub.name || !hub.city) {
                invalidCount++;
                continue; // Skip invalid entries
            }

            const docRef = hub.id ? hubsCollection.doc(hub.id) : hubsCollection.doc();
            
            // Clean up the object (avoid undefined fields in Firestore)
            const cleanHub = { ...hub };
            delete cleanHub.id;

            batch.set(docRef, {
                ...cleanHub,
                verified: true,
                updatedAt: new Date().toISOString(),
                coordinates: {
                    lat: parseFloat(hub.lat) || 0,
                    lng: parseFloat(hub.lng) || 0
                }
            }, { merge: true }); // Upsert
            validCount++;
        }

        if (validCount === 0) {
            return NextResponse.json({ error: 'All provided hubs failed validation.' }, { status: 400 });
        }

        // Commit the batch
        await batch.commit();

        // Update metadata filter timestamp
        await adminDb.collection('metadata').doc('filters').set({ lastUpdated: new Date().toISOString() }, { merge: true });

        return NextResponse.json({
            message: `Bulk import successful. Created ${validCount} hubs.`,
            stats: { valid: validCount, invalid: invalidCount }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
