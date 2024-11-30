'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { api } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';
import { CatDetails } from '@/types/cat';
import Image from 'next/image';

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg" />
  )
});

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false
});

export default function CatDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: cat, isLoading } = useQuery<CatDetails>({
    queryKey: ['cat', id],
    queryFn: () => api.cats.get(id as string),
    enabled: !!id
  });

  const handleAddReport = async (location: [number, number]) => {
    if (!reportContent.trim()) return;
    
    setSubmitting(true);
    try {
      await api.cats.addReport(id as string, {
        description: reportContent,
        location,
        photos: selectedPhotos
      });

      setReportContent('');
      setSelectedPhotos([]);
      setShowLocationPicker(false);
    } catch (error) {
      console.error('Error adding report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-[300px] bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Cat not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{cat.name}</h1>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${cat.status === 'lost' ? 'bg-red-100 text-red-800' :
                    cat.status === 'found' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'}
                `}>
                  {cat.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Last seen: {new Date(cat.lastSeen).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-gray-600">{cat.description}</p>
        </div>

        {/* Photos */}
        {cat.photos && cat.photos.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cat.photos.map((photo, index) => (
                <div key={photo} className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1} of ${cat.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
          <div className="h-[400px] rounded-lg overflow-hidden">
            <MapComponent
              initialCenter={cat.position}
              initialZoom={15}
              markers={[cat]}
            />
          </div>
        </div>

        {/* Reports */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
            {user && (
              <button
                onClick={() => setShowLocationPicker(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Report
              </button>
            )}
          </div>

          <div className="space-y-6">
            {cat.reports.map((report) => (
              <div
                key={report.id}
                className="border-l-2 border-gray-200 pl-4 pb-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      Reported by {report.reporter.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mt-2">{report.description}</p>
                {report.photos && report.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {report.photos.map((photo, index) => (
                      <div key={photo} className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={photo}
                          alt={`Report photo ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Report Modal */}
        {showLocationPicker && (
          <LocationPicker
            initialLocation={cat.position}
            onLocationSelected={(location) => handleAddReport(location)}
            onClose={() => setShowLocationPicker(false)}
          />
        )}
      </div>
    </div>
  );
}