"use client";

import { LoaderCircle, Search, Sparkles } from "lucide-react";

export function WaitingScreen({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-[#0b0b11]/88 px-6 text-center backdrop-blur-sm">
      <div className="max-w-sm">
        <div className="relative mx-auto grid size-20 place-items-center rounded-full border border-violet-400/15 bg-violet-500/[.08]">
          <span className="absolute inset-0 animate-ping rounded-full border border-violet-400/15" />
          <Search className="size-7 text-violet-300" />
          <Sparkles className="absolute -right-1 top-1 size-4 text-violet-300" />
        </div>
        <h2 className="mt-7 text-2xl font-semibold tracking-[-.035em]">Finding someone for you</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">This usually takes just a moment. Keep this tab open while we look.</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600"><LoaderCircle className="size-3.5 animate-spin" /> Searching the waiting room…</div>
        <button onClick={onCancel} className="mt-8 text-xs font-medium text-zinc-500 underline decoration-zinc-700 underline-offset-4 hover:text-white">Cancel search</button>
      </div>
    </div>
  );
}
