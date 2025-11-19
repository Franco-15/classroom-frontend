import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function LoginScreen() {
    const { login } = useAuth();
    const { signInWithGitHub } = useGitHubAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Correo inválido';
        }

        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        setAlertMessage(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await login({ email, password });

            if (result.success) {
                // La navegación se manejará automáticamente por el router
                router.replace('/(tabs)');
            } else {
                setAlertMessage({
                    type: 'error',
                    message: result.error || 'Error al iniciar sesión',
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Error de conexión. Intenta de nuevo.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setAlertMessage(null);
        setGithubLoading(true);

        try {
            const result = await signInWithGitHub();

            // El callback se manejará automáticamente en /auth/callback
            if (result.type === 'cancel') {
                setAlertMessage({
                    type: 'error',
                    message: 'Autenticación cancelada',
                });
            } else if (result.type === 'error') {
                setAlertMessage({
                    type: 'error',
                    message: result.error || 'Error al iniciar sesión con GitHub',
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Error al iniciar sesión con GitHub',
            });
        } finally {
            setGithubLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoIcon}>🎓</Text>
                    </View>
                    <Text style={styles.title}>Classroom</Text>
                    <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
                </View>

                <View style={styles.form}>
                    {alertMessage && (
                        <Alert
                            type={alertMessage.type}
                            message={alertMessage.message}
                            onClose={() => setAlertMessage(null)}
                        />
                    )}

                    <Input
                        label="Correo electrónico"
                        placeholder="tucorreo@ejemplo.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        error={errors.email}
                        icon="mail-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />

                    <Input
                        label="Contraseña"
                        placeholder="Tu contraseña"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        error={errors.password}
                        icon="lock-closed-outline"
                        isPassword
                        autoComplete="password"
                    />

                    <Button
                        title="Iniciar Sesión"
                        onPress={handleLogin}
                        loading={loading}
                        fullWidth
                        style={styles.loginButton}
                    />

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>O continúa con</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Button
                        title="Iniciar sesión con GitHub"
                        onPress={handleGitHubLogin}
                        loading={githubLoading}
                        fullWidth
                        variant="outline"
                        style={styles.githubButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
                        <Link href="/auth/register" asChild>
                            <Text style={styles.link}>Regístrate</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1976D2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoIcon: {
        fontSize: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#757575',
    },
    githubButton: {
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    footerText: {
        fontSize: 14,
        color: '#757575',
    },
    link: {
        fontSize: 14,
        color: '#1976D2',
        fontWeight: '600',
    },
});
