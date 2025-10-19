'use server'

import { auth, db } from "@/lib/auth";
import { z } from 'zod'
import { SerializableTrackerReading, TrackerReadingDb } from "../api/device/types";
import { headers } from "next/headers";

const DeviceHistorySchema = z.object({ apiKeyId: z.string() });

export async function getDeviceHistory(formData: unknown): Promise<SerializableTrackerReading[]> {
    const sessionData = await auth.api.getSession({
        headers: await headers()
    })

    if (!sessionData) {
        throw new Error('Unauthorized');
    }

    const { data, success } = DeviceHistorySchema.safeParse(formData);
    if (!success) throw new Error('Invalid Parameter');

    const apiKeyId = data.apiKeyId;
    const apiKeyData = await auth.api.getApiKey({
        query: {
            id: apiKeyId,
        },
        headers: await headers(),
    });

    if (sessionData.user.id !== apiKeyData?.userId) {
        throw new Error('Unauthorized');
    }

    const collection = db.collection<TrackerReadingDb>("tracker_readings");

    const docs = await collection
        .find({ apiKeyId })
        .sort({ createdAt: -1, _id: -1 })
        .limit(500)
        .toArray();

    const serializedDocs: SerializableTrackerReading[] = docs.map(doc => ({
        ...doc,
        _id: doc._id.toString(),             // Convert ObjectId to hex string
        createdAt: doc.createdAt.toISOString() // Convert Date to ISO string
    }));

    return serializedDocs;
}
