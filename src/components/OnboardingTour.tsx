import React, { useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '#login-form',
    title: '¡Bienvenido!',
    content: '¿Quieres una guía rápida? Te enseñaremos a crear tu usuario y las funciones principales.',
    disableBeacon: true,
    placement: 'center',
  },
  {
    target: '#register-link',
    title: 'Crear usuario',
    content: 'Haz clic aquí para crear tu cuenta. Podrás elegir tu escuela, país, ciudad y más.',
    placement: 'bottom',
  },
  {
    target: '#register-form',
    title: 'Completa tus datos',
    content: 'Rellena todos los campos: nombre, email, contraseña, selecciona tu escuela y ubicación.',
    placement: 'top',
  },
  {
    target: '#school-select',
    title: 'Selecciona tu escuela',
    content: 'Elige tu escuela del listado. Esto asociará tu perfil a una ubicación y comunidad.',
    placement: 'right',
  },
  {
    target: '#country-select',
    title: 'Ubicación',
    content: 'Selecciona tu país, ciudad y pueblo. Así personalizaremos tu experiencia.',
    placement: 'right',
  },
  {
    target: '#submit-register',
    title: 'Finaliza el registro',
    content: 'Haz clic aquí para crear tu cuenta y empezar a explorar la app.',
    placement: 'top',
  },
  // Puedes añadir más pasos para otras funciones clave
];


export default function OnboardingTour({ run, onFinish }: { run: boolean; onFinish: () => void }) {
  // Permitir reanudar el tutorial desde el paso guardado en localStorage
  const [stepIndex, setStepIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboardingTourStep');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;
    // STATUS.FINISHED = 'finished', STATUS.SKIPPED = 'skipped'
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboardingTourStep');
      }
      onFinish();
    } else if (type === 'step:after' || type === 'error:target_not_found') {
      const nextStep = index + 1;
      setStepIndex(nextStep);
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingTourStep', String(nextStep));
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 2000,
          primaryColor: '#1976d2',
          textColor: '#fff',
          backgroundColor: '#252A3A',
        },
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar tutorial',
      }}
    />
  );
}
