"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //true means making a new account, false means logging in
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    //picks sign up or log in depending on which mode we're in
    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    //it worked so send them back to discovering
    router.push("/");
  }
  return (
    <main>
      <Link href="/">Back</Link>
      <h1>{isSignUp ? "Create an account" : "Log in"}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (6+ characters)"
          minLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : isSignUp ? "Sign up" : "Log in"}
        </button>
      </form>
      {error && <p>{error}</p>}
      {/*flips between log in and sign up*/}
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
    </main>
  );
}