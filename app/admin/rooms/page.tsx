"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { useAdmin } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";

type Room = {
  id: string;
  title: string;
  ownerId?: string;
  createdAt?: any;
};

export default function AdminRoomsPage() {
  const { isAdmin, loading: adminLoading } = useAdmin(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
    });
    return () => unsub();
  }, [isAdmin]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredRooms.length) setSelectedIds([]);
    else setSelectedIds(filteredRooms.map(r => r.id));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`${selectedIds.length} 個のルームを本当に削除しますか？`)) return;
    
    setIsDeleting(true);
    try {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, "rooms", id));
      }

      // ローカルの閲覧履歴からも削除
      const history = JSON.parse(localStorage.getItem("istri_history") || "[]");
      const newHistory = history.filter((room: any) => !selectedIds.includes(room.id));
      localStorage.setItem("istri_history", JSON.stringify(newHistory));

      setSelectedIds([]);
      alert("完了しました！");
    } catch (err) {
      alert("失敗しました...");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (adminLoading) return <div className="min-h-screen bg-orange-50 flex items-center justify-center font-black text-orange-500 animate-pulse text-2xl uppercase">Authenticating...</div>;

  return (
    <main className="min-h-screen bg-[#fff8f3] text-orange-950 font-pop p-4 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Admin Dashboard</span>
              <h1 className="text-4xl font-black text-orange-950">ルームかんり</h1>
            </div>
            <p className="text-orange-300 font-bold text-sm italic">すべての部屋を監視・整理します。</p>
          </div>
          <button onClick={() => router.push("/")} className="bg-white border-4 border-orange-100 px-6 py-2 rounded-2xl font-black text-orange-300 hover:bg-orange-50 hover:text-orange-500 transition-all text-sm">◀ トップへもどる</button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-orange-50 shadow-xl flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              placeholder="ルーム名やIDでさがす..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-orange-50 border-4 border-transparent focus:border-orange-200 rounded-2xl px-6 py-3 outline-none font-bold text-orange-950 placeholder:text-orange-200"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0 || isDeleting}
              className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-black text-white shadow-lg transition-all ${selectedIds.length > 0 ? 'bg-red-500 hover:bg-red-600 scale-105' : 'bg-red-200 cursor-not-allowed opacity-50'}`}
            >
              {isDeleting ? '削除中...' : `選択中(${selectedIds.length})を消去`}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border-4 border-orange-50 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-orange-50 text-orange-400 font-black text-[11px] uppercase tracking-widest border-b-4 border-orange-100">
                  <th className="p-6 w-16 text-center">
                    <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredRooms.length} onChange={toggleAll} className="w-5 h-5 accent-orange-500 cursor-pointer" />
                  </th>
                  <th className="p-6">ルームめい / ID</th>
                  <th className="p-6 text-center">オーナー</th>
                  <th className="p-6 text-center">さくせい日時</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-orange-50">
                {filteredRooms.length > 0 ? filteredRooms.map((r) => (
                  <tr key={r.id} className={`hover:bg-orange-50/30 transition-colors ${selectedIds.includes(r.id) ? 'bg-orange-50 italic' : ''}`}>
                    <td className="p-6 text-center">
                      <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} className="w-5 h-5 accent-orange-500 cursor-pointer" />
                    </td>
                    <td className="p-6">
                      <div className="font-black text-orange-950 text-lg mb-0.5">{r.title}</div>
                      <code className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">{r.id}</code>
                    </td>
                    <td className="p-6 text-center">
                      {r.ownerId ? (
                        <span className="bg-orange-100 text-orange-500 py-1 px-3 rounded-full text-[10px] font-black tracking-tighter truncate max-w-[100px] inline-block">{r.ownerId}</span>
                      ) : (
                        <span className="bg-red-50 text-red-300 py-1 px-3 rounded-full text-[10px] font-black italic tracking-tighter">Owner Missing</span>
                      )}
                    </td>
                    <td className="p-6 text-center text-[11px] font-bold text-orange-300">
                      {r.createdAt ? (r.createdAt instanceof Timestamp ? r.createdAt.toDate().toLocaleString() : new Date(r.createdAt.seconds * 1000).toLocaleString()) : 'Unknown'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-orange-100 font-black italic text-xl uppercase tracking-tighter">ルームがみつかりません...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center py-8">
            <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest">istri Administrative Management Console</p>
        </div>
      </div>
    </main>
  );
}
