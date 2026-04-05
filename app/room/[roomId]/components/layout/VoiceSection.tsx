"use client";
import { LiveKitRoom, VideoConference, ControlBar } from "@livekit/components-react";
import "@livekit/components-styles";

export function VoiceSection({ token, onJoinVoice, voiceEnabled }: { token: string; onJoinVoice: () => void; voiceEnabled: boolean; }) {
  if (!voiceEnabled) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center text-5xl">🎙️</div>
      <h3 className="text-xl font-black text-orange-900">ボイスではなす？</h3>
      <button onClick={onJoinVoice} className="bg-orange-500 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-lg">通話に参加！</button>
    </div>
  );

  return (
    <div className="h-full bg-white rounded-[2rem] overflow-hidden border-2 border-orange-50 flex flex-col min-h-[400px]">
      <LiveKitRoom video={false} audio={true} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} data-lk-theme="default" className="flex-1 flex flex-col">
        <VideoConference />
        <style jsx global>{`
          .lk-control-bar { padding: 4px !important; display: flex !important; justify-content: center !important; gap: 4px !important; }
          .lk-button { min-width: 40px !important; padding: 8px !important; }
        `}</style>
      </LiveKitRoom>
    </div>
  );
}
