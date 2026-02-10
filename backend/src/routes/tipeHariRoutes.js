const express = require('express');
const router = express.Router();
const tipeHariController = require('../controllers/tipeHariController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', tipeHariController.getAllTipeHari);

// Admin only routes
router.post('/', authenticateAdmin, tipeHariController.createTipeHari);
router.put('/:id', authenticateAdmin, tipeHariController.updateTipeHari);
router.delete('/:id', authenticateAdmin, tipeHariController.deleteTipeHari);

module.exports = router;
