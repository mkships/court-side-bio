"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { upcomingSlots } from "@/lib/availability";
import { serviceName, sportLabel, type BlockKey, type Profile, type ServiceType, type UpcomingSlot } from "@/types/profile";
import { BallMark, LinkIcon, SportIcon } from "@/components/CourtArt";
import { ContactSheet } from "./ContactSheet";
import { ShareButton } from "./ShareButton";

const currency = (code: string, value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
const linkNames: Record<keyof Profile["links"], string> = { instagram: "Instagram", youtube: "YouTube", website: "Website" };
const linkEntries = (links: Profile["links"]) => Object.entries(links).filter((entry): entry is [keyof Profile["links"], string] => Boolean(entry[1]));

// Groups upcoming slots into one row per calendar day in the creator's timezone.
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

/**
 * A coach's public page, laid out like a creator link-in-bio page: full-bleed theme colour,
 * centred identity, stat chips, full-width lesson buttons and a sticky message button.
 */
export function ProfileRenderer({ profile, preview = false }: { profile: Profile; preview?: boolean }) {
  const slots = useMemo(() => upcomingSlots(profile.availability, profile.timezone), [profile.availability, profile.timezone]);
  const [contactOpen, setContactOpen] = useState(false);
  const [initialService, setInitialService] = useState<ServiceType | "">("");
  const [initialSlot, setInitialSlot] = useState("");
  const openContact = (service: ServiceType | "" = "", slot = "") => { setInitialService(service); setInitialSlot(slot); setContactOpen(true); };
  const firstName = profile.name.trim().split(/\s+/)[0] || "this coach";
  const initials = profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("") || "?";
  const roleLabels = profile.roles.map((role) => role === "coach" ? "Coach" : "Hitting partner");
  const shown = (block: BlockKey) => !profile.hiddenBlocks.includes(block);
  const enabledServices = profile.services.filter((service) => service.enabled);
  const priced = enabledServices.filter((service) => service.price !== null);
  const prices = priced.map((service) => service.price as number);
  const hourly = priced.every((service) => service.duration === 60 && service.type !== "clinic");
  const hasCredentials = Boolean(profile.ratingValue || profile.playingBackground || profile.coachingExperience);
  const links = shown("links") ? linkEntries(profile.links) : [];
  const quotes = profile.testimonials.filter((item) => item.quote.trim());
  const available = profile.availabilityVisible && slots.length > 0;
  const days = orderOfPlay(slots, profile.timezone);

  const stats = [
    shown("credentials") && profile.ratingValue && { label: profile.ratingSystem === "Other" ? "Rating" : profile.ratingSystem, value: profile.ratingValue },
    shown("services") && prices.length > 0 && { label: hourly ? "From / hr" : "From", value: currency(profile.currency, Math.min(...prices)) },
    shown("availability") && available && { label: "Next open", value: `${days[0].day} ${days[0].slots[0].time.replace(":00", "")}` },
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat));

  const renderBlock = (block: BlockKey) => {
    if (!shown(block)) return null;
    if (block === "services" && enabledServices.length > 0) return <section className="stack" key={block} aria-labelledby="lessons-title">
      <h2 className="block-title" id="lessons-title">Lessons</h2>
      {enabledServices.map((item) => <button className="link-button lesson" onClick={() => openContact(item.type)} key={item.type}>
        <span className="lesson-copy"><span>{serviceName(item.type)}</span>{item.note && <small>{item.note}</small>}</span>
        <span className="lesson-price">{item.price !== null ? <strong>{currency(profile.currency, item.price)}</strong> : <strong>Ask</strong>}<small>{item.type === "clinic" && item.price !== null ? "per player · " : ""}{item.duration} min</small></span>
      </button>)}
    </section>;
    if (block === "availability" && available) return <section className="stack" key={block} aria-labelledby="times-title">
      <h2 className="block-title" id="times-title">Court times</h2>
      <div className="card">
        <div className="card-head"><p className="card-label">Tap a time to ask for it</p><span className="tz">{profile.timezone.replace(/_/g, " ")}</span></div>
        <ol className="order-of-play">{days.map((row, rowIndex) => <li key={row.key}>
          <span className="oop-day"><strong>{row.day}</strong><span className="meta">{row.date}</span></span>
          <span className="oop-slots">{row.slots.map((slot, slotIndex) => <button className={`slot${rowIndex === 0 && slotIndex === 0 ? " is-next" : ""}`} key={slot.iso} onClick={() => openContact("", slot.iso)} aria-label={`Ask about ${slot.label}`}>{slot.time}</button>)}</span>
        </li>)}</ol>
      </div>
    </section>;
    if (block === "credentials" && hasCredentials) return <section className="stack" key={block} aria-labelledby="background-title">
      <h2 className="block-title" id="background-title">Background</h2>
      <div className="card">
        {profile.ratingValue && <div className="rating-row">
          <span className="rating-badge"><span>{profile.ratingSystem}</span>{profile.ratingValue}</span>
          <span className="muted">Self-reported{profile.ratingUrl && <> · <a href={profile.ratingUrl} target="_blank" rel="noopener noreferrer">View source</a></>}</span>
        </div>}
        {profile.playingBackground && <div className="credential"><div className="meta">Playing</div><p>{profile.playingBackground}</p></div>}
        {profile.coachingExperience && <div className="credential"><div className="meta">Coaching</div><p>{profile.coachingExperience}</p></div>}
      </div>
    </section>;
    if (block === "testimonials" && quotes.length > 0) return <section className="stack" key={block} aria-labelledby="reviews-title">
      <h2 className="block-title" id="reviews-title">What players say</h2>
      <div className="quote-list">{quotes.map((item, index) => <figure className="quote" key={index}>
        <blockquote>{item.quote}</blockquote>
        <figcaption>{item.name && <strong>{item.name}</strong>}{item.context && <span className="meta">{item.context}</span>}</figcaption>
      </figure>)}</div>
    </section>;
    return null;
  };

  return <div className={`shell profile-shell theme-${profile.theme}`}>
    <main className="profile-stage">
      {preview && <div className="preview-flag">Draft preview</div>}
      <div className="profile-topbar">
        <span className="sport-badges">{profile.sports.map((sport) => <span className="sport-badge" key={sport}><SportIcon sport={sport} size={14} />{sportLabel(sport)}</span>)}</span>
        {!preview && <ShareButton title={`${profile.name} on courtsidebio`} />}
      </div>
      <header className="profile-head">
        <div className="avatar">{profile.photoUrl ? <Image src={profile.photoUrl} alt={`${profile.name} portrait`} width={240} height={240} unoptimized /> : <span>{initials}</span>}</div>
        <h1>{profile.name || "Your name"}</h1>
        {profile.headline && <p className="profile-headline">{profile.headline}</p>}
        <p className="profile-meta">{[roleLabels.join(" & "), profile.location].filter(Boolean).join(" · ")}</p>
        {links.length > 0 && <div className="social-row">{links.map(([key, url]) => <a href={url} target="_blank" rel="noopener noreferrer" key={key} aria-label={linkNames[key]}><LinkIcon kind={key} /></a>)}</div>}
      </header>
      {stats.length > 0 && <dl className="stat-row">{stats.map((stat) => <div className="stat" key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>}
      {profile.bio && <section className="card"><p className="card-label">About</p><p className="bio">{profile.bio}</p></section>}
      {profile.blockOrder.map(renderBlock)}
      {preview ? <span className="made-with"><BallMark size={16} />courtsidebio</span> : <Link href="/" className="made-with"><BallMark size={16} />Make your own on courtsidebio</Link>}
      <div className="sticky-cta"><button className="link-button" onClick={() => openContact()}>Message {firstName}</button></div>
    </main>
    <ContactSheet profile={profile} slots={slots} open={contactOpen} onClose={() => setContactOpen(false)} initialService={initialService} initialSlot={initialSlot} />
  </div>;
}
