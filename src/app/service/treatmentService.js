import axios from 'axios';
import API_BASE_URL from '../../utils/apiBaseUrl';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('USER');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error('Treatment auth token parse error:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const treatmentService = {
  getAllTreatments: async () => {
    const response = await apiClient.get('/treatment/list/all');
    return response.data;
  },

  getMyTreatments: async () => {
    const response = await apiClient.get('/treatment/list/my');
    return response.data;
  },

  getTreatmentById: async (id) => {
    const response = await apiClient.get(`/treatment/${id}`);
    return response.data;
  },

  updateTreatment: async (id, payload) => {
    const response = await apiClient.put(`/treatment/${id}`, payload);
    return response.data;
  },
};

export default treatmentService;
