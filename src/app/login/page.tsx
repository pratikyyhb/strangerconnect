import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="app-shell grid min-h-screen lg:grid-cols-2">
      <section className="flex min-h-screen flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between"><Brand /><Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white"><ArrowLeft className="size-3.5" /> Back home</Link></div>
        <div className="mx-auto my-auto w-full max-w-[420px] py-14">
          <p className="text-xs font-medium uppercase tracking-[.16em] text-violet-400">Welcome back</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em]">Good to see you.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Log in to see your profile and keep your account preferences with you.</p>
          <AuthForm mode="login" />
          <div className="my-7 flex items-center gap-3 text-[10px] uppercase tracking-[.16em] text-zinc-700"><span className="h-px flex-1 bg-white/[.07]" />or<span className="h-px flex-1 bg-white/[.07]" /></div>
          <Link href="/chat" className="button button-secondary w-full">Continue as guest</Link>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden border-l border-white/[.06] bg-[#0e0e15] lg:grid lg:place-items-center lg:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(124,86,244,.16),transparent_48%)]" />
        <div className="relative max-w-md rounded-[28px] border border-white/[.08] bg-white/[.03] p-9">
          <ShieldCheck className="size-8 text-emerald-400" />
          <blockquote className="mt-8 text-2xl font-medium leading-9 tracking-[-.03em]">“The best conversations happen when nobody is trying to impress anyone.”</blockquote>
          <p className="mt-7 text-sm text-zinc-600">Private. Spontaneous. Human.</p>
        </div>
      </aside>
    </main>
  );
}
