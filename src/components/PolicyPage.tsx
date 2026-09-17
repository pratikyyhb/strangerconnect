import type { ReactNode } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Brand } from "./Brand";
import { Footer } from "./Footer";

export function PolicyPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <header className="border-b border-white/[.06]"><div className="site-container flex h-[76px] items-center justify-between"><Brand /><Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white"><ArrowLeft className="size-3.5" /> Back home</Link></div></header>
      <main className="site-container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="eyebrow"><ShieldCheck className="size-3.5 text-violet-400" />{eyebrow}</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">{intro}</p>
          <article className="policy-content mt-14 space-y-10">{children}</article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-white/[.07] bg-white/[.022] p-6 sm:p-8"><h2 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h2><div className="mt-4 space-y-3 text-sm leading-7 text-zinc-500">{children}</div></section>;
}
