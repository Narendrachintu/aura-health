import API from './api/axios';

export const authApi = {
  async register(payload) {
    return API.post('/auth/register', payload);
  },
  async login(payload) {
    return API.post('/auth/login', payload);
  },
  async getMe() {
    return API.get('/auth/me');
  },
  async updateProfile(payload) {
    return API.put('/auth/profile', payload);
  },
};

