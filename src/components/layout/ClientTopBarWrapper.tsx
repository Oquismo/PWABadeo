"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import TopAppBar from './TopAppBar';

export default function ClientTopBarWrapper() {
  const pathname = usePathname();

  if (!pathname) return null;

  // No mostrar en la página principal
  if (pathname === '/') return null;

  // Decide variante y título simple basado en la ruta
  const segments = pathname.split('/').filter(Boolean);
  const title = segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]).replace(/-/g, ' ') : '';

  // Si la ruta tiene más de 1 segmento, usar 'regular' para dar más espacio
  const variant = segments.length > 1 ? 'regular' : 'small';

  return <TopAppBar title={title ? (title.charAt(0).toUpperCase() + title.slice(1)) : 'Volver'} variant={variant as any} />;
}
