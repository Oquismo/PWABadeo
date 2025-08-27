# 📧 Configuración de Email para Recuperación de Contraseñas

## 🎯 ¿Por qué no llega el email?

Actualmente, el sistema está configurado para mostrar el token en la **consola del servidor** durante el desarrollo. Para que lleguen emails reales, necesitas configurar las credenciales de email.

## 🔧 Configuración con Gmail

### Paso 1: Generar App Password de Gmail

1. Ve a tu **Cuenta de Google** → **Seguridad**
2. Activa la **Verificación en 2 pasos** (si no la tienes)
3. Busca **Contraseñas de aplicaciones**
4. Genera una nueva contraseña para "Otra aplicación personalizada"
5. Usa el nombre: "Badeo PWA"
6. Copia la contraseña generada (16 caracteres)

### Paso 2: Configurar Variables de Entorno

Edita el archivo `.env.local` con tus datos:

```bash
# --- Configuración de Email ---
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=tu_email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## 🌟 Otros Proveedores de Email

### SendGrid
```bash
EMAIL_PROVIDER=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=tu_api_key_de_sendgrid
```

### Outlook/Hotmail
```bash
EMAIL_PROVIDER=outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tu_email@outlook.com
EMAIL_PASSWORD=tu_contraseña
```

### SMTP Personalizado
```bash
EMAIL_PROVIDER=custom
EMAIL_HOST=tu.servidor.smtp.com
EMAIL_PORT=587
EMAIL_USER=tu_usuario
EMAIL_PASSWORD=tu_contraseña
EMAIL_SECURE=false
```

## 🚀 Cómo Probar

### 1. **Reinicia el servidor** después de configurar:
```bash
npm run dev
```

### 2. **Solicita recuperación de contraseña:**
- Ve a: `http://localhost:3000/forgot-password`
- Introduce un email válido registrado

### 3. **Verifica en logs del servidor:**
```
✅ Email enviado exitosamente: { messageId: '...', to: 'email@...', ... }
```

### 4. **Revisa tu bandeja de entrada** (y spam)

## 🔍 Solución de Problemas

### Error: "Invalid login credentials"
- ✅ Verifica que uses **App Password** (no tu contraseña normal)
- ✅ Asegúrate de que la verificación en 2 pasos esté activa

### Error: "Connection timeout"
- ✅ Verifica el HOST y PORT
- ✅ Comprueba tu conexión a internet
- ✅ Algunos firewalls bloquean SMTP

### No llega el email
- ✅ Revisa la carpeta de **SPAM**
- ✅ Verifica que el email esté registrado en la app
- ✅ Comprueba los logs del servidor

### Para usar Gmail corporativo (G Suite)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_usuario@tu_dominio.com
EMAIL_PASSWORD=tu_app_password
```

## 🛡️ Seguridad

### ⚠️ Importante:
- **Nunca** subas las credenciales de email al repositorio
- Usa **App Passwords** en lugar de contraseñas normales
- En producción, usa servicios dedicados como SendGrid/AWS SES
- Considera implementar **rate limiting** para prevenir spam

## 📋 Ejemplo de Email que se Envía

Los usuarios recibirán un email profesional con:
- ✅ Diseño responsive con colores de Badeo
- ✅ Botón destacado para restablecer contraseña
- ✅ Enlace de respaldo para copiar/pegar
- ✅ Advertencias de seguridad (expira en 1 hora, uso único)
- ✅ Instrucciones claras
- ✅ Versiones HTML y texto plano

## 💡 Desarrollo vs Producción

### Desarrollo (sin configurar email):
- 🟡 Token mostrado en consola del servidor
- 🟡 Enlace mostrado en logs
- 🟡 Sistema funciona, pero sin email real

### Configurado correctamente:
- ✅ Email real enviado al usuario
- ✅ Logs de confirmación en servidor
- ✅ Experiencia completa de usuario

---

**¿Necesitas ayuda?** El token siempre aparece en la consola del servidor para desarrollo, así que puedes probarlo sin configurar email primero.
