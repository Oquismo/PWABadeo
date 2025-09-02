import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const headers = new Headers(request.headers);
  const isWarmup = headers.get('x-warmup') === 'true';
  
  try {
    const startTime = Date.now();
    
    // Ping optimizado a la base de datos
    await prisma.$queryRaw`SELECT 1 as health`;
    
    const dbLatency = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      dbLatency: `${dbLatency}ms`,
      warmup: isWarmup,
      environment: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || 'unknown'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      warmup: isWarmup
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
