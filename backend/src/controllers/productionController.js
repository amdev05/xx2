const { PrismaClient } = require('@prisma/client');
const { uploadFile, deleteFile } = require('../utils/supabase');
const { success, error } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Get all productions for a film
 */
const getProductionsByFilm = async (req, res, next) => {
    try {
        const { filmId } = req.params;

        const productions = await prisma.production.findMany({
            where: { id_film: parseInt(filmId) }
        });

        res.json(success(productions, 'Productions retrieved successfully'));
    } catch (err) {
        next(err);
    }
};

/**
 * Add production company to film with logo upload
 */
const addProduction = async (req, res, next) => {
    try {
        const { filmId } = req.params;
        const { name } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json(error('name is required', 400));
        }

        // Check if film exists
        const film = await prisma.film.findUnique({
            where: { id_film: parseInt(filmId) }
        });

        if (!film) {
            return res.status(404).json(error('Film not found', 404));
        }

        // Upload logo if provided
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadFile(
                req.file.buffer,
                req.file.originalname,
                'production-logos',
                req.file.mimetype
            );
        }

        // Create production
        const production = await prisma.production.create({
            data: {
                id_film: parseInt(filmId),
                name,
                image_url: imageUrl
            }
        });

        res.status(201).json(success(production, 'Production added successfully', 201));
    } catch (err) {
        next(err);
    }
};

/**
 * Update production with optional logo upload
 */
const updateProduction = async (req, res, next) => {
    try {
        const { filmId, productionId } = req.params;
        const { name } = req.body;

        // Get existing production
        const existingProduction = await prisma.production.findFirst({
            where: {
                id_production: parseInt(productionId),
                id_film: parseInt(filmId)
            }
        });

        if (!existingProduction) {
            return res.status(404).json(error('Production not found', 404));
        }

        // Upload new logo if provided
        let imageUrl = existingProduction.image_url;
        if (req.file) {
            // Delete old logo if exists
            if (existingProduction.image_url) {
                await deleteFile(existingProduction.image_url);
            }
            imageUrl = await uploadFile(
                req.file.buffer,
                req.file.originalname,
                'production-logos',
                req.file.mimetype
            );
        }

        // Update production
        const production = await prisma.production.update({
            where: { id_production: parseInt(productionId) },
            data: {
                ...(name && { name }),
                image_url: imageUrl
            }
        });

        res.json(success(production, 'Production updated successfully'));
    } catch (err) {
        next(err);
    }
};

/**
 * Delete production and associated logo
 */
const deleteProduction = async (req, res, next) => {
    try {
        const { filmId, productionId } = req.params;

        const production = await prisma.production.findFirst({
            where: {
                id_production: parseInt(productionId),
                id_film: parseInt(filmId)
            }
        });

        if (!production) {
            return res.status(404).json(error('Production not found', 404));
        }

        // Delete logo from Supabase
        if (production.image_url) {
            await deleteFile(production.image_url);
        }

        // Delete production from database
        await prisma.production.delete({
            where: { id_production: parseInt(productionId) }
        });

        res.json(success(null, 'Production deleted successfully'));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getProductionsByFilm,
    addProduction,
    updateProduction,
    deleteProduction
};
