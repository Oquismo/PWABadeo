// src/components/mapa/AddPlaceModal.tsx
'use client';

import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { LatLng } from 'leaflet';
import { Place } from '@/data/places'; // Importamos la interfaz Place

interface AddPlaceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newPlace: Place) => void;
  coords: LatLng | null;
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
};

export default function AddPlaceModal({ open, onClose, onSubmit, coords }: AddPlaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Place['category'] | ''>(''); // Usamos el tipo Place['category']
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <Modal open={open} onClose={onClose} aria-labelledby="add-place-modal-title">
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        <Typography id="add-place-modal-title" variant="h6" component="h2" gutterBottom>
          Añadir Nuevo Lugar Personalizado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Coordenadas: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'N/A'}
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Nombre del Lugar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            required
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
          <TextField
            label="URL de la Imagen (opcional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
          />
          <TextField
            label="Dirección (opcional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
          />
          <TextField
            label="Enlace web (opcional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" size="large">
            Añadir Lugar
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}