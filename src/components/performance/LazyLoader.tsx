/**
 * Sistema de Lazy Loading Inteligente
 * Optimiza la carga de componentes pesados con diferentes estrategias
 */

import React, { Suspense, ComponentType, ReactNode } from 'react';
import { Box, CircularProgress, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

// Tipos para el lazy loader
interface LazyLoaderProps {
  children: ReactNode;
  fallback?: 'spinner' | 'skeleton' | 'minimal' | ReactNode;
  delay?: number;
  preload?: boolean;
  errorFallback?: ReactNode;
}

interface LazyComponentOptions {
  fallback?: LazyLoaderProps['fallback'];
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  viewport?: boolean; // Cargar solo cuando esté en viewport
}

// Componentes de fallback optimizados
const FallbackSpinner = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
    sx={{ backgroundColor: 'transparent' }}
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <CircularProgress size={40} thickness={2} />
    </motion.div>
  </Box>
);

const FallbackSkeleton = ({ height = 200 }: { height?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    <Skeleton
      variant="rectangular"
      height={height}
      sx={{
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }}
    />
  </motion.div>
);

const FallbackMinimal = () => (
  <Box
    sx={{
      height: '1px',
      backgroundColor: 'transparent',
    }}
  />
);

// Error Boundary para lazy loading
class LazyErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100px"
          sx={{ color: 'text.secondary' }}
        >
          Error al cargar componente
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook para detectar si un elemento está en viewport
const useInViewport = (ref: React.RefObject<Element>, options = {}) => {
  const [isInViewport, setIsInViewport] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isInViewport;
};

// Componente principal de lazy loading
export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback = 'skeleton',
  delay = 0,
  preload = false,
  errorFallback,
}) => {
  const [shouldRender, setShouldRender] = React.useState(!delay || preload);

  React.useEffect(() => {
    if (delay && !preload) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay, preload]);

  const getFallbackComponent = () => {
    if (React.isValidElement(fallback)) {
      return fallback;
    }

    switch (fallback) {
      case 'spinner':
        return <FallbackSpinner />;
      case 'skeleton':
        return <FallbackSkeleton />;
      case 'minimal':
        return <FallbackMinimal />;
      default:
        return <FallbackSkeleton />;
    }
  };

  if (!shouldRender) {
    return <>{getFallbackComponent()}</>;
  }

  return (
    <LazyErrorBoundary fallback={errorFallback}>
      <Suspense fallback={getFallbackComponent()}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
};

// Hook para crear componentes lazy con opciones avanzadas
export const useLazyComponent = (
  componentLoader: () => Promise<{ default: ComponentType<any> }>,
  options: LazyComponentOptions = {}
) => {
  const LazyComponent = React.lazy(componentLoader);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInViewport = useInViewport(containerRef);

  const shouldLoad = React.useMemo(() => {
    if (!options.viewport) return true;
    return isInViewport;
  }, [isInViewport, options.viewport]);

  const WrappedComponent = React.forwardRef<any, any>((props: any) => {
    if (!shouldLoad) {
      return (
        <Box ref={containerRef}>
          {options.fallback === 'skeleton' ? <FallbackSkeleton /> : <FallbackMinimal />}
        </Box>
      );
    }

    return (
      <LazyLoader fallback={options.fallback} preload={options.preload}>
        <LazyComponent {...props} />
      </LazyLoader>
    );
  });

  WrappedComponent.displayName = `Lazy(Component)`;

  return WrappedComponent;
};

// Utilidades para preloading estratégico
export const preloadComponent = (componentLoader: () => Promise<any>) => {
  // Preload después de que la página principal haya cargado
  if (typeof window !== 'undefined') {
    requestIdleCallback(
      () => {
        componentLoader();
      },
      { timeout: 2000 }
    );
  }
};

// HOC para lazy loading automático
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  options: LazyComponentOptions = {}
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));

  return React.forwardRef<any, P>((props, ref) => (
    <LazyLoader fallback={options.fallback} preload={options.preload}>
      <LazyComponent {...props} ref={ref} />
    </LazyLoader>
  ));
};

export default LazyLoader;