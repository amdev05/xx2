const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all metode pembayaran (only active ones by default)
 */
const getAllMetodePembayaran = async (req, res) => {
    try {
        const { includeInactive } = req.query;

        const metodePembayarans = await prisma.metodePembayaran.findMany({
            where: {
                ...(includeInactive !== 'true' && { aktif: true })
            },
            orderBy: {
                metode_pembayaran: 'asc'
            }
        });

        res.json({
            success: true,
            data: metodePembayarans
        });
    } catch (error) {
        console.error('Error fetching metode pembayaran:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch metode pembayaran',
            error: error.message
        });
    }
};

/**
 * Create new metode pembayaran (Admin only)
 */
const createMetodePembayaran = async (req, res) => {
    try {
        const { metode_pembayaran, deskripsi, aktif } = req.body;

        if (!metode_pembayaran) {
            return res.status(400).json({
                success: false,
                message: 'metode_pembayaran is required'
            });
        }

        const metodePembayaran = await prisma.metodePembayaran.create({
            data: {
                metode_pembayaran,
                deskripsi,
                aktif: aktif !== undefined ? aktif : true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Metode Pembayaran created successfully',
            data: metodePembayaran
        });
    } catch (error) {
        console.error('Error creating metode pembayaran:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Metode Pembayaran already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create metode pembayaran',
            error: error.message
        });
    }
};

/**
 * Update metode pembayaran (Admin only)
 */
const updateMetodePembayaran = async (req, res) => {
    try {
        const { id } = req.params;
        const { metode_pembayaran, deskripsi, aktif } = req.body;

        const updated = await prisma.metodePembayaran.update({
            where: { id_metode_pembayaran: parseInt(id) },
            data: {
                ...(metode_pembayaran && { metode_pembayaran }),
                ...(deskripsi !== undefined && { deskripsi }),
                ...(aktif !== undefined && { aktif })
            }
        });

        res.json({
            success: true,
            message: 'Metode Pembayaran updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error updating metode pembayaran:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Metode Pembayaran not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update metode pembayaran',
            error: error.message
        });
    }
};

/**
 * Delete metode pembayaran (Admin only)
 */
const deleteMetodePembayaran = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.metodePembayaran.delete({
            where: { id_metode_pembayaran: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Metode Pembayaran deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting metode pembayaran:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Metode Pembayaran not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete metode pembayaran',
            error: error.message
        });
    }
};

module.exports = {
    getAllMetodePembayaran,
    createMetodePembayaran,
    updateMetodePembayaran,
    deleteMetodePembayaran
};
