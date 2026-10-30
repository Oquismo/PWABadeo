import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';

import MapHeader from '../MapHeader';
import { placesData } from '@/data/places';

describe('MapHeader', () => {
  it('introduces the city map and announces the available place count', () => {
    render(createElement(MapHeader));

    expect(screen.getByRole('heading', { name: 'Explora Sevilla' }).textContent).toBe('Explora Sevilla');
    expect(screen.getByLabelText(`${placesData.length} lugares en el mapa`)).toBeDefined();
  });
});
