"use client";

import React, { useState } from "react";
import {
    Play,
    History,
    Settings,
    LineChart,
    Plus,
    Edit3,
    X,
    Clock,
    Zap,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CrystalGrid() {
    const [activePanel, setActivePanel] = useState<'log' | 'history' | 'stats'>('log');

    return (
        <div className="h-full w-full bg-[#030303] text-zinc-100 flex flex-col font-sans overflow-hidden p-6 gap-6 relative">

            {/* Background Ambient Art */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* 1. Glass Nav Bar */}
            <header className="shrink-0 flex items-center justify-between bg-zinc-900/40 backdrop-blur-2xl border border-white/[0.05] p-2 rounded-2xl">
                <PanelTab active={activePanel === 'log'} onClick={() => setActivePanel('log')} icon={Play} label="Log" />
                <PanelTab active={activePanel === 'history'} onClick={() => setActivePanel('history')} icon={History} label="Records" />
                <PanelTab active={activePanel === 'stats'} onClick={() => setActivePanel('stats')} icon={LineChart} label="The Logic" />
            </header>

            {/* 2. Main Content Area */}
            <main className="flex-1 relative">

                {activePanel === 'log' && (
                    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {/* Prediction Top Card */}
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] p-6 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Prediction Outcome</span>
                            <div className="text-3xl font-light tracking-tight text-white/90">Today, <span className="font-bold">14:00</span></div>
                            <p className="text-xs text-zinc-500 max-w-[200px]">Confidence level derived from high regularity in your current cluster.</p>
                        </div>

                        {/* Main Action Large Button */}
                        <div className="flex-1 flex items-center justify-center">
                            <button className="relative w-48 h-48 rounded-[3rem] bg-indigo-500 text-white shadow-[0_0_80px_-20px_rgba(99,102,241,0.5)] active:scale-95 transition-all group overflow-hidden">
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <Plus className="w-10 h-10 mb-1" />
                                    <span className="text-sm font-black uppercase tracking-widest">Start Now</span>
                                </div>
                            </button>
                        </div>

                        {/* Sub Options (The Easy Offset) */}
                        <div className="flex gap-3 h-20">
                            <button className="flex-1 rounded-2xl bg-zinc-900/50 border border-white/[0.03] flex flex-col items-center justify-center gap-1 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white">
                                <span className="text-xs font-bold">-15m</span>
                            </button>
                            <button className="flex-1 rounded-2xl bg-zinc-900/50 border border-white/[0.03] flex flex-col items-center justify-center gap-1 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white">
                                <span className="text-xs font-bold">-1h</span>
                            </button>
                            <button className="flex-1 rounded-2xl bg-zinc-900/50 border border-white/[0.03] flex flex-col items-center justify-center gap-1 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white">
                                <span className="text-xs font-bold">Woke Up</span>
                            </button>
                        </div>
                    </div>
                )}

                {activePanel === 'history' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xl font-bold">Recent History</h2>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">30 Records total</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide pb-4">
                            {/* Integrated Quick Edit History Item */}
                            {[
                                { time: '10:32', day: 'Today', status: 'Ended', intensity: 3 },
                                { time: '14:58', day: 'Yesterday', status: 'Ended', intensity: 5 },
                                { time: '02:27', day: 'Yesterday', status: 'Ended', intensity: 8 },
                                { time: '20:13', day: '18 Jan', status: 'Ended', intensity: 2 },
                                { time: '16:41', day: '18 Jan', status: 'Ended', intensity: 4 },
                            ].map((item, i) => (
                                <div key={i} className="group p-5 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.05] transition-all flex justify-between items-center">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest">{item.day}</span>
                                        <span className="text-lg font-medium text-white/90">{item.time}</span>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase font-bold">Edit Start</span>
                                            <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase font-bold">Add Note</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-zinc-500 font-bold mb-1">INTENSITY</span>
                                            <div className="flex gap-1">
                                                {[2, 5, 8].includes(item.intensity) ? (
                                                    <span className={cn(
                                                        "w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-[10px] font-black leading-none",
                                                        item.intensity > 6 ? "bg-rose-600" : "bg-indigo-500"
                                                    )}>{item.intensity}</span>
                                                ) : (
                                                    <span className="text-lg font-bold text-zinc-700">{item.intensity}</span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activePanel === 'stats' && (
                    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-left-4">
                        <div className="p-6 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> The Engine Logic
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-zinc-500">RECURRENCE PATTERN</span>
                                    <p className="text-sm text-zinc-300 font-medium">Your attacks cluster with high regularity (92% coefficient).</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-zinc-500">PEAK ACTIVITY</span>
                                    <p className="text-sm text-zinc-300 font-medium">Most likely onset between 13:00 and 15:00 based on last 5 clusters.</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-zinc-500">AVERAGE WINDOW</span>
                                    <p className="text-sm text-zinc-300 font-medium">Recovery typically starts after 42 minutes with current triggers.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center opacity-40">
                            <LineChart className="w-24 h-24 text-indigo-500/20 stroke-[1]" />
                        </div>
                    </div>
                )}

            </main>

            {/* Global Bottom Tab Placeholder */}
            <footer className="shrink-0 flex items-center justify-center py-4 border-t border-white/[0.05]">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800">Crystal Grid UI // V4.2</span>
            </footer>

        </div>
    );
}

function PanelTab({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300",
                active ? "bg-white/[0.07] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
        >
            <Icon className={cn("w-4 h-4", active ? "text-indigo-400" : "text-zinc-500")} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </button>
    )
}
