/**
 * Utilidades para el manejo de errores
 * Separa los mensajes de error para usuarios vs logs del servidor
 */

/**
 * Mensajes de error amigables para el usuario
 */
export const USER_ERROR_MESSAGES = {
    NETWORK_ERROR: 'No se pudo conectar con el servidor. Verifica tu conexión.',
    AUTH_ERROR: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
    SERVER_ERROR: 'Ocurrió un error en el servidor. Intenta nuevamente.',
    UNKNOWN_ERROR: 'Ocurrió un error inesperado. Intenta nuevamente.',
    TIMEOUT_ERROR: 'La solicitud tardó demasiado. Intenta nuevamente.',
} as const;

/**
 * Mapea códigos de estado HTTP a mensajes amigables
 */
const STATUS_TO_MESSAGE: Record<number, string> = {
    400: USER_ERROR_MESSAGES.VALIDATION_ERROR,
    401: USER_ERROR_MESSAGES.AUTH_ERROR,
    403: USER_ERROR_MESSAGES.UNAUTHORIZED,
    404: USER_ERROR_MESSAGES.NOT_FOUND,
    408: USER_ERROR_MESSAGES.TIMEOUT_ERROR,
    500: USER_ERROR_MESSAGES.SERVER_ERROR,
    502: USER_ERROR_MESSAGES.SERVER_ERROR,
    503: USER_ERROR_MESSAGES.SERVER_ERROR,
    504: USER_ERROR_MESSAGES.TIMEOUT_ERROR,
};

/**
 * Registra un error en los logs (solo en desarrollo)
 */
export function logError(context: string, error: unknown, additionalData?: Record<string, unknown>): void {
    if (__DEV__) {
        console.error(`❌ [${context}]`, error, additionalData || '');
    }
}

/**
 * Registra información en los logs (solo en desarrollo)
 */
export function logInfo(context: string, message: string, data?: unknown): void {
    if (__DEV__) {
        console.log(`ℹ️ [${context}] ${message}`, data || '');
    }
}

/**
 * Registra una advertencia en los logs (solo en desarrollo)
 */
export function logWarning(context: string, message: string, data?: unknown): void {
    if (__DEV__) {
        console.warn(`⚠️ [${context}] ${message}`, data || '');
    }
}

/**
 * Obtiene un mensaje de error amigable para el usuario
 * Oculta detalles técnicos y errores del servidor
 */
export function getUserFriendlyError(
    error: unknown,
    status?: number,
    serverMessage?: string
): string {
    // Si hay un mensaje del servidor que sea seguro mostrar
    if (serverMessage && isSafeServerMessage(serverMessage)) {
        return serverMessage;
    }

    // Si hay un código de estado HTTP, usar el mensaje correspondiente
    if (status && STATUS_TO_MESSAGE[status]) {
        return STATUS_TO_MESSAGE[status];
    }

    // Errores de red
    if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
            return USER_ERROR_MESSAGES.NETWORK_ERROR;
        }
        if (error.message.includes('timeout')) {
            return USER_ERROR_MESSAGES.TIMEOUT_ERROR;
        }
    }

    // Error genérico
    return USER_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Determina si un mensaje del servidor es seguro para mostrar al usuario
 * Filtra mensajes técnicos, traces, y detalles de implementación
 */
function isSafeServerMessage(message: string): boolean {
    const unsafePatterns = [
        /error:/i,
        /exception/i,
        /stack trace/i,
        /at \w+\./,  // Stack trace patterns
        /prisma/i,
        /database/i,
        /sql/i,
        /query/i,
        /undefined/i,
        /null/i,
        /token/i,
        /jwt/i,
        /password/i,
        /secret/i,
        /internal/i,
        /debug/i,
        /\{.*\}/,  // JSON objects
        /\[.*\]/,  // Arrays
        /^\d{3}:/,  // HTTP status codes at start
    ];

    return !unsafePatterns.some(pattern => pattern.test(message));
}

/**
 * Extrae información útil de un error para logging
 */
export function getErrorDetails(error: unknown): {
    message: string;
    stack?: string;
    name?: string;
} {
    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack,
            name: error.name,
        };
    }

    if (typeof error === 'string') {
        return { message: error };
    }

    if (error && typeof error === 'object') {
        return {
            message: JSON.stringify(error),
        };
    }

    return { message: 'Unknown error' };
}

/**
 * Tipo de error de API
 */
export interface ApiErrorInfo {
    userMessage: string;
    logMessage: string;
    status?: number;
    details?: unknown;
}

/**
 * Procesa un error de API y retorna mensajes separados para usuario y logs
 */
export function processApiError(
    error: unknown,
    status?: number,
    serverMessage?: string,
    context?: string
): ApiErrorInfo {
    const errorDetails = getErrorDetails(error);
    const userMessage = getUserFriendlyError(error, status, serverMessage);

    // Log completo para debugging
    if (context) {
        logError(context, error, {
            status,
            serverMessage,
            errorDetails,
        });
    }

    return {
        userMessage,
        logMessage: serverMessage || errorDetails.message,
        status,
        details: errorDetails,
    };
}
