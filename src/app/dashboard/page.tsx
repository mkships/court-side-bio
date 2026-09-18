import { SiteHeader } from "@/components/SiteHeader";
import { StudioApp } from "@/components/studio/StudioApp";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const client = await createClient();
  if (client) { const { data } = await client.auth.getUser(); if (!data.user) redirect("/login?next=/dashboard"); }
  return <><SiteHeader studio /><StudioApp /></>;
}
