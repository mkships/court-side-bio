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
    { type: "coaching", enabled: true, price: 65, note: "Technique, tactics and match preparation" },
    { type: "hitting", enabled: true, price: 45, note: "High-intensity live-ball practice" }
  ],
  availability: [
    { weekday: 2, start: "18:00" },
    { weekday: 4, start: "17:00" },
    { weekday: 6, start: "09:00" }
  ],
  availabilityVisible: true,
  links: { instagram: "https://instagram.com/", youtube: "https://youtube.com/", website: "" },
  theme: "centre",
  blockOrder: ["credentials", "services", "availability", "links"],
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
  services: demoProfile.services.map((service) => ({ ...service, enabled: false, price: null, note: "" })),
  availability: [],
  links: { instagram: "", youtube: "", website: "" }
};
