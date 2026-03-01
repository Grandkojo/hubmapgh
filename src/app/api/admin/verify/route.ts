import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { invalidateServerCache } from '@/lib/cache';

export async function PATCH(req: NextRequest) {
    try {
        const { id, verified } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing hub ID' }, { status: 400 });
        }

        const hubRef = doc(db, 'hubs', id);
        await updateDoc(hubRef, {
            verified: !!verified,
            verifiedAt: new Date().toISOString(),
        });

        await invalidateServerCache();

        return NextResponse.json({ message: `Hub ${verified ? 'verified' : 'unverified'} successfully` });
    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing hub ID' }, { status: 400 });
        }

        await deleteDoc(doc(db, 'hubs', id));

        await invalidateServerCache();

        return NextResponse.json({ message: 'Hub deleted successfully' });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
