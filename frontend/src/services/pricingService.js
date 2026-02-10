import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Pricing Service - handles all pricing rules (aturan harga) related API calls
 */
const pricingService = {
  /**
   * Get all pricing rules
   * @returns {Promise} Array of pricing rules
   */
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.ATURAN_HARGA.BASE);
    return response;
  },

  /**
   * Get single pricing rule by ID
   * @param {number} id - Pricing rule ID
   * @returns {Promise} Pricing rule object
   */
  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.ATURAN_HARGA.BY_ID(id));
    return response;
  },

  /**
   * Create new pricing rule (Admin only)
   * @param {Object} pricingData - Pricing rule data
   * @returns {Promise} Created pricing rule
   */
  async create(pricingData) {
    const response = await apiClient.post(API_ENDPOINTS.ATURAN_HARGA.BASE, pricingData);
    return response;
  },

  /**
   * Update existing pricing rule (Admin only)
   * @param {number} id - Pricing rule ID
   * @param {Object} pricingData - Updated pricing rule data
   * @returns {Promise} Updated pricing rule
   */
  async update(id, pricingData) {
    const response = await apiClient.put(API_ENDPOINTS.ATURAN_HARGA.BY_ID(id), pricingData);
    return response;
  },

  /**
   * Delete pricing rule (Admin only)
   * @param {number} id - Pricing rule ID
   * @returns {Promise} Delete confirmation
   */
  async delete(id) {
    const response = await apiClient.delete(API_ENDPOINTS.ATURAN_HARGA.BY_ID(id));
    return response;
  },
};

export default pricingService;
