import API from './api/axios';

export const dashboardApi = {
  async getDashboard() {
    return API.get('/dashboard');
  },
  async getSuggestions() {
    return API.get('/dashboard/suggestions');
  },
};

