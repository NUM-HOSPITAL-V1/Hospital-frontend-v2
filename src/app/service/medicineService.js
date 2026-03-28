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
        console.error('Medicine auth token parse error:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const medicineService = {
  getAllMedicines: async () => {
    const response = await apiClient.get('/medicine/list/all');
    return response.data;
  },

  createMedicine: async (medicineData) => {
    const response = await apiClient.post('/medicine', medicineData);
    return response.data;
  },

  updateMedicine: async (id, medicineData) => {
    const response = await apiClient.put(`/medicine/${id}`, medicineData);
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await apiClient.delete(`/medicine/${id}`);
    return response.data;
  },
};

export default medicineService;
