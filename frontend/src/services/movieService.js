import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';
import { 
  transformFilmFromBackend, 
  transformFilmToBackend 
} from '../utils/transformers';

/**
 * Movie Service - handles all film-related API calls
 */
const movieService = {
  /**
   * Get all films with optional filters
   * @param {Object} params - Query parameters (genre, batas_umur)
   * @returns {Promise} Array of films
   */
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FILMS.BASE, { params });
      // Transform each film from backend format
      return {
        ...response,
        data: response.data?.map(transformFilmFromBackend) || [],
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single film by ID with schedules
   * @param {number} id - Film ID
   * @returns {Promise} Film object with schedules
   */
  async getById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FILMS.BY_ID(id));
      return {
        ...response,
        data: transformFilmFromBackend(response.data),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new film (Admin only)
   * @param {Object} filmData - Film data
   * @returns {Promise} Created film
   */
  async create(filmData) {
    try {
      const backendData = transformFilmToBackend(filmData);
      const response = await apiClient.post(API_ENDPOINTS.FILMS.BASE, backendData);
      return {
        ...response,
        data: transformFilmFromBackend(response.data),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing film (Admin only)
   * @param {number} id - Film ID
   * @param {Object} filmData - Updated film data
   * @returns {Promise} Updated film
   */
  async update(id, filmData) {
    try {
      const backendData = transformFilmToBackend(filmData);
      const response = await apiClient.put(API_ENDPOINTS.FILMS.BY_ID(id), backendData);
      return {
        ...response,
        data: transformFilmFromBackend(response.data),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete film (Admin only)
   * @param {number} id - Film ID
   * @returns {Promise} Delete confirmation
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.FILMS.BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default movieService;
