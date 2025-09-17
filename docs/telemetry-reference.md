# Telemetría — referencia única

Fecha: 2025-09-16

Este archivo es el punto único de referencia para todo lo relacionado con la telemetría en el proyecto. Incluye el plan, comandos de backup, SQL seguro idempotente para crear la tabla, y ejemplos de scripts para verificar la API. Usar este archivo para retomar trabajo futuro.

---

## Resumen del estado actual

- Endpoints en la app: `POST /api/telemetry`, `GET /api/telemetry`, y SSE `GET /api/telemetry?action=stream`.
- Cliente: `src/lib/telemetry.ts` (cola en localStorage, `initTelemetry`, `sendTelemetryEvent`, expuesto como `window.__telemetry__`).
- Store en memoria: `src/lib/telemetryStore.ts`.
- API server: `src/app/api/telemetry/route.ts` (intenta persistir con Prisma, fallback a memoria).
- UI admin: `src/components/admin/TelemetryPanel.tsx` y pestaña añadida en `src/app/admin/page.tsx`.
- Esquema Prisma: modelo `TelemetryEvent` añadido en `prisma/schema.prisma` (migración pendiente por drift).

---

## Prioridades y pasos (corto plazo)

1. Verificar que la telemetría actual funciona en producción (sin tocar BDD):
   - GET summary
   - POST eventos
   - Admin SSE muestra eventos
2. Si se opta por persistir ahora: crear backup, aplicar SQL idempotente para crear la tabla, probar inserciones.
3. A medio plazo: resolver drift de Prisma y generar migración formal.

---

## Backup (obligatorio antes de tocar la DB)

1) Crear la carpeta de backups en la raíz del repo (cmd.exe):

```cmd
mkdir "%CD%\backups"
```

2) Generar timestamp (opcional):

```cmd
for /f "usebackq" %i in (`powershell -NoProfile -Command "(Get-Date).ToString('yyyyMMdd_HHmmss')"`) do set TS=%i
```

3) Poner la contraseña temporalmente (opcional):

```cmd
set PGPASSWORD=npg_dobg0TreiPI7
```

4) Ejecutar pg_dump (formato custom):

```cmd
pg_dump -h ep-lingering-wave-a2n276ol-pooler.eu-central-1.aws.neon.tech -U neondb_owner -d neondb -F c -b -v -f "%CD%\backups\neondb_before_telemetry_%TS%.dump"
```

5) Limpiar variable de entorno por seguridad:

```cmd
set PGPASSWORD=
```

---

## SQL idempotente (crear tabla e índices)

Ejecutar solo tras backup o pegar en el panel SQL de tu proveedor (Neon) para evitar exponer credenciales.

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS public."TelemetryEvent" (
  _Este archivo ha sido movido a `README.md` en la raíz del repositorio. Mantén esa versión como la referencia única._
  "type" VARCHAR(191) NOT NULL,
