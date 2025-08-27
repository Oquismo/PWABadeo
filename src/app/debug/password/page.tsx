'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SecurityWarning from '@/components/admin/SecurityWarning';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';

export default function DebugPasswordPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados del componente original
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Verificación de seguridad
  useEffect(() => {
    const checkAccess = async () => {
      // Esperar a que el contexto de auth se inicialice
      if (isAuthenticated === undefined) {
        return; // Aún cargando
      }

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (user?.role !== 'admin') {
        setError('🚫 Acceso denegado: Solo administradores pueden acceder a esta página');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [isAuthenticated, user, router]);

  // Mostrar loading mientras se verifica acceso
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando permisos de administrador...
        </Typography>
      </Container>
    );
  }

  // Si hay error de acceso, mostrar mensaje
  if (error && error.includes('Acceso denegado')) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2">
          Redirigiendo al inicio en unos segundos...
        </Typography>
      </Container>
    );
  }

  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      setError('Email y nueva contraseña son requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/debug/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-debug',
          'X-Admin-Access': 'true'
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
        setNewPassword('');
      } else {
        setError(data.error || 'Error al resetear contraseña');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/debug/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-debug',
          'X-Admin-Access': 'true'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <SecurityWarning 
        title="Debug - Gestión de Contraseñas"
        message="Esta herramienta permite ver y modificar credenciales de usuarios. Úsala con extrema precaución."
      />
      
      <Typography variant="h4" gutterBottom>
        Debug - Gestión de Contraseñas
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cargar Usuarios
        </Typography>
        <Button 
          variant="outlined" 
          onClick={loadUsers}
          disabled={loadingUsers}
        >
          {loadingUsers ? 'Cargando...' : 'Cargar Lista de Usuarios'}
        </Button>
        
        {users.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Usuarios en la base de datos:
            </Typography>
            {users.map((user, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Email:</strong> {user.email} | 
                  <strong> Rol:</strong> {user.role} | 
                  <strong> Contraseña hasheada:</strong> {user.password ? 'Sí' : 'No'} |
                  <strong> Tipo hash:</strong> {user.password?.startsWith('$2b$') ? 'bcrypt' : 'otro/plano'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resetear Contraseña
        </Typography>
        
        <TextField
          fullWidth
          label="Email del usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          type="email"
        />
        
        <TextField
          fullWidth
          label="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          type="text"
          helperText="Se hasheará automáticamente con bcrypt"
        />
        
        <Button
          fullWidth
          variant="contained"
          onClick={handleResetPassword}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Reseteando...' : 'Resetear Contraseña'}
        </Button>
        
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'warning.light' }}>
        <Typography variant="h6" gutterBottom color="warning.dark">
          ⚠️ Zona de Debug
        </Typography>
        <Typography variant="body2" color="warning.dark">
          Esta página es solo para debugging. Permite ver y resetear contraseñas de usuarios.
          <br />
          <strong>URL:</strong> /debug/password
        </Typography>
      </Paper>
    </Container>
  );
}
