"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

const reasons = ["Harassment", "Spam", "Inappropriate behavior", "Offensive language", "Other"];

type Props = {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => Promise<void>;
};

export function ReportModal({ open, submitting, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState(reasons[0]);
  const [description, setDescription] = useState("");
  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(reason, description);
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <form onSubmit={submit} className="w-full max-w-md rounded-[24px] border border-white/[.09] bg-[#14141b] p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-2xl bg-red-500/10 text-red-300"><AlertTriangle className="size-5" /></span>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-xl text-zinc-600 hover:bg-white/[.05] hover:text-white" aria-label="Close report"><X className="size-4" /></button>
        </div>
        <h2 id="report-title" className="mt-5 text-xl font-semibold tracking-tight">Report this stranger</h2>
        <p className="mt-2 text-xs leading-5 text-zinc-500">Your report goes to our safety review queue. The current conversation will end after submission.</p>
        <fieldset className="mt-6 space-y-2">
          <legend className="form-label">What happened?</legend>
          {reasons.map((item) => (
            <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-xs transition ${reason === item ? "border-violet-500/35 bg-violet-500/[.08] text-white" : "border-white/[.06] text-zinc-500 hover:bg-white/[.03]"}`}>
              <input type="radio" className="accent-violet-500" name="reason" checked={reason === item} onChange={() => setReason(item)} />{item}
            </label>
          ))}
        </fieldset>
        <label className="form-label mt-5" htmlFor="description">Details <span className="text-zinc-700">(optional)</span></label>
        <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 1000))} className="form-input !h-24 resize-none !py-3" placeholder="Add context that may help our moderators…" />
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="button button-secondary flex-1">Cancel</button>
          <button disabled={submitting} className="button flex-1 border border-red-500/20 bg-red-500/15 text-red-200 hover:bg-red-500/20">{submitting ? <LoaderCircle className="size-4 animate-spin" /> : "Submit report"}</button>
        </div>
      </form>
    </div>
  );
}
