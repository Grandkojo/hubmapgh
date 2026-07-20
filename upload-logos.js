require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let app;
if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    app = initializeApp({
        credential: cert(serviceAccount)
    });
} else {
    app = getApps()[0];
}

const db = getFirestore(app, 'hubmapgh');
const HUBS_DIR = path.join(__dirname, 'public', 'hubs');

async function run() {
  if (!fs.existsSync(HUBS_DIR)) {
    console.log('No public/hubs directory found.');
    return;
  }

  const snapshot = await db.collection('d_hubs').get();
  console.log(`Found ${snapshot.size} hubs in Firestore.`);

  for (const doc of snapshot.docs) {
    const hub = doc.data();
    if (!hub.name) continue;

    const cleanName = hub.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filePath = path.join(HUBS_DIR, `${cleanName}.png`);

    if (fs.existsSync(filePath)) {
      console.log(`Found local logo for ${hub.name}. Uploading to Cloudinary...`);
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'hubs_logos',
          public_id: cleanName,
          overwrite: true
        });

        console.log(`Uploaded! URL: ${result.secure_url}`);
        
        await doc.ref.update({ logo: result.secure_url });
        console.log(`Updated Firestore document for ${hub.name} with logo.`);
      } catch (err) {
        console.error(`Failed to upload or update for ${hub.name}:`, err);
      }
    }
  }

  console.log('Finished uploading logos and updating database.');
  process.exit(0);
}

run();
