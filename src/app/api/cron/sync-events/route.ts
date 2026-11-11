import { NextResponse } from 'next/server';
import { syncTeamupEvents, SyncError } from '@/lib/teamup-sync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

// Token secreto para cron jobs
const CRON_SECRET = process.env.CRON_SECRET || process.env.ICS_SYNC_TOKEN;

function isAuthorized(request: Request): { authorized: boolean; method: string } {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.replace('Bearer ', '');
  const vercelSignature = request.headers.get('x-vercel-signature');
  const userData = request.headers.get('cookie')?.match(/user=([^;]+)/)?.[1];

  // 1. Vercel Cron sends x-vercel-signature header
  if (vercelSignature) {
    return { authorized: true, method: 'vercel-cron' };
  }

  // 2. Admin via cookie
  if (userData) {
    try {
      const user = JSON.parse(decodeURIComponent(userData));
      if (user.role === 'admin') {
        return { authorized: true, method: 'admin' };
      }
    } catch {
      // Invalid cookie
    }
  }

  // 3. Token in Authorization header or query param
  if (CRON_SECRET) {
    if (headerToken === CRON_SECRET || token === CRON_SECRET) {
      return { authorized: true, method: 'token' };
    }
  }

  return { authorized: false, method: 'none' };
}

export async function GET(request: Request) {
  try {
    const auth = isAuthorized(request);

    if (!auth.authorized) {
      return NextResponse.json({
        error: 'No autorizado',
        hint: 'Configura CRON_SECRET como variable de entorno para Vercel Cron'
      }, { status: 401 });
    }

    console.log(`[cron-sync] Authorized via ${auth.method}`);
    const results = await syncTeamupEvents((m) => console.log(m));

    return NextResponse.json({
      success: true,
      message: 'Sync completed - mirror mode',
      method: auth.method,
      results,
    });
  } catch (error) {
    console.error('[cron-sync] Error:', error);
    if (error instanceof SyncError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Error interno', details: String(error) }, { status: 500 });
  }
}
