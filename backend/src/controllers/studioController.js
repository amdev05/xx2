const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all studios with optional filter by cabang
 */
const getAllStudio = async (req, res) => {
    try {
        const { id_cabang } = req.query;

        const studios = await prisma.studio.findMany({
            where: {
                ...(id_cabang && { id_cabang: parseInt(id_cabang) })
            },
            include: {
                cabang: true,
                tipeStudio: true,
                _count: {
                    select: { kursis: true }
                }
            },
            orderBy: [
                { id_cabang: 'asc' },
                { no_studio: 'asc' }
            ]
        });

        res.json({
            success: true,
            data: studios
        });
    } catch (error) {
        console.error('Error fetching studios:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch studios',
            error: error.message
        });
    }
};

/**
 * Get studio by ID with seats
 */
const getStudioById = async (req, res) => {
    try {
        const { id } = req.params;

        const studio = await prisma.studio.findUnique({
            where: { id_studio: parseInt(id) },
            include: {
                cabang: true,
                tipeStudio: true,
                kursis: {
                    orderBy: [
                        { row_kursi: 'asc' },
                        { no_kursi: 'asc' }
                    ]
                }
            }
        });

        if (!studio) {
            return res.status(404).json({
                success: false,
                message: 'Studio not found'
            });
        }

        res.json({
            success: true,
            data: studio
        });
    } catch (error) {
        console.error('Error fetching studio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch studio',
            error: error.message
        });
    }
};

/**
 * Create new studio (Admin only)
 */
const createStudio = async (req, res) => {
    try {
        const { id_cabang, no_studio, id_tipe_studio, kapasitas_total } = req.body;

        // Validation
        if (!id_cabang || !no_studio || !id_tipe_studio) {
            return res.status(400).json({
                success: false,
                message: 'id_cabang, no_studio, and id_tipe_studio are required'
            });
        }

        const studio = await prisma.studio.create({
            data: {
                id_cabang: parseInt(id_cabang),
                no_studio,
                id_tipe_studio: parseInt(id_tipe_studio),
                kapasitas_total: kapasitas_total || 0
            },
            include: {
                cabang: true,
                tipeStudio: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Studio created successfully',
            data: studio
        });
    } catch (error) {
        console.error('Error creating studio:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Studio with this number already exists in this cabang'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create studio',
            error: error.message
        });
    }
};

/**
 * Update studio (Admin only)
 */
const updateStudio = async (req, res) => {
    try {
        const { id } = req.params;
        const { no_studio, id_tipe_studio, kapasitas_total } = req.body;

        const studio = await prisma.studio.update({
            where: { id_studio: parseInt(id) },
            data: {
                ...(no_studio && { no_studio }),
                ...(id_tipe_studio && { id_tipe_studio: parseInt(id_tipe_studio) }),
                ...(kapasitas_total !== undefined && { kapasitas_total })
            },
            include: {
                cabang: true,
                tipeStudio: true
            }
        });

        res.json({
            success: true,
            message: 'Studio updated successfully',
            data: studio
        });
    } catch (error) {
        console.error('Error updating studio:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Studio not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update studio',
            error: error.message
        });
    }
};

/**
 * Delete studio (Admin only)
 */
const deleteStudio = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.studio.delete({
            where: { id_studio: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Studio deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting studio:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Studio not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete studio',
            error: error.message
        });
    }
};

module.exports = {
    getAllStudio,
    getStudioById,
    createStudio,
    updateStudio,
    deleteStudio
};
