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
import DeviceList from "./device-list"
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
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <DeviceList />
      </DialogContent>
    </Dialog>
  )
}
