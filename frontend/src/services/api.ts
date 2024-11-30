import { CatMarker } from '../types/cat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface FetchCatsParams {
  lat?: number;
  lng?: number;
  radius?: number; // in kilometers
  page?: number;
  limit?: number;
}

interface CatListResponse {
  cats: CatMarker[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'API request failed');
    }
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
};

export const api = {
  cats: {
    list: async (params: FetchCatsParams): Promise<CatListResponse> => {
      const queryParams = new URLSearchParams();
      if (params.lat) queryParams.append('lat', params.lat.toString());
      if (params.lng) queryParams.append('lng', params.lng.toString());
      if (params.radius) queryParams.append('radius', params.radius.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE_URL}/cats?${queryParams}`);
      return handleResponse(response);
    },

    get: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/cats/${id}`);
      return handleResponse(response);
    },

    report: async (data: {
      name: string;
      description: string;
      location: [number, number];
      status: 'lost' | 'found';
      photos?: File[];
    }) => {
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('location', JSON.stringify(data.location));
      formData.append('status', data.status);

      // Append each photo if they exist
      if (data.photos) {
        data.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const response = await fetch(`${API_BASE_URL}/cats`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });

      return handleResponse(response);
    },

    addReport: async (catId: string, data: {
      description: string;
      location: [number, number];
      photos?: File[];
    }) => {
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('location', JSON.stringify(data.location));

      // Append each photo if they exist
      if (data.photos) {
        data.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const response = await fetch(`${API_BASE_URL}/cats/${catId}/reports`, {
        method: 'POST',
        body: formData,
      });

      return handleResponse(response);
    }
  }
};