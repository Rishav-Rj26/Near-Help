import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

function Navbar({ onGetStarted, isLoggedIn }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-tactical border-b border-white/10 shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          <span className="text-primary font-extrabold text-xl tracking-tighter">NEARHELP</span>
          <div className="hidden sm:flex ml-2 items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            MESH LIVE
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>

        <button
          onClick={onGetStarted}
          className="glossy-btn glossy-btn-amber px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95"
        >
          {isLoggedIn ? 'OPEN HUD' : 'JOIN NETWORK'}
          <span className="material-symbols-outlined text-[18px]">login</span>
        </button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

function HeroSection({ onGetStarted, isLoggedIn }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 ambient-cyber-bg" />
      <div className="absolute inset-0 grid-tactical opacity-30" />
      
      {/* 3D Wireframe Globe/Orb effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-20">
         <div className="absolute inset-0 border-[2px] border-primary/30 rounded-full radar-sweeper" />
         <div className="absolute inset-10 border-[1px] border-primary/20 rounded-full" />
         <div className="absolute inset-20 border-[1px] border-primary/10 rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-left">
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-500/10 mb-6">
              <span className="material-symbols-outlined text-[14px] text-sky-400">satellite_alt</span>
              <span className="text-[11px] font-mono font-bold text-sky-300 tracking-widest uppercase">Decentralized Crisis Network</span>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
              When Seconds Count,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
                The Community Answers.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={350}>
            <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed font-medium">
              A tactical, real-time emergency mesh that bridges the gap between crisis onset and official response. Hyperlocal. Encrypted. Immediate.
            </p>
          </FadeIn>

          <FadeIn delay={500}>
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <button
                onClick={onGetStarted}
                className="glossy-btn glossy-btn-amber px-8 py-4 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95"
              >
                <span>{isLoggedIn ? 'ACTIVATE HUD' : 'BECOME A RESPONDER'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              <a
                href="#how-it-works"
                className="glossy-btn glossy-btn-ghost px-8 py-4 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                <span>HOW IT WORKS</span>
              </a>
            </div>
          </FadeIn>
        </div>

        <div className="flex-1 relative hidden lg:block h-[500px] w-full">
            {/* Floating Glass HUD Metrics */}
            <FadeIn delay={700} className="absolute top-[10%] right-[10%] z-20 marker-float">
                <div className="glass-hud-chip px-4 py-3 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-[24px] text-emerald-400">timer</span>
                    <div>
                        <div className="text-[20px] font-mono font-black text-white leading-none">&lt;3m</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Avg Response</div>
                    </div>
                </div>
            </FadeIn>
            <FadeIn delay={900} className="absolute top-[45%] left-[0%] z-20 marker-float" style={{animationDelay: '1s'}}>
                <div className="glass-hud-chip px-4 py-3 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-[24px] text-amber-400">verified_user</span>
                    <div>
                        <div className="text-[20px] font-mono font-black text-white leading-none">12.4k</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Verified Citizens</div>
                    </div>
                </div>
            </FadeIn>
            <FadeIn delay={1100} className="absolute bottom-[20%] right-[20%] z-20 marker-float" style={{animationDelay: '2s'}}>
                <div className="glass-hud-chip px-4 py-3 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-[24px] text-sky-400">lock</span>
                    <div>
                        <div className="text-[20px] font-mono font-black text-white leading-none">E2E</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Encrypted Dispatch</div>
                    </div>
                </div>
            </FadeIn>
            
            {/* Center Molten Orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mesh-orb-glow">
                <div className="w-32 h-32 rounded-full molten-core flex items-center justify-center opacity-80">
                    <span className="material-symbols-outlined text-white text-[48px]">sensors</span>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features Preview                                                  */
/* ------------------------------------------------------------------ */

function ProductPreviewSection() {
  return (
    <section id="features" className="relative py-28 px-6 bg-[#0a0d14]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Tactical Awareness. <span className="text-primary">Zero Latency.</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Advanced geospatial telemetry meets instantaneous community dispatch.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={100}>
                <div className="glass-tactical rounded-2xl p-8 h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px]" />
                    <span className="material-symbols-outlined text-[32px] text-sky-400 mb-6">radar</span>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Dynamic Radar Perimeter</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">Broadcast SOS signals within a calibrated geospatial radius. Instantly ping certified responders, off-duty medics, and verified neighbors in your immediate vicinity.</p>
                    <ul className="space-y-3 font-mono text-[12px] text-slate-300">
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> 500m - 5km selectable radius</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> Real-time responder tracking</li>
                    </ul>
                </div>
            </FadeIn>

            <FadeIn delay={300}>
                <div className="glass-tactical rounded-2xl p-8 h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
                    <span className="material-symbols-outlined text-[32px] text-amber-400 mb-6">memory</span>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">AI Crisis Triage</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">Powered by Google Gemini, incidents are automatically analyzed to extract critical context, suggest immediate first-aid protocols, and categorize severity.</p>
                    <ul className="space-y-3 font-mono text-[12px] text-slate-300">
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> Automated threat categorization</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> Context-aware action plans</li>
                    </ul>
                </div>
            </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works Section                                               */
/* ------------------------------------------------------------------ */

const steps = [
  {
    number: "01",
    title: "TRIGGER SOS",
    description: "One tap activates the beacon, broadcasting your exact coordinates.",
    icon: "emergency_home",
    color: "text-red-400",
  },
  {
    number: "02",
    title: "MESH BROADCAST",
    description: "Alert securely ripples to verified responders in your perimeter.",
    icon: "cell_tower",
    color: "text-sky-400",
  },
  {
    number: "03",
    title: "RAPID DISPATCH",
    description: "Responders accept and are routed via live tactical map.",
    icon: "directions_run",
    color: "text-amber-400",
  },
  {
    number: "04",
    title: "INCIDENT RESOLVE",
    description: "Situation stabilized. Secure chat logs and debrief filed.",
    icon: "verified",
    color: "text-emerald-400",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28 px-6 border-t border-white/5 bg-[#0a0d14]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Telemetry Track</h2>
            <p className="text-slate-400 max-w-xl mx-auto font-mono text-sm">CRITICAL INCIDENT LIFECYCLE</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-red-500/20 via-sky-500/20 to-emerald-500/20 z-0" />
          
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 150} className="relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full glass-tactical flex items-center justify-center mb-6 relative">
                    <span className={`material-symbols-outlined text-[32px] ${step.color}`}>{step.icon}</span>
                    <div className="absolute -bottom-3 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">
                        STEP {step.number}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust / Security Section                                          */
/* ------------------------------------------------------------------ */

function SecuritySection() {
    return (
        <section id="security" className="relative py-28 px-6 border-t border-white/5 bg-[#080a0f]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <FadeIn>
                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 tracking-tight">Security-First Architecture</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                We treat your data and location with military-grade precision. Every interaction is authenticated, encrypted, and designed to protect citizen privacy while enabling rapid response.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-400 mt-1">shield_lock</span>
                                    <div>
                                        <div className="font-bold text-white">Incognito Shield</div>
                                        <div className="text-sm text-slate-400">Precise location masked until dispatch is mutually accepted.</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-400 mt-1">policy</span>
                                    <div>
                                        <div className="font-bold text-white">Verified Responder Credentials</div>
                                        <div className="text-sm text-slate-400">Medical and tactical skills are vetted before gaining 'Guardian' status.</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-400 mt-1">lock</span>
                                    <div>
                                        <div className="font-bold text-white">JWT & Role-Based Auth</div>
                                        <div className="text-sm text-slate-400">Strict API access controls prevent unauthorized telemetry scraping.</div>
                                    </div>
                                </li>
                            </ul>
                        </FadeIn>
                    </div>
                    <div className="flex-1 w-full">
                        <FadeIn delay={200}>
                            <div className="glass-panel p-6 rounded-2xl border border-white/10 relative">
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="material-symbols-outlined text-slate-600 text-[48px]">security</span>
                                </div>
                                <div className="font-mono text-[12px] text-slate-400 space-y-2">
                                    <div><span className="text-sky-400">sys</span>.<span className="text-emerald-400">auth</span> = <span className="text-amber-300">"VERIFIED"</span></div>
                                    <div><span className="text-sky-400">sys</span>.<span className="text-emerald-400">encryption</span> = <span className="text-amber-300">"AES-256-GCM"</span></div>
                                    <div><span className="text-sky-400">sys</span>.<span className="text-emerald-400">privacy_mode</span> = <span className="text-amber-300">true</span></div>
                                    <div className="mt-4 pt-4 border-t border-white/10 text-slate-500">
                                        // Establishing secure socket connection...<br/>
                                        // Handshake complete.<br/>
                                        // Awaiting trigger...
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
}


/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#05070c] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          <span className="text-white font-extrabold text-sm tracking-tight">NEARHELP</span>
        </div>
        <p className="text-xs text-slate-500 text-center font-mono">
          STATUS: <span className="text-emerald-500">OPERATIONAL</span> · DEMO BUILD
        </p>
        <div className="text-xs text-slate-600 font-mono">
          © {new Date().getFullYear()} NEARHELP
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
    <div className="min-h-screen bg-background text-on-background selection:bg-primary/20">
      <Navbar onGetStarted={handleGetStarted} isLoggedIn={!!user} />
      <HeroSection onGetStarted={handleGetStarted} isLoggedIn={!!user} />
      <ProductPreviewSection />
      <HowItWorksSection />
      <SecuritySection />
      <Footer />
    </div>
  );
}
