"use client";

import React from "react";
import { ListFilter, CalendarDays, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function TimelineView() {
    const days = Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86400000),
        attacks: i === 5 ? [{ time: '09:00', intensity: 4 }, { time: '14:30', intensity: 7 }] :
            i === 10 ? [{ time: '21:00', intensity: 9 }] :
                i === 13 ? [{ time: '11:15', intensity: 3 }] : []
    }));

    const getIntensityColor = (score: number) => {
        if (score >= 8) return "bg-rose-500 shadow-rose-500/50";
        if (score >= 5) return "bg-orange-500 shadow-orange-500/50";
        return "bg-amber-500 shadow-amber-500/50";
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans p-6 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Timeline View</h2>
                    <p className="text-zinc-500 text-sm">Visualizing your last 14 days</p>
                </div>
                <Button variant="outline" size="icon" className="rounded-full border-zinc-800">
                    <ListFilter className="w-4 h-4" />
                </Button>
            </header>

            {/* Stats row */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                    { label: 'Avg Intensity', value: '4.2', icon: TrendingUp, color: 'text-indigo-400' },
                    { label: 'Frequency', value: '0.8d', icon: CalendarDays, color: 'text-emerald-400' }
                ].map((stat, i) => (
                    <div key={i} className="flex-shrink-0 bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl min-w-[140px] flex flex-col gap-1">
                        <stat.icon className={cn("w-4 h-4 mb-1", stat.color)} />
                        <span className="text-xs text-zinc-500 uppercase font-semibold">{stat.label}</span>
                        <span className="text-xl font-bold">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Main Timeline */}
            <div className="flex-1 relative mt-4">
                {/* Horizontal Scroll Area */}
                <div className="flex gap-4 overflow-x-auto pb-12 pt-8 snap-x px-4 -mx-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {days.map((day, idx) => (
                        <div key={idx} className="flex-shrink-0 w-24 snap-center flex flex-col items-center">
                            {/* Attack Lane */}
                            <div className="relative h-64 w-px bg-zinc-800/50 mb-4 flex flex-col justify-start gap-4">
                                {day.attacks.map((attack, aIdx) => (
                                    <div
                                        key={aIdx}
                                        className={cn(
                                            "absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#09090b] shadow-lg cursor-pointer transform hover:scale-150 transition-transform",
                                            getIntensityColor(attack.intensity)
                                        )}
                                        style={{ top: `${(parseInt(attack.time.split(':')[0]) / 24) * 100}%` }}
                                    >
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 hover:opacity-100 bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                                            {attack.time} - {attack.intensity}/10
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Day Label */}
                            <div className={cn(
                                "flex flex-col items-center rounded-xl p-2 w-full transition-colors",
                                day.date.toDateString() === new Date().toDateString() ? "bg-indigo-500/10 text-indigo-100 border border-indigo-500/30" : "text-zinc-500"
                            )}>
                                <span className="text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-lg font-black leading-none tabular-nums">
                                    {day.date.getDate()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time Indicators (Static Left) */}
                <div className="absolute left-0 top-8 bottom-12 flex flex-col justify-between text-[10px] font-bold text-zinc-700 pointer-events-none uppercase tracking-tighter decoration-zinc-800 underline underline-offset-4 decoration-dotted">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>23:59</span>
                </div>
            </div>

            {/* Bottom hint */}
            <div className="mt-auto py-4 px-4 bg-zinc-900/30 rounded-2xl border border-zinc-800 flex gap-3 items-start">
                <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                    Tap a point to see details. Swipe horizontally to travel through your history.
                </p>
            </div>

        </div>
    );
}
