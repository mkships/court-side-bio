import { ImageResponse } from "next/og";
import { serviceName, sportLabel, type Profile, type ThemeKey } from "@/types/profile";

// Link-preview cards (WhatsApp, iMessage, Instagram DMs, X, Slack). Colours mirror the .theme-* tokens in globals.css.
export const ogSize = { width: 1200, height: 630 };
const BALL = "#d9f24a";
const palettes: Record<ThemeKey, { bg: string; ink: string; btn: string; btnInk: string; chip: string }> = {
  centre: { bg: "#2f7a3b", ink: "#ffffff", btn: "#f4f1e4", btnInk: "#173d1e", chip: "rgba(255,255,255,0.16)" },
  clay: { bg: "#b9532a", ink: "#ffffff", btn: "#ffffff", btnInk: "#7a2e12", chip: "rgba(255,255,255,0.16)" },
  hard: { bg: "#2d63c8", ink: "#ffffff", btn: "#ffffff", btnInk: "#15346e", chip: "rgba(255,255,255,0.16)" },
  night: { bg: "#101215", ink: "#f5f5f2", btn: BALL, btnInk: "#101215", chip: "rgba(255,255,255,0.1)" }
};

type Font = { name: string; data: ArrayBuffer; weight: 500 | 700; style: "normal" };
const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

/** Fetches a subset of a Google font as TTF. Returns null offline so the card still renders in the default font. */
function googleFont(family: string, weight: number, text: string) {
  const key = `${family}:${weight}:${text}`;
  if (!fontCache.has(key)) fontCache.set(key, (async () => {
    try {
      const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`, { signal: AbortSignal.timeout(4000) })).text();
      const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
      if (!src) return null;
      const response = await fetch(src, { signal: AbortSignal.timeout(4000) });
      return response.ok ? await response.arrayBuffer() : null;
    } catch { return null; }
  })());
  return fontCache.get(key)!;
}

async function loadFonts(text: string): Promise<Font[]> {
  const [bold, medium] = await Promise.all([googleFont("Onest", 700, text), googleFont("Onest", 500, text)]);
  return [
    ...(bold ? [{ name: "Onest", data: bold, weight: 700 as const, style: "normal" as const }] : []),
    ...(medium ? [{ name: "Onest", data: medium, weight: 500 as const, style: "normal" as const }] : [])
  ];
}

/** Inlines the portrait so a slow or expired signed URL can't break the whole card. */
async function inlinePhoto(url: string) {
  if (url.startsWith("data:image/")) return url;
  if (!url.startsWith("https://")) return "";
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const type = response.headers.get("content-type") || "";
    if (!response.ok || !/^image\/(jpeg|png|webp)/.test(type)) return "";
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
  } catch { return ""; }
}

function Ball({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill={BALL} /><path d="M5.4 6.6c4.8 3.9 4.8 14.9 0 18.8M26.6 6.6c-4.8 3.9-4.8 14.9 0 18.8" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" /></svg>;
}

const money = (code: string, value: number) => { try { return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: value % 1 ? 2 : 0 }).format(value); } catch { return `${value} ${code}`; } };

export async function profileImage(profile: Profile) {
  const palette = palettes[profile.theme] ?? palettes.centre;
  const initials = profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "?";
  const priced = profile.services.filter((service) => service.enabled && service.price !== null);
  const cheapest = priced.sort((a, b) => (a.price as number) - (b.price as number))[0];
  const roles = profile.roles.map((role) => role === "coach" ? "Coach" : "Hitting partner").join(" & ");
  const stats = [
    !profile.hiddenBlocks.includes("credentials") && profile.ratingValue ? { label: profile.ratingSystem === "Other" ? "Rating" : profile.ratingSystem, value: profile.ratingValue } : null,
    !profile.hiddenBlocks.includes("services") && cheapest ? { label: `${serviceName(cheapest.type)} from`, value: money(profile.currency, cheapest.price as number) } : null
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat));
  const sports = profile.sports.map(sportLabel);
  const headline = profile.headline || profile.bio;
  const footer = `courtsidebio.com/${profile.username}`;
  const text = `${profile.name}${initials}${sports.join("")}${headline}${roles}${profile.location}${footer}${stats.map((stat) => `${stat.label}${stat.value}`).join("")} ·`;
  const [fonts, photo] = await Promise.all([loadFonts(text), inlinePhoto(profile.photoUrl)]);
  const nameSize = profile.name.length > 18 ? 76 : profile.name.length > 12 ? 92 : 104;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: "0 80px", background: palette.bg, color: palette.ink, fontFamily: "Onest" }}>
      <div style={{ width: 300, height: 300, flexShrink: 0, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: palette.btn, color: palette.btnInk, fontSize: 104, fontWeight: 700, border: `12px solid ${palette.btn}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>; next/image can't run here */}
        {photo ? <img src={photo} width={276} height={276} style={{ width: 276, height: 276, borderRadius: 999, objectFit: "cover" }} alt="" /> : initials}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {sports.map((label) => <div key={label} style={{ display: "flex", background: palette.chip, borderRadius: 999, padding: "8px 20px", fontSize: 24, fontWeight: 500 }}>{label}</div>)}
        </div>
        <div style={{ display: "flex", fontWeight: 700, fontSize: nameSize, lineHeight: 1.02, letterSpacing: -3, marginTop: 22 }}>{profile.name}</div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 500, marginTop: 14, opacity: 0.85 }}>{[roles, profile.location].filter(Boolean).join(" · ")}</div>
        {stats.length > 0 && <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
          {stats.map((stat) => <div key={stat.label} style={{ display: "flex", flexDirection: "column", background: palette.chip, borderRadius: 20, padding: "12px 22px" }}>
            <div style={{ display: "flex", fontSize: 20, fontWeight: 500, opacity: 0.8 }}>{stat.label}</div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, marginTop: 2 }}>{stat.value}</div>
          </div>)}
        </div>}
        <div style={{ display: "flex", alignSelf: "flex-start", marginTop: 30, background: palette.btn, color: palette.btnInk, borderRadius: 999, padding: "12px 26px", fontSize: 26, fontWeight: 700 }}>{footer}</div>
      </div>
    </div>,
    { ...ogSize, fonts: fonts.length ? fonts : undefined }
  );
}

