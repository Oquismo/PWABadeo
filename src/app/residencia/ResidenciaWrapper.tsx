'use client';

import dynamic from 'next/dynamic';

const ResidenciaClient = dynamic(() => import('./ResidenciaClient'), { ssr: false });

export default function ResidenciaWrapper() {
  return <ResidenciaClient />;
}
