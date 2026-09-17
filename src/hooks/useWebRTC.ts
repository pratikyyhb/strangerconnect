"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ConnectionState = "idle" | "connecting" | "connected" | "disconnected" | "failed";

type SignalRow = {
  id: number;
  type: "offer" | "answer" | "ice" | "peer-left";
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit | { reason?: string };
};

type WebRTCOptions = {
  mediaEnabled: boolean;
  sessionId: string | null;
  token: string;
  peerToken: string | null;
  initiator: boolean;
  onPeerLeft: (reason: string) => void;
};

export function useWebRTC({
  mediaEnabled,
  sessionId,
  token,
  peerToken,
  initiator,
  onPeerLeft,
}: WebRTCOptions) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const onPeerLeftRef = useRef(onPeerLeft);
  const [streamReady, setStreamReady] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");

  useEffect(() => {
    onPeerLeftRef.current = onPeerLeft;
  }, [onPeerLeft]);

  useEffect(() => {
    let cancelled = false;

    async function openMedia() {
      if (!mediaEnabled) {
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        setStreamReady(false);
        return;
      }
      if (localStreamRef.current) {
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setStreamReady(true);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError("Camera access requires a secure browser connection.");
        return;
      }

      try {
        setMediaError("");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play().catch(() => undefined);
        }
        setMicEnabled(stream.getAudioTracks()[0]?.enabled ?? false);
        setCameraEnabled(stream.getVideoTracks()[0]?.enabled ?? false);
        setStreamReady(true);
      } catch (error) {
        const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");
        setMediaError(
          denied
            ? "Camera and microphone access was blocked. Update your browser permissions and try again."
            : "We couldn’t start your camera or microphone. Check that another app isn’t using them.",
        );
      }
    }

    openMedia();
    return () => {
      cancelled = true;
    };
  }, [mediaEnabled]);

  useEffect(() => {
    if (!sessionId || !peerToken || !streamReady || !localStreamRef.current) {
      if (!sessionId) setConnectionState("idle");
      return;
    }

    const activeSessionId = sessionId as string;
    const activePeerToken = peerToken as string;
    let closed = false;
    let polling = false;
    let lastSignalId = 0;
    const pendingCandidates: RTCIceCandidateInit[] = [];
    const connection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      iceCandidatePoolSize: 8,
    });
    const remoteVideoElement = remoteVideoRef.current;
    peerConnectionRef.current = connection;
    setConnectionState("connecting");

    localStreamRef.current.getTracks().forEach((track) => {
      if (localStreamRef.current) connection.addTrack(track, localStreamRef.current);
    });

    async function sendSignal(type: "offer" | "answer" | "ice", payload: RTCSessionDescriptionInit | RTCIceCandidateInit) {
      if (closed) return;
      const response = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, token, peerToken: activePeerToken, type, payload }),
      });
      if (!response.ok) throw new Error("Signaling request failed");
    }

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("ice", event.candidate.toJSON()).catch(() => setConnectionState("failed"));
      }
    };
    connection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(() => undefined);
      }
    };
    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;
      if (state === "connected") setConnectionState("connected");
      else if (state === "failed") setConnectionState("failed");
      else if (state === "disconnected" || state === "closed") setConnectionState("disconnected");
      else if (state === "connecting" || state === "new") setConnectionState("connecting");
    };

    async function applySignal(signal: SignalRow) {
      if (closed) return;
      if (signal.type === "peer-left") {
        const payload = signal.payload as { reason?: string };
        onPeerLeftRef.current(payload.reason ?? "ended");
        return;
      }
      if (signal.type === "offer") {
        if (connection.signalingState !== "stable") return;
        await connection.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
        for (const candidate of pendingCandidates.splice(0)) await connection.addIceCandidate(candidate);
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        await sendSignal("answer", answer);
      } else if (signal.type === "answer") {
        if (!connection.remoteDescription) {
          await connection.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
          for (const candidate of pendingCandidates.splice(0)) await connection.addIceCandidate(candidate);
        }
      } else if (signal.type === "ice") {
        const candidate = signal.payload as RTCIceCandidateInit;
        if (connection.remoteDescription) await connection.addIceCandidate(candidate);
        else pendingCandidates.push(candidate);
      }
    }

    async function pollSignals() {
      if (polling || closed) return;
      polling = true;
      try {
        const response = await fetch(`/api/signals?sessionId=${encodeURIComponent(activeSessionId)}&token=${encodeURIComponent(token)}&after=${lastSignalId}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { signals: SignalRow[] };
        for (const signal of data.signals) {
          lastSignalId = Math.max(lastSignalId, signal.id);
          await applySignal(signal);
        }
      } catch {
        if (!closed) setConnectionState((state) => (state === "connected" ? state : "failed"));
      } finally {
        polling = false;
      }
    }

    const interval = window.setInterval(pollSignals, 650);
    pollSignals();

    if (initiator) {
      window.setTimeout(async () => {
        if (closed) return;
        try {
          const offer = await connection.createOffer();
          await connection.setLocalDescription(offer);
          await sendSignal("offer", offer);
        } catch {
          if (!closed) setConnectionState("failed");
        }
      }, 350);
    }

    return () => {
      closed = true;
      window.clearInterval(interval);
      connection.ontrack = null;
      connection.onicecandidate = null;
      connection.onconnectionstatechange = null;
      connection.close();
      if (peerConnectionRef.current === connection) peerConnectionRef.current = null;
      if (remoteVideoElement) remoteVideoElement.srcObject = null;
    };
  }, [initiator, peerToken, sessionId, streamReady, token]);

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    mediaError,
    streamReady,
    micEnabled,
    cameraEnabled,
    connectionState,
    toggleMic,
    toggleCamera,
  };
}
