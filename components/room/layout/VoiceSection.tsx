"use client";
import { useState, useEffect, useRef } from "react";
import { 
  LiveKitRoom, 
  ControlBar, 
  useTracks, 
  VideoTrack
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

export function VoiceSection({ token, onJoinVoice, voiceEnabled, onLeaveVoice }: { token: string; onJoinVoice: () => void; voiceEnabled: boolean; onLeaveVoice: () => void; }) {
  if (!voiceEnabled) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center text-orange-200 font-black">
      <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center text-5xl">🎙️</div>
      <button onClick={onJoinVoice} className="bg-orange-500 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-lg hover:scale-105 active:scale-95 transition-all outline-none">通話に参加！</button>
    </div>
  );

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <LiveKitRoom 
        video={false} audio={true} token={token} 
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
        data-lk-theme="default" 
        onDisconnected={onLeaveVoice} 
        className="w-full flex-1 flex flex-col items-center justify-center"
      >
        <ControlBar variation="minimal" controls={{ chat: false, settings: false }} className="bg-white/80 backdrop-blur-md p-4 rounded-[2rem] border-4 border-orange-50 shadow-xl" />
        <ScreenShareManager />
        
        <style jsx global>{`
          .lk-control-bar { border: none !important; background: none !important; margin: 0 !important; }
          .lk-button { border-radius: 1.2rem !important; background: #fff7ed !important; color: #9a3412 !important; border: 2px solid #ffedd5 !important; margin: 0 4px !important; transition: all 0.2s; }
          .lk-button:hover { background: #ffedd5 !important; transform: scale(1.1); }
          .lk-button-group { background: none !important; border: none !important; }
          .lk-disconnect-button { background: #fee2e2 !important; color: #ef4444 !important; border-color: #fca5a5 !important; }
        `}</style>
      </LiveKitRoom>
    </div>
  );
}

function ScreenShareManager() {
  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]) as any[];
  const [showPopup, setShowPopup] = useState(false);
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const lastTrackCount = useRef(0);

  useEffect(() => {
    if (tracks.length > lastTrackCount.current) {
      setShowPopup(true);
      setManuallyClosed(false);
    } else if (tracks.length === 0) {
      setShowPopup(false);
      setManuallyClosed(false);
    }
    lastTrackCount.current = tracks.length;
  }, [tracks.length]);

  if (!showPopup || tracks.length === 0 || manuallyClosed) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-orange-950/90 backdrop-blur-md p-4 md:p-10 pointer-events-none">
      <div className="relative w-full h-full max-w-7xl max-h-[95vh] bg-black/50 rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl flex flex-col pointer-events-auto">
        <div className={`grid gap-4 p-6 flex-1 items-center justify-center ${
          tracks.length === 1 ? "grid-cols-1" : tracks.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {tracks.map((track, i) => (
            <div key={track.participant.identity + i} className="relative w-full h-full min-h-0 bg-black rounded-3xl overflow-hidden border-2 border-white/10 group">
              <VideoTrack trackRef={track} className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 text-white bg-black/40 px-3 py-1.5 rounded-lg text-[8px] font-black group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                {track.participant.identity}
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowPopup(false); setManuallyClosed(true); }} 
          className="absolute top-8 right-8 w-14 h-14 bg-white/10 hover:bg-red-500 text-white rounded-full font-black text-3xl backdrop-blur-md transition-all flex items-center justify-center shadow-2xl z-[5000] border-2 border-white/20"
        >
          ×
        </button>
      </div>
    </div>
  );
}
