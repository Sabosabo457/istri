"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase"; 
import { collection, onSnapshot, query, orderBy, limit, serverTimestamp, doc, setDoc, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { InAppBrowserBanner } from "@/components/shared/InAppBrowserBanner";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { BrandHeader } from "@/components/shared/BrandHeader";

type Room = { id: string; title: string; ownerId?: string };

export default function Home() {
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [inputId, setInputId] = useState("");
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const activityScrollRef = useRef<HTMLDivElement>(null);

  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useAdmin(false);

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
      if (user) {
        const history = JSON.parse(localStorage.getItem("istri_history") || "[]");
        setRecentRooms(history);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && user && recentRooms.length > 0) {
      const validateHistory = async () => {
        const { getDoc, doc } = await import("firebase/firestore");
        const validHistory: any[] = [];
        let changed = false;

        for (const room of recentRooms) {
          const roomDoc = await getDoc(doc(db, "rooms", room.id));
          if (roomDoc.exists()) {
            validHistory.push(room);
          } else {
            changed = true;
          }
        }

        if (changed) {
          localStorage.setItem("istri_history", JSON.stringify(validHistory));
          setRecentRooms(validHistory);
        }
      };
      validateHistory();
    }
  }, [authLoading, user, recentRooms.length]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(20));
    const unsubRooms = onSnapshot(q, (snap) => {
      const data: Room[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() } as Room));
      setPublicRooms(data);
    });
    return () => unsubRooms();
  }, [user]);

  const goToRoom = (id: string) => { if (!id) return; router.push(`/room/${id}`); };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const user = auth.currentUser;
    if (!user || !newRoomTitle.trim()) return;
    try {
      const q = query(collection(db, "rooms"), where("ownerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size >= 5) { setErrorMsg("上限(5つ)だよ！"); return; }
      const randomId = Math.random().toString(36).substring(2, 10);
      await setDoc(doc(db, "rooms", randomId), { title: newRoomTitle.trim(), ownerId: user.uid, createdAt: serverTimestamp(), password: null });
      goToRoom(randomId);
    } catch (e) { setErrorMsg("失敗..."); }
  };

  const handleDeleteRoom = async (e: React.MouseEvent, roomId: string, title: string) => {
    e.stopPropagation();
    if (!window.confirm(`「${title}」を削除してもいい？\n履歴からも消えます。`)) return;
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "rooms", roomId));
      const history = JSON.parse(localStorage.getItem("istri_history") || "[]");
      const newHistory = history.filter((v: any) => v.id !== roomId);
      localStorage.setItem("istri_history", JSON.stringify(newHistory));
      setRecentRooms(newHistory);
    } catch (err) { alert("削除に失敗しました..."); }
  };

  const handleScroll = (ref: any, direction: "left" | "right") => {
    if (!ref || !ref.current) return;
    const { scrollLeft, clientWidth } = ref.current;
    const offset = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
    ref.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center"><div className="w-16 h-16 border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>
  );

  return (
    <main className="min-h-screen md:h-screen bg-[#fffcf9] text-orange-950 font-pop md:overflow-hidden flex flex-col p-4 md:px-12 py-1 overflow-y-auto">
      <InAppBrowserBanner isJoined={false} />
      
      <div className="absolute top-2 right-8 z-50 flex items-center gap-3">
        {isAdmin && (
          <button onClick={() => router.push("/admin/rooms")} className="bg-orange-950/80 backdrop-blur-md border-2 border-orange-500/50 px-4 py-1.5 rounded-xl font-black text-[10px] text-orange-400 hover:bg-orange-500 hover:text-white transition-all uppercase tracking-widest shadow-xl flex items-center gap-2 group">
            <span className="text-sm group-hover:animate-spin">⚙️</span>
            管理者ダッシュボード
          </button>
        )}
        <button onClick={() => signOut(auth)} className="bg-white/50 border-2 border-orange-50 px-3 py-1 rounded-xl font-black text-[10px] text-orange-200 hover:bg-orange-500 hover:text-white transition-all uppercase tracking-widest shadow-sm">Logout</button>
      </div>

      {/* ★ ヒーローエリア: py-2 にて極限まで短縮 */}
      <section className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 py-2 shrink-0 items-center">
        <BrandHeader />

        <div className="bg-orange-600 text-white p-5 md:p-6 rounded-[2.5rem] shadow-lg relative overflow-hidden flex flex-col items-center">
          <h2 className="text-md md:text-lg font-black mb-2">✨ あたらしく作る</h2>
          <form onSubmit={handleCreateRoom} className="w-full space-y-2">
            <input type="text" value={newRoomTitle} onChange={(e)=>setNewRoomTitle(e.target.value)} placeholder="ルーム名を入力！" className="w-full bg-[#ff863e]/60 rounded-xl px-4 py-2 outline-none font-bold text-white placeholder:text-white/30 text-center text-sm" />
            <button type="submit" className="w-full bg-white text-orange-600 py-2.5 rounded-xl font-black text-md shadow-md active:translate-y-1 transition-all">ひらく！</button>
          </form>
          {errorMsg && <p className="text-[10px] bg-white text-red-500 px-2 py-0.5 rounded-full mt-1 font-black animate-bounce">{errorMsg}</p>}
        </div>

        <div className="bg-white p-5 md:p-6 rounded-[2.5rem] border-4 border-orange-50 shadow-xl flex flex-col items-center">
          <h2 className="text-md md:text-lg font-black text-orange-950 mb-2 flex items-center gap-2"><span>🔍</span>IDで入室</h2>
          <form onSubmit={(e) => { e.preventDefault(); goToRoom(inputId.trim()); }} className="w-full space-y-2">
            <input type="text" value={inputId} onChange={(e)=>setInputId(e.target.value)} placeholder="IDをにゅうりょく" className="w-full bg-[#fdf2e9] border-0 rounded-xl px-4 py-2 outline-none font-bold text-orange-950 text-center placeholder:text-orange-200 text-sm" />
            <button type="submit" className="w-full bg-[#fce9da] text-orange-600 py-2.5 rounded-xl font-black hover:bg-orange-500 hover:text-white transition-all shadow-sm text-md">入室する</button>
          </form>
        </div>
      </section>

      {/* ★ 下部エリア: space-y-1 に短縮 */}
      <div className="flex-1 min-h-0 flex flex-col space-y-1 max-w-7xl mx-auto w-full py-1 pb-12">
        
        {/* 最近いった場所 */}
        <section className="flex flex-col">
          <div className="flex justify-between items-center mb-1 px-2">
            <h2 className="text-md font-black text-orange-900 border-b-4 border-orange-50">最近いった場所</h2>
            <div className="flex gap-2">
              <button onClick={() => handleScroll(historyScrollRef, "left")} className="w-7 h-7 rounded-full bg-white border-2 border-orange-50 flex items-center justify-center text-orange-500 shadow-sm text-xs font-black">◀</button>
              <button onClick={() => handleScroll(historyScrollRef, "right")} className="w-7 h-7 rounded-full bg-white border-2 border-orange-50 flex items-center justify-center text-orange-500 shadow-sm text-xs font-black">▶</button>
            </div>
          </div>
          <div ref={historyScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 h-full items-center py-2">
            {recentRooms.length > 0 ? recentRooms.map((r) => (
              <div key={r.id} onClick={() => goToRoom(r.id)} className="shrink-0 w-[180px] bg-white p-5 rounded-[2rem] border-2 border-orange-50 flex flex-col items-center text-center cursor-pointer hover:border-orange-200 transition-all shadow-sm snap-start relative group">
                 {/* 履歴の削除ボタンはオーナーに関わらず履歴から消すだけなら可能だが一旦は共通化 */}
                 <button onClick={(e) => { e.stopPropagation(); const h = JSON.parse(localStorage.getItem("istri_history") || "[]"); const n = h.filter((v:any)=>v.id!==r.id); localStorage.setItem("istri_history",JSON.stringify(n)); setRecentRooms(n); }} className="absolute top-3 right-3 w-6 h-6 bg-orange-50 rounded-full flex items-center justify-center text-orange-200 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all text-[10px]">×</button>
                 <div className="text-2xl mb-2">🚗</div>
                 <h3 className="text-xs font-black text-orange-950 truncate w-full">{r.title}</h3>
                 <span className="text-[8px] font-black text-orange-100 uppercase mt-1">{r.id}</span>
              </div>
            )) : <div className="w-full py-6 bg-white border-4 border-dashed border-orange-50 rounded-[2.5rem] text-center text-orange-100 font-black italic text-sm">まだ履歴がありません。</div>}
          </div>
        </section>

        {/* みんなのアクティビティ */}
        <section className="flex flex-col">
          <div className="flex justify-between items-center mb-1 px-2">
            <h2 className="text-sm md:text-md font-black text-orange-300 uppercase tracking-tighter">みんなのアクティビティ</h2>
            <div className="flex gap-2">
              <button onClick={() => handleScroll(activityScrollRef, "left")} className="w-7 h-7 rounded-full bg-white border-2 border-orange-100 flex items-center justify-center text-orange-500 shadow-sm text-xs font-black">◀</button>
              <button onClick={() => handleScroll(activityScrollRef, "right")} className="w-7 h-7 rounded-full bg-white border-2 border-orange-100 flex items-center justify-center text-orange-500 shadow-sm text-xs font-black">▶</button>
            </div>
          </div>
          <div ref={activityScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 h-full items-center py-2">
            {publicRooms.map((r) => (
              <div key={r.id} onClick={() => goToRoom(r.id)} className="shrink-0 w-[180px] bg-white p-5 md:p-6 rounded-[2.5rem] border-2 border-[#fff5ef] flex flex-col items-center text-center cursor-pointer hover:border-orange-200 hover:scale-105 transition-all shadow-lg active:scale-95 snap-start relative group">
                {r.ownerId === user?.uid && (
                  <button onClick={(e) => handleDeleteRoom(e, r.id, r.title)} className="absolute top-4 right-4 w-7 h-7 bg-red-50 text-red-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all text-xs shadow-sm">🗑️</button>
                )}
                <div className="text-3xl mb-2">🏠</div>
                <h3 className="text-xs font-black text-orange-950 truncate w-full">{r.title}</h3>
                <span className="text-[9px] font-black text-orange-100 uppercase mt-1">{r.id}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
