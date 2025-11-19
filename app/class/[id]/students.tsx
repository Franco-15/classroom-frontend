import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRole } from '@/contexts/AuthContext';
import { User } from '@/types';
import apiService from '@/services/api';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function ClassStudentsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isTeacher } = useRole();
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        type: 'error' | 'success';
        message: string;
    } | null>(null);

    useEffect(() => {
        loadStudents();
    }, [id]);

    const loadStudents = async () => {
        try {
            const response = await apiService.getClassStudents(id);

            if (response.success && response.data) {
                setStudents(response.data);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: response.error || 'Error al cargar estudiantes',
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
        loadStudents();
    };

    const handleRemoveStudent = async (studentId: string, studentName: string) => {
        RNAlert.alert(
            'Quitar estudiante',
            `¿Estás seguro de que deseas quitar a ${studentName} de la clase?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Quitar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await apiService.removeStudentFromClass(id, studentId);
                            if (response.success) {
                                setAlertMessage({
                                    type: 'success',
                                    message: 'Estudiante removido de la clase',
                                });
                                loadStudents();
                            } else {
                                setAlertMessage({
                                    type: 'error',
                                    message: response.error || 'Error al remover estudiante',
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

    if (loading) {
        return <Loading message="Cargando estudiantes..." />;
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
                    <Text style={styles.headerTitle}>Estudiantes</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {alertMessage && (
                    <View style={styles.alertContainer}>
                        <Alert
                            type={alertMessage.type}
                            message={alertMessage.message}
                            onClose={() => setAlertMessage(null)}
                        />
                    </View>
                )}

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>
                        {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}
                    </Text>
                </View>

                {/* Students List */}
                {students.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color="#BDBDBD" />
                        <Text style={styles.emptyText}>
                            No hay estudiantes en esta clase
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={students}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Card style={styles.studentCard}>
                                <View style={styles.studentRow}>
                                    <Ionicons
                                        name="person-circle"
                                        size={48}
                                        color="#1976D2"
                                    />
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{item.name}</Text>
                                        <Text style={styles.studentEmail}>{item.email}</Text>
                                    </View>
                                    {isTeacher && (
                                        <TouchableOpacity
                                            onPress={() => handleRemoveStudent(item.id, item.name)}
                                            style={styles.removeButton}
                                        >
                                            <Ionicons name="close-circle" size={28} color="#F44336" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </Card>
                        )}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                )}
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
    alertContainer: {
        padding: 16,
        paddingBottom: 0,
    },
    statsContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    statsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#9E9E9E',
        marginTop: 16,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    studentCard: {
        marginBottom: 12,
    },
    studentRow: {
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
        fontSize: 14,
        color: '#757575',
    },
    removeButton: {
        padding: 4,
    },
});
