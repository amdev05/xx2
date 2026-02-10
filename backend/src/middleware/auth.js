const { verifyAdminToken, verifyUserToken, verifyToken } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Authenticate admin using JWT with ADM_ prefix
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify it's an admin token
    if (!token.startsWith("ADM_")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin token required.",
      });
    }

    const decoded = verifyAdminToken(token);

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id_admin: decoded.id_admin },
      select: { id_admin: true, email: true, nama_admin: true },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Admin not found.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token.",
    });
  }
};

/**
 * Authenticate user using JWT with USR_ prefix
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify it's a user token
    if (!token.startsWith("USR_")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. User token required.",
      });
    }

    const decoded = verifyUserToken(token);

    // Get user from database
    const user = await prisma.pelanggan.findUnique({
      where: { id_pelanggan: decoded.id_pelanggan },
      select: { id_pelanggan: true, email: true, nama_pelanggan: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("USER AUTH ERROR:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired user token.",
    });
  }
};

/**
 * Legacy authenticate middleware for backward compatibility
 * Tries both admin and user tokens
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Try admin token first
    if (token.startsWith("ADM_")) {
      const decoded = verifyAdminToken(token);
      const admin = await prisma.admin.findUnique({
        where: { id_admin: decoded.id_admin },
        select: { id_admin: true, email: true, nama_admin: true },
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Admin not found.",
        });
      }

      req.admin = admin;
      req.user = { ...admin, role: "ADMIN" }; // For backward compatibility
      return next();
    }

    // Try user token
    if (token.startsWith("USR_")) {
      const decoded = verifyUserToken(token);
      const user = await prisma.pelanggan.findUnique({
        where: { id_pelanggan: decoded.id_pelanggan },
        select: { id_pelanggan: true, email: true, nama_pelanggan: true },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found.",
        });
      }

      req.user = { ...user, role: "USER" }; // For backward compatibility
      return next();
    }

    // Fallback to old token format (no prefix)
    const decoded = verifyToken(token);
    // Support both old (id) and new (id_pelanggan) token formats
    const userId = decoded.id_pelanggan || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format.",
      });
    }

    const user = await prisma.pelanggan.findUnique({
      where: { id_pelanggan: parseInt(userId) },
      select: { id_pelanggan: true, email: true, nama_pelanggan: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

/**
 * Legacy middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

module.exports = {
  authenticateAdmin,
  authenticateUser,
  authenticate,
  requireAdmin,
};
