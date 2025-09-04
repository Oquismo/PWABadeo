'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';
import MaterialCalendar from '@/components/home/MaterialCalendar';

export default function CalendarSection() {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.5rem', md: '2rem' },
          color: '#E8EAED',
          mb: 3,
          textAlign: 'center',
          fontFamily: '"Google Sans", "Roboto", sans-serif',
        }}
      >
        {t('pages.home.calendar')}
      </Typography>
      
      <MaterialCalendar />
    </Box>
  );
} 
