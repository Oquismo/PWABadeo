'use client';

import { useState } from 'react';
import { Container, Typography, Button, Box, Alert, Card, CardContent } from '@mui/material';

interface School {
  id: number;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  phoneNumber?: string;
  email?: string;
  type: string;
  level: string;
}

interface Result {
  success: boolean;
  message: string;
  school?: School;
  schools?: School[];
}

export default function CreateSchoolPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const createExampleSchool = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const schoolData = {
        name: "CEIP Miguel de Cervantes",
        address: "Calle de la Educación, 123",
        city: "Madrid",
        province: "Madrid", 
        country: "España",
        phoneNumber: "+34 91 123 45 67",
        email: "secretaria@ceip-cervantes.edu.es",
        website: "https://ceip-cervantes.educamadrid.org",
        type: "pública",
        level: "primaria",
        description: "Centro educativo público de educación infantil y primaria ubicado en el distrito centro de Madrid. Ofrecemos una educación integral y de calidad con especial atención a la diversidad y la innovación educativa.",
        isActive: true
      };

      console.log('Enviando datos:', schoolData);
      
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (response.ok) {
        setResult({
          success: true,
          message: 'Escuela creada exitosamente',
          school: data
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Error al crear la escuela'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        message: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setLoading(false);
    }
  };

  const listSchools = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();
      
      if (response.ok) {
        // El API puede devolver diferentes formatos, verificamos ambos
        const schools = Array.isArray(data) ? data : (data.schools || []);
        setResult({
          success: true,
          message: `Se encontraron ${schools.length} escuela(s)`,
          schools: schools
        });
      } else {
        setResult({
          success: false,
          message: 'Error al obtener las escuelas'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        message: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Escuelas
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={createExampleSchool}
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear Escuela de Ejemplo'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={listSchools}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Listar Escuelas'}
        </Button>
      </Box>

      {result && (
        <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 2 }}>
          {result.message}
        </Alert>
      )}

      {result && result.school && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Escuela Creada
            </Typography>
            <Typography><strong>ID:</strong> {result.school.id}</Typography>
            <Typography><strong>Nombre:</strong> {result.school.name}</Typography>
            <Typography><strong>Ciudad:</strong> {result.school.city}</Typography>
            <Typography><strong>Teléfono:</strong> {result.school.phoneNumber}</Typography>
            <Typography><strong>Email:</strong> {result.school.email}</Typography>
          </CardContent>
        </Card>
      )}

      {result && result.schools && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Lista de Escuelas
          </Typography>
          {result.schools.map((school: School, index: number) => (
            <Card key={school.id} sx={{ mb: 1 }}>
              <CardContent>
                <Typography variant="subtitle1">{school.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {school.address}, {school.city} ({school.province})
                </Typography>
                <Typography variant="body2">
                  {school.type} - {school.level}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
