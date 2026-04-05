"use client";
import React, { useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { compressImage } from "@/utils/image";
import { formatElapsed } from "@/utils/date";
import { useRoomData } from "@/hooks/useRoomData";
import { InAppBrowserBanner } from "@/components/shared/InAppBrowserBanner";
import { MemberSidebar } from "@/components/room/layout/MemberSidebar";
import { ChatSection } from "@/components/room/layout/ChatSection";
import { VoiceSection } from "@/components/room/layout/VoiceSection";
import { ProfileSettingsModal } from "@/components/room/modals/ProfileSettingsModal";
import { RoomSettingsModal } from "@/components/room/modals/RoomSettingsModal";
import { ActivityLogModal } from "@/components/room/modals/ActivityLogModal";
import { SessionSummaryModal } from "@/components/room/modals/SessionSummaryModal";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const { states, setters, refs, handlers } = useRoomData(roomId, searchParams, router);

  // 全てのフラグを復活させました
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayNoteText, setDayNoteText] = useState("");
  const [newRoomId, setNewRoomId] = useState(roomId);

  const reportRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateSettings = async () => { 
    if (!states.roomTitle.trim()) return; 
    const { updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "rooms", roomId), { title: states.roomTitle.trim() }); 
    setIsEditingTitle(false); 
  };
  
  const handleDeleteRoom = async () => {
    if (!window.confirm(`「${states.roomTitle}」を削除してもいい？\nこの操作は取り消せません。`)) return;
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "rooms", roomId));
      const history = JSON.parse(localStorage.getItem("istri_history") || "[]");
      const newHistory = history.filter((v: any) => v.id !== roomId);
      localStorage.setItem("istri_history", JSON.stringify(newHistory));
      router.push("/");
    } catch (err) { alert("削除に失敗しました..."); }
  };

  // 画像貼り付け・ファイル選択のフル機能
  const handleImagePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                const compressed = await compressImage(file);
                handlers.sendMessage(undefined, "image", compressed);
            }
        }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f=e.target.files?.[0]; 
    if(f){
      const c=await compressImage(f); 
      handlers.sendMessage(undefined,"image",c); 
    }
  };

  if (!states.joined) return (
    <main className="min-h-screen bg-orange-50 flex items-center justify-center p-4 text-center">
      <InAppBrowserBanner isJoined={false} />
      <div className="bg-white/80 backdrop-blur-3xl p-8 rounded-[3rem] border-8 border-orange-100 shadow-2xl flex flex-col gap-6 w-full max-w-lg z-10 text-center">
        <img src="/pic/istri_logo.png" className="w-[200px] mx-auto opacity-50" />
        <div className="space-y-4">
          <label className="text-xl font-black text-orange-800 uppercase italic tracking-widest leading-none">Connecting...</label>
          <input type="text" value={states.myName} disabled className="w-full bg-orange-50 border-4 border-orange-100 rounded-[1.8rem] px-6 py-4 opacity-50 text-xl font-black text-center" />
        </div>
        <button onClick={()=>handlers.join()} className="bg-orange-500 hover:bg-orange-400 py-6 rounded-[1.8rem] font-black text-white text-xl shadow-xl transition-all outline-none">WORKSPACE OPEN!</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen md:h-screen bg-[#fffaf5] text-orange-950 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden font-pop select-none relative">
      <InAppBrowserBanner isJoined={true} />
      
      <MemberSidebar 
        width={260} members={states.members} currentUserId={states.currentUserId} 
        onEditProfile={() => setShowSummary(true)} // 自分をクリックで退出確認
        formatElapsed={formatElapsed} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 md:px-10 h-[72px] flex items-center justify-between border-b-4 border-orange-50 shrink-0 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsEditingProfile(true)} className="w-10 h-10 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0" style={{ borderColor: states.myColor }}>
              {states.photoURL ? <img src={states.photoURL} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-black text-white text-xs" style={{ backgroundColor: states.myColor }}>{states.myName?.[0]}</span>}
            </button>
            <div className="text-left">
              <h1 className="text-md md:text-xl font-black truncate">{states.roomTitle}</h1>
            </div>
            <button onClick={() => setIsEditingTitle(true)} className="hover:scale-125 transition-transform text-xl">⚙️</button>
          </div>
          <button onClick={() => setShowCalendar(true)} className="bg-orange-100 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-xl font-black text-xs md:text-sm border-2 border-orange-200 shadow-sm transition-all">かつどうログ</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar min-h-[300px]">
          <VoiceSection 
            token={states.token} 
            onJoinVoice={handlers.handleJoinVoice} 
            voiceEnabled={states.voiceEnabled}
            onLeaveVoice={() => setters.setVoiceEnabled(false)} 
          />
        </div>
      </div>

      <ChatSection 
        width={420} combinedMessages={states.messages} currentUserId={states.currentUserId} inputText={states.inputText} setInputText={setters.setInputText} 
        onSendMessage={handlers.sendMessage} onImagePaste={handleImagePaste} 
        onFileSelect={handleFileSelect} 
        onPreviewImage={setPreviewImageUrl} 
        scrollRef={refs.scrollRef} fileInputRef={fileInputRef}
      />

      {isEditingProfile && <ProfileSettingsModal myName={states.myName} setMyName={setters.setMyName} myColor={states.myColor} setMyColor={setters.setMyColor} photoURL={states.photoURL} status={states.status as "作業中" | "休憩中"} updateStatus={setters.setStatus as any} onAvatarSelect={async (e) => { const f=e.target.files?.[0]; if(f){const c=await compressImage(f); const r=new FileReader(); r.onloadend=()=>setters.setPhotoURL(r.result as string); r.readAsDataURL(c);}}} onUpdateProfile={() => setIsEditingProfile(false)} onClose={() => setIsEditingProfile(false)} onShowSummary={() => setShowSummary(true)} avatarInputRef={avatarInputRef} />}
      {isEditingTitle && <RoomSettingsModal newRoomId={newRoomId} setNewRoomId={setNewRoomId} newTitle={states.roomTitle} setNewTitle={() => {}} newPassword="" setNewPassword={() => {}} onIdChange={() => {}} onUpdateSettings={handleUpdateSettings} onDelete={handleDeleteRoom} onClose={() => setIsEditingTitle(false)} isOwner={states.currentUserId === states.ownerId} />}
      
      {showCalendar && (
        <ActivityLogModal 
          viewMonth={viewMonth} setViewMonth={setViewMonth} calendarLogs={states.calendarLogs} currentUserId={states.currentUserId!} 
          selectedDay={selectedDay} setSelectedDay={setSelectedDay} dayNoteText={dayNoteText} setDayNoteText={setDayNoteText} 
          onSaveNote={() => handlers.saveNote(selectedDay!, dayNoteText)} onClose={() => setShowCalendar(false)} 
        />
      )}

      {showSummary && (
        <SessionSummaryModal 
          reportRef={reportRef} roomTitle={states.roomTitle} members={states.members} currentUserId={states.currentUserId} calendarLogs={states.calendarLogs} 
          outputImages={[]} formatElapsed={formatElapsed} 
          onSaveAsImage={() => toPng(reportRef.current!).then(u => { const l=document.createElement("a"); l.download="report.png"; l.href=u; l.click(); })} 
          onClose={() => setShowSummary(false)} onLeave={handlers.handleLeave} joinTime={states.joinTime} 
        />
      )}

      {previewImageUrl && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-orange-950/80 backdrop-blur-md p-4" onClick={() => setPreviewImageUrl(null)}>
          <img src={previewImageUrl} className="rounded-[2rem] shadow-2xl max-w-full max-h-[80vh] object-contain border-4 border-white/20" />
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffedd5; border-radius: 10px; }
      `}</style>
    </main>
  );
}
