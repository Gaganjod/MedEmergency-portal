import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHealthMetric extends Document {
  userId: mongoose.Types.ObjectId;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodSugar?: number;
  weight?: number;
  height?: number;
  temperature?: number;
  oxygenLevel?: number;
  notes?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HealthMetricSchema = new Schema<IHealthMetric>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    heartRate: {
      type: Number,
      min: 30,
      max: 250,
    },
    bloodPressureSystolic: {
      type: Number,
      min: 50,
      max: 250,
    },
    bloodPressureDiastolic: {
      type: Number,
      min: 30,
      max: 150,
    },
    bloodSugar: {
      type: Number,
      min: 20,
      max: 600,
    },
    weight: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    temperature: {
      type: Number,
      min: 90,
      max: 110,
    },
    oxygenLevel: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const HealthMetric: Model<IHealthMetric> = 
  mongoose.models.HealthMetric || mongoose.model<IHealthMetric>('HealthMetric', HealthMetricSchema);

export default HealthMetric;
