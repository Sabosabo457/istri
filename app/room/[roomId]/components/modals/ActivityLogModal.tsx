"use client";
// ↓ ../ を一つ増やして 4つ (../../../../) に修正しました
import { DayLog } from "../../../../(shared)/types";

type ModalProps = { viewMonth: Date; setViewMonth: (d: Date) => void; calendarLogs: Record<string, DayLog>; currentUserId: string | null; selectedDay: string | null; setSelectedDay: (s: string | null) => void; dayNoteText: string; setDayNoteText: (s: string) => void; onSaveNote: () => void; onClose: () => void; };

export function ActivityLogModal({ viewMonth, setViewMonth, calendarLogs, currentUserId, selectedDay, setSelectedDay, dayNoteText, setDayNoteText, onSaveNote, onClose }: ModalProps) {
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysArr = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-orange-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-8 border-orange-50 overflow-hidden">
        <header className="p-6 border-b-2 border-orange-50 flex justify-between items-center shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-orange-950 whitespace-nowrap">かつどうログ</h2>
            <div className="flex items-center gap-4 py-2">
              <button onClick={() => setViewMonth(new Date(year, month - 1))} className="text-xl">◀</button>
              <span className="text-lg font-black text-orange-500">{year}-{String(month + 1).padStart(2, '0')}</span>
              <button onClick={() => setViewMonth(new Date(year, month + 1))} className="text-xl">▶</button>
            </div>
            {!selectedDay && <p className="text-[10px] font-black text-orange-300">ひづけをえらんでね！</p>}
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-orange-50 rounded-2xl font-black text-2xl">×</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-7 gap-2">
              {daysArr.map(day => {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasLog = calendarLogs[dateKey]?.users[currentUserId || ""];
                return (
                  <button key={day} onClick={() => { setSelectedDay(dateKey); setDayNoteText(calendarLogs[dateKey]?.users[currentUserId || ""]?.note || ""); }} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-black transition-all ${selectedDay === dateKey ? "bg-orange-500 text-white scale-110 shadow-lg" : hasLog ? "bg-orange-100 text-orange-600 border-2 border-orange-200" : "bg-orange-50/50 text-orange-200"}`}>
                    {day}
                    {hasLog && <div className="w-1 h-1 bg-current rounded-full mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 bg-orange-50/50 rounded-[2rem] p-6 flex flex-col gap-4 min-h-[150px]">
             {selectedDay ? (
               <>
                 <h3 className="font-black text-orange-900 border-b-2 border-orange-100 pb-2">{selectedDay} のきろく</h3>
                 <p className="text-xs text-orange-400 font-bold">じかん: {calendarLogs[selectedDay]?.users[currentUserId || ""]?.duration || "---"}</p>
                 <textarea value={dayNoteText} readOnly className="flex-1 bg-white/50 rounded-xl p-3 text-sm font-bold outline-none resize-none" placeholder="まだメモがありません" />
               </>
             ) : (
               <div className="flex-1 flex items-center justify-center text-orange-200 italic font-black text-sm">ひづけをえらんでね</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
