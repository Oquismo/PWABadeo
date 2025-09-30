import { useState, useEffect } from 'react';

export interface YelpPlace {
  id: string;
  name: string;
  categories: string[];
  address: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  phoneNumber?: string;
  website?: string;
  price?: string;
}

export function useYelpPlace(placeName: string, defaultLat: number = 37.3886, defaultLng: number = -5.9826) {
  const [place, setPlace] = useState<YelpPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlace() {
      try {
        setLoading(true);
        setError(null);

        // Buscar lugares turísticos en Sevilla
        const params = new URLSearchParams();
        params.set('lat', String(defaultLat));
        params.set('lng', String(defaultLng));
        params.set('query', 'Sevilla landmarks tourist attractions');
        params.set('categories', 'museums,artsandcrafts,localflavor,tours,landmarks');
        params.set('limit', '20'); // Obtener más resultados para filtrar

        const res = await fetch(`/api/recommendations?${params.toString()}`);
        const json = await res.json();

        if (!json.ok || !json.items || json.items.length === 0) {
          console.log('No se encontraron lugares turísticos en Sevilla');
          throw new Error('No se encontraron lugares turísticos');
        }

        // Buscar el lugar que mejor coincida con el nombre
        const searchName = placeName.toLowerCase();
        let bestMatch = null;
        let bestScore = 0;

        for (const item of json.items) {
          const itemName = item.name.toLowerCase();
          const itemAddress = (item.raw?.location?.display_address || []).join(' ').toLowerCase();
          
          // Calcular score de coincidencia
          let score = 0;
          if (itemName.includes(searchName) || searchName.includes(itemName)) score += 10;
          if (itemAddress.includes(searchName.split(' ')[0])) score += 5; // Primera palabra del lugar
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
          }
        }

        if (!bestMatch) {
          console.log('No se encontró coincidencia para:', placeName, 'entre los resultados:', json.items.map((i: any) => i.name));
          throw new Error(`No se encontró ${placeName} en los resultados`);
        }

        console.log('Mejor coincidencia para', placeName, ':', bestMatch.name, 'Score:', bestScore);
        const item = bestMatch;
        const mappedPlace: YelpPlace = {
          id: item.id,
          name: item.name,
          categories: item.categories || [],
          address: item.address || (item.raw?.location?.display_address || []).join(', '),
          coordinates: {
            lat: item.lat || item.raw?.coordinates?.latitude || defaultLat,
            lng: item.lng || item.raw?.coordinates?.longitude || defaultLng
          },
          rating: item.rating || 0,
          reviewCount: item.raw?.review_count || 0,
          image: (item.photos && item.photos[0]?.url) || item.raw?.image_url || '',
          description: item.raw?.description || `Información sobre ${item.name} obtenida de Yelp.`,
          phoneNumber: item.raw?.phone || item.raw?.display_phone,
          website: item.url || item.raw?.url,
          price: item.price
        };

        console.log('Lugar mapeado:', mappedPlace);
        setPlace(mappedPlace);
      } catch (err: any) {
        console.error('Error fetching place from Yelp:', err);
        setError(err.message || 'Error al cargar datos del lugar');
      } finally {
        setLoading(false);
      }
    }

    if (placeName) {
      fetchPlace();
    }
  }, [placeName, defaultLat, defaultLng]);

  return { place, loading, error };
}