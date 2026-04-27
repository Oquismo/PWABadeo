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
        <Typography
          component="h1"
          variant="h3"
          fontWeight={800}
          sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' }}
        >
          Nuestros Proyectos
        </Typography>
        <Box
          component="button"
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          sx={{
            height: 36, px: 2,
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            borderRadius: '18px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600,
            border: '1px solid',
            borderColor: showOnlyFavorites ? 'transparent' : 'rgba(255,255,255,0.18)',
            background: showOnlyFavorites ? '#3A2C4A' : 'transparent',
            color: showOnlyFavorites ? '#E8DEF8' : 'text.secondary',
            transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
          }}
        >
          <FilterListIcon sx={{ fontSize: 16 }} />
          {showOnlyFavorites ? 'Mostrar Todos' : 'Solo Favoritos'}
        </Box>
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
                  backgroundColor: '#1E1E21',
                  cursor: 'pointer',
                  transition: 'transform 0.25s cubic-bezier(0.2,0,0,1), box-shadow 0.25s cubic-bezier(0.2,0,0,1)',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.01)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
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