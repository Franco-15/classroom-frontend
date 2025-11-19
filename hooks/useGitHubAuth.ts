import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_CONFIG } from '../config/env';

WebBrowser.maybeCompleteAuthSession();

export interface GitHubAuthResult {
    type: 'success' | 'error' | 'cancel';
    accessToken?: string;
    refreshToken?: string;
    error?: string;
}

export const useGitHubAuth = () => {
    const [authResult, setAuthResult] = useState<GitHubAuthResult | null>(null);

    useEffect(() => {
        // Escuchar los deep links cuando la app vuelve desde el navegador
        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => subscription.remove();
    }, []);

    const handleDeepLink = ({ url }: { url: string }) => {
        console.log('📥 Deep link recibido:', url);

        // Parsear la URL para obtener los parámetros
        const parsed = Linking.parse(url);

        if (parsed.path === 'auth/callback') {
            const { accessToken, refreshToken, error } = parsed.queryParams as any;

            if (error) {
                setAuthResult({
                    type: 'error',
                    error: error as string,
                });
            } else if (accessToken && refreshToken) {
                setAuthResult({
                    type: 'success',
                    accessToken: accessToken as string,
                    refreshToken: refreshToken as string,
                });
            } else {
                setAuthResult({
                    type: 'error',
                    error: 'No se recibieron los tokens de autenticación',
                });
            }
        }
    };

    const signInWithGitHub = async (): Promise<GitHubAuthResult> => {
        try {
            // Resetear el resultado anterior
            setAuthResult(null);

            // URL del backend que iniciará el flujo de OAuth con GitHub
            const authUrl = `${API_CONFIG.baseURL}/auth/github`;

            console.log('🚀 Abriendo navegador para autenticación con GitHub:', authUrl);

            // Abrir el navegador para que el usuario se autentique
            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                'classroomapp://auth/callback'
            );

            console.log('📋 Resultado del navegador:', result);

            if (result.type === 'success') {
                // El deep link debería haberse manejado en handleDeepLink
                // Esperar un momento para que se procese
                await new Promise(resolve => setTimeout(resolve, 500));

                if (authResult) {
                    return authResult;
                }

                // Si no se recibió el resultado, parsearlo de la URL
                if (result.url) {
                    const parsed = Linking.parse(result.url);
                    const { accessToken, refreshToken, error } = parsed.queryParams as any;

                    if (error) {
                        return {
                            type: 'error',
                            error: error as string,
                        };
                    } else if (accessToken && refreshToken) {
                        return {
                            type: 'success',
                            accessToken: accessToken as string,
                            refreshToken: refreshToken as string,
                        };
                    }
                }

                return {
                    type: 'error',
                    error: 'No se recibieron los tokens de autenticación',
                };
            }

            if (result.type === 'cancel' || result.type === 'dismiss') {
                console.log('⚠️ Usuario canceló la autenticación');
                return { type: 'cancel' };
            }

            return {
                type: 'error',
                error: 'Error en la autenticación con GitHub',
            };
        } catch (error) {
            console.error('❌ Error en GitHub Auth:', error);
            return {
                type: 'error',
                error: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    };

    return {
        isReady: true,
        signInWithGitHub,
        authResult,
    };
};
