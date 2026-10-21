export const BLOCKS = ["credentials", "services", "availability", "links"] as const;
export type BlockKey = (typeof BLOCKS)[number];
export type ThemeKey = "centre" | "clay" | "hard" | "night";
export const SPORTS = ["tennis", "pickleball", "padel"] as const;
export type Sport = (typeof SPORTS)[number];
export const sportLabel = (sport: Sport) => sport[0].toUpperCase() + sport.slice(1);
export type Role = "coach" | "hitting_partner";

export type Service = {
  type: "coaching" | "hitting";
  enabled: boolean;
  price: number | null;
  note: string;
};

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
  theme: ThemeKey;
  blockOrder: BlockKey[];
  hiddenBlocks: BlockKey[];
};

export type UpcomingSlot = AvailabilitySlot & { iso: string; label: string; shortLabel: string };
