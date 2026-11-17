import Link from "next/link";
import { BallMark } from "@/components/CourtArt";

export function OutOfBounds() {
  return <main className="auth-page">
    <section className="auth-card">
      <BallMark size={36} />
      <h1 style={{ marginTop: 20 }}>This page isn’t available</h1>
      <p className="muted">The profile may be unpublished or deleted, or the link may be wrong.</p>
      <Link href="/" className="button primary block">Go to courtsidebio</Link>
    </section>
  </main>;
}
