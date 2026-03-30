import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getCachedData, updateServerCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cacheStatus = await getCachedData();

        if (cacheStatus && cacheStatus.fromCache) {
            return NextResponse.json({
                hubs: cacheStatus.hubs,
                metadata: cacheStatus.metadata,
                cached: true
            });
        }

        // Refresh needed
        const querySnapshot = await adminDb.collection('hubs').where('verified', '==', true).get();
        const hubs = querySnapshot.docs.map(hubDoc => ({
            id: hubDoc.id,
            ...hubDoc.data()
        }));

        if (cacheStatus) {
            updateServerCache(hubs, cacheStatus.metadata, cacheStatus.currentLastUpdated!);
        }

        return NextResponse.json({
            hubs,
            metadata: cacheStatus?.metadata || {},
            cached: false
        });
    } catch (error: any) {
        console.error('Hubs API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
