import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicalRecord extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  date: string;
  type: 'lab_report' | 'diagnostic' | 'prescription' | 'vaccination' | 'surgery' | 'other';
  doctor?: string;
  hospital?: string;
  notes?: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['lab_report', 'diagnostic', 'prescription', 'vaccination', 'surgery', 'other'],
      required: true,
    },
    doctor: {
      type: String,
      trim: true,
    },
    hospital: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

MedicalRecordSchema.index({ userId: 1, date: -1 });

const MedicalRecord: Model<IMedicalRecord> = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);

export default MedicalRecord;
