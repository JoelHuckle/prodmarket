// controllers/userController.js
const { User, Service } = require("../models");

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ["password_hash", "google_id", "stripe_customer_id"],
      },
      include: [
        {
          model: Service,
          as: "services",
          where: { is_active: true },
          required: false,
          attributes: [
            "id",
            "title",
            "type",
            "price",
            "preview_url",
            "total_sales",
          ],
        },
      ],
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
    console.error("Get User Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Get user by username
// @route   GET /api/users/username/:username
// @access  Public
exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: {
        exclude: ["password_hash", "google_id", "stripe_customer_id"],
      },
      include: [
        {
          model: Service,
          as: "services",
          where: { is_active: true },
          required: false,
          attributes: [
            "id",
            "title",
            "type",
            "price",
            "preview_url",
            "total_sales",
          ],
        },
      ],
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
    console.error("Get User By Username Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { display_name, bio, instagram_handle } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update only allowed fields
    if (display_name !== undefined) user.display_name = display_name;
    if (bio !== undefined) user.bio = bio;
    if (instagram_handle !== undefined)
      user.instagram_handle = instagram_handle;

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password_hash", "google_id"] },
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Enable seller account
// @route   POST /api/users/become-seller
// @access  Private
exports.becomeSeller = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.is_seller) {
      return res.status(400).json({
        success: false,
        error: "User is already a seller",
      });
    }

    // Enable seller mode
    user.is_seller = true;
    await user.save();

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password_hash", "google_id"] },
    });

    res.status(200).json({
      success: true,
      message: "Seller account enabled successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Become Seller Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Update seller information
// @route   PUT /api/users/seller-info
// @access  Private (Seller only)
exports.updateSellerInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.is_seller) {
      return res.status(403).json({
        success: false,
        error: "User is not a seller",
      });
    }

    // Update seller-specific fields
    const { display_name, bio, instagram_handle } = req.body;

    if (display_name !== undefined) user.display_name = display_name;
    if (bio !== undefined) user.bio = bio;
    if (instagram_handle !== undefined)
      user.instagram_handle = instagram_handle;

    await user.save();

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password_hash", "google_id"] },
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Seller Info Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private (authenticated users only; detailed stats only for own profile)
exports.getUserStats = async (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.id);
    const isOwnProfile = req.user.id === requestedUserId;

    const user = await User.findByPk(requestedUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get total services count
    const totalServices = await Service.count({
      where: {
        seller_id: user.id,
        is_active: true,
      },
    });

    // Calculate total sales across all services
    const services = await Service.findAll({
      where: { seller_id: user.id },
      attributes: ["total_sales"],
    });

    const totalSales = services.reduce(
      (sum, service) => sum + (service.total_sales || 0),
      0,
    );

    // Return detailed stats only for own profile, basic public stats otherwise
    const stats = {
      totalServices,
      is_seller: user.is_seller,
      is_verified: user.is_verified,
    };

    // Only include totalSales if user is requesting their own profile
    if (isOwnProfile) {
      stats.totalSales = totalSales;
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get User Stats Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
