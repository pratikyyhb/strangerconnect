import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "StrangerConnect — Talk to Someone New",
    template: "%s | StrangerConnect",
  },
  description:
    "Meet someone new through private, anonymous video and text chat. No profile required.",
  applicationName: "StrangerConnect",
  keywords: ["random video chat", "anonymous chat", "WebRTC", "meet new people"],
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#08080c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
