'use client';

import React from 'react';
import { Box, Skeleton } from '@mui/material';

export default function PageSkeleton({ height = 220 }: { height?: number }) {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Skeleton variant="rectangular" height={height} animation="wave" />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="30%" />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    </Box>
  );
}
