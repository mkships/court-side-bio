import type { Metadata } from "next";
import { getPublishedProfile } from "@/lib/profiles/repository";
import { PublicProfileClient } from "@/components/profile/PublicProfileClient";
import { ProfileJsonLd } from "@/components/profile/ProfileJsonLd";
import { notFound } from "next/navigation";
import { sportLabel } from "@/types/profile";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params; const profile = await getPublishedProfile(username);
  if (!profile) return { title: "courtsidebio profile", robots: { index: false, follow: false } };
  const title = `${profile.name} — ${profile.sports.map(sportLabel).join(" & ")} ${profile.roles.includes("coach") ? "coach" : "hitting partner"}${profile.location ? ` in ${profile.location}` : ""}`;
  const description = profile.bio || profile.headline || `Contact ${profile.name} directly on courtsidebio.`;
  return {
    title: `${title} | courtsidebio`, description, robots: { index: true, follow: true },
    alternates: { canonical: `/${profile.username}` },
    openGraph: { title, description, type: "profile", siteName: "courtsidebio", url: `/${profile.username}` },
    twitter: { card: "summary_large_image", title, description }
  };
}
export default async function PublicPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params; const profile = await getPublishedProfile(username);
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !profile) notFound();
  return <>{profile && <ProfileJsonLd profile={profile} />}<PublicProfileClient username={username} serverProfile={profile} /></>;
}
