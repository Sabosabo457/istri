"use client";
import { Message } from "@/types";

type ChatProps = { width: number; combinedMessages: Message[]; currentUserId: string | null; inputText: string; setInputText: (v: string) => void; onSendMessage: (e?: React.FormEvent, type?: "text" | "image", content?: string | File | Blob) => void; onImagePaste: (e: React.ClipboardEvent) => void; onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void; onPreviewImage: (url: string) => void; scrollRef: any; fileInputRef: any; };

export function ChatSection({ combinedMessages, currentUserId, inputText, setInputText, onSendMessage, onImagePaste, onFileSelect, onPreviewImage, scrollRef, fileInputRef }: ChatProps) {
  return (
    <aside className="w-full md:w-[420px] h-[50vh] md:h-full flex flex-col bg-white border-t-4 md:border-t-0 md:border-l-4 border-orange-50 shrink-0">
      <header className="px-6 h-[72px] border-b-4 border-orange-50 flex items-center gap-3 shrink-0">
        <span className="text-xl">💬</span>
        <h2 className="text-lg font-black text-orange-950">チャット</h2>
      </header>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(#fff7ed_1px,transparent_1px)] [background-size:16px_16px] custom-scrollbar">
        {combinedMessages.map((m, i) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div key={m.id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {!isMe && <span className="text-[10px] font-black text-orange-300 ml-2 mb-1">{m.senderName}</span>}
              <div className={`max-w-[85%] px-4 py-2 rounded-[1.2rem] shadow-sm text-sm font-bold ${isMe ? "bg-orange-500 text-white rounded-tr-none" : "bg-white border-2 border-orange-100 text-orange-950 rounded-tl-none"}`}>
                {m.imageUrl ? <img src={m.imageUrl} onClick={() => onPreviewImage(m.imageUrl!)} className="rounded-xl cursor-pointer hover:opacity-90" /> : <p className="whitespace-pre-wrap break-all leading-tight">{m.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={(e) => onSendMessage(e)} className="p-3 bg-white border-t-2 border-orange-50 shrink-0">
        <div className="flex items-center gap-1.5 bg-orange-50 p-1.5 rounded-[1.5rem] border-2 border-orange-100 focus-within:border-orange-500 transition-all">
          <input 
            type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onPaste={onImagePaste}
            placeholder="かこう！ (画像ペーストOK)" 
            className="flex-1 bg-transparent px-3 py-1.5 outline-none font-bold text-orange-900 text-sm min-w-0" 
          />
          <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-orange-200 text-xl shrink-0">📎</button>
        </div>
      </form>
    </aside>
  );
}
