import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="app-shell grid min-h-screen lg:grid-cols-2">
      <section className="flex min-h-screen flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between"><Brand /><Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white"><ArrowLeft className="size-3.5" /> Back home</Link></div>
        <div className="mx-auto my-auto w-full max-w-[420px] py-14">
          <p className="text-xs font-medium uppercase tracking-[.16em] text-violet-400">Join the community</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em]">Make it yours.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">An account is optional, but gives you a consistent identity and profile.</p>
          <AuthForm mode="register" />
        </div>
      </section>
      <aside className="relative hidden overflow-hidden border-l border-white/[.06] bg-[#0e0e15] lg:grid lg:place-items-center lg:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(124,86,244,.16),transparent_48%)]" />
        <div className="relative max-w-md">
          <span className="grid size-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-300"><Sparkles className="size-5" /></span>
          <h2 className="mt-7 text-3xl font-semibold tracking-[-.04em]">Still anonymous.<br />Just more personal.</h2>
          <div className="mt-8 space-y-4">
            {["Keep your favorite username", "Access your conversation stats", "Manage safety and privacy preferences"].map((item) => <p key={item} className="flex items-center gap-3 text-sm text-zinc-400"><Check className="size-4 text-emerald-400" />{item}</p>)}
          </div>
        </div>
      </aside>
    </main>
  );
}
