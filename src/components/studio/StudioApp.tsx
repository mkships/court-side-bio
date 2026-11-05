"use client";

import { useEffect, useMemo, useState } from "react";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";
import { emptyProfile } from "@/lib/fixtures";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { emailSchema, usernameSchema, validateForPublish, whatsappSchema } from "@/lib/validation/profile";
import { PhotoUpload } from "./PhotoUpload";
import Image from "next/image";
import { CourtLines, SportIcon } from "@/components/CourtArt";
import { MAX_TESTIMONIALS, SESSION_LENGTHS, SPORTS, serviceName, sportLabel, type BlockKey, type Profile, type Role, type Service, type Sport, type Testimonial, type ThemeKey } from "@/types/profile";
import { normalizeProfile } from "@/lib/profiles/normalize";
import { CLAIM_KEY, WORKSPACE_KEY, cleanUsername } from "@/lib/storageKeys";
import { currencies, detectTimezone, groupedTimezones, timezoneLabel } from "@/lib/locale";
import { publishBlockers, strengthItems, type HealthFocus } from "@/lib/profileHealth";

type Focus = HealthFocus | null;
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekdays = [1, 2, 3, 4, 5];
const times = Array.from({ length: 18 }, (_, index) => `${String(index + 5).padStart(2, "0")}:00`);
const themes: { key: ThemeKey; name: string }[] = [
  { key: "centre", name: "Grass Court" },
  { key: "clay", name: "Clay Court" },
  { key: "hard", name: "Hard Court" },
  { key: "night", name: "Night Session" }
];
const labels: Record<BlockKey, string> = { credentials: "Credentials", services: "Services", testimonials: "Testimonials", availability: "Availability", links: "Links" };
const clone = (profile: Profile): Profile => JSON.parse(JSON.stringify(profile));
const comparableProfile = (profile: Profile | null, configured: boolean) => profile ? { ...profile, photoUrl: configured ? "" : profile.photoUrl } : null;
const canonicalize = (value: unknown): unknown => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)])) : value;

