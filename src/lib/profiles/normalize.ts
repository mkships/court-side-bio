import { emptyProfile } from "@/lib/fixtures";
import { BLOCKS, SERVICE_TYPES, type BlockKey, type Profile, type Service, type Testimonial } from "@/types/profile";

type StoredProfile = Partial<Omit<Profile, "services" | "links" | "testimonials" | "blockOrder" | "hiddenBlocks">> & {
  services?: Partial<Service>[];
  links?: Partial<Profile["links"]>;
  testimonials?: Partial<Testimonial>[];
  blockOrder?: string[];
  hiddenBlocks?: string[];
};

const isBlock = (key: string): key is BlockKey => (BLOCKS as readonly string[]).includes(key);

/** Keeps the creator's order and slots any newer block in just before its successor in BLOCKS. */
function normalizeBlockOrder(stored?: string[]): BlockKey[] {
  const order = [...new Set((stored ?? []).filter(isBlock))];
  if (!order.length) return [...BLOCKS];
  BLOCKS.forEach((key, index) => {
    if (order.includes(key)) return;
    const successor = BLOCKS.slice(index + 1).map((next) => order.indexOf(next)).find((position) => position >= 0);
    if (successor === undefined) order.push(key); else order.splice(successor, 0, key);
  });
  return order;
}

/**
 * Brings a stored draft or published payload up to the current shape: every service type present
 * in a fixed order, a session length on each, all link keys, a testimonials list and every block in
 * the lineup. Older payloads stay readable.
 */
export function normalizeProfile(raw: StoredProfile): Profile {
  const services = SERVICE_TYPES.map((type): Service => {
    const fallback = emptyProfile.services.find((service) => service.type === type)!;
    const stored = raw.services?.find((service) => service?.type === type);
    if (!stored) return { ...fallback };
    return { ...fallback, ...stored, type, duration: typeof stored.duration === "number" ? stored.duration : 60 };
  });
  const testimonials = (Array.isArray(raw.testimonials) ? raw.testimonials : []).map((item) => ({ quote: item?.quote ?? "", name: item?.name ?? "", context: item?.context ?? "" }));
  return {
    ...emptyProfile, ...raw, services, testimonials,
    links: { ...emptyProfile.links, ...raw.links },
    blockOrder: normalizeBlockOrder(raw.blockOrder),
    hiddenBlocks: [...new Set((raw.hiddenBlocks ?? []).filter(isBlock))]
  } as Profile;
}
