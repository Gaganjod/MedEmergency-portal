"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Building2, Stethoscope, User, Shield } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { mockUsers } from "@/lib/mock-data";
import { toast } from "sonner";

const roleIcons = {
  patient: User,
  doctor: Stethoscope,
  hospital: Building2,
  admin: Shield,
};

const demoAccounts = [
  { email: "patient@demo.com", role: "patient", label: "Patient" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        
        switch (data.user.role) {
          case "patient":
            router.push("/dashboard");
            break;
          case "doctor":
            router.push("/doctor");
            break;
          case "hospital":
            router.push("/hospital");
            break;
          case "admin":
            router.push("/admin");
            break;
          default:
            router.push("/dashboard");
        }
      } else {
        const mockUser = mockUsers.find((u) => u.email === email);
        if (mockUser) {
          login(mockUser, "mock-jwt-token");
          toast.success(`Welcome back, ${mockUser.name}!`);
          
          switch (mockUser.role) {
            case "patient":
              router.push("/dashboard");
              break;
            case "doctor":
              router.push("/doctor");
              break;
            case "hospital":
              router.push("/hospital");
              break;
            case "admin":
              router.push("/admin");
              break;
          }
        } else {
          toast.error(data.error || "Invalid credentials");
        }
      }
    } catch (error) {
      const mockUser = mockUsers.find((u) => u.email === email);
      if (mockUser) {
        login(mockUser, "mock-jwt-token");
        toast.success(`Welcome back, ${mockUser.name}!`);
        
        switch (mockUser.role) {
          case "patient":
            router.push("/dashboard");
            break;
          case "doctor":
            router.push("/doctor");
            break;
          case "hospital":
            router.push("/hospital");
            break;
          case "admin":
            router.push("/admin");
            break;
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword("demo123");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.email === demoEmail);
    if (user) {
      login(user, "mock-jwt-token");
      toast.success(`Welcome, ${user.name}!`);
      
      switch (user.role) {
        case "patient":
          router.push("/dashboard");
          break;
        case "doctor":
          router.push("/doctor");
          break;
        case "hospital":
          router.push("/hospital");
          break;
        case "admin":
          router.push("/admin");
          break;
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6" fill="currentColor" />
              </div>
              <span className="text-2xl font-bold">MedEmergency</span>
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Health,
              <br />
              Our Priority
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-md">
              Access emergency services, track ambulances, manage appointments, and keep your medical records secure - all in one place.
            </p>

            <div className="space-y-4">
              {[
                "24/7 Emergency Response",
                "Real-time Ambulance Tracking",
                "Secure Medical Records",
                "Video Consultations",
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold">
                Med<span className="text-red-500">Emergency</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Quick Demo Access:</p>
              <div className="flex justify-center">
                {demoAccounts.map((account) => {
                  const Icon = roleIcons[account.role];
                  return (
                    <motion.button
                      key={account.email}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDemoLogin(account.email)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary/50 hover:bg-secondary text-sm transition-colors disabled:opacity-50"
                    >
                      <Icon className="w-4 h-4 text-red-400" />
                      {account.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-secondary/50 border-white/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-red-400 hover:text-red-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl bg-secondary/50 border-white/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-red-400 hover:text-red-300 font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}