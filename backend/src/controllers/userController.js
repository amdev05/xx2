const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateUserToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Register new pelanggan
 */
const register = async (req, res, next) => {
    try {
        const { email, password, nama_pelanggan } = req.body;

        // Check if pelanggan already exists
        const existingPelanggan = await prisma.pelanggan.findUnique({
            where: { email }
        });

        if (existingPelanggan) {
            return res.status(400).json(error('Email already registered.', 400));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create pelanggan
        const pelanggan = await prisma.pelanggan.create({
            data: {
                email,
                password: hashedPassword,
                nama_pelanggan
            },
            select: {
                id_pelanggan: true,
                email: true,
                nama_pelanggan: true,
                createdAt: true
            }
        });

        // Generate user token (7 days expiry, USR_ prefix)
        const token = generateUserToken(pelanggan.id_pelanggan, pelanggan.email);

        res.status(201).json(success({
            user: pelanggan,
            token
        }, 'User registered successfully.', 201));
    } catch (err) {
        next(err);
    }
};

/**
 * Login pelanggan
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find pelanggan
        const pelanggan = await prisma.pelanggan.findUnique({
            where: { email }
        });

        if (!pelanggan) {
            return res.status(401).json(error('Invalid email or password.', 401));
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, pelanggan.password);

        if (!isValidPassword) {
            return res.status(401).json(error('Invalid email or password.', 401));
        }

        // Generate user token (7 days expiry, USR_ prefix)
        const token = generateUserToken(pelanggan.id_pelanggan, pelanggan.email);

        // Return pelanggan without password
        const { password: _, ...pelangganWithoutPassword } = pelanggan;

        res.json(success({
            user: pelangganWithoutPassword,
            token
        }, 'Login successful.'));
    } catch (err) {
        next(err);
    }
};

/**
 * Get pelanggan profile
 */
const getProfile = async (req, res, next) => {
    try {
        const pelanggan = await prisma.pelanggan.findUnique({
            where: { id_pelanggan: req.user.id_pelanggan },
            select: {
                id_pelanggan: true,
                email: true,
                nama_pelanggan: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json(success(pelanggan, 'Profile retrieved successfully.'));
    } catch (err) {
        next(err);
    }
};

/**
 * Update pelanggan profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { nama_pelanggan, email } = req.body;
        const updateData = {};

        if (nama_pelanggan) updateData.nama_pelanggan = nama_pelanggan;
        if (email) updateData.email = email;

        const pelanggan = await prisma.pelanggan.update({
            where: { id_pelanggan: req.user.id_pelanggan },
            data: updateData,
            select: {
                id_pelanggan: true,
                email: true,
                nama_pelanggan: true,
                updatedAt: true
            }
        });

        res.json(success(pelanggan, 'Profile updated successfully.'));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
