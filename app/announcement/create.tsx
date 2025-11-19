import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from '@/services/api';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function CreateAnnouncementScreen() {
    const { classId } = useLocalSearchParams<{ classId: string }>();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        type: 'error' | 'success';
        message: string;
    } | null>(null);

    const handleSubmit = async () => {
        // Validaciones
        if (!title.trim()) {
            setAlertMessage({
                type: 'error',
                message: 'El título es obligatorio',
            });
            return;
        }

        if (!content.trim()) {
            setAlertMessage({
                type: 'error',
                message: 'El contenido es obligatorio',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.createAnnouncement(classId, {
                title: title.trim(),
                content: content.trim(),
            });

            if (response.success) {
                setAlertMessage({
                    type: 'success',
                    message: 'Anuncio creado exitosamente',
                });
                // Esperar un momento para que se vea el mensaje
                setTimeout(() => {
                    router.back();
                }, 1500);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: response.error || 'Error al crear el anuncio',
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Error de conexión',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Custom Header */}
                <View style={styles.customHeader}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Crear Anuncio</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView style={styles.content}>
                        {alertMessage && (
                            <Alert
                                type={alertMessage.type}
                                message={alertMessage.message}
                                onClose={() => setAlertMessage(null)}
                            />
                        )}

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Título */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Título <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Importante: Examen próxima semana"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={200}
                                    editable={!loading}
                                />
                                <Text style={styles.charCount}>{title.length}/200</Text>
                            </View>

                            {/* Contenido */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Contenido <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Escribe el contenido del anuncio..."
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    numberOfLines={8}
                                    textAlignVertical="top"
                                    editable={!loading}
                                />
                                <Text style={styles.charCount}>{content.length} caracteres</Text>
                            </View>

                            {/* Botones */}
                            <View style={styles.buttonGroup}>
                                <Button
                                    title="Cancelar"
                                    onPress={() => router.back()}
                                    variant="outline"
                                    disabled={loading}
                                    style={styles.button}
                                />
                                <Button
                                    title={loading ? 'Creando...' : 'Publicar Anuncio'}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                    icon="megaphone"
                                    style={styles.button}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1976D2',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 32,
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 32,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    required: {
        color: '#F44336',
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#212121',
    },
    textArea: {
        minHeight: 150,
        paddingTop: 12,
    },
    charCount: {
        fontSize: 12,
        color: '#757575',
        textAlign: 'right',
        marginTop: 4,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
    },
});
