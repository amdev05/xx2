const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get user's orders (grouped by order/transaction)
router.get('/orders', ticketController.getUserOrders);

// Get user's tickets
router.get('/', ticketController.getUserTickets);

// Get ticket status (quick check)
router.get('/:id/status', ticketController.getTicketStatus);

// Get specific ticket details
router.get('/:id', ticketController.getTicketById);

// Note: Book, confirm, and cancel operations are now handled by /payment routes
// - POST /payment/order - Create order with tickets
// - POST /payment/confirm/:id - Confirm payment
// - DELETE /payment/order/:id - Cancel order

module.exports = router;


