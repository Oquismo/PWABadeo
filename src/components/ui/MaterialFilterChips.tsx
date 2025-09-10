// src/components/ui/MaterialFilterChips.tsx

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

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
  style
}: MaterialFilterChipsProps) {
  const { t } = useTranslation();

  const handleChipClick = useCallback((category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(cat => cat !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
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
    'Personalizado': t('map.categories.custom') || 'Personalizado'
  }), [t]) as Record<string, string>;

  const getCategoryTranslation = useCallback((category: string): string => {
    return (categoryMap as Record<string, string>)[category] || category;
  }, [categoryMap]);

  return (
    <div
      className={`material-chip-set ${className || ''}`}
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 0 16px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        ...style
      }}
    >
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category);
        return (
          <button
            key={category}
            onClick={() => handleChipClick(category)}
            className={`material-filter-chip ${isSelected ? 'selected' : ''}`}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid',
              backgroundColor: isSelected ? 'rgb(255, 107, 53)' : 'rgb(44, 44, 44)',
              color: isSelected ? 'white' : 'rgb(220, 220, 220)',
              borderColor: isSelected ? 'rgb(255, 107, 53)' : 'rgb(80, 80, 80)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              outline: 'none',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            {isSelected && (
              <span style={{ 
                fontSize: '16px', 
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center'
              }}>
                ✓
              </span>
            )}
            {getCategoryTranslation(category)}
          </button>
        );
      })}
    </div>
  );
});

export default MaterialFilterChips;
