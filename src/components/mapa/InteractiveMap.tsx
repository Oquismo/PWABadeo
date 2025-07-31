'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLng } from 'leaflet';
import { Box, Typography, Fab, TextField, IconButton, InputAdornment, Button } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import Image from 'next/image';

// Importar los nuevos datos de lugares
import { placesData, Place } from '@/data/places'; 
// Importar el nuevo modal
import AddPlaceModal from './AddPlaceModal'; 

// Arreglo para los iconos por defecto
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

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
];

// Componente que nos da acceso a la instancia del mapa y maneja la pulsación larga
function MapEventHandler({ setMap, onLongPress }: { setMap: (map: L.Map) => void; onLongPress: (latlng: LatLng) => void }) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressDuration = 700; // Milisegundos para considerar una pulsación larga

  const startLongPressTimer = (latlng: LatLng) => {
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      onLongPress(latlng);
      longPressTimer.current = null;
    }, longPressDuration);
  };

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const map = useMapEvents({
    load: (e) => setMap(e.target as L.Map),
    mousedown: (e) => startLongPressTimer(e.latlng),
    mouseup: () => clearLongPressTimer(),
    mouseout: () => clearLongPressTimer(), 
  });

  useEffect(() => {
    return () => clearLongPressTimer();
  }, []);

  return null;
}

// Componente para el botón de geolocalización
function LocationButton({ setUserPosition }: { setUserPosition: (pos: LatLng) => void }) {
    const map = useMapEvents({
      locationfound: (e) => {
          setUserPosition(e.latlng);
          map.flyTo(e.latlng, 15);
      },
      locationerror: (e) => {
          alert(e.message);
      }
    });

    const handleClick = () => {
      map.locate();
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

// Componente para ajustar el tamaño del mapa cuando su contenedor cambia
function MapResizer() {
  const map = useMapEvents({});
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
      map.invalidateSize(); // Forzar un último resize al desmontar
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
  const apiKey = 'Gq2uZmTMhM4Vpv2fhXOR'; // Tu clave API de MapTiler

  // Estados para el modal de añadir lugar
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [coordsToAddPlace, setCoordsToAddPlace] = useState<LatLng | null>(null);

  // Cargar puntos personalizados del localStorage al inicio
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

  // Función para guardar puntos personalizados en localStorage
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

  // Función que se llamará cuando se detecte una pulsación larga
  const handleMapLongPress = (latlng: LatLng) => {
    setCoordsToAddPlace(latlng);
    setShowAddPlaceModal(true); // Abrir el modal
  };

  // Función para manejar el envío del formulario del modal
  const handleAddPlaceSubmit = (newPlace: Place) => {
    setCustomPlaces((prevPlaces) => [...prevPlaces, newPlace]); // Añadir al estado
    setShowAddPlaceModal(false); // Cerrar modal
    setCoordsToAddPlace(null); // Limpiar coordenadas
    alert('¡Lugar personalizado añadido con éxito!'); // Confirmación al usuario
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
        
        {/* Marcadores de ubicaciones predefinidas */}
        {locations.map((loc) => {
            const [lat, lng] = Array.isArray(loc.position) ? loc.position : [loc.position.lat, loc.position.lng];
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
            
            return (
              <Marker key={loc.name} position={loc.position}>
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

        {/* Marcadores de Lugares de Interés predefinidos */}
        {placesData.map((place) => {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;
            
            return (
              <Marker key={place.id} position={place.coordinates}>
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

        {/* Marcadores de Puntos de Interés Personalizados por el Usuario */}
        {customPlaces.map((place) => {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;
            
            return (
              <Marker key={place.id} position={place.coordinates}>
                  <Popup>
                      <Box sx={{ maxWidth: 200 }}>
                          {/* Las imágenes de customPlaces podrían no tener URL segura, aquí podrías añadir una validación o fallback */}
                          {place.imageUrl && place.imageUrl.startsWith('http') && ( // Asegura que la URL es válida
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
            <Marker position={userPosition}>
                <Popup>Estás aquí</Popup>
            </Marker>
        )}

        <MapEventHandler setMap={setMap} onLongPress={handleMapLongPress} /> 
        <LocationButton setUserPosition={setUserPosition} />
        <MapResizer />
      </MapContainer>

      {/* El Modal para añadir lugares personalizado */}
      <AddPlaceModal
        open={showAddPlaceModal}
        onClose={handleCloseAddPlaceModal}
        onSubmit={handleAddPlaceSubmit}
        coords={coordsToAddPlace}
      />
    </Box>
  );
}