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
export const fetchChatMessages = (incidentId, responderId) => api.get(`/incidents/${incidentId}/messages?responderId=${responderId}`);

export default api;
