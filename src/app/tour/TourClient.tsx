"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// Import the recommendations client (already implemented) and reuse it dynamically (no SSR)
const RecomendacionesClient = dynamic(() => import('../recomendaciones/RecomendacionesClient'), { ssr: false });

export default function TourClient() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})` }}>
      <Container maxWidth="lg" sx={{ pt: 2, pb: 8 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
          Tour — Lugares para visitar
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Recomendaciones de sitios y puntos de interés cerca de ti. Los datos se obtienen desde la API central de recomendaciones.
        </Typography>

        {/* Fetch remote recommendations for TOUR and pass them down to the shared UI. */}
        <TourRemoteLoader />
      </Container>
    </Box>
  );
}

function TourRemoteLoader() {
  const [items, setItems] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      
      // Función para cargar datos de Yelp
      const loadYelpData = async (lat: number, lng: number) => {
        try {
          const params = new URLSearchParams();
          params.set('lat', String(lat));
          params.set('lng', String(lng));
          params.set('query', 'landmarks');
          params.set('categories', 'landmarks,arts');
          params.set('limit', '30');
          const res = await fetch(`/api/recommendations?${params.toString()}`);
          const json = await res.json();
          if (!mounted) return;
          const mapped = (json.items || []).map((it: any) => ({
            id: it.id,
            name: it.name,
            cuisine: (it.categories && it.categories[0]) || 'Sitio Turístico',
            priceRange: it.price || '€',
            rating: it.rating || 0,
            reviewCount: it.raw?.review_count || 0,
            address: it.address || (it.raw?.location?.display_address || []).join(', '),
            coordinates: { lat: it.lat || it.raw?.coordinates?.latitude || 0, lng: it.lng || it.raw?.coordinates?.longitude || 0 },
            image: (it.photos && it.photos[0]?.url) || it.raw?.image_url || '',
            openNow: Boolean(it.raw?.is_closed === false || it.raw?.hours?.[0]?.is_open_now === true),
            description: it.raw?.description || '',
            specialties: it.raw?.specialties || [],
            openingHours: undefined,
            phoneNumber: it.raw?.phone || it.raw?.display_phone || undefined,
            website: it.url || it.raw?.url || undefined
          }));
          setItems(mapped);
        } catch (e: any) {
          setError(String(e));
        } finally {
          setLoading(false);
        }
      };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          await loadYelpData(pos.coords.latitude, pos.coords.longitude);
        }, async (err) => {
          // Si hay error de geolocalización, usar coordenadas por defecto de Sevilla
          console.log('Error obteniendo ubicación, usando Sevilla por defecto:', err);
          await loadYelpData(37.3886, -5.9826); // Coordenadas de Sevilla
        });
      } else {
        // Si no hay soporte de geolocalización, usar Sevilla por defecto
        console.log('Geolocalización no soportada, usando Sevilla por defecto');
        await loadYelpData(37.3886, -5.9826);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Cargando tour...</div>;
  if (error) return <div>Error cargando tour: {error}</div>;
  if (!items) return null;

  return <RecomendacionesClient mode="tour" defaultQuery="sights" initialRemoteRestaurants={items} />;
}
