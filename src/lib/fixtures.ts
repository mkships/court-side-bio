import type { Profile } from "@/types/profile";

export const demoProfile: Profile = {
  schemaVersion: 1,
  username: "alexmorgan",
  name: "Alex Morgan",
  headline: "Thoughtful training. Competitive energy. A better next point.",
  bio: "Former college player helping adults and juniors build reliable, confident tennis through purposeful sessions.",
  sports: ["tennis"],
  roles: ["coach", "hitting_partner"],
  location: "Austin, Texas",
  photoUrl: "",
  photoKey: "",
  email: "alex@example.com",
  whatsapp: "+15125550142",
  timezone: "America/Chicago",
  currency: "USD",
  ratingSystem: "UTR",
  ratingValue: "10.8",
  ratingUrl: "https://www.utrsports.net/",
  playingBackground: "Former NCAA Division II player and conference finalist.",
  coachingExperience: "Six years coaching juniors and adult competitors.",
  services: [
    { type: "coaching", enabled: true, price: 65, note: "Technique, tactics and match preparation", duration: 60 },
    { type: "hitting", enabled: true, price: 45, note: "High-intensity live-ball practice", duration: 60 },
    { type: "clinic", enabled: true, price: 30, note: "Saturday doubles drills · up to 6 players", duration: 90 }
  ],
  availability: [
    { weekday: 2, start: "18:00" },
    { weekday: 4, start: "17:00" },
    { weekday: 6, start: "09:00" }
  ],
  availabilityVisible: true,
  links: { instagram: "https://instagram.com/", youtube: "https://youtube.com/", website: "" },
  testimonials: [
    { quote: "Six weeks with Alex and my second serve finally holds up in league matches.", name: "Jordan P.", context: "4.0 league player" },
    { quote: "Hitting sessions are intense, organised and genuinely fun. My daughter asks to go every week.", name: "Sam R.", context: "Parent of a 14U player" }
  ],
  theme: "centre",
  blockOrder: ["credentials", "services", "testimonials", "availability", "links"],
  hiddenBlocks: []
};

export const emptyProfile: Profile = {
  ...demoProfile,
  username: "",
  name: "",
  headline: "",
  bio: "",
  roles: ["coach"],
  location: "",
  ratingValue: "",
  ratingUrl: "",
  playingBackground: "",
  coachingExperience: "",
  email: "",
  whatsapp: "",
  services: demoProfile.services.map((service) => ({ ...service, enabled: false, price: null, note: "", duration: 60 })),
  availability: [],
  links: { instagram: "", youtube: "", website: "" },
  testimonials: []
};
