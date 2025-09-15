import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Residencia',
  description: 'Información sobre la residencia',
};

export default function ResidenciaPage() {
  // Ocultar la página devolviendo 404 para que no sea accesible públicamente
  notFound();
  return null;
}
