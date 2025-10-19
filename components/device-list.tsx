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
import { IconDeviceAirtag, IconAlertTriangle } from "@tabler/icons-react"
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
import { Spinner } from "./ui/spinner"
import APIStartCell from "./cells/api-start"
import LastPingCell from "./cells/last-ping"
import { ApiKey } from "@/lib/utils"
import APIActionsCell from "./cells/actions"
import { useApiKeys } from "@/lib/hooks"

const columns: ColumnDef<ApiKey>[] = [
    { accessorKey: "name", header: "Name" },
    {
        accessorKey: "start",
        header: "API Key",
        cell: ({ row }) => {
            return <APIStartCell apiStartKey={row.original.start} />;
        },
    },
    {
        accessorKey: "lastRequest",
        header: "Last Ping",
        cell: ({ row }) => {
            return <LastPingCell lastRequest={row.original.lastRequest} />
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return <APIActionsCell id={row.original.id} />
        },
    },
]

const DeviceList = () => {
    const {
        data = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useApiKeys();

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
