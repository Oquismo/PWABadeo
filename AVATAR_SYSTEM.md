# Sistema de Avatar Persistente

## 📋 Descripción

El sistema de avatar ha sido actualizado para guardar las imágenes de perfil en la base de datos en lugar de localStorage. Esto garantiza que los avatares se mantengan sincronizados entre todos los dispositivos y sesiones del usuario.

## 🚀 Características

- ✅ **Persistente**: Los avatares se guardan en la base de datos
- ✅ **Sincronizado**: Se mantiene igual en todos los dispositivos
- ✅ **Retrocompatible**: Funciona con el sistema anterior
- ✅ **Validación**: Verifica el formato de las imágenes
- ✅ **Eventos**: Sincronización en tiempo real entre pestañas

## 🛠️ API Endpoints

### GET `/api/avatar?userId={id}`
Obtiene el avatar del usuario especificado.

**Respuesta:**
```json
{
  "avatarUrl": "🥚" | "data:image/..." | null
}
```

### POST `/api/avatar`
Actualiza el avatar del usuario.

**Body:**
```json
{
  "userId": 123,
  "avatarUrl": "🥚"
}
```

**Respuesta:**
```json
{
  "success": true,
  "avatarUrl": "🥚"
}
```

### DELETE `/api/avatar?userId={id}`
Elimina el avatar del usuario (lo pone en null).

**Respuesta:**
```json
{
  "success": true,
  "message": "Avatar eliminado"
}
```

## 🔧 Uso en el Frontend

### Contexto de Autenticación

```tsx
import { useAuth } from '@/context/AuthContext';

const { updateAvatar, deleteAvatar, refreshAvatar } = useAuth();

// Actualizar avatar
await updateAvatar('🥚');

// Eliminar avatar
await deleteAvatar();

// Recargar avatar desde servidor
await refreshAvatar();
```

### Eventos de Sincronización

```tsx
// Escuchar cambios de avatar
useEffect(() => {
  const handleAvatarChange = () => {
    // Recargar avatar
    refreshAvatar();
  };

  window.addEventListener('profileImageChanged', handleAvatarChange);
  return () => window.removeEventListener('profileImageChanged', handleAvatarChange);
}, []);
```

## 📊 Base de Datos

### Esquema de Prisma

```prisma
model User {
  // ... otros campos
  avatarUrl String? // URL del avatar (base64, emoji, o URL externa)
}
```

### Migración

```sql
-- Agregar columna avatarUrl si no existe
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
```

## 🎯 Beneficios

1. **Persistencia**: Los avatares sobreviven a borrados de localStorage
2. **Sincronización**: Mismo avatar en todos los dispositivos
3. **Backup**: Los avatares están respaldados en la base de datos
4. **Escalabilidad**: Fácil de migrar a sistema de archivos o CDN
5. **Confiabilidad**: No depende del almacenamiento local del navegador

## 🔒 Seguridad

- ✅ Validación de formato de imagen
- ✅ Verificación de usuario autenticado
- ✅ Sanitización de URLs
- ✅ Límites de tamaño (base64 tiene límites razonables)

## 🧪 Testing

Ejecutar el test de la API:

```bash
node test-avatar.js
```

## 🚨 Consideraciones

1. **Tamaño de Base64**: Las imágenes grandes pueden hacer la base de datos pesada
2. **Migración**: Los usuarios existentes tendrán avatar null inicialmente
3. **Rendimiento**: Considerar usar CDN para imágenes grandes en producción
4. **Backup**: Incluir avatarUrl en backups de base de datos

## 🔄 Futuras Mejoras

- [ ] Sistema de archivos para imágenes grandes
- [ ] Integración con Cloudinary o AWS S3
- [ ] Compresión automática de imágenes
- [ ] Avatares predeterminados por rol
- [ ] Historial de avatares
