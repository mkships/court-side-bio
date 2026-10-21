"use client";

import { useEffect, useRef, useState } from "react";
import { contactLinks, inquiryMessage } from "@/lib/contact";
import type { Profile, UpcomingSlot } from "@/types/profile";

type Props = { profile: Profile; slots: UpcomingSlot[]; open: boolean; onClose: () => void; initialService?: "coaching" | "hitting" | ""; initialSlot?: string };

export function ContactSheet({ profile, slots, open, onClose, initialService = "", initialSlot = "" }: Props) {
  const [service, setService] = useState(initialService);
  const [slotIso, setSlotIso] = useState(initialSlot);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => { if (open) { setService(initialService); setSlotIso(initialSlot); setTimeout(() => closeRef.current?.focus(), 0); } }, [open, initialService, initialSlot]);
  useEffect(() => { if (!open) return; const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [open, onClose]);
  if (!open) return null;
  const selectedSlot = slots.find((slot) => slot.iso === slotIso);
  const message = inquiryMessage(profile, service, selectedSlot, note);
  const links = contactLinks(profile, message);
  const enabledServices = profile.services.filter((item) => item.enabled);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title" onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])') || []);
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
      <div className="sheet-grabber" aria-hidden="true" />
      <div className="dialog-head"><h2 id="contact-title">Contact {profile.name.split(" ")[0]}</h2><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close contact form">×</button></div>
      {enabledServices.length > 0 && <fieldset className="field"><legend>What are you looking for?</legend><div className="radio-list">
        <label className="radio-option"><input type="radio" name="service" checked={!service} onChange={() => setService("")} /> General training inquiry</label>
        {enabledServices.map((item) => <label className="radio-option" key={item.type}><input type="radio" name="service" checked={service === item.type} onChange={() => setService(item.type)} />{item.type === "coaching" ? "Private coaching" : "Hitting session"}</label>)}
      </div></fieldset>}
      {slots.length > 0 && <div className="field"><label htmlFor="preferred-slot">Preferred time <span className="muted">(optional)</span></label><select id="preferred-slot" value={slotIso} onChange={(event) => setSlotIso(event.target.value)}><option value="">No preferred time</option>{slots.map((slot) => <option key={slot.iso} value={slot.iso}>{slot.label}</option>)}</select></div>}
      <div className="field"><label htmlFor="visitor-note">Additional message <span className="muted">(optional)</span></label><textarea id="visitor-note" rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Anything useful for the coach to know" /></div>
      <div className="dialog-actions">
        {links.whatsapp && <a className="button primary" href={links.whatsapp} target="_blank" rel="noopener noreferrer">Continue with WhatsApp ↗</a>}
        {links.email && <a className="button" href={links.email}>Continue with Email ↗</a>}
        <button className="button ghost" onClick={async () => { await navigator.clipboard.writeText(message); setCopied(true); }}>{copied ? "Message copied" : "Copy message"}</button>
      </div>
      <p className="fineprint">This sends a preferred-time inquiry in your chosen app. Nothing is booked until {profile.name.split(" ")[0]} confirms it.</p>
    </section>
  </div>;
}
