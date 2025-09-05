import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🍪 Cookie Test - Headers:', request.headers.get('cookie'));
    console.log('🍪 Cookie Test - All Cookies:', request.cookies.getAll());
    
    // Crear una cookie de prueba
    const response = NextResponse.json({
      message: 'Cookie test endpoint',
      receivedCookies: request.cookies.getAll(),
      rawCookieHeader: request.headers.get('cookie')
    });

    // Establecer una cookie de prueba
    response.cookies.set('test-cookie', 'test-value', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5 // 5 minutos
    });

    console.log('🍪 Cookie Test - Set test cookie');
    
    return response;
    
  } catch (error) {
    console.error('❌ Cookie Test Error:', error);
    return NextResponse.json({
      error: 'Cookie test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('🍪 Cookie Test GET - Headers:', request.headers.get('cookie'));
  console.log('🍪 Cookie Test GET - All Cookies:', request.cookies.getAll());
  
  return NextResponse.json({
    message: 'Cookie test GET endpoint',
    receivedCookies: request.cookies.getAll(),
    rawCookieHeader: request.headers.get('cookie')
  });
}
