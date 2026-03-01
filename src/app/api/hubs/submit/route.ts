import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { invalidateServerCache } from '@/lib/cache';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, city, neighborhood, description, website, contact, tags, coordinates } = body;

        // Basic validation
        if (!name || !city || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const hubData = {
            name,
            city,
            neighborhood: neighborhood || '',
            description,
            website: website || '#',
            contact: contact || '',
            tags: tags || [],
            verified: false,
            submittedAt: serverTimestamp(),
            submittedBy: 'community',
            coordinates: coordinates || { lat: 0, lng: 0 },
            founded: new Date().getFullYear(),
        };

        const docRef = await addDoc(collection(db, 'hubs'), hubData);

        await invalidateServerCache();

        return NextResponse.json({ id: docRef.id, message: 'Hub submitted for review!' }, { status: 201 });
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
