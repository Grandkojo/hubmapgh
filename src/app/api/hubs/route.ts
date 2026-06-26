import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getCachedData, updateServerCache } from '@/lib/cache';
import { apiRateLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
        if (!apiRateLimiter.check(ip)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        // Origin Checking
        const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
        const origin = req.headers.get('origin') || req.headers.get('referer') || '';
        
        // We only enforce origin check if it's not a direct curl (empty origin)
        // or if it's explicitly one of the allowed domains.
        const isAllowedOrigin = allowedOrigins.some(allowed => origin.startsWith(allowed));
        
        if (origin && !isAllowedOrigin && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const cacheStatus = await getCachedData();

        if (cacheStatus && cacheStatus.fromCache) {
            return NextResponse.json({
                hubs: cacheStatus.hubs,
                metadata: cacheStatus.metadata,
                cached: true
            });
        }

        // Refresh needed
        const querySnapshot = await adminDb.collection('d_hubs').where('verified', '==', true).get();
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
