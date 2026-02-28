"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, MessageSquare, Radio, CheckCircle2 } from "lucide-react";

interface ReminderFormProps {
    selectedLocation: [number, number] | null;
    onSuccess: () => void;
}

export default function ReminderForm({ selectedLocation, onSuccess }: ReminderFormProps) {
    const [radius, setRadius] = useState(100);
    const [message, setMessage] = useState("");
    const [triggerType, setTriggerType] = useState<"ENTER" | "EXIT">("ENTER");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLocation) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/reminders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location: [selectedLocation[1], selectedLocation[0]], // [lng, lat]
                    radius,
                    message,
                    triggerType,
                }),
            });

            if (res.ok) {
                setMessage("");
                onSuccess();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                    <Target size={14} className="text-primary-400" />
                    Deployment Target
                </label>
                <div className={`p-4 rounded-xl border transition-all duration-300 ${selectedLocation
                        ? 'bg-primary-500/10 border-primary-500/30 text-primary-200'
                        : 'bg-white/5 border-white/10 text-white/40 italic'
                    }`}>
                    {selectedLocation
                        ? `${selectedLocation[0].toFixed(5)}, ${selectedLocation[1].toFixed(5)}`
                        : "Click map to set target point"
                    }
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/40">
                    <label className="flex items-center gap-2">
                        <Radio size={14} className="text-primary-400" />
                        Detection Radius
                    </label>
                    <span className="text-primary-400">{radius} meters</span>
                </div>
                <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                    <MessageSquare size={14} className="text-primary-400" />
                    Alert Message
                </label>
                <input
                    type="text"
                    className="input-field py-2.5 text-sm"
                    placeholder="What should it say?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                {(["ENTER", "EXIT"] as const).map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setTriggerType(type)}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${triggerType === type
                                ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                            }`}
                    >
                        Trigger on {type}
                    </button>
                ))}
            </div>

            <button
                type="submit"
                disabled={!selectedLocation || isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-2"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <CheckCircle2 size={18} />
                        Initialize Monitor
                    </>
                )}
            </button>
        </form>
    );
}
