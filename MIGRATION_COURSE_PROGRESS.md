# Instrucciones para aplicar la migración de CourseProgress

## ⚠️ IMPORTANTE - LEA PRIMERO

Esta migración SOLO AÑADE una nueva tabla `CourseProgress` a la base de datos.
NO modifica ni elimina ninguna tabla o datos existentes.

## Pasos para aplicar la migración:

### 1. Verificar el schema de Prisma
```bash
# Verificar que el modelo CourseProgress esté en prisma/schema.prisma
cat prisma/schema.prisma | grep -A 15 "model CourseProgress"
```

### 2. Crear y aplicar la migración
```bash
# Generar la migración (esto creará el archivo SQL)
npx prisma migrate dev --name add_course_progress

# O si ya existe, solo aplicar:
npx prisma migrate deploy
```

### 3. Regenerar el cliente de Prisma
```bash
npx prisma generate
```

### 4. Verificar que la tabla se creó correctamente
```bash
# Abrir Prisma Studio para ver la nueva tabla
npx prisma studio
```

## SQL de la migración (para referencia)

Si prefieres ejecutar el SQL manualmente:

```sql
-- CreateTable
CREATE TABLE "CourseProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL DEFAULT 'spanish',
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "levelScores" JSONB NOT NULL DEFAULT '{}',
    "achievements" JSONB NOT NULL DEFAULT '[]',
    "stats" JSONB NOT NULL DEFAULT '{}',
    "lastQuestionSeen" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseProgress_userId_key" ON "CourseProgress"("userId");

-- CreateIndex
CREATE INDEX "CourseProgress_userId_idx" ON "CourseProgress"("userId");

-- CreateIndex
CREATE INDEX "CourseProgress_courseId_idx" ON "CourseProgress"("courseId");

-- CreateIndex
CREATE INDEX "CourseProgress_updatedAt_idx" ON "CourseProgress"("updatedAt");
```

## Verificación Post-Migración

Después de aplicar la migración, verifica que todo funcione:

1. ✅ La tabla `CourseProgress` existe en la base de datos
2. ✅ No hay errores al compilar el proyecto (npm run build)
3. ✅ El endpoint `/api/cursos/progreso` responde correctamente
4. ✅ Puedes iniciar sesión y ver el cuestionario

## Rollback (solo si es necesario)

Si necesitas revertir la migración:

```bash
# Ver migraciones aplicadas
npx prisma migrate status

# Revertir última migración (usa con cuidado)
npx prisma migrate resolve --rolled-back <nombre-migracion>
```

## Notas de Seguridad

- ✅ Esta migración NO elimina datos
- ✅ Esta migración NO modifica tablas existentes
- ✅ Esta migración SOLO añade la nueva tabla CourseProgress
- ✅ El campo `userId` hace referencia a usuarios existentes pero NO crea foreign key (para mayor flexibilidad)
