import { useEffect, useRef, useState } from 'react';
import './landing.css';

const APP = '#/app';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Mark() {
  return <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.3"/><circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M16 16 27 5M16 3v4M3 16h4M16 25v4M25 16h4" stroke="currentColor" strokeWidth="1.3"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/><circle cx="24" cy="8" r="2.5" fill="var(--lp-orange)"/></svg>;
}

// An illustrative transfer network, kept separate from measured engine output.
const nodes = Array.from({ length: 62 }, (_, i) => {
  const angle = i * 2.399963;
  const radius = 43 + Math.sqrt(i / 62) * 216;
  return { x: 322 + Math.cos(angle) * radius, y: 280 + Math.sin(angle) * radius * .83, flagged: i % 5 === 0 || i % 7 === 0 };
});
const hub = { x: 377, y: 270 };
function Network({ paymentOnly = false, large = false }: { paymentOnly?: boolean; large?: boolean }) {
  const uid = large ? 'hero' : 'demo';
  return <svg className={`lp-network ${paymentOnly ? 'payment-only' : ''}`} viewBox="0 0 650 555" role="img" aria-label={paymentOnly ? 'Illustrative payment view: only purchase accounts are highlighted' : 'Illustrative transfer network tracing suspicious accounts to a central hub'}>
    <defs><radialGradient id={`${uid}-glow`}><stop stopColor="#e96541" stopOpacity=".1"/><stop offset="1" stopColor="#e96541" stopOpacity="0"/></radialGradient></defs>
    <circle cx={hub.x} cy={hub.y} r="200" fill={`url(#${uid}-glow)`} className="lp-hub-glow"/>
    {[100, 180, 250].map(r => <circle key={r} cx="322" cy="280" r={r} className="lp-orbit"/>)}
    <path d="M322 16v526M32 280h585" className="lp-crosshair"/>
    {nodes.map((n, i) => {
      const target = n.flagged ? hub : nodes[(i + 9) % nodes.length];
      const d = `M${n.x} ${n.y} Q${(n.x + target.x) / 2 - 14} ${(n.y + target.y) / 2 + 12} ${target.x} ${target.y}`;
      return <g key={`e${i}`} className={n.flagged ? 'lp-trace' : 'lp-normal-edge'}><path id={`${uid}-path-${i}`} d={d}/>{n.flagged && <circle r="2.3" className="lp-packet"><animateMotion dur={`${3 + i % 4}s`} begin={`${-(i % 6)}s`} repeatCount="indefinite" path={d}/></circle>}</g>;
    })}
    {nodes.map((n, i) => <g key={i} className={n.flagged ? 'lp-suspicious-node' : 'lp-clean-node'}><circle cx={n.x} cy={n.y} r={n.flagged ? 5 : 3 + i % 3}/>{n.flagged && i % 2 === 0 && <circle cx={n.x} cy={n.y} r="10" className="lp-node-halo"/>}</g>)}
    <g className="lp-hub"><circle cx={hub.x} cy={hub.y} r="30" className="lp-hub-ring"/><circle cx={hub.x} cy={hub.y} r="19"/><path d={`M${hub.x-6} ${hub.y}h12m-6-6v12`} stroke="white" strokeWidth="1.5"/><text x={hub.x} y={hub.y+49} textAnchor="middle">CASH-OUT HUB</text></g>
    <g className="lp-svg-label"><text x="43" y="75">VALUE FLOW / 001</text><text x="44" y="505">TRADES · GIFTS · MARKETPLACE</text><text x="518" y="505">LIVE TRACE</text></g>
  </svg>;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const items = ref.current?.querySelectorAll('[data-reveal]');
    if (!items) return;
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
    }), { threshold: .12 });
    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Landing() {
  const [paymentOnly, setPaymentOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const root = useReveal();
  return <div className="lp" ref={root}>
    <a className="lp-skip" href="#main-content">Skip to content</a>
    <header className="lp-header">
      <a className="lp-brand" href="#" aria-label="Fraud Radar home"><Mark/><span>fraud<span className="lp-brand-light">radar</span><sup>↗</sup></span></a>
      <nav id="mobile-navigation" className={menuOpen ? 'lp-nav is-open' : 'lp-nav'} aria-label="Main navigation">
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="#inside" onClick={() => setMenuOpen(false)}>Inside the radar</a>
        <a href="#approach" onClick={() => setMenuOpen(false)}>Our approach</a>
      </nav>
      <a className="lp-nav-cta" href={APP}>Open the radar <Arrow diagonal/></a>
      <button className="lp-menu" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation" onClick={() => setMenuOpen(v => !v)}><span/><span/></button>
    </header>

    <main id="main-content">
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow lp-entrance"><span className="lp-status-dot"/> POST-PURCHASE INTELLIGENCE</div>
          <h1 className="lp-entrance lp-delay-1">The payment<br/>cleared.<br/><span className="lp-serif">The risk didn’t.</span></h1>
          <p className="lp-hero-description lp-entrance lp-delay-2">Follow the value beyond the transaction.<br/>Uncover the accounts, connections, and cash-out<br className="lp-desktop-break"/> rings hiding inside your game economy.</p>
          <div className="lp-hero-actions lp-entrance lp-delay-3"><a className="lp-button lp-button-dark" href={APP}>Follow the money <Arrow diagonal/></a><a className="lp-text-link" href="#inside"><span className="lp-play">▷</span> See what others miss</a></div>
          <div className="lp-hero-note lp-entrance lp-delay-3"><span>YOUR EVENT LOG.</span><span>THE WHOLE PICTURE.</span></div>
        </div>
        <div className="lp-hero-art lp-entrance lp-delay-2">
          <div className="lp-art-top"><span><i/> SIGNAL DETECTED</span><span>01 / VALUE IN MOTION</span></div>
          <Network large/>
          <div className="lp-source-label"><span className="lp-tiny-square"/> PAYMENT APPROVED<small>The story starts here.</small></div>
          <div className="lp-finding"><span className="lp-finding-icon"><Arrow diagonal/></span><div><span>Connected. Not coincidental.</span><p>Many accounts. One destination.</p></div><span className="lp-finding-dot"/></div>
          <span className="lp-illustration-label">ILLUSTRATIVE TRANSFER NETWORK</span>
        </div>
      </section>

      <div className="lp-context-bar"><span>BUILT FOR ECONOMIES THAT MOVE.</span><div><span>Virtual currency</span><i>↗</i><span>In-game items</span><i>↗</i><span>Digital keys</span><i>↗</i><span>Player marketplaces</span></div></div>

      <section className="lp-thesis lp-section" id="how-it-works">
        <div className="lp-section-label" data-reveal><span>01 — THE BLIND SPOT</span><span>LOOK A LITTLE FURTHER ↘</span></div>
        <div className="lp-thesis-grid" data-reveal><h2>Fraud doesn’t end<br/>at <span className="lp-serif">“payment approved.”</span></h2><p>Stolen-card value keeps moving. From a purchase to a gift, through a dozen accounts, into a cash-out hub.<br/><br/>A transaction is a moment.<br/><strong>A money trail tells the story.</strong></p></div>
        <div className="lp-flow" data-reveal>
          <div className="lp-flow-step"><span className="lp-step-num">01</span><div className="lp-flow-symbol lp-card-symbol"><span/><i/><b/></div><h3>The purchase</h3><p>A payment clears.<br/>In-game value enters the system.</p><span className="lp-flow-tag">PAYMENT-TIME VIEW ENDS HERE</span></div>
          <div className="lp-flow-step"><span className="lp-step-num">02</span><div className="lp-flow-symbol lp-transfer-symbol"><i/><i/><i/><i/><span>↗</span></div><h3>The transfers</h3><p>Trades. Gifts. Resales.<br/>The value moves, the trail gets longer.</p><span className="lp-flow-tag orange">OUR INVESTIGATION BEGINS</span></div>
          <div className="lp-flow-step"><span className="lp-step-num">03</span><div className="lp-flow-symbol lp-target-symbol"><i/><i/><i/><b/></div><h3>The destination</h3><p>Separate accounts converge.<br/>A hidden ring comes into view.</p><span className="lp-flow-tag">THE CONNECTION THAT MATTERS</span></div>
        </div>
      </section>

      <section className="lp-product" id="inside">
        <div className="lp-section-label" data-reveal><span>02 — INSIDE THE RADAR</span><span><i className="lp-status-dot"/> INTERACTIVE EXPLORER</span></div>
        <div className="lp-product-heading" data-reveal><h2>Same activity.<br/><span className="lp-serif">A different picture.</span></h2><div><p>Switch perspectives.<br/>See what a payment flag leaves out.</p><div className="lp-view-toggle" role="group" aria-label="Network perspective"><button aria-pressed={paymentOnly} onClick={() => setPaymentOnly(true)}>At payment</button><button aria-pressed={!paymentOnly} onClick={() => setPaymentOnly(false)}>After payment <span>↗</span></button></div></div></div>
        <div className="lp-product-window" data-reveal>
          <div className="lp-window-toolbar"><div><span className="lp-window-dot"/><span className="lp-window-dot"/><span className="lp-window-dot"/></div><span>FRAUD RADAR / INVESTIGATION WORKSPACE</span><span className="lp-window-badge">ILLUSTRATIVE PREVIEW</span></div>
          <div className="lp-workspace">
            <div className="lp-workspace-rail"><Mark/><span className="active">⌘</span><span>◷</span><span>⊞</span><span className="lp-rail-bottom">FR</span></div>
            <div className="lp-workspace-graph"><div className="lp-workspace-top"><span>Account network</span><span><i/> {paymentOnly ? 'PAYMENT SIGNALS' : 'VALUE-FLOW SIGNALS'}</span></div><Network paymentOnly={paymentOnly}/><div className="lp-graph-legend"><span><i/> {paymentOnly ? 'Flagged purchase' : 'Connected activity'}</span><span>○ Cash-out candidate</span></div><div className="lp-graph-controls" aria-hidden="true">+<hr/>−</div></div>
            <div className="lp-case-panel" aria-live="polite"><div className="lp-case-top"><span>CASE / 001</span><span className={paymentOnly ? 'lp-case-badge muted' : 'lp-case-badge'}>{paymentOnly ? 'PARTIAL VIEW' : 'REVIEW SUGGESTED'}</span></div><h3>{paymentOnly ? 'A flagged purchase.' : 'A pattern worth investigating.'}</h3><p>{paymentOnly ? 'You can see the source transaction. The accounts receiving value later remain outside this view.' : 'Value from flagged purchases flows through connected accounts toward the same destination.'}</p><div className="lp-evidence-row"><span>Source signal</span><strong>Flagged payment</strong></div><div className="lp-evidence-row"><span>Transfer paths</span><strong className={!paymentOnly ? 'orange' : ''}>{paymentOnly ? 'Outside view' : 'Connected'}</strong></div><div className="lp-evidence-row"><span>Cash-out candidate</span><strong className={!paymentOnly ? 'orange' : ''}>{paymentOnly ? 'Outside view' : 'Identified'}</strong></div><div className="lp-analyst-note"><span>✳ &nbsp; THE ANALYST HAS THE FINAL WORD</span><p>Evidence first. An explanation to help.<br/>Never an automatic ban.</p></div><a href={APP} className="lp-case-link">Investigate your own data <Arrow/></a></div>
          </div>
        </div>
        <div className="lp-product-foot"><span>A preview of the perspective. Open the radar to analyze your event log.</span><a href={APP}>Enter the workspace <Arrow diagonal/></a></div>
      </section>

      <section className="lp-method lp-section" id="approach">
        <div className="lp-section-label" data-reveal><span>03 — SIGNAL, NOT SPECULATION</span><span>BUILT TO EXPLAIN ITSELF</span></div>
        <div className="lp-method-intro" data-reveal><h2>Complex underneath.<br/><span className="lp-serif">Clear where it counts.</span></h2><p>Graph intelligence finds the connections.<br/>Human judgment decides what they mean.</p></div>
        <div className="lp-method-grid">
          <article data-reveal><div className="lp-mini-bars"><i style={{height:'82%'}}/><i style={{height:'52%'}}/><i style={{height:'42%'}}/><i style={{height:'32%'}}/><span>40 / 25 / 20 / 15</span></div><span className="lp-card-index">01 / TRACE</span><h3>Four signals.<br/>One clearer picture.</h3><p>Tainted value, account velocity, transfer imbalance, and community risk. Transparent weights, not a mysterious verdict.</p></article>
          <article data-reveal><div className="lp-mini-cluster"><i/><i/><i/><i/><i/><i/><i/><span/></div><span className="lp-card-index">02 / CONNECT</span><h3>Find the ring.<br/>Not just the account.</h3><p>Community detection connects related activity, surfacing the group behind a transaction and the hubs receiving its value.</p></article>
          <article data-reveal><div className="lp-mini-review"><span>Evidence reviewed</span><i/><i/><b>↗ Your decision</b></div><span className="lp-card-index">03 / UNDERSTAND</span><h3>Machine clarity.<br/>Human control.</h3><p>Claude turns measured evidence into a readable case. Adjust sensitivity, inspect the signals, and make the call yourself.</p></article>
        </div>
        <div className="lp-honesty" data-reveal><div><span className="lp-honesty-mark">*</span><h3>Good intelligence<br/>knows its limits.</h3></div><p>Built and evaluated on synthetic data. Our methods, scoring weights, and limitations are open. Real-world validation is the next step—not a claim we’ve already made.</p><a href="https://github.com/xsolla-baku-gametech-hackathon/team-UNECom/blob/main/docs/accuracy.md" target="_blank" rel="noreferrer">Read the evaluation <Arrow diagonal/></a></div>
      </section>

      <section className="lp-final" data-reveal><div className="lp-final-orbit" aria-hidden="true"><i/><i/><i/><span/></div><div className="lp-eyebrow">THE TRAIL IS ALREADY THERE.</div><h2>Let’s see where<br/><span className="lp-serif">the value went.</span></h2><p>Bring your event log. We’ll connect the dots.</p><a className="lp-button lp-button-dark" href={APP}>Open Fraud Radar <Arrow diagonal/></a><span className="lp-final-note">CSV OR JSON &nbsp; / &nbsp; NO SIGN-UP REQUIRED</span></section>
    </main>

    <footer className="lp-footer"><a className="lp-brand" href="#"><Mark/><span>fraud<span className="lp-brand-light">radar</span></span></a><span>Follow the value. Find the pattern.</span><div><a href="https://github.com/xsolla-baku-gametech-hackathon/team-UNECom" target="_blank" rel="noreferrer">Built in the open <Arrow diagonal/></a><span>© 2026 TEAM UNECOM</span></div></footer>
  </div>;
}
