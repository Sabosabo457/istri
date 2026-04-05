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
  onClose: () => void;
};

export function RoomSettingsModal({ newRoomId, setNewRoomId, newTitle, setNewTitle, newPassword, setNewPassword, onIdChange, onUpdateSettings, onClose }: Props) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-orange-950/20 backdrop-blur-2xl p-4 font-pop">
      <div className="bg-white border-8 border-orange-100 rounded-[3rem] p-10 w-full max-w-lg shadow-3xl text-center">
        <h3 className="text-4xl font-black mb-8 text-orange-950">ルームのせってい</h3>
        <div className="space-y-4 mb-4 text-left">
          <div className="bg-orange-50/50 p-6 rounded-[2.5rem] border-4 border-dashed border-orange-100 mb-6">
            <label className="text-xl font-black text-orange-400 mb-2 block ml-2 uppercase">URL - ルームID</label>
            <div className="flex gap-4">
              <input type="text" value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)} placeholder="my-room-name" className="flex-1 bg-white border-4 border-orange-100 rounded-[1.2rem] px-5 py-3 outline-none font-black text-sm text-orange-950 focus:border-orange-400" />
              <button onClick={onIdChange} className="bg-orange-500 hover:bg-orange-400 px-6 py-3 rounded-xl text-white font-black text-xl shadow-md active:translate-y-0.5 transition-all">変更</button>
            </div>
            <p className="text-[10px] font-black text-white mt-2 ml-2 uppercase tracking-wide">注意：IDをかえるとURLがかわります</p>
          </div>
          <div>
            <label className="text-xl font-black text-orange-400 mb-2 block ml-4 uppercase text-left">ルームめい</label>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-orange-50 border-4 border-orange-100 rounded-[2rem] px-8 py-4 outline-none font-black text-center text-lg text-orange-950" />
          </div>
          <div>
            <label className="text-xl font-black text-orange-400 mb-2 block ml-4 text-left uppercase">あいことば</label>
            <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="なし" className="w-full bg-orange-50 border-4 border-orange-100 rounded-[2rem] px-8 py-4 outline-none font-black text-center text-lg text-orange-950" />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-orange-100 py-6 rounded-3xl font-black text-xl text-orange-300">キャンセル</button>
          <button onClick={onUpdateSettings} className="flex-[1.5] bg-orange-500 py-6 rounded-3xl font-black text-xl text-white shadow-lg">ほぞん！</button>
        </div>
      </div>
    </div>
  );
}
