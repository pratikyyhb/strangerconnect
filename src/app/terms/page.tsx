import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <PolicyPage eyebrow="Terms of service" title="Simple rules for real conversation." intro="By accessing StrangerConnect, you agree to these terms and our Community Guidelines. If you do not agree, do not use the service.">
      <PolicySection title="Eligibility"><p>You must be 18 or older and legally able to enter this agreement. You are responsible for complying with the laws that apply where you use the service.</p></PolicySection>
      <PolicySection title="Acceptable use"><p>Do not misuse the platform, evade bans, automate messages, scrape users, disrupt matchmaking, probe other users’ networks, impersonate others, or use StrangerConnect for illegal, exploitative, or commercial spam activity.</p></PolicySection>
      <PolicySection title="Accounts"><p>Accounts are optional. Keep your login credentials confidential and provide accurate registration information. We may restrict or terminate accounts that violate these terms or put others at risk.</p></PolicySection>
      <PolicySection title="Your interactions"><p>Random conversations involve people we do not control. Use judgment, leave uncomfortable interactions, and report violations. You are responsible for what you choose to display or send.</p></PolicySection>
      <PolicySection title="Service availability"><p>The service is provided on an “as available” basis. Match times, connection quality, features, and availability may change. We may update these terms as safety, law, and the product evolve.</p></PolicySection>
    </PolicyPage>
  );
}
