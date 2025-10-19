import React from "react";
import type { SerializableTrackerReading } from "@/app/api/device/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Satellite,
    MapPin,
    Gauge,
    Clock,
    BatteryFull,
    Sun,
    Navigation,
} from "lucide-react";
import Link from "next/link";

// --- Utils ---------------------------------------------------------------
const round = (n: number, d = 1) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
const knotsToKmh = (kn: number) => kn * 1.852;

const estimateBatteryPct = (mv: number) => {
    const min = 2500,
        max = 4200;
    const pct = ((mv - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, pct));
};

const dopQuality = (dop: number) => {
    if (dop <= 1) return { label: "ideal", className: "bg-green-600 text-white" };
    if (dop <= 2) return { label: "exzellent", className: "bg-green-500 text-white" };
    if (dop <= 5) return { label: "gut", className: "bg-emerald-500 text-white" };
    if (dop <= 10) return { label: "mittel", className: "bg-amber-500 text-black" };
    if (dop <= 20) return { label: "mäßig", className: "bg-orange-500 text-black" };
    return { label: "schlecht", className: "bg-red-600 text-white" };
};

const fixLabel = (fix: SerializableTrackerReading["isFix"]) =>
    fix === 3
        ? { text: "3D-Fix", className: "bg-green-600 text-white" }
        : fix === 2
            ? { text: "2D-Fix", className: "bg-amber-600 text-white" }
            : { text: "Kein Fix", className: "bg-red-700 text-white" };

const ageFromNow = (d: Date) => {
    const diff = Date.now() - d.getTime();
    const s = Math.max(0, Math.floor(diff / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
};

// --- Small UI bits -------------------------------------------------------
const Stat: React.FC<{
    label: string;
    value: React.ReactNode;
    icon: React.ReactNode;
}> = ({ label, value, icon }) => (
    <div className="flex items-start gap-2">
        <div className="mt-0.5 h-4 w-4 shrink-0 opacity-80">{icon}</div>
        <div className="flex justify-center items-start flex-col gap-0.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="truncate text-sm font-medium leading-tight">{value}</div>
        </div>
    </div>
);

// --- Main component ------------------------------------------------------
const TrackerPopupContent: React.FC<{ reading: SerializableTrackerReading }> = ({ reading }) => {
    const r = reading;
    const created = new Date(reading.createdAt);

    const fix = fixLabel(r.isFix);
    const kmh = knotsToKmh(r.speed);
    const battPct = estimateBatteryPct(r.batt_mv - 284);

    return (
        <TooltipProvider>
            <Card className="min-w-[300px] shadow-none blur-none border-0">
                <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                        <div className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/20">
                            <Link target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${r.latitude}%2C${r.longitude}`}><Satellite className="h-4 w-4 text-primary" /></Link>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-0">
                            <div className="truncate text-sm font-semibold">Tracker</div>
                            <div className="flex items-center justify-center flex-col gap-0 text-[11px] text-muted-foreground">
                                <span>
                                    {created.toLocaleString("de-DE")}
                                </span>
                                <span className="text-muted-foreground/70">(vor {ageFromNow(created)})</span>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge className={fix.className}>{fix.text}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>GNSS-Fix-Status</TooltipContent>
                        </Tooltip>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Position */}
                    <section>
                        <div className="grid grid-cols-2 gap-3">
                            <Stat
                                label="Breite (lat)"
                                value={`${round(r.latitude, 6)}° ${r.NS_indicator}`}
                                icon={<Navigation className="h-4 w-4" />}
                            />
                            <Stat
                                label="Länge (lon)"
                                value={`${round(r.longitude, 6)}° ${r.EW_indicator}`}
                                icon={<Navigation className="h-4 w-4 rotate-90" />}
                            />
                            <Stat label="Höhe" value={`${Math.round(r.altitude)} m`} icon={<Gauge className="h-4 w-4" />} />
                            <Stat label="Geschwindigkeit" value={`${round(kmh, 1)} km/h`} icon={<Gauge className="h-4 w-4" />} />
                        </div>
                    </section>

                    <Separator />

                    {/* GNSS */}
                    <section className="rounded-xl border bg-muted/30 p-3">
                        <div className="mb-2 flex items-center gap-2">
                            <Satellite className="h-4 w-4 opacity-80" />
                            <h3 className="text-[12px] font-semibold">GNSS</h3>
                            <span className="font-base tabular-nums">(GPS {r.gps_satellite_num})</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {([
                                ["PDOP", r.PDOP],
                                ["HDOP", r.HDOP],
                                ["VDOP", r.VDOP],
                            ] as const).map(([k, v]) => {
                                const q = dopQuality(v);
                                return (
                                    <div key={k} className="flex flex-col items-center gap-1">
                                        <div className="uppercase tracking-wide text-muted-foreground">{k}</div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge className={q.className}>{q.label}</Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>{round(v, 1)}</TooltipContent>
                                        </Tooltip>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Versorgung */}
                    <section className="rounded-xl border bg-muted/30 p-3">
                        <div className="mb-2 flex items-center gap-2">
                            <BatteryFull className="h-4 w-4 opacity-80" />
                            <h3 className="text-[12px] font-semibold">Versorgung</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Battery */}
                            <div>
                                <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                                    <span>Batterie</span>
                                    <span className="text-foreground/70">{Math.round(battPct)}%</span>
                                </div>
                                <Progress value={battPct} />
                                <div className="mt-1 text-[11px] text-muted-foreground">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-help">{Math.round(r.batt_mv - 284)} mV</span>
                                        </TooltipTrigger>
                                        <TooltipContent>Spannung an Batterie</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Solar */}
                            <div>
                                <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                                    <Sun className="h-3.5 w-3.5" /> <span>Solar</span>
                                </div>
                                <div className="text-sm font-medium tabular-nums">{Math.round(r.solar_mv - 284)} mV</div>
                                <div className="text-[11px] text-muted-foreground">Eingangsspannung</div>
                            </div>
                        </div>
                    </section>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
};

export default TrackerPopupContent;
