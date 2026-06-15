'use client';

import dynamic from 'next/dynamic';

const RecomendacionesClient = dynamic(() => import('./RecomendacionesClient'), { ssr: false });

export default function RecomendacionesWrapper() {
  return <RecomendacionesClient />;
}
