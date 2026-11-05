import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmergency extends Document {
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone: string;
  emergencyType: string;
  symptoms: string[];
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'pending' | 'accepted' | 'ambulance_dispatched' | 'in_transit' | 'arrived' | 'completed' | 'cancelled';
  assignedHospitalId?: mongoose.Types.ObjectId;
  assignedAmbulanceId?: string;
  estimatedArrival?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencySchema = new Schema<IEmergency>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    patientName: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
      required: true,
    },
    emergencyType: {
      type: String,
      required: true,
    },
    symptoms: [{
      type: String,
    }],
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'ambulance_dispatched', 'in_transit', 'arrived', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedHospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    assignedAmbulanceId: {
      type: String,
    },
    estimatedArrival: {
      type: Number,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Emergency: Model<IEmergency> = mongoose.models.Emergency || mongoose.model<IEmergency>('Emergency', EmergencySchema);

export default Emergency;
