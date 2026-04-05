"use client";
import { Member } from "../../../../(shared)/types";

type Props = {
  width: number;
  members: Record<string, Member>;
  currentUserId: string | null;
  onEditProfile: () => void;
  formatElapsed: (timestamp: any) => string;
};

export function MemberSidebar({ width, members, currentUserId, onEditProfile, formatElapsed }: Props) {
  return (
    <aside style={{ width }} className="hidden md:flex flex-col bg-orange-50 border-r-4 border-orange-100 relative">
      <header className="px-6 py-6 border-b-4 border-orange-100 flex items-center gap-4">
        <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" />
        <h2 className="text-xl font-black text-orange-900">さんかメンバー</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {Object.entries(members).map(([id, m]) => (
          <div
            key={id}
            onClick={() => id === currentUserId && onEditProfile()}
            className={`flex items-center p-3 rounded-[1.2rem] border-4 border-transparent ${id === currentUserId ? 'bg-white border-orange-100 cursor-pointer shadow-sm' : ''}`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-4 bg-white" style={{ borderColor: m.color }}>
                {m.photoURL ? <img src={m.photoURL} className="w-full h-full object-cover" alt={m.name} /> : <div className="w-full h-full flex items-center justify-center font-black text-white" style={{ backgroundColor: m.color }}>{m.name[0]}</div>}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${m.status === "作業中" ? "bg-orange-500" : "bg-amber-400"}`} />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-black truncate">{m.name}</p>
              <div className="flex justify-between text-[9px] font-black uppercase text-orange-400">
                <span>{m.status}</span>
                <span>{formatElapsed(m.statusUpdatedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
