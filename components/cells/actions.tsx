import React, { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { Button } from '../ui/button'
import { MoreHorizontal } from 'lucide-react'
import { Spinner } from '../ui/spinner'

const APIActionsCell = ({ id }: { id: string }) => {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = React.useTransition()
    const queryClient = useQueryClient()
    async function deleteKey() {
        const { error } = await authClient.apiKey.delete({
            keyId: id,
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
                        onClick={() => navigator.clipboard.writeText(id)}
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
}

export default APIActionsCell