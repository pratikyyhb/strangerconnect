import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="border-t border-white/[.07] py-10">
      <div className="site-container flex flex-col items-center justify-between gap-7 md:flex-row">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Brand />
          <p className="text-xs text-zinc-600">Real conversations. Zero pressure.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-zinc-500">
          <Link className="hover:text-white" href="/safety">Community Guidelines</Link>
          <Link className="hover:text-white" href="/privacy">Privacy</Link>
          <Link className="hover:text-white" href="/terms">Terms</Link>
        </div>
        <p className="text-xs text-zinc-600">© {new Date().getFullYear()} StrangerConnect</p>
      </div>
    </footer>
  );
}
