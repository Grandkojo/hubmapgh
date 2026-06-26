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
        
        // --- TEMPORARY WIPE LOGIC ---
        const snapshot = await hubsCollection.get();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        // ----------------------------

        let validCount = 0;
        let invalidCount = 0;

        for (const hub of hubs) {
            // Validation
            if (!hub.name || !hub.city) {
                invalidCount++;
                continue; // Skip invalid entries
            }

            const docRef = hubsCollection.doc(); // Auto-generate ID
            batch.set(docRef, {
                ...hub,
                verified: true, // Auto-verify since admin uploaded it
                submittedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Ensure coordinates structure exists
                coordinates: {
                    lat: parseFloat(hub.lat) || 0,
                    lng: parseFloat(hub.lng) || 0
                }
            });
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
