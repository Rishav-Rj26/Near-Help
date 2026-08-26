import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import { styled } from '../styles/theme';
import { socketService } from '../services/socket';
import { fetchNearbyIncidents, updateUserLocation } from '../services/api';

import { Button } from '../components/ui/Button.stitch';
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

const ProfileButton = styled('button', {
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  border: '1px solid #E8EAED',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  cursor: 'pointer',
  zIndex: 1000,
});

export default function MapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: Delhi
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

    // 1. Get user location (using mockable geolocation)
    // For manual testing, you can read from URL params: ?lat=...&lng=...
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

    // Phase 2: Start an interval to periodically send location updates if we are actively responding
    // In a real app, this would use watchPosition, but an interval is fine for this demo.
    locationIntervalRef.current = setInterval(() => {
       // We can just rely on the latest state if we use a functional update, but here we just
       // use the current location state. We should ideally only send this if we are a responder
       // to some active incident, but for simplicity we'll just emit it for any selected incident.
       setIncidents(currentIncidents => {
           // Find if we are a responder to any active incident
           // For now, we'll just emit location if we have a selected incident
           return currentIncidents;
       });
    }, 5000);

    // 2. Setup socket listeners
    socketService.onSOSNew((incident) => {
      setIncidents((prev) => [...prev, incident]);
    });

    socketService.onSOSTriggered((incident) => {
      setIncidents((prev) => [...prev, incident]);
      setIsModalOpen(false);
      // Auto-open panel for our own incident
      setSelectedIncident(incident);
    });

    socketService.onDebriefReady((data) => {
      // Only show debrief to the broadcaster of the incident
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

    // Handle reconnection by re-fetching incidents and re-joining room if active
    const handleReconnect = async () => {
      console.log('Socket reconnected, refreshing state...');
      const currentLoc = locationRef.current;
      if (currentLoc.lat && currentLoc.lng) {
        try {
          const { data } = await fetchNearbyIncidents(currentLoc.lng, currentLoc.lat, 5000);
          setIncidents(data);
          
          // Re-join the active incident room if we were looking at one
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

  // Phase 2: Location sharing loop for responders
  useEffect(() => {
    if (selectedIncident && user) {
        const intervalId = setInterval(() => {
            // We emit our location for the selected incident
            // The server throttles this to every 3s and verifies we are actually a responder
            socketService.sendResponderLocation(selectedIncident.incidentId || selectedIncident._id, location.lng, location.lat);
        }, 4000);
        return () => clearInterval(intervalId);
    }
  }, [selectedIncident, location, user]);

  const handleLocationUpdate = async (lat, lng) => {
    setLocation({ lat, lng });
    
    // Update server via API
    try {
      await updateUserLocation(lng, lat);
      // Fetch initial nearby incidents
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
    // Remove the incident from the map
    setIncidents(prev => prev.filter(inc => (inc.incidentId || inc._id) !== incidentId));
    if (selectedIncident && (selectedIncident.incidentId || selectedIncident._id) === incidentId) {
        setSelectedIncident(null);
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#0B1F33' }}>
      <ProfileButton onClick={() => navigate('/profile')} title="My Profile">
        👤
      </ProfileButton>
      {locationError && (
        <div role="alert" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1001, maxWidth: '300px', padding: '10px 14px', borderRadius: '8px', background: '#FFF3CD', color: '#5C4300', fontSize: '13px' }}>
          {locationError}
        </div>
      )}

      <MapContainer 
        center={[location.lat, location.lng]} 
        zoom={15} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <RecenterAutomatically lat={location.lat} lng={location.lng} />

        {(!location.lat || !location.lng || (location.lat === 28.6139 && location.lng === 77.2090)) && (
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            Showing default location (Enable GPS for accuracy)
          </div>
        )}

        {incidents.map((incident) => (
          <PulsingPinMarker 
            key={incident.incidentId || incident._id} 
            incident={incident} 
            onClick={(inc) => setSelectedIncident(inc)}
          />
        ))}

        {/* Phase 2: Live responder locations on the broadcaster's map */}
        {selectedIncident && (selectedIncident.broadcaster === user.id || selectedIncident.broadcaster?.toString() === user.id) && (
            <ResponderMarkerLayer incidentId={selectedIncident.incidentId || selectedIncident._id} />
        )}
      </MapContainer>

      {/* SOS Button Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: selectedIncident ? 'none' : 'block' // hide when panel is open
      }}>
        <Button 
          intent="sos" 
          size="circle" 
          onClick={() => setIsModalOpen(true)}
          style={{ width: '80px', height: '80px', fontSize: '18px', boxShadow: '0 4px 12px rgba(255,122,26,0.3)' }}
        >
          SOS
        </Button>
      </div>

      <SOSTriggerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTriggerSOS}
        location={{ lat: location.lat, lng: location.lng }}
      />

      {/* Phase 2: Active Incident Panel */}
      {selectedIncident && (
        <ActiveIncidentPanel
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onResolved={handleIncidentResolved}
        />
      )}

      {/* Phase 3: Debrief Modal */}
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
