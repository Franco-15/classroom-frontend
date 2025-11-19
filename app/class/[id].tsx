import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    FlatList,
    Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRole } from '@/contexts/AuthContext';
import { ClassDetail, Announcement, Task } from '@/types';
import apiService from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

type TabType = 'announcements' | 'tasks';

export default function ClassDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isTeacher, isStudent, isDirectivo } = useRole();
    const [activeTab, setActiveTab] = useState<TabType>('announcements');
    const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        type: 'error' | 'success';
        message: string;
    } | null>(null);

    useEffect(() => {
        loadClassDetail();
    }, [id]);

    const loadClassDetail = async () => {
        try {
            console.log('🔍 Cargando clase con ID:', id);
            const response = await apiService.getClassById(id);
            console.log('📦 Respuesta del servidor:', response);

            if (response.success && response.data) {
                setClassDetail(response.data);
                console.log('✅ Clase cargada:', response.data.name);
            } else {
                console.error('❌ Error en respuesta:', response.error);
                setAlertMessage({
                    type: 'error',
                    message: response.error || 'Error al cargar la clase',
                });
            }
        } catch (error) {
            console.error('💥 Error de conexión:', error);
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
        loadClassDetail();
    };

    const handleCreateAnnouncement = () => {
        router.push({
            pathname: '/announcement/create',
            params: { classId: id },
        } as any);
    };

    const handleCreateTask = () => {
        router.push({
            pathname: '/task/create',
            params: { classId: id },
        } as any);
    };

    const handleTaskPress = (taskId: string) => {
        router.push({
            pathname: '/task/[id]',
            params: { id: taskId },
        } as any);
    };

    const handleDeleteClass = async () => {
        RNAlert.alert(
            'Eliminar clase',
            '¿Estás seguro de que deseas eliminar esta clase? Esta acción no se puede deshacer.',
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
                            const response = await apiService.deleteClass(id);
                            if (response.success) {
                                setAlertMessage({
                                    type: 'success',
                                    message: 'Clase eliminada exitosamente',
                                });
                                setTimeout(() => {
                                    router.back();
                                }, 1500);
                            } else {
                                setAlertMessage({
                                    type: 'error',
                                    message: response.error || 'Error al eliminar la clase',
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

    const handleDeleteAnnouncement = async (announcementId: string) => {
        RNAlert.alert(
            'Eliminar anuncio',
            '¿Estás seguro de que deseas eliminar este anuncio?',
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
                            const response = await apiService.deleteAnnouncement(announcementId);
                            if (response.success) {
                                setAlertMessage({
                                    type: 'success',
                                    message: 'Anuncio eliminado',
                                });
                                loadClassDetail();
                            } else {
                                setAlertMessage({
                                    type: 'error',
                                    message: response.error || 'Error al eliminar el anuncio',
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
    }; if (loading) {
        return <Loading message="Cargando clase..." />;
    }

    if (!classDetail) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>No se pudo cargar la clase</Text>
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
                        {classDetail.name}
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

                {/* Class Info */}
                <View style={styles.header}>
                    <View style={styles.classInfoRow}>
                        <View style={styles.classInfo}>
                            <Text style={styles.className}>{classDetail.name}</Text>
                            <Text style={styles.classCode}>Código: {classDetail.code}</Text>
                            {classDetail.description && (
                                <Text style={styles.classDescription}>{classDetail.description}</Text>
                            )}
                        </View>
                        {(isTeacher || isDirectivo) && (
                            <View style={styles.classActions}>
                                <TouchableOpacity
                                    onPress={() => router.push(`/class/${id}/students` as any)}
                                    style={styles.classActionButton}
                                >
                                    <Ionicons name="people-outline" size={22} color="#FFF" />
                                </TouchableOpacity>
                                {isTeacher && (
                                    <TouchableOpacity
                                        onPress={handleDeleteClass}
                                        style={styles.classActionButton}
                                    >
                                        <Ionicons name="trash-outline" size={22} color="#F44336" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'announcements' && styles.activeTab]}
                        onPress={() => setActiveTab('announcements')}
                    >
                        <Ionicons
                            name="megaphone"
                            size={20}
                            color={activeTab === 'announcements' ? '#1976D2' : '#757575'}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'announcements' && styles.activeTabText,
                            ]}
                        >
                            Anuncios
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
                        onPress={() => setActiveTab('tasks')}
                    >
                        <Ionicons
                            name="clipboard"
                            size={20}
                            color={activeTab === 'tasks' ? '#1976D2' : '#757575'}
                        />
                        <Text
                            style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}
                        >
                            Tareas
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {activeTab === 'announcements' && (
                        <AnnouncementsTab
                            announcements={classDetail.announcements || []}
                            isTeacher={isTeacher}
                            onCreatePress={handleCreateAnnouncement}
                            onDeletePress={handleDeleteAnnouncement}
                        />
                    )}

                    {activeTab === 'tasks' && (
                        <TasksTab
                            tasks={classDetail.tasks || []}
                            isTeacher={isTeacher}
                            onCreatePress={handleCreateTask}
                            onTaskPress={handleTaskPress}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

// Tab Components
interface TabProps {
    isTeacher: boolean;
    onCreatePress: () => void;
}

interface AnnouncementsTabProps extends TabProps {
    announcements: Announcement[];
    onDeletePress: (announcementId: string) => void;
}

function AnnouncementsTab({
    announcements,
    isTeacher,
    onCreatePress,
    onDeletePress,
}: AnnouncementsTabProps) {
    return (
        <View style={styles.tabContent}>
            {isTeacher && (
                <Button
                    title="Crear anuncio"
                    onPress={onCreatePress}
                    icon="add"
                    style={styles.createButton}
                />
            )}

            {announcements.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="megaphone-outline" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>No hay anuncios aún</Text>
                </View>
            ) : (
                announcements.map((announcement) => (
                    <Card key={announcement.id} style={styles.announcementCard}>
                        <View style={styles.announcementHeader}>
                            <View style={styles.announcementTitleRow}>
                                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                                {isTeacher && (
                                    <TouchableOpacity
                                        onPress={() => onDeletePress(announcement.id)}
                                        style={styles.deleteButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={styles.announcementDate}>
                                {new Date(announcement.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text style={styles.announcementContent}>{announcement.content}</Text>
                        {announcement.author && (
                            <Text style={styles.announcementAuthor}>
                                Por: {announcement.author.name}
                            </Text>
                        )}
                    </Card>
                ))
            )}
        </View>
    );
}

interface TasksTabProps extends TabProps {
    tasks: Task[];
    onTaskPress: (taskId: string) => void;
}

function TasksTab({ tasks, isTeacher, onCreatePress, onTaskPress }: TasksTabProps) {
    return (
        <View style={styles.tabContent}>
            {isTeacher && (
                <Button
                    title="Crear tarea"
                    onPress={onCreatePress}
                    icon="add"
                    style={styles.createButton}
                />
            )}

            {tasks.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="clipboard-outline" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>No hay tareas aún</Text>
                </View>
            ) : (
                tasks.map((task) => (
                    <Card
                        key={task.id}
                        onPress={() => onTaskPress(task.id)}
                        style={styles.taskCard}
                    >
                        <View style={styles.taskHeader}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            {task.status && (
                                <View
                                    style={[
                                        styles.taskStatusBadge,
                                        styles[`taskStatus${task.status}`],
                                    ]}
                                >
                                    <Text style={styles.taskStatusText}>
                                        {getStatusLabel(task.status)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {task.description && (
                            <Text style={styles.taskDescription} numberOfLines={2}>
                                {task.description}
                            </Text>
                        )}
                        <View style={styles.taskFooter}>
                            <View style={styles.taskInfo}>
                                <Ionicons name="calendar" size={16} color="#757575" />
                                <Text style={styles.taskDate}>
                                    Entrega: {new Date(task.dueDate).toLocaleDateString()}
                                </Text>
                            </View>
                            {task.points && (
                                <View style={styles.taskInfo}>
                                    <Ionicons name="star" size={16} color="#FFC107" />
                                    <Text style={styles.taskPoints}>{task.points} pts</Text>
                                </View>
                            )}
                        </View>
                    </Card>
                ))
            )}
        </View>
    );
}

// Helper Functions
function getFileIcon(fileType?: string): any {
    if (!fileType) return 'document';
    if (fileType.includes('pdf')) return 'document-text';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('video')) return 'videocam';
    if (fileType.includes('audio')) return 'musical-notes';
    return 'document';
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        PENDING: 'Pendiente',
        SUBMITTED: 'Entregada',
        GRADED: 'Calificada',
        LATE: 'Retrasada',
    };
    return labels[status] || status;
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
    header: {
        backgroundColor: '#1976D2',
        padding: 16,
    },
    classInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    classInfo: {
        flex: 1,
    },
    classActions: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 12,
    },
    classActionButton: {
        padding: 8,
    },
    className: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    classCode: {
        fontSize: 14,
        color: '#E3F2FD',
        marginBottom: 8,
    },
    classDescription: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.9,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#1976D2',
    },
    tabText: {
        fontSize: 14,
        color: '#757575',
    },
    activeTabText: {
        color: '#1976D2',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
    },
    createButton: {
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#9E9E9E',
        marginTop: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
        textAlign: 'center',
        marginTop: 20,
    },
    // Announcements
    announcementCard: {
        marginBottom: 12,
    },
    announcementHeader: {
        marginBottom: 8,
    },
    announcementTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    announcementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    announcementDate: {
        fontSize: 12,
        color: '#757575',
    },
    announcementContent: {
        fontSize: 14,
        color: '#616161',
        lineHeight: 20,
        marginBottom: 8,
    },
    announcementAuthor: {
        fontSize: 12,
        color: '#9E9E9E',
        fontStyle: 'italic',
    },
    // Materials
    materialCard: {
        marginBottom: 12,
    },
    materialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    materialInfo: {
        flex: 1,
    },
    materialTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    materialDescription: {
        fontSize: 14,
        color: '#616161',
        marginBottom: 4,
    },
    materialDate: {
        fontSize: 12,
        color: '#9E9E9E',
    },
    downloadButton: {
        padding: 8,
    },
    // Tasks
    taskCard: {
        marginBottom: 12,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    taskStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    taskStatusPENDING: {
        backgroundColor: '#FFF3E0',
    },
    taskStatusSUBMITTED: {
        backgroundColor: '#E3F2FD',
    },
    taskStatusGRADED: {
        backgroundColor: '#E8F5E9',
    },
    taskStatusLATE: {
        backgroundColor: '#FFEBEE',
    },
    taskStatusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#424242',
    },
    taskDescription: {
        fontSize: 14,
        color: '#616161',
        lineHeight: 20,
        marginBottom: 12,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    taskInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    taskDate: {
        fontSize: 12,
        color: '#757575',
    },
    taskPoints: {
        fontSize: 12,
        color: '#757575',
        fontWeight: '600',
    },
});
