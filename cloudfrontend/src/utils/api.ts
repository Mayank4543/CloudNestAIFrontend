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
        console.log('🔄 AXIOS INTERCEPTOR triggered for:', config.url);

        // Check both localStorage and sessionStorage
        const localToken = localStorage.getItem('authToken');
        const sessionToken = sessionStorage.getItem('authToken');
        const token = localToken || sessionToken;

        console.log('🔍 Token retrieval:', {
            localToken: localToken ? 'EXISTS' : 'MISSING',
            sessionToken: sessionToken ? 'EXISTS' : 'MISSING',
            finalToken: token ? 'EXISTS' : 'MISSING',
            tokenLength: token?.length || 0,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'NONE'
        });

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`✅ AUTHORIZATION HEADER ADDED to request: ${config.url}`);
            console.log('Authorization header:', `Bearer ${token.substring(0, 20)}...`);
        } else {
            console.log(`❌ NO AUTHORIZATION HEADER added to request: ${config.url}`);
            console.log('Reason:', !token ? 'No token available' : 'No headers object');
        }

        // Log the final headers
        console.log('Final request headers:', Object.keys(config.headers || {}));

        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
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
            console.log('❌ 401 Unauthorized error for:', error.config?.url);

            // Don't redirect for AI tagging requests - let the component handle it
            const isAITaggingRequest = error.config?.url?.includes('/test-ai-tagging');

            if (!isAITaggingRequest) {
                // Clear tokens and redirect to login for other requests
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');

                // Only redirect if not already on auth pages
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
                    window.location.href = '/auth/login';
                }
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

        search: (params: { q?: string; tags?: string[]; mimetype?: string }) => {
            // Build query parameters
            const queryParams = new URLSearchParams();

            if (params.q && params.q.trim()) {
                queryParams.append('q', params.q.trim());
            }

            if (params.tags && params.tags.length > 0) {
                queryParams.append('tags', params.tags.join(','));
            }

            if (params.mimetype && params.mimetype.trim()) {
                queryParams.append('mimetype', params.mimetype.trim());
            }

            return apiClient.get<{
                success: boolean;
                message: string;
                data: Array<{
                    _id: string;
                    filename: string;
                    originalname: string;
                    mimetype: string;
                    size: number;
                    path: string;
                    userId: string;
                    isPublic: boolean;
                    tags: string[];
                    createdAt: string;
                    updatedAt: string;
                    url?: string;
                    owner?: {
                        name: string;
                        email: string;
                    };
                }>;
            }>(`/api/files/search?${queryParams.toString()}`);
        },

        // Semantic search functionality
        semanticSearch: (params: { q: string; includePublic?: boolean; limit?: number }) => {
            // Build query parameters
            const queryParams = new URLSearchParams();

            // Query is required for semantic search
            if (params.q && params.q.trim()) {
                queryParams.append('q', params.q.trim());
            } else {
                throw new Error('Search query is required for semantic search');
            }

            // Optional parameters
            if (params.includePublic !== undefined) {
                queryParams.append('includePublic', params.includePublic.toString());
            }

            if (params.limit) {
                queryParams.append('limit', params.limit.toString());
            }

            return apiClient.get<{
                success: boolean;
                message: string;
                query: string;
                data: Array<{
                    fileId: string;
                    filename: string;
                    originalname: string;
                    mimetype: string;
                    size: number;
                    path: string;
                    userId: string;
                    url: string;
                    relevanceScore: number;
                    isPublic: boolean;
                    tags: string[];
                    createdAt: string;
                    updatedAt: string;
                    r2Url?: string;
                    owner?: {
                        name: string;
                        email: string;
                    };
                }>;
            }>(`/api/semantic/search?${queryParams.toString()}`);
        },

        // Process a file for semantic search
        processFileForSearch: (fileId: string) => {
            return apiClient.post<{
                success: boolean;
                message: string;
                data: {
                    fileId: string;
                    status: string;
                };
            }>(`/api/semantic/process/${fileId}`);
        },

        // Test AI tagging functionality
        testAITagging: (data: { text: string; filename?: string }) => {
            return apiClient.post<{
                success: boolean;
                message: string;
                data: {
                    originalText: string;
                    filename: string;
                    aiTaggingResult: {
                        success: boolean;
                        tags: string[];
                        error?: string;
                    };
                };
            }>('/api/files/test-ai-tagging', data);
        },

        // Summarize file content with AI
        summarize: (fileId: string) => {
            return apiClient.post<{
                success: boolean;
                message: string;
                data: {
                    fileId: string;
                    summary: string;
                    generatedAt: string;
                };
            }>(`/api/summary/generate/${fileId}`);
        },

        // Get existing summary for a file
        getSummary: (fileId: string) => {
            return apiClient.get<{
                success: boolean;
                message: string;
                data: {
                    fileId: string;
                    summary: string;
                };
            }>(`/api/summary/${fileId}`);
        },
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
