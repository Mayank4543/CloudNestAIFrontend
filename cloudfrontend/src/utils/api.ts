import axios from 'axios';

// Get the API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cloudnestaibackend.onrender.com';

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
            // Clear tokens and redirect to login
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');

            // Only redirect if not already on auth pages
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    }
);

// API endpoints
export const api = {
    // File operations
    files: {
        getAll: (params?: { page?: number; limit?: number }) =>
            apiClient.get('/api/files/', { params }),

        upload: (formData: FormData) =>
            apiClient.post('/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }),

        download: (fileId: string) =>
            `${API_BASE_URL}/api/files/download/${fileId}`,

        delete: (fileId: string) =>
            apiClient.delete(`/api/files/${fileId}`),

        getById: (fileId: string) =>
            apiClient.get(`/api/files/${fileId}`),
    },

    // Authentication
    auth: {
        login: (credentials: { email: string; password: string }) =>
            apiClient.post('/api/auth/login', credentials),

        register: (userData: { name: string; email: string; password: string }) =>
            apiClient.post('/api/auth/register', userData),

        logout: () =>
            apiClient.post('/api/auth/logout'),

        refreshToken: () =>
            apiClient.post('/api/auth/refresh'),

        getProfile: () =>
            apiClient.get('/api/auth/profile'),
    },

    // User operations
    user: {
        updateProfile: (userData: Record<string, unknown>) =>
            apiClient.put('/api/user/profile', userData),

        changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
            apiClient.put('/api/user/password', passwordData),
    },
};

// Helper functions
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
};

export const getFileType = (mimetype: string): string => {
    const parts = mimetype.split('/');
    if (parts.length > 1) {
        return parts[1].toUpperCase();
    }
    return parts[0].toUpperCase();
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getFileIcon = (mimetype: string) => {
    if (mimetype.includes('image')) {
        return 'image';
    } else if (mimetype.includes('pdf')) {
        return 'pdf';
    } else if (mimetype.includes('text') || mimetype.includes('document')) {
        return 'document';
    } else if (mimetype.includes('video')) {
        return 'video';
    } else if (mimetype.includes('audio')) {
        return 'audio';
    } else if (mimetype.includes('zip') || mimetype.includes('rar')) {
        return 'archive';
    } else {
        return 'file';
    }
};

export const getLocationPath = (path: string): string => {
    const pathParts = path.split('/');
    if (pathParts.length > 3) {
        return `/${pathParts[pathParts.length - 2]}/`;
    }
    return '/uploads/';
};

export default apiClient;
