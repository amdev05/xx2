const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const { getRevenue } = require('../controllers/reportController');

// Report route requires admin authentication
router.get('/revenue', authenticateAdmin, getRevenue);

module.exports = router;
