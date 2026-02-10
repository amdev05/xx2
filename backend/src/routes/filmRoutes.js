const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateAdmin } = require('../middleware/auth');
const {
    getAllFilms,
    getFilmById,
    createFilm,
    updateFilm,
    deleteFilm
} = require('../controllers/filmController');
const {
    getCastByFilm,
    addCast,
    updateCast,
    deleteCast
} = require('../controllers/castController');
const {
    getProductionsByFilm,
    addProduction,
    updateProduction,
    deleteProduction
} = require('../controllers/productionController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'video/mp4',
            'video/quicktime'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and MP4 are allowed.'));
        }
    }
});

// ========== FILM ROUTES ==========
// Public routes
router.get('/', getAllFilms);
router.get('/:id', getFilmById);

// Admin routes - Film CRUD with media upload
router.post(
    '/',
    authenticateAdmin,
    upload.fields([
        { name: 'poster', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
        { name: 'trailer', maxCount: 1 }
    ]),
    createFilm
);

router.put(
    '/:id',
    authenticateAdmin,
    upload.fields([
        { name: 'poster', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
        { name: 'trailer', maxCount: 1 }
    ]),
    updateFilm
);

router.delete('/:id', authenticateAdmin, deleteFilm);

// ========== CAST ROUTES ==========
router.get('/:filmId/cast', getCastByFilm);
router.post('/:filmId/cast', authenticateAdmin, upload.single('image'), addCast);
router.put('/:filmId/cast/:castId', authenticateAdmin, upload.single('image'), updateCast);
router.delete('/:filmId/cast/:castId', authenticateAdmin, deleteCast);

// ========== PRODUCTION ROUTES ==========
router.get('/:filmId/production', getProductionsByFilm);
router.post('/:filmId/production', authenticateAdmin, upload.single('image'), addProduction);
router.put('/:filmId/production/:productionId', authenticateAdmin, upload.single('image'), updateProduction);
router.delete('/:filmId/production/:productionId', authenticateAdmin, deleteProduction);

module.exports = router;
