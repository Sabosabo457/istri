"use client";
import React from "react";
import { Member, DayLog } from "../../../../(shared)/types";

type Props = {
  reportRef: React.RefObject<HTMLDivElement | null>;
  roomTitle: string;
  members: Record<string, Member>;
  currentUserId: string | null;
  calendarLogs: Record<string, DayLog>;
  outputImages: string[];
  formatElapsed: (ts: any) => string;
  onSaveAsImage: () => void;
  onClose: () => void;
  onLeave: () => void;
  joinTime: Date;
};

export function SessionSummaryModal({ reportRef, roomTitle, members, currentUserId, calendarLogs, outputImages, formatElapsed, onSaveAsImage, onClose, onLeave, joinTime }: Props) {
  const today = new Date().toISOString().split("T")[0];
  
  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center bg-orange-50/98 p-4 overflow-y-auto font-pop">
      <div className="w-full max-w-5xl py-4 flex flex-col items-center gap-6">
        <div ref={reportRef} className="w-full bg-[#fffaf5] border-[12px] border-orange-100 rounded-[6rem] p-10 shadow-3xl relative overflow-hidden flex flex-col gap-4 max-h-[88vh]">
          <div className="absolute top-0 right-0 p-10 text-orange-100/10 text-[100px] font-black leading-none pointer-events-none select-none">GOOD JOB</div>
          <div className="flex justify-between items-center relative z-10 shrink-0">
            <div className="flex flex-col items-start gap-0">
              <img src="/pic/istri_report_logo_v3.png" className="h-24 w-auto object-contain mb-1" alt="Session Report" />
              <p className="text-orange-400 text-2xl font-black uppercase tracking-tight pl-2">{roomTitle} でがんばったね！</p>
            </div>
            <div className="text-right flex flex-col items-end pr-4">
              <span className="text-orange-400 text-3xl font-black mb-1">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10 shrink-0">
            <div className="bg-white border-2 border-orange-100 rounded-[2.5rem] p-4 flex flex-col justify-center shadow-inner">
              <h3 className="text-orange-900/40 text-sm font-black mb-2 uppercase">いっしょにいた人</h3>
              <div className="flex -space-x-3">{Object.values(members).map((m, i) => (<div key={i} className="w-10 h-10 rounded-lg ring-[4px] ring-white bg-white overflow-hidden shadow-md" style={{backgroundColor: m.color}}>{m.photoURL ? <img src={m.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-sm text-white">{m.name[0]}</div>}</div>))}</div>
            </div>
            <div className="bg-orange-500 border-2 border-orange-400 rounded-[2.5rem] p-4 flex flex-col justify-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#fb923c,transparent_50%)] opacity-30" />
              <h3 className="text-white text-sm font-black mb-1 uppercase relative z-10">がんばったじかん</h3>
              <div className="text-4xl font-black text-white relative z-10">{formatElapsed({ toDate: () => joinTime })}</div>
            </div>
          </div>
          <div className="space-y-4 relative z-10 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-10 relative z-10 shrink-0 px-10 my-4">
              <div className="flex-1 h-[2px] bg-orange-100 rounded-full" />
              <h3 className="text-orange-400 text-3xl font-black uppercase tracking-[0.2em]">きょうのせいか！</h3>
              <div className="flex-1 h-[2px] bg-orange-100 rounded-full" />
            </div>
            <div className="flex gap-6 items-center overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 py-4 shrink-0">
              {outputImages.length > 0 ? outputImages.map((src, i) => (
                <div key={i} className="flex-shrink-0 w-[180px] h-[180px] aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center snap-center transition-transform hover:scale-105 duration-300">
                  <img src={src} className="w-full h-full object-cover rounded-[1.5rem]" />
                </div>
              )) : <div className="w-full py-4 opacity-30 text-center text-xl font-black text-orange-900">画像なし</div>}
            </div>
            <div className="flex-1 bg-white/50 border-4 border-dashed border-orange-100 rounded-[3rem] p-8 mt-2 overflow-y-auto custom-scrollbar shadow-inner">
              <h4 className="text-orange-400 text-xs font-black uppercase mb-3 text-center tracking-widest">かつどうログ</h4>
              <p className="text-orange-900 font-bold text-center leading-relaxed text-lg italic opacity-80">
                「 {calendarLogs[today]?.users?.[currentUserId!]?.note || "今日はメモがありませんでした。" } 」
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 pt-4 shrink-0">
          <button onClick={onClose} className="px-12 py-6 rounded-[2rem] bg-orange-100 font-black text-xl text-orange-300 hover:bg-orange-200 transition-all">キャンセル</button>
          <button onClick={onSaveAsImage} className="px-16 py-7 rounded-[2.5rem] bg-orange-500 font-black text-xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all">ポスターを保存</button>
          <button onClick={onLeave} className="px-12 py-6 rounded-[2rem] bg-red-50 text-red-300 font-black text-xl hover:bg-red-500 hover:text-white transition-all">おわる</button>
        </div>
      </div>
    </div>
  );
}
