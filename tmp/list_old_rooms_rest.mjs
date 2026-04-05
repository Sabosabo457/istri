import fs from 'fs';

async function listRoomsByRest() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/rooms?key=${apiKey}`;

  console.log(`Fetching rooms via REST API from project: ${projectId}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status} ${await res.text()}`);
    
    const data = await res.json();
    const rooms = data.documents || [];
    
    const oldRooms = rooms
      .filter(doc => !doc.fields.ownerId)
      .map(doc => {
        const id = doc.name.split('/').pop();
        const title = doc.fields.title?.stringValue || "Untitled";
        return { id, title };
      });

    const result = {
      count: oldRooms.length,
      rooms: oldRooms,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('tmp/old_rooms_list.json', JSON.stringify(result, null, 2));
    console.log(`Successfully identified ${oldRooms.length} old rooms.`);
  } catch (err) {
    console.error("REST API Error:", err);
    fs.writeFileSync('tmp/error.log', err.toString());
    process.exit(1);
  }
}

listRoomsByRest();
