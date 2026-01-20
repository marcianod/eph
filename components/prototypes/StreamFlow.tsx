"use strict";

import React, { useState } from "react";
import {
    History,
    Wind,
    Droplets,
    Zap,
    ChevronDown,
    Calendar,
    Clock,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StreamFlow() {

    return (
        <div className="h-full w-full bg-[#09090b] text-zinc-100 flex flex-col font-sans overflow-hidden">

            {/* 1. Header with Month Context */}
            <header className="px-6 py-5 flex justify-between items-end border-b border-zinc-900/50 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20">
                <div>
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1 block">October</span>
                    <h1 className="text-2xl font-semibold tracking-tight">Today, 24th</h1>
                </div>
                <button className="p-2 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white">
                    <Calendar className="w-5 h-5" />
                </button>
            </header>

            {/* 2. The Stream: Timeline View */}
            <main className="flex-1 overflow-y-auto relative p-4 space-y-8 scrollbar-hide">

                {/* FUTURE SECTION */}
                <div className="relative pl-8 pb-4 opacity-100 transition-opacity">
                    {/* Timeline Line */}
                    <div className="absolute left-[19px] top-2 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/50 to-indigo-500" />

                    <div className="mb-8 relative">
                        <span className="absolute -left-[42px] top-1 text-[10px] font-mono text-zinc-600 w-8 text-right">20:00</span>
                        <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-2xl relative">
                            <div className="absolute top-3 -left-[20px] w-3 h-3 rounded-full bg-[#09090b] border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10" />
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold text-indigo-300">Predicted High Risk</span>
                                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">85%</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                                Barometric pressure drop coinciding with typical evening fatigue.
                            </p>
                            <div className="flex gap-2">
                                <Badge icon={Wind} label="Pressure" />
                                <Badge icon={Droplets} label="Humidity" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* NOW / INSERTION POINT */}
                <div className="relative pl-8 py-2">
                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800" />

                    <div className="flex items-center gap-4 relative">
                        <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/20 z-10">
                            <Clock className="w-3 h-3 text-black animate-pulse" />
                        </div>
                        <span className="absolute -left-[54px] top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 w-8 text-right">NOW</span>

                        {/* Create Entry Button (Inline) */}
                        <button className="flex-1 h-14 border border-dashed border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:bg-zinc-900 hover:border-zinc-600 hover:text-zinc-300 transition-all group">
                            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                            <span className="text-sm font-medium">Log event at this time</span>
                        </button>
                    </div>
                </div>

                {/* PAST SECTION */}
                <div className="relative pl-8 pt-4 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="absolute left-[19px] top-0 bottom-10 w-px bg-gradient-to-b from-zinc-800 to-transparent" />

                    <div className="mb-6 relative">
                        <span className="absolute -left-[42px] top-1 text-[10px] font-mono text-zinc-600 w-8 text-right">08:30</span>
                        <div className="absolute top-2 -left-[18px] w-2 h-2 rounded-full bg-zinc-700 z-10" />

                        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                <span className="text-sm font-medium text-zinc-300">Medication Taken</span>
                            </div>
                            <span className="text-xs text-zinc-500">Ibuprofen 400mg</span>
                        </div>
                    </div>

                    <div className="mb-6 relative">
                        <span className="absolute -left-[42px] top-1 text-[10px] font-mono text-zinc-600 w-8 text-right">Yest.</span>
                        <div className="absolute top-2 -left-[18px] w-2 h-2 rounded-full bg-zinc-700 z-10" />

                        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <span className="text-sm font-medium text-zinc-300 block mb-1">Low Intensity Headache</span>
                            <span className="text-xs text-zinc-500">Duration: 2h 15m • Intensity: 3/10</span>
                        </div>
                    </div>
                </div>

            </main>

            {/* Floating Action Button (Alternative Log) */}
            <div className="absolute bottom-6 right-6 z-30">
                <button className="w-14 h-14 rounded-full bg-white text-black shadow-xl shadow-zinc-900/50 flex items-center justify-center hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                </button>
            </div>

        </div>
    );
}

function Badge({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
            <Icon className="w-3 h-3" />
            {label}
        </span>
    )
}
