"use client";
import { useEffect, useState } from "react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { Profile } from "@/types/profile";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export function PhotoUpload({ profile, patch }: { profile: Profile; patch: (value: Partial<Profile>) => void }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!hasSupabaseConfig() || !profile.photoKey || profile.photoUrl) return;
    createClient()!.storage.from("profile-photos").createSignedUrl(profile.photoKey, 3600).then(({ data }) => { if (data?.signedUrl) patch({ photoUrl: data.signedUrl }); });
  }, [profile.photoKey, profile.photoUrl, patch]);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!allowed.has(file.type)) { setMessage("Use a JPEG, PNG or WebP image."); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage("Photo must be 5 MB or smaller."); return; }
    if (!hasSupabaseConfig()) {
      const reader = new FileReader(); reader.onload = () => patch({ photoUrl: String(reader.result), photoKey: "" }); reader.readAsDataURL(file); setMessage("Stored in this browser for demo mode."); return;
    }
    setBusy(true); const client = createClient()!; const { data: auth } = await client.auth.getUser();
    if (!auth.user) { setMessage("Sign in before uploading a photo."); setBusy(false); return; }
    const extension = file.type.split("/")[1].replace("jpeg", "jpg"); const key = `${auth.user.id}/profile-${Date.now()}.${extension}`;
    const { error } = await client.storage.from("profile-photos").upload(key, file, { contentType: file.type, upsert: false });
    if (error) { setMessage(error.message); setBusy(false); return; }
    const { data: signed } = await client.storage.from("profile-photos").createSignedUrl(key, 3600);
    if (profile.photoKey) await client.storage.from("profile-photos").remove([profile.photoKey]);
    patch({ photoKey: key, photoUrl: signed?.signedUrl || "" }); setMessage("Photo uploaded."); setBusy(false);
  };
  const remove = async () => { if (hasSupabaseConfig() && profile.photoKey) await createClient()!.storage.from("profile-photos").remove([profile.photoKey]); patch({ photoKey: "", photoUrl: "" }); setMessage("Photo removed."); };
  return <div className="section-card"><div className="section-card-head"><strong>Profile photo</strong>{(profile.photoKey || profile.photoUrl) && <button className="button small ghost" onClick={remove}>Remove</button>}</div><label className="field"><span>Upload your own photo</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => upload(event.target.files?.[0])}/><span className="muted">JPEG, PNG or WebP · maximum 5 MB</span></label>{message && <p className="fineprint" role="status">{message}</p>}</div>;
}
