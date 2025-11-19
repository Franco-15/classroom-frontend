import React, { useEffect, useState } from 'react';
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
import { Submission, Task, GradeSubmissionForm } from '@/types';
import apiService from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function GradeSubmissionScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    const [alertMessage, setAlertMessage] = useState<{
        type: 'error' | 'success';
        message: string;
    } | null>(null);

    useEffect(() => {
        loadSubmission();
    }, [id]);

    const loadSubmission = async () => {
        try {
            const response = await apiService.getSubmissionById(id);

            if (response.success && response.data) {
                setSubmission(response.data);

                // Si ya tiene calificación, prellenar el formulario
                if (response.data.grade !== undefined && response.data.grade !== null) {
                    setGrade(response.data.grade.toString());
                }
                if (response.data.feedback) {
                    setFeedback(response.data.feedback);
                }

                // Cargar la tarea para tener los puntos totales
                loadTask(response.data.taskId);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: response.error || 'Error al cargar la entrega',
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

    const loadTask = async (taskId: string) => {
        try {
            const response = await apiService.getTaskById(taskId);
            if (response.success && response.data) {
                setTask(response.data);
            }
        } catch (error) {
            console.error('Error al cargar tarea:', error);
        }
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!grade.trim()) {
            setAlertMessage({
                type: 'error',
                message: 'La calificación es obligatoria',
            });
            return;
        }

        const gradeNumber = parseFloat(grade);
        if (isNaN(gradeNumber)) {
            setAlertMessage({
                type: 'error',
                message: 'La calificación debe ser un número válido',
            });
            return;
        }

        if (task && task.points && (gradeNumber < 0 || gradeNumber > task.points)) {
            setAlertMessage({
                type: 'error',
                message: `La calificación debe estar entre 0 y ${task.points}`,
            });
            return;
        }

        setSubmitting(true);
        setAlertMessage(null);

        try {
            const gradeData: GradeSubmissionForm = {
                grade: gradeNumber,
                feedback: feedback.trim() || undefined,
            };

            const response = await apiService.gradeSubmission(id, gradeData);

            if (response.success) {
                setAlertMessage({
                    type: 'success',
                    message: 'Calificación guardada exitosamente',
                });
                // Esperar un momento para que se vea el mensaje y volver
                setTimeout(() => {
                    router.back();
                }, 1500);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: response.error || 'Error al guardar la calificación',
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Error de conexión',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getPercentage = () => {
        const gradeNumber = parseFloat(grade);
        if (!task || !task.points || isNaN(gradeNumber)) return 0;
        return Math.round((gradeNumber / task.points) * 100);
    };

    const getGradeColor = () => {
        const percentage = getPercentage();
        if (percentage >= 70) return '#4CAF50';
        if (percentage >= 50) return '#FF9800';
        return '#F44336';
    };

    if (loading) {
        return <Loading message="Cargando entrega..." />;
    }

    if (!submission || !task) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>No se pudo cargar la entrega</Text>
            </SafeAreaView>
        );
    }

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
                    <Text style={styles.headerTitle}>Calificar Entrega</Text>
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

                        {/* Student Info */}
                        <Card style={styles.studentCard}>
                            <View style={styles.studentHeader}>
                                <Ionicons name="person-circle" size={40} color="#1976D2" />
                                <View style={styles.studentInfo}>
                                    <Text style={styles.studentName}>
                                        {submission.student?.name || 'Estudiante'}
                                    </Text>
                                    <Text style={styles.studentEmail}>
                                        {submission.student?.email || ''}
                                    </Text>
                                </View>
                            </View>
                        </Card>

                        {/* Task Info */}
                        <Card style={styles.taskCard}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <View style={styles.taskInfoRow}>
                                <View style={styles.taskInfoItem}>
                                    <Ionicons name="star" size={16} color="#FFB300" />
                                    <Text style={styles.taskInfoText}>
                                        Puntos totales: {task.points}
                                    </Text>
                                </View>
                                <View style={styles.taskInfoItem}>
                                    <Ionicons name="calendar" size={16} color="#757575" />
                                    <Text style={styles.taskInfoText}>
                                        Entregado:{' '}
                                        {new Date(submission.submittedAt).toLocaleDateString(
                                            'es-ES'
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </Card>

                        {/* Submission Content Preview */}
                        <Card style={styles.contentCard}>
                            <Text style={styles.sectionTitle}>Contenido de la Entrega</Text>
                            <View style={styles.contentBox}>
                                <Text style={styles.contentText} numberOfLines={10}>
                                    {submission.content}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.expandLink}
                                onPress={() => {
                                    router.push({
                                        pathname: '/submission/[id]',
                                        params: { id },
                                    } as any);
                                }}
                            >
                                <Text style={styles.expandText}>Ver completo</Text>
                                <Ionicons name="chevron-forward" size={16} color="#1976D2" />
                            </TouchableOpacity>
                        </Card>

                        {/* Grade Form */}
                        <Card style={styles.gradeCard}>
                            <Text style={styles.sectionTitle}>Calificación</Text>

                            {/* Grade Input */}
                            <View style={styles.gradeInputSection}>
                                <View style={styles.gradeInputContainer}>
                                    <Text style={styles.label}>
                                        Puntos <Text style={styles.required}>*</Text>
                                    </Text>
                                    <View style={styles.gradeInputWrapper}>
                                        <TextInput
                                            style={styles.gradeInput}
                                            placeholder="0"
                                            value={grade}
                                            onChangeText={setGrade}
                                            keyboardType="decimal-pad"
                                            editable={!submitting}
                                        />
                                        <Text style={styles.gradeMax}>/ {task.points}</Text>
                                    </View>
                                </View>

                                {/* Grade Preview */}
                                {grade && !isNaN(parseFloat(grade)) && (
                                    <View style={styles.gradePreview}>
                                        <View
                                            style={[
                                                styles.percentageCircle,
                                                { borderColor: getGradeColor() },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.percentageValue,
                                                    { color: getGradeColor() },
                                                ]}
                                            >
                                                {getPercentage()}%
                                            </Text>
                                        </View>
                                        <View style={styles.gradeStatus}>
                                            <Ionicons
                                                name={
                                                    getPercentage() >= 70
                                                        ? 'checkmark-circle'
                                                        : getPercentage() >= 50
                                                            ? 'alert-circle'
                                                            : 'close-circle'
                                                }
                                                size={24}
                                                color={getGradeColor()}
                                            />
                                            <Text
                                                style={[
                                                    styles.statusLabel,
                                                    { color: getGradeColor() },
                                                ]}
                                            >
                                                {getPercentage() >= 70
                                                    ? 'Aprobado'
                                                    : getPercentage() >= 50
                                                        ? 'Regular'
                                                        : 'Reprobado'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Feedback Input */}
                            <View style={styles.feedbackSection}>
                                <Text style={styles.label}>
                                    Retroalimentación{' '}
                                    <Text style={styles.optional}>(opcional)</Text>
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Escribe comentarios para el estudiante..."
                                    value={feedback}
                                    onChangeText={setFeedback}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    editable={!submitting}
                                />
                                <Text style={styles.charCount}>
                                    {feedback.length} caracteres
                                </Text>
                            </View>

                            {/* Quick Feedback Buttons */}
                            <View style={styles.quickFeedbackSection}>
                                <Text style={styles.quickLabel}>Mensajes rápidos:</Text>
                                <View style={styles.quickButtons}>
                                    {[
                                        '¡Excelente trabajo!',
                                        'Buen esfuerzo, sigue así.',
                                        'Revisa los conceptos del tema.',
                                        'Necesita mejorar la presentación.',
                                    ].map((text, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.quickButton}
                                            onPress={() => {
                                                if (feedback) {
                                                    setFeedback(feedback + ' ' + text);
                                                } else {
                                                    setFeedback(text);
                                                }
                                            }}
                                            disabled={submitting}
                                        >
                                            <Text style={styles.quickButtonText}>{text}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.buttonGroup}>
                                <Button
                                    title="Cancelar"
                                    onPress={() => router.back()}
                                    variant="outline"
                                    disabled={submitting}
                                    style={styles.button}
                                />
                                <Button
                                    title={submitting ? 'Guardando...' : 'Guardar'}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                    icon="checkmark"
                                    style={styles.button}
                                />
                            </View>
                        </Card>
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
    errorText: {
        fontSize: 16,
        color: '#F44336',
        textAlign: 'center',
        marginTop: 32,
    },
    studentCard: {
        margin: 16,
        marginBottom: 8,
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 2,
    },
    studentEmail: {
        fontSize: 13,
        color: '#757575',
    },
    taskCard: {
        margin: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    taskInfoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    taskInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    taskInfoText: {
        fontSize: 13,
        color: '#757575',
    },
    contentCard: {
        margin: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 12,
    },
    contentBox: {
        backgroundColor: '#FAFAFA',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        maxHeight: 150,
    },
    contentText: {
        fontSize: 14,
        color: '#212121',
        lineHeight: 20,
    },
    expandLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        gap: 4,
    },
    expandText: {
        fontSize: 14,
        color: '#1976D2',
        fontWeight: '500',
    },
    gradeCard: {
        margin: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    gradeInputSection: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    gradeInputContainer: {
        flex: 1,
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
    optional: {
        fontSize: 14,
        fontWeight: '400',
        color: '#757575',
    },
    gradeInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#1976D2',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    gradeInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        color: '#212121',
        paddingVertical: 12,
    },
    gradeMax: {
        fontSize: 18,
        color: '#757575',
        marginLeft: 4,
    },
    gradePreview: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    percentageCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    percentageValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    gradeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    feedbackSection: {
        marginBottom: 20,
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
        minHeight: 120,
        paddingTop: 12,
    },
    charCount: {
        fontSize: 12,
        color: '#757575',
        textAlign: 'right',
        marginTop: 4,
    },
    quickFeedbackSection: {
        marginBottom: 24,
    },
    quickLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
        marginBottom: 8,
    },
    quickButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    quickButton: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#90CAF9',
    },
    quickButtonText: {
        fontSize: 13,
        color: '#1976D2',
        fontWeight: '500',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
    },
});
