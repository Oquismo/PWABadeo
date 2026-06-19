'use client';

import React from 'react';
import { Box, Typography, Button, CircularProgress, Skeleton } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InboxIcon from '@mui/icons-material/Inbox';

interface LoadingSkeletonProps {
  count?: number;
  height?: number;
  width?: string | number;
}

export function LoadingSkeleton({ count = 3, height = 80, width = '100%' }: LoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={height} sx={{ width, borderRadius: 2 }} />
      ))}
    </Box>
  );
}

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorMessage({ message, onRetry, compact }: ErrorMessageProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 1.5 : 2,
        py: compact ? 2 : 4,
        px: 2,
        textAlign: 'center',
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: compact ? 28 : 40 }} />
      <Box>
        <Typography variant={compact ? 'body2' : 'body1'} color="error.main" fontWeight={500}>
          {message || 'Algo salió mal al cargar los datos'}
        </Typography>
        {onRetry && (
          <Button
            size={compact ? 'small' : 'medium'}
            variant="outlined"
            color="error"
            onClick={onRetry}
            sx={{ mt: compact ? 0.5 : 1, textTransform: 'none', borderRadius: 2 }}
          >
            Reintentar
          </Button>
        )}
      </Box>
    </Box>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        py: 4,
        px: 2,
        textAlign: 'center',
      }}
    >
      {icon || <InboxIcon sx={{ fontSize: 48, color: 'text.disabled' }} />}
      {title && (
        <Typography variant="h6" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      )}
      {message && (
        <Typography variant="body2" color="text.disabled">
          {message}
        </Typography>
      )}
      {action}
    </Box>
  );
}

interface SpinnerProps {
  message?: string;
}

export function Spinner({ message }: SpinnerProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
      <CircularProgress size={32} />
      {message && <Typography variant="body2" color="text.secondary">{message}</Typography>}
    </Box>
  );
}
