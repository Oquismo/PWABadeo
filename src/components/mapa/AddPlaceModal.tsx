// src/components/mapa/AddPlaceModal.tsx
'use client';

import React, { useState } from 'react';
import {
  Typography,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import Material3Dialog from '@/components/ui/Material3Dialog';
import MaterialTextField from '@/components/ui/MaterialTextField';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { LatLng } from 'leaflet';
import { Place } from '@/data/places'; // Importamos la interfaz Place

interface AddPlaceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newPlace: Place) => void;
  coords: LatLng | null;
}

export default function AddPlaceModal({ open, onClose, onSubmit, coords }: AddPlaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Place['category'] | ''>(''); // Usamos el tipo Place['category']
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = () => {
    if (!name || !description || !category || !coords) {
      alert('Por favor, rellena todos los campos obligatorios (nombre, descripción, categoría).');
      return;
    }

    const newPlace: Place = {
      id: `custom-${Date.now()}`, // ID único
      name,
      description,
      category: category as Place['category'], // Se asegura el tipo
      coordinates: { lat: coords.lat, lng: coords.lng },
      imageUrl: imageUrl || undefined, // Si está vacío, es undefined
      address: address || undefined,
      link: link || undefined,
    };

    onSubmit(newPlace);
    // Reiniciar formulario y cerrar modal
    setName('');
    setDescription('');
    setCategory('');
    setImageUrl('');
    setAddress('');
    setLink('');
    onClose();
  };

  return (
    <Material3Dialog
      open={open}
      onClose={onClose}
      title="Añadir Nuevo Lugar Personalizado"
      icon={<LocationOnIcon />}
      supportingText={`Coordenadas: ${coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'N/A'}`}
      maxWidth="sm"
      fullWidth
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim() || !description.trim() || !category}
        >
          Añadir Lugar
        </Button>
      }
    >
      <Stack spacing={3}>
        <MaterialTextField
          label="Nombre del Lugar"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          fullWidth
          required
          supportingText="Introduce el nombre del lugar que quieres añadir"
        />
        <MaterialTextField
          label="Descripción"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          required
          supportingText="Describe brevemente el lugar y sus características"
        />
        <FormControl fullWidth required>
          <InputLabel id="category-label">Categoría</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            label="Categoría"
            onChange={(e) => setCategory(e.target.value as Place['category'])}
          >
            <MenuItem value=""><em>Selecciona una categoría</em></MenuItem>
            <MenuItem value="Cultural">Cultural</MenuItem>
            <MenuItem value="Comida">Comida</MenuItem>
            <MenuItem value="Ocio">Ocio</MenuItem>
            <MenuItem value="Servicios">Servicios</MenuItem>
            <MenuItem value="Estudio">Estudio</MenuItem>
            <MenuItem value="Transporte">Transporte</MenuItem>
            <MenuItem value="Salud">Salud</MenuItem>
          </Select>
        </FormControl>
        <MaterialTextField
          label="URL de la Imagen (opcional)"
          value={imageUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
          fullWidth
          supportingText="Puedes añadir una imagen del lugar con una URL"
        />
        <MaterialTextField
          label="Dirección (opcional)"
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
          fullWidth
          supportingText="Añade la dirección del lugar si la conoces"
        />
        <MaterialTextField
          label="Enlace web (opcional)"
          value={link}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
          fullWidth
          supportingText="Sitio web, redes sociales o información adicional"
        />
      </Stack>
    </Material3Dialog>
  );
}