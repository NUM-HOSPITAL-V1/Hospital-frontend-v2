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
        console.error('Vital auth token parse error:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const vitalService = {
  createVitalSigns: async (payload) => {
    const response = await apiClient.post('/vital/vitalsigns', payload);
    return response.data;
  },

  getPatientVitalSigns: async (patientId, limit = 0) => {
    const response = await apiClient.get(`/vital/patient/${patientId}/vitalsigns`, {
      params: limit ? { limit } : {},
    });
    return response.data;
  },

  getPatientLatestVitalSigns: async (patientId) => {
    const response = await apiClient.get(`/vital/patient/${patientId}/vitalsigns/latest`);
    return response.data;
  },

  getMyRecordedVitalSigns: async (limit = 0) => {
    const response = await apiClient.get('/vital/vitalsigns/my/recorded-by-staff', {
      params: limit ? { limit } : {},
    });
    return response.data;
  },
};

export default vitalService;
