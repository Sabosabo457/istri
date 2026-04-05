
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query } = require('firebase/firestore');
const fs = require('fs');

// config 読み込み (lib/firebase.ts から手動で抽出するか、環境変数を使用)
// ここでは簡易的に .env.local 等から設定を想定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function listOldRooms() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const q = query(collection(db, "rooms"));
  const snap = await getDocs(q);
  
  const oldRooms = [];
  snap.forEach(doc => {
    const data = doc.data();
    if (!data.ownerId) {
      oldRooms.push({ id: doc.id, title: data.title });
    }
  });
  
  console.log("--- OWNER MISSING ROOMS ---");
  console.log(JSON.stringify(oldRooms, null, 2));
}

listOldRooms();
