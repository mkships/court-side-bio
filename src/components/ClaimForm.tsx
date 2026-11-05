"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/client";
import { CLAIM_KEY, cleanUsername } from "@/lib/storageKeys";

/** Landing-page username field. The typed name is carried into onboarding. */
export function ClaimForm() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    try { if (username) localStorage.setItem(CLAIM_KEY, username); } catch {}
    router.push(hasSupabaseConfig() ? "/signup" : "/studio");
  };
  return <form className="claim-bar" onSubmit={submit}>
    <span className="claim-domain" aria-hidden="true">courtsidebio.com/</span>
    <input className="claim-name" value={username} onChange={(event) => setUsername(cleanUsername(event.target.value))} placeholder="yourname" aria-label="Choose your courtsidebio username" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={24} />
    <button className="claim-go" type="submit">Claim it →</button>
  </form>;
}
