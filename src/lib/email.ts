import nodemailer from 'nodemailer';
import loggerClient from '@/lib/loggerClient';

// Configuración del transportador de email
const createTransporter = () => {
  loggerClient.info('🔧 Configurando transportador de email:', {
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'not set',
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || '587'
  });

  // Configuración para Gmail (puedes cambiar por otro proveedor)
  if (process.env.EMAIL_PROVIDER === 'gmail') {
    loggerClient.info('📧 Usando configuración Gmail');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // tu email de Gmail
        pass: process.env.EMAIL_PASSWORD, // tu App Password de Gmail
      },
    });
  }

  // Configuración para otros proveedores SMTP
  loggerClient.info('📧 Usando configuración SMTP genérica');
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    loggerClient.info('📧 Iniciando envío de email de recuperación:', {
      to: email,
      hasToken: !!resetToken,
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
      EMAIL_USER: process.env.EMAIL_USER ? '***@gmail.com' : 'NOT SET',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET'
    });

    const transporter = createTransporter();
    
    // Determinar la URL base correcta
    let baseUrl;
    if (process.env.NODE_ENV === 'production') {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://pwa-badeo.vercel.app';
    } else {
      baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }
    
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
  loggerClient.debug('🔗 URL de reset generada:', resetUrl);
  loggerClient.debug('🌍 Entorno:', process.env.NODE_ENV);
  loggerClient.debug('🌍 Base URL:', baseUrl);
    
    const mailOptions = {
      from: {
        name: 'Badeo - Barrio de Oportunidades',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@badeo.com'
      },
      to: email,
      subject: '🔐 Recuperación de contraseña - Badeo',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de contraseña</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { background: white; padding: 40px; border: 1px solid #ddd; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%); }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .security-info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏘️ Badeo</div>
            <div>Barrio de Oportunidades</div>
          </div>
          
          <div class="content">
            <h2>🔐 Recuperación de contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Badeo</strong>.</p>
            
            <div class="security-info">
              <strong>🛡️ Información de seguridad:</strong><br>
              Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.
            </div>
            
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">🔄 Restablecer contraseña</a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong><br>
              • Este enlace expirará en <strong>1 hora</strong><br>
              • Solo puede ser usado una vez<br>
              • Si el enlace ha expirado, solicita uno nuevo desde la página de login
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <h3>🔒 Consejos de seguridad</h3>
            <ul>
              <li>Usa una contraseña fuerte con al menos 8 caracteres</li>
              <li>Incluye letras mayúsculas, minúsculas, números y símbolos</li>
              <li>No compartas tu contraseña con nadie</li>
              <li>Considera usar un administrador de contraseñas</li>
            </ul>
            
            <p>Si tienes problemas para acceder a tu cuenta, no dudes en contactarnos.</p>
            
            <p>Saludos cordiales,<br>
            <strong>El equipo de Badeo</strong> 🏘️</p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado desde <strong>Badeo - Barrio de Oportunidades</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            <p style="margin-top: 15px;">
              🌐 <a href="${baseUrl}" style="color: #667eea;">Visitar Badeo</a> | 
              📧 <a href="mailto:soporte@badeo.com" style="color: #667eea;">Contactar soporte</a>
            </p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    loggerClient.info('✅ Email de recuperación enviado:', {
      messageId: result.messageId,
      to: email,
      subject: mailOptions.subject
    });
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email de recuperación enviado correctamente'
    };
    
  } catch (error) {
  loggerClient.error('❌ Error enviando email de recuperación:', error);
    
    // Información más detallada del error para debugging
    if (error instanceof Error) {
      loggerClient.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al enviar el email de recuperación'
    };
  }
}

// Función para testear la configuración de email
export async function testEmailConnection() {
  try {
    const transporter = createTransporter();
    
    // Verificar la conexión
    await transporter.verify();
    
  loggerClient.info('✅ Conexión de email configurada correctamente');
    return {
      success: true,
      message: 'Conexión de email configurada correctamente'
    };
    
  } catch (error) {
  loggerClient.error('❌ Error en la configuración de email:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error en la configuración de email'
    };
  }
}

// Función para enviar email de prueba
export async function sendTestEmail(toEmail: string) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Badeo - Test',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@badeo.com'
      },
      to: toEmail,
      subject: '✅ Email de prueba - Badeo',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { background: white; padding: 40px; border: 1px solid #ddd; margin-top: 20px; border-radius: 10px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏘️ Badeo - Email Test</h1>
            <p>Barrio de Oportunidades</p>
          </div>
          
          <div class="content">
            <div class="success">
              <strong>✅ ¡Configuración exitosa!</strong><br>
              Tu sistema de email está funcionando correctamente.
            </div>
            
            <h2>📧 Información del test</h2>
            <ul>
              <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
              <li><strong>Servidor:</strong> ${process.env.EMAIL_HOST || 'Gmail'}</li>
              <li><strong>Usuario:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>Destinatario:</strong> ${toEmail}</li>
            </ul>
            
            <p>Tu sistema de recuperación de contraseñas está listo para funcionar.</p>
            
            <p>Saludos,<br><strong>El equipo de Badeo</strong> 🏘️</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    loggerClient.info('✅ Email de prueba enviado:', {
      messageId: result.messageId,
      to: toEmail,
      subject: mailOptions.subject
    });
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email de prueba enviado correctamente'
    };
    
  } catch (error) {
  loggerClient.error('❌ Error enviando email de prueba:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al enviar el email de prueba'
    };
  }
}
