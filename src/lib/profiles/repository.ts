import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";
import type { Profile } from "@/types/profile";
import { normalizeProfile } from "./normalize";

export async function getPublishedProfile(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from("published_profiles").select("payload").ilike("username", username).maybeSingle();
  const parsed = profileSchema.safeParse(data?.payload);
  if (!parsed.success) return null;
  const profile = normalizeProfile(parsed.data);
  if (profile.photoKey) {
    const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrl(profile.photoKey, 3600);
    return { ...profile, photoUrl: signed?.signedUrl || "" };
  }
  return profile;
}
