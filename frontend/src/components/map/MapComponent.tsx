'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CatMarker } from '@/types/cat';

// Default icon settings
const defaultIcon = L.icon({
  iconUrl: '/assets/markers/lost.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Create icons for different statuses
const icons = {
  lost: L.icon({
    iconUrl: '/assets/markers/lost.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  found: L.icon({
    iconUrl: '/assets/markers/found.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  home: L.icon({
    iconUrl: '/assets/markers/home.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
};

// Ensure default marker icon is set
L.Marker.prototype.options.icon = defaultIcon;

// Map event handler component
const MapEventHandler = ({ onMoveEnd }: { onMoveEnd: (center: [number, number], zoom: number) => void }) => {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      onMoveEnd([center.lat, center.lng], map.getZoom());
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMoveEnd]);

  return null;
};

interface MapComponentProps {
  initialCenter: [number, number];
  initialZoom: number;
  markers?: CatMarker[];
  onMarkerClick?: (id: string) => void;
  onMapMove?: (center: [number, number], zoom: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialCenter,
  initialZoom,
  markers = [],
  onMarkerClick,
  onMapMove
}) => {
  const mapRef = useRef<L.Map>(null);

  const handleMapMove = useCallback((center: [number, number], zoom: number) => {
    onMapMove?.(center, zoom);
  }, [onMapMove]);

  // Initialize map view
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.setView(initialCenter, initialZoom);
    }
  }, [initialCenter, initialZoom]);

  console.log('Markers received:', markers); // Debug log

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      className="w-full h-full"
      zoomControl={false}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEventHandler onMoveEnd={handleMapMove} />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          // Convert [longitude, latitude] to [latitude, longitude] for Leaflet
          position={[marker.position[1], marker.position[0]]}
          icon={icons[marker.status] || defaultIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.id)
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{marker.name}</h3>
              <p className="text-sm text-gray-600">
                Status: <span className="capitalize">{marker.status}</span>
              </p>
              <p className="text-sm text-gray-600">
                Last seen: {new Date(marker.lastSeen).toLocaleDateString()}
              </p>
              {marker.description && (
                <p className="text-sm text-gray-600 mt-2">{marker.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;