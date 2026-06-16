import React, { useCallback, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme, alpha } from '@mui/material/styles';

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
  Personalizado: '#78909c',
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
  Personalizado: '📍',
};

interface MaterialFilterChipsProps {
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

const MaterialFilterChips = React.memo(function MaterialFilterChips({
  categories,
  selectedCategories,
  onCategoriesChange,
  className,
  style,
}: MaterialFilterChipsProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleChipClick = useCallback((category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(cat => cat !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
    if ('vibrate' in navigator) navigator.vibrate(50);
  }, [selectedCategories, onCategoriesChange]);

  const categoryMap = useMemo(() => ({
    'Todos': t('map.categories.all') || 'Todos',
    'Residencia': t('map.categories.residence') || 'Residencia',
    'Cultural': t('map.categories.cultural') || 'Cultural',
    'Comida': t('map.categories.food') || 'Comida',
    'Ocio': t('map.categories.leisure') || 'Ocio',
    'Servicios': t('map.categories.services') || 'Servicios',
    'Estudio': t('map.categories.study') || 'Estudio',
    'Transporte': t('map.categories.transport') || 'Transporte',
    'Metro': t('map.categories.metro') || 'Metro',
    'Salud': t('map.categories.health') || 'Salud',
    'Personalizado': t('map.categories.custom') || 'Personalizado',
  }), [t]);

  return (
    <div
      className={`material-chip-set ${className || ''}`}
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 0 12px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        ...style,
      }}
    >
      {categories.map(category => {
        const isSelected = selectedCategories.includes(category);
        const color = CATEGORY_COLORS[category] || '#78909c';
        const emoji = CATEGORY_EMOJIS[category] || '';
        return (
          <button
            key={category}
            onClick={() => handleChipClick(category)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              backgroundColor: isSelected ? alpha(color, 0.2) : 'transparent',
              color: isSelected ? color : alpha(theme.palette.text.primary, 0.65),
              borderColor: isSelected ? alpha(color, 0.4) : alpha(theme.palette.common.white, 0.1),
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: isSelected ? 700 : 500,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              outline: 'none',
              userSelect: 'none',
              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)'; }}
          >
            {emoji && <span style={{ fontSize: '14px', lineHeight: 1 }}>{emoji}</span>}
            {(categoryMap as Record<string, string>)[category] || category}
          </button>
        );
      })}
    </div>
  );
});

export default MaterialFilterChips;
