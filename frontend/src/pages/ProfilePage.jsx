import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Zap, Star, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCurrentUser, updateUserSkills } from '../services/api';

const VALID_SKILLS = ['CPR', 'First Aid', 'Doctor', 'Nurse', 'Paramedic', 'Firefighter', 'Lifeguard', 'Mental Health First Aid'];

const SKILL_COLORS = {
  CPR: 'from-red-500 to-red-600',
  'First Aid': 'from-emerald-500 to-emerald-600',
  Doctor: 'from-blue-500 to-blue-600',
  Nurse: 'from-pink-500 to-pink-600',
  Paramedic: 'from-orange-500 to-orange-600',
  Firefighter: 'from-amber-500 to-amber-600',
  Lifeguard: 'from-cyan-500 to-cyan-600',
  'Mental Health First Aid': 'from-purple-500 to-purple-600',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data } = await fetchCurrentUser();
      setProfile(data.user);
      setStats(data.stats);
      setSkills(data.user.skills || []);
    } catch (err) { console.error('Profile load failed:', err); }
    finally { setLoading(false); }
  };

  const toggleSkill = async (skill) => {
    const newSkills = skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill];
    setSkills(newSkills);
    try { await updateUserSkills(newSkills); }
    catch { setSkills(skills); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-20 blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-lg mx-auto p-4 md:p-8 flex flex-col gap-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-2xl font-extrabold text-white">Profile</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Profile Card */}
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-20 h-20 rounded-2xl gradient-brand glow-brand mx-auto flex items-center justify-center text-3xl font-black text-white mb-4">
            {profile?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <h2 className="text-xl font-bold text-white">{profile?.name || 'User'}</h2>
          <p className="text-sm text-slate-400 mt-1">{profile?.email}</p>
          {profile?.role === 'admin' && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">Admin</span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-5 text-center">
            <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-black text-white">{stats?.responseCount || 0}</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Responses</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-3xl font-black text-white">{stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0'}</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Avg Rating</div>
          </div>
        </div>

        {/* Skills */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">My Skills</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Tap to toggle. These appear on your responder profile.</p>
          <div className="flex flex-wrap gap-2">
            {VALID_SKILLS.map(skill => {
              const isSelected = skills.includes(skill);
              const gradient = SKILL_COLORS[skill] || 'from-slate-500 to-slate-600';
              return (
                <motion.button
                  key={skill}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 border ${
                    isSelected
                      ? `bg-gradient-to-r ${gradient} border-transparent text-white shadow-lg`
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {skill}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sign Out */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { logout(); navigate('/auth'); }}
          className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </div>
    </div>
  );
}
