"use client";
import React from "react";
import { Button } from '@mui/material';
import { useState } from 'react';
import { Box, Typography, Chip, CardMedia, CardContent, Stack } from "@mui/material";
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import { useHaptics } from '@/hooks/useHaptics';

// Ejemplo de sitio en Sevilla
const site = {
  name: "La Giralda",
  image: "/img/giralda.jpg", // Coloca aquí la ruta de la imagen en public/img/
  description:
    "La Giralda es el campanario de la Catedral de Sevilla y uno de los monumentos más emblemáticos de la ciudad.",
  distance: "2.3 km",
  time: "15 min",
  activity: "Cultural",
};

export default function CheckInCard() {
  const [notifStatus, setNotifStatus] = useState<"default"|"granted"|"denied">(typeof window !== 'undefined' ? Notification.permission : "default");
  const { success: hapticSuccess, error: hapticError, buttonClick: hapticButtonClick } = useHaptics();

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Las notificaciones no son compatibles con tu navegador.');
      await hapticError();
      return;
    }
    const result = await Notification.requestPermission();
    setNotifStatus(result);
    
    if (result === 'granted') {
      await hapticSuccess();
    } else if (result === 'denied') {
      await hapticError();
    }
  };
  return (
    <Material3ElevatedCard
      interactive={true}
      sx={{
        maxWidth: 400,
        mx: "auto",
        bgcolor: "#18181c",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <CardMedia
        component="img"
        height="220"
        image={site.image}
        alt={site.name}
        sx={{ objectFit: "cover", filter: "brightness(0.7)" }}
      />
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {site.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
          {site.description}
        </Typography>
        <Stack direction="row" spacing={1} mt={2}>
          <Chip label={site.distance} color="primary" variant="filled" sx={{ bgcolor: "#22223a", color: "#fff" }} />
          <Chip label={site.time} color="secondary" variant="filled" sx={{ bgcolor: "#22223a", color: "#fff" }} />
          <Chip label={site.activity} color="default" variant="filled" sx={{ bgcolor: "#22223a", color: "#fff" }} />
        </Stack>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Button
              variant="contained"
              color={notifStatus === 'granted' ? 'success' : notifStatus === 'denied' ? 'error' : 'primary'}
              onClick={handleRequestPermission}
              disabled={notifStatus === 'granted'}
            >
              {notifStatus === 'granted' ? 'Notificaciones activadas' : notifStatus === 'denied' ? 'Permiso denegado' : 'Activar notificaciones'}
            </Button>
          </Box>
      </CardContent>
    </Material3ElevatedCard>
  );
}
