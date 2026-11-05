"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  FileText,
  Heart,
  MapPin,
  Pill,
  Star,
  TrendingUp,
  Activity,
  Droplets,
  Phone,
  ArrowRight,
  Plus,
  Loader2,
  CalendarClock,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

const quickActions = [
  { icon: AlertTriangle, label: "Emergency", href: "/emergency", color: "from-red-500 to-orange-500", urgent: true },
  { icon: Building2, label: "Find Hospital", href: "/dashboard/hospitals", color: "from-blue-500 to-cyan-500" },
  { icon: Calendar, label: "Book Appointment", href: "/dashboard/appointments", color: "from-purple-500 to-pink-500" },
  { icon: Droplets, label: "Blood Bank", href: "/dashboard/blood-bank", color: "from-rose-500 to-red-500" },
];

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [healthMetric, setHealthMetric] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingHealthMetric, setLoadingHealthMetric] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [healthFormData, setHealthFormData] = useState({
    heartRate: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    bloodSugar: "",
  });
  const [submittingHealth, setSubmittingHealth] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (token) {
      fetchReminders();
      fetchRecords();
      fetchAppointments();
      fetchHealthMetric();
    } else {
      setLoadingReminders(false);
      setLoadingRecords(false);
      setLoadingAppointments(false);
      setLoadingHealthMetric(false);
    }
    fetchNearbyHospitals();
  }, [token]);

  const fetchNearbyHospitals = async () => {
    setLoadingHospitals(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoadingHospitals(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch("/api/hospitals/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radius: 5000,
            }),
          });
          const data = await response.json();
          if (data.success) {
            setHospitals(data.hospitals || []);
          }
        } catch (error) {
          setLocationError("Failed to fetch hospitals");
        } finally {
          setLoadingHospitals(false);
        }
      },
      (error) => {
        if (error.code === 1) {
          setLocationError("Location access denied. Please enable location permissions.");
        } else if (error.code === 2) {
          setLocationError("Location unavailable. Please try again.");
        } else if (error.code === 3) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Unable to get your location.");
        }
        setLoadingHospitals(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const fetchHealthMetric = async () => {
    try {
      const response = await fetch("/api/health-metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.metric) {
        setHealthMetric(data.metric);
      }
    } catch (error) {
      console.error("Failed to fetch health metrics:", error);
    } finally {
      setLoadingHealthMetric(false);
    }
  };

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
      setLoadingReminders(false);
    }
  };

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
      setLoadingRecords(false);
    }
  };

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
      setLoadingAppointments(false);
    }
  };

  const handleToggleTaken = async (id, taken) => {
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
        setReminders(reminders.map((r) => (r._id === id ? { ...r, taken: !taken } : r)));
      }
    } catch (error) {
      console.error("Failed to update reminder:", error);
    }
  };

  const handleHealthFormSubmit = async (e) => {
    e.preventDefault();
    setSubmittingHealth(true);
    try {
      const response = await fetch("/api/health-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          heartRate: healthFormData.heartRate ? Number(healthFormData.heartRate) : undefined,
          bloodPressureSystolic: healthFormData.bloodPressureSystolic ? Number(healthFormData.bloodPressureSystolic) : undefined,
          bloodPressureDiastolic: healthFormData.bloodPressureDiastolic ? Number(healthFormData.bloodPressureDiastolic) : undefined,
          bloodSugar: healthFormData.bloodSugar ? Number(healthFormData.bloodSugar) : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setHealthMetric(data.metric);
        setShowHealthForm(false);
        setHealthFormData({
          heartRate: "",
          bloodPressureSystolic: "",
          bloodPressureDiastolic: "",
          bloodSugar: "",
        });
      }
    } catch (error) {
      console.error("Failed to save health metrics:", error);
    } finally {
      setSubmittingHealth(false);
    }
  };

  const upcomingAppointment = appointments.find((a) => a.status === "scheduled");

  const healthMetrics = healthMetric
    ? [
        { label: "Heart Rate", value: healthMetric.heartRate || "--", unit: "bpm", icon: Heart, color: "text-red-400" },
        { 
          label: "Blood Pressure", 
          value: healthMetric.bloodPressureSystolic && healthMetric.bloodPressureDiastolic 
            ? `${healthMetric.bloodPressureSystolic}/${healthMetric.bloodPressureDiastolic}` 
            : "--", 
          unit: "mmHg", 
          icon: Activity, 
          color: "text-green-400" 
        },
        { label: "Blood Sugar", value: healthMetric.bloodSugar || "--", unit: "mg/dL", icon: TrendingUp, color: "text-blue-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Hello, {user?.name || "Patient"}!</h2>
            <p className="text-muted-foreground">
              Your health dashboard shows everything at a glance. Need immediate help?
            </p>
          </div>
          <Link href="/emergency">
            <Button
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 emergency-pulse px-8 gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              HELP NOW
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={action.href}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`glass-card p-5 cursor-pointer group ${
                  action.urgent ? "border-red-500/30" : ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold group-hover:text-red-400 transition-colors">
                  {action.label}
                </h3>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Nearby Hospitals</h3>
            <Link href="/dashboard/hospitals" className="text-sm text-red-400 hover:text-red-300">
              View All
            </Link>
          </div>
          {loadingHospitals ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-400" />
            </div>
          ) : locationError ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">{locationError}</p>
              <Button
                size="sm"
                onClick={fetchNearbyHospitals}
                className="rounded-xl bg-gradient-to-r from-red-600 to-red-500"
              >
                Try Again
              </Button>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No nearby hospitals found</p>
              <p className="text-sm text-muted-foreground">Please enable location access to find hospitals near you</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hospitals.slice(0, 3).map((hospital, i) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{hospital.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{hospital.address}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {hospital.rating > 0 && (
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                          {hospital.rating.toFixed(1)}
                        </span>
                      )}
                      {hospital.totalRatings > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({hospital.totalRatings} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {hospital.isEmergencyAvailable && (
                      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                        Open Now
                      </span>
                    )}
                    {hospital.phone && (
                      <a href={`tel:${hospital.phone}`}>
                        <Button size="sm" variant="outline" className="rounded-lg gap-1">
                          <Phone className="w-3 h-3" />
                          Call
                        </Button>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Health Overview</h3>
              {healthMetric && !showHealthForm && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowHealthForm(true)}
                  className="text-xs"
                >
                  Update
                </Button>
              )}
            </div>
            {loadingHealthMetric ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-red-400" />
              </div>
            ) : showHealthForm || !healthMetric ? (
              <form onSubmit={handleHealthFormSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={healthFormData.heartRate}
                    onChange={(e) => setHealthFormData({ ...healthFormData, heartRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500/50 focus:outline-none"
                    placeholder="72"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Systolic</label>
                    <input
                      type="number"
                      value={healthFormData.bloodPressureSystolic}
                      onChange={(e) => setHealthFormData({ ...healthFormData, bloodPressureSystolic: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500/50 focus:outline-none"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Diastolic</label>
                    <input
                      type="number"
                      value={healthFormData.bloodPressureDiastolic}
                      onChange={(e) => setHealthFormData({ ...healthFormData, bloodPressureDiastolic: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500/50 focus:outline-none"
                      placeholder="80"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={healthFormData.bloodSugar}
                    onChange={(e) => setHealthFormData({ ...healthFormData, bloodSugar: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500/50 focus:outline-none"
                    placeholder="95"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submittingHealth}
                    className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-500"
                  >
                    {submittingHealth ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                  {healthMetric && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowHealthForm(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {healthMetrics.map((metric) => (
                  <div key={metric.label} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${metric.color}`}>
                      <metric.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="font-semibold">
                        {metric.value} {metric.value !== "--" && <span className="text-sm font-normal text-muted-foreground">{metric.unit}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Next Appointment</h3>
            {loadingAppointments ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-red-400" />
              </div>
            ) : upcomingAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{upcomingAppointment.doctorName}</p>
                    <p className="text-sm text-muted-foreground">{upcomingAppointment.specialization}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {new Date(upcomingAppointment.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-green-400" />
                    {upcomingAppointment.time}
                  </div>
                </div>
                <Link href="/dashboard/appointments">
                  <Button className="w-full rounded-xl" variant="outline">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <CalendarClock className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No upcoming appointments</p>
                <Link href="/dashboard/appointments">
                  <Button size="sm" className="rounded-xl bg-gradient-to-r from-red-600 to-red-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Medical Records</h3>
            <Link href="/dashboard/records" className="text-sm text-red-400 hover:text-red-300">
              View All
            </Link>
          </div>
          {loadingRecords ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-red-400" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No medical records yet</p>
              <Link href="/dashboard/records">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-red-600 to-red-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Record
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 4).map((record, i) => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{record.title}</p>
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-white/5 text-xs capitalize">
                    {record.type.replace("_", " ")}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Medicine Reminders</h3>
            <Link href="/dashboard/reminders" className="text-sm text-red-400 hover:text-red-300">
              Manage
            </Link>
          </div>
          {loadingReminders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-red-400" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No medicine reminders set</p>
              <Link href="/dashboard/reminders">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-red-600 to-red-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Set Up Your Reminders
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.slice(0, 3).map((med, i) => (
                <div
                  key={med._id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => handleToggleTaken(med._id, med.taken)}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      med.taken ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    <Pill className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} • {med.time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      med.taken ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {med.taken ? "Taken" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}