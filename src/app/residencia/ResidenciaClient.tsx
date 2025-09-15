"use client";

import React from 'react';
import { Container, Typography, Box, Paper, Link as MuiLink, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WifiIcon from '@mui/icons-material/Wifi';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useAuth } from '@/context/AuthContext';

export default function ResidenciaClient() {
  const { user } = useAuth();

  // Contenido por residencia (claves normalizadas: ONE y AMBRO)
  const residenciaContent: Record<string, any> = {
    ONE: {
      wifi: { ssid: 'ONE-Guest', password: 'one2025' },
      receptionPhone: '+34 600 111 222',
      notes: 'Residencia ONE: entrada principal c/ Mayor 12. Sala de estudio abierta 24h.'
    },
    AMBRO: {
      wifi: { ssid: 'Ambro-WiFi', password: 'ambro2025' },
      receptionPhone: '+34 600 333 444',
      notes: 'Residencia Ambro: edificio sur, acceso por patio. Gimnasio en planta -1.'
    }
  };

  // Normalizamos la residencia elegida (acepta 'Ambro', 'AMBRO', 'Ambro ', etc.)
  const rawResidencia = user && (user as any).residence ? String((user as any).residence).trim() : null;
  const residenciaKey = rawResidencia ? rawResidencia.toUpperCase() : null;
  const specific = residenciaKey && residenciaContent[residenciaKey] ? residenciaContent[residenciaKey] : null;

  return (
    <Container maxWidth="md" style={{ paddingTop: 24, paddingBottom: 120 }}>
      <Paper elevation={2} style={{ padding: 20, borderRadius: 12 }}>
        <Box display="flex" alignItems="center" gap={1} marginBottom={2}>
          <InfoIcon color="primary" />
          <Typography variant="h4" component="h1" fontWeight="bold">
            {specific ? `Residencia — ${residenciaKey}` : 'Residencia'}
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          Bienvenido a la sección de Residencia. Aquí encontrarás información práctica: horarios, servicios, wifi, normas y contactos.
        </Typography>

        <Box mb={2} display="flex" gap={1} flexWrap="wrap">
          <Chip icon={<AccessTimeIcon />} label="Horario" color="primary" />
          <Chip icon={<WifiIcon />} label="Wi‑Fi" />
          <Chip icon={<RestaurantIcon />} label="Comedor" />
        </Box>

        <Typography variant="h6" gutterBottom>Horarios</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Desayuno" secondary="7:30 — 9:30" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Comida" secondary="13:00 — 15:00" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Cena" secondary="20:00 — 22:00" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Wi‑Fi</Typography>
        {specific ? (
          <Typography variant="body2" paragraph>
            Red: <strong>{specific.wifi.ssid}</strong><br />
            Contraseña: <strong>{specific.wifi.password}</strong>
          </Typography>
        ) : (
          <Typography variant="body2" paragraph>
            Red: <strong>Residencia-Guest</strong><br />
            Contraseña: <strong>bienvenido2025</strong>
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Servicios destacados</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Recepción 24h" secondary="Atención en el hall" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Limpieza" secondary="Cambio de ropa de cama 1 vez/semana" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Lavandería" secondary="Máquina autoxervicio en sótano" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Normas rápidas</Typography>
        <ol>
          <li>Mantener el silencio tras las 23:00.</li>
          <li>Respetar los espacios comunes y horarios de comedor.</li>
          <li>No fumar en zonas interiores.</li>
          <li>Reportar incidencias a recepción o mediante la app.</li>
        </ol>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Preguntas frecuentes</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="¿Puedo recibir paquetes?" secondary="Sí, pasar por recepción durante el horario de atención." />
          </ListItem>
          <ListItem>
            <ListItemText primary="¿Hay gimnasio?" secondary="Gimnasio en planta -1, horario 6:00 — 23:00." />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Contactos</Typography>
        {specific ? (
          <>
            <Typography variant="body2">Teléfono de recepción: <MuiLink href={`tel:${specific.receptionPhone}`}>{specific.receptionPhone}</MuiLink></Typography>
            <Typography variant="body2">Notas: {specific.notes}</Typography>
          </>
        ) : (
          <>
            <Typography variant="body2">Teléfono de recepción: <MuiLink href="tel:+34123456789">+34 123 456 789</MuiLink></Typography>
            <Typography variant="body2">Email: <MuiLink href="mailto:residencia@example.com">residencia@example.com</MuiLink></Typography>
          </>
        )}

      </Paper>
    </Container>
  );
}
