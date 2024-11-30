import mongoose, { Schema, Document } from 'mongoose';

export interface ICat extends Document {
  name: string;
  description: string;
  owner?: mongoose.Types.ObjectId;  // Made optional
  photos: string[];
  lastSeen?: {
    location: [number, number];
    timestamp: Date;
  };
  status: 'home' | 'lost' | 'found';
}

const CatSchema = new Schema<ICat>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: false },  // Made not required
  photos: [{ type: String }],
  lastSeen: {
    location: {
      type: [Number],
      index: '2dsphere'
    },
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['home', 'lost', 'found'],
    required: true,
    default: 'home'
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
CatSchema.index({ 'lastSeen.location': '2dsphere' });

export default mongoose.model<ICat>('Cat', CatSchema);