import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { LaunchScreen } from "@/components/LaunchScreen";

export default function Home() {
  return <main className="shell theme-centre">
    <LaunchScreen />
    <SiteHeader />
    <section className="marketing">
      <div className="marketing-hero">
        <div className="hero-copy">
          <div className="eyebrow meta"><span className="live-dot" /> For tennis + pickleball people</div>
          <h1 aria-label="Your court. Your page."><span>Your court.</span><span className="outline-word">Your page.</span></h1>
          <p className="lede">A distinctive profile for coaches and hitting partners. Show your experience, services and availability—then share one link that makes it easy to get in touch.</p>
          <div className="chip-row"><Link href="/signup" className="button primary">Create your page →</Link><Link href="/demo" className="button">Explore the demo</Link></div>
          <p className="fineprint">No marketplace. No booking fees. Just your identity and your direct contact details.</p>
        </div>
        <div className="hero-visual">
          <div className="hero-index meta">Profile / 001</div>
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="hero-card" aria-label="Example courtsidebio profile card">
          <div className="court-lines" />
          <div className="hero-card-content">
            <div className="hero-card-top"><div className="meta">Tennis · Austin, Texas</div><span className="availability-mark" aria-label="Available">Available</span></div>
            <div className="avatar" aria-hidden="true">AM</div>
            <h2>Alex<br/>Morgan</h2>
            <p>Thoughtful training. Competitive energy. A better next point.</p>
            <div className="hero-tags"><span className="chip">Coach</span><span className="chip">Hitting partner</span><span className="chip">UTR 10.8</span></div>
          </div>
        </div>
          <span className="hero-note meta">One link. Entire game.</span>
        </div>
      </div>
      <div className="signal-strip" aria-label="courtsidebio product highlights">
        <span className="meta">Built for independent pros</span><span>Custom identity</span><span>Availability</span><span>Direct inquiries</span><span>Zero booking fees</span>
      </div>
      <section className="marketing-story" aria-labelledby="how-it-works">
        <div className="story-heading"><div className="meta">A cleaner way to be found</div><h2 id="how-it-works">Your game speaks loudly.<br/>Your page should too.</h2></div>
        <div className="story-steps">
          <article><span className="step-number meta">01</span><h3>Shape your identity</h3><p>Add the details that matter: your background, rating, services and style.</p></article>
          <article><span className="step-number meta">02</span><h3>Set your rhythm</h3><p>Show recurring availability without turning your work into a marketplace listing.</p></article>
          <article><span className="step-number meta">03</span><h3>Share one link</h3><p>Make every bio, message and introduction lead somewhere distinctly yours.</p></article>
        </div>
      </section>
      <section className="marketing-cta">
        <div><div className="meta">Ready when you are</div><h2>Make your next<br/>introduction count.</h2></div>
        <Link href="/signup" className="button cta-button"><span>Build my page</span><span aria-hidden="true">↗</span></Link>
      </section>
    </section>
  </main>;
}
