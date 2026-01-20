"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    Zap,
    History,
    Info,
    Clock,
    X,
    Plus,
    Minus,
    Check,
    ChevronLeft,
    ChevronRight,
    Edit2,
    NotebookPen,
    Pill,
    Timer,
    CheckCircle2,
    Calendar,
    Save,
    Trash2,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

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
                // Update local value immediately to ensure highlight is correct
                setLocalValue(value);

                isProgrammaticScroll.current = true;
                scrollRef.current.scrollTo({
                    top: index * itemHeight,
                    behavior: 'auto' // Instant jump to avoid "spinning" from 0
                });

                // Release lock after a short delay
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
                    // Only update if USER is scrolling and NOT during a programatic sync
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

    // Fix: Custom Wheel Handler with Virtual Target for rapid scrolling
    const virtualScrollTop = useRef<number | null>(null);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Sync virtual target to current scroll if idle
            if (virtualScrollTop.current === null) {
                virtualScrollTop.current = Math.round(el.scrollTop / itemHeight) * itemHeight;
            }

            const direction = Math.sign(e.deltaY);
            virtualScrollTop.current += direction * itemHeight;

            // Clamp target to valid bounds
            // Max scroll is (options.length - 1) * itemHeight? No, total height is (options.length + 2 pads) * itemHeight?
            // Actually, max scrollTop is (scrollHeight - clientHeight).
            // content height: (options.length * 64) + (78 * 2)
            // clientHeight: 220
            // maxScrollTop = (options.length * 64 + 156) - 220 = options.length * 64 - 64
            const maxScroll = (options.length - 1) * itemHeight;

            virtualScrollTop.current = Math.max(0, Math.min(virtualScrollTop.current, maxScroll));

            el.scrollTo({
                top: virtualScrollTop.current,
                behavior: 'smooth'
            });

            // Reset virtual tracking after scrolling stops
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
                    onScrollCapture={() => {
                        if (!isProgrammaticScroll.current) {
                            isScrolling.current = true;
                        }
                    }}
                    onScroll={() => {
                        clearTimeout((window as any).scrollTimeout);
                        (window as any).scrollTimeout = setTimeout(() => {
                            isScrolling.current = false;
                        }, 150);
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

export default function ShadowCore() {
    const [view, setView] = useState<'main' | 'history' | 'why' | 'edit'>('main');
    const [isActive, setIsActive] = useState(false);
    const [isConfirmingStop, setIsConfirmingStop] = useState(false);
    const [editingField, setEditingField] = useState<'none' | 'start' | 'end'>('none');

    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [note, setNote] = useState("");

    const durationText = useMemo(() => {
        if (!startTime || !endTime) return "0m";
        const diffMs = endTime.getTime() - startTime.getTime();
        if (diffMs < 0) return "Invalid";
        const diffMins = Math.floor(diffMs / 60000);
        const h = Math.floor(diffMins / 600);
        const m = diffMins % 60;
        return `${h > 0 ? h + 'h ' : ''}${m}m`;
    }, [startTime, endTime]);

    const handleStart = () => {
        setStartTime(new Date());
        setIsActive(true);
        setNote("");
    };

    const handleStopStep = () => {
        if (isConfirmingStop) {
            setIsActive(false);
            setIsConfirmingStop(false);
            setEditingField('none');
        } else {
            setEndTime(new Date());
            setIsConfirmingStop(true);
        }
    };

    const formatTime = (date: Date | null) => {
        if (!date) return "--:--";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const updateHours = (field: 'start' | 'end', hours: number) => {
        const original = field === 'start' ? startTime : endTime;
        if (!original) return;
        const next = new Date(original);
        next.setHours(hours);
        field === 'start' ? setStartTime(next) : setEndTime(next);
    };

    const updateMinutes = (field: 'start' | 'end', minutes: number) => {
        const original = field === 'start' ? startTime : endTime;
        if (!original) return;
        const next = new Date(original);
        next.setMinutes(minutes);
        field === 'start' ? setStartTime(next) : setEndTime(next);
    };

    const prediction = { time: "Tomorrow, 14:00", confidence: 85 };
    const history = [
        { id: 1, date: "Jan 20", time: "10:32", intensity: 3, note: "Driving" },
        { id: 2, date: "Jan 19", time: "14:58", intensity: 5, note: "" },
    ];

    return (
        <div className="h-[812px] w-[375px] bg-[#050505] text-zinc-100 flex flex-col font-sans overflow-hidden select-none relative mx-auto shadow-2xl border border-zinc-900 rounded-[3rem]">

            {/* 1. Static Header */}
            <div className="absolute top-10 left-0 right-0 z-20 px-10 flex justify-between items-center h-12">
                <span className="text-[10px] uppercase tracking-[0.6em] font-black text-zinc-800">EPH Core</span>
                <button onClick={() => setView('why')} className="p-3 bg-zinc-900/50 border border-zinc-800/30 rounded-2xl text-zinc-600">
                    <Info className="w-5 h-5" />
                </button>
            </div>

            {/* 2. Main One-Page Content */}
            <div className="flex-1 flex flex-col items-center pt-28 px-8 relative z-10">

                {view === 'main' && (
                    <>
                        {/* Status Label */}
                        <div className="text-center h-16 flex flex-col justify-center mb-6">
                            {!isActive ? (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                                    <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest mb-1 block">Next Prediction</span>
                                    <div className="text-4xl font-light tracking-tight text-zinc-500">{prediction.time}</div>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 block">Ongoing Episode</span>
                                    <div className="text-4xl font-light tracking-tight tabular-nums text-white">{formatTime(startTime)}</div>
                                </div>
                            )}
                        </div>

                        {/* The Orb */}
                        <div className="relative w-64 h-64 shrink-0 flex items-center justify-center mb-10">
                            <div className={cn(
                                "absolute inset-0 rounded-full border border-zinc-900/50 transition-all duration-1000",
                                isActive ? "scale-110 border-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.05)]" : "scale-100"
                            )} />

                            <button
                                onClick={isActive ? handleStopStep : handleStart}
                                className={cn(
                                    "relative w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-500",
                                    "bg-gradient-to-b from-zinc-900 to-[#0a0a0a] border border-zinc-800/50",
                                    "shadow-[0_40px_100px_-20px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.05)]",
                                    "active:scale-95 group overflow-hidden",
                                    isConfirmingStop && "border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.1)]",
                                    isActive && !isConfirmingStop && "border-indigo-500/20"
                                )}
                            >
                                {isConfirmingStop ? (
                                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                        <CheckCircle2 className="w-10 h-10 mb-2 text-rose-500 fill-rose-500/10" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Record Stats</span>
                                    </div>
                                ) : (
                                    <>
                                        <Zap className={cn(
                                            "w-10 h-10 mb-3 transition-all duration-700",
                                            isActive ? "text-indigo-400 fill-indigo-400/10" : "text-zinc-700"
                                        )} />
                                        <span className={cn(
                                            "text-[11px] font-bold uppercase tracking-widest",
                                            isActive ? "text-indigo-200" : "text-zinc-600"
                                        )}>
                                            {isActive ? 'Ongoing' : 'Start Log'}
                                        </span>
                                    </>
                                )}
                            </button>

                            {isConfirmingStop && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsConfirmingStop(false); }}
                                    className="absolute -bottom-10 text-[10px] font-bold text-zinc-700 uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {/* Note Area (Directly below Orb, visible immediately) */}
                        <div className={cn(
                            "w-full mb-8 transition-all duration-700",
                            isConfirmingStop ? "opacity-100 scale-100 h-14" : "opacity-0 scale-95 h-0 pointer-events-none"
                        )}>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Add quick note..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full bg-zinc-900/40 border border-zinc-800/60 rounded-2xl px-6 py-4 text-sm text-zinc-300 placeholder:text-zinc-800 focus:border-indigo-500/20 transition-all font-medium"
                                />
                                <NotebookPen className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                            </div>
                        </div>

                        {/* Summary Section (Now the anchor point) */}
                        <div className={cn(
                            "w-full transition-all duration-700 mt-auto mb-12",
                            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
                        )}>
                            <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-[2.5rem] p-6 flex flex-col gap-5 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">Session Review</span>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950/50 border border-zinc-800 rounded-full">
                                        <Timer className="w-3 h-3 text-indigo-500" />
                                        <span className="text-[10px] font-mono text-white tabular-nums">{durationText}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setEditingField('start')}
                                        className={cn(
                                            "flex-1 group transition-all p-3 rounded-2xl active:scale-95 text-center flex flex-col items-center",
                                            editingField === 'start' ? "bg-indigo-500/10 ring-1 ring-indigo-500/30" : "hover:bg-zinc-950/40"
                                        )}
                                    >
                                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Onset</span>
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <span className="text-xl font-light tabular-nums">{formatTime(startTime)}</span>
                                            <Edit2 className="w-2.5 h-2.5 text-zinc-700 group-hover:text-indigo-500" />
                                        </div>
                                    </button>

                                    <div className="w-px h-8 bg-zinc-800/40 mx-2" />

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
                                            <span className="text-xl font-light tabular-nums">{formatTime(endTime)}</span>
                                            <Edit2 className="w-2.5 h-2.5 text-zinc-700 group-hover:text-rose-500" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 3. Drum Picker Overlay */}
            <div className={cn(
                "absolute inset-x-0 bottom-0 z-[100] bg-zinc-950/98 backdrop-blur-3xl border-t border-zinc-900 rounded-t-[3.5rem] p-10 flex flex-col transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_-20px_50px_rgba(0,0,0,0.9)]",
                editingField !== 'none' ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="flex justify-between items-center mb-10">
                    <h4 className="text-xl font-bold tracking-tight">Adjust {editingField === 'start' ? 'Onset' : 'Offset'}</h4>
                    <button onClick={() => setEditingField('none')} className="p-4 bg-white text-black rounded-2xl shadow-xl active:scale-95 transition-all">
                        <Check className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex gap-4 items-center">
                    <DrumPicker
                        label="Hour"
                        value={(editingField === 'start' ? startTime : endTime)?.getHours() || 0}
                        options={Array.from({ length: 24 }, (_, i) => i)}
                        onChange={(v) => updateHours(editingField as any, v)}
                    />
                    <div className="text-3xl font-black text-zinc-800 pt-7">:</div>
                    <DrumPicker
                        label="Minute"
                        value={(editingField === 'start' ? startTime : endTime)?.getMinutes() || 0}
                        options={Array.from({ length: 60 }, (_, i) => i)}
                        onChange={(v) => updateMinutes(editingField as any, v)}
                    />
                </div>
            </div>

            {/* 4. Navigation (Static bottom) */}
            {!isActive && view === 'main' && (
                <div className="absolute bottom-12 left-0 right-0 px-10 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <NavButton icon={History} label="History" onClick={() => setView('history')} />
                    <NavButton icon={Pill} label="Meds" />
                    <NavButton icon={NotebookPen} label="Note" />
                </div>
            )}

            {/* Slide-overs (History/Why) remain the same */}
            {view === 'history' && (
                <div className="absolute inset-0 z-[60] bg-[#050505] animate-in slide-in-from-right-10 duration-500 p-10 flex flex-col pt-24">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-3xl font-black tracking-tighter">HISTORY</h3>
                        <button onClick={() => setView('main')} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800"><X className="w-5 h-5 text-zinc-600" /></button>
                    </div>
                    <div className="space-y-4 overflow-y-auto scrollbar-hide pb-20">
                        {history.map(h => (
                            <div key={h.id} className="p-8 rounded-[3rem] bg-zinc-900/30 border border-zinc-800/40 flex justify-between items-center group">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{h.date}</span>
                                    <span className="text-2xl font-light text-white">{h.time}</span>
                                    <span className="text-[10px] text-zinc-600 italic">"{h.note || 'No notes'}"</span>
                                </div>
                                <div className="bg-zinc-950 p-5 rounded-[2rem] border border-zinc-800 flex flex-col items-center">
                                    <span className="text-[9px] font-black text-zinc-700 tracking-tighter uppercase">INT</span>
                                    <span className="text-xl font-black text-indigo-400">{h.intensity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'why' && (
                <div className="absolute inset-0 z-[60] bg-[#050505] p-10 pt-24 animate-in slide-in-from-right-10 duration-500">
                    <button onClick={() => setView('main')} className="mb-10 flex items-center gap-3 text-zinc-600">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back</span>
                    </button>
                    <h3 className="text-[2.5rem] font-black tracking-tighter mb-8 leading-none">THE<br />LOGIC</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                        Analyzing inter-arrival times across 14 entries. Strong diurnal pattern detected around 14:00.
                    </p>
                </div>
            )}

        </div>
    );
}

function Arrow({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
        </svg>
    )
}

function NavButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-7 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50 text-zinc-700 hover:text-zinc-200 transition-all active:scale-95 shadow-xl group">
            <Icon className="w-7 h-7 transition-all group-hover:scale-110" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
        </button>
    )
}
