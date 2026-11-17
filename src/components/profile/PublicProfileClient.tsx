"use client";
import { useEffect, useState } from "react";
import type { Profile } from "@/types/profile";
import { OutOfBounds } from "@/components/OutOfBounds";
import { ProfileRenderer } from "./ProfileRenderer";
import { WORKSPACE_KEY } from "@/lib/storageKeys";
import { normalizeProfile } from "@/lib/profiles/normalize";

export function PublicProfileClient({ username, serverProfile }: { username: string; serverProfile: Profile | null }) {
  const [profile, setProfile] = useState<Profile | null>(serverProfile);
  const [ready, setReady] = useState(Boolean(serverProfile));
  useEffect(() => { if (serverProfile) return; try { const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY) || "null"); if (saved?.published?.username?.toLowerCase() === username.toLowerCase()) setProfile(normalizeProfile(saved.published)); } catch {} setReady(true); }, [serverProfile, username]);
  if (!ready) return <main className="auth-page"><span className="loading-call">Loading…</span></main>;
  if (!profile) return <OutOfBounds />;
  return <ProfileRenderer profile={profile} />;
}
