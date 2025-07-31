'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Grid, Tooltip } from '@mui/material';
import Link from 'next/link';
import EngineeringIcon from '@mui/icons-material/Engineering';

// Importamos la interfaz User para usarla aquí
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    // ... (lógica de validación sin cambios)
    return true; // Simplificado para el ejemplo
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      const newUser: User = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        age: Number(formData.age),
        school: formData.school,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.firstName} ${formData.lastName}`, // Avatar genérico
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        role: 'user',
      };

      // --- LÓGICA DE LA BASE DE DATOS SIMULADA ---
      // 1. Obtenemos la lista de usuarios existentes
      const usersRaw = localStorage.getItem('allUsers');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      // 2. Añadimos el nuevo usuario
      const updatedUsers = [...users, newUser];
      // 3. Guardamos la lista actualizada
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      
      // Inicia sesión con el nuevo usuario
      login(newUser);
      router.push('/');
    }
  };

  const handleBypassLogin = () => { /* ... (sin cambios) */ };

  return (
    // ... (JSX del formulario sin cambios)
    <Container component="main" maxWidth="xs">
      {/* ... */}
    </Container>
  );
}
