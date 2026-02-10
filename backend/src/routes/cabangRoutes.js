const express = require('express');
const router = express.Router();
const cabangController = require('../controllers/cabangController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', cabangController.getAllCabang);
router.get('/:id', cabangController.getCabangById);

// Admin only routes
router.post('/', authenticateAdmin, cabangController.createCabang);
router.put('/:id', authenticateAdmin, cabangController.updateCabang);
router.delete('/:id', authenticateAdmin, cabangController.deleteCabang);

module.exports = router;
