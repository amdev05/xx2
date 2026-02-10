const express = require('express');
const router = express.Router();
const tipeStudioController = require('../controllers/tipeStudioController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', tipeStudioController.getAllTipeStudio);

// Admin only routes
router.post('/', authenticateAdmin, tipeStudioController.createTipeStudio);
router.put('/:id', authenticateAdmin, tipeStudioController.updateTipeStudio);
router.delete('/:id', authenticateAdmin, tipeStudioController.deleteTipeStudio);

module.exports = router;
