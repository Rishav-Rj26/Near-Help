import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import { BarChart3, Shield, Users, Clock, AlertTriangle, ArrowLeft, Ban, CheckCircle, Star, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import {
  fetchActiveIncidents,
  fetchAnalytics,
  fetchFlaggedUsers,
  suspendUser,
  unsuspendUser
} from '../services/api';

import PulsingPinMarker from '../components/map/PulsingPinMarker';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({ activeCount: 0, avgResponseTimeSec: 0, flaggedUserCount: 0 });
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [a, i, u] = await Promise.all([fetchAnalytics(), fetchActiveIncidents(), fetchFlaggedUsers()]);
      setAnalytics(a.data);
      setActiveIncidents(i.data);
      setFlaggedUsers(u.data);
    } catch (err) { console.error('Dashboard load failed', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user?.role === 'admin') loadData(); }, [user?.role, loadData]);

  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const handleToggle = async (userId, isSuspended) => {
    try {
      if (isSuspended) await unsuspendUser(userId);
      else await suspendUser(userId);
      const [u, a] = await Promise.all([fetchFlaggedUsers(), fetchAnalytics()]);
      setFlaggedUsers(u.data);
      setAnalytics(a.data);
    } catch { alert('Failed to update user status.'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Active SOS', value: analytics.activeCount, icon: Activity, color: 'from-red-500 to-orange-500', glow: 'shadow-red-500/20' },
    { label: 'Avg Response', value: `${analytics.avgResponseTimeSec}s`, icon: Clock, color: 'from-blue-500 to-indigo-500', glow: 'shadow-blue-500/20' },
    { label: 'Flagged Users', value: analytics.flaggedUserCount, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative">
      {/* Background mesh */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <nav className="w-64 glass border-r border-slate-700/30 flex flex-col p-6 shrink-0 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center glow-brand">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight">NearHelp</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            {[
              { label: 'Overview', href: '#overview', icon: BarChart3 },
              { label: 'Live Map', href: '#live-map', icon: Activity },
              { label: 'Flagged Users', href: '#flagged', icon: Users },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-300 hover:text-white hover:bg-indigo-500/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </motion.button>
        </nav>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col gap-8">
          <header>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Dashboard</h2>
            <p className="text-sm text-slate-400 mt-1">Real-time emergency overview</p>
          </header>

          {/* Stats */}
          <section id="overview" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass rounded-2xl p-6 relative overflow-hidden shadow-lg ${card.glow}`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 blur-2xl bg-gradient-to-br ${card.color}`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-4xl font-black text-white relative z-10">{card.value}</div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{card.label}</div>
              </motion.div>
            ))}
          </section>

          {/* Live Map */}
          <section id="live-map">
            <h3 className="text-xl font-bold text-white mb-4">Live Incidents</h3>
            <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-700/30 glass">
              <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {activeIncidents.map(inc => (
                  <PulsingPinMarker key={inc._id} incident={{ ...inc, broadcasterName: inc.broadcaster?.name || 'Anonymous' }} />
                ))}
              </MapContainer>
            </div>
          </section>

          {/* Flagged Users */}
          <section id="flagged">
            <h3 className="text-xl font-bold text-white mb-4">Flagged Users</h3>
            <div className="glass rounded-2xl overflow-hidden border border-slate-700/30">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    {['Name', 'Email', 'False Alerts', 'Rating', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flaggedUsers.map(u => (
                    <tr key={u._id} className="border-b border-slate-800/30 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-semibold text-white text-sm">{u.name}</td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${u.trust?.falseAlertCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                          {u.trust?.falseAlertCount || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-sm font-bold text-white">{u.trust?.avgRating ? u.trust.avgRating.toFixed(1) : '0.0'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          u.trust?.isSuspended
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {u.trust?.isSuspended ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {u.trust?.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggle(u._id, u.trust?.isSuspended)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            u.trust?.isSuspended
                              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                              : 'border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          {u.trust?.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                  {flaggedUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-10 text-center text-slate-500 text-sm">No flagged users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
