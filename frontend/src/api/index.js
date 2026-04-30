import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Workers
export const workersAPI = {
  getAll: (params) => api.get('/workers', { params }),
  getById: (id) => api.get(`/workers/${id}`),
  getSkills: () => api.get('/workers/skills'),
  getReputation: (id) => api.get(`/workers/${id}/reputation`),
};

// Jobs
export const jobsAPI = {
  getMyJobs: () => api.get('/jobs'),
  createJob: (data) => api.post('/jobs', data),
  getById: (id) => api.get(`/jobs/${id}`),
  verifyQR: (token) => api.get(`/jobs/verify/${token}`),
};

// Reviews
export const reviewsAPI = {
  submit: (qrToken, data) => api.post(`/reviews/${qrToken}`, data),
  getWorkerReviews: (workerId, params) => api.get(`/reviews/worker/${workerId}`, { params }),
};

// Portfolio
export const portfolioAPI = {
  getMy: () => api.get('/portfolio/me'),
  update: (data) => api.put('/portfolio/me', data),
  addImage: (formData) => api.post('/portfolio/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (imageId) => api.delete(`/portfolio/images/${imageId}`),
  addCertification: (formData) => api.post('/portfolio/certifications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitID: (formData) => api.post('/portfolio/verify-id', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Bookings
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getWorkerBookings: () => api.get('/bookings/worker'),
  getById: (id) => api.get(`/bookings/${id}`),
  respond: (id, action, rejectionReason) => api.patch(`/bookings/${id}/respond`, { action, rejectionReason }),
  startJob: (id) => api.patch(`/bookings/${id}/start`),
  markCompleted: (id) => api.patch(`/bookings/${id}/complete`),
  pay: (id, data) => api.patch(`/bookings/${id}/pay`, data),
  confirmPayment: (id) => api.patch(`/bookings/${id}/confirm`),
  submitReview: (id, data) => api.post(`/bookings/${id}/review`, data),
};
