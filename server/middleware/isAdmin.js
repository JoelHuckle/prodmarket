// middleware/isAdmin.js
const { User } = require("../models");

/**
 * Check if user is admin
 */
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user has admin privileges
    if (!user.is_admin) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Check Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

module.exports = { isAdmin };
