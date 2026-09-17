import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="StrangerConnect home">
      <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_8px_24px_rgba(124,92,255,.3)] transition-transform group-hover:-rotate-3 group-hover:scale-105">
        <MessageCircle className="size-[19px] fill-white/15 text-white" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#0b0b10] bg-emerald-400" />
      </span>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-white">
          Stranger<span className="text-violet-400">Connect</span>
        </span>
      )}
    </Link>
  );
}
