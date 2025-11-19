import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Task, Submission } from '@/types';
import apiService from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function TaskSubmissionsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [task, setTask] = useState<Task | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        type: 'error' | 'success';
        message: string;
    } | null>(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            // Cargar tarea y entregas en paralelo
            const [taskResponse, submissionsResponse] = await Promise.all([
                apiService.getTaskById(id),
                apiService.getSubmissions(id),
            ]);

            if (taskResponse.success && taskResponse.data) {
                setTask(taskResponse.data);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: taskResponse.error || 'Error al cargar la tarea',
                });
            }

            if (submissionsResponse.success && submissionsResponse.data) {
                setSubmissions(submissionsResponse.data);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: submissionsResponse.error || 'Error al cargar las entregas',
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Error de conexión',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleGradeSubmission = (submissionId: string) => {
        // TODO: Navegar a pantalla de calificar
        router.push({
            pathname: '/submission/[id]/grade',
            params: { id: submissionId },
        } as any);
    };

    const getSubmissionStatus = (submission: Submission) => {
        if (submission.grade !== null && submission.grade !== undefined) {
            return 'graded';
        }
        return 'submitted';
    };

    const getSubmissionStatusColor = (status: string) => {
        switch (status) {
            case 'graded':
                return '#4CAF50';
            case 'submitted':
                return '#FF9800';
            default:
                return '#757575';
        }
    };

    const getSubmissionStatusLabel = (status: string) => {
        switch (status) {
            case 'graded':
                return 'Calificada';
            case 'submitted':
                return 'Entregada';
            default:
                return 'Desconocido';
        }
    };

    if (loading) {
        return <Loading message="Cargando entregas..." />;
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
                        Entregas
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                {alertMessage && (
                    <Alert
                        type={alertMessage.type}
                        message={alertMessage.message}
                        onClose={() => setAlertMessage(null)}
                    />
                )}

                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Task Info */}
                    <Card style={styles.taskCard}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        {task.description && (
                            <Text style={styles.taskDescription}>{task.description}</Text>
                        )}
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

                    {/* Stats */}
                    <Card style={styles.statsCard}>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{submissions.length}</Text>
                                <Text style={styles.statLabel}>Total entregas</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    {
                                        submissions.filter(
                                            (s) =>
                                                s.grade !== null && s.grade !== undefined
                                        ).length
                                    }
                                </Text>
                                <Text style={styles.statLabel}>Calificadas</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    {
                                        submissions.filter(
                                            (s) => s.grade === null || s.grade === undefined
                                        ).length
                                    }
                                </Text>
                                <Text style={styles.statLabel}>Pendientes</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Submissions List */}
                    <View style={styles.submissionsSection}>
                        <Text style={styles.sectionTitle}>Entregas de estudiantes</Text>

                        {submissions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="document-outline"
                                    size={64}
                                    color="#BDBDBD"
                                />
                                <Text style={styles.emptyText}>
                                    Aún no hay entregas para esta tarea
                                </Text>
                            </View>
                        ) : (
                            submissions.map((submission) => {
                                const status = getSubmissionStatus(submission);
                                return (
                                    <Card
                                        key={submission.id}
                                        style={styles.submissionCard}
                                    >
                                        <View style={styles.submissionHeader}>
                                            <View style={styles.studentInfo}>
                                                <Ionicons
                                                    name="person-circle"
                                                    size={40}
                                                    color="#1976D2"
                                                />
                                                <View style={styles.studentDetails}>
                                                    <Text style={styles.studentName}>
                                                        {submission.student?.name ||
                                                            'Estudiante'}
                                                    </Text>
                                                    <Text style={styles.submissionDate}>
                                                        Entregado:{' '}
                                                        {new Date(
                                                            submission.submittedAt
                                                        ).toLocaleString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor:
                                                            getSubmissionStatusColor(
                                                                status
                                                            ),
                                                    },
                                                ]}
                                            >
                                                <Text style={styles.statusText}>
                                                    {getSubmissionStatusLabel(status)}
                                                </Text>
                                            </View>
                                        </View>

                                        {submission.content && (
                                            <Text
                                                style={styles.submissionContent}
                                                numberOfLines={3}
                                            >
                                                {submission.content}
                                            </Text>
                                        )}

                                        {status === 'graded' && (
                                            <View style={styles.gradeInfo}>
                                                <View style={styles.gradeRow}>
                                                    <Ionicons
                                                        name="star"
                                                        size={20}
                                                        color="#FFB300"
                                                    />
                                                    <Text style={styles.gradeText}>
                                                        Calificación: {submission.grade} /{' '}
                                                        {task.points}
                                                    </Text>
                                                </View>
                                                {submission.feedback && (
                                                    <Text style={styles.feedbackText}>
                                                        {submission.feedback}
                                                    </Text>
                                                )}
                                            </View>
                                        )}

                                        <Button
                                            title={
                                                status === 'graded'
                                                    ? 'Ver detalles'
                                                    : 'Calificar'
                                            }
                                            onPress={() =>
                                                handleGradeSubmission(submission.id)
                                            }
                                            variant={
                                                status === 'graded' ? 'outline' : 'primary'
                                            }
                                            icon={
                                                status === 'graded'
                                                    ? 'eye'
                                                    : 'create'
                                            }
                                            style={styles.actionButton}
                                        />
                                    </Card>
                                );
                            })
                        )}
                    </View>
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
    taskCard: {
        margin: 16,
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    taskDescription: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 12,
        lineHeight: 20,
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
    statsCard: {
        margin: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1976D2',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
    },
    submissionsSection: {
        padding: 16,
        paddingTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        color: '#9E9E9E',
        marginTop: 16,
        textAlign: 'center',
    },
    submissionCard: {
        marginBottom: 16,
    },
    submissionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    studentDetails: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 2,
    },
    submissionDate: {
        fontSize: 12,
        color: '#757575',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
    },
    submissionContent: {
        fontSize: 14,
        color: '#424242',
        lineHeight: 20,
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    gradeInfo: {
        backgroundColor: '#FFF9C4',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    gradeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    gradeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
    },
    feedbackText: {
        fontSize: 14,
        color: '#616161',
        marginTop: 8,
        fontStyle: 'italic',
    },
    actionButton: {
        marginTop: 8,
    },
});
