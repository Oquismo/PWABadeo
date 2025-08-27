import { NextResponse } from 'next/server';
import { testEmailConnection, sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { action, email } = await req.json();

    if (action === 'test-connection') {
      // Probar conexión SMTP
      const isConnected = await testEmailConnection();
      
      return NextResponse.json({
        success: isConnected,
        message: isConnected 
          ? 'Conexión de email exitosa ✅' 
          : 'Error en conexión de email ❌'
      });
    }

    if (action === 'send-test' && email) {
      // Enviar email de prueba
      try {
        const result = await sendPasswordResetEmail(email, 'test-token-123456789');
        
        return NextResponse.json({
          success: true,
          message: `Email de prueba enviado a ${email} ✅`,
          messageId: result.messageId
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: `Error enviando email: ${error instanceof Error ? error.message : 'Unknown error'}`
        }, { status: 500 });
      }
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in email test:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
