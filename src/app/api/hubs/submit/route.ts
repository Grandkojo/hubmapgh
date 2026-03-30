import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
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
            submittedAt: FieldValue.serverTimestamp(),
            submittedBy: 'community',
            coordinates: coordinates || { lat: 0, lng: 0 },
            founded: new Date().getFullYear(),
        };

        const docRef = await adminDb.collection('hubs').add(hubData);

        await invalidateServerCache();

        return NextResponse.json({ id: docRef.id, message: 'Hub submitted for review!' }, { status: 201 });
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
