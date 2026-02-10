// API Base URL Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/user/register",
    LOGIN: "/user/login",
    PROFILE: "/user/profile",
  },

  // Films (Movies)
  FILMS: {
    BASE: "/films",
    BY_ID: (id) => `/films/${id}`,
  },

  // Cabang (Cinemas)
  CABANG: {
    BASE: "/cabang",
    BY_ID: (id) => `/cabang/${id}`,
  },

  // Tipe Studio (Studio Types)
  TIPE_STUDIO: {
    BASE: "/tipe-studio",
    BY_ID: (id) => `/tipe-studio/${id}`,
  },

  // Studios
  STUDIOS: {
    BASE: "/studios",
    BY_ID: (id) => `/studios/${id}`,
  },

  // Kursi (Seats)
  KURSI: {
    BY_STUDIO: (studioId) => `/kursi/studio/${studioId}`,
    BULK: "/kursi/bulk",
  },

  // Jadwal (Schedules)
  JADWAL: {
    BASE: "/jadwal",
    BY_ID: (id) => `/jadwal/${id}`,
  },

  // Tipe Hari (Day Types)
  TIPE_HARI: {
    BASE: "/tipe-hari",
    BY_ID: (id) => `/tipe-hari/${id}`,
  },

  // Aturan Harga (Pricing Rules)
  ATURAN_HARGA: {
    BASE: "/aturan-harga",
    BY_ID: (id) => `/aturan-harga/${id}`,
    GET_PRICE: "/aturan-harga/price",
  },

  // Metode Pembayaran (Payment Methods)
  METODE_PEMBAYARAN: {
    BASE: "/metode-pembayaran",
    BY_ID: (id) => `/metode-pembayaran/${id}`,
  },

  // Tickets
  TICKETS: {
    BASE: "/tickets",
    BY_ID: (id) => `/tickets/${id}`,
    STATUS: (id) => `/tickets/${id}/status`,
    ORDERS: "/tickets/orders",
  },

  // Payment & Orders
  PAYMENT: {
    CREATE_ORDER: "/payment/order",
    GET_ORDER: (id) => `/payment/order/${id}`,
    PROCESS: "/payment/process",
    CONFIRM: (id) => `/payment/confirm/${id}`,
    INFO: (orderId) => `/payment/info/${orderId}`,
    CANCEL_ORDER: (id) => `/payment/order/${id}`,
  },

  // Reports
  REPORTS: {
    TICKETS_SOLD: "/reports/tickets-sold",
    REVENUE: "/reports/revenue",
    POPULAR_FILMS: "/reports/popular-films",
  },
};
