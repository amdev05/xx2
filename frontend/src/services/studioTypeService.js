import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';
import { 
  transformStudioTypeFromBackend, 
  transformStudioTypeToBackend 
} from '../utils/transformers';

/**
 * Studio Type Service - handles all tipe studio related API calls
 */
const studioTypeService = {
  /**
   * Get all studio types
   * @returns {Promise} Array of studio types
   */
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.TIPE_STUDIO.BASE);
    return {
      ...response,
      data: response.data?.map(transformStudioTypeFromBackend) || [],
    };
  },

  /**
   * Get single studio type by ID
   * @param {number} id - Studio type ID
   * @returns {Promise} Studio type object
   */
  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.TIPE_STUDIO.BY_ID(id));
    return {
      ...response,
      data: transformStudioTypeFromBackend(response.data),
    };
  },

  /**
   * Create new studio type (Admin only)
   * @param {Object} typeData - Studio type data
   * @returns {Promise} Created studio type
   */
  async create(typeData) {
    const backendData = transformStudioTypeToBackend(typeData);
    const response = await apiClient.post(API_ENDPOINTS.TIPE_STUDIO.BASE, backendData);
    return {
      ...response,
      data: transformStudioTypeFromBackend(response.data),
    };
  },

  /**
   * Update existing studio type (Admin only)
   * @param {number} id - Studio type ID
   * @param {Object} typeData - Updated studio type data
   * @returns {Promise} Updated studio type
   */
  async update(id, typeData) {
    const backendData = transformStudioTypeToBackend(typeData);
    const response = await apiClient.put(API_ENDPOINTS.TIPE_STUDIO.BY_ID(id), backendData);
    return {
      ...response,
      data: transformStudioTypeFromBackend(response.data),
    };
  },

  /**
   * Delete studio type (Admin only)
   * @param {number} id - Studio type ID
   * @returns {Promise} Delete confirmation
   */
  async delete(id) {
    const response = await apiClient.delete(API_ENDPOINTS.TIPE_STUDIO.BY_ID(id));
    return response;
  },
};

export default studioTypeService;
