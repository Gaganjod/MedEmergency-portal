"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Droplets,
  MapPin,
  AlertCircle,
  Save,
  Loader2,
  Heart,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
    bloodType: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    medicalConditions: "",
    allergies: "",
  });

  useEffect(() => {
    if (token && user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProfileData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          height: data.user.height || "",
          weight: data.user.weight || "",
          bloodType: data.user.bloodType || "",
          dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.split('T')[0] : "",
          address: data.user.address || "",
          emergencyContact: data.user.emergencyContact || "",
          medicalConditions: data.user.medicalConditions?.join(", ") || "",
          allergies: data.user.allergies?.join(", ") || "",
        });
        const hasProfileData = data.user.height || data.user.weight || data.user.bloodType;
        setIsEditing(!hasProfileData);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.name || !profileData.email) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          height: profileData.height ? parseFloat(profileData.height) : undefined,
          weight: profileData.weight ? parseFloat(profileData.weight) : undefined,
          bloodType: profileData.bloodType || undefined,
          dateOfBirth: profileData.dateOfBirth || undefined,
          address: profileData.address || undefined,
          emergencyContact: profileData.emergencyContact || undefined,
          medicalConditions: profileData.medicalConditions 
            ? profileData.medicalConditions.split(",").map(c => c.trim()).filter(c => c)
            : [],
          allergies: profileData.allergies
            ? profileData.allergies.split(",").map(a => a.trim()).filter(a => a)
            : [],
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
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
        <p className="text-lg">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-muted-foreground">
                {isEditing ? "Manage your personal and medical information" : "Your personal and medical information"}
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Details
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="glass-card p-6 bg-white/5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-red-400" />
                Basic Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name *
                  </label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="rounded-xl bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email *
                  </label>
                  <Input
                    value={profileData.email}
                    type="email"
                    disabled
                    className="rounded-xl bg-white/5 border-white/10 opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="rounded-xl bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    className="rounded-xl bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Address
                  </label>
                  <Input
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="Enter your full address"
                    className="rounded-xl bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-white/5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Health Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    Height (cm)
                  </label>
                  <Input
                    type="number"
                    value={profileData.height}
                    onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                    placeholder="170"
                    className="rounded-xl bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    value={profileData.weight}
                    onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                    placeholder="70"
                    className="rounded-xl bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                    Blood Type
                  </label>
                  <select
                    value={profileData.bloodType}
                    onChange={(e) => setProfileData({ ...profileData, bloodType: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="" className="bg-zinc-900">Select Blood Type</option>
                    {bloodTypes.map((type) => (
                      <option key={type} value={type} className="bg-zinc-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Emergency Contact
                  </label>
                  <Input
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="rounded-xl bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    Medical Conditions
                  </label>
                  <Input
                    value={profileData.medicalConditions}
                    onChange={(e) => setProfileData({ ...profileData, medicalConditions: e.target.value })}
                    placeholder="e.g., Diabetes, Hypertension (comma separated)"
                    className="rounded-xl bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    Allergies
                  </label>
                  <Input
                    value={profileData.allergies}
                    onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                    placeholder="e.g., Penicillin, Peanuts (comma separated)"
                    className="rounded-xl bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-white/5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-red-400" />
                Basic Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">{profileData.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{profileData.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-medium">{profileData.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                  <p className="font-medium">{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="font-medium">{profileData.address || "—"}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-white/5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Health Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Height</p>
                  <p className="font-medium">{profileData.height ? `${profileData.height} cm` : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Weight</p>
                  <p className="font-medium">{profileData.weight ? `${profileData.weight} kg` : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Blood Type</p>
                  <p className="font-medium">{profileData.bloodType || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Emergency Contact</p>
                  <p className="font-medium">{profileData.emergencyContact || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Medical Conditions</p>
                  <p className="font-medium">{profileData.medicalConditions || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Allergies</p>
                  <p className="font-medium">{profileData.allergies || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}