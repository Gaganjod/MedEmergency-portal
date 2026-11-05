"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  X,
  Loader2,
  AlertCircle,
  Check,
  Stethoscope,
  Hospital,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

interface MedicalRecord {
  _id: string;
  title: string;
  date: string;
  type: string;
  doctor?: string;
  hospital?: string;
  notes?: string;
}

const recordTypes = [
  { value: "lab_report", label: "Lab Report" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "prescription", label: "Prescription" },
  { value: "vaccination", label: "Vaccination" },
  { value: "surgery", label: "Surgery" },
  { value: "other", label: "Other" },
];

const typeColors: Record<string, string> = {
  lab_report: "bg-blue-500/20 text-blue-400",
  diagnostic: "bg-purple-500/20 text-purple-400",
  prescription: "bg-green-500/20 text-green-400",
  vaccination: "bg-yellow-500/20 text-yellow-400",
  surgery: "bg-red-500/20 text-red-400",
  other: "bg-gray-500/20 text-gray-400",
};

export default function RecordsPage() {
  const { token } = useAuthStore();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "lab_report",
    doctor: "",
    hospital: "",
    notes: "",
  });

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/medical-records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRecords();
    else setLoading(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch("/api/medical-records", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingId ? "Record updated!" : "Record added!");
        fetchRecords();
        resetForm();
      } else {
        toast.error(data.error || "Failed to save record");
      }
    } catch {
      toast.error("Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/medical-records?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Record deleted!");
        setRecords(records.filter((r) => r._id !== id));
      }
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setFormData({
      title: record.title,
      date: record.date,
      type: record.type,
      doctor: record.doctor || "",
      hospital: record.hospital || "",
      notes: record.notes || "",
    });
    setEditingId(record._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      type: "lab_report",
      doctor: "",
      hospital: "",
      notes: "",
    });
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
        <p className="text-lg">Please log in to manage your medical records</p>
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
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">
            Keep track of all your medical documents
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add Record"}
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
              {editingId ? "Edit Medical Record" : "Add New Medical Record"}
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Blood Test Results"
                  className="rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                >
                  {recordTypes.map((t) => (
                    <option key={t.value} value={t.value} className="bg-zinc-900">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Doctor</label>
                <Input
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  placeholder="e.g., Dr. Smith"
                  className="rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hospital</label>
                <Input
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  placeholder="e.g., City General Hospital"
                  className="rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional details"
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
                  {editingId ? "Update" : "Save"} Record
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

      {records.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Records Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first medical record to keep track of your health history
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-gradient-to-r from-red-600 to-red-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Record
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {records.map((record, i) => (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColors[record.type] || typeColors.other}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg">{record.title}</h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {record.date}
                      </span>
                      {record.doctor && (
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          {record.doctor}
                        </span>
                      )}
                      {record.hospital && (
                        <span className="flex items-center gap-1">
                          <Hospital className="w-4 h-4" />
                          {record.hospital}
                        </span>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${typeColors[record.type] || typeColors.other}`}>
                    {recordTypes.find((t) => t.value === record.type)?.label || record.type}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => handleEdit(record)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(record._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
