"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pill,
  Plus,
  Clock,
  Check,
  Trash2,
  Edit2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

interface Reminder {
  _id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  notes?: string;
  taken: boolean;
}

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as_needed", label: "As Needed" },
];

export default function RemindersPage() {
  const { token } = useAuthStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    time: "",
    frequency: "daily",
    notes: "",
  });

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReminders();
    else setLoading(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch("/api/reminders", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingId ? "Reminder updated!" : "Reminder added!");
        fetchReminders();
        resetForm();
      } else {
        toast.error(data.error || "Failed to save reminder");
      }
    } catch {
      toast.error("Failed to save reminder");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Reminder deleted!");
        setReminders(reminders.filter((r) => r._id !== id));
      }
    } catch {
      toast.error("Failed to delete reminder");
    }
  };

  const handleToggleTaken = async (id: string, taken: boolean) => {
    try {
      const response = await fetch("/api/reminders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, taken: !taken }),
      });
      const data = await response.json();
      if (data.success) {
        setReminders(
          reminders.map((r) => (r._id === id ? { ...r, taken: !taken } : r))
        );
        toast.success(!taken ? "Marked as taken!" : "Marked as pending");
      }
    } catch {
      toast.error("Failed to update reminder");
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setFormData({
      name: reminder.name,
      dosage: reminder.dosage,
      time: reminder.time,
      frequency: reminder.frequency,
      notes: reminder.notes || "",
    });
    setEditingId(reminder._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", dosage: "", time: "", frequency: "daily", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-yellow-400" />
        <p className="text-lg">Please log in to manage your medicine reminders</p>
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
          <h1 className="text-2xl font-bold">Medicine Reminders</h1>
          <p className="text-muted-foreground">
            Manage your daily medication schedule
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add Medicine"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Medicine" : "Add New Medicine"}
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Medicine Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Metformin"
                  className="rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dosage *</label>
                <Input
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 500mg"
                  className="rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time *</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                >
                  {frequencies.map((f) => (
                    <option key={f.value} value={f.value} className="bg-zinc-900">
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., Take with food"
                  className="rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-green-600 to-green-500"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {editingId ? "Update" : "Save"} Reminder
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {reminders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <Pill className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Reminders Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first medicine reminder to keep track of your medications
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-gradient-to-r from-red-600 to-red-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Medicine
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reminders.map((reminder, i) => (
            <motion.div
              key={reminder._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-5 border-l-4 ${
                reminder.taken ? "border-l-green-500" : "border-l-yellow-500"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      reminder.taken
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{reminder.name}</h4>
                    <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    reminder.taken
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {reminder.taken ? "Taken" : "Pending"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Clock className="w-4 h-4" />
                <span>
                  {reminder.time} • {frequencies.find((f) => f.value === reminder.frequency)?.label}
                </span>
              </div>

              {reminder.notes && (
                <p className="text-sm text-muted-foreground mb-3 italic">
                  {reminder.notes}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => handleToggleTaken(reminder._id, reminder.taken)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {reminder.taken ? "Undo" : "Mark Taken"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => handleEdit(reminder)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(reminder._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
