import React, { useState } from 'react';

type Ubicacion = {
  lat: number;
  lng: number;
} | null;

export default function GeolocalizacionDemo() {
  const [ubicacion, setUbicacion] = useState<Ubicacion>(null);
  const [error, setError] = useState('');
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);

  const solicitarPermiso = () => {
    setMostrarExplicacion(true);
  };

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada en este navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError('');
      },
      (err) => {
        setError('No se pudo obtener la ubicación: ' + err.message);
      }
    );
    setMostrarExplicacion(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Demo de Permiso de Geolocalización</h2>
      <button onClick={solicitarPermiso} style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
        Obtener mi ubicación
      </button>
      {mostrarExplicacion && (
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: 6, marginBottom: '1rem' }}>
          <p>
            Para mostrarte información relevante cerca de ti, necesitamos acceder a tu ubicación. <br />
            <strong>Tu ubicación solo se usará para mostrarte contenido local y nunca se compartirá con terceros.</strong>
          </p>
          <button onClick={obtenerUbicacion} style={{ padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
            Permitir acceso
          </button>
        </div>
      )}
      {ubicacion && (
        <div>
          <p><strong>Latitud:</strong> {ubicacion.lat}</p>
          <p><strong>Longitud:</strong> {ubicacion.lng}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
