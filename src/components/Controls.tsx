"use client";

import { Flag, Mic, MicOff, PhoneOff, SkipForward, Video, VideoOff } from "lucide-react";

type Props = {
  micEnabled: boolean;
  cameraEnabled: boolean;
  active: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onNext: () => void;
  onEnd: () => void;
  onReport: () => void;
};

function ControlButton({ label, danger = false, active = true, onClick, children }: { label: string; danger?: boolean; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={!active} aria-label={label} title={label} className={`group flex min-w-[58px] flex-col items-center gap-1.5 text-[9px] font-medium transition disabled:cursor-not-allowed disabled:opacity-35 ${danger ? "text-red-300" : "text-zinc-500 hover:text-white"}`}>
      <span className={`grid size-11 place-items-center rounded-2xl border transition group-hover:-translate-y-0.5 ${danger ? "border-red-500/20 bg-red-500/10 group-hover:bg-red-500/20" : "border-white/[.08] bg-white/[.035] group-hover:border-white/[.14] group-hover:bg-white/[.07]"}`}>{children}</span>
      {label}
    </button>
  );
}

export function Controls({ micEnabled, cameraEnabled, active, onToggleMic, onToggleCamera, onNext, onEnd, onReport }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-[20px] border border-white/[.07] bg-[#101016] px-2 py-2.5 sm:gap-3 sm:px-4">
      <ControlButton label={micEnabled ? "Mute" : "Unmute"} active={active} onClick={onToggleMic}>{micEnabled ? <Mic className="size-[18px]" /> : <MicOff className="size-[18px] text-amber-300" />}</ControlButton>
      <ControlButton label={cameraEnabled ? "Camera" : "Camera off"} active={active} onClick={onToggleCamera}>{cameraEnabled ? <Video className="size-[18px]" /> : <VideoOff className="size-[18px] text-amber-300" />}</ControlButton>
      <ControlButton label="Next" active={active} onClick={onNext}><SkipForward className="size-[18px]" /></ControlButton>
      <ControlButton label="Report" active={active} onClick={onReport}><Flag className="size-[17px]" /></ControlButton>
      <ControlButton label="End" danger active={active} onClick={onEnd}><PhoneOff className="size-[18px]" /></ControlButton>
    </div>
  );
}
