import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = (email, password) => api.post('/auth/login', { email, password });
export const signupUser = (name, email, password) => api.post('/auth/signup', { name, email, password });
export const fetchNearbyIncidents = (lng, lat, radius = 5000) => api.get(`/incidents/nearby?lng=${lng}&lat=${lat}&radius=${radius}`);
export const updateUserLocation = (lng, lat) => api.put('/users/location', { lng, lat });
export const updateUserSkills = (skills) => api.put('/users/skills', { skills });
export const fetchCurrentUser = () => api.get('/users/me');

export const fetchChatMessages = (incidentId, responderId) => api.get(`/incidents/${incidentId}/messages?responderId=${responderId}`);
export const fetchIncident = (incidentId) => api.get(`/incidents/${incidentId}`);
export const submitDebrief = (incidentId, data) => api.post(`/incidents/${incidentId}/debrief`, data);
export const rateResponder = (incidentId, responderId, rating) => api.patch(`/incidents/${incidentId}/responders/${responderId}/rating`, { rating });

// Admin API
export const fetchActiveIncidents = () => api.get('/admin/incidents/active');
export const fetchAnalytics = () => api.get('/admin/analytics');
export const fetchFlaggedUsers = () => api.get('/admin/flagged-users');
export const suspendUser = (userId) => api.patch(`/admin/users/${userId}/suspend`);
export const unsuspendUser = (userId) => api.patch(`/admin/users/${userId}/unsuspend`);

export default api;
