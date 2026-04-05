"use client";

type Props = {
  newRoomId: string;
  setNewRoomId: (v: string) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  onIdChange: () => void;
  onUpdateSettings: () => void;
  onDelete: () => void;
  onClose: () => void;
  isOwner: boolean;
};

export function RoomSettingsModal({ newRoomId, setNewRoomId, newTitle, setNewTitle, newPassword, setNewPassword, onIdChange, onUpdateSettings, onDelete, onClose, isOwner }: Props) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-orange-950/20 backdrop-blur-2xl p-4 font-pop">
      <div className="bg-white border-8 border-orange-100 rounded-[2.5rem] p-6 w-full max-w-lg shadow-3xl flex flex-col max-h-[90vh] overflow-hidden">
        <h3 className="text-2xl font-black mb-4 text-orange-950 text-center shrink-0">ルームのせってい</h3>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 pr-1">
          <div className="bg-orange-50/50 p-4 rounded-[2rem] border-2 border-dashed border-orange-100">
            <label className="text-xs font-black text-orange-400 mb-1.5 block ml-2 uppercase">URL - ルームID</label>
            <div className="flex gap-2">
              <input type="text" value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)} className="flex-1 bg-white border-2 border-orange-100 rounded-xl px-4 py-2 outline-none font-black text-xs text-orange-950 focus:border-orange-400" />
              <button onClick={onIdChange} className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-xl text-white font-black text-sm shadow-md active:translate-y-0.5 transition-all">変更</button>
            </div>
            <p className="text-[10px] font-bold text-orange-300 mt-1.5 ml-2 leading-tight">注意：IDをかえるとURLがかわります</p>
          </div>
          <div>
            <label className="text-xs font-black text-orange-400 mb-1 block ml-4 uppercase">ルームめい</label>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-orange-50 border-2 border-orange-100 rounded-2xl px-6 py-2.5 outline-none font-black text-center text-md text-orange-950" />
          </div>
          <div>
            <label className="text-xs font-black text-orange-400 mb-1 block ml-4 uppercase">あいことば</label>
            <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="なし" className="w-full bg-orange-50 border-2 border-orange-100 rounded-2xl px-6 py-2.5 outline-none font-black text-center text-md text-orange-950" />
          </div>
        </div>
        <div className="flex flex-col gap-3 shrink-0 border-t-2 border-orange-50 pt-4">
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 bg-orange-100 py-4 rounded-2xl font-black text-lg text-orange-400">キャンセル</button>
            <button onClick={onUpdateSettings} className="flex-[1.5] bg-orange-500 py-4 rounded-2xl font-black text-lg text-white shadow-lg">ほぞん！</button>
          </div>
          {isOwner && (
            <button onClick={onDelete} className="w-full bg-red-50 text-red-200 py-3 rounded-2xl font-black text-sm border-2 border-red-50 border-dashed hover:bg-red-500 hover:text-white transition-all uppercase">このルームを消去する</button>
          )}
        </div>
      </div>
    </div>
  );
}
