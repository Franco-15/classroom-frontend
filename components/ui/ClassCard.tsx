import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Class } from '@/types';
import Card from './Card';

interface ClassCardProps {
    classData: Class;
    onPress: () => void;
}

export default function ClassCard({ classData, onPress }: ClassCardProps) {
    // Generar color aleatorio basado en el ID
    const getColorFromId = (id: string) => {
        const colors = ['#1976D2', '#388E3C', '#D32F2F', '#7B1FA2', '#F57C00', '#0097A7'];
        const index = parseInt(id.slice(-1), 16) % colors.length;
        return colors[index];
    };

    const backgroundColor = getColorFromId(classData.id);

    return (
        <Card onPress={onPress} style={styles.card}>
            <View style={[styles.header, { backgroundColor }]}>
                <View>
                    <Text style={styles.className} numberOfLines={2}>
                        {classData.name}
                    </Text>
                    {classData.subject && (
                        <Text style={styles.subject} numberOfLines={1}>
                            {classData.subject}
                        </Text>
                    )}
                </View>
                <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
            </View>

            <View style={styles.content}>
                <View style={styles.info}>
                    <Ionicons name="person-outline" size={16} color="#757575" />
                    <Text style={styles.infoText}>
                        {classData.teacher?.name || 'Profesor'}
                    </Text>
                </View>

                {classData.studentsCount !== undefined && (
                    <View style={styles.info}>
                        <Ionicons name="people-outline" size={16} color="#757575" />
                        <Text style={styles.infoText}>
                            {classData.studentsCount} estudiante{classData.studentsCount !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}

                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Código:</Text>
                    <Text style={styles.code}>{classData.code}</Text>
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        minHeight: 100,
    },
    className: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subject: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
        padding: 16,
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#757575',
        marginLeft: 8,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    codeLabel: {
        fontSize: 12,
        color: '#757575',
        marginRight: 8,
    },
    code: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
        letterSpacing: 1,
    },
});
