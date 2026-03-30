import { adminDb } from '@/lib/firebase-admin';

// In-memory cache for the server instance
let serverCache: {
    hubs: any[] | null;
    metadata: any | null;
    lastUpdated: string | null;
} = {
    hubs: null,
    metadata: null,
    lastUpdated: null,
};

export async function getCachedData() {
    try {
        const filtersRef = adminDb.collection('metadata').doc('filters');
        const filtersSnap = await filtersRef.get();

        if (!filtersSnap.exists) return null;

        const metadata = filtersSnap.data() ?? {};
        const currentLastUpdated = typeof metadata.lastUpdated === 'string' ? metadata.lastUpdated : null;

        // Return from memory if timestamps match
        if (serverCache.lastUpdated === currentLastUpdated && serverCache.hubs && serverCache.metadata) {
            return {
                hubs: serverCache.hubs,
                metadata: serverCache.metadata,
                fromCache: true
            };
        }

        // Otherwise, refresh cache (caller should fetch hubs)
        return {
            metadata,
            currentLastUpdated,
            shouldRefreshHubs: true
        };
    } catch (error) {
        console.error('Cache utility error:', error);
        return null;
    }
}

export function updateServerCache(hubs: any[], metadata: any, lastUpdated: string) {
    serverCache = {
        hubs,
        metadata,
        lastUpdated
    };
}

export async function invalidateServerCache() {
    // Clear local memory immediately
    serverCache = {
        hubs: null,
        metadata: null,
        lastUpdated: null,
    };

    // Update Firestore to notify other instances
    try {
        const filtersRef = adminDb.collection('metadata').doc('filters');
        await filtersRef.update({
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        // Log but don't crash the admin route if sync fails
        console.error('Failed to sync cache invalidation to Firestore:', error);
    }
}
