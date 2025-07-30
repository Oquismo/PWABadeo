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
  Box
} from '@mui/material';
import Link from 'next/link';
import { projectsData } from '@/data/projects';

const homeProjects = projectsData.slice(0, 3);

export default function ProjectsSection() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 8 }}>
      <Container>
        <Typography 
          component="h2" 
          variant="h3" 
          fontWeight="bold" 
          textAlign="center"
          sx={{ mb: 6 }}
        >
          Nuestros Proyectos
        </Typography>
        <Grid container spacing={4}>
          {homeProjects.map((project) => (
            <Grid item key={project.id} xs={12} sm={6} md={4}>
              <Link href={`/proyectos/${project.id}`} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                {/* CAMBIO: Hemos quitado variant="outlined" */}
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'background.paper' }}>
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
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="secondary">Ver Más</Button>
                  </CardActions>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}