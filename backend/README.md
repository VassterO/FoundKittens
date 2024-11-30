# FoundKittens Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure MongoDB is running locally
   - Database Name: foundkittens
   - Port: 27017
   - No authentication required for local development

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── index.ts       # Application entry point
├── tests/             # Test files
├── package.json
└── tsconfig.json
```

## API Endpoints

### Cats
- `GET /api/cats` - List cats
- `POST /api/cats` - Create cat profile
- `GET /api/cats/:id` - Get cat details
- `PUT /api/cats/:id` - Update cat profile
- `DELETE /api/cats/:id` - Delete cat profile

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `GET /api/reports/:id` - Get report details
- `PUT /api/reports/:id` - Update report
- `POST /api/reports/:id/sightings` - Add sighting

### Users
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile

## Database Models

### Cat
```typescript
interface Cat {
  name: string;
  description: string;
  owner: ObjectId;
  photos: string[];
  lastSeen?: {
    location: [number, number];
    timestamp: Date;
  };
  status: 'home' | 'lost' | 'found';
}
```

### Report
```typescript
interface Report {
  cat: ObjectId;
  reporter: ObjectId;
  location: [number, number];
  description: string;
  photos?: string[];
  status: 'active' | 'resolved';
  sightings: ObjectId[];
}
```

### User
```typescript
interface User {
  email: string;
  name: string;
  phone?: string;
  cats: ObjectId[];
  reports: ObjectId[];
}
```