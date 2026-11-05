"use client";

import { motion } from "framer-motion";
import {
  Ambulance,
  Brain,
  Clock,
  Droplets,
  FileText,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Pill,
  QrCode,
  Shield,
  Smartphone,
  Stethoscope,
  Users,
  Video,
  Zap,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Emergency Request",
    description: "One-tap HELP button auto-detects location and notifies nearest hospitals immediately",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Ambulance,
    title: "Live Ambulance Tracking",
    description: "Track your assigned ambulance in real-time with accurate ETA and route updates",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "AI Symptom Checker",
    description: "Advanced AI analyzes symptoms to determine urgency and recommend appropriate care",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: MessageSquare,
    title: "Emergency Chatbot",
    description: "24/7 AI assistant provides guidance while help is on the way",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Droplets,
    title: "Blood Donor Network",
    description: "Connect with nearby donors instantly for critical blood requirements",
    color: "from-rose-500 to-red-500",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: Pill,
    title: "Medicine Reminders",
    description: "Smart notifications ensure you never miss a dose of your medication",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "SOS Family Notification",
    description: "Automatic alerts to emergency contacts when you request help",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Smartphone,
    title: "Panic Tap Feature",
    description: "Tap 5 times rapidly to trigger silent emergency alert",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Comprehensive Care Platform</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
            <br />
            <span className="text-gradient">In One Place</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced features designed to save lives and provide comprehensive healthcare management
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-6 group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon
                  className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text`}
                  style={{
                    color: feature.color.includes("red")
                      ? "#ef4444"
                      : feature.color.includes("blue")
                      ? "#3b82f6"
                      : feature.color.includes("purple")
                      ? "#a855f7"
                      : feature.color.includes("green")
                      ? "#22c55e"
                      : feature.color.includes("rose")
                      ? "#f43f5e"
                      : feature.color.includes("indigo")
                      ? "#6366f1"
                      : feature.color.includes("amber")
                      ? "#f59e0b"
                      : feature.color.includes("teal")
                      ? "#14b8a6"
                      : feature.color.includes("slate")
                      ? "#64748b"
                      : feature.color.includes("orange")
                      ? "#f97316"
                      : feature.color.includes("pink")
                      ? "#ec4899"
                      : feature.color.includes("cyan")
                      ? "#06b6d4"
                      : "#fff",
                  }}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-red-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}