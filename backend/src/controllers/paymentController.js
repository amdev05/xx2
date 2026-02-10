const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Create new order with multiple tickets
 * Requires: tickets: [{ id_jadwal, id_kursi, id_tipe_hari }]
 */
const createOrder = async (req, res, next) => {
    try {
        const { tickets } = req.body;
        const id_pelanggan = req.user.id_pelanggan || req.user.id;

        // Validation
        if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
            return res.status(400).json(
                error('At least one ticket is required.', 400)
            );
        }

        // Validate each ticket
        for (const ticket of tickets) {
            if (!ticket.id_jadwal || !ticket.id_kursi) {
                return res.status(400).json(
                    error('Each ticket must have id_jadwal and id_kursi.', 400)
                );
            }
        }

        // Process tickets and calculate prices
        const ticketDetails = [];
        let total_harga = 0;

        for (const ticketReq of tickets) {
            const { id_jadwal, id_kursi } = ticketReq;

            // Get jadwal with studio info
            const jadwal = await prisma.jadwal.findUnique({
                where: { id_jadwal: parseInt(id_jadwal) },
                include: {
                    film: true,
                    studio: {
                        include: {
                            cabang: true,
                            tipeStudio: true
                        }
                    }
                }
            });

            if (!jadwal) {
                return res.status(404).json(
                    error(`Jadwal with ID ${id_jadwal} not found.`, 404)
                );
            }

            // Check if jadwal is in the future (compare UTC with UTC)
            const jadwalDate = new Date(jadwal.tanggal);
            const jadwalTime = new Date(jadwal.jam_mulai);

            // Create full datetime in UTC using Date.UTC (no timezone conversion)
            const jadwalDateTimeUTC = new Date(Date.UTC(
                jadwalDate.getUTCFullYear(),
                jadwalDate.getUTCMonth(),
                jadwalDate.getUTCDate(),
                jadwalTime.getUTCHours(),
                jadwalTime.getUTCMinutes(),
                0,
                0
            ));

            // Get current time in UTC
            const now = new Date();

            // Debug logs
            console.log('=== JADWAL VALIDATION DEBUG ===');
            console.log('Jadwal ID:', id_jadwal);
            console.log('Jadwal tanggal:', jadwal.tanggal);
            console.log('Jadwal jam_mulai:', jadwal.jam_mulai);
            console.log('Jadwal DateTime UTC:', jadwalDateTimeUTC.toISOString());
            console.log('Now UTC:', now.toISOString());
            console.log('Is past?', jadwalDateTimeUTC <= now);
            console.log('===============================');

            if (jadwalDateTimeUTC <= now) {
                return res.status(400).json(
                    error('Cannot book tickets for past schedules.', 400)
                );
            }

            // Check seat status
            const seatStatus = await prisma.statusKursi.findUnique({
                where: {
                    id_jadwal_id_kursi: {
                        id_jadwal: parseInt(id_jadwal),
                        id_kursi: parseInt(id_kursi)
                    }
                }
            });

            if (!seatStatus) {
                return res.status(404).json(
                    error(`Seat with ID ${id_kursi} not found for this schedule.`, 404)
                );
            }

            if (seatStatus.status_kursi !== 'TERSEDIA') {
                return res.status(400).json(
                    error(`Seat ${id_kursi} is ${seatStatus.status_kursi}.`, 400)
                );
            }

            // Get pricing from jadwal (already calculated in getAllJadwal)
            // We need to recalculate it here since we're in createOrder
            // Get tipe hari from tanggal
            const pricingDate = new Date(jadwal.tanggal);
            const dayOfWeek = pricingDate.getUTCDay(); // 0 = Sunday, 6 = Saturday
            
            // Determine tipe hari (1 = Weekday, 2 = Weekend, 3 = Holiday)
            // For now, we'll use simple logic: Weekend = Saturday/Sunday
            let id_tipe_hari;
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                id_tipe_hari = 2; // Weekend
            } else {
                id_tipe_hari = 1; // Weekday
            }
            
            // Get pricing based on cabang, tipe studio, and calculated tipe hari
            const aturanHarga = await prisma.aturanHarga.findUnique({
                where: {
                    id_cabang_id_tipe_studio_id_tipe_hari: {
                        id_cabang: jadwal.studio.id_cabang,
                        id_tipe_studio: jadwal.studio.id_tipe_studio,
                        id_tipe_hari: id_tipe_hari
                    }
                }
            });

            if (!aturanHarga) {
                return res.status(404).json(
                    error('Pricing rule not found for this combination.', 404)
                );
            }

            ticketDetails.push({
                id_jadwal: parseInt(id_jadwal),
                id_kursi: parseInt(id_kursi),
                harga: aturanHarga.harga,
                jadwal,
                seatStatus
            });

            total_harga += parseFloat(aturanHarga.harga);
        }

        // Calculate grand total
        const biaya_layanan = 2500;
        const grand_total = total_harga + biaya_layanan;

        // Generate unique order code
        const kode_order = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Set expiration time (15 minutes from now)
        const expired_at = new Date(Date.now() + 15 * 60 * 1000);

        // Create order and tickets in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create order
            const order = await tx.order.create({
                data: {
                    kode_order,
                    id_pelanggan: parseInt(id_pelanggan),
                    total_harga,
                    biaya_layanan,
                    grand_total,
                    status_order: 'PENDING',
                    expired_at
                }
            });

            // Create tickets and update seat status
            const createdTickets = [];
            for (const ticketDetail of ticketDetails) {
                // Update seat status to DIPESAN
                await tx.statusKursi.update({
                    where: {
                        id_jadwal_id_kursi: {
                            id_jadwal: ticketDetail.id_jadwal,
                            id_kursi: ticketDetail.id_kursi
                        }
                    },
                    data: { status_kursi: 'DIPESAN' }
                });

                // Generate unique ticket code
                const kode_tiket = `TIX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

                // Create ticket
                const ticket = await tx.tiket.create({
                    data: {
                        kode_tiket,
                        id_order: order.id_order,
                        id_jadwal: ticketDetail.id_jadwal,
                        id_kursi: ticketDetail.id_kursi,
                        id_pelanggan: parseInt(id_pelanggan),
                        harga_final: ticketDetail.harga,
                        status_tiket: 'PENDING'
                    },
                    include: {
                        jadwal: {
                            include: {
                                film: true,
                                studio: {
                                    include: {
                                        cabang: true,
                                        tipeStudio: true
                                    }
                                }
                            }
                        },
                        kursi: true
                    }
                });

                createdTickets.push(ticket);
            }

            // Get complete order with tickets
            const completeOrder = await tx.order.findUnique({
                where: { id_order: order.id_order },
                include: {
                    tikets: {
                        include: {
                            jadwal: {
                                include: {
                                    film: true,
                                    studio: {
                                        include: {
                                            cabang: true,
                                            tipeStudio: true
                                        }
                                    }
                                }
                            },
                            kursi: true
                        }
                    },
                    pelanggan: {
                        select: {
                            id_pelanggan: true,
                            nama_pelanggan: true,
                            email: true
                        }
                    }
                }
            });

            return completeOrder;
        });

        res.status(201).json(
            success(result, 'Order created successfully. Please complete payment within 15 minutes.', 201)
        );
    } catch (err) {
        next(err);
    }
};

/**
 * 
 * 
 * 
 * Get order summary by ID
 */
const getOrderSummary = async (req, res, next) => {
    try {
        const { id } = req.params;
        const id_pelanggan = req.user.id_pelanggan || req.user.id;

        const order = await prisma.order.findUnique({
            where: { id_order: parseInt(id) },
            include: {
                tikets: {
                    include: {
                        jadwal: {
                            include: {
                                film: true,
                                studio: {
                                    include: {
                                        cabang: true,
                                        tipeStudio: true
                                    }
                                }
                            }
                        },
                        kursi: true
                    }
                },
                pelanggan: {
                    select: {
                        id_pelanggan: true,
                        nama_pelanggan: true,
                        email: true
                    }
                },
                pembayaran: {
                    include: {
                        metodePembayaran: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json(error('Order not found.', 404));
        }

        // Check if user owns this order or is admin
        if (order.id_pelanggan !== id_pelanggan && req.user.role !== 'ADMIN') {
            return res.status(403).json(error('Access denied.', 403));
        }

        // Check if order is expired
        const now = new Date();
        if (order.status_order === 'PENDING' && now > new Date(order.expired_at)) {
            // Auto-expire the order
            await prisma.order.update({
                where: { id_order: parseInt(id) },
                data: { status_order: 'EXPIRED' }
            });
            order.status_order = 'EXPIRED';
        }

        res.json(success(order, 'Order summary retrieved successfully.'));
    } catch (err) {
        next(err);
    }
};

/**
 * Process payment for an order
 * Requires: id_order, id_metode_pembayaran
 */
const processPayment = async (req, res, next) => {
    try {
        const { id_order, id_metode_pembayaran } = req.body;
        const id_pelanggan = req.user.id_pelanggan || req.user.id;

        // Validation
        if (!id_order || !id_metode_pembayaran) {
            return res.status(400).json(
                error('id_order and id_metode_pembayaran are required.', 400)
            );
        }

        // Get order
        const order = await prisma.order.findUnique({
            where: { id_order: parseInt(id_order) },
            include: {
                pembayaran: true
            }
        });

        if (!order) {
            return res.status(404).json(error('Order not found.', 404));
        }

        // Check if user owns this order
        if (order.id_pelanggan !== id_pelanggan && req.user.role !== 'ADMIN') {
            return res.status(403).json(error('Access denied.', 403));
        }

        // Check if order is expired
        const now = new Date();
        if (now > new Date(order.expired_at)) {
            await prisma.order.update({
                where: { id_order: parseInt(id_order) },
                data: { status_order: 'EXPIRED' }
            });
            return res.status(400).json(error('Order has expired.', 400));
        }

        // Check if order is already paid
        if (order.status_order === 'PAID') {
            return res.status(400).json(error('Order is already paid.', 400));
        }

        // Check if payment already exists
        if (order.pembayaran) {
            return res.status(400).json(error('Payment already processed for this order.', 400));
        }

        // Get payment method
        const metodePembayaran = await prisma.metodePembayaran.findUnique({
            where: { id_metode_pembayaran: parseInt(id_metode_pembayaran) }
        });

        if (!metodePembayaran) {
            return res.status(404).json(error('Payment method not found.', 404));
        }

        if (!metodePembayaran.aktif) {
            return res.status(400).json(error('Payment method is not active.', 400));
        }

        // Generate payment information (VA number or QR code - placeholders)
        let nomor_va = null;
        let kode_qr = null;

        const metodeNama = metodePembayaran.metode_pembayaran.toLowerCase();
        if (metodeNama.includes('transfer') || metodeNama.includes('va') || metodeNama.includes('virtual')) {
            // Generate VA number (placeholder)
            nomor_va = `${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;
        } else if (metodeNama.includes('qr') || metodeNama.includes('qris')) {
            // Generate QR code data (placeholder)
            kode_qr = `QRIS-${order.kode_order}-${Date.now()}`;
        }

        // Create payment record
        const pembayaran = await prisma.pembayaran.create({
            data: {
                id_order: parseInt(id_order),
                id_metode_pembayaran: parseInt(id_metode_pembayaran),
                jumlah_dibayar: order.grand_total,
                nomor_va,
                kode_qr,
                status_pembayaran: 'PENDING'
            },
            include: {
                order: {
                    include: {
                        tikets: {
                            include: {
                                jadwal: {
                                    include: {
                                        film: true,
                                        studio: {
                                            include: {
                                                cabang: true,
                                                tipeStudio: true
                                            }
                                        }
                                    }
                                },
                                kursi: true
                            }
                        }
                    }
                },
                metodePembayaran: true
            }
        });

        res.status(201).json(
            success(pembayaran, 'Payment initiated successfully. Please complete the payment.', 201)
        );
    } catch (err) {
        next(err);
    }
};

