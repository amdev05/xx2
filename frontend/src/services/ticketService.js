import apiClient from "./api";
import { API_ENDPOINTS } from "../config/api";

/**
 * Ticket Service
 * Handles all API calls related to tickets
 */

const ticketService = {
  /**
   * Get all tickets for the current user
   */
  getUserTickets: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.BASE);
    return response.data;
  },

  /**
   * Get a specific ticket by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.TICKETS.BASE}/${id}`);
    return response.data;
  },

  /**
   * Get ticket status
   */
  getTicketStatus: async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.TICKETS.BASE}/${id}/status`);
    return response.data;
  },

  /**
   * Get user orders
   */
  getUserOrders: async () => {
    const response = await apiClient.get("/tickets/orders");
    return response; // response is already { success, data } from interceptor
  },

  /**
   * Create a new booking/order
   */
  createBooking: async (bookingData) => {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.BASE, bookingData);
    return response.data;
  },

  /**
   * Cancel a ticket
   */
  cancelTicket: async (id) => {
    const response = await apiClient.put(`${API_ENDPOINTS.TICKETS.BASE}/${id}/cancel`);
    return response.data;
  },

  /**
   * Get schedule details by ID (includes seat availability)
   */
  getJadwalById: async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.JADWAL.BASE}/${id}`);
    return response.data;
  },

  /**
   * Create a new order with selected tickets
   * @param {Object} orderData - { tickets: [{ id_jadwal, id_kursi }] }
   */
  createOrder: async (orderData) => {
    const response = await apiClient.post("/payment/order", orderData);
    return response; // response is already { success, data } from interceptor
  },

  /**
   * Process payment for an order
   * @param {Object} paymentData - { id_order, id_metode_pembayaran }
   */
  processPayment: async (paymentData) => {
    const response = await apiClient.post("/payment/process", paymentData);
    return response; // response is already { success, data } from interceptor
  },

  /**
   * Confirm payment (Simulation)
   */
  confirmPayment: async (paymentId) => {
    const response = await apiClient.post(`/payment/confirm/${paymentId}`);
    return response; // response is already { success, data } from interceptor
  },

  /**
   * Get all payment methods
   */
  getPaymentMethods: async () => {
    const response = await apiClient.get(API_ENDPOINTS.METODE_PEMBAYARAN.BASE);
    return response; // response is already { success, data } from interceptor
  },
};

export default ticketService;

// Named exports for backward compatibility
export const getUserTickets = ticketService.getUserTickets;
export const getTicketById = ticketService.getById;
export const getTicketStatus = ticketService.getTicketStatus;
export const getUserOrders = ticketService.getUserOrders;
export const createBooking = ticketService.createBooking;
export const cancelTicket = ticketService.cancelTicket;
export const getJadwalById = ticketService.getJadwalById;
export const createOrder = ticketService.createOrder;
export const processPayment = ticketService.processPayment;
export const confirmPayment = ticketService.confirmPayment;
export const getPaymentMethods = ticketService.getPaymentMethods;
