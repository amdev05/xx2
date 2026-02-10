const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const {
    createOrder,
    getOrderSummary,
    processPayment,
    confirmPayment,
    getPaymentInfo,
    cancelOrder
} = require('../controllers/paymentController');

// Validation rules
const createOrderValidation = [
    body('tickets').isArray({ min: 1 }).withMessage('At least one ticket is required'),
    body('tickets.*.id_jadwal').isInt().withMessage('Valid jadwal ID is required'),
    body('tickets.*.id_kursi').isInt().withMessage('Valid kursi ID is required')
];

const processPaymentValidation = [
    body('id_order').isInt().withMessage('Valid order ID is required'),
    body('id_metode_pembayaran').isInt().withMessage('Valid payment method ID is required')
];

// All payment routes require user authentication
router.post('/order', authenticateUser, createOrderValidation, validate, createOrder);
router.get('/order/:id', authenticateUser, getOrderSummary);
router.post('/process', authenticateUser, processPaymentValidation, validate, processPayment);
router.post('/confirm/:id', authenticateUser, confirmPayment);
router.get('/info/:orderId', authenticateUser, getPaymentInfo);
router.delete('/order/:id', authenticateUser, cancelOrder);

module.exports = router;

