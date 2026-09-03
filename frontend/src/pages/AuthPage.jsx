import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { user, login, signup, loading, error } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) navigate('/map');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="bg-blueprint text-on-surface min-h-screen w-full flex flex-col items-center justify-center p-margin-mobile overflow-hidden selection:bg-primary-container selection:text-primary relative">
      {/* Ambient background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] grid-tactical" />
      
      {/* Wordmark */}
      <div className="mb-8 flex items-center justify-center gap-2 z-10 cursor-pointer" onClick={() => navigate('/')}>
        <span className="material-symbols-outlined text-tertiary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
        <h1 className="font-sans text-3xl font-black tracking-tighter text-primary">NEARHELP</h1>
      </div>
      
      {/* Auth Glass Card */}
      <main className="glass-panel w-full max-w-sm rounded-xl p-6 z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-on-surface">
            {isLogin ? 'Welcome back' : 'Join the Network'}
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="sr-only" htmlFor="name">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">badge</span>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="Full Name" 
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleChange}
                  className="input-recessed w-full h-12 rounded-lg pl-10 pr-4 text-sm text-on-surface placeholder-on-surface-variant transition-shadow"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="sr-only" htmlFor="email">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">person</span>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Email address" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="input-recessed w-full h-12 rounded-lg pl-10 pr-4 text-sm text-on-surface placeholder-on-surface-variant transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="sr-only" htmlFor="password">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">lock</span>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Password" 
                required 
                value={formData.password}
                onChange={handleChange}
                className="input-recessed w-full h-12 rounded-lg pl-10 pr-4 text-sm text-on-surface placeholder-on-surface-variant transition-shadow"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-sos w-full h-12 rounded-lg text-[18px] font-bold text-on-tertiary-fixed mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <span>{loading ? 'Authenticating...' : (isLogin ? 'Sign in' : 'Sign up')}</span>
            {!loading && <span className="material-symbols-outlined text-[20px]">{isLogin ? 'login' : 'person_add'}</span>}
          </button>
        </form>
      </main>
      
      {/* Contextual Information */}
      <div className="mt-6 text-center max-w-[280px] z-10">
        <p className="text-[13px] text-on-surface-variant italic opacity-80 leading-snug">
          Your location is only used to connect you with nearby help.
        </p>
      </div>
      
      {/* Toggle Link */}
      <div className="absolute bottom-8 w-full text-center z-10">
        <p className="text-sm text-on-surface-variant">
          {isLogin ? "New to NearHelp? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-tertiary font-bold hover:text-tertiary-fixed transition-colors underline decoration-tertiary/30 underline-offset-4"
          >
            {isLogin ? 'Create an account' : 'Sign in instead'}
          </button>
        </p>
      </div>
    </div>
  );
}
