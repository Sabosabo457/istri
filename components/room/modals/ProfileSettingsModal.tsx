"use client";
import React from "react";
import { COLORS } from "@/types";

type Props = {
  myName: string;
  setMyName: (v: string) => void;
  myColor: string;
  setMyColor: (v: string) => void;
  photoURL: string | null;
  status: "作業中" | "休憩中";
  updateStatus: (s: "作業中" | "休憩中") => void;
  onAvatarSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateProfile: () => void;
  onClose: () => void;
  onShowSummary: () => void;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
};

export function ProfileSettingsModal({ myName, setMyName, myColor, setMyColor, photoURL, status, updateStatus, onAvatarSelect, onUpdateProfile, onClose, onShowSummary, avatarInputRef }: Props) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-orange-950/20 backdrop-blur-2xl p-4 font-pop">
      <div className="bg-white border-8 border-orange-100 rounded-[3rem] p-10 w-full max-w-lg shadow-3xl h-full max-h-[90vh] flex flex-col">
        <h3 className="text-4xl font-black mb-6 text-orange-950 text-center">プロフィールせってい</h3>
        <div className="flex flex-col items-center gap-6 mb-8 flex-1 overflow-y-auto no-scrollbar">
          <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-8 bg-white shadow-xl" style={{ borderColor: myColor }}>
              {photoURL ? <img src={photoURL} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-4xl font-black text-white" style={{ backgroundColor: myColor }}>{myName[0]}</span>}
            </div>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={onAvatarSelect} />
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {COLORS.map(c => (
              <button key={c} onClick={() => setMyColor(c)} className={`w-8 h-8 rounded-full border-4 transition-all ${myColor === c ? "border-orange-500 scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="w-full space-y-4 text-left">
            <div>
              <label className="text-3xl font-black text-orange-300 mb-2 block ml-4">おなまえ</label>
              <input type="text" value={myName} onChange={(e) => setMyName(e.target.value)} className="w-full bg-orange-50 border-4 border-orange-100 rounded-[2rem] px-8 py-4 outline-none font-black text-center text-lg text-orange-950 mb-4" />
              <div className="flex bg-orange-50 p-2 rounded-[2rem] border-2 border-orange-100">
                <button onClick={() => updateStatus("作業中")} className={`flex-1 py-3 rounded-2xl text-xl font-black transition-all ${status === "作業中" ? "bg-orange-500 text-white shadow-md" : "text-orange-200 hover:text-orange-400"}`}>さぎょうちゅう</button>
                <button onClick={() => updateStatus("休憩中")} className={`flex-1 py-3 rounded-2xl text-xl font-black transition-all ${status === "休憩中" ? "bg-amber-400 text-white shadow-md" : "text-orange-200 hover:text-orange-400"}`}>きゅうけいちゅう</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button onClick={onClose} className="flex-1 bg-orange-100 py-6 rounded-2xl font-black text-xl text-orange-300">とじる</button>
          <button onClick={onUpdateProfile} className="flex-[1.5] bg-orange-500 py-6 rounded-2xl font-black text-xl text-white shadow-lg">ほぞん！</button>
        </div>
        <button onClick={onShowSummary} className="w-full mt-6 bg-red-50 text-red-300 py-5 rounded-2xl font-black text-xl border-2 border-red-50 hover:bg-red-500 hover:text-white transition-all uppercase">おわりにして退出する</button>
      </div>
    </div>
  );
}
