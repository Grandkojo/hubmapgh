import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { invalidateServerCache } from '@/lib/cache';

export async function GET() {
    try {
        const docRef = doc(db, 'metadata', 'filters');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return NextResponse.json(docSnap.data());
        }
        return NextResponse.json({ cities: [], focusAreas: [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { cities, focusAreas } = await req.json();
        const docRef = doc(db, 'metadata', 'filters');

        const lastUpdated = new Date().toISOString();
        await updateDoc(docRef, {
            cities,
            focusAreas,
            lastUpdated
        });

        invalidateServerCache();

        return NextResponse.json({ message: 'Metadata updated successfully', lastUpdated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
