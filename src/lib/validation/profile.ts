import { z } from "zod";

// Keep in sync with public.is_reserved_username in supabase/migrations.
export const reservedUsernames = new Set(["about", "admin", "api", "auth", "dashboard", "demo", "help", "login", "onboarding", "pricing", "recover", "settings", "signup", "studio", "support", "terms", "update-password"]);
export const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,23}$/, "Use 3–24 lowercase letters, numbers, hyphens or underscores").refine((value) => !reservedUsernames.has(value), "That username is reserved");
const isUrl = (value: string) => { try { new URL(value); return true; } catch { return false; } };
const optionalUrl = (message: string) => z.string().refine((value) => value === "" || ((value.startsWith("https://") || value.startsWith("data:image/")) && isUrl(value)), message);
export const emailSchema = z.union([z.literal(""), z.string().email("Enter a valid email address")]);
export const whatsappSchema = z.union([z.literal(""), z.string().regex(/^\+[1-9]\d{7,14}$/, "Use an international WhatsApp number such as +14155550123")]);

const blockKey = z.enum(["credentials", "services", "testimonials", "availability", "links"]);

export const profileSchema = z.object({
  schemaVersion: z.literal(1), username: usernameSchema,
  name: z.string().trim().min(2, "Add your full name").max(80, "Keep your name under 80 characters"),
  headline: z.string().max(120, "Keep your headline under 120 characters"), bio: z.string().max(250, "Keep your bio under 250 characters"),
  sports: z.array(z.enum(["tennis", "pickleball", "padel"])).min(1, "Choose at least one sport"),
  roles: z.array(z.enum(["coach", "hitting_partner"])).min(1, "Choose at least one role"),
  location: z.string().max(100, "Keep your location under 100 characters"), photoUrl: optionalUrl("Upload your profile photo again"), photoKey: z.string().max(300),
  email: emailSchema, whatsapp: whatsappSchema, timezone: z.string().min(1, "Choose your timezone"), currency: z.string().length(3, "Choose a currency"),
  ratingSystem: z.enum(["UTR", "DUPR", "NTRP", "Playtomic", "Other"]), ratingValue: z.string().max(20, "Keep your rating under 20 characters"),
  ratingUrl: optionalUrl("Rating source must be a full https:// link"),
  playingBackground: z.string().max(500, "Keep your playing background under 500 characters"), coachingExperience: z.string().max(500, "Keep your coaching experience under 500 characters"),
  services: z.array(z.object({
    type: z.enum(["coaching", "hitting", "clinic"]), enabled: z.boolean(),
    price: z.number().min(0, "Prices can't be negative").max(100000, "Prices must be under 100,000").nullable(),
    note: z.string().max(140, "Keep service notes under 140 characters"),
    // Profiles published before session lengths existed were hourly.
    duration: z.number().int().min(15, "Sessions must be at least 15 minutes").max(240, "Sessions must be 4 hours or less").default(60)
  })).refine((services) => new Set(services.map((service) => service.type)).size === services.length, "Each service can only appear once"),
  availability: z.array(z.object({ weekday: z.number().int().min(0).max(6), start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) })).refine((slots) => new Set(slots.map((slot) => `${slot.weekday}-${slot.start}`)).size === slots.length, "Duplicate availability slot"),
  availabilityVisible: z.boolean(),
  links: z.object({ instagram: optionalUrl("Instagram link must be a full https:// link"), youtube: optionalUrl("YouTube link must be a full https:// link"), website: optionalUrl("Website link must be a full https:// link") }),
  // Profiles published before testimonials existed have no list; keep in sync with validate_profile_payload.
  testimonials: z.array(z.object({
    quote: z.string().trim().min(1, "Add the quote or remove the empty testimonial").max(280, "Keep each testimonial under 280 characters"),
    name: z.string().trim().min(1, "Add who each testimonial is from").max(60, "Keep testimonial names under 60 characters"),
    context: z.string().max(60, "Keep testimonial context under 60 characters")
  })).max(3, "Show up to 3 testimonials").default([]),
  theme: z.enum(["centre", "clay", "hard", "night"]),
  // Older payloads have four blocks; normalizeProfile adds any that are missing.
  blockOrder: z.array(blockKey).min(1).max(5).refine((order) => new Set(order).size === order.length, "Each block can only appear once"),
  hiddenBlocks: z.array(blockKey)
}).superRefine((profile, context) => {
  if (!profile.email && !profile.whatsapp) context.addIssue({ code: "custom", path: ["email"], message: "Add an email or WhatsApp number so players can reach you" });
});

export function validateForPublish(profile: unknown) {
  return profileSchema.safeParse(profile);
}
