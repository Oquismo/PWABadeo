#!/bin/bash

# Script de deployment inteligente para Vercel
# Maneja automáticamente las migraciones según el estado de la base de datos

echo "🚀 Iniciando deployment inteligente..."

# 1. Generar cliente Prisma
echo "📦 Generando cliente Prisma..."
npx prisma generate

# 2. Verificar si la base de datos tiene esquema
echo "🔍 Verificando estado de la base de datos..."

# Intentar obtener información del esquema
if npx prisma db execute --stdin <<< "SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations' LIMIT 1;" 2>/dev/null; then
    echo "✅ Base de datos existente detectada"
    
    # Base de datos ya existe, verificar si necesita migraciones
    if npx prisma migrate status | grep -q "Following migration have not yet been applied"; then
        echo "🔄 Aplicando migraciones pendientes..."
        npx prisma migrate deploy
    else
        echo "✅ Base de datos ya está actualizada"
    fi
else
    echo "🆕 Base de datos nueva detectada"
    
    # Base de datos nueva, aplicar todas las migraciones
    echo "🔄 Aplicando migraciones iniciales..."
    npx prisma migrate deploy
fi

# 3. Construir aplicación
echo "🏗️ Construyendo aplicación Next.js..."
npx next build

echo "🎉 Deployment completado exitosamente!"
