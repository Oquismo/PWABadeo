import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast?latitude=37.39&longitude=-5.99&current_weather=true';

export default function ExternalInfoPanel() {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    fetch(WEATHER_API)
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(() => setWeather(null));
  }, []);

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Card sx={{ maxWidth: 400, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Clima actual
          </Typography>
          {weather ? (
            <>
              <Typography variant="body1">Temperatura: {weather.temperature}°C</Typography>
              <Typography variant="body2">Viento: {weather.windspeed} km/h</Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">No disponible</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
