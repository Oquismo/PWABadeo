import { NextResponse } from 'next/server';

interface TicketmasterEvent {
  id: string;
  name: string;
  description?: string;
  dates: {
    start: {
      dateTime: string;
      localDate: string;
      localTime: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      address?: {
        line1: string;
      };
      city?: {
        name: string;
      };
    }>;
  };
  images?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  classifications?: Array<{
    segment: { name: string };
    genre: { name: string };
  }>;
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') || 'Sevilla';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const categories = url.searchParams.get('categories') || '';

    // API Key de Ticketmaster desde variables de entorno
    const apiKey = process.env.EVENTOS;

    if (!apiKey) {
      throw new Error('EVENTOS API key not configured in environment variables');
    }

    // Construir la URL de Ticketmaster Discovery API
    const ticketmasterUrl = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    ticketmasterUrl.searchParams.set('apikey', apiKey);
    ticketmasterUrl.searchParams.set('city', location);
    ticketmasterUrl.searchParams.set('countryCode', 'ES'); // España
    ticketmasterUrl.searchParams.set('size', limit.toString());
    ticketmasterUrl.searchParams.set('sort', 'date,asc');

    console.log('Ticketmaster URL:', ticketmasterUrl.toString());

    const response = await fetch(ticketmasterUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      // Si es 404, significa que no hay eventos
      if (response.status === 404) {
        console.log('No events found for the search criteria (404 from Ticketmaster)');
        return NextResponse.json({
          ok: true,
          events: [],
          total: 0,
          service: 'Ticketmaster Discovery API',
          message: 'No se encontraron eventos próximos en Ticketmaster para esta ubicación. Esto puede deberse a que no hay eventos publicados actualmente.'
        });
      }

      // Para otros errores, sí lanzamos excepción
      console.error('Ticketmaster API error:', response.status, response.statusText);
      throw new Error(`Ticketmaster API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Ticketmaster response:', data);

    // Transformar los datos de Ticketmaster al formato esperado
    const events = (data._embedded?.events || []).map((event: TicketmasterEvent) => {
      // Función helper para obtener la mejor imagen
      const getBestImage = (images?: Array<{url: string, width: number, height: number}>) => {
        if (!images || images.length === 0) return null;
        // Preferir imagen de tamaño mediano
        const mediumImage = images.find(img => img.width >= 500 && img.width <= 1000);
        return mediumImage?.url || images[0]?.url || null;
      };

      return {
        id: event.id,
        name: event.name,
        description: event.description || 'Sin descripción disponible',
        startDate: event.dates?.start?.dateTime || event.dates?.start?.localDate + 'T' + (event.dates?.start?.localTime || '00:00:00'),
        endDate: event.dates?.start?.dateTime || event.dates?.start?.localDate + 'T' + (event.dates?.start?.localTime || '23:59:59'),
        url: `https://www.ticketmaster.es/event/${event.id}`,
        venue: event._embedded?.venues?.[0]?.name || 'Lugar por confirmar',
        address: event._embedded?.venues?.[0]?.address?.line1 || 'Dirección no disponible',
        image: getBestImage(event.images),
        category: event.classifications?.[0]?.segment?.name || event.classifications?.[0]?.genre?.name || 'General',
        format: 'Evento',
        isFree: false, // Ticketmaster generalmente no tiene eventos gratuitos
        ticketAvailability: true, // Asumimos que están disponibles
        minPrice: event.priceRanges?.[0]?.min ? {
          currency: event.priceRanges[0].currency,
          value: event.priceRanges[0].min
        } : null,
        maxPrice: event.priceRanges?.[0]?.max ? {
          currency: event.priceRanges[0].currency,
          value: event.priceRanges[0].max
        } : null
      };
    });

    return NextResponse.json({
      ok: true,
      events,
      total: events.length,
      service: 'Ticketmaster Discovery API',
      pagination: data.page,
      message: events.length === 0 ? 'No se encontraron eventos próximos en Ticketmaster para esta ubicación. Esto puede deberse a que no hay eventos publicados actualmente.' : null
    });

  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      ok: false,
      error: String(error.message),
      service: 'Events API'
    }, { status: 500 });
  }
}