import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { LaunchScreen } from "@/components/LaunchScreen";
import { BallMark, CourtLines, SportIcon } from "@/components/CourtArt";
import { SPORTS, sportLabel, type Sport, type ThemeKey } from "@/types/profile";

const samples: { name: string; sport: Sport; theme: ThemeKey; place: string; ratingSystem: string; rating: string; price: string; role: string }[] = [
  { name: "Priya Shah", sport: "pickleball", theme: "centre", place: "San Diego", ratingSystem: "DUPR", rating: "5.21", price: "$55", role: "Coach" },
  { name: "Alex Morgan", sport: "tennis", theme: "hard", place: "Austin, Texas", ratingSystem: "UTR", rating: "10.8", price: "$65", role: "Coach + Hitting" },
  { name: "Mateo Ruiz", sport: "padel", theme: "night", place: "Madrid", ratingSystem: "Playtomic", rating: "5.4", price: "€40", role: "Hitting partner" },
];
const tape = ["Private coaching", "UTR", "Hitting partners", "DUPR", "Weekly court times", "NTRP", "WhatsApp inquiries", "Playtomic", "Zero booking fees"];

function SampleCard({ sample, index }: { sample: (typeof samples)[number]; index: number }) {
  const initials = sample.name.split(" ").map((part) => part[0]).join("");
  return <article className={`sample-card sample-${index} theme-${sample.theme}`} aria-label={`Example ${sportLabel(sample.sport)} profile for ${sample.name}`}>
    <div className="sample-hero">
      <CourtLines sport={sample.sport} />
      <span className="sport-badge"><SportIcon sport={sample.sport} size={13} />{sportLabel(sample.sport)}</span>
      <span className="sample-avatar" aria-hidden="true">{initials}</span>
      <strong className="sample-name">{sample.name}</strong>
      <span className="meta sample-place">◉ {sample.place}</span>
    </div>
    <dl className="scoreboard sample-board"><div><dt className="meta">{sample.ratingSystem}</dt><dd>{sample.rating}</dd></div><div><dt className="meta">From / hr</dt><dd>{sample.price}</dd></div></dl>
    <div className="sample-foot"><span className="chip">{sample.role}</span><span className="sample-cta">Contact ↗</span></div>
  </article>;
}

export default function Home() {
  return <main className="shell theme-centre landing">
    <LaunchScreen />
    <SiteHeader />
    <section className="landing-hero">
      <CourtLines className="landing-court" />
      <div className="landing-inner">
        <div className="hero-copy">
          <div className="eyebrow meta"><span className="live-dot" /> Link-in-bio for racket sport pros</div>
          <h1 aria-label="Your court. Your page."><span>Your court.</span><span className="hl">Your page.</span></h1>
          <p className="lede">One link for tennis, pickleball and padel coaches and hitting partners. Your rating, your rates and your weekly court times, with a direct line to you.</p>
          <Link href="/signup" className="claim-bar"><span className="claim-domain">courtsidebio.com/</span><span className="claim-name">yourname</span><span className="claim-go">Claim it →</span></Link>
          <div className="hero-sub">
            <span className="sport-badges">{SPORTS.map((sport) => <span className="sport-badge" key={sport}><SportIcon sport={sport} size={14} />{sportLabel(sport)}</span>)}</span>
            <Link href="/demo" className="text-link">See a live example ↗</Link>
          </div>
        </div>
        <div className="hero-stack">{samples.map((sample, index) => <SampleCard sample={sample} index={index} key={sample.name} />)}</div>
      </div>
    </section>

    <div className="net-tape" aria-hidden="true"><div className="net-tape-track">{[...tape, ...tape].map((item, index) => <span key={index}>{item}</span>)}</div></div>

    <section className="landing-section features" aria-labelledby="features-title">
      <div className="section-intro"><div className="meta">Built for the court</div><h2 id="features-title">Not another link list.<br />A page that plays your game.</h2></div>
      <div className="feature-grid">
        <article className="feature">
          <div className="feature-visual rating-visual" aria-hidden="true">
            <span className="rating-badge"><span className="meta">UTR</span><strong>10.8</strong></span>
            <span className="rating-badge"><span className="meta">DUPR</span><strong>5.21</strong></span>
            <span className="rating-badge"><span className="meta">Playtomic</span><strong>5.4</strong></span>
          </div>
          <h3>Ratings up front</h3>
          <p>UTR, DUPR, NTRP or Playtomic, front and centre with your playing and coaching background.</p>
        </article>
        <article className="feature">
          <ol className="feature-visual order-of-play" aria-hidden="true">
            <li><span className="oop-day"><strong>Tue</strong><span className="meta">Oct 21</span></span><span className="oop-slots"><span className="slot">6:00 PM</span><span className="slot">7:00 PM</span></span></li>
            <li><span className="oop-day"><strong>Thu</strong><span className="meta">Oct 23</span></span><span className="oop-slots"><span className="slot">5:00 PM</span></span></li>
            <li><span className="oop-day"><strong>Sat</strong><span className="meta">Oct 25</span></span><span className="oop-slots"><span className="slot">9:00 AM</span><span className="slot">10:00 AM</span></span></li>
          </ol>
          <h3>An order of play</h3>
          <p>Set recurring weekly windows. Visitors see the next seven days in your timezone and tap a time to ask.</p>
        </article>
        <article className="feature">
          <div className="feature-visual chat-visual" aria-hidden="true">
            <span className="bubble">Hi Alex, I found your profile and am interested in a hitting session on Tuesday at 6:00 PM. Are you available?</span>
            <span className="meta bubble-meta">Sent via WhatsApp</span>
          </div>
          <h3>A direct line</h3>
          <p>Inquiries arrive prefilled in WhatsApp or email. No marketplace, no booking fees, no middleman.</p>
        </article>
      </div>
    </section>

    <section className="landing-section scoring" aria-labelledby="how-title">
      <div className="section-intro"><div className="meta">How it works</div><h2 id="how-title">Three points<br />to game.</h2></div>
      <ol className="score-list">
        <li><span className="score">15</span><div><h3>Claim your name</h3><p>Pick the username that goes in your Instagram bio, your WhatsApp status and your club noticeboard.</p></div></li>
        <li><span className="score">30</span><div><h3>Build your page</h3><p>Sports, rating, services, rates and weekly court times. Choose a grass, clay, hard or night court theme.</p></div></li>
        <li><span className="score">40</span><div><h3>Share one link</h3><p>Every introduction now lands on a page that is distinctly yours, with a one-tap way to reach you.</p></div></li>
        <li className="game"><span className="score">Game</span><div><h3>Get on court</h3><p>Players message you directly. You confirm the session your way.</p></div></li>
      </ol>
    </section>

    <section className="landing-section">
      <div className="final-cta theme-hard">
        <CourtLines className="final-court" />
        <div className="final-copy"><div className="meta">Match point</div><h2>Your next student is<br />one link away.</h2></div>
        <Link href="/signup" className="button primary large">Build my page →</Link>
      </div>
    </section>

    <footer className="site-footer">
      <span className="brand"><BallMark size={22} /><span>courtsidebio</span></span>
      <span className="meta">Made for tennis, pickleball and padel pros. No marketplace. No booking fees.</span>
      <span className="footer-links"><Link href="/demo">Demo</Link><Link href="/login">Sign in</Link></span>
    </footer>
  </main>;
}
