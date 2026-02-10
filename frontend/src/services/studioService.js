import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';
import { 
  transformStudioFromBackend, 
  transformStudioToBackend 
} from '../utils/transformers';

/**
 * Studio Service - handles all studio related API calls
 */
const studioService = {
  /**
   * Get all studios with optional cinema filter
   * @param {Object} params - Query parameters (id_cabang)
   * @returns {Promise} Array of studios
   */
  async getAll(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.STUDIOS.BASE, { params });
    return {
      ...response,
      data: response.data?.map(transformStudioFromBackend) || [],
    };
  },

  /**
   * Get single studio by ID with seats
   * @param {number} id - Studio ID
   * @returns {Promise} Studio object with seats
   */
  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.STUDIOS.BY_ID(id));
    return {
      ...response,
      data: transformStudioFromBackend(response.data),
    };
  },

  /**
   * Create new studio (Admin only)
   * @param {Object} studioData - Studio data
   * @returns {Promise} Created studio
   */
  async create(studioData) {
    const backendData = transformStudioToBackend(studioData);
    const response = await apiClient.post(API_ENDPOINTS.STUDIOS.BASE, backendData);
    return {
      ...response,
      data: transformStudioFromBackend(response.data),
    };
  },

  /**
   * Update existing studio (Admin only)
   * @param {number} id - Studio ID
   * @param {Object} studioData - Updated studio data
   * @returns {Promise} Updated studio
   */
  async update(id, studioData) {
    const backendData = transformStudioToBackend(studioData);
    const response = await apiClient.put(API_ENDPOINTS.STUDIOS.BY_ID(id), backendData);
    return {
      ...response,
      data: transformStudioFromBackend(response.data),
    };
  },

  /**
   * Delete studio (Admin only)
   * @param {number} id - Studio ID
   * @returns {Promise} Delete confirmation
   */
  async delete(id) {
    const response = await apiClient.delete(API_ENDPOINTS.STUDIOS.BY_ID(id));
    return response;
  },

  /**
   * Bulk create seats for a studio (Admin only)
   * @param {Object} seatData - { id_studio, rows, seatsPerRow }
   * @returns {Promise} Created seats confirmation
   */
  async createSeats(seatData) {
    const response = await apiClient.post(API_ENDPOINTS.KURSI.BULK, seatData);
    return response;
  },

  /**
   * Get seats for a studio
   * @param {number} studioId - Studio ID
   * @returns {Promise} Array of seats
   */
  async getSeats(studioId) {
    const response = await apiClient.get(API_ENDPOINTS.KURSI.BY_STUDIO(studioId));
    return response;
  },
};

export default studioService;
