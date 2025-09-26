'use client';

import { Box, Typography, List, ListItem, ListItemText, Divider, Paper, Stack } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import M3Button from '@/components/ui/M3Button';

// Información estática pero muy útil de las líneas principales de TUSSAM
const importantLines = [
  {
    line: 'C1',
    description: 'Circular exterior (sentido horario)',
    url: 'https://www.tussam.es/es/lineas/c1-circular-exterior-prado-triana-cartuja-barqueta-macarena'
  },
  {
    line: 'C2',
    description: 'Circular exterior (sentido anti-horario)',
    url: 'https://www.tussam.es/es/lineas/c2-circular-exterior-prado-macarena-barqueta-cartuja-triana'
  },
  {
    line: 'EA',
    description: 'Especial Aeropuerto (Plaza de Armas - Aeropuerto)',
    url: 'https://www.tussam.es/es/lineas/ea-especial-aeropuerto'
  },
  {
    line: '27',
    description: 'Plaza del Duque - Sevilla Este',
    url: 'https://www.tussam.es/es/lineas/27-sevilla-este-plaza-del-duque'
  },
];

export default function BusInfo() {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <DirectionsBusIcon />
        <Typography variant="h6" fontWeight="bold">
          Líneas de Autobús Importantes
        </Typography>
      </Stack>
      <List sx={{ p: 0 }}>
        {importantLines.map((bus, index) => (
          <Box key={bus.line}>
            <ListItem
                secondaryAction={
                <M3Button m3variant="outlined" size="small" href={bus.url} endIcon={<LaunchRoundedIcon />}>
                  Ver
                </M3Button>
              }
            >
              <ListItemText
                primary={`Línea ${bus.line}`}
                secondary={bus.description}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            {index < importantLines.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}