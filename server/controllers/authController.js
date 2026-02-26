// controllers/authController.js
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { blacklistToken } = require("../utils/tokenBlacklist");
const emailUtil = require("../utils/email");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Password validation helper
const validatePassword = (password) => {
  const minLength = 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return {
      valid: false,
      error: `Password must be at least ${minLength} characters long`,
    };
  }

  if (!hasUppercase) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!hasLowercase) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (!hasNumbers) {
    return {
      valid: false,
      error: "Password must contain at least one number",
    };
  }

  if (!hasSpecialChar) {
    return {
      valid: false,
      error: "Password must contain at least one special character (!@#$%^&*)",
    };
  }

  return { valid: true };
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      is_seller: user.is_seller,
      is_admin: user.is_admin,
      is_verified: user.is_verified,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" },
  );
};

// Generate Refresh Token (longer expiration for refresh flow)
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" },
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
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      token: jwtToken,
      refreshToken,
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
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      // Decode token to get expiration time
      const decoded = jwt.decode(token);
      const expiresIn = decoded.exp
        ? Math.floor(decoded.exp - Date.now() / 1000)
        : 900;

      // Add token to blacklist
      if (expiresIn > 0) {
        await blacklistToken(token, expiresIn);
      }
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        error: "Invalid token type",
      });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const newAccessToken = generateToken(user);

    res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid or expired refresh token",
    });
  }
}; // ← Close refreshToken HERE

// @desc    Register new user with email/password
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, username, display_name } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: "Please provide email, password, and username",
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.error,
      });
    }

    // Check if user already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already taken",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate email verification token (24-hour expiry)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user
    const user = await User.create({
      email,
      username: username.toLowerCase(),
      display_name: display_name || username,
      password_hash,
      is_seller: false,
      is_verified: false,
      avatar_url: null,
      google_id: null,
      verification_token: verificationToken,
      verification_token_expires: verificationExpires,
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    emailUtil.sendVerificationEmail(email, verificationToken).catch((err) => {
      console.error("Failed to send verification email:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify your account before logging in.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        is_verified: false,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Block unverified email/password accounts
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email address before logging in.",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
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
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Verify email address via token from email link
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: { verification_token: token },
    });

    if (
      !user ||
      !user.verification_token_expires ||
      new Date() > user.verification_token_expires
    ) {
      return res.status(400).json({
        success: false,
        error: "Verification link is invalid or has expired. Please request a new one.",
      });
    }

    user.is_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();

    const jwtToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      token: jwtToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        is_verified: true,
      },
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // Always return 200 to prevent email enumeration
    const user = await User.findOne({ where: { email } });
    if (user && !user.is_verified) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      user.verification_token = verificationToken;
      user.verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      emailUtil.sendVerificationEmail(email, verificationToken).catch((err) => {
        console.error("Failed to resend verification email:", err.message);
      });
    }

    res.status(200).json({
      success: true,
      message: "If this email is registered and unverified, a new link has been sent.",
    });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // Always return 200 to prevent email enumeration
    const user = await User.findOne({ where: { email } });
    if (user && user.password_hash) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      // Store a hashed version so the raw token in the URL cannot be read from the DB
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.reset_token = hashedToken;
      user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      emailUtil.sendPasswordResetEmail(email, rawToken).catch((err) => {
        console.error("Failed to send reset email:", err.message);
      });
    }

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Reset password using token from email
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: "Token and new password are required",
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, error: passwordValidation.error });
    }

    // Hash incoming token to compare against stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({ where: { reset_token: hashedToken } });

    if (
      !user ||
      !user.reset_token_expires ||
      new Date() > user.reset_token_expires
    ) {
      return res.status(400).json({
        success: false,
        error: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
