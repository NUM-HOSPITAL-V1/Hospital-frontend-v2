import API_BASE_URL from "./apiBaseUrl";

/**
 * API client for making authenticated requests
 */
const apiClient = {
  /**
   * Get the authentication token from local storage
   */
  getToken: () => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('USER') || '{}');
      return user.token;
    }
    return null;
  },

  /**
   * Get authentication headers for requests
   */
  getHeaders: (additionalHeaders = {}) => {
    const token = apiClient.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  /**
   * Make a GET request
   */
  get: async (endpoint, additionalHeaders = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: apiClient.getHeaders(additionalHeaders),
      });

      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('USER');
          window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/authentication/login`;
        }
        throw new Error('Unauthorized');
      }

      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  /**
   * Make a POST request
   */
  post: async (endpoint, data, additionalHeaders = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: apiClient.getHeaders(additionalHeaders),
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('USER');
          window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/authentication/login`;
        }
        throw new Error('Unauthorized');
      }

      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  put: async (endpoint, data, additionalHeaders = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: apiClient.getHeaders(additionalHeaders),
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('USER');
          window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/authentication/login`;
        }
        throw new Error('Unauthorized');
      }

      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  delete: async (endpoint, additionalHeaders = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: apiClient.getHeaders(additionalHeaders),
      });

      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('USER');
          window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/authentication/login`;
        }
        throw new Error('Unauthorized');
      }

      return await response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  },

  /**
   * Authentication methods
   */
  auth: {
    login: async (credentials) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Нэвтрэхэд алдаа гарлаа!');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    register: async (userData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signup/patient`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Бүртгэлд алдаа гарлаа!');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
  },
};

export default apiClient;
