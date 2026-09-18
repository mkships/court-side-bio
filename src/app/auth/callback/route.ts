import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const requested = url.searchParams.get("next");
  if (code) await (await createClient())?.auth.exchangeCodeForSession(code);
  const next = requested === "/update-password" ? "/update-password" : "/studio";
  return NextResponse.redirect(new URL(next, url.origin));
}
