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
  const [openConstruction, setOpenConstruction] = React.useState(true);

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
      title: 'Residencia Ambro',
      image: '/img/AMRO.webp',
      wifi: { ssid: 'Ambro-WiFi', password: 'ambro2025' },
      receptionPhone: '+34 600 333 444',
      notes: 'Edificio sur, acceso por patio. Gimnasio en planta -1.',
      website: '#'
    },
    ESTANISLAO: {
      title: 'Residencia Estanislao',
      image: '/img/Estanislao.jpg',
      wifi: { ssid: 'Estanislao-WiFi', password: 'estani2025' },
      receptionPhone: '+34 600 555 666',
      notes: 'Residencia céntrica con zonas de estudio y servicios.',
      website: '#'
    },
    ARMENDARIZ: {
      title: 'Micampus Armendáriz',
      image: '/img/Armendari.jpg',
      wifi: { ssid: 'Armendariz-WiFi', password: 'armenda2025' },
      receptionPhone: '+34 600 777 888',
      notes: 'Ubicada cerca de campus; entrada por C. Armendáriz.',
      website: 'https://www.micampus.com/'
    }
  };

  const rawResidencia = user && (user as any).residence ? String((user as any).residence).trim() : null;
  const residenciaKey = rawResidencia ? rawResidencia.toUpperCase() : null;
  const specific = residenciaKey && residenciaContent[residenciaKey] ? residenciaContent[residenciaKey] : null;

  // Fallback image
  const imageSrc = specific?.image ?? '/img/logo.png';

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
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Normas rápidas</Typography>
              <List>
                <ListItem><ListItemText primary="Mantener silencio" secondary="A partir de las 23:00" /></ListItem>
                <ListItem><ListItemText primary="No fumar" secondary="Prohibido en zonas interiores" /></ListItem>
                <ListItem><ListItemText primary="Respeto" secondary="Cuidar espacios comunes" /></ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
              <Box sx={{ height: 260, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                {/* Reutilizar InteractiveMap en versión compacta para centrar la residencia */}
                <MapComponentWrapper specificKey={residenciaKey} />
              </Box>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" startIcon={<PlaceIcon />}>Ver en mapa grande</Button>
                <Button variant="contained" startIcon={<LocalPhoneIcon />} href={`tel:${specific?.receptionPhone ?? '+34123456789'}`}>Llamar</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
