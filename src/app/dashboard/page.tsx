"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ReminderForm from "@/components/ReminderForm";
import ReminderList from "@/components/ReminderList";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { Map as MapIcon, Bell, List, Settings, LogOut, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";

const MapComponent = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center rounded-2xl border border-white/5">
            <div className="text-white/20 flex flex-col items-center gap-4">
                <MapIcon size={48} />
                <p className="font-medium">Loading Map Intel...</p>
            </div>
        </div>
    )
});

export default function DashboardPage() {
    const { location, error: geoError } = useGeolocation();
    const { isSubscribed, subscribe, unsubscribe, isSupported } = usePushNotifications();
    const [reminders, setReminders] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"monitors" | "notifications" | "settings">("monitors");
    const router = useRouter();

    const fetchReminders = async () => {
        try {
            const res = await fetch("/api/reminders");
            if (res.ok) {
                const data = await res.json();
                setReminders(data);
            }
        } catch (err) {
            console.error("Failed to fetch reminders:", err);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchReminders();
    }, []);

    return (
        <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-[#050508] overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-20 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-row lg:flex-col items-center py-4 lg:py-8 px-4 gap-8 z-30 shrink-0">
                <div className="p-3 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/20">
                    <MapIcon size={24} className="text-white" />
                </div>

                <nav className="flex flex-row lg:flex-col gap-6 flex-1 justify-center lg:justify-start">
                    <button
                        onClick={() => setActiveTab("monitors")}
                        className={`p-3 rounded-xl transition-all ${activeTab === "monitors" ? "text-primary-400 bg-primary-500/10" : "text-white/40 hover:text-white"
                            }`}
                    >
                        <List size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`p-3 rounded-xl transition-all ${activeTab === "notifications" ? "text-primary-400 bg-primary-500/10" : "text-white/40 hover:text-white"
                            }`}
                    >
                        <Bell size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`p-3 rounded-xl transition-all ${activeTab === "settings" ? "text-primary-400 bg-primary-500/10" : "text-white/40 hover:text-white"
                            }`}
                    >
                        <Settings size={24} />
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="p-3 text-white/40 hover:text-red-400 transition-colors"
                >
                    <LogOut size={24} />
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Left Side: Controls & List */}
                <section className="w-full lg:w-[400px] h-[50vh] lg:h-full p-6 lg:p-8 flex flex-col gap-8 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/5 bg-black/20 z-20 order-2 lg:order-1">
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Control Center</h1>
                            <p className="text-sm text-white/40">Manage your geofences</p>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={isSubscribed ? unsubscribe : subscribe}
                            className={`p-2 rounded-xl transition-all duration-300 ${isSubscribed
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-primary-500/10 text-primary-400 border border-primary-500/20 animate-pulse'
                                }`}
                        >
                            {isSubscribed ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                        </motion.button>
                    </header>

                    <div className="space-y-8">
                        <AnimatePresence mode="wait">
                            {activeTab === "monitors" && (
                                <motion.div
                                    key="monitors"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <div className="glass-card p-6">
                                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <MapIcon size={18} className="text-primary-400" />
                                            Create Geofence
                                        </h2>
                                        <ReminderForm
                                            selectedLocation={selectedLocation}
                                            onSuccess={() => {
                                                fetchReminders();
                                                setSelectedLocation(null);
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
                                            <List size={18} className="text-primary-400" />
                                            Active Monitors
                                        </h2>
                                        <ReminderList reminders={reminders} onDeleted={fetchReminders} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "notifications" && (
                                <motion.div
                                    key="notifications"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="glass-card p-8 text-center"
                                >
                                    <Bell size={48} className="text-white/10 mx-auto mb-4" />
                                    <h2 className="text-xl font-bold mb-2">Alert History</h2>
                                    <p className="text-white/40 text-sm italic">No recent alerts recorded in this tactical zone.</p>
                                </motion.div>
                            )}

                            {activeTab === "settings" && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="glass-card p-6 space-y-6"
                                >
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Settings size={20} className="text-primary-400" />
                                        Configuration
                                    </h2>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">System Mode</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Dark Command Center</span>
                                            <div className="w-10 h-5 bg-primary-600 rounded-full flex items-center justify-end px-1">
                                                <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Precision Level</p>
                                        <p className="text-sm font-medium">Centimeter Accurate (PostGIS)</p>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            const res = await fetch("/api/push/test", { method: "POST" });
                                            if (!res.ok) {
                                                const data = await res.json();
                                                alert(data.error || "Failed to send test notification");
                                            }
                                        }}
                                        className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
                                    >
                                        <Bell size={18} className="text-primary-400" />
                                        Send Test Signal
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Right Side: Visual Map */}
                <section className="flex-1 h-[50vh] lg:h-full p-4 lg:p-4 bg-zinc-950/50 order-1 lg:order-2">
                    <div className="w-full h-full relative group">
                        <MapComponent
                            reminders={reminders}
                            userLocation={location}
                            onMapClick={(lat, lng) => setSelectedLocation([lat, lng])}
                            selectedLocation={selectedLocation}
                        />

                        {/* Map Overlay Info */}
                        <div className="absolute top-6 left-6 z-[400] pointer-events-none">
                            <div className="glass-card px-4 py-2 flex items-center gap-3 backdrop-blur-md">
                                <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="text-xs font-bold tracking-wider uppercase opacity-70">
                                    {location ? 'Signal Lock Confirmed' : 'No Signal Lock'}
                                </span>
                            </div>
                        </div>

                        {mounted && !isSupported && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-8 text-center">
                                <div className="max-w-md glass-card p-8 border-red-500/20">
                                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Push Notifications Unsupported</h3>
                                    <p className="text-white/60 mb-6">Your browser doesn't support local notifications. Please use a Chrome or Firefox base browser for full features.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
