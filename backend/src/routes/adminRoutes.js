const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateAdmin } = require('../middleware/auth');
const {
    loginAdmin,
    registerAdmin,
    getAdminProfile,
    updateAdminProfile
} = require('../controllers/adminController');

// Validation rules
const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('nama_admin').notEmpty().withMessage('Admin name is required')
];

const updateProfileValidation = [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('nama_admin').optional().notEmpty().withMessage('Admin name cannot be empty')
];

// Public routes
router.post('/login', loginValidation, validate, loginAdmin);

// Protected routes (require admin authentication)
router.post('/register', authenticateAdmin, registerValidation, validate, registerAdmin);
router.get('/profile', authenticateAdmin, getAdminProfile);
router.put('/profile', authenticateAdmin, updateProfileValidation, validate, updateAdminProfile);

module.exports = router;
