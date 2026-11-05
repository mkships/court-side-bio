import { ImageResponse } from "next/og";
import { courts } from "@/components/CourtArt";
import { serviceName, sportLabel, type Profile, type Sport, type ThemeKey } from "@/types/profile";

// Link-preview cards (WhatsApp, iMessage, Instagram DMs, X, Slack). Colours mirror the .theme-* tokens in globals.css.
export const ogSize = { width: 1200, height: 630 };
const BALL = "#dcf04a";
const palettes: Record<ThemeKey, { hero: string; runoff: string; ink: string; line: string; board: string }> = {
  centre: { hero: "#1f5c3b", runoff: "#194d31", ink: "#f6f5ec", line: "rgba(255,255,255,0.16)", board: "#0f2a1e" },
  clay: { hero: "#bf5a31", runoff: "#a84c27", ink: "#fff7ec", line: "rgba(255,255,255,0.2)", board: "#3a2920" },
  hard: { hero: "#2a5ba8", runoff: "#3c7a5a", ink: "#f4f7fb", line: "rgba(255,255,255,0.2)", board: "#0f2240" },
  night: { hero: "#1b4446", runoff: "#102b2d", ink: "#eef2ea", line: "rgba(220,240,74,0.16)", board: "#050b0d" }
};

type Font = { name: string; data: ArrayBuffer; weight: 600 | 800; style: "normal" };
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

async function loadFonts(display: string, body: string): Promise<Font[]> {
  const [heavy, medium] = await Promise.all([googleFont("Barlow Condensed", 800, display), googleFont("Inter", 600, body)]);
  return [
    ...(heavy ? [{ name: "Display", data: heavy, weight: 800 as const, style: "normal" as const }] : []),
    ...(medium ? [{ name: "Body", data: medium, weight: 600 as const, style: "normal" as const }] : [])
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

function Court({ sport, line, fill }: { sport: Sport; line: string; fill: string }) {
  const court = courts[sport];
  const pad = court.width * 0.06;
  const viewWidth = court.width + pad * 2;
  const stroke = (2.5 * viewWidth) / ogSize.width;
  return <svg width={ogSize.width} height={ogSize.height} viewBox={`${-pad} ${-pad} ${viewWidth} ${court.height + pad * 2}`} preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", left: 0, top: 0 }}>
    <rect x={0} y={0} width={court.width} height={court.height} fill={fill} stroke={line} strokeWidth={stroke} />
    <path d={court.lines} fill="none" stroke={line} strokeWidth={stroke} />
  </svg>;
}

function Ball({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill={BALL} /><path d="M5.4 6.6c4.8 3.9 4.8 14.9 0 18.8M26.6 6.6c-4.8 3.9-4.8 14.9 0 18.8" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" /></svg>;
}

const money = (code: string, value: number) => { try { return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: value % 1 ? 2 : 0 }).format(value); } catch { return `${value} ${code}`; } };

export async function profileImage(profile: Profile) {
  const palette = palettes[profile.theme] ?? palettes.centre;
  const sport = profile.sports[0] ?? "tennis";
  const initials = profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "?";
  const priced = profile.services.filter((service) => service.enabled && service.price !== null);
  const cheapest = priced.sort((a, b) => (a.price as number) - (b.price as number))[0];
  const roles = profile.roles.map((role) => role === "coach" ? "Coach" : "Hitting partner").join(" · ");
  const stats = [
    !profile.hiddenBlocks.includes("credentials") && profile.ratingValue ? { label: profile.ratingSystem === "Other" ? "Rating" : profile.ratingSystem, value: profile.ratingValue } : null,
    !profile.hiddenBlocks.includes("services") && cheapest ? { label: `${serviceName(cheapest.type)} from`, value: money(profile.currency, cheapest.price as number) } : null
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat));
  const sports = profile.sports.map(sportLabel);
  const headline = profile.headline || profile.bio;
  const footer = `courtsidebio.com/${profile.username}`;
  const display = `${profile.name}${initials}${stats.map((stat) => stat.value).join("")}`.toUpperCase();
  const body = `${sports.join("")}${headline}${roles}${profile.location}${footer}${stats.map((stat) => stat.label).join("")}`.toUpperCase() + `${headline}${profile.location}${footer}${roles}`;
  const [fonts, photo] = await Promise.all([loadFonts(display, body), inlinePhoto(profile.photoUrl)]);
  const nameSize = profile.name.length > 18 ? 92 : profile.name.length > 12 ? 112 : 132;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: palette.runoff, color: palette.ink, fontFamily: "Body" }}>
      <Court sport={sport} line={palette.line} fill={palette.hero} />
      <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", display: "flex", background: `linear-gradient(90deg, ${palette.runoff} 0%, rgba(0,0,0,0) 72%)`, opacity: 0.92 }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "54px 64px", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {sports.map((label) => <div key={label} style={{ display: "flex", background: BALL, color: "#0f2a1e", borderRadius: 999, padding: "8px 20px", fontSize: 24, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div style={{ display: "flex", fontFamily: "Display", fontWeight: 800, fontSize: nameSize, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: -2 }}>{profile.name}</div>
          {headline && <div style={{ display: "flex", fontSize: 30, lineHeight: 1.3, marginTop: 18, opacity: 0.92 }}>{headline.length > 90 ? `${headline.slice(0, 88)}…` : headline}</div>}
          <div style={{ display: "flex", fontSize: 22, marginTop: 18, opacity: 0.85, textTransform: "uppercase", letterSpacing: 2 }}>{[roles, profile.location].filter(Boolean).join("  ·  ")}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {stats.map((stat) => <div key={stat.label} style={{ display: "flex", flexDirection: "column", background: palette.board, borderRadius: 18, padding: "12px 22px 14px" }}>
              <div style={{ display: "flex", fontSize: 16, textTransform: "uppercase", letterSpacing: 2, opacity: 0.7 }}>{stat.label}</div>
              <div style={{ display: "flex", fontFamily: "Display", fontWeight: 800, fontSize: 52, lineHeight: 1, color: BALL, marginTop: 4 }}>{stat.value}</div>
            </div>)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24 }}><Ball size={34} />{footer}</div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 96, top: 120, width: 280, height: 280, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#ffffff", color: "#0f2a1e", border: `10px solid ${BALL}`, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", fontFamily: "Display", fontWeight: 800, fontSize: 110 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>; next/image can't run here */}
        {photo ? <img src={photo} width={260} height={260} style={{ width: 260, height: 260, objectFit: "cover" }} alt="" /> : initials}
      </div>
    </div>,
    { ...ogSize, fonts: fonts.length ? fonts : undefined }
  );
}

