import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/auth-context';
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
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Active SOS', value: analytics.activeCount, icon: 'sensors', color: 'text-rescue-red', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'Avg Response', value: `${analytics.avgResponseTimeSec}s`, icon: 'timer', color: 'text-sky-400', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.15)]', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { label: 'Flagged Users', value: analytics.flaggedUserCount, icon: 'warning', color: 'text-hazard-amber', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ];

  return (
    <div className="min-h-screen bg-void text-on-background relative font-sans antialiased">
      {/* Background mesh */}
      <div className="fixed inset-0 grid-tactical pointer-events-none opacity-50" />
      <div className="fixed inset-0 ambient-cyber-bg pointer-events-none opacity-50" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <nav className="w-64 glass-tactical border-r border-white/10 flex flex-col p-6 shrink-0 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(181,200,227,0.3)]">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight">NEARHELP</h1>
              <p className="text-[10px] font-mono text-primary uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            {[
              { label: 'Overview', href: '#overview', icon: 'bar_chart' },
              { label: 'Live Map', href: '#live-map', icon: 'map' },
              { label: 'Flagged Users', href: '#flagged', icon: 'group' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-sky-400 hover:text-white hover:bg-sky-500/10 transition-all border border-sky-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to App
          </motion.button>
        </nav>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col gap-8">
          <header>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Dashboard</h2>
            <p className="text-sm font-mono text-primary mt-1 uppercase tracking-widest">Real-time Emergency Overview</p>
          </header>

          {/* Stats */}
          <section id="overview" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-tactical rounded-2xl p-6 relative overflow-hidden ${card.glow}`}
              >
                <div className={`w-10 h-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center mb-4`}>
                  <span className={`material-symbols-outlined ${card.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                </div>
                <div className="text-4xl font-mono font-black text-white relative z-10">{card.value}</div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{card.label}</div>
              </motion.div>
            ))}
          </section>

          {/* Live Map */}
          <section id="live-map">
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Live Incidents</h3>
            <div className="h-[400px] rounded-2xl overflow-hidden glass-tactical">
              <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
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
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Flagged Users</h3>
            <div className="glass-tactical rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {['Name', 'Email', 'False Alerts', 'Rating', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-mono font-semibold text-primary uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flaggedUsers.map(u => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-semibold text-white text-sm">{u.name}</td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`font-mono text-sm font-bold ${u.trust?.falseAlertCount > 0 ? 'text-rescue-red' : 'text-slate-400'}`}>
                          {u.trust?.falseAlertCount || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-mono text-sm font-bold text-white">{u.trust?.avgRating ? u.trust.avgRating.toFixed(1) : '0.0'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                          u.trust?.isSuspended
                            ? 'bg-red-500/10 text-rescue-red border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {u.trust?.isSuspended ? 'block' : 'check_circle'}
                          </span>
                          {u.trust?.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggle(u._id, u.trust?.isSuspended)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all border ${
                            u.trust?.isSuspended
                              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                              : 'border-red-500/30 text-rescue-red hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          {u.trust?.isSuspended ? 'UNSUSPEND' : 'SUSPEND'}
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                  {flaggedUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-10 text-center text-slate-500 text-sm font-mono">NO FLAGGED USERS FOUND</td>
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
