import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ApiKey = {
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