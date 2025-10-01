# Ejemplo de Refactorización: Login Page

## 📊 Comparación Antes vs Después

### Versión Anterior (`page.tsx`)
```typescript
// ❌ 10+ useState individuales
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [emailError, setEmailError] = useState('');
const [passwordError, setPasswordError] = useState('');
const [apiError, setApiError] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);
// ... 3+ más

// ❌ Validación manual repetida
const validateForm = (): boolean => {
  let isValid = true;
  setEmailError('');
  setPasswordError('');

  if (!email.trim()) {
    setEmailError('El email es obligatorio');
    isValid = false;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido');
      isValid = false;
    }
  }

  if (!password) {
    setPasswordError('La contraseña es obligatoria');
    isValid = false;
  }

  return isValid;
};

// ❌ Manejo de errores sin tipado
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsLoading(true);
  setApiError('');

  try {
    // ❌ Fetch directo sin retry ni timeout
    const response = await fetch('/api/auth/login-retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // ❌ Parsing manual de respuesta
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    // ❌ Uso directo de localStorage sin tipado
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      await login(data.user);
      router.push('/');
    }
  } catch (error: any) {
    loggerClient.error('❌ Error:', error);
    setApiError(error.message || 'Error de conexión');
  } finally {
    setIsLoading(false);
  }
};

// Total: ~200 líneas con lógica mezclada
```

### Versión Refactorizada (`page.refactored.tsx`)
```typescript
// ✅ Hook único para formulario completo
const {
  values,
  errors,
  handleChange,
  handleSubmit,
  isSubmitting,
  setFieldError,
} = useForm<LoginFormData>({
  initialValues: {
    email: '',
    password: '',
  },
  validate: validateLoginForm,  // ✅ Validación centralizada
  onSubmit: handleLogin,
});

// ✅ Toggle simple con hook personalizado
const { value: showPassword, toggle: toggleShowPassword } = useToggle(false);

// ✅ Lógica de negocio limpia y separada
async function handleLogin(formData: LoginFormData) {
  try {
    // ✅ Cliente API con retry, timeout y tipado
    const response = await apiClient.post<{ user: UserBase }>('/api/auth/login-retry', {
      email: formData.email,
      password: formData.password,
    });

    // ✅ Manejo de errores tipado
    if (!response.success) {
      setFieldError('api', response.error || 'Error al iniciar sesión');
      await hapticError();
      return;
    }

    // ✅ Login con contexto y storage seguro
    if (response.data?.user) {
      await login(response.data.user);  // usa LocalStorage internamente
      await hapticSuccess();
      router.push('/');
    }
  } catch (error) {
    loggerClient.error('❌ Error en login:', error);
    setFieldError('api', 'Error de conexión. Intenta nuevamente.');
    await hapticError();
  }
}

// Total: ~180 líneas más organizadas y legibles
```

## 📈 Métricas de Mejora

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Líneas de código** | 200+ | ~180 | -10% |
| **useState hooks** | 10+ | 0 (usa useForm) | -100% |
| **Validación manual** | 45 líneas | 1 función importada | -97% |
| **Try-catch anidados** | 3 niveles | 1 nivel | -66% |
| **Uso de 'any'** | 5 instancias | 0 | -100% |
| **Fetch directo** | 1 | 0 (usa apiClient) | -100% |
| **localStorage directo** | 2 llamadas | 0 (usa LocalStorage) | -100% |
| **Complejidad ciclomática** | ~15 | ~8 | -47% |

## ✨ Ventajas de la Versión Refactorizada

### 1. **Código más limpio y mantenible**
- ✅ Separación de responsabilidades
- ✅ Lógica de negocio clara
- ✅ Menos estado local para gestionar

### 2. **Type Safety mejorado**
```typescript
// Antes: sin tipado
const data = await response.json();  // data: any

// Después: tipado completo
const response = await apiClient.post<{ user: UserBase }>(...);
// response.data.user es de tipo UserBase
```

### 3. **Reutilización de código**
- ✅ `useForm` se puede usar en registro, perfil, reset-password
- ✅ `validateLoginForm` centralizado y testeable
- ✅ `apiClient` usado en toda la app

### 4. **Mejor manejo de errores**
```typescript
// Antes: errores genéricos
catch (error: any) {
  setApiError(error.message || 'Error');
}

// Después: errores específicos por campo
if (!response.success) {
  setFieldError('api', response.error);  // Mensaje específico
  await hapticError();  // Feedback háptico
}
```

### 5. **Testing más fácil**
```typescript
// Puedes testear la validación de forma aislada
describe('validateLoginForm', () => {
  it('debe validar email requerido', () => {
    const errors = validateLoginForm({ email: '', password: 'test' });
    expect(errors.email).toBe('Email es obligatorio');
  });
});

// Puedes testear handleLogin con mock del apiClient
jest.mock('@/utils/api-client.utils');
```

