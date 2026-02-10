import apiClient from "./api";
import { API_ENDPOINTS } from "../config/api";

/**
 * Auth Service - handles authentication related API calls
 */
const authService = {
  /**
   * User registration
   * @param {Object} userData - { nama, email, no_telp, password }
   * @returns {Promise} User and token
   */
  async register(userData) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    // Store token if provided
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  },

  /**
   * User login
   * @param {Object} credentials - { email, password }
   * @returns {Promise} User and token
   */
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    // Store token
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  },

  /**
   * User logout (client-side only)
   */
  logout() {
    localStorage.removeItem("token");
    // Dispatch custom event to notify components
    window.dispatchEvent(new Event("auth-change"));
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  /**
   * Get current token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem("token");
  },
};

export default authService;
