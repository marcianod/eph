"use client";

import React, { useState } from "react";
import { Play, Square, Pill, Activity, Settings, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrbLayout() {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col items-center justify-center p-6">
            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full -z-10" />

            {/* Top Navigation / Stats */}
            <div className="absolute top-12 left-0 right-0 px-8 flex justify-between items-center max-w-md mx-auto">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1">Last Attack</span>
                    <span className="text-sm font-medium text-zinc-300">12 Days Ago</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-indigo-400" />
                </div>
            </div>

            {/* Main Orb Section */}
            <div className="relative group cursor-pointer" onClick={() => setIsActive(!isActive)}>
                {/* Outer Ring Glow */}
                <div className={cn(
                    "absolute inset-[-40px] rounded-full transition-all duration-1000 blur-2xl",
                    isActive ? "bg-rose-500/20 animate-pulse" : "bg-indigo-500/10"
                )} />

                {/* Main Orb */}
                <div className={cn(
                    "relative w-64 h-64 rounded-full border border-zinc-800 backdrop-blur-3xl flex flex-col items-center justify-center transition-all duration-500",
                    isActive
                        ? "bg-zinc-900/40 border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] scale-105"
                        : "bg-zinc-900/60 hover:bg-zinc-900/80 hover:scale-105"
                )}>
                    {/* Visual Pulse for Active State */}
                    {isActive && (
                        <div className="absolute inset-0 rounded-full animate-ping bg-rose-500/5 duration-[2000ms]" />
                    )}

                    <div className={cn(
                        "p-6 rounded-full transition-colors duration-500 mb-4",
                        isActive ? "bg-rose-500/10" : "bg-indigo-500/10"
                    )}>
                        {isActive ? (
                            <Square className="w-12 h-12 text-rose-500 fill-rose-500" />
                        ) : (
                            <Play className="w-12 h-12 text-indigo-500 fill-indigo-500 translate-x-1" />
                        )}
                    </div>

                    <div className="text-center">
                        <p className={cn(
                            "text-xl font-bold tracking-tight mb-1",
                            isActive ? "text-rose-400" : "text-zinc-100"
                        )}>
                            {isActive ? "Attack Active" : "Start Attack"}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">
                            {isActive ? "Tap to end" : "Tap to log"}
                        </p>
                    </div>
                </div>

                {/* Orbiting Labels (only if active) */}
                {isActive && (
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 animate-in fade-in zoom-in duration-500">
                        <div className="bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 tabular-nums">0:42:15</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Quick Actions */}
            <div className="absolute bottom-12 left-0 right-0 px-8 flex justify-center gap-6 max-w-md mx-auto">
                <button className="group flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                        <Pill className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Meds</span>
                </button>
                <button className="group flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                        <Calendar className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">History</span>
                </button>
                <button className="group flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                        <Settings className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Setts</span>
                </button>
            </div>

            <p className="absolute bottom-6 text-[10px] text-zinc-600 font-medium uppercase tracking-[0.4em]">EPH OS v4.0</p>
        </div>
    );
}
