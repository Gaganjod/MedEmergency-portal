"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  User,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  CalendarClock,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

interface Appointment {
  _id: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
}

const specializations = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "Gynecologist",
  "ENT Specialist",
  "Ophthalmologist",
];

const appointmentTypes = ["Consultation", "Follow-up", "Checkup", "Emergency", "Surgery"];

export default function AppointmentsPage() {
  const { token } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    doctorName: "",
    specialization: "",
    hospital: "",
    date: "",
    time: "",
    type: "Consultation",
    notes: "",
  });

  useEffect(() => {
    if (token) fetchAppointments();
    else setLoading(false);
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = "/api/appointments";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        if (editingId) {
          setAppointments(appointments.map((a) => (a._id === editingId ? data.appointment : a)));
        } else {
          setAppointments([...appointments, data.appointment]);
        }
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save appointment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      doctorName: appointment.doctorName,
      specialization: appointment.specialization,
      hospital: appointment.hospital,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      notes: appointment.notes,
    });
    setEditingId(appointment._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(appointments.filter((a) => a._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  };

  const handleStatusChange = async (id: string, status: "scheduled" | "completed" | "cancelled") => {
    try {
      const response = await fetch("/api/appointments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(appointments.map((a) => (a._id === id ? { ...a, status } : a)));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      doctorName: "",
      specialization: "",
      hospital: "",
      date: "",
      time: "",
      type: "Consultation",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const scheduledAppointments = appointments.filter((a) => a.status === "scheduled");
  const pastAppointments = appointments.filter((a) => a.status !== "scheduled");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-400";
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-white/10 text-white";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage your doctor appointments</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 gap-2"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </Button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Appointment" : "Book New Appointment"}
            </h2>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Doctor Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="Dr. John Smith"
                  className="pl-10 rounded-xl bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Specialization</label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                required
              >
                <option value="" className="bg-background">Select specialization</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec} className="bg-background">
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Hospital / Clinic</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  placeholder="City Hospital"
                  className="pl-10 rounded-xl bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Appointment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
              >
                {appointmentTypes.map((type) => (
                  <option key={type} value={type} className="bg-background">
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-10 rounded-xl bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="pl-10 rounded-xl bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm text-muted-foreground">Notes (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full min-h-[80px] px-10 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground resize-none"
                />
              </div>
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Update Appointment" : "Book Appointment"}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {appointments.length === 0 && !showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <CalendarClock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Appointments Yet</h2>
          <p className="text-muted-foreground mb-6">
            Book your first appointment to keep track of your medical visits
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 gap-2"
          >
            <Plus className="w-4 h-4" />
            Book Your First Appointment
          </Button>
        </motion.div>
      ) : (
        <>
          {scheduledAppointments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
              <div className="grid gap-4">
                {scheduledAppointments.map((appointment, i) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{appointment.doctorName}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
                            <p className="text-sm text-muted-foreground">{appointment.hospital}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <span className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            {new Date(appointment.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-green-400" />
                            {appointment.time}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                            {appointment.type}
                          </span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-2 truncate">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(appointment._id, "completed")}
                          className="rounded-lg text-green-400 hover:text-green-300"
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(appointment._id, "cancelled")}
                          className="rounded-lg text-red-400 hover:text-red-300"
                          title="Cancel appointment"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(appointment)}
                          className="rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(appointment._id)}
                          className="rounded-lg text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {pastAppointments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Past Appointments</h2>
              <div className="grid gap-4">
                {pastAppointments.map((appointment, i) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-5 opacity-75"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{appointment.doctorName}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(appointment._id)}
                        className="rounded-lg text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
