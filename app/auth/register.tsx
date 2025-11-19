import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function RegisterScreen() {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        }

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

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        setAlertMessage(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                name: name.trim(),
                email: email.trim(),
                password,
                role,
            });

            if (result.success) {
                setAlertMessage({
                    type: 'success',
                    message: '¡Registro exitoso! Redirigiendo...',
                });

                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 1500);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: result.error || 'Error al registrarse',
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
                    <Text style={styles.title}>Crear cuenta</Text>
                    <Text style={styles.subtitle}>Completa tus datos para empezar</Text>
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
                        label="Nombre completo"
                        placeholder="Tu nombre"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        error={errors.name}
                        icon="person-outline"
                        autoCapitalize="words"
                    />

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
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        error={errors.password}
                        icon="lock-closed-outline"
                        isPassword
                    />

                    <Input
                        label="Confirmar contraseña"
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                        }}
                        error={errors.confirmPassword}
                        icon="lock-closed-outline"
                        isPassword
                    />

                    <View style={styles.roleContainer}>
                        <Text style={styles.roleLabel}>Rol</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={role}
                                onValueChange={(value) => setRole(value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="👨‍🎓 Alumno" value={UserRole.STUDENT} />
                                <Picker.Item label="👨‍🏫 Profesor" value={UserRole.TEACHER} />
                                <Picker.Item label="👨‍💼 Directivo" value={UserRole.DIRECTIVO} />
                            </Picker>
                        </View>
                    </View>

                    <Button
                        title="Registrarse"
                        onPress={handleRegister}
                        loading={loading}
                        fullWidth
                        style={styles.registerButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
                        <Link href="/auth/login" asChild>
                            <Text style={styles.link}>Inicia sesión</Text>
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
        padding: 24,
        paddingTop: 60,
    },
    header: {
        marginBottom: 32,
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
    roleContainer: {
        marginBottom: 16,
    },
    roleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    pickerContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    registerButton: {
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
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
