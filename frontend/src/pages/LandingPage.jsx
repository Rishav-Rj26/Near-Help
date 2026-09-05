import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function FadeIn({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar({ onSignIn, onSignUp, isLoggedIn, onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0d14]/75 backdrop-blur-xl border-b border-primary/10 shadow-lg' : 'bg-transparent'}`}>
      <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <a href="#" onClick={(e) => { e.preventDefault(); }} className="flex items-center gap-2 text-2xl font-bold text-on-surface tracking-tight hover:text-primary transition-colors">
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-amber-500 via-sky-400 to-indigo-500 flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-[#0a0d14] rounded-[5px] flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              </div>
            </div>
            <span>NearHelp</span>
          </a>
          <div className="hidden md:flex gap-6 text-sm items-center">
            <a href="#how-it-works" className="text-primary font-semibold border-b-2 border-primary pb-1 hover:bg-white/5 transition-colors px-2 rounded-t">How it works</a>
            <a href="#features" className="text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors px-2 py-1 rounded">Features</a>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MESH LIVE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button onClick={onGetStarted} className="glossy-btn glossy-btn-amber px-4 py-2 rounded-lg text-sm font-bold transition-transform active:scale-95 flex items-center gap-1">
              Open HUD
            </button>
          ) : (
            <>
              <button onClick={onSignIn} className="glossy-btn glossy-btn-ghost px-4 py-2 rounded-lg text-sm text-on-surface hover:text-white transition-colors">
                Sign in
              </button>
              <button onClick={onSignUp} className="glossy-btn glossy-btn-amber px-4 py-2 rounded-lg text-sm font-bold transition-transform active:scale-95 flex items-center gap-1">
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section with Orbital Wireframe Orb & Floating HUD Chips      */
/* ------------------------------------------------------------------ */

function HeroSection({ onGetStarted, isLoggedIn }) {
  return (
    <section className="relative pt-8 md:pt-16 pb-12 flex flex-col items-center text-center">
      {/* Status Tag */}
      <FadeIn delay={100}>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/70 border border-primary/30 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-mono text-xs tracking-wider uppercase text-sky-200 font-semibold">LIVE RESPONSE NETWORK · DECENTRALIZED</span>
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <h1 className="text-4xl md:text-5xl lg:text-display-lg max-w-4xl text-white font-extrabold tracking-tight mb-4 drop-shadow-sm leading-[1.1]">
          The fastest help is the neighbor you've never met.
        </h1>
      </FadeIn>

      <FadeIn delay={350}>
        <p className="text-lg text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
          NearHelp activates qualified responders in your immediate community within seconds, establishing zero-latency mutual aid before official services arrive.
        </p>
      </FadeIn>

      {/* CTA Actions */}
      <FadeIn delay={500}>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-20 mb-12">
          <button onClick={onGetStarted} className="glossy-btn glossy-btn-amber px-8 py-3.5 rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            {isLoggedIn ? 'Open HUD' : 'Get started'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <a href="#how-it-works" className="glossy-btn glossy-btn-ghost px-8 py-3.5 rounded-xl text-lg flex items-center justify-center gap-2 text-on-surface hover:border-primary/40">
            <span className="material-symbols-outlined text-primary text-base">radar</span>
            See how it works
          </a>
        </div>
      </FadeIn>

      {/* Tactical Wireframe Planetary Orb Canvas */}
      <div className="relative w-full max-w-4xl h-[340px] md:h-[440px] flex items-center justify-center pointer-events-none select-none">
        {/* Ambient Core Glow */}
        <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-sky-600/30 via-indigo-600/25 to-amber-500/20 blur-3xl -z-10" />

        {/* Vector Sphere Wireframe & Orbital Rings */}
        <div className="relative w-72 h-72 md:w-96 md:h-96 mesh-orb-glow flex items-center justify-center">
          <svg className="w-full h-full drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]" fill="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Ring */}
            <circle cx="200" cy="200" r="180" stroke="rgba(181, 200, 227, 0.22)" strokeDasharray="4 4" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="160" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" />
            {/* Latitudes & Longitudes Wireframe Mesh */}
            <ellipse cx="200" cy="200" rx="160" ry="110" stroke="rgba(125, 211, 252, 0.45)" strokeWidth="1.2" />
            <ellipse cx="200" cy="200" rx="160" ry="55" stroke="rgba(186, 230, 253, 0.35)" strokeWidth="1" />
            <ellipse cx="200" cy="200" rx="160" ry="15" stroke="rgba(245, 158, 11, 0.6)" strokeDasharray="3 3" strokeWidth="1.2" />
            <ellipse cx="200" cy="200" rx="110" ry="160" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1.2" />
            <ellipse cx="200" cy="200" rx="55" ry="160" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="1" />
            {/* Orbital tilted ellipses representing signal arcs */}
            <ellipse cx="200" cy="200" rx="175" ry="70" stroke="rgba(56, 189, 248, 0.65)" strokeWidth="1.5" transform="rotate(-32 200 200)" />
            <ellipse cx="200" cy="200" rx="185" ry="85" stroke="rgba(245, 158, 11, 0.5)" strokeDasharray="6 4" strokeWidth="1.2" transform="rotate(28 200 200)" />
            {/* Central Glowing Signal Core */}
            <circle cx="200" cy="200" fill="url(#coreGlow)" r="28" />
            <circle cx="200" cy="200" fill="#ffffff" r="8" />
            <circle cx="200" cy="200" opacity="0.8" r="14" stroke="#38bdf8" strokeWidth="2" fill="none" />
            {/* Connection Signal Nodes */}
            <circle cx="95" cy="140" fill="#38bdf8" r="4.5" />
            <circle cx="95" cy="140" opacity="0.6" r="9" stroke="#38bdf8" strokeWidth="1" fill="none" />
            <circle cx="295" cy="175" fill="#f59e0b" r="5" />
            <circle cx="295" cy="175" opacity="0.6" r="10" stroke="#f59e0b" strokeWidth="1" fill="none" />
            <circle cx="230" cy="90" fill="#60a5fa" r="4" />
            <circle cx="160" cy="300" fill="#38bdf8" r="4.5" />
            <circle cx="310" cy="270" fill="#a78bfa" r="3.5" />
            {/* Intersecting telemetry lines */}
            <line stroke="rgba(56, 189, 248, 0.45)" strokeDasharray="2 2" strokeWidth="1" x1="95" x2="200" y1="140" y2="200" />
            <line stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1" x1="295" x2="200" y1="175" y2="200" />
            <line stroke="rgba(96, 165, 250, 0.4)" strokeDasharray="4 2" strokeWidth="1" x1="230" x2="200" y1="90" y2="200" />
            <defs>
              <radialGradient cx="0" cy="0" gradientTransform="translate(200 200) rotate(90) scale(32)" gradientUnits="userSpaceOnUse" id="coreGlow" r="1">
                <stop stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="0.6" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="1" stopColor="#0e131d" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Floating Glass Metric HUD Chips */}
        <FadeIn delay={700} className="pointer-events-auto absolute -top-2 left-2 md:left-8">
          <div className="glass-hud-chip rounded-xl p-3.5 flex items-center gap-3 text-left shadow-2xl border border-sky-400/30">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-lg">timer</span>
            </div>
            <div>
              <p className="text-[11px] text-sky-300 uppercase tracking-wider font-bold">Avg Response Time</p>
              <p className="font-mono text-base font-bold text-white">3.2m <span className="text-xs text-emerald-400 font-normal">(-68% vs 911)</span></p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={900} className="pointer-events-auto absolute top-20 right-2 md:right-6">
          <div className="glass-hud-chip rounded-xl p-3.5 flex items-center gap-3 text-left shadow-2xl border border-amber-400/30">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </div>
            <div>
              <p className="text-[11px] text-amber-200 uppercase tracking-wider font-bold">Active Verified</p>
              <p className="font-mono text-base font-bold text-white">14.2k <span className="text-xs text-sky-300 font-normal">Citizens</span></p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={1100} className="pointer-events-auto absolute bottom-2 left-4 md:left-24">
          <div className="glass-hud-chip rounded-xl p-3.5 flex items-center gap-3 text-left shadow-2xl border border-sky-400/30">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-lg">lock_clock</span>
            </div>
            <div>
              <p className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold">Encrypted Dispatch</p>
              <p className="font-mono text-base font-bold text-white">Zero-Knowledge SOS</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Preview: Tactical Radar & Incident Card                   */
/* ------------------------------------------------------------------ */

function ProductPreviewSection() {
  return (
    <section id="features" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Left: Futuristic Vector Radar Perimeter Map */}
      <div className="lg:col-span-7 glass-tactical rounded-2xl overflow-hidden relative min-h-[420px] flex flex-col justify-between p-5 grid-tactical">
        {/* Tactical Header */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-sky-200">RADAR FREQUENCY: 915 MHZ</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant bg-surface-container-low/70 px-2.5 py-1 rounded border border-outline-variant/40">
            <span>GRID SEC: 44-ALPHA</span>
            <span className="text-amber-400 font-bold">2 RESPONDERS IN RANGE</span>
          </div>
        </div>

        {/* Center Tactical Radar Mesh */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-80 h-80 rounded-full border border-sky-500/20 flex items-center justify-center">
            <div className="absolute w-64 h-64 rounded-full border border-sky-500/25" />
            <div className="absolute w-44 h-44 rounded-full border border-sky-500/30" />
            <div className="absolute w-24 h-24 rounded-full border border-sky-500/40 bg-sky-500/5" />
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
            <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-sky-400/30 to-transparent" />
            {/* Radar Sweep */}
            <div className="absolute inset-0 radar-sweeper flex items-center justify-center">
              <div className="w-1/2 h-1/2 origin-bottom-right" style={{ background: 'conic-gradient(from 0deg at 100% 100%, rgba(56, 189, 248, 0.25) 0deg, transparent 60deg)' }} />
            </div>
            {/* Central Incident Pin */}
            <div className="relative z-20 flex flex-col items-center">
              <div className="w-11 h-11 bg-amber-500 rounded-full rounded-br-none rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)] border border-amber-200/50">
                <span className="material-symbols-outlined -rotate-45 text-[#120e06] text-xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              </div>
              <div className="w-4 h-1.5 bg-amber-500/40 rounded-[50%] mt-1 blur-[1px]" />
            </div>
            {/* Ping Node 1 */}
            <div className="absolute top-16 right-20 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-400 ring-4 ring-sky-400/20 animate-pulse" />
              <span className="font-mono text-[11px] text-sky-200 bg-surface-container-lowest/80 px-2 py-0.5 rounded border border-sky-400/30">Sarah J. (300m)</span>
            </div>
            {/* Ping Node 2 */}
            <div className="absolute bottom-16 left-24 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <span className="font-mono text-[11px] text-emerald-200 bg-surface-container-lowest/80 px-2 py-0.5 rounded border border-emerald-400/30">Station AED #04</span>
            </div>
          </div>
        </div>

        {/* Bottom Live Status */}
        <div className="z-10 mt-auto pt-4">
          <div className="glass-tactical rounded-xl p-3 border border-sky-500/25 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div>
                <p className="text-xs text-primary uppercase font-bold tracking-wider">Live Response Perimeter</p>
                <p className="font-mono text-xs text-white">Locating nearest verified AED &amp; CPR certified citizen...</p>
              </div>
            </div>
            <span className="font-mono text-xs text-sky-400 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">GPS LOCK 99.8%</span>
          </div>
        </div>
      </div>

      {/* Right: Tactical Incident Summary Card */}
      <div className="lg:col-span-5 glass-tactical rounded-2xl p-6 flex flex-col justify-between gap-6 border-t border-sky-400/30 shadow-2xl">
        <div>
          {/* Incident Alert Banner */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-xs uppercase tracking-wider font-bold">
                MEDICAL PRIORITY 1
              </span>
            </div>
            <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              00:42 ELAPSED
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Cardiac Event</h3>
          <p className="text-base text-sky-200/80 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-sky-400">near_me</span>
            <span>300m away · Floor 4, Suite 402</span>
          </p>
        </div>

        {/* Active Responder Card */}
        <div className="bg-surface-container-low/90 rounded-xl p-3.5 flex items-center gap-3 border border-sky-400/20 shadow-inner">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg border-2 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]">
              SJ
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0d14] flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-white">check</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base text-white font-bold truncate">Sarah Jenkins</p>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">RN</span>
            </div>
            <p className="font-mono text-xs text-amber-400 font-medium">ETA: 1 min · En Route</p>
          </div>
          <div className="glossy-btn bg-primary-container px-3 py-1.5 rounded-lg border border-primary/40 shadow-sm">
            <span className="text-xs text-sky-200 font-bold tracking-wider">CPR CERT</span>
          </div>
        </div>

        {/* Dispatch Logs Console */}
        <div className="bg-surface-container-lowest/90 p-3.5 rounded-xl border border-outline-variant/30 font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between text-on-surface-variant border-b border-white/5 pb-1">
            <span>TELEMETRY LOGS</span>
            <span className="text-emerald-400">DISPATCH ENCRYPTED</span>
          </div>
          <p className="text-sky-300/90">&gt; SOS packet verified via zero-knowledge mesh</p>
          <p className="text-sky-300/90">&gt; Auto-dispatched AED map routing to Sarah J.</p>
          <p className="text-amber-400">&gt; Building security notified: Elevator 2 unlocked</p>
          <p className="text-on-surface-variant">&gt; Standby for vitals input telemetry...</p>
        </div>

        <button className="w-full glossy-btn glossy-btn-amber py-3 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-lg">
          <span className="material-symbols-outlined text-lg">chat</span>
          Direct Encrypted Channel
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Telemetry Protocol (How It Works)                                 */
/* ------------------------------------------------------------------ */

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Trigger",
      icon: "touch_app",
      description: "One tap initiates an ultra-low latency local SOS broadcast to the nearest grid.",
      borderColor: "border-sky-400/30 hover:border-sky-400/50",
      hoverGlow: "group-hover:border-sky-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]",
      numberColor: "text-sky-300",
    },
    {
      number: "02",
      title: "Broadcast",
      icon: "sensors",
      description: "Alerts ping nearby qualified responders within 500 meters instantly.",
      borderColor: "border-sky-400/30 hover:border-sky-400/50",
      hoverGlow: "group-hover:border-sky-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]",
      numberColor: "text-sky-300",
    },
    {
      number: "03",
      title: "Respond",
      icon: "navigation",
      description: "Available neighbors accept and receive real-time indoor or street guidance.",
      borderColor: "border-amber-400/30 hover:border-amber-400/50",
      hoverGlow: "group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]",
      numberColor: "text-amber-300",
    },
    {
      number: "04",
      title: "Assist",
      icon: "health_and_safety",
      description: "Critical aid and AED equipment arrive 5-8 minutes before municipal sirens.",
      borderColor: "border-emerald-400/30 hover:border-emerald-400/50",
      hoverGlow: "group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]",
      numberColor: "text-emerald-300",
    },
  ];

  return (
    <section id="how-it-works" className="flex flex-col gap-10 mt-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary mb-2">
          <span className="material-symbols-outlined text-sm">hub</span>
          <span>TELEMETRY PROTOCOL</span>
        </div>
        <h2 className="text-3xl font-bold text-white">Rapid Deployment Protocol</h2>
        <p className="text-base text-on-surface-variant mt-2">Engineered for sub-minute response using localized peer discovery.</p>
      </div>

      {/* Connected Telemetry Track */}
      <div className="relative pt-6 pb-2">
        <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-sky-500/20 via-sky-400 to-amber-500/40 z-0" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 150}>
              <div className={`glass-tactical rounded-2xl p-6 flex flex-col items-center text-center group ${step.borderColor} transition-all duration-300`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-surface-container border border-sky-400/30 ${step.hoverGlow} transition-all`}>
                  <span className={`font-mono text-base font-bold ${step.numberColor}`}>{step.number}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span>{step.title}</span>
                  <span className={`material-symbols-outlined text-sm ${step.numberColor}`}>{step.icon}</span>
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust & Security Section                                          */
/* ------------------------------------------------------------------ */

function SecuritySection() {
  return (
    <section id="security" className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-6 pt-16 border-t border-primary/10">
      <FadeIn delay={100}>
        <div className="glass-tactical rounded-2xl p-6 flex flex-col gap-3 h-full">
          <div className="w-12 h-12 rounded-xl glossy-btn bg-primary-container flex items-center justify-center shadow-lg border border-primary/30">
            <span className="material-symbols-outlined text-sky-400">verified_user</span>
          </div>
          <h4 className="text-lg font-bold text-white">Skill-matched responders</h4>
          <p className="text-base text-on-surface-variant leading-relaxed">Our protocol filters alerts based on certified credentials (CPR, Stop The Bleed, BLS) ensuring the right person arrives.</p>
        </div>
      </FadeIn>

      <FadeIn delay={250}>
        <div className="glass-tactical rounded-2xl p-6 flex flex-col gap-3 h-full">
          <div className="w-12 h-12 rounded-xl glossy-btn bg-secondary-container flex items-center justify-center shadow-lg border border-secondary/20">
            <span className="material-symbols-outlined text-amber-400">history</span>
          </div>
          <h4 className="text-lg font-bold text-white">Rated response history</h4>
          <p className="text-base text-on-surface-variant leading-relaxed">Community trust is anchored in verified reliability records, response latency tracking, and certified peer endorsements.</p>
        </div>
      </FadeIn>

      <FadeIn delay={400}>
        <div className="glass-tactical rounded-2xl p-6 flex flex-col gap-3 h-full">
          <div className="w-12 h-12 rounded-xl glossy-btn bg-surface-container-highest flex items-center justify-center shadow-lg border border-outline-variant/50">
            <span className="material-symbols-outlined text-emerald-400">lock</span>
          </div>
          <h4 className="text-lg font-bold text-white">Anonymous mode, enforced server-side</h4>
          <p className="text-base text-on-surface-variant leading-relaxed">Precise GPS coordinates are cryptographically unlocked only upon accepted dispatch. Personal identities remain shielded.</p>
        </div>
      </FadeIn>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="bg-[#0a0d14] w-full py-16 border-t border-primary/10 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6 md:gap-0">
        <div className="flex items-center gap-2 text-2xl font-bold text-white">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-amber-500 to-sky-400 flex items-center justify-center p-[1px]">
            <div className="w-full h-full bg-[#0a0d14] rounded-[3px] flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-400 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            </div>
          </div>
          <span>NearHelp</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-base">
          <a className="text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">Terms of Service</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">Contact</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">Community Guidelines</a>
        </div>
        <div className="text-base text-on-surface-variant text-sm font-mono">
          © {new Date().getFullYear()} NearHelp Emergency Response. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(user ? '/map' : '/auth');
  };

  return (
    <div className="bg-background text-on-background min-h-screen ambient-cyber-bg antialiased selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden">
      <Navbar
        onSignIn={() => navigate('/auth')}
        onSignUp={() => navigate('/auth')}
        onGetStarted={handleGetStarted}
        isLoggedIn={!!user}
      />
      <main className="pt-[90px] pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-16 md:gap-24 relative z-10">
        <HeroSection onGetStarted={handleGetStarted} isLoggedIn={!!user} />
        <ProductPreviewSection />
        <HowItWorksSection />
        <SecuritySection />
      </main>
      <Footer />
    </div>
  );
}
