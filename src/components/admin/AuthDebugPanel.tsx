'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SecurityWarning from './SecurityWarning';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  BugReport as BugReportIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  password: string;
}

export default function AuthDebugPanel() {
  const { user, isAuthenticated } = useAuth();
  
  // Estados del componente
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Reset password states
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  // Test login states
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [loginResult, setLoginResult] = useState<any>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Verificación de seguridad
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setError('🚫 Solo administradores pueden acceder a estas herramientas de debug');
    }
  }, [isAuthenticated, user]);

  // Si no es admin, mostrar error
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <Box>
        <Alert severity="error">
          🚫 Acceso denegado: Solo administradores pueden acceder a estas herramientas de debug
        </Alert>
      </Box>
    );
  }

  const loadUsers = async () => {
    setLoadingUsers(true);
    setError('');
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
        setError('Error al cargar usuarios: ' + data.error);
      }
    } catch (err) {
      setError('Error de conexión al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !newPassword) {
      setError('Email y nueva contraseña son requeridos');
      return;
    }

    setResetLoading(true);
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
        body: JSON.stringify({ email: resetEmail, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setResetEmail('');
        setNewPassword('');
        // Recargar usuarios para ver los cambios
        loadUsers();
      } else {
        setError(data.error || 'Error al resetear contraseña');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setResetLoading(false);
    }
  };

  const handleTestLogin = async () => {
    if (!testEmail || !testPassword) {
      setError('Email y contraseña son requeridos para el test');
      return;
    }

    setLoginLoading(true);
    setLoginResult(null);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });

      const data = await response.json();
      
      setLoginResult({
        status: response.status,
        statusText: response.statusText,
        data: data,
        success: response.ok
      });

    } catch (error) {
      setLoginResult({
        status: 'Error',
        statusText: 'Network Error',
        data: { error: 'Error de red' },
        success: false
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Box>
      <SecurityWarning 
        title="Sistema de Autenticación y Debug"
        message="ACCESO RESTRINGIDO: Estas herramientas solo están disponibles desde el panel de administración. Cualquier intento de acceso directo será bloqueado y registrado."
      />
      
      <Alert severity="warning" sx={{ mb: 2, border: '2px solid #ed6c02' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          🔒 MODO SEGURO ACTIVADO
        </Typography>
        <Typography variant="body2">
          • Solo accesible desde panel de administración<br/>
          • Todos los accesos son monitoreados<br/>
          • URLs directas están bloqueadas<br/>
          • Requiere verificación de administrador
        </Typography>
      </Alert>
      
      {/* Messages */}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Management */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Gestión de Usuarios</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button 
            variant="outlined" 
            onClick={loadUsers}
            disabled={loadingUsers}
            startIcon={<RefreshIcon />}
            sx={{ mb: 2 }}
          >
            {loadingUsers ? 'Cargando...' : 'Cargar Lista de Usuarios'}
          </Button>
          
          {users.length > 0 && (
            <Grid container spacing={2}>
              {users.map((user, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {user.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rol: <Chip label={user.role} size="small" />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hash: {user.password?.startsWith('$2b$') ? (
                          <Chip label="bcrypt ✓" color="success" size="small" />
                        ) : (
                          <Chip label="Texto plano ⚠️" color="warning" size="small" />
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Password Reset */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <PersonAddIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Resetear Contraseña</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email del usuario"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                margin="normal"
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                type="text"
                helperText="Se hasheará automáticamente con bcrypt"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleResetPassword}
                disabled={resetLoading}
                sx={{ mt: 1 }}
              >
                {resetLoading ? 'Reseteando...' : 'Resetear Contraseña'}
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Login Test */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <BugReportIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Test de Login</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                margin="normal"
                type="email"
              />
              <TextField
                fullWidth
                label="Contraseña"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                margin="normal"
                type="password"
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleTestLogin}
                disabled={loginLoading}
                sx={{ mt: 2 }}
              >
                {loginLoading ? 'Probando...' : 'Probar Login'}
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {loginResult && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Resultado del Test
                  </Typography>
                  <Alert 
                    severity={loginResult.success ? 'success' : 'error'} 
                    sx={{ mb: 2 }}
                  >
                    Status: {loginResult.status} - {loginResult.success ? 'Éxito' : 'Error'}
                  </Alert>
                  
                  <Box sx={{ 
                    p: 1, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    <pre>{JSON.stringify(loginResult.data, null, 2)}</pre>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
