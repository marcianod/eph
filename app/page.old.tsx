"use client";

import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Play, Square, Pill, RefreshCw, Zap, Clock, Share2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

export default function Dashboard() {
    // State
    const [activeAttack, setActiveAttack] = useState<Attack | null>(null);
    const [history, setHistory] = useState<Attack[]>([]);
    const [medHistory, setMedHistory] = useState<MedicationLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [prediction, setPrediction] = useState<{ text: string; confidence: number } | null>(null);

    // End Attack Flow State
    const [isEndingAttack, setIsEndingAttack] = useState(false);
    const [endStep, setEndStep] = useState<"intensity" | "time">("intensity");
    const [selectedIntensity, setSelectedIntensity] = useState<number | "">("");
    const [endTime, setEndTime] = useState<string>("");

    // Medication Modal State
    const [isMedModalOpen, setIsMedModalOpen] = useState(false);
    const [selectedMedType, setSelectedMedType] = useState<"ibuprofen" | "indomethacin" | "custom" | null>(null);
    const [isMedMenuOpen, setIsMedMenuOpen] = useState(false);

    // Retroactive Modal State
    const [isRetroModalOpen, setIsRetroModalOpen] = useState(false);
    const [editingAttackId, setEditingAttackId] = useState<string | null>(null);
    const [retroStart, setRetroStart] = useState("");
    const [retroEnd, setRetroEnd] = useState("");
    const [retroIntensity, setRetroIntensity] = useState<number | "">("");
    const [retroNotes, setRetroNotes] = useState("");

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
    }, []);

    // --- Handlers ---

    const handleStartAttack = async () => {
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

    const handleInitiateEndAttack = () => {
        setIsEndingAttack(true);
        setEndStep("intensity");
        setSelectedIntensity("");
    };

    const handleIntensitySelect = (intensity: number) => {
        setSelectedIntensity(intensity);
        setEndStep("time");
    };

    const handleCustomIntensityNext = () => {
        if (selectedIntensity) {
            setEndStep("time");
        }
    };

    const handleConfirmEndAttack = async () => {
        if (!activeAttack) return;
        setIsLoading(true);

        // Calculate end time
        let finalEndTime: string | undefined = undefined;
        if (endTime) {
            if (endTime.endsWith('m')) {
                const mins = parseInt(endTime);
                finalEndTime = new Date(Date.now() - mins * 60000).toISOString();
            } else {
                const [hours, minutes] = endTime.split(':');
                const d = new Date();
                d.setHours(parseInt(hours), parseInt(minutes));
                finalEndTime = d.toISOString();
            }
        }

        try {
            const res = await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'end',
                    intensity: selectedIntensity,
                    endTime: finalEndTime
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsEndingAttack(false);
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
                // Update med history locally if we had a med history fetcher, for now just close
                setIsMedModalOpen(false);
                setSelectedMedType(null);
                setIsMedMenuOpen(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenAddModal = () => {
        setEditingAttackId(null);
        setRetroStart(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
        setRetroEnd(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
        setRetroIntensity("");
        setRetroNotes("");
        setIsRetroModalOpen(true);
    };

    const handleOpenEditModal = (attack: Attack) => {
        if (attack._id) {
            setEditingAttackId(attack._id);
            setRetroStart(format(new Date(attack.start), "yyyy-MM-dd'T'HH:mm"));
            setRetroEnd(attack.end ? format(new Date(attack.end), "yyyy-MM-dd'T'HH:mm") : "");
            setRetroIntensity(attack.intensity === '–' ? "" : (attack.intensity || ""));
            setRetroNotes(attack.notes || "");
            setIsRetroModalOpen(true);
        }
    };

    const handleSaveRetroAttack = async () => {
        setIsLoading(true);
        try {
            const url = editingAttackId ? `/api/actions/${editingAttackId}` : '/api/actions';
            const method = editingAttackId ? 'PATCH' : 'POST';
            const body = editingAttackId
                ? { start: retroStart, end: retroEnd, intensity: retroIntensity, notes: retroNotes }
                : { action: 'manual_add', start: retroStart, end: retroEnd, intensity: retroIntensity, notes: retroNotes };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setIsRetroModalOpen(false);
                await fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Helpers ---

    const renderActiveAttackPanel = () => {
        if (!activeAttack) return null;
        const durationMinutes = Math.floor((Date.now() - new Date(activeAttack.start).getTime()) / 60000);

        return (
            <Card className="mb-6 bg-green-950/20 border-green-900/50">
                <CardContent className="p-4 flex justify-between items-center text-green-300">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <span className="font-semibold">Ongoing Attack</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                        <Clock className="h-4 w-4" />
                        <span>{durationMinutes}m</span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#121212] p-6 text-white max-w-lg mx-auto w-full">
            {/* Header */}
            <h1 className="mb-8 text-3xl font-bold flex items-center gap-3">
                EPH Tracker
                <a
                    href="https://docs.google.com/spreadsheets/d/1SDTG5ZlJhaZdD5-18-t3OPw2isY5cqUCZniTE806Ddw/edit?usp=sharing"
                    target="_blank"
                    className="text-muted-foreground hover:text-white transition-colors"
                >
                    <Share2 className="h-5 w-5 opacity-60" />
                </a>
            </h1>

            {renderActiveAttackPanel()}

            {/* Main Actions */}
            {!activeAttack ? (
                <div className="flex flex-col gap-3 mb-8 w-full max-w-[300px]">
                    <Button
                        variant="start"
                        onClick={handleStartAttack}
                        disabled={isLoading}
                    >
                        {isLoading ? "Starting..." : <><Play className="mr-2 h-6 w-6 fill-current" /> Start Attack</>}
                    </Button>
                    <Button
                        variant="link"
                        onClick={handleOpenAddModal}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        Add Past Event
                    </Button>
                </div>
            ) : (
                <div className="w-full max-w-[300px] flex flex-col items-center mb-8 gap-4">
                    {!isEndingAttack ? (
                        <Button
                            variant="end"
                            onClick={handleInitiateEndAttack}
                            className="w-full max-w-[300px]"
                        >
                            <Square className="mr-2 h-6 w-6 fill-current" /> End Attack
                        </Button>
                    ) : (
                        <div className="w-full bg-zinc-900 p-4 rounded-xl border border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                            {endStep === "intensity" && (
                                <div className="space-y-4">
                                    <h3 className="text-center text-zinc-400">Select Intensity</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button variant="secondary" onClick={() => handleIntensitySelect(3)}>3</Button>
                                        <Button variant="secondary" onClick={() => handleIntensitySelect(5)}>5</Button>
                                        <Button variant="secondary" onClick={() => handleIntensitySelect(8)}>8</Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="1-10"
                                            className="bg-zinc-800 border-zinc-700"
                                            value={selectedIntensity}
                                            onChange={(e) => setSelectedIntensity(parseInt(e.target.value) || "")}
                                        />
                                        <Button onClick={handleCustomIntensityNext} disabled={!selectedIntensity}>Next</Button>
                                    </div>
                                </div>
                            )}

                            {endStep === "time" && (
                                <div className="space-y-4">
                                    <h3 className="text-center text-zinc-400">Time Ended</h3>
                                    <Input
                                        type="time"
                                        className="bg-zinc-800 border-zinc-700 block w-full"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => setEndTime('')}>Now</Button>
                                        <Button variant="secondary" size="sm" onClick={() => setEndTime('15m')}>-15m</Button>
                                        <Button variant="secondary" size="sm" onClick={() => setEndTime('30m')}>-30m</Button>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="ghost" className="flex-1" onClick={() => setEndStep("intensity")}>Back</Button>
                                        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleConfirmEndAttack}>Confirm</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Prediction Panel */}
            <Card className="w-full mb-6">
                <CardHeader className="py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Prediction</CardTitle>
                    <div className="flex gap-1">
                        <Link href="/debug/predictions">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Formula Audit">
                                <Target className="h-4 w-4 text-zinc-500 hover:text-indigo-400" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fetchData()}>
                            <RefreshCw className="h-4 w-4 text-zinc-400" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                    {prediction ? (
                        <div className="text-sm">
                            {prediction.text}
                            <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs">
                                {prediction.confidence}%
                            </span>
                        </div>
                    ) : (
                        <div className="text-sm text-zinc-500">Loading prediction...</div>
                    )}
                </CardContent>
            </Card>

            {/* History Panel */}
            <Card className="w-full">
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">Recent Attacks</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0 space-y-2">
                    {isLoading && history.length === 0 && <div className="text-sm text-zinc-500">Loading history...</div>}
                    {!isLoading && history.length === 0 && <div className="text-sm text-zinc-500">No recent attacks</div>}
                    {history.map(attack => {
                        // Formatting
                        const start = new Date(attack.start);
                        const isToday = new Date().toDateString() === start.toDateString();
                        const timeStr = isToday ? format(start, "HH:mm") : format(start, "dd/MM HH:mm");
                        const duration = attack.isActive
                            ? "Active"
                            : attack.end
                                ? `${Math.round((new Date(attack.end).getTime() - start.getTime()) / 60000)}m`
                                : "?";

                        return (
                            <div
                                key={attack._id}
                                onClick={() => handleOpenEditModal(attack)}
                                className={cn(
                                    "grid grid-cols-[1fr_auto_auto] gap-4 py-2 border-b border-zinc-800 last:border-0 text-sm cursor-pointer hover:bg-zinc-800/30 px-2 rounded-lg transition-colors",
                                    attack.isActive && "text-green-400"
                                )}
                            >
                                <span className="text-zinc-400">{timeStr}</span>
                                <span className="text-zinc-400 text-right">{duration}</span>
                                <span className={cn("text-right w-6", attack.isActive ? "text-green-500" : "text-white")}>
                                    {attack.isActive ? <Zap className="h-4 w-4 inline" /> : attack.intensity}
                                </span>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Medication FAB & Menu */}
            <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-40">
                {isMedMenuOpen && (
                    <div className="flex flex-col gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <Button variant="ghost" className="justify-start w-32" onClick={() => { setSelectedMedType("ibuprofen"); setIsMedModalOpen(true); }}>Ibuprofen</Button>
                        <Button variant="ghost" className="justify-start w-32" onClick={() => { setSelectedMedType("indomethacin"); setIsMedModalOpen(true); }}>Indomethacin</Button>
                        <Button variant="ghost" className="justify-start w-32" onClick={() => { setSelectedMedType("custom"); setIsMedModalOpen(true); }}>Custom</Button>
                    </div>
                )}
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setIsMedMenuOpen(!isMedMenuOpen)}
                >
                    <Pill className="h-6 w-6" />
                </Button>
            </div>

            {/* Medication Dialog */}
            <Dialog open={isMedModalOpen} onOpenChange={setIsMedModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Medication</DialogTitle>
                        <DialogDescription>Select dosage or enter custom amount</DialogDescription>
                    </DialogHeader>

                    {selectedMedType === "ibuprofen" && (
                        <div className="grid grid-cols-3 gap-2 py-4">
                            {[200, 400, 600, 800, 1000, 1200].map(mg => (
                                <Button key={mg} variant="secondary" onClick={() => handleLogMedication("Ibuprofen", mg)}>{mg}mg</Button>
                            ))}
                        </div>
                    )}

                    {selectedMedType === "indomethacin" && (
                        <div className="grid grid-cols-3 gap-2 py-4">
                            {[25, 50, 75, 100].map(mg => (
                                <Button key={mg} variant="secondary" onClick={() => handleLogMedication("Indomethacin", mg)}>{mg}mg</Button>
                            ))}
                        </div>
                    )}

                    {selectedMedType === "custom" && (
                        <div className="flex gap-2 py-4">
                            <Input placeholder="Dosage (mg)" type="number" id="custom-dosage" />
                            <Button onClick={() => {
                                const val = (document.getElementById("custom-dosage") as HTMLInputElement).value;
                                if (val) handleLogMedication("Custom", parseInt(val));
                            }}>Log</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Retroactive Attack Dialog */}
            <Dialog open={isRetroModalOpen} onOpenChange={setIsRetroModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editingAttackId ? "Edit Attack" : "Add Past Event"}</DialogTitle>
                        <DialogDescription>Manually enter attack details</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Start Time</label>
                            <Input
                                type="datetime-local"
                                className="bg-zinc-800 border-zinc-700"
                                value={retroStart}
                                onChange={(e) => setRetroStart(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">End Time</label>
                            <Input
                                type="datetime-local"
                                className="bg-zinc-800 border-zinc-700"
                                value={retroEnd}
                                onChange={(e) => setRetroEnd(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Intensity (1-10)</label>
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                className="bg-zinc-800 border-zinc-700"
                                value={retroIntensity}
                                onChange={(e) => setRetroIntensity(parseInt(e.target.value) || "")}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Notes</label>
                            <Input
                                placeholder="Optional notes"
                                className="bg-zinc-800 border-zinc-700"
                                value={retroNotes}
                                onChange={(e) => setRetroNotes(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleSaveRetroAttack}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Record"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </main>
    );
}