/**
 * Confirm payment (simulate payment gateway callback)
 * Admin only or system callback
 */
const confirmPayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const pembayaran = await prisma.pembayaran.findUnique({
            where: { id_pembayaran: parseInt(id) },
            include: {
                order: {
                    include: {
                        tikets: true
                    }
                }
            }
        });

        if (!pembayaran) {
            return res.status(404).json(error('Payment not found.', 404));
        }

        // Check if payment is already confirmed
        if (pembayaran.status_pembayaran === 'SUCCESS') {
            return res.status(400).json(error('Payment is already confirmed.', 400));
        }

        // Check if order is expired
        const now = new Date();
        if (now > new Date(pembayaran.order.expired_at)) {
            return res.status(400).json(error('Order has expired.', 400));
        }

        // Update payment, order, and tickets in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update payment status
            const updatedPembayaran = await tx.pembayaran.update({
                where: { id_pembayaran: parseInt(id) },
                data: {
                    status_pembayaran: 'SUCCESS',
                    waktu_pembayaran: new Date()
                }
            });

            // Update order status
            await tx.order.update({
                where: { id_order: pembayaran.id_order },
                data: { status_order: 'PAID' }
            });

            // Update all tickets to CONFIRMED and seats to TERJUAL
            for (const ticket of pembayaran.order.tikets) {
                // Update ticket status
                await tx.tiket.update({
                    where: { id_tiket: ticket.id_tiket },
                    data: { status_tiket: 'CONFIRMED' }
                });

                // Update seat status
                await tx.statusKursi.update({
                    where: {
                        id_jadwal_id_kursi: {
                            id_jadwal: ticket.id_jadwal,
                            id_kursi: ticket.id_kursi
                        }
                    },
                    data: { status_kursi: 'TERJUAL' }
                });
            }

            return updatedPembayaran;
        });

        // Get complete payment info
        const completePembayaran = await prisma.pembayaran.findUnique({
            where: { id_pembayaran: parseInt(id) },
            include: {
                order: {
                    include: {
                        tikets: {
                            include: {
                                jadwal: {
                                    include: {
                                        film: true,
                                        studio: {
                                            include: {
                                                cabang: true,
                                                tipeStudio: true
                                            }
                                        }
                                    }
                                },
                                kursi: true
                            }
                        }
                    }
                },
                metodePembayaran: true
            }
        });

        res.json(success(completePembayaran, 'Payment confirmed successfully.'));
    } catch (err) {
        next(err);
    }
};

