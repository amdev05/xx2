const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', jadwalController.getAllJadwal);
router.get('/:id', jadwalController.getJadwalById);

// Admin only routes
router.post('/', authenticateAdmin, jadwalController.createJadwal);
router.put('/:id', authenticateAdmin, jadwalController.updateJadwal);
router.delete('/:id', authenticateAdmin, jadwalController.deleteJadwal);

module.exports = router;
