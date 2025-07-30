'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AppsIcon from '@mui/icons-material/Apps';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [value, setValue] = useState(pathname);

  useEffect(() => {
    setValue(pathname);
}, [pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{ backgroundColor: 'background.paper' }}
      >
        <BottomNavigationAction label="Inicio" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="Mapa" value="/mapa" icon={<MapIcon />} />
        <BottomNavigationAction label="Proyectos" value="/proyectos" icon={<AppsIcon />} />
        <BottomNavigationAction label="Servicios" value="/servicios" icon={<HandshakeIcon />} />
        
        {isAuthenticated ? (
          <BottomNavigationAction label="Perfil" value="/perfil" icon={<AccountCircleIcon />} />
        ) : (
          <BottomNavigationAction label="Login" value="/login" icon={<LoginIcon />} />
        )}
        
      </BottomNavigation>
    </Paper>
  );
}