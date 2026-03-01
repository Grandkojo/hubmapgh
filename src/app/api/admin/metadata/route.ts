import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, writeBatch, query, where } from 'firebase/firestore';
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
        const { cities, focusAreas, rename } = await req.json();
        const docRef = doc(db, 'metadata', 'filters');

        const lastUpdated = new Date().toISOString();

        // Handle bulk rename if provided
        if (rename) {
            const { type, oldName, newName } = rename;
            const hubsRef = collection(db, 'hubs');
            const q = query(hubsRef, where(type === 'city' ? 'city' : 'tags', 'array-contains-any', type === 'city' ? [oldName] : [oldName]));

            // Note: Firestore doesn't support 'array-contains' with a direct filter for strings easily if it's the only value.
            // For city it's a string, for tags it's an array.
            const qActual = type === 'city'
                ? query(hubsRef, where('city', '==', oldName))
                : query(hubsRef, where('tags', 'array-contains', oldName));

            const snapshot = await getDocs(qActual);
            const batch = writeBatch(db);

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

        await updateDoc(docRef, {
            cities,
            focusAreas,
            lastUpdated
        });

        invalidateServerCache();

        return NextResponse.json({ message: 'Metadata and hubs updated successfully', lastUpdated });
    } catch (error: any) {
        console.error('Metadata update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
