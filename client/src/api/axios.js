import axios from 'axios';

const API = axios.create({
  baseURL: 'https://aura-health-eight.onrender.com/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
