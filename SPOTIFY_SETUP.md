# 🚨 ERROR: INVALID_CLIENT: Invalid redirect URI - SOLUCIÓN COMPLETA

## ❌ Problema identificado

Estás viendo el error **"INVALID_CLIENT: Invalid redirect URI"** porque el redirect URI configurado en Spotify no coincide exactamente con el que está usando tu aplicación.

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Verificar configuración actual
Ve a: **http://localhost:3001/api/debug**

Esta URL te mostrará la configuración actual de tu aplicación.

### PASO 2: Actualizar Spotify Dashboard

1. **Ve a:** [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. **Selecciona tu aplicación** (la que creaste para Badeo)
3. **Ve a "Edit Settings"**
4. **En "Redirect URIs", agrega exactamente:**
   ```
   http://localhost:3001/api/spotify/callback
   ```
5. **IMPORTANTE:** Borra cualquier otro redirect URI que no uses
6. **Haz clic en "Save"**

### PASO 3: Verificar configuración local

Tu archivo `.env.local` debe tener exactamente:

```env
# --- URL base de la aplicación ---
NEXTAUTH_URL=http://localhost:3001

# --- Configuración de Spotify ---
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id_real_de_spotify
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback
SPOTIFY_CLIENT_SECRET=tu_client_secret_real_de_spotify
```

### PASO 4: Reiniciar servidor

Después de cambiar `.env.local`:

1. **Detén el servidor** (Ctrl+C en la terminal)
2. **Reinicia el servidor:**
   ```bash
   cd C:\Users\BARRIO\Documents\Badeo\PWABadeo
   npx next dev --port 3001
   ```

## 🔍 Verificación final

### 1. Probar endpoint de debug
Ve a: **http://localhost:3001/api/debug**

Deberías ver:
```json
{
  "status": "success",
  "environment": {
    "spotify_client_id": "CONFIGURADO",
    "spotify_redirect_uri": "http://localhost:3001/api/spotify/callback"
  }
}
```

### 2. Probar la aplicación
1. Ve a: **http://localhost:3001**
2. Abre la consola del navegador (F12)
3. Haz clic en **"Conectar Spotify"**

## 📋 Logs esperados

### Al hacer clic:
```
🎵 Botón "Conectar Spotify" clickeado
🎵 Iniciando login con Spotify...
Client ID: CONFIGURADO
Redirect URI: CONFIGURADO
🔗 URL de autenticación generada: https://accounts.spotify.com/authorize?...
```

### Después de autorizar en Spotify:
```
🔄 Callback de Spotify recibido
✅ Redirigiendo a: http://localhost:3001/?spotify_code=...
🔄 Inicializando autenticación de Spotify...
✅ Código de autorización encontrado
🔄 Intercambiando código por token...
✅ Token recibido: PRESENTE
```

## ⚠️ Errores comunes y soluciones

### ❌ "INVALID_CLIENT: Invalid redirect URI"
**Solución:** Verifica que el redirect URI en Spotify sea exactamente `http://localhost:3001/api/spotify/callback`

### ❌ "Error checking credentials"
**Solución:** Verifica que las variables de entorno estén configuradas correctamente

### ❌ "Unexpected token '<', "<!DOCTYPE "..."
**Solución:** Reinicia el servidor después de crear nuevos endpoints

### ❌ Página en blanco o error 404
**Solución:** Asegúrate de que el servidor esté corriendo en el puerto 3001

## 🎯 ¿Sigues teniendo problemas?

1. **Verifica el endpoint de debug:** http://localhost:3001/api/debug
2. **Revisa la consola del navegador** para ver errores específicos
3. **Confirma que el redirect URI en Spotify** sea exactamente `http://localhost:3001/api/spotify/callback`
4. **Reinicia el servidor** después de cualquier cambio

## 📞 ¿Necesitas ayuda adicional?

Si después de seguir estos pasos exactos sigues teniendo problemas, comparte:

1. **Los logs de la consola del navegador**
2. **El resultado de:** http://localhost:3001/api/debug
3. **Una captura de pantalla** de la configuración de redirect URIs en Spotify Dashboard

¡La integración funcionará perfectamente una vez que el redirect URI coincida exactamente! 🎵

3. **Prueba la conexión:** Ve a la sección del clima y haz clic en "Conectar Spotify"

## ⚠️ Errores comunes

- ❌ `tu_client_id_aqui` → Debes usar el ID real de Spotify
- ❌ `tu_client_secret_aqui` → Debes usar el secret real de Spotify
- ❌ Olvidar reiniciar el servidor después de cambiar `.env.local`
- ❌ Redirect URI no coincide exactamente con lo configurado en Spotify

## 🎯 ¿Sigues teniendo problemas?

1. **Revisa la consola del navegador** (F12 → Console) para ver mensajes de error detallados
2. **Verifica las credenciales** en la página de debug
3. **Asegúrate** de que el Redirect URI en Spotify Dashboard sea exactamente: `http://localhost:3000/api/spotify/callback`

## � ¿Necesitas ayuda?

Si después de seguir estos pasos sigues teniendo problemas, revisa:
- Que no haya espacios extra en las variables de entorno
- Que las credenciales de Spotify sean de una app que creaste tú
- Que no estés usando credenciales de otra aplicación

¡Una vez configurado correctamente, la integración funcionará perfectamente! 🎵
