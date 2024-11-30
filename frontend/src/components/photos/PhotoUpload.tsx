'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';

interface PhotoUploadProps {
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes, default 5MB
  maxTotalSize?: number; // in bytes, default 20MB
  onChange: (files: File[]) => void;
  className?: string;
}

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_SIZE_PER_FILE = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB

export default function PhotoUpload({
  maxFiles = DEFAULT_MAX_FILES,
  maxSizePerFile = DEFAULT_MAX_SIZE_PER_FILE,
  maxTotalSize = DEFAULT_MAX_TOTAL_SIZE,
  onChange,
  className = ''
}: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(async (files: FileList) => {
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    let totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

    for (const file of Array.from(files)) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      // Check file size
      if (file.size > maxSizePerFile) {
        setError(`File ${file.name} is too large (max ${maxSizePerFile / 1024 / 1024}MB)`);
        return;
      }

      totalSize += file.size;
      if (totalSize > maxTotalSize) {
        setError(`Total file size exceeds ${maxTotalSize / 1024 / 1024}MB`);
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
      newFiles.push(file);

      if (newFiles.length + selectedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }
    }

    // Update state and notify parent
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    onChange([...selectedFiles, ...newFiles]);
    setError(null);
  }, [selectedFiles, maxFiles, maxSizePerFile, maxTotalSize, onChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    onChange(selectedFiles.filter((_, i) => i !== index));
  }, [previews, selectedFiles, onChange]);

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop photos here, or click to select
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Max {maxFiles} files, {maxSizePerFile / 1024 / 1024}MB per file
          </p>
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={preview} className="relative aspect-square">
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}