"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    rating: 5,
    text: "This app saved my life. When I had a heart attack, help arrived in 6 minutes. The ambulance team already knew my medical history.",
  },
  {
    name: "Dr. Rajesh Kumar",
    role: "Emergency Physician",
    rating: 5,
    text: "As a doctor, I'm impressed by how this system works. We receive critical patient information before the ambulance even arrives.",
  },
  {
    name: "Priya Sharma",
    role: "Caregiver",
    rating: 5,
    text: "My elderly father lives alone. This app gives me peace of mind knowing he can get emergency help with just one tap.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />

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
            <Quote className="w-4 h-4" />
            <span className="text-sm font-medium">Real Stories</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Lives <span className="text-gradient">Saved</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from the people whose lives were changed by our emergency response system.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              
              <div className="relative bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full">
                <Quote className="w-10 h-10 text-red-400/30 mb-4" />
                
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>

                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}