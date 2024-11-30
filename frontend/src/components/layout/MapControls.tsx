'use client';

import React from 'react';

interface MapControlsProps {
  onMyLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onMyLocation,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={onMyLocation}
        className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center"
        title="Go to my location"
      >
        📍
      </button>
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center text-xl"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center text-xl"
        title="Zoom out"
      >
        −
      </button>
    </div>
  );
};

export default MapControls;