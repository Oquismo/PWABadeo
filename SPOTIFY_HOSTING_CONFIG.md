# Configuración de Spotify para Diferentes Plataformas de Hosting

## 🚀 Vercel

### Variables de Entorno en Vercel Dashboard:
```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://tu-app.vercel.app/api/spotify/callback
NEXTAUTH_URL=https://tu-app.vercel.app
DATABASE_URL=tu_connection_string
```

### Archivo vercel.json (opcional):
```json
{
  "env": {
    "NEXT_PUBLIC_SPOTIFY_CLIENT_ID": "@spotify-client-id",
    "SPOTIFY_CLIENT_SECRET": "@spotify-client-secret",
    "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI": "https://tu-app.vercel.app/api/spotify/callback",
    "NEXTAUTH_URL": "https://tu-app.vercel.app"
  }
}
```

## 🚂 Railway

### Variables de Entorno en Railway Dashboard:
```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://tu-app.railway.app/api/spotify/callback
DATABASE_URL=${{PG_CONNECTION_STRING}}
```

## 🐙 Netlify

### Archivo netlify.toml:
```toml
[build.environment]
  NEXT_PUBLIC_SPOTIFY_CLIENT_ID = "tu_client_id_aqui"
  SPOTIFY_CLIENT_SECRET = "tu_client_secret_aqui"
  NEXT_PUBLIC_SPOTIFY_REDIRECT_URI = "https://tu-app.netlify.app/api/spotify/callback"
  NEXTAUTH_URL = "https://tu-app.netlify.app"
```

### O configura en Netlify Dashboard > Site Settings > Environment Variables

## 🌐 Heroku

### Configuración via Heroku CLI:
```bash
heroku config:set NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id_aqui
heroku config:set SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
heroku config:set NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://tu-app.herokuapp.com/api/spotify/callback
heroku config:set NEXTAUTH_URL=https://tu-app.herokuapp.com
```

## 📦 Docker

### Archivo .env para Docker:
```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@db:5432/dbname
```

### Dockerfile (ejemplo):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Variables Comunes para Todas las Plataformas

### Requeridas:
- `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`: Tu Client ID de Spotify
- `SPOTIFY_CLIENT_SECRET`: Tu Client Secret de Spotify (nunca uses NEXT_PUBLIC_)
- `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`: URL completa de callback
- `NEXTAUTH_URL`: URL base de tu aplicación

### Opcionales:
- `NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST`: ID de playlist por defecto
- `NEXT_PUBLIC_SPOTIFY_AUTO_PLAY`: true/false para reproducción automática
- `NEXT_PUBLIC_SPOTIFY_VOLUME`: Volumen inicial (0-100)

## ⚠️ Notas Importantes

1. **Nunca** uses `NEXT_PUBLIC_` con `SPOTIFY_CLIENT_SECRET`
2. El `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` debe coincidir **exactamente** con lo configurado en Spotify Dashboard
3. Para desarrollo local, usa `http://localhost:3000`
4. Para producción, siempre usa `https://`

## 🧪 Verificación

Ejecuta el script de verificación:
```bash
bash scripts/verify-spotify-config.sh
```

O verifica manualmente:
```bash
echo $NEXT_PUBLIC_SPOTIFY_CLIENT_ID
echo $SPOTIFY_CLIENT_SECRET  # Debe tener valor pero no mostrarse en logs
echo $NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
```
