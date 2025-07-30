'use client';

import { Stack, Chip } from '@mui/material';

// 1. La interfaz ahora incluye la propiedad 'filters'
interface FilterChipsProps {
  filters: string[];
  selected: string;
  setSelected: (filter: string) => void;
}

export default function FilterChips({ filters, selected, setSelected }: FilterChipsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 2, '::-webkit-scrollbar': { display: 'none' } }}>
      {/* 2. Ahora usamos el array 'filters' que llega por las props */}
      {filters.map((filter) => (
        <Chip
          key={filter}
          label={filter}
          onClick={() => setSelected(filter)}
          sx={{
            color: selected === filter ? 'primary.main' : 'text.secondary',
            borderColor: selected === filter ? 'primary.main' : 'rgba(255, 255, 255, 0.23)',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            py: 2,
            px: 1.5,
            cursor: 'pointer'
          }}
          variant={selected === filter ? 'filled' : 'outlined'}
          color={selected === filter ? 'primary' : undefined}
        />
      ))}
    </Stack>
  );
}