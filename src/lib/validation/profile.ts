import { z } from "zod";

// Keep in sync with public.is_reserved_username in supabase/migrations.
export const reservedUsernames = new Set(["about", "admin", "api", "auth", "dashboard", "demo", "help", "login", "onboarding", "pricing", "recover", "settings", "signup", "studio", "support", "terms", "update-password"]);
export const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,23}$/, "Use 3–24 lowercase letters, numbers, hyphens or underscores").refine((value) => !reservedUsernames.has(value), "That username is reserved");
const optionalUrl = z.union([z.literal(""), z.string().url().refine((value) => value.startsWith("https://") || value.startsWith("data:image/"), "Use a secure https:// URL")]);
export const emailSchema = z.union([z.literal(""), z.string().email("Enter a valid email address")]);
export const whatsappSchema = z.union([z.literal(""), z.string().regex(/^\+[1-9]\d{7,14}$/, "Use an international number such as +14155550123")]);

export const profileSchema = z.object({
  schemaVersion: z.literal(1), username: usernameSchema, name: z.string().trim().min(2).max(80),
  headline: z.string().max(120), bio: z.string().max(250), sports: z.array(z.enum(["tennis", "pickleball", "padel"])).min(1),
  roles: z.array(z.enum(["coach", "hitting_partner"])).min(1), location: z.string().max(100), photoUrl: optionalUrl, photoKey: z.string().max(300),
  email: emailSchema, whatsapp: whatsappSchema, timezone: z.string().min(1), currency: z.string().length(3),
  ratingSystem: z.enum(["UTR", "DUPR", "NTRP", "Playtomic", "Other"]), ratingValue: z.string().max(20), ratingUrl: optionalUrl,
  playingBackground: z.string().max(500), coachingExperience: z.string().max(500),
  services: z.array(z.object({ type: z.enum(["coaching", "hitting"]), enabled: z.boolean(), price: z.number().min(0).max(100000).nullable(), note: z.string().max(140) })),
  availability: z.array(z.object({ weekday: z.number().int().min(0).max(6), start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) })).refine((slots) => new Set(slots.map((slot) => `${slot.weekday}-${slot.start}`)).size === slots.length, "Duplicate availability slot"),
  availabilityVisible: z.boolean(), links: z.object({ instagram: optionalUrl, youtube: optionalUrl, website: optionalUrl }),
  theme: z.enum(["centre", "clay", "hard", "night"]), blockOrder: z.array(z.enum(["credentials", "services", "availability", "links"])).length(4),
  hiddenBlocks: z.array(z.enum(["credentials", "services", "availability", "links"]))
}).superRefine((profile, context) => {
  if (!profile.email && !profile.whatsapp) context.addIssue({ code: "custom", path: ["email"], message: "Add an email or WhatsApp number" });
});

export function validateForPublish(profile: unknown) {
  return profileSchema.safeParse(profile);
}
