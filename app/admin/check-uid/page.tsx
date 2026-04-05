"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function CheckUIDPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-orange-500">読み込み中...</div>;

  return (
    <main className="min-h-screen bg-orange-50 flex items-center justify-center p-4 font-pop">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-8 border-orange-100 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-black mb-6 text-orange-950 uppercase">Admin - UID Check</h1>
        <p className="text-orange-400 font-bold mb-8 italic">このUIDをコピーして教えてください。管理者に設定します。</p>
        
        <div className="bg-orange-100/50 p-6 rounded-2xl border-4 border-dashed border-orange-200 mb-8 break-all">
          <code className="text-xl font-black text-orange-600 select-all">{user?.uid || "未ログイン"}</code>
        </div>

        <button onClick={() => router.push("/")} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-orange-400 transition-all">トップページへ戻る</button>
      </div>
    </main>
  );
}
