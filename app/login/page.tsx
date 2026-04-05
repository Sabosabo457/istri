"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged,
  setPersistence, browserLocalPersistence, browserSessionPersistence 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        router.push("/");
      }
    });
    return () => unsub();
  }, [router]);

  const checkOnboarding = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists() && userDoc.data().name) {
        localStorage.setItem("istri_myName", userDoc.data().name);
        router.push("/");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      console.error(err);
      router.push("/onboarding");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await checkOnboarding(res.user.uid);
    } catch (err) {
      console.error(err);
      alert("ログインにしっぱいしちゃった...");
    }
  };

  const handleGuestLogin = async () => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const res = await signInAnonymously(auth);
      await checkOnboarding(res.user.uid);
    } catch (err) {
      console.error(err);
      alert("ゲストでのログインが制限されているみたい...");
    }
  };

  if (!mounted) return null;

  return (
    <main className="h-screen bg-orange-50 text-orange-950 flex flex-col items-center justify-center p-8 relative overflow-hidden font-pop select-none">
       <style jsx global>{`
        @font-face { font-family: 'GenEiLatin'; src: url('/fonts/GenEiLateGo_v2.ttc') format('truetype-collection'); font-weight: normal; font-style: normal; } 
        .font-pop { font-family: 'GenEiLatin', 'Zen Maru Gothic', sans-serif; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); } }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#fdba7422,transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <div className="mb-8 animate-bounce-slow">
           <img 
             src="/pic/istri_logo.png" 
             alt="Istri Logo" 
             className="w-full max-w-[320px] h-auto drop-shadow-2xl" 
           />
        </div>

        <h1 className="text-4xl font-black text-orange-900 mb-2">おかえり、Istriへ</h1>
        <p className="text-orange-400 font-extrabold mb-10 uppercase tracking-widest text-sm">だいじななかまと、おなじばしょで。</p>

        <div className="w-full space-y-6">
           <button 
             onClick={handleGoogleLogin}
             className="w-full bg-white border-4 border-orange-100 hover:bg-orange-50 p-6 rounded-[2rem] shadow-[0_8px_0_#ffedd5] active:translate-y-1 transition-all flex items-center justify-center gap-4 group"
           >
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path fill="#EA4335" d="M24 12.27c0-.85-.07-1.53-.22-2.27H12v4.51h6.61c-.35 1.83-1.42 3.39-2.9 4.34v3.58h4.74c2.81-2.58 4.45-6.39 4.45-10.16z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.74-3.58c-1.25.84-2.81 1.34-4.54 1.34-3.58 0-6.61-2.42-7.69-5.69H.45v3.62C2.45 20.73 6.89 24 12 24z"/><path fill="#FBBC05" d="M4.31 13.16c-.28-.84-.44-1.74-.44-2.67s.16-1.83.44-2.67V4.2H.45a11.99 11.99 0 000 11.64l3.86-2.68z"/><path fill="#4285F4" d="M12 4.75c1.77 0 3.35.61 4.61 1.8l3.41-3.41C17.96 1.15 15.25 0 12 0 6.89 0 2.45 3.27.45 8.16l3.86 2.68c1.08-3.27 4.11-5.69 7.69-5.69z"/></svg>
              <span className="text-2xl font-black text-orange-950">Googleログイン</span>
           </button>

           <div className="flex items-center gap-4">
              <div className="flex-1 h-1 bg-orange-100 rounded-full" />
              <span className="text-orange-200 font-black text-sm uppercase tracking-tighter">OR</span>
              <div className="flex-1 h-1 bg-orange-100 rounded-full" />
           </div>

           <button 
             onClick={handleGuestLogin}
             className="w-full bg-orange-500 hover:bg-orange-400 p-6 rounded-[2rem] shadow-[0_8px_0_#c2410c] active:translate-y-1 transition-all group"
           >
              <div className="text-2xl font-black text-white group-hover:scale-105 transition-transform">ゲストではじめる</div>
              <div className="text-orange-200 text-xs font-black mt-1 uppercase">No Account Required</div>
           </button>

           <div className="flex items-center justify-center p-2">
             <label className="flex items-center gap-3 cursor-pointer group">
               <div className="relative">
                 <input 
                   type="checkbox" 
                   checked={rememberMe} 
                   onChange={(e) => setRememberMe(e.target.checked)}
                   className="sr-only" 
                 />
                 <div className={`w-8 h-8 rounded-xl border-4 transition-all flex items-center justify-center ${rememberMe ? 'bg-orange-500 border-orange-500' : 'bg-white border-orange-200'}`}>
                   {rememberMe && <span className="text-white text-xl font-black">✓</span>}
                 </div>
               </div>
               <span className="text-lg font-black text-orange-400 group-hover:text-orange-500 transition-colors">ログイン情報を記憶する</span>
             </label>
           </div>
        </div>

        <footer className="mt-16">
           <p className="text-orange-200 text-[10px] font-black uppercase tracking-[0.2em]">Istri - Collaborative Space for Everyone</p>
        </footer>
      </div>
    </main>
  );
}