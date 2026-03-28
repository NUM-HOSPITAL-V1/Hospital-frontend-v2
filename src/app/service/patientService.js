// src/services/patientService.js

import axios from 'axios';
import API_BASE_URL from "../../utils/apiBaseUrl";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in all requests
apiClient.interceptors.request.use(
    (config) => {
      const storedUser = localStorage.getItem("USER");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const token = parsedUser.token;
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Auth token parse алдаа:", error);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.message);
    
    // Handle unauthorized errors (redirect to login)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('USER');
      if (typeof window !== 'undefined') {
        window.location.href = '/authentication/login';
      }
    }
    return Promise.reject(error);
  }
);

const patientService = {
  // Get all patients (for medical staff and admin)
  getAllPatients: async () => {
    try {
      console.log('Fetching patients...');
      const response = await apiClient.get('/patient/view');
      console.log('Patients fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to fetch patients' };
    }
  },

  // Create a new patient (adapted for the customer registration)
  createPatient: async (patientData) => {
    try {
      console.log('Creating patient with data:', patientData);
      const response = await apiClient.post('/auth/signup/patient', {
        ...patientData,
        role: 'Patient'
      });
      console.log('Patient created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to create patient' };
    }
  },

  // Update a patient
  updatePatient: async (id, patientData) => {
    try {
      console.log(`Updating patient ${id} with data:`, patientData);
      const response = await apiClient.put(`/patient/${id}`, patientData);
      console.log('Patient updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to update patient' };
    }
  },

  // Delete a patient
  deletePatient: async (id) => {
    try {
      console.log(`Deleting patient ${id}`);
      const response = await apiClient.delete(`/patient/${id}`);
      console.log('Patient deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to delete patient' };
    }
  },

  // Get patient's own examinations (for patients)
  getOwnExaminations: async () => {
    try {
      const response = await apiClient.get('/patient/examinations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch examinations' };
    }
  },

  // Get patient's own profile (for patients)
  getOwnProfile: async () => {
    try {
      const response = await apiClient.get('/patient/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch profile' };
    }
  },

  // Get patient's allergies
  getPatientAllergies: async (patientId) => {
    try {
      const response = await apiClient.get(`/allergy/patient/allergy/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch allergies' };
    }
  },

  // Patient-specific allergy management
  getMyAllergies: async () => {
    try {
      const response = await apiClient.get('/allergy/my/allergies');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch allergies' };
    }
  },

  createMyAllergy: async (allergyData) => {
    try {
      const response = await apiClient.post('/allergy/my/allergies', allergyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create allergy' };
    }
  },

  updateMyAllergy: async (id, allergyData) => {
    try {
      const response = await apiClient.put(`/allergy/my/allergies/${id}`, allergyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update allergy' };
    }
  },

  deleteMyAllergy: async (id) => {
    try {
      const response = await apiClient.delete(`/allergy/my/allergies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete allergy' };
    }
  },

  // Authentication
  login: async (credentials) => {
    try {
      console.log('Logging in with credentials:', credentials);
      
      // Support both phone and email login
      const endpoint = '/auth/signin';
      
      const response = await apiClient.post(endpoint, credentials);
      console.log('Login successful:', response.data);
      
      // Store token and user data in localStorage
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem(
          'USER',
          JSON.stringify({
            token: response.data.accessToken,
            user: response.data.user,
          })
        );
        console.log('Token and user stored in localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to login' };
    }
  },

  logout: () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default patientService;
