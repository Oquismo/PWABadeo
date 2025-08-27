'use client';

import { 
  Container, 
  Grid, 
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Collapse,
  Fade,
  Box
} from '@mui/material';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectsData } from '@/data/projects';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function ProyectosPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('projectFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('projectFavorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const handleExpandClick = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleFavoriteClick = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const handleShareClick = (project: any) => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const filteredProjects = showOnlyFavorites 
    ? projectsData.filter(project => favorites.has(project.id))
    : projectsData;

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography component="h1" variant="h3" fontWeight="bold">
          Nuestros Proyectos
        </Typography>
        <Button
          variant={showOnlyFavorites ? 'contained' : 'outlined'}
          startIcon={<FilterListIcon />}
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          color="secondary"
        >
          {showOnlyFavorites ? 'Mostrar Todos' : 'Solo Favoritos'}
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        {filteredProjects.map((project, index) => (
          <Grid item key={project.id} xs={12} sm={6} md={4}>
            <Fade in={true} timeout={500 + index * 100}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  backgroundColor: 'background.paper',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleExpandClick(project.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={project.imageUrl}
                  alt={`Imagen del proyecto ${project.title}`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                  {project.eventDate && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      Fecha: {project.eventDate.toLocaleDateString('es-ES')}
                    </Typography>
                  )}
                </CardContent>
                <Collapse in={expanded === project.id} timeout="auto" unmountOnExit>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {project.longDescription}
                    </Typography>
                  </CardContent>
                </Collapse>
                <CardActions>
                  <IconButton 
                    aria-label="add to favorites"
                    onClick={(e) => { e.stopPropagation(); handleFavoriteClick(project.id); }}
                    color={favorites.has(project.id) ? 'error' : 'default'}
                  >
                    <FavoriteIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="share"
                    onClick={(e) => { e.stopPropagation(); handleShareClick(project); }}
                  >
                    <ShareIcon />
                  </IconButton>
                  <Button size="small" color="secondary" component={Link} href={`/proyectos/${project.id}`}>
                    Ver Más
                  </Button>
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}