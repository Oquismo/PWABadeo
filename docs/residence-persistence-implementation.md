# Campo Residence - Persistencia en Base de Datos

## Problema Resuelto

La residencia seleccionada por el usuario en el registro se guardaba únicamente en localStorage, lo que causaba que se perdiera al actualizar la página o cambiar de dispositivo.

## Cambios Implementados

### 1. Esquema de Base de Datos (Prisma)

**Archivo:** `prisma/schema.prisma`

```prisma
model User {
  // ... otros campos
  residence        String? // Residencia elegida por el usuario (p. ej. 'ONE' o 'AMBRO')
  // ... otros campos
}
```

- ✅ Descomentado el campo `residence` en el modelo User
- ✅ Aplicado con `npx prisma db push`

### 2. Frontend - Formulario de Registro

**Archivo:** `src/app/registro/page.tsx`

```typescript
const payload = {
  // ... otros campos
  residence: formData.residence || null, // Incluir residencia seleccionada
  // ... otros campos
};
```

- ✅ Añadido `residence` al payload que se envía al API
- ✅ Se envía el valor seleccionado en el formulario de registro

### 3. Backend - API de Registro

**Archivo:** `src/app/api/auth/register/route.ts`

```typescript
// Destructuring de datos recibidos
const { 
  // ... otros campos
  residence,
  // ... otros campos
} = await request.json();

// Guardado en base de datos
if (residence) userData.residence = residence; // Guardar residencia seleccionada
```

- ✅ Recibe el campo `residence` del frontend
- ✅ Lo guarda en la base de datos durante el registro

### 4. Backend - API de Usuario

**Archivo:** `src/app/api/user/by-email/route.ts`

```typescript
const userProfile = {
  // ... otros campos
  residence: (user as any).residence ?? null, // Incluir residencia desde la base de datos
  // ... otros campos
};
```

- ✅ Incluye el campo `residence` al devolver datos del usuario
- ✅ Se obtiene directamente desde la base de datos

## Flujo Completo

### Registro de Usuario
1. Usuario selecciona residencia en el formulario
2. Frontend envía `residence` en el payload al API
3. Backend guarda `residence` en la tabla User
4. Usuario queda registrado con residencia persistente

### Carga de Usuario (Login/Refresh)
1. AuthContext solicita datos del usuario vía `/api/user/by-email`
2. API consulta la base de datos incluyendo el campo `residence`
3. Frontend recibe los datos completos del usuario
4. La residencia se mantiene disponible sin depender de localStorage

## Beneficios

✅ **Persistencia Real**: La residencia se guarda en la base de datos
✅ **Sincronización Multi-dispositivo**: Disponible en cualquier dispositivo
✅ **Recuperación tras Actualización**: No se pierde al refrescar la página  
✅ **Mantenimiento de Datos**: Datos consistentes y confiables
✅ **Compatibilidad**: Funciona con usuarios existentes (valor null por defecto)

## Compatibilidad con Usuarios Existentes

- Los usuarios registrados antes de este cambio tendrán `residence: null`
- Pueden actualizar su residencia a través del perfil (funcionalidad futura)
- No se requiere migración de datos existentes

## Testing

El campo fue probado exitosamente:
- ✅ Campo agregado a la base de datos
- ✅ Escritura y lectura funcionando correctamente
- ✅ Compatible con usuarios existentes
- ✅ APIs actualizadas y funcionando

## Próximos Pasos

Para completar la funcionalidad, se podría considerar:
- [ ] Añadir opción para editar residencia en el perfil de usuario
- [ ] Validación de valores permitidos para residence
- [ ] Migración de datos de localStorage a base de datos para usuarios existentes