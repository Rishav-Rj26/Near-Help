import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { fetchNearbyIncidents, updateUserLocation } from '../services/api';

import SOSTriggerModal from '../components/SOSTriggerModal';
import PulsingPinMarker from '../components/map/PulsingPinMarker';
import ResponderMarkerLayer from '../components/map/ResponderMarkerLayer';
import ActiveIncidentPanel from '../components/incident/ActiveIncidentPanel';
import DebriefModal from '../components/incident/DebriefModal';

// Helper component to center map on user location
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

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const mockLat = params.get('lat');
    const mockLng = params.get('lng');

    const updateLoc = (lat, lng) => {
      handleLocationUpdate(lat, lng);
    };

    if (mockLat && mockLng) {
      updateLoc(parseFloat(mockLat), parseFloat(mockLng));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateLoc(pos.coords.latitude, pos.coords.longitude),
        () => setLocationError('Location access is unavailable. Showing Delhi until you enable GPS.'),
        { enableHighAccuracy: true }
      );
    }

    locationIntervalRef.current = setInterval(() => {
       setIncidents(currentIncidents => currentIncidents);
    }, 5000);

    socketService.onSOSNew((incident) => {
      setIncidents((prev) => [...prev, incident]);
    });

    socketService.onSOSTriggered((incident) => {
      setIncidents((prev) => [...prev, incident]);
      setIsModalOpen(false);
      setSelectedIncident(incident);
    });

    socketService.onDebriefReady((data) => {
      if (selectedIncident && (selectedIncident.incidentId || selectedIncident._id) === data.incidentId) {
        setDebriefData({
          incidentId: data.incidentId,
          questions: data.questions,
          responders: selectedIncident.responders || [],
        });
      }
    });

    socketService.onError((error) => {
      if (error.code === 'DUPLICATE_SOS') {
        alert(error.message || 'You already have an active SOS.');
      } else if (error.code === 'SUSPENDED') {
        alert(error.message || 'Your account is suspended.');
      } else if (error.code === 'RATE_LIMIT') {
        alert(error.message || 'Please wait before triggering another SOS.');
      }
    });

    const handleReconnect = async () => {
      console.log('Socket reconnected, refreshing state...');
      const currentLoc = locationRef.current;
      if (currentLoc.lat && currentLoc.lng) {
        try {
          const { data } = await fetchNearbyIncidents(currentLoc.lng, currentLoc.lat, 5000);
          setIncidents(data);
          
          if (selectedIncident) {
            socketService.joinAsResponder(selectedIncident.incidentId || selectedIncident._id);
          }
        } catch (err) {
          console.error('Failed to re-fetch incidents on reconnect', err);
        }
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
      console.error('Failed to update location/fetch incidents', err);
      setLocationError('Unable to refresh nearby incidents. Check your connection and try again.');
    }
  };

  const handleTriggerSOS = (payload) => {
    socketService.triggerSOS(payload);
  };

  const handleIncidentResolved = (incidentId) => {
    setIncidents(prev => prev.filter(inc => (inc.incidentId || inc._id) !== incidentId));
    if (selectedIncident && (selectedIncident.incidentId || selectedIncident._id) === incidentId) {
        setSelectedIncident(null);
    }
  };

  if (!user) return null;

  return (
    <div className="relative w-screen h-screen bg-slate-950 font-sans transition-colors duration-200">
      <button 
        onClick={() => navigate('/profile')} 
        title="My Profile"
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-slate-900 border-[3px] border-white text-white flex items-center justify-center text-xl cursor-pointer z-[1000] shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:translate-x-0 active:shadow-[0px_0px_0px_0px_rgba(255,255,255,1)] transition-all"
      >
        👤
      </button>

      {locationError && (
        <div role="alert" className="absolute top-4 left-4 z-[1001] max-w-[300px] p-3 rounded-none bg-yellow-400 border-2 border-black text-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {locationError}
        </div>
      )}

      <MapContainer 
        center={[location.lat, location.lng]} 
        zoom={15} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <RecenterAutomatically lat={location.lat} lng={location.lng} />

        {(!location.lat || !location.lng || (location.lat === 28.6139 && location.lng === 77.2090)) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white border-[3px] border-black p-2 font-black text-xs uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Showing default location
          </div>
        )}

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

      {/* SOS Button Overlay */}
      <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] ${selectedIncident ? 'hidden' : 'block'}`}>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-24 h-24 rounded-full bg-red-600 border-[4px] border-white flex items-center justify-center text-white font-black text-2xl tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.8),_0_0_40px_rgba(220,38,38,0.6),_0_0_60px_rgba(220,38,38,0.4)] animate-pulse hover:scale-110 active:scale-95 transition-transform"
        >
          SOS
        </button>
      </div>

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
