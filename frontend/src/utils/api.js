import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  getCurrentUser: () => api.get('/api/auth/me'),
};

export const eventsAPI = {
  getAll: (params) => api.get('/api/events', { params }),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (eventData) => api.post('/api/events', eventData),
  update: (id, eventData) => api.patch(`/api/events/${id}`, eventData),
  bookEvent: (eventId) => api.post('/api/bookings', { eventId }),
};

export const bookingsAPI = {
  getUserBookings: (params) => api.get('/api/bookings', { params }),
  cancelBooking: (bookingId) => api.delete(`/api/bookings/${bookingId}`),
};

export default api;