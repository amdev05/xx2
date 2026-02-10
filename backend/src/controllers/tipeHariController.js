const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all tipe hari
 */
const getAllTipeHari = async (req, res) => {
    try {
        const tipeHaris = await prisma.tipeHari.findMany({
            orderBy: {
                tipe_hari: 'asc'
            }
        });

        res.json({
            success: true,
            data: tipeHaris
        });
    } catch (error) {
        console.error('Error fetching tipe hari:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tipe hari',
            error: error.message
        });
    }
};

/**
 * Create new tipe hari (Admin only)
 */
const createTipeHari = async (req, res) => {
    try {
        const { tipe_hari, deskripsi } = req.body;

        if (!tipe_hari) {
            return res.status(400).json({
                success: false,
                message: 'tipe_hari is required'
            });
        }

        const tipeHari = await prisma.tipeHari.create({
            data: {
                tipe_hari,
                deskripsi
            }
        });

        res.status(201).json({
            success: true,
            message: 'Tipe Hari created successfully',
            data: tipeHari
        });
    } catch (error) {
        console.error('Error creating tipe hari:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Tipe Hari already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create tipe hari',
            error: error.message
        });
    }
};

/**
 * Update tipe hari (Admin only)
 */
const updateTipeHari = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipe_hari, deskripsi } = req.body;

        const updated = await prisma.tipeHari.update({
            where: { id_tipe_hari: parseInt(id) },
            data: {
                ...(tipe_hari && { tipe_hari }),
                ...(deskripsi !== undefined && { deskripsi })
            }
        });

        res.json({
            success: true,
            message: 'Tipe Hari updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error updating tipe hari:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Tipe Hari not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update tipe hari',
            error: error.message
        });
    }
};

/**
 * Delete tipe hari (Admin only)
 */
const deleteTipeHari = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.tipeHari.delete({
            where: { id_tipe_hari: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Tipe Hari deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting tipe hari:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Tipe Hari not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete tipe hari',
            error: error.message
        });
    }
};

module.exports = {
    getAllTipeHari,
    createTipeHari,
    updateTipeHari,
    deleteTipeHari
};
