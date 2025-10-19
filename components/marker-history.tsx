"use client"

import { LatLngExpression } from 'leaflet'
import React from 'react'
import { MapMarker } from './ui/map'
import { useQuery } from '@tanstack/react-query';
import { getDeviceHistory } from '@/app/dashboard/functions';

const MarkerHistory = ({ apiKeyId }: { apiKeyId: string }) => {
    const query = useQuery({
        queryKey: ['device-history', apiKeyId],
        queryFn: () => getDeviceHistory({ apiKeyId }),
        staleTime: 1000 * 60,
        refetchInterval: 1000 * 15,
    });

    return (
        <>
            {query.data?.map((r) => (
                <MapMarker
                    key={`${r.latitude},${r.longitude},${r.createdAt ?? ''}`}
                    position={[r.latitude, r.longitude] as LatLngExpression}
                />
            ))}
        </>
    )
}

export default MarkerHistory