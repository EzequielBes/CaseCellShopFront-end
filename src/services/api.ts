import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const correlationId = error.response?.headers['x-correlation-id'];
    if (correlationId) {
      error.message = `${error.message} (Trace ID: ${correlationId})`;
    }
    return Promise.reject(error);
  }
);

export default api;