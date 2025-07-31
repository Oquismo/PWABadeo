'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Grid, Avatar, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function EditarPerfilPage() {
  // 1. Traemos la nueva función updateUser
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    age: '',
    arrivalDate: '',
    departureDate: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        school: user.school,
        age: String(user.age),
        arrivalDate: user.arrivalDate,
        departureDate: user.departureDate,
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 2. Llamamos a updateUser con los nuevos datos del formulario
    updateUser({
      name: formData.name,
      school: formData.school,
      age: Number(formData.age),
      arrivalDate: formData.arrivalDate,
      departureDate: formData.departureDate,
    });
    alert('Perfil actualizado con éxito');
    router.push('/perfil'); // Volvemos al perfil para ver los cambios
  };

  if (!user) {
    return null;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ pt: 4, position: 'relative' }}>
        <IconButton onClick={() => router.back()} sx={{ position: 'absolute', top: 16, left: 0 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography component="h1" variant="h4" fontWeight="bold" textAlign="center">
          Editar Perfil
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar src={user.avatarUrl} sx={{ width: 100, height: 100 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="name" required fullWidth label="Nombre Completo" value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="school" required fullWidth label="Escuela" value={formData.school} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="age" required fullWidth label="Edad" type="number" value={formData.age} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="arrivalDate" required fullWidth label="Fecha de Llegada" type="date" InputLabelProps={{ shrink: true }} value={formData.arrivalDate} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="departureDate" required fullWidth label="Fecha de Salida" type="date" InputLabelProps={{ shrink: true }} value={formData.departureDate} onChange={handleChange} />
            </Grid>
          </Grid>
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
