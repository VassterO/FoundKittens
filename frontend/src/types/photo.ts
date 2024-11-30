export interface PhotoDimensions {
  width: number;
  height: number;
}

export interface PhotoSizes {
  thumbnail: PhotoDimensions;
  preview: PhotoDimensions;
  full: PhotoDimensions;
}

export interface PhotoUploadResponse {
  urls: {
    thumbnail: string;
    preview: string;
    full: string;
  };
  metadata: {
    originalName: string;
    size: number;
    mimeType: string;
  };
}