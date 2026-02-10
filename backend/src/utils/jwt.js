const jwt = require('jsonwebtoken');

/**
 * Generate admin token with ADM_ prefix
 * @param {number} adminId - Admin ID
 * @param {string} email - Admin email
 * @returns {string} Token with ADM_ prefix
 */
const generateAdminToken = (adminId, email) => {
  const token = jwt.sign(
    { id_admin: adminId, email },
    process.env.JWT_SECRET_ADMIN,
    { expiresIn: '4h' }
  );
  return `ADM_${token}`;
};

/**
 * Generate user token with USR_ prefix
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {string} Token with USR_ prefix
 */
const generateUserToken = (userId, email) => {
  const token = jwt.sign(
    { id_pelanggan: userId, email },
    process.env.JWT_SECRET_USER,
    { expiresIn: '7d' }
  );
  return `USR_${token}`;
};

/**
 * Verify admin token
 * @param {string} token - Token with or without ADM_ prefix
 * @returns {object} Decoded token payload
 */
const verifyAdminToken = (token) => {
  try {
    // Remove ADM_ prefix if present
    const cleanToken = token.startsWith('ADM_') ? token.substring(4) : token;
    return jwt.verify(cleanToken, process.env.JWT_SECRET_ADMIN);
  } catch (error) {
    throw new Error('Invalid or expired admin token');
  }
};

/**
 * Verify user token
 * @param {string} token - Token with or without USR_ prefix
 * @returns {object} Decoded token payload
 */
const verifyUserToken = (token) => {
  try {
    // Remove USR_ prefix if present
    const cleanToken = token.startsWith('USR_') ? token.substring(4) : token;
    return jwt.verify(cleanToken, process.env.JWT_SECRET_USER);
  } catch (error) {
    throw new Error('Invalid or expired user token');
  }
};

/**
 * Legacy function for backward compatibility
 * Tries to verify with both secrets
 */
const verifyToken = (token) => {
  try {
    // Try admin token first
    if (token.startsWith('ADM_')) {
      return verifyAdminToken(token);
    }
    // Try user token
    if (token.startsWith('USR_')) {
      return verifyUserToken(token);
    }
    // Fallback to old JWT_SECRET for backward compatibility
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Legacy function for backward compatibility
 */
const generateToken = (userId, email, role) => {
  if (role === 'ADMIN') {
    return generateAdminToken(userId, email);
  }
  return generateUserToken(userId, email);
};

module.exports = {
  generateAdminToken,
  generateUserToken,
  verifyAdminToken,
  verifyUserToken,
  generateToken, // Legacy
  verifyToken    // Legacy
};
