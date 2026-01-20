"use strict";

import React, { useState } from "react";
import {
    History,
    Settings,
    MoreVertical,
    Activity,
    Brain,
    Clock,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SmartDial() {
    const [mode, setMode] = useState<'scan' | 'logging'>('scan');

    return (
        <div className="h-full w-full bg-[#080808] text-zinc-100 flex flex-col font-sans relative overflow-hidden">

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-zinc-900/20 to-transparent pointer-events-none" />

            {/* 1. Top Bar */}
            <header className="p-6 flex justify-between items-start z-10">
                <div>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Current State</span>
                    <div className="flex items-center gap-2 mt-1">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-zinc-300">Stable Analysis</span>
                    </div>
                </div>
                <button className="p-2 -mr-2 text-zinc-500 hover:text-white">
                    <Settings className="w-5 h-5" />
                </button>
            </header>

            {/* 2. Central Dial Interface */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-10">

                {/* The Dial Container */}
                <div className="relative w-[280px] h-[280px]">

                    {/* Outer Rings (Static decoration/Status) */}
                    <div className="absolute inset-0 rounded-full border border-zinc-900" />
                    <div className="absolute inset-4 rounded-full border border-zinc-800/50" />

                    {/* Active Dial (The Interactive Part) */}
                    <button
                        onClick={() => setMode(m => m === 'scan' ? 'logging' : 'scan')}
                        className={cn(
                            "absolute inset-8 rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-out group",
                            mode === 'scan'
                                ? "bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)]"
                                : "bg-white text-black scale-110 shadow-[0_0_100px_rgba(255,255,255,0.1)]"
                        )}
                    >
                        {mode === 'scan' ? (
                            <>
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 mb-4 flex items-center justify-center shadow-inner">
                                    <Brain className="w-10 h-10 text-zinc-400" />
                                </div>
                                <span className="text-xs font-medium text-zinc-400 tracking-wider uppercase">Tap to Log</span>
                                <span className="text-[10px] text-zinc-600 mt-1">Prediction: 2h</span>
                            </>
                        ) : (
                            /* Logging Mode Interface */
                            <div className="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                <span className="text-sm font-bold uppercase tracking-widest mb-1 opacity-50">Attack Start?</span>
                                <div className="text-3xl font-black tracking-tighter">NOW</div>

                                {/* Secondary Options within the circle */}
                                <div className="absolute bottom-8 flex gap-4">
                                    <button className="text-[10px] font-bold px-2 py-1 bg-black/5 rounded-md hover:bg-black/10 transition-colors">-15m</button>
                                    <button className="text-[10px] font-bold px-2 py-1 bg-black/5 rounded-md hover:bg-black/10 transition-colors">-1h</button>
                                </div>

                                <div className="absolute top-6 right-6">
                                    <span className="flex w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        )}
                    </button>

                    {/* Orbiting Elements (Only in Scan Mode) */}
                    {mode === 'scan' && (
                        <>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3">
                                <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] text-zinc-500">Low Risk</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Dynamic Context Text */}
                <div className="mt-12 h-10 text-center">
                    {mode === 'scan' ? (
                        <p className="text-sm text-zinc-500 max-w-[200px] leading-relaxed">
                            No recent triggers detected. You are trending well.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-zinc-400">Tap center to confirm</p>
                            <button className="text-xs text-zinc-600 underline" onClick={(e) => { e.stopPropagation(); setMode('scan'); }}>Cancel</button>
                        </div>
                    )}
                </div>

            </main>

            {/* 3. Bottom Utility Bar */}
            <footer className="p-6 bg-zinc-900/10 backdrop-blur-sm border-t border-zinc-900/50">
                <div className="flex justify-between items-center max-w-[280px] mx-auto">
                    <NavIcon icon={History} label="History" />
                    <div className="w-px h-8 bg-zinc-800" />
                    <NavIcon icon={Clock} label="Sleep" active />
                    <div className="w-px h-8 bg-zinc-800" />
                    <NavIcon icon={RotateCcw} label="Edit Last" />
                </div>
            </footer>

        </div>
    );
}

function NavIcon({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={cn(
            "flex flex-col items-center gap-1.5 transition-colors",
            active ? "text-white" : "text-zinc-600 hover:text-zinc-400"
        )}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}
