import { describe, expect, it } from "vitest";
import { upcomingSlots } from "./availability";

describe("upcomingSlots", () => {
  it("returns only future occurrences within seven local calendar days", () => {
    const now = new Date("2026-09-17T16:00:00.000Z");
    const result = upcomingSlots([
      { weekday: 4, start: "09:00" },
      { weekday: 4, start: "18:00" },
      { weekday: 5, start: "09:00" },
      { weekday: 3, start: "09:00" }
    ], "America/Chicago", now);
    expect(result.map((slot) => slot.start)).toEqual(["18:00", "09:00", "09:00"]);
    expect(result.every((slot) => new Date(slot.iso) > now)).toBe(true);
  });

  it("resolves local times through a daylight-saving offset change", () => {
    const result = upcomingSlots([{ weekday: 0, start: "09:00" }], "America/New_York", new Date("2026-10-31T12:00:00.000Z"));
    expect(result[0].iso).toBe("2026-11-01T14:00:00.000Z");
  });

  it("skips a nonexistent local time during the spring-forward transition", () => {
    const result = upcomingSlots([{ weekday: 0, start: "02:30" }], "America/New_York", new Date("2026-03-07T12:00:00.000Z"));
    expect(result).toEqual([]);
  });

  it("chooses the earlier occurrence for an ambiguous fall-back time", () => {
    const result = upcomingSlots([{ weekday: 0, start: "01:30" }], "America/New_York", new Date("2026-10-31T12:00:00.000Z"));
    expect(result[0].iso).toBe("2026-11-01T05:30:00.000Z");
  });
});
