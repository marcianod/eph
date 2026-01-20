"use client";

import React, { useState } from "react";
import { Clock, History, MoreHorizontal, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TimelineBlade() {
    const [isLogging, setIsLogging] = useState(false);

    // Mocked 24h segments
    const hours = Array.from({ length: 6 }, (_, i) => 8 + i); // 8 AM to 1 PM

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-100 font-sans p-6 overflow-hidden flex">
            {/* Left: Time Scale */}
            <div className="w-12 py-10 flex flex-col justify-between text-[10px] font-bold text-zinc-700 uppercase tracking-tighter border-r border-zinc-900 pr-4">
                {hours.map(h => <span key={h}>{h}:00</span>)}
            </div>

            {/* Main Content */}
            <div className="flex-1 pl-6 py-8 space-y-10">
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight uppercase leading-none mb-2">Blade UI</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Stable for 12d</span>
                        </div>
                    </div>
                    <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500">
                        <Target className="w-4 h-4" />
                    </button>
                </header>

                {/* Prediction Context Row */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex gap-4">
                    <div className="text-indigo-400">
                        <Target className="w-5 h-5 mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest leading-none">Predicted</p>
                        <p className="text-lg font-black tabular-nums">15:30</p>
                    </div>
                    <div className="flex-1 space-y-2 pt-1">
                        <p className="text-[10px] text-zinc-500 font-medium">Next high-risk window identified based on historical recurrence at this interval.</p>
                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[65%] opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Day Blade View (Vertical Timeline) */}
                <div className="relative h-96 w-full max-w-[200px] border-l border-zinc-900 mx-auto">
                    {/* Hour Markers */}
                    {hours.map((_, i) => (
                        <div key={i} className="absolute left-0 w-4 h-px bg-zinc-900" style={{ top: `${(i / (hours.length - 1)) * 100}%` }} />
                    ))}

                    {/* Predicted Window Ghost */}
                    <div className="absolute left-2 right-4 bg-indigo-500/10 border-l-2 border-indigo-500/40 rounded-r-lg" style={{ top: '75%', height: '15%' }}>
                        <div className="p-2 opacity-40">
                            <p className="text-[8px] font-black uppercase tracking-tighter text-indigo-400">Expected</p>
                        </div>
                    </div>

                    {/* Past Attack Block */}
                    <div className="absolute left-2 right-4 bg-zinc-900 border-l-2 border-white/20 rounded-r-lg" style={{ top: '10%', height: '20%' }}>
                        <div className="p-3">
                            <p className="text-[10px] font-bold text-zinc-400">08:15 - 09:30</p>
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-1 rounded-full bg-zinc-700" />)}
                            </div>
                        </div>
                    </div>

                    {/* Current/New Interaction Area */}
                    {isLogging ? (
                        <div className="absolute left-[-1px] right-2 bg-rose-500 border-l-4 border-rose-300 rounded-r-xl shadow-[0_20px_40px_rgba(244,63,94,0.3)] animate-in slide-in-from-left-2" style={{ top: '45%', height: '25%' }}>
                            <div className="p-4 flex flex-col h-full justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-100">Logging Attack</p>
                                    <p className="text-lg font-black text-white tabular-nums">10:45</p>
                                </div>
                                <button
                                    onClick={() => setIsLogging(false)}
                                    className="bg-black/20 hover:bg-black/40 text-[10px] font-bold uppercase py-2 rounded-lg text-white transition-colors"
                                >
                                    Log Duration
                                </button>
                            </div>
                            {/* Draggable Drag Handles (Visual Only) */}
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-rose-300/50 rounded-full cursor-ns-resize" />
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-rose-300/50 rounded-full cursor-ns-resize" />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsLogging(true)}
                            className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl shadow-black hover:scale-110 active:scale-95 transition-all"
                        >
                            <Zap className="w-6 h-6 fill-current" />
                        </button>
                    )}
                </div>

                {/* Global Offset Hint */}
                {!isLogging && (
                    <div className="pt-12 flex justify-center gap-10 opacity-40">
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">-15m</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <History className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Patch</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
