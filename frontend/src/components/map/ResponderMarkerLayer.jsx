import React, { useEffect, useState, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { socketService } from '../../services/socket';

/**
 * ResponderMarkerLayer
 *
 * Renders and live-updates responder markers on the broadcaster's map.
 * Listens for `responder:location:update` events and flags markers
 * "last seen" if no update arrives within 60 seconds.
 */
export default function ResponderMarkerLayer({ incidentId }) {
  // Map of responderId -> { coordinates: [lng, lat], timestamp }
  const [responderPositions, setResponderPositions] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now);
  const staleTimerRef = useRef(null);

  useEffect(() => {
    const handleLocationUpdate = (data) => {
      if (data.incidentId !== incidentId) return;

      setResponderPositions((prev) => ({
        ...prev,
        [data.responderId]: {
          coordinates: data.coordinates,
          timestamp: data.timestamp,
        },
      }));
    };

    socketService.onResponderLocationUpdate(handleLocationUpdate);

    // Re-evaluate marker freshness every 10 seconds without reading the clock in render.
    staleTimerRef.current = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);

    return () => {
      socketService.offResponderLocationUpdate(handleLocationUpdate);
      clearInterval(staleTimerRef.current);
    };
  }, [incidentId]);

  const createResponderIcon = (isStale) => {
    const color = isStale ? '#5B6B7C' : '#1F9E6D'; // grey if stale, verified green if fresh
    const size = 14;
    const html = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid #F4F6F3;
        box-shadow: 0 0 6px ${color}80;
        ${isStale ? 'opacity: 0.6;' : ''}
      "></div>
    `;
    return L.divIcon({
      html,
      className: 'responder-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <>
      {Object.entries(responderPositions).map(([responderId, data]) => {
        const [lng, lat] = data.coordinates;
        const timestamp = new Date(data.timestamp).getTime();
        const secondsSinceUpdate = Number.isFinite(timestamp) ? Math.max(0, (currentTime - timestamp) / 1000) : Infinity;
        const isStale = secondsSinceUpdate > 60;
        const icon = createResponderIcon(isStale);

        return (
          <Marker key={responderId} position={[lat, lng]} icon={icon}>
            <Popup>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px' }}>
                <strong>Responder</strong>
                <br />
                {isStale ? (
                  <span style={{ color: '#5B6B7C' }}>Last seen {Math.round(secondsSinceUpdate)}s ago</span>
                ) : (
                  <span style={{ color: '#1F9E6D' }}>Active</span>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
