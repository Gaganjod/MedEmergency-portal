"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { ShieldCheck, Heart, Clock, Users, Award, Building2, Ambulance, Stethoscope } from "lucide-react";

const stats = [
  { label: "Hospitals Connected", value: "127+", icon: Building2 },
  { label: "Emergency Responses", value: "3,256+", icon: Ambulance },
  { label: "Verified Doctors", value: "892+", icon: Stethoscope },
  { label: "Lives Impacted", value: "15,000+", icon: Heart },
];

const values = [
  {
    icon: Clock,
    title: "Rapid Response",
    description: "Every second counts in emergencies. Our platform connects you to the nearest available care within minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description: "All hospitals and doctors on our platform are verified and meet strict quality standards.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "We believe healthcare should be accessible to everyone, regardless of location or circumstance.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We continuously improve our services based on feedback to deliver the best possible care coordination.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              <Heart className="w-4 h-4" />
              Our Mission
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Saving Lives Through{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                Faster Emergency Care
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              MedEmergency is dedicated to revolutionizing emergency medical response by connecting 
              patients with the right care at the right time. Our platform bridges the gap between 
              those in need and life-saving medical services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  MedEmergency was born from a simple yet powerful realization: in medical emergencies, 
                  the time spent searching for the right hospital or doctor can mean the difference 
                  between life and death.
                </p>
                <p>
                  Founded in 2023 by a team of healthcare professionals and technology experts, 
                  we set out to create a platform that eliminates this critical delay. Our system 
                  instantly connects patients with nearby hospitals, available beds, and qualified 
                  medical professionals.
                </p>
                <p>
                  Today, we serve thousands of users across multiple cities, working with over 100 
                  hospitals and nearly 900 verified doctors to ensure that help is always just a 
                  click away.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=600&fit=crop"
                  alt="Medical team"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Trusted Platform</div>
                    <div className="text-sm text-muted-foreground">Verified providers</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at MedEmergency.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}