"use client";

import React from "react";
import { Plus, Activity, Calendar, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MinimalistDashboard() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans selection:bg-indigo-500/30">
            <div className="max-w-md mx-auto space-y-8 pt-12">
                {/* Header Section */}
                <header className="space-y-2 text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 ring-8 ring-indigo-500/5">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">EPH Tracker</h1>
                    <p className="text-zinc-400">Everything's under control.</p>
                </header>

                {/* Hero Metric */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative bg-zinc-900/80 border-zinc-800 backdrop-blur-xl rounded-3xl overflow-hidden">
                        <CardContent className="pt-10 pb-8 text-center space-y-2">
                            <span className="text-sm font-medium uppercase tracking-widest text-indigo-400">Streak</span>
                            <div className="text-7xl font-black tabular-nums tracking-tighter text-white">12</div>
                            <p className="text-zinc-400 font-medium">Days since last attack</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4">
                    <Button
                        size="lg"
                        className="h-20 text-xl font-bold rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all active:scale-[0.98]"
                    >
                        <Plus className="mr-3 w-6 h-6 stroke-[3]" />
                        New Entry
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-16 rounded-2xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
                            <Activity className="mr-2 w-5 h-5 text-emerald-400" />
                            Patterns
                        </Button>
                        <Button variant="outline" className="h-16 rounded-2xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
                            <Calendar className="mr-2 w-5 h-5 text-amber-400" />
                            History
                        </Button>
                    </div>
                </div>

                {/* Recent Summary */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Recent Intensity</h3>
                        <span className="text-xs text-indigo-400 font-medium">View All</span>
                    </div>
                    <div className="flex justify-between items-end h-16 px-2">
                        {[4, 2, 0, 0, 8, 3, 0].map((val, i) => (
                            <div key={i} className="group relative flex flex-col items-center gap-2">
                                <div
                                    className={cn(
                                        "w-2.5 rounded-full transition-all duration-300",
                                        val === 0 ? "bg-zinc-800 h-2" : "bg-indigo-500/80 h-full",
                                        val > 5 && "shadow-[0_0_12px_rgba(99,102,241,0.5)] bg-indigo-400"
                                    )}
                                    style={{ height: val === 0 ? '8px' : `${(val / 10) * 100}%` }}
                                />
                                <span className="text-[10px] font-medium text-zinc-600 group-hover:text-zinc-400 uppercase tracking-tighter">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
