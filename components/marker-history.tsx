"use client"

import { LatLngExpression } from 'leaflet'
import React from 'react'
import { MapCircleMarker, MapMarker, MapPolyline, MapPopup } from './ui/map'
import { useQuery } from '@tanstack/react-query';
import { getDeviceHistory } from '@/app/dashboard/functions';
import TrackerPopup from './tracker-popup';

function MapLocatePulseIcon() {
    return (
        <div className="absolute -top-1 -right-1 flex size-4 rounded-full">
            <div className="bg-blue-500 absolute inline-flex size-full animate-ping rounded-full opacity-75" />
            <div className="bg-blue-500 relative inline-flex size-4 rounded-full" />
        </div>
    )
}

const MarkerHistory = ({ apiKeyId }: { apiKeyId: string }) => {
    const { data = [] } = useQuery({
        queryKey: ['device-history', apiKeyId],
        queryFn: () => getDeviceHistory({ apiKeyId }),
        staleTime: 1000 * 60,
        refetchInterval: 1000 * 15,
    });

    const latest = data[0];
    const history = data.slice(1);
    const positions = history.map(r => [r.latitude, r.longitude] as LatLngExpression);

    return (
        <>
            {latest && (
                <MapMarker
                    key={`latest-${latest.latitude}-${latest.longitude}-${latest.createdAt ?? ''}`}
                    position={[latest.latitude, latest.longitude] as LatLngExpression}
                    icon={<MapLocatePulseIcon />}
                ><MapPopup><TrackerPopup reading={latest} /></MapPopup></MapMarker>
            )}
            {history.map((r) => (
                <MapCircleMarker
                    key={`${r.latitude},${r.longitude},${r.createdAt ?? ""}`}
                    center={[r.latitude, r.longitude] as LatLngExpression}
                    radius={5}
                    pathOptions={{
                        color: "#1e90ff",
                        fillColor: "#1e90ff",
                        opacity: 0.35, // Linie transparenter
                        fillOpacity: 0.2, // Fläche transparenter
                        weight: 2,
                        fill: false,
                    }}
                ><MapPopup><TrackerPopup reading={r} /></MapPopup></MapCircleMarker>
            ))}
            {positions.length > 1 && (
                <MapPolyline
                    positions={positions}
                    pathOptions={{
                        color: "#7a7f85",
                        opacity: 0.5,
                        weight: 2,
                        dashArray: "8 6",
                    }}
                />
            )}
        </>
    )
}

export default MarkerHistory