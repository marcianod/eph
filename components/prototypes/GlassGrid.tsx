"use client";

import React from "react";
import { Play, Pill, History, Zap, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GlassGrid() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 p-4 pt-16 flex flex-col items-center">
            <div className="w-full max-w-sm space-y-4">
                {/* Header */}
                <header className="px-2 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">EPH Tracker</h1>
                        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">January 20, 2026</p>
                    </div>
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center">
                                <Activity className="w-3 h-3 text-zinc-500" />
                            </div>
                        ))}
                    </div>
                </header>

                {/* Primary Action Tile */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-zinc-950 border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap className="w-32 h-32 text-indigo-500" />
                        </div>
                        <div className="w-20 h-20 rounded-3xl bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center mb-6">
                            <Play className="w-8 h-8 text-white fill-white translate-x-1" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Start Attack</h2>
                        <p className="text-zinc-500 text-sm font-medium">Log your symptoms now</p>
                    </div>
                </div>

                {/* Secondary Tiles Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Meds Tile */}
                    <div className="bg-[#0c0c0e] border border-zinc-800/40 rounded-[2rem] p-6 hover:border-zinc-700 transition-colors flex flex-col justify-between aspect-square">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Pill className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Meds</h3>
                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest leading-none">Quick Log</p>
                        </div>
                    </div>

                    {/* History Tile */}
                    <div className="bg-[#0c0c0e] border border-zinc-800/40 rounded-[2rem] p-6 hover:border-zinc-700 transition-colors flex flex-col justify-between aspect-square">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <History className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Logs</h3>
                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest leading-none">View All</p>
                        </div>
                    </div>
                </div>

                {/* Status Wide Tile */}
                <div className="bg-[#0c0c0e] border border-zinc-800/40 rounded-[2.5rem] p-6 flex items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Stability</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black tabular-nums leading-none">12</p>
                        <p className="text-[9px] font-bold uppercase tracking-tight text-zinc-500">Days Clean</p>
                    </div>
                </div>

                {/* Hint */}
                <p className="text-center text-zinc-600 text-[10px] pt-4 font-medium uppercase tracking-[0.1em]">
                    Swipe down for clinical summary
                </p>
            </div>
        </div>
    );
}
