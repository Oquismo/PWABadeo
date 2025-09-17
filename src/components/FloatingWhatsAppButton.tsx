'use client';

import React, { useEffect, useRef } from 'react';
import { Fab } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  phone?: string; // número en formato +34... (con +)
  message?: string;
}

export default function FloatingWhatsAppButton({ phone = '+34649347760', message }: Props) {
  const { t } = useTranslation();

  // Open WhatsApp chat with the phone number only (no prefilled message)
  const url = `https://wa.me/${phone.replace(/[^+0-9]/g, '')}`;

  const fabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let rafId = 0;
    const lastScrollY = { current: typeof window !== 'undefined' ? window.scrollY : 0 };
    const offset = { current: 0 };

    // update offset on scroll (passive listener)
    const onScroll = () => {
      const scrollY = window.scrollY || 0;
      const delta = scrollY - lastScrollY.current;
      lastScrollY.current = scrollY;
      // accumulate with a factor to make motion subtle, clamp to avoid large jumps
      offset.current = Math.max(-80, Math.min(80, offset.current + delta * 0.35));
    };

    // RAF loop: decay offset and apply transform
    const tick = () => {
      offset.current *= 0.85; // decay
      if (fabRef.current) {
        fabRef.current.style.transform = `translateY(${offset.current}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
      // reset transform
      if (fabRef.current) fabRef.current.style.transform = '';
    };
  }, []);

  return (
    <Fab
      color="success"
      aria-label={t('pages.phones.neighborhoodEmergency') || 'Badeo'}
      sx={{
        position: 'fixed',
        // Place above the feedback Fab: same right offset, larger bottom offset
        bottom: (theme) => `calc(64px + ${theme.spacing(2)} + ${theme.spacing(8)})`,
        right: (theme) => theme.spacing(2),
        color: 'background.default',
        zIndex: 1300,
        willChange: 'transform'
      }}
      ref={fabRef}
      onClick={() => {
        try {
          window.open(url, '_blank');
        } catch (e) {
          window.location.href = url;
        }
      }}
    >
      <WhatsAppIcon />
    </Fab>
  );
}
