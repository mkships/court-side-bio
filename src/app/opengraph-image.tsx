import { brandImage, ogSize } from "@/lib/og/ProfileCard";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "courtsidebio: the link in bio built for tennis, pickleball and padel coaches";

export default function Image() {
  return brandImage();
}
