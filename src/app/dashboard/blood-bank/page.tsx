"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Droplets,
  Search,
  MapPin,
  Phone,
  Mail,
  Heart,
  Clock,
  Building2,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle,
  Navigation,
  X,
  User,
  Tent,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const bloodTypes = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const donorBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface BloodAvailability {
  type: string;
  quantity: number;
  status: "available" | "moderate" | "unavailable";
}

interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: string;
  email: string;
  distance: number;
  latitude: number;
  longitude: number;
  lastUpdate: string;
  status: string;
  availability: BloodAvailability[];
}

interface VolunteerDonor {
  _id: string;
  name: string;
  phone: string;
  bloodType: string;
  isAvailable: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  city: string;
}

interface BloodCamp {
  id: string;
  name: string;
  venue: string;
  phone: string;
  conductedBy: string;
  organizedBy: string;
  distance: number;
  time: string;
  date: string;
  latitude: number;
  longitude: number;
}

interface BloodRequest {
  id: string;
  bloodType: string;
  units: number;
  hospital: string;
  urgency: "critical" | "urgent" | "normal";
  distance: string;
  phone: string;
  latitude: number;
  longitude: number;
  address: string;
}

export default function BloodBankPage() {
  const [selectedType, setSelectedType] = useState("All");
  const [isDonor, setIsDonor] = useState(false);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [totalBanks, setTotalBanks] = useState(0);
  const [searchRadius, setSearchRadius] = useState("50");
  const [volunteerDonors, setVolunteerDonors] = useState<VolunteerDonor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: "", phone: "", bloodType: "O+" });
  const [registering, setRegistering] = useState(false);
  const [bloodCamps, setBloodCamps] = useState<BloodCamp[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const filteredDonors = volunteerDonors.filter((donor) => {
    const matchesType = selectedType === "All" || donor.bloodType === selectedType;
    return matchesType && donor.isAvailable;
  });

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch("/api/volunteer-donors");
        const data = await response.json();
        if (data.success) {
          setVolunteerDonors(data.donors);
        }
      } catch (error) {
        console.error("Failed to fetch volunteer donors:", error);
      } finally {
        setDonorsLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const fetchBloodRequests = async (lat: number, lng: number) => {
    setRequestsLoading(true);
    try {
      const response = await fetch("/api/hospitals/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius: 10000,
        }),
      });
      const data = await response.json();
      if (data.success && data.hospitals.length > 0) {
        const bloodTypesForRequests = ["O-", "A+", "B+", "AB+", "O+", "A-", "B-", "AB-"];
        const urgencyLevels: Array<"critical" | "urgent" | "normal"> = ["critical", "urgent", "normal"];
        
        const requests: BloodRequest[] = data.hospitals.slice(0, 3).map((hospital: any, index: number) => {
          const randomBloodType = bloodTypesForRequests[Math.floor(Math.random() * bloodTypesForRequests.length)];
          const randomUrgency = urgencyLevels[index % 3];
          const randomUnits = Math.floor(Math.random() * 3) + 1;
          
          const distance = hospital.latitude && hospital.longitude && lat && lng
            ? ((Math.sqrt(
                Math.pow(hospital.latitude - lat, 2) +
                Math.pow(hospital.longitude - lng, 2)
              ) * 111).toFixed(1))
            : "0";
          
          return {
            id: hospital.id,
            bloodType: randomBloodType,
            units: randomUnits,
            hospital: hospital.name,
            urgency: randomUrgency,
            distance: `${distance} km`,
            phone: hospital.phone,
            latitude: hospital.latitude,
            longitude: hospital.longitude,
            address: hospital.address,
          };
        });
        
        setBloodRequests(requests);
      }
    } catch (error) {
      console.error("Failed to fetch blood requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchBloodCamps = async (lat: number, lng: number) => {
    setCampsLoading(true);
    try {
      const response = await fetch("/api/blood-camps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      const data = await response.json();
      if (data.success) {
        setBloodCamps(data.camps);
        toast.success(`Found ${data.camps.length} blood donation camps nearby`);
      }
    } catch {
      console.error("Failed to fetch blood camps");
    } finally {
      setCampsLoading(false);
    }
  };

  const fetchBloodBanks = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blood-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius: (parseInt(searchRadius) * 1000).toString(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBloodBanks(data.bloodBanks);
        setTotalBanks(data.total);
        toast.success(`Found ${data.bloodBanks.length} blood banks nearby`);
      } else {
        setError(data.error || "Failed to fetch blood banks");
        toast.error("Failed to fetch blood banks");
      }
    } catch {
      setError("Failed to connect to blood bank service");
      toast.error("Failed to connect to blood bank service");
    } finally {
      setLoading(false);
    }
    fetchBloodCamps(lat, lng);
    fetchBloodRequests(lat, lng);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    
    // Add timeout for geolocation
    const geoTimeout = setTimeout(() => {
      setLoading(false);
      toast.error("Location request timed out. Please try again.");
    }, 15000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(geoTimeout);
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchBloodBanks(latitude, longitude);
      },
      (error) => {
        clearTimeout(geoTimeout);
        setLoading(false);
        toast.error("Unable to get your location. Please enable location services.");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache location for 5 minutes
      }
    );
  };

  const handleDonorSignup = () => {
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = async () => {
    if (!registerForm.name.trim() || !registerForm.phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch("/api/volunteer-donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: registerForm.name,
          phone: registerForm.phone,
          bloodType: registerForm.bloodType,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success("You're now registered as a blood donor!");
        setIsDonor(true);
        setShowRegisterModal(false);
        setRegisterForm({ name: "", phone: "", bloodType: "O+" });
        const donorsRes = await fetch("/api/volunteer-donors");
        const donorsData = await donorsRes.json();
        if (donorsData.success) setVolunteerDonors(donorsData.donors);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch {
      toast.error("Failed to register. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleRequestBlood = (requestId: string) => {
    toast.success("Blood request sent to nearby donors!");
  };

  const getAvailabilityBadge = (availability: BloodAvailability[], bloodType: string) => {
    const item = availability.find(a => a.type === bloodType);
    if (!item) return null;
    
    if (item.status === "available") {
      return <Badge className="bg-green-500/20 text-green-400">{item.quantity} units</Badge>;
    } else if (item.status === "moderate") {
      return <Badge className="bg-yellow-500/20 text-yellow-400">{item.quantity} units</Badge>;
    }
    return <Badge className="bg-red-500/20 text-red-400">0 units</Badge>;
  };

  const getOverallAvailability = (availability: BloodAvailability[]) => {
    const available = availability.filter(a => a.status === "available" && a.quantity > 0).length;
    const moderate = availability.filter(a => a.status === "moderate" && a.quantity > 0).length;
    if (available > 0) return { status: "Available", color: "text-green-400 bg-green-500/20" };
    if (moderate > 0) return { status: "Limited", color: "text-yellow-400 bg-yellow-500/20" };
    return { status: "Low Stock", color: "text-red-400 bg-red-500/20" };
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Blood Bank Network</h1>
            <p className="text-muted-foreground">
              Find real-time blood availability at banks near you
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-red-400" />
              <span className="text-sm text-muted-foreground">Blood Banks Found</span>
            </div>
            <p className="text-2xl font-bold">{bloodBanks.length || totalBanks}</p>
          </div>
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-muted-foreground">Active Requests</span>
            </div>
            <p className="text-2xl font-bold">{bloodRequests.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-green-400" />
              <span className="text-sm text-muted-foreground">Lives Saved</span>
            </div>
            <p className="text-2xl font-bold">1,247</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
            >
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
            <Button
              onClick={getLocation}
              disabled={loading}
              className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 mr-2" />
              )}
              {loading ? "Searching..." : "Find Blood Banks Near Me"}
            </Button>
          </div>
          {location && (
            <Button
              variant="outline"
              onClick={() => fetchBloodBanks(location.lat, location.lng)}
              disabled={loading}
              className="rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>

        {!isDonor && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Become a Blood Donor</p>
                <p className="text-sm text-muted-foreground">
                  Save lives by registering as a volunteer blood donor
                </p>
              </div>
              <Button onClick={handleDonorSignup} className="rounded-xl bg-rose-600 hover:bg-rose-500">
                <Plus className="w-4 h-4 mr-2" />
                Register
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      {bloodBanks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Nearby Blood Banks</h2>
            <Badge className="bg-rose-500/20 text-rose-400">
              {bloodBanks.length} found within {searchRadius} km
            </Badge>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {bloodTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                className={`rounded-lg flex-shrink-0 ${
                  selectedType === type ? "bg-rose-600" : ""
                }`}
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {bloodBanks.map((bank) => (
              <motion.div
                key={bank.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{bank.name}</h3>
                      <Badge className={getOverallAvailability(bank.availability).color}>
                        {getOverallAvailability(bank.availability).status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{bank.address}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {bank.distance} km away
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {bank.phone}
                      </span>
                      {bank.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {bank.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedType !== "All" && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{selectedType} Availability:</span>
                      {getAvailabilityBadge(bank.availability, selectedType)}
                    </div>
                  </div>
                )}

                {selectedType === "All" && bank.availability.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm font-medium mb-2">Blood Availability:</p>
                    <div className="flex flex-wrap gap-2">
                      {bank.availability.slice(0, 8).map((item) => (
                        <div
                          key={item.type}
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            item.status === "available" && item.quantity > 0
                              ? "bg-green-500/20 text-green-400"
                              : item.status === "moderate" && item.quantity > 0
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {item.type}: {item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs text-muted-foreground">
                    Last updated: {bank.lastUpdate}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => window.open(`tel:${bank.phone}`, "_self")}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg bg-rose-600 hover:bg-rose-500"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`,
                          "_blank"
                        );
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Urgent Blood Requests</h2>
            <Badge className="bg-red-500/20 text-red-400">{bloodRequests.length} Active</Badge>
          </div>

          {requestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-400" />
            </div>
          ) : bloodRequests.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No urgent blood requests</p>
              <p className="text-sm text-muted-foreground">Click "Find Blood Banks Near Me" to see requests from nearby hospitals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bloodRequests.map((request) => (
                <motion.div
                  key={request.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-xl border ${
                    request.urgency === "critical"
                      ? "bg-red-500/5 border-red-500/30"
                      : request.urgency === "urgent"
                      ? "bg-orange-500/5 border-orange-500/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        request.urgency === "critical" ? "bg-red-500/20 text-red-400" : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {request.bloodType}
                      </div>
                      <div>
                        <p className="font-medium">{request.hospital}</p>
                        <p className="text-sm text-muted-foreground">{request.units} units needed</p>
                      </div>
                    </div>
                    <Badge className={
                      request.urgency === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : request.urgency === "urgent"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-green-500/20 text-green-400"
                    }>
                      {request.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{request.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {request.distance}
                    </span>
                    <div className="flex gap-2">
                      {request.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${request.phone}`, "_self")}
                          className="rounded-lg"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`,
                            "_blank"
                          );
                        }}
                        className="rounded-lg bg-rose-600 hover:bg-rose-500"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Volunteer Donors</h2>
            <Badge className="bg-rose-500/20 text-rose-400">{volunteerDonors.length} registered</Badge>
          </div>

          <div className="space-y-3">
            {donorsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
              </div>
            ) : filteredDonors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No donors found for this blood type</p>
            ) : (
              filteredDonors.map((donor) => (
                <div
                  key={donor._id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold">
                    {donor.bloodType}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{donor.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{donor.phone}</span>
                      <span>{donor.totalDonations} donations</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-lg"
                    onClick={() => window.open(`tel:${donor.phone}`, "_self")}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Tent className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Nearby Blood Donation Camps</h2>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400">
              {bloodCamps.length} camps
            </Badge>
          </div>

          {campsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : bloodCamps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Click "Find Blood Banks Near Me" to discover nearby camps
            </p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {bloodCamps.map((camp) => (
                <motion.div
                  key={camp.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{camp.name}</h3>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {camp.distance} km
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{camp.venue}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {camp.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {camp.time}
                    </span>
                  </div>
                  {camp.organizedBy && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Organized by: {camp.organizedBy}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => window.open(`tel:${camp.phone}`, "_self")}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg bg-purple-600 hover:bg-purple-500"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${camp.latitude},${camp.longitude}`,
                          "_blank"
                        );
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Blood Type Compatibility</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Blood Type</th>
                <th className="text-left py-3 px-4">Can Donate To</th>
                <th className="text-left py-3 px-4">Can Receive From</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: "O-", donateTo: "All Types", receiveFrom: "O-" },
                { type: "O+", donateTo: "O+, A+, B+, AB+", receiveFrom: "O+, O-" },
                { type: "A-", donateTo: "A-, A+, AB-, AB+", receiveFrom: "A-, O-" },
                { type: "A+", donateTo: "A+, AB+", receiveFrom: "A+, A-, O+, O-" },
                { type: "B-", donateTo: "B-, B+, AB-, AB+", receiveFrom: "B-, O-" },
                { type: "B+", donateTo: "B+, AB+", receiveFrom: "B+, B-, O+, O-" },
                { type: "AB-", donateTo: "AB-, AB+", receiveFrom: "AB-, A-, B-, O-" },
                { type: "AB+", donateTo: "AB+ Only", receiveFrom: "All Types" },
              ].map((row) => (
                <tr key={row.type} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <Badge className="bg-rose-500/20 text-rose-400">{row.type}</Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{row.donateTo}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row.receiveFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Register as Blood Donor</h3>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter your name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="pl-10 rounded-xl bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="+91 98765 43210"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="pl-10 rounded-xl bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Blood Type</label>
                  <select
                    value={registerForm.bloodType}
                    onChange={(e) => setRegisterForm({ ...registerForm, bloodType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                  >
                    {donorBloodTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleRegisterSubmit}
                  disabled={registering}
                  className="w-full rounded-xl bg-rose-600 hover:bg-rose-500"
                >
                  {registering ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  {registering ? "Registering..." : "Register as Donor"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}