'use client';

import React, { useEffect, useRef, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  stagger?: number; // ms between children
}

export default function AnimatedEntrance({ children, className, stagger = 80 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const childrenEls = Array.from(el.children) as HTMLElement[];
    childrenEls.forEach((c) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(12px)';
      c.style.transition = 'opacity 420ms cubic-bezier(.22,.9,.3,1), transform 420ms cubic-bezier(.22,.9,.3,1)';
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          childrenEls.forEach((c, i) => {
            setTimeout(() => {
              c.style.opacity = '1';
              c.style.transform = 'translateY(0)';
            }, i * stagger);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.12 });

    io.observe(el);

    return () => io.disconnect();
  }, [stagger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
