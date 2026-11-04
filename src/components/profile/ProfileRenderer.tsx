"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { upcomingSlots } from "@/lib/availability";
import { sportLabel, type BlockKey, type Profile, type UpcomingSlot } from "@/types/profile";
import { BallMark, CourtLines, LinkIcon, SportIcon } from "@/components/CourtArt";
import { ContactSheet } from "./ContactSheet";

const currency = (code: string, value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
const serviceName = (type: "coaching" | "hitting") => type === "coaching" ? "Private coaching" : "Hitting session";
const linkNames: Record<keyof Profile["links"], string> = { instagram: "Instagram", youtube: "YouTube", website: "Website" };
const linkEntries = (links: Profile["links"]) => Object.entries(links).filter((entry): entry is [keyof Profile["links"], string] => Boolean(entry[1]));

// Groups upcoming slots into an "order of play": one row per calendar day in the creator's timezone.
const orderOfPlay = (slots: UpcomingSlot[], timezone: string) => {
  const day = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" });
  const date = new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "short", day: "numeric" });
  const time = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" });
  const rows: { key: string; day: string; date: string; slots: (UpcomingSlot & { time: string })[] }[] = [];
  for (const slot of slots) {
    const instant = new Date(slot.iso);
    const key = date.format(instant);
    let row = rows.find((item) => item.key === key);
    if (!row) { row = { key, day: day.format(instant), date: key, slots: [] }; rows.push(row); }
    row.slots.push({ ...slot, time: time.format(instant) });
  }
  return rows;
};

