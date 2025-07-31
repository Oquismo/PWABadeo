'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // El valor del botón activo ahora es directamente la ruta de la URL
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'auto',
        zIndex: 100,
        borderRadius: '9999px',
        backgroundColor: 'rgba(28, 28, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <BottomNavigation
        showLabels={false}
        value={pathname} // El estado activo se controla con la ruta actual
        onChange={handleChange}
        sx={{ 
          backgroundColor: 'transparent',
          padding: '0 8px',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: '48px',
          },
          '& .Mui-selected': {
            '& .MuiSvgIcon-root': {
              color: 'primary.main',
            },
            background: 'rgba(190, 242, 100, 0.15)',
            borderRadius: '9999px',
            margin: '6px 0',
          },
        }}
      >
        {/* Iconos base para todos los usuarios */}
        <BottomNavigationAction value="/" icon={<HomeIcon />} sx={{ borderRadius: '9999px' }} />
        <BottomNavigationAction value="/mapa" icon={<MapIcon />} sx={{ borderRadius: '9999px' }} />

        {/* Iconos condicionales basados en el rol del usuario */}
        {user?.role === 'admin' ? (
          <BottomNavigationAction value="/admin" icon={<AdminPanelSettingsIcon />} sx={{ borderRadius: '9999px' }} />
        ) : (
          <>
            <BottomNavigationAction value="/checklist" icon={<ChecklistIcon />} sx={{ borderRadius: '9999px' }} />
            <BottomNavigationAction value="/telefonos" icon={<PhoneInTalkIcon />} sx={{ borderRadius: '9999px' }} />
          </>
        )}

        {/* Icono condicional basado en si la sesión está iniciada */}
        {isAuthenticated ? (
          <BottomNavigationAction value="/perfil" icon={<AccountCircleIcon />} sx={{ borderRadius: '9999px' }} />
        ) : (
          <BottomNavigationAction value="/login" icon={<LoginIcon />} sx={{ borderRadius: '9999px' }} />
        )}
      </BottomNavigation>
    </Paper>
  );
}
