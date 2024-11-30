'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '../../services/api';

const LocationPicker = dynamic(
  () => import('../map/LocationPicker'),
  { ssr: false }
);

interface CatReportFormProps {
  type: 'lost' | 'found';
  initialLocation?: [number, number];
  onSubmit?: () => void;
  onClose?: () => void;
}

const CatReportForm: React.FC<CatReportFormProps> = ({
  type,
  initialLocation,
  onSubmit,
  onClose
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [location, setLocation] = useState<[number, number] | null>(initialLocation || null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError('Please select a location');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.cats.report({
        name,
        description,
        location,
        status: type,
        photos
      });
      onSubmit?.();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
      
      // Check file size (5MB per file, 20MB total)
      if (fileList.some(file => file.size > 5 * 1024 * 1024)) {
        setPhotoError('Each photo must be under 5MB');
        return;
      }
      if (totalSize > 20 * 1024 * 1024) {
        setPhotoError('Total photo size must be under 20MB');
        return;
      }
      
      // Check file types
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (fileList.some(file => !validTypes.includes(file.type))) {
        setPhotoError('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      setPhotos(fileList);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Cat Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="photos" className="block text-sm font-medium text-gray-700">
          Photos
        </label>
        <input
          type="file"
          id="photos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePhotoChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {photoError && (
          <p className="mt-1 text-sm text-red-600">{photoError}</p>
        )}
        {photos.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowLocationPicker(true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {location ? 'Change Location' : 'Select Location'}
        </button>
        {location && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {location[0].toFixed(6)}, {location[1].toFixed(6)}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>

      {showLocationPicker && (
        <LocationPicker
          initialLocation={location || initialLocation}
          onLocationSelected={(newLocation) => {
            setLocation(newLocation);
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </form>
  );
};

export default CatReportForm;