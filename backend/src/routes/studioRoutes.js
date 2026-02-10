const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', studioController.getAllStudio);
router.get('/:id', studioController.getStudioById);

// Admin only routes
router.post('/', authenticateAdmin, studioController.createStudio);
router.put('/:id', authenticateAdmin, studioController.updateStudio);
router.delete('/:id', authenticateAdmin, studioController.deleteStudio);

module.exports = router;
