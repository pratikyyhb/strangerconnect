import type { Metadata } from "next";
import { eq, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CalendarDays, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { Brand } from "@/components/Brand";
import { LogoutButton } from "@/components/LogoutButton";
import { db } from "@/db";
import { chatSessions, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) redirect("/login");
  const [stats] = await db
    .select({ conversations: sql<number>`count(*)::int` })
    .from(chatSessions)
    .where(or(eq(chatSessions.user1Id, user.id), eq(chatSessions.user2Id, user.id)));

  return (
    <main className="app-shell min-h-screen px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between"><Brand /><LogoutButton /></header>
        <section className="mt-16 overflow-hidden rounded-[28px] border border-white/[.08] bg-white/[.025]">
          <div className="h-32 bg-[radial-gradient(circle_at_20%_30%,rgba(139,108,255,.4),transparent_35%),linear-gradient(120deg,#171329,#111118)]" />
          <div className="px-6 pb-8 sm:px-10">
            <div className="-mt-12 grid size-24 place-items-center rounded-3xl border-4 border-[#0d0d12] bg-violet-500 text-3xl font-semibold shadow-xl">{user.username[0]?.toUpperCase()}</div>
            <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><h1 className="text-3xl font-semibold tracking-[-.04em]">{user.username}</h1><p className="mt-1 text-sm text-zinc-500">{user.email}</p></div>
              <a href="/chat" className="button button-primary">Start chatting</a>
            </div>
          </div>
        </section>
        <section className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            [MessageCircle, String(stats?.conversations ?? 0), "Conversations"],
            [CalendarDays, new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(user.createdAt), "Member since"],
            [ShieldCheck, user.isBanned ? "Restricted" : "Good standing", "Account status"],
          ].map(([Icon, value, label]) => {
            const CardIcon = Icon as typeof UserRound;
            return <div key={String(label)} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-6"><CardIcon className="size-5 text-violet-400" /><strong className="mt-7 block text-xl font-semibold">{String(value)}</strong><span className="mt-1 block text-xs text-zinc-600">{String(label)}</span></div>;
          })}
        </section>
      </div>
    </main>
  );
}
