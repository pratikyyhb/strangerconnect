import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PolicyPage eyebrow="Privacy policy" title="Private by design." intro="This overview explains how StrangerConnect handles information. We collect only what is needed to operate accounts, match conversations, and keep the community safe.">
      <PolicySection title="What we collect"><p>Guests receive a temporary browser-session identifier. Account holders provide a username, email address, and securely hashed password. We also process queue status, chat-session timing, text messages needed for delivery, and reports you submit.</p></PolicySection>
      <PolicySection title="Video and audio"><p>Video and audio are sent peer-to-peer using WebRTC whenever a direct connection is available. StrangerConnect does not record or store your camera or microphone streams. Network metadata may be exposed to a peer as part of WebRTC operation.</p></PolicySection>
      <PolicySection title="Why information is used"><p>Information is used to authenticate accounts, match users, relay connection signals, prevent abuse, investigate reports, maintain service health, and comply with legal obligations.</p></PolicySection>
      <PolicySection title="Retention and control"><p>Temporary queue entries expire automatically. Completed session metadata and safety reports may be retained for operational and moderation purposes. Do not include unnecessary personal information in messages or reports.</p></PolicySection>
      <PolicySection title="Security"><p>We use HTTP-only signed session cookies, password hashing, restricted response headers, input limits, and authorization checks. No internet service can guarantee absolute security, so protect your own identity during random conversations.</p></PolicySection>
    </PolicyPage>
  );
}
