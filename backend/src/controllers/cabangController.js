const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all cabang (branches)
 */
const getAllCabang = async (req, res) => {
    try {
        const cabangs = await prisma.cabang.findMany({
            include: {
                studios: {
                    include: {
                        tipeStudio: true
                    }
                },
                _count: {
                    select: { studios: true }
                }
            },
            orderBy: {
                nama_cabang: 'asc'
            }
        });

        res.json({
            success: true,
            data: cabangs
        });
    } catch (error) {
        console.error('Error fetching cabang:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cabang',
            error: error.message
        });
    }
};

/**
 * Get cabang by ID
 */
const getCabangById = async (req, res) => {
    try {
        const { id } = req.params;

        const cabang = await prisma.cabang.findUnique({
            where: { id_cabang: parseInt(id) },
            include: {
                studios: {
                    include: {
                        tipeStudio: true,
                        _count: {
                            select: { kursis: true }
                        }
                    }
                }
            }
        });

        if (!cabang) {
            return res.status(404).json({
                success: false,
                message: 'Cabang not found'
            });
        }

        res.json({
            success: true,
            data: cabang
        });
    } catch (error) {
        console.error('Error fetching cabang:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cabang',
            error: error.message
        });
    }
};

/**
 * Create new cabang (Admin only)
 */
const createCabang = async (req, res) => {
    try {
        const { nama_cabang, alamat } = req.body;

        // Validation
        if (!nama_cabang || !alamat) {
            return res.status(400).json({
                success: false,
                message: 'nama_cabang and alamat are required'
            });
        }

        const cabang = await prisma.cabang.create({
            data: {
                nama_cabang,
                alamat
            }
        });

        res.status(201).json({
            success: true,
            message: 'Cabang created successfully',
            data: cabang
        });
    } catch (error) {
        console.error('Error creating cabang:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create cabang',
            error: error.message
        });
    }
};

/**
 * Update cabang (Admin only)
 */
const updateCabang = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_cabang, alamat } = req.body;

        const cabang = await prisma.cabang.update({
            where: { id_cabang: parseInt(id) },
            data: {
                ...(nama_cabang && { nama_cabang }),
                ...(alamat && { alamat })
            }
        });

        res.json({
            success: true,
            message: 'Cabang updated successfully',
            data: cabang
        });
    } catch (error) {
        console.error('Error updating cabang:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Cabang not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update cabang',
            error: error.message
        });
    }
};

/**
 * Delete cabang (Admin only)
 */
const deleteCabang = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.cabang.delete({
            where: { id_cabang: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Cabang deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cabang:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Cabang not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete cabang',
            error: error.message
        });
    }
};

module.exports = {
    getAllCabang,
    getCabangById,
    createCabang,
    updateCabang,
    deleteCabang
};
