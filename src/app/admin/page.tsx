import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Brand } from "@/components/Brand";
import { db } from "@/db";
import { chatSessions, matchQueue, reports, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/profile");

  const [userRows, reportRows, totalResult, activeResult, pendingResult, bannedResult, sessionResult] = await Promise.all([
    db.select({ id: users.id, username: users.username, email: users.email, role: users.role, isBanned: users.isBanned, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(50),
    db.select({ id: reports.id, reason: reports.reason, description: reports.description, status: reports.status, reportedUserId: reports.reportedUserId, createdAt: reports.createdAt }).from(reports).where(eq(reports.status, "pending")).orderBy(desc(reports.createdAt)).limit(50),
    db.select({ value: sql<number>`count(*)::int` }).from(users),
    db.select({ value: sql<number>`count(*)::int` }).from(matchQueue).where(sql`${matchQueue.lastSeenAt} > now() - interval '35 seconds'`),
    db.select({ value: sql<number>`count(*)::int` }).from(reports).where(eq(reports.status, "pending")),
    db.select({ value: sql<number>`count(*)::int` }).from(users).where(eq(users.isBanned, true)),
    db.select({ total: sql<number>`count(*)::int`, average: sql<number>`coalesce(avg(${chatSessions.durationSeconds}), 0)::int` }).from(chatSessions),
  ]);

  return (
    <main className="app-shell min-h-screen px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between"><Brand /><Link href="/profile" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white"><ArrowLeft className="size-3.5" /> Profile</Link></header>
        <div className="mb-8 mt-14 flex items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.16em] text-violet-400"><Shield className="size-3" /> Protected workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Community overview</h1><p className="mt-2 text-sm text-zinc-600">Users, safety reports, and conversation health.</p></div><span className="hidden rounded-full border border-emerald-500/15 bg-emerald-500/[.06] px-3 py-1.5 text-[10px] text-emerald-300 sm:block">All systems monitored</span></div>
        <AdminDashboard
          initialUsers={userRows.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() }))}
          initialReports={reportRows.map((report) => ({ ...report, createdAt: report.createdAt.toISOString() }))}
          stats={{ totalUsers: totalResult[0]?.value ?? 0, activeUsers: activeResult[0]?.value ?? 0, pendingReports: pendingResult[0]?.value ?? 0, bannedUsers: bannedResult[0]?.value ?? 0, totalSessions: sessionResult[0]?.total ?? 0, averageDuration: sessionResult[0]?.average ?? 0 }}
        />
      </div>
    </main>
  );
}
