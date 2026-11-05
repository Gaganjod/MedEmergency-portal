"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Droplets,
  Search,
  MapPin,
  Phone,
  User,
  Heart,
  Clock,
  CheckCircle,
  Plus,
  Filter,
} from "lucide-react";
import { mockBloodDonors } from "@/lib/mock-data";
import { toast } from "sonner";

const bloodTypes = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const bloodRequests = [
  { id: "1", bloodType: "O-", units: 3, hospital: "City General", urgency: "critical", distance: "2.5 km" },
  { id: "2", bloodType: "A+", units: 2, hospital: "Metro Medical", urgency: "urgent", distance: "4.8 km" },
  { id: "3", bloodType: "B+", units: 1, hospital: "Sunrise Health", urgency: "normal", distance: "6.2 km" },
];

export default function BloodBankPage() {
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDonor, setIsDonor] = useState(false);

  const filteredDonors = mockBloodDonors.filter((donor) => {
    const matchesType = selectedType === "All" || donor.bloodType === selectedType;
    return matchesType && donor.isAvailable;
  });

  const handleDonorSignup = () => {
    setIsDonor(true);
    toast.success("You're now registered as a blood donor!");
  };

  const handleRequestBlood = (requestId) => {
    toast.success("Blood request sent to nearby donors!");
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
            <h1 className="text-2xl font-bold">Blood Donor Network</h1>
            <p className="text-muted-foreground">
              Connect with donors or request blood for emergencies
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-red-400" />
              <span className="text-sm text-muted-foreground">Available Donors</span>
            </div>
            <p className="text-2xl font-bold">{mockBloodDonors.filter(d => d.isAvailable).length}</p>
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
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {request.distance}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleRequestBlood(request.id)}
                    className="rounded-lg bg-rose-600 hover:bg-rose-500"
                  >
                    Respond
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Available Donors</h2>
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

          <div className="space-y-3">
            {filteredDonors.map((donor) => (
              <div
                key={donor.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold">
                  {donor.bloodType}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Donor #{donor.id}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{donor.totalDonations} donations</span>
                    {donor.lastDonationDate && (
                      <span>Last: {donor.lastDonationDate}</span>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="rounded-lg">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
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
    </div>
  );
}
