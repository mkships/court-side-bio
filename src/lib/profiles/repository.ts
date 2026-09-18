import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";
import type { Profile } from "@/types/profile";

export async function getPublishedProfile(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from("published_profiles").select("payload").ilike("username", username).maybeSingle();
  const parsed = profileSchema.safeParse(data?.payload);
  if (!parsed.success) return null;
  if (parsed.data.photoKey) {
    const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrl(parsed.data.photoKey, 3600);
    return { ...parsed.data, photoUrl: signed?.signedUrl || "" };
  }
  return parsed.data;
}
