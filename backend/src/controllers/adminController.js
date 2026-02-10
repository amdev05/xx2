const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateAdminToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Admin login
 */
const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            return res.status(401).json(error('Invalid email or password.', 401));
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json(error('Invalid email or password.', 401));
        }

        // Generate admin token (4 hours expiry, ADM_ prefix)
        const token = generateAdminToken(admin.id_admin, admin.email);

        // Return admin without password
        const { password: _, ...adminWithoutPassword } = admin;

        res.json(success({
            admin: adminWithoutPassword,
            token
        }, 'Admin login successful.'));
    } catch (err) {
        next(err);
    }
};

/**
 * Register new admin (protected - super admin only or manual)
 */
const registerAdmin = async (req, res, next) => {
    try {
        const { email, password, nama_admin } = req.body;

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            return res.status(400).json(error('Email already registered.', 400));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await prisma.admin.create({
            data: {
                email,
                password: hashedPassword,
                nama_admin
            },
            select: {
                id_admin: true,
                email: true,
                nama_admin: true,
                createdAt: true
            }
        });

        res.status(201).json(success(admin, 'Admin registered successfully.', 201));
    } catch (err) {
        next(err);
    }
};

/**
 * Get admin profile
 */
const getAdminProfile = async (req, res, next) => {
    try {
        const admin = await prisma.admin.findUnique({
            where: { id_admin: req.admin.id_admin },
            select: {
                id_admin: true,
                email: true,
                nama_admin: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json(success(admin, 'Admin profile retrieved successfully.'));
    } catch (err) {
        next(err);
    }
};

/**
 * Update admin profile
 */
const updateAdminProfile = async (req, res, next) => {
    try {
        const { nama_admin, email } = req.body;
        const updateData = {};

        if (nama_admin) updateData.nama_admin = nama_admin;
        if (email) updateData.email = email;

        const admin = await prisma.admin.update({
            where: { id_admin: req.admin.id_admin },
            data: updateData,
            select: {
                id_admin: true,
                email: true,
                nama_admin: true,
                updatedAt: true
            }
        });

        res.json(success(admin, 'Admin profile updated successfully.'));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    loginAdmin,
    registerAdmin,
    getAdminProfile,
    updateAdminProfile
};
