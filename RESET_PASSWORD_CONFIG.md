# Configuración de URLs para Reset de Contraseña

## Variables de Entorno Requeridas

### Desarrollo Local
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=https://pwa-badeo.vercel.app
```

### Producción (Vercel)
```bash
# Variables de entorno en Vercel Dashboard
NEXTAUTH_URL=https://pwa-badeo.vercel.app
NEXT_PUBLIC_APP_URL=https://pwa-badeo.vercel.app
```

## Lógica de Determinación de URL

El sistema usa la siguiente lógica para determinar qué URL usar en los enlaces de reseteo:

### En Producción (NODE_ENV=production):
1. `NEXT_PUBLIC_APP_URL` (preferencia)
2. `NEXTAUTH_URL` (fallback)
3. `https://pwa-badeo.vercel.app` (hardcoded fallback)

### En Desarrollo (NODE_ENV=development):
1. `NEXTAUTH_URL` (preferencia)
2. `NEXT_PUBLIC_APP_URL` (fallback)
3. `http://localhost:3000` (hardcoded fallback)

## Configuración en Vercel

1. **Via Dashboard:**
   - Ir a https://vercel.com/dashboard
   - Seleccionar el proyecto PWABadeo
   - Ir a Settings > Environment Variables
   - Agregar:
     - `NEXTAUTH_URL` = `https://pwa-badeo.vercel.app`
     - `NEXT_PUBLIC_APP_URL` = `https://pwa-badeo.vercel.app`

2. **Via vercel.json:**
   ```json
   {
     "env": {
       "NEXTAUTH_URL": "https://pwa-badeo.vercel.app",
       "NEXT_PUBLIC_APP_URL": "https://pwa-badeo.vercel.app"
     }
   }
   ```

## Flujo de Reset de Contraseña

1. Usuario va a `/forgot-password`
2. Ingresa su email
3. Sistema genera token y envía email con enlace:
   - **Desarrollo:** `http://localhost:3001/reset-password?token=...`
   - **Producción:** `https://pwa-badeo.vercel.app/reset-password?token=...`
4. Usuario hace clic en el enlace
5. Página valida el token
6. Usuario establece nueva contraseña
7. Sistema actualiza la contraseña en la base de datos

## Pruebas

Para probar el sistema:

1. **Desarrollo:** Usar http://localhost:3001/forgot-password
2. **Producción:** Usar https://pwa-badeo.vercel.app/forgot-password

Los tokens se muestran en la consola del servidor en modo desarrollo para facilitar las pruebas.
