# FoundKittens Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # Reusable components
│   │   ├── ui/      # Basic UI components
│   │   ├── map/     # Map-related components
│   │   └── forms/   # Form components
│   ├── lib/         # Utilities and helpers
│   ├── hooks/       # Custom React hooks
│   ├── services/    # API service calls
│   └── types/       # TypeScript types
├── public/          # Static files
└── package.json
```

## Key Features

### Map Interface
- Interactive map for lost cat locations
- Cluster visualization for multiple reports
- Area-based search functionality
- Location picker for new reports

### Cat Profiles
- Cat information display
- Photo gallery
- Status updates
- Sighting history

### User Features
- Authentication
- Profile management
- Report creation
- Sighting submissions

## Component Guidelines

### MapComponent
```typescript
interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: MarkerData[];
  onMarkerClick?: (id: string) => void;
  onLocationSelect?: (coords: [number, number]) => void;
}
```

### CatCard
```typescript
interface CatCardProps {
  cat: {
    id: string;
    name: string;
    photos: string[];
    status: 'home' | 'lost' | 'found';
    lastSeen?: {
      location: [number, number];
      timestamp: Date;
    };
  };
  onStatusChange?: (status: string) => void;
}
```

### ReportForm
```typescript
interface ReportFormProps {
  onSubmit: (data: ReportData) => void;
  initialLocation?: [number, number];
  catId?: string;
}
```

## State Management

We use a combination of:
- React Context for global state
- React Query for API data
- Local state for component-specific data

## API Integration

All API calls are centralized in the `services` directory:
```typescript
// services/api.ts
export const api = {
  cats: {
    list: () => fetch('/api/cats'),
    get: (id: string) => fetch(`/api/cats/${id}`),
    create: (data: CatData) => fetch('/api/cats', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  // ... more endpoints
};
```

## Styling

- Tailwind CSS for utility classes
- CSS Modules for component-specific styles
- Global styles in `app/globals.css`