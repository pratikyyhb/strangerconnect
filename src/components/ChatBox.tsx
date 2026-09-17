"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, SendHorizonal, Smile } from "lucide-react";

export type ChatMessage = {
  id: number;
  senderToken: string;
  message: string;
  createdAt: string;
};

type Props = {
  token: string;
  messages: ChatMessage[];
  active: boolean;
  sending: boolean;
  onSend: (message: string) => Promise<void>;
};

export function ChatBox({ token, messages, active, sending, onSend }: Props) {
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = value.trim();
    if (!clean || !active || sending) return;
    setValue("");
    await onSend(clean);
  }

  return (
    <aside className="flex min-h-0 flex-1 flex-col bg-[#0e0e14] lg:w-[340px] lg:flex-none">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[.07] px-4">
        <div className="flex items-center gap-2.5"><MessageCircle className="size-4 text-violet-400" /><span className="text-sm font-semibold">Chat</span></div>
        <span className="rounded-full bg-white/[.04] px-2.5 py-1 text-[9px] uppercase tracking-[.12em] text-zinc-600">Messages aren&apos;t saved</span>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="grid h-full min-h-56 place-items-center text-center">
            <div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/[.03]"><Smile className="size-5 text-zinc-700" /></span><p className="mt-4 text-xs font-medium text-zinc-500">Break the ice</p><p className="mt-1 max-w-[190px] text-[11px] leading-5 text-zinc-700">Say hello when you&apos;re connected. Keep it kind and don&apos;t share private details.</p></div>
          </div>
        )}
        {messages.map((item) => {
          const mine = item.senderToken === token;
          return (
            <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${mine ? "rounded-br-md bg-violet-600 text-white" : "rounded-bl-md border border-white/[.07] bg-white/[.045] text-zinc-300"}`}>
                <p className="break-words text-[13px] leading-5">{item.message}</p>
                <time className={`mt-1 block text-[8px] ${mine ? "text-violet-200/70" : "text-zinc-700"}`}>{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(item.createdAt))}</time>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="shrink-0 border-t border-white/[.07] p-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/[.08] bg-white/[.035] p-1.5 pl-3 focus-within:border-violet-500/35">
          <input value={value} onChange={(event) => setValue(event.target.value.slice(0, 1000))} disabled={!active} placeholder={active ? "Type a message…" : "Waiting to connect…"} className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-700 focus:outline-none disabled:cursor-not-allowed" />
          <button disabled={!active || !value.trim() || sending} aria-label="Send message" className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:bg-white/[.04] disabled:text-zinc-700"><SendHorizonal className="size-4" /></button>
        </div>
      </form>
    </aside>
  );
}
