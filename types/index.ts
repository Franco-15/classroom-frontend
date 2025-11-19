// Enums
export enum UserRole {
    DIRECTIVO = 'ADMIN',
    TEACHER = 'TEACHER',
    STUDENT = 'STUDENT',
}

export enum TaskStatus {
    PENDING = 'PENDING',
    SUBMITTED = 'SUBMITTED',
    GRADED = 'GRADED',
}

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    createdAt?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

// Class Types
export interface Class {
    id: string;
    name: string;
    description: string;
    code: string;
    teacherId: string;
    teacher?: User;
    subject?: string;
    createdAt: string;
    studentsCount?: number;
}

export interface ClassDetail extends Class {
    students: User[];
    announcements: Announcement[];
    materials: Material[];
    tasks: Task[];
}

// Announcement Types
export interface Announcement {
    id: string;
    classId: string;
    title: string;
    content: string;
    authorId: string;
    author?: User;
    createdAt: string;
    updatedAt: string;
}

// Material Types
export interface Material {
    id: string;
    classId: string;
    title: string;
    description?: string;
    fileUrl?: string;
    fileType?: string;
    link?: string;
    authorId: string;
    author?: User;
    createdAt: string;
}

// Task Types
export interface Task {
    id: string;
    classId: string;
    title: string;
    description: string;
    dueDate: string;
    points?: number;
    authorId: string;
    author?: User;
    createdAt: string;
    submissions?: Submission[];
    status?: TaskStatus;  // Estado de la tarea para el usuario actual
}

export interface Submission {
    id: string;
    taskId: string;
    studentId: string;
    student?: User;
    content: string;
    fileUrl?: string;
    grade?: number;
    feedback?: string;
    submittedAt: string;
    gradedAt?: string;
    status: TaskStatus;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// Form Types
export interface CreateClassForm {
    name: string;
    description: string;
    subject?: string;
}

export interface CreateTaskForm {
    title: string;
    description: string;
    dueDate: string;
    points?: number;
}

export interface SubmitTaskForm {
    content: string;
    fileUrl?: string;
}

export interface GradeSubmissionForm {
    grade: number;
    feedback?: string;
}
