import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerDonor extends Document {
  name: string;
  phone: string;
  bloodType: string;
  isAvailable: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerDonorSchema = new Schema<IVolunteerDonor>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    bloodType: { 
      type: String, 
      required: true, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
    },
    isAvailable: { type: Boolean, default: true },
    totalDonations: { type: Number, default: 0 },
    lastDonationDate: { type: String, default: null },
    city: { type: String, default: 'Mumbai' },
  },
  { timestamps: true }
);

export default mongoose.models.VolunteerDonor || mongoose.model<IVolunteerDonor>('VolunteerDonor', VolunteerDonorSchema);
