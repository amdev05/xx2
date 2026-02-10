require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const filmRoutes = require('./routes/filmRoutes');
const cabangRoutes = require('./routes/cabangRoutes');
const tipeStudioRoutes = require('./routes/tipeStudioRoutes');
const studioRoutes = require('./routes/studioRoutes');
const kursiRoutes = require('./routes/kursiRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const tipeHariRoutes = require('./routes/tipeHariRoutes');
const aturanHargaRoutes = require('./routes/aturanHargaRoutes');
const metodePembayaranRoutes = require('./routes/metodePembayaranRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Cinema Management API is running',
        version: '2.0.0',
        endpoints: {
            admin: '/admin',
            user: '/user',
            films: '/films',
            cabang: '/cabang',
            tipeStudio: '/tipe-studio',
            studios: '/studios',
            kursi: '/kursi',
            jadwal: '/jadwal',
            tipeHari: '/tipe-hari',
            aturanHarga: '/aturan-harga',
            metodePembayaran: '/metode-pembayaran',
            tickets: '/tickets',
            payment: '/payment',
            reports: '/reports'
        }
    });
});

// API Routes
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/films', filmRoutes);
app.use('/cabang', cabangRoutes);
app.use('/tipe-studio', tipeStudioRoutes);
app.use('/studios', studioRoutes);
app.use('/kursi', kursiRoutes);
app.use('/jadwal', jadwalRoutes);
app.use('/tipe-hari', tipeHariRoutes);
app.use('/aturan-harga', aturanHargaRoutes);
app.use('/metode-pembayaran', metodePembayaranRoutes);
app.use('/tickets', ticketRoutes);
app.use('/payment', paymentRoutes);
app.use('/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {

    console.log(`\n🎬 Cinema Management API Server v2.0`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📚 API Endpoints:`);
    console.log(`   Health Check:    GET http://localhost:${PORT}/`);
    console.log(`   Admin Auth:      POST http://localhost:${PORT}/admin/login`);
    console.log(`   User Auth:       POST http://localhost:${PORT}/user/register`);
    console.log(`   Films:           GET http://localhost:${PORT}/films`);
    console.log(`   Cabang:          GET http://localhost:${PORT}/cabang`);
    console.log(`   Tipe Studio:     GET http://localhost:${PORT}/tipe-studio`);
    console.log(`   Studios:         GET http://localhost:${PORT}/studios`);
    console.log(`   Kursi:           GET http://localhost:${PORT}/kursi/studio/:id_studio`);
    console.log(`   Jadwal:          GET http://localhost:${PORT}/jadwal`);
    console.log(`   Tipe Hari:       GET http://localhost:${PORT}/tipe-hari`);
    console.log(`   Aturan Harga:    GET http://localhost:${PORT}/aturan-harga`);
    console.log(`   Metode Bayar:    GET http://localhost:${PORT}/metode-pembayaran`);
    console.log(`   Tickets:         POST http://localhost:${PORT}/tickets/book`);
    console.log(`   Payment:         POST http://localhost:${PORT}/payment/order`);
    console.log(`   Reports:         GET http://localhost:${PORT}/reports/tickets-sold`);
    console.log(`\n⚡ Ready to accept requests!\n`);
});

module.exports = app;

