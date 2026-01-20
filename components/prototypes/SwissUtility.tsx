"use client";

import React, { useState } from "react";
import { Play, Square, Pill, Clock, Activity, Target, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SwissUtility() {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30 p-2 sm:p-4">
            <div className="max-w-md mx-auto grid grid-cols-2 gap-2 pt-6">

                {/* Module: Prediction (Full Width) */}
                <div className="col-span-2 bg-[#141414] border border-[#222] p-6 flex justify-between items-center rounded-sm">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444] mb-2 leading-none">Prediction Engine</p>
                        <h3 className="text-xl font-black text-indigo-400">NEXT: ~14:30</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black tabular-nums leading-none">88%</p>
                        <p className="text-[10px] font-bold text-[#444] uppercase tracking-tighter">Certainty</p>
                    </div>
                </div>

                {/* Module: Main Control (Full Width) */}
                <div className="col-span-2 bg-[#141414] border border-[#222] p-1 rounded-sm">
                    <div className="p-8 space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Activity className={cn("w-5 h-5", isActive ? "text-rose-500" : "text-emerald-500")} />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">{isActive ? "Attack Active" : "Status: Dormant"}</span>
                            </div>
                            {isActive && <span className="text-sm font-mono font-bold text-rose-500 tracking-tighter">00:42:10</span>}
                        </div>

                        <div className="space-y-2">
                            <Button
                                onClick={() => setIsActive(!isActive)}
                                className={cn(
                                    "w-full h-20 text-xl font-black rounded-sm border-2 transition-all active:scale-[0.99]",
                                    isActive
                                        ? "bg-rose-600 border-rose-500 hover:bg-rose-700"
                                        : "bg-white text-black border-white hover:bg-zinc-200"
                                )}
                            >
                                {isActive ? "STOP RECORDING" : "START LOG"}
                            </Button>

                            {/* Integrated Offsets */}
                            <div className="flex gap-1 h-12">
                                <button className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-[10px] font-black uppercase tracking-widest text-[#666] transition-colors border border-[#222] rounded-sm">
                                    -15 MIN
                                </button>
                                <button className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-[10px] font-black uppercase tracking-widest text-[#666] transition-colors border border-[#222] rounded-sm">
                                    -30 MIN
                                </button>
                                <button className="w-12 bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center border border-[#222] rounded-sm">
                                    <Clock className="w-4 h-4 text-[#444]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module: Medication (Half Width) */}
                <div className="bg-[#141414] border border-[#222] p-6 flex flex-col justify-between aspect-square rounded-sm group hover:border-[#333] cursor-pointer transition-colors">
                    <div className="w-10 h-10 border-2 border-emerald-500/20 flex items-center justify-center">
                        <Pill className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black leading-tight">LOG<br />MEDS</h4>
                        <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mt-1">Abortive</p>
                    </div>
                </div>

                {/* Module: History (Half Width) */}
                <div className="bg-[#141414] border border-[#222] p-6 flex flex-col justify-between aspect-square rounded-sm group hover:border-[#333] cursor-pointer transition-colors">
                    <div className="w-10 h-10 border-2 border-amber-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black leading-tight">PATCH<br />LOGS</h4>
                        <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mt-1">Retroactive</p>
                    </div>
                </div>

                {/* Module: Recent Activity (Full Width) */}
                <div className="col-span-2 bg-[#050505] p-4 text-center border-t border-[#111] mt-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#333]">EPH Tracker // System v3.0</p>
                </div>

            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
        </div>
    );
}
