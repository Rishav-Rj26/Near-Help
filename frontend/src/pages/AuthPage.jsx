import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, signup, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate('/');
    } catch {
      // Error is handled in context and surfaced via `error` prop
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-slate-900 border-[3px] border-slate-700 shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] p-6 relative flex flex-col transition-colors duration-200">
        <div className="pb-5 border-b-[3px] border-slate-700 border-dashed mb-5">
          <h1 className="font-black uppercase tracking-tighter text-2xl text-white m-0">
            {isLogin ? 'Dispatcher Login' : 'Responder Signup'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                maxLength={80}
                required
                className="w-full p-2 border border-slate-700 bg-slate-950 text-white font-mono text-sm focus:outline-none focus:border-blue-500 rounded-sm"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-slate-700 bg-slate-950 text-white font-mono text-sm focus:outline-none focus:border-blue-500 rounded-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={isLogin ? 1 : 8}
              maxLength={128}
              required
              className="w-full p-2 border border-slate-700 bg-slate-950 text-white font-mono text-sm focus:outline-none focus:border-blue-500 rounded-sm"
            />
          </div>

          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm py-3 px-4 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Access System' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="bg-transparent text-slate-400 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors"
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
