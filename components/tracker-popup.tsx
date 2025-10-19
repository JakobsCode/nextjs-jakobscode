import React from "react";
import { Progress } from "@/components/ui/progress"
import { SerializableTrackerReading } from "@/app/api/device/types";
import { Badge } from "./ui/badge";

const round = (n: number, d = 1) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);

const knotsToKmh = (kn: number) => kn * 1.852;

const estimateBatteryPct = (mv: number) => {
    const min = 2500, max = 4200;
    const pct = ((mv - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, pct));
};

const dopQuality = (dop: number) => {
    if (dop <= 1) return { label: "ideal", color: "bg-green-600" };
    if (dop <= 2) return { label: "exzellent", color: "bg-green-500" };
    if (dop <= 5) return { label: "gut", color: "bg-emerald-500" };
    if (dop <= 10) return { label: "mittel", color: "bg-amber-500" };
    if (dop <= 20) return { label: "mäßig", color: "bg-orange-500" };
    return { label: "schlecht", color: "bg-red-600" };
};

const fixLabel = (fix: SerializableTrackerReading["isFix"]) => (
    fix === 3 ? { text: "3D-Fix", color: "bg-green-600" } :
        fix === 2 ? { text: "2D-Fix", color: "bg-amber-600" } :
            { text: "Kein Fix", color: "bg-red-700" }
);

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

const Stat: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
        <div className="text-sm font-medium text-zinc-800">{value}</div>
    </div>
);

const TrackerPopupContent = ({ reading }: { reading: SerializableTrackerReading }) => {
    const r = reading;
    const created = new Date(reading.createdAt);

    const fix = fixLabel(r.isFix);
    const kmh = knotsToKmh(r.speed);
    const battPct = estimateBatteryPct(r.batt_mv - 284);

    return (
        <div className="min-w-[260px] max-w-[360px] select-text text-left text-zinc-800">
            {/* Kopf */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex min-w-0 flex-col">
                    <div className="truncate text-sm font-semibold">Tracker</div>
                    <div className="text-[11px] text-zinc-400">
                        {created.toLocaleString()} <span className="text-zinc-500">(vor {ageFromNow(created)})</span>
                    </div>
                </div>
                <Badge className={`${fix.color}`}>{fix.text}</Badge>
            </div>

            {/* Position */}
            <div className="mb-3 grid grid-cols-2 gap-3">
                <Stat
                    label="Breite (lat)"
                    value={`${round(r.latitude, 6)}° ${r.NS_indicator}`}
                />
                <Stat
                    label="Länge (lon)"
                    value={`${round(r.longitude, 6)}° ${r.EW_indicator}`}
                />
                <Stat label="Höhe" value={`${Math.round(r.altitude)} m`} />
                <Stat label="Geschwindigkeit" value={`${round(kmh, 1)} km/h`} />
            </div>

            {/* GNSS-Qualität */}
            <div className="mb-3 rounded-xl border border-zinc-300 bg-zinc-100/60 p-3">
                <div className="mb-2 text-[12px] font-semibold text-zinc-800">GNSS</div>
                <div className="grid grid-cols-3 gap-3">
                    {([['PDOP', r.PDOP], ['HDOP', r.HDOP], ['VDOP', r.VDOP]] as const).map(([k, v]) => {
                        const q = dopQuality(v);
                        return (
                            <div key={k} className="flex flex-col gap-1">
                                <div className="text-[11px] uppercase tracking-wide text-zinc-500">{k}</div>
                                <div className="flex items-center gap-2">
                                    <Badge className={q.color}>{q.label}</Badge>
                                    <span className="text-sm font-medium">{round(v, 1)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div>GPS: <span className="font-medium">{r.gps_satellite_num}</span></div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-300 bg-zinc-100/60 p-3">
                <div className="mb-2 text-[12px] font-semibold text-zinc-800">Versorgung</div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-500">
                            <span>Batterie</span>
                            <span className="text-zinc-400">{Math.round(battPct)}%</span>
                        </div>
                        <Progress value={battPct} />
                        <div className="mt-1 text-[11px] text-zinc-400">{Math.round(r.batt_mv)} mV</div>
                    </div>
                    <div>
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-500">Solar</div>
                        <div className="text-sm font-medium">{Math.round(r.solar_mv - 284)} mV</div>
                        <div className="text-[11px] text-zinc-400">Eingangsspannung (Panel)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackerPopupContent;
