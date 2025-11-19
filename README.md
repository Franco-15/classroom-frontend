# 📚 Classroom MVP — Frontend (Expo + TypeScript)

Proyecto frontend móvil tipo Google Classroom, implementado con React Native, Expo Router y TypeScript.

Este README contiene lo esencial para poner el proyecto en marcha localmente, información sobre la estructura del repositorio y enlaces a la documentación interna.

## Requisitos

- Node.js 18+ (recomendado)
- npm o pnpm
- Expo CLI (opcional: `npm i -g expo-cli`)
- Emulador iOS/Android o la app Expo Go en dispositivo físico

## Instalación rápida

1. Instalar dependencias

```bash
npm install
```

2. Configurar variables de entorno

Copia el ejemplo y edita según tu entorno:

```bash
cp .env.example .env
```

Variables importantes (ejemplos):

```env
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
EXPO_PUBLIC_API_URL_PROD=https://tu-api.com/api
```

Notas sobre URLs según el dispositivo:
- Android emulator (Android Studio): `http://10.0.2.2:3000/api`
- iOS simulator: `http://localhost:3000/api`
- Dispositivo físico: `http://<TU_IP_LOCAL>:3000/api` (ej: `http://192.168.1.100:3000/api`)

3. Iniciar el servidor de desarrollo

```bash
npm start
```

Con el servidor corriendo puedes presionar:
- `a` para abrir en Android
- `i` para abrir en iOS
- `w` para web
o escanear el QR con Expo Go.

## Scripts (package.json)

El proyecto incluye los siguientes scripts (definidos en `package.json`):

```bash
npm start        # inicia expo dev server
npm run android  # abre en Android
npm run ios      # abre en iOS
npm run web      # inicia en navegador
npm run lint     # ejecuta ESLint
```

## Resumen de arquitectura

Rutas principales y carpetas relevantes:

```
app/                 # Rutas (Expo Router)
components/ui/       # Componentes reutilizables (Button, Input, Card...)
contexts/            # Providers / Context API (AuthContext)
hooks/               # Custom hooks (useGitHubAuth, etc.)
services/            # Cliente API y utilidades (services/api.ts)
assets/              # Imágenes y recursos estáticos
types/               # Tipos TypeScript globales
```

Observa `app/` para ver las rutas y layouts: la app usa Expo Router y páginas anidadas.

## Funcionalidades principales

- Autenticación (email/password + Google OAuth)
- Gestión de clases (crear, unirse, ver estudiantes)
- Roles (admin, teacher, student) con UI condicional
- Navegación protegida con Context API

Funcionalidades en progreso: tareas/entregas, sistema de calificaciones y notificaciones.

## Integración con el backend

Todas las llamadas al backend pasan por `services/api.ts`. Asegúrate de que la URL base en `.env` y en `services/api.ts` coincidan. Para pruebas locales desde un dispositivo físico, usa la IP de tu máquina.

## Buenas prácticas y notas

- Código en TypeScript
- ESLint configurado (usa `npm run lint`)
- Componentes UI en `components/ui` para reutilización

## Contribuir

1. Fork
2. Crear rama (`git checkout -b feature/mi-feature`)
3. Commit y push
4. Abrir PR y describir cambios

## Troubleshooting rápido

- Problemas con dependencias: elimina `node_modules` y reinstala

```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

- Si la app no se conecta al backend, revisa la URL en `.env` y usa `10.0.2.2` para emulador Android.

## Licencia

MIT

---

Si quieres que añada secciones (por ejemplo: capturas, un changelog, o una guía para contributors con PR template), dime qué prefieres y lo incorporo.

**Hecho con ❤️ usando React Native + Expo**
