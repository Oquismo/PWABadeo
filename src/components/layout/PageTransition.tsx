'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- SOLUCIÓN DEFINITIVA ---
  // Si el componente aún no se ha "montado" en el navegador,
  // devolvemos el contenido sin animación para que coincida con el renderizado del servidor.
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          // Prevenir saltos durante las transiciones
          width: '100%',
          willChange: 'opacity, transform', // Optimización de rendimiento
          backfaceVisibility: 'hidden', // Prevenir flickering
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
