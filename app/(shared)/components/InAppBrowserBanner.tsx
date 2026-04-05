"use client";
import { useEffect, useState } from "react";

export function InAppBrowserBanner({ isJoined }: { isJoined: boolean }) {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isInApp = ua.includes("line") || ua.includes("twitter") || ua.includes("instagram") || ua.includes("fban") || ua.includes("fbav");
    setIsInAppBrowser(isInApp);
  }, []);

  if (!isInAppBrowser) return null;

  return (
    <div className={`${isJoined ? 'fixed top-0 left-0 w-full z-[1000] bg-orange-500 text-white p-2 font-black text-center shadow-xl flex items-center justify-center gap-4 text-sm' : 'fixed top-0 left-0 w-full z-[1000] bg-orange-500 text-white p-4 font-black text-center shadow-xl flex items-center justify-center gap-4 animate-pulse'}`}>
      <span>⚠️ {isJoined ? 'ログインや通話ができないときは「Safari/Chromeで開く」を選んでね！' : 'ログインできない場合は、右上のメニューから「SafariやChromeで開く」を選んでね！'}</span>
    </div>
  );
}
