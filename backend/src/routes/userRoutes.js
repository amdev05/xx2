const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
    register,
    login,
    getProfile,
    updateProfile
} = require('../controllers/userController');

// Validation rules
const registerValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('nama_pelanggan').notEmpty().withMessage('Name is required')
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];




// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
