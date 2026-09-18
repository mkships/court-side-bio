"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

export function AuthForm({ mode, nextPath = "/studio" }: { mode: "login" | "signup" | "recover"; nextPath?: string }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage("");
    if (!hasSupabaseConfig()) { setMessage("Supabase is not configured. Use the local studio to explore every product flow without an account."); return; }
    setBusy(true); const client = createClient()!;
    if (mode === "recover") { const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/update-password` }); setMessage(error?.message || "Check your email for a recovery link."); setBusy(false); return; }
    const result = mode === "signup" ? await client.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/studio` } }) : await client.auth.signInWithPassword({ email, password });
    if (result.error) setMessage(result.error.message); else if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm your account."); else router.push(nextPath); setBusy(false);
  };
  return <main className="auth-page theme-centre"><form className="auth-card" onSubmit={submit}><div className="meta">courtsidebio creator access</div><h1>{mode === "signup" ? "Create your account." : mode === "recover" ? "Reset your password." : "Welcome back."}</h1><p className="muted">{mode === "signup" ? "One account, one permanent profile." : "Your draft stays private until you publish."}</p><div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/></div>{mode !== "recover" && <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={(e)=>setPassword(e.target.value)}/></div>}<button className="button primary" style={{width:"100%",marginTop:20}} disabled={busy}>{busy ? "Working…" : mode === "signup" ? "Create account" : mode === "recover" ? "Send recovery email" : "Sign in"}</button>{message && <p className="fineprint" role="status">{message}</p>}<p className="fineprint">{mode === "login" ? <><Link href="/signup">Create account</Link> · <Link href="/recover">Forgot password?</Link></> : <Link href="/login">Back to sign in</Link>}</p>{!hasSupabaseConfig() && <Link href="/studio" className="button" style={{width:"100%"}}>Open local demo studio</Link>}</form></main>;
}
