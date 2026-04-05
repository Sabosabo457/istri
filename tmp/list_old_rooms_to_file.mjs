import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { collection, getDocs, query } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function listOldRooms() {
  console.log("Connecting to Firebase (with Long Polling)...");
  const app = initializeApp(firebaseConfig);
  const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
  
  const q = query(collection(db, "rooms"));
  console.log("Fetching rooms...");
  const snap = await getDocs(q);
  
  const oldRooms = [];
  snap.forEach(d => {
    const data = d.data();
    if (!data.ownerId) {
      oldRooms.push({ id: d.id, title: data.title });
    }
  });
  
  const result = {
    count: oldRooms.length,
    rooms: oldRooms,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('tmp/old_rooms_list.json', JSON.stringify(result, null, 2));
  console.log(`Saved ${oldRooms.length} rooms to tmp/old_rooms_list.json`);
}

listOldRooms().catch(err => {
  console.error("Critical error:", err);
  fs.writeFileSync('tmp/error.log', err.toString());
  process.exit(1);
});
