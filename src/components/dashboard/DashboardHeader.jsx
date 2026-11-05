"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Search,
  AlertTriangle,
  Menu,
  X,
  Heart,
  Calendar,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useNotificationStore, useAuthStore } from "@/lib/store";
import { mockNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAsRead } = useNotificationStore();

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "emergency":
        return AlertTriangle;
      case "appointment":
        return Calendar;
      case "prescription":
        return FileText;
      default:
        return Bell;
    }
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="w-64 pl-9 h-10 rounded-xl bg-secondary/50 border-white/10"
            />
          </div>

          <Link href="/emergency">
            <Button
              size="sm"
              className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 gap-2 emergency-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">SOS</span>
            </Button>
          </Link>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {(unreadCount > 0 || displayNotifications.filter((n) => !n.isRead).length > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 glass-card p-4 max-h-96 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Notifications</h3>
                    <button className="text-xs text-red-400 hover:text-red-300">
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2">
                    {displayNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <motion.div
                          key={notification.id}
                          whileHover={{ x: 4 }}
                          className={cn(
                            "p-3 rounded-xl cursor-pointer transition-colors",
                            notification.isRead ? "bg-white/5" : "bg-red-500/10"
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                notification.type === "emergency"
                                  ? "bg-red-500/20 text-red-400"
                                  : notification.type === "appointment"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-green-500/20 text-green-400"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/dashboard/profile" className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm cursor-pointer"
            >
              {user?.name?.charAt(0) || "U"}
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
  );
}