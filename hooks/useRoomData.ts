import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, serverTimestamp, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Member, Message, RoomData } from "@/types";

export function useRoomData(roomId: string, searchParams: any, router: any) {
  const [joined, setJoined] = useState(false);
  const [roomTitle, setRoomTitle] = useState("ロード中...");
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [myName, setMyName] = useState("");
  const [myColor, setMyColor] = useState("#f97316");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [status, setStatus] = useState("作業中");
  const [inputText, setInputText] = useState("");
  const [token, setToken] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [calendarLogs, setCalendarLogs] = useState<Record<string, any>>({});
  const [joinTime, setJoinTime] = useState(Date.now());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const unsubsRef = useRef<(() => void)[]>([]);

  const cleanup = () => {
    unsubsRef.current.forEach(unsub => unsub());
    unsubsRef.current = [];
  };

  const updateHistory = (id: string, title: string) => {
    try {
      const history = JSON.parse(localStorage.getItem("istri_history") || "[]");
      const filtered = history.filter((r: any) => r.id !== id);
      const newHistory = [{ id, title }, ...filtered].slice(0, 10);
      localStorage.setItem("istri_history", JSON.stringify(newHistory));
    } catch (e) { console.error("History update failed", e); }
  };

  useEffect(() => {
    cleanup();
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.push("/login"); return; }
      
      setCurrentUserId(user.uid);
      setMyName(user.displayName || "ななし");
      setPhotoURL(user.photoURL);
        
      const snap = await getDoc(doc(db, "rooms", roomId));
      if (snap.exists()) {
        const roomData = snap.data() as RoomData;
        setRoomTitle(roomData.title);
        setOwnerId(roomData.ownerId || null);
        
        const memberSnap = await getDoc(doc(db, "rooms", roomId, "members", user.uid));
        
        if (!roomData.password || memberSnap.exists()) {
          setJoinTime(Date.now());
          await setDoc(doc(db, "rooms", roomId, "members", user.uid), {
            name: user.displayName || "ななし",
            color: memberSnap.exists() ? memberSnap.data()?.color : "#f97316",
            photoURL: user.photoURL,
            status: memberSnap.exists() ? memberSnap.data()?.status : "作業中",
            statusUpdatedAt: serverTimestamp(),
            lastActive: serverTimestamp()
          }, { merge: true });
          setJoined(true);
          updateHistory(roomId, roomData.title);
        } else {
          alert("この部屋にはパスワードが必要です。");
          router.push("/");
        }
      } else {
        router.push("/");
      }

      unsubsRef.current.push(onSnapshot(query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "asc"), limit(100)), (sn) => {
        setMessages(sn.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
      }));
      
      unsubsRef.current.push(onSnapshot(query(collection(db, "rooms", roomId, "members"), orderBy("lastActive", "desc")), (sn) => {
        setMembers(sn.docs.map(d => ({ id: d.id, ...d.data() } as Member)));
      }));
      
      unsubsRef.current.push(onSnapshot(collection(db, "rooms", roomId, "activity"), (sn) => {
        const logs: Record<string, any> = {};
        sn.docs.forEach(d => { logs[d.id] = d.data(); });
        setCalendarLogs(logs);
      }));
    });

    return () => {
      unsubAuth();
      cleanup();
    };
  }, [roomId, router]);

  const sendMessage = async (e?: any, type: "text" | "image" = "text", content?: string | File | Blob) => {
    if (e) e.preventDefault();
    if (type === "text") setInputText("");
    
    let finalImageUrl = null;
    if (type === "image" && content) {
      if (content instanceof File || content instanceof Blob) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const storageRef = ref(storage, `rooms/${roomId}/chat/${fileName}`);
        const uploadResult = await uploadBytes(storageRef, content);
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      } else {
        finalImageUrl = content;
      }
    }

    await setDoc(doc(collection(db, "rooms", roomId, "messages")), {
      text: type === "text" ? inputText : "", 
      imageUrl: finalImageUrl, 
      senderId: currentUserId, 
      senderName: myName, 
      createdAt: serverTimestamp()
    });
  };

  const handleJoinVoice = async () => {
    const res = await fetch("/api/livekit", { method: "POST", body: JSON.stringify({ room: roomId, identity: myName }) });
    const data = await res.json();
    if (data.token) { setToken(data.token); setVoiceEnabled(true); }
  };

  return {
    states: { joined, roomTitle, messages, members, myName, myColor, photoURL, status, inputText, token, voiceEnabled, calendarLogs, joinTime, currentUserId, ownerId },
    setters: { setInputText, setMyName, setMyColor, setPhotoURL, setStatus, setVoiceEnabled },
    refs: { scrollRef },
    handlers: { 
      join: () => setJoined(true),
      sendMessage, 
      saveNote: async (day: string, note: string) => { 
        if (!currentUserId) return; 
        await setDoc(doc(db, "rooms", roomId, "activity", day), { users: { [currentUserId]: { note, lastUpdate: serverTimestamp() } } }, { merge: true }); 
      }, 
      handleJoinVoice, 
      handleLeave: () => router.push("/") 
    }
  };
}
