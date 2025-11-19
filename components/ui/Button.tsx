import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    style,
    textStyle,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const buttonStyles: ViewStyle[] = [
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
    ].filter(Boolean) as ViewStyle[];

    const textStyles: TextStyle[] = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
        textStyle,
    ].filter(Boolean) as TextStyle[];

    const iconColor = variant === 'outline' ? '#1976D2' : '#FFFFFF';
    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={iconColor}
                    size={size === 'small' ? 'small' : 'small'}
                />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && (
                        <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
                    )}
                    <Text style={textStyles}>{title}</Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },

    // Variantes
    button_primary: {
        backgroundColor: '#1976D2',
    },
    button_secondary: {
        backgroundColor: '#757575',
    },
    button_outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#1976D2',
    },
    button_danger: {
        backgroundColor: '#D32F2F',
    },

    // Tamaños
    button_small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    button_medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    button_large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },

    // Estados
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },

    // Texto
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    text_primary: {
        color: '#FFFFFF',
    },
    text_secondary: {
        color: '#FFFFFF',
    },
    text_outline: {
        color: '#1976D2',
    },
    text_danger: {
        color: '#FFFFFF',
    },
    text_small: {
        fontSize: 14,
    },
    text_medium: {
        fontSize: 16,
    },
    text_large: {
        fontSize: 18,
    },
});
