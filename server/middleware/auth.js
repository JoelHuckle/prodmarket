// middleware/auth.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Not authorized" });
  }
};

// ADD this new function below
const isSeller = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user || !user.is_seller) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Seller account required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Export both
module.exports = { protect, isSeller };
