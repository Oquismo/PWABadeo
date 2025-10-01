'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect, useRef } from 'react';
import PageSkeleton from './PageSkeleton';

// Material Design 3 Expressive Motion System
// https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
const EMPHASIZED_EASE = [0.2, 0, 0, 1.0] as const; // Material 3 emphasized easing
const EMPHASIZED_DECELERATE = [0.05, 0.7, 0.1, 1.0] as const; // Material 3 decelerate easing

// Material 3 duration tokens - fast and energetic
const DURATION_MEDIUM = 0.25; // 250ms - Material 3 standard duration

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPathRef = useRef(pathname);
  const lastChildrenRef = useRef<ReactNode>(children);

  const [snapshot, setSnapshot] = useState<null | { key: string | null; height: number }>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    lastChildrenRef.current = children;
  }, [children]);

  // Mejorar la transición con control más fino
  useEffect(() => {
    if (!isMounted) return;
    if (pathname !== lastPathRef.current) {
      const height = containerRef.current ? containerRef.current.offsetHeight : 0;
      
      setIsTransitioning(true);
      setSnapshot({ key: lastPathRef.current, height });
      lastPathRef.current = pathname;
      setShowSkeleton(true);

      // Scroll suave al inicio de la página
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Limpiar con timing mejorado
      const cleanupTimer = window.setTimeout(() => {
        setSnapshot(null);
        setShowSkeleton(false);
        setIsTransitioning(false);
      }, 450);

      return () => { 
        clearTimeout(cleanupTimer);
      };
    }
  }, [pathname, isMounted]);

  // SSR: sin animación
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: snapshot ? snapshot.height : undefined,
        isolation: 'isolate', // Crear contexto de apilamiento
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {/* Página saliente - fade out con Material 3 */}
        {snapshot && (
          <motion.div
            key={`snapshot-${String(snapshot.key)}`}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 0, 
              scale: 0.96,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: DURATION_MEDIUM * 0.8, // 200ms exit
              ease: EMPHASIZED_EASE,
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              pointerEvents: 'none',
              zIndex: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '100%', opacity: 0.6 }}>
              <PageSkeleton height={snapshot.height || 220} />
            </div>
          </motion.div>
        )}

        {/* Página entrante - animación Material 3 expresiva */}
        <motion.div
          key={pathname}
          initial={{ 
            opacity: 0, 
            y: 16, 
            scale: 0.96,
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
          }}
          exit={{ 
            opacity: 0,
            scale: 0.96,
            transition: { duration: DURATION_MEDIUM * 0.8, ease: EMPHASIZED_EASE }
          }}
          transition={{
            duration: DURATION_MEDIUM,
            ease: EMPHASIZED_DECELERATE,
            opacity: { duration: DURATION_MEDIUM * 0.9 },
          }}
          style={{
            position: snapshot ? 'relative' : 'relative',
            zIndex: 1,
            width: '100%',
            willChange: isTransitioning ? 'opacity, transform, filter' : 'auto',
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          {showSkeleton ? <PageSkeleton height={snapshot?.height || 220} /> : children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
