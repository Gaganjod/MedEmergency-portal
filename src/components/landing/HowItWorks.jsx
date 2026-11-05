"use client";

import { motion } from "framer-motion";
import { Smartphone, MapPin, Ambulance, Building2, CheckCircle } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: Smartphone,
    title: "Press HELP NOW",
    description: "One tap activates the emergency system and auto-detects your location",
    color: "from-red-500 to-orange-500",
  },
  {
    step: 2,
    icon: MapPin,
    title: "Location Detected",
    description: "GPS pinpoints your exact location and identifies nearby hospitals",
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: 3,
    icon: Building2,
    title: "Hospital Notified",
    description: "Nearest hospitals receive your emergency request with full details",
    color: "from-purple-500 to-pink-500",
  },
  {
    step: 4,
    icon: Ambulance,
    title: "Ambulance Dispatched",
    description: "Track the ambulance in real-time as it rushes to your location",
    color: "from-green-500 to-emerald-500",
  },
  {
    step: 5,
    icon: CheckCircle,
    title: "Help Arrives",
    description: "Professional medical team arrives prepared with your medical history",
    color: "from-amber-500 to-yellow-500",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent" />

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-6"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Simple 5-Step Process</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting emergency help has never been easier. Our streamlined process ensures help reaches you in minutes.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500/20 via-blue-500/20 to-green-500/20 -translate-y-1/2" />

          <div className="grid lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <step.icon className="w-9 h-9 text-white" />
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-white/20 flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </motion.div>

                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="lg:hidden w-0.5 h-8 bg-gradient-to-b from-white/20 to-transparent mx-auto my-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
