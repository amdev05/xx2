import api from "./api";

const reportService = {
  // Get revenue report
  getRevenue: async (params = {}) => {
    const response = await api.get("/reports/revenue", { params });
    return response.data;
  },

  // Get tickets sold report
  getTicketsSold: async (params = {}) => {
    const response = await api.get("/reports/tickets-sold", { params });
    return response.data;
  },

  // Get popular films report
  getPopularFilms: async (params = {}) => {
    const response = await api.get("/reports/popular-films", { params });
    return response.data;
  },
};

export default reportService;
