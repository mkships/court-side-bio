import Link from "next/link";
import { BallMark, CourtLines } from "@/components/CourtArt";

export function OutOfBounds() {
  return <main className="auth-page theme-centre">
    <CourtLines className="auth-court" />
    <section className="auth-card out-card">
      <div className="line-call" aria-hidden="true"><span className="line-call-line" /><BallMark size={34} /></div>
      <div className="meta">404 · Line call</div>
      <h1>Out.</h1>
      <p className="muted">This page isn’t available. The profile may be unpublished, deleted, or the link may be incorrect.</p>
      <Link href="/" className="button primary">Back to courtsidebio</Link>
    </section>
  </main>;
}
