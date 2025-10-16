import React from 'react'

const APIStartCell = ({ apiStartKey }: { apiStartKey: string | null }) => {
    const display = `${apiStartKey || "?"}••••••••`;
    return (
        <code className="font-mono bg-muted px-2 py-1 rounded text-sm text-muted-foreground whitespace-nowrap">
            {display}
        </code>
    );
}

export default APIStartCell