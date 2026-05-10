/**
 * HTTP Service for making authenticated API requests
 * Handles token management and error handling
 */

import { toast } from "react-toastify";
import API_BASE_URL from "./apiBaseUrl";

export default httpService;

const getToken = () => {
  if (typeof window !== "undefined") {
    try {
      const userData = JSON.parse(localStorage.getItem("USER") || "{}");
      return userData.token || null;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  }
  return null;
};

const redirectToLogin = () => {
  localStorage.removeItem("USER");
  if (typeof window !== "undefined") {
    window.location.href = "/authentication/login";
  }
};

const tryRefreshToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) return false;
    const data = await response.json();
    const userData = JSON.parse(localStorage.getItem("USER") || "{}");
    userData.token = data.accessToken;
    localStorage.setItem("USER", JSON.stringify(userData));
    return true;
  } catch {
    return false;
  }
};

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin();
      return Promise.reject("Unauthorized");
    }

    if (response.status === 403) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        window.location.reload();
        return Promise.reject("Refreshed");
      }
      redirectToLogin();
      return Promise.reject("Session expired");
    }

    const error = (data && data.error) || response.statusText;
    toast.error(error);
    return Promise.reject(error);
  }

  return data;
};

/**
 * Create request options with authentication header
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} body - Request body (for POST, PUT, etc.)
 * @returns {Object} Request options for fetch API
 */
const createRequestOptions = (method, body = null) => {
  const token = getToken();
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  
  // Add authorization header if token exists
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Add request body for non-GET requests
  if (body !== null && method !== "GET") {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

/**
 * HTTP Service object with methods for API requests
 */
const httpService = {
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Promise resolved with response data
   */
  get: async (endpoint) => {
    try {
      const options = createRequestOptions("GET");
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return handleResponse(response);
    } catch (error) {
      if (error === "Refreshed" || error === "Unauthorized" || error === "Session expired") {
        return Promise.reject(error);
      }
      console.error(`GET ${endpoint} error:`, error);
      toast.error("Мэдээлэл авах үед алдаа гарлаа");
      return Promise.reject(error);
    }
  },
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} Promise resolved with response data
   */
  post: async (endpoint, data) => {
    try {
      const options = createRequestOptions("POST", data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return handleResponse(response);
    } catch (error) {
      if (error === "Refreshed" || error === "Unauthorized" || error === "Session expired") {
        return Promise.reject(error);
      }
      console.error(`POST ${endpoint} error:`, error);
      toast.error("Хүсэлт илгээх үед алдаа гарлаа");
      return Promise.reject(error);
    }
  },
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} Promise resolved with response data
   */
  put: async (endpoint, data) => {
    try {
      const options = createRequestOptions("PUT", data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return handleResponse(response);
    } catch (error) {
      if (error === "Refreshed" || error === "Unauthorized" || error === "Session expired") {
        return Promise.reject(error);
      }
      console.error(`PUT ${endpoint} error:`, error);
      toast.error("Мэдээлэл шинэчлэх үед алдаа гарлаа");
      return Promise.reject(error);
    }
  },
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Promise resolved with response data
   */
  delete: async (endpoint) => {
    try {
      const options = createRequestOptions("DELETE");
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return handleResponse(response);
    } catch (error) {
      if (error === "Refreshed" || error === "Unauthorized" || error === "Session expired") {
        return Promise.reject(error);
      }
      console.error(`DELETE ${endpoint} error:`, error);
      toast.error("Устгах үед алдаа гарлаа");
      return Promise.reject(error);
    }
  },
  
  /**
   * Authentication APIs
   */
  auth: {
    /**
     * Login with email and password
     * @param {Object} credentials - Login credentials
     * @returns {Promise} Promise resolved with login response
     */
    login: async (credentials) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Нэвтрэх үед алдаа гарлаа");
        return Promise.reject(error);
      }
    },
    
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise} Promise resolved with registration response
     */
    register: async (userData) => {
      try {
        // Choose the correct endpoint based on user type
        let endpoint = "/auth/signup/patient";
        
        if (userData.role === "Doctor") {
          endpoint = "/auth/signup/doctor";
        } else if (userData.role === "Nurse") {
          endpoint = "/auth/signup/nurse";
        } else if (userData.role === "Admin") {
          endpoint = "/auth/signup/admin";
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Бүртгүүлэх үед алдаа гарлаа");
        return Promise.reject(error);
      }
    },
  }
};
