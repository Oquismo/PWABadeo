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
  const { t } = require('@/hooks/useTranslation').useTranslation();
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
      title={t('addPlace.title')}
      icon={<LocationOnIcon />}
      supportingText={coords ? `${t('addPlace.coords')}: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : `${t('addPlace.coords')}: N/A`}
      maxWidth="sm"
      fullWidth
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim() || !description.trim() || !category}
        >
          {t('addPlace.addButton')}
        </Button>
      }
    >
      <Stack spacing={3}>
        <MaterialTextField
          label={t('addPlace.name')}
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          fullWidth
          required
          supportingText={t('addPlace.nameHelp')}
        />
        <MaterialTextField
          label={t('addPlace.description')}
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          required
          supportingText={t('addPlace.descriptionHelp')}
        />
        <FormControl fullWidth required>
          <InputLabel id="category-label">{t('addPlace.category')}</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            label={t('addPlace.category')}
            onChange={(e) => setCategory(e.target.value as Place['category'])}
          >
            <MenuItem value=""><em>{t('addPlace.selectCategory')}</em></MenuItem>
            <MenuItem value="Cultural">{t('addPlace.cultural')}</MenuItem>
            <MenuItem value="Comida">{t('addPlace.food')}</MenuItem>
            <MenuItem value="Ocio">{t('addPlace.leisure')}</MenuItem>
            <MenuItem value="Servicios">{t('addPlace.services')}</MenuItem>
            <MenuItem value="Estudio">{t('addPlace.study')}</MenuItem>
            <MenuItem value="Transporte">{t('addPlace.transport')}</MenuItem>
            <MenuItem value="Salud">{t('addPlace.health')}</MenuItem>
          </Select>
        </FormControl>
        <MaterialTextField
          label={t('addPlace.imageUrl')}
          value={imageUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
          fullWidth
          supportingText={t('addPlace.imageUrlHelp')}
        />
        <MaterialTextField
          label={t('addPlace.address')}
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
          fullWidth
          supportingText={t('addPlace.addressHelp')}
        />
        <MaterialTextField
          label={t('addPlace.link')}
          value={link}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
          fullWidth
          supportingText={t('addPlace.linkHelp')}
        />
      </Stack>
    </Material3Dialog>
  );
}