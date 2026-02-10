const { PrismaClient } = require("@prisma/client");
const { success, error } = require("../utils/response");

const prisma = new PrismaClient();

/**
 * Get user's tickets
 * Returns all tickets for the authenticated user
 */
const getUserTickets = async (req, res, next) => {
  try {
    const id_pelanggan = req.user.id_pelanggan || req.user.id;

    const tickets = await prisma.tiket.findMany({
      where: { id_pelanggan: parseInt(id_pelanggan) },
      include: {
        order: {
          include: {
            pembayaran: {
              include: {
                metodePembayaran: true,
              },
            },
          },
        },
        jadwal: {
          include: {
            film: true,
            studio: {
              include: {
                cabang: true,
                tipeStudio: true,
              },
            },
          },
        },
        kursi: true,
        pelanggan: {
          select: {
            id_pelanggan: true,
            nama_pelanggan: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(success(tickets, "Tickets retrieved successfully."));
  } catch (err) {
    next(err);
  }
};

/**
 * Get ticket by ID
 * Returns detailed information for a specific ticket
 */
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const id_pelanggan = req.user.id_pelanggan || req.user.id;

    const ticket = await prisma.tiket.findUnique({
      where: { id_tiket: parseInt(id) },
      include: {
        order: {
          include: {
            pembayaran: {
              include: {
                metodePembayaran: true,
              },
            },
          },
        },
        jadwal: {
          include: {
            film: true,
            studio: {
              include: {
                cabang: true,
                tipeStudio: true,
              },
            },
          },
        },
        kursi: true,
        pelanggan: {
          select: {
            id_pelanggan: true,
            nama_pelanggan: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json(error("Ticket not found.", 404));
    }

    // Check if user owns this ticket or is admin
    if (ticket.id_pelanggan !== id_pelanggan && req.user.role !== "ADMIN") {
      return res.status(403).json(error("Access denied.", 403));
    }

    res.json(success(ticket, "Ticket retrieved successfully."));
  } catch (err) {
    next(err);
  }
};

/**
 * Get ticket status
 * Quick check for ticket status without full details
 */
const getTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.tiket.findUnique({
      where: { id_tiket: parseInt(id) },
      select: {
        id_tiket: true,
        kode_tiket: true,
        status_tiket: true,
        harga_final: true,
        waktu_pembelian: true,
        order: {
          select: {
            kode_order: true,
            status_order: true,
            grand_total: true,
            expired_at: true,
            pembayaran: {
              select: {
                status_pembayaran: true,
                metodePembayaran: {
                  select: {
                    metode_pembayaran: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json(error("Ticket not found.", 404));
    }

    res.json(success(ticket, "Ticket status retrieved successfully."));
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's orders with all tickets grouped by order
 * Shows complete transaction history
 */
const getUserOrders = async (req, res, next) => {
  try {
    // Get user ID from JWT token
    const id_pelanggan = req.user?.id_pelanggan;

    if (!id_pelanggan) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in token. Please login again.",
      });
    }

    const orders = await prisma.order.findMany({
      where: { id_pelanggan: parseInt(id_pelanggan) },
      include: {
        tikets: {
          include: {
            jadwal: {
              include: {
                film: true,
                studio: {
                  include: {
                    cabang: true,
                    tipeStudio: true,
                  },
                },
              },
            },
            kursi: true,
          },
        },
        pembayaran: {
          include: {
            metodePembayaran: true,
          },
        },
        pelanggan: {
          select: {
            id_pelanggan: true,
            nama_pelanggan: true,
            email: true,
          },
        },
      },
      orderBy: { waktu_order: "desc" },
    });

    res.json(success(orders, "Orders retrieved successfully."));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserTickets,
  getTicketById,
  getTicketStatus,
  getUserOrders,
};
