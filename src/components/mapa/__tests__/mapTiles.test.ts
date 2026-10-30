import { describe, expect, it } from 'vitest';

import { MAP_ATTRIBUTION, OPENFREEMAP_STYLE_URL } from '../mapTiles';

describe('map style provider', () => {
  it('uses the keyless OpenFreeMap Positron style', () => {
    expect(OPENFREEMAP_STYLE_URL).toBe('https://tiles.openfreemap.org/styles/positron');
  });

  it('includes required OpenFreeMap, OpenMapTiles, and OpenStreetMap attribution', () => {
    expect(MAP_ATTRIBUTION).toContain('openfreemap.org');
    expect(MAP_ATTRIBUTION).toContain('openmaptiles.org');
    expect(MAP_ATTRIBUTION).toContain('openstreetmap.org/copyright');
  });
});
