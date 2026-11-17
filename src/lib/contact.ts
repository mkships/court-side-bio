import type { Profile, ServiceType, UpcomingSlot } from "@/types/profile";

const interests: Record<ServiceType, string> = { coaching: "private coaching", hitting: "a hitting session", clinic: "a group clinic" };

export function inquiryMessage(profile: Profile, service?: ServiceType | "", slot?: UpcomingSlot, note?: string) {
  const first = profile.name.trim().split(/\s+/)[0] || "there";
  const interest = service ? interests[service] : "training";
  return [`Hi ${first}, I found your profile and am interested in ${interest}${slot ? ` on ${slot.label}` : ""}.`, "Are you available?", note?.trim()].filter(Boolean).join("\n");
}

export function contactLinks(profile: Profile, message: string) {
  const normalized = profile.whatsapp.replace(/\D/g, "");
  return {
    whatsapp: normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}` : "",
    email: profile.email ? `mailto:${profile.email}?subject=${encodeURIComponent(`Training inquiry — ${profile.name}`)}&body=${encodeURIComponent(message)}` : ""
  };
}
