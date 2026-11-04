"use client";

import { useEffect, useState } from "react";
import { BallMark } from "@/components/CourtArt";

export function LaunchScreen() {
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let leaveTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;
    const startedAt = performance.now();

    const finish = () => {
      const remaining = Math.max(0, 520 - (performance.now() - startedAt));
      leaveTimer = setTimeout(() => {
        setLeaving(true);
        removeTimer = setTimeout(() => setVisible(false), 700);
      }, remaining);
    };

    Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(finish);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return <div className={`launch-screen${leaving ? " is-leaving" : ""}`} aria-hidden="true">
    <div className="launch-panel launch-panel-left" />
    <div className="launch-panel launch-panel-right" />
    <div className="launch-wordmark"><span className="launch-ball"><BallMark size={34} /></span><span>COURTSIDEBIO</span></div>
  </div>;
}
