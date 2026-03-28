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
        console.error('Examination auth token parse error:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const examinationService = {
  createExamination: async (payload) => {
    const response = await apiClient.post('/examination', payload);
    return response.data;
  },

  getAllExaminations: async () => {
    const response = await apiClient.get('/examination/list/all');
    return response.data;
  },

  getMyExaminations: async () => {
    const response = await apiClient.get('/examination/doctor/my-examinations');
    return response.data;
  },

  updateExamination: async (id, payload) => {
    const response = await apiClient.put(`/examination/${id}`, payload);
    return response.data;
  },

  deleteExamination: async (id) => {
    const response = await apiClient.delete(`/examination/${id}`);
    return response.data;
  },
};

export default examinationService;
