const express = require('express');
const router = express.Router();
const metodePembayaranController = require('../controllers/metodePembayaranController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', metodePembayaranController.getAllMetodePembayaran);

// Admin only routes
router.post('/', authenticateAdmin, metodePembayaranController.createMetodePembayaran);
router.put('/:id', authenticateAdmin, metodePembayaranController.updateMetodePembayaran);
router.delete('/:id', authenticateAdmin, metodePembayaranController.deleteMetodePembayaran);

module.exports = router;
