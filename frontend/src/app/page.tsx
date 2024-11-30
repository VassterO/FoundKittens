'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { api } from '../services/api';
import Header from '../components/layout/Header';
import MapControls from '../components/layout/MapControls';

// Import components dynamically to avoid SSR issues
const MapComponent = dynamic(
  () => import('../components/map/MapComponent'),
  { ssr: false }
);

const ReportModal = dynamic(
  () => import('../components/cats/ReportModal'),
  { ssr: false }
);

const CatDetailsModal = dynamic(
  () => import('../components/cats/CatDetailsModal'),
  { ssr: false }
);

export default function Home() {
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
  const [zoom, setZoom] = useState(13);
  const [radius] = useState(10); // 10km radius
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'lost' | 'found' | null>(null);
  const [isListView, setIsListView] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['cats', center, radius],
    queryFn: () => api.cats.list({
      lat: center[0],
      lng: center[1],
      radius: radius,
      limit: 100
    }),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const handleMyLocation = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setZoom(15);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 1, 18));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 1, 3));
  }, []);

  const handleMapMove = useCallback((newCenter: [number, number], newZoom: number) => {
    setCenter(newCenter);
    setZoom(newZoom);
  }, []);

  const mapControls = useMemo(() => (
    <MapControls
      onMyLocation={handleMyLocation}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
    />
  ), [handleMyLocation, handleZoomIn, handleZoomOut]);

  return (
    <div className="relative min-h-screen">
      {/* Map Container - Moving it to the top level but keeping it behind other elements */}
      <div className="fixed inset-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-lg text-red-500">Error loading map data</div>
          </div>
        ) : (
          <MapComponent
            initialCenter={center}
            initialZoom={zoom}
            markers={data?.cats || []}
            onMarkerClick={setSelectedCatId}
            onMapMove={handleMapMove}
          />
        )}
      </div>

      {/* UI Overlays - Only the actual UI elements should have higher z-index */}
      <div className="relative z-10 pointer-events-none"> {/* This wrapper doesn't block map interactions */}
        {/* Header - Re-enable pointer events for the header */}
        <div className="pointer-events-auto">
          <Header
            onReportLostCat={() => setReportType('lost')}
            onReportFoundCat={() => setReportType('found')}
          />
        </div>

        {/* Side Panel - Cat List */}
        {isListView && !isLoading && data?.cats && (
          <div className="fixed left-4 top-32 bottom-4 w-96 bg-white/95 backdrop-blur-sm 
            rounded-lg shadow-lg overflow-hidden pointer-events-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Nearby Cats ({data.cats.length})
              </h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-4">
              {data.cats.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md 
                    transition-shadow cursor-pointer"
                >
                  <div className="flex space-x-4">
                    {cat.thumbnailUrl ? (
                      <img 
                        src={cat.thumbnailUrl} 
                        alt={cat.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 
                        flex items-center justify-center">
                        🐱
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{cat.name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full 
                        text-xs font-medium mt-1 ${
                          cat.status === 'lost' 
                            ? 'bg-red-100 text-red-800'
                            : cat.status === 'found'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {cat.status.toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Last seen: {new Date(cat.lastSeen).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="fixed bottom-8 right-8 z-20 pointer-events-auto">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => setIsListView(!isListView)}
              className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center 
                justify-center hover:bg-gray-50 transition-colors"
              title={isListView ? "Hide List" : "Show List"}
            >
              {isListView ? "🗺️" : "📋"}
            </button>
            {mapControls}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedCatId && (
        <CatDetailsModal
          catId={selectedCatId}
          onClose={() => setSelectedCatId(null)}
        />
      )}

      {reportType && (
        <ReportModal
          type={reportType}
          initialLocation={center}
          onClose={() => setReportType(null)}
        />
      )}
    </div>
  );
}