"use client";

import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

export default function ScrollProgress({ height = 2 }: { height?: number }) {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const doc = document.documentElement;

    function update() {
      const scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
      const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight || 0);
      const clientHeight = window.innerHeight || doc.clientHeight;
      const max = Math.max(0, scrollHeight - clientHeight);
      const pct = max > 0 ? Math.min(100, Math.round((scrollTop / max) * 100)) : 0;
      setProgress(pct);
      ticking.current = false;
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // init
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // color: use theme primary main as single expressive color
  const color = theme.palette.primary?.main ?? '#6750A4';

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: height,
        zIndex: 1600,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ width: '100%', height: '100%', bgcolor: 'transparent' }}>
        {/* base bar */}
        <motion.div
          style={{
            height: '100%',
            transformOrigin: '0 50%',
            background: color,
            borderRadius: 999,
            willChange: 'transform'
          }}
          animate={{ scaleX: progress / 100 }}
          initial={{ scaleX: 0 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.12 }}
        />

        {/* glow layer: small blurred highlight that translates with progress */}
        <motion.div
          style={{
            position: 'absolute',
            top: -4,
            left: 0,
            height: 'calc(100% + 8px)',
            width: 120,
            pointerEvents: 'none',
            filter: 'blur(6px)',
            opacity: 0.7,
            background: color,
            borderRadius: 999,
            willChange: 'transform'
          }}
          animate={{ x: `calc(${progress}% - 120px)` }}
          initial={{ x: '-120px' }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
        />
      </Box>
    </Box>
  );
}
