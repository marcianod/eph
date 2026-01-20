"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    Zap,
    History,
    Info,
    X,
    Check,
    ChevronLeft,
    Edit2,
    NotebookPen,
    Pill,
    Timer,
    CheckCircle2,
    Share2,
    Trash2,
    Save,
    Calendar,
    Clock,
    Activity,
    StickyNote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- Types ---
type Attack = {
    _id?: string;
    start: string | Date;
    end?: string | Date;
    intensity?: number | '–';
    isActive: boolean;
    notes?: string;
};

type MedicationLog = {
    _id?: string;
    name: string;
    dosage: number;
    timestamp: string | Date;
};

// --- High Fidelity Intersection-Based Drum Picker ---

function DrumPicker({ value, options, onChange, label }: { value: number, options: number[], onChange: (v: number) => void, label: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [localValue, setLocalValue] = useState(value);
    const isScrolling = useRef(false);
    const isProgrammaticScroll = useRef(false);
    const itemHeight = 64;

    useEffect(() => {
        if (!isScrolling.current && scrollRef.current) {
            const index = options.indexOf(value);
            if (index !== -1) {
                setLocalValue(value);
                isProgrammaticScroll.current = true;
                scrollRef.current.scrollTo({
                    top: index * itemHeight,
                    behavior: 'auto'
                });
                setTimeout(() => {
                    isProgrammaticScroll.current = false;
                }, 100);
            }
        }
    }, [value, options]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && isScrolling.current && !isProgrammaticScroll.current) {
                        const val = Number(entry.target.getAttribute('data-value'));
                        if (val !== localValue) {
                            setLocalValue(val);
                            onChange(val);
                        }
                    }
                });
            },
            {
                root: scrollRef.current,
                threshold: 0.6,
                rootMargin: "-80px 0px -80px 0px"
            }
        );

        itemRefs.current.forEach((ref) => ref && observer.observe(ref));
        return () => observer.disconnect();
    }, [options, localValue, onChange]);

    // Custom Wheel Handler
    const virtualScrollTop = useRef<number | null>(null);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (virtualScrollTop.current === null) {
                virtualScrollTop.current = Math.round(el.scrollTop / itemHeight) * itemHeight;
            }
            const direction = Math.sign(e.deltaY);
            virtualScrollTop.current += direction * itemHeight;
            const maxScroll = (options.length - 1) * itemHeight;
            virtualScrollTop.current = Math.max(0, Math.min(virtualScrollTop.current, maxScroll));

            el.scrollTo({ top: virtualScrollTop.current, behavior: 'smooth' });

            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                virtualScrollTop.current = null;
            }, 200);
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [options.length]);

    return (
        <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] mb-6">{label}</span>
            <div className="relative h-[220px] w-full">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[64px] bg-indigo-500/[0.03] border-y border-zinc-800 pointer-events-none z-10" />
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />

                <div
                    ref={scrollRef}
                    onScrollCapture={() => { if (!isProgrammaticScroll.current) isScrolling.current = true; }}
                    onScroll={() => {
                        clearTimeout((window as any).scrollTimeout);
                        (window as any).scrollTimeout = setTimeout(() => { isScrolling.current = false; }, 150);
                    }}
                    className="h-full overflow-y-scroll snap-y snap-mandatory px-4 scrollbar-hide"
                    style={{ perspective: '1000px' }}
                >
                    <div className="h-[78px] shrink-0" />
                    {options.map((opt, i) => {
                        const isVisible = Math.abs(options.indexOf(localValue) - i) < 5;
                        return (
                            <div
                                key={opt}
                                ref={el => { itemRefs.current[i] = el; }}
                                data-value={opt}
                                className={cn(
                                    "h-[64px] flex items-center justify-center snap-center transition-all duration-75 ease-out",
                                    localValue === opt ? "text-white text-3xl font-black" : "text-zinc-800 text-xl font-medium"
                                )}
                                style={{
                                    opacity: isVisible ? Math.max(0.1, 1 - Math.abs(options.indexOf(localValue) - i) * 0.4) : 0,
                                    transform: isVisible ? `rotateX(${(i - options.indexOf(localValue)) * 20}deg)` : 'none'
                                }}
                            >
                                {opt.toString().padStart(2, '0')}
                            </div>
                        );
                    })}
                    <div className="h-[78px] shrink-0" />
                </div>
            </div>
        </div>
    );
}

// --- Main Application ---

