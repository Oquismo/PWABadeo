'use client';

import { useMemo, useState } from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { placesData, Place } from '@/data/places';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

const CATEGORY_COLORS: Record<string, string> = {
  Residencia: '#7c4dff',
  Comida: '#ff6d00',
  Salud: '#00c853',
  Transporte: '#00bcd4',
  Metro: '#2979ff',
  Ocio: '#ff1744',
  Cultural: '#d500f9',
  Servicios: '#ff9100',
  Estudio: '#00e676',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Residencia: '🏠',
  Comida: '🍽️',
  Salud: '🏥',
  Transporte: '🚌',
  Metro: '🚇',
  Ocio: '🎉',
  Cultural: '🏛️',
  Servicios: '🔧',
  Estudio: '📚',
};

const allCategories = Object.keys(CATEGORY_COLORS);

interface PlacesListSectionProps {
  onPlaceSelect?: (place: Place) => void;
}

export default function PlacesListSection({ onPlaceSelect }: PlacesListSectionProps) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = placesData;
    if (activeCategory) list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, search]);

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      {/* Search */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        bgcolor: alpha(theme.palette.common.white, 0.05),
        borderRadius: 3, px: 2, py: 1, mb: 2,
        border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
      }}>
        <SearchRoundedIcon sx={{ fontSize: 20, color: alpha(theme.palette.text.primary, 0.4) }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrar lugares…"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            color: theme.palette.text.primary, fontSize: '0.9rem', fontFamily: 'inherit',
          }}
        />
        {search && (
          <CloseRoundedIcon
            onClick={() => setSearch('')}
            sx={{ fontSize: 18, color: alpha(theme.palette.text.primary, 0.3), cursor: 'pointer' }}
          />
        )}
      </Box>

      {/* Category pills */}
      <Box sx={{
        display: 'flex', gap: 1, overflowX: 'auto', mb: 3,
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      }}>
        <Chip
          label="Todos"
          size="small"
          onClick={() => setActiveCategory(null)}
          variant={activeCategory === null ? 'filled' : 'outlined'}
          sx={{
            borderRadius: 2, fontWeight: 600, flexShrink: 0,
            bgcolor: activeCategory === null ? alpha('#7c4dff', 0.2) : 'transparent',
            color: activeCategory === null ? '#7c4dff' : alpha(theme.palette.text.primary, 0.6),
            borderColor: alpha(theme.palette.common.white, 0.1),
          }}
        />
        {allCategories.map(cat => (
          <Chip
            key={cat}
            label={`${CATEGORY_EMOJIS[cat] || ''} ${cat}`}
            size="small"
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            variant={activeCategory === cat ? 'filled' : 'outlined'}
            sx={{
              borderRadius: 2, fontWeight: 600, flexShrink: 0,
              bgcolor: activeCategory === cat ? alpha(CATEGORY_COLORS[cat], 0.2) : 'transparent',
              color: activeCategory === cat ? CATEGORY_COLORS[cat] : alpha(theme.palette.text.primary, 0.6),
              borderColor: activeCategory === cat ? alpha(CATEGORY_COLORS[cat], 0.4) : alpha(theme.palette.common.white, 0.1),
            }}
          />
        ))}
      </Box>

      {/* Places grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filtered.map(place => {
          const color = CATEGORY_COLORS[place.category] || '#78909c';
          return (
            <Box
              key={place.id}
              onClick={() => onPlaceSelect?.(place)}
              sx={{
                display: 'flex', gap: 2, p: 1.5,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.common.white, 0.03),
                border: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.06),
                  borderColor: alpha(color, 0.3),
                  transform: 'translateX(4px)',
                },
              }}
            >
              {/* Icon */}
              <Box sx={{
                width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
                background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                border: `1px solid ${alpha(color, 0.2)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>
                {CATEGORY_EMOJIS[place.category] || '📍'}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{
                  fontWeight: 700, mb: 0.25,
                  color: theme.palette.text.primary,
                  fontSize: '0.9rem',
                }}>
                  {place.name}
                </Typography>
                {place.address && (
                  <Typography variant="caption" sx={{
                    display: 'block', mb: 0.5,
                    color: alpha(theme.palette.text.primary, 0.45),
                    fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {place.address}
                  </Typography>
                )}
                <Typography variant="caption" sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  color: alpha(theme.palette.text.primary, 0.55),
                  fontSize: '0.7rem',
                }}>
                  {place.description}
                </Typography>
              </Box>

              {/* Distance / Arrow */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <DirectionsWalkIcon sx={{ fontSize: 20, color: alpha(theme.palette.text.primary, 0.2) }} />
              </Box>
            </Box>
          );
        })}
      </Box>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.4) }}>
            No se encontraron lugares
          </Typography>
        </Box>
      )}
    </Box>
  );
}
