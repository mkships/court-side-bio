"use client";

import { useEffect, useState } from "react";

const qrColors = { dark: "#0f2a1e", light: "#ffffff" };

/** Link, QR code and native share for a published page. */
export function ShareKit({ username, name }: { username: string; name: string }) {
  const [url, setUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [png, setPng] = useState("");
  const [status, setStatus] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    const pageUrl = `${window.location.origin}/${username}`;
    setUrl(pageUrl);
    setCanShare(typeof navigator.share === "function");
    let cancelled = false;
    // Loaded on demand so the studio bundle doesn't carry the QR encoder until a page is live.
    import("qrcode").then(({ default: QRCode }) => Promise.all([
      QRCode.toString(pageUrl, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: qrColors }),
      QRCode.toDataURL(pageUrl, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: qrColors })
    ])).then(([vector, image]) => { if (!cancelled) { setSvg(vector); setPng(image); } }).catch(() => { if (!cancelled) setStatus("Couldn't draw the QR code. Your link still works."); });
    return () => { cancelled = true; };
  }, [username]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setStatus("Link copied"); } catch { setStatus("Copy failed — select the link above"); }
  };
  const share = async () => {
    try { await navigator.share({ title: `${name} on courtsidebio`, url }); } catch (error) { if ((error as Error)?.name !== "AbortError") setStatus("Sharing isn't available here — copy the link instead"); }
  };

  return <div className="card share-kit">
    <div className="share-qr" role="img" aria-label={`QR code for ${url}`} dangerouslySetInnerHTML={{ __html: svg }} />
    <div className="share-copy">
      <div className="card-label meta">Share kit</div>
      <a className="share-url" href={url} target="_blank" rel="noopener noreferrer">{url.replace(/^https?:\/\//, "")}</a>
      <p className="muted">Put the link in your Instagram bio and WhatsApp status. Print the QR code for your club noticeboard or flyers.</p>
      <div className="chip-row">
        <button className="button small primary" onClick={copy}>Copy link</button>
        {canShare && <button className="button small" onClick={share}>Share…</button>}
        {png && <a className="button small" href={png} download={`courtsidebio-${username}-qr.png`}>Download QR</a>}
      </div>
      {status && <p className="fineprint" role="status">{status}</p>}
    </div>
  </div>;
}
