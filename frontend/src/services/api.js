import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access denied: Insufficient permissions');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 429:
          // Too many requests
          console.error('Too many requests - please try again later');
          break;
        case 500:
          // Server error
          console.error('Server error - please try again later');
          break;
        default:
          console.error(`Request failed with status ${status}`);
      }
      
      // Create enhanced error object
      error.enhancedMessage = data?.message || 'Request failed';
      error.enhancedErrors = data?.errors || [];
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - please check your connection');
      error.enhancedMessage = 'Network error - please check your connection';
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      error.enhancedMessage = 'Request setup error';
    }
    
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
    changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
    getAllUsers: (params) => api.get('/auth/users', { params }),
    deactivateUser: (userId) => api.put(`/auth/deactivate/${userId}`),
  },

  // Policy endpoints
  policies: {
    upload: (formData) => {
      return api.post('/policy/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    getAll: (params) => api.get('/policy', { params }),
    getById: (id) => api.get(`/policy/${id}`),
    update: (id, data) => api.put(`/policy/${id}`, data),
    delete: (id) => api.delete(`/policy/${id}`),
    download: (id) => api.get(`/policy/${id}/download`, { responseType: 'blob' }),
    getStats: () => api.get('/policy/stats'),
  },

  // AI endpoints
  ai: {
    analyze: (policyId) => api.post(`/ai/analyze/${policyId}`),
    compare: (data) => api.post('/ai/compare', data),
    getInsights: (policyId) => api.get(`/ai/insights/${policyId}`),
    regenerateEmbeddings: (policyId) => api.post(`/ai/embeddings/${policyId}`),
  },

  // Chat endpoints
  chat: {
    start: (policyId) => api.post(`/chat/start/${policyId}`),
    sendMessage: (chatId, message) => api.post(`/chat/message/${chatId}`, message),
    getHistory: (params) => api.get('/chat', { params }),
    getSession: (chatId) => api.get(`/chat/${chatId}`),
    updateTitle: (chatId, title) => api.put(`/chat/${chatId}/title`, { title }),
    deleteSession: (chatId) => api.delete(`/chat/${chatId}`),
  },

  // Dashboard endpoints
  dashboard: {
    getOverview: () => api.get('/dashboard/overview'),
    getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
    getAdminAnalytics: () => api.get('/admin/analytics'),
    getUserAnalytics: () => api.get('/dashboard/user-analytics'),
    getAlerts: (params) => api.get('/dashboard/alerts', { params }),
    markAlertsRead: (policyId, alertIds) => api.put(`/dashboard/alerts/${policyId}/read`, { alertIds }),
  },

  // Admin endpoints
  admin: {
    // Users
    getAllUsers: (params) => api.get('/admin/users', { params }),
    updateUser: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
    deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    
    // Policies
    getAllPolicies: (params) => api.get('/admin/policies', { params }),
    deletePolicy: (policyId) => api.delete(`/admin/policies/${policyId}`),
    updatePolicy: (policyId, data) => api.put(`/admin/policies/${policyId}`, data),
    
    // Analytics
    getAnalytics: () => api.get('/admin/analytics'),
  },

  // Health check
  health: () => api.get('/health'),
};

export default api;
export { apiService };
