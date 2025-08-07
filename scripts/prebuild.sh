#!/bin/bash
echo "Ejecutando pre-build script..."
npx prisma generate
echo "Prisma client generado exitosamente"
