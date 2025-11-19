# 🔐 Variables de Entorno

Este proyecto usa variables de entorno para manejar configuraciones sensibles como URLs de API y credenciales OAuth.

## 📝 Configuración Inicial

### 1. Crear archivo `.env`

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

### 2. Configurar las variables

Edita el archivo `.env` con tus valores:

```env
# API Configuration
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
EXPO_PUBLIC_API_URL_PROD=https://tu-api.produccion.com/api

# OAuth (opcional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
EXPO_PUBLIC_FACEBOOK_APP_ID=tu-facebook-app-id
```

## 🔧 URLs de API según el dispositivo

### Desarrollo Local

**Android Emulator:**
```env
EXPO_PUBLIC_API_URL_DEV=http://10.0.2.2:3000/api
```

**iOS Simulator:**
```env
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
```

**Dispositivo Físico (mismo WiFi):**
```env
EXPO_PUBLIC_API_URL_DEV=http://192.168.1.XXX:3000/api
```
> Reemplaza XXX con la IP local de tu computadora. Puedes obtenerla con:
> - Windows: `ipconfig`
> - Mac/Linux: `ifconfig` o `ip addr`

**Expo Go:**
```env
EXPO_PUBLIC_API_URL_DEV=http://TU_IP_LOCAL:3000/api
```

## 🏗️ Uso en el Código

Las variables se acceden a través del archivo `config/env.ts`:

```typescript
import { API_CONFIG, OAUTH_CONFIG } from '@/config/env';

// URL de la API
console.log(API_CONFIG.baseURL);

// Credenciales OAuth
console.log(OAUTH_CONFIG.googleClientId);
```

## 🚀 Builds de Producción

### EAS Build

Cuando hagas un build con EAS, configura las variables en `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL_PROD": "https://api.produccion.com/api"
      }
    },
    "development": {
      "env": {
        "EXPO_PUBLIC_API_URL_DEV": "http://localhost:3000/api"
      }
    }
  }
}
```

O usa EAS Secrets:

```bash
# Configurar secretos en EAS
eas secret:create --scope project --name EXPO_PUBLIC_API_URL_PROD --value https://api.produccion.com/api
```

### Expo Publish / Updates

Las variables con prefijo `EXPO_PUBLIC_` se incluyen automáticamente en el bundle.

## ⚠️ Importante

### Variables Públicas vs Privadas

- **`EXPO_PUBLIC_*`**: Se incluyen en el bundle de la app (cliente)
  - ✅ Usar para URLs de API públicas
  - ✅ Usar para IDs de OAuth (públicos)
  - ❌ NO usar para secretos/keys privadas

- **Sin prefijo**: Solo disponibles en tiempo de build
  - ✅ Usar para configuraciones de build
  - ✅ Usar en scripts de Node.js

### Seguridad

1. **Nunca** subas el archivo `.env` al repositorio
2. El archivo `.env` está en `.gitignore` por seguridad
3. Comparte `.env.example` como plantilla
4. Para producción, usa variables de entorno del servidor de builds

## 📚 Referencias

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Environment Variables](https://docs.expo.dev/build-reference/variables/)
- [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)

## 🔄 Recargar después de cambios

Si cambias las variables de entorno:

```bash
# Detener el servidor
# Ctrl + C

# Limpiar cache y reiniciar
npx expo start --clear
```

## 🧪 Testing

Para verificar que las variables están configuradas correctamente:

```bash
# Iniciar en modo desarrollo
npm start

# Deberías ver en la consola:
# 🔧 Environment Config: { isDevelopment: true, apiBaseURL: '...', ... }
```

## 📝 Ejemplo Completo

```env
# .env file

# API URLs
EXPO_PUBLIC_API_URL_DEV=http://192.168.1.100:3000/api
EXPO_PUBLIC_API_URL_PROD=https://api.classroom-app.com/api

# OAuth Google
EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

# OAuth Facebook
EXPO_PUBLIC_FACEBOOK_APP_ID=1234567890123456
```

---

**✅ Listo!** Tu app ahora usa variables de entorno y funciona tanto en desarrollo como en producción.