export function StudioApp() {
  const [draft, setDraft] = useState<Profile>(clone(emptyProfile));
  const [published, setPublished] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [focus, setFocus] = useState<Focus>(null);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [copyState, setCopyState] = useState("");
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showBlockers, setShowBlockers] = useState(false);
  const configured = hasSupabaseConfig();

  useEffect(() => {
    // A brand-new draft takes the browser's timezone and any username typed on the landing page.
    const begin = (loaded: Profile | null, loadedPublished: Profile | null) => {
      const next = loaded ?? { ...clone(emptyProfile), timezone: detectTimezone(emptyProfile.timezone) };
      if (!next.username) {
        try { const claimed = cleanUsername(localStorage.getItem(CLAIM_KEY) || ""); if (claimed) next.username = claimed; localStorage.removeItem(CLAIM_KEY); } catch {}
      }
      setDraft(next); setPublished(loadedPublished); setOnboardingStep(next.name ? 0 : 1); setReady(true);
    };
    (async () => {
      if (configured) {
        const client = createClient()!;
        const { data: auth } = await client.auth.getUser();
        if (auth.user) {
          const [{ data: remoteDraft }, { data: remotePublished }] = await Promise.all([
            client.from("profile_drafts").select("payload").maybeSingle(),
            client.from("published_profiles").select("payload").maybeSingle()
          ]);
          let loaded: Profile | null = null;
          if (remoteDraft?.payload) {
            loaded = normalizeProfile(remoteDraft.payload);
            if (loaded.photoKey) {
              const { data: signed } = await client.storage.from("profile-photos").createSignedUrl(loaded.photoKey, 3600);
              loaded.photoUrl = signed?.signedUrl || "";
            }
          }
          begin(loaded, remotePublished?.payload ? normalizeProfile(remotePublished.payload) : null); return;
        }
      }
      let saved: { draft?: Parameters<typeof normalizeProfile>[0]; published?: Parameters<typeof normalizeProfile>[0] | null } | null = null;
      try { saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY) || "null"); } catch {}
      begin(saved?.draft ? normalizeProfile(saved.draft) : null, saved?.published ? normalizeProfile(saved.published) : null);
    })();
  }, [configured]);
  useEffect(() => { if (!ready) return; try { localStorage.setItem(WORKSPACE_KEY, JSON.stringify({ draft, published })); } catch {} }, [draft, published, ready]);
  useEffect(() => {
    if (!ready || !configured || onboardingStep > 0) return;
    const timer = window.setTimeout(async () => {
      const client = createClient()!; const { data } = await client.auth.getUser();
      if (data.user) {
        const { error } = await client.rpc("save_my_draft", { draft_payload: { ...draft, photoUrl: "" } });
        setNotice(error ? error.message : "Draft saved to Supabase");
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [draft, ready, configured, onboardingStep]);

  useEffect(() => { if (ready) window.scrollTo({ top: 0 }); }, [focus, ready]);

  const patch = (value: Partial<Profile>) => { setDraft((current) => ({ ...current, ...value })); setNotice(configured ? "Saving draft…" : "Draft saved locally"); };
  const dirty = useMemo(() => JSON.stringify(canonicalize(comparableProfile(draft, configured))) !== JSON.stringify(canonicalize(comparableProfile(published, configured))), [draft, published, configured]);
  const candidate = configured ? { ...draft, photoUrl: "" } : draft;
  const blockers = showBlockers ? publishBlockers(candidate) : [];
  const publish = async () => {
    const result = validateForPublish(candidate);
    if (!result.success) { setShowBlockers(true); setNotice(""); return; }
    setShowBlockers(false);
    if (configured) {
      const client = createClient();
      const { data: auth } = await client!.auth.getUser();
      if (!auth.user) { setNotice("Sign in first to publish to your permanent public URL"); return; }
      const { error } = await client!.rpc("publish_my_profile", { draft_payload: result.data });
      if (error) { setNotice(error.message); return; }
    }
    setPublished(clone(result.data)); setNotice(configured ? "Page published" : "Published in this browser (local demo mode)");
  };
  const unpublish = async () => {
    if (configured) { const result = await createClient()!.rpc("unpublish_my_profile"); if (result.error) { setNotice(result.error.message); return; } }
    setPublished(null); setConfirmUnpublish(false); setNotice("Page unpublished");
  };
  const copyProfileUrl = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/${draft.username}`); setCopyState("Link copied"); }
    catch { setCopyState("Copy failed — select the URL from the live page"); }
  };
  const moveBlock = (key: BlockKey, amount: number) => { const order = [...draft.blockOrder]; const from = order.indexOf(key); const to = from + amount; if (to < 0 || to >= order.length) return; [order[from], order[to]] = [order[to], order[from]]; patch({ blockOrder: order }); };
  const toggleBlock = (key: BlockKey) => patch({ hiddenBlocks: draft.hiddenBlocks.includes(key) ? draft.hiddenBlocks.filter((item) => item !== key) : [...draft.hiddenBlocks, key] });
  const toggleArray = <T extends Sport | Role>(key: "sports" | "roles", value: T) => { const values = draft[key] as T[]; patch({ [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] } as Partial<Profile>); };
  const toggleSlot = (weekday: number, start: string) => { const exists = draft.availability.some((slot) => slot.weekday === weekday && slot.start === start); patch({ availability: exists ? draft.availability.filter((slot) => !(slot.weekday === weekday && slot.start === start)) : [...draft.availability, { weekday, start }] }); };

  if (!ready) return <div className="auth-page theme-centre"><CourtLines className="auth-court" /><div className="meta loading-call">Preparing your studio…</div></div>;
  if (onboardingStep > 0) return <Onboarding profile={draft} step={onboardingStep} setStep={setOnboardingStep} patch={patch} />;

  const blockSummary = (key: BlockKey) => key === "credentials" ? (draft.ratingValue ? `${draft.ratingSystem} ${draft.ratingValue}` : "Add your background") : key === "services" ? servicesSummary(draft.services) : key === "testimonials" ? (draft.testimonials.length ? `${draft.testimonials.length} of ${MAX_TESTIMONIALS} quotes` : "Add a player quote") : key === "availability" ? `${draft.availability.length} weekly slots` : `${Object.values(draft.links).filter(Boolean).length} links`;
  const status = !published ? "Not published" : dirty ? "Unpublished changes" : "Live";
  const statusTone = !published ? "off" : dirty ? "pending" : "live";
  const initials = draft.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("") || "?";
  return <div className={`shell studio-shell theme-${draft.theme}`}>
    <div className={`studio-layout ${mobilePreview ? "preview-mobile" : ""}`}>
      <section className="editor">
        <div className="publish-bar">
          <div className="publish-status"><span className={`status-pill ${statusTone}`}>{status}</span><span className="publish-url">courtsidebio.com/<strong>{draft.username}</strong></span></div>
          <div className="publish-actions">
            <button className="button primary small" onClick={publish} disabled={Boolean(published) && !dirty}>{published ? (dirty ? "Update page" : "Published") : "Publish page"}</button>
            {published && <><button className="button small" onClick={copyProfileUrl}>Copy link</button><a className="button small" href={`/${draft.username}`} target="_blank" rel="noopener noreferrer">View ↗</a><button className="button small ghost" onClick={() => setConfirmUnpublish(true)}>Unpublish</button></>}
          </div>
          {copyState && <p className="fineprint" role="status">{copyState}</p>}
          {confirmUnpublish && <div className="confirm-box" role="alertdialog" aria-labelledby="unpublish-title"><strong id="unpublish-title">Unpublish this page?</strong><p className="muted">Visitors will immediately see the unavailable page. Your private draft is retained.</p><div className="chip-row"><button className="button primary small" onClick={unpublish}>Confirm unpublish</button><button className="button ghost small" onClick={() => setConfirmUnpublish(false)}>Cancel</button></div></div>}
          {blockers.length > 0 && <div className="confirm-box blockers" role="alert" aria-labelledby="blockers-title"><strong id="blockers-title">Before you publish</strong><ul className="blocker-list">{blockers.map((item) => <li key={item.message}><span>{item.message}</span><button className="button small" onClick={() => setFocus(item.focus)}>Fix</button></li>)}</ul></div>}
          {notice && <p className="fineprint" role="status">{notice}</p>}
        </div>
        <div className="editor-head">{focus && <button className="button small ghost" onClick={() => setFocus(null)}>← Back</button>}<div><div className="meta">{focus ? "Edit block" : "Your studio"}</div><h1>{focus ? focus[0].toUpperCase() + focus.slice(1) : "Your page"}</h1></div></div>
        {!focus ? <div className="overview">
          <button className="overview-card identity-card" onClick={() => setFocus("identity")}>
            <span className="mini-avatar">{draft.photoUrl ? <Image src={draft.photoUrl} alt="" width={112} height={112} unoptimized /> : initials}</span>
            <span className="identity-copy"><span className="meta">Identity</span><strong>{draft.name}</strong><span className="overview-meta">{draft.roles.map((r) => r === "coach" ? "Coach" : "Hitting partner").join(" + ")} · {draft.location || "Add location"}</span></span>
            <span className="sport-badges">{draft.sports.map((sport) => <span className="sport-badge" key={sport}><SportIcon sport={sport} size={13} />{sportLabel(sport)}</span>)}</span>
          </button>
          <StrengthCard profile={draft} onFix={setFocus} />
          <div className="overview-pair">
            <button className="overview-card" onClick={() => setFocus("contact")}><span className="meta">Contact</span><span className="overview-summary">{[draft.whatsapp && "WhatsApp", draft.email && "Email"].filter(Boolean).join(" + ") || "Not set"}</span><span className="overview-meta">Outbound messages only</span></button>
            <button className="overview-card" onClick={() => setFocus("appearance")}><span className={`theme-chip theme-${draft.theme}`} aria-hidden="true"><CourtLines sport={draft.sports[0]} /></span><span className="meta">Appearance</span><span className="overview-summary">{themes.find((theme) => theme.key === draft.theme)?.name}</span><span className="overview-meta">Theme, visibility and order</span></button>
          </div>
          <div className="card lineup">
            <div className="card-head"><div className="card-label meta">Page lineup</div><span className="meta">Order · visibility</span></div>
            {draft.blockOrder.map((key, index) => <div className={`lineup-row${draft.hiddenBlocks.includes(key) ? " is-hidden" : ""}`} key={key}>
              <span className="lineup-index">{index + 1}</span>
              <button className="lineup-main" onClick={() => setFocus(key)}><strong>{labels[key]}</strong><span className="overview-meta">{blockSummary(key)}</span></button>
              <div className="reorder"><button onClick={() => moveBlock(key, -1)} disabled={index === 0} aria-label={`Move ${labels[key]} up`}>↑</button><button onClick={() => moveBlock(key, 1)} disabled={index === draft.blockOrder.length - 1} aria-label={`Move ${labels[key]} down`}>↓</button><button className="visibility" aria-pressed={!draft.hiddenBlocks.includes(key)} onClick={() => toggleBlock(key)} aria-label={`${draft.hiddenBlocks.includes(key) ? "Show" : "Hide"} ${labels[key]}`}>{draft.hiddenBlocks.includes(key) ? "Off" : "On"}</button></div>
            </div>)}
          </div>
        </div> : <EditorSection focus={focus} profile={draft} patch={patch} toggleArray={toggleArray} toggleSlot={toggleSlot} toggleBlock={toggleBlock} />}
      </section>
      <aside className="preview-pane" aria-label="Live draft preview"><div className="phone-frame"><ProfileRenderer profile={draft} preview /></div></aside>
    </div>
    <nav className="mobile-tabs" aria-label="Studio view"><button className={!mobilePreview ? "active" : ""} onClick={() => setMobilePreview(false)}>Edit</button><button className={mobilePreview ? "active" : ""} onClick={() => setMobilePreview(true)}>Preview</button></nav>
  </div>;
}

function Onboarding({ profile, step, setStep, patch }: { profile: Profile; step: number; setStep: (step: number) => void; patch: (value: Partial<Profile>) => void }) {
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "error">("idle");
  useEffect(() => {
    if (step !== 1 || !hasSupabaseConfig()) { setUsernameStatus("idle"); return; }
    if (!usernameSchema.safeParse(profile.username).success) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    const timer = window.setTimeout(async () => {
      const { data, error: availabilityError } = await createClient()!.rpc("is_username_available", { candidate: profile.username });
      setUsernameStatus(availabilityError ? "error" : data ? "available" : "taken");
    }, 400);
    return () => window.clearTimeout(timer);
  }, [profile.username, step]);
  const next = async () => {
    if (step === 1) {
      const valid = usernameSchema.safeParse(profile.username);
      if (!valid.success) { setError(valid.error.issues[0].message); return; }
      if (usernameStatus === "checking") { setError("Wait while we check that username"); return; }
      if (usernameStatus === "taken") { setError("That username is already taken"); return; }
      if (hasSupabaseConfig() && usernameStatus !== "error") {
        const { data, error: availabilityError } = await createClient()!.rpc("is_username_available", { candidate: profile.username });
        if (!availabilityError && !data) { setUsernameStatus("taken"); setError("That username is already taken"); return; }
      }
    }
    if (step === 2 && (!profile.name.trim() || !profile.sports.length || !profile.roles.length)) { setError("Add your name, at least one sport and one role"); return; }
    if (step === 3) {
      if (!profile.email && !profile.whatsapp) { setError("Add an email address or international WhatsApp number"); return; }
      const email = emailSchema.safeParse(profile.email); if (!email.success) { setError(email.error.issues[0].message); return; }
      const phone = whatsappSchema.safeParse(profile.whatsapp); if (!phone.success) { setError(phone.error.issues[0].message); return; }
    }
    setError(""); setStep(step === 3 ? 0 : step + 1);
  };
  return <main className="auth-page theme-centre"><CourtLines className="auth-court" /><section className="auth-card"><ol className="score-steps" aria-label={`Step ${step} of 3`}>{["15", "30", "40"].map((score, index) => <li key={score} className={index + 1 < step ? "done" : index + 1 === step ? "current" : ""}>{score}</li>)}<li className="game">Game</li></ol><h1>{step === 1 ? "Your court. Your page." : step === 2 ? "Make it yours." : "How should people reach you?"}</h1>
    {step === 1 && <><div className="field"><label htmlFor="username">Claim your username</label><input id="username" value={profile.username} onChange={(e) => { setError(""); patch({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }); }} placeholder="alexmorgan" aria-describedby="username-help"/><span className="muted" id="username-help">courtsidebio.com/{profile.username || "yourname"}</span>{usernameStatus === "checking" && <span className="muted" role="status">Checking availability…</span>}{usernameStatus === "available" && <span className="success" role="status">Username available</span>}{usernameStatus === "taken" && <span className="error" role="status">Username already taken</span>}{usernameStatus === "error" && <span className="muted" role="status">Availability will be confirmed when your draft is created.</span>}</div></>}
    {step === 2 && <><PhotoUpload profile={profile} patch={patch}/><div className="field"><label htmlFor="name">Full name</label><input id="name" value={profile.name} onChange={(e) => patch({name:e.target.value})}/></div><div className="field"><label>Sports</label><div className="toggle-row">{SPORTS.map((sport)=><button className="toggle" aria-pressed={profile.sports.includes(sport)} key={sport} onClick={()=>patch({sports:profile.sports.includes(sport)?profile.sports.filter(x=>x!==sport):[...profile.sports,sport]})}><SportIcon sport={sport} size={15}/>{sportLabel(sport)}</button>)}</div></div><div className="field"><label>Roles</label><div className="toggle-row">{(["coach","hitting_partner"] as Role[]).map((role)=><button className="toggle" aria-pressed={profile.roles.includes(role)} key={role} onClick={()=>patch({roles:profile.roles.includes(role)?profile.roles.filter(x=>x!==role):[...profile.roles,role]})}>{role === "coach" ? "Coach" : "Hitting partner"}</button>)}</div></div><div className="field"><label htmlFor="location">City / area <span className="muted">(optional)</span></label><input id="location" value={profile.location} onChange={(e)=>patch({location:e.target.value})}/></div></>}
    {step === 3 && <><p className="muted">Visitors use these details to open a prefilled message. courtsidebio does not create an inbox or claim a message was delivered.</p><div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" value={profile.whatsapp} onChange={(e)=>patch({whatsapp:e.target.value})} placeholder="+14155550123"/></div><div className="field"><label htmlFor="email">Public contact email</label><input id="email" type="email" value={profile.email} onChange={(e)=>patch({email:e.target.value})}/></div></>}
    {error && <p className="error" role="alert">{error}</p>}<div className="chip-row" style={{marginTop:22}}>{step > 1 && <button className="button" onClick={()=>setStep(step-1)}>Back</button>}<button className="button primary" onClick={next}>{step === 3 ? "Create my page" : "Continue"}</button></div>
  </section></main>;
}

function EditorSection({ focus, profile, patch, toggleArray, toggleSlot, toggleBlock }: { focus: Exclude<Focus, null>; profile: Profile; patch: (value: Partial<Profile>) => void; toggleArray: <T extends Sport | Role>(key: "sports" | "roles", value: T) => void; toggleSlot: (weekday:number,start:string)=>void; toggleBlock:(key:BlockKey)=>void }) {
  if (focus === "identity") return <div className="editor-section"><PhotoUpload profile={profile} patch={patch}/><div className="form-grid"><Field label="Full name" value={profile.name} onChange={(name)=>patch({name})}/><Field label="Location" value={profile.location} onChange={(location)=>patch({location})}/><label className="field"><span>Currency</span><select value={profile.currency} onChange={(e)=>patch({currency:e.target.value})}>{(currencies.includes(profile.currency) ? currencies : [profile.currency, ...currencies]).map(x=><option key={x}>{x}</option>)}</select></label></div><Field label="Headline" value={profile.headline} onChange={(headline)=>patch({headline})} maxLength={120}/><label className="field"><span>Bio · {profile.bio.length}/250</span><textarea rows={4} maxLength={250} value={profile.bio} onChange={(e)=>patch({bio:e.target.value})}/></label><div className="field"><label>Sports</label><div className="toggle-row">{SPORTS.map(x=><button key={x} className="toggle" aria-pressed={profile.sports.includes(x)} onClick={()=>toggleArray("sports",x)}><SportIcon sport={x} size={15}/>{sportLabel(x)}</button>)}</div></div><div className="field"><label>Roles</label><div className="toggle-row">{(["coach","hitting_partner"] as Role[]).map(x=><button key={x} className="toggle" aria-pressed={profile.roles.includes(x)} onClick={()=>toggleArray("roles",x)}>{x === "coach" ? "Coach" : "Hitting partner"}</button>)}</div></div></div>;
  if (focus === "contact") return <div className="editor-section"><p className="muted">At least one method is required to publish. These details appear only on the published snapshot.</p><Field label="WhatsApp · international format" value={profile.whatsapp} onChange={(whatsapp)=>patch({whatsapp})} placeholder="+14155550123"/><Field label="Contact email" value={profile.email} onChange={(email)=>patch({email})} type="email"/></div>;
  if (focus === "credentials") return <div className="editor-section"><div className="form-grid"><label className="field"><span>Rating system</span><select value={profile.ratingSystem} onChange={(e)=>patch({ratingSystem:e.target.value as Profile["ratingSystem"]})}>{["UTR","DUPR","NTRP","Playtomic","Other"].map(x=><option key={x}>{x}</option>)}</select></label><Field label="Rating · self-reported" value={profile.ratingValue} onChange={(ratingValue)=>patch({ratingValue})}/></div><Field label="Rating source URL" value={profile.ratingUrl} onChange={(ratingUrl)=>patch({ratingUrl})} placeholder="https://"/><label className="field"><span>Playing background</span><textarea rows={4} value={profile.playingBackground} onChange={(e)=>patch({playingBackground:e.target.value})}/></label><label className="field"><span>Coaching experience</span><textarea rows={4} value={profile.coachingExperience} onChange={(e)=>patch({coachingExperience:e.target.value})}/></label></div>;
  if (focus === "services") return <ServicesEditor profile={profile} patch={patch} />;
  if (focus === "testimonials") return <TestimonialsEditor profile={profile} patch={patch} />;
  if (focus === "availability") return <AvailabilityEditor profile={profile} patch={patch} toggleSlot={toggleSlot} />;
  if (focus === "links") return <div className="editor-section"><Field label="Instagram URL" value={profile.links.instagram} placeholder="https://" onChange={(instagram)=>patch({links:{...profile.links,instagram}})}/><Field label="YouTube URL" value={profile.links.youtube} placeholder="https://" onChange={(youtube)=>patch({links:{...profile.links,youtube}})}/><Field label="Website URL" value={profile.links.website} placeholder="https://" onChange={(website)=>patch({links:{...profile.links,website}})}/></div>;
  return <div className="editor-section"><div className="theme-picker">{themes.map(theme=><button key={theme.key} className="theme-option" aria-pressed={profile.theme===theme.key} onClick={()=>patch({theme:theme.key})}><span className={`theme-court theme-${theme.key}`} aria-hidden="true"><CourtLines sport={profile.sports[0]}/></span><strong>{theme.name}</strong></button>)}</div><h2 className="section-title">Arrange your blocks</h2>{profile.blockOrder.map((key)=><div className="section-card-head section-card" key={key}><strong>{labels[key]}</strong><button className="toggle" aria-pressed={!profile.hiddenBlocks.includes(key)} onClick={()=>toggleBlock(key)}>{profile.hiddenBlocks.includes(key)?"Hidden":"Shown"}</button></div>)}<p className="muted">Identity stays first and contact remains available. Empty blocks are automatically omitted.</p></div>;
}

function Field({label,value,onChange,placeholder,type="text",maxLength}: {label:string;value:string;onChange:(value:string)=>void;placeholder?:string;type?:string;maxLength?:number}) { return <label className="field"><span>{label}</span><input type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event)=>onChange(event.target.value)}/></label>; }

function StrengthCard({ profile, onFix }: { profile: Profile; onFix: (focus: HealthFocus) => void }) {
  const items = strengthItems(profile);
  const done = items.filter((item) => item.done).length;
  const missing = items.filter((item) => !item.done);
  return <div className="card strength">
    <div className="card-head"><div className="card-label meta">Profile strength</div><span className="meta strength-score">{done}/{items.length}</span></div>
    <div className="strength-meter" role="progressbar" aria-label="Profile strength" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>{items.map((item) => <span key={item.key} className={item.done ? "on" : ""} />)}</div>
    {missing.length ? <div className="strength-list">{missing.map((item) => <button key={item.key} className="strength-item" onClick={() => onFix(item.focus)}>+ {item.label}</button>)}</div> : <p className="muted strength-done">Game, set, match. Every block is filled in.</p>}
  </div>;
}

function AvailabilityEditor({ profile, patch, toggleSlot }: { profile: Profile; patch: (value: Partial<Profile>) => void; toggleSlot: (weekday: number, start: string) => void }) {
  const zoneGroups = useMemo(() => groupedTimezones(profile.timezone), [profile.timezone]);
  const slotsFor = (weekday: number) => profile.availability.filter((slot) => slot.weekday === weekday);
  const copyToWeekdays = (weekday: number) => {
    const starts = slotsFor(weekday).map((slot) => slot.start);
    const targets = weekdays.filter((day) => day !== weekday);
    patch({ availability: [...profile.availability.filter((slot) => !targets.includes(slot.weekday)), ...targets.flatMap((day) => starts.map((start) => ({ weekday: day, start })))] });
  };
  const clearDay = (weekday: number) => patch({ availability: profile.availability.filter((slot) => slot.weekday !== weekday) });
  return <div className="editor-section">
    <div className="section-card-head"><strong>Show availability</strong><button className="toggle" aria-pressed={profile.availabilityVisible} onClick={()=>patch({availabilityVisible:!profile.availabilityVisible})}>{profile.availabilityVisible ? "Shown" : "Hidden"}</button></div>
    <label className="field"><span>Your timezone</span><select value={profile.timezone} onChange={(e)=>patch({timezone:e.target.value})}>{zoneGroups.map(([region, zones]) => <optgroup key={region} label={region}>{zones.map((zone) => <option key={zone} value={zone}>{timezoneLabel(zone)}</option>)}</optgroup>)}</select></label>
    <p className="muted">Choose recurring 60-minute start times. The public page shows the next seven days in this timezone.</p>
    {days.map((day, weekday) => {
      const count = slotsFor(weekday).length;
      return <div className="day-row section-card" key={day}>
        <div className="day-head">
          <strong>{day}</strong>
          <span className="meta day-count">{count ? `${count} slot${count === 1 ? "" : "s"}` : "Off court"}</span>
          {count > 0 && <span className="day-actions">
            {weekdays.includes(weekday) && <button className="day-action" onClick={() => copyToWeekdays(weekday)} aria-label={`Copy ${day} times to every weekday`}>Copy to Mon–Fri</button>}
            <button className="day-action" onClick={() => clearDay(weekday)} aria-label={`Clear ${day}`}>Clear</button>
          </span>}
        </div>
        <div className="time-grid">{times.map(start=><button key={start} className="time" aria-pressed={profile.availability.some(slot=>slot.weekday===weekday&&slot.start===start)} onClick={()=>toggleSlot(weekday,start)}>{start}</button>)}</div>
      </div>;
    })}
  </div>;
}

const servicesSummary = (services: Service[]) => {
  const enabled = services.filter((service) => service.enabled);
  return enabled.length ? enabled.map((service) => serviceName(service.type)).join(" · ") : "No services yet";
};
const serviceHints: Record<Service["type"], { title: string; note: string }> = {
  coaching: { title: "Private coaching", note: "Technique, tactics and match preparation" },
  hitting: { title: "Hitting sessions", note: "Live-ball practice for competitive players" },
  clinic: { title: "Group clinics", note: "Saturday doubles drills · up to 6 players" }
};

function ServicesEditor({ profile, patch }: { profile: Profile; patch: (value: Partial<Profile>) => void }) {
  const update = (index: number, value: Partial<Service>) => { const services = [...profile.services]; services[index] = { ...services[index], ...value }; patch({ services }); };
  return <div className="editor-section">
    <p className="muted">Prices are starting points shown on your page. Visitors still message you to confirm.</p>
    {profile.services.map((service, index) => <div className="section-card" key={service.type}>
      <div className="section-card-head"><strong>{serviceHints[service.type].title}</strong><button className="toggle" aria-pressed={service.enabled} onClick={() => update(index, { enabled: !service.enabled })}>{service.enabled ? "Offered" : "Not offered"}</button></div>
      {service.enabled && <div className="service-fields">
        <Field label={service.type === "clinic" ? `Price per player (${profile.currency})` : `Starting price (${profile.currency})`} value={service.price?.toString() || ""} type="number" placeholder="Leave blank to show “Ask”" onChange={(value) => update(index, { price: value === "" ? null : Math.max(0, Number(value)) })} />
        <label className="field"><span>Session length</span><select value={service.duration} onChange={(event) => update(index, { duration: Number(event.target.value) })}>{(SESSION_LENGTHS as readonly number[]).includes(service.duration) ? null : <option value={service.duration}>{service.duration} min</option>}{SESSION_LENGTHS.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}</select></label>
        <div className="service-note"><Field label="Short note" value={service.note} maxLength={140} placeholder={serviceHints[service.type].note} onChange={(note) => update(index, { note })} /></div>
      </div>}
    </div>)}
  </div>;
}

function TestimonialsEditor({ profile, patch }: { profile: Profile; patch: (value: Partial<Profile>) => void }) {
  const items = profile.testimonials;
  const update = (index: number, value: Partial<Testimonial>) => { const testimonials = [...items]; testimonials[index] = { ...testimonials[index], ...value }; patch({ testimonials }); };
  return <div className="editor-section">
    <p className="muted">Short quotes from players you&apos;ve worked with. Only share words they&apos;re happy to see on your page.</p>
    {items.map((item, index) => <div className="section-card" key={index}>
      <div className="section-card-head"><strong>Quote {index + 1}</strong><button className="button small ghost" onClick={() => patch({ testimonials: items.filter((_, position) => position !== index) })}>Remove</button></div>
      <label className="field"><span>What they said · {item.quote.length}/280</span><textarea rows={3} maxLength={280} value={item.quote} placeholder="Six weeks in and my second serve finally holds up in league matches." onChange={(event) => update(index, { quote: event.target.value })} /></label>
      <div className="form-grid testimonial-meta"><Field label="Name" value={item.name} maxLength={60} placeholder="Jordan P." onChange={(name) => update(index, { name })} /><Field label="Context (optional)" value={item.context} maxLength={60} placeholder="4.0 league player" onChange={(context) => update(index, { context })} /></div>
    </div>)}
    {items.length < MAX_TESTIMONIALS ? <button className="button add-testimonial" onClick={() => patch({ testimonials: [...items, { quote: "", name: "", context: "" }] })}>+ Add a testimonial</button> : <p className="muted">That&apos;s the maximum of {MAX_TESTIMONIALS}. Remove one to add another.</p>}
  </div>;
}
