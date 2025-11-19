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
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function TaskGradesScreen() {
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
            const [taskResponse, submissionsResponse] = await Promise.all([
                apiService.getTaskById(id),
                apiService.getSubmissions(id),
            ]);

            if (taskResponse.success && taskResponse.data) {
                setTask(taskResponse.data);
            }

            if (submissionsResponse.success && submissionsResponse.data) {
                // Solo mostrar entregas calificadas
                const gradedSubmissions = submissionsResponse.data.filter(
                    (s) => s.grade !== null && s.grade !== undefined
                );
                setSubmissions(gradedSubmissions);
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

    const getGradeColor = (percentage: number) => {
        if (percentage >= 70) return '#4CAF50';
        if (percentage >= 50) return '#FF9800';
        return '#F44336';
    };

    const getGradeLabel = (percentage: number) => {
        if (percentage >= 70) return 'Aprobado';
        if (percentage >= 50) return 'Regular';
        return 'Reprobado';
    };

    if (loading) {
        return <Loading message="Cargando calificaciones..." />;
    }

    if (!task) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>No se pudo cargar la tarea</Text>
            </SafeAreaView>
        );
    }

    const averageGrade =
        submissions.length > 0
            ? submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length
            : 0;
    const averagePercentage = task.points ? (averageGrade / task.points) * 100 : 0;

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
                    <Text style={styles.headerTitle}>Calificaciones</Text>
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
                        <View style={styles.taskInfoRow}>
                            <View style={styles.taskInfoItem}>
                                <Ionicons name="star" size={16} color="#FFB300" />
                                <Text style={styles.taskInfoText}>
                                    Puntos totales: {task.points}
                                </Text>
                            </View>
                            <View style={styles.taskInfoItem}>
                                <Ionicons name="people" size={16} color="#757575" />
                                <Text style={styles.taskInfoText}>
                                    {submissions.length} calificadas
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* Average Stats */}
                    {submissions.length > 0 && (
                        <Card style={styles.statsCard}>
                            <Text style={styles.statsTitle}>Promedio General</Text>
                            <View style={styles.statsContent}>
                                <View style={styles.gradeCircle}>
                                    <Text style={styles.gradeValue}>
                                        {averageGrade.toFixed(1)}
                                    </Text>
                                    <Text style={styles.gradeMax}>/ {task.points}</Text>
                                </View>
                                <View style={styles.statsDetails}>
                                    <View
                                        style={[
                                            styles.percentageBadge,
                                            {
                                                backgroundColor: getGradeColor(
                                                    averagePercentage
                                                ),
                                            },
                                        ]}
                                    >
                                        <Text style={styles.percentageText}>
                                            {averagePercentage.toFixed(0)}%
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.gradeStatus,
                                            { color: getGradeColor(averagePercentage) },
                                        ]}
                                    >
                                        {getGradeLabel(averagePercentage)}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    )}

                    {/* Grades List */}
                    <View style={styles.gradesSection}>
                        <Text style={styles.sectionTitle}>Calificaciones por Estudiante</Text>

                        {submissions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="ribbon-outline" size={64} color="#BDBDBD" />
                                <Text style={styles.emptyText}>
                                    Aún no hay entregas calificadas
                                </Text>
                            </View>
                        ) : (
                            submissions
                                .sort((a, b) => (b.grade || 0) - (a.grade || 0))
                                .map((submission, index) => {
                                    const percentage = task.points
                                        ? ((submission.grade || 0) / task.points) * 100
                                        : 0;
                                    return (
                                        <Card key={submission.id} style={styles.gradeCard}>
                                            <View style={styles.gradeHeader}>
                                                <View style={styles.rankBadge}>
                                                    <Text style={styles.rankText}>
                                                        #{index + 1}
                                                    </Text>
                                                </View>
                                                <View style={styles.studentInfo}>
                                                    <Text style={styles.studentName}>
                                                        {submission.student?.name ||
                                                            'Estudiante'}
                                                    </Text>
                                                    <Text style={styles.studentEmail}>
                                                        {submission.student?.email || ''}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.gradeDetails}>
                                                <View style={styles.gradeScoreContainer}>
                                                    <Text style={styles.gradeScore}>
                                                        {submission.grade}
                                                    </Text>
                                                    <Text style={styles.gradeScoreMax}>
                                                        / {task.points}
                                                    </Text>
                                                </View>

                                                <View
                                                    style={[
                                                        styles.percentageLabel,
                                                        {
                                                            backgroundColor:
                                                                getGradeColor(percentage),
                                                        },
                                                    ]}
                                                >
                                                    <Text style={styles.percentageLabelText}>
                                                        {percentage.toFixed(0)}%
                                                    </Text>
                                                </View>

                                                <Text
                                                    style={[
                                                        styles.statusLabel,
                                                        { color: getGradeColor(percentage) },
                                                    ]}
                                                >
                                                    {getGradeLabel(percentage)}
                                                </Text>
                                            </View>

                                            {submission.feedback && (
                                                <View style={styles.feedbackContainer}>
                                                    <Ionicons
                                                        name="chatbox-outline"
                                                        size={16}
                                                        color="#757575"
                                                    />
                                                    <Text style={styles.feedbackText}>
                                                        {submission.feedback}
                                                    </Text>
                                                </View>
                                            )}
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
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 12,
    },
    taskInfoRow: {
        flexDirection: 'row',
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
        backgroundColor: '#E3F2FD',
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 16,
    },
    statsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    gradeCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        borderWidth: 4,
        borderColor: '#1976D2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1976D2',
    },
    gradeMax: {
        fontSize: 14,
        color: '#1976D2',
        fontWeight: '500',
    },
    statsDetails: {
        flex: 1,
        gap: 8,
    },
    percentageBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    percentageText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
    },
    gradeStatus: {
        fontSize: 18,
        fontWeight: '600',
    },
    gradesSection: {
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
    gradeCard: {
        marginBottom: 12,
    },
    gradeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFB300',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
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
    gradeDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    gradeScoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    gradeScore: {
        fontSize: 32,
        fontWeight: '700',
        color: '#212121',
    },
    gradeScoreMax: {
        fontSize: 18,
        color: '#757575',
        marginLeft: 4,
    },
    percentageLabel: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    percentageLabelText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    statusLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
    },
    feedbackContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FFF9C4',
        borderRadius: 8,
    },
    feedbackText: {
        flex: 1,
        fontSize: 14,
        color: '#616161',
        fontStyle: 'italic',
    },
});
