import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, UserRole } from '@/types';
import apiService from '@/services/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    loginWithTokens: (accessToken: string, refreshToken: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar si hay un usuario autenticado al iniciar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await apiService.getStoredToken();

            if (token) {
                const response = await apiService.getCurrentUser();

                if (response.success && response.data) {
                    setUser(response.data);
                } else {
                    // Token inválido o expirado
                    await apiService.logout();
                }
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await apiService.login(credentials);

            if (response.success && response.data) {
                setUser(response.data.user);
                return { success: true };
            }

            return {
                success: false,
                error: response.error || 'Error al iniciar sesión',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    };

    const loginWithTokens = async (accessToken: string, refreshToken: string) => {
        try {
            // Guardar los tokens
            await apiService.saveAuthTokens(accessToken, refreshToken);

            // Obtener los datos del usuario
            const response = await apiService.getCurrentUser();

            if (response.success && response.data) {
                setUser(response.data);
                return { success: true };
            }

            return {
                success: false,
                error: response.error || 'Error al obtener datos del usuario',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await apiService.register(data);

            if (response.success && response.data) {
                setUser(response.data.user);
                return { success: true };
            }

            return {
                success: false,
                error: response.error || 'Error al registrarse',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    };

    const logout = async () => {
        await apiService.logout();
        setUser(null);
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithTokens,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }

    return context;
}

// Hook para verificar roles
export function useRole() {
    const { user } = useAuth();

    return {
        isDirectivo: user?.role === UserRole.DIRECTIVO,
        isTeacher: user?.role === UserRole.TEACHER,
        isStudent: user?.role === UserRole.STUDENT,
        role: user?.role,
    };
}
