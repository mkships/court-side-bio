import { demoProfile } from "@/lib/fixtures";
import { ogSize, profileImage } from "@/lib/og/ProfileCard";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Alex Morgan, tennis coach in Austin, on courtsidebio";

export default function Image() {
  return profileImage(demoProfile);
}
