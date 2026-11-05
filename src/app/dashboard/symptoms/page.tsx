"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Search,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Pill,
  Stethoscope,
  Phone,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const symptomConditionsMap: Record<string, string[]> = {
  chest: ["Angina", "Heart Attack", "Acid Reflux", "Costochondritis", "Anxiety"],
  breathing: ["Asthma", "COPD", "Pneumonia", "Anxiety", "Pulmonary Embolism"],
  fever: ["Influenza", "COVID-19", "Bacterial Infection", "Viral Infection", "Malaria"],
  headache: ["Migraine", "Tension Headache", "Sinusitis", "Hypertension", "Dehydration"],
  dizziness: ["Vertigo", "Low Blood Pressure", "Dehydration", "Anemia", "Inner Ear Infection"],
  fatigue: ["Anemia", "Thyroid Disorder", "Depression", "Sleep Apnea", "Chronic Fatigue Syndrome"],
  cough: ["Common Cold", "Bronchitis", "Allergies", "Asthma", "Pneumonia"],
  abdominal: ["Gastritis", "Appendicitis", "IBS", "Food Poisoning", "Gallstones"],
};

const commonSymptoms = [
  { name: "Chest Pain", icon: Heart, severity: "high" },
  { name: "Difficulty Breathing", icon: Wind, severity: "high" },
  { name: "High Fever", icon: Thermometer, severity: "medium" },
  { name: "Severe Headache", icon: Brain, severity: "medium" },
  { name: "Dizziness", icon: Activity, severity: "low" },
  { name: "Fatigue", icon: Activity, severity: "low" },
  { name: "Cough", icon: Wind, severity: "low" },
  { name: "Abdominal Pain", icon: Activity, severity: "medium" },
];

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setShowResults(false);
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }

    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const getUrgencyLevel = () => {
    const hasEmergency = selectedSymptoms.some((s) => 
      s.toLowerCase().includes("chest") || 
      s.toLowerCase().includes("breathing") ||
      s.toLowerCase().includes("stroke")
    );
    if (hasEmergency) return "emergency";
    
    const hasUrgent = selectedSymptoms.some((s) =>
      s.toLowerCase().includes("fever") ||
      s.toLowerCase().includes("headache")
    );
    if (hasUrgent) return "urgent";
    
    return "moderate";
  };

  const getPossibleConditions = () => {
    const conditions: { name: string; probability: number }[] = [];
    
    selectedSymptoms.forEach((symptom) => {
      const key = symptom.toLowerCase();
      Object.entries(symptomConditionsMap).forEach(([keyword, conditionList]) => {
        if (key.includes(keyword)) {
          conditionList.forEach((condition) => {
            const existing = conditions.find((c) => c.name === condition);
            if (existing) {
              existing.probability = Math.min(existing.probability + 15, 90);
            } else {
              conditions.push({ name: condition, probability: 45 + Math.random() * 30 });
            }
          });
        }
      });
    });

    if (conditions.length === 0) {
      return [
        { name: "General Discomfort", probability: 60 },
        { name: "Stress-Related Symptoms", probability: 45 },
        { name: "Minor Ailment", probability: 35 },
      ];
    }

    return conditions.sort((a, b) => b.probability - a.probability).slice(0, 5);
  };

  const urgencyLevel = getUrgencyLevel();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Symptom Checker</h1>
            <p className="text-muted-foreground">
              Select your symptoms for an AI-powered health assessment
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-400">Disclaimer</p>
              <p className="text-muted-foreground">
                This tool provides general guidance only and is not a substitute for professional medical advice. 
                If you&apos;re experiencing a medical emergency, please call 911 immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-secondary/50 border-white/10"
          />
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Common Symptoms</h3>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms
              .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((symptom) => (
                <motion.button
                  key={symptom.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleSymptom(symptom.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    selectedSymptoms.includes(symptom.name)
                      ? "border-purple-500 bg-purple-500/20 text-purple-300"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <symptom.icon className="w-4 h-4" />
                  {symptom.name}
                  {selectedSymptoms.includes(symptom.name) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </motion.button>
              ))}
          </div>
        </div>

        {selectedSymptoms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Selected Symptoms ({selectedSymptoms.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <Badge
                  key={symptom}
                  className="bg-purple-500/20 text-purple-300 cursor-pointer hover:bg-purple-500/30"
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        <Button
          onClick={analyzeSymptoms}
          disabled={selectedSymptoms.length === 0 || isAnalyzing}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Analyzing Symptoms...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Analyze Symptoms
            </>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div
              className={`glass-card p-6 border-2 ${
                urgencyLevel === "emergency"
                  ? "border-red-500/50 bg-red-500/5"
                  : urgencyLevel === "urgent"
                  ? "border-orange-500/50 bg-orange-500/5"
                  : "border-green-500/50 bg-green-500/5"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    urgencyLevel === "emergency"
                      ? "bg-red-500/20"
                      : urgencyLevel === "urgent"
                      ? "bg-orange-500/20"
                      : "bg-green-500/20"
                  }`}
                >
                  {urgencyLevel === "emergency" ? (
                    <AlertTriangle className="w-7 h-7 text-red-400" />
                  ) : urgencyLevel === "urgent" ? (
                    <Activity className="w-7 h-7 text-orange-400" />
                  ) : (
                    <CheckCircle className="w-7 h-7 text-green-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold capitalize">
                    {urgencyLevel === "emergency"
                      ? "Seek Immediate Medical Attention"
                      : urgencyLevel === "urgent"
                      ? "Consult a Doctor Soon"
                      : "Monitor Your Symptoms"}
                  </h2>
                  <p className="text-muted-foreground">
                    Based on your symptoms, here&apos;s our assessment
                  </p>
                </div>
              </div>

              {urgencyLevel === "emergency" && (
                <Link href="/emergency">
                  <Button className="w-full rounded-xl bg-red-600 hover:bg-red-500 emergency-pulse mb-4">
                    <Phone className="w-5 h-5 mr-2" />
                    Request Emergency Help
                  </Button>
                </Link>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Possible Conditions</h3>
              <div className="space-y-4">
                {getPossibleConditions().map((condition, i) => (
                  <motion.div
                    key={condition.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{condition.name}</p>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {Math.round(condition.probability)}% match
                      </Badge>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${condition.probability}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/dashboard/appointments">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 cursor-pointer"
                  >
                    <Calendar className="w-6 h-6 text-blue-400 mb-2" />
                    <p className="font-medium">Book Appointment</p>
                    <p className="text-sm text-muted-foreground">
                      Schedule a consultation with a specialist
                    </p>
                  </motion.div>
                </Link>
                <Link href="/dashboard/messages">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 cursor-pointer"
                  >
                    <Stethoscope className="w-6 h-6 text-green-400 mb-2" />
                    <p className="font-medium">Chat with Doctor</p>
                    <p className="text-sm text-muted-foreground">
                      Get instant advice from our medical team
                    </p>
                  </motion.div>
                </Link>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Self-Care Tips</h3>
              <div className="space-y-3">
                {[
                  "Rest and stay hydrated",
                  "Monitor your symptoms and note any changes",
                  "Avoid strenuous activities until symptoms improve",
                  "Take over-the-counter medications if appropriate",
                  "Seek medical attention if symptoms worsen",
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}