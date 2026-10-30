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
    <Box
      component="section"
      aria-label="Mapa de Sevilla"
      sx={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 76px)',
        left: { xs: 14, sm: 24 },
        right: { xs: 14, sm: 'auto' },
        width: { xs: 'auto', sm: 400 },
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        pointerEvents: 'none',
      }}
    >
      <Box
        className="map-header-card"
        sx={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.25,
          pl: 2,
          borderRadius: '9999px',
          bgcolor: 'var(--md-glass)',
          border: '1px solid var(--md-outline-variant)',
          boxShadow: 'var(--md-shadow-card)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="p" sx={{ m: 0, color: 'primary.main', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.16em', lineHeight: 1.4 }}>
            MI ERASMUS · SEVILLA
          </Typography>
          <Typography component="h1" sx={{ m: 0, fontFamily: display, fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Explora Sevilla
          </Typography>
        </Box>
        <Box
          component="span"
          aria-label={`${count} lugares en el mapa`}
          sx={{
            flex: '0 0 auto',
            minWidth: 56,
            height: 44,
            px: 1.5,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '9999px',
            bgcolor: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
            fontWeight: 800,
            fontSize: '0.9rem',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </Box>
      </Box>

      {onQueryChange && (
        <Box
          sx={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            height: 48,
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
            pointerEvents: 'auto',
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
