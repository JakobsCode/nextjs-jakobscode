import { z } from 'zod'
import type { ObjectId } from 'mongodb'

export const TrackerReadingSchema = z.object({
  // GNSS
  isFix: z.union([z.literal(0), z.literal(2), z.literal(3)]), // 0 = kein Fix, 2 = 2D, 3 = 3D
  gps_satellite_num: z.number().int().min(0).max(65535),
  beidou_satellite_num: z.number().int().min(0).max(65535),
  glonass_satellite_num: z.number().int().min(0).max(65535),
  galileo_satellite_num: z.number().int().min(0).max(65535),

  latitude: z.number().min(-90).max(90),
  NS_indicator: z.enum(["N", "S"]),
  longitude: z.number().min(-180).max(180),
  EW_indicator: z.enum(["E", "W"]),

  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  second: z.number().int().min(0).max(59),

  altitude: z.number().gte(-1000).lte(20000), // Meter
  speed: z.number().min(0),                   // Knoten (kn)
  course: z.number().min(0).max(360),         // Grad

  PDOP: z.number().min(0),
  HDOP: z.number().min(0),
  VDOP: z.number().min(0),

  GSV: z.number().min(0), // Satelliten in Sicht (gesamt)
  GSU: z.number().min(0), // Satelliten genutzt (gesamt)

  // Versorgung
  batt_mv: z.number().int().min(0).max(100_000),  // mV
  solar_mv: z.number().int().min(0).max(100_000), // mV
});


export type TrackerReading = z.infer<typeof TrackerReadingSchema>

/**
 * Struktur in der Datenbank
 */
export type TrackerReadingDb = TrackerReading & {
  _id: ObjectId
  apiKeyId: string
  createdAt: Date
}
