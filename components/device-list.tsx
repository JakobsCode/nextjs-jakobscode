"use client"

import React, { useState } from "react"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { AddDevice } from "./add-device"
import { IconDeviceAirtag, IconLoader2, IconAlertTriangle } from "@tabler/icons-react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { authClient } from "@/lib/auth-client"
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"
import { Spinner } from "./ui/spinner"

import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ApiKey = {
    id: string
    name: string | null
    start: string | null
    prefix: string | null
    userId: string
    refillInterval: number | null
    refillAmount: number | null
    lastRefillAt: Date | null
    enabled: boolean
    rateLimitEnabled: boolean
    rateLimitTimeWindow: number | null
    rateLimitMax: number | null
    requestCount: number
    remaining: number | null
    lastRequest: Date | null
    expiresAt: Date | null
    createdAt: Date
    updatedAt: Date
    metadata: Record<string, any> | null
}

// Ideen: Akkustand, Laden/Nichtladen, Standort Meter Entfernung von GPS 

const columns: ColumnDef<ApiKey>[] = [
    { accessorKey: "name", header: "Name" },
    {
        accessorKey: "start",
        header: "API Key",
        cell: ({ row }) => {
            const apiKey = row.original;
            const display = `${apiKey.start}••••••••`;
            return (
                <code className="font-mono bg-muted px-2 py-1 rounded text-sm text-muted-foreground whitespace-nowrap">
                    {display}
                </code>
            );
        },
    },
    {
        accessorKey: "lastRequest",
        header: "Last Ping",
        cell: ({ row }) => {
            const apiKey = row.original
            const last = apiKey.lastRequest ? new Date(apiKey.lastRequest) : null

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
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const apiKey = row.original
            const [open, setOpen] = useState(false)
            const [isPending, startTransition] = React.useTransition()
            const queryClient = useQueryClient()
            async function deleteKey() {
                const { error } = await authClient.apiKey.delete({
                    keyId: apiKey.id,
                })
                if (error) {
                    console.error("Fehler beim Löschen:", error)
                }
                queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
                setOpen(false)
            }
            return (
                <>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(apiKey.id)}
                            >
                                Copy device ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={() => setOpen(true)}>Delete device</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the device.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive" disabled={isPending}
                                    onClick={() => startTransition(deleteKey)}>{isPending && <Spinner />}Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )
        },
    },
]

// API-Call als separate Funktion
async function fetchApiKeys(): Promise<ApiKey[]> {
    const { data, error } = await authClient.apiKey.list()
    if (error) throw new Error(error.message ?? "Fehler beim Laden der API-Keys")
    return data
}

const DeviceList = () => {
    const {
        data = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery<ApiKey[]>({
        queryKey: ["apiKeys"],
        queryFn: fetchApiKeys,
        staleTime: 1000 * 60, // 1 Minute Cache
    })

    const [sorting, setSorting] = useState<SortingState>([
        { id: "lastRequest", desc: true },
    ])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    })

    // Ladezustand
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 h-64">
                <Spinner className="size-5" />
                <span className="text-base">Lade API-Keys …</span>
            </div>
        )
    }

    // Fehlerzustand
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <IconAlertTriangle className="h-6 w-6 text-red-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                    Fehler beim Laden: {(error as Error).message}
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-2 rounded-md border px-3 py-1 text-sm hover:bg-accent"
                >
                    Erneut versuchen
                </button>
            </div>
        )
    }

    // Tabellenansicht
    return (
        table.getRowModel().rows?.length ? (
            <div className="grid gap-2 overflow-y-auto p-2 pt-10">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody >
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                        }
                    </TableBody>
                </Table>
                <div className="flex justify-end">
                    <AddDevice variant="secondary" />
                </div>
            </div>
        ) : (
            <div>
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <IconDeviceAirtag />
                        </EmptyMedia>
                        <EmptyTitle>No Devices Yet</EmptyTitle>
                        <EmptyDescription>
                            You haven&apos;t added any devices yet. Get started by setting up
                            your first device.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <AddDevice />
                    </EmptyContent>
                </Empty>
            </div>
        )
    )
}

export default DeviceList
