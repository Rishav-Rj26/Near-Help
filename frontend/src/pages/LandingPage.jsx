import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, MapPin, Zap, Users, Radio, Brain, Clock,
  ChevronRight, ArrowRight, Heart, AlertTriangle, Globe,
  MessageSquare, Activity
} from 'lucide-react';

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

function CountUp({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    const el = document.getElementById(`count-${target}-${suffix}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target, duration]);

  return <span id={`count-${target}-${suffix}`}>{count}{suffix}</span>;
}

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

function HeroSection({ onGetStarted, isLoggedIn }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-[-200px] left-[-150px] w-[700px] h-[700px] rounded-full opacity-[0.15] blur-[140px]"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
      <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <FadeIn delay={100}>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300 tracking-wide">Community-Powered Emergency Response</span>
          </div>
        </FadeIn>

        {/* Heading */}
        <FadeIn delay={200}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Help is{' '}
            <span className="text-gradient">Near.</span>
            <br />
            <span className="text-slate-400 text-4xl sm:text-5xl md:text-6xl font-bold">Always.</span>
          </h1>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn delay={350}>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A hyperlocal, real-time emergency platform that connects people in crisis
            with trained community responders — <span className="text-white font-medium">before official services arrive.</span>
          </p>
        </FadeIn>

        {/* CTA buttons */}
        <FadeIn delay={500}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              {isLoggedIn ? 'Open Map' : 'Get Started'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 text-slate-300 font-semibold text-base hover:bg-slate-700/40 hover:text-white hover:border-slate-600/50 transition-all duration-300"
            >
              See How It Works
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </FadeIn>

        {/* Mini stats */}
        <FadeIn delay={650}>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-16 pt-8 border-t border-slate-800/50">
            <div className="text-center">
              <div className="text-3xl font-black text-white">&lt;30s</div>
              <div className="text-xs text-slate-500 mt-1">Alert Speed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white">5km</div>
              <div className="text-xs text-slate-500 mt-1">Broadcast Radius</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white">24/7</div>
              <div className="text-xs text-slate-500 mt-1">Always On</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white">AI</div>
              <div className="text-xs text-slate-500 mt-1">Powered Triage</div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 animate-bounce">
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
      </div>
    </section>
  );
}

const features = [
  {
    icon: Radio,
    title: "Instant SOS Broadcast",
    description: "Trigger an emergency alert that reaches every connected responder within a 5km radius in under 30 seconds.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: MapPin,
    title: "Live Geospatial Map",
    description: "Real-time map powered by 2dsphere indexes shows incidents, responder positions, and live location sharing.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: Brain,
    title: "AI Crisis Triage",
    description: "Google Gemini analyzes each incident to generate actionable triage guidance and nearby emergency services.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: MessageSquare,
    title: "Secure Live Chat",
    description: "Private, authenticated chat threads between broadcaster and responders with server-verified membership.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Activity,
    title: "Incident Lifecycle",
    description: "Full incident pipeline — from SOS trigger through response, resolution, and structured debrief.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Shield,
    title: "Security-First Design",
    description: "JWT auth, rate limiting, coordinate validation, CORS allow-listing, request IDs, and anonymous mode.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 mb-4">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300 tracking-wide">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Built for <span className="text-gradient">Real Emergencies</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every feature is engineered for speed, reliability, and real-world crisis response.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={150 + i * 100}>
              <div className="group relative rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm p-7 hover:bg-slate-900/60 hover:border-white/[0.1] transition-all duration-300 h-full">
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${feature.bg} border ${feature.border} mb-5`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Trigger SOS",
    description: "Press the SOS button, select the crisis type, set your radius, and broadcast your emergency to nearby responders.",
    icon: AlertTriangle,
    color: "from-red-500 to-orange-500",
  },
  {
    number: "02",
    title: "Responders Join",
    description: "Nearby community responders see your alert on their live map, tap the incident pin, and opt in to help.",
    icon: Users,
    color: "from-indigo-500 to-purple-500",
  },
  {
    number: "03",
    title: "AI Triage & Chat",
    description: "AI-generated triage guidance appears instantly. A private chat thread opens for real-time coordination.",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "04",
    title: "Resolve & Debrief",
    description: "Mark the incident as resolved. A structured debrief captures outcomes and learnings for the community.",
    icon: Heart,
    color: "from-emerald-500 to-teal-500",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28 px-6">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.05] blur-[150px]"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 mb-4">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300 tracking-wide">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              From <span className="text-gradient">SOS to Resolved</span> in Minutes
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A seamless four-step flow designed for the chaos of real emergencies.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={200 + i * 150}>
              <div className="group relative rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm p-7 hover:bg-slate-900/60 hover:border-white/[0.1] transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 tracking-widest mb-1">STEP {step.number}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  const techStack = [
    { name: "React 19", category: "Frontend" },
    { name: "Socket.io", category: "Real-time" },
    { name: "MongoDB", category: "Database" },
    { name: "Gemini AI", category: "Intelligence" },
    { name: "Leaflet", category: "Maps" },
    { name: "Express", category: "Backend" },
  ];

  return (
    <section className="relative py-28 px-6 border-t border-slate-800/50">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 mb-4">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300 tracking-wide">Tech Stack</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Engineered with <span className="text-gradient">Modern Tools</span>
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="text-center rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 hover:bg-slate-900/60 hover:border-white/[0.1] transition-all duration-300">
                <div className="text-base font-bold text-white mb-1">{tech.name}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">{tech.category}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function CTASection({ onGetStarted, isLoggedIn }) {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-[140px]"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 shadow-xl shadow-indigo-500/25 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
            Join a growing network of community responders and help make your neighborhood safer.
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            {isLoggedIn ? 'Go to Map' : 'Get Started Free'}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800/50 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-bold text-sm tracking-tight">NearHelp</span>
        </div>
        <p className="text-xs text-slate-500 text-center">
          Portfolio demo, not an emergency-services replacement. In a real emergency, contact local emergency services first.
        </p>
        <div className="text-xs text-slate-600">
          © {new Date().getFullYear()} NearHelp
        </div>
      </div>
    </footer>
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-xl shadow-black/10' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight">NearHelp</span>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
        </div>

        <button
          onClick={onGetStarted}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          {isLoggedIn ? 'Open Map' : 'Get Started'}
        </button>
      </div>
    </nav>
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
    <div className="min-h-screen" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
      <Navbar onGetStarted={handleGetStarted} isLoggedIn={!!user} />
      <HeroSection onGetStarted={handleGetStarted} isLoggedIn={!!user} />
      <FeaturesSection />
      <HowItWorksSection />
      <TechStackSection />
      <CTASection onGetStarted={handleGetStarted} isLoggedIn={!!user} />
      <Footer />
    </div>
  );
}
