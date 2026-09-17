import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Community Guidelines" };

export default function SafetyPage() {
  return (
    <PolicyPage eyebrow="Safety center" title="Keep it human. Keep it kind." intro="StrangerConnect is for adults who want spontaneous, respectful conversation. These standards apply to every video, audio, and text interaction.">
      <PolicySection title="Adults only — 18+"><p>You must be at least 18 years old to use StrangerConnect. If you are under 18, do not enter the waiting room or share any information through the service.</p></PolicySection>
      <PolicySection title="Treat strangers with respect"><p>Harassment, threats, hate speech, sexual coercion, bullying, discriminatory conduct, and unwanted explicit content are prohibited. Consent and personal boundaries matter in every conversation.</p></PolicySection>
      <PolicySection title="Protect your privacy"><p>Do not share your full name, address, phone number, financial details, passwords, precise location, or other identifying information. Never send money or follow suspicious links from a stranger.</p></PolicySection>
      <PolicySection title="No illegal or harmful content"><p>Do not display, request, or facilitate exploitation, violence, illegal activity, self-harm encouragement, or non-consensual content. Serious threats may be escalated when legally required.</p></PolicySection>
      <PolicySection title="Leave and report"><p>You can end any chat instantly. Use Report when someone violates these rules; choose the closest reason and add only the context moderators need. Reporting ends the current connection and helps our review team respond.</p></PolicySection>
    </PolicyPage>
  );
}
