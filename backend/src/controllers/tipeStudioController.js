const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all tipe studio
 */
const getAllTipeStudio = async (req, res) => {
    try {
        const tipeStudios = await prisma.tipeStudio.findMany({
            include: {
                _count: {
                    select: { studios: true }
                }
            },
            orderBy: {
                tipe_studio: 'asc'
            }
        });

        res.json({
            success: true,
            data: tipeStudios
        });
    } catch (error) {
        console.error('Error fetching tipe studio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tipe studio',
            error: error.message
        });
    }
};

/**
 * Create new tipe studio (Admin only)
 */
const createTipeStudio = async (req, res) => {
    try {
        const { tipe_studio, deskripsi } = req.body;

        if (!tipe_studio) {
            return res.status(400).json({
                success: false,
                message: 'tipe_studio is required'
            });
        }

        const tipeStudio = await prisma.tipeStudio.create({
            data: {
                tipe_studio,
                deskripsi
            }
        });

        res.status(201).json({
            success: true,
            message: 'Tipe Studio created successfully',
            data: tipeStudio
        });
    } catch (error) {
        console.error('Error creating tipe studio:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Tipe Studio already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create tipe studio',
            error: error.message
        });
    }
};

/**
 * Update tipe studio (Admin only)
 */
const updateTipeStudio = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipe_studio, deskripsi } = req.body;

        const updated = await prisma.tipeStudio.update({
            where: { id_tipe_studio: parseInt(id) },
            data: {
                ...(tipe_studio && { tipe_studio }),
                ...(deskripsi !== undefined && { deskripsi })
            }
        });

        res.json({
            success: true,
            message: 'Tipe Studio updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error updating tipe studio:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Tipe Studio not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update tipe studio',
            error: error.message
        });
    }
};

/**
 * Delete tipe studio (Admin only)
 */
const deleteTipeStudio = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.tipeStudio.delete({
            where: { id_tipe_studio: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Tipe Studio deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting tipe studio:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Tipe Studio not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete tipe studio',
            error: error.message
        });
    }
};

module.exports = {
    getAllTipeStudio,
    createTipeStudio,
    updateTipeStudio,
    deleteTipeStudio
};
