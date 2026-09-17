"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push("/profile");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {!isLogin && (
        <div>
          <label className="form-label" htmlFor="username">Username</label>
          <input className="form-input" id="username" name="username" minLength={3} maxLength={32} autoComplete="username" placeholder="your_username" required />
        </div>
      )}
      <div>
        <label className="form-label" htmlFor="email">{isLogin ? "Email or username" : "Email address"}</label>
        <input className="form-input" id="email" name="email" type={isLogin ? "text" : "email"} autoComplete={isLogin ? "username" : "email"} placeholder={isLogin ? "you@example.com or username" : "you@example.com"} required />
      </div>
      <div>
        <label className="form-label" htmlFor="password">Password</label>
        <div className="relative">
          <input className="form-input !pr-12" id="password" name="password" type={showPassword ? "text" : "password"} minLength={8} maxLength={72} autoComplete={isLogin ? "current-password" : "new-password"} placeholder="At least 8 characters" required />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-500/15 bg-red-500/[.07] px-3.5 py-3 text-xs leading-5 text-red-300">{error}</p>}
      <button className="button button-primary w-full" disabled={loading}>
        {loading ? <LoaderCircle className="size-4 animate-spin" /> : <>{isLogin ? "Log in" : "Create account"}<ArrowRight className="size-4" /></>}
      </button>
      <p className="text-center text-xs text-zinc-600">
        {isLogin ? "New here?" : "Already have an account?"}{" "}
        <Link className="font-medium text-violet-400 hover:text-violet-300" href={isLogin ? "/register" : "/login"}>{isLogin ? "Create an account" : "Log in"}</Link>
      </p>
    </form>
  );
}
