import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Pantalla de callback para manejar la redirección después de la autenticación con GitHub
 * Esta pantalla se abre cuando el backend redirige a: classroomapp://auth/callback
 */
export default function AuthCallbackScreen() {
    const { accessToken, refreshToken, error } = useLocalSearchParams<{
        accessToken?: string;
        refreshToken?: string;
        error?: string;
    }>();
    const { loginWithTokens } = useAuth();

    useEffect(() => {
        handleCallback();
    }, [accessToken, refreshToken, error]);

    const handleCallback = async () => {

        // Si hay un error, mostrar y redirigir al login
        if (error) {
            setTimeout(() => {
                router.replace('/auth/login');
            }, 2000);
            return;
        }

        // Si tenemos los tokens, iniciar sesión
        if (accessToken && refreshToken) {
            try {
                const result = await loginWithTokens(accessToken, refreshToken);

                if (result.success) {
                    setTimeout(() => {
                        router.replace('/(tabs)');
                    }, 1000);
                } else {
                    setTimeout(() => {
                        router.replace('/auth/login');
                    }, 2000);
                }
            } catch (error) {
                setTimeout(() => {
                    router.replace('/auth/login');
                }, 2000);
            }
        } else {
            setTimeout(() => {
                router.replace('/auth/login');
            }, 2000);
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#1976D2" />
            {error ? (
                <Text style={styles.errorText}>Error: {error}</Text>
            ) : (
                <Text style={styles.text}>
                    {accessToken && refreshToken
                        ? '✅ Autenticación exitosa...'
                        : '🔄 Procesando autenticación...'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    errorText: {
        marginTop: 20,
        fontSize: 16,
        color: '#D32F2F',
        textAlign: 'center',
    },
});
