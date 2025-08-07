'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Alert } from '@mui/material';

export default function TestAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      setResult({
        endpoint,
        status: response.status,
        data
      });
    } catch (error) {
      setResult({
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setResult({
        endpoint: '/api/test-db',
        status: response.status,
        data
      });
    } catch (error) {
      setResult({
        endpoint: '/api/test-db',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Test de Autenticación</Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="admin@badeo.com o user@badeo.com"
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="admin123 o user123"
          />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={() => testEndpoint('/api/auth/login')}
              disabled={loading}
            >
              Login Original
            </Button>
            <Button 
              variant="contained" 
              onClick={() => testEndpoint('/api/auth/login-simple')}
              disabled={loading}
            >
              Login Simple
            </Button>
            <Button 
              variant="contained" 
              onClick={() => testEndpoint('/api/auth/login-test')}
              disabled={loading}
            >
              Login Test
            </Button>
            <Button 
              variant="outlined" 
              onClick={testDatabase}
              disabled={loading}
            >
              Test DB
            </Button>
          </Box>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6">Resultado: {result.endpoint}</Typography>
            {result.error ? (
              <Alert severity="error">Error: {result.error}</Alert>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status: {result.status}
                </Typography>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
