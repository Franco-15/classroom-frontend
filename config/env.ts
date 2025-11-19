import Constants from 'expo-constants';

// Función para obtener variables de entorno de forma segura
const getEnvVar = (key: string, defaultValue?: string): string => {
    // En Expo, las variables que empiezan con EXPO_PUBLIC_ están disponibles en process.env
    const value = process.env[key];

    if (value !== undefined) {
        return value;
    }

    if (defaultValue !== undefined) {
        return defaultValue;
    }

    console.warn(`Variable de entorno ${key} no encontrada`);
    return '';
};

// Detectar si estamos en desarrollo o producción
const isDevelopment = __DEV__;

// Configuración de la API
export const API_CONFIG = {
    baseURL: isDevelopment
        ? getEnvVar('EXPO_PUBLIC_API_URL_DEV', 'http://localhost:5000/api')
        : getEnvVar('EXPO_PUBLIC_API_URL_PROD', 'https://classroom-backend-mu.vercel.app/api'),
};



// Información de la app desde expo-constants
export const APP_CONFIG = {
    name: Constants.expoConfig?.name || 'Classroom',
    version: Constants.expoConfig?.version || '1.0.0',
    slug: Constants.expoConfig?.slug || 'classroom-front',
};

// Helper para debugging (solo en desarrollo)
if (__DEV__) {
    console.log('🔧 Environment Config:', {
        isDevelopment,
        apiBaseURL: API_CONFIG.baseURL,
        appVersion: APP_CONFIG.version,
    });
}

export default {
    API_CONFIG,
    APP_CONFIG,
};
