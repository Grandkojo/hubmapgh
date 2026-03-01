import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
        const hubsQuery = query(collection(db, 'hubs'), where('verified', '==', true));
        const querySnapshot = await getDocs(hubsQuery);
        const hubs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
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
