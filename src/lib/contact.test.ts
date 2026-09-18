import { describe, expect, it } from "vitest";
import { contactLinks, inquiryMessage } from "./contact";
import { demoProfile } from "./fixtures";

describe("contact helpers", () => {
  it("builds a human-readable preferred-time inquiry", () => {
    const message = inquiryMessage(demoProfile, "coaching", { weekday: 2, start: "18:00", iso: "2026-09-22T23:00:00.000Z", label: "Tuesday, September 22 at 6:00 PM (America/Chicago)", shortLabel: "Tue, Sep 22, 6:00 PM" }, "I am preparing for a league match.");
    expect(message).toContain("private coaching on Tuesday, September 22 at 6:00 PM (America/Chicago)");
    expect(message).toContain("I am preparing for a league match.");
  });

  it("normalizes WhatsApp and encodes outbound content", () => {
    const links = contactLinks({ ...demoProfile, whatsapp: "+1 (512) 555-0142" }, "Hello & welcome");
    expect(links.whatsapp).toBe("https://wa.me/15125550142?text=Hello%20%26%20welcome");
    expect(links.email).toContain("subject=Training%20inquiry");
  });
});
