'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect, useRef } from 'react';
import PageSkeleton from './PageSkeleton';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPathRef = useRef(pathname);
  const lastChildrenRef = useRef<ReactNode>(children);

  // Snapshot ya no contiene el nodo anterior para evitar 'pantallazos' no deseados.
  // Sólo guardamos la altura anterior para mantener el layout estable.
  const [snapshot, setSnapshot] = useState<null | { key: string | null; height: number }>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mantener referencia al children anterior para poder hacer snapshot cuando cambie la ruta
  useEffect(() => {
    lastChildrenRef.current = children;
  }, [children]);

  // Cuando cambia la ruta, crear un snapshot del contenido anterior para crossfade
  useEffect(() => {
    if (!isMounted) return;
    if (pathname !== lastPathRef.current) {
      const height = containerRef.current ? containerRef.current.offsetHeight : 0;
      // Guardamos sólo la altura previa; no renderizamos el contenido anterior.
      setSnapshot({ key: lastPathRef.current, height });
      lastPathRef.current = pathname;

      // Mostrar skeleton inmediatamente para mejorar percepción de carga
      setShowSkeleton(true);

      // Limpiar snapshot tras la duración de la animación (un poco de margen)
      const t = window.setTimeout(() => {
        setSnapshot(null);
        setShowSkeleton(false);
      }, 360);

      return () => { clearTimeout(t); };
    }
  }, [pathname, isMounted]);

  // --- SOLUCIÓN DEFINITIVA ---
  // Si el componente aún no se ha "montado" en el navegador,
  // devolvemos el contenido sin animación para que coincida con el renderizado del servidor.
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: snapshot ? snapshot.height : undefined }}>
      <AnimatePresence mode="wait">
        {/* Snapshot (anterior) - queda detrás y se desvanece */}
        {snapshot && (
          // Renderizamos un placeholder neutro (skeleton) en lugar del contenido anterior
          <motion.div
            key={`snapshot-${String(snapshot.key)}`}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.995 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              pointerEvents: 'none',
              zIndex: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div style={{ width: '100%' }}>
              <PageSkeleton height={snapshot.height || 220} />
            </div>
          </motion.div>
        )}

        {/* Contenido actual - aparece por encima */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6, scale: 0.997 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: snapshot ? 'relative' : 'relative',
            zIndex: 1,
            width: '100%',
            willChange: 'opacity, transform',
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          {showSkeleton ? <PageSkeleton height={snapshot?.height || 220} /> : children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
