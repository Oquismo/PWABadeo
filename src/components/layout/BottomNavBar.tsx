// src/components/layout/BottomNavBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '@/context/AuthContext';
import { vibrate } from '@/utils/haptics'; // Importa la función de vibración

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Establece el valor inicial basado en la ruta actual
  const [value, setValue] = useState(pathname);

  useEffect(() => {
    // Actualiza el valor cuando la ruta cambia
    setValue(pathname);
  }, [pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    vibrate(); // ¡Añadimos la vibración aquí!
    router.push(newValue);
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Inicio" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="Mapa" value="/mapa" icon={<MapIcon />} />

        {user?.role === 'admin' ? (
          <BottomNavigationAction label="Admin" value="/admin" icon={<AdminPanelSettingsIcon />} />
        ) : (
          <>
            <BottomNavigationAction label="Checklist" value="/checklist" icon={<ChecklistIcon />} />
            <BottomNavigationAction label="Teléfonos" value="/telefonos" icon={<PhoneIcon />} />
          </>
        )}
        
        <BottomNavigationAction label="Perfil" value="/perfil" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
}