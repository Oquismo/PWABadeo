'use client';

import { 
  Container, 
  Typography,
  Box,
  Stack,
  Divider,
  IconButton,
  Avatar
} from '@mui/material';
import Link from 'next/link';
import { projectsData } from '@/data/projects';
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // 1. Importar el nuevo icono

const homeProjects = projectsData.slice(0, 3);

export default function ProjectsSection() {
  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            component="h2" 
            variant="h5" 
            fontWeight="bold"
          >
            Proyectos Destacados
          </Typography>
          <Link href="/proyectos" passHref>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', cursor: 'pointer' }}>
              Ver todos
            </Typography>
          </Link>
        </Box>

        <Stack 
          divider={<Divider orientation="horizontal" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />}
          spacing={2}
        >
          {homeProjects.map((project) => (
            <Link href={`/proyectos/${project.id}`} passHref key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px' } }}>
                
                <Avatar 
                  src={project.imageUrl}
                  variant="rounded"
                  sx={{ width: 56, height: 56 }}
                />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight="bold">
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                </Box>
                
                {/* 2. Cambiamos el icono por uno más apropiado */}
                <IconButton>
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Link>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}