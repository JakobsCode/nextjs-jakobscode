import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const apiKey = request.headers.get('x-api-key');
    const result = await auth.api.verifyApiKey({
      body: {
        key: apiKey || '',
        permissions: {
          devices: ["send"],
        },
      },
    });
    if (result.valid) {
      console.log('API key is valid and has required permissions');
    } else {
      console.log('API key is invalid or doesn\'t have the required permissions');
    }
    console.log('POST data:', data)
    return NextResponse.json({ message: 'Daten empfangen', received: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ungültige Anfrage' },
      { status: 400 }
    )
  }
}
