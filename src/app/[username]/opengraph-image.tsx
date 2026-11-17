import { getPublishedProfile } from "@/lib/profiles/repository";
import { brandImage, ogSize, profileImage } from "@/lib/og/ProfileCard";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "courtsidebio profile card";

export default async function Image({ params }: { params: { username: string } }) {
  const profile = await getPublishedProfile(params.username);
  return profile ? profileImage(profile) : brandImage();
}
