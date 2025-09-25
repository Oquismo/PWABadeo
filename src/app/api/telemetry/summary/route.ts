import { NextResponse } from 'next/server';
import { getSummary } from '@/lib/telemetryStore';

export async function GET() {
  try {
    const summary = getSummary();
    return NextResponse.json(summary, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error getting telemetry summary:', error);
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