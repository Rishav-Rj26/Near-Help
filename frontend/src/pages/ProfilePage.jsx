import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCurrentUser, updateUserSkills } from '../services/api';

const VALID_SKILLS = [
  'CPR',
  'First Aid',
  'Doctor',
  'Nurse',
  'Paramedic',
  'Firefighter',
  'Lifeguard',
  'Mental Health First Aid',
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await fetchCurrentUser();
      setProfile(data.user);
      setStats(data.stats);
      setSkills(data.user.skills || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = async (skill) => {
    let newSkills;
    if (skills.includes(skill)) {
      newSkills = skills.filter(s => s !== skill);
    } else {
      newSkills = [...skills, skill];
    }
    
    // Optimistic update
    setSkills(newSkills);
    
    try {
      await updateUserSkills(newSkills);
    } catch (error) {
      console.error('Failed to update skills:', error);
      // Revert on error
      setSkills(skills);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-8">
        <header className="flex justify-between items-center pb-4 border-b-2 border-slate-800">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            {profile?.name ? `${profile.name}'s Profile` : 'Profile'}
          </h1>
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm font-mono font-bold text-slate-400 hover:text-white uppercase tracking-widest border border-slate-700 px-3 py-1 hover:bg-slate-800 transition-colors"
          >
            Back
          </button>
        </header>

        <section className="bg-slate-900 border-[3px] border-slate-700 p-6 shadow-[8px_8px_0px_0px_rgba(30,41,59,1)]">
          <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">My Impact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-4xl font-black text-orange-500">{stats?.responseCount || 0}</span>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">Responses</span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-black text-blue-500">{stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0'}★</span>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Rating</span>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border-[3px] border-slate-700 p-6 shadow-[8px_8px_0px_0px_rgba(30,41,59,1)]">
          <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2 border-b border-slate-700 pb-2">My Skills</h2>
          <p className="text-sm text-slate-400 font-mono mb-4">
            Select the skills you possess. These will be shown to other responders.
          </p>
          <div className="flex flex-wrap gap-2">
            {VALID_SKILLS.map(skill => {
              const isSelected = skills.includes(skill);
              return (
                <button 
                  key={skill} 
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${isSelected ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-slate-700 bg-transparent text-slate-400 hover:border-slate-500'}`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </section>

        <button 
          onClick={handleLogout}
          className="w-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border-2 border-red-600 font-black uppercase tracking-widest text-sm py-3 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
