export interface CatMarker {
  id: string;
  name: string;
  position: [number, number];  // [longitude, latitude]
  status: 'lost' | 'found' | 'home';
  lastSeen: string;  // ISO date string
  description?: string;
  thumbnailUrl?: string;
}

export interface CatDetails extends CatMarker {
  description: string;
  photos: string[];
  reports: Report[];
}

export interface Report {
  id: string;
  location: [number, number];
  description: string;
  timestamp: string;
  photos?: string[];
  reporter: {
    id: string;
    name: string;
  };
}