export async function brandImage() {
  const palette = palettes.centre;
  const display = "YOUR COURT.YOUR PAGE.";
  const body = "TENNIS · PICKLEBALL · PADELLink-in-bio for racket sport pros. Ratings, rates and weekly court times.COURTSIDEBIO";
  const fonts = await loadFonts(display, body + body.toUpperCase());
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: palette.runoff, color: palette.ink, fontFamily: "Body" }}>
      <Court sport="tennis" line={palette.line} fill={palette.hero} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}><Ball size={48} />courtsidebio</div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Display", fontWeight: 800, fontSize: 150, lineHeight: 0.86, textTransform: "uppercase", letterSpacing: -3 }}>
          <div style={{ display: "flex" }}>Your court.</div>
          <div style={{ display: "flex", color: BALL }}>Your page.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26 }}>
          <div style={{ display: "flex", maxWidth: 600, lineHeight: 1.35, opacity: 0.9 }}>Link-in-bio for racket sport pros. Ratings, rates and weekly court times.</div>
          <div style={{ display: "flex", flexShrink: 0, whiteSpace: "nowrap", background: BALL, color: "#0f2a1e", borderRadius: 999, padding: "10px 22px", fontSize: 22, fontWeight: 600, letterSpacing: 2 }}>TENNIS · PICKLEBALL · PADEL</div>
        </div>
      </div>
    </div>,
    { ...ogSize, fonts: fonts.length ? fonts : undefined }
  );
}
