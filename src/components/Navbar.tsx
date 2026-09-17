import Link from "next/link";
import { Menu } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Brand } from "./Brand";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/safety", label: "Safety" },
];

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="site-container flex h-[76px] items-center justify-between">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href={user ? "/profile" : "/login"} className="nav-link px-3">
            {user ? `Hi, ${user.username}` : "Log in"}
          </Link>
          <Link href="/chat" className="button button-primary !min-h-10 !px-5 !text-sm">
            Start chatting
          </Link>
        </div>
        <details className="mobile-menu relative md:hidden">
          <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-white/10 bg-white/[.04] text-white">
            <Menu className="size-5" />
          </summary>
          <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-white/10 bg-[#121219] p-2 shadow-2xl">
            {[...links, { href: user ? "/profile" : "/login", label: user ? "Profile" : "Log in" }].map(
              (link) => (
                <Link key={link.href} href={link.href} className="block rounded-xl px-4 py-3 text-sm text-zinc-300 hover:bg-white/[.06] hover:text-white">
                  {link.label}
                </Link>
              ),
            )}
            <Link href="/chat" className="button button-primary mt-1 w-full !min-h-10 !text-sm">
              Start chatting
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
