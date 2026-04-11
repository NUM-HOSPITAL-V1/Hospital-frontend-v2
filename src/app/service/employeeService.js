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
        console.error('Employee auth token parse error:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const employeeService = {
  getAllEmployees: async () => {
    const response = await apiClient.get('/medicalstaff');
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await apiClient.get(`/medicalstaff/${id}`);
    return response.data;
  },

  updateEmployee: async (id, payload) => {
    const response = await apiClient.put(`/medicalstaff/${id}`, payload);
    return response.data;
  },

  createEmployee: async (payload) => {
    const response = await apiClient.post(`/medicalstaff`, payload);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await apiClient.delete(`/medicalstaff/${id}`);
    return response.data;
  },
};

export default employeeService;
