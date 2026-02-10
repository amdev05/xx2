const { PrismaClient } = require('@prisma/client');
const { uploadFile, deleteFile } = require('../utils/supabase');
const { success, error } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Get all films with cast and production
 */
const getAllFilms = async (req, res, next) => {
    try {
        const { genre, batas_umur } = req.query;

        const films = await prisma.film.findMany({
            where: {
                ...(genre && { genre: { contains: genre } }),
                ...(batas_umur && { batas_umur })
            },
            include: {
                casts: {
                    orderBy: { order: 'asc' }
                },
                productions: true
            },
            orderBy: {
                tanggal_rilis: 'desc'
            }
        });

        res.json(success(films, 'Films retrieved successfully'));
    } catch (err) {
        next(err);
    }
};

/**
 * Get film by ID with all relations
 */
const getFilmById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const film = await prisma.film.findUnique({
            where: { id_film: parseInt(id) },
            include: {
                jadwals: {
                    include: {
                        studio: {
                            include: {
                                cabang: true,
                                tipeStudio: true
                            }
                        }
                    },
                    orderBy: {
                        tanggal: 'asc'
                    }
                },
                casts: {
                    orderBy: { order: 'asc' }
                },
                productions: true
            }
        });

        if (!film) {
            return res.status(404).json(error('Film not found', 404));
        }

        res.json(success(film, 'Film retrieved successfully'));
    } catch (err) {
        next(err);
    }
};

/**
 * Create new film with media upload
 * Expects: multipart/form-data with files and form fields
 */
const createFilm = async (req, res, next) => {
    try {
        const {
            nama_film,
            durasi,
            genre,
            batas_umur,
            synopsis,
            tanggal_rilis
        } = req.body;

        // Validation
        if (!nama_film || !durasi || !genre || !batas_umur) {
            return res.status(400).json(
                error('nama_film, durasi, genre, and batas_umur are required', 400)
            );
        }

        // Upload files to Supabase
        let posterUrl = null;
        let thumbnailUrl = null;
        let logoUrl = null;
        let trailerUrl = null;

        if (req.files?.poster) {
            const poster = req.files.poster[0];
            posterUrl = await uploadFile(
                poster.buffer,
                poster.originalname,
                'posters',
                poster.mimetype
            );
        }

        if (req.files?.thumbnail) {
            const thumbnail = req.files.thumbnail[0];
            thumbnailUrl = await uploadFile(
                thumbnail.buffer,
                thumbnail.originalname,
                'thumbnails',
                thumbnail.mimetype
            );
        }

        if (req.files?.logo) {
            const logo = req.files.logo[0];
            logoUrl = await uploadFile(
                logo.buffer,
                logo.originalname,
                'logos',
                logo.mimetype
            );
        }

        if (req.files?.trailer) {
            const trailer = req.files.trailer[0];
            trailerUrl = await uploadFile(
                trailer.buffer,
                trailer.originalname,
                'trailers',
                trailer.mimetype
            );
        }

        // Create film in database
        const film = await prisma.film.create({
            data: {
                nama_film,
                durasi: parseInt(durasi),
                genre,
                batas_umur,
                poster_url: posterUrl,
                thumbnail_url: thumbnailUrl,
                logo_url: logoUrl,
                trailer_url: trailerUrl,
                synopsis,
                tanggal_rilis: tanggal_rilis ? new Date(tanggal_rilis) : null
            },
            include: {
                casts: true,
                productions: true
            }
        });

        res.status(201).json(success(film, 'Film created successfully', 201));
    } catch (err) {
        next(err);
    }
};

/**
 * Update film with optional media upload
 */
const updateFilm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            nama_film,
            durasi,
            genre,
            batas_umur,
            synopsis,
            tanggal_rilis
        } = req.body;

        // Get existing film
        const existingFilm = await prisma.film.findUnique({
            where: { id_film: parseInt(id) }
        });

        if (!existingFilm) {
            return res.status(404).json(error('Film not found', 404));
        }

        // Upload new files if provided
        let posterUrl = existingFilm.poster_url;
        let thumbnailUrl = existingFilm.thumbnail_url;
        let logoUrl = existingFilm.logo_url;
        let trailerUrl = existingFilm.trailer_url;

        if (req.files?.poster) {
            // Delete old poster if exists
            if (existingFilm.poster_url) {
                await deleteFile(existingFilm.poster_url);
            }
            const poster = req.files.poster[0];
            posterUrl = await uploadFile(
                poster.buffer,
                poster.originalname,
                'posters',
                poster.mimetype
            );
        }

        if (req.files?.thumbnail) {
            if (existingFilm.thumbnail_url) {
                await deleteFile(existingFilm.thumbnail_url);
            }
            const thumbnail = req.files.thumbnail[0];
            thumbnailUrl = await uploadFile(
                thumbnail.buffer,
                thumbnail.originalname,
                'thumbnails',
                thumbnail.mimetype
            );
        }

        if (req.files?.logo) {
            if (existingFilm.logo_url) {
                await deleteFile(existingFilm.logo_url);
            }
            const logo = req.files.logo[0];
            logoUrl = await uploadFile(
                logo.buffer,
                logo.originalname,
                'logos',
                logo.mimetype
            );
        }

        if (req.files?.trailer) {
            if (existingFilm.trailer_url) {
                await deleteFile(existingFilm.trailer_url);
            }
            const trailer = req.files.trailer[0];
            trailerUrl = await uploadFile(
                trailer.buffer,
                trailer.originalname,
                'trailers',
                trailer.mimetype
            );
        }

        // Update film in database
        const film = await prisma.film.update({
            where: { id_film: parseInt(id) },
            data: {
                ...(nama_film && { nama_film }),
                ...(durasi && { durasi: parseInt(durasi) }),
                ...(genre && { genre }),
                ...(batas_umur && { batas_umur }),
                poster_url: posterUrl,
                thumbnail_url: thumbnailUrl,
                logo_url: logoUrl,
                trailer_url: trailerUrl,
                ...(synopsis !== undefined && { synopsis }),
                ...(tanggal_rilis && { tanggal_rilis: new Date(tanggal_rilis) })
            },
            include: {
                casts: { orderBy: { order: 'asc' } },
                productions: true
            }
        });

        res.json(success(film, 'Film updated successfully'));
    } catch (err) {
        next(err);
    }
};

/**
 * Delete film and associated media
 */
const deleteFilm = async (req, res, next) => {
    try {
        const { id } = req.params;

        const film = await prisma.film.findUnique({
            where: { id_film: parseInt(id) },
            include: {
                casts: true,
                productions: true
            }
        });

        if (!film) {
            return res.status(404).json(error('Film not found', 404));
        }

        // Delete media files from Supabase
        if (film.poster_url) await deleteFile(film.poster_url);
        if (film.thumbnail_url) await deleteFile(film.thumbnail_url);
        if (film.logo_url) await deleteFile(film.logo_url);
        if (film.trailer_url) await deleteFile(film.trailer_url);

        // Delete cast images
        for (const cast of film.casts) {
            if (cast.image_url) await deleteFile(cast.image_url);
        }

        // Delete production images
        for (const prod of film.productions) {
            if (prod.image_url) await deleteFile(prod.image_url);
        }

        // Delete film from database (cascade will delete casts and productions)
        await prisma.film.delete({
            where: { id_film: parseInt(id) }
        });

        res.json(success(null, 'Film deleted successfully'));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllFilms,
    getFilmById,
    createFilm,
    updateFilm,
    deleteFilm
};
