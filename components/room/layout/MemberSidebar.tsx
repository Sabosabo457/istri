"use client";
import { Member } from "@/types";

type SidebarProps = { width: number; members: Member[]; currentUserId: string | null; onEditProfile: () => void; formatElapsed: (t: any) => string; };

export function MemberSidebar({ members, currentUserId, onEditProfile, formatElapsed }: SidebarProps) {
  return (
    <aside className="w-full md:w-[260px] flex flex-col bg-white border-b-4 md:border-b-0 md:border-r-4 border-orange-50 shrink-0">
      <header className="px-6 h-[72px] border-b-4 border-orange-50 flex items-center gap-3 shrink-0">
        <span className="text-xl">🏃‍♂️</span>
        <h2 className="text-lg font-black text-orange-950">メンバー</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {members.map((m) => {
          const isMe = m.id === currentUserId;
          return (
            <div key={m.id} onClick={isMe ? onEditProfile : undefined} className={`group flex items-center gap-3 p-3 rounded-2xl transition-all ${isMe ? "bg-orange-50 border-2 border-orange-100 cursor-pointer hover:border-orange-500" : "hover:bg-orange-50/50"}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 bg-white" style={{ borderColor: m.color }}>
                  {m.photoURL ? <img src={m.photoURL} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-black text-white text-xs" style={{ backgroundColor: m.color }}>{m.name?.[0]}</span>}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-orange-950 truncate">{m.name}</p>
                <div className="flex items-center gap-1.5 min-w-0">
                   <p className="text-[10px] font-bold text-orange-400 truncate">{m.status}</p>
                   <span className="text-orange-200">・</span>
                   <p className="text-[10px] font-black text-orange-200 shrink-0">{formatElapsed(m.lastActive)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
