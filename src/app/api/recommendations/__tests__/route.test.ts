import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../route';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv('YELP_API_KEY', 'test-yelp-api-key');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ businesses: [] }),
    text: vi.fn().mockResolvedValue(''),
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('GET /api/recommendations', () => {
  it('forwards requested tourist categories to Yelp instead of forcing restaurants', async () => {
    const categories = 'museums,artsandcrafts,localflavor,tours,landmarks';
    const request = new Request(
      `http://localhost/api/recommendations?lat=37.385&lng=-5.9925&query=Sevilla%20landmarks&categories=${categories}&limit=20`,
    );

    const response = await GET(request);
    const upstreamUrl = new URL(fetchMock.mock.calls[0][0]);

    expect(response.status).toBe(200);
    expect(upstreamUrl.searchParams.get('categories')).toBe(categories);
    expect(upstreamUrl.searchParams.get('term')).toBe('Sevilla landmarks');
    expect(upstreamUrl.searchParams.get('limit')).toBe('20');
  });

  it('continues to accept the legacy singular category parameter', async () => {
    const request = new Request(
      'http://localhost/api/recommendations?lat=37.385&lng=-5.9925&category=italian',
    );

    await GET(request);

    const upstreamUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(upstreamUrl.searchParams.get('categories')).toBe('italian');
  });
});
