# Telemetría — instrucciones rápidas

Este archivo contiene instrucciones para comprobar que la telemetría funciona en un entorno dado (local, staging o producción) sin modificar la base de datos.

Archivos útiles:
- `prisma/sql/ensure_telemetry_table.sql` — SQL no destructivo para crear la tabla `TelemetryEvent`.
- `scripts/check-telemetry.cmd` — script Windows (curl) para probar endpoints GET/POST.
- `scripts/check-telemetry.js` — script Node.js para pruebas programáticas (usa fetch builtin).

Uso recomendado (pasos):
1. Asegúrate de tener `curl` o `node` instalados.
2. Ejecuta un backup si vas a tocar la BD (recomendado) — ver sección backup arriba.
3. Para una comprobación rápida (sin cambiar la BD), ejecuta el script curl:

   En cmd.exe:

   ```cmd
   scripts\check-telemetry.cmd https://tu-dominio.com
   ```

   Sustituye `https://tu-dominio.com` por la URL de tu despliegue (o `http://localhost:3000`).

4. Alternativamente, ejecuta el script Node (más verboso):

   ```cmd
   node scripts\check-telemetry.js https://tu-dominio.com
   ```

Salida esperada:
- GET /api/telemetry -> JSON con `ok: true` y `summary`.
- POST /api/telemetry -> JSON con `ok: true` y campo `persisted` (true/false).

Si todo OK, la UI de Admin debería mostrar el evento en la pestaña Telemetría (SSE), si no hay problema de red o CORS.

Si algo falla, copia la salida de los scripts y compártela con el equipo para diagnosticar.
