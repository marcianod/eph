"use client";

import React, { useState } from "react";
import {
    Layout,
    History,
    Table,
    Monitor,
    Smartphone,
    Circle,
    LayoutGrid,
    Layers,
    Target,
    Zap,
    MousePointer2,
    Grid3X3
} from "lucide-react";
import { cn } from "@/lib/utils";
import PrecisionObsidian from "@/components/prototypes/PrecisionObsidian";
import TimelineBlade from "@/components/prototypes/TimelineBlade";
import SwissUtility from "@/components/prototypes/SwissUtility";
import OrbLayout from "@/components/prototypes/OrbLayout";
import GlassGrid from "@/components/prototypes/GlassGrid";
import FocusedFlow from "@/components/prototypes/FocusedFlow";
import MinimalistDashboard from "@/components/prototypes/MinimalistDashboard";
import TimelineView from "@/components/prototypes/TimelineView";
import MedicalLogView from "@/components/prototypes/MedicalLogView";
import ShadowCore from "@/components/prototypes/ShadowCore";
import CrystalGrid from "@/components/prototypes/CrystalGrid";
import Zenith from "@/components/prototypes/Zenith";

type Prototype = 'precision' | 'blade' | 'swiss' | 'orb' | 'grid' | 'flow' | 'minimalist' | 'timeline' | 'medical' | 'core' | 'crystal' | 'zenith';

export default function PrototypeGallery() {
    const [activeTab, setActiveTab] = useState<Prototype>('core');
    const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile');

    const sections = [
        {
            title: "V4: Proposals (Refined)",
            items: [
                { id: 'core' as const, name: 'Shadow Core', icon: Zap },
                { id: 'crystal' as const, name: 'Crystal Grid', icon: Layers },
                { id: 'zenith' as const, name: 'Zenith', icon: Target },
            ]
        },
        {
            title: "V3: Precision & Utility",
            items: [
                { id: 'precision' as const, name: 'Precision', icon: Target },
                { id: 'blade' as const, name: 'Blade', icon: MousePointer2 },
                { id: 'swiss' as const, name: 'Swiss', icon: Grid3X3 },
            ]
        },
        {
            title: "Supporting Views",
            items: [
                { id: 'minimalist' as const, name: 'Mini Dashboard', icon: Layout },
                { id: 'timeline' as const, name: 'Timeline', icon: History },
                { id: 'medical' as const, name: 'Medical Log', icon: Table },
            ]
        },
        {
            title: "V2 Concepts",
            items: [
                { id: 'orb' as const, name: 'The Orb', icon: Circle },
                { id: 'grid' as const, name: 'Glass Grid', icon: LayoutGrid },
                { id: 'flow' as const, name: 'Focused Flow', icon: Layers },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col pt-[160px] sm:pt-[100px]">
            {/* Control Bar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-900 p-4">
                <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap justify-center gap-1">
                        {sections.map((section) => (
                            <div key={section.title} className="flex flex-col gap-1 mx-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 ml-1">{section.title}</span>
                                <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
                                    {section.items.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setActiveTab(p.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                                activeTab === p.id
                                                    ? "bg-white text-black shadow-lg shadow-white/10"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            <p.icon className="w-3.5 h-3.5" />
                                            <span>{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-zinc-800/50 shrink-0">
                        <button
                            onClick={() => setViewport('mobile')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-bold",
                                viewport === 'mobile' ? "bg-zinc-800 text-white" : "text-zinc-500"
                            )}
                        >
                            <Smartphone className="w-4 h-4" />
                            <span>MOBILE</span>
                        </button>
                        <button
                            onClick={() => setViewport('desktop')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-bold",
                                viewport === 'desktop' ? "bg-zinc-800 text-white" : "text-zinc-500"
                            )}
                        >
                            <Monitor className="w-4 h-4" />
                            <span>DESKTOP</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Preview Area */}
            <main className="flex-1 flex items-start justify-center p-4 sm:p-20">
                <div
                    className={cn(
                        "transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative",
                        viewport === 'mobile' ? "w-[375px] h-[812px] rounded-[3.5rem] ring-[12px] ring-zinc-900 overflow-hidden" : "w-full max-w-5xl h-fit rounded-3xl overflow-hidden border border-zinc-900"
                    )}
                >
                    {activeTab === 'core' && <ShadowCore />}
                    {activeTab === 'crystal' && <CrystalGrid />}
                    {activeTab === 'zenith' && <Zenith />}
                    {activeTab === 'precision' && <PrecisionObsidian />}
                    {activeTab === 'blade' && <TimelineBlade />}
                    {activeTab === 'swiss' && <SwissUtility />}
                    {activeTab === 'orb' && <OrbLayout />}
                    {activeTab === 'grid' && <GlassGrid />}
                    {activeTab === 'flow' && <FocusedFlow />}
                    {activeTab === 'minimalist' && <MinimalistDashboard />}
                    {activeTab === 'timeline' && <TimelineView />}
                    {activeTab === 'medical' && <MedicalLogView />}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 text-center bg-black border-t border-zinc-900">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-800">EPH DESIGN SYSTEM // EVOLUTION CYCLE 03</p>
            </footer>
        </div>
    );
}
