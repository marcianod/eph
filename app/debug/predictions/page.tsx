"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Activity, Target, BarChart3, HelpCircle, AlertCircle, ArrowRight, ZapOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { PredictionResult, RawAttackInfo } from "@/lib/types";

export default function PredictionAuditPage() {
    const [data, setData] = useState<PredictionResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const res = await fetch('/api/predictions');
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch predictions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPredictions();
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white font-sans">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Activity className="h-10 w-10 text-indigo-500 animate-pulse" />
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse"></div>
                    </div>
                    <div className="animate-pulse font-mono text-[10px] tracking-[0.4em] text-zinc-500 uppercase">Reconstructing Pipeline...</div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
                    <AlertCircle className="h-12 w-12 text-red-500/80 mx-auto mb-4" />
                    <div className="text-lg font-bold">Pipeline Severed</div>
                    <p className="text-zinc-500 text-sm mt-3 font-mono">Check connection to prediction engine.</p>
                </div>
            </div>
        );
    }

    const { metadata, predictions } = data;
    const events = metadata.attacks;
    const REMISSION_THRESHOLD = 336; // 14 days

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#0a0a0a] p-4 text-white max-w-2xl mx-auto w-full pb-24 font-sans selection:bg-indigo-500/30">
            <header className="w-full flex items-center justify-between mb-16 py-6 border-b border-zinc-900">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all rounded-full px-4 text-xs group">
                        <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" /> Dashboard
                    </Button>
                </Link>
                <div className="text-center">
                    <h1 className="text-xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent uppercase">Derivation Audit</h1>
                    <p className="text-[9px] text-zinc-600 font-mono tracking-[0.2em] uppercase mt-1">Logic Stream v4.0 (Active Inputs)</p>
                </div>
                <div className="w-20"></div>
            </header>

            {/* Vertical Input Stream */}
            <div className="w-full mb-20 space-y-16">
                <section>
                    <div className="flex items-center gap-4 px-4 mb-12">
                        <div className="h-px flex-1 bg-zinc-900"></div>
                        <h2 className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">Historical chronological feed</h2>
                        <div className="h-px flex-1 bg-zinc-900"></div>
                    </div>

                    <div className="space-y-0 relative px-4">
                        {/* Timeline Core Ribon */}
                        <div className="absolute left-[31px] top-6 bottom-6 w-px bg-zinc-800 border-l border-dashed border-zinc-800/80"></div>

                        {events.map((attack: any, i: number) => {
                            const iat = attack.iatHours;
                            const isRemission = iat !== null && iat > REMISSION_THRESHOLD;
                            const isActive = iat !== null && iat <= REMISSION_THRESHOLD;

                            return (
                                <div key={`event-${i}`} className="relative pl-14 pb-14 last:pb-0 group">
                                    {/* Attack Node */}
                                    <div className={cn(
                                        "absolute left-[24px] top-2 w-4 h-4 rounded-full border-4 border-[#0a0a0a] z-10 transition-all duration-500 group-hover:scale-125",
                                        attack.isClusterStart ? "bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.5)]" : "bg-zinc-700"
                                    )}></div>

                                    {/* Event Details */}
                                    <div className="flex items-center gap-5 px-4 py-3 -ml-4 rounded-2xl group-hover:bg-zinc-900/40 transition-all duration-300 border border-transparent group-hover:border-zinc-800/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-zinc-600 leading-none mb-1.5 uppercase tracking-wider">{format(new Date(attack.timestamp), "MMM dd, yyyy")}</span>
                                            <span className="text-2xl font-black text-white tracking-tighter leading-none">{format(new Date(attack.timestamp), "HH:mm")}</span>
                                        </div>
                                        {attack.isClusterStart && (
                                            <div className="ml-auto">
                                                <span className="text-[8px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black uppercase tracking-widest">New Cycle Start</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Logic Bridge for Active Intervals */}
                                    {isActive && (
                                        <div className="mt-5 flex items-center gap-6">
                                            <div className="bg-zinc-900/60 px-3 py-2 rounded-xl border border-zinc-800 text-[11px] font-mono text-emerald-400 flex items-center gap-3 shadow-sm border-l-2 border-l-emerald-500/50">
                                                <ArrowRight className="h-3 w-3 opacity-40" />
                                                <span className="font-bold">{iat?.toFixed(1)}h </span>
                                                <span className="text-zinc-600 font-sans uppercase text-[9px] tracking-widest">Interval</span>
                                            </div>
                                            <div className="flex-1 h-[1px] bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
                                            <div className="text-[9px] text-zinc-700 uppercase font-black tracking-tighter italic whitespace-nowrap opacity-80">
                                                Feeding statistical mean (μ)
                                            </div>
                                        </div>
                                    )}

                                    {/* Remission Break UI */}
                                    {isRemission && (
                                        <div className="mt-8 mb-8 flex items-center gap-4">
                                            <div className="flex-1 h-px bg-zinc-900"></div>
                                            <div className="bg-zinc-950 text-zinc-500 px-6 py-2.5 rounded-2xl border border-zinc-900 text-[10px] font-mono flex items-center gap-4 shadow-inner group-hover:border-orange-500/20 transition-colors">
                                                <ZapOff className="h-4 w-4 text-orange-500/30" />
                                                <span className="uppercase tracking-[0.2em] text-zinc-700 font-bold">Historical Gap:</span>
                                                <span className="text-zinc-400 font-black text-sm">{iat > 720 ? `${(iat / 720).toFixed(1)} months` : `${(iat / 24).toFixed(0)} days`}</span>
                                            </div>
                                            <div className="flex-1 h-px bg-zinc-900"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* Step 2: Mathematical Derivation */}
            <div className="w-full space-y-6 mb-16">
                <div className="flex items-center gap-4 px-4 mb-4">
                    <div className="h-px flex-1 bg-zinc-900"></div>
                    <h2 className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black italic">Statistical Engine</h2>
                    <div className="h-px flex-1 bg-zinc-900"></div>
                </div>

                <Card className="bg-zinc-900/30 border-zinc-800/80 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <CardHeader className="p-6 border-b border-zinc-800/50">
                        <CardTitle className="text-sm font-black flex items-center gap-3 text-zinc-200">
                            <HelpCircle className="h-4 w-4 text-emerald-500" /> CONFIDENCE CALCULATION
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Regularity Calculation */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Step 1: Metric extraction</span>
                                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Coefficient of Variation</span>
                            </div>
                            <div className="bg-black/40 p-6 rounded-2xl font-mono text-sm border border-zinc-800/80 space-y-4 shadow-inner">
                                <div className="text-[9px] text-zinc-600 mb-2 italic flex items-center gap-2">
                                    <Info className="h-3 w-3" /> Remissions (&gt; 14d) excluded from this operational logic.
                                </div>
                                <div className="flex justify-between items-baseline border-b border-zinc-800/50 pb-3">
                                    <span className="text-zinc-500 text-xs">Mean Active Interval (μ)</span>
                                    <span className="text-white font-black text-lg">{metadata.meanIat.toFixed(2)}h</span>
                                </div>
                                <div className="flex justify-between items-baseline border-b border-zinc-800/50 pb-3">
                                    <span className="text-zinc-500 text-xs">Standard Deviation (σ)</span>
                                    <span className="text-white font-black text-lg">{metadata.stdDevIat.toFixed(2)}h</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-indigo-400 font-black text-xs uppercase tracking-widest italic">Regularity score (σ/μ)</span>
                                    <span className="text-indigo-400 font-black text-xl">{metadata.cv.toFixed(4)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Resulting Confidence */}
                        <div className="space-y-4">
                            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Step 2: Probability Mapping</div>
                            <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10 relative overflow-hidden group">
                                <div className="absolute right-[-20px] top-[-20px] h-32 w-32 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all"></div>
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex flex-col">
                                        <div className="text-zinc-600 text-[9px] font-black uppercase mb-1">Inverse CV Probability</div>
                                        <div className="text-3xl font-black text-white tracking-tighter">
                                            {Math.round(100 * (1 - Math.min(metadata.cv, 0.9)))}%
                                        </div>
                                    </div>
                                    <div className="h-10 w-px bg-zinc-800"></div>
                                    <div className="flex flex-col text-right">
                                        <div className="text-zinc-600 text-[9px] font-black uppercase mb-1">State</div>
                                        <div className="text-indigo-400 font-black uppercase tracking-widest text-xs italic">
                                            {metadata.regularityLabel} Pattern
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pattern Heatmap */}
            <div className="grid grid-cols-2 gap-6 w-full mb-16">
                <Card className="bg-zinc-900/30 border-zinc-800/80 rounded-3xl overflow-hidden">
                    <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-[10px] text-zinc-500 font-black uppercase flex items-center gap-2 tracking-[0.2em]">
                            <BarChart3 className="h-3 w-3" /> DIURNAL HEAT
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="flex items-end gap-[1px] h-12 w-full mb-4">
                            {Array.from({ length: 24 }).map((_, hour) => {
                                const count = metadata.hourCounts[hour] || 0;
                                const maxCount = Math.max(...Object.values(metadata.hourCounts), 1);
                                const height = (count / maxCount) * 100;
                                return (
                                    <div key={hour} className="flex-1 group/bar relative">
                                        <div
                                            className={cn(
                                                "w-full rounded-t-[1px] transition-all",
                                                hour === metadata.topHour ? "bg-indigo-500 opacity-100" : "bg-zinc-800 opacity-60 group-hover/bar:bg-zinc-600"
                                            )}
                                            style={{ height: `${Math.max(4, height)}%` }}
                                        ></div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-[9px] text-zinc-600 font-black uppercase italic">Peak Activity</span>
                            <span className="text-sm font-black text-white">{metadata.topHour}:00</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/30 border-zinc-800/80 rounded-3xl overflow-hidden">
                    <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-[10px] text-zinc-500 font-black uppercase flex items-center gap-2 tracking-[0.2em]">
                            <Target className="h-3 w-3" /> ACTIVE MODELS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="text-4xl font-black text-white tracking-tighter mb-2">{predictions.length}</div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-[9px] text-zinc-600 font-black uppercase italic">Forecast engines</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-black uppercase">Online</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Decision Log */}
            <div className="w-full space-y-6">
                <div className="flex items-center gap-4 px-4 mb-4">
                    <div className="h-px flex-1 bg-zinc-900"></div>
                    <h2 className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">Forecast conclusions</h2>
                    <div className="h-px flex-1 bg-zinc-900"></div>
                </div>

                {predictions.map((p, i) => (
                    <div key={i} className="group relative p-6 bg-zinc-900/20 rounded-[2rem] border border-zinc-900 hover:border-indigo-500/30 transition-all duration-500 hover:bg-zinc-900/40">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-none mb-2">{format(new Date(p.time), "EEEE, MMM d")}</h3>
                                <div className="text-3xl font-black text-white tracking-tighter leading-none">{format(new Date(p.time), "HH:mm")}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-indigo-400 tracking-tighter">{p.confidence}%</div>
                                <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1">Confidence Score</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[9px] px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-500 font-black tracking-widest uppercase border border-zinc-800">
                                {p.type.replace('_', ' ')}
                            </span>
                            <div className="h-px flex-1 bg-zinc-800/50"></div>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">"{p.detail}"</p>
                    </div>
                ))}
            </div>

            <footer className="w-full py-20 text-center border-t border-zinc-900 mt-20">
                <p className="text-[9px] text-zinc-700 font-mono tracking-widest uppercase mb-2">Statistical Integrity Unit</p>
                <p className="text-[10px] text-zinc-600 font-medium italic max-w-xs mx-auto">
                    Confidence is derived from the statistical regularity of your historical active-phase intervals.
                </p>
            </footer>
        </main>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
