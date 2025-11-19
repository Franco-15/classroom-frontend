import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CreateTaskForm } from '@/types';
import apiService from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert'; export default function CreateTaskScreen() {
    const { classId } = useLocalSearchParams<{ classId: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState('100');
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        title?: string;
        description?: string;
        points?: string;
    }>({});
    const [alertMessage, setAlertMessage] = useState<{
        type: 'error' | 'success';
        message: string;
    } | null>(null);

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!title.trim()) {
            newErrors.title = 'El título es requerido';
        }

        if (!description.trim()) {
            newErrors.description = 'La descripción es requerida';
        }

        if (points && isNaN(Number(points))) {
            newErrors.points = 'Los puntos deben ser un número';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm()) {
            return;
        }

        if (!classId) {
            setAlertMessage({
                type: 'error',
                message: 'ID de clase no válido',
            });
            return;
        }

        setLoading(true);
        setAlertMessage(null);

        try {
            const taskData: CreateTaskForm = {
                title: title.trim(),
                description: description.trim(),
                dueDate: dueDate.toISOString(),
                points: points ? Number(points) : undefined,
            };

            const response = await apiService.createTask(classId, taskData);

            if (response.success) {
                setAlertMessage({
                    type: 'success',
                    message: 'Tarea creada exitosamente',
                });

                // Volver a la pantalla de la clase después de 1 segundo
                setTimeout(() => {
                    router.back();
                }, 1000);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: response.error || 'Error al crear la tarea',
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

    const addDays = (days: number) => {
        const newDate = new Date(dueDate);
        newDate.setDate(newDate.getDate() + days);
        setDueDate(newDate);
    };

    const addHours = (hours: number) => {
        const newDate = new Date(dueDate);
        newDate.setHours(newDate.getHours() + hours);
        setDueDate(newDate);
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
                    <Text style={styles.headerTitle}>Crear Tarea</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView style={styles.content}>
                    {alertMessage && (
                        <Alert
                            type={alertMessage.type}
                            message={alertMessage.message}
                            onClose={() => setAlertMessage(null)}
                        />
                    )}

                    <View style={styles.form}>
                        <Input
                            label="Título de la tarea *"
                            placeholder="Ej: Ensayo sobre la Revolución Francesa"
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                if (errors.title) setErrors({ ...errors, title: undefined });
                            }}
                            error={errors.title}
                            icon="document-text"
                        />

                        <View style={styles.field}>
                            <Text style={styles.label}>Descripción *</Text>
                            <TextInput
                                style={[styles.textArea, errors.description && styles.inputError]}
                                placeholder="Describe la tarea, instrucciones, recursos necesarios..."
                                value={description}
                                onChangeText={(text) => {
                                    setDescription(text);
                                    if (errors.description) setErrors({ ...errors, description: undefined });
                                }}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                            {errors.description && (
                                <Text style={styles.errorText}>{errors.description}</Text>
                            )}
                        </View>

                        <Input
                            label="Puntos (opcional)"
                            placeholder="100"
                            value={points}
                            onChangeText={(text) => {
                                setPoints(text);
                                if (errors.points) setErrors({ ...errors, points: undefined });
                            }}
                            error={errors.points}
                            keyboardType="numeric"
                            icon="star"
                        />

                        <View style={styles.field}>
                            <Text style={styles.label}>Fecha de entrega *</Text>
                            <TouchableOpacity
                                style={styles.dateDisplay}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={20} color="#1976D2" />
                                <Text style={styles.dateText}>
                                    {dueDate.toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </TouchableOpacity>

                            {/* Quick date options */}
                            <View style={styles.quickOptions}>
                                <TouchableOpacity
                                    style={styles.quickButton}
                                    onPress={() => addDays(1)}
                                >
                                    <Text style={styles.quickButtonText}>+1 día</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.quickButton}
                                    onPress={() => addDays(7)}
                                >
                                    <Text style={styles.quickButtonText}>+1 semana</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.quickButton}
                                    onPress={() => addHours(24)}
                                >
                                    <Text style={styles.quickButtonText}>+24h</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button
                                title="Cancelar"
                                onPress={() => router.back()}
                                variant="outline"
                                disabled={loading}
                                style={styles.button}
                            />
                            <Button
                                title="Crear Tarea"
                                onPress={handleCreate}
                                loading={loading}
                                style={styles.button}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Date Picker Modal */}
                <Modal
                    visible={showDatePicker}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Seleccionar fecha y hora</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.datePreview}>
                                <Text style={styles.datePreviewText}>
                                    {dueDate.toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Text>
                                <Text style={styles.timePreviewText}>
                                    {dueDate.toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </View>

                            <View style={styles.pickerGrid}>
                                <View style={styles.pickerRow}>
                                    <Text style={styles.pickerLabel}>Días desde hoy:</Text>
                                    <View style={styles.pickerButtons}>
                                        {[1, 2, 3, 7, 14, 30].map((days) => (
                                            <TouchableOpacity
                                                key={days}
                                                style={styles.pickerOption}
                                                onPress={() => {
                                                    const newDate = new Date();
                                                    newDate.setDate(newDate.getDate() + days);
                                                    newDate.setHours(dueDate.getHours(), dueDate.getMinutes());
                                                    setDueDate(newDate);
                                                }}
                                            >
                                                <Text style={styles.pickerOptionText}>{days}d</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.pickerRow}>
                                    <Text style={styles.pickerLabel}>Hora:</Text>
                                    <View style={styles.pickerButtons}>
                                        {[8, 12, 14, 18, 23].map((hour) => (
                                            <TouchableOpacity
                                                key={hour}
                                                style={styles.pickerOption}
                                                onPress={() => {
                                                    const newDate = new Date(dueDate);
                                                    newDate.setHours(hour, 59);
                                                    setDueDate(newDate);
                                                }}
                                            >
                                                <Text style={styles.pickerOptionText}>{hour}:59</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <Button
                                title="Confirmar"
                                onPress={() => setShowDatePicker(false)}
                                style={styles.confirmButton}
                            />
                        </View>
                    </View>
                </Modal>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    headerSpacer: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    form: {
        padding: 20,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    textArea: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 120,
    },
    inputError: {
        borderColor: '#F44336',
    },
    errorText: {
        fontSize: 12,
        color: '#F44336',
        marginTop: 4,
    },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#1976D2',
        borderRadius: 8,
        padding: 16,
        gap: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#1976D2',
        fontWeight: '600',
        flex: 1,
    },
    quickOptions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    quickButton: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    quickButtonText: {
        fontSize: 14,
        color: '#1976D2',
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    button: {
        flex: 1,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    datePreview: {
        backgroundColor: '#E3F2FD',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    datePreviewText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976D2',
        textTransform: 'capitalize',
        marginBottom: 8,
    },
    timePreviewText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1976D2',
    },
    pickerGrid: {
        gap: 20,
        marginBottom: 20,
    },
    pickerRow: {
        gap: 12,
    },
    pickerLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    pickerButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pickerOption: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    pickerOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    confirmButton: {
        marginTop: 12,
    },
});
