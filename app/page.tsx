import Link from "next/link";

const stats = [
  { label: "Nearby chargers", value: "08", note: "Demo locations around Pune" },
  { label: "Platform rate", value: "₹14", note: "per kWh · fixed rate" },
  { label: "Your rating", value: "—", note: "Complete a session to get rated" }
];
const chargers = [
  { name: "Baner Community Point", area: "Baner, Pune", type: "Type 2 · AC", power: "7.2 kW", distance: "1.2 km", score: 96 },
  { name: "Aundh Green Parking", area: "Aundh, Pune", type: "CCS2 · DC", power: "30 kW", distance: "2.4 km", score: 91 },
  { name: "Balewadi Neighbourhood", area: "Balewadi, Pune", type: "Type 2 · AC", power: "11 kW", distance: "3.1 km", score: 88 }
];

export default function Home() {
  return <main className="app-shell">
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="brand-mark">k</span><span>Kilari<small>COMMUNITY CHARGING</small></span></Link>
      <div className="workspace-label">DRIVER WORKSPACE</div>
      <nav className="nav">
        <a className="nav-link active" href="#overview"><span>⌂</span> Overview</a>
        <a className="nav-link" href="#find"><span>⌕</span> Find chargers</a>
        <a className="nav-link" href="#route"><span>↗</span> Smart route</a>
        <a className="nav-link" href="#bookings"><span>▤</span> My bookings</a>
        <a className="nav-link" href="#ratings"><span>☆</span> Ratings</a>
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><span className="help-icon">✦</span><b>Need a hand?</b><p>Ask Kilari AI for help finding your next charge.</p><button className="btn btn-light" onClick={() => {}}>Open assistant ↗</button></div>
        <div className="profile-mini"><div className="avatar">D</div><div><b>Demo driver</b><small>Demo profile</small></div><span className="dots">···</span></div>
      </div>
    </aside>

    <section className="main-area" id="overview">
      <header className="topbar"><div><span className="crumb">Workspace</span><span className="slash">/</span><b>Overview</b></div><div className="top-actions"><span className="demo-pill"><i/> Demo data</span><button className="icon-button" aria-label="Notifications">♧<em>2</em></button><div className="avatar avatar-small">D</div></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow">SATURDAY, OCTOBER 25</div><h1>Good morning, Driver <span>✳</span></h1><p className="subheading">Find a reliable community charger and get back on the road.</p></div><button className="btn btn-primary" onClick={() => document.getElementById("find")?.scrollIntoView({behavior:"smooth"})}>＋ Find a charger</button></div>
        <div className="demo-notice"><span className="notice-icon">i</span><div><b>You're exploring Kilari demo mode</b><p>Sample Pune locations and activity are shown. Nothing is saved and no payment is taken.</p></div><span className="notice-close">×</span></div>
        <div className="stats-grid">{stats.map(s => <article className="stat-card" key={s.label}><div className="stat-top"><span>{s.label}</span><span className="stat-icon">↗</span></div><strong>{s.value}</strong><p>{s.note}</p></article>)}</div>
        <div className="section-heading" id="find"><div><div className="eyebrow">YOUR NEXT STOP</div><h2>Chargers picked for you</h2><p>Ranked by Kilari match: distance, cost, route, owner and health.</p></div><a className="text-link" href="#all-chargers">View all chargers ↗</a></div>
        <div className="priority-row"><span>Prioritise</span><button className="priority active">✦ Balanced</button><button className="priority">⌖ Closest</button><button className="priority">₹ Lowest price</button><button className="priority">↗ Easiest route</button><button className="priority">♡ Best owner</button></div>
        <div className="charger-list" id="all-chargers">{chargers.map((c, i) => <article className="charger-card" key={c.name}>
          <div className={`charger-art art-${i+1}`}><div className="charger-illustration"><span className="bolt">ϟ</span><span className="charger-screen"/><span className="charger-base"/></div><span className="available"><i/> Available demo</span></div>
          <div className="charger-info"><div className="charger-title-row"><div><h3>{c.name}</h3><p>⌖ {c.area}</p></div><div className="score"><strong>{c.score}</strong><small>KILARI MATCH</small></div></div><div className="specs"><span>ϟ {c.type}</span><span>◴ {c.power}</span><span>⌖ {c.distance}</span></div><div className="score-bars"><span>Distance <b>{c.score-2}</b></span><span>Health <b>90</b></span><span>Owner <b>92</b></span></div><div className="charger-footer"><div><strong>₹14 <small>/ kWh</small></strong><p>Demo estimate · final charge depends on energy used</p></div><button className="btn btn-primary btn-sm" onClick={() => alert("Demo only — booking is not connected yet.")}>View charger ↗</button></div></div>
        </article>)}</div>
        <div className="bottom-grid"><article className="panel route-panel" id="route"><div className="panel-heading"><div><div className="eyebrow">PLAN AHEAD</div><h2>Smart route</h2></div><span className="round-icon">↗</span></div><div className="route-map"><div className="map-grid"/><div className="route-line"/><span className="map-pin pin-a">⌖</span><span className="map-pin pin-b">ϟ</span><span className="map-pin pin-c">☕</span><div className="map-label label-a">You</div><div className="map-label label-b">Charger</div><div className="map-label label-c">Cafe</div><span className="map-tag">DEMO ROUTE</span></div><div className="route-details"><div><b>Baner Community Point</b><p>Estimated route · 1.2 km away</p></div><button className="btn btn-secondary" onClick={() => alert("Demo route estimate only.")}>Explore route</button></div></article>
          <article className="panel ai-panel"><div className="panel-heading"><div><div className="eyebrow purple">KILARI INTELLIGENCE</div><h2>Your AI co-pilot</h2></div><span className="ai-spark">✦</span></div><p className="ai-copy">Get clear answers about charging, connectors, booking steps and Kilari policies.</p><div className="ai-message"><span className="ai-avatar">✦</span><div><b>Hi there! 👋</b><p>I can help you choose a charger. What would you like to know?</p></div></div><div className="quick-questions"><button onClick={() => alert("Rules assistant will be connected in a later phase.")}>Which connector fits my EV?</button><button onClick={() => alert("Rules assistant will be connected in a later phase.")}>How does payment work?</button></div><div className="chat-input"><span>Ask Kilari anything…</span><button aria-label="Send message" onClick={() => alert("AI chat is not connected yet.")}>↑</button></div><small className="ai-disclaimer">AI can make mistakes. It cannot approve bookings or payments.</small></article></div>
        <footer className="footer"><span>© 2026 Kilari · Charge Today. Go Further.</span><span>Built for community energy <b>✳</b></span></footer>
      </div>
    </section>
  </main>;
}