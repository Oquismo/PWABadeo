import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;
  const userData = request.cookies.get('user')?.value;

  return NextResponse.json({
    message: 'Debug de cookies',
    cookies: {
      authToken: authToken ? {
        exists: true,
        length: authToken.length,
        preview: authToken.substring(0, 30) + '...',
        full: authToken
      } : { exists: false },
      user: userData ? {
        exists: true,
        length: userData.length,
        preview: userData.substring(0, 50) + '...',
        parsed: JSON.parse(userData)
      } : { exists: false }
    },
    allCookies: Object.fromEntries(
      Array.from(request.cookies.getAll()).map(cookie => [cookie.name, cookie.value])
    )
  });
}
