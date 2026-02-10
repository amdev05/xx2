import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';
import { 
  transformScheduleFromBackend, 
  transformScheduleToBackend 
} from '../utils/transformers';

/**
 * Schedule Service - handles all schedule (jadwal) related API calls
 */
const scheduleService = {
  /**
   * Get all schedules with optional filters
   * @param {Object} params - Query parameters (id_cabang, id_film, tanggal, etc.)
   * @returns {Promise} Array of schedules
   */
  async getAll(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.JADWAL.BASE, { params });
    return {
      ...response,
      data: response.data?.map(transformScheduleFromBackend) || [],
    };
  },

  /**
   * Get single schedule by ID
   * @param {number} id - Schedule ID
   * @returns {Promise} Schedule object
   */
  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.JADWAL.BY_ID(id));
    return {
      ...response,
      data: transformScheduleFromBackend(response.data),
    };
  },

  /**
   * Create new schedule (Admin only)
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise} Created schedule
   */
  async create(scheduleData) {
    const backendData = transformScheduleToBackend(scheduleData);
    const response = await apiClient.post(API_ENDPOINTS.JADWAL.BASE, backendData);
    return {
      ...response,
      data: transformScheduleFromBackend(response.data),
    };
  },

  /**
   * Update existing schedule (Admin only)
   * @param {number} id - Schedule ID
   * @param {Object} scheduleData - Updated schedule data
   * @returns {Promise} Updated schedule
   */
  async update(id, scheduleData) {
    const backendData = transformScheduleToBackend(scheduleData);
    const response = await apiClient.put(API_ENDPOINTS.JADWAL.BY_ID(id), backendData);
    return {
      ...response,
      data: transformScheduleFromBackend(response.data),
    };
  },

  /**
   * Delete schedule (Admin only)
   * @param {number} id - Schedule ID
   * @returns {Promise} Delete confirmation
   */
  async delete(id) {
    const response = await apiClient.delete(API_ENDPOINTS.JADWAL.BY_ID(id));
    return response;
  },
};

export default scheduleService;
