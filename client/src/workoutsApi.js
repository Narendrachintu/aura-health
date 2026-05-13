import API from './api/axios';

export const workoutsApi = {
  async list({ startDate, endDate, type, limit } = {}) {
    return API.get('/workouts', { params: { startDate, endDate, type, limit } });
  },
  async stats({ days } = {}) {
    return API.get('/workouts/stats', { params: { days } });
  },
  async add(payload) {
    return API.post('/workouts', payload);
  },
  async update(id, payload) {
    return API.put(`/workouts/${id}`, payload);
  },
  async remove(id) {
    return API.delete(`/workouts/${id}`);
  },
};

