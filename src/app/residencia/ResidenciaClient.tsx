"use client";

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Avatar,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
// AccessTimeIcon, WifiIcon, RestaurantIcon and MapIcon removed (chips removed)
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PlaceIcon from '@mui/icons-material/Place';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { placesData } from '@/data/places';
import { useTranslation } from '@/hooks/useTranslation';

const InteractiveMap = dynamic(
  () => import('@/components/mapa/InteractiveMap'),
  { ssr: false }
);

function MapComponentWrapper({ specificKey, overrideKey }: { specificKey?: string | null, overrideKey?: string | null }) {
  // Encuentra el lugar en placesData por clave (match id o name) usando normalización
  const keyToUse = overrideKey || specificKey;
  if (!keyToUse) return <div />;

  const normalize = (s?: string) => {
    if (!s) return '';
    try {
      // NFD + remove diacritics, to lower, keep alnum
      return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    } catch (e) {
      return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
    }
  };

  const keyNorm = normalize(keyToUse);
  // Mapeo explícito entre claves usadas en `residenciaContent` y los ids de `placesData`
  const residenciaToPlaceId: Record<string, string> = {
    'AMBRO': 'residencia-amro',
    'AMRO': 'residencia-amro',
    'ESTANISLAO': 'residencia-estanislao',
    'ARMENDARIZ': 'micampus-armendariz',
    'ARMENDARI': 'micampus-armendariz',
    'MICAMPUS': 'micampus-armendariz',
    'MICAMPUS ARMENDARIZ': 'micampus-armendariz'
  };

  // Primer intento: mapping directo por clave normalizada
  const directId = residenciaToPlaceId[(keyToUse || '').toUpperCase()];
  let found = directId ? placesData.find(p => p.id === directId) : undefined;

  // Segundo intento: matching por id/name normalizados
  if (!found) {
    found = placesData.find(p => {
      const idNorm = normalize(p.id);
      const nameNorm = normalize(p.name);
      return idNorm.includes(keyNorm) || nameNorm.includes(keyNorm);
    });
  }

  // Fallbacks más tolerantes
  if (!found) {
    // Intento específico para Armendáriz sin depender de acentos/variantes
    if (keyNorm.includes('armendar') || keyNorm.includes('armendariz')) {
      const fallback = placesData.find(p => p.id === 'micampus-armendariz');
      return <InteractiveMap selectedPlace={fallback} compact height={260} markersOnly />;
    }

    // Intento por startsWith o contains más suelto
    const fuzzy = placesData.find(p => normalize(p.name).includes(keyNorm) || normalize(p.id).includes(keyNorm));
    // Debug panel: mostrar intento y claves normalizadas
    return (
      <div>
        <div style={{ padding: 8, background: '#fff3cd', borderRadius: 8, marginBottom: 8 }}>
          <strong>Debug residencias:</strong>
          <div>Valor original: <code>{keyToUse}</code></div>
          <div>Normalizado: <code>{keyNorm}</code></div>
          <div>Fuzzy encontrado: <code>{fuzzy ? fuzzy.id : 'no'}</code></div>
        </div>
        <InteractiveMap selectedPlace={fuzzy} compact height={260} markersOnly />
      </div>
    );
  }

  // Si no encontramos nada, intentar construir selectedPlace desde residenciaContent (coordenadas)
  if (!found) {
    try {
      // Importar residenciaContent dinámicamente desde el mismo archivo (es accesible en el scope global del módulo)
      // ...existing code...
    } catch (e) {}
  }

  return <InteractiveMap selectedPlace={found} compact height={260} markersOnly />;
}

