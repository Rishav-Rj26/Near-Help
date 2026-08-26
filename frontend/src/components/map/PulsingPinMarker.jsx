import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { PulsingPin } from '../ui/PulsingPin.stitch';

export default function PulsingPinMarker({ incident, onClick }) {
  const { location, crisisType, radius } = incident;
  const [lng, lat] = location.coordinates;

  // Render the Stitches component to an HTML string for Leaflet's DivIcon
  const pinHtml = renderToString(<PulsingPin crisisType={crisisType} pulse />);

  const icon = L.divIcon({
    html: pinHtml,
    className: 'nearhelp-pin', // remove default leaflet styles
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
          <strong>Incident:</strong> {crisisType}
          <br />
          <strong>Radius:</strong> {radius}m
          <br />
          <strong>By:</strong> {incident.broadcasterName}
        </Popup>
      )}
    </Marker>
  );
}
