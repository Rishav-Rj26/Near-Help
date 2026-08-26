import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
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
import { BrutalistBarChart, BrutalistRadarChart } from '../components/ui/bento-dashboard';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({ activeCount: 0, avgResponseTimeSec: 0, flaggedUserCount: 0 });
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, incidentsRes, usersRes] = await Promise.all([
        fetchAnalytics(),
        fetchActiveIncidents(),
        fetchFlaggedUsers()
      ]);
      
      setAnalytics(analyticsRes.data);
      setActiveIncidents(incidentsRes.data);
      setFlaggedUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadDashboardData();
  }, [user?.role, loadDashboardData]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleToggleSuspend = async (userId, isSuspended) => {
    try {
      if (isSuspended) {
        await unsuspendUser(userId);
      } else {
        await suspendUser(userId);
      }
      const [usersRes, analyticsRes] = await Promise.all([
        fetchFlaggedUsers(),
        fetchAnalytics()
      ]);
      setFlaggedUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to toggle suspension', error);
      alert('Failed to update user status.');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-12 font-mono">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200 font-sans flex transition-colors duration-200">
      {/* Texture Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 border-r-2 border-slate-700 flex flex-col p-6 z-10 shrink-0">
        <h1 className="text-xl font-black uppercase tracking-tighter mb-8 text-white border-b-2 border-slate-700 pb-2">
          NEARHELP ADMIN
        </h1>
        <div className="flex flex-col gap-2">
          <a href="#overview" className="p-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Overview</a>
          <a href="#live-map" className="p-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Live Map</a>
          <a href="#flagged-users" className="p-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Flagged Users</a>
          <button onClick={() => navigate('/')} className="p-2 text-sm font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition-colors text-left mt-auto">Exit to App</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 flex flex-col gap-12">
        <header>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 text-white">Analytics</h2>
          <p className="font-bold text-slate-500 uppercase tracking-widest text-xs md:text-sm">System Overview Dashboard</p>
        </header>

        {/* Stats Grid */}
        <section id="overview" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border-[3px] border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6">
            <div className="text-5xl font-black text-white">{analytics.activeCount}</div>
            <div className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest mt-2">Active SOS</div>
          </div>
          <div className="bg-slate-900 border-[3px] border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6">
            <div className="text-5xl font-black text-white">{analytics.avgResponseTimeSec}s</div>
            <div className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest mt-2">Avg Response Time</div>
          </div>
          <div className="bg-slate-900 border-[3px] border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] p-6">
            <div className="text-5xl font-black text-red-500">{analytics.flaggedUserCount}</div>
            <div className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest mt-2">Flagged Users</div>
          </div>
        </section>

        {/* Charts from 21st.dev Bento Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-[minmax(0,1fr)]">
          <div className="w-full min-h-[400px]">
             <BrutalistBarChart />
          </div>
          <div className="w-full min-h-[400px]">
             <BrutalistRadarChart />
          </div>
        </section>

        {/* Live Map */}
        <section id="live-map">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Live Active Incidents</h2>
          <div className="h-[400px] border-[3px] border-slate-700 bg-slate-900 p-2 shadow-[8px_8px_0px_0px_rgba(51,65,85,1)]">
            <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {activeIncidents.map(inc => (
                <PulsingPinMarker 
                  key={inc._id} 
                  incident={{
                    ...inc, 
                    broadcasterName: inc.broadcaster?.name || 'Anonymous reporter'
                  }} 
                />
              ))}
            </MapContainer>
          </div>
        </section>

        {/* Flagged Users Table */}
        <section id="flagged-users">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Flagged Users</h2>
          <div className="w-full border-[3px] border-slate-700 bg-slate-900 overflow-hidden shadow-[8px_8px_0px_0px_rgba(51,65,85,1)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-400 font-mono text-xs uppercase tracking-widest">
                  <th className="p-4 border-b-2 border-slate-700">Name</th>
                  <th className="p-4 border-b-2 border-slate-700">Email</th>
                  <th className="p-4 border-b-2 border-slate-700">False Alerts</th>
                  <th className="p-4 border-b-2 border-slate-700">Avg Rating</th>
                  <th className="p-4 border-b-2 border-slate-700">Status</th>
                  <th className="p-4 border-b-2 border-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {flaggedUsers.map(u => (
                  <tr key={u._id} className="text-sm font-bold">
                    <td className="p-4 border-b border-slate-800 text-white">{u.name}</td>
                    <td className="p-4 border-b border-slate-800 text-slate-300 font-normal">{u.email}</td>
                    <td className={`p-4 border-b border-slate-800 ${u.trust?.falseAlertCount > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                      {u.trust?.falseAlertCount || 0}
                    </td>
                    <td className="p-4 border-b border-slate-800 text-yellow-500">{u.trust?.avgRating ? u.trust.avgRating.toFixed(1) : '0.0'}★</td>
                    <td className="p-4 border-b border-slate-800">
                      {u.trust?.isSuspended 
                        ? <span className="bg-red-500/20 text-red-500 px-2 py-1 uppercase text-xs tracking-wider">Suspended</span>
                        : <span className="bg-green-500/20 text-green-500 px-2 py-1 uppercase text-xs tracking-wider">Active</span>}
                    </td>
                    <td className="p-4 border-b border-slate-800">
                      <button 
                        className={`px-3 py-1 text-xs font-black uppercase tracking-widest transition-colors border-2 ${u.trust?.isSuspended ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-slate-900' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}
                        onClick={() => handleToggleSuspend(u._id, u.trust?.isSuspended)}
                      >
                        {u.trust?.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
                {flaggedUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-mono">No flagged users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
