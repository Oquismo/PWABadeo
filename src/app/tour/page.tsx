import dynamic from 'next/dynamic';
import React from 'react';

export const metadata = {
  title: 'Tour',
  description: 'Lugares para visitar cerca de ti',
};

const TourClient = dynamic(() => import('./TourClient'), { ssr: false });

export default function TourPage() {
  return <TourClient />;
}
