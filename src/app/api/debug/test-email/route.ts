import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    console.log(`🧪 Enviando email de prueba a: ${email}`);

    // Verificar variables de entorno críticas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Variables de entorno de email no configuradas',
        missing: {
          EMAIL_USER: !process.env.EMAIL_USER,
          EMAIL_PASSWORD: !process.env.EMAIL_PASSWORD
        }
      }, { status: 500 });
    }

    const result = await sendTestEmail(email);

    if (result.success) {
      console.log(`✅ Email de prueba enviado exitosamente a: ${email}`);
    } else {
      console.error(`❌ Error enviando email de prueba:`, result.error);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error en test-email:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al enviar email de prueba'
    }, { status: 500 });
  }
}
