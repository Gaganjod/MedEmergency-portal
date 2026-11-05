"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Menu,
  X,
  Phone,
  Stethoscope,
  Building2,
  ShieldCheck,
  Droplets,
} from "lucide-react";

const navLinks = [
  { name: "Blood Bank", href: "/login", icon: Droplets },
  { name: "About", href: "/about", icon: ShieldCheck },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[100]"
    >
      <div className="mx-4 mt-4 relative">
        <div className="glass rounded-2xl px-6 py-4 relative z-[100]">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <div className="absolute -inset-1 bg-red-500/20 rounded-xl blur-lg group-hover:bg-red-500/40 transition-all" />
              </motion.div>
              <span className="text-xl font-bold tracking-tight">
                Med<span className="text-red-500">Emergency</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <motion.a
                href="tel:911"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span className="font-semibold">911</span>
              </motion.a>
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 border-0">
                  Get Started
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mx-4 mt-2 overflow-hidden"
          >
            <div className="glass rounded-2xl p-4 space-y-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <link.icon className="w-5 h-5 text-red-400" />
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <a
                  href="tel:911"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-semibold">Emergency: 911</span>
                </a>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full rounded-xl">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}