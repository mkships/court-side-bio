import type { Metadata } from "next";
import { demoProfile } from "@/lib/fixtures";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";

export const metadata: Metadata = { title: "Alex Morgan — Tennis coach in Austin | courtsidebio", description: demoProfile.bio, robots: { index: false, follow: false } };
export default function DemoPage() { return <ProfileRenderer profile={demoProfile} />; }
