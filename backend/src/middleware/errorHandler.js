const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(400).json({
            success: false,
            message: 'A record with this value already exists.',
            error: err.meta
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Record not found.'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error.',
            errors: err.errors
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired.'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
