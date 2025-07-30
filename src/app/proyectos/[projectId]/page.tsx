import { projectsData } from '@/data/projects';
import { Container, Typography, Box, Chip } from '@mui/material';
import Image from 'next/image';

// Esta función ayuda a Next.js a encontrar el proyecto correcto
function getProjectById(id: string) {
  return projectsData.find((project) => project.id === id);
}

// Este es el componente de nuestra página de detalle
export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const project = getProjectById(params.projectId);

  // Si el proyecto no se encuentra, mostramos un mensaje
  if (!project) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1">Proyecto no encontrado</Typography>
      </Container>
    );
  }

  return (
    <Box>
      {/* Imagen de Cabecera */}
      <Box sx={{ position: 'relative', width: '100%', height: '40vh' }}>
        <Image
          src={project.imageUrl}
          alt={`Imagen de ${project.title}`}
          layout="fill"
          objectFit="cover"
          priority
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            p: 2,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          <Chip label="Proyecto" color="secondary" />
        </Box>
      </Box>

      {/* Contenido del Proyecto */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          {project.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          {project.longDescription}
        </Typography>
      </Container>
    </Box>
  );
}