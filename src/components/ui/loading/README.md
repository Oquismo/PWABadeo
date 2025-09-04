# Material 3 Loading Components

Componentes de carga siguiendo las especificaciones oficiales de Material Design 3 con animaciones de morphing y estados adaptativos.

## Componentes Disponibles

### Material3LoadingIndicator

Indicador de carga con animación de morphing que transforma entre círculo y cuadrado redondeado.

```typescript
import { Material3LoadingIndicator } from '@/components/ui/loading';

// Uso básico
<Material3LoadingIndicator />

// Con tamaño personalizado
<Material3LoadingIndicator size="large" />

// Versión contenida
<Material3LoadingIndicator contained />

// Con color personalizado
<Material3LoadingIndicator color="primary" />
```

#### Props

- `size?: 'small' | 'medium' | 'large'` - Tamaño del indicador (24dp, 38dp, 48dp)
- `contained?: boolean` - Si debe mostrar fondo contenedor
- `color?: 'primary' | 'secondary' | 'tertiary' | 'surface'` - Color semántico
- `className?: string` - Clases CSS adicionales

#### Variantes Predefinidas

```typescript
import { 
  Material3LoadingIndicatorSmall,
  Material3LoadingIndicatorLarge,
  Material3LoadingIndicatorContained 
} from '@/components/ui/loading';

<Material3LoadingIndicatorSmall />
<Material3LoadingIndicatorLarge />
<Material3LoadingIndicatorContained />
```

### Material3LoadingPage

Componente para carga de página completa con overlay y transiciones.

```typescript
import { Material3LoadingPage } from '@/components/ui/loading';

// Carga de página básica
<Material3LoadingPage 
  loading={isLoading} 
  message="Cargando perfil..." 
/>

// Pantalla completa
<Material3LoadingPageFullScreen 
  loading={isLoading}
  title="Badeo"
  message="Preparando tu experiencia..."
/>

// Carga inline
<Material3LoadingInline 
  loading={isLoading}
  size="small"
  message="Guardando..."
/>
```

#### Props

- `loading: boolean` - Estado de carga
- `message?: string` - Mensaje descriptivo
- `title?: string` - Título (solo fullscreen)
- `fullscreen?: boolean` - Modo pantalla completa
- `size?: 'small' | 'medium' | 'large'` - Tamaño del indicador
- `className?: string` - Clases CSS adicionales

## Características Técnicas

### Animaciones

- **Shape Morphing**: Transición suave entre círculo y cuadrado redondeado
- **Material Motion**: Curvas de easing `cubic-bezier(0.2, 0, 0, 1)`
- **Rotación Continua**: 360° en 1.4 segundos para mantener fluidez
- **Fade Transitions**: Aparición y desaparición suaves de 300ms

### Colores Semánticos

Los componentes utilizan el sistema de tokens de Material 3:

- `primary`: Color primario de la aplicación
- `secondary`: Color secundario 
- `tertiary`: Color terciario
- `surface`: Color de superficie adaptativo

### Accesibilidad

- **ARIA Labels**: `aria-label="Loading"` automático
- **Screen Readers**: Texto descriptivo para lectores de pantalla
- **Reduced Motion**: Respeta `prefers-reduced-motion`
- **Focus Management**: No interfiere con el flujo de focus

### Responsividad

- **Tamaños Adaptativos**: 24dp (small), 38dp (medium), 48dp (large)
- **Contenedores Flexibles**: Se adaptan al contenedor padre
- **Overlay Responsivo**: Fullscreen se adapta a viewport

## Ejemplos de Uso

### En Formularios

```typescript
// Botón con carga
<Button disabled={loading}>
  {loading && <Material3LoadingIndicatorSmall />}
  {loading ? 'Guardando...' : 'Guardar'}
</Button>

// Campo con validación
<Box sx={{ position: 'relative' }}>
  <MaterialTextField />
  {validating && (
    <Material3LoadingIndicator 
      size="small" 
      style={{ position: 'absolute', right: 8, top: '50%' }}
    />
  )}
</Box>
```

### En Páginas

```typescript
// Página con carga de datos
function ProfilePage() {
  const [loading, setLoading] = useState(true);
  
  return (
    <>
      <Material3LoadingPage 
        loading={loading}
        message="Cargando perfil de usuario..."
      />
      {!loading && <ProfileContent />}
    </>
  );
}

// Modal con carga
<Material3Dialog open={open}>
  <DialogContent>
    {loading ? (
      <Material3LoadingInline 
        loading={true}
        message="Procesando solicitud..."
      />
    ) : (
      <DialogBody />
    )}
  </DialogContent>
</Material3Dialog>
```

### En Listas y Cards

```typescript
// Card con carga de contenido
<Material3ElevatedCard>
  {loading ? (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Material3LoadingIndicator />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Cargando proyecto...
      </Typography>
    </Box>
  ) : (
    <CardContent />
  )}
</Material3ElevatedCard>
```

## Migración

### Desde CircularProgress

```typescript
// Antes
<CircularProgress size={24} />
<CircularProgress color="primary" />

// Después  
<Material3LoadingIndicatorSmall />
<Material3LoadingIndicator color="primary" />
```

### Desde Loading Personalizado

```typescript
// Antes
<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
  <CircularProgress />
  <Typography>Loading...</Typography>
</Box>

// Después
<Material3LoadingInline 
  loading={true} 
  message="Loading..." 
/>
```

## Performance

- **CSS Transforms**: Utiliza `transform` para animaciones GPU-aceleradas
- **Optimización de Re-renders**: Componentes memo optimizados
- **Bundle Size**: Mínimo overhead (~2KB gzipped)
- **Tree Shaking**: Importaciones optimizadas

## Compatibilidad

- **React**: 17+ (hooks requeridos)
- **Material-UI**: 5+ (sistema de theming)
- **TypeScript**: Completamente tipado
- **Browsers**: Modernos con soporte CSS Grid y Flexbox
