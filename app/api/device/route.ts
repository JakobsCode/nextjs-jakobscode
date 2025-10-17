import { auth, db } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server'
import { TrackerReadingDb, TrackerReadingSchema } from './types';

export async function POST(request: NextRequest) {
  try {
    // 1) API Key prüfen
    const apiKey = request.headers.get("x-api-key")?.trim() ?? "";
    const verify = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
        permissions: { devices: ["send"] },
      },
    });

    if (!verify.valid) {
      return NextResponse.json({ error: "Invalid API KEY" }, { status: 403 });
    }

    // 2) JSON lesen
    const json = await request.json();

    // 3) Zod-Validierung (liefert klare Fehler zurück)
    const parsed = TrackerReadingSchema.safeParse(json);
    if (!parsed.success) {
      // optional kompakt machen: parsed.error.flatten()
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.issues,
        },
        { status: 422 }
      );
    }

    const reading = parsed.data;

    // 4) In Mongo schreiben
    const collection = db.collection<Omit<TrackerReadingDb, "_id">>("tracker_readings");

    const doc: Omit<TrackerReadingDb, "_id"> = {
      ...reading,
      apiKeyId: (verify.key?.id as string) ?? "unknown",
      createdAt: new Date(),
    };

    const { insertedId } = await collection.insertOne(doc);

    return NextResponse.json({
      status: "ok",
      id: insertedId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
