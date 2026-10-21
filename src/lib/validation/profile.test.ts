import { describe, expect, it } from "vitest";
import { demoProfile } from "../fixtures";
import { emailSchema, usernameSchema, validateForPublish, whatsappSchema } from "./profile";

describe("profile validation", () => {
  it("rejects reserved usernames regardless of case normalization", () => {
    expect(usernameSchema.safeParse("dashboard").success).toBe(false);
    expect(usernameSchema.safeParse("Dashboard").success).toBe(false);
  });

  it("rejects usernames that collide with app routes", () => {
    for (const route of ["auth", "recover", "update-password"]) expect(usernameSchema.safeParse(route).success).toBe(false);
  });

  it("requires a contact method to publish", () => {
    const result = validateForPublish({ ...demoProfile, email: "", whatsapp: "" });
    expect(result.success).toBe(false);
  });

  it("accepts the development fixture", () => {
    expect(validateForPublish(demoProfile).success).toBe(true);
  });

  it("rejects duplicate weekly slots", () => {
    const duplicate = { weekday: 2, start: "18:00" };
    expect(validateForPublish({ ...demoProfile, availability: [duplicate, duplicate] }).success).toBe(false);
  });

  it("validates onboarding contact fields before publishing", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(whatsappSchema.safeParse("555-1234").success).toBe(false);
    expect(whatsappSchema.safeParse("+14155550123").success).toBe(true);
  });
});
