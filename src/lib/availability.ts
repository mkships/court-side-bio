import type { AvailabilitySlot, UpcomingSlot } from "@/types/profile";

function timezoneOffset(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day), Number(value.hour), Number(value.minute), Number(value.second));
  return asUtc - date.getTime();
}

function localParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]));
  return { year: value.year, month: value.month - 1, day: value.day, hour: value.hour, minute: value.minute };
}

function zonedDate(year: number, month: number, day: number, hour: number, minute: number, timezone: string) {
  const wallClock = Date.UTC(year, month, day, hour, minute);
  const probes = [wallClock - 12 * 3600000, wallClock, wallClock + 12 * 3600000].map((value) => new Date(value));
  const offsets = [...new Set(probes.map((probe) => timezoneOffset(probe, timezone)))];
  const matches = offsets
    .map((offset) => new Date(wallClock - offset))
    .filter((candidate) => {
      const parts = localParts(candidate, timezone);
      return parts.year === year && parts.month === month && parts.day === day && parts.hour === hour && parts.minute === minute;
    })
    .sort((a, b) => a.getTime() - b.getTime());
  return matches[0] || null;
}

export function upcomingSlots(slots: AvailabilitySlot[], timezone: string, now = new Date()): UpcomingSlot[] {
  const localParts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
  const map = Object.fromEntries(localParts.map((part) => [part.type, part.value]));
  const localBase = new Date(Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day)));
  const found: UpcomingSlot[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(localBase.getTime() + offset * 86400000);
    for (const slot of slots.filter((item) => item.weekday === day.getUTCDay())) {
      const [hour, minute] = slot.start.split(":").map(Number);
      const instant = zonedDate(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute, timezone);
      if (!instant) continue;
      if (instant <= now) continue;
      const label = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }).format(instant);
      const shortLabel = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(instant);
      found.push({ ...slot, iso: instant.toISOString(), label: `${label} (${timezone})`, shortLabel });
    }
  }
  return found.sort((a, b) => a.iso.localeCompare(b.iso));
}
