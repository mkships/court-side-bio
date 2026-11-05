import { serviceName, sportLabel, type Profile } from "@/types/profile";

/** schema.org Person data for search engines. Rendered on the server only. */
export function ProfileJsonLd({ profile }: { profile: Profile }) {
  const sports = profile.sports.map(sportLabel);
  const roles = profile.roles.map((role) => role === "coach" ? "coach" : "hitting partner");
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    description: profile.bio || profile.headline || undefined,
    jobTitle: `${sports.join(", ")} ${roles.join(" and ")}`,
    knowsAbout: sports,
    image: profile.photoUrl.startsWith("https://") ? profile.photoUrl : undefined,
    address: profile.location ? { "@type": "PostalAddress", addressLocality: profile.location } : undefined,
    sameAs: Object.values(profile.links).filter(Boolean),
    makesOffer: profile.services.filter((service) => service.enabled).map((service) => ({
      "@type": "Offer",
      name: serviceName(service.type),
      ...(service.price !== null ? { price: service.price, priceCurrency: profile.currency } : {})
    }))
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
