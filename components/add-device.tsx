"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { authClient } from "@/lib/auth-client"
import { AlertCircleIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
    name: z.string().min(2, "Device name must be at least 2 characters.").max(100, "Device name must be at most 100 characters."),
})

export function AddDevice({ variant }: { variant?: "default" | "secondary" }) {
    const [open, setOpen] = React.useState(false)
    const [apiKey, setApiKey] = React.useState<string | null>(null)
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const { data: apiKeyData, error } = await authClient.apiKey.create({
            name: data.name,
            expiresIn: null,
        });
        console.log({ apiKeyData, error });
        if (apiKeyData) {
            setApiKey(apiKeyData.key);
            form.reset({ name: "" });
            queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(value) => {
            if (value) setApiKey(null);
            setOpen(value);
        }}>
            <DialogTrigger asChild>
                <Button variant={variant}>
                    Add Device
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Set up your device</DialogTitle>
                        <DialogDescription>
                            Create a new device to start tracking it.
                        </DialogDescription>
                    </DialogHeader>
                    <main className="py-3">
                        {apiKey ? (
                            <div className="grid gap-2">
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertTitle>Do not share the API Key.</AlertTitle>
                                    <AlertDescription>
                                        <p>You can only see this once, so make sure you copy it!</p>
                                    </AlertDescription>
                                </Alert>
                                <code className="font-mono bg-muted px-2 py-1 rounded text-sm text-muted-foreground break-all">
                                    {apiKey}
                                </code>
                            </div>
                        ) : (
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Device Name</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="GPS Tracker"
                                            autoComplete="off"
                                        />
                                        <FieldDescription>
                                            Provide a concise title for your device.
                                        </FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        )}
                    </main>
                    <DialogFooter>
                        {apiKey ? (
                            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Done</Button>
                        ) : (
                            <Button type="submit" loading={form.formState.isSubmitting}>Confirm</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
