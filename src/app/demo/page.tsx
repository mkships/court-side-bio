import type { Metadata } from "next";
import { demoProfile } from "@/lib/fixtures";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";
import { ProfileJsonLd } from "@/components/profile/ProfileJsonLd";

const title = "Alex Morgan — Tennis coach in Austin";
export const metadata: Metadata = {
  title: `${title} | courtsidebio`, description: demoProfile.bio, robots: { index: false, follow: false },
  openGraph: { title, description: demoProfile.bio, type: "profile", siteName: "courtsidebio", url: "/demo" },
  twitter: { card: "summary_large_image", title, description: demoProfile.bio }
};
export default function DemoPage() { return <><ProfileJsonLd profile={demoProfile} /><ProfileRenderer profile={demoProfile} /></>; }