/**
 * Get payment information by order ID
 */
const getPaymentInfo = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const id_pelanggan = req.user.id_pelanggan || req.user.id;

        const order = await prisma.order.findUnique({
            where: { id_order: parseInt(orderId) },
            include: {
                pembayaran: {
                    include: {
                        metodePembayaran: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json(error('Order not found.', 404));
        }

        // Check if user owns this order or is admin
        if (order.id_pelanggan !== id_pelanggan && req.user.role !== 'ADMIN') {
            return res.status(403).json(error('Access denied.', 403));
        }

        if (!order.pembayaran) {
            return res.status(404).json(error('Payment not found for this order.', 404));
        }

        res.json(success(order.pembayaran, 'Payment info retrieved successfully.'));
    } catch (err) {
        next(err);
    }
};

/**
 * Cancel order (if not paid and not expired)
 */
const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const id_pelanggan = req.user.id_pelanggan || req.user.id;

        const order = await prisma.order.findUnique({
            where: { id_order: parseInt(id) },
            include: {
                tikets: true
            }
        });

        if (!order) {
            return res.status(404).json(error('Order not found.', 404));
        }

        // Check if user owns this order or is admin
        if (order.id_pelanggan !== id_pelanggan && req.user.role !== 'ADMIN') {
            return res.status(403).json(error('Access denied.', 403));
        }

        // Check if order can be cancelled
        if (order.status_order === 'PAID') {
            return res.status(400).json(error('Cannot cancel a paid order.', 400));
        }

        if (order.status_order === 'CANCELLED') {
            return res.status(400).json(error('Order is already cancelled.', 400));
        }

        // Cancel order and release seats in transaction
        await prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
                where: { id_order: parseInt(id) },
                data: { status_order: 'CANCELLED' }
            });

            // Update all tickets to CANCELLED and seats back to TERSEDIA
            for (const ticket of order.tikets) {
                await tx.tiket.update({
                    where: { id_tiket: ticket.id_tiket },
                    data: { status_tiket: 'CANCELLED' }
                });

                await tx.statusKursi.update({
                    where: {
                        id_jadwal_id_kursi: {
                            id_jadwal: ticket.id_jadwal,
                            id_kursi: ticket.id_kursi
                        }
                    },
                    data: { status_kursi: 'TERSEDIA' }
                });
            }
        });

        res.json(success(null, 'Order cancelled successfully. Seats are now available again.'));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createOrder,
    getOrderSummary,
    processPayment,
    confirmPayment,
    getPaymentInfo,
    cancelOrder
};
