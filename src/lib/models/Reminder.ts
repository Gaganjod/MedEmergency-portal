import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  notes?: string;
  taken: boolean;
  takenAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'as_needed'],
      default: 'daily',
    },
    notes: {
      type: String,
      trim: true,
    },
    taken: {
      type: Boolean,
      default: false,
    },
    takenAt: {
      type: Date,
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

ReminderSchema.index({ userId: 1, isActive: 1 });

const Reminder: Model<IReminder> = mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema);

export default Reminder;
