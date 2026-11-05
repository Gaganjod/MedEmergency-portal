import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  specializations: string[];
  rating: number;
  waitTime: number;
  availableBeds: number;
  totalBeds: number;
  ambulanceCount: number;
  isEmergencyAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    specializations: [{
      type: String,
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    waitTime: {
      type: Number,
      default: 0,
    },
    availableBeds: {
      type: Number,
      default: 0,
    },
    totalBeds: {
      type: Number,
      required: true,
    },
    ambulanceCount: {
      type: Number,
      default: 0,
    },
    isEmergencyAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Hospital: Model<IHospital> = mongoose.models.Hospital || mongoose.model<IHospital>('Hospital', HospitalSchema);

export default Hospital;
