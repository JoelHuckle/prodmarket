// controllers/authController.js
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      is_seller: user.is_seller,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// @desc    Login/Register with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Google token is required",
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (user) {
      // User exists - update Google ID and avatar if needed
      if (!user.google_id) {
        user.google_id = googleId;
      }
      if (!user.avatar_url && picture) {
        user.avatar_url = picture;
      }
      await user.save();
    } else {
      // Create new user
      // Generate username from email or name
      let username = email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      // Ensure username is unique
      let usernameExists = await User.findOne({ where: { username } });
      let counter = 1;
      while (usernameExists) {
        username = `${email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")}${counter}`;
        usernameExists = await User.findOne({ where: { username } });
        counter++;
      }

      user = await User.create({
        email,
        username,
        display_name: name,
        google_id: googleId,
        avatar_url: picture,
        password_hash: null, // No password for OAuth users
        is_seller: false,
        is_verified: false,
      });
    }

    // Generate JWT
    const jwtToken = generateToken(user);

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        is_seller: user.is_seller,
        is_verified: user.is_verified,
        bio: user.bio,
        instagram_handle: user.instagram_handle,
      },
      isNewUser:
        !user.createdAt || new Date() - new Date(user.createdAt) < 60000, // Created in last minute
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid Google token",
      details: error.message,
    });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash", "google_id"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing token
  // Optionally implement token blacklist here for extra security

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh
// @access  Private
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const newToken = generateToken(user);

    res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
}; // ← Close refreshToken HERE

// TEMPORARY TEST ENDPOINT - Remove in production
exports.testAuth = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Create test user
    let user = await User.findOne({ where: { email } });

    if (!user) {
      let username = email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      user = await User.create({
        email,
        username,
        display_name: name || "Test User",
        google_id: "test_" + Date.now(),
        password_hash: null,
        is_seller: false,
        avatar_url: null,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        is_seller: user.is_seller,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Test Auth Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
