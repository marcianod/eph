"use strict";

import React, { useState } from "react";
import {
    Moon,
    Sun,
    Clock,
    Plus,
    MoreHorizontal,
    ChevronRight,
    Pill,
    NotebookPen
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ZenFocus() {
    const [status, setStatus] = useState<'clear' | 'warning' | 'attack'>('clear');
    const [showLogSheet, setShowLogSheet] = useState(false);

    // Mock Prediction
    const prediction = {
        time: "Tomorrow, ~2:00 PM",
        confidence: "High (85%)",
        reason: "Sleep + Barometer"
    };

    return (
        <div className="h-full w-full bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">

            {/* 1. Header: Minimal, just the essentials */}
            <header className="p-6 flex justify-between items-center z-10">
                <div className="flex flex-col">
                    <h1 className="text-sm font-medium text-zinc-500 tracking-wider uppercase">Status</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            status === 'clear' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-orange-500"
                        )} />
                        <span className="text-lg font-semibold tracking-tight">All Clear</span>
                    </div>
                </div>
                <button className="p-3 rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                </button>
            </header>

            {/* 2. Main Focus Area: The Prediction or Current State */}
            <main className="flex-1 flex flex-col justify-center items-center p-8 relative">
                {/* Breathing Background Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse" />
                </div>

                <div className="relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800/50">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-medium text-zinc-300">Next Predicted Episode</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-5xl font-light tracking-tighter text-white">
                            {prediction.time.split(',')[0]}
                        </h2>
                        <p className="text-xl text-zinc-500 font-light">
                            {prediction.time.split(',')[1]}
                        </p>
                    </div>

                    <div className="h-px w-16 bg-zinc-800 mx-auto" />

                    <p className="text-sm text-zinc-600 max-w-[200px] mx-auto leading-relaxed">
                        {prediction.confidence} likelihood due to <span className="text-zinc-500">{prediction.reason}</span>.
                    </p>
                </div>
            </main>

            {/* 3. Action Area: Large, Easy Targets */}
            <div className="p-6 pb-12 z-10">
                {!showLogSheet ? (
                    <button
                        onClick={() => setShowLogSheet(true)}
                        className="w-full group relative overflow-hidden rounded-[2rem] bg-white text-black p-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="relative z-10 h-20 flex items-center justify-center gap-3">
                            <Plus className="w-6 h-6" />
                            <span className="text-xl font-medium tracking-tight">Log Attack</span>
                        </div>
                        {/* Subtle gradient hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 to-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ) : (
                    <div className="w-full bg-zinc-900 rounded-[2rem] border border-zinc-800 p-2 animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 mb-2">
                            <span className="text-sm font-medium text-zinc-400">When started?</span>
                            <button onClick={() => setShowLogSheet(false)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2">
                            <TimeOption label="Just Now" sub="Real-time" active />
                            <TimeOption label="15m Ago" sub="Building up" />
                            <TimeOption label="1h Ago" sub="Missed it" />
                            <TimeOption label="Woke Up" sub="Morning" icon={Sun} />
                        </div>

                        <button className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl font-medium transition-colors">
                            Confirm Start
                        </button>
                    </div>
                )}

                {/* Quick Log Row */}
                {!showLogSheet && (
                    <div className="mt-4 flex gap-3">
                        <QuickAction icon={Pill} label="Meds" />
                        <QuickAction icon={NotebookPen} label="Note" />
                        <QuickAction icon={Clock} label="History" />
                    </div>
                )}
            </div>
        </div>
    );
}

function TimeOption({ label, sub, icon: Icon, active }: { label: string, sub: string, icon?: any, active?: boolean }) {
    return (
        <button className={cn(
            "flex flex-col items-center justify-center gap-1 p-4 rounded-xl border transition-all",
            active
                ? "bg-zinc-800 border-zinc-600 text-white"
                : "bg-black/20 border-zinc-800/50 text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
        )}>
            {Icon && <Icon className="w-4 h-4 mb-1 opacity-50" />}
            <span className="text-sm font-medium">{label}</span>
            <span className="text-[10px] opacity-60">{sub}</span>
        </button>
    )
}

function QuickAction({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors">
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
        </button>
    )
}
