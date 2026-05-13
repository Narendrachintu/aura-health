import API from './api/axios';

export const sleepApi = {
  async list({ startDate, endDate, limit } = {}) {
    return API.get('/sleep', { params: { startDate, endDate, limit } });
  },
  async stats({ days } = {}) {
    return API.get('/sleep/stats', { params: { days } });
  },
  async add(payload) {
    return API.post('/sleep', payload);
  },
  async update(id, payload) {
    return API.put(`/sleep/${id}`, payload);
  },
  async remove(id) {
    return API.delete(`/sleep/${id}`);
  },
};

