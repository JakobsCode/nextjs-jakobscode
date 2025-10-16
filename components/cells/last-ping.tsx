import React from 'react'
import { Badge } from '../ui/badge'

const LastPingCell = ({ lastRequest }: { lastRequest: Date | null }) => {
    const last = lastRequest ? new Date(lastRequest) : null

    if (!last) {
        return <Badge variant="secondary">Never</Badge>
    }

    const diffMs = Date.now() - last.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHrs = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHrs / 24)

    // --- Label berechnen ---
    let label: string
    if (diffSec < 60) {
        label = `${diffSec}s`
    } else if (diffMin < 60) {
        label = `${diffMin} min`
    } else if (diffHrs < 24) {
        label = `${diffHrs} h`
    } else {
        label = `${diffDays} d`
    }

    // --- Farbe berechnen ---
    let color:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning" = "default"

    if (diffMin < 5) color = "success"
    else if (diffMin < 30) color = "warning"
    else if (diffHrs < 24) color = "destructive"
    else color = "secondary"

    return (
        <Badge
            variant={color}
            className="font-mono text-xs px-2 py-0.5"
            title={last.toLocaleString()}
        >
            {label}
        </Badge>
    )
}

export default LastPingCell