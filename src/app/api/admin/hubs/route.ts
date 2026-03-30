import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdminRequest(req)
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const snapshot = await adminDb.collection('hubs').orderBy('name', 'asc').get();
        const hubs = snapshot.docs.map((hubDoc) => ({
            id: hubDoc.id,
            ...hubDoc.data()
        }));
        return NextResponse.json(hubs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const auth = await verifyAdminRequest(req)
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const { id, ...data } = await req.json();
        if (!id) return NextResponse.json({ error: 'Missing hub ID' }, { status: 400 });

        const hubRef = adminDb.collection('hubs').doc(id);
        await hubRef.update({
            ...data,
            updatedAt: new Date().toISOString()
        });

        await adminDb.collection('metadata').doc('filters').set({ lastUpdated: new Date().toISOString() }, { merge: true })
        return NextResponse.json({ message: 'Hub updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const auth = await verifyAdminRequest(req)
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing hub ID' }, { status: 400 });

        await adminDb.collection('hubs').doc(id).delete();
        await adminDb.collection('metadata').doc('filters').set({ lastUpdated: new Date().toISOString() }, { merge: true })
        return NextResponse.json({ message: 'Hub deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
