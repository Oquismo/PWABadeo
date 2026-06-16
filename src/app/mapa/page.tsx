'use client';

import dynamic from 'next/dynamic';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';

const InteractiveMap = dynamic(
  () => import('@/components/mapa/InteractiveMap'),
  { ssr: false, loading: () => <Material3LoadingPage text="Cargando mapa" subtitle="Preparando lugares..." size="large" /> }
);

export default function MapaPage() {
  return <InteractiveMap />;
}
