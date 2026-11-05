import { describe, expect, it } from "vitest";
import { allTimezones, groupedTimezones, timezoneLabel } from "./locale";

describe("locale helpers", () => {
  it("offers the full IANA list including UTC", () => {
    const zones = allTimezones();
    expect(zones.length).toBeGreaterThan(100);
    expect(zones).toContain("Europe/Paris");
    expect(zones).toContain("UTC");
  });

  it("keeps an unknown saved timezone selectable", () => {
    expect(allTimezones("Etc/GMT+5")[0]).toBe("Etc/GMT+5");
  });

  it("groups zones by region and formats labels", () => {
    const groups = Object.fromEntries(groupedTimezones());
    expect(groups.Europe).toContain("Europe/London");
    expect(timezoneLabel("America/Los_Angeles")).toBe("America/Los Angeles");
  });
});
