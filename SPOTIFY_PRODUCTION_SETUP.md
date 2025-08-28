# ## � Problema Común: "Loop de Autenticación"

Si al hacer clic en "Conectar" con Spotify, aceptas los permisos pero vuelves a la página de conexión sin completar el login, sigue esta guía.

### ✅ Diagnóstico Rápido

1. **Página de diagnóstico**: `https://pwa-badeo.vercel.app/spotify-production-debug`
2. **Script de verificación**: `./scripts/check-spotify-production.sh`

### 🔍 Causas Comunes

- **Redirect URI incorrecta** en Spotify Dashboard
- **Variables de entorno** no configuradas en producción
- **URLs inconsistentes** entre configuración y código
- **Cache** de configuración desactualizada

### 🛠️ Solución Rápida

1. **Verifica las variables de entorno** en tu plataforma de despliegue
2. **Configura la Redirect URI** exacta en Spotify Dashboard
3. **Reinicia** tu aplicación después de los cambios
4. **Limpia la cache** del navegador

## 📋 Requisitos Previosde Configuración de Spotify para Producción

## � Problema Común: "Loop de Autenticación"

Si al hacer clic en "Conectar" con Spotify, aceptas los permisos pero vuelves a la página de conexión sin completar el login, sigue esta guía.

### ✅ Diagnóstico Rápido

1. **Página de diagnóstico**: `https://pwa-badeo.vercel.app/spotify-production-debug`
2. **Script de verificación**: `./scripts/check-spotify-production.sh`

## �📋 Requisitos Previos

1. **Cuenta de Desarrollador de Spotify**
   - Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Crea una nueva aplicación o usa una existente

2. **Dominio de Producción**
   - Necesitas tener tu dominio configurado (ej: `https://tu-app.com`)

## ⚙️ Configuración Paso a Paso

## ⚙️ Configuración Paso a Paso

### 1. Configurar la Aplicación en Spotify

1. Ve a tu [Spotify Dashboard](https://developer.spotify.com/dashboard)
2. Selecciona tu aplicación
3. Ve a "Edit Settings"
4. En "Redirect URIs", agrega:
   ```
   https://pwa-badeo.vercel.app/api/spotify/callback
   ```
5. Copia el **Client ID** y **Client Secret**

### 2. Configurar Variables de Entorno

#### Para Vercel:
```bash
# En el dashboard de Vercel, ve a tu proyecto > Settings > Environment Variables
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://pwa-badeo.vercel.app/api/spotify/callback
NEXTAUTH_URL=https://pwa-badeo.vercel.app
```

#### Para Railway:
```bash
# En el dashboard de Railway, configura estas variables:
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://tu-dominio.com/api/spotify/callback
DATABASE_URL=tu_connection_string
```

#### Para otros proveedores:
Configura las mismas variables de entorno en tu plataforma de hosting.

### 3. Variables de Entorno Obligatorias

```bash
# Credenciales de Spotify
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret

# URLs de producción
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://tu-dominio.com/api/spotify/callback
NEXTAUTH_URL=https://tu-dominio.com

# Base de datos
DATABASE_URL=tu_connection_string
```

### 4. Variables de Entorno Opcionales

```bash
# Playlists por clima
NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST=37i9dQZF1DX0XUsuxWHRQd
NEXT_PUBLIC_SPOTIFY_RAINY_PLAYLIST=37i9dQZF1DXbvABJXBIyiY
NEXT_PUBLIC_SPOTIFY_SUNNY_PLAYLIST=37i9dQZF1DX0XUsuxWHRQd
NEXT_PUBLIC_SPOTIFY_CLOUDY_PLAYLIST=37i9dQZF1DX4E3UdUs7fUx

# Configuración de reproducción
NEXT_PUBLIC_SPOTIFY_AUTO_PLAY=false
NEXT_PUBLIC_SPOTIFY_VOLUME=50
```

## 🔧 Solución de Problemas

### Error: "Invalid redirect URI"
- Asegúrate de que la URI en Spotify Dashboard coincida exactamente con `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`
- Incluye el protocolo (`https://`) y la ruta completa (`/api/spotify/callback`)

### Error: "Client secret not found"
- Verifica que `SPOTIFY_CLIENT_SECRET` esté configurada (sin `NEXT_PUBLIC_`)
- Asegúrate de que no haya espacios extra o caracteres invisibles

### Error: "CORS error"
- Verifica que `NEXTAUTH_URL` apunte a tu dominio de producción
- Asegúrate de que no haya conflictos de puertos

## 📝 Playlists Recomendadas por Clima

| Clima | ID de Playlist | Descripción |
|-------|---------------|-------------|
| Soleado | `37i9dQZF1DX0XUsuxWHRQd` | Música energética y positiva |
| Lluvioso | `37i9dQZF1DXbvABJXBIyiY` | Música relajante y melancólica |
| Nublado | `37i9dQZF1DX4E3UdUs7fUx` | Música suave y atmosférica |
| Default | `37i9dQZF1DX0XUsuxWHRQd` | Playlist general |

## 🚀 Despliegue

Después de configurar las variables de entorno:

1. **Commit y push** tus cambios
2. **Re-despliega** tu aplicación
3. **Prueba** la autenticación de Spotify en producción

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de tu plataforma de hosting
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que las URLs de redirect coincidan exactamente
4. Prueba con una nueva aplicación de Spotify si es necesario

¡Tu integración de Spotify debería funcionar perfectamente en producción! 🎵
