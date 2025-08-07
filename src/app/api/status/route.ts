import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'API funcionando correctamente',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        VERCEL: !!process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Error en endpoint de status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
