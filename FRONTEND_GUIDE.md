# 📚 Classroom MVP - Frontend

Aplicación móvil tipo Google Classroom construida con React Native + Expo y TypeScript.

## 🎯 Características Principales

### Autenticación
- ✅ Registro e inicio de sesión local
- ✅ Autenticación con JWT
- ✅ Soporte para OAuth (Google) - En desarrollo
- ✅ Gestión segura de tokens con AsyncStorage

### Roles de Usuario
- 👨‍💼 **Administrador**: Gestión completa del sistema
- 👨‍🏫 **Profesor**: Crear y gestionar clases, tareas y calificaciones
- 👨‍🎓 **Alumno**: Unirse a clases, ver materiales y entregar tareas

### Funcionalidades por Rol

#### Profesor
- Crear y administrar clases
- Publicar anuncios y materiales
- Crear y calificar tareas
- Ver lista de alumnos

#### Alumno
- Unirse a clases con código
- Ver anuncios y materiales
- Entregar tareas
- Ver calificaciones

## 🏗️ Arquitectura del Proyecto

```
classroom-front/
├── app/                          # Rutas de la aplicación (Expo Router)
│   ├── _layout.tsx              # Layout principal con AuthProvider
│   ├── index.tsx                # Redireccionamiento según autenticación
│   ├── auth/
│   │   ├── login.tsx            # Pantalla de inicio de sesión
│   │   └── register.tsx         # Pantalla de registro
│   └── (tabs)/                  # Tabs principales
│       ├── _layout.tsx          # Configuración de tabs
│       ├── index.tsx            # Home: Lista de clases
│       └── explore.tsx          # Perfil de usuario
│
├── components/                   # Componentes reutilizables
│   └── ui/
│       ├── Button.tsx           # Botón personalizado
│       ├── Input.tsx            # Input con validación
│       ├── Card.tsx             # Tarjeta con sombra
│       ├── Loading.tsx          # Indicador de carga
│       ├── Alert.tsx            # Alertas (success, error, etc.)
│       └── ClassCard.tsx        # Tarjeta de clase
│
├── contexts/                     # Context API para estado global
│   └── AuthContext.tsx          # Gestión de autenticación y usuario
│
├── services/                     # Servicios de API
│   └── api.ts                   # Cliente HTTP con todas las peticiones
│
├── types/                        # Tipos e interfaces de TypeScript
│   └── index.ts                 # Tipos: User, Class, Task, etc.
│
└── constants/                    # Constantes y configuración
    └── theme.ts                 # Colores y estilos globales
```

## 🛠️ Tecnologías Utilizadas

- **React Native** 0.81.5
- **Expo** ~54.0
- **TypeScript** ~5.9
- **Expo Router** ~6.0 (Navegación file-based)
- **React Navigation** ^7.1 (Bottom tabs)
- **AsyncStorage** (Almacenamiento local)
- **Expo Vector Icons** (Iconografía)

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Expo CLI
- Emulador Android/iOS o dispositivo físico con Expo Go

### Pasos

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd classroom-front
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la URL del backend**

Edita el archivo `services/api.ts` y ajusta la URL de tu API:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Para desarrollo
  : 'https://tu-api.com/api';    // Para producción
```

> **Nota**: Si usas un emulador de Android, usa `http://10.0.2.2:3000/api`  
> Si usas un dispositivo físico, usa la IP local de tu computadora, por ejemplo: `http://192.168.1.100:3000/api`

4. **Iniciar la aplicación**
```bash
npm start
```

5. **Ejecutar en dispositivo/emulador**
- Para Android: Presiona `a`
- Para iOS: Presiona `i`
- Para web: Presiona `w`
- O escanea el código QR con Expo Go

## 🔌 Integración con el Backend

La aplicación se conecta al backend mediante el servicio `ApiService` ubicado en `services/api.ts`.

### Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/google` - Login con Google
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Obtener usuario actual

#### Clases
- `GET /api/classes` - Listar clases
- `POST /api/classes` - Crear clase (profesor)
- `GET /api/classes/:id` - Detalle de clase
- `POST /api/classes/join` - Unirse a clase (alumno)

#### Tareas
- `GET /api/classes/:id/tasks` - Tareas de una clase
- `POST /api/classes/:id/tasks` - Crear tarea (profesor)
- `POST /api/tasks/:id/submit` - Entregar tarea (alumno)

### Manejo de Errores

El servicio API incluye:
- ✅ Manejo automático de tokens expirados
- ✅ Reintento automático con refresh token
- ✅ Mensajes de error claros
- ✅ Timeout y manejo de conexión

### Ejemplo de Uso

