import type { Sport } from "@/types/profile";

// Top-down court markings drawn to each sport's real proportions (tennis in feet, pickleball in feet, padel in metres).
const courts: Record<Sport, { width: number; height: number; lines: string }> = {
  tennis: { width: 78, height: 36, lines: "M0 4.5H78M0 31.5H78M18 4.5V31.5M60 4.5V31.5M18 18H60M0 18H1.2M76.8 18H78" },
  pickleball: { width: 44, height: 20, lines: "M15 0V20M29 0V20M0 10H15M29 10H44" },
  padel: { width: 20, height: 10, lines: "M3.05 0V10M16.95 0V10M3.05 5H16.95" },
};

export function CourtLines({ sport = "tennis", className = "" }: { sport?: Sport; className?: string }) {
  const court = courts[sport];
  const pad = court.width * 0.06;
  return <svg className={`court-lines ${className}`} viewBox={`${-pad} ${-pad} ${court.width + pad * 2} ${court.height + pad * 2}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke">
      <rect x="0" y="0" width={court.width} height={court.height} vectorEffect="non-scaling-stroke" />
      <path d={court.lines} vectorEffect="non-scaling-stroke" />
      <path className="court-net" d={`M${court.width / 2} ${-pad * 0.4}V${court.height + pad * 0.4}`} strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
    </g>
  </svg>;
}

export function SportIcon({ sport, size = 16 }: { sport: Sport; size?: number }) {
  if (sport === "pickleball") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="sport-icon">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    {[[12, 6.5], [7.2, 10], [16.8, 10], [9, 15.6], [15, 15.6], [12, 11.8]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="currentColor" />)}
  </svg>;
  if (sport === "padel") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="sport-icon">
    <path d="M12 2.2c4 0 6.6 2.9 6.6 6.6 0 3.9-2.9 7-6.6 7s-6.6-3.1-6.6-7c0-3.7 2.6-6.6 6.6-6.6Z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M10.6 15.6 10.2 21.4h3.6l-.4-5.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {[[12, 6], [9.3, 8.8], [14.7, 8.8], [12, 11.6]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1" fill="currentColor" />)}
  </svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="sport-icon">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M4.2 5.6c3.6 2.8 3.6 10 0 12.8M19.8 5.6c-3.6 2.8-3.6 10 0 12.8" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>;
}

export function BallMark({ size = 30 }: { size?: number }) {
  return <svg className="ball-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="var(--ball)" />
    <path d="M5.4 6.6c4.8 3.9 4.8 14.9 0 18.8M26.6 6.6c-4.8 3.9-4.8 14.9 0 18.8" fill="none" stroke="var(--ballSeam)" strokeWidth="2.2" strokeLinecap="round" />
  </svg>;
}

export function LinkIcon({ kind }: { kind: "instagram" | "youtube" | "website" }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {kind === "instagram" && <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" /></>}
    {kind === "youtube" && <><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" /></>}
    {kind === "website" && <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" /></>}
  </svg>;
}
