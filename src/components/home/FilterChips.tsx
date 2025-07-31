// src/components/home/FilterChips.tsx
'use client';

import { Stack, Chip } from '@mui/material';

// La interfaz ahora incluye la propiedad 'filters'
interface FilterChipsProps {
  filters: string[];
  selected: string;
  setSelected: (filter: string) => void;
}

export default function FilterChips({ filters, selected, setSelected }: FilterChipsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 2, '::-webkit-scrollbar': { display: 'none' } }}>
      {/* Usamos el array 'filters' que llega por las props */}
      {filters.map((filter) => (
        <Chip
          key={filter}
          label={filter}
          onClick={() => setSelected(filter)}
          sx={{
            // MODIFICACIÓN CLAVE: Solo aplicamos el color 'text.secondary' si NO está seleccionado.
            // Si está seleccionado, Material-UI aplicará automáticamente el color de contraste (primary.contrastText).
            color: selected !== filter ? 'text.secondary' : undefined,
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