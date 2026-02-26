// middleware/auth.js
const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("../utils/tokenBlacklist");

// verifies if user is logged in before allowing access to certain routes
const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // Check if token is blacklisted (revoked via logout)
    if (await isTokenBlacklisted(token)) {
      return res
        .status(401)
        .json({ success: false, error: "Token has been revoked" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Not authorized" });
  }
};

// Check if user has seller status using the JWT claim (set in generateToken)
const isSeller = (req, res, next) => {
  if (!req.user || !req.user.is_seller) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Seller account required.",
    });
  }
  next();
};

// Export both
module.exports = { protect, isSeller };
