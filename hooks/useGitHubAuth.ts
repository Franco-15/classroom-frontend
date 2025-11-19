import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/env';

WebBrowser.maybeCompleteAuthSession();

export interface GitHubAuthResult {
    type: 'success' | 'error' | 'cancel';
    error?: string;
}

export const useGitHubAuth = () => {
    const signInWithGitHub = async (): Promise<GitHubAuthResult> => {
        try {
            // Configurar la URL de callback según la plataforma
            // En web: usar la URL del dominio
            // En móvil: usar el deep link
            const redirectUrl = Platform.OS === 'web'
                ? `${window.location.origin}/auth/callback`  // Web: https://tu-dominio.com/auth/callback
                : 'classroomapp://auth/callback';             // Móvil: deep link

            // Enviar el redirect_uri al backend como query parameter
            // El backend debe usar este redirect_uri para redirigir después de la autenticación
            const authUrl = `${API_CONFIG.baseURL}/auth/github?redirect_uri=${encodeURIComponent(redirectUrl)}`;

            // Abrir el navegador para autenticación con GitHub
            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                redirectUrl
            );

            if (result.type === 'success') {
                // La navegación a /auth/callback se manejará automáticamente
                return { type: 'success' };
            }

            if (result.type === 'cancel' || result.type === 'dismiss') {
                return { type: 'cancel' };
            }

            return {
                type: 'error',
                error: 'Error en la autenticación con GitHub',
            };
        } catch (error) {
            return {
                type: 'error',
                error: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    };

    return {
        isReady: true,
        signInWithGitHub,
    };
};
