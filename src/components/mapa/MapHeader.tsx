'use client';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import type React from 'react';
import { Box, Typography } from '@mui/material';
import { placesData } from '@/data/places';

export interface MapHeaderProps {
  query?: string;
  onQueryChange?: (value: string) => void;
  categories?: string[];
  activeCategory?: string;
  onCategoryChange?: (value: string) => void;
  count?: number;
}

const display = 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)';

export default function MapHeader({
  query = '',
  onQueryChange,
  categories,
  activeCategory = 'Todo',
  onCategoryChange,
  count = placesData.length,
}: MapHeaderProps) {
  return (
    <Box component="section" aria-label="Mapa de Sevilla" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box className="map-header-card">
        <Typography component="h1" sx={{ m: 0, fontFamily: display, fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Explora Sevilla
        </Typography>
        <Typography component="p" sx={{ m: 0, mt: 0.25, fontSize: '0.8rem', color: 'text.secondary' }}>
          <Box component="span" aria-label={`${count} lugares en el mapa`} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {count} lugares
          </Box>
          {' · Todo cerca de tu residencia'}
        </Typography>
      </Box>

      {onQueryChange && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            height: 50,
            px: 2,
            borderRadius: '9999px',
            bgcolor: 'var(--md-surface)',
            border: '1px solid var(--md-outline-variant)',
            color: 'text.secondary',
            '&:focus-within': { borderColor: 'var(--md-azul)' },
          }}
        >
          <SearchRoundedIcon fontSize="small" />
          <Box
            component="input"
            id="map-search"
            type="search"
            value={query}
            placeholder="Buscar un lugar"
            aria-label="Buscar un lugar"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQueryChange(e.target.value)}
            sx={{ flex: 1, minWidth: 0, border: 0, outline: 0, bgcolor: 'transparent', color: 'text.primary', font: 'inherit', fontSize: '0.95rem' }}
          />
        </Box>
      )}

      {categories && onCategoryChange && (
        <Box
          role="group"
          aria-label="Filtrar por categoría"
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            mx: -0.25,
            px: 0.25,
            pb: 0.5,
          }}
        >
          {['Todo', ...categories].map((cat) => {
            const on = cat === activeCategory;
            return (
              <Box
                key={cat}
                component="button"
                type="button"
                aria-pressed={on}
                onClick={() => onCategoryChange(cat)}
                sx={{
                  flex: 'none',
                  height: 38,
                  px: 2,
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  border: '1px solid',
                  borderColor: on ? 'var(--md-on-surface)' : 'var(--md-outline-variant)',
                  bgcolor: on ? 'var(--md-on-surface)' : 'var(--md-surface)',
                  color: on ? 'var(--md-background)' : 'var(--md-on-surface)',
                  '&:focus-visible': { outline: '2px solid var(--md-azul)', outlineOffset: 2 },
                }}
              >
                {cat}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
