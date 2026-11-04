"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BallMark } from "@/components/CourtArt";

export function SiteHeader({ studio = false }: { studio?: boolean }) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setHidden(currentScrollY > 96 && currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <header className={`site-header${hidden ? " is-hidden" : ""}`}>
    <Link href="/" className="brand" aria-label="courtsidebio home"><BallMark size={26} /><span>courtsidebio</span></Link>
    <span className="meta hide-mobile header-tag">Tennis · Pickleball · Padel</span>
    <span className="nav-spacer" />
    {studio ? <Link className="button small" href="/demo">View demo page ↗</Link> : <>
      <Link className="button small ghost hide-mobile" href="/demo">View demo</Link>
      <Link className="button small ghost" href="/login">Sign in</Link>
      <Link className="button small primary" href="/signup">Build my page</Link>
    </>}
  </header>;
}
