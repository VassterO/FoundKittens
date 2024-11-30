export interface GetCatsQuery {
  lat: number;
  lng: number;
  radius: number;
  page: number;
  limit: number;
}

export interface CatListResponse {
  cats: Array<{
    id: string;
    name: string;
    position: [number, number];
    status: 'lost' | 'found' | 'home';
    lastSeen: string;
    thumbnailUrl?: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CatDetailResponse {
  id: string;
  name: string;
  position: [number, number];
  status: 'lost' | 'found' | 'home';
  lastSeen: string;
  description: string;
  photos: string[];
  reports: Array<{
    id: string;
    location: [number, number];
    description: string;
    timestamp: string;
    photos?: string[];
    reporter: {
      id: string;
      name: string;
    };
  }>;
}