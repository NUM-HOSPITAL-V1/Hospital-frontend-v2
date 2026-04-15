import axios from "axios";
import API_BASE_URL from "../../utils/apiBaseUrl";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("USER");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error("Auth token parse алдаа:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("USER");
      if (typeof window !== "undefined") {
        window.location.href = "/authentication/login";
      }
    }

    return Promise.reject(error);
  }
);

const customerService = {
  getAllCustomers: async (query = "") => {
    try {
      const response = await apiClient.get("/customer", {
        params: query ? { q: query } : {},
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch customers" };
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      const response = await apiClient.put(`/customer/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update customer" };
    }
  },

  deleteCustomer: async (id) => {
    try {
      const response = await apiClient.delete(`/customer/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to delete customer" };
    }
  },
};

export default customerService;
