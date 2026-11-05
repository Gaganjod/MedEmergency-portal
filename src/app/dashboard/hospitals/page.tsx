"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Star, Phone, Loader2, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5000);

  useEffect(() => {
    fetchNearbyHospitals();
  }, []);

  const fetchNearbyHospitals = async () => {
    setLoading(true);
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        try {
          const response = await fetch("/api/hospitals/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radius: searchRadius,
            }),
          });
          const data = await response.json();
          if (data.success) {
            setHospitals(data.hospitals || []);
          }
        } catch (error) {
          console.error("Failed to fetch hospitals:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    fetchNearbyHospitals();
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Find Nearby Hospitals</h1>
            <p className="text-muted-foreground">
              Real-time hospital locations based on your current position
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Radius:</label>
            <select
              value={searchRadius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500/50 focus:outline-none"
            >
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
            <Button
              onClick={fetchNearbyHospitals}
              variant="outline"
              className="rounded-xl gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-red-400" />
        </div>
      ) : hospitals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Hospitals Found</h3>
          <p className="text-muted-foreground mb-4">
            No hospitals found within {searchRadius / 1000}km of your location
          </p>
          <Button
            onClick={() => handleRadiusChange(searchRadius * 2)}
            className="rounded-xl bg-gradient-to-r from-red-600 to-red-500"
          >
            Expand Search Radius
          </Button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {hospitals.map((hospital, i) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-red-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2 truncate">{hospital.name}</h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{hospital.address}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {hospital.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        <span className="font-medium">{hospital.rating.toFixed(1)}</span>
                        {hospital.totalRatings > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({hospital.totalRatings})
                          </span>
                        )}
                      </div>
                    )}
                    {hospital.isEmergencyAvailable && (
                      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                        Open Now
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {hospital.phone && (
                      <a href={`tel:${hospital.phone}`} className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full rounded-lg gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </Button>
                      </a>
                    )}
                    {hospital.latitude && hospital.longitude && (
                      <Button
                        size="sm"
                        onClick={() => openInMaps(hospital.latitude, hospital.longitude)}
                        className="flex-1 rounded-lg gap-2 bg-gradient-to-r from-red-600 to-red-500"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && hospitals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Showing {hospitals.length} hospitals within {searchRadius / 1000}km of your location
          </p>
        </motion.div>
      )}
    </div>
  );
}