```typescript
import apiService from '@/services/api';

// Obtener clases
const response = await apiService.getClasses();
if (response.success) {
  console.log(response.data); // Lista de clases
} else {
  console.error(response.error); // Mensaje de error
}
```

## 🎨 Componentes UI

### Button
```tsx
<Button
  title="Guardar"
  onPress={handleSave}
  variant="primary"  // primary | secondary | outline | danger
  size="medium"      // small | medium | large
  loading={isLoading}
  fullWidth
/>
```

### Input
```tsx
<Input
  label="Correo electrónico"
  placeholder="tu@correo.com"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  icon="mail-outline"
  isPassword={false}
/>
```

### Card
```tsx
<Card onPress={() => navigate('/detail')}>
  <Text>Contenido de la tarjeta</Text>
</Card>
```

### Alert
```tsx
<Alert
  type="success"  // success | error | warning | info
  message="¡Operación exitosa!"
  onClose={() => setAlert(null)}
/>
```

## 🔐 Autenticación

### Context API

El estado de autenticación se maneja globalmente con `AuthContext`:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Usar el usuario actual
  console.log(user.name);
  
  // Iniciar sesión
  const result = await login({ email, password });
  
  // Cerrar sesión
  await logout();
}
```

### Verificar Roles

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

## 📱 Navegación

La aplicación usa **Expo Router** con navegación file-based:

- `/` - Redirige a login o home según autenticación
- `/auth/login` - Pantalla de inicio de sesión
- `/auth/register` - Pantalla de registro
- `/(tabs)/` - Navegación por tabs (Home y Perfil)
- `/(tabs)/index` - Lista de clases
- `/(tabs)/explore` - Perfil de usuario

### Navegación Programática

```typescript
import { router } from 'expo-router';

// Navegar a una ruta
router.push('/class/123');

// Reemplazar (sin volver atrás)
router.replace('/(tabs)');

// Volver atrás
router.back();
```

## 🎯 Buenas Prácticas Implementadas

### UX/UI Mobile
- ✅ Botones con feedback visual (opacity)
- ✅ Loading states en todas las operaciones
- ✅ Mensajes de error claros y contextuales
- ✅ Validación de formularios en tiempo real
- ✅ Pull to refresh en listas
- ✅ Estados vacíos con ilustraciones
- ✅ Iconografía consistente
- ✅ Diseño responsive

### Código
- ✅ TypeScript estricto
- ✅ Componentes modulares y reutilizables
- ✅ Separación de responsabilidades
- ✅ Manejo centralizado de API
- ✅ Contextos para estado global
- ✅ Comentarios y documentación
- ✅ Nombres descriptivos

### Seguridad
- ✅ Tokens en AsyncStorage (no en memoria)
- ✅ Refresh automático de tokens
- ✅ Validación de formularios
- ✅ Manejo seguro de contraseñas
- ✅ Logout con confirmación

## 🚀 Próximos Pasos

### Pantallas Implementadas ✅
- [x] Detalle de clase (anuncios, materiales, tareas) - `app/class/[id].tsx`
- [x] Crear/editar tarea - `app/task/create.tsx`
- [x] Entregar tarea - `app/task/[id].tsx`
- [x] Ver calificaciones - Incluido en `app/task/[id].tsx`

### Pantallas Pendientes
- [ ] Gestión de materiales (crear/subir archivos)
- [ ] Crear anuncios
- [ ] Ver entregas (para profesores)
- [ ] Calificar entregas
- [ ] Chat/comentarios

### Funcionalidades Pendientes
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Subida de archivos
- [ ] Filtros y búsqueda
- [ ] Configuración de usuario
- [ ] Temas (dark mode)
- [ ] Internacionalización (i18n)

### Integraciones
- [ ] Completar OAuth con Google
- [ ] OAuth con Facebook
- [ ] Integración con Google Drive
- [ ] Calendario

## 🐛 Debugging

### Ver logs en tiempo real
```bash
npm start
# Luego en otra terminal:
npx react-native log-android  # Para Android
npx react-native log-ios      # Para iOS
```

### Problemas Comunes

#### Error de conexión al backend
- Verifica que el backend esté corriendo
- Revisa la URL en `services/api.ts`
- En Android emulador, usa `10.0.2.2` en vez de `localhost`
- En dispositivo físico, usa la IP local de tu PC

#### AsyncStorage no funciona
```bash
npx expo install @react-native-async-storage/async-storage
```

#### Expo Router no encuentra rutas
- Limpia el cache: `npx expo start --clear`
- Verifica que los archivos estén en la carpeta `app/`

## 📄 Licencia

MIT

## 👥 Contribución

Este es un proyecto MVP. Para contribuir:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📞 Soporte

Para dudas o problemas, abre un issue en el repositorio.

---

**¡Gracias por usar Classroom MVP!** 🎉
