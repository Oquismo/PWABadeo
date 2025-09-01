# 🔧 SOLUCIÓN: Variable DATABASE_URL en Vercel

## 🎯 Variable que Necesitas Actualizar en Vercel

Ve al dashboard de Vercel y actualiza esta variable de entorno:

### Variable a Cambiar:
```
DATABASE_URL
```

### Valor Actual (Problemático):
```
postgresql://postgres:yGvMHHNigTYleJYNKlaKkOEYcOPBfLyW@maglev.proxy.rlwy.net:58986/railway
```

### Nuevo Valor (Correcto):
```
postgresql://neondb_owner:npg_dobg0TreiPI7@ep-lingering-wave-a2n276ol-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## 📝 Pasos para Actualizar en Vercel:

1. **Ve a tu proyecto en Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Entra a tu proyecto PWABadeo**
   - Busca el proyecto "PWABadeo" o similar

3. **Ve a Settings → Environment Variables**
   - Haz clic en la pestaña "Settings"
   - Luego en "Environment Variables"

4. **Busca DATABASE_URL**
   - Encuentra la variable `DATABASE_URL`
   - Haz clic en "Edit" o el icono de editar

5. **Actualiza el valor**
   - Reemplaza el valor actual por la URL de Neon:
   ```
   postgresql://neondb_owner:npg_dobg0TreiPI7@ep-lingering-wave-a2n276ol-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

6. **Aplica a todos los entornos**
   - Asegúrate de que esté configurada para:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

7. **Guarda los cambios**
   - Haz clic en "Save"

8. **Redeploy**
   - Ve a "Deployments"
   - Haz clic en "Redeploy" en el último deployment
   - O haz un nuevo commit para triggear un nuevo deployment

## ⚠️ Variables Adicionales que Podrías Necesitar

Si tienes otras variables relacionadas con la base de datos, asegúrate de que también estén correctas:

```bash
# Principal (OBLIGATORIA)
DATABASE_URL=postgresql://neondb_owner:npg_dobg0TreiPI7@ep-lingering-wave-a2n276ol-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Si tienes variables separadas (OPCIONALES)
DATABASE_HOST=ep-lingering-wave-a2n276ol-pooler.eu-central-1.aws.neon.tech
DATABASE_NAME=neondb
DATABASE_USER=neondb_owner
DATABASE_PASSWORD=npg_dobg0TreiPI7
```

## 🔍 Verificación

Después de actualizar la variable:

1. **El build en Vercel debería completarse exitosamente**
2. **La aplicación debería conectarse a Neon PostgreSQL**
3. **No más errores P1001**

## 🚀 URL de Neon Verificada

La URL que debes usar en Vercel es exactamente esta:
```
postgresql://neondb_owner:npg_dobg0TreiPI7@ep-lingering-wave-a2n276ol-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Esta URL ya está funcionando correctamente en tu entorno local, solo necesitas aplicarla en Vercel.

---

**IMPORTANTE**: Una vez actualizada la variable en Vercel, el siguiente deployment debería ser exitoso. 🎯
