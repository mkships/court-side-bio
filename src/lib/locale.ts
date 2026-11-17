const fallbackZones = ["America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "Europe/London", "Europe/Madrid", "Asia/Kolkata", "Asia/Singapore", "Australia/Sydney"];

export const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "NZD", "INR", "SGD", "AED", "CHF", "MXN"];

/** Every IANA timezone the browser knows, always including the current value. */
export function allTimezones(current?: string): string[] {
  let zones: string[] = [];
  try { zones = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ?? []; } catch { zones = []; }
  if (!zones.length) zones = fallbackZones;
  if (!zones.includes("UTC")) zones = [...zones, "UTC"];
  if (current && !zones.includes(current)) zones = [current, ...zones];
  return zones;
}

/** Timezones grouped by region ("America", "Europe", …) for <optgroup> rendering. */
export function groupedTimezones(current?: string): [string, string[]][] {
  const groups = new Map<string, string[]>();
  for (const zone of allTimezones(current)) {
    const region = zone.includes("/") ? zone.split("/")[0] : "Other";
    groups.set(region, [...(groups.get(region) ?? []), zone]);
  }
  return [...groups.entries()];
}

export const timezoneLabel = (zone: string) => zone.replace(/_/g, " ");

export function detectTimezone(fallback = "UTC") {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback; } catch { return fallback; }
}
