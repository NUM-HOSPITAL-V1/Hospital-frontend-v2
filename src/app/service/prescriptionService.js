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
        console.error('Prescription auth token parse error:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const prescriptionService = {
  createPrescription: async (payload) => {
    const response = await apiClient.post('/prescription/prescription', payload);
    return response.data;
  },

  createPrescribedMed: async (payload) => {
    const response = await apiClient.post('/prescription/medication', payload);
    return response.data;
  },

  createPrescribedGuide: async (payload) => {
    const response = await apiClient.post('/prescription/guide', payload);
    return response.data;
  },
};

export default prescriptionService;
