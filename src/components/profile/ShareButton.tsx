"use client";

import { useEffect, useRef, useState } from "react";

/** Native share sheet on phones; copies the link elsewhere. */
export function ShareButton({ title }: { title: string }) {
  const [label, setLabel] = useState("Share");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = (text: string) => { setLabel(text); clearTimeout(timer.current); timer.current = setTimeout(() => setLabel("Share"), 2200); };
  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title, url }); return; } catch (error) { if ((error as Error)?.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); flash("Link copied"); } catch { flash("Copy failed"); }
  };
  return <button className="button small share-button" onClick={share} aria-live="polite">
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>
    {label}
  </button>;
}
