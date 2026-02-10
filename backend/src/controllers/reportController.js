const { PrismaClient } = require('@prisma/client');
const { success } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Get revenue report
 * Returns: total orders, revenue (without fee), total fee, grand total
 */
const getRevenue = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        // Build where clause
        const where = {
            status_order: 'PAID'  // Only paid orders
        };

        if (startDate || endDate) {
            where.waktu_order = {};
            if (startDate) {
                where.waktu_order.gte = new Date(startDate);
            }
            if (endDate) {
                where.waktu_order.lte = new Date(endDate);
            }
        }

        // Get all paid orders
        const orders = await prisma.order.findMany({
            where,
            include: {
                pembayaran: {
                    include: {
                        metodePembayaran: true
                    }
                },
                tikets: {
                    include: {
                        jadwal: {
                            include: {
                                film: true,
                                studio: {
                                    include: {
                                        cabang: true
                                    }
                                }
                            }
                        }
                    }
                },
                pelanggan: {
                    select: {
                        id_pelanggan: true,
                        nama_pelanggan: true,
                        email: true
                    }
                }
            },
            orderBy: { waktu_order: 'desc' }
        });

        // Calculate totals
        const totalOrders = orders.length;
        
        // Count total tickets from all orders
        const totalTickets = orders.reduce((sum, order) => {
            return sum + order.tikets.length;
        }, 0);
        
        const totalRevenue = orders.reduce((sum, order) => {
            return sum + parseFloat(order.total_harga);
        }, 0);
        const totalFee = orders.reduce((sum, order) => {
            return sum + parseFloat(order.biaya_layanan);
        }, 0);
        const grandTotal = orders.reduce((sum, order) => {
            return sum + parseFloat(order.grand_total);
        }, 0);

        // Group by payment method
        const revenueByMethod = orders.reduce((acc, order) => {
            if (order.pembayaran) {
                const method = order.pembayaran.metodePembayaran.metode_pembayaran;
                if (!acc[method]) {
                    acc[method] = {
                        count: 0,
                        total_revenue: 0,
                        total_fee: 0,
                        grand_total: 0
                    };
                }
                acc[method].count++;
                acc[method].total_revenue += parseFloat(order.total_harga);
                acc[method].total_fee += parseFloat(order.biaya_layanan);
                acc[method].grand_total += parseFloat(order.grand_total);
            }
            return acc;
        }, {});

        // Group by cabang
        const revenueByCabang = orders.reduce((acc, order) => {
            order.tikets.forEach(ticket => {
                const cabang = ticket.jadwal.studio.cabang.nama_cabang;
                if (!acc[cabang]) {
                    acc[cabang] = {
                        count: 0,
                        total_revenue: 0,
                        total_tickets: 0
                    };
                }
                acc[cabang].total_revenue += parseFloat(ticket.harga_final);
                acc[cabang].total_tickets++;
            });
            return acc;
        }, {});

        const report = {
            summary: {
                total_orders: totalOrders,
                total_tickets: totalTickets,              // Total tiket terjual
                total_revenue: parseFloat(totalRevenue.toFixed(2)),  // Harga tiket saja (tanpa fee)
                total_fee: parseFloat(totalFee.toFixed(2)),          // Total biaya layanan
                grand_total: parseFloat(grandTotal.toFixed(2))       // Total keseluruhan
            },
            by_payment_method: revenueByMethod,
            by_cabang: revenueByCabang
        };

        res.json(success(report, 'Revenue report retrieved successfully.'));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getRevenue
};
