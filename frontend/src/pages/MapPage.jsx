import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { fetchNearbyIncidents, updateUserLocation } from '../services/api';

import SOSTriggerModal from '../components/SOSTriggerModal';
import PulsingPinMarker from '../components/map/PulsingPinMarker';
import ResponderMarkerLayer from '../components/map/ResponderMarkerLayer';
import ActiveIncidentPanel from '../components/incident/ActiveIncidentPanel';
import DebriefModal from '../components/incident/DebriefModal';

function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export default function MapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [incidents, setIncidents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [debriefData, setDebriefData] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const locationIntervalRef = useRef(null);
  const locationRef = useRef(location);

  useEffect(() => { locationRef.current = location; }, [location]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }

    const params = new URLSearchParams(window.location.search);
    const mockLat = params.get('lat');
    const mockLng = params.get('lng');

    if (mockLat && mockLng) {
      handleLocationUpdate(parseFloat(mockLat), parseFloat(mockLng));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleLocationUpdate(pos.coords.latitude, pos.coords.longitude),
        () => setLocationError('GPS unavailable. Showing default location.'),
        { enableHighAccuracy: true }
      );
    }

    locationIntervalRef.current = setInterval(() => {
      setIncidents(curr => curr);
    }, 5000);

    socketService.onSOSNew((incident) => setIncidents((prev) => [...prev, incident]));
    socketService.onSOSTriggered((incident) => {
      setIncidents((prev) => [...prev, incident]);
      setIsModalOpen(false);
      setSelectedIncident(incident);
    });
    socketService.onDebriefReady((data) => {
      if (selectedIncident && (selectedIncident.incidentId || selectedIncident._id) === data.incidentId) {
        setDebriefData({ incidentId: data.incidentId, questions: data.questions, responders: selectedIncident.responders || [] });
      }
    });
    socketService.onError((error) => {
      if (error.code === 'DUPLICATE_SOS') alert(error.message || 'You already have an active SOS.');
      else if (error.code === 'SUSPENDED') alert(error.message || 'Your account is suspended.');
      else if (error.code === 'RATE_LIMIT') alert(error.message || 'Please wait before triggering another SOS.');
    });

    const handleReconnect = async () => {
      const currentLoc = locationRef.current;
      if (currentLoc.lat && currentLoc.lng) {
        try {
          const { data } = await fetchNearbyIncidents(currentLoc.lng, currentLoc.lat, 5000);
          setIncidents(data);
          if (selectedIncident) socketService.joinAsResponder(selectedIncident.incidentId || selectedIncident._id);
        } catch (err) { console.error('Reconnect fetch failed', err); }
      }
    };
    socketService.onReconnect(handleReconnect);

    return () => {
      socketService.offSOSNew();
      socketService.offSOSTriggered();
      socketService.offDebriefReady();
      socketService.offReconnect(handleReconnect);
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [user, navigate, selectedIncident]);

  useEffect(() => {
    if (selectedIncident && user) {
      const intervalId = setInterval(() => {
        socketService.sendResponderLocation(selectedIncident.incidentId || selectedIncident._id, location.lng, location.lat);
      }, 4000);
      return () => clearInterval(intervalId);
    }
  }, [selectedIncident, location, user]);

  const handleLocationUpdate = async (lat, lng) => {
    setLocation({ lat, lng });
    try {
      await updateUserLocation(lng, lat);
      const { data } = await fetchNearbyIncidents(lng, lat, 5000);
      setIncidents(data);
    } catch (err) {
      console.error('Location update failed', err);
      setLocationError('Unable to refresh nearby incidents.');
    }
  };

  const handleTriggerSOS = (payload) => socketService.triggerSOS(payload);

  const handleIncidentResolved = (incidentId) => {
    setIncidents(prev => prev.filter(inc => (inc.incidentId || inc._id) !== incidentId));
    if (selectedIncident && (selectedIncident.incidentId || selectedIncident._id) === incidentId) setSelectedIncident(null);
  };

  if (!user) return null;

  return (
    <div className="relative w-screen h-screen bg-void text-slate-100 overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* HEADER / Minimalist Spatial HUD Bar */}
      <header className="absolute top-0 w-full z-40 px-4 pt-4 pb-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {user.role === 'admin' ? (
             <button 
                onClick={() => navigate('/admin')}
                className="w-10 h-10 rounded-lg hud-glass flex items-center justify-center text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-transform"
             >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
             </button>
          ) : (
            <button className="w-10 h-10 rounded-lg hud-glass flex items-center justify-center text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-transform" onClick={() => navigate('/')}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
            </button>
          )}
          
          <div className="flex flex-col">
            <span className="text-[14px] font-bold tracking-widest text-white flex items-center gap-1">
              SENTINEL <span className="text-[10px] px-1 py-0.5 rounded bg-molten/20 text-molten border border-molten/30 font-mono">3D</span>
            </span>
            <span className="text-[8.5px] font-mono text-emerald-400 flex items-center gap-1 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SPATIAL MESH ONLINE
            </span>
          </div>
        </div>
        
        {/* Telemetry Corner HUD Pill */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-300 pointer-events-auto">
          <div className="hud-glass px-2.5 py-1.5 rounded-md border border-white/10 flex items-center gap-2">
            <span className="flex items-center gap-1 text-cyan-300" title="Satellites in constellation">
              <span className="material-symbols-outlined text-[13px]">satellite_alt</span>
              <span>8 SAT</span>
            </span>
            <span className="h-2.5 w-[1px] bg-white/20"></span>
            <span className="flex items-center gap-1 text-emerald-400" title="Quantum-Encrypted Channel">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              <span>ENC</span>
            </span>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-lg hud-glass flex items-center justify-center text-slate-200 border border-white/10 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">shield_person</span>
          </button>
        </div>
      </header>

      {/* FLOATING SPATIAL HUD STATUS BANNER */}
      <div className="absolute top-[72px] w-full z-30 px-4 mt-2 flex items-center justify-between pointer-events-none">
        <div className="hud-glass pointer-events-auto px-3 py-1.5 rounded-full border border-sky-500/20 text-[10px] font-mono text-sky-300/90 flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
          NEIGHBORHOOD SENTINEL ACTIVE
        </div>
        <div className="hud-glass pointer-events-auto px-2.5 py-1.5 rounded-full border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[13px]">diversity_3</span>
          <span>RESPONDERS IN RANGE: <strong>{incidents.length > 0 ? incidents.length + 5 : '5'}</strong></span>
        </div>
      </div>

      {/* Location Error Toast */}
      <AnimatePresence>
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-[1001] hud-glass rounded-xl px-4 py-2.5 text-xs text-amber-300 border border-amber-500/20 max-w-[300px] text-center shadow-lg font-mono"
          >
            {locationError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Content */}
      <div className="absolute inset-0 z-0">
         <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            className="w-full h-full"
            zoomControl={false}
         >
            <TileLayer
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
               attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <RecenterAutomatically lat={location.lat} lng={location.lng} />

            {incidents.map((incident) => (
               <PulsingPinMarker
                  key={incident.incidentId || incident._id}
                  incident={incident}
                  onClick={(inc) => setSelectedIncident(inc)}
               />
            ))}

            {selectedIncident && (selectedIncident.broadcaster === user.id || selectedIncident.broadcaster?.toString() === user.id) && (
               <ResponderMarkerLayer incidentId={selectedIncident.incidentId || selectedIncident._id} />
            )}
         </MapContainer>
         {/* Map overlay gradient to blend with HUD */}
         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_40%,transparent_0%,rgba(5,7,12,0.6)_100%)] z-[400]" />
      </div>

      {/* MID-SCREEN INTERACTIVE ZONE: 3D Gyro Trigger Orb */}
      <AnimatePresence>
        {!selectedIncident && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-end pb-4 pointer-events-auto"
          >
            {/* Spatial Scanning Radius Selector HUD */}
            <div className="mb-6 flex items-center p-1 rounded-full hud-glass border border-white/15 shadow-2xl backdrop-blur-xl">
              <button className="px-4 py-1.5 rounded-full text-[11px] font-mono text-slate-400 hover:text-white transition-colors">500M</button>
              <button className="px-4 py-1.5 rounded-full text-[11px] font-mono font-bold bg-white/15 text-white border border-white/25 shadow-[0_0_12px_rgba(255,255,255,0.2)]">1.2KM GEO</button>
              <button className="px-4 py-1.5 rounded-full text-[11px] font-mono text-slate-400 hover:text-white transition-colors">3.0KM</button>
            </div>
            
            {/* 3D FLOATING EMERGENCY TRIGGER ORB & GIMBAL RINGS */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full gyro-ring-1 pointer-events-none"></div>
              <div className="absolute inset-2.5 rounded-full gyro-ring-2 pointer-events-none"></div>
              <div className="absolute inset-5 rounded-full gyro-ring-3 pointer-events-none"></div>
              <div className="absolute inset-4 rounded-full bg-molten/20 blur-xl animate-pulse pointer-events-none"></div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="relative w-28 h-28 rounded-full molten-core flex flex-col items-center justify-center text-white active:scale-95 transition-transform duration-200 cursor-pointer group shadow-[0_12px_36px_rgba(255,107,0,0.5)]"
              >
                <div className="absolute top-2 left-6 w-12 h-6 rounded-full bg-white/40 blur-[3px] pointer-events-none"></div>
                <span className="font-sans font-extrabold text-[26px] tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    SOS
                </span>
                <span className="text-[9px] font-mono tracking-widest text-amber-200 font-bold opacity-90 -mt-0.5">
                    TAP NOW
                </span>
              </button>
            </div>
            
            <div className="mt-3 text-center">
              <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase flex items-center justify-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                <span className="material-symbols-outlined text-[13px] text-molten">sensors</span>
                TAP FOR IMMEDIATE DISPATCH
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SOSTriggerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTriggerSOS}
        location={{ lat: location.lat, lng: location.lng }}
      />

      {selectedIncident && (
        <ActiveIncidentPanel
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onResolved={handleIncidentResolved}
        />
      )}

      {debriefData && (
        <DebriefModal
          incidentId={debriefData.incidentId}
          questions={debriefData.questions}
          responders={debriefData.responders}
          onClose={() => setDebriefData(null)}
        />
      )}
    </div>
  );
}
