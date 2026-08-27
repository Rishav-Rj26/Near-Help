import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Crosshair, Menu, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="relative w-screen h-screen bg-[#0a0e1a] overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3">
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-bold text-sm tracking-tight">NearHelp</span>
          {incidents.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
              {incidents.length} Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="glass rounded-xl px-4 py-2 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
            >
              Dashboard
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white transition-colors shadow-lg"
          >
            <User className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Location Error Toast */}
      <AnimatePresence>
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[1001] glass rounded-xl px-4 py-2.5 text-xs text-amber-300 border border-amber-500/20 max-w-[300px] text-center shadow-lg"
          >
            {locationError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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

      {/* SOS Button */}
      <AnimatePresence>
        {!selectedIncident && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]"
          >
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-20 h-20 rounded-full gradient-danger flex items-center justify-center text-white font-black text-xl tracking-widest glow-danger cursor-pointer group"
            >
              {/* Pulsing rings */}
              <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
              <span className="absolute inset-[-8px] rounded-full border-2 border-red-500/20 animate-pulse" />
              <span className="relative z-10 font-black text-lg tracking-wider">SOS</span>
            </motion.button>
            <p className="text-center text-[10px] text-slate-500 mt-3 font-medium tracking-wider uppercase">Tap for Emergency</p>
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
