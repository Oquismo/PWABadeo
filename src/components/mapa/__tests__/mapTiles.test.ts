import { describe, expect, it } from 'vitest';

import { TILE_SERVERS } from '../mapTiles';

describe('map tile providers', () => {
  it('starts with the soft CARTO Voyager style without labels', () => {
    expect(TILE_SERVERS[0].url).toContain('voyager_nolabels');
  });

  it('keeps the keyless OpenStreetMap provider as a fallback', () => {
    expect(TILE_SERVERS[1].url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
});
