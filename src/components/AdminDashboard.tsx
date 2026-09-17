"use client";

import { useState } from "react";
import { Ban, CheckCircle2, Clock3, MessageSquareWarning, ShieldCheck, Trash2, UserRoundCheck, UsersRound } from "lucide-react";

type UserItem = { id: string; username: string; email: string; role: string; isBanned: boolean; createdAt: string };
type ReportItem = { id: string; reason: string; description: string; status: string; reportedUserId: string | null; createdAt: string };
type Stats = { totalUsers: number; activeUsers: number; pendingReports: number; bannedUsers: number; totalSessions: number; averageDuration: number };

export function AdminDashboard({ initialUsers, initialReports, stats }: { initialUsers: UserItem[]; initialReports: ReportItem[]; stats: Stats }) {
  const [users, setUsers] = useState(initialUsers);
  const [reports, setReports] = useState(initialReports);
  const [message, setMessage] = useState("");

  async function toggleBan(userId: string, banned: boolean) {
    setMessage("");
    const response = await fetch("/api/admin/moderation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, banned }),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Action failed.");
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, isBanned: banned } : user)));
    setMessage(banned ? "User suspended." : "User access restored.");
  }

  async function deleteReport(reportId: string) {
    const response = await fetch(`/api/admin/moderation?reportId=${encodeURIComponent(reportId)}`, { method: "DELETE" });
    if (!response.ok) return setMessage("Could not delete that report.");
    setReports((current) => current.filter((report) => report.id !== reportId));
    setMessage("Report deleted.");
  }

  const cards = [
    [UsersRound, stats.totalUsers, "Total users", "text-violet-400"],
    [UserRoundCheck, stats.activeUsers, "Active now", "text-emerald-400"],
    [MessageSquareWarning, reports.length, "Pending reports", "text-amber-400"],
    [Ban, users.filter((user) => user.isBanned).length, "Banned users", "text-red-400"],
  ] as const;

  return (
    <div>
      {message && <div className="mb-4 flex items-center gap-2 rounded-xl border border-violet-500/15 bg-violet-500/[.06] px-4 py-3 text-xs text-violet-200"><CheckCircle2 className="size-4" />{message}</div>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, value, label, color]) => <article key={label} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><Icon className={`size-5 ${color}`} /><strong className="mt-8 block text-3xl font-semibold tracking-tight">{value}</strong><span className="mt-1 text-xs text-zinc-600">{label}</span></article>)}
      </section>
      <section className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><Clock3 className="size-5 text-blue-400" /><strong className="mt-5 block text-xl">{stats.averageDuration}s</strong><span className="text-xs text-zinc-600">Average completed chat</span></div>
        <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><ShieldCheck className="size-5 text-emerald-400" /><strong className="mt-5 block text-xl">{stats.totalSessions}</strong><span className="text-xs text-zinc-600">Total chat sessions</span></div>
      </section>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <section className="overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.025]">
          <div className="border-b border-white/[.07] px-5 py-4"><h2 className="text-sm font-semibold">Recent users</h2><p className="mt-1 text-[10px] text-zinc-600">Ban or restore account access</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-xs">
              <thead className="text-[9px] uppercase tracking-[.12em] text-zinc-700"><tr><th className="px-5 py-3 font-medium">User</th><th className="px-3 py-3 font-medium">Role</th><th className="px-3 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Action</th></tr></thead>
              <tbody className="divide-y divide-white/[.05]">
                {users.map((user) => <tr key={user.id}><td className="px-5 py-3.5"><strong className="block text-zinc-300">{user.username}</strong><span className="mt-1 block text-[10px] text-zinc-700">{user.email}</span></td><td className="px-3 py-3.5 text-zinc-500">{user.role}</td><td className="px-3 py-3.5"><span className={`rounded-full px-2 py-1 text-[9px] ${user.isBanned ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"}`}>{user.isBanned ? "Banned" : "Active"}</span></td><td className="px-5 py-3.5 text-right">{user.role !== "admin" && <button onClick={() => toggleBan(user.id, !user.isBanned)} className="rounded-lg border border-white/[.07] px-2.5 py-1.5 text-[10px] text-zinc-500 hover:bg-white/[.05] hover:text-white">{user.isBanned ? "Unban" : "Ban"}</button>}</td></tr>)}
                {!users.length && <tr><td className="px-5 py-12 text-center text-zinc-700" colSpan={4}>No users yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.025]">
          <div className="border-b border-white/[.07] px-5 py-4"><h2 className="text-sm font-semibold">Pending reports</h2><p className="mt-1 text-[10px] text-zinc-600">Newest safety submissions</p></div>
          <div className="max-h-[520px] divide-y divide-white/[.05] overflow-y-auto">
            {reports.map((report) => <article key={report.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[9px] text-amber-300">{report.reason}</span><time className="ml-2 text-[9px] text-zinc-700">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(report.createdAt))}</time></div><button onClick={() => deleteReport(report.id)} aria-label="Delete report" className="text-zinc-700 hover:text-red-300"><Trash2 className="size-4" /></button></div><p className="mt-3 text-xs leading-5 text-zinc-500">{report.description || "No additional details provided."}</p><p className="mt-3 text-[9px] text-zinc-700">Reported: {report.reportedUserId ? report.reportedUserId.slice(0, 8) : "Anonymous guest"}</p></article>)}
            {!reports.length && <div className="px-5 py-14 text-center text-xs text-zinc-700">No pending reports.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
