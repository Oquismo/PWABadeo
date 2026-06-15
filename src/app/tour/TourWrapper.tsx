'use client';

import dynamic from 'next/dynamic';

const TourClient = dynamic(() => import('./TourClient'), { ssr: false });

export default function TourWrapper() {
  return <TourClient />;
}