## 🔄 Migración Paso a Paso

### Paso 1: Identificar el patrón antiguo
```typescript
// Buscar archivos con este patrón:
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [emailError, setEmailError] = useState('');
```

### Paso 2: Crear validador específico
```typescript
// En validation.utils.ts
export interface MyFormData extends Record<string, unknown> {
  // ... campos del formulario
}

export const validateMyForm = (data: MyFormData): FormErrors => {
  // ... lógica de validación
};
```

### Paso 3: Reemplazar con useForm
```typescript
const {
  values,
  errors,
  handleChange,
  handleSubmit,
  isSubmitting,
} = useForm<MyFormData>({
  initialValues: { /* ... */ },
  validate: validateMyForm,
  onSubmit: handleMySubmit,
});
```

### Paso 4: Actualizar JSX
```typescript
// Antes
<TextField
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!!emailError}
  helperText={emailError}
/>

// Después
<TextField
  name="email"
  value={values.email}
  onChange={handleChange}
  error={!!errors.email}
  helperText={errors.email}
/>
```

### Paso 5: Reemplazar fetch con apiClient
```typescript
// Antes
const response = await fetch('/api/...', { method: 'POST', ... });
const data = await response.json();

// Después
const response = await apiClient.post<ResponseType>('/api/...', data);
if (response.success) {
  // usar response.data
}
```

## 📋 Checklist de Migración

- [ ] Identificar formulario a refactorizar
- [ ] Crear interface para datos del formulario (extends `Record<string, unknown>`)
- [ ] Crear función de validación en `validation.utils.ts`
- [ ] Reemplazar useState con useForm
- [ ] Actualizar handlers de eventos (onChange, onSubmit)
- [ ] Reemplazar fetch directo con apiClient
- [ ] Reemplazar localStorage directo con LocalStorage
- [ ] Actualizar JSX con nuevos props
- [ ] Testear flujo completo
- [ ] Eliminar código antiguo comentado

## 🎯 Próximos Componentes a Refactorizar

### Alta Prioridad (páginas principales)
1. ✅ **login** - COMPLETADO (ejemplo)
2. ⏳ **registro** (`src/app/registro/page.tsx`)
   - 10+ useState
   - Validación duplicada con login
   - Fetch directo

3. ⏳ **reset-password** (`src/app/reset-password/page.tsx`)
   - 10 useState
   - Validación manual de email
   - Sin retry en API calls

4. ⏳ **perfil/editar** (`src/app/perfil/editar/page.tsx`)
   - 8+ useState
   - Validación manual
   - localStorage directo

### Media Prioridad (componentes reutilizables)
5. ⏳ **ContactForm** (si existe)
6. ⏳ **TaskForm** (crear/editar tareas)
7. ⏳ **AnnouncementForm** (anuncios)

### Baja Prioridad
8. ⏳ Formularios simples con 2-3 campos
9. ⏳ Componentes legacy poco usados

## 💡 Mejores Prácticas

### DO ✅
- Usar `useForm` para formularios con 3+ campos
- Centralizar validaciones en `validation.utils.ts`
- Usar `apiClient` para todas las llamadas API
- Usar `LocalStorage` para datos persistentes
- Definir interfaces que extienden `Record<string, unknown>`

### DON'T ❌
- No usar múltiples useState para formularios grandes
- No validar inline en componentes
- No usar fetch() directamente
- No acceder a localStorage sin wrapper
- No usar `any` - siempre tipar las respuestas

## 🧪 Testing

```typescript
// validation.utils.test.ts
describe('validateLoginForm', () => {
  it('valida email requerido', () => {
    const errors = validateLoginForm({ email: '', password: '123456' });
    expect(errors.email).toBeDefined();
  });

  it('valida formato de email', () => {
    const errors = validateLoginForm({ email: 'invalid', password: '123456' });
    expect(errors.email).toBe('El formato del email es inválido');
  });

  it('valida password requerido', () => {
    const errors = validateLoginForm({ email: 'test@example.com', password: '' });
    expect(errors.password).toBeDefined();
  });

  it('no retorna errores con datos válidos', () => {
    const errors = validateLoginForm({ email: 'test@example.com', password: '123456' });
    expect(Object.keys(errors).length).toBe(0);
  });
});
```

## 📚 Referencias

- [Documentación useForm Hook](../hooks/useForm.ts)
- [Guía de Validación](../utils/validation.utils.ts)
- [API Client Utils](../utils/api-client.utils.ts)
- [Storage Utils](../utils/storage.utils.ts)
- [Guía Completa de Refactorización](./REFACTORIZATION.md)
