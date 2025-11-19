# 📚 Classroom MVP - Frontend

Aplicación móvil tipo Google Classroom construida con React Native, Expo y TypeScript.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` basado en el ejemplo:

```bash
cp .env.example .env
```

Edita el archivo `.env` con la URL de tu API:

```env
# Para desarrollo local
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api

# Para producción
EXPO_PUBLIC_API_URL_PROD=https://tu-api.com/api
```

**Importante - URLs según dispositivo:**
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **iOS Simulator**: `http://localhost:3000/api`
- **Dispositivo Físico**: `http://TU_IP_LOCAL:3000/api` (ej: `http://192.168.1.100:3000/api`)

> 📖 Ver [**ENV_GUIDE.md**](./ENV_GUIDE.md) para configuración detallada

### 3. Iniciar la aplicación

```bash
npm start
```

Luego escanea el código QR con Expo Go o presiona:
- `a` para Android
- `i` para iOS  
- `w` para web

## 📱 Características Implementadas

- ✅ **Autenticación completa**: Login, registro con JWT
- ✅ **Google OAuth**: Inicio de sesión con Google (ver [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md))
- ✅ **Roles de usuario**: Administrador, Profesor y Alumno
- ✅ **Gestión de clases**: Crear y unirse a clases
- ✅ **UI/UX Mobile-first**: Componentes reutilizables con feedback visual
- ✅ **Estado global**: Context API para autenticación
- ✅ **Navegación**: Expo Router con protección de rutas
- 🚧 **Tareas y entregas**: En desarrollo
- 🚧 **Materiales**: En desarrollo

## 📂 Estructura del Proyecto

```
classroom-front/
├── app/                    # Rutas de la aplicación (Expo Router)
│   ├── (tabs)/            # Tabs: Home y Perfil
│   │   ├── index.tsx      # Lista de clases
│   │   └── explore.tsx    # Perfil de usuario
│   ├── auth/              # Login y registro
│   ├── _layout.tsx        # Layout con AuthProvider
│   └── index.tsx          # Redirección inicial
├── components/ui/         # Componentes reutilizables
│   ├── Button.tsx         # Botón personalizado
│   ├── Input.tsx          # Input con validación
│   ├── Card.tsx           # Tarjetas
│   ├── Alert.tsx          # Alertas
│   └── ClassCard.tsx      # Tarjeta de clase
├── contexts/              # Context API
│   └── AuthContext.tsx    # Estado de autenticación
├── services/              # Servicios
│   └── api.ts             # Cliente HTTP para API REST
├── types/                 # TypeScript interfaces
│   └── index.ts           # Tipos globales
└── assets/                # Recursos estáticos
```

## 📖 Documentación Completa

Lee la [**Guía del Frontend**](./FRONTEND_GUIDE.md) para información detallada sobre:

- 🏗️ Arquitectura del proyecto
- 🎨 Componentes UI disponibles
- 🔌 Integración con el backend
- 🎯 Buenas prácticas implementadas
- 🚀 Próximos pasos para desarrollo

## 🛠️ Scripts Disponibles

```bash
npm start          # Iniciar Expo dev server
npm run android    # Ejecutar en emulador/dispositivo Android
npm run ios        # Ejecutar en simulador iOS
npm run web        # Ejecutar en navegador
npm run lint       # Ejecutar ESLint
```

## 🔐 Autenticación

La app maneja autenticación con JWT y OAuth:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loginWithGoogle, isAuthenticated } = useAuth();
  
  // Login con email/password
  const result = await login({ email, password });
  
  // Login con Google OAuth
  const googleResult = await loginWithGoogle(idToken);
  
  // Logout
  await logout();
}
```

### Google OAuth

Para configurar Google Sign-In, sigue la guía completa en [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md).

```typescript
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

function LoginScreen() {
  const { isReady, signInWithGoogle } = useGoogleAuth();
  
  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.type === 'success') {
      // Enviar idToken al backend
      await loginWithGoogle(result.idToken);
    }
  };
}
```

### Verificar roles:

```typescript
import { useRole } from '@/contexts/AuthContext';

function MyComponent() {
  const { isTeacher, isStudent, isAdmin } = useRole();
  
  return (
    <>
      {isTeacher && <CreateClassButton />}
      {isStudent && <JoinClassButton />}
    </>
  );
}
```

## 🔌 API Integration

Todas las peticiones al backend se hacen a través de `services/api.ts`:

```typescript
import apiService from '@/services/api';

// Obtener clases
const response = await apiService.getClasses();
if (response.success) {
  console.log(response.data);
}

// Crear clase (profesor)
await apiService.createClass({ name, description });

// Unirse a clase (alumno)
await apiService.joinClass(code);
```

## 🧹 Proyecto Limpio

Este proyecto ha sido limpiado de archivos innecesarios:

✅ Sin componentes de ejemplo de Expo  
✅ Sin hooks personalizados no utilizados  
✅ Sin scripts de reset  
✅ Sin imágenes de React de ejemplo  
✅ Solo 31 archivos esenciales

**Total eliminado**: 23+ archivos y carpetas no utilizados

## 🎨 Componentes UI

### Button
```tsx
<Button
  title="Guardar"
  onPress={handleSave}
  variant="primary"  // primary | secondary | outline | danger
  loading={isLoading}
  fullWidth
/>
```

### Input
```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  icon="mail-outline"
  isPassword={false}
/>
```

### Alert
```tsx
<Alert
  type="success"  // success | error | warning | info
  message="¡Operación exitosa!"
  onClose={() => setAlert(null)}
/>
```

## 🚀 Próximos Pasos

Para completar el MVP:

1. ✅ ~~Autenticación y gestión de usuarios~~
2. ✅ ~~Home con lista de clases~~
3. ✅ ~~Crear/unirse a clases~~
4. 🚧 Detalle de clase con tabs (anuncios, materiales, tareas)
5. 🚧 Crear y entregar tareas
6. 🚧 Sistema de calificaciones
7. �� Subida de archivos
8. 🚧 Notificaciones push

## 📱 Capturas (Próximamente)

_Agrega capturas de pantalla aquí una vez que el diseño esté finalizado_

## 🐛 Troubleshooting

### Error de conexión al backend
- ✅ Verifica que el backend esté corriendo
- ✅ Revisa la URL en `services/api.ts`
- ✅ En Android emulador usa `10.0.2.2` en vez de `localhost`
- ✅ En dispositivo físico usa la IP local de tu PC

### Problemas con dependencias
```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

## 📄 Licencia

MIT

## 👥 Contribuir

¿Quieres contribuir? 
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Agregar nueva feature'`)
4. Push (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

---

**Desarrollado con ❤️ usando React Native + Expo**
