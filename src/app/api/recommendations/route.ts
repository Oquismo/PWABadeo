
import { NextResponse } from 'next/server';
type YelpBusiness = any;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const query = url.searchParams.get('query') || 'restaurants';
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const category = url.searchParams.get('category') || '';

    if (!lat || !lng) {
      return NextResponse.json({ ok: false, error: 'lat and lng query params are required' }, { status: 400 });
    }

    // Leer la API Key de Yelp
    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'YELP_API_KEY not configured on server' }, { status: 500 });
    }

    // Construir parámetros para la búsqueda en Yelp
    const params = new URLSearchParams();
    params.set('latitude', lat);
    params.set('longitude', lng);
    params.set('categories', category || 'restaurants');
    params.set('limit', String(limit));
    if (query && query !== 'restaurants') {
      params.set('term', query);
    }

    const endpoint = `https://api.yelp.com/v3/businesses/search?${params.toString()}`;

    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({
        ok: false,
        status: res.status,
        error: errorText,
        service: 'Yelp'
      }, { status: res.status });
    }

    const data = await res.json();

    // Normalizar resultados al formato esperado
    const items = (data.businesses || []).map((b: YelpBusiness) => ({
      id: b.id,
      name: b.name,
      categories: (b.categories || []).map((c: any) => c.title),
      distance: b.distance || null,
      address: b.location?.display_address?.join(', ') || null,
      lat: b.coordinates?.latitude || null,
      lng: b.coordinates?.longitude || null,
      rating: b.rating || null,
      price: b.price || null,
      photos: b.image_url ? [{ url: b.image_url }] : [],
      url: b.url,
      raw: b
    }));

    return NextResponse.json({
      ok: true,
      items,
      service: 'Yelp',
      total: data.total || 0
    });

  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: String(err),
      service: 'Yelp'
    }, { status: 500 });
  }
}
