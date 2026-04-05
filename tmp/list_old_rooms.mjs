import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, doc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function listOldRooms() {
  console.log("Connecting to Firebase...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const q = query(collection(db, "rooms"));
  const snap = await getDocs(q);
  
  const oldRooms = [];
  snap.forEach(d => {
    const data = d.data();
    if (!data.ownerId) {
      oldRooms.push({ id: d.id, title: data.title });
    }
  });
  
  console.log("--- OWNER MISSING ROOMS ---");
  console.log(JSON.stringify(oldRooms, null, 2));
  console.log("Total:", oldRooms.length);
}

listOldRooms().catch(console.error);
