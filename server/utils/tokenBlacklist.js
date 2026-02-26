/**
 * Database-backed token blacklist.
 * Persists across server restarts and works across multiple instances.
 * Uses the TokenBlacklist Sequelize model with an expires_at column.
 */

const { Op } = require("sequelize");

// Lazy-load to avoid circular dependency at startup
const getModel = () => require("../models").TokenBlacklist;

/**
 * Add token to blacklist (called on logout).
 * @param {string} token - JWT access token
 * @param {number} expiresIn - Seconds until the token naturally expires
 */
const blacklistToken = async (token, expiresIn = 900) => {
  const TokenBlacklist = getModel();
  const expires_at = new Date(Date.now() + expiresIn * 1000);
  await TokenBlacklist.create({ token, expires_at });
};

/**
 * Check whether a token has been blacklisted.
 * @param {string} token - JWT access token
 * @returns {Promise<boolean>}
 */
const isTokenBlacklisted = async (token) => {
  const TokenBlacklist = getModel();
  const entry = await TokenBlacklist.findOne({
    where: {
      token,
      expires_at: { [Op.gt]: new Date() },
    },
  });
  return entry !== null;
};

/**
 * Delete all expired entries (run periodically to keep the table small).
 */
const cleanupExpiredTokens = async () => {
  const TokenBlacklist = getModel();
  await TokenBlacklist.destroy({
    where: { expires_at: { [Op.lte]: new Date() } },
  });
};

// Run cleanup every 15 minutes
setInterval(cleanupExpiredTokens, 15 * 60 * 1000);

module.exports = { blacklistToken, isTokenBlacklisted, cleanupExpiredTokens };
