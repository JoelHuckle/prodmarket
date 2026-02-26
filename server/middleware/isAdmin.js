// middleware/isAdmin.js
/**
 * Check if user is admin using the JWT claim (set in generateToken).
 * Must be used after the protect middleware (requires req.user).
 */
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized. Authentication required.",
    });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
  }

  next();
};

module.exports = { isAdmin };
