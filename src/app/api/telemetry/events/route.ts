import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/telemetryStore';

export async function GET() {
  try {
    const events = getEvents();
    return NextResponse.json(events, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error getting telemetry events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}