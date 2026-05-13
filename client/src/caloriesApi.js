import API from './api/axios';

export const caloriesApi = {
  async list({ startDate, endDate, mealType, limit } = {}) {
    return API.get('/calories', { params: { startDate, endDate, mealType, limit } });
  },
  async stats({ days } = {}) {
    return API.get('/calories/stats', { params: { days } });
  },
  async add(payload) {
    return API.post('/calories', payload);
  },
  async update(id, payload) {
    return API.put(`/calories/${id}`, payload);
  },
  async remove(id) {
    return API.delete(`/calories/${id}`);
  },
};

