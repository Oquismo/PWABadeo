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
  "id" SERIAL PRIMARY KEY,
  "type" VARCHAR(191) NOT NULL,
  "userEmail" VARCHAR(255),
  "payload" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'TelemetryEvent_type_idx' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX "TelemetryEvent_type_idx" ON public."TelemetryEvent" ("type");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'TelemetryEvent_createdAt_idx' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX "TelemetryEvent_createdAt_idx" ON public."TelemetryEvent" ("createdAt");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'TelemetryEvent_userEmail_idx' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX "TelemetryEvent_userEmail_idx" ON public."TelemetryEvent" ("userEmail");
  END IF;
END$$;

COMMIT;
```

Nota: este SQL puede ejecutarse repetidamente sin daño.

---

## Comandos de prueba (curl / cmd / node)

Ejemplos rápidos para verificar que la API responde (no requieren acceso a la BD):

Curl (cmd.exe):

```cmd
curl -v -X GET "https://tu-dominio.com/api/telemetry"

curl -v -X POST "https://tu-dominio.com/api/telemetry" -H "Content-Type: application/json" -d "{\"type\":\"smoke_test\",\"payload\":{\"msg\":\"hello from test\"}}"
```

Script Node (ejemplo):

```js
// node check-telemetry.js https://tu-dominio.com
(async ()=>{
  const base = process.argv[2];
  const g = await fetch(base + '/api/telemetry');
  console.log(await g.json());
  const p = await fetch(base + '/api/telemetry', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({type:'smoke_test', payload:{msg:'hello'}}) });
  console.log(await p.json());
})();
```

---

## Dónde está el código (referencias)

- Cliente/cola/local: `src/lib/telemetry.ts`
- Store en memoria: `src/lib/telemetryStore.ts`
- API endpoint: `src/app/api/telemetry/route.ts`
- Panel admin SSE: `src/components/admin/TelemetryPanel.tsx` y pestaña en `src/app/admin/page.tsx`
- Modelo Prisma (añadido): `prisma/schema.prisma` (migración pendiente)

---

## Notas operativas y de seguridad

- NO ejecutar `prisma migrate reset` en producción.
- Siempre backup antes de aplicar SQL/migraciones.
- Decidir política de retención (p. ej. 90 días) antes de implementar borrados automáticos.
- Considere anonimizar PII si planeas guardar emails u otra información identificable.

---

Si necesitas que aplique el SQL o ejecute backups desde esta máquina, confirma explícitamente y lo haré (necesitaré autorización). En caso contrario, usa este archivo como referencia y ejecútalo desde tu entorno.
