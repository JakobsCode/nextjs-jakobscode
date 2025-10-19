"use client"

import React from 'react'
import MarkerHistory from './marker-history';
import { useApiKeys } from '@/lib/hooks';

const DeviceMarker = () => {
    const { data = [] } = useApiKeys();

    return (
        <>
            {data?.map((apiKeyData) => (
                <MarkerHistory
                    key={apiKeyData.id}
                    apiKeyId={apiKeyData.id}
                />
            ))}
        </>
    )
}

export default DeviceMarker