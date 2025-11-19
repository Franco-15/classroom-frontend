import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingProps {
    message?: string;
    size?: 'small' | 'large';
}

export default function Loading({ message, size = 'large' }: LoadingProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color="#1976D2" />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    message: {
        marginTop: 12,
        fontSize: 16,
        color: '#757575',
    },
});