export default function Dashboard() {
    // UI State
    const [view, setView] = useState<'main' | 'history' | 'why' | 'edit' | 'meds'>('main');
    const [isConfirmingStop, setIsConfirmingStop] = useState(false);
    const [editingField, setEditingField] = useState<'none' | 'intensity' | 'end'>('none');

    // Data State
    const [activeAttack, setActiveAttack] = useState<Attack | null>(null);
    const [history, setHistory] = useState<Attack[]>([]);
    const [prediction, setPrediction] = useState<{ text: string; confidence: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Editing State
    const [stopTime, setStopTime] = useState<Date | null>(null);
    const [stopIntensity, setStopIntensity] = useState<number>(5);
    const [note, setNote] = useState("");

    // Start Time Editing (Refinement)
    const [isEditingStart, setIsEditingStart] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);

    // Full History Editing State
    const [editingAttack, setEditingAttack] = useState<Attack | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editStart, setEditStart] = useState("");
    const [editEnd, setEditEnd] = useState("");
    const [editIntensity, setEditIntensity] = useState<number>(5);
    const [editNotes, setEditNotes] = useState("");


    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            const [attacksRes, predictRes] = await Promise.all([
                fetch('/api/attacks'),
                fetch('/api/predictions')
            ]);

            const attacksData = await attacksRes.json();
            const predictData = await predictRes.json();

            if (attacksData.success) {
                setHistory(attacksData.data);
                const active = attacksData.data.find((a: Attack) => a.isActive);
                setActiveAttack(active || null);
            }

            if (predictData.success && predictData.data.predictions.length > 0) {
                const best = predictData.data.predictions[0];
                setPrediction({
                    text: `${best.detail} (${best.type.replace('_', ' ')})`,
                    confidence: best.confidence
                });
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll for active attack duration updates?
        // Actually react re-renders will handle the "seconds" if we force update, but for minutes just a periodic check is fine.
        const interval = setInterval(() => {
            // Force re-render for timer
            setActiveAttack(prev => prev ? { ...prev } : null);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // --- Logic ---
    const handleStart = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start' })
            });
            const data = await res.json();
            if (data.success) {
                await fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitiateStop = () => {
        // Initialize stop state
        setStopTime(new Date());
        setStopIntensity(5);
        setIsConfirmingStop(true);
    };

    const handleConfirmStop = async () => {
        if (!activeAttack) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'end',
                    intensity: stopIntensity,
                    endTime: stopTime?.toISOString(),
                    notes: note
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsConfirmingStop(false);
                setEditingField('none');
                setNote(""); // Clear note after saving
                await fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogMedication = async (name: string, dosage: number) => {
        try {
            const res = await fetch('/api/medications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, dosage, attackId: activeAttack?._id })
            });
            const data = await res.json();
            if (data.success) {
                setView('main');
                // Maybe show a toast or success indicator?
            }
        } catch (error) {
            console.error(error);
        }
    };

    const durationText = useMemo(() => {
        if (!activeAttack) return "0m";
        const start = new Date(activeAttack.start);
        const end = stopTime || new Date(); // Use stopTime if we are confirming logic, otherwise current time
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.max(0, Math.floor(diffMs / 60000));
        const h = Math.floor(diffMins / 600); // Wait, logic error in original file? 600 mins = 10h. 60 mins = 1h. Fixed below.
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours > 0 ? hours + 'h ' : ''}${mins}m`;
    }, [activeAttack, stopTime]); // Re-calc when activeAttack or stopTime updates

    const formatTime = (date: Date | null) => {
        if (!date) return "--:--";
        return format(date, "HH:mm");
    };

    const updateEndTime = (newDate: Date) => {
        setStopTime(newDate);
    };

    const updateHours = (val: number) => {
        if (isEditingStart && startTime) {
            const d = new Date(startTime);
            d.setHours(val);
            setStartTime(d);
            return;
        }
        if (!stopTime) return;
        const d = new Date(stopTime);
        d.setHours(val);
        setStopTime(d);
    };

    const updateMinutes = (val: number) => {
        if (isEditingStart && startTime) {
            const d = new Date(startTime);
            d.setMinutes(val);
            setStartTime(d);
            return;
        }
        if (!stopTime) return;
        const d = new Date(stopTime);
        d.setMinutes(val);
        setStopTime(d);
    };

    const handleEditStart = () => {
        if (!activeAttack) return;
        setStartTime(new Date(activeAttack.start));
        setIsEditingStart(true);
        setEditingField('end'); // Reuse the 'end' time picker UI but logic handles 'isEditingStart'
    };

    const confirmStartEdit = async () => {
        if (!activeAttack || !startTime) return;

        // Optimistic update
        setActiveAttack({ ...activeAttack, start: startTime });
        setIsEditingStart(false);
        setEditingField('none');

        try {
            await fetch(`/api/actions/${activeAttack._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start: startTime.toISOString() })
            });
            await fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    // --- History Editing Logic ---
    const formatForInput = (date: string | Date) => {
        if (!date) return "";
        const d = new Date(date);
        return format(d, "yyyy-MM-dd'T'HH:mm");
    };

    const handleEditClick = (attack: Attack) => {
        setEditingAttack(attack);
        setEditStart(formatForInput(attack.start));
        setEditEnd(attack.end ? formatForInput(attack.end) : "");
        setEditIntensity(typeof attack.intensity === 'number' ? attack.intensity : 5);
        setEditNotes(attack.notes || "");
    };

    const handleSaveHistory = async () => {
        if (!editingAttack) return;
        setIsSaving(true);
        try {
            const body = {
                start: new Date(editStart).toISOString(),
                end: editEnd ? new Date(editEnd).toISOString() : undefined,
                intensity: editIntensity,
                notes: editNotes
            };

            const res = await fetch(`/api/actions/${editingAttack._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setEditingAttack(null);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteHistory = async () => {
        if (!editingAttack || !confirm("Delete this record permanently?")) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/actions/${editingAttack._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setEditingAttack(null);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        // Added overflow-hidden to body to prevent scroll, and set height to 100dvh for mobile
        <div className="h-[100dvh] w-full bg-[#050505] text-zinc-100 flex flex-col font-sans overflow-hidden select-none relative items-center justify-center">

            {/* Container: constrained to mobile size on desktop, full on mobile */}
            {/* Container: Responsive centered max-width for desktop, full for mobile */}
            <div className="w-full h-full max-w-2xl relative overflow-hidden bg-[#050505] flex flex-col shadow-2xl">

                {/* 1. Static Header */}
                <div className="absolute top-0 left-0 right-0 z-20 px-8 pt-12 pb-4 flex justify-between items-center bg-gradient-to-b from-[#050505] to-transparent">
                    <span className="text-[10px] uppercase tracking-[0.6em] font-black text-zinc-800">EPH Core</span>
                    <button onClick={() => setView('why')} className="p-3 bg-zinc-900/50 border border-zinc-800/30 rounded-2xl text-zinc-600 active:scale-95 transition-transform">
                        <Info className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. Main One-Page Content */}
                <div className="flex-1 flex flex-col items-center pt-32 px-8 relative z-10 w-full h-full">

                    {view === 'main' && (
                        <>
                            {/* Status Label */}
                            <div className="text-center h-20 flex flex-col justify-center mb-8">
                                {!activeAttack ? (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                                        <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest mb-1 block">Next Prediction</span>
                                        <div className="text-3xl font-light tracking-tight text-zinc-500">
                                            {prediction ? prediction.text.split('(')[0].split(',')[1]?.trim() || prediction.text.split('(')[0].trim() : "Loading..."}
                                        </div>
                                        {prediction && <div className="text-[10px] text-zinc-700 mt-1">{prediction.confidence}% Confidence</div>}
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 block">Ongoing Episode</span>
                                        <div className="text-4xl font-light tracking-tight tabular-nums text-white">
                                            {formatTime(new Date(activeAttack.start))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* The Orb */}
                            <div className="relative w-64 h-64 shrink-0 flex items-center justify-center mb-6">
                                <div className={cn(
                                    "absolute inset-0 rounded-full border border-zinc-900/50 transition-all duration-1000",
                                    activeAttack ? "scale-110 border-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.05)]" : "scale-100"
                                )} />

                                <button
                                    onClick={activeAttack ? (isConfirmingStop ? handleConfirmStop : handleInitiateStop) : handleStart}
                                    disabled={isLoading}
                                    className={cn(
                                        "relative w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-500",
                                        "bg-gradient-to-b from-zinc-900 to-[#0a0a0a] border border-zinc-800/50",
                                        "shadow-[0_40px_100px_-20px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.05)]",
                                        "active:scale-95 group overflow-hidden",
                                        isConfirmingStop && "border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.1)]",
                                        activeAttack && !isConfirmingStop && "border-indigo-500/20"
                                    )}
                                >
                                    {isConfirmingStop ? (
                                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                            <CheckCircle2 className="w-10 h-10 mb-2 text-rose-500 fill-rose-500/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                                                {isLoading ? "Saving..." : "Confirm End"}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <Zap className={cn(
                                                "w-10 h-10 mb-3 transition-all duration-700",
                                                activeAttack ? "text-indigo-400 fill-indigo-400/10" : "text-zinc-700"
                                            )} />
                                            <span className={cn(
                                                "text-[11px] font-bold uppercase tracking-widest",
                                                activeAttack ? "text-indigo-200" : "text-zinc-600"
                                            )}>
                                                {isLoading ? '...' : (activeAttack ? 'Ongoing' : 'Start Log')}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {isConfirmingStop && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsConfirmingStop(false); setEditingField('none'); }}
                                        className="absolute -bottom-10 text-[10px] font-bold text-zinc-700 uppercase tracking-widest hover:text-white transition-colors p-4"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {/* Note Area */}
                            <div className={cn(
                                "w-full mb-4 transition-all duration-700 px-2",
                                isConfirmingStop ? "opacity-100 scale-100 h-14" : "opacity-0 scale-95 h-0 pointer-events-none"
                            )}>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Add quick note..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full bg-zinc-900/40 border border-zinc-800/60 rounded-2xl px-6 py-4 text-sm text-zinc-300 placeholder:text-zinc-800 focus:border-indigo-500/20 transition-all font-medium outline-none"
                                    />
                                    <NotebookPen className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                                </div>
                            </div>

                            {/* Summary Section (Stop Controls) */}
                            <div className={cn(
                                "w-full transition-all duration-700 mt-auto mb-16",
                                activeAttack ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
                            )}>
                                <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-[2.5rem] p-6 flex flex-col gap-5 shadow-2xl backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">Session Review</span>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950/50 border border-zinc-800 rounded-full">
                                            <Timer className="w-3 h-3 text-indigo-500" />
                                            <span className="text-[10px] font-mono text-white tabular-nums">{durationText}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <button
                                            onClick={handleEditStart}
                                            className="flex-1 group transition-all p-3 rounded-2xl active:scale-95 text-center flex flex-col items-center hover:bg-zinc-950/40"
                                        >
                                            <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Onset</span>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <span className="text-xl font-light tabular-nums text-zinc-400 group-hover:text-indigo-300 transition-colors">
                                                    {activeAttack ? formatTime(new Date(activeAttack.start)) : "--:--"}
                                                </span>
                                                <Edit2 className="w-2.5 h-2.5 text-zinc-800 group-hover:text-indigo-500" />
                                            </div>
                                        </button>

                                        {/* Intensity Button */}
                                        <button
                                            onClick={() => isConfirmingStop && setEditingField('intensity')}
                                            className={cn(
                                                "flex-1 group transition-all p-3 rounded-2xl active:scale-95 text-center flex flex-col items-center",
                                                !isConfirmingStop && "opacity-10 pointer-events-none",
                                                editingField === 'intensity' ? "bg-indigo-500/10 ring-1 ring-indigo-500/30" : "hover:bg-zinc-950/40"
                                            )}
                                        >
                                            <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Intensity</span>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <span className="text-xl font-light tabular-nums text-indigo-300">{stopIntensity}</span>
                                                <Edit2 className="w-2.5 h-2.5 text-zinc-700 group-hover:text-indigo-500" />
                                            </div>
                                        </button>

                                        {/* End Time Button */}
                                        <button
                                            onClick={() => isConfirmingStop && setEditingField('end')}
                                            className={cn(
                                                "flex-1 group transition-all p-3 rounded-2xl active:scale-95 text-center flex flex-col items-center",
                                                !isConfirmingStop && "opacity-10 pointer-events-none",
                                                editingField === 'end' ? "bg-rose-500/10 ring-1 ring-rose-500/30" : "hover:bg-zinc-950/40"
                                            )}
                                        >
                                            <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Offset</span>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <span className="text-xl font-light tabular-nums">{formatTime(stopTime)}</span>
                                                <Edit2 className="w-2.5 h-2.5 text-zinc-700 group-hover:text-rose-500" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Drum Picker Overlays */}

                {/* Intensity Picker */}
                <div className={cn(
                    "absolute inset-x-0 bottom-0 z-[100] bg-zinc-950/98 backdrop-blur-3xl border-t border-zinc-900 rounded-t-[3.5rem] p-10 flex flex-col transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] max-h-[500px]",
                    editingField === 'intensity' ? "translate-y-0" : "translate-y-full"
                )}>
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-xl font-bold tracking-tight">Adjust Intensity</h4>
                        <button onClick={() => setEditingField('none')} className="p-4 bg-white text-black rounded-2xl shadow-xl active:scale-95 transition-all">
                            <Check className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex gap-4 items-center justify-center">
                        <DrumPicker
                            label="Level"
                            value={stopIntensity}
                            options={Array.from({ length: 10 }, (_, i) => i + 1)}
                            onChange={(v) => setStopIntensity(v)}
                        />
                    </div>
                </div>

                {/* Time Picker */}
                <div className={cn(
                    "absolute inset-x-0 bottom-0 z-[100] bg-zinc-950/98 backdrop-blur-3xl border-t border-zinc-900 rounded-t-[3.5rem] p-10 flex flex-col transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] max-h-[500px]",
                    editingField === 'end' ? "translate-y-0" : "translate-y-full"
                )}>
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-xl font-bold tracking-tight">{isEditingStart ? "Adjust Onset" : "Adjust Offset"}</h4>
                        <button onClick={() => {
                            if (isEditingStart) confirmStartEdit();
                            else setEditingField('none');
                        }} className="p-4 bg-white text-black rounded-2xl shadow-xl active:scale-95 transition-all">
                            <Check className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex gap-4 items-center">
                        <DrumPicker
                            label="Hour"
                            value={(isEditingStart ? startTime : stopTime)?.getHours() || 0}
                            options={Array.from({ length: 24 }, (_, i) => i)}
                            onChange={updateHours}
                        />
                        <div className="text-3xl font-black text-zinc-800 pt-7">:</div>
                        <DrumPicker
                            label="Minute"
                            value={(isEditingStart ? startTime : stopTime)?.getMinutes() || 0}
                            options={Array.from({ length: 60 }, (_, i) => i)}
                            onChange={updateMinutes}
                        />
                    </div>
                </div>


                {/* 4. Navigation (Static bottom) */}
                {!activeAttack && view === 'main' && (
                    <div className="absolute bottom-12 left-0 right-0 px-10 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 z-30">
                        <NavButton icon={History} label="History" onClick={() => setView('history')} />
                        <NavButton icon={Pill} label="Meds" onClick={() => setView('meds')} />
                        <a href="https://docs.google.com/spreadsheets/d/1SDTG5ZlJhaZdD5-18-t3OPw2isY5cqUCZniTE806Ddw/edit?usp=sharing" target="_blank" className="w-full">
                            <NavButton icon={Share2} label="Sheet" />
                        </a>


                    </div>
                )}

                {view === 'history' && (
                    <div className="absolute inset-0 z-[60] bg-[#050505] animate-in slide-in-from-right-10 duration-300 p-0 flex flex-col h-full w-full">
                        {/* Header */}
                        <div className="px-8 pt-12 pb-6 flex items-center justify-between bg-gradient-to-b from-[#050505] via-[#050505] to-transparent sticky top-0 z-20">
                            <button onClick={() => setView('main')} className="p-4 -ml-4 text-zinc-500 hover:text-white transition-colors active:scale-90">
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <span className="text-xs uppercase tracking-[0.4em] font-black text-zinc-700">History Log</span>
                            <div className="w-8" />
                        </div>

                        <div className="space-y-4 overflow-y-auto scrollbar-hide pb-32 px-6 flex-1">
                            {isLoading ? <div className="text-center py-20 text-zinc-800">Loading...</div> : history.length === 0 && <div className="text-zinc-600 text-center py-10">No recent history</div>}
                            {[...history].sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()).map(h => (
                                <div key={h._id || Math.random()}
                                    onClick={() => handleEditClick(h)}
                                    className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/40 flex justify-between items-stretch hover:bg-zinc-800/50 active:scale-[0.98] transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col justify-center gap-2">
                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                                            {format(new Date(h.start), "MMM dd, yyyy")}
                                        </span>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-light text-white tracking-tight">
                                                {format(new Date(h.start), "HH:mm")}
                                            </span>
                                            {h.end && <span className="text-xl text-zinc-600 font-light">- {format(new Date(h.end), "HH:mm")}</span>}
                                        </div>
                                        {h.notes && (
                                            <span className="text-sm text-zinc-500 italic truncate max-w-[200px] mt-1 block">
                                                "{h.notes}"
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center justify-center pl-6 border-l border-zinc-800/50">
                                        <span className="text-[10px] font-black text-zinc-700 tracking-tighter uppercase mb-1">INT</span>
                                        <span className={cn(
                                            "text-3xl font-black",
                                            typeof h.intensity === 'number' && h.intensity >= 7 ? "text-rose-500 delay-100 duration-1000 animate-in fade-in" : "text-indigo-400"
                                        )}>{h.intensity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Edit Modal (Full Screen Overlay) */}
                {editingAttack && (
                    <div className="absolute inset-0 z-[110] bg-[#050505]/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="px-8 pt-12 pb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-black tracking-tight">Edit Entry</h3>
                            <button onClick={() => setEditingAttack(null)} className="p-4 bg-zinc-900 rounded-full text-zinc-400 hover:text-white active:scale-90 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-8">
                            {/* Start Time */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editStart}
                                    onChange={(e) => setEditStart(e.target.value)}
                                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-5 text-xl text-white focus:border-indigo-500 outline-none transition-colors"
                                />
                            </div>

                            {/* End Time */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> End Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editEnd}
                                    onChange={(e) => setEditEnd(e.target.value)}
                                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-5 text-xl text-white focus:border-indigo-500 outline-none transition-colors"
                                />
                            </div>

                            {/* Intensity */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Intensity
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setEditIntensity(num)}
                                            className={cn(
                                                "h-14 rounded-2xl text-xl font-bold transition-all border-2",
                                                editIntensity === num
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/50 scale-105"
                                                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 active:scale-95"
                                            )}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <StickyNote className="w-4 h-4" /> Notes
                                </label>
                                <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    rows={4}
                                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-5 text-lg text-white focus:border-indigo-500 outline-none resize-none"
                                    placeholder="Add notes..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleDeleteHistory}
                                    disabled={isSaving}
                                    className="flex-1 py-5 rounded-3xl bg-zinc-950 border-2 border-rose-900/30 text-rose-500 font-bold text-lg hover:bg-rose-950/20 active:scale-95 transition-all flex justify-center items-center"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleSaveHistory}
                                    disabled={isSaving}
                                    className="flex-[3] py-5 rounded-3xl bg-indigo-600 text-white font-bold text-lg tracking-wide shadow-xl shadow-indigo-900/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {isSaving ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {view === 'meds' && (
                    <div className="absolute inset-0 z-[60] bg-[#050505] animate-in slide-in-from-bottom-10 duration-500 p-8 flex flex-col pt-24 h-full">
                        <div className="flex items-center justify-between mb-10 shrink-0">
                            <h3 className="text-3xl font-black tracking-tighter">MEDS</h3>
                            <button onClick={() => setView('main')} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800"><X className="w-5 h-5 text-zinc-600" /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-[2rem] p-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Ibuprofen</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[200, 400, 600, 800].map(mg => (
                                        <button key={mg} onClick={() => handleLogMedication("Ibuprofen", mg)} className="py-3 bg-zinc-800/50 rounded-xl text-sm font-bold active:bg-indigo-600 active:text-white transition-colors">{mg}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-[2rem] p-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Indomethacin</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[25, 50, 75].map(mg => (
                                        <button key={mg} onClick={() => handleLogMedication("Indomethacin", mg)} className="py-3 bg-zinc-800/50 rounded-xl text-sm font-bold active:bg-indigo-600 active:text-white transition-colors">{mg}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'why' && (
                    <div className="absolute inset-0 z-[60] bg-[#050505] p-10 pt-24 animate-in slide-in-from-right-10 duration-500 h-full">
                        <button onClick={() => setView('main')} className="mb-10 flex items-center gap-3 text-zinc-600">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
                        </button>
                        <h3 className="text-[2.5rem] font-black tracking-tighter mb-8 leading-none">THE<br />LOGIC</h3>
                        <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                            The system analyzes your attack patterns using clustering algorithms to predict high-risk windows.
                            <br /><br />
                            Data processing happens in real-time.
                        </p>
                    </div>
                )}
            </div>
        </div >
    );
}

function NavButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-7 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50 text-zinc-700 hover:text-zinc-200 transition-all active:scale-95 shadow-xl group w-full">
            <Icon className="w-7 h-7 transition-all group-hover:scale-110" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
        </button>
    )
}
