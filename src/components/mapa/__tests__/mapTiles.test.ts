import { describe, expect, it } from 'vitest';

import { TILE_SERVERS } from '../mapTiles';

describe('map tile providers', () => {
  it('starts with the keyless OpenStreetMap provider', () => {
    expect(TILE_SERVERS[0].url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  });

  it('keeps CARTO as a fallback provider', () => {
    expect(TILE_SERVERS[1].url).toContain('basemaps.cartocdn.com');
  });
});
