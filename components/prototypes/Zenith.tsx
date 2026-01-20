"use client";

import React, { useState } from "react";
import {
    ArrowUpRight,
    Clock,
    History,
    Pill,
    MoreVertical,
    ChevronDown,
    X,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Zenith() {
    const [showLogic, setShowLogic] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div className="h-full w-full bg-[#080808] text-zinc-100 flex flex-col font-sans px-8 py-12 relative select-none">

            {/* 1. The Core Action (Attack Zone) */}
            <div className="flex-1 flex flex-col justify-center gap-16 relative">

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-600">Stable Analysis</span>
                        <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter leading-none text-white">READY</h1>
                </div>

                <div className="flex flex-col gap-8">
                    <button className="group relative w-fit">
                        <span className="text-4xl font-light tracking-tight hover:text-indigo-400 transition-colors flex items-center gap-4">
                            Log Attack <ArrowUpRight className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </span>
                        <div className="h-px bg-zinc-800 w-full mt-2 group-hover:bg-indigo-500/50 transition-colors" />
                    </button>

                    <div className="flex gap-10">
                        <button className="text-xs font-bold text-zinc-600 hover:text-zinc-200 transition-colors uppercase tracking-[0.2em]">-15m</button>
                        <button className="text-xs font-bold text-zinc-600 hover:text-zinc-200 transition-colors uppercase tracking-[0.2em]">-1h</button>
                        <button className="text-xs font-bold text-zinc-600 hover:text-zinc-200 transition-colors uppercase tracking-[0.2em]">Woke up</button>
                    </div>
                </div>
            </div>

            {/* 2. Secondary Info (Prediction & Logic) */}
            <div className="space-y-4">
                <div className="flex flex-col gap-1 cursor-pointer group" onClick={() => setShowLogic(!showLogic)}>
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-hover:text-zinc-500 transition-colors">Prediction</span>
                        <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                            <span className="text-xs font-medium text-zinc-400">14:00 Today</span>
                            <ChevronDown className={cn("w-4 h-4 text-zinc-600 transition-transform", showLogic && "rotate-180")} />
                        </div>
                    </div>
                    <div className="h-[2px] bg-zinc-900 group-hover:bg-zinc-800 transition-colors rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/30 w-[85%]" />
                    </div>
                </div>

                {showLogic && (
                    <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-900 animate-in slide-in-from-bottom-2 duration-300">
                        <p className="text-sm text-zinc-400 leading-relaxed italic mb-4">
                            "Based on your recent 14-day cluster, you have an 85% probability of onset in 2 hours."
                        </p>
                        <div className="space-y-3">
                            <LogicPoint label="Interval" value="4.2h (Steady)" />
                            <LogicPoint label="Regularity" value="High (CV: 0.12)" />
                            <LogicPoint label="Trigger" value="Diurnal Pattern" />
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Utility Footer */}
            <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center text-zinc-500">
                <div className="flex gap-8">
                    <button onClick={() => setShowHistory(true)} className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">History</button>
                    <button className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Meds</button>
                </div>
                <span className="text-[9px] font-mono opacity-20 uppercase tracking-[0.3em]">Zenith v1</span>
            </div>

            {/* History Slide-over (Minimalist style) */}
            {showHistory && (
                <div className="absolute inset-0 bg-[#080808] z-50 p-8 flex flex-col animate-in slide-in-from-right-10 duration-500">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-4xl font-black tracking-tighter">HISTORY</h2>
                        <button onClick={() => setShowHistory(false)} className="p-4 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
                        <HistoryItemZenith date="JAN 20" time="10:32" intensity={3} />
                        <HistoryItemZenith date="JAN 19" time="14:58" intensity={5} />
                        <HistoryItemZenith date="JAN 19" time="02:27" intensity={7} />
                        <HistoryItemZenith date="JAN 18" time="20:13" intensity={2} />
                    </div>
                </div>
            )}
        </div>
    );
}

function LogicPoint({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{label}</span>
            <span className="text-xs font-medium text-zinc-300">{value}</span>
        </div>
    )
}

function HistoryItemZenith({ date, time, intensity }: { date: string, time: string, intensity: number }) {
    return (
        <div className="group flex justify-between items-end border-b border-zinc-900 pb-4 hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-700 group-hover:text-indigo-500 transition-colors">{date}</span>
                <div className="text-2xl font-light text-zinc-300 group-hover:text-white transition-colors">{time}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-bold">{intensity}</span>
                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Intensity</span>
                </div>
                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[9px] font-bold text-zinc-600 hover:text-indigo-400">EDIT</button>
                    <button className="text-[9px] font-bold text-zinc-600 hover:text-indigo-400">NOTE</button>
                </div>
            </div>
        </div>
    )
}
