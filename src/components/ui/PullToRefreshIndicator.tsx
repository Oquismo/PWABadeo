'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const PullIndicatorContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: theme.spacing(2),
}));

const ProgressRing = styled(Box)<{ progress: number }>(({ theme, progress }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: `3px solid ${theme.palette.divider}`,
  borderTop: `3px solid ${theme.palette.primary.main}`,
  transform: `rotate(${progress * 3.6}deg)`,
  transition: 'transform 0.1s ease-out',
}));

interface PullToRefreshIndicatorProps {
  progress: number;
  isRefreshing?: boolean;
  pullText?: string;
  releaseText?: string;
}

export default function PullToRefreshIndicator({
  progress,
  isRefreshing = false,
  pullText = "Tira para actualizar",
  releaseText = "Suelta para actualizar"
}: PullToRefreshIndicatorProps) {
  const showIndicator = progress > 0 || isRefreshing;
  const isReadyToRefresh = progress >= 100;

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <PullIndicatorContainer>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                transform: `translateY(${Math.min(progress / 2, 30)}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {isRefreshing ? (
                <CircularProgress size={32} />
              ) : (
                <ProgressRing progress={progress} />
              )}

              <Typography
                variant="caption"
                sx={{
                  color: isReadyToRefresh ? 'primary.main' : 'text.secondary',
                  fontWeight: isReadyToRefresh ? 600 : 400,
                  textAlign: 'center',
                  maxWidth: 200,
                }}
              >
                {isRefreshing
                  ? "Actualizando..."
                  : isReadyToRefresh
                    ? releaseText
                    : pullText
                }
              </Typography>
            </Box>
          </PullIndicatorContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}