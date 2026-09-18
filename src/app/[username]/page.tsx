import type { Metadata } from "next";
import { getPublishedProfile } from "@/lib/profiles/repository";
import { PublicProfileClient } from "@/components/profile/PublicProfileClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params; const profile = await getPublishedProfile(username);
  if (!profile) return { title: "courtsidebio profile", robots: { index: false, follow: false } };
  return { title: `${profile.name} | courtsidebio`, description: profile.bio || profile.headline, robots: { index: true, follow: true }, openGraph: { title: profile.name, description: profile.bio || profile.headline, images: profile.photoUrl ? [profile.photoUrl] : [] } };
}
export default async function PublicPage({ params }: { params: Promise<{ username: string }> }) { const { username } = await params; const profile = await getPublishedProfile(username); if (process.env.NEXT_PUBLIC_SUPABASE_URL && !profile) notFound(); return <PublicProfileClient username={username} serverProfile={profile} />; }
