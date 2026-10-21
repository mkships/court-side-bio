"use client";
import { useEffect, useState } from "react";
import type { Profile } from "@/types/profile";
import { CourtLines } from "@/components/CourtArt";
import { OutOfBounds } from "@/components/OutOfBounds";
import { ProfileRenderer } from "./ProfileRenderer";

export function PublicProfileClient({ username, serverProfile }: { username: string; serverProfile: Profile | null }) {
  const [profile, setProfile] = useState<Profile | null>(serverProfile);
  const [ready, setReady] = useState(Boolean(serverProfile));
  useEffect(() => { if (serverProfile) return; try { const saved = JSON.parse(localStorage.getItem("courtside:workspace:v1") || "null"); if (saved?.published?.username?.toLowerCase() === username.toLowerCase()) setProfile(saved.published); } catch {} setReady(true); }, [serverProfile, username]);
  if (!ready) return <main className="auth-page theme-centre"><CourtLines className="auth-court" /><span className="meta loading-call">Finding the baseline…</span></main>;
  if (!profile) return <OutOfBounds />;
  return <ProfileRenderer profile={profile} />;
}
