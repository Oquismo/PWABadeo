// src/components/mapa/PlacesListSection.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton, Stack, Chip, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import PlaceCard from '@/components/places/PlaceCard';
import { placesData, Place } from '@/data/places';
import { useAuth } from '@/context/AuthContext';

// Interfaz para las props del nuevo componente
interface PlacesListSectionProps {
  onPlaceSelected?: (place: Place) => void; // Si en el futuro quieres que al seleccionar un lugar, el mapa se centre
}

export default function PlacesListSection({ onPlaceSelected }: PlacesListSectionProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);

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

  useEffect(() => {
    let userCustomPlaces: Place[] = [];
    if (user) {
      const savedPlacesRaw = localStorage.getItem('userCustomPlaces');
      if (savedPlacesRaw) {
        try {
          userCustomPlaces = JSON.parse(savedPlacesRaw);
        } catch (e) {
          console.error("Error al parsear lugares personalizados desde localStorage:", e);
          userCustomPlaces = [];
        }
      }
    }
    const combinedPlaces = [...placesData];
    userCustomPlaces.forEach(customPlace => {
        if (!combinedPlaces.some(p => p.id === customPlace.id)) {
            combinedPlaces.push(customPlace);
        }
    });

    setAllPlaces(combinedPlaces);
  }, [user]);

  const filteredPlaces = useMemo(() => {
    return allPlaces.filter(place => {
      const matchesCategory = selectedCategory === 'Todos' || 
                              place.category === selectedCategory ||
                              (selectedCategory === 'Personalizado' && !placesData.some(p => p.id === place.id)); 

      const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [allPlaces, selectedCategory, searchQuery]);


  return (
    <Container sx={{ py: 2 }}> {/* Ajustado padding para el componente dentro del Drawer */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Explora Sevilla
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lugares interesantes, servicios y más.
        </Typography>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por nombre, descripción o dirección..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => { /* La búsqueda ya se activa con onChange */ }} edge="end">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1, mb: 3, '::-webkit-scrollbar': { display: 'none' } }}>
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

      {filteredPlaces.length > 0 ? (
        <Box sx={{ pb: 2 }}> {/* Reducido padding final ya que estará en un Drawer */}
          {filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          No se encontraron lugares para la categoría/búsqueda seleccionada.
        </Typography>
      )}
    </Container>
  );
}