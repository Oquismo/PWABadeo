// src/components/mapa/InteractiveMap.tsx (Este código es el que ya tienes y debería funcionar)
'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLng } from 'leaflet';
import { Box, Typography, Fab, TextField, IconButton, InputAdornment, Button, Stack, Chip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import Image from 'next/image';

import { placesData, Place } from '@/data/places'; 
import AddPlaceModal from './AddPlaceModal'; 

import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const getCategoryIcon = (category: string) => {
  let iconUrl: string;
  let shadowUrl: string = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

  switch (category) {
    case 'Cultural':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
      break;
    case 'Comida':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
      break;
    case 'Ocio':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png';
      break;
    case 'Servicios':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png';
      break;
    case 'Estudio':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-darkblue.png';
      break;
    case 'Transporte':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png';
      break;
    case 'Salud': // Esta es la categoría específica
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-darkred.png'; // Este es el icono
      break;
    case 'Personalizado':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
      break;
    default: // Para cualquier otra categoría no especificada o las de 'locations'
      iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
  }

  return new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface LocationPoint {
  position: LatLngExpression;
  name: string;
  description: string;
}

const locations: LocationPoint[] = [
  {
    position: [37.3891, -5.9845],
    name: 'Tu Alojamiento',
    description: 'Calle Falsa, 123'
  },
  {
    position: [37.3828, -5.9732],
    name: 'Oficina Barrio de Oportunidades',
    description: 'Plaza de España'
  },
  {
    position: [37.4023, -5.9965],
    name: 'Tu Empresa / Universidad',
    description: 'Isla de la Cartuja'
  },
  {
    position: [37.3756, -5.9926],
    name: 'Residencia Universitaria One Sevilla',
    description: 'C. Páez de Rivera, 1, 41012 Sevilla'
  },
];

function MapController({ setMap }: { setMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
}

function LocationButton({ setUserPosition }: { setUserPosition: (pos: LatLng) => void }) {
  const map = useMap();
  const handleClick = () => {
    map.locate().on('locationfound', function (e) {
      setUserPosition(e.latlng);
      map.flyTo(e.latlng, 15);
    }).on('locationerror', function(e){
      alert(e.message);
    });
  };

  return (
    <Fab
      color="primary"
      size="small"
      onClick={handleClick}
      sx={{ position: 'absolute', top: 85, right: 10, zIndex: 1000 }}
      aria-label="find my location"
    >
      <MyLocationIcon />
    </Fab>
  );
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    const mapElement = map.getContainer();
    if (mapElement && mapElement.parentElement) {
      resizeObserver.observe(mapElement.parentElement);
    }

    return () => {
      if (mapElement && mapElement.parentElement) {
        resizeObserver.unobserve(mapElement.parentElement);
      }
    };
  }, [map]);
  return null;
}

export default function InteractiveMap() {
  const defaultPosition: LatLngExpression = [37.3891, -5.9845];
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState<L.Map | null>(null);
  const [customPlaces, setCustomPlaces] = useState<Place[]>([]);
  const apiKey = 'Gq2uZmTMhM4Vpv2fhXOR';

  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [coordsToAddPlace, setCoordsToAddPlace] = useState<LatLng | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const filterCategories: string[] = [
    'Todos',
    'Cultural',
    'Comida',
    'Ocio',
    'Servicios',
    'Estudio',
    'Transporte',
    'Salud',
    'Personalizado'
  ];

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressDuration = 700;

  const handleMapLongPress = (latlng: LatLng) => {
    setCoordsToAddPlace(latlng);
    setShowAddPlaceModal(true);
  };

  const startLongPressTimer = (latlng: LatLng) => {
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      handleMapLongPress(latlng);
      longPressTimer.current = null;
    }, longPressDuration);
  };

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    if (map) {
      const mapContainer = map.getContainer();

      const handlePointerDown = (e: PointerEvent) => {
        if ((e.button === 0 || e.pointerType === 'touch') && e.isPrimary) {
          const latlng = map.mouseEventToLatLng(e);
          startLongPressTimer(latlng);
        }
      };

      const handlePointerUp = () => clearLongPressTimer();
      const handlePointerLeave = () => clearLongPressTimer();
      const handlePointerCancel = () => clearLongPressTimer();


      mapContainer.addEventListener('pointerdown', handlePointerDown);
      mapContainer.addEventListener('pointerup', handlePointerUp);
      mapContainer.addEventListener('pointerleave', handlePointerLeave);
      mapContainer.addEventListener('pointercancel', handlePointerCancel);


      return () => {
        clearLongPressTimer();
        mapContainer.removeEventListener('pointerdown', handlePointerDown);
        mapContainer.removeEventListener('pointerup', handlePointerUp);
        mapContainer.removeEventListener('pointerleave', handlePointerLeave);
        mapContainer.removeEventListener('pointercancel', handlePointerCancel);
      };
    }
  }, [map, handleMapLongPress]);


  useEffect(() => {
    const savedPlacesRaw = localStorage.getItem('userCustomPlaces');
    if (savedPlacesRaw) {
      try {
        setCustomPlaces(JSON.parse(savedPlacesRaw));
      } catch (e) {
        console.error("Error al parsear lugares personalizados desde localStorage:", e);
        setCustomPlaces([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userCustomPlaces', JSON.stringify(customPlaces));
  }, [customPlaces]);


  const handleSearch = async () => {
    if (!searchQuery || !map) return;
    
    const bbox = "-6.1,37.3,-5.8,37.5";
    
    try {
      const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${apiKey}&bbox=${bbox}`);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].center;
        const newPosition = new LatLng(lat, lon);
        map.flyTo(newPosition, 15);
      } else {
        alert('No se encontraron resultados para tu búsqueda en el área de Sevilla.');
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert('Ocurrió un error al realizar la búsqueda.');
    }
  };

  const handleAddPlaceSubmit = (newPlace: Place) => {
    setCustomPlaces((prevPlaces) => [...prevPlaces, newPlace]);
    setShowAddPlaceModal(false);
    setCoordsToAddPlace(null);
    alert('¡Lugar personalizado añadido con éxito!');
  };

  const handleCloseAddPlaceModal = () => {
    setShowAddPlaceModal(false);
    setCoordsToAddPlace(null);
  };

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar un lugar en Sevilla..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearch} edge="end">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1, mb: 2, '::-webkit-scrollbar': { display: 'none' } }}>
        {filterCategories.map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => setSelectedCategory(category)}
            sx={{
              color: selectedCategory !== category ? 'text.secondary' : undefined,
              borderColor: selectedCategory !== category ? 'rgba(255, 255, 255, 0.23)' : 'primary.main',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              py: 2,
              px: 1.5,
              cursor: 'pointer',
              backgroundColor: selectedCategory === category ? 'primary.main' : 'transparent',
              '&.MuiChip-filled.MuiChip-colorPrimary': { 
                color: selectedCategory === category ? 'white' : undefined, 
              }
            }}
            variant={selectedCategory === category ? 'filled' : 'outlined'}
            color={selectedCategory === category ? 'primary' : undefined}
          />
        ))}
      </Stack>

      <MapContainer 
        center={defaultPosition} 
        zoom={14} 
        style={{ 
          height: '65vh',
          width: '100%', 
          borderRadius: '16px', 
          position: 'relative', 
          zIndex: 0 
        }}
      >
        <TileLayer
            url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${apiKey}`}
            attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
        />
        
        {/* Marcadores de ubicaciones predefinidas (siempre visibles, no filtradas por categoría) */}
        {/* Usamos el icono por defecto para estas ubicaciones generales */}
        {locations.map((loc) => {
            const [lat, lng] = Array.isArray(loc.position) ? loc.position : [loc.position.lat, loc.position.lng];
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
            
            return (
              <Marker key={loc.name} position={loc.position} icon={getCategoryIcon('Tu Alojamiento')}> 
                  <Popup>
                      <Box>
                          <Typography variant="subtitle2" component="div" fontWeight="bold">{loc.name}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>{loc.description}</Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DirectionsIcon />}
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Cómo llegar
                          </Button>
                      </Box>
                  </Popup>
              </Marker>
            );
        })}

        {/* Marcadores de Lugares de Interés predefinidos (FILTRADOS Y CON ICONO PERSONALIZADO) */}
        {placesData.filter(place => selectedCategory === 'Todos' || place.category === selectedCategory).map((place) => {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;
            
            return (
              <Marker key={place.id} position={place.coordinates} icon={getCategoryIcon(place.category)}>
                  <Popup>
                      <Box sx={{ maxWidth: 200 }}>
                          {place.imageUrl && (
                            <Image
                                src={place.imageUrl}
                                alt={place.name}
                                width={180}
                                height={100}
                                objectFit="cover"
                                style={{ borderRadius: '8px', marginBottom: 8 }}
                            />
                          )}
                          <Typography variant="subtitle1" component="div" fontWeight="bold">{place.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Categoría: {place.category}
                          </Typography>
                          {place.address && (
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                              {place.address}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            {place.description}
                          </Typography>
                          
                          {place.link && (
                            <Button
                                variant="text"
                                size="small"
                                href={place.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textTransform: 'none', mb: 0.5 }}
                            >
                                Más info
                            </Button>
                          )}
                          
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DirectionsIcon />}
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            fullWidth
                          >
                            Cómo llegar
                          </Button>
                      </Box>
                  </Popup>
              </Marker>
            );
        })}

        {/* Marcadores de Puntos de Interés Personalizados por el Usuario (FILTRADOS Y CON ICONO PERSONALIZADO) */}
        {customPlaces.filter(place => selectedCategory === 'Todos' || (selectedCategory === 'Personalizado' && !placesData.some(p => p.id === place.id)) || (selectedCategory !== 'Personalizado' && place.category === selectedCategory) ).map((place) => {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;
            
            // La lógica de filtrado ya está en el `.filter` de arriba.
            // Aquí solo nos aseguramos de que se muestre con el icono correcto.

            return (
              <Marker key={place.id} position={place.coordinates} icon={getCategoryIcon('Personalizado')}>
                  <Popup>
                      <Box sx={{ maxWidth: 200 }}>
                          {place.imageUrl && place.imageUrl.startsWith('http') && (
                            <Image
                                src={place.imageUrl}
                                alt={place.name}
                                width={180}
                                height={100}
                                objectFit="cover"
                                style={{ borderRadius: '8px', marginBottom: 8 }}
                            />
                          )}
                          <Typography variant="subtitle1" component="div" fontWeight="bold">{place.name} (Personalizado)</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Categoría: {place.category}
                          </Typography>
                          {place.address && (
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                              {place.address}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            {place.description}
                          </Typography>
                          
                          {place.link && (
                            <Button
                                variant="text"
                                size="small"
                                href={place.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textTransform: 'none', mb: 0.5 }}
                            >
                                Más info
                            </Button>
                          )}
                          
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DirectionsIcon />}
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            fullWidth
                          >
                            Cómo llegar
                          </Button>
                      </Box>
                  </Popup>
              </Marker>
            );
        })}


        {userPosition && (
            <Marker 
              position={userPosition}
              icon={L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                shadowSize: [41, 41],
                shadowAnchor: [13, 41]
              })}
            >
                <Popup>Estás aquí</Popup>
            </Marker>
        )}

        <MapController setMap={setMap} />
        <LocationButton setUserPosition={setUserPosition} />
        <MapResizer />
      </MapContainer>

      <AddPlaceModal
        open={showAddPlaceModal}
        onClose={handleCloseAddPlaceModal}
        onSubmit={handleAddPlaceSubmit}
        coords={coordsToAddPlace}
      />
    </Box>
  );
}