import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRole } from '@/contexts/AuthContext';
import { Task, Submission, SubmitTaskForm } from '@/types';
import apiService from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isTeacher, isStudent, isDirectivo } = useRole();
    const [task, setTask] = useState<Task | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Estado para enviar tarea
    const [content, setContent] = useState('');
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    const [alertMessage, setAlertMessage] = useState<{
        type: 'error' | 'success';
        message: string;
    } | null>(null);

    useEffect(() => {
        loadTaskDetail();
    }, [id]);

    const loadTaskDetail = async () => {
        try {
            const response = await apiService.getTaskById(id);

            if (response.success && response.data) {
                setTask(response.data);

                // Si es alumno, cargar su entrega
                if (isStudent) {
                    loadSubmission();
                }
            } else {
                setAlertMessage({
                    type: 'error',
                    message: response.error || 'Error al cargar la tarea',
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

    const loadSubmission = async () => {
        try {
            const response = await apiService.getMySubmission(id);
            if (response.success) {
                // response.data puede ser null si no hay entrega, y eso está bien
                setSubmission(response.data || null);
            } else {
                // Solo es un error real si success es false
                console.error('Error al cargar entrega:', response.error);
            }
        } catch (error) {
            console.error('Error de conexión al cargar entrega:', error);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            setAlertMessage({
                type: 'error',
                message: 'Debes escribir una respuesta',
            });
            return;
        }

        setSubmitting(true);
        setAlertMessage(null);

        try {
            const submitData: SubmitTaskForm = {
                content: content.trim(),
            };

            const response = await apiService.submitTask(id, submitData);

            if (response.success) {
                setAlertMessage({
                    type: 'success',
                    message: 'Tarea entregada exitosamente',
                });
                setShowSubmitForm(false);
                loadTaskDetail();
            } else {
                setAlertMessage({
                    type: 'error',
                    message: response.error || 'Error al entregar la tarea',
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

    const handleViewSubmissions = () => {
        router.push({
            pathname: '/task/[id]/submissions',
            params: { id },
        } as any);
    };

    const handleDeleteTask = async () => {
        if (!task) return;

        // Verificar si hay entregas
        if (task.submissions && task.submissions.length > 0) {
            setAlertMessage({
                type: 'error',
                message: 'No se puede eliminar una tarea que ya tiene entregas',
            });
            return;
        }

        RNAlert.alert(
            'Eliminar tarea',
            '¿Estás seguro de que deseas eliminar esta tarea?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await apiService.deleteTask(id);
                            if (response.success) {
                                setAlertMessage({
                                    type: 'success',
                                    message: 'Tarea eliminada exitosamente',
                                });
                                setTimeout(() => {
                                    router.back();
                                }, 1500);
                            } else {
                                setAlertMessage({
                                    type: 'error',
                                    message: response.error || 'Error al eliminar la tarea',
                                });
                            }
                        } catch (error) {
                            setAlertMessage({
                                type: 'error',
                                message: 'Error de conexión',
                            });
                        }
                    },
                },
            ]
        );
    };

    const getStatusBadge = () => {
        if (!submission) {
            return (
                <View style={[styles.statusBadge, styles.statusPending]}>
                    <Text style={styles.statusText}>Sin entregar</Text>
                </View>
            );
        }

        if (submission.grade !== undefined && submission.grade !== null) {
            return (
                <View style={[styles.statusBadge, styles.statusGraded]}>
                    <Text style={styles.statusText}>Calificada</Text>
                </View>
            );
        }

        return (
            <View style={[styles.statusBadge, styles.statusSubmitted]}>
                <Text style={styles.statusText}>Entregada</Text>
            </View>
        );
    };

    const isLate = () => {
        if (!task) return false;
        return new Date() > new Date(task.dueDate);
    };

    if (loading) {
        return <Loading message="Cargando tarea..." />;
    }

    if (!task) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>No se pudo cargar la tarea</Text>
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
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {task.title}
                    </Text>
                    {isTeacher && (
                        <TouchableOpacity
                            onPress={handleDeleteTask}
                            style={styles.headerButton}
                        >
                            <Ionicons name="trash-outline" size={22} color="#FFF" />
                        </TouchableOpacity>
                    )}
                    {!isTeacher && <View style={styles.headerSpacer} />}
                </View>

                <ScrollView style={styles.content}>
                    {alertMessage && (
                        <Alert
                            type={alertMessage.type}
                            message={alertMessage.message}
                            onClose={() => setAlertMessage(null)}
                        />
                    )}

                    {/* Task Info */}
                    <Card style={styles.taskCard}>
                        <Text style={styles.taskTitle}>{task.title}</Text>

                        <View style={styles.taskMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar" size={16} color="#757575" />
                                <Text style={styles.metaText}>
                                    Entrega: {new Date(task.dueDate).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </View>

                            {task.points && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="star" size={16} color="#FFC107" />
                                    <Text style={styles.metaText}>{task.points} puntos</Text>
                                </View>
                            )}
                        </View>

                        {isLate() && !submission && (
                            <View style={styles.lateWarning}>
                                <Ionicons name="warning" size={20} color="#F44336" />
                                <Text style={styles.lateText}>Fecha de entrega vencida</Text>
                            </View>
                        )}

                        <Text style={styles.taskDescription}>{task.description}</Text>
                    </Card>

                    {/* Student View */}
                    {isStudent && (
                        <>
                            {getStatusBadge()}

                            {submission ? (
                                <Card style={styles.submissionCard}>
                                    <View style={styles.submissionHeader}>
                                        <Text style={styles.sectionTitle}>Tu entrega</Text>
                                        {submission.grade !== undefined && submission.grade !== null && (
                                            <View style={styles.gradeContainer}>
                                                <Ionicons name="star" size={20} color="#FFC107" />
                                                <Text style={styles.gradeText}>
                                                    {submission.grade} / {task.points || 100}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.submissionContent}>{submission.content}</Text>

                                    <Text style={styles.submissionDate}>
                                        Entregado: {new Date(submission.submittedAt).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>

                                    {submission.feedback && (
                                        <View style={styles.feedbackContainer}>
                                            <Text style={styles.feedbackTitle}>Retroalimentación:</Text>
                                            <Text style={styles.feedbackText}>{submission.feedback}</Text>
                                        </View>
                                    )}
                                </Card>
                            ) : (
                                <>
                                    {!showSubmitForm ? (
                                        <Button
                                            title="Entregar tarea"
                                            onPress={() => setShowSubmitForm(true)}
                                            icon="cloud-upload"
                                            disabled={isLate()}
                                            style={styles.submitButton}
                                        />
                                    ) : (
                                        <Card style={styles.submitCard}>
                                            <Text style={styles.sectionTitle}>Entregar tarea</Text>
                                            <TextInput
                                                style={styles.textArea}
                                                placeholder="Escribe tu respuesta aquí..."
                                                value={content}
                                                onChangeText={setContent}
                                                multiline
                                                numberOfLines={10}
                                                textAlignVertical="top"
                                            />
                                            <View style={styles.submitActions}>
                                                <Button
                                                    title="Cancelar"
                                                    onPress={() => {
                                                        setShowSubmitForm(false);
                                                        setContent('');
                                                    }}
                                                    variant="outline"
                                                    disabled={submitting}
                                                    style={styles.actionButton}
                                                />
                                                <Button
                                                    title="Entregar"
                                                    onPress={handleSubmit}
                                                    loading={submitting}
                                                    icon="checkmark"
                                                    style={styles.actionButton}
                                                />
                                            </View>
                                        </Card>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Teacher View */}
                    {isTeacher && (
                        <Card style={styles.teacherCard}>
                            <Text style={styles.sectionTitle}>Entregas</Text>
                            <Text style={styles.submissionsCount}>
                                {task.submissions?.length || 0} entregas
                            </Text>
                            <Button
                                title="Ver todas las entregas"
                                onPress={handleViewSubmissions}
                                variant="outline"
                                icon="list"
                                style={styles.viewButton}
                            />
                        </Card>
                    )}

                    {/* Directivo View */}
                    {isDirectivo && (
                        <Card style={styles.teacherCard}>
                            <Text style={styles.sectionTitle}>Calificaciones</Text>
                            <Text style={styles.submissionsCount}>
                                Ver las calificaciones de los estudiantes
                            </Text>
                            <Button
                                title="Ver calificaciones"
                                onPress={() => router.push(`/task/${id}/grades`)}
                                variant="outline"
                                icon="ribbon"
                                style={styles.viewButton}
                            />
                        </Card>
                    )}
                </ScrollView>
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
    headerButton: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
        textAlign: 'center',
        marginTop: 20,
    },
    taskCard: {
        margin: 16,
    },
    taskTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    taskMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: '#757575',
    },
    lateWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    lateText: {
        fontSize: 14,
        color: '#F44336',
        fontWeight: '600',
    },
    taskDescription: {
        fontSize: 16,
        color: '#616161',
        lineHeight: 24,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    statusPending: {
        backgroundColor: '#FFF3E0',
    },
    statusSubmitted: {
        backgroundColor: '#E3F2FD',
    },
    statusGraded: {
        backgroundColor: '#E8F5E9',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#424242',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    submissionCard: {
        margin: 16,
    },
    submissionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    gradeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    gradeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F57C00',
    },
    submissionContent: {
        fontSize: 16,
        color: '#616161',
        lineHeight: 24,
        marginBottom: 12,
    },
    submissionDate: {
        fontSize: 12,
        color: '#9E9E9E',
        marginBottom: 12,
    },
    feedbackContainer: {
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#1976D2',
    },
    feedbackTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 6,
    },
    feedbackText: {
        fontSize: 14,
        color: '#616161',
        lineHeight: 20,
    },
    submitButton: {
        margin: 16,
    },
    submitCard: {
        margin: 16,
    },
    textArea: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 200,
        marginBottom: 16,
    },
    submitActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
    },
    teacherCard: {
        margin: 16,
    },
    submissionsCount: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 16,
    },
    viewButton: {
        marginTop: 8,
    },
});
