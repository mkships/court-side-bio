import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ClaimForm } from "@/components/ClaimForm";
import { BallMark, SportIcon } from "@/components/CourtArt";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";
import { demoProfile } from "@/lib/fixtures";
import { SPORTS } from "@/types/profile";

export default function Home() {
  return <main className="shell landing">
    <SiteHeader />

    <section className="hero">
      <p className="eyebrow"><span className="eyebrow-icons" aria-hidden="true">{SPORTS.map((sport) => <span key={sport}><SportIcon sport={sport} size={15} /></span>)}</span>For tennis, pickleball and padel coaches</p>
      <h1>The link in bio built for coaches</h1>
      <p className="lede">Your rating, lessons, prices and weekly court times on one page. Players message you directly on WhatsApp or email.</p>
      <ClaimForm />
      <p className="hero-note">Free to start. No booking fees. <Link href="/demo">See an example</Link></p>
      <div className="phone">
        <div className="phone-screen" inert aria-hidden="true"><ProfileRenderer profile={demoProfile} preview /></div>
      </div>
    </section>

    <section className="band" aria-labelledby="features-title">
      <div className="band-inner">
        <div className="section-intro">
          <h2 id="features-title">Everything players ask before they book</h2>
          <p>Answer the usual questions once, on a page that looks like your sport.</p>
        </div>

        <div className="feature-row">
          <div className="feature-visual grass" aria-hidden="true">
            <div className="visual-card">
              <dl className="stat-row">
                <div className="stat"><dt>UTR</dt><dd>10.8</dd></div>
                <div className="stat"><dt>DUPR</dt><dd>5.21</dd></div>
                <div className="stat"><dt>Playtomic</dt><dd>5.4</dd></div>
              </dl>
            </div>
          </div>
          <div className="feature-copy"><h3>Your level, up front</h3><p>Show your UTR, DUPR, NTRP or Playtomic rating next to where you played and how long you have coached.</p></div>
        </div>

        <div className="feature-row">
          <div className="feature-visual clay" aria-hidden="true">
            <div className="visual-card">
              <ol className="order-of-play">
                <li><span className="oop-day"><strong>Tue</strong><span className="meta">Nov 18</span></span><span className="oop-slots"><span className="slot is-next">6:00 PM</span><span className="slot">7:00 PM</span></span></li>
                <li><span className="oop-day"><strong>Thu</strong><span className="meta">Nov 20</span></span><span className="oop-slots"><span className="slot">5:00 PM</span></span></li>
                <li><span className="oop-day"><strong>Sat</strong><span className="meta">Nov 22</span></span><span className="oop-slots"><span className="slot">9:00 AM</span><span className="slot">10:00 AM</span></span></li>
              </ol>
            </div>
          </div>
          <div className="feature-copy"><h3>Your court times</h3><p>Set weekly windows once. Players see the next seven days in your timezone and tap a time to ask for it.</p></div>
        </div>

        <div className="feature-row">
          <div className="feature-visual hard" aria-hidden="true">
            <div className="visual-card">
              <span className="bubble">Hi Alex, I found your page and would like a hitting session on Tuesday at 6:00 PM. Are you free?</span>
              <span className="bubble-meta">Sent from WhatsApp</span>
            </div>
          </div>
          <div className="feature-copy"><h3>Messages come to you</h3><p>Inquiries arrive prefilled in WhatsApp or email. No marketplace, no booking fees, nobody in between.</p></div>
        </div>
      </div>
    </section>

    <section className="band tint" aria-labelledby="how-title">
      <div className="band-inner">
        <div className="section-intro"><h2 id="how-title">Live in ten minutes</h2></div>
        <ol className="steps">
          <li><span className="step-num">1</span><h3>Claim your name</h3><p>Pick the link that goes in your Instagram bio, WhatsApp status and on the club noticeboard.</p></li>
          <li><span className="step-num">2</span><h3>Add your details</h3><p>Sports, rating, lessons and prices, weekly court times and a few words from your players.</p></li>
          <li><span className="step-num">3</span><h3>Share it</h3><p>Choose a grass, clay, hard court or night theme, publish, and share one link everywhere.</p></li>
        </ol>
      </div>
    </section>

    <section className="band">
      <div className="final-cta">
        <h2>Your next student is one link away</h2>
        <p>Set up your page for free today.</p>
        <Link href="/signup" className="button large">Get started</Link>
      </div>
    </section>

    <footer className="site-footer">
      <span className="brand"><BallMark size={22} /><span>courtsidebio</span></span>
      <span>Made for tennis, pickleball and padel coaches.</span>
      <span className="footer-links"><Link href="/demo">Demo</Link><Link href="/login">Sign in</Link></span>
    </footer>
  </main>;
}
