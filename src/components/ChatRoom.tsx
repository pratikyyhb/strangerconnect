"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Info, MessageCircle, ShieldCheck, X } from "lucide-react";
import { Brand } from "./Brand";
import { ChatBox, type ChatMessage } from "./ChatBox";
import { Controls } from "./Controls";
import { ReportModal } from "./ReportModal";
import { VideoPlayer } from "./VideoPlayer";
import { useWebRTC } from "@/hooks/useWebRTC";

type RoomStatus = "intro" | "searching" | "matched" | "ended" | "error";
type Match = { sessionId: string; peerToken: string; initiator: boolean };

type ApiMessage = {
  id: number;
  senderToken: string;
  message: string;
  createdAt: string;
};

export function ChatRoom() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<RoomStatus>("intro");
  const [match, setMatch] = useState<Match | null>(null);
  const [mediaEnabled, setMediaEnabled] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notice, setNotice] = useState("You’re anonymous. Be kind, stay safe, and keep personal details private.");
  const [chatOpen, setChatOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [sending, setSending] = useState(false);
  const lastMessageId = useRef(0);

  useEffect(() => {
    let saved = window.sessionStorage.getItem("strangerconnect_participant");
    if (!saved) {
      saved = crypto.randomUUID();
      window.sessionStorage.setItem("strangerconnect_participant", saved);
    }
    setToken(saved);
  }, []);

  const handlePeerLeft = useCallback((reason: string) => {
    setMatch(null);
    setMessages([]);
    lastMessageId.current = 0;
    setNotice(reason === "next" ? "The stranger moved on. Finding someone new…" : "The stranger left. Finding someone new…");
    setStatus("searching");
  }, []);

  const {
    localVideoRef,
    remoteVideoRef,
    mediaError,
    streamReady,
    micEnabled,
    cameraEnabled,
    connectionState,
    toggleMic,
    toggleCamera,
  } = useWebRTC({
    mediaEnabled,
    sessionId: match?.sessionId ?? null,
    token,
    peerToken: match?.peerToken ?? null,
    initiator: match?.initiator ?? false,
    onPeerLeft: handlePeerLeft,
  });

  const beginSearch = useCallback(() => {
    if (!token) return;
    setMatch(null);
    setMessages([]);
    lastMessageId.current = 0;
    setMediaEnabled(true);
    setNotice("Looking for someone who’s ready to chat…");
    setStatus("searching");
  }, [token]);

  function requestStart() {
    if (window.localStorage.getItem("strangerconnect_age_confirmed") === "true") beginSearch();
    else setConsentOpen(true);
  }

  useEffect(() => {
    if (status !== "searching" || !token) return;
    let stopped = false;
    let busy = false;

    async function find() {
      if (busy || stopped) return;
      busy = true;
      try {
        const response = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Matchmaking failed.");
        if (!stopped && data.status === "matched") {
          setMatch({ sessionId: data.sessionId, peerToken: data.peerToken, initiator: Boolean(data.initiator) });
          setMessages([]);
          lastMessageId.current = 0;
          setNotice("You’re connected with a new stranger. Say hello!");
          setStatus("matched");
        }
      } catch (error) {
        if (!stopped) {
          setNotice(error instanceof Error ? error.message : "Matchmaking is unavailable.");
          setStatus("error");
        }
      } finally {
        busy = false;
      }
    }

    find();
    const interval = window.setInterval(find, 1300);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [status, token]);

  useEffect(() => {
    if (status !== "matched" || !match) return;
    const activeMatch = match;
    let stopped = false;
    let busy = false;

    async function pollMessages() {
      if (busy || stopped) return;
      busy = true;
      try {
        const response = await fetch(`/api/messages?sessionId=${encodeURIComponent(activeMatch.sessionId)}&token=${encodeURIComponent(token)}&after=${lastMessageId.current}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { messages: ApiMessage[] };
        if (stopped || !data.messages.length) return;
        lastMessageId.current = Math.max(lastMessageId.current, ...data.messages.map((message) => message.id));
        setMessages((current) => {
          const known = new Set(current.map((message) => message.id));
          return [...current, ...data.messages.filter((message) => !known.has(message.id))];
        });
      } finally {
        busy = false;
      }
    }

    pollMessages();
    const interval = window.setInterval(pollMessages, 800);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [match, status, token]);

  useEffect(() => {
    if (!mediaError) return;
    setNotice(mediaError);
    setStatus("error");
  }, [mediaError]);

  useEffect(() => {
    const leavePage = () => {
      if ((status === "matched" || status === "searching") && token) {
        fetch("/api/match", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, reason: "ended" }),
          keepalive: true,
        }).catch(() => undefined);
      }
    };
    window.addEventListener("pagehide", leavePage);
    return () => window.removeEventListener("pagehide", leavePage);
  }, [status, token]);

  async function leave(reason: "next" | "ended") {
    if (token) {
      await fetch("/api/match", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reason }),
      }).catch(() => undefined);
    }
    setMatch(null);
    setMessages([]);
    lastMessageId.current = 0;
  }

  async function nextStranger() {
    setNotice("Closing the previous connection…");
    await leave("next");
    setStatus("searching");
  }

  async function endChat() {
    await leave("ended");
    setMediaEnabled(false);
    setNotice("Conversation ended. Your media has been disconnected.");
    setStatus("ended");
  }

  async function cancelSearch() {
    await leave("ended");
    setMediaEnabled(false);
    setNotice("Search cancelled.");
    setStatus("intro");
  }

  async function sendMessage(message: string) {
    if (!match) return;
    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: match.sessionId, token, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Message failed.");
      const newMessage = data.message as ApiMessage;
      lastMessageId.current = Math.max(lastMessageId.current, newMessage.id);
      setMessages((current) => [...current, newMessage]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function submitReport(reason: string, description: string) {
    if (!match) return;
    setReporting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: match.sessionId, token, reason, description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Report failed.");
      setReportOpen(false);
      setNotice("Report received. Thank you for helping keep the community safe.");
      await nextStranger();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Report could not be sent.");
    } finally {
      setReporting(false);
    }
  }

  return (
    <main className="app-shell flex h-[100svh] min-h-[640px] flex-col overflow-hidden p-3 sm:p-4">
      <header className="mx-auto flex h-14 w-full max-w-[1500px] shrink-0 items-center justify-between px-1 sm:h-16 sm:px-2">
        <div className="flex items-center gap-4"><Link href="/" aria-label="Back home" className="hidden text-zinc-600 hover:text-white sm:block"><ArrowLeft className="size-4" /></Link><Brand /></div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-white/[.06] bg-white/[.025] px-3 py-1.5 text-[10px] text-zinc-500 sm:flex"><ShieldCheck className="size-3 text-emerald-400" /> Peer-to-peer media</span>
          <button onClick={() => setChatOpen(true)} className="grid size-10 place-items-center rounded-xl border border-white/[.08] bg-white/[.035] text-zinc-300 lg:hidden" aria-label="Open chat"><MessageCircle className="size-[18px]" /></button>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <VideoPlayer
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            status={status}
            connectionState={connectionState}
            cameraEnabled={cameraEnabled}
            mediaError={mediaError}
            onCancelSearch={cancelSearch}
            onStartAgain={requestStart}
          />
          <div className="flex shrink-0 flex-col items-center justify-between gap-2 xl:flex-row">
            <div className="order-2 flex max-w-lg items-center gap-2 px-2 text-center text-[10px] leading-4 text-zinc-600 xl:order-1 xl:text-left"><Info className="hidden size-3 shrink-0 sm:block" />{notice}</div>
            <div className="order-1 xl:order-2"><Controls micEnabled={micEnabled} cameraEnabled={cameraEnabled} active={status === "matched" && streamReady} onToggleMic={toggleMic} onToggleCamera={toggleCamera} onNext={nextStranger} onEnd={endChat} onReport={() => setReportOpen(true)} /></div>
          </div>
        </div>

        <div className={`${chatOpen ? "flex" : "hidden"} absolute inset-3 z-40 min-h-0 overflow-hidden rounded-[22px] border border-white/[.08] bg-[#0e0e14] shadow-2xl lg:static lg:flex lg:w-[340px] lg:shrink-0`}>
          <button onClick={() => setChatOpen(false)} className="absolute right-3 top-2.5 z-10 grid size-9 place-items-center rounded-xl bg-white/[.04] text-zinc-500 lg:hidden" aria-label="Close chat"><X className="size-4" /></button>
          <ChatBox token={token} messages={messages} active={status === "matched"} sending={sending} onSend={sendMessage} />
        </div>
      </div>

      <ConsentModal open={consentOpen} onClose={() => setConsentOpen(false)} onConfirm={() => { window.localStorage.setItem("strangerconnect_age_confirmed", "true"); setConsentOpen(false); beginSearch(); }} />
      <ReportModal open={reportOpen} submitting={reporting} onClose={() => setReportOpen(false)} onSubmit={submitReport} />
    </main>
  );
}

function ConsentModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const [age, setAge] = useState(false);
  const [guidelines, setGuidelines] = useState(false);
  if (!open) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (age && guidelines) onConfirm();
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-[26px] border border-white/[.09] bg-[#14141b] p-7 shadow-2xl">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-300"><ShieldCheck className="size-5" /></span>
        <h2 className="mt-6 text-2xl font-semibold tracking-[-.04em]">Before you connect</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">StrangerConnect is an adults-only community. Confirm both items to continue.</p>
        <div className="mt-6 space-y-3">
          <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-6 ${age ? "border-violet-500/30 bg-violet-500/[.06] text-zinc-200" : "border-white/[.07] text-zinc-500"}`}><input type="checkbox" checked={age} onChange={(event) => setAge(event.target.checked)} className="mt-1 accent-violet-500" /><span>I confirm that I am at least 18 years old.</span></label>
          <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-6 ${guidelines ? "border-violet-500/30 bg-violet-500/[.06] text-zinc-200" : "border-white/[.07] text-zinc-500"}`}><input type="checkbox" checked={guidelines} onChange={(event) => setGuidelines(event.target.checked)} className="mt-1 accent-violet-500" /><span>I agree to be respectful and follow the <Link href="/safety" className="text-violet-400 underline underline-offset-2">Community Guidelines</Link>.</span></label>
        </div>
        <button disabled={!age || !guidelines} className="button button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"><Check className="size-4" /> Confirm and continue</button>
        <button type="button" onClick={onClose} className="mt-4 w-full text-center text-xs text-zinc-600 hover:text-white">Not now</button>
      </form>
    </div>
  );
}