export function ProfileRenderer({ profile, preview = false }: { profile: Profile; preview?: boolean }) {
  const slots = useMemo(() => upcomingSlots(profile.availability, profile.timezone), [profile.availability, profile.timezone]);
  const [contactOpen, setContactOpen] = useState(false);
  const [initialService, setInitialService] = useState<"coaching" | "hitting" | "">("");
  const [initialSlot, setInitialSlot] = useState("");
  const openContact = (service: "coaching" | "hitting" | "" = "", slot = "") => { setInitialService(service); setInitialSlot(slot); setContactOpen(true); };
  const firstName = profile.name.trim().split(/\s+/)[0] || "this coach";
  const initials = profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("") || "?";
  const roleLabels = profile.roles.map((role) => role === "coach" ? "Coach" : "Hitting partner");
  const shown = (block: BlockKey) => !profile.hiddenBlocks.includes(block);
  const enabledServices = profile.services.filter((service) => service.enabled);
  const prices = enabledServices.map((service) => service.price).filter((price): price is number => price !== null);
  const hasCredentials = Boolean(profile.ratingValue || profile.playingBackground || profile.coachingExperience);
  const hasLinks = linkEntries(profile.links).length > 0;
  const available = profile.availabilityVisible && slots.length > 0;
  const days = orderOfPlay(slots, profile.timezone);

  const stats = [
    shown("credentials") && profile.ratingValue && { label: profile.ratingSystem === "Other" ? "Rating" : profile.ratingSystem, value: profile.ratingValue },
    shown("services") && prices.length > 0 && { label: "From / hr", value: currency(profile.currency, Math.min(...prices)) },
    shown("availability") && available && { label: "Next open", value: `${days[0].day} ${days[0].slots[0].time.replace(":00", "")}` },
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat));

  const renderBlock = (block: BlockKey) => {
    if (!shown(block)) return null;
    if (block === "credentials" && hasCredentials) return <section className="card" key={block}>
      <div className="card-label meta">Credentials</div>
      {profile.ratingValue && <div className="rating-row">
        <span className="rating-badge"><span className="meta">{profile.ratingSystem}</span><strong>{profile.ratingValue}</strong></span>
        <span className="muted">Self-reported rating{profile.ratingUrl && <> · <a href={profile.ratingUrl} target="_blank" rel="noopener noreferrer">View source ↗</a></>}</span>
      </div>}
      {profile.playingBackground && <div className="credential"><div className="meta">Playing</div><p>{profile.playingBackground}</p></div>}
      {profile.coachingExperience && <div className="credential"><div className="meta">Coaching</div><p>{profile.coachingExperience}</p></div>}
    </section>;
    if (block === "services" && enabledServices.length > 0) return <section className="card" key={block}>
      <div className="card-label meta">Train with me</div>
      <div className="stack">{enabledServices.map((item) => <button className="service-ticket" onClick={() => openContact(item.type)} key={item.type}>
        <span className="service-copy"><strong>{serviceName(item.type)}</strong>{item.note && <span className="muted">{item.note}</span>}</span>
        <span className="service-price">{item.price !== null ? <><strong>{currency(profile.currency, item.price)}</strong><span className="meta">/ hour</span></> : <span className="meta">Ask</span>}</span>
      </button>)}</div>
    </section>;
    if (block === "availability" && available) return <section className="card" key={block}>
      <div className="card-head"><div className="card-label meta">Order of play</div><span className="meta tz">{profile.timezone.replace(/_/g, " ")}</span></div>
      <ol className="order-of-play">{days.map((row) => <li key={row.key}>
        <span className="oop-day"><strong>{row.day}</strong><span className="meta">{row.date}</span></span>
        <span className="oop-slots">{row.slots.map((slot) => <button className="slot" key={slot.iso} onClick={() => openContact("", slot.iso)} aria-label={`Ask about ${slot.label}`}>{slot.time}</button>)}</span>
      </li>)}</ol>
      <p className="fineprint">Recurring 60-minute windows. Tapping a time starts an inquiry, not a booking.</p>
    </section>;
    if (block === "links" && hasLinks) return <section className="card" key={block}>
      <div className="card-label meta">Follow along</div>
      <div className="link-list">{linkEntries(profile.links).map(([key, url]) => <a className="link-tile" href={url} target="_blank" rel="noopener noreferrer" key={key}><LinkIcon kind={key} /><span>{linkNames[key]}</span><span aria-hidden="true">↗</span></a>)}</div>
    </section>;
    return null;
  };

  return <div className={`shell profile-shell theme-${profile.theme}`}>
    <main className="profile-stage">
      {preview && <div className="preview-flag meta">Draft preview</div>}
      <section className="profile-hero">
        <CourtLines sport={profile.sports[0]} className="profile-court" />
        <div className="profile-topline">
          <span className="sport-badges">{profile.sports.map((sport) => <span className="sport-badge" key={sport}><SportIcon sport={sport} size={14} />{sportLabel(sport)}</span>)}</span>
          <button className="button small" onClick={() => openContact()} aria-label={`Contact ${firstName}`}>Contact ↗</button>
        </div>
        <div className="avatar">{profile.photoUrl ? <Image src={profile.photoUrl} alt={`${profile.name} portrait`} width={240} height={240} unoptimized /> : <span>{initials}</span>}</div>
        <h1>{profile.name || "Your name"}</h1>
        {profile.headline && <p className="profile-headline">{profile.headline}</p>}
        <div className="profile-meta">
          {roleLabels.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
          {profile.location && <span className="profile-location meta">◉ {profile.location}</span>}
        </div>
      </section>
      {stats.length > 0 && <dl className="scoreboard" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
        {stats.map((stat) => <div key={stat.label}><dt className="meta">{stat.label}</dt><dd>{stat.value}</dd></div>)}
      </dl>}
      {profile.bio && <section className="card"><div className="card-label meta">About</div><p className="bio">{profile.bio}</p></section>}
      {profile.blockOrder.map(renderBlock)}
      <section className="match-point">
        <span className="match-ball"><BallMark size={128} /></span>
        <div className="meta">Match point</div>
        <h2>Ready to get on court with {firstName}?</h2>
        <p>No visitor account, no booking fee. Just a prefilled message.</p>
        <button className="button primary" onClick={() => openContact()}>Contact {firstName} ↗</button>
      </section>
      <footer className="made-with meta">{preview ? <span className="made-with-link"><BallMark size={16} /> Made with courtsidebio</span> : <Link href="/" className="made-with-link"><BallMark size={16} /> Made with courtsidebio</Link>}</footer>
    </main>
    <ContactSheet profile={profile} slots={slots} open={contactOpen} onClose={() => setContactOpen(false)} initialService={initialService} initialSlot={initialSlot} />
  </div>;
}
