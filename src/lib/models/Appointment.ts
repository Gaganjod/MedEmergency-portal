import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  userId: mongoose.Types.ObjectId;
  doctorName: string;
  specialization: string;
  hospital: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorName: { type: String, required: true },
    specialization: { type: String, required: true },
    hospital: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, default: "Consultation" },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);
