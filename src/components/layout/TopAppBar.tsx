"use client";

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useRouter } from 'next/navigation';

type Variant = 'regular' | 'small';

export default function TopAppBar({ title = '', variant = 'regular' as Variant }: { title?: string; variant?: Variant }) {
  const theme = useTheme();
  const router = useRouter();

  const height = variant === 'small' ? 56 : 72; // ligeramente más grande
  const titleVariant = variant === 'small' ? 'subtitle1' : 'h6';

  return (
    <AppBar position="sticky" elevation={0} sx={{ top: 2, zIndex: 1500, background: 'transparent', boxShadow: 'none', border: 'none' }}>
      <Toolbar sx={{ minHeight: height, height }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            aria-label="Volver"
            sx={{ mr: 1, bgcolor: 'transparent', boxShadow: 'none', border: 'none' }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 28 }} />
          </IconButton>

          <Typography variant={titleVariant} component="div" sx={{ fontWeight: 700, fontSize: variant === 'small' ? '1rem' : '1.05rem' }}>
            {title}
          </Typography>

          {/* espacio flexible para otros elementos si se necesitan en el futuro */}
          <Box sx={{ flex: 1 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
