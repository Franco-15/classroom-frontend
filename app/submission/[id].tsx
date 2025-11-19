import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRole } from '@/contexts/AuthContext';
import { Submission, Task } from '@/types';
import apiService from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function SubmissionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isTeacher } = useRole();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
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

    const handleGrade = () => {
        router.push({
            pathname: '/submission/[id]/grade',
            params: { id },
        } as any);
    };

    const getStatusBadge = () => {
        if (!submission) return null;

        if (submission.grade !== undefined && submission.grade !== null) {
            return (
                <View style={[styles.statusBadge, styles.statusGraded]}>
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                    <Text style={styles.statusText}>Calificada</Text>
                </View>
            );
        }

        return (
            <View style={[styles.statusBadge, styles.statusSubmitted]}>
                <Ionicons name="time" size={16} color="#FFF" />
                <Text style={styles.statusText}>Entregada</Text>
            </View>
        );
    };

    const isLate = () => {
        if (!submission || !task) return false;
        return new Date(submission.submittedAt) > new Date(task.dueDate);
    };

    if (loading) {
        return <Loading message="Cargando entrega..." />;
    }

    if (!submission) {
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
                    <Text style={styles.headerTitle}>Detalle de Entrega</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {alertMessage && (
                    <Alert
                        type={alertMessage.type}
                        message={alertMessage.message}
                        onClose={() => setAlertMessage(null)}
                    />
                )}

                <ScrollView style={styles.content}>
                    {/* Student Info */}
                    <Card style={styles.studentCard}>
                        <View style={styles.studentHeader}>
                            <Ionicons name="person-circle" size={48} color="#1976D2" />
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>
                                    {submission.student?.name || 'Estudiante'}
                                </Text>
                                <Text style={styles.studentEmail}>
                                    {submission.student?.email || ''}
                                </Text>
                            </View>
                            {getStatusBadge()}
                        </View>
                    </Card>

                    {/* Task Info */}
                    {task && (
                        <Card style={styles.taskCard}>
                            <Text style={styles.sectionTitle}>Tarea</Text>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <View style={styles.taskInfoRow}>
                                <View style={styles.taskInfoItem}>
                                    <Ionicons name="calendar" size={16} color="#757575" />
                                    <Text style={styles.taskInfoText}>
                                        Fecha límite:{' '}
                                        {new Date(task.dueDate).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                </View>
                                <View style={styles.taskInfoItem}>
                                    <Ionicons name="star" size={16} color="#757575" />
                                    <Text style={styles.taskInfoText}>
                                        {task.points} puntos
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    )}

                    {/* Submission Info */}
                    <Card style={styles.submissionCard}>
                        <View style={styles.submissionHeader}>
                            <Text style={styles.sectionTitle}>Información de Entrega</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color="#1976D2" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Fecha de entrega</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(submission.submittedAt).toLocaleString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </View>
                        </View>

                        {isLate() && (
                            <View style={styles.lateWarning}>
                                <Ionicons name="warning" size={20} color="#F44336" />
                                <Text style={styles.lateText}>
                                    Entregado fuera de plazo
                                </Text>
                            </View>
                        )}
                    </Card>

                    {/* Submission Content */}
                    <Card style={styles.contentCard}>
                        <Text style={styles.sectionTitle}>Contenido de la Entrega</Text>
                        <View style={styles.contentBox}>
                            <Text style={styles.contentText}>{submission.content}</Text>
                        </View>
                    </Card>

                    {/* Grade Info or Grade Button */}
                    {submission.grade !== undefined && submission.grade !== null ? (
                        <Card style={styles.gradeCard}>
                            <Text style={styles.sectionTitle}>Calificación</Text>
                            <View style={styles.gradeDisplay}>
                                <View style={styles.gradeCircle}>
                                    <Text style={styles.gradeValue}>
                                        {submission.grade}
                                    </Text>
                                    <Text style={styles.gradeMax}>
                                        / {task?.points || 100}
                                    </Text>
                                </View>
                                <View style={styles.gradeDetails}>
                                    <View style={styles.gradePercentage}>
                                        <Ionicons name="star" size={20} color="#FFB300" />
                                        <Text style={styles.percentageText}>
                                            {task?.points
                                                ? Math.round(
                                                    (submission.grade / task.points) * 100
                                                )
                                                : 0}
                                            %
                                        </Text>
                                    </View>
                                    {submission.gradedAt && (
                                        <Text style={styles.gradedDate}>
                                            Calificado el{' '}
                                            {new Date(submission.gradedAt).toLocaleDateString(
                                                'es-ES'
                                            )}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {submission.feedback && (
                                <>
                                    <View style={styles.divider} />
                                    <View style={styles.feedbackSection}>
                                        <Text style={styles.feedbackLabel}>
                                            Retroalimentación del profesor
                                        </Text>
                                        <Text style={styles.feedbackText}>
                                            {submission.feedback}
                                        </Text>
                                    </View>
                                </>
                            )}

                            {isTeacher && (
                                <Button
                                    title="Editar calificación"
                                    onPress={handleGrade}
                                    variant="outline"
                                    icon="create"
                                    style={styles.editButton}
                                />
                            )}
                        </Card>
                    ) : (
                        isTeacher && (
                            <Card style={styles.gradeCard}>
                                <Text style={styles.sectionTitle}>Calificación</Text>
                                <Text style={styles.notGradedText}>
                                    Esta entrega aún no ha sido calificada
                                </Text>
                                <Button
                                    title="Calificar entrega"
                                    onPress={handleGrade}
                                    icon="star"
                                    style={styles.gradeButton}
                                />
                            </Card>
                        )
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
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 2,
    },
    studentEmail: {
        fontSize: 14,
        color: '#757575',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusSubmitted: {
        backgroundColor: '#FF9800',
    },
    statusGraded: {
        backgroundColor: '#4CAF50',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
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
        fontSize: 14,
        color: '#757575',
    },
    submissionCard: {
        margin: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    submissionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#212121',
        fontWeight: '500',
    },
    lateWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    lateText: {
        fontSize: 14,
        color: '#F44336',
        fontWeight: '500',
    },
    contentCard: {
        margin: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    contentBox: {
        backgroundColor: '#FAFAFA',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    contentText: {
        fontSize: 15,
        color: '#212121',
        lineHeight: 22,
    },
    gradeCard: {
        margin: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    gradeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 16,
    },
    gradeCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#1976D2',
    },
    gradeValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1976D2',
    },
    gradeMax: {
        fontSize: 16,
        color: '#1976D2',
        fontWeight: '500',
    },
    gradeDetails: {
        flex: 1,
    },
    gradePercentage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    percentageText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#212121',
    },
    gradedDate: {
        fontSize: 13,
        color: '#757575',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 16,
    },
    feedbackSection: {},
    feedbackLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
        marginBottom: 8,
    },
    feedbackText: {
        fontSize: 15,
        color: '#212121',
        lineHeight: 22,
        fontStyle: 'italic',
        padding: 12,
        backgroundColor: '#FFF9C4',
        borderRadius: 8,
    },
    notGradedText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 16,
    },
    gradeButton: {
        marginTop: 8,
    },
    editButton: {
        marginTop: 16,
    },
});
