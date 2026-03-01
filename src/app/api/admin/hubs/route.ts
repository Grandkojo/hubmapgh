import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { invalidateServerCache } from '@/lib/cache';

export async function GET() {
    try {
        const q = query(collection(db, 'hubs'), orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        const hubs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(hubs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, ...data } = await req.json();
        if (!id) return NextResponse.json({ error: 'Missing hub ID' }, { status: 400 });

        const hubRef = doc(db, 'hubs', id);
        await updateDoc(hubRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        invalidateServerCache();
        return NextResponse.json({ message: 'Hub updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing hub ID' }, { status: 400 });

        await deleteDoc(doc(db, 'hubs', id));
        invalidateServerCache();
        return NextResponse.json({ message: 'Hub deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