export default function ResidenciaClient() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [openConstruction, setOpenConstruction] = React.useState(false);

  const handleCloseConstruction = () => setOpenConstruction(false);
  

  // Contenido por residencia (claves normalizadas: ONE y AMBRO)
  const residenciaContent: Record<string, any> = {
    ONE: {
      title: 'Residencia ONE',
      image: '/img/residencia_one.jpg',
      wifi: { ssid: 'ONE-Guest', password: 'one2025' },
      receptionPhone: '+34 600 111 222',
      notes: 'Entrada principal c/ Mayor 12. Sala de estudio abierta 24h.',
      website: 'https://www.livinnx.com/'
    },
    AMBRO: {
      title: 'Residencia AMRO',
      image: '/img/AMRO.webp',
      wifi: { ssid: 'AMRO-WiFi', password: '(preguntar en recepción)' },
      receptionPhone: '+34 955 31 40 88',
      address: 'C. Elche, C. Ali Al-Gomari, 41013 Sevilla (BARRIO DE LOS BERMEJALES)',
      transport: 'La parada del autobús (el 37) está literalmente al lado de la residencia',
      services: 'Mercadona a 8 min a pie',
      roomTypes: 'Individuales, Dobles estándar (dos camas con baño compartido), TWODIOS (dos hab. individuales + dos baños privados + zona común con cocina)',
      amenities: 'Amplias zonas comunes, piscina en la azotea, lavandería de autoservicio (a gettoni), plancha (solicitar en recepción), gimnasio',
      meals: 'Pensión completa. Comida para llevar con 24-48h de antelación en recepción',
      rules: 'Horarios de silencio desde las 23:00 hasta la mañana siguiente por respeto a los estudiantes universitarios',
      notes: 'No hay secadores de pelo (solicitar en recepción). No hay jabón/champú pero encontrarán bolsa de bienvenida en las habitaciones.',
      website: '#'
    },
    ESTANISLAO: {
      title: 'Residencia Estanislao',
      image: '/img/Estanislao.jpg',
      wifi: { ssid: 'Estanislao-WiFi', password: '(preguntar en recepción)' },
      receptionPhone: '(preguntar en recepción)',
      address: 'Ctra. Su Eminencia, 2A, 41013 Sevilla',
      services: 'Cash Fresh a 6 min a pie',
      roomTypes: 'Individuales, Dobles estándar (dos camas con baño compartido), Doble litera',
      amenities: 'Amplias zonas comunes, piscina, cancha de padel, lavandería de autoservicio (a gettoni), plancha (solicitar en recepción), gimnasio',
      meals: 'Pensión completa. Comida para llevar con 24-48h de antelación en recepción',
      rules: 'Horarios de silencio desde las 23:00 hasta la mañana siguiente por respeto a los estudiantes universitarios',
      notes: 'No hay secadores de pelo (solicitar en recepción). No hay jabón/champú pero encontrarán bolsa de bienvenida en las habitaciones.',
      website: '#'
    },
    ARMENDARIZ: {
      title: 'Micampus Armendáriz',
      image: '/img/Armendari.jpg',
      wifi: { ssid: 'Armendariz-WiFi', password: '(preguntar en recepción)' },
      receptionPhone: '(preguntar en recepción)',
      address: 'Ctra. Su Eminencia, 15, 41013 Sevilla',
      services: 'Cash Fresh a 6 min a pie',
      roomTypes: 'Individuales, Dobles estándar (dos camas con baño compartido), Doble apartamento (dos hab. individuales + dos baños privados + zona común con cocina)',
      amenities: 'Zonas comunes, lavandería de autoservicio (a gettoni), plancha (solicitar en recepción), pequeño gimnasio',
      meals: 'Pensión completa. Comida para llevar con 24-48h de antelación en recepción',
      notes: 'No hay secadores de pelo (solicitar en recepción). No hay jabón/champú pero encontrarán bolsa de bienvenida en las habitaciones.',
      website: 'https://www.micampus.com/'
    }
  };

  const rawResidencia = user && (user as any).residence ? String((user as any).residence).trim() : null;
  const residenciaKey = rawResidencia ? rawResidencia.toUpperCase() : null;
  const specific = residenciaKey && residenciaContent[residenciaKey] ? residenciaContent[residenciaKey] : null;

  // Fallback image
  const imageSrc = specific?.image ?? '/img/logo.png';

  // Coordenadas de las residencias (desde places.ts)
  const residenciaCoordinates: Record<string, { lat: number; lng: number }> = {
    AMBRO: { lat: 37.35195144264452, lng: -5.97526460125809 },
    ESTANISLAO: { lat: 37.35645121300518, lng: -5.978122866568905 },
    ARMENDARIZ: { lat: 37.357238681403636, lng: -5.976824126984121 },
    ONE: { lat: 37.3895687188777, lng: -5.9916432331313185 } // Coordenadas por defecto si no está definida
  };

  // Función para abrir Google Maps con ruta desde ubicación actual
  const openGoogleMapsRoute = () => {
    const coords = residenciaKey && residenciaCoordinates[residenciaKey] 
      ? residenciaCoordinates[residenciaKey]
      : residenciaCoordinates.AMBRO; // Fallback a AMBRO
    
    // URL de Google Maps con ruta desde ubicación actual hasta la residencia
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=walking`;
    window.open(mapsUrl, '_blank');
  };

  // Lista de residencias para interacción rápida
  // quick-select removed; keep content mapping only

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
      <Dialog open={openConstruction} onClose={handleCloseConstruction} aria-labelledby="construccion-title">
        <DialogTitle id="construccion-title">
          {t('pages.residencia.construction.title')}
          <IconButton
            aria-label="close"
            onClick={handleCloseConstruction}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>{t('pages.residencia.construction.body')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConstruction} autoFocus>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {/* Quick-select buttons removed per user request */}
        </Grid>
        <Grid item xs={12} md={5}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardMedia component="img" height="220" image={imageSrc} alt={specific?.title ?? 'Residencia'} />
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <InfoIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h1" fontWeight={700}>
                    {specific ? specific.title : 'Residencia'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Información y servicios principales</Typography>
                </Box>
              </Stack>

              {/* Chips de servicios eliminadas por solicitud del usuario */}

              <Divider sx={{ my: 2 }} />

              {/* Dirección específica */}
              {(residenciaKey === 'AMBRO' || residenciaKey === 'ESTANISLAO') && specific?.address && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Dirección</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {specific.address}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle1" gutterBottom>Wi‑Fi</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>{specific?.wifi?.ssid ?? 'Residencia-Guest'}</strong>
                {specific?.wifi?.password ? ` — ${specific.wifi.password}` : ''}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>Contacto</Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Button variant="outlined" startIcon={<LocalPhoneIcon />} href={`tel:${specific?.receptionPhone ?? '+34123456789'}`}>
                  Llamar recepción
                </Button>
                {specific?.website && (
                  <Button variant="contained" startIcon={<LanguageIcon />} component={MuiLink} href={specific.website} target="_blank" rel="noreferrer">
                    Sitio web
                  </Button>
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary">{specific?.notes ?? 'Información general de la residencia.'}</Typography>
            </CardContent>
          </Card>

          <Box sx={{ mt: 2 }}>
            <Card elevation={1} sx={{ p: 1, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">Horarios</Typography>
                <List dense>
                  <ListItem><ListItemText primary="Desayuno" secondary="7:30 — 9:30" /></ListItem>
                  <ListItem><ListItemText primary="Comida" secondary="13:00 — 15:00" /></ListItem>
                  <ListItem><ListItemText primary="Cena" secondary="20:00 — 22:00" /></ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

        </Grid>

        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Servicios destacados</Typography>
              <Grid container spacing={2}>
                {/* Servicios específicos por residencia */}
                {residenciaKey === 'AMBRO' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Piscina en azotea</Typography>
                          <Typography variant="body2" color="text.secondary">Acceso para residentes durante el día.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Lavandería a gettoni</Typography>
                          <Typography variant="body2" color="text.secondary">Autoservicio con monedas/fichas.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Gimnasio</Typography>
                          <Typography variant="body2" color="text.secondary">Acceso para residentes.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Plancha</Typography>
                          <Typography variant="body2" color="text.secondary">Solicitar en recepción.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Transporte</Typography>
                          <Typography variant="body2" color="text.secondary">Autobús 37 al lado de la residencia.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Mercadona</Typography>
                          <Typography variant="body2" color="text.secondary">A 8 minutos a pie.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                ) : residenciaKey === 'ESTANISLAO' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Piscina</Typography>
                          <Typography variant="body2" color="text.secondary">Acceso para residentes.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Cancha de Padel</Typography>
                          <Typography variant="body2" color="text.secondary">Para residentes y invitados.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Lavandería a gettoni</Typography>
                          <Typography variant="body2" color="text.secondary">Autoservicio con monedas/fichas.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Gimnasio</Typography>
                          <Typography variant="body2" color="text.secondary">Acceso para residentes.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Plancha</Typography>
                          <Typography variant="body2" color="text.secondary">Solicitar en recepción.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Cash Fresh</Typography>
                          <Typography variant="body2" color="text.secondary">A 6 minutos a pie.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                ) : residenciaKey === 'ARMENDARIZ' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Zonas comunes</Typography>
                          <Typography variant="body2" color="text.secondary">Espacios de convivencia para residentes.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Lavandería a gettoni</Typography>
                          <Typography variant="body2" color="text.secondary">Autoservicio con monedas/fichas.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Pequeño gimnasio</Typography>
                          <Typography variant="body2" color="text.secondary">Equipamiento básico para residentes.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Plancha</Typography>
                          <Typography variant="body2" color="text.secondary">Solicitar en recepción.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Cash Fresh</Typography>
                          <Typography variant="body2" color="text.secondary">A 6 minutos a pie.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                ) : (
                  <>
                    {/* Servicios generales para otras residencias */}
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Recepción 24h</Typography>
                          <Typography variant="body2" color="text.secondary">Atención en el hall; recogida de paquetes.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Lavandería</Typography>
                          <Typography variant="body2" color="text.secondary">Máquina autoservicio en sótano.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Gimnasio</Typography>
                          <Typography variant="body2" color="text.secondary">Acceso para residentes; horario 6:00 — 23:00.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">Limpieza</Typography>
                          <Typography variant="body2" color="text.secondary">Cambio de ropa de cama 1 vez/semana.</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Información específica por residencia */}
              {(residenciaKey === 'AMBRO' || residenciaKey === 'ESTANISLAO' || residenciaKey === 'ARMENDARIZ') && (
                <>
                  <Typography variant="h6" gutterBottom>Tipología de Habitaciones</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Individuales" 
                        secondary="Habitación individual con baño privado" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Dobles estándar" 
                        secondary="Dos camas en la misma habitación con baño compartido" 
                      />
                    </ListItem>
                    {residenciaKey === 'AMBRO' ? (
                      <ListItem>
                        <ListItemText 
                          primary="TWODIOS" 
                          secondary="Dos habitaciones individuales + dos baños privados + zona común con cocina" 
                        />
                      </ListItem>
                    ) : residenciaKey === 'ESTANISLAO' ? (
                      <ListItem>
                        <ListItemText 
                          primary="Doble litera" 
                          secondary="Habitación con litera para dos personas" 
                        />
                      </ListItem>
                    ) : residenciaKey === 'ARMENDARIZ' ? (
                      <ListItem>
                        <ListItemText 
                          primary="Doble apartamento" 
                          secondary="Dos habitaciones individuales + dos baños privados + zona común con cocina" 
                        />
                      </ListItem>
                    ) : null}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Pensión Completa</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Se puede pedir comida para llevar con 24-48h de antelación directamente en recepción.
                  </Typography>

                  <Typography variant="h6" gutterBottom>Información Importante</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Secadores de pelo" 
                        secondary="No hay en las habitaciones. Se puede pedir prestado en recepción." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Amenities" 
                        secondary="No hay jabón/champú, pero encontrarán bolsa de bienvenida en las habitaciones." 
                      />
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Typography variant="h6" gutterBottom>Normas rápidas</Typography>
              <List>
                {(residenciaKey === 'AMBRO' || residenciaKey === 'ESTANISLAO' || residenciaKey === 'ARMENDARIZ') ? (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary="Horarios de silencio" 
                        secondary="Desde las 23:00 hasta la mañana siguiente por respeto a los estudiantes universitarios" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Residencia universitaria" 
                        secondary="Recordamos que se trata de una residencia universitaria" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Respeto" 
                        secondary="Cuidar espacios comunes y respetar a otros residentes" 
                      />
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem><ListItemText primary="Mantener silencio" secondary="A partir de las 23:00" /></ListItem>
                    <ListItem><ListItemText primary="No fumar" secondary="Prohibido en zonas interiores" /></ListItem>
                    <ListItem><ListItemText primary="Respeto" secondary="Cuidar espacios comunes" /></ListItem>
                  </>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
              <Box sx={{ height: 260, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                {/* Reutilizar InteractiveMap en versión compacta para centrar la residencia */}
                <MapComponentWrapper specificKey={residenciaKey} />
              </Box>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  startIcon={<PlaceIcon />}
                  onClick={openGoogleMapsRoute}
                >
                  Ver ruta en Google Maps
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
