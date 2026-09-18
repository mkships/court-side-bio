"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Profile } from "@/types/profile";
import { ProfileRenderer } from "./ProfileRenderer";

export function PublicProfileClient({ username, serverProfile }: { username: string; serverProfile: Profile | null }) {
  const [profile, setProfile] = useState<Profile | null>(serverProfile);
  const [ready, setReady] = useState(Boolean(serverProfile));
  useEffect(() => { if (serverProfile) return; try { const saved = JSON.parse(localStorage.getItem("courtside:workspace:v1") || "null"); if (saved?.published?.username?.toLowerCase() === username.toLowerCase()) setProfile(saved.published); } catch {} setReady(true); }, [serverProfile, username]);
  if (!ready) return <main className="auth-page"><span className="meta">Finding the baseline…</span></main>;
  if (!profile) return <main className="auth-page theme-centre"><section className="auth-card"><div className="meta">404 · Out of bounds</div><h1>This page isn’t available.</h1><p className="muted">The profile may be unpublished, deleted, or the link may be incorrect.</p><Link href="/" className="button">Go to courtsidebio</Link></section></main>;
  return <ProfileRenderer profile={profile} />;
}
