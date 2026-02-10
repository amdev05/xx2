const express = require('express');
const router = express.Router();
const aturanHargaController = require('../controllers/aturanHargaController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', aturanHargaController.getAllAturanHarga);
router.get('/price', aturanHargaController.getHargaByParams); // GET /aturan-harga/price?id_cabang=1&id_tipe_studio=2&id_tipe_hari=1

// Admin only routes
router.post('/', authenticateAdmin, aturanHargaController.createAturanHarga);
router.put('/:id', authenticateAdmin, aturanHargaController.updateAturanHarga);
router.delete('/:id', authenticateAdmin, aturanHargaController.deleteAturanHarga);

module.exports = router;
