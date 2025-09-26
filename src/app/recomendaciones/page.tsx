import dynamic from 'next/dynamic';
import React from 'react';

export const metadata = {
  title: 'Recomendaciones',
  description: 'Restaurantes y lugares recomendados en Sevilla',
};

// Import dinámico del componente cliente para evitar problemas con SSR
const RecomendacionesClient = dynamic(() => import('./RecomendacionesClient'), { ssr: false });

export default function RecomendacionesPage() {
  return <RecomendacionesClient />;
}