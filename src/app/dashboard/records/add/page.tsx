"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AddMedicalRecordPage() {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "",
    doctor: "",
    hospital: "",
    notes: "",
    fileUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be logged in to add a record");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Medical record added successfully");
        // reset form
        setFormData({ title: "", date: "", type: "", doctor: "", hospital: "", notes: "", fileUrl: "" });
      } else {
        toast.error(data.error || "Failed to add record");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while adding the record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add Medical Record</h2>
      <form onSubmit={handleSubmit} className="space-y-4 glass-card p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input name="title" value={formData.title} onChange={handleChange} required className="w-full" type="text" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <Input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type *</label>
          <Input name="type" value={formData.type} onChange={handleChange} required className="w-full" type="text" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          <Input name="doctor" value={formData.doctor} onChange={handleChange} className="w-full" type="text" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hospital</label>
          <Input name="hospital" value={formData.hospital} onChange={handleChange} className="w-full" type="text" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">File URL (optional)</label>
          <Input name="fileUrl" value={formData.fileUrl} onChange={handleChange} className="w-full" type="text" />
        </div>
        <Button type="submit" disabled={submitting} className="rounded-xl bg-gradient-to-r from-red-600 to-red-500" variant="default" size="default">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {submitting ? "Saving..." : "Add Record"}
        </Button>
      </form>
    </section>
  );
}
