import API from './api/axios';

export const waterApi = {
  async list({ startDate, endDate, limit } = {}) {
    return API.get('/water', { params: { startDate, endDate, limit } });
  },
  async today() {
    return API.get('/water/today');
  },
  async stats({ days } = {}) {
    return API.get('/water/stats', { params: { days } });
  },
  async add(payload) {
    return API.post('/water', payload);
  },
  async remove(id) {
    return API.delete(`/water/${id}`);
  },
  async update(id, payload) {
    return API.put(`/water/${id}`, payload);
  },
};

