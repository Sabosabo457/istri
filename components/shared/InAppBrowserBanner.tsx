"use client";
import React from "react";

export function InAppBrowserBanner({ isJoined }: { isJoined: boolean }) {
  const [isInApp, setIsInApp] = React.useState(false);

  React.useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isInAppBrowser = 
      ua.indexOf("line") !== -1 || 
      ua.indexOf("instagram") !== -1 || 
      ua.indexOf("twitter") !== -1 || 
      ua.indexOf("fbav") !== -1 ||
      ua.indexOf("fban") !== -1;

    if (isInAppBrowser) {
      setIsInApp(true);
    }
  }, []);

  if (!isInApp) return null;

  return (
    <div className={`fixed ${isJoined ? "top-20" : "top-10"} left-1/2 -translate-x-1/2 z-[5000] w-[90%] max-w-sm bg-red-600 text-white p-5 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-2 border-4 border-white/20 animate-bounce-slow`}>
      <span className="text-3xl">⚠️</span>
      <p className="text-xs font-black leading-tight">
        LINEやX(Twitter)のブラウザでは<br />
        <span className="text-yellow-300 font-black">Googleログインができません！</span><br />
        右上の「…」から「Safari」または<br />
        「ブラウザで開く」を選んでね！
      </p>
    </div>
  );
}
