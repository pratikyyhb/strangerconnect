import type { Metadata } from "next";
import { ChatRoom } from "@/components/ChatRoom";

export const metadata: Metadata = {
  title: "Random video chat",
  description: "Connect privately with someone new through video, audio, and text.",
};

export default function ChatPage() {
  return <ChatRoom />;
}
