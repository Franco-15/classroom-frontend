import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
    const iconName = {
        success: 'checkmark-circle' as const,
        error: 'alert-circle' as const,
        warning: 'warning' as const,
        info: 'information-circle' as const,
    }[type];

    const colors = {
        success: { bg: '#E8F5E9', text: '#2E7D32', border: '#4CAF50' },
        error: { bg: '#FFEBEE', text: '#C62828', border: '#F44336' },
        warning: { bg: '#FFF3E0', text: '#E65100', border: '#FF9800' },
        info: { bg: '#E3F2FD', text: '#1565C0', border: '#2196F3' },
    }[type];

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Ionicons name={iconName} size={24} color={colors.border} style={styles.icon} />

            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

            {onClose && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color={colors.text} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        marginVertical: 8,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});
