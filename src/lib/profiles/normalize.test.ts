import { describe, expect, it } from "vitest";
import { demoProfile } from "@/lib/fixtures";
import { validateForPublish } from "@/lib/validation/profile";
import { normalizeProfile } from "./normalize";

// Shape of a profile saved before session lengths and group clinics existed.
const legacy = {
  ...demoProfile,
  services: [
    { type: "hitting" as const, enabled: true, price: 45, note: "Live ball" },
    { type: "coaching" as const, enabled: true, price: 65, note: "Technique" }
  ],
  links: { instagram: "https://instagram.com/" } as never
};

describe("normalizeProfile", () => {
  it("fills in every service type in a fixed order with hourly defaults", () => {
    const profile = normalizeProfile(legacy);
    expect(profile.services.map((service) => service.type)).toEqual(["coaching", "hitting", "clinic"]);
    expect(profile.services[0]).toMatchObject({ enabled: true, price: 65, note: "Technique", duration: 60 });
    expect(profile.services[2]).toMatchObject({ enabled: false, price: null, duration: 60 });
  });

  it("restores missing link keys", () => {
    expect(normalizeProfile(legacy).links).toEqual({ instagram: "https://instagram.com/", youtube: "", website: "" });
  });

  it("keeps saved session lengths", () => {
    expect(normalizeProfile(demoProfile).services.find((service) => service.type === "clinic")?.duration).toBe(90);
  });

  it("produces a publishable profile from a legacy payload", () => {
    expect(validateForPublish(normalizeProfile(legacy)).success).toBe(true);
  });
});
