"use client"

import * as React from "react"
import {
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ButtonGroup } from "@/components/ui/button-group"

export function SettingsDialog() {
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonGroup
          orientation="vertical"
          aria-label="Zoom controls"
          className="top-1 left-1 z-1000 h-fit static">
          <Button
            size="icon-sm"
            variant="secondary"
            className="border"
          >
            <User />
          </Button>
        </ButtonGroup>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <main className="flex h-[480px] flex-1 flex-col overflow-hidden p-4 py-8">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 aspect-video max-w-3xl rounded-xl"
              />
            ))}
          </div>
        </main>
      </DialogContent>
    </Dialog>
  )
}
