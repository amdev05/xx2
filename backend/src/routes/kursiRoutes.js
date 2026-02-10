const express = require('express');
const router = express.Router();
const kursiController = require('../controllers/kursiController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/studio/:id_studio', kursiController.getKursiByStudio);

// Admin only routes
router.post('/bulk', authenticateAdmin, kursiController.createKursiMassive);
router.put('/studio/:id_studio/config', authenticateAdmin, kursiController.updateKursiConfiguration);
router.delete('/:id', authenticateAdmin, kursiController.deleteKursi);
router.delete('/studio/:id_studio/all', authenticateAdmin, kursiController.deleteAllKursiByStudio);

module.exports = router;
