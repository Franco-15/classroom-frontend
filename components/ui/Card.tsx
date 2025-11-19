import React, { ReactNode } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    GestureResponderEvent,
} from 'react-native';

interface CardProps {
    children: ReactNode;
    onPress?: (event: GestureResponderEvent) => void;
    style?: ViewStyle;
    elevation?: number;
}

export default function Card({ children, onPress, style, elevation = 2 }: CardProps) {
    const cardStyles = [
        styles.card,
        { elevation },
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity
                style={cardStyles}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});
