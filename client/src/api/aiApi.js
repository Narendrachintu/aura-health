import API from './axios';

export const fetchSuggestions = () => API.get('/ai/suggestions');
