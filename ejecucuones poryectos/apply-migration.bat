@echo off

echo ========================================
echo Aplicando Migracion de CourseProgress
echo ========================================

echo.

echo [1/3] Verificando schema de Prisma...
type prisma\schema.prisma | findstr /C:"CourseProgress"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Modelo CourseProgress no encontrado en schema.prisma
    pause
    exit /b 1
)
echo ✓ Modelo CourseProgress encontrado
echo.

echo [2/3] Generando y aplicando migracion...
call npx prisma migrate dev --name add_course_progress
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al crear la migracion
    pause
    exit /b 1
)
echo.

echo [3/3] Regenerando cliente de Prisma...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al generar cliente de Prisma
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✓ Migracion completada exitosamente
echo ========================================
echo.
echo La tabla CourseProgress ha sido creada en la base de datos.
echo El cliente de Prisma ha sido actualizado.
echo.
echo Puedes verificar la tabla ejecutando:
echo   npx prisma studio
echo.
pause
