"use client"

import { LatLngExpression } from 'leaflet'
import React from 'react'
import { MapCircleMarker, MapMarker } from './ui/map'
import { useQuery } from '@tanstack/react-query';
import { getDeviceHistory } from '@/app/dashboard/functions';

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

    return (
        <>
            {latest && (
                <MapMarker
                    key={`latest-${latest.latitude}-${latest.longitude}-${latest.createdAt ?? ''}`}
                    position={[latest.latitude, latest.longitude] as LatLngExpression}
                    icon={<MapLocatePulseIcon />}
                />
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
                    }}
                />
            ))}
        </>
    )
}

export default MarkerHistory