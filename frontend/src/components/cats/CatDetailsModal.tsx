'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CatDetails } from '../../types/cat';
import dynamic from 'next/dynamic';

const PhotoGallery = dynamic(() => import('../photos/PhotoGallery'), { ssr: false });

interface CatDetailsModalProps {
  catId: string;
  onClose: () => void;
}

const CatDetailsModal: React.FC<CatDetailsModalProps> = ({ catId, onClose }) => {
  const { data: cat, isLoading } = useQuery<CatDetails>({
    queryKey: ['cat', catId],
    queryFn: () => api.cats.get(catId),
    enabled: !!catId,
  });

  if (!catId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isLoading ? 'Loading...' : cat?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : cat ? (
            <div className="space-y-6">
              {cat.photos && cat.photos.length > 0 && (
                <PhotoGallery photos={cat.photos} />
              )}

              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${cat.status === 'lost' ? 'bg-red-100 text-red-800' :
                    cat.status === 'found' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'}
                `}>
                  {cat.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Last Seen</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>📍</span>
                  <p>{new Date(cat.lastSeen).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{cat.description}</p>
              </div>

              {cat.reports && cat.reports.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Recent Reports</h3>
                  <div className="space-y-4">
                    {cat.reports.map((report) => (
                      <div
                        key={report.id}
                        className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-0"
                      >
                        <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-blue-500" />
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-600">{report.description}</p>
                          
                          {report.photos && report.photos.length > 0 && (
                            <div className="mt-3">
                              <PhotoGallery photos={report.photos} />
                            </div>
                          )}
                          
                          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                            <span>{report.reporter.name}</span>
                            <time>{new Date(report.timestamp).toLocaleString()}</time>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-red-500">
              Error loading cat details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatDetailsModal;