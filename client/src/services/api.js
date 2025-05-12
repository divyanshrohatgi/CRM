import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: () => `${process.env.REACT_APP_API_URL}/api/auth/google`,
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

// Customer API
export const customerAPI = {
  getCustomers: (params) => api.get('/api/customers', { params }),
  getCustomer: (id) => api.get(`/api/customers/${id}`),
  createCustomer: (data) => api.post('/api/customers', data),
  updateCustomer: (id, data) => api.put(`/api/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/api/customers/${id}`),
  bulkCreateCustomers: (data) => api.post('/api/customers/bulk', data),
};

// Segment API
export const segmentAPI = {
  getSegments: (params) => api.get('/api/segments', { params }),
  getSegment: (id) => api.get(`/api/segments/${id}`),
  createSegment: (data) => api.post('/api/segments', data),
  updateSegment: (id, data) => api.put(`/api/segments/${id}`, data),
  deleteSegment: (id) => api.delete(`/api/segments/${id}`),
  previewSegment: (data) => api.post('/api/segments/preview', data),
};

// Campaign API
export const campaignAPI = {
  getCampaigns: (params) => api.get('/api/campaigns', { params }),
  getCampaign: (id) => api.get(`/api/campaigns/${id}`),
  createCampaign: (data) => api.post('/api/campaigns', data),
  updateCampaign: (id, data) => api.put(`/api/campaigns/${id}`, data),
  deleteCampaign: (id) => api.delete(`/api/campaigns/${id}`),
  getCampaignStats: (id) => api.get(`/api/campaigns/${id}/stats`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

// AI API
export const aiAPI = {
  segmentRules: (prompt) => api.post('/api/ai/segment-rules', { prompt }),
  messageSuggestions: (objective, audience) => api.post('/api/ai/message-suggestions', { objective, audience }),
};

export default api; 