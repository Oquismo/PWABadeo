import dynamic from 'next/dynamic';
import React from 'react';

export const metadata = {
  title: 'Residencia',
  description: 'Información sobre la residencia',
};

// Import dinámico del componente cliente para evitar problemas con SSR
const ResidenciaClient = dynamic(() => import('./ResidenciaClient'), { ssr: false });

export default function ResidenciaPage() {
  return <ResidenciaClient />;
}
