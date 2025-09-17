@echo off
REM Uso: check-telemetry.cmd https://tu-dominio.com
IF "%1"=="" (
  echo Uso: %0 ^<base_url^
  exit /b 1
)

set BASE=%1

echo Haciendo GET %BASE%/api/telemetry
curl -s -X GET "%BASE%/api/telemetry" -H "Accept: application/json" | jq || echo

echo.
echo Haciendo POST de prueba a %BASE%/api/telemetry
curl -s -X POST "%BASE%/api/telemetry" -H "Content-Type: application/json" -d "{\"type\":\"smoke_test_cmd\",\"payload\":{\"msg\":\"hello from cmd\"}}" | jq || echo

echo.
echo Hecho.
