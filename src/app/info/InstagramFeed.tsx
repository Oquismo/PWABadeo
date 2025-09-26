'use client';

import { Box, Typography, Container, ImageList, ImageListItem } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import M3Button from '@/components/ui/M3Button';

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    title: 'Viaje internacional',
    rows: 2, // Esta imagen ocupará el doble de alto
    cols: 2, // y el doble de ancho
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'Historias que inspiran',
  },
  {
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: 'Descubre más',
  },
];

export default function InstagramFeed() {
  return (
    <Container sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 4 }}>
        <InstagramIcon />
        <Typography component="h3" variant="h4" fontWeight="bold">
          Instagram
        </Typography>
      </Box>

      {/* ImageList se encarga de crear el mosaico */}
      <ImageList
        sx={{ width: '100%', height: 450, borderRadius: '16px', overflow: 'hidden' }}
        variant="quilted" // El tipo de mosaico que queremos
        cols={4} // Dividimos el espacio en 4 columnas
        rowHeight={121}
      >
        {itemData.map((item) => (
          <ImageListItem key={item.img} cols={item.cols || 1} rows={item.rows || 1}>
            <img
              {...{src: `${item.img}?w=164&h=164&fit=crop&auto=format`, srcSet: `${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`,}}
              alt={item.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      {/* Botón para ver más */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <M3Button m3variant="outlined" color="secondary" startIcon={<InstagramIcon />} href="https://instagram.com">
          Ver más en Instagram
        </M3Button>
      </Box>
    </Container>
  );
}