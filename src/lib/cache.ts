import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
        const filtersRef = doc(db, 'metadata', 'filters');
        const filtersSnap = await getDoc(filtersRef);

        if (!filtersSnap.exists()) return null;

        const metadata = filtersSnap.data();
        const currentLastUpdated = metadata.lastUpdated;

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

export function invalidateServerCache() {
    serverCache = {
        hubs: null,
        metadata: null,
        lastUpdated: null,
    };
}
