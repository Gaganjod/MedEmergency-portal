import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAmbulance extends Document {
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  status: 'available' | 'on_route' | 'busy';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  hospitalId?: string;
  vehicleType: 'basic' | 'advanced' | 'critical';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AmbulanceSchema = new Schema<IAmbulance>(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverPhone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'on_route', 'busy'],
      default: 'available',
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    hospitalId: {
      type: String,
    },
    vehicleType: {
      type: String,
      enum: ['basic', 'advanced', 'critical'],
      default: 'basic',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Ambulance: Model<IAmbulance> = mongoose.models.Ambulance || mongoose.model<IAmbulance>('Ambulance', AmbulanceSchema);

export default Ambulance;
