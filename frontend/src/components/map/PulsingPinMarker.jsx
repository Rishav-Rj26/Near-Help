import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const CRISIS_COLORS = {
  medical: 'rgba(59, 130, 246, 1)',   // blue-500
  fire: 'rgba(239, 68, 68, 1)',      // red-500
  gas_leak: 'rgba(249, 115, 22, 1)', // orange-500
  accident: 'rgba(168, 85, 247, 1)', // purple-500
  threat: 'rgba(159, 18, 57, 1)',    // rose-800
  other: 'rgba(100, 116, 139, 1)',   // slate-500
};

export default function PulsingPinMarker({ incident, onClick }) {
  const { location, crisisType, radius } = incident;
  const [lng, lat] = location.coordinates;

  const color = CRISIS_COLORS[crisisType] || CRISIS_COLORS.other;
  
  // Leaflet markers use a small HTML fragment so their pulse animation remains self-contained.
  const styleStr = `
    <style>
      @keyframes pulseRing {
        0% { transform: scale(0.5); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; background-color: ${color}; border-radius: 50%; animation: pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
      <div style="position: relative; width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; border: 2px solid white; z-index: 10;"></div>
    </div>
  `;

  const icon = L.divIcon({
    html: styleStr,
    className: 'nearhelp-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const handleClick = () => {
    if (onClick) {
      onClick(incident);
    }
  };

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      {!onClick && (
        <Popup>
          <div className="font-mono text-sm">
            <strong className="uppercase text-xs tracking-widest text-slate-500">Incident:</strong><br />
            <span className="font-bold">{crisisType}</span>
            <br /><br />
            <strong className="uppercase text-xs tracking-widest text-slate-500">Radius:</strong><br />
            <span className="font-bold">{radius}m</span>
          </div>
        </Popup>
      )}
    </Marker>
  );
}
