"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) { setMessage("Use at least eight characters."); return; }
    if (password !== confirm) { setMessage("The passwords do not match."); return; }
    const client = createClient(); if (!client) { setMessage("Supabase is not configured."); return; }
    setBusy(true); const { error } = await client.auth.updateUser({ password }); setBusy(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Password updated. Redirecting to your studio…"); window.setTimeout(() => router.push("/studio"), 700);
  };
  return <main className="auth-page theme-centre"><form className="auth-card" onSubmit={submit}><div className="meta">Account recovery</div><h1>Choose a new password.</h1><p className="muted">Your recovery link establishes a short-lived authenticated session for this change.</p><div className="field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" minLength={8} autoComplete="new-password" required value={password} onChange={(event)=>setPassword(event.target.value)}/></div><div className="field"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" minLength={8} autoComplete="new-password" required value={confirm} onChange={(event)=>setConfirm(event.target.value)}/></div><button className="button primary" style={{width:"100%",marginTop:20}} disabled={busy}>{busy ? "Updating…" : "Update password"}</button>{message&&<p className="fineprint" role="status">{message}</p>}</form></main>;
}
