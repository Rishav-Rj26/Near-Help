import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export default function AuthPage() {
  const { user, login, signup, loading, error } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'neighbor'
  });

  useEffect(() => {
    if (user) navigate('/map');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#08100f] text-[#f7f5f0] font-sans antialiased min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-[#ff6b4a] selection:text-white relative">
      
      {/* TOP HERO BANNER: Warm Civic Storytelling */}
      <div className="relative w-full h-[280px] sm:h-[360px] flex-shrink-0 overflow-hidden">
        {/* Community Responders Photography */}
        <div className="absolute inset-0 bg-[#122220]">
          <img 
            alt="Community neighborhood volunteers and first responders standing together" 
            className="w-full h-full object-cover object-center hero-mask brightness-[0.88] contrast-[1.05]" 
            src="https://images.unsplash.com/photo-1593118944512-32b03cf65d95?q=80&w=1200&auto=format&fit=crop"
            style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)'
            }}
          />
        </div>

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1917] via-[#0d1917]/40 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#08100f]/60 to-transparent pointer-events-none"></div>

        {/* Top Navigation / Brand Anchor */}
        <div className="absolute top-0 inset-x-0 pt-6 px-6 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-full bg-[#ff6b4a] flex items-center justify-center shadow-lg shadow-[#ff6b4a]/30">
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            </div>
            <span className="font-extrabold tracking-tight text-[20px] text-white">Near<span className="text-[#ff6b4a]">Help</span></span>
          </div>
          {/* Civic Network Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08100f]/80 backdrop-blur-md border border-[#2dd4bf]/30 text-[#2dd4bf] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse"></span>
            <span>Active Grid</span>
          </div>
        </div>

        {/* Storytelling Header inside Hero */}
        <div className="absolute bottom-6 inset-x-0 px-6 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122220]/80 backdrop-blur-md border border-white/15 text-xs text-[#f7f5f0]/90 mb-2.5 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-[#ff6b4a]" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_3</span>
            <span>Join 14,000+ verified neighbors</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Protect Your Block.
          </h1>
          <p className="text-sm text-[#9ca8a5] mt-1 leading-relaxed max-w-[320px]">
            Ready to assist nearby in medical, safety, and mutual-aid emergencies when seconds count.
          </p>
        </div>
      </div>

      {/* BOTTOM SHEET FORM: Civic Registration Module */}
      <main 
        className="relative -mt-4 flex-grow rounded-t-[2.25rem] px-6 pt-7 pb-10 z-30 border-t border-white/10 flex flex-col justify-start"
        style={{
            background: 'linear-gradient(180deg, #132422 0%, #0d1917 100%)',
            boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Grab bar indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 pointer-events-none"></div>
        
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isLogin ? 'Sign in to network' : 'Create civic profile'}
            </h2>
            <p className="text-xs text-[#9ca8a5]">
              {isLogin ? 'Access your tactical dispatch console' : 'Choose your role to get dispatched accurately'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[#2dd4bf] text-xs font-medium bg-[#2dd4bf]/10 px-2.5 py-1 rounded-full border border-[#2dd4bf]/20">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            <span>Encrypted</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full relative z-40">
          
          {/* Role Selection Chips (Sign Up Only) */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-2.5 mb-1">
              <label 
                className={`relative flex flex-col p-3 rounded-2xl border cursor-pointer text-left transition-all ${
                  formData.role === 'neighbor' 
                    ? 'border-[#ff6b4a]/50 bg-[#ff6b4a]/10' 
                    : 'border-white/10 bg-[#122220]/60 hover:border-[#2dd4bf]/40'
                }`}
              >
                <input 
                  type="radio" 
                  name="civic-role" 
                  className="sr-only" 
                  checked={formData.role === 'neighbor'}
                  onChange={() => handleRoleChange('neighbor')}
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-[#ff6b4a] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_pin</span>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.role === 'neighbor' ? 'border-2 border-[#ff6b4a]' : 'border border-white/30'}`}>
                    {formData.role === 'neighbor' && <div className="w-2 h-2 rounded-full bg-[#ff6b4a]"></div>}
                  </div>
                </div>
                <span className="text-xs font-bold text-white">Community Neighbor</span>
                <span className="text-[10px] text-[#9ca8a5]">Check-ins & mutual aid</span>
              </label>

              <label 
                className={`relative flex flex-col p-3 rounded-2xl border cursor-pointer text-left transition-all ${
                  formData.role === 'responder' 
                    ? 'border-[#ff6b4a]/50 bg-[#ff6b4a]/10' 
                    : 'border-white/10 bg-[#122220]/60 hover:border-[#2dd4bf]/40'
                }`}
              >
                <input 
                  type="radio" 
                  name="civic-role" 
                  className="sr-only" 
                  checked={formData.role === 'responder'}
                  onChange={() => handleRoleChange('responder')}
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-[#2dd4bf] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.role === 'responder' ? 'border-2 border-[#ff6b4a]' : 'border border-white/30'}`}>
                    {formData.role === 'responder' && <div className="w-2 h-2 rounded-full bg-[#ff6b4a]"></div>}
                  </div>
                </div>
                <span className="text-xs font-bold text-white">First Responder</span>
                <span className="text-[10px] text-[#9ca8a5]">CPR / EMT / Nurse / Fire</span>
              </label>
            </div>
          )}

          {/* Full Name Field (Sign Up Only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#f7f5f0]/90 flex items-center justify-between px-1">
                <span>Full Name</span>
                <span className="text-[11px] text-[#9ca8a5] font-normal">Shown to neighbors during alerts</span>
              </label>
              <div className="relative flex items-center z-10">
                <span className="material-symbols-outlined absolute left-3.5 text-[#9ca8a5] text-[19px] pointer-events-none">badge</span>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Jane Doe" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-12 pl-10 pr-4 rounded-xl text-sm font-medium placeholder:text-[#9ca8a5]/50 focus:outline-none focus:ring-0 transition-all border border-white/10 text-white pointer-events-auto"
                  style={{
                      background: 'rgba(8, 16, 15, 0.65)',
                      boxShadow: 'none'
                  }}
                  onFocus={(e) => {
                      e.target.style.borderColor = '#ff6b4a';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 74, 0.2)';
                      e.target.style.background = 'rgba(8, 16, 15, 0.9)';
                  }}
                  onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(8, 16, 15, 0.65)';
                  }}
                />
              </div>
            </div>
          )}

          {/* Email / Mobile Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#f7f5f0]/90 flex items-center justify-between px-1">
              <span>Email Address</span>
              {!isLogin && (
                <span className="text-[11px] text-[#2dd4bf] font-normal flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">bolt</span> Instant alerts
                </span>
              )}
            </label>
            <div className="relative flex items-center z-10">
              <span className="material-symbols-outlined absolute left-3.5 text-[#9ca8a5] text-[19px] pointer-events-none">mail</span>
              <input 
                type="email" 
                name="email" 
                placeholder="jane@example.com" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm font-mono placeholder:text-[#9ca8a5]/50 focus:outline-none focus:ring-0 transition-all border border-white/10 text-white pointer-events-auto"
                style={{
                    background: 'rgba(8, 16, 15, 0.65)',
                    boxShadow: 'none'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = '#ff6b4a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 74, 0.2)';
                    e.target.style.background = 'rgba(8, 16, 15, 0.9)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(8, 16, 15, 0.65)';
                }}
              />
            </div>
          </div>

          {/* Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#f7f5f0]/90 px-1">Password</label>
              <div className="relative flex items-center z-10">
                <span className="material-symbols-outlined absolute left-3 text-[#9ca8a5] text-[18px] pointer-events-none">lock</span>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 pl-9 pr-3 rounded-xl text-sm font-medium placeholder:text-[#9ca8a5]/50 focus:outline-none focus:ring-0 transition-all border border-white/10 text-white pointer-events-auto"
                  style={{
                      background: 'rgba(8, 16, 15, 0.65)',
                      boxShadow: 'none'
                  }}
                  onFocus={(e) => {
                      e.target.style.borderColor = '#ff6b4a';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 74, 0.2)';
                      e.target.style.background = 'rgba(8, 16, 15, 0.9)';
                  }}
                  onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(8, 16, 15, 0.65)';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Emergency Skills Callout / Checkbox (Sign Up Only) */}
          {!isLogin && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#122220]/80 border border-white/10 mt-1 cursor-pointer z-10" onClick={() => {
                const cb = document.getElementById('civic-skills');
                if (cb) cb.checked = !cb.checked;
            }}>
              <input 
                type="checkbox" 
                id="civic-skills" 
                className="mt-0.5 w-4 h-4 rounded text-[#ff6b4a] focus:ring-[#ff6b4a] focus:ring-offset-[#0d1917] border-white/20 bg-[#08100f] cursor-pointer"
              />
              <label className="text-xs leading-relaxed text-[#9ca8a5] cursor-pointer pointer-events-none" htmlFor="civic-skills">
                <strong className="text-[#f7f5f0] font-semibold">I have emergency skills</strong> (CPR, AED, First Aid). I can verify certifications after setup.
              </label>
            </div>
          )}

          {/* Primary Action Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full h-13 py-3.5 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 mt-2 shadow-lg cursor-pointer active:scale-95 disabled:opacity-70 transition-transform pointer-events-auto z-10"
            style={{
                background: 'linear-gradient(135deg, #ff6b4a 0%, #fa532e 100%)',
                boxShadow: '0 4px 18px rgba(255, 107, 74, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
          >
            <span>{loading ? 'Authenticating...' : (isLogin ? 'Enter Dispatch' : 'Join the Civic Network')}</span>
            {!loading && <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>}
          </button>

          {/* Trust Badges & Microcopy */}
          <div className="flex items-center justify-center gap-4 py-1 text-[11px] text-[#9ca8a5]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#2dd4bf]">verified</span> Zero commercial tracking
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#ff6b4a]">local_police</span> Verified local dispatch
            </span>
          </div>

          {/* Terms Disclaimer */}
          {!isLogin && (
            <p className="text-[11px] text-center text-[#9ca8a5]/80 px-4 leading-normal mt-2">
              By creating an account, you agree to our{' '} 
              <a className="text-[#f7f5f0] underline hover:text-[#ff6b4a] transition-colors pointer-events-auto" href="#">Civic Charter</a> &amp;{' '} 
              <a className="text-[#f7f5f0] underline hover:text-[#ff6b4a] transition-colors pointer-events-auto" href="#">Privacy Promise</a>.
            </p>
          )}
        </form>

        {/* Toggle Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center relative z-40 pointer-events-auto">
          <p className="text-sm text-[#9ca8a5]">
            {isLogin ? "New to the network?" : "Already part of the network?"}
            <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-[#ff6b4a] hover:underline ml-1.5 inline-flex items-center gap-0.5 cursor-pointer pointer-events-auto"
            >
              {isLogin ? 'Join now' : 'Sign in'}
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
