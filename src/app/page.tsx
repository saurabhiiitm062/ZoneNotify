"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Shield, ArrowRight, Map as MapIcon } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center">
      <div className="text-white/20 flex flex-col items-center gap-4">
        <MapIcon size={48} />
        <p className="font-medium">Initializing Map Intel...</p>
      </div>
    </div>
  )
});

export default function LandingPage() {
  const router = useRouter();
  const { location, error: geoError } = useGeolocation();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeMessage, setActiveMessage] = useState("HELLO.");

  useEffect(() => {
    setMounted(true);
    const initialize = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          // Fetch latest reminder to show its message
          const reminderRes = await fetch("/api/reminders");
          if (reminderRes.ok) {
            const reminders = await reminderRes.json();
            if (reminders.length > 0) {
              setActiveMessage(reminders[0].message.toUpperCase());
            }
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="h-screen w-screen bg-[#050508] relative overflow-hidden text-white flex flex-col">
      {/* Dynamic Map Background */}
      <div className="absolute inset-0 z-0">
        {mounted && (
          <MapComponent
            reminders={[]}
            userLocation={location}
            onMapClick={() => router.push("/dashboard")}
            selectedLocation={null}
          />
        )}
        {/* Dark Overlay to make text readable */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <MapPin className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">ZoneNotify</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            Sign In
          </Link>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-500/20"
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mx-auto">
            <Shield size={12} />
            Signal Operational
          </div>

          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
            {activeMessage.includes(".") ? activeMessage.split(".")[0] : activeMessage} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-500">
              {activeMessage.includes(".") ? activeMessage.split(".")[1] : "."}
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-xl mx-auto leading-relaxed">
            Your personal geofencing command center is ready. Click the map or hit the button below to initialize your dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="group bg-white text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-primary-400 hover:text-white transition-all shadow-2xl"
            >
              INITIALIZE DASHBOARD
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="relative z-20 px-8 py-6 flex items-center justify-between border-t border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            PostGIS Active
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Vector Engine Ready
          </div>
        </div>
        <p className="text-[10px] text-white/20 uppercase font-black">Tactical Location Systems &copy; 2026</p>
      </footer>
    </main>
  );
}
