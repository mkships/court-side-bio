export const BLOCKS = ["credentials", "services", "testimonials", "availability", "links"] as const;
export type BlockKey = (typeof BLOCKS)[number];
export type ThemeKey = "centre" | "clay" | "hard" | "night";
export const SPORTS = ["tennis", "pickleball", "padel"] as const;
export type Sport = (typeof SPORTS)[number];
export const sportLabel = (sport: Sport) => sport[0].toUpperCase() + sport.slice(1);
export type Role = "coach" | "hitting_partner";

export const SERVICE_TYPES = ["coaching", "hitting", "clinic"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];
export const SESSION_LENGTHS = [30, 45, 60, 75, 90, 120] as const;
export const serviceName = (type: ServiceType) => type === "coaching" ? "Private coaching" : type === "hitting" ? "Hitting session" : "Group clinic";

export type Service = {
  type: ServiceType;
  enabled: boolean;
  /** Per session, or per player for group clinics. */
  price: number | null;
  note: string;
  /** Session length in minutes. */
  duration: number;
};

export const MAX_TESTIMONIALS = 3;
export type Testimonial = { quote: string; name: string; context: string };

export type AvailabilitySlot = { weekday: number; start: string };

export type Profile = {
  schemaVersion: 1;
  username: string;
  name: string;
  headline: string;
  bio: string;
  sports: Sport[];
  roles: Role[];
  location: string;
  photoUrl: string;
  photoKey: string;
  email: string;
  whatsapp: string;
  timezone: string;
  currency: string;
  ratingSystem: "UTR" | "DUPR" | "NTRP" | "Playtomic" | "Other";
  ratingValue: string;
  ratingUrl: string;
  playingBackground: string;
  coachingExperience: string;
  services: Service[];
  availability: AvailabilitySlot[];
  availabilityVisible: boolean;
  links: { instagram: string; youtube: string; website: string };
  testimonials: Testimonial[];
  theme: ThemeKey;
  blockOrder: BlockKey[];
  hiddenBlocks: BlockKey[];
};

export type UpcomingSlot = AvailabilitySlot & { iso: string; label: string; shortLabel: string };
