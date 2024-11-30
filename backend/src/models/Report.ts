import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  cat: mongoose.Types.ObjectId;
  reporter?: mongoose.Types.ObjectId;
  description: string;
  location: [number, number];
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  cat: { type: Schema.Types.ObjectId, ref: 'Cat', required: true },
  reporter: { type: Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, required: true },
  location: {
    type: [Number],
    required: true,
    index: '2dsphere'
  },
  photos: [{ type: String }]
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
ReportSchema.index({ location: '2dsphere' });

export default mongoose.model<IReport>('Report', ReportSchema);