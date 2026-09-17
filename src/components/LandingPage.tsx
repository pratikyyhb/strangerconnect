import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Bot,
  Check,
  ChevronRight,
  Circle,
  Globe2,
  HeartHandshake,
  LockKeyhole,
  MessageSquareText,
  Mic,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
  UsersRound,
  Video,
  VideoOff,
  Zap,
} from "lucide-react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

const steps = [
  {
    number: "01",
    icon: UserRoundSearch,
    title: "Join the room",
    copy: "No long forms. Enter as a guest or use your account—it only takes a second.",
  },
  {
    number: "02",
    icon: Zap,
    title: "Meet a stranger",
    copy: "Our private matching queue pairs you with someone ready to have a real conversation.",
  },
  {
    number: "03",
    icon: MessageSquareText,
    title: "Start talking",
    copy: "Use video, audio, or text. Not feeling the vibe? Move on with one click.",
  },
];

const features = [
  {
    icon: LockKeyhole,
    title: "Private by design",
    copy: "Video and audio travel peer-to-peer. We never record your conversations.",
    className: "md:col-span-2",
    accent: "violet",
  },
  {
    icon: Globe2,
    title: "A world of people",
    copy: "Open the door to spontaneous conversations from wherever you are.",
    className: "",
    accent: "blue",
  },
  {
    icon: Bot,
    title: "Smart moderation",
    copy: "Clear controls, fast reports, and active review help keep conversations respectful.",
    className: "",
    accent: "pink",
  },
  {
    icon: Video,
    title: "Crystal-clear calls",
    copy: "WebRTC adapts to your connection for smooth, low-latency video and audio.",
    className: "md:col-span-2",
    accent: "green",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#08080c] text-white">
      <Navbar />
      <main>
        <section className="relative pb-20 pt-16 sm:pt-24 lg:pb-28 lg:pt-28">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="site-container relative grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-10">
            <div className="relative z-10 max-w-2xl">
              <div className="eyebrow animate-rise">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                Thousands are talking now
              </div>
              <h1 className="mt-6 animate-rise text-[clamp(3.2rem,7.7vw,6.2rem)] font-semibold leading-[.93] tracking-[-0.07em] [animation-delay:80ms]">
                Talk to
                <br />
                <span className="gradient-text">someone new.</span>
              </h1>
              <p className="mt-7 max-w-xl animate-rise text-lg leading-8 text-zinc-400 [animation-delay:160ms] sm:text-xl">
                Step outside your circle. StrangerConnect makes it simple to have spontaneous, face-to-face conversations—privately and safely.
              </p>
              <div className="mt-9 flex animate-rise flex-col gap-3 [animation-delay:240ms] sm:flex-row">
                <Link href="/chat" className="button button-primary group">
                  Start a conversation
                  <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="#how-it-works" className="button button-secondary">
                  See how it works
                </Link>
              </div>
              <div className="mt-7 flex animate-rise flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 [animation-delay:320ms]">
                <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> No account needed</span>
                <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> Free to start</span>
                <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> 18+ only</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[690px] animate-fade [animation-delay:200ms]">
              <div className="hero-card">
                <div className="relative aspect-[1.28/1] overflow-hidden rounded-[22px] bg-[#171721] sm:aspect-[1.38/1]">
                  <Image
                    src="/images/strangerconnect-hero.jpg"
                    alt="Two people enjoying a friendly video conversation"
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 52vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[11px] font-medium backdrop-blur-xl">
                    <span className="size-1.5 rounded-full bg-emerald-400" /> Connected
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 sm:bottom-6 sm:left-6">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs backdrop-blur-xl">
                      <span className="size-1.5 rounded-full bg-emerald-400" /> New friend
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 sm:bottom-6 sm:right-6">
                    <button aria-label="Mute" className="video-control"><Mic className="size-4" /></button>
                    <button aria-label="Turn camera off" className="video-control"><Video className="size-4" /></button>
                    <button aria-label="End call" className="video-control !bg-red-500 text-white"><VideoOff className="size-4" /></button>
                  </div>
                </div>
              </div>
              <div className="floating-card -left-5 bottom-14 hidden sm:flex">
                <span className="grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><UsersRound className="size-[18px]" /></span>
                <span><strong>128k+</strong><small>conversations today</small></span>
              </div>
              <div className="floating-card -right-4 top-10 hidden sm:flex">
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300"><ShieldCheck className="size-[18px]" /></span>
                <span><strong>Safe & private</strong><small>you&apos;re in control</small></span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[.06] bg-white/[.018]">
          <div className="site-container grid grid-cols-2 divide-x divide-white/[.06] py-7 sm:grid-cols-4">
            {[
              ["190+", "countries"],
              ["24/7", "active community"],
              ["0", "video recordings"],
              ["1 click", "to meet someone"],
            ].map(([value, label]) => (
              <div key={label} className="px-3 py-3 text-center">
                <strong className="block text-xl font-semibold tracking-tight text-white sm:text-2xl">{value}</strong>
                <span className="mt-1 block text-[11px] uppercase tracking-[.14em] text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section-pad scroll-mt-20">
          <div className="site-container">
            <div className="section-heading">
              <div className="eyebrow"><Sparkles className="size-3.5 text-violet-400" /> Simple by design</div>
              <h2>From here to hello<br className="hidden sm:block" /> in three easy steps.</h2>
              <p>No swiping, no follower counts, and no pressure. Just a simple space for human conversation.</p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.number} className="glass-card group relative p-7 sm:p-8">
                  <div className="mb-14 flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300 transition-transform group-hover:-rotate-3 group-hover:scale-105">
                      <step.icon className="size-5" />
                    </span>
                    <span className="text-xs font-medium tracking-[.18em] text-zinc-700">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">{step.copy}</p>
                  {index < steps.length - 1 && <ChevronRight className="absolute -right-4 top-1/2 z-10 hidden size-7 rounded-full border border-white/10 bg-[#101016] p-1.5 text-zinc-600 md:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section-pad relative scroll-mt-20 pt-8">
          <div className="feature-glow" />
          <div className="site-container relative">
            <div className="section-heading">
              <div className="eyebrow"><HeartHandshake className="size-3.5 text-violet-400" /> Made for connection</div>
              <h2>Everything you need.<br />Nothing you don&apos;t.</h2>
              <p>Thoughtful technology that gets out of the way so you can focus on the person in front of you.</p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className={`feature-card ${feature.className}`}>
                  <span className={`feature-icon feature-${feature.accent}`}><feature.icon className="size-5" /></span>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                  {feature.title === "Private by design" && (
                    <div className="mt-8 flex max-w-md items-center gap-3 rounded-2xl border border-white/[.06] bg-black/20 p-3 text-xs text-zinc-500">
                      <LockKeyhole className="size-4 shrink-0 text-violet-400" /> End-to-end peer connection via WebRTC
                    </div>
                  )}
                  {feature.title === "Crystal-clear calls" && (
                    <div className="mt-8 flex h-10 items-end gap-1 opacity-70" aria-hidden="true">
                      {[10, 18, 28, 16, 35, 23, 12, 31, 19, 8, 25, 14, 32, 18, 10].map((height, index) => (
                        <span key={index} className="w-1 rounded-full bg-emerald-400" style={{ height }} />
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="site-container">
            <div className="safety-panel">
              <div>
                <div className="eyebrow"><ShieldCheck className="size-3.5 text-emerald-400" /> Safety comes first</div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">A kinder corner<br />of the internet.</h2>
                <p className="mt-5 max-w-lg leading-7 text-zinc-400">You control every interaction. Leave instantly, report bad behavior, and keep personal details private.</p>
                <Link href="/safety" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200">Read our Community Guidelines <ArrowRight className="size-4" /></Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [Ban, "One-click exit", "Leave any conversation instantly."],
                  [ShieldCheck, "Fast reporting", "Send context to our review queue."],
                  [LockKeyhole, "No recordings", "Calls are never stored by us."],
                  [Circle, "18+ community", "Adults only, with clear standards."],
                ].map(([Icon, title, copy]) => {
                  const SafetyIcon = Icon as typeof ShieldCheck;
                  return (
                    <div key={String(title)} className="rounded-2xl border border-white/[.07] bg-white/[.035] p-5">
                      <SafetyIcon className="size-5 text-emerald-400" />
                      <h3 className="mt-5 text-sm font-semibold">{String(title)}</h3>
                      <p className="mt-1.5 text-xs leading-5 text-zinc-500">{String(copy)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24 pt-8 sm:pb-32">
          <div className="site-container">
            <div className="cta-panel">
              <div className="cta-orb" />
              <div className="relative">
                <p className="text-sm font-medium text-violet-300">Someone interesting is one click away.</p>
                <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Ready to say hello?</h2>
                <p className="mx-auto mt-5 max-w-xl text-zinc-400">No profile to perfect. No audience to impress. Just show up as yourself.</p>
                <Link href="/chat" className="button button-light group mt-8">Start a conversation <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
