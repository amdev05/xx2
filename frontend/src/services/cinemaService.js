import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';
import { 
  transformCinemaFromBackend, 
  transformCinemaToBackend 
} from '../utils/transformers';

/**
 * Cinema Service - handles all cabang (cinema branch) related API calls
 */
const cinemaService = {
  /**
   * Get all cinemas/branches
   * @returns {Promise} Array of cinemas
   */
  async getAll() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CABANG.BASE);
      return {
        ...response,
        data: response.data?.map(transformCinemaFromBackend) || [],
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single cinema by ID with its studios
   * @param {number} id - Cinema ID
   * @returns {Promise} Cinema object with studios
   */
  async getById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CABANG.BY_ID(id));
      return {
        ...response,
        data: transformCinemaFromBackend(response.data),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new cinema (Admin only)
   * @param {Object} cinemaData - Cinema data
   * @returns {Promise} Created cinema
   */
  async create(cinemaData) {
    try {
      const backendData = transformCinemaToBackend(cinemaData);
      const response = await apiClient.post(API_ENDPOINTS.CABANG.BASE, backendData);
      return {
        ...response,
        data: transformCinemaFromBackend(response.data),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing cinema (Admin only)
   * @param {number} id - Cinema ID
   * @param {Object} cinemaData - Updated cinema data
   * @returns {Promise} Updated cinema
   */
  async update(id, cinemaData) {
    try {
      const backendData = transformCinemaToBackend(cinemaData);
      const response = await apiClient.put(API_ENDPOINTS.CABANG.BY_ID(id), backendData);
      return {
        ...response,
        data: transformCinemaFromBackend(response.data),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete cinema (Admin only)
   * @param {number} id - Cinema ID
   * @returns {Promise} Delete confirmation
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CABANG.BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default cinemaService;
