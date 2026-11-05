import { brandImage, ogSize } from "@/lib/og/ProfileCard";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "courtsidebio: Your court. Your page.";

export default function Image() {
  return brandImage();
}
