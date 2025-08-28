# 📧 CONFIGURACIÓN PASO A PASO - Gmail para Emails Reales

## 🎯 ¡Ya tienes el código listo! Solo necesitas configurar Gmail

### 📋 **PASO 1: Habilitar 2FA en tu Gmail**

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. Clic en **"Seguridad"** (lado izquierdo)
3. En **"Cómo inicias sesión en Google"** → **"Verificación en 2 pasos"**
4. Si no está activa, **actívala** (necesaria para App Passwords)

### 📋 **PASO 2: Generar App Password**

1. En la misma sección de **"Seguridad"**
2. Busca **"Contraseñas de aplicaciones"** 
3. Clic en **"Contraseñas de aplicaciones"**
4. Selecciona **"Otra (nombre personalizado)"**
5. Escribe: **"Badeo PWA"**
6. Clic **"Generar"**
7. **¡COPIA la contraseña de 16 caracteres!** (ej: `abcd efgh ijkl mnop`)

### 📋 **PASO 3: Configurar Variables de Entorno**

Edita tu archivo `.env.local`:

```bash
# --- Configuración de Email REAL ---
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=tu_email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
NEXTAUTH_URL=http://localhost:3001
```

### 📋 **PASO 4: Ejemplo Completo**

Si tu email es `juan@gmail.com` y tu App Password es `abcd efgh ijkl mnop`:

```bash
EMAIL_PROVIDER=gmail
EMAIL_USER=juan@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=juan@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
NEXTAUTH_URL=http://localhost:3001
```

### 📋 **PASO 5: Reiniciar Servidor**

```bash
npm run dev
```

### 📋 **PASO 6: Probar**

1. Ve a: `http://localhost:3001/test-email`
2. **Probar Conexión SMTP** → Debe decir "✅ Conectado"
3. **Enviar Email de Prueba** → Introduce tu email y envía
4. **¡Revisa tu bandeja de entrada!** (y spam)

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### ❌ **"Invalid login credentials"**
- ✅ Verifica que uses **App Password** (16 caracteres con espacios)
- ✅ NO uses tu contraseña normal de Gmail
- ✅ Asegúrate de que 2FA esté activo

### ❌ **"Connection timeout"**
- ✅ Verifica tu conexión a internet
- ✅ Algunos firewalls corporativos bloquean SMTP
- ✅ Prueba desde otra red

### ❌ **No llega el email**
- ✅ **Revisa SPAM/Promociones** (Gmail puede filtrar)
- ✅ Verifica que el email esté registrado en tu app
- ✅ Comprueba los logs del servidor para errores

### ❌ **"Username and Password not accepted"**
- ✅ Regenera la App Password
- ✅ Copia exactamente (con espacios): `abcd efgh ijkl mnop`
- ✅ No agregues comillas en el .env.local

---

## 🌟 OTROS PROVEEDORES

### **Outlook/Hotmail:**
```bash
EMAIL_PROVIDER=outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tu_email@outlook.com
EMAIL_PASSWORD=tu_contraseña
```

### **Yahoo:**
```bash
EMAIL_PROVIDER=yahoo
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=tu_email@yahoo.com
EMAIL_PASSWORD=tu_app_password
```

### **SMTP Personalizado:**
```bash
EMAIL_PROVIDER=custom
EMAIL_HOST=mail.tu-dominio.com
EMAIL_PORT=587
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=tu_contraseña
```

---

## ✅ VERIFICACIÓN FINAL

Cuando esté configurado correctamente, verás en la consola del servidor:

```
✅ Email enviado exitosamente: {
  messageId: '<mensaje-id>',
  to: 'usuario@email.com',
  accepted: ['usuario@email.com'],
  rejected: []
}
```

Y el usuario recibirá un email profesional con el enlace de recuperación.

---

## 🎉 ¡LISTO!

Una vez configurado, tu sistema de recuperación de contraseñas será completamente profesional:

- ✅ **Emails HTML hermosos** con el branding de Badeo
- ✅ **Seguridad completa** con tokens únicos
- ✅ **Experiencia de usuario perfecta**
- ✅ **Lista para producción**

¡Tu PWA Badeo tendrá un sistema de recuperación de contraseñas de nivel empresarial! 🚀
