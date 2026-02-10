const { PrismaClient } = require('@prisma/client');
const { uploadFile, deleteFile } = require('../utils/supabase');
const { success, error } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Get all cast for a film
 */
const getCastByFilm = async (req, res, next) => {
    try {
        const { filmId } = req.params;

        const casts = await prisma.cast.findMany({
            where: { id_film: parseInt(filmId) },
            orderBy: { order: 'asc' }
        });

        res.json(success(casts, 'Cast retrieved successfully'));
    } catch (err) {
        next(err);
    }
};

/**
 * Add cast/crew to film with image upload
 */
const addCast = async (req, res, next) => {
    try {
        const { filmId } = req.params;
        const { name, role, type, order } = req.body;

        // Validation
        if (!name || !role) {
            return res.status(400).json(error('name and role are required', 400));
        }

        // Check if film exists
        const film = await prisma.film.findUnique({
            where: { id_film: parseInt(filmId) }
        });

        if (!film) {
            return res.status(404).json(error('Film not found', 404));
        }

        // Upload image if provided
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadFile(
                req.file.buffer,
                req.file.originalname,
                'cast-images',
                req.file.mimetype
            );
        }

        // Create cast
        const cast = await prisma.cast.create({
            data: {
                id_film: parseInt(filmId),
                name,
                role,
                type: type || 'CAST',
                order: order ? parseInt(order) : 0,
                image_url: imageUrl
            }
        });

        res.status(201).json(success(cast, 'Cast added successfully', 201));
    } catch (err) {
        next(err);
    }
};

/**
 * Update cast with optional image upload
 */
const updateCast = async (req, res, next) => {
    try {
        const { filmId, castId } = req.params;
        const { name, role, type, order } = req.body;

        // Get existing cast
        const existingCast = await prisma.cast.findFirst({
            where: {
                id_cast: parseInt(castId),
                id_film: parseInt(filmId)
            }
        });

        if (!existingCast) {
            return res.status(404).json(error('Cast not found', 404));
        }

        // Upload new image if provided
        let imageUrl = existingCast.image_url;
        if (req.file) {
            // Delete old image if exists
            if (existingCast.image_url) {
                await deleteFile(existingCast.image_url);
            }
            imageUrl = await uploadFile(
                req.file.buffer,
                req.file.originalname,
                'cast-images',
                req.file.mimetype
            );
        }

        // Update cast
        const cast = await prisma.cast.update({
            where: { id_cast: parseInt(castId) },
            data: {
                ...(name && { name }),
                ...(role && { role }),
                ...(type && { type }),
                ...(order !== undefined && { order: parseInt(order) }),
                image_url: imageUrl
            }
        });

        res.json(success(cast, 'Cast updated successfully'));
    } catch (err) {
        next(err);
    }
};

/**
 * Delete cast and associated image
 */
const deleteCast = async (req, res, next) => {
    try {
        const { filmId, castId } = req.params;

        const cast = await prisma.cast.findFirst({
            where: {
                id_cast: parseInt(castId),
                id_film: parseInt(filmId)
            }
        });

        if (!cast) {
            return res.status(404).json(error('Cast not found', 404));
        }

        // Delete image from Supabase
        if (cast.image_url) {
            await deleteFile(cast.image_url);
        }

        // Delete cast from database
        await prisma.cast.delete({
            where: { id_cast: parseInt(castId) }
        });

        res.json(success(null, 'Cast deleted successfully'));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getCastByFilm,
    addCast,
    updateCast,
    deleteCast
};
