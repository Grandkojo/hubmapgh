import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
// Using the database name provided by the user if it's not the default one
const db = getFirestore(app, 'hubmapgh');

async function migrate() {
    try {
        const hubsPath = join(process.cwd(), 'data', 'hubs.json');
        const citiesPath = join(process.cwd(), 'data', 'cities.json');
        const focusPath = join(process.cwd(), 'data', 'focus.json');

        const hubs = JSON.parse(readFileSync(hubsPath, 'utf8'));
        const cities = JSON.parse(readFileSync(citiesPath, 'utf8'));
        const focusAreas = JSON.parse(readFileSync(focusPath, 'utf8'));

        console.log(`Starting migration of ${hubs.length} hubs and metadata to database 'hubmapgh'...`);

        // Migrate Hubs
        for (const hub of hubs) {
            const hubRef = doc(collection(db, 'hubs'), hub.id);
            await setDoc(hubRef, {
                ...hub,
                submittedAt: new Date().toISOString(),
                submittedBy: 'system'
            });
            console.log(`Migrated Hub: ${hub.name}`);
        }

        // Migrate Metadata
        const filtersRef = doc(db, 'metadata', 'filters');
        await setDoc(filtersRef, {
            cities,
            focusAreas,
            lastUpdated: new Date().toISOString()
        });
        console.log('Migrated Metadata: filters');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
