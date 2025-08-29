'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Fade,
  Grid,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import CampaignIcon from '@mui/icons-material/Campaign';
import SchoolIcon from '@mui/icons-material/School';
import BuildIcon from '@mui/icons-material/Build';
import BugReportIcon from '@mui/icons-material/BugReport';
import EventManagement from '@/components/admin/EventManagement';
import UserManagement from '@/components/admin/UserManagement';
import LogViewer from '@/components/admin/LogViewer';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import SchoolManagement from '@/components/admin/SchoolManagement';
import AdminDevTools from '@/components/admin/AdminDevTools';
import AuthDebugPanel from '@/components/admin/AuthDebugPanel';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    // Solo redirigir después de que termine la carga inicial
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router, isLoading]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  if (isLoading) {
    return (
      <Container component="main" maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography variant="h6" color="text.secondary">Cargando panel de administración...</Typography>
        </Box>
      </Container>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const tabs = [
    { label: 'Eventos', icon: <EventIcon />, component: <EventManagement /> },
    { label: 'Usuarios', icon: <PeopleIcon />, component: <UserManagement /> },
    { label: 'Logs', icon: <ArticleIcon />, component: <LogViewer /> },
    { label: 'Anuncios', icon: <CampaignIcon />, component: <AnnouncementManager /> },
    { label: 'Escuelas', icon: <SchoolIcon />, component: <SchoolManagement /> },
    { label: 'Dev Tools', icon: <BuildIcon />, component: <AdminDevTools /> },
    { label: 'Auth Debug', icon: <BugReportIcon />, component: <AuthDebugPanel /> },
  ];

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Fade in={true} timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton
              onClick={() => router.back()}
              sx={{
                mr: 2,
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Panel de Administración
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Gestiona usuarios, eventos y configuraciones del sistema
              </Typography>
            </Box>
            <Chip
              icon={<AdminPanelSettingsIcon />}
              label="Administrador"
              color="secondary"
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* Información del usuario admin */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'secondary.main',
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText'
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Sesión de {user.name || 'Administrador'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {user.email} • Último acceso: {new Date().toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Pestañas de navegación */}
      <Fade in={true} timeout={800}>
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={tab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 2,
                bgcolor: 'secondary.main'
              },
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.95rem',
                borderRadius: 0,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }
            }}
          >
            {tabs.map((tabItem, index) => (
              <Tab
                key={index}
                icon={tabItem.icon}
                label={tabItem.label}
                iconPosition="start"
                sx={{
                  minHeight: 64,
                  px: 3,
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    '&:hover': {
                      bgcolor: 'secondary.dark'
                    }
                  }
                }}
              />
            ))}
          </Tabs>
        </Paper>
      </Fade>

      {/* Contenido de las pestañas */}
      <Fade in={true} timeout={1000} key={tab}>
        <Box>
          {tabs[tab]?.component}
        </Box>
      </Fade>

      {/* Footer informativo */}
      <Fade in={true} timeout={1200}>
        <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {tabs.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Módulos Disponibles
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" color="secondary" fontWeight="bold">
                  {user.role === 'admin' ? 'Completo' : 'Limitado'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nivel de Acceso
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" color="text.primary" fontWeight="bold">
                  Activo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estado del Sistema
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
}
