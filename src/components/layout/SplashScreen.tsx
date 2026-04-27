'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Fade, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    // Mostrar por 2 segundos y luego mostrar flash
    const timer1 = setTimeout(() => setShowFlash(true), 1800);
    const timer2 = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: theme => theme.palette.mode === 'dark'
            ? '#1C1B1F'
            : '#FEF7FF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: 4,
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <Box
            component="img"
            src="/img/logo.png"
            alt="Barrio de Oportunidades"
            sx={{
              width: { xs: 180, sm: 200 },
              height: { xs: 180, sm: 200 },
              borderRadius: '32px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 20px rgba(0, 0, 0, 0.2))',
            }}
          />
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'text.primary',
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            Barrio de Oportunidades
          </Typography>
        </motion.div>

        {/* Loading Indicator de Material Design 3 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              position: 'relative',
              mt: 3,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: '3px solid',
                borderColor: theme => theme.palette.mode === 'dark'
                  ? 'rgba(232, 222, 248, 0.24)'
                  : 'rgba(103, 80, 164, 0.24)',
                borderRadius: '50%',
                borderTopColor: theme => theme.palette.primary.main,
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              },
            }}
          />
        </motion.div>

        {/* Efecto Material Express - Shimmer al final */}
        {showFlash && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
              zIndex: 10000,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
    </Fade>
  );
}