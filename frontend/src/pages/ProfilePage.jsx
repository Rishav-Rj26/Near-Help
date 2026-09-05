import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { fetchCurrentUser, updateUserSkills } from '../services/api';

const VALID_SKILLS = [
  { name: 'CPR & Defibrillator', icon: 'cardiology', type: 'gold' },
  { name: 'First Aid Certified', icon: 'medical_services', type: 'gold' },
  { name: 'Emergency Medicine MD', icon: 'stethoscope', type: 'active' },
  { name: 'Crisis Counseling', icon: 'psychology', type: 'active' },
  { name: 'Wilderness Rescue', icon: 'terrain', type: 'active' },
  { name: 'Nurse', icon: 'vaccines', type: 'inactive' },
  { name: 'Fire Response', icon: 'local_fire_department', type: 'inactive' },
  { name: 'Paramedic', icon: 'local_hospital', type: 'inactive' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incognito, setIncognito] = useState(true);
  const [radius, setRadius] = useState('1km');

  async function loadProfile() {
    try {
      const { data } = await fetchCurrentUser();
      setProfile(data.user);
      setStats(data.stats);
      setSkills(data.user.skills || []);
    } catch (err) { console.error('Profile load failed:', err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadProfile(); }, []);

  const toggleSkill = async (skillName) => {
    const newSkills = skills.includes(skillName) ? skills.filter(s => s !== skillName) : [...skills, skillName];
    setSkills(newSkills);
    try { await updateUserSkills(newSkills); }
    catch { setSkills(skills); }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="text-on-background min-h-screen pb-32 antialiased selection:bg-primary/20 bg-[#080d1a]" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.18) 0px, transparent 50%), radial-gradient(at 100% 15%, rgba(139, 92, 246, 0.16) 0px, transparent 50%), radial-gradient(at 50% 60%, rgba(234, 179, 8, 0.08) 0px, transparent 55%), radial-gradient(at 85% 95%, rgba(56, 189, 248, 0.12) 0px, transparent 50%)', backgroundAttachment: 'fixed' }}>
      
      {/* Ambient Background Glow Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-sky-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute top-80 -right-20 w-[260px] h-[260px] bg-amber-500/10 rounded-full blur-[90px]"></div>
        <div className="absolute bottom-40 -left-20 w-[260px] h-[260px] bg-indigo-500/12 rounded-full blur-[90px]"></div>
      </div>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0c1220]/70 backdrop-blur-xl">
        <div className="flex justify-between items-center px-4 max-w-lg mx-auto h-16">
          <button onClick={() => navigate('/map')} className="w-10 h-10 rounded-full flex items-center justify-center text-primary-fixed bg-white/5 border border-white/10 hover:bg-white/10 transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-[20px]">emergency_home</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            <h1 className="font-mono text-sm tracking-[0.25em] font-bold text-primary-fixed uppercase">NEARHELP • RESCUE</h1>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-full flex items-center justify-center text-primary-fixed bg-white/5 border border-white/10 hover:bg-white/10 transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto space-y-4 relative z-10">
        {/* Floating Profile Hero Section */}
        <section className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center">
          {/* Subtle top highlight line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-fixed/40 to-transparent"></div>
          
          {/* Verified Civic Crest Ribbon */}
          <div className="glass-badge-gold px-3.5 py-1 rounded-full flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-tertiary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-tertiary uppercase">
                {profile?.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'GOLD CIVIC GUARDIAN'}
            </span>
          </div>

          {/* Glowing Circular Avatar Ring */}
          <div className="hero-avatar-ring mb-3">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#0a101d] flex items-center justify-center text-4xl font-black text-white">
                {profile?.name?.[0]?.toUpperCase() || '?'}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a]/60 via-transparent to-white/10 pointer-events-none"></div>
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0c1220] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
            </div>
          </div>

          {/* Name & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
              {profile?.name || 'User'}
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }} title="Identity Verified">verified</span>
            </h2>
            <p className="text-xs text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-primary">calendar_month</span>
              Active Neighbor since {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'Unknown'}
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Available for Medical & Urgent First Aid
          </div>
        </section>

        {/* Dynamic Impact Dashboard with Glowing Stat Cards */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase font-mono">Impact & Readiness</h3>
            <span className="text-[11px] text-primary-fixed/80 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">bolt</span> Tier 1 Responder
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Stat 1: Lives Assisted */}
            <div className="glass-card rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group">
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-primary-fixed mb-2">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_1</span>
              </div>
              <div>
                <div className="font-mono text-2xl font-extrabold text-white tracking-tight">{stats?.responseCount || 0}</div>
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-0.5 leading-tight">Lives Assisted</div>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">trending_up</span> +3 this mo
              </div>
            </div>

            {/* Stat 2: Trust Score */}
            <div className="glass-card rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-tertiary mb-2">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <div>
                <div className="font-mono text-2xl font-extrabold text-tertiary tracking-tight">{stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0'}</div>
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-0.5 leading-tight">Civic Trust</div>
              </div>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-0.5">
                {stats?.responseCount || 0} verified reviews
              </div>
            </div>

            {/* Stat 3: Rapid Response */}
            <div className="glass-card rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-2">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
              </div>
              <div>
                <div className="font-mono text-2xl font-extrabold text-white tracking-tight">100%</div>
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-0.5 leading-tight">Rapid Resp</div>
              </div>
              <div className="mt-2 text-[10px] text-sky-300 flex items-center gap-0.5 font-mono">
                <span className="material-symbols-outlined text-[12px]">timer</span> &lt;3m avg
              </div>
            </div>
          </div>

          {/* Mini Response Trend Sparkline & Level Strip */}
          <div className="glass-card rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified_user</span>
              <div>
                <div className="text-xs font-semibold text-white">Emergency Readiness: Exceptional</div>
                <div className="text-[10px] text-slate-400">Response reliability indexed at top 3%</div>
              </div>
            </div>
            {/* Mini SVG sparkline */}
            <div className="w-16 h-6 flex items-center">
              <svg className="w-full h-full text-emerald-400 stroke-current fill-none" viewBox="0 0 64 24">
                <polyline points="0,18 12,16 24,19 36,10 48,12 62,4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></polyline>
              </svg>
            </div>
          </div>
        </section>

        {/* Skills & Badges Section */}
        <section className="glass-card rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary text-[18px]">military_tech</span>
              <h3 className="text-xs font-bold tracking-widest text-on-surface uppercase font-mono">Verified Skills & Credentials</h3>
            </div>
            <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{skills.length} Certified</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {VALID_SKILLS.map((skill) => {
              const isActive = skills.includes(skill.name);
              const pillClass = isActive 
                ? (skill.type === 'gold' ? 'skill-pill-gold text-amber-100' : 'skill-pill-active text-primary-fixed')
                : 'skill-pill-inactive';
              
              const iconColor = isActive 
                ? (skill.type === 'gold' ? 'text-tertiary' : 'text-sky-300')
                : '';

              return (
                <button
                  key={skill.name}
                  onClick={() => toggleSkill(skill.name)}
                  className={`${pillClass} px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all ${!isActive ? 'hover:bg-white/10' : ''}`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${iconColor}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {skill.icon}
                  </span>
                  <span>{skill.name}</span>
                  {isActive && (
                    <span className={`material-symbols-outlined text-[14px] ${iconColor}`}>verified</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Privacy & Guardrails Section */}
        <section className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">security</span>
            <h3 className="text-xs font-bold tracking-widest text-on-surface uppercase font-mono">Privacy & Safety Guardrails</h3>
          </div>

          {/* Incognito Shield Card */}
          <div className="rounded-xl p-3.5 bg-[#0a1222]/80 border border-white/10 flex items-start justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sky-400 text-[18px]">shield</span>
                <span className="font-semibold text-sm text-white">Incognito Shield</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Responders only see distance & verified skills. Your exact address and surname remain masked until emergency dispatch is mutually accepted.
              </p>
            </div>
            <input 
                type="checkbox" 
                className="toggle-switch-luminous mt-0.5 shrink-0" 
                checked={incognito}
                onChange={() => setIncognito(!incognito)}
            />
          </div>

          {/* Beacon Alert Radius Segmented Control */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-amber-400">radar</span>
                Beacon Alert Radius
              </span>
              <span className="font-mono text-[11px] text-primary-fixed bg-sky-950/60 px-2 py-0.5 rounded border border-sky-400/20">
                Active: {radius} Perimeter
              </span>
            </div>
            {/* Haptic Segmented Control */}
            <div className="p-1 rounded-xl bg-black/40 border border-white/10 flex gap-1 shadow-inner">
              {['500m', '1km', '2km'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`flex-1 py-2 rounded-lg font-mono text-xs transition-colors flex items-center justify-center gap-1 ${
                        radius === r 
                        ? 'font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 shadow-[0_2px_10px_rgba(37,99,235,0.4)] border border-sky-300/30' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {radius === r && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                    <span>{r}</span>
                  </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 px-1">
              <span>Immediate Block</span>
              <span>Optimal Urban</span>
              <span>Extended District</span>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar: Floating Frosted Glass Pill Nav */}
      <nav className="fixed bottom-4 inset-x-0 z-50 px-4 max-w-sm mx-auto pointer-events-none">
        <div className="glass-card rounded-full border border-white/20 bg-[#0d1527]/85 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] px-3 py-2 flex justify-between items-center pointer-events-auto">
          <button onClick={() => navigate('/map')} className="flex flex-col items-center justify-center w-14 py-1 text-slate-400 hover:text-primary transition-all active:scale-90 duration-150">
            <span className="material-symbols-outlined text-[22px]">map</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Map</span>
          </button>
          <button className="flex flex-col items-center justify-center w-14 py-1 text-slate-400 hover:text-primary transition-all active:scale-90 duration-150 relative">
            <span className="material-symbols-outlined text-[22px]">notifications_active</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Alerts</span>
            <span className="absolute top-0.5 right-3 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]"></span>
          </button>
          <button className="flex flex-col items-center justify-center w-14 py-1 text-slate-400 hover:text-primary transition-all active:scale-90 duration-150">
            <span className="material-symbols-outlined text-[22px]">groups</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Network</span>
          </button>
          {/* Active Profile Pill */}
          <button className="flex flex-col items-center justify-center px-4 py-1 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-white border border-primary-fixed/30 shadow-[0_0_16px_rgba(181,200,227,0.25)] active:scale-90 transition-transform duration-150">
            <span className="material-symbols-outlined text-[22px] text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="text-[10px] font-bold tracking-tight mt-0.5 text-primary-fixed">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
