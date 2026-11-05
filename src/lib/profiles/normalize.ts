import { emptyProfile } from "@/lib/fixtures";
import { SERVICE_TYPES, type Profile, type Service } from "@/types/profile";

type StoredProfile = Partial<Omit<Profile, "services" | "links">> & { services?: Partial<Service>[]; links?: Partial<Profile["links"]> };

/**
 * Brings a stored draft or published payload up to the current shape: every service type present
 * in a fixed order, a session length on each, and all link keys. Older payloads stay readable.
 */
export function normalizeProfile(raw: StoredProfile): Profile {
  const services = SERVICE_TYPES.map((type): Service => {
    const fallback = emptyProfile.services.find((service) => service.type === type)!;
    const stored = raw.services?.find((service) => service?.type === type);
    if (!stored) return { ...fallback };
    return { ...fallback, ...stored, type, duration: typeof stored.duration === "number" ? stored.duration : 60 };
  });
  return { ...emptyProfile, ...raw, services, links: { ...emptyProfile.links, ...raw.links } } as Profile;
}
