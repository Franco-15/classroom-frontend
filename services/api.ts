import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ApiResponse,
    AuthTokens,
    LoginCredentials,
    RegisterData,
    User,
    Class,
    ClassDetail,
    Task,
    Submission,
    CreateClassForm,
    CreateTaskForm,
    SubmitTaskForm,
    GradeSubmissionForm,
    Announcement,
    Material,
} from '@/types';
import { API_CONFIG } from '@/config/env';

// La URL se obtiene del archivo de configuración que lee las variables de entorno
const API_BASE_URL = API_CONFIG.baseURL;

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    private async getAuthHeader(): Promise<Record<string, string>> {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
        }
        return {
            'Content-Type': 'application/json',
        };
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                console.error('❌ API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                });
                return {
                    success: false,
                    error: data.message || data.error || `Error ${response.status}: ${response.statusText}`,
                };
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message,
            };
        }

        if (!response.ok) {
            console.error('❌ API Error (non-JSON):', {
                status: response.status,
                statusText: response.statusText,
            });
            return {
                success: false,
                error: `Error: ${response.status} ${response.statusText}`,
            };
        }

        return {
            success: true,
            data: {} as T,
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const headers = await this.getAuthHeader();
            const url = `${this.baseUrl}${endpoint}`;

            // Debug log en desarrollo
            if (__DEV__) {
                console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
            }

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers,
                },
            });

            // Si el token expiró (401), intentar refrescar
            if (response.status === 401) {
                const refreshed = await this.refreshToken();
                if (refreshed.success) {
                    // Reintentar la petición con el nuevo token
                    const newHeaders = await this.getAuthHeader();
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers: {
                            ...newHeaders,
                            ...options.headers,
                        },
                    });
                    return this.handleResponse<T>(retryResponse);
                }
            }

            return this.handleResponse<T>(response);
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error de conexión',
            };
        }
    }

    // ============================================
    // AUTENTICACIÓN
    // ============================================

    async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
        const response = await this.request<{ user: User; tokens: AuthTokens }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && response.data) {
            await this.saveTokens(response.data.tokens);
        }

        return response;
    }

    async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
        const response = await this.request<{ user: User; tokens: AuthTokens }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (response.success && response.data) {
            await this.saveTokens(response.data.tokens);
        }

        return response;
    }

    async logout(): Promise<void> {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    }

    async refreshToken(): Promise<ApiResponse<AuthTokens>> {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            return { success: false, error: 'No refresh token available' };
        }

        const response = await this.request<AuthTokens>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });

        if (response.success && response.data) {
            await this.saveTokens(response.data);
        }

        return response;
    }

    async getCurrentUser(): Promise<ApiResponse<User>> {
        return this.request<User>('/auth/me');
    }

    private async saveTokens(tokens: AuthTokens): Promise<void> {
        await AsyncStorage.multiSet([
            [TOKEN_KEY, tokens.accessToken],
            [REFRESH_TOKEN_KEY, tokens.refreshToken],
        ]);
    }

    async saveAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
        await AsyncStorage.multiSet([
            [TOKEN_KEY, accessToken],
            [REFRESH_TOKEN_KEY, refreshToken],
        ]);
    }

    async getStoredToken(): Promise<string | null> {
        return AsyncStorage.getItem(TOKEN_KEY);
    }

    // ============================================
    // CLASES
    // ============================================

    async getClasses(): Promise<ApiResponse<Class[]>> {
        return this.request<Class[]>('/classes');
    }

    async getAllClasses(): Promise<ApiResponse<Class[]>> {
        return this.request<Class[]>('/classes/all');
    }

    async getClassById(classId: string): Promise<ApiResponse<ClassDetail>> {
        return this.request<ClassDetail>(`/classes/${classId}`);
    }

    async getClassDetail(classId: number): Promise<ApiResponse<ClassDetail>> {
        return this.getClassById(classId.toString());
    }

    async createClass(data: CreateClassForm): Promise<ApiResponse<Class>> {
        return this.request<Class>('/classes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateClass(classId: string, data: Partial<CreateClassForm>): Promise<ApiResponse<Class>> {
        return this.request<Class>(`/classes/${classId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteClass(classId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/classes/${classId}`, {
            method: 'DELETE',
        });
    }

    async joinClass(code: string): Promise<ApiResponse<Class>> {
        return this.request<Class>('/classes/join', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    async getClassStudents(classId: string): Promise<ApiResponse<User[]>> {
        return this.request<User[]>(`/classes/${classId}/students`);
    }

    async removeStudentFromClass(classId: string, studentId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/classes/${classId}/students/${studentId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // ANUNCIOS
    // ============================================

    async getAnnouncements(classId: string): Promise<ApiResponse<Announcement[]>> {
        return this.request<Announcement[]>(`/classes/${classId}/announcements`);
    }

    async createAnnouncement(classId: string, data: { title: string; content: string }): Promise<ApiResponse<Announcement>> {
        return this.request<Announcement>(`/classes/${classId}/announcements`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteAnnouncement(announcementId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/announcements/${announcementId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // MATERIALES
    // ============================================

    async getMaterials(classId: string): Promise<ApiResponse<Material[]>> {
        return this.request<Material[]>(`/classes/${classId}/materials`);
    }

    async createMaterial(classId: string, data: Partial<Material>): Promise<ApiResponse<Material>> {
        return this.request<Material>(`/classes/${classId}/materials`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ============================================
    // TAREAS
    // ============================================

    async getTasks(classId: string): Promise<ApiResponse<Task[]>> {
        return this.request<Task[]>(`/classes/${classId}/tasks`);
    }

    async getTaskById(taskId: string): Promise<ApiResponse<Task>> {
        return this.request<Task>(`/tasks/${taskId}`);
    }

    async createTask(classId: string, data: CreateTaskForm): Promise<ApiResponse<Task>> {
        return this.request<Task>(`/classes/${classId}/tasks`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTask(taskId: string, data: Partial<CreateTaskForm>): Promise<ApiResponse<Task>> {
        return this.request<Task>(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTask(taskId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // ENTREGAS
    // ============================================

    async getSubmissions(taskId: string): Promise<ApiResponse<Submission[]>> {
        return this.request<Submission[]>(`/tasks/${taskId}/submissions`);
    }

    async getSubmissionById(submissionId: string): Promise<ApiResponse<Submission>> {
        return this.request<Submission>(`/submissions/${submissionId}`);
    }

    async getMySubmission(taskId: string): Promise<ApiResponse<Submission>> {
        try {
            const headers = await this.getAuthHeader();
            const url = `${this.baseUrl}/tasks/${taskId}/my-submission`;

            if (__DEV__) {
                console.log('🌐 API Request: GET', url);
            }

            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();

                // Si es 404 y el mensaje indica que no hay entrega, retornar success con data null
                if (response.status === 404 && (data.error?.includes('No has entregado') || data.error?.includes('no entregado'))) {
                    if (__DEV__) {
                        console.log('ℹ️ No hay entrega para esta tarea (estado esperado)');
                    }
                    return {
                        success: true,
                        data: null as any, // null indica que no hay entrega
                        message: 'No hay entrega',
                    };
                }

                if (!response.ok) {
                    console.error('❌ API Error Response:', {
                        status: response.status,
                        statusText: response.statusText,
                        data,
                    });
                    return {
                        success: false,
                        error: data.message || data.error || `Error ${response.status}: ${response.statusText}`,
                    };
                }

                return {
                    success: true,
                    data: data.data || data,
                    message: data.message,
                };
            }

            if (!response.ok) {
                return {
                    success: false,
                    error: `Error: ${response.status} ${response.statusText}`,
                };
            }

            return {
                success: true,
                data: {} as Submission,
            };
        } catch (error) {
            console.error('❌ Error en getMySubmission:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    async submitTask(taskId: string, data: SubmitTaskForm): Promise<ApiResponse<Submission>> {
        return this.request<Submission>(`/tasks/${taskId}/submit`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async gradeSubmission(submissionId: string, data: GradeSubmissionForm): Promise<ApiResponse<Submission>> {
        return this.request<Submission>(`/submissions/${submissionId}/grade`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ============================================
    // USUARIOS
    // ============================================

    async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
        return this.request<User>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
}

// Instancia única del servicio
export const apiService = new ApiService(API_BASE_URL);
export default apiService;
