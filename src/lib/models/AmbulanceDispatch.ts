import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAmbulanceDispatch extends Document {
  dispatchId: string;
  patientId: string;
  ambulanceId: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED';
  dispatchedAt: Date;
  etaMinutes: number;
  destination: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

const AmbulanceDispatchSchema = new Schema<IAmbulanceDispatch>(
  {
    dispatchId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    ambulanceId: { type: String, required: true },
    status: { type: String, enum: ['DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED'], default: 'DISPATCHED' },
    dispatchedAt: { type: Date, default: Date.now },
    etaMinutes: { type: Number, required: true },
    destination: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const AmbulanceDispatch: Model<IAmbulanceDispatch> =
  mongoose.models.AmbulanceDispatch || mongoose.model<IAmbulanceDispatch>('AmbulanceDispatch', AmbulanceDispatchSchema);

export default AmbulanceDispatch;
