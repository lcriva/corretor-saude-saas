import axios from 'axios';

const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api',
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    // Bypass ngrok browser warning for API calls
    config.headers['ngrok-skip-browser-warning'] = 'true';

    return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                console.error('🚨 API 401 Unauthorized - Redirecting to login');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const auth = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
};

// Leads
export const leads = {
    getAll: (params?: any) => api.get('/leads', { params }),
    getById: (id: string) => api.get(`/leads/${id}`),
    create: (data: any) => api.post('/leads', data),
    update: (id: string, data: any) => api.put(`/leads/${id}`, data),
    updateStatus: (id: string, status: string) =>
        api.patch(`/leads/${id}/status`, { status }),
    delete: (id: string) => api.delete(`/leads/${id}`),
    addInteracao: (id: string, data: any) =>
        api.post(`/leads/${id}/interacoes`, data),
};

// Propostas
export const propostas = {
    getAll: () => api.get('/propostas'),
    create: (data: any) => api.post('/propostas', data),
    enviar: (id: string) => api.patch(`/propostas/${id}/enviar`),
    aceitar: (id: string) => api.patch(`/propostas/${id}/aceitar`),
    delete: (id: string) => api.delete(`/propostas/${id}`),
};

// Dashboard
export const dashboard = {
    getStats: () => api.get('/dashboard/stats'),
    getAtividades: () => api.get('/dashboard/atividades'),
    getAlertas: () => api.get('/dashboard/alertas'),
};

export default api;