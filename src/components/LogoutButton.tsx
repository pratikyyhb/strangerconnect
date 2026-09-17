"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={logout} disabled={loading} className="button button-secondary !min-h-10 !px-4 !text-xs">
      <LogOut className="size-3.5" /> {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
