'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect, useRef } from 'react';

const EMPHASIZED_EASE = [0.2, 0, 0, 1.0] as const;
const EMPHASIZED_DECELERATE = [0.05, 0.7, 0.1, 1.0] as const;

function useReducedMotion(): boolean {
  const mqlRef = useRef<MediaQueryList | null>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    mqlRef.current = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mqlRef.current.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mqlRef.current.addEventListener('change', handler);
    return () => mqlRef.current?.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMounted = useRef(false);
  const reduced = useReducedMotion();

  const [exitingContent, setExitingContent] = useState<ReactNode | null>(null);

  const prevPathRef = useRef(pathname);
  const contentRef = useRef<ReactNode>(children);

  // Detect path change during render to capture the OLD content before it's lost
  if (pathname !== prevPathRef.current) {
    setExitingContent(contentRef.current);
    prevPathRef.current = pathname;
  }
  contentRef.current = children;

  useEffect(() => {
    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const timer = window.setTimeout(() => {
      setExitingContent(null);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!isMounted.current) return <>{children}</>;

  if (reduced) return <>{children}</>;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <AnimatePresence>
        {exitingContent && (
          <motion.div
            key="exiting"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EMPHASIZED_EASE }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 1,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
            aria-hidden
          >
            {exitingContent}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.2,
          ease: EMPHASIZED_DECELERATE,
        }}
        style={{
          position: 'relative',
          zIndex: 2,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
