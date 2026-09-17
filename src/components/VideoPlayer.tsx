"use client";

import type { RefObject } from "react";
import { CameraOff, Radio, UserRound } from "lucide-react";
import { WaitingScreen } from "./WaitingScreen";

type Props = {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  status: "intro" | "searching" | "matched" | "ended" | "error";
  connectionState: string;
  cameraEnabled: boolean;
  mediaError: string;
  onCancelSearch: () => void;
  onStartAgain: () => void;
};

export function VideoPlayer({
  localVideoRef,
  remoteVideoRef,
  status,
  connectionState,
  cameraEnabled,
  mediaError,
  onCancelSearch,
  onStartAgain,
}: Props) {
  const isMatched = status === "matched";

  return (
    <section className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-white/[.08] bg-[#0d0d13] shadow-2xl">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`h-full min-h-[440px] w-full object-cover transition-opacity duration-500 lg:min-h-0 ${isMatched ? "opacity-100" : "opacity-0"}`}
      />
      {isMatched && connectionState !== "connected" && (
        <div className="absolute inset-0 grid place-items-center bg-[#0c0c12]">
          <div className="text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/[.04]"><UserRound className="size-7 text-zinc-700" /></div>
            <p className="mt-4 text-sm font-medium text-zinc-400">Connecting securely…</p>
            <p className="mt-1 text-xs text-zinc-700">Setting up peer-to-peer video</p>
          </div>
        </div>
      )}
      {status === "searching" && <WaitingScreen onCancel={onCancelSearch} />}
      {(status === "intro" || status === "ended" || status === "error") && (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,rgba(118,78,239,.13),transparent_34%),#0b0b10] px-6 text-center">
          <div className="max-w-md">
            <div className="mx-auto grid size-20 place-items-center rounded-[24px] border border-white/[.07] bg-white/[.035]"><UserRound className="size-8 text-violet-300" /></div>
            <h2 className="mt-7 text-2xl font-semibold tracking-[-.04em]">{status === "intro" ? "Ready to meet someone?" : status === "error" ? "We hit a connection issue" : "Conversation ended"}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {status === "intro" ? "Allow camera and microphone access, then we’ll find someone new for you." : status === "error" ? "Check your camera permissions or connection, then try again." : "Thanks for keeping StrangerConnect friendly. Another conversation is one click away."}
            </p>
            <button onClick={onStartAgain} className="button button-primary mt-7">{status === "intro" ? "Enter the waiting room" : "Find another stranger"}</button>
          </div>
        </div>
      )}

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] font-medium backdrop-blur-lg">
        <span className={`size-1.5 rounded-full ${connectionState === "connected" ? "bg-emerald-400" : "bg-amber-400"}`} />
        {connectionState === "connected" ? "Connected" : status === "matched" ? "Connecting" : "StrangerConnect"}
      </div>

      <div className="absolute bottom-4 right-4 z-20 aspect-video w-32 overflow-hidden rounded-2xl border border-white/15 bg-[#15151d] shadow-2xl sm:bottom-5 sm:right-5 sm:w-44">
        <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full -scale-x-100 object-cover" />
        {!cameraEnabled && (
          <div className="absolute inset-0 grid place-items-center bg-[#17171f]"><CameraOff className="size-5 text-zinc-500" /></div>
        )}
        <span className="absolute bottom-1.5 left-2 rounded bg-black/35 px-1.5 py-0.5 text-[9px] text-white/75 backdrop-blur">You</span>
      </div>

      {mediaError && (
        <div className="absolute bottom-5 left-5 z-30 max-w-md rounded-xl border border-red-500/20 bg-red-950/80 px-4 py-3 text-xs leading-5 text-red-200 backdrop-blur-xl">{mediaError}</div>
      )}
      {isMatched && connectionState === "connected" && <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 text-[10px] text-zinc-300 backdrop-blur"><Radio className="size-3 text-emerald-400" /> LIVE</div>}
    </section>
  );
}
