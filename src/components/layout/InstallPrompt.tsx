'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import ShareIcon from '@mui/icons-material/Share';

const STORAGE_KEY = 'installPromptDismissed';

function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|webOS/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/i.test(ua);
}

function isInIFrame(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.top !== window.self;
  } catch {
    return true;
  }
}

export default function InstallPrompt() {
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef<any>(null);
  const [installMethod, setInstallMethod] = useState<'native' | 'ios' | 'other'>('native');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone()) return;
    if (!isMobile()) return;
    if (isInIFrame()) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') return;

    const detectMethod = () => {
      if (isIOS()) {
        setInstallMethod('ios');
      } else if (deferredPrompt.current) {
        setInstallMethod('native');
      } else {
        setInstallMethod('other');
      }
    };

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      detectMethod();
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const timeout = setTimeout(() => {
      detectMethod();
      setShow(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeout);
    };
  }, []);

  const handleInstall = async () => {
    if (installMethod === 'native' && deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const result = await deferredPrompt.current.userChoice;
      if (result.outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
      deferredPrompt.current = null;
      setShow(false);
      return;
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  const handleLater = () => {
    setShow(false);
  };

  if (!show) return null;

  const isIOSMethod = installMethod === 'ios';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      animation: 'fadeIn 0.3s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulse { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .install-card { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      <div className="install-card" style={{
        background: theme.palette.background.paper,
        borderRadius: 24,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: 380,
        width: '100%',
        padding: 32,
        position: 'relative',
        textAlign: 'center',
      }}>
        <IconButton
          onClick={handleDismiss}
          size="small"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>

        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #7c4dff, #40c4ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 24px rgba(124,77,255,0.3)',
        }}>
          <InstallMobileIcon style={{ fontSize: 40, color: '#fff' }} />
        </div>

        <h2 style={{
          margin: '0 0 8px',
          fontWeight: 700,
          fontSize: '1.5rem',
          color: theme.palette.text.primary,
        }}>
          Instala la App
        </h2>

        <p style={{
          margin: '0 0 24px',
          color: theme.palette.text.secondary,
          fontSize: '0.95rem',
          lineHeight: 1.5,
        }}>
          {isIOSMethod
            ? 'Añade Barrio Oportunidades a tu pantalla de inicio para acceder más rápido y sin internet.'
            : 'Instala la app en tu dispositivo para una experiencia más rápida y acceso sin conexión.'}
        </p>

        {isIOSMethod ? (
          <div style={{
            background: theme.palette.action.hover,
            borderRadius: 16,
            padding: '20px 16px',
            marginBottom: 24,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: theme.palette.primary.main,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ShareIcon style={{ fontSize: 18, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: theme.palette.text.primary, marginBottom: 2 }}>
                  1. Toca Compartir
                </div>
                <div style={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>
                  En la barra inferior del navegador
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: theme.palette.secondary.main,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <TouchAppIcon style={{ fontSize: 18, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: theme.palette.text.primary, marginBottom: 2 }}>
                  2. Desplázate hacia abajo
                </div>
                <div style={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>
                  En el menú de compartir
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#4caf50',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>+</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: theme.palette.text.primary, marginBottom: 2 }}>
                  3. Añadir a Pantalla de Inicio
                </div>
                <div style={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>
                  Toca el botón y listo
                </div>
              </div>
            </div>
          </div>
        ) : installMethod === 'native' ? (
          <div style={{
            background: theme.palette.action.hover,
            borderRadius: 16,
            padding: '16px',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <InstallMobileIcon style={{ fontSize: 28, color: theme.palette.primary.main }} />
              <span style={{ fontSize: '0.9rem', color: theme.palette.text.secondary }}>
                Tu navegador permite instalar esta app como una aplicación nativa.
              </span>
            </div>
          </div>
        ) : (
          <div style={{
            background: theme.palette.action.hover,
            borderRadius: 16,
            padding: '16px',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <InstallMobileIcon style={{ fontSize: 28, color: theme.palette.primary.main }} />
              <span style={{ fontSize: '0.9rem', color: theme.palette.text.secondary }}>
                Busca "Añadir a pantalla de inicio" en el menú de tu navegador.
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {installMethod === 'native' ? (
            <Button
              variant="contained"
              fullWidth
              onClick={handleInstall}
              style={{
                borderRadius: 12,
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #7c4dff, #40c4ff)',
              }}
            >
              Instalar App
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleInstall}
              style={{
                borderRadius: 12,
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #7c4dff, #40c4ff)',
              }}
            >
              Entendido
            </Button>
          )}

          <Button
            variant="text"
            fullWidth
            onClick={handleLater}
            style={{
              borderRadius: 12,
              padding: '8px',
              fontWeight: 500,
              fontSize: '0.9rem',
              textTransform: 'none',
              color: theme.palette.text.secondary,
            }}
          >
            Ahora no
          </Button>
        </div>

        <p style={{
          margin: '16px 0 0',
          fontSize: '0.75rem',
          color: theme.palette.text.disabled,
          lineHeight: 1.4,
        }}>
          {isIOSMethod
            ? 'Esta app es una Progressive Web App (PWA). Al añadirla a tu pantalla de inicio funciona como una app nativa.'
            : 'La app se instalará sin pasar por la tienda de aplicaciones. Ocupa muy poco espacio.'}
        </p>
      </div>
    </div>
  );
}
