'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';

interface PhotoGalleryProps {
  photos: string[];
  className?: string;
}

export default function PhotoGallery({ photos, className = '' }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (selectedPhoto && currentIndex < photos.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedPhoto(photos[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (selectedPhoto && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setSelectedPhoto(photos[currentIndex - 1]);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handlePhotoClick = (photo: string, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setSelectedPhoto(null);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {photos.map((photo, index) => (
          <div
            key={photo}
            className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden bg-gray-100"
            onClick={() => handlePhotoClick(photo, index)}
          >
            <Image
              src={photo}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* Full-screen gallery modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          <div
            className="relative max-w-7xl w-full h-full flex items-center justify-center p-4"
            {...handlers}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-opacity disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedPhoto}
                alt="Full size"
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-opacity disabled:opacity-50"
              disabled={currentIndex === photos.length - 1}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}