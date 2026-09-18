"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { upcomingSlots } from "@/lib/availability";
import type { BlockKey, Profile } from "@/types/profile";
import { ContactSheet } from "./ContactSheet";

const currency = (code: string, value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
const serviceName = (type: "coaching" | "hitting") => type === "coaching" ? "Private coaching" : "Hitting session";
const linkEntries = (links: Profile["links"]) => Object.entries(links).filter((entry): entry is [keyof Profile["links"], string] => Boolean(entry[1]));

export function ProfileRenderer({ profile, preview = false }: { profile: Profile; preview?: boolean }) {
  const slots = useMemo(() => upcomingSlots(profile.availability, profile.timezone), [profile.availability, profile.timezone]);
  const [contactOpen, setContactOpen] = useState(false);
  const [initialService, setInitialService] = useState<"coaching" | "hitting" | "">("");
  const [initialSlot, setInitialSlot] = useState("");
  const openContact = (service: "coaching" | "hitting" | "" = "", slot = "") => { setInitialService(service); setInitialSlot(slot); setContactOpen(true); };
  const firstName = profile.name.trim().split(/\s+/)[0] || "this coach";
  const initials = profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("") || "?";
  const roleLabels = profile.roles.map((role) => role === "coach" ? "Coach" : "Hitting partner");
  const sports = profile.sports.map((sport) => sport === "tennis" ? "Tennis" : "Pickleball");
  const hasCredentials = Boolean(profile.ratingValue || profile.playingBackground || profile.coachingExperience);
  const hasServices = profile.services.some((service) => service.enabled);
  const hasLinks = linkEntries(profile.links).length > 0;
  const available = profile.availabilityVisible && slots.length > 0;

  const renderBlock = (block: BlockKey) => {
    if (profile.hiddenBlocks.includes(block)) return null;
    if (block === "credentials" && hasCredentials) return <div className="card wide" key={block}>
      <div className="card-label meta">Credentials</div>
      <div className="profile-grid">
        {profile.ratingValue && <div className="card rating"><div className="card-label meta">{profile.ratingSystem} rating</div><div className="rating-value">{profile.ratingValue}</div><div className="meta">Self-reported</div>{profile.ratingUrl && <a href={profile.ratingUrl} target="_blank" rel="noopener noreferrer" className="fineprint">View source ↗</a>}</div>}
        {(profile.playingBackground || profile.coachingExperience) && <div className="card"><div className="card-label meta">Background</div>{profile.playingBackground && <p>{profile.playingBackground}</p>}{profile.coachingExperience && <p className="muted">{profile.coachingExperience}</p>}</div>}
      </div>
    </div>;
    if (block === "services" && hasServices) return <div className="card wide" key={block}><div className="card-label meta">Train with me</div><div className="stack">{profile.services.filter((item) => item.enabled).map((item) => <button className="select-card" onClick={() => openContact(item.type)} key={item.type}><span><strong>{serviceName(item.type)}</strong>{item.note && <span className="muted" style={{display:"block",marginTop:4}}>{item.note}</span>}</span>{item.price !== null && <strong>{currency(profile.currency, item.price)}/hr</strong>}<span aria-hidden="true">↗</span></button>)}</div></div>;
    if (block === "availability" && available) return <div className="card wide" key={block}><div className="card-label meta">Available to train · {profile.timezone}</div><h2>Pick a preferred time</h2><div className="slot-row">{slots.map((slot) => <button className="slot" key={slot.iso} onClick={() => openContact("", slot.iso)}>{slot.shortLabel}</button>)}</div><p className="fineprint">Recurring 60-minute windows. This starts an inquiry, not a booking.</p></div>;
    if (block === "links" && hasLinks) return <div className="card wide" key={block}><div className="card-label meta">Elsewhere on the internet</div><div className="link-grid">{linkEntries(profile.links).map(([key, url]) => <a className="link-tile" href={url} target="_blank" rel="noopener noreferrer" key={key}>{key[0].toUpperCase() + key.slice(1)} ↗</a>)}</div></div>;
    return null;
  };

  return <div className={`shell theme-${profile.theme}`}>
    <main className="profile-stage">
      {preview && <div className="meta" style={{marginBottom:12,color:"var(--sub)"}}>Draft preview</div>}
      <div className="profile-grid">
        <section className="profile-hero">
          <div className="profile-topline"><span className="meta">{sports.join(" + ")}</span><button className="button small" onClick={() => openContact()} aria-label={`Contact ${firstName}`}>Contact ↗</button></div>
          <div className="avatar">{profile.photoUrl ? <Image src={profile.photoUrl} alt={`${profile.name} portrait`} width={216} height={264} unoptimized /> : initials}</div>
          <h1>{profile.name || "Your name"}</h1>
          {profile.headline && <p>{profile.headline}</p>}
          <div className="chip-row profile-tags">{[...roleLabels, ...sports].map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>
        </section>
        {profile.location && <section className="card"><div className="card-label meta">Based in</div><h2>{profile.location}</h2></section>}
        {profile.bio && <section className="card"><div className="card-label meta">About</div><p className="muted">{profile.bio}</p></section>}
        {profile.blockOrder.map(renderBlock)}
        <section className="cta"><div className="meta">Start a conversation</div><h2>Get in touch with {firstName}</h2><p>No visitor account. No booking fee. Just a prefilled message.</p><button className="button" onClick={() => openContact()}>Contact {firstName} ↗</button></section>
        <footer className="made-with meta">Made with courtsidebio</footer>
      </div>
    </main>
    <ContactSheet profile={profile} slots={slots} open={contactOpen} onClose={() => setContactOpen(false)} initialService={initialService} initialSlot={initialSlot} />
  </div>;
}
