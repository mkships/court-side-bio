import { validateForPublish } from "@/lib/validation/profile";
import type { Profile } from "@/types/profile";

/** Studio sections a checklist item can jump to. */
export type HealthFocus = "identity" | "contact" | "credentials" | "services" | "testimonials" | "availability" | "links" | "appearance";
export type Blocker = { message: string; focus: HealthFocus };
export type StrengthItem = { key: string; label: string; done: boolean; focus: HealthFocus };

const sectionFor = (path: readonly PropertyKey[]): HealthFocus => {
  const key = String(path[0] ?? "");
  if (key === "email" || key === "whatsapp") return "contact";
  if (["ratingSystem", "ratingValue", "ratingUrl", "playingBackground", "coachingExperience"].includes(key)) return "credentials";
  if (key === "services") return "services";
  if (key === "testimonials") return "testimonials";
  if (["availability", "availabilityVisible", "timezone"].includes(key)) return "availability";
  if (key === "links") return "links";
  if (["theme", "blockOrder", "hiddenBlocks"].includes(key)) return "appearance";
  return "identity";
};

/** Every reason the profile can't be published yet, each pointing at the section that fixes it. */
export function publishBlockers(profile: unknown): Blocker[] {
  const result = validateForPublish(profile);
  if (result.success) return [];
  const seen = new Set<string>();
  return result.error.issues.flatMap((issue) => {
    if (seen.has(issue.message)) return [];
    seen.add(issue.message);
    return [{ message: issue.message, focus: sectionFor(issue.path) }];
  });
}

/** Optional extras that make a page more convincing. They never block publishing. */
export function strengthItems(profile: Profile): StrengthItem[] {
  return [
    { key: "photo", label: "Add a profile photo", done: Boolean(profile.photoUrl || profile.photoKey), focus: "identity" },
    { key: "headline", label: "Write a one-line headline", done: Boolean(profile.headline.trim()), focus: "identity" },
    { key: "bio", label: "Tell players about yourself", done: Boolean(profile.bio.trim()), focus: "identity" },
    { key: "rating", label: "Show your rating", done: Boolean(profile.ratingValue.trim()), focus: "credentials" },
    { key: "services", label: "Price at least one service", done: profile.services.some((service) => service.enabled && service.price !== null), focus: "services" },
    { key: "testimonials", label: "Add a player testimonial", done: profile.testimonials.some((item) => item.quote.trim()), focus: "testimonials" },
    { key: "availability", label: "Set weekly court times", done: profile.availabilityVisible && profile.availability.length > 0, focus: "availability" },
    { key: "links", label: "Link Instagram, YouTube or a website", done: Object.values(profile.links).some(Boolean), focus: "links" }
  ];
}
