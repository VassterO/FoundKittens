'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import CatReportForm dynamically to avoid SSR issues
const CatReportForm = dynamic(
  () => import('./CatReportForm'),
  { ssr: false }
);

interface ReportModalProps {
  type: 'lost' | 'found';
  initialLocation?: [number, number];
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ type, initialLocation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Report {type === 'lost' ? 'Lost' : 'Found'} Cat
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
          <CatReportForm
            type={type}
            initialLocation={initialLocation}
            onSubmit={onClose}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportModal;