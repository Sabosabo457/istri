"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { db, auth, hashPassword } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp, query, orderBy, limit, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Member, Message, DayLog, COLORS } from "../types";

export function useRoomData(roomId: string, searchParams: any, router: any) {
  // --- (中身は前のものと同じですので省略しませんが、ここから先は変更なしです) ---
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomTitle, setRoomTitle] = useState("よみこみちゅう...");
  const [roomPassword, setRoomPassword] = useState<string | null>(null);
  const [calendarLogs, setCalendarLogs] = useState<Record<string, DayLog>>({});
  const [inputText, setInputText] = useState("");
  const [myName, setMyName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [myColor, setMyColor] = useState(COLORS[0]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState<"作業中" | "休憩中">("作業中");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [token, setToken] = useState("");
  const [joinTime] = useState(new Date());
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoadMembers = useRef(true);
  const prevMembers = useRef<Record<string, Member>>({});

  const playSound = useCallback((type: string) => {
    const SOUNDS: any = {
      join: "https://firebasestorage.googleapis.com/v0/b/novel-manager-db.appspot.com/o/sounds%2Fjoin.mp3?alt=media",
      leave: "https://firebasestorage.googleapis.com/v0/b/novel-manager-db.appspot.com/o/sounds%2Fleave.mp3?alt=media",
      message: "https://firebasestorage.googleapis.com/v0/b/novel-manager-db.appspot.com/o/sounds%2Fmessage.mp3?alt=media",
      status: "https://firebasestorage.googleapis.com/v0/b/novel-manager-db.appspot.com/o/sounds%2Fstatus.mp3?alt=media"
    };
    try { const audio = new Audio(SOUNDS[type]); audio.volume = 0.4; audio.play().catch(() => {}); } catch (e) {}
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().name) {
          setMyName(userDoc.data().name); setPhotoURL(userDoc.data().photoURL || ""); setMyColor(userDoc.data().color || COLORS[0]); setIsProfileLoaded(true);
        } else { router.push("/onboarding"); }
      } else { router.push("/login"); }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "rooms", roomId), (d) => {
      if (d.exists()) { setRoomTitle(d.data().title || "むだいのルーム"); setRoomPassword(d.data().password || ""); }
      else { setRoomTitle("むだいのルーム"); setRoomPassword(""); }
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rooms", roomId, "members"), (snap) => {
      const data: Record<string, Member> = {};
      snap.forEach((d) => { data[d.id] = d.data() as Member; });
      if (!isInitialLoadMembers.current) {
        Object.keys(data).forEach(id => { if (!prevMembers.current[id]) playSound("join"); else if (prevMembers.current[id].status !== data[id].status) playSound("status"); });
        Object.keys(prevMembers.current).forEach(id => { if (!data[id]) playSound("leave"); });
      }
      isInitialLoadMembers.current = false; prevMembers.current = data; setMembers(data);
    });
    return () => unsub();
  }, [roomId, playSound]);

  useEffect(() => {
    const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const msgs: Message[] = [];
      snap.forEach((d) => { msgs.push({ id: d.id, ...d.data() } as Message); });
      setMessages(msgs);
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 200);
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (!currentUserId) return;
    const unsub = onSnapshot(collection(db, "rooms", roomId, "logs"), (snap) => {
      const logs: Record<string, DayLog> = {}; snap.forEach(d => { logs[d.id] = d.data() as DayLog; }); setCalendarLogs(logs);
    });
    return () => unsub();
  }, [roomId, currentUserId]);

  const join = async (passToUse?: string) => {
    if (!myName.trim() || !currentUserId) return;
    const finalPass = passToUse !== undefined ? passToUse : passwordInput;
    const roomRef = doc(db, "rooms", roomId);
    const roomDoc = await getDoc(roomRef);
    const savedPass = roomDoc.data()?.password;
    if (savedPass) {
      const hashedInput = await hashPassword(finalPass);
      if (savedPass !== hashedInput) { setPasswordError("合言葉がちがうみたい..."); return; }
    }
    if (!roomDoc.exists()) await setDoc(roomRef, { title: searchParams.get("title") || "むだしのお部屋", password: null, createdAt: serverTimestamp() });
    await setDoc(doc(db, "rooms", roomId, "members", currentUserId), { name: myName, status, color: myColor, photoURL, joinedAt: serverTimestamp(), statusUpdatedAt: serverTimestamp() });
    setJoined(true);
    if (finalPass) localStorage.setItem(`room_pass_${roomId}`, finalPass);
  };

  useEffect(() => {
    const saved = localStorage.getItem(`room_pass_${roomId}`);
    if (!joined && isProfileLoaded && roomPassword !== null) {
      if (roomPassword === "" || roomPassword === (searchParams.get("pass") || saved)) join(searchParams.get("pass") || saved || "");
    }
  }, [joined, isProfileLoaded, roomPassword, roomId, searchParams, join]);

  const sendMessage = async (e?: React.FormEvent, type: "text" | "image" = "text", content?: string) => {
    e?.preventDefault();
    if (!currentUserId || (type === "text" && !inputText.trim())) return;
    const text = type === "text" ? inputText : null;
    const imageUrl = type === "image" ? content : null;
    if (type === "text") setInputText("");
    await addDoc(collection(db, "rooms", roomId, "messages"), { text, imageUrl, senderId: currentUserId, senderName: myName, createdAt: serverTimestamp() });
  };

  const handleJoinVoice = async () => {
    const res = await fetch(`/api/livekit-token?room=${roomId}&name=${encodeURIComponent(myName)}`);
    const { token } = await res.json(); setToken(token); setVoiceEnabled(true);
  };

  const handleLeave = async () => { if (currentUserId) await deleteDoc(doc(db, "rooms", roomId, "members", currentUserId)); router.push("/"); };

  return {
    states: { members, messages, roomTitle, roomPassword, calendarLogs, inputText, myName, photoURL, myColor, currentUserId, isProfileLoaded, joined, status, voiceEnabled, token, joinTime, passwordInput, passwordError },
    setters: { setMyName, setPhotoURL, setMyColor, setStatus, setInputText, setPasswordInput },
    refs: { scrollRef },
    handlers: { join, sendMessage, handleJoinVoice, handleLeave }
  };
}
