"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { moveGuestLikesToAccount } from "@/lib/likes";
import { getPreferences } from "@/lib/preferences";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/styles";
import Header from "@/components/header";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }
    //where to go after logging in, home by default
    let nextPage = "/";
    if (data.user) {
      try {
        await moveGuestLikesToAccount(data.user.id);
      } catch (err) {
        console.error(err);
      }
      //anyone who hasn't answered the questions yet goes there first
      try {
        const prefs = await getPreferences(data.user.id);
        if (!prefs) nextPage = "/onboarding";
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
    router.push(nextPage);
  }
  //underlines whichever tab is active
  function tabClass(active: boolean) {
    return `-mb-px pb-3 transition-colors ${active ? "border-b-2 border-accent text-cream" : "text-muted hover:text-cream"}`;
  }
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <div className="flex min-h-0 flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-center font-display text-[clamp(40px,7vh,64px)] uppercase leading-none tracking-wide">
            {isSignUp ? "Join Swune" : "Welcome back"}
          </h1>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            Swipe. Tune. Swoon.
          </p>
          {/*tabs to switch between logging in and signing up*/}
          <div className="mt-8 grid grid-cols-2 border-b border-line text-center font-mono text-xs uppercase tracking-widest">
            <button type="button" onClick={() => setIsSignUp(false)} className={tabClass(!isSignUp)}>
              Log in
            </button>
            <button type="button" onClick={() => setIsSignUp(true)} className={tabClass(isSignUp)}>
              Sign up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className={labelClass}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className={`mt-1.5 block ${inputClass}`}
              />
            </label>
            <label className={labelClass}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ characters"
                minLength={6}
                required
                className={`mt-1.5 block ${inputClass}`}
              />
            </label>
            <button type="submit" disabled={loading} className={`mt-2 ${primaryButtonClass}`}>
              {loading ? "One sec..." : isSignUp ? "Create account" : "Log in"}
            </button>
          </form>
          {error && (
            <p className="mt-4 rounded-card border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
              {error}
            </p>
          )}
          <p className="mt-6 text-center text-sm text-muted">
            Just browsing?{" "}
            <Link href="/" className="text-accent hover:underline">
              Keep going as a guest
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}