"use client";

import React from "react";
import { Search, Filter, Pill, Zap, Clock, ChevronDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MedicalLogView() {
    const data = [
        { date: '2026-01-20', time: '10:30', duration: '2h', intensity: 7, medication: 'Sumatriptan 50mg', triggers: ['Coffee', 'Lack of sleep'], status: 'Active' },
        { date: '2026-01-18', time: '14:15', duration: '4h', intensity: 4, medication: 'Ibuprofen', triggers: ['Stress'], status: 'Resolved' },
        { date: '2026-01-15', time: '21:00', duration: '8h', intensity: 9, medication: 'Sumatriptan 100mg', triggers: ['Weather change'], status: 'Resolved' },
        { date: '2026-01-14', time: '05:45', duration: '1h', intensity: 3, medication: 'None', triggers: ['N/A'], status: 'Resolved' },
    ];

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-indigo-100 dark:bg-zinc-950 dark:text-zinc-100 shrink-0">
            {/* Top Controls */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4">
                <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input className="pl-10 bg-zinc-100 dark:bg-zinc-900 border-none h-10 w-full rounded-lg" placeholder="Search logs, triggers, meds..." />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <Button variant="outline" size="sm" className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800 shrink-0">
                            <Filter className="mr-2 w-4 h-4" />
                            Filter
                        </Button>
                        <Button size="sm" className="rounded-lg h-9 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                            <Clock className="mr-2 w-4 h-4" />
                            Quick Log
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto p-4 md:p-6">
                {/* Table/List View */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Timestamp</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 text-center">Intensity</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Medication</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Triggers</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Duration</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Status</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i} className="group border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-4 truncate">
                                            <div className="font-semibold text-sm">{row.date}</div>
                                            <div className="text-xs text-zinc-500">{row.time}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-center">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-zinc-900",
                                                    row.intensity >= 8 ? "bg-rose-100 text-rose-700" :
                                                        row.intensity >= 5 ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-700"
                                                )}>
                                                    {row.intensity}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Pill className="w-3 h-3 text-indigo-500" />
                                                <span className="text-sm">{row.medication}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 max-w-[200px]">
                                            <div className="flex flex-wrap gap-1">
                                                {row.triggers.map((t, ti) => (
                                                    <span key={ti} className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                                <Clock className="w-3 h-3" />
                                                {row.duration}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
                                                row.status === 'Active' ? "bg-emerald-100 text-emerald-700 animate-pulse" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                            )}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
