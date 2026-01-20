"use client";

import React, { useState } from "react";
import { Play, Square, Pill, Clock, Edit3, ChevronRight, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function PrecisionObsidian() {
    const [status, setStatus] = useState<'idle' | 'active'>('idle');

    return (
        <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30 p-6 flex flex-col items-center">
            <div className="w-full max-w-sm space-y-6 pt-8">

                {/* Prediction Banner */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold leading-none mb-1">Prediction</p>
                            <p className="text-sm font-medium">Likely attack in <span className="text-indigo-400">4h 20m</span></p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">82%</span>
                    </div>
                </div>

                {/* Main Control Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-8 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">{status === 'idle' ? "Ready" : "Ongoing"}</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{status === 'idle' ? "Systems Clear" : "Attack in progress"}</p>
                        </div>
                        {status === 'active' && (
                            <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full border border-rose-500/20">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-xs font-mono font-bold">0h 18m</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant={status === 'idle' ? "start" : "end"}
                            onClick={() => setStatus(status === 'idle' ? 'active' : 'idle')}
                            className="h-24 text-2xl font-black rounded-3xl w-full"
                        >
                            {status === 'idle' ? (
                                <><Play className="mr-3 w-8 h-8 fill-current" /> Log Now</>
                            ) : (
                                <><Square className="mr-3 w-8 h-8 fill-current" /> End Now</>
                            )}
                        </Button>

                        {/* Quick Offset Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="h-14 rounded-2xl bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-700 transition-colors flex flex-col items-center justify-center leading-tight">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">Adjusted</span>
                                <span className="text-sm font-bold text-zinc-300">-15 mins</span>
                            </button>
                            <button className="h-14 rounded-2xl bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-700 transition-colors flex flex-col items-center justify-center leading-tight">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">Adjusted</span>
                                <span className="text-sm font-bold text-zinc-300">-1 hour</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Meds Row */}
                <div className="flex gap-3">
                    <button className="flex-1 h-16 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 flex items-center gap-4 px-6 hover:border-zinc-700 transition-all group">
                        <Pill className="w-5 h-5 text-emerald-500" />
                        <div className="text-left">
                            <p className="text-sm font-bold leading-none mb-1">Sumatriptan</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">50mg</p>
                        </div>
                    </button>
                    <button className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-zinc-700 text-zinc-500">
                        <Edit3 className="w-5 h-5" />
                    </button>
                </div>

                {/* Recent History / Patching Access */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Recent Logs</h3>
                        <span className="text-[10px] font-bold text-indigo-400">Manage All</span>
                    </div>
                    <div className="space-y-2">
                        {[
                            { date: 'Today, 10:20', duration: '45m', intensity: 7 },
                            { date: 'Yesterday, 21:05', duration: '2h 10m', intensity: 4 }
                        ].map((log, i) => (
                            <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-3xl flex items-center justify-between group hover:bg-zinc-900 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex flex-col items-center justify-center leading-none">
                                        <span className="text-xs font-bold text-zinc-400">{log.intensity}</span>
                                        <span className="text-[8px] uppercase font-black text-zinc-600">Sev</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{log.date}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{log.duration}</p>
                                    </div>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit3 className="w-3 h-3 text-zinc-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
