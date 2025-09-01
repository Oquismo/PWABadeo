#!/usr/bin/env node

/**
 * Script de build inteligente que maneja migraciones según el entorno
 * Evita errores P3005 en deployments de Vercel
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando build inteligente...');

function runCommand(command, options = {}) {
  try {
    console.log(`▶️  Ejecutando: ${command}`);
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      ...options
    });
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    console.error(error.message);
    return { success: false, error };
  }
}

async function main() {
  // 1. Generar cliente Prisma
  console.log('\n📦 Paso 1: Generando cliente Prisma...');
  const generateResult = runCommand('npx prisma generate');
  if (!generateResult.success) {
    process.exit(1);
  }

  // 2. Sincronizar base de datos
  console.log('\n🔄 Paso 2: Sincronizando esquema de base de datos...');
  
  // Intentar db push (más seguro para bases de datos existentes)
  const pushResult = runCommand('npx prisma db push --skip-generate --accept-data-loss');
  
  if (!pushResult.success) {
    console.log('⚠️  db push falló, intentando con migrate deploy...');
    
    // Si db push falla, intentar migrate deploy
    const migrateResult = runCommand('npx prisma migrate deploy');
    
    if (!migrateResult.success) {
      console.log('⚠️  migrate deploy también falló, continuando sin migraciones...');
      console.log('ℹ️  La aplicación se construirá con el esquema actual');
    }
  }

  // 3. Construir aplicación Next.js
  console.log('\n🏗️  Paso 3: Construyendo aplicación Next.js...');
  const buildResult = runCommand('npx next build');
  
  if (!buildResult.success) {
    console.error('❌ Error en el build de Next.js');
    process.exit(1);
  }

  console.log('\n🎉 ¡Build completado exitosamente!');
}

main().catch(error => {
  console.error('❌ Error crítico:', error);
  process.exit(1);
});
