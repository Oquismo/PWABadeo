'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    // AnimatePresence es clave: permite que los componentes tengan una animación de "salida"
    <AnimatePresence mode="wait">
      {/* Usamos el pathname como 'key' para que AnimatePresence sepa que el componente ha cambiado */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 15 }} // Estado inicial: invisible y ligeramente desplazado
        animate={{ opacity: 1, y: 0 }} // Estado final: visible y en su posición original
        exit={{ opacity: 0, y: -15 }} // Estado de salida: se desvanece y se desplaza
        transition={{ duration: 0.3 }} // Duración de la animación
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}