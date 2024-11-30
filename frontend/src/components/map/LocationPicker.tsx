'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  initialLocation?: [number, number];
  onLocationSelected: (location: [number, number]) => void;
  onClose?: () => void;
}

// Default icon setup
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Map click handler component
const MapClickHandler: React.FC<{
  onLocationSelected: (location: [number, number]) => void;
  setMarkerPosition: (position: [number, number]) => void;
}> = ({ onLocationSelected, setMarkerPosition }) => {
  const map = useMapEvents({
    click: (e) => {
      const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
      setMarkerPosition(newPosition);
      onLocationSelected(newPosition);
    },
  });

  useEffect(() => {
    // Get user's location when component mounts
    map.locate();
  }, [map]);

  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation = [51.505, -0.09],
  onLocationSelected,
  onClose,
}) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(initialLocation);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>(initialLocation);

  const handleConfirm = () => {
    onLocationSelected(selectedLocation);
    onClose?.();
  };

  const handleMarkerUpdate = (newPosition: [number, number]) => {
    setMarkerPosition(newPosition);
    setSelectedLocation(newPosition);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Select Location</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>

        <div className="relative h-[60vh]">
          <MapContainer
            center={initialLocation}
            zoom={13}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler
              onLocationSelected={handleMarkerUpdate}
              setMarkerPosition={setMarkerPosition}
            />
            <Marker position={markerPosition} />
          </MapContainer>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm">
            <p className="font-medium">Selected coordinates:</p>
            <p className="text-gray-600">
              {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
            </p>
          </div>
          <div className="space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;