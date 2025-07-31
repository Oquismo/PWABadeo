'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Grid, Tooltip } from '@mui/material';
import Link from 'next/link';
import EngineeringIcon from '@mui/icons-material/Engineering';
import type { User } from '@/context/AuthContext';

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    school: '',
    arrivalDate: '',
    departureDate: '',
  });
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { login } = useAuth();
  
  // Añadimos esta comprobación para evitar errores de renderizado
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let tempErrors: any = {};
    if (!formData.firstName) tempErrors.firstName = 'El nombre es obligatorio.';
    if (!formData.lastName) tempErrors.lastName = 'Los apellidos son obligatorios.';
    if (!formData.email) {
      tempErrors.email = 'El email es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'El formato del email es inválido.';
    }
    if (!formData.password) {
      tempErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!formData.age) {
      tempErrors.age = 'La edad es obligatoria.';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      tempErrors.age = 'Introduce una edad válida.';
    }
    if (!formData.school) tempErrors.school = 'El nombre de la escuela es obligatorio.';
    if (!formData.arrivalDate) tempErrors.arrivalDate = 'La fecha de llegada es obligatoria.';
    if (!formData.departureDate) tempErrors.departureDate = 'La fecha de salida es obligatoria.';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      const newUser: User = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        age: Number(formData.age),
        school: formData.school,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.firstName} ${formData.lastName}`,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        role: 'user',
      };
      
      const usersRaw = localStorage.getItem('allUsers');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const updatedUsers = [...users, newUser];
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      
      login(newUser);
      router.push('/');
    }
  };

  // No renderizamos el formulario hasta que estemos en el navegador
  if (!isClient) {
    return null;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography component="h1" variant="h4" fontWeight="bold">
          Crear Cuenta
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="firstName" required fullWidth label="Nombre" autoFocus value={formData.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Apellidos" name="lastName" value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName}/>
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth label="Correo Electrónico" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="age" required fullWidth label="Edad" type="number" value={formData.age} onChange={handleChange} error={!!errors.age} helperText={errors.age} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="school" required fullWidth label="Escuela" value={formData.school} onChange={handleChange} error={!!errors.school} helperText={errors.school} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="arrivalDate"
                required
                fullWidth
                label="Fecha de Llegada"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.arrivalDate}
                onChange={handleChange}
                error={!!errors.arrivalDate}
                helperText={errors.arrivalDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="departureDate"
                required
                fullWidth
                label="Fecha de Salida"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.departureDate}
                onChange={handleChange}
                error={!!errors.departureDate}
                helperText={errors.departureDate}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password}/>
            </Grid>
          </Grid>
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
            Registrarse
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} href="/login" variant="body2">
              ¿Ya tienes una cuenta? Inicia sesión
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
