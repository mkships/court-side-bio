import { describe, expect, it } from "vitest";
import { demoProfile, emptyProfile } from "./fixtures";
import { publishBlockers, strengthItems } from "./profileHealth";

describe("profile health", () => {
  it("has no blockers for a complete profile", () => {
    expect(publishBlockers(demoProfile)).toEqual([]);
  });

  it("lists every blocker with friendly copy and the section that fixes it", () => {
    const blockers = publishBlockers({ ...demoProfile, name: "A", email: "", whatsapp: "", links: { ...demoProfile.links, website: "example.com" } });
    expect(blockers).toEqual(expect.arrayContaining([
      { message: "Add your full name", focus: "identity" },
      { message: "Add an email or WhatsApp number so players can reach you", focus: "contact" },
      { message: "Website link must be a full https:// link", focus: "links" },
    ]));
  });

  it("scores optional extras without blocking publish", () => {
    const empty = strengthItems({ ...emptyProfile, username: "newcoach", name: "New Coach" });
    expect(empty.every((item) => !item.done)).toBe(true);
    const full = strengthItems({ ...demoProfile, photoUrl: "https://example.com/me.jpg" });
    expect(full.every((item) => item.done)).toBe(true);
  });

  it("treats hidden availability as incomplete", () => {
    const items = strengthItems({ ...demoProfile, availabilityVisible: false });
    expect(items.find((item) => item.key === "availability")?.done).toBe(false);
  });
});
