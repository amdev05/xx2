const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all aturan harga
 */
const getAllAturanHarga = async (req, res) => {
    try {
        const { id_cabang, id_tipe_studio, id_tipe_hari } = req.query;

        const aturanHargas = await prisma.aturanHarga.findMany({
            where: {
                ...(id_cabang && { id_cabang: parseInt(id_cabang) }),
                ...(id_tipe_studio && { id_tipe_studio: parseInt(id_tipe_studio) }),
                ...(id_tipe_hari && { id_tipe_hari: parseInt(id_tipe_hari) })
            },
            include: {
                cabang: true,
                tipeStudio: true,
                tipeHari: true
            },
            orderBy: [
                { id_cabang: 'asc' },
                { id_tipe_studio: 'asc' },
                { id_tipe_hari: 'asc' }
            ]
        });

        res.json({
            success: true,
            data: aturanHargas
        });
    } catch (error) {
        console.error('Error fetching aturan harga:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch aturan harga',
            error: error.message
        });
    }
};

/**
 * Get harga by specific parameters
 * This is used to get the price for a ticket based on cabang, studio type, and day type
 */
const getHargaByParams = async (req, res) => {
    try {
        const { id_cabang, id_tipe_studio, id_tipe_hari } = req.query;

        if (!id_cabang || !id_tipe_studio || !id_tipe_hari) {
            return res.status(400).json({
                success: false,
                message: 'id_cabang, id_tipe_studio, and id_tipe_hari are required'
            });
        }

        const aturanHarga = await prisma.aturanHarga.findUnique({
            where: {
                id_cabang_id_tipe_studio_id_tipe_hari: {
                    id_cabang: parseInt(id_cabang),
                    id_tipe_studio: parseInt(id_tipe_studio),
                    id_tipe_hari: parseInt(id_tipe_hari)
                }
            },
            include: {
                cabang: true,
                tipeStudio: true,
                tipeHari: true
            }
        });

        if (!aturanHarga) {
            return res.status(404).json({
                success: false,
                message: 'Pricing rule not found for these parameters'
            });
        }

        res.json({
            success: true,
            data: aturanHarga
        });
    } catch (error) {
        console.error('Error fetching harga:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch harga',
            error: error.message
        });
    }
};

/**
 * Create new aturan harga (Admin only)
 */
const createAturanHarga = async (req, res) => {
    try {
        const { id_cabang, id_tipe_studio, id_tipe_hari, harga } = req.body;

        // Validation
        if (!id_cabang || !id_tipe_studio || !id_tipe_hari || !harga) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: id_cabang, id_tipe_studio, id_tipe_hari, harga'
            });
        }

        const aturanHarga = await prisma.aturanHarga.create({
            data: {
                id_cabang: parseInt(id_cabang),
                id_tipe_studio: parseInt(id_tipe_studio),
                id_tipe_hari: parseInt(id_tipe_hari),
                harga: parseFloat(harga)
            },
            include: {
                cabang: true,
                tipeStudio: true,
                tipeHari: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Aturan Harga created successfully',
            data: aturanHarga
        });
    } catch (error) {
        console.error('Error creating aturan harga:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Pricing rule already exists for this combination'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create aturan harga',
            error: error.message
        });
    }
};

/**
 * Update aturan harga (Admin only)
 */
const updateAturanHarga = async (req, res) => {
    try {
        const { id } = req.params;
        const { harga } = req.body;

        if (!harga) {
            return res.status(400).json({
                success: false,
                message: 'harga is required'
            });
        }

        const aturanHarga = await prisma.aturanHarga.update({
            where: { id_harga: parseInt(id) },
            data: {
                harga: parseFloat(harga)
            },
            include: {
                cabang: true,
                tipeStudio: true,
                tipeHari: true
            }
        });

        res.json({
            success: true,
            message: 'Aturan Harga updated successfully',
            data: aturanHarga
        });
    } catch (error) {
        console.error('Error updating aturan harga:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Aturan Harga not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update aturan harga',
            error: error.message
        });
    }
};

/**
 * Delete aturan harga (Admin only)
 */
const deleteAturanHarga = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.aturanHarga.delete({
            where: { id_harga: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Aturan Harga deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting aturan harga:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Aturan Harga not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete aturan harga',
            error: error.message
        });
    }
};

module.exports = {
    getAllAturanHarga,
    getHargaByParams,
    createAturanHarga,
    updateAturanHarga,
    deleteAturanHarga
};
