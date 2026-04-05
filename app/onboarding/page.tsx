"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("お名前をいれてね！");
      return;
    }
    if (!user) return;

    try {
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        updatedAt: serverTimestamp(),
        isAnonymous: user.isAnonymous
      }, { merge: true });
      
      // Save to local storage as well for quick access
      localStorage.setItem("istri_myName", name.trim());
      
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("お名前の保存にしっぱいしちゃった...");
    }
  };

  if (!mounted || !user) return null;

  return (
    <main className="h-screen bg-orange-50 text-orange-950 flex flex-col items-center justify-center p-8 relative overflow-hidden font-pop">
      <style jsx global>{`
        @font-face { font-family: 'GenEiLatin'; src: url('/fonts/GenEiLateGo_v2.ttc') format('truetype-collection'); font-weight: normal; font-style: normal; } 
        .font-pop { font-family: 'GenEiLatin', 'Zen Maru Gothic', sans-serif; }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#fdba7422,transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md bg-white p-10 rounded-[3.5rem] border-[10px] border-orange-100 shadow-2xl flex flex-col items-center text-center">
        <div className="mb-8 w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center text-5xl shadow-xl animate-bounce-slow">
           ✨
        </div>

        <h1 className="text-3xl font-black text-orange-950 mb-4">おなまえを教えて！</h1>
        <p className="text-orange-300 font-black text-xs uppercase mb-10 tracking-widest leading-relaxed">これがお部屋でみんなに表示されるよ</p>

        <form onSubmit={handleSubmit} className="w-full space-y-8">
           <input 
             type="text" 
             placeholder="例：さぼっち" 
             value={name}
             onChange={(e) => setName(e.target.value)}
             className="w-full bg-orange-50 border-4 border-orange-100 rounded-[1.5rem] px-8 py-5 text-2xl outline-none font-black text-orange-950 focus:border-orange-400 placeholder:text-orange-100 transition-all text-center"
           />
           <button 
             type="submit"
             className="w-full bg-orange-500 hover:bg-orange-400 p-6 rounded-[2rem] shadow-[0_8px_0_#c2410c] active:translate-y-1 transition-all text-2xl font-black text-white"
           >
             これで決定！
           </button>
        </form>
      </div>
    </main>
  );
}
