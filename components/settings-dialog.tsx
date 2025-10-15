"use client"

import * as React from "react"
import {
  User,
} from "lucide-react"
import { IconDeviceAirtag } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
              <Button>Add Device</Button>
            </EmptyContent>
          </Empty>
        </main>
      </DialogContent>
    </Dialog>
  )
}
