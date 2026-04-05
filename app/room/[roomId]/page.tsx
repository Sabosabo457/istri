"use client";
import { useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { compressImage, formatElapsed } from "@/lib/utils";
import { useRoomData } from "../../(shared)/hooks/useRoomData";
import { InAppBrowserBanner } from "../../(shared)/components/InAppBrowserBanner";
import { MemberSidebar } from "./components/layout/MemberSidebar";
import { ChatSection } from "./components/layout/ChatSection";
import { VoiceSection } from "./components/layout/VoiceSection";
import { ProfileSettingsModal } from "./components/modals/ProfileSettingsModal";
import { RoomSettingsModal } from "./components/modals/RoomSettingsModal";
import { ActivityLogModal } from "./components/modals/ActivityLogModal";
import { SessionSummaryModal } from "./components/modals/SessionSummaryModal";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter(); const searchParams = useSearchParams();
  const { states, setters, refs, handlers } = useRoomData(roomId, searchParams, router);

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

  if (!states.joined) return (
    <main className="min-h-screen bg-orange-50 flex items-center justify-center p-4 md:p-8 font-pop relative overflow-hidden">
      <InAppBrowserBanner isJoined={false} />
      <div className="bg-white/80 backdrop-blur-3xl p-8 md:p-10 rounded-[3rem] border-8 border-orange-100 shadow-2xl flex flex-col gap-6 w-full max-w-lg z-10">
        <img src="/pic/istri_logo.png" className="w-[200px] mx-auto animate-bounce-slow" alt="istri" />
        <div className="space-y-4">
          <label className="text-xl font-black text-orange-800 ml-2 uppercase">Your Name</label>
          <input type="text" value={states.myName} disabled className="w-full bg-orange-50 border-4 border-orange-100 rounded-[1.5rem] px-6 py-4 opacity-50 text-xl font-black text-center" />
        </div>
        {states.roomPassword && (
          <div className="space-y-4">
            <label className="text-xl font-black text-orange-800 ml-2 uppercase">Password</label>
            <input type="password" value={states.passwordInput} onChange={(e)=>setters.setPasswordInput(e.target.value)} onKeyDown={(e)=>e.key==="Enter" && handlers.join()} className="w-full bg-orange-50 border-4 border-orange-100 rounded-[1.5rem] px-6 py-4 outline-none text-xl font-black text-center focus:border-orange-500" />
          </div>
        )}
        <button onClick={()=>handlers.join()} className="bg-orange-500 hover:bg-orange-400 py-6 rounded-[1.5rem] font-black text-white text-xl shadow-xl active:translate-y-1 transition-all">WORKSPACE OPEN!</button>
      </div>
    </main>
  );

  return (
    // ★ md:flex-row でPC横並び、スマホはデフォルト(flex-col)で縦並び。overflow-y-auto追加。
    <main className="min-h-screen md:h-screen bg-[#fffaf5] text-orange-950 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden font-pop select-none">
      <InAppBrowserBanner isJoined={true} />
      
      <MemberSidebar width={260} members={states.members} currentUserId={states.currentUserId} onEditProfile={() => setIsEditingProfile(true)} formatElapsed={formatElapsed} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_50%_0%,#fed7aa22,transparent_50%)]">
        <header className="px-6 md:px-10 py-4 flex items-center justify-between border-b-4 border-orange-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0" style={{ borderColor: states.myColor }}>
              {states.photoURL ? <img src={states.photoURL} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-black text-white text-xs" style={{ backgroundColor: states.myColor }}>{states.myName[0]}</span>}
            </div>
            <div className="truncate max-w-[120px] md:max-w-none">
              <h1 className="text-md md:text-xl font-black truncate">{states.roomTitle}</h1>
              <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">{states.status}</p>
            </div>
            <button onClick={() => setIsEditingTitle(true)} className="hover:scale-125 transition-transform text-xl">⚙️</button>
          </div>
          <button onClick={() => setShowCalendar(true)} className="bg-orange-100 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-xl font-black text-xs md:text-sm border-2 border-orange-200 transition-all">ACTIVITY</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar min-h-[300px]">
          <VoiceSection token={states.token} onJoinVoice={handlers.handleJoinVoice} voiceEnabled={states.voiceEnabled} />
        </div>
      </div>

      <ChatSection width={420} combinedMessages={states.messages} currentUserId={states.currentUserId} inputText={states.inputText} setInputText={setters.setInputText} onSendMessage={handlers.sendMessage} onImagePaste={() => {}} onFileSelect={async (e) => { const f=e.target.files?.[0]; if(f){const c=await compressImage(f); const r=new FileReader(); r.onloadend=()=>handlers.sendMessage(undefined,"image",r.result as string); r.readAsDataURL(c);}} } onPreviewImage={setPreviewImageUrl} scrollRef={refs.scrollRef} fileInputRef={fileInputRef} />

      {/* モーダル類 */}
      {isEditingProfile && <ProfileSettingsModal myName={states.myName} setMyName={setters.setMyName} myColor={states.myColor} setMyColor={setters.setMyColor} photoURL={states.photoURL} status={states.status} updateStatus={setters.setStatus} onAvatarSelect={async (e) => { const f=e.target.files?.[0]; if(f){const c=await compressImage(f); const r=new FileReader(); r.onloadend=()=>setters.setPhotoURL(r.result as string); r.readAsDataURL(c);}}} onUpdateProfile={() => setIsEditingProfile(false)} onClose={() => setIsEditingProfile(false)} onShowSummary={() => setShowSummary(true)} avatarInputRef={avatarInputRef} />}
      {isEditingTitle && <RoomSettingsModal newRoomId={newRoomId} setNewRoomId={setNewRoomId} newTitle={states.roomTitle} setNewTitle={() => {}} newPassword="" setNewPassword={() => {}} onIdChange={() => {}} onUpdateSettings={() => setIsEditingTitle(false)} onClose={() => setIsEditingTitle(false)} />}
      {showCalendar && <ActivityLogModal viewMonth={viewMonth} setViewMonth={setViewMonth} calendarLogs={states.calendarLogs} currentUserId={states.currentUserId} selectedDay={selectedDay} setSelectedDay={setSelectedDay} dayNoteText={dayNoteText} setDayNoteText={setDayNoteText} onSaveNote={() => {}} onClose={() => setShowCalendar(false)} />}
      {showSummary && <SessionSummaryModal reportRef={reportRef} roomTitle={states.roomTitle} members={states.members} currentUserId={states.currentUserId} calendarLogs={states.calendarLogs} outputImages={states.messages.filter(m => m.senderId === states.currentUserId && m.imageUrl).map(m => m.imageUrl!)} formatElapsed={formatElapsed} onSaveAsImage={() => toPng(reportRef.current!).then(u => { const l=document.createElement("a"); l.download="report.png"; l.href=u; l.click(); })} onClose={() => setShowSummary(false)} onLeave={handlers.handleLeave} joinTime={states.joinTime} />}
      {previewImageUrl && <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-orange-950/80 backdrop-blur-md p-4" onClick={() => setPreviewImageUrl(null)}><img src={previewImageUrl} className="rounded-[2rem] shadow-2xl border-4 border-white/20 max-w-full max-h-[80vh] object-contain" /></div>}
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffedd5; border-radius: 10px; }
      `}</style>
    </main>
  );
}
