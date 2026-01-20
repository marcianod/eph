"use client";

import React, { useState } from "react";
import { ChevronRight, Pill, Activity, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FocusedFlow() {
    const [step, setStep] = useState<'idle' | 'logging' | 'success'>('idle');

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-indigo-500/30 p-8 flex flex-col justify-center">
            <div className="max-w-xs mx-auto w-full space-y-12">

                {/* State: Idle */}
                {step === 'idle' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <header>
                            <h1 className="text-4xl font-light tracking-tight text-white/50 leading-tight">
                                Everything <br />
                                <span className="text-white font-medium italic">calm</span> right now.
                            </h1>
                        </header>

                        <div className="space-y-4">
                            <button
                                onClick={() => setStep('logging')}
                                className="group w-full h-24 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between hover:bg-zinc-900 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-rose-500 fill-rose-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-bold">Start Attack</p>
                                        <p className="text-xs text-zinc-500 font-medium">Log onset immediately</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                            </button>

                            <button className="group w-full h-24 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between hover:bg-zinc-900 transition-all active:scale-[0.98]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                        <Pill className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-bold">Log Medication</p>
                                        <p className="text-xs text-zinc-500 font-medium">Preventative or abortive</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                            </button>
                        </div>

                        <footer className="pt-8 border-t border-zinc-900">
                            <div className="flex items-center gap-3 text-zinc-600">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest leading-none">Status: 12 days stable</span>
                            </div>
                        </footer>
                    </div>
                )}

                {/* State: Logging (Mocking the slider/input) */}
                {step === 'logging' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <header>
                            <h2 className="text-3xl font-bold tracking-tight">How intense?</h2>
                            <p className="text-zinc-500 mt-2 font-medium">Slide to record severity</p>
                        </header>

                        <div className="space-y-12">
                            <div className="relative h-2 w-full bg-zinc-900 rounded-full">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
                                    <span className="text-black font-black text-sm">7</span>
                                </div>
                                <div className="h-full w-1/2 bg-rose-500 rounded-full glow-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]" />
                            </div>

                            <div className="flex justify-between text-[10px] font-black tracking-widest text-zinc-700 uppercase">
                                <span>Mild</span>
                                <span>Moderate</span>
                                <span>Severe</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('idle')}
                                className="flex-1 h-14 rounded-2xl border border-zinc-800 text-zinc-500 font-bold uppercase tracking-widest text-[10px]"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep('success')}
                                className="flex-[2] h-14 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-[10px]"
                            >
                                Save Record
                            </button>
                        </div>
                    </div>
                )}

                {/* State: Success */}
                {step === 'success' && (
                    <div className="flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold">Logged</h2>
                            <p className="text-zinc-500 text-sm">Attack record updated.</p>
                        </div>
                        <button
                            onClick={() => setStep('idle')}
                            className="text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-300"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
