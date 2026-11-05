"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  MapPin,
  Phone,
  Heart,
  ArrowLeft,
  Ambulance,
  Clock,
  CheckCircle,
  Building2,
  User,
  Activity,
  Flame,
  Brain,
  Baby,
  Skull,
  Wind,
  Car,
  Loader2,
  Navigation,
  Shield,
  X,
} from "lucide-react";
import { useEmergencyStore, useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import type { EmergencyType, EmergencyStatus } from "@/lib/types";

const emergencyTypes = [
  { value: "cardiac", label: "Heart Attack / Chest Pain", icon: Heart, color: "text-red-400" },
  { value: "accident", label: "Accident / Injury", icon: Car, color: "text-orange-400" },
  { value: "breathing", label: "Breathing Difficulty", icon: Wind, color: "text-blue-400" },
  { value: "stroke", label: "Stroke Symptoms", icon: Brain, color: "text-purple-400" },
  { value: "burn", label: "Burns", icon: Flame, color: "text-yellow-400" },
  { value: "poisoning", label: "Poisoning", icon: Skull, color: "text-green-400" },
  { value: "pregnancy", label: "Pregnancy Emergency", icon: Baby, color: "text-pink-400" },
  { value: "other", label: "Other Emergency", icon: AlertTriangle, color: "text-gray-400" },
];

const statusSteps = [
  { status: "pending", label: "Request Sent", icon: AlertTriangle },
  { status: "accepted", label: "Hospital Accepted", icon: Building2 },
  { status: "ambulance_dispatched", label: "Ambulance Dispatched", icon: Ambulance },
  { status: "ambulance_arriving", label: "Ambulance Arriving", icon: Navigation },
  { status: "ambulance_arrived", label: "Help Arrived", icon: CheckCircle },
];

export default function EmergencyPage() {
  const [step, setStep] = useState<"initial" | "form" | "tracking">("initial");
  const [emergencyType, setEmergencyType] = useState<EmergencyType>("cardiac");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: "" });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [panicTapCount, setPanicTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [nearestHospital, setNearestHospital] = useState<any>(null);
  const [loadingHospital, setLoadingHospital] = useState(false);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loadingAmbulances, setLoadingAmbulances] = useState(false);
  const [assignedAmbulance, setAssignedAmbulance] = useState<any>(null);

  const { user } = useAuthStore();
  const { activeEmergency, setActiveEmergency, updateEmergencyStatus } = useEmergencyStore();

  const [currentStatus, setCurrentStatus] = useState<EmergencyStatus>("pending");
  const [eta, setEta] = useState(8);
  const [progress, setProgress] = useState(0);

  const fetchNearestHospital = async (lat: number, lng: number) => {
    setLoadingHospital(true);
    try {
      const response = await fetch("/api/hospitals/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, radius: 5000 }),
      });
      
      const data = await response.json();
      if (data.success && data.hospitals && data.hospitals.length > 0) {
        setNearestHospital(data.hospitals[0]);
      }
    } catch (error) {
      console.error("Error fetching nearest hospital:", error);
    } finally {
      setLoadingHospital(false);
    }
  };

  const fetchNearbyAmbulances = async (lat: number, lng: number) => {
    setLoadingAmbulances(true);
    try {
      const response = await fetch("/api/ambulances/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, radius: 10000 }),
      });
      
      const data = await response.json();
      if (data.success && data.ambulances) {
        setAmbulances(data.ambulances);
        if (data.ambulances.length > 0) {
          setAssignedAmbulance(data.ambulances[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching nearby ambulances:", error);
    } finally {
      setLoadingAmbulances(false);
    }
  };

  const detectLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    
    const setDefaultLocation = () => {
      setLocation({
        lat: 40.7128,
        lng: -74.006,
        address: "Location unavailable - please enable location services",
      });
      setLocationError("Could not detect location. Please enable location access in your browser.");
      setIsLocating(false);
    };

    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by your browser");
      setDefaultLocation();
      return;
    }

    const timeoutId = setTimeout(() => {
      toast.error("Location detection timed out");
      setDefaultLocation();
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "User-Agent": "MedEmergency App" } }
          );
          const data = await response.json();
          
          let address = "Location detected";
          if (data.display_name) {
            const parts = data.display_name.split(", ");
            address = parts.slice(0, 4).join(", ");
          }
          
          setLocation({
            lat: latitude,
            lng: longitude,
            address,
          });
          setLocationError(null);
          
          await Promise.all([
            fetchNearestHospital(latitude, longitude),
            fetchNearbyAmbulances(latitude, longitude)
          ]);
          
          toast.success("Location detected successfully!");
        } catch {
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
          setLocationError(null);
          await Promise.all([
            fetchNearestHospital(latitude, longitude),
            fetchNearbyAmbulances(latitude, longitude)
          ]);
        }
        setIsLocating(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enable location access.");
        } else {
          toast.error("Could not detect location");
        }
        setDefaultLocation();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    if (step === "tracking") {
      const statusSequence: EmergencyStatus[] = [
        "pending",
        "accepted",
        "ambulance_dispatched",
        "ambulance_arriving",
        "ambulance_arrived",
      ];
      let currentIndex = 0;

      const statusInterval = setInterval(() => {
        if (currentIndex < statusSequence.length - 1) {
          currentIndex++;
          setCurrentStatus(statusSequence[currentIndex]);
          setProgress((currentIndex / (statusSequence.length - 1)) * 100);

          if (currentIndex === statusSequence.length - 1) {
            toast.success("Help has arrived!");
          }
        }
      }, 3000);

      const etaInterval = setInterval(() => {
        setEta((prev) => Math.max(0, prev - 1));
      }, 60000);

      return () => {
        clearInterval(statusInterval);
        clearInterval(etaInterval);
      };
    }
  }, [step]);

  const handlePanicTap = () => {
    const now = Date.now();
    if (now - lastTapTime < 500) {
      const newCount = panicTapCount + 1;
      setPanicTapCount(newCount);
      if (newCount >= 5) {
        handleEmergencySubmit();
        setPanicTapCount(0);
      }
    } else {
      setPanicTapCount(1);
    }
    setLastTapTime(now);
  };

  const handleEmergencySubmit = async () => {
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newEmergency = {
      id: `emg_${Date.now()}`,
      patientId: user?.id || "guest",
      patientName: user?.name || "Guest User",
      patientPhone: user?.phone || "",
      location,
      emergencyType,
      description,
      severity: "critical" as const,
      status: "pending" as EmergencyStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveEmergency(newEmergency);
    setStep("tracking");
    setIsSubmitting(false);
    toast.success("Emergency request submitted! Help is on the way.");
  };

  const getCurrentStatusIndex = () => {
    return statusSteps.findIndex((s) => s.status === currentStatus);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/10 rounded-full blur-3xl" />

      <header className="relative z-10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold">
              Med<span className="text-red-500">Emergency</span>
            </span>
          </Link>

          <a href="tel:911">
            <Button variant="outline" className="rounded-xl gap-2 border-red-500/30 text-red-400">
              <Phone className="w-4 h-4" />
              Call 911
            </Button>
          </a>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "initial" && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Emergency Services</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Need <span className="text-gradient">Immediate Help?</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Press the button below to request emergency assistance. Your location will be automatically detected.
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
              >
                <motion.button
                  onClick={() => setStep("form")}
                  onTouchStart={handlePanicTap}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-48 h-48 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mx-auto emergency-pulse cursor-pointer group"
                >
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-white" />
                      <span className="text-2xl font-bold text-white">HELP</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-red-400/30 animate-ping" />
                </motion.button>

                <p className="text-sm text-muted-foreground mt-6">
                  Tap 5 times rapidly for silent emergency alert
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Your Location</p>
                    {isLocating ? (
                      <p className="text-sm text-muted-foreground">Detecting...</p>
                    ) : locationError ? (
                      <div>
                        <p className="text-sm text-red-400">{locationError}</p>
                        <button
                          onClick={detectLocation}
                          className="text-sm text-blue-400 hover:text-blue-300 mt-1"
                        >
                          Retry Location Detection
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{location.address || "Location not available"}</p>
                    )}
                  </div>
                  {isLocating && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground ml-auto" />}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-muted-foreground">Nearest Hospital</p>
                    {loadingHospital ? (
                      <p className="font-medium text-sm">Finding nearest...</p>
                    ) : nearestHospital ? (
                      <>
                        <p className="font-medium">{nearestHospital.name}</p>
                        <p className="text-xs text-green-400">
                          {nearestHospital.phone || "Contact info unavailable"}
                        </p>
                      </>
                    ) : (
                      <p className="font-medium text-sm">No hospitals found nearby</p>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-muted-foreground">Available Ambulances</p>
                    <p className="font-medium">{ambulances.length} nearby</p>
                    <p className="text-xs text-blue-400">Ready for dispatch</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button
                onClick={() => setStep("initial")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Emergency Details</h2>

                <div className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Type of Emergency</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {emergencyTypes.map((type) => (
                        <motion.button
                          key={type.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setEmergencyType(type.value as EmergencyType)}
                          className={`p-4 rounded-xl border transition-all text-left ${
                            emergencyType === type.value
                              ? "border-red-500 bg-red-500/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <type.icon className={`w-6 h-6 mb-2 ${type.color}`} />
                          <p className="text-sm font-medium">{type.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Describe the situation (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Any additional details that might help emergency responders..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2 min-h-[100px] rounded-xl bg-secondary/50 border-white/10"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Location</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{location.address || "Detecting..."}</p>
                    <button
                      onClick={detectLocation}
                      className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                    >
                      Update Location
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="font-medium text-yellow-400">Emergency Contacts Will Be Notified</p>
                        <p className="text-sm text-muted-foreground">
                          Your emergency contacts will receive an alert with your location.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleEmergencySubmit}
                    disabled={isSubmitting || !location.address}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-lg gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Requesting Help...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        Request Emergency Help
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "tracking" && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="glass-card p-6 md:p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                      <Ambulance className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Help is on the way!</h2>
                      <p className="text-sm text-muted-foreground">Emergency ID: {activeEmergency?.id?.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-400">{eta}</div>
                    <div className="text-sm text-muted-foreground">min ETA</div>
                  </div>
                </div>

                <div className="relative mb-8">
                  <div className="absolute top-5 left-5 right-5 h-1 bg-white/10 rounded-full">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="relative flex justify-between">
                    {statusSteps.map((s, i) => {
                      const isActive = getCurrentStatusIndex() >= i;
                      const isCurrent = getCurrentStatusIndex() === i;
                      return (
                        <div key={s.status} className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: isCurrent ? 1.1 : 1 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                              isActive
                                ? "bg-gradient-to-br from-green-500 to-green-600"
                                : "bg-white/10"
                            } ${isCurrent ? "ring-4 ring-green-500/30" : ""}`}
                          >
                            <s.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                          </motion.div>
                          <span className={`text-xs mt-2 text-center max-w-[80px] ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <span className="font-medium">Assigned Hospital</span>
                    </div>
                    <p className="font-semibold">{nearestHospital?.name || "General Hospital"}</p>
                    <p className="text-sm text-muted-foreground">{nearestHospital?.address || "Nearby location"}</p>
                    <a href={`tel:${nearestHospital?.phone || "911"}`} className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
                      {nearestHospital?.phone || "Call 911"}
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <Ambulance className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Ambulance Details</span>
                    </div>
                    <p className="font-semibold">{assignedAmbulance?.vehicleNumber || "Ambulance assigned"}</p>
                    <p className="text-sm text-muted-foreground">Driver: {assignedAmbulance?.driverName || "Driver assigned"}</p>
                    <a href={`tel:${assignedAmbulance?.driverPhone || "911"}`} className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
                      {assignedAmbulance?.driverPhone || "Call Driver"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 mb-6">
                <h3 className="font-semibold mb-4">While waiting for help:</h3>
                <div className="space-y-3">
                  {[
                    "Stay calm and remain in your current location",
                    "Keep your phone charged and nearby",
                    "Unlock your door if you can do so safely",
                    "Gather any medications you may need",
                    "Have someone flag down the ambulance if possible",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <a href="tel:911" className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl gap-2 h-12">
                    <Phone className="w-4 h-4" />
                    Call 911
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("initial");
                    setActiveEmergency(null);
                    setCurrentStatus("pending");
                    setProgress(0);
                    setEta(8);
                  }}
                  className="flex-1 rounded-xl gap-2 h-12 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4" />
                  Cancel Request
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}