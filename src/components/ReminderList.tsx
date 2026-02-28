"use client";

import { Trash2, Radio, Bell, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Reminder {
    id: string;
    message: string;
    radius: number;
    triggerType: "ENTER" | "EXIT";
    previousState: string;
    isTriggered: boolean;
}

interface ReminderListProps {
    reminders: Reminder[];
    onDeleted: () => void;
}

export default function ReminderList({ reminders, onDeleted }: ReminderListProps) {
    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
            if (res.ok) onDeleted();
        } catch (err) {
            console.error(err);
        }
    };

    if (reminders.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-white/20 text-sm font-medium italic">No active monitors detected</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {reminders.map((reminder) => (
                    <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative glass-card p-4 overflow-hidden"
                    >
                        {/* Status gradient indicator */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${reminder.isTriggered ? 'bg-green-500' : 'bg-primary-500'
                            }`} />

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${reminder.triggerType === "ENTER"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "bg-orange-500/20 text-orange-400"
                                        }`}>
                                        {reminder.triggerType} Trigger
                                    </span>
                                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                                        {reminder.radius}m Radius
                                    </span>
                                </div>

                                <h3 className="text-sm font-semibold text-white/90 truncate pr-2">
                                    {reminder.message}
                                </h3>
                            </div>

                            <button
                                onClick={() => handleDelete(reminder.id)}
                                className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase opacity-40">
                                <div className="flex items-center gap-1.5">
                                    <Radio size={12} className={reminder.previousState === 'INSIDE' ? 'text-green-500' : 'text-blue-500'} />
                                    {reminder.previousState}
                                </div>
                            </div>

                            {reminder.isTriggered && (
                                <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase">
                                    <Bell size={10} />
                                    Triggered
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