export async function brandImage() {
  const headline = "The link in bio built for coaches";
  const body = "Tennis · Pickleball · PadelRatings, lessons, prices and court times on one page.courtsidebioAlex MorganCoachUTR10.8From$30Message Alex";
  const fonts = await loadFonts(headline + body);
  const grass = palettes.centre;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px", background: "#ffffff", color: "#000000", fontFamily: "Onest" }}>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 32, fontWeight: 700, letterSpacing: -1 }}><Ball size={40} />courtsidebio</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -3, marginTop: 40 }}>{headline}</div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 500, color: "#5b5b66", marginTop: 22, lineHeight: 1.35 }}>Ratings, lessons, prices and court times on one page.</div>
        <div style={{ display: "flex", alignSelf: "flex-start", marginTop: 30, background: "#f3f3f5", borderRadius: 999, padding: "10px 22px", fontSize: 24, fontWeight: 500 }}>Tennis · Pickleball · Padel</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 300, height: 520, borderRadius: 40, background: grass.bg, color: grass.ink, padding: "40px 22px", border: "10px solid #0b0b0c" }}>
        <div style={{ width: 110, height: 110, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: grass.btn, color: grass.btnInk, fontSize: 40, fontWeight: 700 }}>AM</div>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, marginTop: 18, letterSpacing: -1 }}>Alex Morgan</div>
        <div style={{ display: "flex", fontSize: 18, fontWeight: 500, opacity: 0.8, marginTop: 4 }}>Coach</div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
          {[["UTR", "10.8"], ["From", "$30"]].map(([label, value]) => <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, background: grass.chip, borderRadius: 16, padding: "8px 0" }}><div style={{ display: "flex", fontSize: 15, opacity: 0.8 }}>{label}</div><div style={{ display: "flex", fontSize: 24, fontWeight: 700 }}>{value}</div></div>)}
        </div>
        {[1, 2].map((key) => <div key={key} style={{ display: "flex", width: "100%", height: 50, borderRadius: 14, background: grass.btn, marginTop: 12 }} />)}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: 50, borderRadius: 999, background: grass.btn, color: grass.btnInk, marginTop: 22, fontSize: 20, fontWeight: 700 }}>Message Alex</div>
      </div>
    </div>,
    { ...ogSize, fonts: fonts.length ? fonts : undefined }
  );
}
